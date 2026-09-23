import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Tenant, RoleType, MadrasahType, SubscriptionPlan, PermissionCode, AuthSession, LoginCredentials, RateLimitState } from '../types';
import { setActiveSession } from '../services/tenantContext';
import { AuthService, ROLE_PERMISSIONS } from '../services/authService';
import { InstitutionService } from '../services/institutionService';

export const DEMO_TENANTS: Tenant[] = [
  {
    id: 'tenant-001',
    code: 'DARUL_ULOOM_DHK',
    nameBangla: 'জামেয়া ইসলামিয়া দারুল উলুম ঢাকা',
    nameEnglish: 'Jamia Islamia Darul Uloom Dhaka',
    nameArabic: 'الجامعة الإسلامية دار العلوم دكا',
    madrasahType: MadrasahType.QAWMI,
    eiinCode: '134521',
    address: 'মিরপুর-১২, ঢাকা-১২১৬',
    district: 'ঢাকা',
    phone: '01712-345678',
    email: 'info@darululoomdhaka.edu.bd',
    planType: SubscriptionPlan.PROFESSIONAL,
    isActive: true,
    currency: 'BDT',
    establishedYear: 1984,
  },
  {
    id: 'tenant-002',
    code: 'AL_HIKMAH_CTG',
    nameBangla: 'আল হিকমাহ ইসলামিক ক্যাডেট মাদ্রাসা',
    nameEnglish: 'Al-Hikmah Islamic Cadet Madrasah',
    nameArabic: 'مدرسة الحكمة الإسلامية النموذجية',
    madrasahType: MadrasahType.CADET,
    eiinCode: '145672',
    address: 'হালিশহর, চট্টগ্রাম',
    district: 'চট্টগ্রাম',
    phone: '01812-987654',
    email: 'contact@alhikmah.edu.bd',
    planType: SubscriptionPlan.ENTERPRISE,
    isActive: true,
    currency: 'BDT',
    establishedYear: 2012,
  },
];

const DEFAULT_USERS: Record<RoleType, User> = {
  [RoleType.SUPER_ADMIN]: {
    id: 'usr-super',
    fullName: 'মাওলানা আব্দুল্লাহ আল-মামুন (সিস্টেম অ্যাডমিন)',
    username: 'superadmin',
    email: 'admin@madrasah.saas',
    mobile: '01700000001',
    role: RoleType.SUPER_ADMIN,
    isActive: true,
  },
  [RoleType.INSTITUTION_ADMIN]: {
    id: 'usr-admin',
    tenantId: 'tenant-001',
    fullName: 'মাওলানা মাহমুদ হাসান (প্রশাসক)',
    username: 'admin_dhaka',
    email: 'admin@darululoomdhaka.edu.bd',
    mobile: '01711111111',
    role: RoleType.INSTITUTION_ADMIN,
    isActive: true,
  },
  [RoleType.MUHTAMIM]: {
    id: 'usr-muhtamim',
    tenantId: 'tenant-001',
    fullName: 'আল্লামা মুফতি রফীকুল ইসলাম (মুহতামিম)',
    username: 'muhtamim',
    email: 'principal@darululoomdhaka.edu.bd',
    mobile: '01722222222',
    role: RoleType.MUHTAMIM,
    isActive: true,
  },
  [RoleType.ACCOUNTANT]: {
    id: 'usr-accountant',
    tenantId: 'tenant-001',
    fullName: 'মাওলানা হাবিবুর রহমান (হিসাবরক্ষক)',
    username: 'accountant',
    email: 'accounts@darululoomdhaka.edu.bd',
    mobile: '01733333333',
    role: RoleType.ACCOUNTANT,
    isActive: true,
  },
  [RoleType.TEACHER]: {
    id: 'usr-teacher',
    tenantId: 'tenant-001',
    fullName: 'মুফতি তারিক জামিল (সিনিয়র ওস্তাদ)',
    username: 'teacher_tariq',
    email: 'tariq@darululoomdhaka.edu.bd',
    mobile: '01744444444',
    role: RoleType.TEACHER,
    isActive: true,
  },
  [RoleType.STAFF]: {
    id: 'usr-staff',
    tenantId: 'tenant-001',
    fullName: 'মোহাম্মদ নূরনবী (অফিস সহকারী)',
    username: 'staff_noor',
    email: 'office@darululoomdhaka.edu.bd',
    mobile: '01755555555',
    role: RoleType.STAFF,
    isActive: true,
  },
  [RoleType.GUARDIAN]: {
    id: 'usr-guardian',
    tenantId: 'tenant-001',
    fullName: 'জনাব মুহাম্মদ জাকির হোসেন (অভিভাবক)',
    username: 'guardian_zakir',
    email: 'zakir@gmail.com',
    mobile: '01766666666',
    role: RoleType.GUARDIAN,
    isActive: true,
  },
  [RoleType.STUDENT]: {
    id: 'usr-student',
    tenantId: 'tenant-001',
    fullName: 'মুহাম্মদ তালহা (তালেবে ইলম - রোল ০১)',
    username: 'student_talha',
    email: 'talha@student.darululoom.edu.bd',
    mobile: '01777777777',
    role: RoleType.STUDENT,
    isActive: true,
  },
};

