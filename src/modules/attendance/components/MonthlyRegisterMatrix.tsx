import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Users,
} from 'lucide-react';
import {
  AttendanceEntity,
  StudentEntity,
  StaffEntity,
  ClassEntity,
  SectionEntity,
  AttendanceStatus,
} from '../../../types';

interface MonthlyRegisterMatrixProps {
  students: StudentEntity[];
  staffList: StaffEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  attendances: AttendanceEntity[];
}

export const MonthlyRegisterMatrix: React.FC<MonthlyRegisterMatrixProps> = ({
  students,
  staffList,
  classes,
  sections,
  attendances,
}) => {
  const [viewType, setViewType] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-02');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'ALL');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');

  // Compute days in the selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr); // 1-12
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter students or staff
  const targetStudents = students.filter((s) => {
    if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;
    if (selectedSectionId !== 'ALL' && s.sectionId !== selectedSectionId) return false;
    return true;
  });

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Fast attendance lookup map: key = `${targetId}_${YYYY-MM-DD}`
  const attendanceMap = new Map<string, AttendanceEntity>();
  attendances.forEach((a) => {
    const key = a.studentId ? `${a.studentId}_${a.date}` : `${a.staffId}_${a.date}`;
    attendanceMap.set(key, a);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Filter and Configuration Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* View Type Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewType('STUDENT')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                  viewType === 'STUDENT'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                শিক্ষার্থী রেজিস্টার
              </button>
              <button
                type="button"
                onClick={() => setViewType('STAFF')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                  viewType === 'STAFF'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                উস্তাদ ও স্টাফ রেজিস্টার
              </button>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Class & Section Selector for Student View */}
            {viewType === 'STUDENT' && (
              <>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedSectionId('ALL');
                  }}
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ALL">সকল শ্রেণি</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.nameBangla}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ALL">সকল শাখা</option>
                  {sections
                    .filter((s) => selectedClassId === 'ALL' || s.classId === selectedClassId)
                    .map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                </select>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট শিট</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-800 dark:text-slate-200">চিহ্ন নির্দেশিকা:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">P</span>
            <span>উপস্থিত (Present)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">A</span>
            <span>অনুপস্থিত (Absent)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center">L</span>
            <span>বিলম্ব (Late)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">E</span>
            <span>ছুটি (Leave)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold text-[10px] flex items-center justify-center">F</span>
            <span>শুক্রবার (Jumma)</span>
          </div>
        </div>
      </div>

      {/* Monthly Register Matrix Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {viewType === 'STUDENT' ? (
              <span>
                মাসিক হাজিরা রেজিস্টার — {selectedClass?.nameBangla || 'সকল শ্রেণি'} ({selectedMonth})
              </span>
            ) : (
              <span>উস্তাদ ও কর্মকর্তা মাসিক হাজিরা রেজিস্টার ({selectedMonth})</span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            মোট তালিকাভুক্ত: {viewType === 'STUDENT' ? targetStudents.length : staffList.length} জন
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="px-3 py-2.5 w-10 text-center sticky left-0 bg-slate-100 dark:bg-slate-800 z-10">
                  রোল
                </th>
                <th className="px-3 py-2.5 min-w-[150px] sticky left-10 bg-slate-100 dark:bg-slate-800 z-10">
                  নাম
                </th>
                {daysArray.map((d) => {
                  const dayDate = new Date(year, month - 1, d);
                  const isFriday = dayDate.getDay() === 5;
                  return (
                    <th
                      key={d}
                      className={`p-1.5 text-center min-w-[28px] ${
                        isFriday ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : ''
                      }`}
                    >
                      {d}
                    </th>
                  );
                })}
                <th className="px-2 py-2 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">P</th>
                <th className="px-2 py-2 text-center bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">A</th>
                <th className="px-2 py-2 text-center bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">L</th>
                <th className="px-2 py-2 text-center bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">E</th>
                <th className="px-2.5 py-2 text-center bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {(viewType === 'STUDENT' ? targetStudents : staffList).map((person: any) => {
                let pCount = 0;
                let aCount = 0;
                let lCount = 0;
                let eCount = 0;

                const isStudent = viewType === 'STUDENT';
                const personId = person.id;
                const rollOrId = isStudent ? person.rollNo : person.employeeId || person.id.slice(0, 4);

                return (
                  <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-3 py-2 text-center font-bold sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800">
                      {rollOrId}
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200 sticky left-10 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {person.nameBangla}
                    </td>

                    {/* Day Cells */}
                    {daysArray.map((d) => {
                      const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
                      const dayDate = new Date(year, month - 1, d);
                      const isFriday = dayDate.getDay() === 5;
                      const att = attendanceMap.get(`${personId}_${dayStr}`);

                      if (isFriday) {
                        return (
                          <td key={d} className="p-1 text-center bg-amber-50/50 dark:bg-amber-950/20">
                            <span className="inline-block w-5 h-5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 text-[10px] leading-5 font-bold">
                              F
                            </span>
                          </td>
                        );
                      }

                      if (!att) {
                        return (
                          <td key={d} className="p-1 text-center">
                            <span className="inline-block w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] leading-5">
                              -
                            </span>
                          </td>
                        );
                      }

                      if (att.status === AttendanceStatus.PRESENT) {
                        pCount++;
                        return (
                          <td key={d} className="p-1 text-center">
                            <span className="inline-block w-5 h-5 rounded bg-emerald-600 text-white font-bold text-[10px] leading-5">
                              P
                            </span>
                          </td>
                        );
                      } else if (att.status === AttendanceStatus.ABSENT) {
                        aCount++;
                        return (
                          <td key={d} className="p-1 text-center">
                            <span className="inline-block w-5 h-5 rounded bg-rose-600 text-white font-bold text-[10px] leading-5">
                              A
                            </span>
                          </td>
                        );
                      } else if (att.status === AttendanceStatus.LATE) {
                        lCount++;
                        return (
                          <td key={d} className="p-1 text-center">
                            <span className="inline-block w-5 h-5 rounded bg-amber-600 text-white font-bold text-[10px] leading-5">
                              L
                            </span>
                          </td>
                        );
                      } else if (att.status === AttendanceStatus.LEAVE) {
                        eCount++;
                        return (
                          <td key={d} className="p-1 text-center">
                            <span className="inline-block w-5 h-5 rounded bg-blue-600 text-white font-bold text-[10px] leading-5">
                              E
                            </span>
                          </td>
                        );
                      }
                      return <td key={d} className="p-1 text-center">-</td>;
                    })}

                    {/* Totals */}
                    {(() => {
                      const totalRecorded = pCount + aCount + lCount + eCount;
                      const rate = totalRecorded > 0 ? Math.round(((pCount + lCount) / totalRecorded) * 100) : 100;
                      return (
                        <>
                          <td className="px-2 py-2 text-center font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                            {pCount}
                          </td>
                          <td className="px-2 py-2 text-center font-bold text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20">
                            {aCount}
                          </td>
                          <td className="px-2 py-2 text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
                            {lCount}
                          </td>
                          <td className="px-2 py-2 text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/20">
                            {eCount}
                          </td>
                          <td className="px-2.5 py-2 text-center font-black text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/20">
                            {rate}%
                          </td>
                        </>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
