import { INITIAL_DB, MadrasahDatabase } from '../db/inMemoryDb';
import {
  assertTenantAccess,
  getActiveSession,
  isSuperAdminSession,
  logSecurityEvent,
  CrossTenantAccessError,
  FinancialLedgerImmutabilityError,
} from './tenantContext';

// Financial collections protected by immutability constraints
const FINANCIAL_COLLECTIONS: (keyof MadrasahDatabase)[] = [
  'fees',
  'transactions',
  'feePayments',
  'studentLedgers',
  'dailyClosings',
  'donations',
  'fundTransfers',
];

// Mutable in-memory store initialized with seed database
let dbStore: MadrasahDatabase = JSON.parse(JSON.stringify(INITIAL_DB));

export const resetStoreToSeed = () => {
  dbStore = JSON.parse(JSON.stringify(INITIAL_DB));
};

export const getRawStoreForAuditing = (): MadrasahDatabase => {
  return dbStore;
};

/**
 * Tenant-scoped Repository: Enforces row-level multi-tenant isolation
 * and immutable ledger protection for financial audit compliance.
 */
export class TenantRepository {
  /**
   * Finds records belonging strictly to the authorized tenant.
   * If caller is Super Admin and explicitly passes targetTenantId, returns that tenant's records.
   * Super Admin passing 'ALL' gets cross-tenant data.
   */
  public static async findMany<K extends keyof MadrasahDatabase>(
    collection: K,
    predicate?: (item: MadrasahDatabase[K][number]) => boolean,
    explicitTenantId?: string
  ): Promise<MadrasahDatabase[K]> {
    const validTenantId = assertTenantAccess(explicitTenantId, String(collection));
    const items = dbStore[collection] as Array<{ tenantId: string } & any>;

    let scoped: any[];
    if (isSuperAdminSession() && explicitTenantId === 'ALL') {
      scoped = items;
    } else {
      scoped = items.filter((item) => item.tenantId === validTenantId);
    }

    if (predicate) {
      scoped = scoped.filter(predicate);
    }

    logSecurityEvent('QUERY_LIST', String(collection), validTenantId, 'ALLOWED');
    return scoped as unknown as MadrasahDatabase[K];
  }

  /**
   * Finds a single record by ID, verifying tenant ownership.
   * Throws CrossTenantAccessError if the record belongs to another tenant.
   */
  public static async findById<K extends keyof MadrasahDatabase>(
    collection: K,
    id: string,
    explicitTenantId?: string
  ): Promise<MadrasahDatabase[K][number] | null> {
    const validTenantId = assertTenantAccess(explicitTenantId, String(collection));
    const items = dbStore[collection] as Array<{ id: string; tenantId: string } & any>;

    const item = items.find((i) => i.id === id);
    if (!item) {
      return null;
    }

    // Cross-tenant verification
    if (!isSuperAdminSession() && item.tenantId !== validTenantId) {
      logSecurityEvent(
        'QUERY_BY_ID_BLOCKED',
        `${String(collection)}:${id}`,
        item.tenantId,
        'BLOCKED',
        `Attempted cross-tenant fetch of ID ${id} belonging to ${item.tenantId}`
      );
      throw new CrossTenantAccessError(
        `Unauthorized: Record ${id} belongs to another institution (${item.tenantId}). Cross-tenant access denied.`
      );
    }

    logSecurityEvent('QUERY_BY_ID', `${String(collection)}:${id}`, validTenantId, 'ALLOWED');
    return item;
  }

