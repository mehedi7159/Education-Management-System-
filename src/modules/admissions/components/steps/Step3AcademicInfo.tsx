import React, { useEffect } from 'react';
import {
  GraduationCap,
  Hash,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  AdmissionFormData,
  ClassEntity,
  SectionEntity,
  AcademicSession,
  ShiftEntity,
  DepartmentType,
  AdmissionType,
} from '../../../../types';
import { DEPARTMENT_LABELS } from '../../../../constants';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';
import { Button } from '../../../../components/common/Button';
import { toBengaliNumerals } from '../../../../utils/format';

interface Step3Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
  classes: ClassEntity[];
  sections: SectionEntity[];
  sessions: AcademicSession[];
  shifts: ShiftEntity[];
  errors: Record<string, string>;
  onAutoSuggestRoll: () => void;
}

export const Step3AcademicInfo: React.FC<Step3Props> = ({
  formData,
  updateFormData,
  classes,
  sections,
  sessions,
  shifts,
  errors,
  onAutoSuggestRoll,
}) => {
  // Filter sections by chosen class
  const availableSections = sections.filter((s) => s.classId === formData.classId);

  // Auto select first section when class changes if current section invalid
  const handleClassChange = (newClassId: string) => {
    const selectedClass = classes.find((c) => c.id === newClassId);
    const validSections = sections.filter((s) => s.classId === newClassId);
    const firstSection = validSections[0];

    updateFormData({
      classId: newClassId,
      className: selectedClass ? selectedClass.nameBangla : '',
      department: selectedClass ? selectedClass.department : formData.department,
      sectionId: firstSection ? firstSection.id : '',
      sectionName: firstSection ? firstSection.name : '',
    });
  };

  const handleSectionChange = (newSectionId: string) => {
    const selectedSec = sections.find((s) => s.id === newSectionId);
    updateFormData({
      sectionId: newSectionId,
      sectionName: selectedSec ? selectedSec.name : '',
    });
  };

  const handleSessionChange = (newSessionId: string) => {
    const selectedSess = sessions.find((s) => s.id === newSessionId);
    updateFormData({
      sessionId: newSessionId,
      sessionName: selectedSess ? selectedSess.name : '',
    });
  };

  const handleShiftChange = (newShiftId: string) => {
    const selectedShift = shifts.find((s) => s.id === newShiftId);
    updateFormData({
      shiftId: newShiftId,
      shiftName: selectedShift ? selectedShift.nameBangla : '',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
          ৩
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            একাডেমিক তথ্য ও শ্রেণি বিন্যাস (Academic Information)
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            ভর্তির ধরন, শিক্ষাবর্ষ, বিভাগ, জামাত/শ্রেণি, শাখা এবং রোল নম্বর নির্ধারণ করুন
          </p>
        </div>
      </div>

      {/* Admission Type, Session, Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            ভর্তির ধরন (Admission Type) <span className="text-rose-500">*</span>
          </label>
          <Select
            id="admission-type"
            value={formData.admissionType}
            onChange={(e) => updateFormData({ admissionType: e.target.value as AdmissionType })}
          >
            <option value={AdmissionType.NEW_ADMISSION}>নতুন ভর্তি (New Admission)</option>
            <option value={AdmissionType.READMISSION}>পুনঃভর্তি (Re-admission)</option>
            <option value={AdmissionType.TRANSFER_IN}>ছাড়পত্র নিয়ে ভর্তি (Transfer In)</option>
            <option value={AdmissionType.PROMOTION}>উত্তীর্ণ হয়ে ভর্তি (Promotion)</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            শিক্ষাবর্ষ (Academic Session) <span className="text-rose-500">*</span>
          </label>
          <Select
            id="academic-session"
            value={formData.sessionId}
            onChange={(e) => handleSessionChange(e.target.value)}
            className={errors.sessionId ? 'border-rose-500 ring-rose-500/20' : ''}
          >
            {sessions.map((sess) => (
              <option key={sess.id} value={sess.id}>
                {sess.name} {sess.isCurrent ? '(চলতি শিক্ষাবর্ষ)' : ''}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            ভর্তির তারিখ (Admission Date) <span className="text-rose-500">*</span>
          </label>
          <Input
            id="admission-date"
            type="date"
            value={formData.admissionDate}
            onChange={(e) => updateFormData({ admissionDate: e.target.value })}
            className={errors.admissionDate ? 'border-rose-500 ring-rose-500/20' : ''}
          />
        </div>
      </div>

      {/* Department, Class, Section & Shift */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            বিভাগ (Department) <span className="text-rose-500">*</span>
          </label>
          <Select
            id="academic-department"
            value={formData.department}
            onChange={(e) => updateFormData({ department: e.target.value as DepartmentType })}
          >
            {Object.entries(DEPARTMENT_LABELS).map(([depKey, labelObj]) => (
              <option key={depKey} value={depKey}>
                {labelObj.bn}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            শ্রেণি / জামাত (Class) <span className="text-rose-500">*</span>
          </label>
          <Select
            id="academic-class"
            value={formData.classId}
            onChange={(e) => handleClassChange(e.target.value)}
            className={errors.classId ? 'border-rose-500 ring-rose-500/20' : ''}
          >
            <option value="">শ্রেণি নির্বাচন করুন</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.nameBangla}
              </option>
            ))}
          </Select>
          {errors.classId && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.classId}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            শাখা (Section) <span className="text-rose-500">*</span>
          </label>
          <Select
            id="academic-section"
            value={formData.sectionId}
            onChange={(e) => handleSectionChange(e.target.value)}
            disabled={!formData.classId || availableSections.length === 0}
            className={errors.sectionId ? 'border-rose-500 ring-rose-500/20' : ''}
          >
            {availableSections.length === 0 ? (
              <option value="">কোনো শাখা পাওয়া যায়নি</option>
            ) : (
              availableSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} (ক্যাপাসিটি: {sec.capacity})
                </option>
              ))
            )}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            শিফট (Shift)
          </label>
          <Select
            id="academic-shift"
            value={formData.shiftId || ''}
            onChange={(e) => handleShiftChange(e.target.value)}
          >
            <option value="">ডিফল্ট শিফট</option>
            {shifts.map((sh) => (
              <option key={sh.id} value={sh.id}>
                {sh.nameBangla}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Roll Number with Auto-suggest */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-[var(--color-primary)]" />
              রোল নম্বর নির্ধারণ (Roll Number Assignment)
            </h4>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              নির্বাচিত শ্রেণি ও শাখার পরবর্তী খালি রোল নম্বর স্বয়ংক্রিয়ভাবে নির্ধারণ করুন
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAutoSuggestRoll}
            className="text-xs py-1"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
            পরবর্তী রোল ক্যালকুলেট করুন
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              রোল নম্বর (Roll No) <span className="text-rose-500">*</span>
            </label>
            <Input
              id="student-roll-no"
              type="number"
              min="1"
              value={formData.rollNo || ''}
              onChange={(e) => updateFormData({ rollNo: parseInt(e.target.value, 10) || 1 })}
              className={errors.rollNo ? 'border-rose-500 ring-rose-500/20' : ''}
            />
            {formData.rollNo > 0 && (
              <span className="text-[11px] text-[var(--color-text-subtle)] font-medium">
                বাংলায়: {toBengaliNumerals(formData.rollNo)}
              </span>
            )}
            {errors.rollNo && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.rollNo}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              ভর্তি ফরম নম্বর (Form Number)
            </label>
            <Input
              id="admission-form-number"
              type="text"
              value={formData.formNumber}
              onChange={(e) => updateFormData({ formNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              ভর্তি নম্বর (Admission No)
            </label>
            <Input
              id="admission-number"
              type="text"
              value={formData.admissionNo}
              onChange={(e) => updateFormData({ admissionNo: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              দাখিলা নম্বর (Dakhila / Reg No)
            </label>
            <Input
              id="dakhila-number"
              type="text"
              placeholder="কওমি ট্র্যাকিং কোড"
              value={formData.dakhilaNo || ''}
              onChange={(e) => updateFormData({ dakhilaNo: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
