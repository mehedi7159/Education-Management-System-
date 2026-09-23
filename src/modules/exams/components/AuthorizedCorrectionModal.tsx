import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Save,
  CheckCircle2,
  FileText,
  AlertTriangle,
  History,
  UserCheck,
} from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ExamMarkEntity, RoleType } from '../../../types';

interface AuthorizedCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mark: ExamMarkEntity | null;
  onCorrectionSuccess?: () => void;
}

export const AuthorizedCorrectionModal: React.FC<AuthorizedCorrectionModalProps> = ({
  isOpen,
  onClose,
  mark,
  onCorrectionSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isAuthorized =
    user?.role === RoleType.SUPER_ADMIN ||
    user?.role === RoleType.INSTITUTION_ADMIN ||
    user?.role === RoleType.MUHTAMIM;

  const [newTheory, setNewTheory] = useState<number>(mark?.theoryMarks || 0);
  const [newOral, setNewOral] = useState<number>(mark?.oralMarks || 0);
  const [newMcq, setNewMcq] = useState<number>(mark?.mcqMarks || 0);
  const [isAbsent, setIsAbsent] = useState<boolean>(mark?.isAbsent || false);
  const [reason, setReason] = useState<string>('');
  const [resolutionNo, setResolutionNo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (mark) {
      setNewTheory(mark.theoryMarks || 0);
      setNewOral(mark.oralMarks || 0);
      setNewMcq(mark.mcqMarks || 0);
      setIsAbsent(mark.isAbsent || false);
      setReason('');
      setResolutionNo('');
    }
  }, [mark]);

  if (!isOpen || !mark) return null;

  const calculatedTotal = isAbsent ? 0 : Number(newTheory) + Number(newOral) + Number(newMcq);
  const markDifference = calculatedTotal - (mark.totalObtained || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthorized) {
      showToast('অননুমোদিত প্রবেশাধিকার: শুধুমাত্র মুহতামিম বা অ্যাডমিন সংশোধন করতে পারেন।', 'error');
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      showToast('সংশোধনের সুস্পষ্ট কারণ ও রেফারেন্স উল্লেখ করা বাধ্যতামূলক।', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.authorizedCorrectionExamMark({
        markId: mark.id,
        newTheoryMarks: Number(newTheory),
        newOralMarks: Number(newOral),
        newMcqMarks: Number(newMcq),
        isAbsent,
        reason: reason.trim(),
        resolutionNo: resolutionNo.trim() || undefined,
      });

      if (res.success) {
        showToast('ফলাফল আনুষ্ঠানিকভাবে সংশোধন ও অডিট লগে রেকর্ড করা হয়েছে।', 'success');
        onCorrectionSuccess?.();
        onClose();
      } else {
        showToast(res.error?.message || 'সংশোধন সম্পন্ন হয়নি', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="authorized-correction-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="authorized-correction-modal-content"
        className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-200/40 dark:border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                লকড ফলাফল অনুমোদিত সংশোধন
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                মুহতামিম / প্রধান পরীক্ষা নিয়ন্ত্রকের বিশেষ অনুমোদন ও বাধ্যতামূলক অডিট ট্রেইল
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Warning */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            লকড বা প্রকাশিত পরীক্ষার নম্বর সাধারণ শিক্ষক পরিবর্তন করতে পারেন না। প্রতিটি সংশোধন
            সংশোধনকারীর নাম, পদবি, আইপি ও সময় সহ অপরিবর্তনীয় অডিট লগে সংরক্ষিত থাকবে।
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Student Info Card */}
          <div className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-stone-500 dark:text-stone-400">শিক্ষার্থী:</span>{' '}
              <strong className="text-stone-900 dark:text-stone-100">{mark.studentName}</strong>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">রোল নম্বর:</span>{' '}
              <strong className="text-stone-900 dark:text-stone-100">{mark.rollNo}</strong>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">বিষয়:</span>{' '}
              <strong className="text-stone-900 dark:text-stone-100">{mark.subjectName}</strong>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">বর্তমান মোট প্রাপ্ত:</span>{' '}
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {mark.totalObtained} / {mark.fullMarks}
              </span>{' '}
              ({mark.grade || '—'})
            </div>
          </div>

          {/* Absent switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
            <div>
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                অনুপস্থিত (Absent) হিসেবে চিহ্নিত করুন
              </span>
              <p className="text-[11px] text-stone-500">অনুপস্থিত চিহ্নিত করলে মোট নম্বর ০ হবে।</p>
            </div>
            <input
              type="checkbox"
              id="checkbox-correction-absent"
              checked={isAbsent}
              onChange={(e) => setIsAbsent(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
            />
          </div>

          {/* New Marks inputs */}
          {!isAbsent && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  নতুন লিখিত নম্বর
                </label>
                <input
                  type="number"
                  min="0"
                  max={mark.fullMarks}
                  value={newTheory}
                  onChange={(e) => setNewTheory(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-semibold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  নতুন মৌখিক / নাজেরা
                </label>
                <input
                  type="number"
                  min="0"
                  max={mark.fullMarks}
                  value={newOral}
                  onChange={(e) => setNewOral(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-semibold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  নতুন নৈর্ব্যক্তিক / MCQ
                </label>
                <input
                  type="number"
                  min="0"
                  max={mark.fullMarks}
                  value={newMcq}
                  onChange={(e) => setNewMcq(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-semibold text-center"
                />
              </div>
            </div>
          )}

          {/* Live Calculation preview */}
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs flex items-center justify-between">
            <span className="text-amber-900 dark:text-amber-200">
              সংশোধিত মোট নম্বর:{' '}
              <strong className="text-base text-amber-700 dark:text-amber-400">
                {calculatedTotal}
              </strong>{' '}
              / {mark.fullMarks}
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                markDifference > 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : markDifference < 0
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              পরিবর্তন: {markDifference > 0 ? `+${markDifference}` : markDifference} নম্বর
            </span>
          </div>

          {/* Audit Trail Mandatory Fields */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
              সংশোধনের সুস্পষ্ট কারণ ও যুক্তি <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="যেমন: খাতা পুনঃনিরীক্ষণে ৩ নম্বর কম ছিল যা বোর্ডে আবেদনপূর্বক যাচাইকৃত ও গৃহীত হয়েছে।"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              রেজুলেশন / মেমো নম্বর (ঐচ্ছিক)
            </label>
            <input
              type="text"
              placeholder="যেমন: RES-2025/EXAM-04"
              value={resolutionNo}
              onChange={(e) => setResolutionNo(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              বাতিল করুন
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isAuthorized}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'সংশোধন সংরক্ষিত হচ্ছে...' : 'অডিট লগ সহ সংশোধন সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
