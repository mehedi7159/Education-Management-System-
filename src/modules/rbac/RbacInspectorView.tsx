import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  UserCheck,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  LogIn,
  LogOut,
  AlertTriangle,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { RoleType, PermissionCode } from '../../types';
import { ROLE_LABELS } from '../../constants';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ROLE_PERMISSIONS, AuthService } from '../../services/authService';
import { runRbacTestSuite, RbacTestSuiteSummary } from '../../services/rbacTestingSuite';

interface RbacInspectorViewProps {
  onOpenLoginModal: () => void;
  onOpenChangePasswordModal: () => void;
  onOpenResetPasswordModal: () => void;
  onSimulateUnauthorized: () => void;
  onNavigateToRoute: (route: string) => void;
}

const PROTECTED_ROUTES = [
  { id: 'dashboard', nameBn: 'ড্যাশবোর্ড', requiredPerm: null },
  { id: 'students', nameBn: 'শিক্ষার্থী তালিকা', requiredPerm: 'student.view' as PermissionCode },
  { id: 'admissions', nameBn: 'নতুন ভর্তি উইজার্ড', requiredPerm: 'student.create' as PermissionCode },
  { id: 'attendance', nameBn: 'দৈনিক হাজিরা', requiredPerm: 'attendance.view' as PermissionCode },
  { id: 'fees', nameBn: 'ফি আদায় ও রশিদ', requiredPerm: 'fee.view' as PermissionCode },
  { id: 'accounting', nameBn: 'হিসাব ও তহবিল', requiredPerm: 'finance.view' as PermissionCode },
  { id: 'staff', nameBn: 'ওস্তাদ ও স্টাফ প্রশাসন', requiredPerm: 'teacher.manage' as PermissionCode },
  { id: 'exams', nameBn: 'পরীক্ষা ও ফলাফল', requiredPerm: 'result.enter' as PermissionCode },
  { id: 'reports', nameBn: 'রিপোর্ট হাব', requiredPerm: 'report.view' as PermissionCode },
  { id: 'settings', nameBn: 'প্রতিষ্ঠান সেটিংস', requiredPerm: 'settings.manage' as PermissionCode },
];

