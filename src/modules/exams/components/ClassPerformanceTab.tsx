import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  BookOpen,
  Printer,
  RefreshCw,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  ExamEntity,
  ClassEntity,
  ClassPerformanceSummary,
  ResultEntity,
} from '../../../types';
import { StudentMarksheetModal } from './StudentMarksheetModal';

interface ClassPerformanceTabProps {
  exams: ExamEntity[];
  classes: ClassEntity[];
  initialExamId?: string;
  initialClassId?: string;
}

export const ClassPerformanceTab: React.FC<ClassPerformanceTabProps> = ({
  exams,
  classes,
  initialExamId,
  initialClassId,
}) => {
  const { tenant } = useAuth();
  const { showToast } = useToast();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || (exams.length > 0 ? exams[0].id : '')
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes.length > 0 ? classes[0].id : '')
  );

  const [performance, setPerformance] = useState<ClassPerformanceSummary | null>(null);
  const [resultsList, setResultsList] = useState<ResultEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Marksheet Modal state
  const [selectedStudentResult, setSelectedStudentResult] = useState<ResultEntity | null>(null);
  const [isMarksheetOpen, setIsMarksheetOpen] = useState(false);

  const loadPerformance = async () => {
    if (!selectedExamId || !selectedClassId) return;

    setIsLoading(true);
    try {
      const [perfRes, resultsRes] = await Promise.all([
        api.getClassPerformance(selectedExamId, selectedClassId),
        api.getResults(tenant.id, selectedExamId, selectedClassId),
      ]);

      if (perfRes.success && perfRes.data) {
        setPerformance(perfRes.data);
      } else {
        setPerformance(null);
      }

      if (resultsRes.success && resultsRes.data) {
        setResultsList(resultsRes.data);
      }
    } catch (err: any) {
      showToast('পারফরম্যান্স ডেটা লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, [selectedExamId, selectedClassId]);

  const handlePrintReport = () => {
    window.print();
  };

  const handleOpenMarksheet = (res: ResultEntity) => {
    setSelectedStudentResult(res);
    setIsMarksheetOpen(true);
  };

  const currentExam = exams.find((e) => e.id === selectedExamId);
  const currentClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div id="class-performance-tab" className="space-y-6">
      {/* Control Filter Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              শ্রেণি ও বিষয়ভিত্তিক ফলাফল বিশ্লেষণ
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              পাসের হার, মেধা তালিকা, বিষয়ভিত্তিক সর্বোচ্চ/গড় নম্বর ও গ্রেড ডিস্ট্রিবিউশন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintReport}
              disabled={!performance}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>রিপোর্ট প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={loadPerformance}
              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-lg"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              পরীক্ষা নির্বাচন করুন:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              জামাত / শ্রেণি নির্বাচন করুন:
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nameBangla}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-sm text-stone-500 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
          পারফরম্যান্স অ্যানালিটিক্স হিসাব করা হচ্ছে...
        </div>
      ) : !performance ? (
        <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          <BarChart3 className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
          <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
            কোনো ফলাফল বা পারফরম্যান্স রেকর্ড নেই
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            নির্বাচিত পরীক্ষা ও শ্রেণির নম্বর এন্ট্রি সম্পন্ন করে ট্যাবুলেশন শিটে ফলাফল ক্যালকুলেশন সম্পন্ন করুন।
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Printable Report Header */}
          <div className="hidden print:block text-center mb-6 pb-4 border-b border-stone-300">
            <h1 className="text-xl font-bold text-stone-900">
              {tenant?.nameBangla || tenant?.nameEnglish || 'মাদরাসা ফলাফল মূল্যায়ন বিবরণী'}
            </h1>
            <p className="text-sm font-semibold text-stone-700 mt-1">
              শ্রেণি পারফরম্যান্স ও বিষয়ভিত্তিক ফলাফল রিপোর্ট: {currentExam?.name} | জামাত: {currentClass?.nameBangla}
            </p>
          </div>

          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-xs text-stone-500 dark:text-stone-400">মোট পরীক্ষার্থী</span>
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                {performance.totalStudents} জন
              </div>
              <span className="text-[11px] text-stone-400">অংশগ্রহণ: {performance.appearedStudents} জন</span>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-xs text-stone-500 dark:text-stone-400">পাসের হার (Pass Rate)</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {performance.passRate}%
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                উত্তীর্ণ: {performance.passedStudents} জন | অনুত্তীর্ণ: {performance.failedStudents} জন
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-xs text-stone-500 dark:text-stone-400">শ্রেণি গড় নম্বর ও GPA</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {performance.averageMarks}
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                গড় GPA: {performance.averageGpa ? performance.averageGpa.toFixed(2) : '—'}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-xs text-stone-500 dark:text-stone-400">সর্বোচ্চ ও সর্বনিম্ন নম্বর</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {performance.highestMarks}
              </div>
              <span className="text-[11px] text-stone-400">
                সর্বনিম্ন নম্বর: {performance.lowestMarks}
              </span>
            </div>
          </div>

          {/* Grade Distribution & Top Rankers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                বিভাগ / গ্রেড বণ্টন চিত্র (Grade Distribution)
              </h3>

              <div className="space-y-3">
                {Object.entries(performance.gradeDistribution || {}).map(([gradeName, count]) => {
                  const pct =
                    performance.totalStudents > 0
                      ? Math.round((count / performance.totalStudents) * 100)
                      : 0;
                  const isFail = gradeName.includes('রাসিব') || gradeName.includes('F');
                  return (
                    <div key={gradeName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {gradeName}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400 font-mono">
                          {count} জন ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isFail
                              ? 'bg-rose-500'
                              : gradeName.includes('মুমতাজ') || gradeName.includes('A+')
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers (মেধাতালিকা) */}
            <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-500" />
                মেধাতালিকা (Top Merit Performers)
              </h3>

              <div className="space-y-2.5">
                {performance.topPerformers && performance.topPerformers.length > 0 ? (
                  performance.topPerformers.map((tp, idx) => {
                    const matchedRes = resultsList.find((r) => r.studentId === tp.studentId);
                    return (
                      <div
                        key={tp.studentId || idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : idx === 2
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {idx === 0 ? '১ম' : idx === 1 ? '২য়' : idx === 2 ? '৩য়' : `${idx + 1}`}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              {tp.studentName}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">
                              রোল: {tp.rollNo} | প্রাপ্ত: {tp.totalObtainedMarks} ({tp.percentage}%)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {tp.grade}
                          </span>
                          {matchedRes && (
                            <button
                              type="button"
                              onClick={() => handleOpenMarksheet(matchedRes)}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 hover:underline"
                            >
                              নম্বরপত্র
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-stone-400">
                    মেধা তালিকার রেকর্ড তৈরি হয়নি।
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subject-Wise Analytics Table */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                বিষয়ভিত্তিক ফলাফল ও তুলনামূলক চিত্র
              </h3>
              <span className="text-xs text-stone-500">
                মোট বিষয়: {performance.subjectPerformances?.length || 0} টি
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700 font-semibold">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">ক্র.</th>
                    <th className="px-4 py-3">বিষয়ের নাম</th>
                    <th className="px-3 py-3 text-center">পূর্ণমান</th>
                    <th className="px-3 py-3 text-center">পাস নম্বর</th>
                    <th className="px-3 py-3 text-center">শ্রেণি গড় নম্বর</th>
                    <th className="px-3 py-3 text-center">সর্বোচ্চ নম্বর</th>
                    <th className="px-3 py-3 text-center">সর্বনিম্ন নম্বর</th>
                    <th className="px-3 py-3 text-center">উত্তীর্ণ / অনুত্তীর্ণ</th>
                    <th className="px-4 py-3 text-center">পাসের হার</th>
                    <th className="px-4 py-3 text-center">মূল্যায়ন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                  {performance.subjectPerformances && performance.subjectPerformances.length > 0 ? (
                    performance.subjectPerformances.map((sub, idx) => {
                      const isHighPass = sub.passRate >= 80;
                      const isLowPass = sub.passRate < 50;
                      return (
                        <tr
                          key={sub.subjectId || idx}
                          className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors"
                        >
                          <td className="px-4 py-2.5 text-center text-stone-500 font-mono">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-stone-900 dark:text-stone-100">
                            {sub.subjectName}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono">{sub.fullMarks}</td>
                          <td className="px-3 py-2.5 text-center font-mono text-stone-500">
                            {sub.passMarks}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold font-mono text-blue-600 dark:text-blue-400">
                            {sub.averageMarks}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {sub.highestMarks}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono text-rose-600 dark:text-rose-400">
                            {sub.lowestMarks}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono">
                            <span className="text-emerald-600 font-semibold">{sub.passCount}</span>
                            {' / '}
                            <span className="text-rose-600 font-semibold">{sub.failCount}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-2 rounded-full ${
                                    isHighPass
                                      ? 'bg-emerald-500'
                                      : isLowPass
                                      ? 'bg-rose-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${sub.passRate}%` }}
                                ></div>
                              </div>
                              <span className="font-mono font-bold text-xs">{sub.passRate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isHighPass
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isLowPass
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {isHighPass
                                ? 'উৎকৃষ্ট'
                                : isLowPass
                                ? 'বিশেষ যত্ন প্রয়োজন'
                                : 'মানসম্মত'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-stone-400">
                        কোনো বিষয়ভিত্তিক পারফরম্যান্স ডেটা নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Marksheet Modal */}
      {selectedStudentResult && (
        <StudentMarksheetModal
          isOpen={isMarksheetOpen}
          onClose={() => setIsMarksheetOpen(false)}
          result={selectedStudentResult}
          tenant={tenant}
        />
      )}
    </div>
  );
};
