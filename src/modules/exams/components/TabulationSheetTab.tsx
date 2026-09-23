import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Award,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Send,
  Lock,
  Sparkles,
  Calculator,
  Eye,
} from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  ExamEntity,
  ClassEntity,
  SectionEntity,
  RoleType,
  ResultEntity,
} from '../../../types';
import { ExamStatusBadge } from './ExamStatusBadge';
import { StudentMarksheetModal } from './StudentMarksheetModal';

interface TabulationSheetTabProps {
  exams: ExamEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  initialExamId?: string;
  initialClassId?: string;
}

export const TabulationSheetTab: React.FC<TabulationSheetTabProps> = ({
  exams,
  classes,
  sections,
  initialExamId,
  initialClassId,
}) => {
  const { user, tenant } = useAuth();
  const { showToast } = useToast();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || exams[0]?.id || ''
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [tabulationData, setTabulationData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Marksheet Modal State
  const [activeMarksheetIndex, setActiveMarksheetIndex] = useState<number>(-1);
  const [isMarksheetModalOpen, setIsMarksheetModalOpen] = useState(false);

  const currentExam = exams.find((e) => e.id === selectedExamId);

  const canPublish =
    user?.role === RoleType.SUPER_ADMIN ||
    user?.role === RoleType.INSTITUTION_ADMIN ||
    user?.role === RoleType.MUHTAMIM;

  const loadTabulation = async () => {
    if (!selectedExamId || !selectedClassId) {
      setTabulationData(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.getExamTabulation(
        selectedExamId,
        selectedClassId,
        selectedSectionId !== 'ALL' ? selectedSectionId : undefined
      );
      if (res.success && res.data) {
        setTabulationData(res.data);
      }
    } catch (err: any) {
      showToast('নম্বর ফর্দ লোড করতে ব্যর্থ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTabulation();
  }, [selectedExamId, selectedClassId, selectedSectionId]);

  const handleRecalculateResults = async () => {
    if (!selectedExamId || !selectedClassId) return;

    setIsCalculating(true);
    try {
      const res = await api.calculateAndSaveClassResults({
        examId: selectedExamId,
        classId: selectedClassId,
      });

      if (res.success) {
        showToast(res.message || 'ফলাফল সফলভাবে হিসাব ও মেধা তালিকা প্রস্তুত হয়েছে', 'success');
        await loadTabulation();
      } else {
        showToast(res.error?.message || 'ফলাফল পুনর্গণনায় সমস্যা হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePublishResults = async () => {
    if (!canPublish) {
      showToast('শুধুমাত্র মুহতামিম বা অ্যাডমিন ফলাফল আনুষ্ঠানিকভাবে প্রকাশ করতে পারেন।', 'error');
      return;
    }
    if (!selectedExamId) return;

    if (
      !window.confirm(
        'আপনি কি নিশ্চিত যে এই পরীক্ষার ফলাফল আনুষ্ঠানিকভাবে প্রকাশ (PUBLISH) করতে চান? অভিভাবক ও শিক্ষার্থীরা তখন তাদের নম্বরপত্র দেখতে পাবেন।'
      )
    ) {
      return;
    }

    setIsPublishing(true);
    try {
      const res = await api.publishExamResults(selectedExamId, selectedClassId);
      if (res.success) {
        showToast(res.message || 'ফলাফল সফলভাবে প্রকাশিত হয়েছে', 'success');
        loadTabulation();
      } else {
        showToast(res.error?.message || 'ফলাফল প্রকাশে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const classSections = sections.filter((s) => s.classId === selectedClassId);

  // Filter rows
  const studentsList: any[] = tabulationData?.students || [];
  const filteredStudents = studentsList.filter((std) => {
    if (statusFilter === 'PASSED' && !std.passed) return false;
    if (statusFilter === 'FAILED' && std.passed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        std.studentName.toLowerCase().includes(q) ||
        String(std.rollNo).includes(q) ||
        (std.registrationNo && std.registrationNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Helper to construct ResultEntity for modal
  const getSelectedResultEntity = (): ResultEntity | null => {
    if (activeMarksheetIndex < 0 || activeMarksheetIndex >= filteredStudents.length) return null;
    const std = filteredStudents[activeMarksheetIndex];
    const fullResultList: ResultEntity[] = tabulationData?.results || [];
    const directMatch = fullResultList.find((r) => r.studentId === std.studentId || r.id === std.resultId);
    if (directMatch) return directMatch;

    // Fallback: construct from tabulation data row
    const subList = tabulationData?.subjects?.map((sub: any) => {
      const sm = std.subjectMarks?.[sub.id];
      return {
        subjectId: sub.id,
        subjectName: sub.subjectName,
        subjectCode: sub.subjectCode,
        fullMarks: sub.fullMarks,
        passMarks: sub.passMarks,
        writtenMarks: sm?.written,
        oralMarks: sm?.oral,
        mcqMarks: sm?.mcq,
        practicalMarks: sm?.practical,
        obtainedMarks: sm?.total || 0,
        percentage: sub.fullMarks > 0 ? Math.round(((sm?.total || 0) / sub.fullMarks) * 100) : 0,
        grade: sm?.gradeEnglish || sm?.grade || 'মাকবুল',
        gradeBangla: sm?.grade || 'মাকবুল',
        gpaPoint: sm?.gpa || (sm?.passed ? 3.0 : 0),
        isPassed: sm?.passed ?? true,
      };
    }) || [];

    return {
      id: std.resultId || `res-${selectedExamId}-${std.studentId}`,
      tenantId: tenant.id,
      examId: selectedExamId,
      examName: tabulationData?.examName || currentExam?.name || 'পরীক্ষা',
      academicYear: currentExam?.year || 2025,
      studentId: std.studentId,
      studentName: std.studentName,
      studentNameEnglish: std.studentNameEnglish,
      rollNo: std.rollNo,
      className: tabulationData?.className || 'জামাত',
      totalMarks: std.totalMarks || 100 * (tabulationData?.subjects?.length || 1),
      obtainedMarks: std.obtainedTotal,
      percentage: std.percentage,
      gpa: std.gpa,
      grade: std.overallGrade,
      gradeBangla: std.overallGrade,
      gpaOrGrade: std.overallGrade,
      passed: std.passed,
      position: std.position,
      failedSubjectCount: std.failedSubjectsCount,
      subjectMarks: subList,
      remarks: std.remarks,
      status: currentExam?.status === 'PUBLISHED' ? 'PUBLISHED' : 'REVIEWED',
    };
  };

  return (
    <div id="tabulation-sheet-tab" className="space-y-6">
      {/* Control / Filter Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              পরীক্ষা:
            </label>
            <select
              id="tab-select-exam"
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
              জামাত / শ্রেণি:
            </label>
            <select
              id="tab-select-class"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('ALL');
              }}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nameBangla}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              শাখা:
            </label>
            <select
              id="tab-select-section"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            >
              <option value="ALL">সকল শাখা</option>
              {classSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              ফলাফল ফিল্টার:
            </label>
            <select
              id="tab-select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            >
              <option value="ALL">সকল পরীক্ষার্থী</option>
              <option value="PASSED">শুধুমাত্র উত্তীর্ণ (Passed)</option>
              <option value="FAILED">শুধুমাত্র অনুত্তীর্ণ (Failed)</option>
            </select>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="রোল বা নাম খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-recalculate-tabulation"
              type="button"
              onClick={handleRecalculateResults}
              disabled={isCalculating || !selectedExamId || !selectedClassId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors disabled:opacity-50"
              title="গ্রেডিং নিয়মের ভিত্তিতে ফলাফল ও মেধা তালিকা পুনঃগণনা করুন"
            >
              <Calculator className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'হিসাব হচ্ছে...' : 'ফলাফল পুনঃহিসাব'}</span>
            </button>

            <button
              id="btn-print-tabulation"
              type="button"
              onClick={handlePrint}
              disabled={!tabulationData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>নম্বর ফর্দ প্রিন্ট করুন</span>
            </button>

            {canPublish && currentExam?.status !== 'PUBLISHED' && (
              <button
                id="btn-publish-results"
                type="button"
                onClick={handlePublishResults}
                disabled={isPublishing || !tabulationData}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'প্রকাশিত হচ্ছে...' : 'ফলাফল প্রকাশ করুন'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadTabulation}
              className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-lg"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {tabulationData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
          <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400">মোট পরীক্ষার্থী</span>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {tabulationData.totalStudents} জন
            </div>
            <span className="text-[11px] text-stone-400">শ্রেণি: {tabulationData.className}</span>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400">উত্তীর্ণ ছাত্রছাত্রী</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {tabulationData.passedCount} জন
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              পাসের হার: {tabulationData.passPercentage}%
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400">অনুত্তীর্ণ (ফেল)</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {tabulationData.failedCount} জন
            </div>
            <span className="text-[11px] text-stone-400">পুনঃমূল্যায়ন আবশ্যক</span>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <span className="text-xs text-stone-500 dark:text-stone-400">সর্বোচ্চ নম্বর</span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {tabulationData.highestMarks || 0}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400">১ম স্থান অধিকারী</span>
          </div>
        </div>
      )}

      {/* Tabulation Sheet Content */}
      <div
        id="print-tabulation-area"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs"
      >
        {/* Printable Madrasah Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 text-center bg-stone-50 dark:bg-stone-800/40">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            {tabulationData?.examName || currentExam?.name || 'পরীক্ষার নম্বর ফর্দ ও মেধা তালিকা'}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            জামাত: <strong>{tabulationData?.className}</strong> | শিক্ষাবর্ষ:{' '}
            {currentExam?.year || '২০২৫'} | মূল্যায়ন পদ্ধতি:{' '}
            {tabulationData?.gradingSystem === 'QAWMI'
              ? 'কওমি মারহালা পদ্ধতি'
              : 'আলিয়া জিপিএ পদ্ধতি'}
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-stone-500">নম্বর ফর্দ তৈরি হচ্ছে...</div>
        ) : !tabulationData || filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
            <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              কোনো ফলাফল বা নম্বর পাওয়া যায়নি
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              পরীক্ষা ও শ্রেণির নম্বর এন্ট্রি সম্পন্ন না হলে ফলাফল তালিকা প্রদর্শন সম্ভব নয়।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-b border-stone-300 dark:border-stone-700">
                <tr>
                  <th className="px-3 py-2.5 w-12 text-center border-r border-stone-200 dark:border-stone-700">
                    মেধা
                  </th>
                  <th className="px-3 py-2.5 w-12 text-center border-r border-stone-200 dark:border-stone-700">
                    রোল
                  </th>
                  <th className="px-4 py-2.5 border-r border-stone-200 dark:border-stone-700">
                    শিক্ষার্থীর নাম
                  </th>

                  {/* Subject headers */}
                  {tabulationData.subjects.map((sub: any) => (
                    <th
                      key={sub.id}
                      className="px-3 py-2 text-center border-r border-stone-200 dark:border-stone-700 whitespace-nowrap min-w-[90px]"
                    >
                      <div className="font-semibold">{sub.subjectName}</div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        পূর্ণ: {sub.fullMarks} | পাস: {sub.passMarks}
                      </div>
                    </th>
                  ))}

                  <th className="px-3 py-2.5 text-center font-bold border-r border-stone-200 dark:border-stone-700">
                    মোট প্রাপ্ত
                  </th>
                  <th className="px-3 py-2.5 text-center border-r border-stone-200 dark:border-stone-700">
                    শতকরা
                  </th>
                  <th className="px-2 py-2.5 text-center font-bold border-r border-stone-200 dark:border-stone-700">
                    GPA
                  </th>
                  <th className="px-3 py-2.5 text-center font-bold border-r border-stone-200 dark:border-stone-700">
                    গ্রেড / বিভাগ
                  </th>
                  <th className="px-3 py-2.5 text-center border-r border-stone-200 dark:border-stone-700">
                    ফলাফল
                  </th>
                  <th className="px-3 py-2.5 text-center print:hidden">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {filteredStudents.map((std, idx) => (
                  <tr
                    key={std.studentId}
                    className={`hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors ${
                      !std.passed ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-center font-bold text-emerald-700 dark:text-emerald-400 border-r border-stone-200 dark:border-stone-800">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 text-center font-semibold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800">
                      {std.rollNo}
                    </td>
                    <td className="px-4 py-2 font-medium text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800 whitespace-nowrap">
                      {std.studentName}
                    </td>

                    {/* Each subject mark */}
                    {tabulationData.subjects.map((sub: any) => {
                      const sm = std.subjectMarks[sub.id];
                      return (
                        <td
                          key={sub.id}
                          className="px-3 py-2 text-center border-r border-stone-200 dark:border-stone-800"
                        >
                          {sm ? (
                            <div className="space-y-0.5">
                              <span
                                className={`font-semibold ${
                                  sm.isAbsent || !sm.passed
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-stone-900 dark:text-stone-100'
                                }`}
                              >
                                {sm.isAbsent ? 'অনুপস্থিত' : sm.total}
                              </span>
                              <div className="text-[10px] text-stone-500 font-medium">
                                {sm.grade}
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-300 dark:text-stone-700">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total */}
                    <td className="px-3 py-2 text-center font-bold text-sm text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800">
                      {std.obtainedTotal}
                    </td>

                    {/* Percentage */}
                    <td className="px-3 py-2 text-center font-mono text-stone-700 dark:text-stone-300 border-r border-stone-200 dark:border-stone-800">
                      {std.percentage}%
                    </td>

                    {/* GPA */}
                    <td className="px-2 py-2 text-center font-mono font-bold text-stone-900 dark:text-stone-100 border-r border-stone-200 dark:border-stone-800">
                      {std.gpa !== undefined && std.gpa !== null ? std.gpa.toFixed(2) : '—'}
                    </td>

                    {/* Grade */}
                    <td className="px-3 py-2 text-center font-bold border-r border-stone-200 dark:border-stone-800">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          std.passed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {std.overallGrade}
                      </span>
                    </td>

                    {/* Pass/Fail Status */}
                    <td className="px-3 py-2 text-center font-semibold border-r border-stone-200 dark:border-stone-800">
                      {std.passed ? (
                        <span className="text-emerald-600 dark:text-emerald-400">উত্তীর্ণ</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">
                          অনুত্তীর্ণ ({std.failedSubjectsCount} বিষয়)
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-3 py-2 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMarksheetIndex(idx);
                          setIsMarksheetModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-md transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>নম্বরপত্র</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Marksheet Modal */}
      {isMarksheetModalOpen && getSelectedResultEntity() && (
        <StudentMarksheetModal
          isOpen={isMarksheetModalOpen}
          onClose={() => setIsMarksheetModalOpen(false)}
          result={getSelectedResultEntity()}
          tenant={tenant}
          onNextStudent={() => {
            if (activeMarksheetIndex < filteredStudents.length - 1) {
              setActiveMarksheetIndex(activeMarksheetIndex + 1);
            }
          }}
          onPrevStudent={() => {
            if (activeMarksheetIndex > 0) {
              setActiveMarksheetIndex(activeMarksheetIndex - 1);
            }
          }}
          hasNextStudent={activeMarksheetIndex < filteredStudents.length - 1}
          hasPrevStudent={activeMarksheetIndex > 0}
        />
      )}
    </div>
  );
};
