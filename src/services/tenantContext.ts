import { RoleType, User } from '../types';

export class CrossTenantAccessError extends Error {
  public readonly code = 'CROSS_TENANT_ACCESS_DENIED';
  public readonly status = 403;
  constructor(message: string = 'Security Exception: Cross-tenant data access is strictly forbidden.') {
    super(message);
    this.name = 'CrossTenantAccessError';
  }
}

export class FinancialLedgerImmutabilityError extends Error {
  public readonly code = 'FINANCIAL_LEDGER_IMMUTABLE';
  public readonly status = 400;
  constructor(message: string = 'Audit Exception: Financial ledger records are strictly immutable and cannot be deleted.') {
    super(message);
    this.name = 'FinancialLedgerImmutabilityError';
  }
}

export class TenantIsolationViolationError extends Error {
  public readonly code = 'TENANT_ISOLATION_VIOLATION';
  public readonly status = 400;
  constructor(message: string = 'Security Violation: Tenant mismatch detected.') {
    super(message);
    this.name = 'TenantIsolationViolationError';
  }
}

export interface SecurityAuditRecord {
  timestamp: string;
  userId: string;
  userRole: RoleType;
  authenticatedTenantId: string;
  targetTenantId?: string;
  action: string;
  resource: string;
  outcome: 'ALLOWED' | 'BLOCKED';
  reason?: string;
}

export interface SessionContext {
  userId: string;
  tenantId: string;
  role: RoleType;
  userName: string;
  email?: string;
  isSuperAdmin: boolean;
  user?: {
    id: string;
    fullName: string;
    role: RoleType;
    email?: string;
    mobile?: string;
    isActive?: boolean;
  };
}

// Global active session for API & Service layer
let currentSession: SessionContext = {
  userId: 'usr-admin',
  tenantId: 'tenant-001',
  role: RoleType.INSTITUTION_ADMIN,
  userName: 'মাওলানা মাহমুদ হাসান (প্রশাসক)',
  email: 'admin@darululoomdhaka.edu.bd',
  isSuperAdmin: false,
  user: {
    id: 'usr-admin',
    fullName: 'মাওলানা মাহমুদ হাসান (প্রশাসক)',
    role: RoleType.INSTITUTION_ADMIN,
    email: 'admin@darululoomdhaka.edu.bd',
    isActive: true,
  },
};

// In-memory security audit log
const auditLogs: SecurityAuditRecord[] = [];

/**
 * Updates the global active session (called on login/tenant switch).
 */
export const setActiveSession = (session: SessionContext): void => {
  currentSession = { ...session };
};

/**
 * Retrieves the currently authenticated session.
 * Never trusts frontend tenantId inputs without session verification.
 */
export const getActiveSession = (): SessionContext => {
  return { ...currentSession };
};

/**
 * Checks if the active session has Super Admin privileges.
 */
export const isSuperAdminSession = (): boolean => {
  return currentSession.isSuperAdmin || currentSession.role === RoleType.SUPER_ADMIN;
};

/**
 * Resolves and strictly enforces tenant authorization.
 * If a frontend requests a tenantId:
 *  - If user is NOT Super Admin and requests a different tenantId, immediately throws CrossTenantAccessError.
 *  - Otherwise, returns the validated tenantId.
 */
export const assertTenantAccess = (requestedTenantId?: string, resource: string = 'general'): string => {
  const session = getActiveSession();

  // If no tenantId provided, always use authenticated session's tenantId
  if (!requestedTenantId) {
    return session.tenantId;
  }

  // Super Admin can access any institution
  if (isSuperAdminSession()) {
    return requestedTenantId;
  }

  // Strict tenant boundary enforcement
  if (requestedTenantId !== session.tenantId) {
    const violation: SecurityAuditRecord = {
      timestamp: new Date().toISOString(),
      userId: session.userId,
      userRole: session.role,
      authenticatedTenantId: session.tenantId,
      targetTenantId: requestedTenantId,
      action: 'ACCESS_REQUEST',
      resource,
      outcome: 'BLOCKED',
      reason: `User ${session.userName} attempted unauthorized cross-tenant query for ${requestedTenantId}`,
    };
    auditLogs.unshift(violation);

    throw new CrossTenantAccessError(
      `Cross-tenant access violation: Authenticated tenant (${session.tenantId}) cannot access resources belonging to (${requestedTenantId}).`
    );
  }

  return session.tenantId;
};

/**
 * Logs a security audit event
 */
export const logSecurityEvent = (
  action: string,
  resource: string,
  targetTenantId?: string,
  outcome: 'ALLOWED' | 'BLOCKED' = 'ALLOWED',
  reason?: string
): void => {
  const session = getActiveSession();
  auditLogs.unshift({
    timestamp: new Date().toISOString(),
    userId: session.userId,
    userRole: session.role,
    authenticatedTenantId: session.tenantId,
    targetTenantId,
    action,
    resource,
    outcome,
    reason,
  });
  if (auditLogs.length > 200) {
    auditLogs.pop();
  }
};

/**
 * Returns security audit logs for inspection
 */
export const getSecurityAuditLogs = (): SecurityAuditRecord[] => {
  return [...auditLogs];
};
