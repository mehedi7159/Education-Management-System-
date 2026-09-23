import React, { useState } from 'react';
import { FundEntity, FundCodeType } from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { FUND_TYPE_LABELS } from '../../constants';
import { X, Layers, Check, ShieldAlert } from 'lucide-react';

interface NewFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fund: FundEntity) => void;
  initialFund?: FundEntity | null;
}

export const NewFundModal: React.FC<NewFundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialFund,
}) => {
  const { t } = useTranslation();

  const [fundCode, setFundCode] = useState<FundCodeType>(initialFund?.fundCode || 'GENERAL');
  const [nameBangla, setNameBangla] = useState(initialFund?.nameBangla || '');
  const [nameEnglish, setNameEnglish] = useState(initialFund?.nameEnglish || '');
  const [isRestricted, setIsRestricted] = useState(initialFund?.isRestricted || false);
  const [restrictionPurpose, setRestrictionPurpose] = useState(initialFund?.restrictionPurpose || '');
  const [targetAmount, setTargetAmount] = useState<number | ''>(initialFund?.targetAmount || '');
  const [color, setColor] = useState(initialFund?.color || '#059669');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFundCodeChange = (code: FundCodeType) => {
    setFundCode(code);
    const meta = FUND_TYPE_LABELS[code];
    if (meta) {
      setNameBangla(meta.bn);
      setNameEnglish(meta.en);
      setIsRestricted(meta.isRestricted);
      setRestrictionPurpose(meta.purposeBn);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nameBangla.trim()) {
      setErrorMessage('তহবিলের বাংলা নাম প্রদান করুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      if (initialFund) {
        const res = await api.updateFund(initialFund.id, {
          nameBangla: nameBangla.trim(),
          nameEnglish: nameEnglish.trim() || nameBangla.trim(),
          fundCode,
          isRestricted,
          restrictionPurpose: restrictionPurpose.trim() || undefined,
          targetAmount: targetAmount ? Number(targetAmount) : undefined,
          color,
        });
        if (res.success && res.data) {
          onSuccess(res.data);
        } else {
          setErrorMessage(res.error?.message || 'তহবিল আপডেট ব্যর্থ হয়েছে।');
        }
      } else {
        const res = await api.createFund({
          nameBangla: nameBangla.trim(),
          nameEnglish: nameEnglish.trim() || nameBangla.trim(),
          fundCode,
          currentBalance: 0,
          isRestricted,
          restrictionPurpose: restrictionPurpose.trim() || undefined,
          targetAmount: targetAmount ? Number(targetAmount) : undefined,
          color,
        });
        if (res.success && res.data) {
          onSuccess(res.data);
        } else {
          setErrorMessage(res.error?.message || 'তহবিল তৈরি ব্যর্থ হয়েছে।');
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
      <div className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text-main)]">
                {initialFund ? 'তহবিল সম্পাদনা' : 'নতুন তহবিল ও ফান্ড তৈরি (Create Fund)'}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                শরীয়ত ও হিসাবরক্ষণের নীতিমালা অনুসারে ফান্ড আইসোলেশন
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              স্ট্যান্ডার্ড ফান্ড টাইপ টেমপ্লেট
            </label>
            <select
              value={fundCode}
              onChange={(e) => handleFundCodeChange(e.target.value as FundCodeType)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.entries(FUND_TYPE_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.bn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                তহবিলের বাংলা নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameBangla}
                onChange={(e) => setNameBangla(e.target.value)}
                placeholder="যেমন: লিল্লাহ ও যাকাত তহবিল"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                ইংরেজি নাম (English Name)
              </label>
              <input
                type="text"
                value={nameEnglish}
                onChange={(e) => setNameEnglish(e.target.value)}
                placeholder="Lillah & Zakat Fund"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Restricted Checkbox */}
          <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRestrictedFund"
                checked={isRestricted}
                onChange={(e) => setIsRestricted(e.target.checked)}
                className="rounded border-[var(--color-border)] text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="isRestrictedFund" className="text-xs font-bold text-amber-900 dark:text-amber-300 cursor-pointer flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                সংরক্ষিত তহবিল (Restricted / Shariah-Designated Fund)
              </label>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-400 pl-5">
              সংরক্ষিত তহবিলের অর্থ (যেমন: যাকাত, লিল্লাহ, ভবন নির্মাণ) সাধারণ পরিচালন খরচে ব্যয় বা স্থানান্তর করতে কঠোর শরীয়তসম্মত অনুমোদন ও ফতোয়া রেফারেন্স প্রয়োজন।
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              তহবিলের নির্দিষ্ট উদ্দেশ্য ও নীতিমালা
            </label>
            <input
              type="text"
              value={restrictionPurpose}
              onChange={(e) => setRestrictionPurpose(e.target.value)}
              placeholder="যেমন: শুধুমাত্র মুস্তাহিক এতিম ও দরিদ্র ছাত্রদের খোরপোশ"
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                লক্ষ্যমাত্রা (Target BDT, ঐচ্ছিক)
              </label>
              <input
                type="number"
                min="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ৫০০০০০০"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                থিম কালার (Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-9 p-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs font-mono"
                />
              </div>
            </div>
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
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : initialFund ? 'আপডেট করুন' : 'তহবিল তৈরি করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
