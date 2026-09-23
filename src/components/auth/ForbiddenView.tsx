import React from 'react';
import { ShieldX, AlertOctagon, ArrowLeft, UserCheck, KeyRound } from 'lucide-react';
import { Button } from '../common/Button';
import { RoleType, PermissionCode } from '../../types';
import { ROLE_LABELS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';

interface ForbiddenViewProps {
  requiredPermission?: PermissionCode;
  moduleName?: string;
  onBackToDashboard?: () => void;
  onSwitchRoleClick?: (role: RoleType) => void;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({
  requiredPermission,
  moduleName,
  onBackToDashboard,
  onSwitchRoleClick,
}) => {
  const { user, switchRole } = useAuth();
  const { language } = useTranslation();

  const handleRoleChange = (role: RoleType) => {
    if (onSwitchRoleClick) {
      onSwitchRoleClick(role);
    } else {
      switchRole(role);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xl space-y-6">
        {/* Animated Icon Header */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center relative">
          <ShieldX className="w-10 h-10" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-900">
            403
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertOctagon className="w-3.5 h-3.5" />
            অননুমোদিত অ্যাক্সেস (403 Forbidden)
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-arabic">
            আপনার এই পেইজে প্রবেশের অনুমতি নেই
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            আপনার বর্তমান অ্যাকাউন্টের রোলে এই মডিউলের জন্য পর্যাপ্ত পারমিশন নেই।
          </p>
        </div>

        {/* User Role and Permission Details Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-left border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">আপনার বর্তমান রোল:</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              {ROLE_LABELS[user.role][language] || user.role}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">অনুরোধকৃত মডিউল:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {moduleName || 'সুরক্ষিত মডিউল'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">প্রয়োজনীয় পারমিশন:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              {requiredPermission || 'restricted.access'}
            </span>
          </div>
        </div>

        {/* Role Switcher for Testing/Demonstration */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800/60 text-left space-y-2">
          <span className="text-xs font-semibold text-blue-900 dark:text-blue-300 block">
            রোল পরিবর্তন করে অ্যাক্সেস পরীক্ষা করুন (Demo Testing):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT, RoleType.TEACHER].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  user.role === r
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onBackToDashboard && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={onBackToDashboard}
            >
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
