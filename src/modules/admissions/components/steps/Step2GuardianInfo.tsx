import React from 'react';
import { Users, Phone, ShieldCheck, Mail, Briefcase, AlertCircle, Copy } from 'lucide-react';
import { AdmissionFormData } from '../../../../types';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';
import { Button } from '../../../../components/common/Button';

interface Step2Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
  errors: Record<string, string>;
}

export const Step2GuardianInfo: React.FC<Step2Props> = ({ formData, updateFormData, errors }) => {
  // Quick Copy Father/Mother to Guardian
  const copyFatherToGuardian = () => {
    updateFormData({
      guardianName: formData.fatherName || '',
      guardianRelation: 'পিতা',
      guardianMobile: formData.fatherMobile || '',
      guardianNid: formData.fatherNid || '',
      guardianOccupation: formData.fatherOccupation || '',
    });
  };

  const copyMotherToGuardian = () => {
    updateFormData({
      guardianName: formData.motherName || '',
      guardianRelation: 'মাতা',
      guardianMobile: formData.motherMobile || '',
      guardianNid: formData.motherNid || '',
      guardianOccupation: formData.motherOccupation || '',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
            ২
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-main)]">
              অভিভাবক ও পিতামাতার তথ্য (Guardian Information)
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              আইনি অভিভাবক ও পিতামাতার পরিচিতি, পেশা এবং জরুরি যোগাযোগ নম্বর
            </p>
          </div>
        </div>

        {/* Quick autofill helper */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyFatherToGuardian}
            className="text-xs py-1"
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            পিতার তথ্যকে অভিভাবক করুন
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyMotherToGuardian}
            className="text-xs py-1"
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            মাতার তথ্যকে অভিভাবক করুন
          </Button>
        </div>
      </div>

      {/* Primary Legal Guardian Details Card */}
      <div className="p-4 rounded-xl border-2 border-[var(--color-primary)]/30 bg-[var(--color-primary-light)]/10 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
          <h4 className="text-xs font-bold text-[var(--color-text-main)]">
            প্রধান আইনি অভিভাবকের তথ্য (Primary Guardian - এসএমএস ও নোটিশের জন্য)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              অভিভাবকের পুরো নাম <span className="text-rose-500">*</span>
            </label>
            <Input
              id="guardian-name"
              type="text"
              placeholder="যেমন: মাওলানা রফিকুল ইসলাম"
              value={formData.guardianName}
              onChange={(e) => updateFormData({ guardianName: e.target.value })}
              className={errors.guardianName ? 'border-rose-500 ring-rose-500/20' : ''}
            />
            {errors.guardianName && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.guardianName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              শিক্ষার্থীর সাথে সম্পর্ক <span className="text-rose-500">*</span>
            </label>
            <Select
              id="guardian-relation"
              value={formData.guardianRelation}
              onChange={(e) => updateFormData({ guardianRelation: e.target.value })}
            >
              <option value="পিতা">পিতা (Father)</option>
              <option value="মাতা">মাতা (Mother)</option>
              <option value="চাচা">চাচা (Uncle)</option>
              <option value="বড় ভাই">বড় ভাই (Elder Brother)</option>
              <option value="মামা">মামা (Maternal Uncle)</option>
              <option value="দাদা/নানা">দাদা / নানা (Grandfather)</option>
              <option value="অন্যান্য">অন্যান্য অভিভাবক (Other)</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              অভিভাবকের মোবাইল নম্বর <span className="text-rose-500">*</span>
            </label>
            <Input
              id="guardian-mobile"
              type="tel"
              placeholder="017XXXXXXXX"
              value={formData.guardianMobile}
              onChange={(e) => updateFormData({ guardianMobile: e.target.value })}
              className={errors.guardianMobile ? 'border-rose-500 ring-rose-500/20' : ''}
            />
            {errors.guardianMobile && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.guardianMobile}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              অভিভাবকের জাতীয় পরিচয়পত্র (NID)
            </label>
            <Input
              id="guardian-nid"
              type="text"
              placeholder="১০, ১৩ বা ১৭ ডিজিট NID"
              value={formData.guardianNid || ''}
              onChange={(e) => updateFormData({ guardianNid: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              অভিভাবকের পেশা (Occupation)
            </label>
            <Input
              id="guardian-occupation"
              type="text"
              placeholder="যেমন: ব্যবসা / শিক্ষকতা / ইমামতি"
              value={formData.guardianOccupation || ''}
              onChange={(e) => updateFormData({ guardianOccupation: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              ইমেইল অ্যাড্রেস (ঐচ্ছিক)
            </label>
            <Input
              id="guardian-email"
              type="email"
              placeholder="guardian@example.com"
              value={formData.guardianEmail || ''}
              onChange={(e) => updateFormData({ guardianEmail: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Father's Info */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-3">
        <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-primary)]" />
          পিতার বিস্তারিত তথ্য (Father's Details)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              পিতার নাম <span className="text-rose-500">*</span>
            </label>
            <Input
              id="father-name"
              type="text"
              placeholder="পিতার নাম"
              value={formData.fatherName || ''}
              onChange={(e) => updateFormData({ fatherName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              পিতার পেশা
            </label>
            <Input
              id="father-occupation"
              type="text"
              placeholder="পেশা"
              value={formData.fatherOccupation || ''}
              onChange={(e) => updateFormData({ fatherOccupation: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              পিতার মোবাইল নম্বর
            </label>
            <Input
              id="father-mobile"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={formData.fatherMobile || ''}
              onChange={(e) => updateFormData({ fatherMobile: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              পিতার এনআইডি (NID)
            </label>
            <Input
              id="father-nid"
              type="text"
              placeholder="এনআইডি নম্বর"
              value={formData.fatherNid || ''}
              onChange={(e) => updateFormData({ fatherNid: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Mother's Info */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-3">
        <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-primary)]" />
          মাতার বিস্তারিত তথ্য (Mother's Details)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              মাতার নাম
            </label>
            <Input
              id="mother-name"
              type="text"
              placeholder="মাতার নাম"
              value={formData.motherName || ''}
              onChange={(e) => updateFormData({ motherName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              মাতার পেশা
            </label>
            <Input
              id="mother-occupation"
              type="text"
              placeholder="যেমন: গৃহিণী / শিক্ষিকা"
              value={formData.motherOccupation || ''}
              onChange={(e) => updateFormData({ motherOccupation: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              মাতার মোবাইল নম্বর
            </label>
            <Input
              id="mother-mobile"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={formData.motherMobile || ''}
              onChange={(e) => updateFormData({ motherMobile: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              মাতার এনআইডি (NID)
            </label>
            <Input
              id="mother-nid"
              type="text"
              placeholder="এনআইডি নম্বর"
              value={formData.motherNid || ''}
              onChange={(e) => updateFormData({ motherNid: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            জরুরি যোগাযোগের ব্যক্তির নাম (Emergency Contact)
          </label>
          <Input
            id="emergency-contact-name"
            type="text"
            placeholder="নাম"
            value={formData.emergencyContactName || ''}
            onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            জরুরি মোবাইল নম্বর
          </label>
          <Input
            id="emergency-contact-phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            সম্পর্ক (Relation)
          </label>
          <Input
            id="emergency-contact-rel"
            type="text"
            placeholder="যেমন: মামা / বড় ভাই"
            value={formData.emergencyContactRelation || ''}
            onChange={(e) => updateFormData({ emergencyContactRelation: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
