import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Printer,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Building,
  GraduationCap,
  Layers,
  Filter,
  CheckCircle2,
  Sparkles,
  Search,
  BookOpen,
  Info,
  Move,
  FileText,
} from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  ClassEntity,
  SectionEntity,
  StaffEntity,
  SubjectEntity,
  ShiftEntity,
  AcademicSession,
  ClassRoutineSlotEntity,
  RoutinePeriod,
  DayOfWeek,
  RoutineConflict,
  RoleType,
} from '../../../types';
import {
  detectRoutineConflicts,
  DAY_NAMES_SHORT_BN,
  DAY_NAMES_BN,
} from '../../../utils/routineConflictDetector';
import { RoutineConflictModal } from './RoutineConflictModal';
import { WeeklyRoutineMatrix } from './WeeklyRoutineMatrix';
import { PrintableRoutineView } from './PrintableRoutineView';
import { RoutineTemplateManagerModal } from './RoutineTemplateManagerModal';
import { SaveRoutineAsTemplateModal } from './SaveRoutineAsTemplateModal';
import { Bookmark, BookmarkPlus } from 'lucide-react';

interface RoutineBuilderTabProps {
  classes: ClassEntity[];
  sections: SectionEntity[];
  shifts?: ShiftEntity[];
  subjects: SubjectEntity[];
  teachers: StaffEntity[];
  sessions?: AcademicSession[];
  initialClassId?: string;
}

const DEFAULT_DAYS: DayOfWeek[] = [
  'SATURDAY',
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
];

const DEFAULT_PERIODS: RoutinePeriod[] = [
  { periodNumber: 1, periodName: '১ম ঘণ্টা', startTime: '08:00', endTime: '08:45' },
  { periodNumber: 2, periodName: '২য় ঘণ্টা', startTime: '08:45', endTime: '09:30' },
  { periodNumber: 3, periodName: '৩য় ঘণ্টা', startTime: '09:30', endTime: '10:15' },
  { periodNumber: 4, periodName: '৪র্থ ঘণ্টা', startTime: '10:15', endTime: '11:00' },
  { periodNumber: 5, periodName: '৫ম ঘণ্টা', startTime: '11:30', endTime: '12:15' },
  { periodNumber: 6, periodName: '৬ষ্ঠ ঘণ্টা', startTime: '12:15', endTime: '01:00' },
];

