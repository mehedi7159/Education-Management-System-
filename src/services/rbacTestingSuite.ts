import { RoleType, PermissionCode } from '../types';
import { AuthService, ROLE_PERMISSIONS, ROUTE_PERMISSION_MAP, hashPassword, generateSalt } from './authService';

export interface RouteRoleTestResult {
  role: RoleType;
  route: string;
  routeNameBangla: string;
  requiredPermission: PermissionCode | 'PUBLIC';
  isAllowed: boolean;
  expectedAllowed: boolean;
  status: 'PASSED' | 'FAILED';
  evaluationNote: string;
}

export interface SecurityFeatureTestResult {
  featureId: string;
  featureName: string;
  description: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

export interface RbacTestSuiteSummary {
  totalRoleRouteTests: number;
  passedRoleRouteTests: number;
  passedTests: number;
  totalSecurityFeatureTests: number;
  passedSecurityFeatureTests: number;
  executionTimeMs: number;
  runAt: string;
  roleRouteResults: RouteRoleTestResult[];
  securityFeatureResults: SecurityFeatureTestResult[];
}

const ROUTE_DEFINITIONS: Array<{ route: string; nameBn: string; permission: PermissionCode | 'PUBLIC' }> = [
  { route: 'dashboard', nameBn: 'ড্যাশবোর্ড', permission: 'PUBLIC' },
  { route: 'students', nameBn: 'শিক্ষার্থী তালিকা', permission: 'student.view' },
  { route: 'admission', nameBn: 'নতুন ভর্তি উইজার্ড', permission: 'student.create' },
  { route: 'attendance', nameBn: 'দৈনিক হাজিরা', permission: 'attendance.view' },
  { route: 'fees', nameBn: 'ফি আদায় ও রশিদ', permission: 'fee.view' },
  { route: 'accounting', nameBn: 'হিসাব ও তহবিল', permission: 'finance.view' },
  { route: 'staff', nameBn: 'ওস্তাদ ও স্টাফ প্রশাসন', permission: 'teacher.manage' },
  { route: 'exams', nameBn: 'পরীক্ষা ও ফলাফল', permission: 'result.enter' },
  { route: 'reports', nameBn: 'রিপোর্ট হাব', permission: 'report.view' },
  { route: 'settings', nameBn: 'প্রতিষ্ঠান সেটিংস', permission: 'settings.manage' },
];

/**
 * Executes the complete RBAC & Authentication Test Suite.
 * Tests every of the 8 roles against protected routes.
 */
export const runRbacTestSuite = async (): Promise<RbacTestSuiteSummary> => {
  const startTime = performance.now();
  const roleRouteResults: RouteRoleTestResult[] = [];
  const securityFeatureResults: SecurityFeatureTestResult[] = [];

  const roles = Object.values(RoleType);

  // -------------------------------------------------------------
  // Part 1: Test Every Role against Protected Routes
  // -------------------------------------------------------------
  for (const role of roles) {
    for (const def of ROUTE_DEFINITIONS) {
      const evaluation = AuthService.isRouteAllowed(def.route, role);

      // Expected calculation based on canonical specification
      let expectedAllowed = false;
      if (role === RoleType.SUPER_ADMIN) {
        expectedAllowed = true;
      } else if (def.permission === 'PUBLIC') {
        expectedAllowed = true;
      } else {
        const perms = ROLE_PERMISSIONS[role] || [];
        expectedAllowed = perms.includes(def.permission);
      }

      const passed = evaluation.allowed === expectedAllowed;

      roleRouteResults.push({
        role,
        route: def.route,
        routeNameBangla: def.nameBn,
        requiredPermission: def.permission,
        isAllowed: evaluation.allowed,
        expectedAllowed,
        status: passed ? 'PASSED' : 'FAILED',
        evaluationNote: evaluation.allowed
          ? `অনুমোদিত (Role '${role}' holds required access)`
          : `প্রত্যাখ্যান (403 Forbidden: Requires '${def.permission}')`,
      });
    }
  }

  // -------------------------------------------------------------
  // Part 2: Test Password Hashing Security & Salt Invariance
  // -------------------------------------------------------------
  const t0 = performance.now();
  const salt1 = generateSalt();
  const salt2 = generateSalt();
  const hashA = await hashPassword('SecretPass123', salt1);
  const hashB = await hashPassword('SecretPass123', salt2);
  const hashA_repeat = await hashPassword('SecretPass123', salt1);

  const hashPassed = hashA !== hashB && hashA === hashA_repeat && hashA.length === 64;
  securityFeatureResults.push({
    featureId: 'AUTH-SEC-01',
    featureName: 'Cryptographic Password Hashing & Unique Salting',
    description: 'Web Crypto API SHA-256 with 16-byte random salt creates 64-char hex digests and prevents rainbow table attacks.',
    passed: hashPassed,
    details: `Generated distinct hash for different salts (${hashA.slice(0, 12)}... vs ${hashB.slice(0, 12)}...). Exact match with same salt: ${hashA === hashA_repeat}.`,
    durationMs: Math.round(performance.now() - t0),
  });

  // -------------------------------------------------------------
  // Part 3: Test Login Rate Limiting (5 Attempts -> Lockout)
  // -------------------------------------------------------------
  const t1 = performance.now();
  const testIdentifier = `test_ratelimit_${Date.now()}`;
  for (let i = 0; i < 4; i++) {
    AuthService.recordFailedAttempt(testIdentifier);
  }
  const stateBeforeLock = AuthService.getRateLimitState(testIdentifier);
  const fifthAttempt = AuthService.recordFailedAttempt(testIdentifier);

  const rateLimitPassed = !stateBeforeLock.isLocked && fifthAttempt.isLocked && fifthAttempt.lockoutRemainingSeconds > 0;
  securityFeatureResults.push({
    featureId: 'AUTH-SEC-02',
    featureName: 'Login Brute-Force Rate Limiting (5 Attempts Lockout)',
    description: 'Enforces maximum 5 failed attempts within 5 minutes, initiating a 60-second exponential lockout.',
    passed: rateLimitPassed,
    details: `4 attempts: isLocked=${stateBeforeLock.isLocked} (attempts=${stateBeforeLock.attemptsCount}). 5th attempt: isLocked=${fifthAttempt.isLocked} (remainingSeconds=${fifthAttempt.lockoutRemainingSeconds}s).`,
    durationMs: Math.round(performance.now() - t1),
  });
  AuthService.clearRateLimit(testIdentifier);

  // -------------------------------------------------------------
  // Part 4: Test Password Reset Architecture & OTP Verification
  // -------------------------------------------------------------
  const t2 = performance.now();
  const dummyUserResolver = (id: string) => {
    if (id === 'test_reset_user') {
      return {
        id: 'usr-admin',
        username: 'admin_dhaka',
        fullName: 'প্রশাসক টেস্ট',
        email: 'test@admin.edu.bd',
        mobile: '01711111111',
        role: RoleType.INSTITUTION_ADMIN,
        isActive: true,
      };
    }
    return null;
  };

  const resetReq = await AuthService.requestPasswordReset(
    { identifier: 'test_reset_user', method: 'EMAIL' },
    dummyUserResolver
  );

  const otpCode = resetReq.previewToken || '';
  const badSubmit = await AuthService.submitPasswordReset(
    { identifier: 'test_reset_user', resetToken: '000000', newPassword: 'NewPassword@2025' },
    dummyUserResolver
  );
  const goodSubmit = await AuthService.submitPasswordReset(
    { identifier: 'test_reset_user', resetToken: otpCode, newPassword: 'NewPassword@2025' },
    dummyUserResolver
  );

  const resetPassed = resetReq.success && !badSubmit.success && goodSubmit.success;
  securityFeatureResults.push({
    featureId: 'AUTH-SEC-03',
    featureName: 'Password Reset OTP Cycle & Token Verification',
    description: 'Generates single-use 6-digit cryptographic token, rejects incorrect OTP, and updates credentials.',
    passed: resetPassed,
    details: `OTP Issued: ${otpCode}. Invalid OTP rejected: ${!badSubmit.success}. Valid OTP accepted: ${goodSubmit.success}.`,
    durationMs: Math.round(performance.now() - t2),
  });

  // -------------------------------------------------------------
  // Part 5: Mandatory Backend Authorization Assertion Test
  // -------------------------------------------------------------
  const t3 = performance.now();
  let teacherBlocked = false;
  let adminAllowed = false;

  try {
    AuthService.assertAuthorized(RoleType.TEACHER, 'fee.collect', 'Fee Collection Voucher');
  } catch (err: any) {
    if (err.name === 'ForbiddenError' && err.status === 403) {
      teacherBlocked = true;
    }
  }

  try {
    AuthService.assertAuthorized(RoleType.INSTITUTION_ADMIN, 'fee.collect', 'Fee Collection Voucher');
    adminAllowed = true;
  } catch {
    adminAllowed = false;
  }

  const backendAuthPassed = teacherBlocked && adminAllowed;
  securityFeatureResults.push({
    featureId: 'AUTH-SEC-04',
    featureName: 'Mandatory Backend Authorization Assertion (ForbiddenError 403)',
    description: 'Backend service methods enforce assertAuthorized() to prevent unauthorized operations even if frontend guards are bypassed.',
    passed: backendAuthPassed,
    details: `Teacher fee.collect blocked with 403 Forbidden: ${teacherBlocked}. Admin fee.collect authorized: ${adminAllowed}.`,
    durationMs: Math.round(performance.now() - t3),
  });

  const endTime = performance.now();
  const passedRoleRoute = roleRouteResults.filter((r) => r.status === 'PASSED').length;
  const passedFeatures = securityFeatureResults.filter((f) => f.passed).length;

  return {
    totalRoleRouteTests: roleRouteResults.length,
    passedRoleRouteTests: passedRoleRoute,
    passedTests: passedRoleRoute,
    totalSecurityFeatureTests: securityFeatureResults.length,
    passedSecurityFeatureTests: passedFeatures,
    executionTimeMs: Math.round(endTime - startTime),
    runAt: new Date().toISOString(),
    roleRouteResults,
    securityFeatureResults,
  };
};
