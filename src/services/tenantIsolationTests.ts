import {
  setActiveSession,
  SessionContext,
  CrossTenantAccessError,
  FinancialLedgerImmutabilityError,
} from './tenantContext';
import { TenantRepository, resetStoreToSeed, getRawStoreForAuditing } from './tenantRepository';
import { RoleType } from '../types';

export interface TestResultItem {
  id: string;
  domain: string;
  title: string;
  description: string;
  expectedBehavior: string;
  observedBehavior: string;
  status: 'PASSED' | 'FAILED';
  durationMs: number;
}

export interface TestSuiteSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTimeMs: number;
  runAt: string;
  results: TestResultItem[];
}

const TENANT_A_SESSION: SessionContext = {
  userId: 'usr-admin-dhaka',
  tenantId: 'tenant-001', // Jamia Islamia Darul Uloom Dhaka
  role: RoleType.INSTITUTION_ADMIN,
  userName: 'মাওলানা মাহমুদ হাসান (প্রশাসক - ঢাকা)',
  isSuperAdmin: false,
};

const TENANT_B_SESSION: SessionContext = {
  userId: 'usr-admin-ctg',
  tenantId: 'tenant-002', // Al-Hikmah Islamic Cadet Madrasah
  role: RoleType.INSTITUTION_ADMIN,
  userName: 'কমান্ড্যান্ট রফিকুল ইসলাম (প্রশাসক - চট্টগ্রাম)',
  isSuperAdmin: false,
};

const SUPER_ADMIN_SESSION: SessionContext = {
  userId: 'usr-super',
  tenantId: 'system-root',
  role: RoleType.SUPER_ADMIN,
  userName: 'সিস্টেম সুপার অ্যাডমিন',
  isSuperAdmin: true,
};

/**
 * Runs the Multi-Tenancy Security & Isolation Test Suite.
 * Proves that Tenant A cannot access Tenant B's:
 * 1. Students
 * 2. Teachers / Staff
 * 3. Attendance
 * 4. Fees
 * 5. Accounting (Funds, Accounts, Transactions)
 * 6. Results & Exams
 * 7. Notices
 * Plus spoofing, ID targeting, and financial immutability constraints.
 */
