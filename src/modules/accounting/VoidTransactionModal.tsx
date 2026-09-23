import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, CheckCircle2, Lock } from 'lucide-react';
import { TransactionEntity, TransactionType } from '../../types';
import { formatTaka, formatDate } from '../../utils/format';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface VoidTransactionModalProps {
  transaction: TransactionEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTx: TransactionEntity) => void;
}

export const VoidTransactionModal: React.FC<VoidTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === TransactionType.INCOME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('ভাউচার বাতিলের সুনির্দিষ্ট কারণ লেখা আবশ্যক।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.voidFinancialTransaction(transaction.id, {
        reason: reason.trim(),
        voidedBy: user?.fullName || user?.username || 'অডিট অফিসার',
      });

      if (res.success && res.data) {
        showToast(res.message || 'ভাউচার সফলভাবে বাতিল করা হয়েছে।', 'success');
        onSuccess(res.data);
        onClose();
      } else {
        showToast(res.error?.message || 'ভাউচার বাতিল করা সম্ভব হয়নি।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ভাউচার বাতিলের সময় সমস্যা হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-rose-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-lg">ভাউচার বাতিল ও অডিট রিভার্সাল</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-100 hover:text-white rounded-lg hover:bg-rose-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">স্থায়ী অডিট নীতি ও রিভার্সাল নিয়মাবলী:</p>
              <p>
                আর্থিক লেনদেন কখনোই ডাটাবেজ থেকে সরাসরি মোছা বা ডিলিট করা যায় না। এই ভাউচারটি বাতিল (Void) করলে
                সংশ্লিষ্ট ক্যাশ/ব্যাংক হিসাব ও তহবিলের ব্যালান্স স্বয়ংক্রিয়ভাবে পূর্বের অবস্থায় ফিরে যাবে এবং অডিট ট্রেইলে
                স্থায়ী রিভার্সাল রেকর্ড সংরক্ষিত থাকবে।
              </p>
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">ভাউচার নং:</span>
              <span className="font-mono font-bold text-slate-800">{transaction.voucherNo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">লেনদেনের ধরন:</span>
              <span className={`font-bold ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isIncome ? 'আদায় / আয়' : 'ব্যয় / খরচ'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">পরিমাণ:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{formatTaka(transaction.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">খাত ও রেফারেন্স:</span>
              <span className="text-slate-700 font-medium">
                {transaction.category} (রেফারেন্স: {transaction.reference})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">হিসাব ও তারিখ:</span>
              <span className="text-slate-700">
                {transaction.accountName} | {formatDate(transaction.transactionDate)}
              </span>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              বাতিলের সুনির্দিষ্ট কারণ (Mandatory Audit Reason) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="উদাহরণ: ভুল অঙ্কের ভাউচার তৈরি হওয়ায় অথবা বাতিলকৃত বিলের কারণে..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              বাতিল নয়, ফিরে যান
            </button>
            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              id="confirm-void-tx-btn"
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md transition cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'রিভার্সাল প্রক্রিয়াধীন...' : 'ভাউচার রিভার্স ও বাতিল নিশ্চিত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