export const RoutineBuilderTab: React.FC<RoutineBuilderTabProps> = ({
  classes,
  sections,
  shifts = [],
  subjects,
  teachers,
  sessions = [],
  initialClassId,
}) => {
  const { tenant, user, hasPermission } = useAuth();
  const { showToast } = useToast();

  const canManage =
    user?.role === RoleType.SUPER_ADMIN ||
    user?.role === RoleType.INSTITUTION_ADMIN ||
    user?.role === RoleType.MUHTAMIM ||
    hasPermission('MANAGE_CLASSES' as any);

  // View Mode: Class-wise, Weekly Matrix, Teacher-wise, Room-wise
  const [viewMode, setViewMode] = useState<'CLASS' | 'WEEKLY_MATRIX' | 'TEACHER' | 'ROOM'>('CLASS');

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes.length > 0 ? classes[0].id : '')
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('ALL');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers.length > 0 ? teachers[0].id : ''
  );
  const [selectedRoomNo, setSelectedRoomNo] = useState<string>('');

  // Routine slots data
  const [allRoutineSlots, setAllRoutineSlots] = useState<ClassRoutineSlotEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit / Add Modal State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Form State
  const [formClassId, setFormClassId] = useState<string>('');
  const [formSectionId, setFormSectionId] = useState<string>('');
  const [formShiftId, setFormShiftId] = useState<string>('');
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formRoomNo, setFormRoomNo] = useState<string>('');
  const [formDayOfWeek, setFormDayOfWeek] = useState<DayOfWeek>('SATURDAY');
  const [formPeriodNumber, setFormPeriodNumber] = useState<number>(1);
  const [formStartTime, setFormStartTime] = useState<string>('08:00');
  const [formEndTime, setFormEndTime] = useState<string>('08:45');
  const [formNote, setFormNote] = useState<string>('');

  // Drag and Drop State
  const [draggedSlot, setDraggedSlot] = useState<ClassRoutineSlotEntity | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  // Conflict Modal State
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [activeConflicts, setActiveConflicts] = useState<RoutineConflict[]>([]);
  const [candidateConflictSlot, setCandidateConflictSlot] = useState<Partial<ClassRoutineSlotEntity>>({});

  // Printable View Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Routine Template Modals State
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);

  // Fetch all routine slots
  const loadRoutines = async () => {
    setIsLoading(true);
    try {
      const res = await api.getClassRoutines();
      if (res.success && res.data) {
        setAllRoutineSlots(res.data);
      }
    } catch (err: any) {
      showToast('রুটিন তথ্য লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [tenant.id]);

  // Available rooms list gathered from existing classes, sections, and slots
  const availableRooms = useMemo(() => {
    const roomSet = new Set<string>();
    classes.forEach((c) => {
      if ((c as any).roomNumber) roomSet.add((c as any).roomNumber);
      if ((c as any).roomNo) roomSet.add((c as any).roomNo);
    });
    sections.forEach((s) => {
      if (s.roomNumber) roomSet.add(s.roomNumber);
    });
    allRoutineSlots.forEach((slot) => {
      if (slot.roomNo && slot.roomNo.trim()) roomSet.add(slot.roomNo.trim());
    });
    if (roomSet.size === 0) {
      ['কক্ষ ১০১', 'কক্ষ ১০২', 'কক্ষ ১০৩', 'দারুল হাদিস মিলনায়তন', 'হিফজখানা', 'নূরানী কক্ষ'].forEach(
        (r) => roomSet.add(r)
      );
    }
    return Array.from(roomSet);
  }, [classes, sections, allRoutineSlots]);

  // Filtered routine slots based on current view
  const displayedSlots = useMemo(() => {
    if (viewMode === 'CLASS') {
      return allRoutineSlots.filter((slot) => {
        if (selectedClassId && slot.classId !== selectedClassId) return false;
        if (selectedSectionId && selectedSectionId !== 'ALL' && slot.sectionId !== selectedSectionId)
          return false;
        if (selectedShiftId && selectedShiftId !== 'ALL' && slot.shiftId !== selectedShiftId)
          return false;
        return true;
      });
    } else if (viewMode === 'TEACHER') {
      return allRoutineSlots.filter((slot) => slot.teacherId === selectedTeacherId);
    } else if (viewMode === 'ROOM') {
      if (!selectedRoomNo) return allRoutineSlots;
      return allRoutineSlots.filter(
        (slot) => slot.roomNo?.toLowerCase() === selectedRoomNo.toLowerCase()
      );
    }
    return allRoutineSlots;
  }, [
    allRoutineSlots,
    viewMode,
    selectedClassId,
    selectedSectionId,
    selectedShiftId,
    selectedTeacherId,
    selectedRoomNo,
  ]);

  // Real-time live conflict detection on current form inputs
  const liveFormConflicts = useMemo(() => {
    if (!isSlotModalOpen) return [];

    const selectedCls = classes.find((c) => c.id === formClassId);
    const selectedSec = sections.find((s) => s.id === formSectionId);
    const selectedShf = shifts.find((s) => s.id === formShiftId);
    const selectedSub = subjects.find((s) => s.id === formSubjectId);
    const selectedTch = teachers.find((t) => t.id === formTeacherId);

    const candidate: Partial<ClassRoutineSlotEntity> = {
      id: editingSlotId || undefined,
      classId: formClassId,
      className: selectedCls?.nameBangla || selectedCls?.nameEnglish || 'জামাত',
      sectionId: formSectionId || undefined,
      sectionName: (selectedSec as any)?.nameBangla || selectedSec?.name,
      shiftId: formShiftId || undefined,
      shiftName: selectedShf?.nameBangla,
      subjectId: formSubjectId,
      subjectName: selectedSub?.nameBangla || selectedSub?.nameEnglish || 'বিষয়',
      teacherId: formTeacherId,
      teacherName: selectedTch?.nameBangla || selectedTch?.nameEnglish || 'উস্তাদ',
      roomNo: formRoomNo,
      dayOfWeek: formDayOfWeek,
      periodNumber: Number(formPeriodNumber),
      startTime: formStartTime,
      endTime: formEndTime,
    };

    return detectRoutineConflicts(candidate, allRoutineSlots, editingSlotId || undefined);
  }, [
    isSlotModalOpen,
    formClassId,
    formSectionId,
    formShiftId,
    formSubjectId,
    formTeacherId,
    formRoomNo,
    formDayOfWeek,
    formPeriodNumber,
    formStartTime,
    formEndTime,
    editingSlotId,
    allRoutineSlots,
    classes,
    sections,
    shifts,
    subjects,
    teachers,
  ]);

  // Open Add Slot Modal
  const handleOpenAddSlot = (
    day?: DayOfWeek,
    periodNum?: number,
    classId?: string,
    teacherId?: string
  ) => {
    setEditingSlotId(null);
    setFormClassId(classId || selectedClassId || (classes[0]?.id ?? ''));
    setFormSectionId(selectedSectionId !== 'ALL' ? selectedSectionId : '');
    setFormShiftId(selectedShiftId !== 'ALL' ? selectedShiftId : (shifts[0]?.id ?? ''));
    setFormSubjectId(subjects[0]?.id ?? '');
    setFormTeacherId(teacherId || selectedTeacherId || (teachers[0]?.id ?? ''));
    setFormRoomNo(selectedRoomNo || availableRooms[0] || 'কক্ষ ১০১');
    setFormDayOfWeek(day || 'SATURDAY');
    const pNum = periodNum || 1;
    setFormPeriodNumber(pNum);

    const periodMeta = DEFAULT_PERIODS.find((p) => p.periodNumber === pNum);
    setFormStartTime(periodMeta ? periodMeta.startTime : '08:00');
    setFormEndTime(periodMeta ? periodMeta.endTime : '08:45');
    setFormNote('');

    setIsSlotModalOpen(true);
  };

  // Open Edit Slot Modal
  const handleOpenEditSlot = (slot: ClassRoutineSlotEntity) => {
    setEditingSlotId(slot.id);
    setFormClassId(slot.classId);
    setFormSectionId(slot.sectionId || '');
    setFormShiftId(slot.shiftId || '');
    setFormSubjectId(slot.subjectId);
    setFormTeacherId(slot.teacherId);
    setFormRoomNo(slot.roomNo || '');
    setFormDayOfWeek(slot.dayOfWeek);
    setFormPeriodNumber(slot.periodNumber);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormNote(slot.note || '');

    setIsSlotModalOpen(true);
  };

  // Save Slot Handler with Automated Conflict Check
  const handleSaveSlot = async (forceOverwrite = false) => {
    if (!formClassId || !formSubjectId || !formTeacherId || !formDayOfWeek) {
      showToast('অনুগ্রহ করে জামাত, বিষয়, শিক্ষক ও দিন নির্বাচন করুন', 'warning');
      return;
    }

    const selectedCls = classes.find((c) => c.id === formClassId);
    const selectedSec = sections.find((s) => s.id === formSectionId);
    const selectedShf = shifts.find((s) => s.id === formShiftId);
    const selectedSub = subjects.find((s) => s.id === formSubjectId);
    const selectedTch = teachers.find((t) => t.id === formTeacherId);

    const payload: Omit<ClassRoutineSlotEntity, 'id' | 'tenantId' | 'createdAt'> = {
      classId: formClassId,
      className: selectedCls?.nameBangla || selectedCls?.nameEnglish || 'জামাত',
      sectionId: formSectionId || undefined,
      sectionName: (selectedSec as any)?.nameBangla || selectedSec?.name,
      shiftId: formShiftId || undefined,
      shiftName: selectedShf?.nameBangla,
      subjectId: formSubjectId,
      subjectName: selectedSub?.nameBangla || selectedSub?.nameEnglish || 'বিষয়',
      teacherId: formTeacherId,
      teacherName: selectedTch?.nameBangla || selectedTch?.nameEnglish || 'উস্তাদ',
      roomNo: formRoomNo.trim() || undefined,
      dayOfWeek: formDayOfWeek,
      periodNumber: Number(formPeriodNumber),
      startTime: formStartTime,
      endTime: formEndTime,
      note: formNote.trim() || undefined,
    };

    // Run conflict detection
    const conflicts = detectRoutineConflicts(
      { ...payload, id: editingSlotId || undefined },
      allRoutineSlots,
      editingSlotId || undefined
    );

    // If conflicts exist and not forcing overwrite -> trigger toast & show conflict modal
    if (conflicts.length > 0 && !forceOverwrite) {
      setActiveConflicts(conflicts);
      setCandidateConflictSlot(payload);
      showToast(
        `সতর্কতা: রুটিনে ${conflicts.length} টি সংঘাত (Conflict) সনাক্ত হয়েছে!`,
        'error'
      );
      setConflictModalOpen(true);
      return;
    }

    // Otherwise proceed with saving
    try {
      if (editingSlotId) {
        const res = await api.updateClassRoutineSlot(
          editingSlotId,
          payload,
          { allowOverride: forceOverwrite }
        );
        if (res.success) {
          showToast(res.message || 'রুটিন সফলভাবে আপডেট করা হয়েছে', 'success');
          setIsSlotModalOpen(false);
          setConflictModalOpen(false);
          await loadRoutines();
        } else {
          showToast(res.error?.message || 'আপডেট ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createClassRoutineSlot(payload, {
          allowOverride: forceOverwrite,
        });
        if (res.success) {
          showToast(res.message || 'রুটিনে নতুন পিরিয়ড সফলভাবে যুক্ত হয়েছে', 'success');
          setIsSlotModalOpen(false);
          setConflictModalOpen(false);
          await loadRoutines();
        } else {
          showToast(res.error?.message || 'সংরক্ষণ ব্যর্থ হয়েছে', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    }
  };

  // Delete Slot Handler
  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই পিরিয়ডটি রুটিন থেকে মুছে ফেলতে চান?')) {
      return;
    }
    try {
      const res = await api.deleteClassRoutineSlot(slotId);
      if (res.success) {
        showToast('পিরিয়ডটি মুছে ফেলা হয়েছে', 'success');
        await loadRoutines();
      } else {
        showToast(res.error?.message || 'মুছতে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    }
  };

  // Drag and Drop Handlers for Timetable Grid
  const handleDragStart = (e: React.DragEvent, slot: ClassRoutineSlotEntity) => {
    setDraggedSlot(slot);
    e.dataTransfer.setData('text/plain', slot.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDragOverCell(null);
  };

  const handleDragOver = (e: React.DragEvent, day: DayOfWeek, periodNum: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const cellKey = `${day}-${periodNum}`;
    if (dragOverCell !== cellKey) {
      setDragOverCell(cellKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = async (e: React.DragEvent, targetDay: DayOfWeek, targetPeriodNum: number) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!draggedSlot) return;

    if (draggedSlot.dayOfWeek === targetDay && Number(draggedSlot.periodNumber) === targetPeriodNum) {
      return; // Dropped on identical cell
    }

    const targetPeriod = DEFAULT_PERIODS.find((p) => p.periodNumber === targetPeriodNum);
    const updatedPayload: Omit<ClassRoutineSlotEntity, 'id' | 'tenantId' | 'createdAt'> = {
      classId: draggedSlot.classId,
      className: draggedSlot.className,
      sectionId: draggedSlot.sectionId,
      sectionName: draggedSlot.sectionName,
      shiftId: draggedSlot.shiftId,
      shiftName: draggedSlot.shiftName,
      subjectId: draggedSlot.subjectId,
      subjectName: draggedSlot.subjectName,
      teacherId: draggedSlot.teacherId,
      teacherName: draggedSlot.teacherName,
      roomNo: draggedSlot.roomNo,
      dayOfWeek: targetDay,
      periodNumber: targetPeriodNum,
      startTime: targetPeriod ? targetPeriod.startTime : draggedSlot.startTime,
      endTime: targetPeriod ? targetPeriod.endTime : draggedSlot.endTime,
      note: draggedSlot.note,
    };

    // Check conflicts automatically on drag-drop
    const conflicts = detectRoutineConflicts(
      { ...updatedPayload, id: draggedSlot.id },
      allRoutineSlots,
      draggedSlot.id
    );

    if (conflicts.length > 0) {
      setActiveConflicts(conflicts);
      setCandidateConflictSlot(updatedPayload);
      setEditingSlotId(draggedSlot.id);
      showToast(
        `ড্র্যাগ-এন্ড-ড্রপ সংঘাত: ${conflicts[0].title}`,
        'error'
      );
      setConflictModalOpen(true);
      return;
    }

    try {
      const res = await api.updateClassRoutineSlot(draggedSlot.id, updatedPayload);
      if (res.success) {
        showToast(
          `স্থানান্তরিত: ${draggedSlot.subjectName} (${DAY_NAMES_SHORT_BN[targetDay]} ${targetPeriod?.periodName})`,
          'success'
        );
        await loadRoutines();
      } else {
        showToast(res.error?.message || 'স্থানান্তর ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'স্থানান্তর ব্যর্থ', 'error');
    }
  };

  const handlePeriodChange = (pNum: number) => {
    setFormPeriodNumber(pNum);
    const meta = DEFAULT_PERIODS.find((p) => p.periodNumber === pNum);
    if (meta) {
      setFormStartTime(meta.startTime);
      setFormEndTime(meta.endTime);
    }
  };

  const currentSelectedClass = classes.find((c) => c.id === selectedClassId);
  const currentSelectedSection = sections.find((s) => s.id === selectedSectionId);
  const currentSelectedShift = shifts.find((s) => s.id === selectedShiftId);
  const currentSelectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const activeSession = sessions.find((s) => s.isCurrent) || sessions[0];

  return (
    <div id="routine-builder-tab" className="space-y-6">
      {/* Control Filter Bar */}
      <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                ক্লাস রুটিন ও সময়সূচি বিল্ডার
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                অটোমেটিক কনফ্লিক্ট ডিটেকশন ও ড্র্যাগ-এন্ড-ড্রপ
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              উস্তাদ ডাবল-বুকিং, রুম ওভারল্যাপ ও জামাত সংঘাতমুক্ত সাপ্তাহিক রুটিন তৈরি ও ব্যবস্থাপনা
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-routine-templates"
              type="button"
              onClick={() => setIsTemplateManagerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all shadow-xs active:scale-95"
              title="রুটিন টেমপ্লেট লাইব্রেরি ও প্রয়োগ"
            >
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span>রুটিন টেমপ্লেট (Templates)</span>
            </button>

            {canManage && displayedSlots.length > 0 && viewMode === 'CLASS' && (
              <button
                id="btn-save-as-template"
                type="button"
                onClick={() => setIsSaveTemplateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors shadow-xs"
                title="বর্তমান ক্লাসের রুটিন টেমপ্লেট হিসেবে সংরক্ষণ করুন"
              >
                <BookmarkPlus className="w-4 h-4 text-teal-600" />
                <span>টেমপ্লেট হিসেবে সংরক্ষণ</span>
              </button>
            )}

            <button
              id="btn-print-routine"
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট প্রিভিউ / PDF</span>
            </button>

            {canManage && (
              <button
                id="btn-add-routine-slot"
                type="button"
                onClick={() => handleOpenAddSlot()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পিরিয়ড যোগ করুন</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadRoutines}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-xl"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Filters */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setViewMode('CLASS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                viewMode === 'CLASS'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>জামাতভিত্তিক রুটিন (Class)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('TEACHER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                viewMode === 'TEACHER'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>উস্তাদভিত্তিক রুটিন (Teacher)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('ROOM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                viewMode === 'ROOM'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>কক্ষভিত্তিক রুটিন (Room)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('WEEKLY_MATRIX')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                viewMode === 'WEEKLY_MATRIX'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>সাপ্তাহিক মাস্টার ম্যাট্রিক্স</span>
            </button>
          </div>

          {/* Contextual Selectors */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {viewMode === 'CLASS' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-600 dark:text-stone-400">জামাত:</span>
                  <select
                    id="filter-routine-class"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameBangla}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-600 dark:text-stone-400">শাখা:</span>
                  <select
                    id="filter-routine-section"
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">সব শাখা (All Sections)</option>
                    {sections
                      .filter((s) => s.classId === selectedClassId)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {(sec as any).nameBangla || sec.name}
                        </option>
                      ))}
                  </select>
                </div>

                {shifts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-400">শিফট:</span>
                    <select
                      id="filter-routine-shift"
                      value={selectedShiftId}
                      onChange={(e) => setSelectedShiftId(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ALL">সব শিফট</option>
                      {shifts.map((sh) => (
                        <option key={sh.id} value={sh.id}>
                          {sh.nameBangla}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {viewMode === 'TEACHER' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">উস্তাদজি:</span>
                <select
                  id="filter-routine-teacher"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameBangla} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'ROOM' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">কক্ষ/হল:</span>
                <select
                  id="filter-routine-room"
                  value={selectedRoomNo}
                  onChange={(e) => setSelectedRoomNo(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">সব কক্ষ (All Rooms)</option>
                  {availableRooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Drag & Drop Hint */}
        {canManage && viewMode !== 'WEEKLY_MATRIX' && (
          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/50 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <Move className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              <strong>টিপস:</strong> কার্ড টেনে (Drag & Drop) অন্য দিন বা পিরিয়ডে স্থানান্তর করা যায়। সংঘাত থাকলে সিস্টেম স্বয়ংক্রিয়ভাবে সতর্ক করবে।
            </span>
          </div>
        )}
      </div>

      {/* VIEW RENDERER */}
      {viewMode === 'WEEKLY_MATRIX' ? (
        <WeeklyRoutineMatrix
          routineSlots={allRoutineSlots}
          classes={classes}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          periods={DEFAULT_PERIODS}
          days={DEFAULT_DAYS}
          canManage={canManage}
          onAddSlot={(day, pNum, classId, teacherId) => handleOpenAddSlot(day, pNum, classId, teacherId)}
          onEditSlot={(slot) => handleOpenEditSlot(slot)}
          onDeleteSlot={(slotId) => handleDeleteSlot(slotId)}
        />
      ) : (
        /* Timetable Grid Matrix with Drag-and-Drop */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 font-bold">
                  <th className="p-3 w-32 border-r border-stone-200 dark:border-stone-700 text-center">
                    বার / দিন
                  </th>
                  {DEFAULT_PERIODS.map((period) => (
                    <th
                      key={period.periodNumber}
                      className="p-3 text-center border-r border-stone-200 dark:border-stone-700 min-w-[130px]"
                    >
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {period.periodName}
                      </div>
                      <div className="text-[10px] font-mono text-stone-500 font-medium mt-0.5">
                        {period.startTime} - {period.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                {DEFAULT_DAYS.map((day) => (
                  <tr key={day} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    {/* Day Column */}
                    <td className="p-3 font-bold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 text-center">
                      <span className="block text-xs">{DAY_NAMES_SHORT_BN[day]}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{day}</span>
                    </td>

                    {/* Period Slots */}
                    {DEFAULT_PERIODS.map((period) => {
                      const matchedSlots = displayedSlots.filter(
                        (s) => s.dayOfWeek === day && Number(s.periodNumber) === period.periodNumber
                      );
                      const isDragTarget = dragOverCell === `${day}-${period.periodNumber}`;

                      return (
                        <td
                          key={period.periodNumber}
                          onDragOver={(e) => handleDragOver(e, day, period.periodNumber)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day, period.periodNumber)}
                          className={`p-2 border-r border-stone-200 dark:border-stone-800 align-top relative group transition-all ${
                            isDragTarget
                              ? 'bg-emerald-100/60 dark:bg-emerald-950/60 ring-2 ring-emerald-500 ring-inset'
                              : ''
                          }`}
                        >
                          {matchedSlots.length > 0 ? (
                            <div className="space-y-1.5">
                              {matchedSlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  draggable={canManage}
                                  onDragStart={(e) => handleDragStart(e, slot)}
                                  onDragEnd={handleDragEnd}
                                  className={`p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 shadow-xs relative group/card cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-0.5 ${
                                    draggedSlot?.id === slot.id ? 'opacity-40 scale-95' : ''
                                  }`}
                                >
                                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between">
                                    <span className="truncate">{slot.subjectName}</span>

                                    {canManage && (
                                      <div className="opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1 print:hidden">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditSlot(slot)}
                                          className="p-1 text-stone-500 hover:text-emerald-600 rounded bg-white dark:bg-stone-800 shadow-xs"
                                          title="সম্পাদনা"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSlot(slot.id)}
                                          className="p-1 text-stone-500 hover:text-rose-600 rounded bg-white dark:bg-stone-800 shadow-xs"
                                          title="মুছে ফেলুন"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-1 mt-0.5">
                                    <UserCheck className="w-3 h-3 text-emerald-600" />
                                    <span className="truncate">{slot.teacherName}</span>
                                  </div>

                                  <div className="text-[10px] text-stone-500 flex items-center justify-between mt-1 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
                                    {viewMode !== 'CLASS' && (
                                      <span className="font-semibold text-stone-700 dark:text-stone-300 truncate">
                                        {slot.className}
                                      </span>
                                    )}
                                    {slot.roomNo && (
                                      <span className="inline-flex items-center gap-0.5 bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded text-[9px] border border-stone-200 dark:border-stone-700">
                                        <Building className="w-2.5 h-2.5" />
                                        {slot.roomNo}
                                      </span>
                                    )}
                                    {slot.shiftName && (
                                      <span className="text-[9px] text-stone-500">
                                        {slot.shiftName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center">
                              {isDragTarget ? (
                                <div className="text-emerald-700 dark:text-emerald-300 text-[10px] font-bold animate-pulse">
                                  এখানে ড্রপ করুন ⬇️
                                </div>
                              ) : (
                                canManage && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAddSlot(day, period.periodNumber)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all text-[11px] font-semibold flex items-center gap-1 print:hidden"
                                    title="পিরিয়ড যোগ করুন"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>যুক্ত করুন</span>
                                  </button>
                                )
                              )}
                            </div>
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
      )}

      {/* Routine Slot Builder / Editor Drawer Modal */}
      {isSlotModalOpen && (
        <div
          id="slot-builder-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {editingSlotId ? 'ক্লাস পিরিয়ড সম্পাদনা' : 'রুটিনে নতুন পিরিয়ড যোগ'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    দিন, পিরিয়ড, জামাত, শিক্ষক, বিষয়, কক্ষ ও শিফট বরাদ্দ করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* LIVE CONFLICT WARNING ALERT BANNER */}
              {liveFormConflicts.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 text-rose-900 dark:text-rose-200 space-y-2 animate-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4 animate-bounce text-rose-600" />
                    <span>সতর্কতা: এই পিরিয়ডে সংঘাত (Conflict) সনাক্ত হয়েছে!</span>
                  </div>
                  {liveFormConflicts.map((c, i) => (
                    <div key={i} className="text-xs pl-6 border-l-2 border-rose-300 dark:border-rose-700">
                      <strong>{c.title}:</strong> {c.description}
                    </div>
                  ))}
                  <p className="text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                    * সংঘাত এড়াতে অনুগ্রহ করে অন্য উস্তাদজি, রুম বা পিরিয়ড নির্বাচন করুন।
                  </p>
                </div>
              )}

              {/* Day & Period Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    বার / দিন: *
                  </label>
                  <select
                    id="slot-input-day"
                    value={formDayOfWeek}
                    onChange={(e) => setFormDayOfWeek(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {DEFAULT_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {DAY_NAMES_BN[d]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    পিরিয়ড / ঘণ্টা: *
                  </label>
                  <select
                    id="slot-input-period"
                    value={formPeriodNumber}
                    onChange={(e) => handlePeriodChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {DEFAULT_PERIODS.map((p) => (
                      <option key={p.periodNumber} value={p.periodNumber}>
                        {p.periodName} ({p.startTime} - {p.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class & Section Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    জামাত / শ্রেণি: *
                  </label>
                  <select
                    id="slot-input-class"
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBangla}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    শাখা (Section):
                  </label>
                  <select
                    id="slot-input-section"
                    value={formSectionId}
                    onChange={(e) => setFormSectionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">মূল শাখা / কোনো শাখা নেই</option>
                    {sections
                      .filter((s) => s.classId === formClassId)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {(sec as any).nameBangla || sec.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Subject & Teacher Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    বিষয় / কিতাব: *
                  </label>
                  <select
                    id="slot-input-subject"
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nameBangla} {sub.code ? `(${sub.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    উস্তাদজি / শিক্ষক: *
                  </label>
                  <select
                    id="slot-input-teacher"
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameBangla} ({t.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room, Shift and Custom Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    কক্ষ / রুম নং:
                  </label>
                  <input
                    id="slot-input-room"
                    type="text"
                    placeholder="যেমন: কক্ষ ১০১"
                    value={formRoomNo}
                    onChange={(e) => setFormRoomNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    শিফট (Shift):
                  </label>
                  <select
                    id="slot-input-shift"
                    value={formShiftId}
                    onChange={(e) => setFormShiftId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">সাধারণ শিফট (General Shift)</option>
                    {shifts.map((sh) => (
                      <option key={sh.id} value={sh.id}>
                        {sh.nameBangla} ({sh.startTime} - {sh.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    শুরুর সময়:
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    শেষের সময়:
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  বিশেষ মন্তব্য / নোট (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: প্র্যাকটিকাল / কিতাব মুতালাআ..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                {liveFormConflicts.length > 0
                  ? `⚠️ ${liveFormConflicts.length} টি সংঘাত রয়েছে`
                  : '✅ কোনো সংঘাত নেই'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors"
                >
                  বাতিল
                </button>

                <button
                  id="btn-save-routine-slot"
                  type="button"
                  onClick={() => handleSaveSlot(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingSlotId ? 'পরিবর্তন সংরক্ষণ করুন' : 'রুটিনে সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routine Conflict Modal Alert */}
      <RoutineConflictModal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        conflicts={activeConflicts}
        candidateSlot={candidateConflictSlot}
        canOverwrite={canManage}
        onForceOverwrite={() => handleSaveSlot(true)}
      />

      {/* Printable Routine Preview Modal */}
      <PrintableRoutineView
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        tenant={tenant}
        routineType={viewMode === 'WEEKLY_MATRIX' ? 'ALL_CLASSES' : viewMode}
        targetClass={currentSelectedClass}
        targetSection={currentSelectedSection}
        targetShift={currentSelectedShift}
        targetTeacher={currentSelectedTeacher}
        targetRoom={selectedRoomNo}
        activeSession={activeSession}
        allRoutineSlots={allRoutineSlots}
        periods={DEFAULT_PERIODS}
        days={DEFAULT_DAYS}
        classes={classes}
        teachers={teachers}
      />

      {/* Routine Template Manager & Apply Modal */}
      <RoutineTemplateManagerModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        classes={classes}
        sections={sections}
        shifts={shifts}
        teachers={teachers}
        activeSession={activeSession}
        periods={DEFAULT_PERIODS}
        days={DEFAULT_DAYS}
        currentClassId={selectedClassId}
        onTemplateApplied={loadRoutines}
      />

      {/* Save Routine As Template Modal */}
      <SaveRoutineAsTemplateModal
        isOpen={isSaveTemplateOpen}
        onClose={() => setIsSaveTemplateOpen(false)}
        currentClass={currentSelectedClass}
        currentSection={currentSelectedSection}
        currentShift={currentSelectedShift}
        slotsToSave={displayedSlots}
        onSaved={loadRoutines}
      />
    </div>
  );
};