export const runMultiTenantIsolationTests = async (): Promise<TestSuiteSummary> => {
  resetStoreToSeed();
  const startTime = performance.now();
  const results: TestResultItem[] = [];

  // Helper to run a test
  const executeTest = async (
    id: string,
    domain: string,
    title: string,
    description: string,
    expectedBehavior: string,
    testFn: () => Promise<{ observed: string; passed: boolean }>
  ) => {
    const t0 = performance.now();
    try {
      const { observed, passed } = await testFn();
      const t1 = performance.now();
      results.push({
        id,
        domain,
        title,
        description,
        expectedBehavior,
        observedBehavior: observed,
        status: passed ? 'PASSED' : 'FAILED',
        durationMs: Math.round(t1 - t0),
      });
    } catch (err: any) {
      const t1 = performance.now();
      results.push({
        id,
        domain,
        title,
        description,
        expectedBehavior,
        observedBehavior: `Unexpected error: ${err.message}`,
        status: 'FAILED',
        durationMs: Math.round(t1 - t0),
      });
    }
  };

  // -------------------------------------------------------------
  // Test 1: Students Isolation
  // -------------------------------------------------------------
  await executeTest(
    'SEC-001',
    'Students',
    'Tenant A cannot query Tenant B Students',
    'Authenticating as Tenant A and querying students list. None of Tenant B cadets should be returned.',
    '0 records with tenantId=tenant-002 returned; only tenant-001 students returned.',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const students = await TenantRepository.findMany('students');
      const hasTenantB = students.some((s) => s.tenantId === 'tenant-002');
      const allTenantA = students.every((s) => s.tenantId === 'tenant-001');

      return {
        passed: !hasTenantB && allTenantA && students.length > 0,
        observed: `Returned ${students.length} students. Tenant B students found: ${hasTenantB ? 'YES (VIOLATION)' : '0'}. All belong to tenant-001: ${allTenantA}.`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 2: Teachers / Staff Isolation
  // -------------------------------------------------------------
  await executeTest(
    'SEC-002',
    'Teachers',
    'Tenant A cannot query Tenant B Staff/Teachers',
    'Authenticating as Tenant A and querying staff list.',
    'Only Tenant A ustadhs/teachers returned. 0 records from Cadet Madrasah (tenant-002).',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const staffList = await TenantRepository.findMany('staff');
      const hasTenantB = staffList.some((s) => s.tenantId === 'tenant-002');
      const allTenantA = staffList.every((s) => s.tenantId === 'tenant-001');

      return {
        passed: !hasTenantB && allTenantA && staffList.length > 0,
        observed: `Returned ${staffList.length} staff members. Tenant B instructors leaked: ${hasTenantB ? 'YES (VIOLATION)' : '0'}.`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 3: Attendance Isolation
  // -------------------------------------------------------------
  await executeTest(
    'SEC-003',
    'Attendance',
    'Tenant A cannot view Tenant B Daily Attendance logs',
    'Authenticating as Tenant A and fetching attendance records.',
    'Only Tenant A daily attendance records returned.',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const attendance = await TenantRepository.findMany('attendances');
      const hasTenantB = attendance.some((a) => a.tenantId === 'tenant-002');
      const allTenantA = attendance.every((a) => a.tenantId === 'tenant-001');

      return {
        passed: !hasTenantB && allTenantA && attendance.length > 0,
        observed: `Returned ${attendance.length} attendance records. Zero leaked from tenant-002: ${!hasTenantB}.`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 4: Fees Isolation
  // -------------------------------------------------------------
  await executeTest(
    'SEC-004',
    'Fees',
    'Tenant A cannot see Tenant B Student Fees & Dues',
    'Authenticating as Tenant A and querying student fee records.',
    'Only fee records for Tenant A returned. Cadet tuition/fees remain confidential.',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const fees = await TenantRepository.findMany('fees');
      const hasTenantB = fees.some((f) => f.tenantId === 'tenant-002');
      const allTenantA = fees.every((f) => f.tenantId === 'tenant-001');

      return {
        passed: !hasTenantB && allTenantA && fees.length > 0,
        observed: `Returned ${fees.length} fee records. Tenant B fee leaks: ${hasTenantB ? 'YES (VIOLATION)' : '0'}.`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 5: Accounting & Transactions Isolation
  // -------------------------------------------------------------
  await executeTest(
    'SEC-005',
    'Accounting',
    'Tenant A cannot view Tenant B Funds, Accounts or Ledgers',
    'Authenticating as Tenant A and querying funds, bank accounts, and vouchers.',
    'Complete isolation across funds, accounts, and transaction vouchers.',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const funds = await TenantRepository.findMany('funds');
      const accounts = await TenantRepository.findMany('accounts');
      const txs = await TenantRepository.findMany('transactions');

      const fundsLeaked = funds.some((f) => f.tenantId === 'tenant-002');
      const accLeaked = accounts.some((a) => a.tenantId === 'tenant-002');
      const txLeaked = txs.some((t) => t.tenantId === 'tenant-002');

      const passed = !fundsLeaked && !accLeaked && !txLeaked;
      return {
        passed,
        observed: `Funds: ${funds.length} (Leaked: ${fundsLeaked ? 'YES' : '0'}). Accounts: ${accounts.length} (Leaked: ${accLeaked ? 'YES' : '0'}). Vouchers: ${txs.length} (Leaked: ${txLeaked ? 'YES' : '0'}).`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 6: Results & Exams Isolation
  // -------------------------------------------------------------
  await executeTest(
    'SEC-006',
    'Results',
    'Tenant A cannot view Tenant B Exams or Student Results',
    'Authenticating as Tenant A and querying academic exam schedules and marks.',
    'Only Tenant A exams and result grade cards returned.',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const exams = await TenantRepository.findMany('exams');
      const resultsList = await TenantRepository.findMany('results');

      const examLeaked = exams.some((e) => e.tenantId === 'tenant-002');
      const resLeaked = resultsList.some((r) => r.tenantId === 'tenant-002');

      const passed = !examLeaked && !resLeaked;
      return {
        passed,
        observed: `Exams: ${exams.length} (Leaked: ${examLeaked ? 'YES' : '0'}). Results: ${resultsList.length} (Leaked: ${resLeaked ? 'YES' : '0'}).`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 7: Notices Isolation
  // -------------------------------------------------------------
  await executeTest(
    'SEC-007',
    'Notices',
    'Tenant A cannot view Tenant B Internal Notices & Announcements',
    'Authenticating as Tenant A and querying notice board bulletin.',
    'Cadet parade and uniform notices from tenant-002 must not appear.',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const notices = await TenantRepository.findMany('notices');
      const hasTenantB = notices.some((n) => n.tenantId === 'tenant-002');

      return {
        passed: !hasTenantB && notices.length > 0,
        observed: `Returned ${notices.length} notices. Tenant B notices leaked: ${hasTenantB ? 'YES (VIOLATION)' : '0'}.`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 8: Explicit Cross-Tenant ID Fetch Blocking
  // -------------------------------------------------------------
  await executeTest(
    'SEC-008',
    'ID Direct Access',
    'Tenant A directly requesting a Tenant B student ID throws CrossTenantAccessError',
    'Tenant A attempts to invoke findById("students", "std-ctg-001") belonging to Tenant B.',
    'Repository immediately rejects with CrossTenantAccessError (403 Forbidden).',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      let blocked = false;
      let errorName = '';
      try {
        await TenantRepository.findById('students', 'std-ctg-001');
      } catch (err: any) {
        if (err instanceof CrossTenantAccessError || err.name === 'CrossTenantAccessError') {
          blocked = true;
          errorName = err.name;
        }
      }

      return {
        passed: blocked,
        observed: blocked
          ? `Operation successfully blocked with exception ${errorName}.`
          : 'FAIL: Cross-tenant fetch was allowed without error!',
      };
    }
  );

  // -------------------------------------------------------------
  // Test 9: Spoofed Tenant ID Payload Overwrite Protection
  // -------------------------------------------------------------
  await executeTest(
    'SEC-009',
    'Tampering Prevention',
    'Tenant A passing spoofed tenantId in POST body is sanitized to Tenant A ID',
    'Authenticated as Tenant A, submitting a new student with explicit payload tenantId="tenant-002".',
    'Repository ignores client tenantId and strictly binds the record to authenticated tenantId="tenant-001".',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      const created = await TenantRepository.create('students', {
        tenantId: 'tenant-002', // Malicious spoofing attempt
        nameBangla: 'টেস্ট অনুপ্রবেশ শিক্ষার্থী',
        nameEnglish: 'Test Spoof Student',
        studentIdCardNo: 'TEST-SPOOF-01',
        admissionNo: 'ADM-TEST',
        admissionDate: '2025-02-18',
        gender: 'MALE',
        dateOfBirth: '2015-01-01',
        classId: 'cls-1',
        sectionId: 'sec-1',
        rollNo: 99,
        isResidential: false,
        status: 'ACTIVE' as any,
        guardianName: 'টেস্ট গার্ডিয়ান',
        guardianMobile: '01700-000000',
        presentAddress: 'মিরপুর, ঢাকা',
      });

      const passed = created.tenantId === 'tenant-001';
      return {
        passed,
        observed: `Created record ID ${created.id}. Assigned tenantId: ${created.tenantId} (Target was tenant-002). Server-side enforcement: ${passed ? 'SECURE' : 'INSECURE'}.`,
      };
    }
  );

  // -------------------------------------------------------------
  // Test 10: Financial Records Ledger Immutability
  // -------------------------------------------------------------
  await executeTest(
    'SEC-010',
    'Audit Immutability',
    'Attempting to delete a Fee or Transaction throws FinancialLedgerImmutabilityError',
    'Calling TenantRepository.delete("fees", "fee-01") on financial ledger.',
    'System enforces audit rule: financial records must not be physically deleted.',
    async () => {
      setActiveSession(TENANT_A_SESSION);
      let blocked = false;
      let errorName = '';
      try {
        await TenantRepository.delete('fees', 'fee-01');
      } catch (err: any) {
        if (err instanceof FinancialLedgerImmutabilityError || err.name === 'FinancialLedgerImmutabilityError') {
          blocked = true;
          errorName = err.name;
        }
      }

      return {
        passed: blocked,
        observed: blocked
          ? `Delete operation blocked by ${errorName}. Financial ledger integrity preserved.`
          : 'FAIL: Financial record was physically deleted!',
      };
    }
  );

  // -------------------------------------------------------------
  // Test 11: Super Admin Authorized Multi-Tenant Visibility
  // -------------------------------------------------------------
  await executeTest(
    'SEC-011',
    'Super Admin',
    'Super Admin can audit any tenant and query across all tenants',
    'Authenticating as Super Admin and requesting global aggregation with explicitTenantId="ALL".',
    'Returns aggregate records across both Jamia Islamia and Al-Hikmah Cadet Madrasah.',
    async () => {
      setActiveSession(SUPER_ADMIN_SESSION);
      const allStudents = await TenantRepository.findMany('students', undefined, 'ALL');
      const hasTenantA = allStudents.some((s) => s.tenantId === 'tenant-001');
      const hasTenantB = allStudents.some((s) => s.tenantId === 'tenant-002');

      const passed = hasTenantA && hasTenantB;
      return {
        passed,
        observed: `Super Admin queried ${allStudents.length} students total. Contains Tenant A: ${hasTenantA}. Contains Tenant B: ${hasTenantB}.`,
      };
    }
  );

  // Reset back to normal session
  setActiveSession(TENANT_A_SESSION);

  const endTime = performance.now();
  const passedCount = results.filter((r) => r.status === 'PASSED').length;

  return {
    totalTests: results.length,
    passedTests: passedCount,
    failedTests: results.length - passedCount,
    executionTimeMs: Math.round(endTime - startTime),
    runAt: new Date().toISOString(),
    results,
  };
};
