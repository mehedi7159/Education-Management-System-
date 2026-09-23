import React, { useState, useMemo } from 'react';
import {
  Grid,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Building,
  GraduationCap,
  Filter,
  Eye,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Search,
} from 'lucide-react';
import {
  ClassEntity,
  SectionEntity,
  StaffEntity,
  SubjectEntity,
  ClassRoutineSlotEntity,
  RoutinePeriod,
  DayOfWeek,
  RoutineConflict,
} from '../../../types';
import {
  DAY_NAMES_SHORT_BN,
  DAY_NAMES_BN,
  detectRoutineConflicts,
} from '../../../utils/routineConflictDetector';

interface WeeklyRoutineMatrixProps {
  routineSlots: ClassRoutineSlotEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  subjects: SubjectEntity[];
  teachers: StaffEntity[];
  periods: RoutinePeriod[];
  days: DayOfWeek[];
  canManage: boolean;
  onAddSlot: (day: DayOfWeek, periodNum: number, classId?: string, teacherId?: string) => void;
  onEditSlot: (slot: ClassRoutineSlotEntity) => void;
  onDeleteSlot: (slotId: string) => void;
  onInspectConflict?: (conflicts: RoutineConflict[], slot: ClassRoutineSlotEntity) => void;
}

type MatrixPerspective = 'DAY_X_PERIOD' | 'CLASS_X_PERIOD' | 'TEACHER_X_PERIOD';
type GapFilter = 'ALL' | 'GAPS_ONLY' | 'OVERLAPS_ONLY' | 'FILLED_ONLY';

