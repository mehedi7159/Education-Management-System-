import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Layers,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  StudentEntity,
  StaffEntity,
  ClassEntity,
  SectionEntity,
  AttendanceEntity,
  AttendanceStatus,
  DepartmentType,
} from '../../../types';

interface AttendanceReportsAnalyticsProps {
  students: StudentEntity[];
  staffList: StaffEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  attendances: AttendanceEntity[];
  selectedDate: string;
}

export const AttendanceReportsAnalytics: React.FC<AttendanceReportsAnalyticsProps> = ({
  students,
  staffList,
  classes,
  sections,
  attendances,
  selectedDate,
}) => {
  const [reportType, setReportType] = useState<'DAILY' | 'CLASS_WISE' | 'DEPT_WISE' | 'STAFF'>(
    'DAILY'
  );
  const [filterDate, setFilterDate] = useState<string>(selectedDate);

  // Filter attendances on selected date
  const targetAttendances = attendances.filter((a) => a.date === filterDate);
  const studentAtts = targetAttendances.filter((a) => !!a.studentId);
  const staffAtts = targetAttendances.filter((a) => !!a.staffId);

  // Student metrics
  const totalStudents = students.length || 1;
  const sPresent = studentAtts.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const sAbsent = studentAtts.filter((a) => a.status === AttendanceStatus.ABSENT).length;
  const sLate = studentAtts.filter((a) => a.status === AttendanceStatus.LATE).length;
  const sLeave = studentAtts.filter((a) => a.status === AttendanceStatus.LEAVE).length;
  const studentRate = Math.round(((sPresent + sLate) / totalStudents) * 100);

  // Staff metrics
  const totalStaff = staffList.length || 1;
  const stfPresent = staffAtts.filter((a) => a.status === AttendanceStatus.PRESENT).length;
  const stfAbsent = staffAtts.filter((a) => a.status === AttendanceStatus.ABSENT).length;
  const stfLate = staffAtts.filter((a) => a.status === AttendanceStatus.LATE).length;
  const stfRate = Math.round(((stfPresent + stfLate) / totalStaff) * 100);

  // Class-wise analytics
  const classAnalytics = classes.map((cls) => {
    const classStudents = students.filter((s) => s.classId === cls.id);
    const clsAtts = studentAtts.filter(
      (a) => a.classId === cls.id || classStudents.some((s) => s.id === a.studentId)
    );

    const pres = clsAtts.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const abs = clsAtts.filter((a) => a.status === AttendanceStatus.ABSENT).length;
    const late = clsAtts.filter((a) => a.status === AttendanceStatus.LATE).length;
    const leave = clsAtts.filter((a) => a.status === AttendanceStatus.LEAVE).length;
    const total = classStudents.length || 1;
    const rate = Math.round(((pres + late) / total) * 100);

    return {
      class: cls,
      totalStudents: classStudents.length,
      present: pres,
      absent: abs,
      late,
      leave,
      rate: Math.min(100, rate),
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Report Header & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setReportType('DAILY')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                  reportType === 'DAILY'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                দৈনিক সার্বিক রিপোর্ট
              </button>
              <button
                onClick={() => setReportType('CLASS_WISE')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                  reportType === 'CLASS_WISE'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                শ্রেণিভিত্তিক বিশ্লেষণ
              </button>
              <button
                onClick={() => setReportType('STAFF')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition ${
                  reportType === 'STAFF'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                উস্তাদ ও কর্মচারী রিপোর্ট
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>রিপোর্ট প্রিন্ট</span>
          </button>
        </div>
      </div>

      {/* Daily Overview */}
      {reportType === 'DAILY' && (
        <div className="space-y-5">
          {/* Dual Bento Cards: Students vs Staff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Students Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      শিক্ষার্থী উপস্থিতি সারসংক্ষেপ
                    </h3>
                    <p className="text-xs text-slate-500">তারিখ: {filterDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">{studentRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                  <div className="text-[11px] font-semibold text-emerald-700">উপস্থিত</div>
                  <div className="text-lg font-bold text-emerald-800">{sPresent}</div>
                </div>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200">
                  <div className="text-[11px] font-semibold text-rose-700">অনুপস্থিত</div>
                  <div className="text-lg font-bold text-rose-800">{sAbsent}</div>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200">
                  <div className="text-[11px] font-semibold text-amber-700">বিলম্ব</div>
                  <div className="text-lg font-bold text-amber-800">{sLate}</div>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200">
                  <div className="text-[11px] font-semibold text-blue-700">ছুটি</div>
                  <div className="text-lg font-bold text-blue-800">{sLeave}</div>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${studentRate}%` }}
                />
              </div>
            </div>

            {/* Staff Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      উস্তাদ ও কর্মকর্তা উপস্থিতি
                    </h3>
                    <p className="text-xs text-slate-500">তারিখ: {filterDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{stfRate}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                  <div className="text-[11px] font-semibold text-emerald-700">উপস্থিত</div>
                  <div className="text-lg font-bold text-emerald-800">{stfPresent}</div>
                </div>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200">
                  <div className="text-[11px] font-semibold text-rose-700">অনুপস্থিত</div>
                  <div className="text-lg font-bold text-rose-800">{stfAbsent}</div>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200">
                  <div className="text-[11px] font-semibold text-amber-700">বিলম্ব</div>
                  <div className="text-lg font-bold text-amber-800">{stfLate}</div>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600">মোট স্টাফ</div>
                  <div className="text-lg font-bold text-slate-800">{staffList.length}</div>
                </div>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stfRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Comparative Class Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>শ্রেণিভিত্তিক উপস্থিতি তুলনা ও র‍্যাংকিং ({filterDate})</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">শ্রেণি ও বিভাগ</th>
                    <th className="px-4 py-3 text-center">মোট ছাত্র</th>
                    <th className="px-4 py-3 text-center text-emerald-700">উপস্থিত (P)</th>
                    <th className="px-4 py-3 text-center text-rose-700">অনুপস্থিত (A)</th>
                    <th className="px-4 py-3 text-center text-amber-700">দেরি (L)</th>
                    <th className="px-4 py-3 text-center text-blue-700">ছুটি (E)</th>
                    <th className="px-4 py-3 text-center w-36">উপস্থিতির হার (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  {classAnalytics.map((item) => (
                    <tr key={item.class.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {item.class.nameBangla}
                        </div>
                        <div className="text-xs text-slate-500">
                          বিভাগ: {item.class.department}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {item.totalStudents} জন
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">
                        {item.present}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-rose-600">
                        {item.absent}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">
                        {item.late}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">
                        {item.leave}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${item.rate}%` }}
                            />
                          </div>
                          <span className="font-bold text-xs w-10 text-right">{item.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Class Wise View */}
      {reportType === 'CLASS_WISE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classAnalytics.map((item) => (
            <div
              key={item.class.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {item.class.nameBangla}
                  </h4>
                  <p className="text-xs text-slate-500">{item.class.department}</p>
                </div>
                <span className="text-xl font-black text-emerald-600">{item.rate}%</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                  <div className="text-[10px] text-emerald-700">উপস্থিত</div>
                  <div className="font-bold text-emerald-800">{item.present}</div>
                </div>
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                  <div className="text-[10px] text-rose-700">অনুপস্থিত</div>
                  <div className="font-bold text-rose-800">{item.absent}</div>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
                  <div className="text-[10px] text-amber-700">দেরি</div>
                  <div className="font-bold text-amber-800">{item.late}</div>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                  <div className="text-[10px] text-blue-700">ছুটি</div>
                  <div className="font-bold text-blue-800">{item.leave}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff View */}
      {reportType === 'STAFF' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100">
            উস্তাদ ও কর্মকর্তা দৈনিক লগ ({filterDate})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                <tr>
                  <th className="px-4 py-3">উস্তাদের নাম</th>
                  <th className="px-4 py-3">পদবি</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3">ইন টাইম</th>
                  <th className="px-4 py-3">আউট টাইম</th>
                  <th className="px-4 py-3">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {staffList.map((stf) => {
                  const att = staffAtts.find((a) => a.staffId === stf.id);
                  return (
                    <tr key={stf.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {stf.nameBangla}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {stf.designation}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            att?.status === AttendanceStatus.PRESENT
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : att?.status === AttendanceStatus.LATE
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {att?.status || 'অনুপস্থিত'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {att?.checkInTime || '০৮:১৫ AM'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        {att?.checkOutTime || '০৪:৩০ PM'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {att?.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
