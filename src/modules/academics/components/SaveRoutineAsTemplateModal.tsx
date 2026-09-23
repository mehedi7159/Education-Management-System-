import React, { useState } from 'react';
import {
  Bookmark,
  Sparkles,
  CheckCircle2,
  Tag,
  Clock,
  Layers,
  Info,
} from 'lucide-react';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import {
  ClassEntity,
  SectionEntity,
  ShiftEntity,
  ClassRoutineSlotEntity,
  RoutineTemplateEntity,
  RoutineTemplateSlot,
  DepartmentType,
} from '../../../types';

interface SaveRoutineAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass?: ClassEntity;
  currentSection?: SectionEntity;
  currentShift?: ShiftEntity;
  slotsToSave: ClassRoutineSlotEntity[];
  onSaved: () => void;
}

export const SaveRoutineAsTemplateModal: React.FC<SaveRoutineAsTemplateModalProps> = ({
  isOpen,
  onClose,
  currentClass,
  currentSection,
  currentShift,
  slotsToSave,
  onSaved,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState<string>(
    currentClass
      ? `${currentClass.nameBangla} - আদর্শ সময়সূচি টেমপ্লেট`
      : 'সাপ্তাহিক ক্লাস রুটিন টেমপ্লেট'
  );
  const [description, setDescription] = useState<string>(
    `${currentClass ? currentClass.nameBangla : ''}${
      currentSection ? ` (${currentSection.name})` : ''
    } এর জন্য পুনর্ব্যবহারযোগ্য সাপ্তাহিক রুটিন`
  );
  const [category, setCategory] = useState<string>(
    currentClass?.department === DepartmentType.HIFZ
      ? 'HIFZ'
      : currentClass?.department === DepartmentType.NURANI || currentClass?.department === DepartmentType.NAJERA
      ? 'NOORANI'
      : currentClass?.department === DepartmentType.KITAB || currentClass?.department === DepartmentType.DAWRA_HADITH || currentClass?.department === DepartmentType.IFTA
      ? 'QAWMI_KITAB'
      : 'GENERAL'
  );
  const [tagsString, setTagsString] = useState<string>(
    `${currentClass?.nameBangla || ''}, সেমিস্টার, আদর্শ রুটিন`
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('অনুগ্রহ করে টেমপ্লেটের নাম লিখুন', 'warning');
      return;
    }

    if (slotsToSave.length === 0) {
      showToast('টেমপ্লেট তৈরি করতে অন্তত একটি পিরিয়ড থাকা আবশ্যক', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const templateSlots: RoutineTemplateSlot[] = slotsToSave.map((slot) => ({
        dayOfWeek: slot.dayOfWeek,
        periodNumber: Number(slot.periodNumber),
        periodName: slot.periodName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subjectId: slot.subjectId,
        subjectName: slot.subjectName,
        teacherId: slot.teacherId,
        teacherName: slot.teacherName,
        roomNo: slot.roomNo,
        shiftId: slot.shiftId,
        shiftName: slot.shiftName,
        note: slot.note,
      }));

      const tags = tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Omit<RoutineTemplateEntity, 'id' | 'tenantId' | 'createdAt'> = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        classId: currentClass?.id,
        className: currentClass?.nameBangla,
        shiftId: currentShift?.id,
        shiftName: currentShift?.nameBangla,
        slots: templateSlots,
        tags,
        totalWeeklyPeriods: templateSlots.length,
      };

      const res = await api.createRoutineTemplate(payload);

      if (res.success) {
        showToast('রুটিন টেমপ্লেট সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        onSaved();
        onClose();
      } else {
        showToast(res.error?.message || 'সংরক্ষণ ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="save-routine-template-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Bookmark className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                বর্তমান রুটিন টেমপ্লেট হিসেবে সংরক্ষণ
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                ভবিষ্যতে অন্য ক্লাস বা সেমিস্টারে দ্রুত ব্যবহারের জন্য টেমপ্লেট তৈরি করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                সংগ্রহযোগ্য পিরিয়ড: {slotsToSave.length} টি
              </span>
            </div>
            {currentClass && (
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {currentClass.nameBangla}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              টেমপ্লেটের নাম: *
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: নূরানী ১ম শ্রেণি - আদর্শ রুটিন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-semibold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                বিভাগ / ক্যাটাগরি:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="NOORANI">নূরানী বিভাগ</option>
                <option value="HIFZ">হিফজুল কুরআন বিভাগ</option>
                <option value="QAWMI_KITAB">কিতাব বিভাগ (দাওরা/মেশকাত)</option>
                <option value="GENERAL">জেনারেল / স্কুল একাডেমি</option>
                <option value="CUSTOM">কাস্টম / অন্যান্য</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                ট্যাগ (কমা দিয়ে আলাদা করুন):
              </label>
              <input
                type="text"
                placeholder="যেমন: নূরানী, সেমিস্টার ১"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              বিবরণ / বর্ণনা (ঐচ্ছিক):
            </label>
            <textarea
              rows={2}
              placeholder="এই টেমপ্লেটের বৈশিষ্ট্য বা উদ্দেশ্য লিখুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors"
            >
              বাতিল
            </button>

            <button
              type="submit"
              disabled={isSaving || slotsToSave.length === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'টেমপ্লেট সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
