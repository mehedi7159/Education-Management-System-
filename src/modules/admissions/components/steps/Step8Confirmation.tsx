import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  User,
  GraduationCap,
  Users,
  MapPin,
  Paperclip,
  Receipt,
  ShieldCheck,
  Building2,
  Phone,
  FileCheck,
  Lock,
} from 'lucide-react';
import { AdmissionFormData } from '../../../../types';
import { formatTaka, toBengaliNumerals, numberToBanglaWords, formatDate } from '../../../../utils/format';

interface Step8Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
  onGoToStep: (step: number) => void;
  isSubmitting: boolean;
}

export const Step8Confirmation: React.FC<Step8Props> = ({
  formData,
  onGoToStep,
  isSubmitting,
}) => {
  const [isAgreementChecked, setIsAgreementChecked] = useState(true);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
          ৮
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            চূড়ান্ত তথ্য যাচাই ও নিশ্চিতকরণ (Review & Confirmation)
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            ভর্তি সম্পন্ন করার আগে শিক্ষার্থীর সকল তথ্য ও অর্থনৈতিক হিসাব ভালোভাবে যাচাই করে নিন
          </p>
        </div>
      </div>

      {/* Atomic Transaction Guarantee Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-emerald-800 dark:text-emerald-300">
            নিরাপদ ডাটাবেজ ট্রানজেকশন গ্যারান্টি (Atomic Database Transaction)
          </p>
          <p className="text-emerald-700 dark:text-emerald-400/90 mt-0.5 leading-relaxed">
            কনফার্ম বাটনে চাপ দিলে স্বয়ংক্রিয়ভাবে একটি একক ডাটাবেজ ট্রানজেকশনের মাধ্যমে শিক্ষার্থীর রেকর্ড, অভিভাবকের ডাটা, ভর্তি ফি লেজার এবং মানি রসিদ একযোগে তৈরি হবে। কোনো ধাপে ত্রুটি দেখা দিলে ট্রানজেকশন সম্পূর্ণ রোলব্যাক হবে, ফলে কোনো অসম্পূর্ণ বা বিকৃত ডাটা তৈরি হবে না।
          </p>
        </div>
      </div>

      {/* Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Student Information */}
        <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[var(--color-primary)]" />
              ১. শিক্ষার্থীর পরিচিতি
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              সম্পাদনা
            </button>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={formData.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
              alt="Preview"
              className="w-14 h-16 rounded-lg object-cover border border-slate-300"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs space-y-0.5 min-w-0">
              <p className="font-bold text-[var(--color-text-main)] text-sm truncate">
                {formData.nameBangla}
              </p>
              <p className="text-[var(--color-text-muted)] truncate">{formData.nameEnglish}</p>
              <p className="text-[11px] text-[var(--color-text-subtle)]">
                জন্ম তারিখ: {formatDate(formData.dateOfBirth)} • রক্ত: {formData.bloodGroup || 'N/A'}
              </p>
              <p className="text-[11px] font-medium text-[var(--color-primary)]">
                {formData.isResidential
                  ? `আবাসিক (${formData.residenceHall || 'ছাত্রাবাস'}, রুম: ${formData.roomNo || 'N/A'})`
                  : 'অনাবাসিক'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Academic Setup */}
        <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[var(--color-primary)]" />
              ২. শ্রেণি ও রোল বিন্যাস
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              সম্পাদনা
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[var(--color-text-muted)] text-[11px]">শ্রেণি / জামাত:</span>
              <p className="font-bold text-[var(--color-text-main)]">{formData.className}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] text-[11px]">শাখা (Section):</span>
              <p className="font-bold text-[var(--color-text-main)]">{formData.sectionName}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] text-[11px]">রোল নম্বর (Roll):</span>
              <p className="font-bold text-[var(--color-primary)] text-sm">{toBengaliNumerals(formData.rollNo)}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] text-[11px]">শিক্ষাবর্ষ:</span>
              <p className="font-bold text-[var(--color-text-main)]">{formData.sessionName}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] text-[11px]">ভর্তি ফরম নং:</span>
              <p className="font-mono text-[var(--color-text-main)]">{formData.formNumber}</p>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)] text-[11px]">ভর্তি নম্বর:</span>
              <p className="font-mono text-[var(--color-text-main)]">{formData.admissionNo}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Guardian & Contacts */}
        <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--color-primary)]" />
              ৩. অভিভাবকের বিবরণ
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              সম্পাদনা
            </button>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">আইনি অভিভাবক:</span>
              <span className="font-bold text-[var(--color-text-main)]">
                {formData.guardianName} ({formData.guardianRelation})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">মোবাইল নম্বর:</span>
              <span className="font-bold text-[var(--color-primary)]">{formData.guardianMobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">পিতার নাম:</span>
              <span className="text-[var(--color-text-main)]">{formData.fatherName || 'উল্লেখ নেই'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">মাতার নাম:</span>
              <span className="text-[var(--color-text-main)]">{formData.motherName || 'উল্লেখ নেই'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Address & Documents */}
        <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
              ৪. ঠিকানা ও সংযুক্তি
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              সম্পাদনা
            </button>
          </div>

          <div className="text-xs space-y-1">
            <div>
              <span className="text-[var(--color-text-muted)] text-[11px]">বর্তমান ঠিকানা:</span>
              <p className="text-[var(--color-text-main)] line-clamp-1">
                {formData.presentAddress}, {formData.presentThana}, {formData.presentDistrict}
              </p>
            </div>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[var(--color-text-muted)]">সংযুক্ত সনদপত্র:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {toBengaliNumerals(formData.documents.length)} টি ফাইল যাচাইকৃত
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Review Card */}
      <div className="p-5 rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-surface-card)] shadow-md space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
          <h4 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[var(--color-primary)]" />
            ৫. অর্থনৈতিক বিবরণ ও রসিদ হিসাব (Final Financial Ledger)
          </h4>
          <button
            type="button"
            onClick={() => onGoToStep(7)}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
          >
            ফি পরিবর্তন করুন
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[var(--color-surface-muted)]">
            <span className="text-[11px] text-[var(--color-text-muted)] block mb-0.5">নির্ধারিত মোট ফি</span>
            <span className="text-sm font-bold text-[var(--color-text-main)]">
              {formatTaka(formData.netPayable + formData.discountAmount)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
            <span className="text-[11px] block mb-0.5">অনুমোদিত বিশেষ ছাড়</span>
            <span className="text-sm font-bold">- {formatTaka(formData.discountAmount)}</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <span className="text-[11px] block mb-0.5">জমা পরিশোধ</span>
            <span className="text-sm font-bold">{formatTaka(formData.paidAmount)}</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
            <span className="text-[11px] block mb-0.5">অবশিষ্ট বকেয়া</span>
            <span className="text-sm font-bold">{formatTaka(formData.dueAmount)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border-subtle)]">
          <div>
            পেমেন্ট মাধ্যম: <span className="font-bold text-[var(--color-text-main)]">{formData.paymentMethod}</span>
          </div>
          <div>
            কথায়: <span className="font-bold text-[var(--color-text-main)]">{numberToBanglaWords(formData.paidAmount || formData.netPayable)}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Agreement Toggle */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] flex items-center gap-3">
        <input
          type="checkbox"
          id="confirm-admission-agreement"
          checked={isAgreementChecked}
          onChange={(e) => setIsAgreementChecked(e.target.checked)}
          className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 cursor-pointer"
        />
        <label
          htmlFor="confirm-admission-agreement"
          className="text-xs font-semibold text-[var(--color-text-main)] cursor-pointer select-none leading-relaxed"
        >
          আমি প্রত্যায়ন করছি যে, শিক্ষার্থীর প্রদত্ত সকল তথ্য নির্ভুল ও সত্যায়িত। মাদ্রাসা সংবিধান ও ভর্তি নীতিমালা অনুসারে শিক্ষার্থীকে অন্তর্ভুক্ত করতে ডাটাবেজে চূড়ান্ত রেকর্ড সংরক্ষণের সম্মতি প্রদান করছি।
        </label>
      </div>
    </div>
  );
};
