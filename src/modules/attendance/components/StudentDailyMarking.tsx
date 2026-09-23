import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Users,
  Save,
  Filter,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Smartphone,
  Check,
} from 'lucide-react';
import {
  AttendanceStatus,
  StudentEntity,
  ClassEntity,
  SectionEntity,
  ShiftEntity,
  DepartmentType,
  AttendanceEntity,
  AttendanceLockConfig,
} from '../../../types';
import { AttendanceLockBanner } from './AttendanceLockBanner';

interface StudentDailyMarkingProps {
  students: StudentEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  shifts: ShiftEntity[];
  attendances: AttendanceEntity[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaveBatch: (records: Partial<AttendanceEntity>[]) => Promise<void>;
  onOpenCorrectionModal: (record?: AttendanceEntity) => void;
  lockConfig: AttendanceLockConfig | null;
  isAdmin: boolean;
}

export const StudentDailyMarking: React.FC<StudentDailyMarkingProps> = ({
  students,
  classes,
  sections,
  shifts,
  attendances,
  selectedDate,
  onDateChange,
  onSaveBatch,
  onOpenCorrectionModal,
  lockConfig,
  isAdmin,
}) => {
  // Filter States
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local Attendance State for active sheet (keyed by studentId)
  const [localAttendanceMap, setLocalAttendanceMap] = useState<
    Record<
      string,
      {
        status: AttendanceStatus;
        checkInTime?: string;
        lateMinutes?: number;
        remarks?: string;
        source?: 'MANUAL' | 'BIOMETRIC' | 'RFID' | 'BULK_ACTION';
        attendanceId?: string;
      }
    >
  >({});

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Determine lock state
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const cutoffTime = lockConfig?.cutoffTime || '10:30';
  const isPastDate = selectedDate < new Date().toISOString().split('T')[0];
  const isTimeLocked = isToday && lockConfig?.autoLockEnabled && currentHourMinute > cutoffTime;
  const isLocked = (isPastDate || isTimeLocked) && !isAdmin;

  // Initialize/Sync local state when selectedDate, students, or attendances change
  useEffect(() => {
    const map: Record<string, any> = {};
    const dateAttendances = attendances.filter((a) => a.date === selectedDate && !!a.studentId);
    const existingMap = new Map(dateAttendances.map((a) => [a.studentId, a]));

    students.forEach((st) => {
      const existing = existingMap.get(st.id);
      if (existing) {
        map[st.id] = {
          status: existing.status,
          checkInTime: existing.checkInTime,
          lateMinutes: existing.lateMinutes,
          remarks: existing.remarks || '',
          source: existing.source || 'MANUAL',
          attendanceId: existing.id,
        };
      } else {
        // Default to PRESENT for fresh roll-call sheets
        map[st.id] = {
          status: AttendanceStatus.PRESENT,
          checkInTime: '08:00 AM',
          remarks: '',
          source: 'MANUAL',
        };
      }
    });
    setLocalAttendanceMap(map);
  }, [selectedDate, students, attendances]);

  // Filter students based on selection
  const filteredStudents = students.filter((st) => {
    if (selectedDept !== 'ALL') {
      const cls = classes.find((c) => c.id === st.classId);
      if (cls?.department !== selectedDept) return false;
    }
    if (selectedClassId !== 'ALL' && st.classId !== selectedClassId) return false;
    if (selectedSectionId !== 'ALL' && st.sectionId !== selectedSectionId) return false;
    if (selectedShiftId !== 'ALL' && (st as any).shiftId !== selectedShiftId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = st.nameBangla.toLowerCase().includes(q) || (st.nameEnglish && st.nameEnglish.toLowerCase().includes(q));
      const matchRoll = String(st.rollNo).includes(q);
      const matchId = st.studentIdCardNo?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchId) return false;
    }
    return true;
  });

  // Calculate live summary stats for filtered list
  const totalInView = filteredStudents.length;
  const presentCount = filteredStudents.filter(
    (st) => localAttendanceMap[st.id]?.status === AttendanceStatus.PRESENT
  ).length;
  const absentCount = filteredStudents.filter(
    (st) => localAttendanceMap[st.id]?.status === AttendanceStatus.ABSENT
  ).length;
  const lateCount = filteredStudents.filter(
    (st) => localAttendanceMap[st.id]?.status === AttendanceStatus.LATE
  ).length;
  const leaveCount = filteredStudents.filter(
    (st) => localAttendanceMap[st.id]?.status === AttendanceStatus.LEAVE
  ).length;
  const attendanceRate = totalInView > 0 ? Math.round(((presentCount + lateCount) / totalInView) * 100) : 0;

