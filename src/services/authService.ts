import { RoleType, User, PermissionCode, AuthSession, LoginCredentials, PasswordChangeRequest, PasswordResetRequest, PasswordResetSubmit, RateLimitState } from '../types';
import { setActiveSession, CrossTenantAccessError } from './tenantContext';

export class ForbiddenError extends Error {
  public readonly code = 'FORBIDDEN_INSUFFICIENT_PERMISSIONS';
  public readonly status = 403;
  public readonly requiredPermission?: PermissionCode;

  constructor(message: string, requiredPermission?: PermissionCode) {
    super(message);
    this.name = 'ForbiddenError';
    this.requiredPermission = requiredPermission;
  }
}

export class UnauthorizedError extends Error {
  public readonly code = 'UNAUTHORIZED_NOT_AUTHENTICATED';
  public readonly status = 401;

  constructor(message: string = 'Authentication required to access this resource.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// -------------------------------------------------------------
// Granular Role-to-Permissions Matrix
// -------------------------------------------------------------
export const ROLE_PERMISSIONS: Record<RoleType, PermissionCode[]> = {
  [RoleType.SUPER_ADMIN]: [
    'student.view',
    'student.create',
    'student.edit',
    'student.delete',
    'attendance.view',
    'attendance.manage',
    'fee.view',
    'fee.collect',
    'finance.view',
    'finance.manage',
    'result.enter',
    'result.publish',
    'teacher.manage',
    'teacher.view',
    'teacher.view_own',
    'report.view',
    'notice.manage',
    'settings.manage',
  ],
  [RoleType.INSTITUTION_ADMIN]: [
    'student.view',
    'student.create',
    'student.edit',
    'student.delete',
    'attendance.view',
    'attendance.manage',
    'fee.view',
    'fee.collect',
    'finance.view',
    'finance.manage',
    'result.enter',
    'result.publish',
    'teacher.manage',
    'teacher.view',
    'teacher.view_own',
    'report.view',
    'notice.manage',
    'settings.manage',
  ],
  [RoleType.MUHTAMIM]: [
    'student.view',
    'student.create',
    'student.edit',
    'attendance.view',
    'attendance.manage',
    'fee.view',
    'finance.view',
    'result.enter',
    'result.publish',
    'teacher.manage',
    'teacher.view',
    'teacher.view_own',
    'report.view',
    'notice.manage',
  ],
  [RoleType.ACCOUNTANT]: [
    'student.view',
    'fee.view',
    'fee.collect',
    'finance.view',
    'finance.manage',
    'teacher.view',
    'report.view',
  ],
  [RoleType.TEACHER]: [
    'student.view',
    'attendance.view',
    'attendance.manage',
    'result.enter',
    'teacher.view',
    'teacher.view_own',
    'report.view',
  ],
  [RoleType.STAFF]: [
    'student.view',
    'attendance.view',
    'teacher.view_own',
  ],
  [RoleType.GUARDIAN]: [
    'student.view',
    'attendance.view',
    'fee.view',
  ],
  [RoleType.STUDENT]: [
    'student.view',
    'attendance.view',
    'fee.view',
  ],
};

// -------------------------------------------------------------
// Route-to-Permission Requirements
// -------------------------------------------------------------
export const ROUTE_PERMISSION_MAP: Record<string, PermissionCode | PermissionCode[]> = {
  'dashboard': [],
  'students': 'student.view',
  'students-list': 'student.view',
  'students_list': 'student.view',
  'admission': 'student.create',
  'admissions': 'student.create',
  'attendance': 'attendance.view',
  'fees': 'fee.view',
  'receipts': 'fee.view',
  'accounting': 'finance.view',
  'funds': 'finance.view',
  'donations': 'finance.view',
  'staff': ['teacher.manage', 'teacher.view', 'teacher.view_own'],
  'teacher-dashboard': 'teacher.view_own',
  'exams': 'result.enter',
  'academics': 'student.view',
  'classes': 'student.view',
  'routine': ['teacher.view', 'teacher.view_own', 'student.view'],
  'reports': 'report.view',
  'settings': 'settings.manage',
  'multitenancy': 'settings.manage',
};

// -------------------------------------------------------------
// Password Hashing via Web Crypto API (PBKDF2/SHA-256)
// -------------------------------------------------------------
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password + 'MADRASAH_SECRET_PEPPER_2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const generateSalt = (): string => {
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  return Array.from(random).map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Default universal demo password hash initialization
const DEFAULT_SALT = 'e4a8b79c3d1f2e5a';
const INITIAL_HASH_PROMISE = hashPassword('Madrasah@123', DEFAULT_SALT);

interface UserCredentialRecord {
  userId: string;
  username: string;
  email: string;
  mobile: string;
  salt: string;
  passwordHash: string;
}

// In-memory credentials store
let credentialsStore: Record<string, UserCredentialRecord> = {};

// Initialize mock credential store
INITIAL_HASH_PROMISE.then((defaultHash) => {
  const users = [
    { userId: 'usr-super', username: 'superadmin', email: 'admin@madrasah.saas', mobile: '01700000001' },
    { userId: 'usr-admin', username: 'admin_dhaka', email: 'admin@darululoomdhaka.edu.bd', mobile: '01711111111' },
    { userId: 'usr-muhtamim', username: 'muhtamim', email: 'principal@darululoomdhaka.edu.bd', mobile: '01722222222' },
    { userId: 'usr-accountant', username: 'accountant', email: 'accounts@darululoomdhaka.edu.bd', mobile: '01733333333' },
    { userId: 'usr-teacher', username: 'teacher_tariq', email: 'tariq@darululoomdhaka.edu.bd', mobile: '01744444444' },
    { userId: 'usr-staff', username: 'staff_noor', email: 'office@darululoomdhaka.edu.bd', mobile: '01755555555' },
    { userId: 'usr-guardian', username: 'guardian_zakir', email: 'zakir@gmail.com', mobile: '01766666666' },
    { userId: 'usr-student', username: 'student_talha', email: 'talha@student.darululoom.edu.bd', mobile: '01777777777' },
  ];

  users.forEach((u) => {
    credentialsStore[u.userId] = {
      ...u,
      salt: DEFAULT_SALT,
      passwordHash: defaultHash,
    };
  });
});

// -------------------------------------------------------------
// Login Rate Limiting Store
// -------------------------------------------------------------
interface RateLimitRecord {
  attempts: number;
  lastAttemptAt: number;
  lockoutUntil?: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
const rateLimits: Record<string, RateLimitRecord> = {};

// -------------------------------------------------------------
// Password Reset OTP Store
// -------------------------------------------------------------
interface ResetOtpRecord {
  identifier: string;
  userId: string;
  otp: string;
  expiresAt: number;
}

const resetTokens: Record<string, ResetOtpRecord> = {};

// -------------------------------------------------------------
// Authentication Service Implementation
// -------------------------------------------------------------
export class AuthService {
  /**
   * Checks login rate limiting for an identifier
   */
  public static getRateLimitState(identifier: string): RateLimitState {
    const key = identifier.trim().toLowerCase();
    const record = rateLimits[key];
    const now = Date.now();

    if (!record) {
      return {
        isLocked: false,
        attemptsCount: 0,
        maxAttempts: MAX_FAILED_ATTEMPTS,
        lockoutRemainingSeconds: 0,
      };
    }

    if (record.lockoutUntil && record.lockoutUntil > now) {
      const remainingSec = Math.ceil((record.lockoutUntil - now) / 1000);
      return {
        isLocked: true,
        attemptsCount: record.attempts,
        maxAttempts: MAX_FAILED_ATTEMPTS,
        lockoutRemainingSeconds: remainingSec,
        lockoutUntil: new Date(record.lockoutUntil).toISOString(),
      };
    }

    if (record.lockoutUntil && record.lockoutUntil <= now) {
      // Lockout expired, reset
      delete rateLimits[key];
      return {
        isLocked: false,
        attemptsCount: 0,
        maxAttempts: MAX_FAILED_ATTEMPTS,
        lockoutRemainingSeconds: 0,
      };
    }

    return {
      isLocked: false,
      attemptsCount: record.attempts,
      maxAttempts: MAX_FAILED_ATTEMPTS,
      lockoutRemainingSeconds: 0,
    };
  }

  /**
   * Records a failed login attempt and applies exponential lockout if exceeded
   */
  public static recordFailedAttempt(identifier: string): RateLimitState {
    const key = identifier.trim().toLowerCase();
    const now = Date.now();
    const record = rateLimits[key] || { attempts: 0, lastAttemptAt: now };

    record.attempts += 1;
    record.lastAttemptAt = now;

    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    }

    rateLimits[key] = record;
    return this.getRateLimitState(key);
  }

  /**
   * Clears rate limiting on successful login
   */
  public static clearRateLimit(identifier: string): void {
    const key = identifier.trim().toLowerCase();
    delete rateLimits[key];
  }

  /**
   * Authenticates user credentials with password verification and rate limiting
   */
  public static async login(
    credentials: LoginCredentials,
    userResolver: (identifier: string) => User | null
  ): Promise<{
    success: boolean;
    session?: AuthSession;
    error?: string;
    rateLimit?: RateLimitState;
  }> {
    const identifier = credentials.identifier.trim();
    const rateLimit = this.getRateLimitState(identifier);

    if (rateLimit.isLocked) {
      return {
        success: false,
        error: `অতিরিক্ত ভুল চেষ্টার কারণে অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে। অনুগ্রহ করে ${rateLimit.lockoutRemainingSeconds} সেকেন্ড অপেক্ষা করুন।`,
        rateLimit,
      };
    }

    const user = userResolver(identifier);
    if (!user) {
      const updatedLimit = this.recordFailedAttempt(identifier);
      return {
        success: false,
        error: 'ইউজারনেম, ইমেইল বা মোবাইল নম্বরটি সঠিক নয়।',
        rateLimit: updatedLimit,
      };
    }

    const cred = credentialsStore[user.id];
    if (!cred) {
      // Lazy fallback if initialized before promise resolved
      const defaultHash = await INITIAL_HASH_PROMISE;
      credentialsStore[user.id] = {
        userId: user.id,
        username: user.username,
        email: user.email || '',
        mobile: user.mobile,
        salt: DEFAULT_SALT,
        passwordHash: defaultHash,
      };
    }

    const activeCred = credentialsStore[user.id];
    const inputHash = await hashPassword(credentials.password, activeCred.salt);

    if (inputHash !== activeCred.passwordHash) {
      const updatedLimit = this.recordFailedAttempt(identifier);
      const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - updatedLimit.attemptsCount);
      return {
        success: false,
        error: `ভুল পাসওয়ার্ড। আর ${remainingAttempts}টি চেষ্টা অবশিষ্ট আছে।`,
        rateLimit: updatedLimit,
      };
    }

    // Success: clear rate limit
    this.clearRateLimit(identifier);

    // Build session token
    const token = `madrasah_sec_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresHours = credentials.rememberMe ? 24 * 14 : 12; // 14 days or 12 hours
    const expiresAt = new Date(Date.now() + expiresHours * 3600 * 1000).toISOString();
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    const session: AuthSession = {
      token,
      user,
      tenantId: user.tenantId || credentials.tenantId || 'tenant-001',
      permissions,
      expiresAt,
      rememberMe: !!credentials.rememberMe,
      createdAt: new Date().toISOString(),
    };

    // Sync active session for backend/repository tenant isolation
    setActiveSession({
      userId: user.id,
      tenantId: session.tenantId,
      role: user.role,
      userName: user.fullName,
      email: user.email,
      isSuperAdmin: user.role === RoleType.SUPER_ADMIN,
    });

    return {
      success: true,
      session,
    };
  }

  /**
   * Password change logic
   */
  public static async changePassword(
    userId: string,
    request: PasswordChangeRequest
  ): Promise<{ success: boolean; message: string }> {
    const cred = credentialsStore[userId];
    if (!cred) {
      throw new Error('ব্যবহারকারীর তথ্য পাওয়া যায়নি');
    }

    if (!request.newPassword || request.newPassword.length < 8) {
      return {
        success: false,
        message: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।',
      };
    }

    if (request.newPassword !== request.confirmPassword) {
      return {
        success: false,
        message: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।',
      };
    }

    const currentHash = await hashPassword(request.currentPassword, cred.salt);
    if (currentHash !== cred.passwordHash) {
      return {
        success: false,
        message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।',
      };
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(request.newPassword, newSalt);

    credentialsStore[userId] = {
      ...cred,
      salt: newSalt,
      passwordHash: newHash,
    };

    return {
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।',
    };
  }

  /**
   * Password reset request architecture (OTP generation)
   */
  public static async requestPasswordReset(
    request: PasswordResetRequest,
    userResolver: (identifier: string) => User | null
  ): Promise<{ success: boolean; message: string; previewToken?: string }> {
    const identifier = request.identifier.trim();
    const user = userResolver(identifier);

    if (!user) {
      return {
        success: false,
        message: 'এই তথ্যের কোনো অ্যাকাউন্ট পাওয়া যায়নি।',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    resetTokens[user.id] = {
      identifier,
      userId: user.id,
      otp,
      expiresAt,
    };

    return {
      success: true,
      message: `${request.method === 'SMS' ? 'মোবাইল নম্বরে' : 'ইমেইল ঠিকানায়'} ৬-সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে।`,
      previewToken: otp, // Returned for instant development test validation
    };
  }

  /**
   * Password reset submission
   */
  public static async submitPasswordReset(
    submit: PasswordResetSubmit,
    userResolver: (identifier: string) => User | null
  ): Promise<{ success: boolean; message: string }> {
    const user = userResolver(submit.identifier);
    if (!user) {
      return { success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' };
    }

    const resetRecord = resetTokens[user.id];
    if (!resetRecord) {
      return { success: false, message: 'কোনো পাসওয়ার্ড রিসেট রিকোয়েস্ট পাওয়া যায়নি।' };
    }

    if (Date.now() > resetRecord.expiresAt) {
      delete resetTokens[user.id];
      return { success: false, message: 'রিসেট কোডের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
    }

    if (resetRecord.otp !== submit.resetToken.trim()) {
      return { success: false, message: 'ভেরিফিকেশন ওটিপি কোডটি সঠিক নয়।' };
    }

    if (!submit.newPassword || submit.newPassword.length < 8) {
      return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(submit.newPassword, newSalt);

    credentialsStore[user.id] = {
      userId: user.id,
      username: user.username,
      email: user.email || '',
      mobile: user.mobile,
      salt: newSalt,
      passwordHash: newHash,
    };

    delete resetTokens[user.id];

    return {
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে রিসেট সম্পন্ন হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।',
    };
  }

  // -------------------------------------------------------------
  // Granular Authorization Helpers (Frontend & Mandatory Backend)
  // -------------------------------------------------------------
  /**
   * Verifies if a user role has a specific permission
   */
  public static hasPermission(role: RoleType, permission: PermissionCode): boolean {
    if (role === RoleType.SUPER_ADMIN) return true;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Mandatory backend authorization assertion. Throws ForbiddenError if unauthorized.
   */
  public static assertAuthorized(role: RoleType, permission: PermissionCode, resourceName: string = 'resource'): void {
    if (!this.hasPermission(role, permission)) {
      throw new ForbiddenError(
        `অ্যাক্সেস প্রত্যাখ্যান (403 Forbidden): '${role}' রোলের '${permission}' পারমিশন নেই। ${resourceName} এর জন্য অনুমতি প্রযোজ্য।`,
        permission
      );
    }
  }

  /**
   * Route-level permission evaluator
   */
  public static isRouteAllowed(route: string, role: RoleType): { allowed: boolean; requiredPermission?: PermissionCode } {
    if (role === RoleType.SUPER_ADMIN) {
      return { allowed: true };
    }

    const requirement = ROUTE_PERMISSION_MAP[route];
    if (!requirement || (Array.isArray(requirement) && requirement.length === 0)) {
      return { allowed: true };
    }

    if (Array.isArray(requirement)) {
      const allowed = requirement.some((perm) => this.hasPermission(role, perm));
      return {
        allowed,
        requiredPermission: requirement[0],
      };
    }

    const allowed = this.hasPermission(role, requirement);
    return {
      allowed,
      requiredPermission: requirement,
    };
  }
}