  /**
   * Creates a new record, strictly binding it to the authenticated tenant.
   * Never trusts tenantId from frontend payload.
   */
  public static async create<K extends keyof MadrasahDatabase>(
    collection: K,
    data: Omit<MadrasahDatabase[K][number], 'id'> & { tenantId?: string },
    explicitTenantId?: string
  ): Promise<MadrasahDatabase[K][number]> {
    const session = getActiveSession();
    // Force the tenantId from session authorization
    const boundTenantId = isSuperAdminSession() && explicitTenantId ? explicitTenantId : session.tenantId;

    const newId = `${String(collection).slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord = {
      ...data,
      id: newId,
      tenantId: boundTenantId, // Overrides any spoofed client input!
    } as MadrasahDatabase[K][number];

    (dbStore[collection] as any[]).unshift(newRecord);
    logSecurityEvent('INSERT', String(collection), boundTenantId, 'ALLOWED', `Created record with ID ${newId}`);

    return newRecord;
  }

  /**
   * Updates a record with tenant ownership assertion.
   */
  public static async update<K extends keyof MadrasahDatabase>(
    collection: K,
    id: string,
    updates: Partial<MadrasahDatabase[K][number]>,
    explicitTenantId?: string
  ): Promise<MadrasahDatabase[K][number]> {
    const validTenantId = assertTenantAccess(explicitTenantId, String(collection));
    const items = dbStore[collection] as Array<{ id: string; tenantId: string } & any>;

    const index = items.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${String(collection)}`);
    }

    const existing = items[index];
    if (!isSuperAdminSession() && existing.tenantId !== validTenantId) {
      logSecurityEvent(
        'UPDATE_BLOCKED',
        `${String(collection)}:${id}`,
        existing.tenantId,
        'BLOCKED',
        'Cross-tenant update rejected'
      );
      throw new CrossTenantAccessError(
        `Cross-tenant update blocked: Cannot modify record belonging to ${existing.tenantId}`
      );
    }

    // Protect tenantId from being mutated
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      tenantId: existing.tenantId,
    };

    // Phase 11 & 12: Enforce transaction & receipt immutability: historical financial fields cannot be altered post-issuance
    if (collection === 'transactions') {
      const immutableFields = ['amount', 'voucherNo', 'type', 'transactionDate', 'fundName', 'accountName', 'fundId', 'accountId'];
      const attemptedAltered = immutableFields.filter(
        (key) => key in updates && (updates as any)[key] !== undefined && (updates as any)[key] !== (existing as any)[key]
      );
      if (attemptedAltered.length > 0) {
        logSecurityEvent(
          'UPDATE_BLOCKED',
          `transactions:${id}`,
          validTenantId,
          'BLOCKED',
          `Attempted alteration of immutable financial transaction fields: ${attemptedAltered.join(', ')}`
        );
        throw new FinancialLedgerImmutabilityError(
          `Security Exception: Financial transaction records cannot be directly altered (${attemptedAltered.join(', ')} are immutable). Corrections must use official audited reversal/void workflows.`
        );
      }
    }

    if (collection === 'feePayments') {
      const immutableFields = ['amountPaid', 'receiptNo', 'studentId', 'feeId', 'className', 'feeType', 'netPayable', 'originalAmount'];
      const attemptedAltered = immutableFields.filter(
        (key) => key in updates && (updates as any)[key] !== undefined && (updates as any)[key] !== (existing as any)[key]
      );
      if (attemptedAltered.length > 0) {
        logSecurityEvent(
          'UPDATE_BLOCKED',
          `feePayments:${id}`,
          validTenantId,
          'BLOCKED',
          `Attempted alteration of immutable receipt fields: ${attemptedAltered.join(', ')}`
        );
        throw new FinancialLedgerImmutabilityError(
          `Security Exception: Historical receipt records cannot be altered (${attemptedAltered.join(', ')} are immutable). Corrections must use the official void/reversal workflow.`
        );
      }
    }

    items[index] = updated;
    logSecurityEvent('UPDATE', `${String(collection)}:${id}`, validTenantId, 'ALLOWED');
    return updated;
  }

  /**
   * Deletes a record with tenant boundary enforcement and financial immutability check.
   */
  public static async delete<K extends keyof MadrasahDatabase>(
    collection: K,
    id: string,
    explicitTenantId?: string
  ): Promise<boolean> {
    const validTenantId = assertTenantAccess(explicitTenantId, String(collection));

    // Audit requirement: Financial records must not be physically deleted
    if (FINANCIAL_COLLECTIONS.includes(collection)) {
      logSecurityEvent(
        'DELETE_REJECTED',
        `${String(collection)}:${id}`,
        validTenantId,
        'BLOCKED',
        'Financial immutability policy enforced'
      );
      throw new FinancialLedgerImmutabilityError(
        `Security Exception: Records in financial ledger '${String(collection)}' are immutable and cannot be physically deleted.`
      );
    }

    const items = dbStore[collection] as Array<{ id: string; tenantId: string } & any>;
    const existing = items.find((i) => i.id === id);
    if (!existing) {
      return false;
    }

    if (!isSuperAdminSession() && existing.tenantId !== validTenantId) {
      logSecurityEvent(
        'DELETE_BLOCKED',
        `${String(collection)}:${id}`,
        existing.tenantId,
        'BLOCKED',
        'Cross-tenant deletion forbidden'
      );
      throw new CrossTenantAccessError(
        `Cross-tenant deletion blocked: Cannot delete record belonging to ${existing.tenantId}`
      );
    }

    dbStore[collection] = items.filter((i) => i.id !== id) as any;
    logSecurityEvent('DELETE', `${String(collection)}:${id}`, validTenantId, 'ALLOWED');
    return true;
  }

  /**
   * Executes a sequence of database operations atomically in a transaction.
   * If any error is thrown within the callback, all mutations are rolled back cleanly
   * to guarantee zero data inconsistency.
   */
  public static async runTransaction<T>(
    callback: (tx: typeof TenantRepository) => Promise<T>,
    explicitTenantId?: string
  ): Promise<T> {
    const validTenantId = assertTenantAccess(explicitTenantId, 'transaction');
    const snapshot = JSON.parse(JSON.stringify(dbStore));
    try {
      logSecurityEvent('TRANSACTION_BEGIN', 'database', validTenantId, 'ALLOWED', 'Atomic transaction started');
      const result = await callback(TenantRepository);
      logSecurityEvent('TRANSACTION_COMMIT', 'database', validTenantId, 'ALLOWED', 'Atomic transaction committed successfully');
      return result;
    } catch (error: any) {
      dbStore = snapshot; // Full atomic rollback
      logSecurityEvent(
        'TRANSACTION_ROLLBACK',
        'database',
        validTenantId,
        'BLOCKED',
        `Transaction rolled back: ${error?.message || 'Unknown error'}`
      );
      throw error;
    }
  }
}

