import React, { useState, useEffect } from 'react';
import {
  Lock,
  UserCheck,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth, DEMO_TENANTS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AuthService } from '../../services/authService';
import { RoleType, RateLimitState } from '../../types';
import { ROLE_LABELS } from '../../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForgotPassword?: () => void;
  onOpenChangePassword?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenForgotPassword,
  onOpenChangePassword,
}) => {
  const { user, loginWithCredentials, switchRole, tenant, setTenant } = useAuth();
  const { success, error: toastError } = useToast();

  const [identifier, setIdentifier] = useState('admin_dhaka');
  const [password, setPassword] = useState('Madrasah@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedTenantId, setSelectedTenantId] = useState(tenant.id);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitState | null>(null);

  // Poll lockout countdown if rate limit active
  useEffect(() => {
    if (!rateLimit?.isLocked) return;
    const interval = setInterval(() => {
      const state = AuthService.getRateLimitState(identifier);
      setRateLimit(state);
      if (!state.isLocked) {
        setErrorMessage(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimit, identifier]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await loginWithCredentials({
        identifier,
        password,
        tenantId: selectedTenantId,
        rememberMe,
      });

      if (result.success) {
        success('লগইন সফল হয়েছে', `স্বাগতম, ${result.session?.user.fullName}`);
        onClose();
      } else {
        setErrorMessage(result.error || 'লগইন ব্যর্থ হয়েছে');
        if (result.rateLimit) {
          setRateLimit(result.rateLimit);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'সার্ভার যোগাযোগে ত্রুটি হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRoleSelect = (role: RoleType) => {
    switch (role) {
      case RoleType.SUPER_ADMIN:
        setIdentifier('superadmin');
        break;
      case RoleType.INSTITUTION_ADMIN:
        setIdentifier('admin_dhaka');
        break;
      case RoleType.MUHTAMIM:
        setIdentifier('muhtamim');
        break;
      case RoleType.ACCOUNTANT:
        setIdentifier('accountant');
        break;
      case RoleType.TEACHER:
        setIdentifier('teacher_tariq');
        break;
      case RoleType.STAFF:
        setIdentifier('staff_noor');
        break;
      case RoleType.GUARDIAN:
        setIdentifier('guardian_zakir');
        break;
      case RoleType.STUDENT:
        setIdentifier('student_talha');
        break;
    }
    setPassword('Madrasah@123');
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="মাদ্রাসা ম্যানেজমেন্ট সিস্টেমে লগইন"
      subtitle="সুরক্ষিত সেশন অথেনটিকেশন ও অ্যাক্সেস কন্ট্রোল"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Quick Role Fill Selector for Testing/Evaluation */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              দ্রুত রোল নির্বাচন করুন (Quick 1-Click Role Login):
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              ডিফল্ট পাসওয়ার্ড: Madrasah@123
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              RoleType.SUPER_ADMIN,
              RoleType.INSTITUTION_ADMIN,
              RoleType.MUHTAMIM,
              RoleType.ACCOUNTANT,
              RoleType.TEACHER,
              RoleType.STAFF,
              RoleType.GUARDIAN,
              RoleType.STUDENT,
            ].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleQuickRoleSelect(r)}
                className={`px-1.5 py-1 text-[11px] rounded-lg border text-center font-medium transition-all ${
                  (r === RoleType.SUPER_ADMIN && identifier === 'superadmin') ||
                  (r === RoleType.INSTITUTION_ADMIN && identifier === 'admin_dhaka') ||
                  (r === RoleType.MUHTAMIM && identifier === 'muhtamim') ||
                  (r === RoleType.ACCOUNTANT && identifier === 'accountant') ||
                  (r === RoleType.TEACHER && identifier === 'teacher_tariq') ||
                  (r === RoleType.STAFF && identifier === 'staff_noor') ||
                  (r === RoleType.GUARDIAN && identifier === 'guardian_zakir') ||
                  (r === RoleType.STUDENT && identifier === 'student_talha')
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {ROLE_LABELS[r].bn.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Rate Limiting Alert */}
        {rateLimit?.isLocked && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 animate-spin" />
            <div>
              <p className="font-bold">অ্যাকাউন্ট লকআউট সক্রিয় (Rate Limit)</p>
              <p>অতিরিক্ত ভুল চেষ্টার কারণে সাময়িকভাবে লগইন স্থগিত। অবশিষ্ট সময়: <strong>{rateLimit.lockoutRemainingSeconds} সেকেন্ড</strong></p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && !rateLimit?.isLocked && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Institution/Tenant Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              প্রতিষ্ঠান (Tenant Institution)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedTenantId}
                onChange={(e) => {
                  setSelectedTenantId(e.target.value);
                  const tFound = DEMO_TENANTS.find((t) => t.id === e.target.value);
                  if (tFound) setTenant(tFound);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {DEMO_TENANTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameBangla} ({t.district})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ইউজারনেম / ইমেইল / মোবাইল নম্বর
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="যেমন: admin_dhaka বা 01711111111"
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                পাসওয়ার্ড
              </label>
              {onOpenForgotPassword && (
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                সেশন মনে রাখুন (Remember Session - 14 Days)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading || !!rateLimit?.isLocked}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              {isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
            </Button>

            {onOpenChangePassword && (
              <button
                type="button"
                onClick={onOpenChangePassword}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 pt-1"
              >
                পাসওয়ার্ড পরিবর্তন করতে চান?
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};
