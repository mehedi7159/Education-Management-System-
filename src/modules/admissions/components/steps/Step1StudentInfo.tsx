import React from 'react';
import { User, Calendar, Droplets, Heart, Shield, Building2, Bed, AlertCircle } from 'lucide-react';
import { AdmissionFormData } from '../../../../types';
import { BLOOD_GROUPS } from '../../../../constants';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';
import { toBengaliNumerals } from '../../../../utils/format';

interface Step1Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
  errors: Record<string, string>;
}

export const Step1StudentInfo: React.FC<Step1Props> = ({ formData, updateFormData, errors }) => {
  // Calculate approximate age from DOB
  const calculateAge = (dobString: string): string => {
    if (!dobString) return '';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }
    return `${toBengaliNumerals(years)} বছর ${toBengaliNumerals(months)} মাস`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
          ১
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            শিক্ষার্থীর ব্যক্তিগত ও সাধারণ তথ্য (Student Information)
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            শিক্ষার্থীর নাম, জন্ম তারিখ, রক্তের গ্রুপ ও আবাসিক সম্পর্কিত তথ্য দিন
          </p>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            শিক্ষার্থীর পুরো নাম (বাংলা) <span className="text-rose-500">*</span>
          </label>
          <Input
            id="student-name-bn"
            type="text"
            placeholder="যেমন: মুহাম্মদ আবদুল্লাহ"
            value={formData.nameBangla}
            onChange={(e) => updateFormData({ nameBangla: e.target.value })}
            className={errors.nameBangla ? 'border-rose-500 ring-rose-500/20' : ''}
          />
          {errors.nameBangla && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.nameBangla}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            Student Full Name (English) <span className="text-rose-500">*</span>
          </label>
          <Input
            id="student-name-en"
            type="text"
            placeholder="e.g. Muhammad Abdullah"
            value={formData.nameEnglish}
            onChange={(e) => updateFormData({ nameEnglish: e.target.value })}
            className={errors.nameEnglish ? 'border-rose-500 ring-rose-500/20' : ''}
          />
          {errors.nameEnglish && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.nameEnglish}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            الاسم الكامل بالعربية (নাম আরবিতে - ঐচ্ছিক)
          </label>
          <Input
            id="student-name-ar"
            type="text"
            dir="rtl"
            placeholder="مثال: محمد عبد الله"
            value={formData.nameArabic || ''}
            onChange={(e) => updateFormData({ nameArabic: e.target.value })}
          />
        </div>
      </div>

      {/* Gender, DOB, Age & Blood Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            লিঙ্গ / Gender <span className="text-rose-500">*</span>
          </label>
          <Select
            id="student-gender"
            value={formData.gender}
            onChange={(e) => updateFormData({ gender: e.target.value as 'MALE' | 'FEMALE' })}
          >
            <option value="MALE">ছাত্র (Male)</option>
            <option value="FEMALE">ছাত্রী (Female)</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            জন্ম তারিখ / Date of Birth <span className="text-rose-500">*</span>
          </label>
          <Input
            id="student-dob"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            className={errors.dateOfBirth ? 'border-rose-500 ring-rose-500/20' : ''}
          />
          {formData.dateOfBirth && (
            <p className="text-[11px] text-[var(--color-primary)] font-medium mt-1">
              বয়স: {calculateAge(formData.dateOfBirth)}
            </p>
          )}
          {errors.dateOfBirth && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            রক্তের গ্রুপ / Blood Group
          </label>
          <Select
            id="student-blood-group"
            value={formData.bloodGroup}
            onChange={(e) => updateFormData({ bloodGroup: e.target.value })}
          >
            <option value="">নির্বাচন করুন</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            ধর্ম / Religion
          </label>
          <Input
            id="student-religion"
            type="text"
            value={formData.religion || 'ইসলাম'}
            onChange={(e) => updateFormData({ religion: e.target.value })}
          />
        </div>
      </div>

      {/* Birth Certificate & Previous Institution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            জন্ম নিবন্ধন নম্বর (১৭ ডিজিট)
          </label>
          <Input
            id="student-birth-cert"
            type="text"
            placeholder="যেমন: 20142692019283746"
            value={formData.birthCertificateNo || ''}
            onChange={(e) => updateFormData({ birthCertificateNo: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            পূর্ববর্তী শিক্ষা প্রতিষ্ঠান / মাদ্রাসা
          </label>
          <Input
            id="student-prev-inst"
            type="text"
            placeholder="পূর্ববর্তী মাদ্রাসা বা স্কুলের নাম"
            value={formData.previousInstitution || ''}
            onChange={(e) => updateFormData({ previousInstitution: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            পূর্বের শ্রেণি ও ফলাফল
          </label>
          <Input
            id="student-prev-result"
            type="text"
            placeholder="যেমন: নুরানী ৩য় শ্রেণি (মুমতাজ)"
            value={formData.previousResult || ''}
            onChange={(e) => updateFormData({ previousResult: e.target.value })}
          />
        </div>
      </div>

      {/* Residential Setup */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-main)]">
                আবাসিক / অনাবাসিক ব্যবস্থা (Residential Status)
              </h4>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                ছাত্র মাদ্রাসার ছাত্রাবাস বা বোর্ডিংয়ে অবস্থান করবে কিনা
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="is-residential-toggle"
              checked={formData.isResidential}
              onChange={(e) => updateFormData({ isResidential: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            <span className="ml-3 text-xs font-bold text-[var(--color-text-main)]">
              {formData.isResidential ? 'আবাসিক (Residential)' : 'অনাবাসিক (Non-Residential)'}
            </span>
          </label>
        </div>

        {formData.isResidential && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--color-border-subtle)] animate-fadeIn">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                ছাত্রাবাস / হলের নাম
              </label>
              <Input
                id="residence-hall"
                type="text"
                placeholder="যেমন: হযরত আবু বকর (রা.) হল"
                value={formData.residenceHall || ''}
                onChange={(e) => updateFormData({ residenceHall: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                কক্ষ নম্বর (Room No)
              </label>
              <Input
                id="residence-room"
                type="text"
                placeholder="যেমন: ৩০২"
                value={formData.roomNo || ''}
                onChange={(e) => updateFormData({ roomNo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                খাট / সিট নম্বর (Bed/Seat No)
              </label>
              <Input
                id="residence-bed"
                type="text"
                placeholder="যেমন: খাট-২ (উপরের সিট)"
                value={formData.bedNo || ''}
                onChange={(e) => updateFormData({ bedNo: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Health & Medical Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            শারীরিক অবস্থা / স্বাস্থ্যগত নোট (Medical / Allergy Notes)
          </label>
          <Input
            id="student-medical-notes"
            type="text"
            placeholder="বিশেষ কোনো শারীরিক অসুস্থতা, এলার্জি বা নিয়মিত ওষুধের তথ্য থাকলে লিখুন"
            value={formData.medicalNotes || ''}
            onChange={(e) => updateFormData({ medicalNotes: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            অধ্যক্ষ / মুহতামিমের বিশেষ মন্তব্য (General Remarks)
          </label>
          <Input
            id="student-general-notes"
            type="text"
            placeholder="ভর্তি বিষয়ক বিশেষ কোনো নির্দেশনা বা মন্তব্য"
            value={formData.generalNotes || ''}
            onChange={(e) => updateFormData({ generalNotes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
