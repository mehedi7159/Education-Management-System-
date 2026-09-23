import React, { useState } from 'react';
import {
  User,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Award,
  History,
  TrendingUp,
} from 'lucide-react';
import { StudentEntity, AttendanceEntity, ClassEntity, SectionEntity, AttendanceStatus } from '../../../types';

interface StudentAttendanceHistoryProps {
  students: StudentEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  attendances: AttendanceEntity[];
  onOpenCorrectionModal: (record?: AttendanceEntity) => void;
}

export const StudentAttendanceHistory: React.FC<StudentAttendanceHistoryProps> = ({
  students,
  classes,
  sections,
  attendances,
  onOpenCorrectionModal,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const cls = classes.find((c) => c.id === selectedStudent?.classId);
  const sec = sections.find((s) => s.id === selectedStudent?.sectionId);

  // Student specific attendances sorted by date descending
  const studentRecords = attendances
    .filter((a) => a.studentId === selectedStudent?.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Compute stats
  const totalRecords = studentRecords.length;
  const presentCount = studentRecords.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const absentCount = studentRecords.filter((a) => a.status === AttendanceStatus.ABSENT).length;
  const lateCount = studentRecords.filter((a) => a.status === AttendanceStatus.LATE).length;
  const leaveCount = studentRecords.filter((a) => a.status === AttendanceStatus.LEAVE).length;
  const attendanceRate =
    totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 100) : 100;

  return (
    <div className="space-y-5">
      {/* Student Selection Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              শিক্ষার্থী নির্বাচন করুন (Select Student)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  [রোল: {st.rollNo}] {st.nameBangla} ({st.studentIdCardNo || st.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500 dark:text-slate-400">হাজিরার গড় অনুপাত</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {attendanceRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Student Profile & Attendance Overview Bento */}
      {selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xl flex items-center justify-center border border-emerald-300 dark:border-emerald-800">
                  {selectedStudent.rollNo}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedStudent.nameBangla}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    আইডি: {selectedStudent.studentIdCardNo || selectedStudent.id}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {cls?.nameBangla}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      {sec?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>অভিভাবক:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedStudent.guardianName || selectedStudent.fatherName || 'মাওলানা রফিকুল ইসলাম'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>মোবাইল নম্বর:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedStudent.guardianMobile || '01712-445566'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>বসবাস ধরন:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedStudent.isResidential ? 'আবাসিক (বোর্ডিং)' : 'অনাবাসিক (ডে-কেয়ার)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {attendanceRate >= 90
                  ? 'চমৎকার নিয়মিত উপস্থিতি (সন্তোষজনক)'
                  : attendanceRate >= 75
                  ? 'গড় নিয়মিত উপস্থিতি'
                  : 'সতর্কতা: নিয়মিত অনুপস্থিতির জন্য নোটিশ প্রদান করুন'}
              </span>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>ব্যক্তিগত হাজিরা পরিসংখ্যান সারসংক্ষেপ</span>
              </div>
              <div className="text-xs text-slate-500">মোট কার্যদিবস রেকর্ড: {totalRecords} দিন</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">উপস্থিত (Present)</div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{presentCount} দিন</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
                <div className="text-xs text-rose-700 dark:text-rose-300 font-semibold">অনুপস্থিত (Absent)</div>
                <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{absentCount} দিন</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
                <div className="text-xs text-amber-700 dark:text-amber-300 font-semibold">বিলম্ব (Late)</div>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{lateCount} দিন</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">অনুমোদিত ছুটি (Leave)</div>
                <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{leaveCount} দিন</div>
              </div>
            </div>

            {/* Attendance Rate Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">হাজিরার সার্বিক পার্সেন্টেজ:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <span>তারিখভিত্তিক হাজিরা লগ ও অডিট হিস্ট্রি</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">তারিখ (Date)</th>
                <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                <th className="px-4 py-3">আগমন সময়</th>
                <th className="px-4 py-3">সোর্স মাধ্যম</th>
                <th className="px-4 py-3">মন্তব্য / কারণ</th>
                <th className="px-4 py-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    এই শিক্ষার্থীর জন্য কোনো অতীত হাজিরা রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                studentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                      {rec.date}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          rec.status === AttendanceStatus.PRESENT
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : rec.status === AttendanceStatus.ABSENT
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : rec.status === AttendanceStatus.LATE
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {rec.status === AttendanceStatus.PRESENT && 'উপস্থিত (P)'}
                        {rec.status === AttendanceStatus.ABSENT && 'অনুপস্থিত (A)'}
                        {rec.status === AttendanceStatus.LATE && 'বিলম্ব (Late)'}
                        {rec.status === AttendanceStatus.LEAVE && 'ছুটি (Leave)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {rec.checkInTime || '-'} {rec.lateMinutes ? `(${rec.lateMinutes} মি. বিলম্ব)` : ''}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {rec.source || 'MANUAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {rec.remarks || '-'}
                      {rec.auditHistory && rec.auditHistory.length > 0 && (
                        <div className="text-[10px] text-amber-600 mt-0.5">
                          সংশোধিত ({rec.auditHistory[rec.auditHistory.length - 1].reason})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onOpenCorrectionModal(rec)}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                      >
                        সংশোধন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
