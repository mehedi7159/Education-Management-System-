import React, { useRef } from 'react';
import {
  Printer,
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { ResultEntity, Tenant } from '../../../types';

interface StudentMarksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResultEntity | null;
  tenant?: Tenant | null;
  onNextStudent?: () => void;
  onPrevStudent?: () => void;
  hasNextStudent?: boolean;
  hasPrevStudent?: boolean;
}

export const StudentMarksheetModal: React.FC<StudentMarksheetModalProps> = ({
  isOpen,
  onClose,
  result,
  tenant,
  onNextStudent,
  onPrevStudent,
  hasNextStudent = false,
  hasPrevStudent = false,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const isQawmi =
    result.gradeBangla?.includes('মুমতাজ') ||
    result.gradeBangla?.includes('জায়্যিদ') ||
    result.gradeBangla?.includes('মাকবুল') ||
    result.gradeBangla?.includes('রাসিব');

  return (
    <div
      id="marksheet-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto"
    >
      <div
        id="marksheet-modal-container"
        className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Modal Top Bar - Hidden on Print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                শিক্ষার্থীর নম্বরপত্র ও একাডেমিক সনদ
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {result.studentName} | রোল: {result.rollNo} | জামাত: {result.className}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Student Navigation */}
            <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden bg-white dark:bg-stone-800 mr-2">
              <button
                type="button"
                onClick={onPrevStudent}
                disabled={!hasPrevStudent}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors"
                title="পূর্ববর্তী শিক্ষার্থী"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs text-stone-500 font-medium border-x border-stone-200 dark:border-stone-700">
                রোল {result.rollNo}
              </span>
              <button
                type="button"
                onClick={onNextStudent}
                disabled={!hasNextStudent}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-30 transition-colors"
                title="পরবর্তী শিক্ষার্থী"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              id="btn-print-marksheet"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>নম্বরপত্র প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Mark Sheet Body */}
        <div
          ref={printRef}
          id="printable-marksheet"
          className="p-6 sm:p-10 overflow-y-auto print:p-6 print:overflow-visible bg-white text-stone-900 font-sans"
        >
          {/* Madrasah Header Banner */}
          <div className="text-center pb-6 border-b-2 border-emerald-800/80">
            <p className="text-sm font-arabic font-medium text-emerald-900 tracking-wider mb-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {tenant?.nameBangla || tenant?.nameEnglish || 'জামিয়া ইসলামিয়া দারুল উলুম মাদরাসা'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-arabic mt-0.5">
              الجامعة الإسلامية دار العلوم • قسم الامتحانات والاختبارات
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {tenant?.address || 'মিরপুর, ঢাকা - ১২১৬'}
              {(tenant as any)?.bafaqRegNo && ` | বেফাক অন্তর্ভুক্তি নং: ${(tenant as any).bafaqRegNo}`}
            </p>

            <div className="inline-block mt-3 px-5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold tracking-wide uppercase">
              একাডেমিক ট্রান্সক্রিপ্ট ও নম্বরপত্র (ACADEMIC TRANSCRIPT)
            </div>
            <p className="text-xs font-semibold text-stone-700 mt-1">
              {result.examName || 'বার্ষিক পরীক্ষা'} • শিক্ষাবর্ষ: {result.academicYear || '২০২৫'}
            </p>
          </div>

          {/* Student Profile Info Grid */}
          <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block text-[11px]">শিক্ষার্থীর নাম:</span>
              <span className="font-bold text-stone-900 text-sm">{result.studentName}</span>
              {result.studentNameEnglish && (
                <span className="text-[10px] text-stone-500 block font-mono">
                  {result.studentNameEnglish}
                </span>
              )}
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">রোল নম্বর:</span>
              <span className="font-bold text-stone-900 text-sm font-mono">{result.rollNo}</span>
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">জামাত / শ্রেণি:</span>
              <span className="font-bold text-stone-900 text-sm">{result.className}</span>
              {result.sectionName && (
                <span className="text-[10px] text-stone-500 block">শাখা: {result.sectionName}</span>
              )}
            </div>

            <div>
              <span className="text-stone-500 block text-[11px]">পিতা / অভিভাবক:</span>
              <span className="font-semibold text-stone-900">
                {result.guardianName || 'তথ্য সংরক্ষিত'}
              </span>
              {result.guardianMobile && (
                <span className="text-[10px] text-stone-500 block font-mono">
                  {result.guardianMobile}
                </span>
              )}
            </div>
          </div>

          {/* Subject-Wise Marks Breakdown Table */}
          <div className="overflow-x-auto border border-stone-300 rounded-xl overflow-hidden my-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-stone-100 text-stone-800 font-semibold border-b border-stone-300">
                <tr>
                  <th className="px-3 py-2.5 w-10 text-center border-r border-stone-300">ক্র.</th>
                  <th className="px-3 py-2.5 border-r border-stone-300">বিষয়ের নাম</th>
                  <th className="px-2 py-2.5 text-center w-16 border-r border-stone-300">পূর্ণমান</th>
                  <th className="px-2 py-2.5 text-center w-16 border-r border-stone-300">পাস নম্বর</th>
                  <th className="px-2 py-2.5 text-center w-16 border-r border-stone-300">লিখিত</th>
                  <th className="px-2 py-2.5 text-center w-16 border-r border-stone-300">মৌখিক</th>
                  <th className="px-2 py-2.5 text-center w-16 border-r border-stone-300">নৈর্ব্যক্তিক</th>
                  <th className="px-3 py-2.5 text-center w-20 font-bold border-r border-stone-300 bg-stone-200/50">
                    প্রাপ্ত নম্বর
                  </th>
                  <th className="px-3 py-2.5 text-center w-24 border-r border-stone-300">
                    বিভাগ / গ্রেড
                  </th>
                  <th className="px-2 py-2.5 text-center w-14 border-r border-stone-300">জিপিএ</th>
                  <th className="px-2 py-2.5 text-center w-16">ফলাফল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {result.subjectMarks && result.subjectMarks.length > 0 ? (
                  result.subjectMarks.map((sub, idx) => (
                    <tr
                      key={sub.subjectId || idx}
                      className={!sub.isPassed ? 'bg-rose-50/50' : 'hover:bg-stone-50/40'}
                    >
                      <td className="px-3 py-2 text-center text-stone-500 border-r border-stone-200 font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-medium border-r border-stone-200">
                        {sub.subjectName}
                        {sub.subjectCode && (
                          <span className="text-[10px] text-stone-400 font-mono ml-1.5">
                            ({sub.subjectCode})
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center border-r border-stone-200 font-mono">
                        {sub.fullMarks}
                      </td>
                      <td className="px-2 py-2 text-center border-r border-stone-200 font-mono text-stone-500">
                        {sub.passMarks}
                      </td>
                      <td className="px-2 py-2 text-center border-r border-stone-200 font-mono">
                        {sub.writtenMarks !== undefined ? sub.writtenMarks : '—'}
                      </td>
                      <td className="px-2 py-2 text-center border-r border-stone-200 font-mono">
                        {sub.oralMarks !== undefined ? sub.oralMarks : '—'}
                      </td>
                      <td className="px-2 py-2 text-center border-r border-stone-200 font-mono">
                        {sub.mcqMarks !== undefined ? sub.mcqMarks : '—'}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-stone-900 border-r border-stone-200 bg-stone-50 font-mono">
                        {sub.obtainedMarks}
                      </td>
                      <td className="px-3 py-2 text-center border-r border-stone-200 font-medium">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                            sub.isPassed
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sub.gradeBangla || sub.grade}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center font-mono font-medium border-r border-stone-200">
                        {sub.gpaPoint !== undefined ? sub.gpaPoint.toFixed(1) : '—'}
                      </td>
                      <td className="px-2 py-2 text-center font-semibold text-[11px]">
                        {sub.isPassed ? (
                          <span className="text-emerald-700">উত্তীর্ণ</span>
                        ) : (
                          <span className="text-rose-600">অনুত্তীর্ণ</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-stone-400">
                      কোনো বিষয়ভিত্তিক নম্বরের বিবরণ পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-stone-100 font-bold border-t-2 border-stone-300 text-stone-900">
                <tr>
                  <td colSpan={2} className="px-3 py-2.5 text-right border-r border-stone-300">
                    সর্বমোট / সামগ্রিক মূল্যায়ন:
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono border-r border-stone-300">
                    {result.totalMarks}
                  </td>
                  <td className="px-2 py-2.5 text-center text-stone-400 border-r border-stone-300">
                    —
                  </td>
                  <td colSpan={3} className="border-r border-stone-300"></td>
                  <td className="px-3 py-2.5 text-center font-mono text-emerald-800 bg-emerald-50 border-r border-stone-300 text-sm">
                    {result.obtainedMarks}
                  </td>
                  <td className="px-3 py-2.5 text-center border-r border-stone-300">
                    {result.gradeBangla || result.grade}
                  </td>
                  <td className="px-2 py-2.5 text-center font-mono border-r border-stone-300 text-emerald-800">
                    {result.gpa ? result.gpa.toFixed(2) : '—'}
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    {result.passed ? (
                      <span className="text-emerald-700">কৃতকার্য</span>
                    ) : (
                      <span className="text-rose-600">অকৃতকার্য</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Academic Result Highlights & Grading Scale */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            {/* KPI Summary Block */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <h4 className="text-xs font-bold text-stone-800 border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                ফলাফলের সারাংশ
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">শতকরা হার</span>
                  <span className="text-base font-bold text-stone-900 font-mono">
                    {result.percentage}%
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">প্রাপ্ত জিপিএ</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    {result.gpa ? result.gpa.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">বিভাগ / মারহালা</span>
                  <span className="text-xs font-bold text-stone-900">
                    {result.gradeBangla || result.grade}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">মেধা স্থান</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">
                    {result.position ? `${result.position}ম` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Grading Scale Reference Box */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <h4 className="text-xs font-bold text-stone-800 border-b border-stone-200 pb-1.5 mb-2">
                {isQawmi ? 'কওমি মারহালা গ্রেডিং পদ্ধতি' : 'আলিয়া জিপিএ মূল্যায়ন পদ্ধতি'}
              </h4>
              <div className="text-[11px] space-y-1 text-stone-600">
                {isQawmi ? (
                  <>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-emerald-700">মুমতাজ (Mumtaz - Star)</span>
                      <span>৮০% - ১০০%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-blue-700">জায়্যিদ জিদ্দান (1st Div)</span>
                      <span>৬৫% - ৭৯%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-amber-700">জায়্যিদ (2nd Div)</span>
                      <span>৫০% - ৬৪%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-stone-700">মাকবুল (Pass Div)</span>
                      <span>৩৩% - ৪৯%</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-rose-600 font-semibold">
                      <span>রাসিব (Fail)</span>
                      <span>০% - ৩২%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-emerald-700">A+ (GPA 5.00)</span>
                      <span>৮০% - ১০০%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-blue-700">A (GPA 4.00)</span>
                      <span>৭০% - ৭৯%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-cyan-700">A- (GPA 3.50)</span>
                      <span>৬০% - ৬৯%</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                      <span className="font-semibold text-amber-700">B, C, D (Pass)</span>
                      <span>৩৩% - ৫৯%</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-rose-600 font-semibold">
                      <span>F (Fail)</span>
                      <span>০% - ৩২%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Remarks & Conduct */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-stone-800 border-b border-stone-200 pb-1.5 mb-2">
                  শিক্ষকের মন্তব্য ও আচরণ মূল্যায়ন
                </h4>
                <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-700 italic min-h-[60px]">
                  "{result.remarks || (result.passed ? 'পরবর্তী জামাতে উত্তীর্ণ ও সন্তোষজনক ফলাফল।' : 'পুনঃমূল্যায়ন আবশ্যক।')}"
                </div>
              </div>
              <div className="mt-2 text-[10px] text-stone-400">
                ফলাফল প্রকাশের তারিখ: {result.publishedAt ? result.publishedAt.substring(0, 10) : '২০২৫-০৯-২২'}
              </div>
            </div>
          </div>

          {/* Official Signature Lines */}
          <div className="mt-14 pt-6 border-t border-stone-300 grid grid-cols-3 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div className="h-8 border-b border-dashed border-stone-400 mx-auto w-3/4"></div>
              <span className="font-bold text-stone-800 block">শ্রেণি শিক্ষক</span>
              <span className="text-[10px] text-stone-400">স্বাক্ষর ও তারিখ</span>
            </div>

            <div className="space-y-1">
              <div className="h-8 border-b border-dashed border-stone-400 mx-auto w-3/4"></div>
              <span className="font-bold text-stone-800 block">পরীক্ষা নিয়ন্ত্রক</span>
              <span className="text-[10px] text-stone-400">স্বাক্ষর ও তারিখ</span>
            </div>

            <div className="space-y-1">
              <div className="h-8 border-b border-dashed border-stone-400 mx-auto w-3/4"></div>
              <span className="font-bold text-stone-800 block">মুহতামিম / অধ্যক্ষ</span>
              <span className="text-[10px] text-stone-400">অফিসিয়াল সিলমোহর</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-3 border-t border-stone-200 text-center text-[10px] text-stone-400">
            * এটি একটি অফিসিয়াল কম্পিউটার জেনারেটেড সনদপত্র। কোনো প্রকার কাটাকাটি বা ঘষামাজা গ্রহণযোগ্য নয়।
          </div>
        </div>
      </div>
    </div>
  );
};
