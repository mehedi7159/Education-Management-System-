import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Printer,
  Filter,
  User,
  BookOpen,
  Layers,
  MapPin,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  TeacherRoutineEntity,
  StaffEntity,
  RoutineDay,
} from '../../types';

const DAYS_MAP: { id: RoutineDay; label: string }[] = [
  { id: 'SATURDAY', label: 'শনিবার' },
  { id: 'SUNDAY', label: 'রবিবার' },
  { id: 'MONDAY', label: 'সোমবার' },
  { id: 'TUESDAY', label: 'মঙ্গলবার' },
  { id: 'WEDNESDAY', label: 'বুধবার' },
  { id: 'THURSDAY', label: 'বৃহস্পতিবার' },
];

const PERIOD_TIMES: { [key: number]: { start: string; end: string } } = {
  1: { start: '০৮:০০ AM', end: '০৮:৫০ AM' },
  2: { start: '০৮:৫০ AM', end: '০৯:৪০ AM' },
  3: { start: '০৯:৪০ AM', end: '১০:৩০ AM' },
  4: { start: '১০:৫০ AM', end: '১১:৪০ AM' },
  5: { start: '১১:৪০ AM', end: '১২:৩০ PM' },
  6: { start: '০২:০০ PM', end: '০২:৪৫ PM' },
  7: { start: '০২:৪৫ PM', end: '০৩:৩০ PM' },
};

