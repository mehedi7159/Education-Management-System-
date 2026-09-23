import React, { useState } from 'react';
import { ProjectEntity, FundEntity } from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { X, FolderPlus, Check, Target } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: ProjectEntity) => void;
  funds: FundEntity[];
  initialProject?: ProjectEntity | null;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  funds,
  initialProject,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState(initialProject?.name || '');
  const [targetAmount, setTargetAmount] = useState<number | ''>(initialProject?.targetAmount || '');
  const [fundId, setFundId] = useState(initialProject?.fundId || funds[0]?.id || '');
  const [startDate, setStartDate] = useState(initialProject?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialProject?.endDate || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [status, setStatus] = useState<'ACTIVE' | 'COMPLETED' | 'ON_HOLD'>(initialProject?.status || 'ACTIVE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('প্রকল্পের নাম উল্লেখ করুন।');
      return;
    }
    if (!targetAmount || targetAmount <= 0) {
      setErrorMessage('লক্ষ্যমাত্রা (Target Amount) সঠিক সংখ্যা দিন।');
      return;
    }

    const selectedFund = funds.find((f) => f.id === fundId);
    const fundName = selectedFund ? selectedFund.nameBangla : 'সাধারণ তহবিল';

    try {
      setIsSubmitting(true);
      if (initialProject) {
        const res = await api.updateProject(initialProject.id, {
          name: name.trim(),
          targetAmount: Number(targetAmount),
          fundId,
          fundName,
          startDate,
          endDate: endDate || undefined,
          status,
          description: description.trim() || undefined,
        });
        if (res.success && res.data) {
          onSuccess(res.data);
        } else {
          setErrorMessage(res.error?.message || 'প্রকল্প আপডেট করতে ব্যর্থ হয়েছে।');
        }
      } else {
        const res = await api.createProject({
          name: name.trim(),
          targetAmount: Number(targetAmount),
          fundId,
          fundName,
          startDate,
          endDate: endDate || undefined,
          status,
          description: description.trim() || undefined,
        });
        if (res.success && res.data) {
          onSuccess(res.data);
        } else {
          setErrorMessage(res.error?.message || 'প্রকল্প তৈরি করতে ব্যর্থ হয়েছে।');
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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text-main)]">
                {initialProject ? 'প্রকল্প সম্পাদনা' : 'নতুন উন্নয়ন বা দাতব্য প্রকল্প তৈরি (Fundraising Project)'}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                লক্ষ্যমাত্রা নির্ধারণ ও সুনির্দিষ্ট তহবিল সংযোগ
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
              প্রকল্পের নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: বহুতল হেফজখানা ও মুহাদ্দিস হল ভবন নির্মাণ"
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                আর্থিক লক্ষ্যমাত্রা (Target BDT) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="যেমন: ২৫০০০০০"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm font-bold text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                সংযুক্ত তহবিল / ফান্ড <span className="text-rose-500">*</span>
              </label>
              <select
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameBangla}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                শুরুর তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                সম্ভাব্য সমাপ্তি তারিখ
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              প্রকল্পের অবস্থা (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ACTIVE">চলমান প্রকল্প (Active)</option>
              <option value="COMPLETED">সম্পন্ন (Completed)</option>
              <option value="ON_HOLD">স্থগিত (On Hold)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              প্রকল্পের বিস্তারিত বিবরণ ও উদ্দেশ্য
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="প্রকল্পের স্থান, উপকারভোগী ছাত্র সংখ্যা এবং উন্নয়ন কাজের বিস্তার..."
              className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : initialProject ? 'আপডেট করুন' : 'প্রকল্প তৈরি করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