export const WeeklyRoutineMatrix: React.FC<WeeklyRoutineMatrixProps> = ({
  routineSlots,
  classes,
  sections,
  subjects,
  teachers,
  periods,
  days,
  canManage,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}) => {
  // Perspective: Day vs Period, Class vs Period (Daily Master), Teacher vs Period (Daily Faculty Master)
  const [perspective, setPerspective] = useState<MatrixPerspective>('DAY_X_PERIOD');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('SATURDAY');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [gapFilter, setGapFilter] = useState<GapFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate Conflicts across all existing routine slots
  const detectedConflictsMap = useMemo(() => {
    const conflictSlotIds = new Set<string>();
    const detailsMap = new Map<string, RoutineConflict[]>();

    routineSlots.forEach((slot) => {
      const clashes = detectRoutineConflicts(slot, routineSlots, slot.id);
      if (clashes.length > 0) {
        conflictSlotIds.add(slot.id);
        detailsMap.set(slot.id, clashes);
      }
    });

    return { conflictSlotIds, detailsMap };
  }, [routineSlots]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalSlots = routineSlots.length;
    const totalPossibleSlots = classes.length * days.length * periods.length;
    const totalGaps = Math.max(0, totalPossibleSlots - totalSlots);
    const conflictsCount = detectedConflictsMap.conflictSlotIds.size;
    const assignedTeachers = new Set(routineSlots.map((s) => s.teacherId)).size;
    const teacherUtilizationRate = teachers.length > 0
      ? Math.round((assignedTeachers / teachers.length) * 100)
      : 0;

    return {
      totalSlots,
      totalPossibleSlots,
      totalGaps,
      conflictsCount,
      teacherUtilizationRate,
    };
  }, [routineSlots, classes, days, periods, detectedConflictsMap, teachers]);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (selectedClassFilter !== 'ALL' && c.id !== selectedClassFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          c.nameBangla.toLowerCase().includes(query) ||
          c.nameEnglish.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [classes, selectedClassFilter, searchTerm]);

  // Color generator for subject tags to make matrix visually distinct
  const getSubjectColorStyle = (subjectName: string) => {
    const hash = subjectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [
      'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800',
      'bg-cyan-50 text-cyan-950 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-cyan-800',
      'bg-indigo-50 text-indigo-950 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-800',
      'bg-violet-50 text-violet-950 border-violet-300 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-800',
      'bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
      'bg-teal-50 text-teal-950 border-teal-300 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-800',
    ];
    return hues[hash % hues.length];
  };

  return (
    <div id="weekly-routine-matrix" className="space-y-5">
      {/* KPI & Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Scheduled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-stone-900 dark:text-stone-100">
              {metrics.totalSlots}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              মোট নির্ধারিত পিরিয়ড
            </div>
          </div>
        </div>

        {/* Empty Slots / Gaps */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">
              {metrics.totalGaps}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              ফাঁকা স্লট / গ্যাপ (Gaps)
            </div>
          </div>
        </div>

        {/* Overlaps & Clashes */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              metrics.conflictsCount > 0
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div
              className={`text-lg font-black ${
                metrics.conflictsCount > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {metrics.conflictsCount}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              ডাবল-বুকিং ও ওভারল্যাপ
            </div>
          </div>
        </div>

        {/* Teacher Utilization */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-stone-900 dark:text-stone-100">
              {metrics.teacherUtilizationRate}%
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              শিক্ষক সম্পৃক্ততা হার
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Perspectives, Day Selection, and Quick Filters */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Matrix Perspectives Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setPerspective('DAY_X_PERIOD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                perspective === 'DAY_X_PERIOD'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>সাপ্তাহিক রুটিন গ্রিড (দিন × পিরিয়ড)</span>
            </button>

            <button
              type="button"
              onClick={() => setPerspective('CLASS_X_PERIOD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                perspective === 'CLASS_X_PERIOD'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>সকল জামাত মাস্টার ম্যাট্রিক্স (Class Master)</span>
            </button>

            <button
              type="button"
              onClick={() => setPerspective('TEACHER_X_PERIOD')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                perspective === 'TEACHER_X_PERIOD'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>উস্তাদ কর্মভার ম্যাট্রিক্স (Teacher Workload)</span>
            </button>
          </div>

          {/* Quick Highlighting Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
              হাইলাইট:
            </span>
            <button
              type="button"
              onClick={() => setGapFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                gapFilter === 'ALL'
                  ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              সব স্লট
            </button>

            <button
              type="button"
              onClick={() => setGapFilter('GAPS_ONLY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                gapFilter === 'GAPS_ONLY'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>শুধুমাত্র ফাঁকা পিরিয়ড (Gaps)</span>
            </button>

            <button
              type="button"
              onClick={() => setGapFilter('OVERLAPS_ONLY')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                gapFilter === 'OVERLAPS_ONLY'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>সংঘাত ও ওভারল্যাপ (Clashes)</span>
            </button>
          </div>
        </div>

        {/* Perspective Context Sub-Bar */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Day selection for Daily Master Views */}
          {(perspective === 'CLASS_X_PERIOD' || perspective === 'TEACHER_X_PERIOD') && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-700 dark:text-stone-300">দিন / বার নির্বাচন:</span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedDay === d
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                    }`}
                  >
                    {DAY_NAMES_SHORT_BN[d]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Class Filter for Weekly View */}
          {perspective === 'DAY_X_PERIOD' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-700 dark:text-stone-300">জামাত ফিল্টার:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-1 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 font-semibold"
              >
                <option value="ALL">সকল জামাত (All Classes)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nameBangla}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Visual Legend */}
          <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 ml-auto">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-400 dark:bg-emerald-950" />
              বরাদ্দকৃত ক্লাস
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-amber-400 bg-amber-50/50 dark:bg-amber-950/20" />
              ফাঁকা স্লট (Gap)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-500 dark:bg-rose-950" />
              ডাবল-বুকিং সংঘাত
            </span>
          </div>
        </div>
      </div>

      {/* MATRIX VIEW 1: DAY X PERIOD (Weekly Schedule Grid) */}
      {perspective === 'DAY_X_PERIOD' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 font-bold">
                  <th className="p-3 w-36 border-r border-stone-200 dark:border-stone-700 text-center">
                    বার / দিন
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.periodNumber}
                      className="p-3 text-center border-r border-stone-200 dark:border-stone-700 min-w-[145px]"
                    >
                      <div className="font-bold text-stone-900 dark:text-stone-100">{p.periodName}</div>
                      <div className="text-[10px] font-mono text-stone-500 font-medium">
                        {p.startTime} - {p.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-3 font-bold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-center">
                      <span className="block text-xs">{DAY_NAMES_SHORT_BN[day]}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{day}</span>
                    </td>

                    {periods.map((period) => {
                      let matchedSlots = routineSlots.filter(
                        (s) => s.dayOfWeek === day && Number(s.periodNumber) === period.periodNumber
                      );

                      if (selectedClassFilter !== 'ALL') {
                        matchedSlots = matchedSlots.filter((s) => s.classId === selectedClassFilter);
                      }

                      const hasSlots = matchedSlots.length > 0;
                      const hasConflict = matchedSlots.some((s) =>
                        detectedConflictsMap.conflictSlotIds.has(s.id)
                      );

                      // Filter logic
                      if (gapFilter === 'GAPS_ONLY' && hasSlots) return <td key={period.periodNumber} className="p-2 border-r border-stone-200 dark:border-stone-800 bg-stone-100/30 opacity-30" />;
                      if (gapFilter === 'OVERLAPS_ONLY' && !hasConflict) return <td key={period.periodNumber} className="p-2 border-r border-stone-200 dark:border-stone-800 bg-stone-100/30 opacity-30" />;
                      if (gapFilter === 'FILLED_ONLY' && !hasSlots) return <td key={period.periodNumber} className="p-2 border-r border-stone-200 dark:border-stone-800 bg-stone-100/30 opacity-30" />;

                      return (
                        <td
                          key={period.periodNumber}
                          className={`p-2 border-r border-stone-200 dark:border-stone-800 align-top relative ${
                            hasConflict
                              ? 'bg-rose-50/40 dark:bg-rose-950/20'
                              : !hasSlots
                              ? 'bg-amber-50/10 dark:bg-amber-950/5'
                              : ''
                          }`}
                        >
                          {hasSlots ? (
                            <div className="space-y-1.5">
                              {matchedSlots.map((slot) => {
                                const isConflict = detectedConflictsMap.conflictSlotIds.has(slot.id);
                                const clashList = detectedConflictsMap.detailsMap.get(slot.id) || [];
                                const colorClass = getSubjectColorStyle(slot.subjectName);

                                return (
                                  <div
                                    key={slot.id}
                                    className={`p-2 rounded-xl border transition-all shadow-xs relative group/card ${
                                      isConflict
                                        ? 'bg-rose-50 text-rose-950 border-rose-400 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700 ring-2 ring-rose-500/40 animate-pulse'
                                        : colorClass
                                    }`}
                                  >
                                    {/* Conflict Pill */}
                                    {isConflict && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/80 px-1.5 py-0.5 rounded-md mb-1">
                                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                                        <span>সংঘাত সনাক্ত ({clashList.length})</span>
                                      </div>
                                    )}

                                    <div className="font-bold text-xs flex items-center justify-between">
                                      <span className="truncate">{slot.subjectName}</span>
                                      {canManage && (
                                        <div className="opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => onEditSlot(slot)}
                                            className="p-1 text-stone-500 hover:text-emerald-600 rounded bg-white dark:bg-stone-800 shadow-xs"
                                            title="সম্পাদনা"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => onDeleteSlot(slot.id)}
                                            className="p-1 text-stone-500 hover:text-rose-600 rounded bg-white dark:bg-stone-800 shadow-xs"
                                            title="মুছে ফেলুন"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-[11px] opacity-90 flex items-center gap-1 mt-0.5">
                                      <UserCheck className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{slot.teacherName}</span>
                                    </div>

                                    <div className="text-[10px] opacity-75 flex items-center justify-between mt-1 pt-1 border-t border-current/20">
                                      <span className="font-semibold truncate">{slot.className}</span>
                                      {slot.roomNo && (
                                        <span className="inline-flex items-center gap-0.5 bg-white/70 dark:bg-stone-800/80 px-1 py-0.5 rounded text-[9px]">
                                          <Building className="w-2.5 h-2.5" />
                                          {slot.roomNo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            /* Visual Gap (Free slot) */
                            <div className="h-16 rounded-xl border border-dashed border-stone-300 dark:border-stone-700/80 hover:border-amber-400 dark:hover:border-amber-600 flex flex-col items-center justify-center p-1 text-center group/gap transition-colors bg-stone-50/40 dark:bg-stone-900/40">
                              <span className="text-[10px] text-stone-400 group-hover/gap:text-amber-600 dark:group-hover/gap:text-amber-400 font-medium">
                                🔲 ফাঁকা স্লট (Gap)
                              </span>
                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onAddSlot(
                                      day,
                                      period.periodNumber,
                                      selectedClassFilter !== 'ALL' ? selectedClassFilter : undefined
                                    )
                                  }
                                  className="opacity-0 group-hover/gap:opacity-100 mt-1 inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition-opacity"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>বরাদ্দ করুন</span>
                                </button>
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

      {/* MATRIX VIEW 2: CLASS X PERIOD (All Classes Daily Master Matrix) */}
      {perspective === 'CLASS_X_PERIOD' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {DAY_NAMES_BN[selectedDay]} - সকল জামাতের পিরিয়ডভিত্তিক মাস্টার ম্যাট্রিক্স
            </span>
            <span className="text-[11px] text-stone-500">
              মোট জামাত: {filteredClasses.length} টি
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 font-bold">
                  <th className="p-3 w-44 border-r border-stone-200 dark:border-stone-700 text-center">
                    জামাত / শ্রেণি
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.periodNumber}
                      className="p-3 text-center border-r border-stone-200 dark:border-stone-700 min-w-[145px]"
                    >
                      <div className="font-bold text-stone-900 dark:text-stone-100">{p.periodName}</div>
                      <div className="text-[10px] font-mono text-stone-500 font-medium">
                        {p.startTime} - {p.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-3 font-bold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40">
                      <div className="font-bold text-xs">{cls.nameBangla}</div>
                      <div className="text-[10px] text-stone-400">{cls.nameEnglish}</div>
                    </td>

                    {periods.map((period) => {
                      const matchedSlots = routineSlots.filter(
                        (s) =>
                          s.dayOfWeek === selectedDay &&
                          Number(s.periodNumber) === period.periodNumber &&
                          s.classId === cls.id
                      );

                      const hasSlots = matchedSlots.length > 0;
                      const hasConflict = matchedSlots.some((s) =>
                        detectedConflictsMap.conflictSlotIds.has(s.id)
                      );

                      return (
                        <td
                          key={period.periodNumber}
                          className={`p-2 border-r border-stone-200 dark:border-stone-800 align-top ${
                            hasConflict ? 'bg-rose-50/50 dark:bg-rose-950/30' : ''
                          }`}
                        >
                          {hasSlots ? (
                            <div className="space-y-1">
                              {matchedSlots.map((slot) => {
                                const isConflict = detectedConflictsMap.conflictSlotIds.has(slot.id);
                                const colorClass = getSubjectColorStyle(slot.subjectName);

                                return (
                                  <div
                                    key={slot.id}
                                    className={`p-2 rounded-xl border shadow-xs relative group/card ${
                                      isConflict
                                        ? 'bg-rose-50 text-rose-950 border-rose-400 ring-2 ring-rose-500/40'
                                        : colorClass
                                    }`}
                                  >
                                    <div className="font-bold text-xs flex items-center justify-between">
                                      <span className="truncate">{slot.subjectName}</span>
                                      {canManage && (
                                        <div className="opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => onEditSlot(slot)}
                                            className="p-1 text-stone-500 hover:text-emerald-600 rounded bg-white dark:bg-stone-800 shadow-xs"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-[11px] opacity-90 truncate mt-0.5">
                                      {slot.teacherName}
                                    </div>
                                    {slot.roomNo && (
                                      <div className="text-[10px] opacity-75 mt-0.5">
                                        কক্ষ: {slot.roomNo}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-14 rounded-xl border border-dashed border-stone-300 dark:border-stone-700/80 hover:border-amber-400 flex items-center justify-center p-1 text-center group/gap">
                              {canManage ? (
                                <button
                                  type="button"
                                  onClick={() => onAddSlot(selectedDay, period.periodNumber, cls.id)}
                                  className="text-[10px] text-stone-400 group-hover/gap:text-emerald-600 font-semibold flex items-center gap-0.5"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>স্লট খালি</span>
                                </button>
                              ) : (
                                <span className="text-[10px] text-stone-400">খালি</span>
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

      {/* MATRIX VIEW 3: TEACHER X PERIOD (Faculty Workload Matrix) */}
      {perspective === 'TEACHER_X_PERIOD' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              {DAY_NAMES_BN[selectedDay]} - উস্তাদজিদের সাপ্তাহিক কার্যতালিকা ও উপস্থিতি ম্যাট্রিক্স
            </span>
            <span className="text-[11px] text-stone-500">
              মোট শিক্ষক: {teachers.length} জন
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 font-bold">
                  <th className="p-3 w-48 border-r border-stone-200 dark:border-stone-700 text-center">
                    উস্তাদজি / শিক্ষক
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.periodNumber}
                      className="p-3 text-center border-r border-stone-200 dark:border-stone-700 min-w-[145px]"
                    >
                      <div className="font-bold text-stone-900 dark:text-stone-100">{p.periodName}</div>
                      <div className="text-[10px] font-mono text-stone-500 font-medium">
                        {p.startTime} - {p.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="p-3 font-bold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40">
                      <div className="font-bold text-xs">{teacher.nameBangla}</div>
                      <div className="text-[10px] text-stone-500">{teacher.designation}</div>
                    </td>

                    {periods.map((period) => {
                      const matchedSlots = routineSlots.filter(
                        (s) =>
                          s.dayOfWeek === selectedDay &&
                          Number(s.periodNumber) === period.periodNumber &&
                          s.teacherId === teacher.id
                      );

                      const hasSlots = matchedSlots.length > 0;
                      const hasConflict = matchedSlots.length > 1;

                      return (
                        <td
                          key={period.periodNumber}
                          className={`p-2 border-r border-stone-200 dark:border-stone-800 align-top ${
                            hasConflict ? 'bg-rose-50/60 dark:bg-rose-950/40' : ''
                          }`}
                        >
                          {hasSlots ? (
                            <div className="space-y-1">
                              {matchedSlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className={`p-2 rounded-xl border text-xs shadow-xs ${
                                    hasConflict
                                      ? 'bg-rose-100 text-rose-950 border-rose-400 font-bold ring-2 ring-rose-500'
                                      : 'bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
                                  }`}
                                >
                                  <div className="font-bold truncate">{slot.className}</div>
                                  <div className="text-[11px] opacity-90 truncate mt-0.5">
                                    {slot.subjectName}
                                  </div>
                                  {slot.roomNo && (
                                    <div className="text-[10px] opacity-75 mt-0.5">
                                      {slot.roomNo}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-14 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center p-1 text-center bg-stone-50/20">
                              <span className="text-[10px] text-emerald-700/60 dark:text-emerald-400/60 font-medium">
                                🟢 অবসর / ফ্রি পিরিয়ড
                              </span>
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
    </div>
  );
};