  // Status Change Handlers
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    if (isLocked) {
      alert('হাজিরা খাতা লক রয়েছে। পরিবর্তন করতে অনুগ্রহ করে "অনুমোদিত সংশোধন" ব্যবহার করুন।');
      return;
    }
    setLocalAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus,
        source: 'MANUAL',
      },
    }));
  };

  const handleLateMinutesChange = (studentId: string, minutes: number) => {
    setLocalAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        lateMinutes: minutes,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, text: string) => {
    setLocalAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: text,
      },
    }));
  };

  // Bulk Quick Actions
  const handleQuickMarkAll = (status: AttendanceStatus) => {
    if (isLocked) {
      alert('হাজিরা খাতা লক রয়েছে।');
      return;
    }
    setLocalAttendanceMap((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((st) => {
        updated[st.id] = {
          ...updated[st.id],
          status,
          source: 'BULK_ACTION',
        };
      });
      return updated;
    });
  };

  // Save changes to database
  const handleSaveAll = async () => {
    if (isLocked) {
      alert('হাজিরা খাতা লক রয়েছে।');
      return;
    }
    try {
      setIsSaving(true);
      const recordsToSave: Partial<AttendanceEntity>[] = filteredStudents.map((st) => {
        const entry = localAttendanceMap[st.id];
        const cls = classes.find((c) => c.id === st.classId);
        const sec = sections.find((s) => s.id === st.sectionId);
        return {
          id: entry?.attendanceId,
          studentId: st.id,
          studentName: st.nameBangla,
          rollNo: st.rollNo,
          studentIdCardNo: st.studentIdCardNo,
          classId: st.classId,
          className: cls?.nameBangla || '',
          sectionId: st.sectionId,
          sectionName: sec?.name || '',
          department: cls?.department || DepartmentType.NURANI,
          date: selectedDate,
          status: entry?.status || AttendanceStatus.PRESENT,
          checkInTime: entry?.checkInTime || '08:00 AM',
          lateMinutes: entry?.lateMinutes,
          remarks: entry?.remarks,
          source: entry?.source || 'MANUAL',
        };
      });

      await onSaveBatch(recordsToSave);
      setSaveSuccessMsg(`সফল! ${recordsToSave.length} জন শিক্ষার্থীর আজকের (${selectedDate}) হাজিরা ডাটাবেজে স্থায়ীভাবে সংরক্ষিত হয়েছে।`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Attendance Lock Banner */}
      <AttendanceLockBanner
        isLocked={Boolean(isLocked)}
        lockConfig={lockConfig}
        selectedDate={selectedDate}
        isToday={isToday}
        isAdmin={isAdmin}
        onOpenCorrectionModal={() => onOpenCorrectionModal()}
      />

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Primary Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedClassId('ALL');
              }}
              className="px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">সকল বিভাগ (All Dept)</option>
              <option value={DepartmentType.NURANI}>নূরানী ও নাজেরা</option>
              <option value={DepartmentType.HIFZ}>হিফজুল কুরআন</option>
              <option value={DepartmentType.KITAB}>কিতাব বিভাগ</option>
              <option value={DepartmentType.GENERAL}>জেনারেল / ক্যাডেট</option>
            </select>

            {/* Class Filter */}
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('ALL');
              }}
              className="px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">সকল শ্রেণি (All Classes)</option>
              {classes
                .filter((c) => selectedDept === 'ALL' || c.department === selectedDept)
                .map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nameBangla}
                  </option>
                ))}
            </select>

            {/* Section Filter */}
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">সকল শাখা (All Sections)</option>
              {sections
                .filter((s) => selectedClassId === 'ALL' || s.classId === selectedClassId)
                .map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
            </select>

            {/* Shift Filter */}
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">সকল শিফট (All Shifts)</option>
              {shifts.map((shf) => (
                <option key={shf.id} value={shf.id}>
                  {shf.nameBangla}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="w-full lg:w-64">
            <input
              type="text"
              placeholder="রোল, নাম বা আইডি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Live Attendance Metric Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">মোট শিক্ষার্থী</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalInView} জন</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">উপস্থিত (Present)</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{presentCount} জন</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60">
            <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">অনুপস্থিত (Absent)</div>
            <div className="text-xl font-bold text-rose-700 dark:text-rose-300">{absentCount} জন</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">বিলম্ব (Late)</div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{lateCount} জন</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60">
            <div className="text-[11px] font-medium text-blue-700 dark:text-blue-300">ছুটি (Leave)</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{leaveCount} জন</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60">
            <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300">উপস্থিতির হার</div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{attendanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar: Bulk Actions + Save Master Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            কুইক অ্যাকশন:
          </span>
          <button
            type="button"
            disabled={isLocked}
            onClick={() => handleQuickMarkAll(AttendanceStatus.PRESENT)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-lg transition disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সবাইকে উপস্থিত (All Present)</span>
          </button>
          <button
            type="button"
            disabled={isLocked}
            onClick={() => handleQuickMarkAll(AttendanceStatus.ABSENT)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 hover:bg-rose-200 dark:hover:bg-rose-800 rounded-lg transition disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>সবাইকে অনুপস্থিত (All Absent)</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isSaving || isLocked}
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'হাজিরা খাতা সংরক্ষণ করুন (Save)'}</span>
          </button>
        </div>
      </div>

      {/* Roll Call Attendance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5 w-14 text-center">রোল</th>
                <th className="px-4 py-3.5">শিক্ষার্থীর তথ্য</th>
                <th className="px-4 py-3.5">শ্রেণি ও শাখা</th>
                <th className="px-4 py-3.5 text-center w-72">হাজিরা স্ট্যাটাস (Status)</th>
                <th className="px-4 py-3.5 w-40">দেরি / আগমন সময়</th>
                <th className="px-4 py-3.5">মন্তব্য / সোর্স</th>
                <th className="px-4 py-3.5 text-center w-24">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    কোনো শিক্ষার্থীর রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const entry = localAttendanceMap[st.id] || { status: AttendanceStatus.PRESENT };
                  const cls = classes.find((c) => c.id === st.classId);
                  const sec = sections.find((s) => s.id === st.sectionId);

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition ${
                        entry.status === AttendanceStatus.ABSENT
                          ? 'bg-rose-50/20 dark:bg-rose-950/10'
                          : entry.status === AttendanceStatus.LATE
                          ? 'bg-amber-50/20 dark:bg-amber-950/10'
                          : entry.status === AttendanceStatus.LEAVE
                          ? 'bg-blue-50/20 dark:bg-blue-950/10'
                          : ''
                      }`}
                    >
                      {/* Roll */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {st.rollNo}
                        </span>
                      </td>

                      {/* Student Info */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{st.nameBangla}</span>
                          {st.isResidential && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                              আবাসিক
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>আইডি: {st.studentIdCardNo || st.id}</span>
                          {st.guardianMobile && (
                            <span>• মোবা: {st.guardianMobile}</span>
                          )}
                        </div>
                      </td>

                      {/* Class & Section */}
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {cls?.nameBangla || 'শ্রেণি'}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {sec?.name || 'শাখা'}
                        </div>
                      </td>

                      {/* Status Selector Buttons */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, AttendanceStatus.PRESENT)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.PRESENT
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                            }`}
                          >
                            উপস্থিত (P)
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, AttendanceStatus.ABSENT)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.ABSENT
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                            }`}
                          >
                            অনুপস্থিত (A)
                          </button>

                          {/* Late Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, AttendanceStatus.LATE)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.LATE
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                            }`}
                          >
                            দেরি (L)
                          </button>

                          {/* Leave Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, AttendanceStatus.LEAVE)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.LEAVE
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                            }`}
                          >
                            ছুটি (Leave)
                          </button>
                        </div>
                      </td>

                      {/* Late Minutes / Arrival Time */}
                      <td className="px-4 py-3 text-xs">
                        {entry.status === AttendanceStatus.LATE ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <input
                              type="number"
                              min="1"
                              max="180"
                              value={entry.lateMinutes || 15}
                              onChange={(e) => handleLateMinutesChange(st.id, parseInt(e.target.value) || 0)}
                              className="w-14 px-2 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg text-center font-bold text-amber-800 dark:text-amber-200"
                            />
                            <span className="text-amber-700 dark:text-amber-300">মি.</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            {entry.checkInTime || '০৮:০০ AM'}
                          </span>
                        )}
                      </td>

                      {/* Remarks & Source Badge */}
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="মন্তব্য..."
                            value={entry.remarks || ''}
                            onChange={(e) => handleRemarksChange(st.id, e.target.value)}
                            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-28 sm:w-36 focus:outline-none"
                          />
                          {entry.source === 'BIOMETRIC' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                              বায়োমেট্রিক
                            </span>
                          )}
                          {entry.source === 'RFID' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                              RFID কার্ড
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const foundAtt = attendances.find((a) => a.date === selectedDate && a.studentId === st.id);
                            onOpenCorrectionModal(foundAtt || ({
                              studentId: st.id,
                              studentName: st.nameBangla,
                              date: selectedDate,
                              status: entry.status,
                              remarks: entry.remarks,
                            } as any));
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                          title="অনুমোদিত সংশোধন"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
