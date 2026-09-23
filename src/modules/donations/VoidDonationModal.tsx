import React, { useState } from 'react';
import { DonationEntity } from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';

interface VoidDonationModalProps {
  donation: DonationEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (voided: DonationEntity) => void;
}

export const VoidDonationModal: React.FC<VoidDonationModalProps> = ({
  donation,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [voidReason, setVoidReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !donation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!voidReason.trim()) {
      setErrorMessage('রশিদ বাতিলের সুনির্দিষ্ট কারণ উল্লেখ করা বাধ্যতামূলক।');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.voidDonation(donation.id, {
        reason: voidReason.trim(),
        voidedBy: user?.fullName || user?.username || 'মুহতামিম / হিসাব নিরীক্ষক',
      });

      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setErrorMessage(res.error?.message || 'রশিদ বাতিল করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-rose-500/10">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              অনুদান রশিদ বাতিলকরণ (Void Donation Receipt)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>আর্থিক অপরিবর্তনীয়তা ও অডিট সুরক্ষা:</span>
            </div>
            <p>
              আর্থিক লেনদেন সরাসরি ডিলিট করা সম্ভব নয়। বাতিল করলে সংশ্লিষ্ট ক্যাশ/ব্যাংক অ্যাকাউন্ট, তহবিল ব্যালেন্স, প্রকল্প ও দাতার আজীবন মোট অবদান স্বয়ংক্রিয়ভাবে রিভার্স (সমন্বয়) হবে এবং স্থায়ী অডিট ট্রেইলে সংরক্ষিত থাকবে।
            </p>
          </div>

          <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] text-xs space-y-1">
            <div>
              <span className="text-[var(--color-text-muted)]">রশিদ নং:</span>{' '}
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{donation.receiptNo}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">দাতার নাম:</span>{' '}
              <span className="font-semibold text-[var(--color-text-main)]">{donation.donorName}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">তহবিল:</span>{' '}
              <span className="font-medium text-[var(--color-text-main)]">{donation.fundName}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">টাকার পরিমাণ:</span>{' '}
              <span className="font-mono font-bold text-rose-600 text-sm">৳{donation.amount.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              রশিদ বাতিলের সুনির্দিষ্ট কারণ <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="যেমন: ভুলবশত দ্বৈত এন্ট্রি করা হয়েছিল অথবা চেক ডিসঅনার হয়েছে..."
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              {isSubmitting ? 'প্রক্রিয়াধীন...' : 'নিশ্চিত বাতিল (Void)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
