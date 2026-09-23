import React, { useState } from 'react';
import { FundEntity, FundTransferEntity } from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowRightLeft, ShieldAlert, CheckCircle2, FileCheck2, Info } from 'lucide-react';

interface FundTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transfer: FundTransferEntity) => void;
  funds: FundEntity[];
}

export const FundTransferModal: React.FC<FundTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  funds,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [fromFundId, setFromFundId] = useState(funds[0]?.id || '');
  const [toFundId, setToFundId] = useState(funds[1]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [shariahJustification, setShariahJustification] = useState('');
  const [fatwaOrResolutionRef, setFatwaOrResolutionRef] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const fromFund = funds.find((f) => f.id === fromFundId);
  const toFund = funds.find((f) => f.id === toFundId);
  const isRestrictedSource = !!fromFund?.isRestricted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fromFundId === toFundId) {
      setErrorMessage('উৎস এবং গন্তব্য একই তহবিল হতে পারে না।');
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMessage('স্থানান্তরের টাকার পরিমাণ উল্লেখ করুন।');
      return;
    }
    if (fromFund && fromFund.currentBalance < Number(amount)) {
      setErrorMessage(`উৎস তহবিলে পর্যাপ্ত ব্যালেন্স নেই। বর্তমান স্থিতি: ৳${fromFund.currentBalance.toLocaleString('bn-BD')}`);
      return;
    }
    if (!purpose.trim()) {
      setErrorMessage('তহবিল স্থানান্তরের উদ্দেশ্য ও খাত উল্লেখ করুন।');
      return;
    }
    if (isRestrictedSource) {
      if (!shariahJustification.trim()) {
        setErrorMessage('সংরক্ষিত তহবিলের (Restricted Fund) জন্য শরীয়তসম্মত যুক্তি প্রদান বাধ্যতামূলক।');
        return;
      }
      if (!fatwaOrResolutionRef.trim()) {
        setErrorMessage('ফতোয়া রেফারেন্স অথবা রেজুলেশন নম্বর উল্লেখ করা বাধ্যতামূলক।');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await api.createFundTransfer({
        fromFundId,
        toFundId,
        amount: Number(amount),
        date,
        purpose: purpose.trim(),
        shariahJustification: isRestrictedSource ? shariahJustification.trim() : undefined,
        fatwaOrResolutionRef: isRestrictedSource ? fatwaOrResolutionRef.trim() : undefined,
        authorizedBy: user?.fullName || user?.username || 'মুহতামিম',
      });

      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setErrorMessage(res.error?.message || 'তহবিল স্থানান্তর ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text-main)]">
                তহবিল স্থানান্তর ও সমন্বয় (Fund Transfer & Shariah Authorization)
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                সংরক্ষিত তহবিল সুরক্ষা ও কঠোর অডিট ট্রেইল প্রযোজ্য
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Fund Transfer Source & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                উৎস তহবিল (From Fund) <span className="text-rose-500">*</span>
              </label>
              <select
                value={fromFundId}
                onChange={(e) => setFromFundId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameBangla} {f.isRestricted ? '(সংরক্ষিত)' : ''}
                  </option>
                ))}
              </select>
              {fromFund && (
                <div className="mt-1.5 flex items-center justify-between text-xs text-[var(--color-text-muted)] px-1">
                  <span>বর্তমান স্থিতি:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    ৳{fromFund.currentBalance.toLocaleString('bn-BD')}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                গন্তব্য তহবিল (To Fund) <span className="text-rose-500">*</span>
              </label>
              <select
                value={toFundId}
                onChange={(e) => setToFundId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameBangla} {f.isRestricted ? '(সংরক্ষিত)' : ''}
                  </option>
                ))}
              </select>
              {toFund && (
                <div className="mt-1.5 flex items-center justify-between text-xs text-[var(--color-text-muted)] px-1">
                  <span>বর্তমান স্থিতি:</span>
                  <span className="font-mono font-bold text-slate-600">
                    ৳{toFund.currentBalance.toLocaleString('bn-BD')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transfer Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                স্থানান্তরের টাকার পরিমাণ (BDT) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ৫০০০০"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                স্থানান্তরের তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              স্থানান্তরের উদ্দেশ্য ও প্রাসঙ্গিকতা <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="যেমন: লিল্লাহ বোর্ডিং ছাত্রদের রেশন ক্রয়ে তহবিল সমন্বয়"
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Strict Restricted Fund Shariah Safeguard Section */}
          {isRestrictedSource ? (
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide">
                    সংরক্ষিত তহবিল সতর্কতা (Restricted Shariah Fund Guard)
                  </h4>
                  <p className="text-xs mt-0.5">
                    উৎস তহবিল <strong>{fromFund?.nameBangla}</strong> একটি শরীয়ত-নির্ধারিত সংরক্ষিত ফান্ড। সাধারণ পরিচালন তহবিলে এটি বিধিবহির্ভূতভাবে স্থানান্তর করা নিষিদ্ধ।
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  শরীয়তসম্মত কারণ ও তামলিক ব্যাখ্যা <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={shariahJustification}
                  onChange={(e) => setShariahJustification(e.target.value)}
                  placeholder="যেমন: মুস্তাহিক এতিম ছাত্রদের খাদ্য ও কিতাব বাবদ বরাদ্দ এবং দারুল ইফতার অনুমোদন..."
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  ফতোয়া নং / রেজুলেশন রেফারেন্স <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fatwaOrResolutionRef}
                  onChange={(e) => setFatwaOrResolutionRef(e.target.value)}
                  placeholder="যেমন: FATWA-88/2025 অথবা RES-GB-2025/04"
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4 flex-shrink-0 text-blue-500" />
              <span>উৎস তহবিলটি উন্মুক্ত সাধারণ তহবিলভুক্ত। অনুমোদিত কর্মকর্তা কর্তৃক স্থানান্তর কার্যকর হবে।</span>
            </div>
          )}

          {/* Authorization preview */}
          <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] flex items-center justify-between">
            <span>অনুমোদনকারী কর্তৃপক্ষ:</span>
            <span className="font-semibold text-[var(--color-text-main)]">
              {user?.fullName || user?.username || 'মুহতামিম / অ্যাডমিন'} ({user?.role})
            </span>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <FileCheck2 className="w-4 h-4" />
              {isSubmitting ? 'স্থানান্তর হচ্ছে...' : 'স্থানান্তর অনুমোদন ও কার্যকর করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
