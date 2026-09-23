import React from 'react';
import { Lock, Unlock, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { AttendanceLockConfig } from '../../../types';

interface AttendanceLockBannerProps {
  isLocked: boolean;
  lockConfig: AttendanceLockConfig | null;
  selectedDate: string;
  isToday: boolean;
  isAdmin: boolean;
  onOpenCorrectionModal?: () => void;
  onOpenLockSettings?: () => void;
}

export const AttendanceLockBanner: React.FC<AttendanceLockBannerProps> = ({
  isLocked,
  lockConfig,
  selectedDate,
  isToday,
  isAdmin,
  onOpenCorrectionModal,
  onOpenLockSettings,
}) => {
  const cutoffTime = lockConfig?.cutoffTime || '10:30';

  if (!isLocked) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-700 dark:text-emerald-300 shrink-0">
            <Unlock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <span>হাজিরা খাতা উন্মুক্ত রয়েছে (Open for Entry)</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-200/70 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100">
                স্বাভাবিক মোড
              </span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              তারিখ: <span className="font-medium">{selectedDate}</span> | কাট-অফ সময়: <span className="font-semibold">{cutoffTime}</span> পর্যন্ত অবাধে হাজিরা সংরক্ষণ করা যাবে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/40 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Clock className="w-3.5 h-3.5" />
            <span>কাট-অফ: {cutoffTime}</span>
          </div>
          {isAdmin && onOpenLockSettings && (
            <button
              onClick={onOpenLockSettings}
              className="text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
            >
              লক রুলস
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950 dark:text-amber-200">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
            <span>হাজিরা এন্ট্রি লক করা রয়েছে (Attendance Locked)</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
              {isToday ? `কাট-অফ সময় (${cutoffTime}) অতিক্রান্ত` : 'অতীত তারিখ'}
            </span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
            সরাসরি পরিবর্তন বন্ধ রয়েছে। যেকোনো সংশোধন করতে মুহতামিম / অনুমোদিত অ্যাডমিনের অনুমোদন ও কারণ উল্লেখ আবশ্যক।
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {isAdmin && onOpenCorrectionModal && (
          <button
            onClick={onOpenCorrectionModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>অনুমোদিত সংশোধন উইন্ডো</span>
          </button>
        )}
      </div>
    </div>
  );
};
