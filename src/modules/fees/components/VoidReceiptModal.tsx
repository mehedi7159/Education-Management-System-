import React, { useState } from 'react';
import {
  Ban,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { FeePaymentRecord } from '../../../types';
import { formatTaka } from '../../../utils/format';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface VoidReceiptModalProps {
  payment: FeePaymentRecord;
  onClose: () => void;
  onSuccess: (updatedReceipt: FeePaymentRecord) => void;
}

const COMMON_REASONS = [
  'ভুল অংক বা পরিমাণ এন্ট্রি করা হয়েছিল',
  'ভুল শিক্ষার্থী বা জামাত নির্বাচন করা হয়েছিল',
  'দ্বৈত (ডুপ্লিকেট) পেমেন্ট এন্ট্রি করা হয়েছিল',
  'চেক বা অনলাইন ব্যাংকিং লেনদেন ব্যর্থ/বাউন্স হয়েছে',
  'অভিভাবকের বিশেষ অনুরোধে ফি মওকুফ সমন্বয়',
];

export const VoidReceiptModal: React.FC<VoidReceiptModalProps> = ({
  payment,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fullReason = [selectedReason, customNotes].filter(Boolean).join(' — ');

  const handleVoidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullReason.trim()) {
      setErrorMsg('অনুগ্রহ করে রশিদ বাতিলের সুনির্দিষ্ট কারণ উল্লেখ করুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await api.voidReceipt(payment.id, {
        reason: fullReason,
        voidedBy: user?.fullName || 'হিসাব শাখা',
      });

      if (res.success && res.data) {
        showToast(
          'রশিদ সফলভাবে বাতিল করা হয়েছে',
          'warning',
          res.message || `রশিদ #${payment.receiptNo} বাতিল ও রিভার্সাল সম্পন্ন হয়েছে।`
        );
        onSuccess(res.data.receipt);
      } else {
        setErrorMsg(res.error?.message || 'রশিদ বাতিল করতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">রশিদ বাতিল ও রিভার্সাল (Void Receipt)</h3>
              <p className="text-xs text-rose-300">
                রশিদ নং: <span className="font-mono font-bold text-white">#{payment.receiptNo}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-rose-300 hover:text-white p-1 rounded-lg hover:bg-rose-900/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleVoidSubmit} className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>শিক্ষার্থী:</span>
              <strong className="text-slate-900 dark:text-white">{payment.studentName} ({payment.className})</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>পরিশোধিত ফি-এর পরিমাণ:</span>
              <strong className="text-rose-600 dark:text-rose-400 font-mono text-sm">{formatTaka(payment.amountPaid)}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
              <span>মূল পরিশোধের তারিখ:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{payment.paymentDate}</span>
            </div>
          </div>

          {/* Audit Rule Explanation */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>অডিট ও হিসাব সমন্বয় নীতি:</span>
            </div>
            <p className="leading-relaxed">
              আইন অনুযায়ী ঐতিহাসিক রশিদ সরাসরি এডিট বা ডাটাবেজ থেকে মুছে ফেলা যায় না। এটি বাতিল করলে:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400 pl-1 text-[11px]">
              <li>শিক্ষার্থীর বকেয়া অ্যাকাউন্টে <strong>{formatTaka(payment.amountPaid)}</strong> টাকা পুনর্বহাল হবে।</li>
              <li>ক্যাশ ও সাধারণ তহবিলে একটি স্বয়ংক্রিয় রিভার্সাল ভাউচার (REV) লিপিবদ্ধ হবে।</li>
              <li>শিক্ষার্থী লেজারে একটি সমন্বয় ডেবিট এন্ট্রি যোগ হবে।</li>
            </ul>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              বাতিলকরণের কারণ নির্বাচন করুন <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              required
            >
              <option value="">-- কারণ বেছে নিন --</option>
              {COMMON_REASONS.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
              <option value="অন্যান্য বিশেষ কারণ">অন্যান্য বিশেষ কারণ</option>
            </select>
          </div>

          {/* Custom Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              বিস্তারিত বিবরণ বা মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={2}
              placeholder="অতিরিক্ত কোনো রেফারেন্স থাকলে এখানে লিখুন..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ফিরে যান
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fullReason.trim()}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  বাতিল করা হচ্ছে...
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  রশিদ বাতিল ও সমন্বয় নিশ্চিত করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
