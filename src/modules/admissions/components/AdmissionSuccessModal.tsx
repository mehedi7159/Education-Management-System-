import React from 'react';
import {
  CheckCircle2,
  Printer,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { AdmissionTransactionResult } from '../../../types';
import { Button } from '../../../components/common/Button';
import { formatTaka, toBengaliNumerals, formatDate } from '../../../utils/format';

interface SuccessModalProps {
  result: AdmissionTransactionResult;
  onPrintReceipt: () => void;
  onPrintForm: () => void;
  onResetForNewAdmission: () => void;
  onGoToStudents: () => void;
}

export const AdmissionSuccessModal: React.FC<SuccessModalProps> = ({
  result,
  onPrintReceipt,
  onPrintForm,
  onResetForNewAdmission,
  onGoToStudents,
}) => {
  const { student, receipt, feeRecord, transaction } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[var(--color-surface-card)] rounded-2xl border-2 border-emerald-500 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            আলহামদুলিল্লাহ! ভর্তি প্রক্রিয়া সফলভাবে সম্পন্ন হয়েছে
          </h2>
          <p className="text-emerald-100 text-xs mt-1">
            শিক্ষার্থী ও অভিভাবকের ডাটাবেজ রেকর্ড, ভর্তি ফি এবং মানি রসিদ ট্রানজেকশন সফলভাবে অন্তর্ভুক্ত হয়েছে।
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-mono mt-3 text-emerald-50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            ট্রানজেকশন আইডি: {result.auditLogId}
          </div>
        </div>

        {/* Details Card */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)]">
            <img
              src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
              alt={student.nameBangla}
              className="w-16 h-20 rounded-lg object-cover border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 space-y-1">
              <h3 className="text-base font-bold text-[var(--color-text-main)] truncate">
                {student.nameBangla}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{student.nameEnglish}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2 py-0.5 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold">
                  শ্রেণি: {student.className}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  রোল: {toBengaliNumerals(student.rollNo)}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                  আইডি: {student.studentIdCardNo}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]">
              <span className="text-[11px] text-[var(--color-text-muted)] block">ভর্তি নম্বর</span>
              <span className="font-bold font-mono text-[var(--color-text-main)]">{student.admissionNo}</span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]">
              <span className="text-[11px] text-[var(--color-text-muted)] block">রসিদ নম্বর</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{receipt.receiptNo}</span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]">
              <span className="text-[11px] text-[var(--color-text-muted)] block">পরিশোধিত ফি</span>
              <span className="font-bold text-[var(--color-text-main)]">{formatTaka(receipt.paidAmount)}</span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)]">
              <span className="text-[11px] text-[var(--color-text-muted)] block">অবশিষ্ট বকেয়া</span>
              <span className={`font-bold ${receipt.dueAmount > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                {formatTaka(receipt.dueAmount)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onPrintReceipt}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold w-full"
            >
              <Printer className="w-4 h-4 mr-2" />
              মানি রসিদ প্রিন্ট করুন (৩ কপি)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onPrintForm}
              className="w-full font-semibold"
            >
              <FileText className="w-4 h-4 mr-2 text-sky-500" />
              ভর্তি আবেদন ফরম প্রিন্ট
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onResetForNewAdmission}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              অন্য শিক্ষার্থীর নতুন ভর্তি শুরু করুন
            </button>

            <button
              type="button"
              onClick={onGoToStudents}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              শিক্ষার্থী তালিকায় যান <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