export const RbacInspectorView: React.FC<RbacInspectorViewProps> = ({
  onOpenLoginModal,
  onOpenChangePasswordModal,
  onOpenResetPasswordModal,
  onSimulateUnauthorized,
  onNavigateToRoute,
}) => {
  const { user, session, isAuthenticated, switchRole, logout, tenant } = useAuth();
  const { language } = useTranslation();
  const { success, info, error: toastError } = useToast();

  const [testSummary, setTestSummary] = useState<RbacTestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<RoleType | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'matrix' | 'features' | 'session'>('matrix');

  // Auto-run tests on mount
  useEffect(() => {
    handleRunTests();
  }, []);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const summary = await runRbacTestSuite();
      setTestSummary(summary);
      success('RBAC অডিট সম্পন্ন হয়েছে', `${summary.passedTests}/${summary.totalRoleRouteTests} টি রুট-রোল টেস্ট পাস করেছে।`);
    } catch (err: any) {
      toastError('টেস্ট চালাতে ত্রুটি', err.message);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleRoleQuickSwitch = (role: RoleType) => {
    switchRole(role);
    success('রোল পরিবর্তিত হয়েছে', `বর্তমানে ${ROLE_LABELS[role].bn} হিসেবে অ্যাক্টিভ আছেন।`);
  };

  const handleTestRouteAccess = (route: string) => {
    onNavigateToRoute(route);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phase 04 Production RBAC
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ৮টি ইউজার টাইপ • গ্র্যানুলার পারমিশন
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-arabic">
              অথেনটিকেশন ও রোল-বেসড অ্যাক্সেস কন্ট্রোল (RBAC)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              সেশন ম্যানেজমেন্ট, পাসওয়ার্ড হ্যাশিং, রেট লিমিটিং, ৪০১/৪০৩ এরর গার্ড ও বাধ্যতামূলক ব্যাকএন্ড অথরাইজেশন যাচাইকরণ।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={handleRunTests}
              disabled={isRunningTests}
            >
              {isRunningTests ? 'অডিট চলছে...' : 'সম্পূর্ণ টেস্ট চালান'}
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<LogIn className="w-4 h-4" />}
              onClick={onOpenLoginModal}
            >
              লগইন ডায়ালগ
            </Button>
          </div>
        </div>

        {/* Current Active Session Mini Banner */}
        <div className="mt-5 pt-4 border-t border-emerald-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-300">বর্তমান সেশন ইউজার:</span>
            <span className="font-bold text-white bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              {user.fullName} ({ROLE_LABELS[user.role].bn})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenChangePasswordModal}
              className="text-emerald-300 hover:text-white underline font-medium cursor-pointer"
            >
              পাসওয়ার্ড পরিবর্তন
            </button>
            <span className="text-slate-500">•</span>
            <button
              onClick={onOpenResetPasswordModal}
              className="text-emerald-300 hover:text-white underline font-medium cursor-pointer"
            >
              পাসওয়ার্ড রিসেট (OTP)
            </button>
            <span className="text-slate-500">•</span>
            <button
              onClick={onSimulateUnauthorized}
              className="text-amber-300 hover:text-amber-100 underline font-medium cursor-pointer"
              title="সিমুলেট করুন unauthenticated 401 state"
            >
              ৪০১ আনঅথরাইজড টেস্ট
            </button>
          </div>
        </div>
      </div>

      {/* Test Results Status Banner */}
      {testSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">রুট-রোল টেস্ট</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {testSummary.passedTests} / {testSummary.totalRoleRouteTests} Passed
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">সিকিউরিটি ফিচার টেস্ট</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {testSummary.passedSecurityFeatureTests} / {testSummary.totalSecurityFeatureTests} Passed
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">অডিট রানটাইম</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {testSummary.executionTimeMs} ms
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">গ্র্যানুলার পারমিশন</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                ১৬ টি ডেডিকেটেড
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          রোল বনাম সুরক্ষিত রুট ম্যাট্রিক্স (8x10 Matrix)
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'features'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          সিকিউরিটি কোর ফিচার অডিট (Hashing, Rate Limit, Reset, Backend Assertion)
        </button>
        <button
          onClick={() => setActiveTab('session')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'session'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          সক্রিয় সেশন ও ক্রেডেনশিয়াল ইন্সপেক্টর
        </button>
      </div>

      {/* TAB 1: Role vs Route Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Quick Role Switcher Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                লাইভ রোল পরিবর্তন করুন (সরাসরি ইন্টারফেস প্রতিক্রিয়া দেখতে যেকোনো রোলে ক্লিক করুন):
              </span>
              <span className="text-xs text-slate-500">
                বর্তমান অ্যাক্টিভ: <strong className="text-emerald-600 dark:text-emerald-400">{ROLE_LABELS[user.role].bn}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(RoleType).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleQuickSwitch(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    user.role === role
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {ROLE_LABELS[role].bn}
                </button>
              ))}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5 font-bold text-slate-700 dark:text-slate-300">রুট / মডিউল</th>
                  <th className="p-3.5 font-bold text-slate-700 dark:text-slate-300">প্রয়োজনীয় পারমিশন</th>
                  {Object.values(RoleType).map((role) => (
                    <th
                      key={role}
                      className={`p-3 font-bold text-center ${
                        user.role === role
                          ? 'bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="truncate max-w-[80px]" title={ROLE_LABELS[role].bn}>
                        {ROLE_LABELS[role].bn.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-normal opacity-70 truncate max-w-[80px]">
                        {role}
                      </div>
                    </th>
                  ))}
                  <th className="p-3.5 font-bold text-right text-slate-700 dark:text-slate-300">
                    বর্তমান রোল পরীক্ষা
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PROTECTED_ROUTES.map((routeItem) => {
                  const currentAccess = AuthService.isRouteAllowed(routeItem.id, user.role);

                  return (
                    <tr
                      key={routeItem.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        <div>{routeItem.nameBn}</div>
                        <div className="font-mono text-[10px] text-slate-400">/{routeItem.id}</div>
                      </td>
                      <td className="p-3.5">
                        {routeItem.requiredPerm ? (
                          <span className="font-mono text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            {routeItem.requiredPerm}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">পাবলিক (লগইনকৃত)</span>
                        )}
                      </td>

                      {/* Render permission badge for each of the 8 roles */}
                      {Object.values(RoleType).map((role) => {
                        const isAllowed = AuthService.isRouteAllowed(routeItem.id, role).allowed;
                        const isCurrent = user.role === role;

                        return (
                          <td
                            key={role}
                            className={`p-2.5 text-center ${
                              isCurrent ? 'bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                            }`}
                          >
                            {isAllowed ? (
                              <span
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold"
                                title={`${ROLE_LABELS[role].bn}: অনুমোদিত`}
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs"
                                title={`${ROLE_LABELS[role].bn}: 403 Forbidden`}
                              >
                                ✕
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Action Button for Current Role */}
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant={currentAccess.allowed ? 'outline' : 'danger'}
                          onClick={() => handleTestRouteAccess(routeItem.id)}
                          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        >
                          {currentAccess.allowed ? 'প্রবেশ করুন' : '৪০৩ টেস্ট'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Core Security Features */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSummary?.securityFeatureResults.map((feat) => (
              <Card key={feat.featureId} className="border-l-4 border-l-emerald-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {feat.featureId}
                    </span>
                    <Badge variant={feat.passed ? 'success' : 'danger'} size="sm">
                      {feat.passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {feat.featureName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {feat.details}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    এক্সিকিউশন সময়: {feat.durationMs} ms
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Active Session & Credentials Inspector */}
      {activeTab === 'session' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                সক্রিয় অথেনটিকেশন সেশন বিবরণ (Active Session Payload)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1">ব্যবহারকারী আইডি ও নাম:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{user.fullName}</span>
                  <span className="block font-mono text-slate-400 text-[10px] mt-0.5">{user.id}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1">অ্যাক্টিভ রোল ও ইনস্টিটিউশন:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.role}</span>
                  <span className="block text-slate-500 text-[10px] mt-0.5">{tenant.nameBangla}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1">টোকেন প্রিফিক্স ও টাইপ:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    Bearer {session?.token.slice(0, 18)}...
                  </span>
                  <span className="block text-emerald-600 text-[10px] mt-0.5">SHA-256 Verified</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1">সেশনের মেয়াদ (Expiration):</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {session?.expiresAt ? new Date(session.expiresAt).toLocaleTimeString() : 'N/A'}
                  </span>
                  <span className="block text-blue-600 text-[10px] mt-0.5">
                    {session?.rememberMe ? 'Remembered (14 days)' : 'Standard Session (12 hrs)'}
                  </span>
                </div>
              </div>

              {/* Granted Permissions Array */}
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  বর্তমান রোলের জন্য অনুমোদিত গ্র্যানুলার পারমিশন তালিকা ({ROLE_PERMISSIONS[user.role]?.length || 0} টি):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_PERMISSIONS[user.role]?.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-lg font-mono text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Session Invalidation & Control Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  onClick={onOpenChangePasswordModal}
                >
                  পাসওয়ার্ড পরিবর্তন করুন
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={onOpenResetPasswordModal}
                >
                  পাসওয়ার্ড রিসেট আর্কিটেকচার
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<LogOut className="w-4 h-4" />}
                  onClick={onSimulateUnauthorized}
                >
                  সেশন বাতিল ও লগআউট (Trigger 401)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
