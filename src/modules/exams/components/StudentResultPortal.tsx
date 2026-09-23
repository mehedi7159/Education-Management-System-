import React, { useState, useEffect } from 'react';
import {
  Search,
  Award,
  BookOpen,
  Calendar,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ExamEntity, ResultEntity, RoleType } from '../../../types';
import { StudentMarksheetModal } from './StudentMarksheetModal';

interface StudentResultPortalProps {
  exams: ExamEntity[];
}

export const StudentResultPortal: React.FC<StudentResultPortalProps> = ({ exams }) => {
  const { tenant, user } = useAuth();
  const { showToast } = useToast();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    exams.length > 0 ? exams[0].id : ''
  );
  const [searchRoll, setSearchRoll] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedResult, setSearchedResult] = useState<ResultEntity | null>(null);
  const [publishedExams, setPublishedExams] = useState<ExamEntity[]>([]);
  const [isMarksheetModalOpen, setIsMarksheetModalOpen] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Filter published exams for student/guardian safety
  useEffect(() => {
    const pub = exams.filter((e) => e.status === 'PUBLISHED');
    setPublishedExams(pub);
    if (pub.length > 0 && !selectedExamId) {
      setSelectedExamId(pub[0].id);
    }
  }, [exams]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const isExamPublished = selectedExam?.status === 'PUBLISHED';

  // If user is a student, auto-populate roll or student ID if known
  useEffect(() => {
    if (user?.role === RoleType.STUDENT && (user as any)?.rollNo) {
      setSearchRoll(String((user as any).rollNo));
    }
  }, [user]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedExamId) {
      showToast('অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন', 'warning');
      return;
    }

    if (!searchRoll.trim()) {
      showToast('শিক্ষার্থীর রোল নম্বর বা রেজিস্ট্রেশন নম্বর লিখুন', 'warning');
      return;
    }

    setSearchAttempted(true);
    setIsSearching(true);
    setSearchedResult(null);

    try {
      // Fetch published results for this exam
      const res = await api.getResults(tenant.id, selectedExamId);
      if (res.success && res.data) {
        // Find matching student by roll or ID
        const query = searchRoll.trim().toLowerCase();
        const match = res.data.find(
          (r) =>
            String(r.rollNo) === query ||
            r.studentId.toLowerCase() === query ||
            (r.studentName && r.studentName.toLowerCase().includes(query))
        );

        if (match) {
          // If user is student/guardian, ensure result is published
          if (
            (user?.role === RoleType.STUDENT || user?.role === RoleType.GUARDIAN) &&
            match.status !== 'PUBLISHED'
          ) {
            showToast('এই ফলাফলটি এখনো আনুষ্ঠানিকভাবে প্রকাশিত হয়নি।', 'warning');
            setSearchedResult(null);
          } else {
            setSearchedResult(match);
          }
        } else {
          setSearchedResult(null);
        }
      }
    } catch (err: any) {
      showToast('ফলাফল অনুসন্ধানে সমস্যা হয়েছে', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div id="student-result-portal" className="space-y-6">
      {/* Portal Hero / Search Card */}
      <div className="p-6 sm:p-8 bg-linear-to-br from-emerald-800 to-teal-900 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-medium mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>অফিসিয়াল পাবলিক রেজাল্ট পোর্টাল (ভেরিফায়েড)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            শিক্ষার্থী ও অভিভাবক ফলাফল অনুসন্ধান
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            মাদরাসার অনুমোদিত ও প্রকাশিত পরীক্ষার ফলাফল নম্বরপত্র, জিপিএ, প্রাপ্ত গ্রেড ও মেধা তালিকা দেখুন
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-1/2">
              <select
                id="portal-select-exam"
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  setSearchedResult(null);
                  setSearchAttempted(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white text-stone-900 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.year}) — {ex.status === 'PUBLISHED' ? '✅ প্রকাশিত' : '🔒 অপ্রকাশিত'}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2 relative">
              <input
                id="portal-input-roll"
                type="text"
                placeholder="রোল নম্বর লিখুন (যেমন: ১, ২, ১০১)..."
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white text-stone-900 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              id="portal-btn-search"
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-xs sm:text-sm transition-all shadow-md shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'খোঁজা হচ্ছে...' : 'ফলাফল দেখুন'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Access Restriction or Unavailability Banner */}
      {selectedExam && !isExamPublished && (
        <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sm">এই পরীক্ষার ফলাফল এখনো প্রকাশিত হয়নি</h4>
            <p>
              নির্বাচিত পরীক্ষাটি এখনো মূল্যায়ন অথবা নিরীক্ষণ (REVIEW) পর্যায়ে রয়েছে। মুহতামিম বা পরীক্ষা নিয়ন্ত্রক কর্তৃক চূড়ান্তভাবে প্রকাশের পর এখানে ফলাফল ও নম্বরপত্র দেখতে পাবেন।
            </p>
          </div>
        </div>
      )}

      {/* Result Display Card */}
      {searchedResult ? (
        <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                {searchedResult.rollNo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {searchedResult.studentName}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      searchedResult.passed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {searchedResult.passed ? 'কৃতকার্য (PASSED)' : 'অকৃতকার্য (FAILED)'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  জামাত: {searchedResult.className} | রোল: {searchedResult.rollNo} | পরীক্ষা:{' '}
                  {searchedResult.examName}
                </p>
              </div>
            </div>

            <button
              id="btn-open-student-transcript"
              type="button"
              onClick={() => setIsMarksheetModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>পূর্ণাঙ্গ নম্বরপত্র প্রিন্ট করুন</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">মোট প্রাপ্ত নম্বর</span>
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100 font-mono mt-0.5 block">
                {searchedResult.obtainedMarks} / {searchedResult.totalMarks}
              </span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">শতকরা হার (%)</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
                {searchedResult.percentage}%
              </span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">বিভাগ / গ্রেড</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {searchedResult.gradeBangla || searchedResult.grade}
              </span>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
              <span className="text-[11px] text-stone-500 block">মেধা স্থান / GPA</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                {searchedResult.position ? `${searchedResult.position}ম` : searchedResult.gpa || '—'}
              </span>
            </div>
          </div>

          {/* Subject Breakdown List */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            <div className="p-3 bg-stone-100 dark:bg-stone-800/80 text-xs font-bold text-stone-800 dark:text-stone-200">
              বিষয়ভিত্তিক নম্বর তালিকা
            </div>
            <div className="divide-y divide-stone-200 dark:divide-stone-800 text-xs">
              {searchedResult.subjectMarks && searchedResult.subjectMarks.length > 0 ? (
                searchedResult.subjectMarks.map((sub, idx) => (
                  <div
                    key={sub.subjectId || idx}
                    className="p-3 flex items-center justify-between hover:bg-stone-50/70 dark:hover:bg-stone-800/40"
                  >
                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {sub.subjectName}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        পূর্ণমান: {sub.fullMarks} | পাস নম্বর: {sub.passMarks}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                          {sub.obtainedMarks}
                        </span>
                        <span className="text-[11px] text-stone-500 block">
                          {sub.gradeBangla || sub.grade}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          sub.isPassed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {sub.isPassed ? 'পাস' : 'ফেল'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-stone-400">বিষয়ভিত্তিক তথ্য পাওয়া যায়নি</div>
              )}
            </div>
          </div>
        </div>
      ) : searchAttempted && !isSearching ? (
        <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          <GraduationCap className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
          <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
            কোনো ফলাফল পাওয়া যায়নি
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            অনুগ্রহ করে সঠিক রোল নম্বর ও প্রকাশিত পরীক্ষা নির্বাচন করে পুনরায় চেষ্টা করুন।
          </p>
        </div>
      ) : null}

      {/* Print-Ready Marksheet Modal */}
      {searchedResult && (
        <StudentMarksheetModal
          isOpen={isMarksheetModalOpen}
          onClose={() => setIsMarksheetModalOpen(false)}
          result={searchedResult}
          tenant={tenant}
        />
      )}
    </div>
  );
};
