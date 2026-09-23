import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Sparkles,
  CheckCircle2,
  Copy,
  Trash2,
  Eye,
  ArrowRight,
  Layers,
  BookOpen,
  Calendar,
  Clock,
  Building,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Plus,
  Tag,
  Check,
} from 'lucide-react';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import {
  ClassEntity,
  SectionEntity,
  ShiftEntity,
  AcademicSession,
  RoutineTemplateEntity,
  RoutinePeriod,
  DayOfWeek,
  StaffEntity,
} from '../../../types';
import { DAY_NAMES_SHORT_BN, DAY_NAMES_BN } from '../../../utils/routineConflictDetector';

interface RoutineTemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassEntity[];
  sections: SectionEntity[];
  shifts: ShiftEntity[];
  teachers: StaffEntity[];
  activeSession?: AcademicSession;
  periods: RoutinePeriod[];
  days: DayOfWeek[];
  onTemplateApplied: () => void;
  currentClassId?: string;
}

export const RoutineTemplateManagerModal: React.FC<RoutineTemplateManagerModalProps> = ({
  isOpen,
  onClose,
  classes,
  sections,
  shifts,
  teachers,
  activeSession,
  periods,
  days,
  onTemplateApplied,
  currentClassId,
}) => {
  const { showToast } = useToast();

  const [templates, setTemplates] = useState<RoutineTemplateEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Apply options state
  const [targetClassId, setTargetClassId] = useState<string>(currentClassId || classes[0]?.id || '');
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [targetShiftId, setTargetShiftId] = useState<string>('');
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(true);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Filter & Search state
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch templates
  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await api.getRoutineTemplates();
      if (res.success && res.data) {
        setTemplates(res.data);
        if (!selectedTemplateId && res.data.length > 0) {
          setSelectedTemplateId(res.data[0].id);
        }
      }
    } catch (err: any) {
      showToast('টেমপ্লেট তালিকা লোড করতে ব্যর্থ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      if (currentClassId) {
        setTargetClassId(currentClassId);
      }
    }
  }, [isOpen, currentClassId]);

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const filteredTemplates = templates.filter((t) => {
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      return matchName || matchDesc || matchTags;
    }
    return true;
  });

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) {
      showToast('অনুগ্রহ করে একটি টেমপ্লেট নির্বাচন করুন', 'warning');
      return;
    }
    if (!targetClassId) {
      showToast('অনুগ্রহ করে টার্গেট জামাত নির্বাচন করুন', 'warning');
      return;
    }

    const targetClass = classes.find((c) => c.id === targetClassId);
    const targetSection = sections.find((s) => s.id === targetSectionId);
    const targetShift = shifts.find((s) => s.id === targetShiftId);

    if (
      overwriteExisting &&
      !window.confirm(
        `সতর্কতা: '${targetClass?.nameBangla}' জামাতের বর্তমান রুটিনের স্লটগুলো প্রতিস্থাপিত (Overwrite) হবে। আপনি কি নিশ্চিত?`
      )
    ) {
      return;
    }

    setIsApplying(true);
    try {
      const res = await api.applyRoutineTemplate(selectedTemplate.id, {
        targetClassId,
        targetClassName: targetClass?.nameBangla || targetClass?.nameEnglish || 'জামাত',
        targetSectionId: targetSectionId || undefined,
        targetSectionName: (targetSection as any)?.nameBangla || targetSection?.name,
        targetShiftId: targetShiftId || undefined,
        targetShiftName: targetShift?.nameBangla,
        targetSessionId: activeSession?.id,
        overwriteExisting,
      });

      if (res.success) {
        showToast(
          res.message ||
            `টেমপ্লেট '${selectedTemplate.name}' সফলভাবে ${targetClass?.nameBangla} জামাতে প্রয়োগ করা হয়েছে!`,
          'success'
        );
        onTemplateApplied();
        onClose();
      } else {
        showToast(res.error?.message || 'টেমপ্লেট প্রয়োগ ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!window.confirm(`আপনি কি '${templateName}' টেমপ্লেটটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await api.deleteRoutineTemplate(templateId);
      if (res.success) {
        showToast('টেমপ্লেটটি মুছে ফেলা হয়েছে', 'success');
        await loadTemplates();
      } else {
        showToast(res.error?.message || 'মুছতে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    }
  };

  return (
    <div
      id="routine-template-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-5xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-stone-800/80 dark:to-stone-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Bookmark className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  রুটিন টেমপ্লেট সিস্টেম (Routine Templates)
                </h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  পুনর্ব্যবহারযোগ্য সময়সূচি
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                নতুন শিক্ষাবর্ষ ও সেমিস্টারের জন্য প্রস্তুতকৃত আদর্শ রুটিন নির্বাচন ও এক ক্লিকে প্রয়োগ করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        {/* Modal Main Content (2-Column Layout) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-800 min-h-0">
          {/* Left Column: Template List & Filters (4 cols) */}
          <div className="lg:col-span-5 p-4 flex flex-col h-full overflow-hidden bg-stone-50/50 dark:bg-stone-900/50">
            {/* Category tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-xl mb-3 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  categoryFilter === 'ALL'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                সব ({templates.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('NOORANI')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  categoryFilter === 'NOORANI'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                নূরানী
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('HIFZ')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  categoryFilter === 'HIFZ'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                হিফজ
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('QAWMI_KITAB')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  categoryFilter === 'QAWMI_KITAB'
                    ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                কিতাব বিভাগ
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="টেমপ্লেটের নাম বা ট্যাগ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Template Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>টেমপ্লেট তালিকা লোড হচ্ছে...</span>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl">
                  কোনো রুটিন টেমপ্লেট পাওয়া যায়নি।
                </div>
              ) : (
                filteredTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700/80 hover:border-emerald-300 dark:hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                              {template.name}
                            </span>
                            {template.isDefault && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                                প্রিসেট
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <span className="p-1 rounded-full bg-emerald-600 text-white shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-[10px] text-stone-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                          <Clock className="w-3 h-3" />
                          সাপ্তাহিক {template.slots ? template.slots.length : 0} টি পিরিয়ড
                        </span>

                        {!template.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id, template.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                            title="টেমপ্লেট মুছুন"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Template Preview & Apply Settings (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col h-full overflow-hidden bg-white dark:bg-stone-900">
            {selectedTemplate ? (
              <div className="flex flex-col h-full overflow-hidden space-y-4">
                {/* Template Info & Action Bar */}
                <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{selectedTemplate.name}</span>
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {selectedTemplate.description || 'আদর্শ সাপ্তাহিক ক্লাস রুটিন টেমপ্লেট'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                        মোট {selectedTemplate.slots ? selectedTemplate.slots.length : 0} টি পিরিয়ড
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {selectedTemplate.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                        >
                          <Tag className="w-2.5 h-2.5 text-stone-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Apply Target Configuration Form */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>এই টেমপ্লেটটি কোথায় প্রয়োগ করতে চান?</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        টার্গেট জামাত: *
                      </label>
                      <select
                        id="template-target-class"
                        value={targetClassId}
                        onChange={(e) => setTargetClassId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.nameBangla}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        টার্গেট শাখা:
                      </label>
                      <select
                        id="template-target-section"
                        value={targetSectionId}
                        onChange={(e) => setTargetSectionId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">মূল শাখা / কোনো শাখা নেই</option>
                        {sections
                          .filter((s) => s.classId === targetClassId)
                          .map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {(sec as any).nameBangla || sec.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        টার্গেট শিফট:
                      </label>
                      <select
                        id="template-target-shift"
                        value={targetShiftId}
                        onChange={(e) => setTargetShiftId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">সাধারণ শিফট</option>
                        {shifts.map((sh) => (
                          <option key={sh.id} value={sh.id}>
                            {sh.nameBangla}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 dark:text-stone-300">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>বর্তমান রুটিনের স্লটগুলো প্রতিস্থাপন (Overwrite) করুন</span>
                    </label>

                    <button
                      id="btn-apply-template-confirm"
                      type="button"
                      disabled={isApplying || !targetClassId}
                      onClick={handleApplyTemplate}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isApplying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>প্রয়োগ করা হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>রুটিনে প্রয়োগ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Template Schedule Preview Grid */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      টেমপ্লেট প্রিভিউ গ্রিড
                    </span>
                    <span className="text-[10px] text-stone-400">
                      * প্রয়োগ করার সময় স্বয়ংক্রিয়ভাবে শিক্ষক ও রুম কনফ্লিক্ট যাচাই হবে
                    </span>
                  </div>

                  <div className="flex-1 overflow-auto border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-900/50">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[550px]">
                      <thead>
                        <tr className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 font-bold sticky top-0 z-10">
                          <th className="p-2 border-r border-stone-200 dark:border-stone-700 w-24 text-center">
                            বার / দিন
                          </th>
                          {periods.map((period) => (
                            <th
                              key={period.periodNumber}
                              className="p-2 text-center border-r border-stone-200 dark:border-stone-700 min-w-[90px]"
                            >
                              <div className="font-bold">{period.periodName}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                        {days.map((day) => (
                          <tr key={day} className="hover:bg-stone-100/50 dark:hover:bg-stone-800/30">
                            <td className="p-2 font-bold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-800/40 text-center text-xs">
                              {DAY_NAMES_SHORT_BN[day]}
                            </td>
                            {periods.map((period) => {
                              const slot = selectedTemplate.slots?.find(
                                (s) => s.dayOfWeek === day && s.periodNumber === period.periodNumber
                              );
                              return (
                                <td
                                  key={period.periodNumber}
                                  className="p-1.5 border-r border-stone-200 dark:border-stone-800 align-top text-center"
                                >
                                  {slot ? (
                                    <div className="p-1.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-left">
                                      <div className="font-bold text-[10px] text-emerald-950 dark:text-emerald-200 truncate">
                                        {slot.subjectName}
                                      </div>
                                      {slot.teacherName && (
                                        <div className="text-[9px] text-stone-600 dark:text-stone-300 truncate">
                                          {slot.teacherName}
                                        </div>
                                      )}
                                      {slot.roomNo && (
                                        <div className="text-[8px] text-stone-400 font-mono">
                                          {slot.roomNo}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-stone-300 dark:text-stone-700 text-[10px]">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                বাম পাশের তালিকা থেকে একটি রুটিন টেমপ্লেট নির্বাচন করুন
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            রুটিন টেমপ্লেট যেকোনো সময় বর্তমান ক্লাস থেকে তৈরি বা আপডেট করা যায়
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