interface AuthContextType {
  user: User;
  tenant: Tenant;
  tenants: Tenant[];
  session: AuthSession | null;
  isAuthenticated: boolean;
  setTenant: (tenant: Tenant) => void;
  addTenant: (newTenant: Tenant) => void;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => void;
  switchTenantById: (tenantId: string) => void;
  switchRole: (role: RoleType) => void;
  hasPermission: (allowedRoles: RoleType[]) => boolean;
  hasGranularPermission: (permission: PermissionCode) => boolean;
  isRouteAllowed: (route: string) => { allowed: boolean; requiredPermission?: PermissionCode };
  loginWithCredentials: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    session?: AuthSession;
    error?: string;
    rateLimit?: RateLimitState;
  }>;
  logout: () => void;
  resolveUserByIdentifier: (identifier: string) => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'madrasah_saas_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const extra = InstitutionService.getStoredExtraTenants();
    const merged = [...DEMO_TENANTS];
    for (const ex of extra) {
      if (!merged.some((t) => t.id === ex.id)) {
        merged.push(ex);
      }
    }
    return merged;
  });

  const [tenant, setTenant] = useState<Tenant>(() => {
    const extra = InstitutionService.getStoredExtraTenants();
    return extra.length > 0 ? extra[extra.length - 1] : DEMO_TENANTS[0];
  });
  const [currentRole, setCurrentRole] = useState<RoleType>(RoleType.INSTITUTION_ADMIN);
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default active session for instant exploration
    const initialUser = DEFAULT_USERS[RoleType.INSTITUTION_ADMIN];
    return {
      token: `session_init_${initialUser.id}`,
      user: initialUser,
      tenantId: 'tenant-001',
      permissions: ROLE_PERMISSIONS[RoleType.INSTITUTION_ADMIN],
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      rememberMe: true,
      createdAt: new Date().toISOString(),
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const user = session ? session.user : DEFAULT_USERS[currentRole];

  // Keep tenantContext in sync with authenticated React state
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setActiveSession(null as any);
      return;
    }
    const isSuper = user.role === RoleType.SUPER_ADMIN;
    setActiveSession({
      userId: user.id,
      tenantId: isSuper ? tenant.id : (user.tenantId || tenant.id),
      role: user.role,
      userName: user.fullName,
      email: user.email,
      isSuperAdmin: isSuper,
    });
  }, [user, tenant, isAuthenticated]);

  const resolveUserByIdentifier = useCallback((identifier: string): User | null => {
    const clean = identifier.trim().toLowerCase();
    const allUsers = Object.values(DEFAULT_USERS);
    return (
      allUsers.find(
        (u) =>
          u.username.toLowerCase() === clean ||
          (u.email && u.email.toLowerCase() === clean) ||
          u.mobile === clean
      ) || null
    );
  }, []);

  const loginWithCredentials = async (credentials: LoginCredentials) => {
    const result = await AuthService.login(credentials, resolveUserByIdentifier);
    if (result.success && result.session) {
      const activeSession = result.session;
      setSession(activeSession);
      setIsAuthenticated(true);
      setCurrentRole(activeSession.user.role);

      // Persist to storage
      if (credentials.rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
      }

      // Sync tenant if user belongs to specific tenant
      if (activeSession.user.tenantId) {
        const tFound = DEMO_TENANTS.find((t) => t.id === activeSession.user.tenantId);
        if (tFound) setTenant(tFound);
      }
    }
    return result;
  };

  const logout = () => {
    setSession(null);
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const switchRole = (role: RoleType) => {
    setCurrentRole(role);
    const targetUser = DEFAULT_USERS[role];
    const newSession: AuthSession = {
      token: `switched_token_${targetUser.id}_${Date.now()}`,
      user: targetUser,
      tenantId: targetUser.tenantId || tenant.id,
      permissions: ROLE_PERMISSIONS[role],
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      rememberMe: true,
      createdAt: new Date().toISOString(),
    };
    setSession(newSession);
    setIsAuthenticated(true);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
  };

  const addTenant = (newTenant: Tenant) => {
    setTenants((prev) => {
      const exists = prev.some((t) => t.id === newTenant.id);
      return exists ? prev.map((t) => (t.id === newTenant.id ? newTenant : t)) : [...prev, newTenant];
    });
    setTenant(newTenant);
    if (session) {
      const updatedSession = { ...session, tenantId: newTenant.id };
      setSession(updatedSession);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
    }
    InstitutionService.persistNewTenant(newTenant);
  };

  const updateTenant = (tenantId: string, updates: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const updated = { ...t, ...updates };
          InstitutionService.persistNewTenant(updated);
          return updated;
        }
        return t;
      })
    );
    if (tenant.id === tenantId) {
      setTenant((prev) => {
        const updated = { ...prev, ...updates };
        return updated;
      });
    }
  };

  const switchTenantById = (tenantId: string) => {
    const found = tenants.find((t) => t.id === tenantId) || DEMO_TENANTS.find((t) => t.id === tenantId);
    if (found) {
      setTenant(found);
      if (session) {
        const updatedSession = { ...session, tenantId };
        setSession(updatedSession);
      }
    }
  };

  const hasPermission = (allowedRoles: RoleType[]): boolean => {
    if (!isAuthenticated || !user) return false;
    if (user.role === RoleType.SUPER_ADMIN) return true;
    return allowedRoles.includes(user.role);
  };

  const hasGranularPermission = (permission: PermissionCode): boolean => {
    if (!isAuthenticated || !user) return false;
    return AuthService.hasPermission(user.role, permission);
  };

  const isRouteAllowed = (route: string) => {
    if (!isAuthenticated || !user) {
      return { allowed: false };
    }
    return AuthService.isRouteAllowed(route, user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        tenants,
        session,
        isAuthenticated,
        setTenant,
        addTenant,
        updateTenant,
        switchTenantById,
        switchRole,
        hasPermission,
        hasGranularPermission,
        isRouteAllowed,
        loginWithCredentials,
        logout,
        resolveUserByIdentifier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