export const TeacherRoutineView: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<TeacherRoutineEntity[]>([]);
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);
  
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<RoutineDay>('SATURDAY');
  
  // Add Routine Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routineForm, setRoutineForm] = useState({
    teacherId: '',
    subjectId: 'sub-101',
    subjectName: 'সহীহ বুখারী শরীফ',
    classId: 'cls-1',
    className: 'দাওরায়ে হাদিস (মাস্টার্স)',
    sectionId: 'sec-1',
    sectionName: 'শাখা-ক',
    academicSessionId: 'sess-2025',
    academicSessionName: '২০২৫-২০২৬',
    dayOfWeek: 'SATURDAY' as RoutineDay,
    periodNumber: 1,
    startTime: '০৮:০০ AM',
    endTime: '০৮:৫০ AM',
    roomNo: '১০১ (দারুল হাদিস)',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [routRes, staffRes] = await Promise.all([
        api.getTeacherRoutines(),
        api.getStaff(),
      ]);

      if (routRes.success) setRoutines(routRes.data);
      if (staffRes.success) {
        setStaffList(staffRes.data);
        if (staffRes.data.length > 0) {
          setRoutineForm((prev) => ({ ...prev, teacherId: staffRes.data[0].id }));
        }
      }
    } catch (err) {
      showToast('রুটিন তথ্য লোড করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = staffList.find((s) => s.id === routineForm.teacherId);
    if (!teacher) {
      showToast('শিক্ষক নির্বাচন করুন।', 'error');
      return;
    }

    const periodTimes = PERIOD_TIMES[routineForm.periodNumber] || { start: '০৮:০০ AM', end: '০৮:৫০ AM' };

    try {
      const res = await api.createTeacherRoutine({
        ...routineForm,
        employeeId: teacher.employeeId,
        teacherName: teacher.nameBangla,
        startTime: periodTimes.start,
        endTime: periodTimes.end,
      });

      if (res.success) {
        showToast('রুটিনে নতুন পিরিয়ড সফলভাবে যুক্ত হয়েছে।', 'success');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast(res.error?.message || 'রুটিন তৈরি ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  const handleDeleteRoutine = async (id: string, subject: string) => {
    if (!window.confirm(`আপনি কি "${subject}" পিরিয়ডটি রুটিন থেকে মুছে ফেলতে চান?`)) return;
    try {
      const res = await api.deleteTeacherRoutine(id);
      if (res.success) {
        showToast('পিরিয়ড মোছা হয়েছে।', 'success');
        loadData();
      }
    } catch (err) {
      showToast('মোছা ব্যর্থ হয়েছে।', 'error');
    }
  };

  const filteredRoutines = routines.filter((r) => {
    const matchesTeacher = selectedTeacherId === 'ALL' || r.teacherId === selectedTeacherId;
    const matchesDay = r.dayOfWeek === selectedDay;
    return matchesTeacher && matchesDay;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            সাপ্তাহিক ক্লাস রুটিন ও সময়সূচি মাস্টার গ্রিড
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            প্রতিটি পিরিয়ড, শিক্ষক, বিষয়, শ্রেণি ও নির্ধারিত কক্ষের পূর্ণাঙ্গ বিন্যাস
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Teacher filter */}
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] outline-none"
          >
            <option value="ALL">সকল শিক্ষক (All Teachers)</option>
            {staffList.map((stf) => (
              <option key={stf.id} value={stf.id}>
                {stf.nameBangla} ({stf.designation})
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
            title="রুটিন প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            নতুন পিরিয়ড যোগ করুন
          </button>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] p-2 rounded-2xl overflow-x-auto shadow-sm">
        {DAYS_MAP.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === day.id
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Routine Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoutines.length === 0 ? (
          <div className="col-span-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-xs text-[var(--color-text-secondary)]">
            <Clock className="w-10 h-10 mx-auto mb-2 text-emerald-600/40" />
            {DAYS_MAP.find((d) => d.id === selectedDay)?.label} এ কোনো নির্ধারিত ক্লাস রুটিন পাওয়া যায়নি।
          </div>
        ) : (
          filteredRoutines
            .sort((a, b) => a.periodNumber - b.periodNumber)
            .map((routine) => (
              <div
                key={routine.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-3 hover:border-emerald-500/50 transition-all relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-lg">
                    পিরিয়ড #{routine.periodNumber}
                  </span>
                  <span className="text-xs font-mono font-medium text-[var(--color-text-secondary)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {routine.startTime} - {routine.endTime}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-[var(--color-text-main)]">
                    {routine.subjectName}
                  </h4>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
                    {routine.className} • {routine.sectionName}
                  </span>
                </div>

                <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      শিক্ষক:
                    </span>
                    <span className="font-bold text-[var(--color-text-main)]">{routine.teacherName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      কক্ষ:
                    </span>
                    <span className="font-medium">{routine.roomNo || 'নির্ধারিত কক্ষ'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)]">
                  <span>সেশন: {routine.academicSessionName}</span>
                  <button
                    onClick={() => handleDeleteRoutine(routine.id, routine.subjectName)}
                    className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* ADD ROUTINE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                রুটিনে নতুন পিরিয়ড অন্তর্ভুক্তি
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoutine} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">দায়িত্বপ্রাপ্ত শিক্ষক *</label>
                <select
                  value={routineForm.teacherId}
                  onChange={(e) => setRoutineForm({ ...routineForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.nameBangla} ({stf.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">বার / দিন *</label>
                  <select
                    value={routineForm.dayOfWeek}
                    onChange={(e) => setRoutineForm({ ...routineForm, dayOfWeek: e.target.value as RoutineDay })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  >
                    {DAYS_MAP.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">পিরিয়ড নম্বর *</label>
                  <select
                    value={routineForm.periodNumber}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const t = PERIOD_TIMES[p] || { start: '০৮:০০ AM', end: '০৮:৫০ AM' };
                      setRoutineForm({ ...routineForm, periodNumber: p, startTime: t.start, endTime: t.end });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        পিরিয়ড #{num} ({PERIOD_TIMES[num]?.start} - {PERIOD_TIMES[num]?.end})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিষয় / কিতাবের নাম *</label>
                <input
                  type="text"
                  required
                  value={routineForm.subjectName}
                  onChange={(e) => setRoutineForm({ ...routineForm, subjectName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">শ্রেণি / জামাত *</label>
                  <input
                    type="text"
                    required
                    value={routineForm.className}
                    onChange={(e) => setRoutineForm({ ...routineForm, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শাখা *</label>
                  <input
                    type="text"
                    required
                    value={routineForm.sectionName}
                    onChange={(e) => setRoutineForm({ ...routineForm, sectionName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">কক্ষ নম্বর / স্থান</label>
                <input
                  type="text"
                  value={routineForm.roomNo}
                  onChange={(e) => setRoutineForm({ ...routineForm, roomNo: e.target.value })}
                  placeholder="যেমন: ১০১ (দারুল হাদিস)"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  রুটিনে যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
