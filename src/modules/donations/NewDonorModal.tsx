import React, { useState } from 'react';
import { DonorEntity, DonorCategory } from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { DONOR_CATEGORY_LABELS } from '../../constants';
import { X, UserPlus, Check, HeartHandshake } from 'lucide-react';

interface NewDonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDonor: DonorEntity) => void;
  initialDonor?: DonorEntity | null;
}

export const NewDonorModal: React.FC<NewDonorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDonor,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState(initialDonor?.name || '');
  const [mobile, setMobile] = useState(initialDonor?.mobile || '');
  const [email, setEmail] = useState(initialDonor?.email || '');
  const [address, setAddress] = useState(initialDonor?.address || '');
  const [category, setCategory] = useState<DonorCategory>(initialDonor?.category || 'GENERAL');
  const [isRegularDonor, setIsRegularDonor] = useState(initialDonor?.isRegularDonor || false);
  const [monthlyCommitment, setMonthlyCommitment] = useState<number | ''>(
    initialDonor?.monthlyCommitment || ''
  );
  const [notes, setNotes] = useState(initialDonor?.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('দাতার নাম উল্লেখ করুন।');
      return;
    }
    if (!mobile.trim()) {
      setErrorMessage('মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      if (initialDonor) {
        // Update
        const res = await api.updateDonor(initialDonor.id, {
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          category,
          isRegularDonor,
          monthlyCommitment: monthlyCommitment ? Number(monthlyCommitment) : undefined,
          notes: notes.trim() || undefined,
        });
        if (res.success && res.data) {
          onSuccess(res.data);
        } else {
          setErrorMessage(res.error?.message || 'আপডেট করতে ব্যর্থ হয়েছে।');
        }
      } else {
        // Create
        const res = await api.createDonor({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          category,
          isRegularDonor,
          monthlyCommitment: monthlyCommitment ? Number(monthlyCommitment) : undefined,
          notes: notes.trim() || undefined,
        });
        if (res.success && res.data) {
          onSuccess(res.data);
        } else {
          setErrorMessage(res.error?.message || 'দাতা তৈরি করতে ব্যর্থ হয়েছে।');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text-main)]">
                {initialDonor ? 'দাতার প্রোফাইল সম্পাদনা' : 'নতুন দাতা / পৃষ্ঠপোষক নিবন্ধন (Register Donor)'}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                স্থায়ী দাতা ডিরেক্টরিতে দাতার তথ্য সংরক্ষিত হবে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                দাতার পুরো নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আলহাজ্ব মো: আব্দুল্লাহ"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                ইমেইল (যদি থাকে)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="donor@example.com"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                দাতার ক্যাটাগরি
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DonorCategory)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(DONOR_CATEGORY_LABELS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.bn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                মাসিক অনুদানের অঙ্গীকার (ঐচ্ছিক)
              </label>
              <input
                type="number"
                min="0"
                value={monthlyCommitment}
                onChange={(e) => setMonthlyCommitment(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ৫০০০"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                স্থায়ী / যোগাযোগের ঠিকানা
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="গ্রাম/রোড, থানা, জেলা / দেশ (প্রবাসীদের ক্ষেত্রে)"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                বিশেষ নোট ও পরিচিতি
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="দাতার আগ্রহের খাত, পূর্বের অবদান বা রেফারেন্স নোট..."
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
            <input
              type="checkbox"
              id="regularDonorCheck"
              checked={isRegularDonor}
              onChange={(e) => setIsRegularDonor(e.target.checked)}
              className="rounded border-[var(--color-border)] text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="regularDonorCheck" className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 cursor-pointer">
              নিয়মিত মাসিক দাতা হিসেবে তালিকাভুক্ত করুন (Regular Recurring Contributor)
            </label>
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : initialDonor ? 'আপডেট করুন' : 'নিবন্ধন সম্পন্ন করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
