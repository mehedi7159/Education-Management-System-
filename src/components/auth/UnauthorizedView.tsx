import React from 'react';
import { Lock, LogIn, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '../common/Button';

interface UnauthorizedViewProps {
  onLoginClick: () => void;
  onBackToDashboard?: () => void;
  customMessage?: string;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  onLoginClick,
  onBackToDashboard,
  customMessage,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xl space-y-6">
        {/* Animated Icon Header */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center relative">
          <Lock className="w-10 h-10" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-slate-900">
            401
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            লগইন প্রয়োজন (Authentication Required)
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-arabic">
            অনুগ্রহ করে লগইন করুন
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {customMessage ||
              'এই মডিউলটিতে প্রবেশের জন্য সক্রিয় ব্যবহারকারী সেশন প্রয়োজন। আপনার সেশনের মেয়াদ শেষ হয়ে থাকতে পারে।'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-500 text-left space-y-1.5 border border-slate-100 dark:border-slate-800">
          <div className="font-semibold text-slate-700 dark:text-slate-300">সেশন নিরাপত্তা নীতিমালা:</div>
          <div>• সিস্টেমে প্রবেশের জন্য বৈধ ক্রেডেনশিয়াল বাধ্যতামূলক।</div>
          <div>• অকার্যকর সেশনে স্বয়ংক্রিয়ভাবে অ্যাক্সেস স্থগিত করা হয়।</div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<LogIn className="w-4 h-4" />}
            onClick={onLoginClick}
          >
            অ্যাকাউন্টে লগইন করুন
          </Button>

          {onBackToDashboard && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={onBackToDashboard}
            >
              মূল ড্যাশবোর্ডে ফিরে যান
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
