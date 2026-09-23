import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  BookOpen,
  Users,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  ExamEntity,
  ExamType,
  ExamWorkflowStatus,
  ClassEntity,
  StaffEntity,
  RoleType,
} from '../../../types';
import { ExamStatusBadge } from './ExamStatusBadge';
import { ExamSubjectsModal } from './ExamSubjectsModal';

interface ExamListTabProps {
  exams: ExamEntity[];
  classes: ClassEntity[];
  teachers: StaffEntity[];
  onRefreshExams: () => void;
  onNavigateToMarksEntry: (examId: string) => void;
  onNavigateToRegistration: (examId: string) => void;
  onNavigateToTabulation: (examId: string) => void;
}

export const ExamListTab: React.FC<ExamListTabProps> = ({
  exams,
  classes,
  teachers,
  onRefreshExams,
  onNavigateToMarksEntry,
  onNavigateToRegistration,
  onNavigateToTabulation,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Exam Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examName, setExamName] = useState('');
  const [examNameEnglish, setExamNameEnglish] = useState('');
  const [examNameArabic, setExamNameArabic] = useState('');
  const [examType, setExamType] = useState<ExamType>('TERMINAL_1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [academicSession, setAcademicSession] = useState('2025');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [gradingSystem, setGradingSystem] = useState<'QAWMI' | 'ALIA' | 'CUSTOM'>('QAWMI');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Subject Modal
  const [subjectsModalExam, setSubjectsModalExam] = useState<ExamEntity | null>(null);

  const isAdminOrMuhtamim =
    user?.role === RoleType.SUPER_ADMIN ||
    user?.role === RoleType.INSTITUTION_ADMIN ||
    user?.role === RoleType.MUHTAMIM;

  const resetForm = () => {
    setEditingExamId(null);
    setExamName('');
    setExamNameEnglish('');
    setExamNameArabic('');
    setExamType('TERMINAL_1');
    setYear(new Date().getFullYear());
    setAcademicSession('2025');
    setStartDate('');
    setEndDate('');
    setHijriDate('');
    setGradingSystem('QAWMI');
    setDescription('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: ExamEntity) => {
    setEditingExamId(e.id);
    setExamName(e.name);
    setExamNameEnglish(e.nameEnglish || '');
    setExamNameArabic(e.nameArabic || '');
    setExamType((e.type as ExamType) || 'TERMINAL_1');
    setYear(e.year || new Date().getFullYear());
    setAcademicSession(e.academicSession || String(e.year || new Date().getFullYear()));
    setStartDate(e.startDate || '');
    setEndDate(e.endDate || '');
    setHijriDate(e.hijriDate || '');
    const gs = (e.gradingSystem?.startsWith('ALIA') ? 'ALIA' : e.gradingSystem?.startsWith('QAWMI') ? 'QAWMI' : 'CUSTOM') as 'QAWMI' | 'ALIA' | 'CUSTOM';
    setGradingSystem(gs);
    setDescription(e.description || '');
    setIsModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      showToast('পরীক্ষার নাম আবশ্যক', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (editingExamId) {
        const res = await api.updateExam(editingExamId, {
          name: examName.trim(),
          nameEnglish: examNameEnglish.trim() || undefined,
          nameArabic: examNameArabic.trim() || undefined,
          type: examType,
          year: Number(year) || new Date().getFullYear(),
          academicSession: academicSession.trim(),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          hijriDate: hijriDate.trim() || undefined,
          gradingSystem,
          description: description.trim() || undefined,
        });

        if (res.success) {
          showToast('পরীক্ষার বিবরণ আপডেট হয়েছে', 'success');
          setIsModalOpen(false);
          onRefreshExams();
        } else {
          showToast(res.error?.message || 'আপডেট করতে ব্যর্থ', 'error');
        }
      } else {
        const res = await api.createExam({
          name: examName.trim(),
          nameEnglish: examNameEnglish.trim() || undefined,
          nameArabic: examNameArabic.trim() || undefined,
          type: examType,
          year: Number(year) || new Date().getFullYear(),
          academicSession: academicSession.trim(),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          hijriDate: hijriDate.trim() || undefined,
          gradingSystem,
          description: description.trim() || undefined,
        });

        if (res.success) {
          showToast('নতুন পরীক্ষা তৈরি হয়েছে', 'success');
          setIsModalOpen(false);
          onRefreshExams();
        } else {
          showToast(res.error?.message || 'তৈরি করতে ব্যর্থ', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExam = async (id: string, name: string) => {
    if (!isAdminOrMuhtamim) {
      showToast('শুধুমাত্র মুহতামিম বা অ্যাডমিন পরীক্ষা মুছতে পারেন।', 'error');
      return;
    }
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${name}' পরীক্ষাটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await api.deleteExam(id);
      if (res.success) {
        showToast('পরীক্ষা মুছে ফেলা হয়েছে', 'info');
        onRefreshExams();
      } else {
        showToast(res.error?.message || 'মুছতে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    }
  };

  // Workflow transition handler
  const handleWorkflowAdvance = async (exam: ExamEntity, nextStatus: ExamWorkflowStatus) => {
    if (!isAdminOrMuhtamim) {
      showToast('শুধুমাত্র মুহতামিম বা অনুমোদিত পরীক্ষা কর্তৃপক্ষ স্ট্যাটাস পরিবর্তন করতে পারেন।', 'error');
      return;
    }

    let message = `আপনি কি পরীক্ষার স্ট্যাটাস '${nextStatus}' এ পরিবর্তন করতে চান?`;
    if (nextStatus === 'LOCKED') {
      message = 'সতর্কতা: ফলাফল লকড করলে সাধারণ শিক্ষক বা ব্যবহারকারী আর কোনো নম্বর এন্ট্রি বা সংশোধন করতে পারবেন না। আপনি কি নিশ্চিত?';
    } else if (nextStatus === 'PUBLISHED') {
      message = 'ফলাফল প্রকাশিত (PUBLISHED) করলে সকল শিক্ষার্থী ও অভিভাবক তাদের ফলাফল কার্ড দেখতে পারবে। আপনি কি নিশ্চিত?';
    }

    if (!window.confirm(message)) return;

    try {
      const res = await api.updateExamWorkflowStatus(exam.id, nextStatus);
      if (res.success) {
        showToast(`পরীক্ষার স্ট্যাটাস '${nextStatus}' এ পরিবর্তিত হয়েছে`, 'success');
        onRefreshExams();
      } else {
        showToast(res.error?.message || 'স্ট্যাটাস পরিবর্তনে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    }
  };

  const filteredExams = exams.filter((ex) => {
    if (statusFilter !== 'ALL' && ex.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && ex.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        (ex.nameEnglish && ex.nameEnglish.toLowerCase().includes(q)) ||
        (ex.academicSession && ex.academicSession.toLowerCase().includes(q)) ||
        String(ex.year).includes(q)
      );
    }
    return true;
  });

  return (
    <div id="exam-list-tab" className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">সর্বমোট পরীক্ষা</span>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {exams.length} টি
          </div>
          <span className="text-[11px] text-stone-400">বর্তমান শিক্ষাবর্ষ</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">নম্বর এন্ট্রি চলমান</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {exams.filter((e) => e.status === 'MARKS_ENTRY').length} টি
          </div>
          <span className="text-[11px] text-blue-600">মূল্যায়ন পর্যায়</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">ফলাফল লকড ও সুরক্ষিত</span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {exams.filter((e) => e.status === 'LOCKED').length} টি
          </div>
          <span className="text-[11px] text-purple-600">যাচাই সম্পন্ন</span>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs text-stone-500 dark:text-stone-400">ফলাফল প্রকাশিত</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {exams.filter((e) => e.status === 'PUBLISHED').length} টি
          </div>
          <span className="text-[11px] text-emerald-600">রিপোর্ট কার্ড প্রস্তুত</span>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              id="input-search-exams"
              type="text"
              placeholder="পরীক্ষার নাম বা সন দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            />
          </div>

          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
          >
            <option value="ALL">সকল স্ট্যাটাস</option>
            <option value="DRAFT">খসড়া (Draft)</option>
            <option value="MARKS_ENTRY">নম্বর এন্ট্রি (Marks Entry)</option>
            <option value="VERIFICATION">যাচাইকরণ (Verification)</option>
            <option value="LOCKED">লকড (Locked)</option>
            <option value="PUBLISHED">প্রকাশিত (Published)</option>
          </select>

          <select
            id="select-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
          >
            <option value="ALL">সকল পরীক্ষার ধরন</option>
            <option value="TERMINAL_1">১ম সাময়িক / শাশমাহী</option>
            <option value="TERMINAL_2">২য় সাময়িক</option>
            <option value="ANNUAL">বার্ষিক পরীক্ষা / সালাCache</option>
            <option value="MONTHLY">মাসিক মূল্যায়ন</option>
            <option value="MODEL_TEST">মডেল টেস্ট</option>
            <option value="HIFZ_COMPLETION">হিফজ সমাপনী পরীক্ষা</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrMuhtamim && (
            <button
              id="btn-create-exam"
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পরীক্ষা তৈরি করুন</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefreshExams}
            className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 rounded-lg transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Exam Cards List */}
      <div className="space-y-4">
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            <Calendar className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
            <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              কোনো পরীক্ষা পাওয়া যায়নি
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              নতুন পরীক্ষা তৈরি করতে 'নতুন পরীক্ষা তৈরি করুন' বাটনে ক্লিক করুন।
            </p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                      {exam.name}
                    </h3>
                    <ExamStatusBadge status={exam.status} isLocked={exam.isLocked} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {exam.academicSession || exam.year}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                    <span>
                      মূল্যায়ন মানদণ্ড:{' '}
                      <strong className="text-stone-700 dark:text-stone-300">
                        {exam.gradingSystem === 'QAWMI'
                          ? 'কওমি মারহালা (বেফাক)'
                          : 'আলিয়া জিপিএ ৫.০'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      তারিখ:{' '}
                      {exam.startDate ? `${exam.startDate} হতে ${exam.endDate || ''}` : 'নির্ধারিত হয়নি'}
                    </span>
                    {exam.hijriDate && (
                      <>
                        <span>•</span>
                        <span className="text-stone-600 dark:text-stone-300 font-arabic">
                          হিজরি: {exam.hijriDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit / Delete actions */}
                {isAdminOrMuhtamim && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1.5 text-stone-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="সম্পাদনা"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id, exam.name)}
                      className="p-1.5 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Workflow Stepper Bar */}
              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-medium">ওয়ার্কফ্লো ধাপ:</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        exam.status === 'DRAFT'
                          ? 'bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-100 font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      ১. খসড়া
                    </span>
                    <ArrowRight className="w-3 h-3 text-stone-300" />
                    <span
                      className={`px-2 py-0.5 rounded ${
                        exam.status === 'MARKS_ENTRY'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      ২. নম্বর এন্ট্রি
                    </span>
                    <ArrowRight className="w-3 h-3 text-stone-300" />
                    <span
                      className={`px-2 py-0.5 rounded ${
                        exam.status === 'VERIFICATION'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      ৩. যাচাইকরণ
                    </span>
                    <ArrowRight className="w-3 h-3 text-stone-300" />
                    <span
                      className={`px-2 py-0.5 rounded ${
                        exam.status === 'LOCKED'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      ৪. লকড
                    </span>
                    <ArrowRight className="w-3 h-3 text-stone-300" />
                    <span
                      className={`px-2 py-0.5 rounded ${
                        exam.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                          : 'text-stone-400'
                      }`}
                    >
                      ৫. প্রকাশিত
                    </span>
                  </div>
                </div>

                {/* Workflow advance button */}
                {isAdminOrMuhtamim && (
                  <div className="flex items-center gap-2">
                    {exam.status === 'DRAFT' && (
                      <button
                        onClick={() => handleWorkflowAdvance(exam, 'MARKS_ENTRY')}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        <span>নম্বর এন্ট্রি শুরু করুন</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {exam.status === 'MARKS_ENTRY' && (
                      <button
                        onClick={() => handleWorkflowAdvance(exam, 'VERIFICATION')}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                      >
                        <span>যাচাইকরণে পাঠান</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {exam.status === 'VERIFICATION' && (
                      <button
                        onClick={() => handleWorkflowAdvance(exam, 'LOCKED')}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                      >
                        <Lock className="w-3 h-3" />
                        <span>ফলাফল লক করুন (Lock Marks)</span>
                      </button>
                    )}

                    {exam.status === 'LOCKED' && (
                      <>
                        <button
                          onClick={() => handleWorkflowAdvance(exam, 'PUBLISHED')}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ফলাফল প্রকাশ করুন</span>
                        </button>
                        <button
                          onClick={() => handleWorkflowAdvance(exam, 'MARKS_ENTRY')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-md hover:bg-purple-100 transition-colors"
                          title="মুহতামিম বিশেষ আনলক"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>আনলক করুন</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Functional Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSubjectsModalExam(exam)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>বিষয় ও মানবণ্টন</span>
                  </button>

                  <button
                    onClick={() => onNavigateToRegistration(exam.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>শিক্ষার্থী নিবন্ধন</span>
                  </button>

                  <button
                    onClick={() => onNavigateToMarksEntry(exam.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-600" />
                    <span>নম্বর এন্ট্রি</span>
                  </button>

                  <button
                    onClick={() => onNavigateToTabulation(exam.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
                    <span>নম্বর ফর্দ ও মেধা তালিকা</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Exam Modal */}
      {isModalOpen && (
        <div
          id="modal-create-exam"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {editingExamId ? 'পরীক্ষার বিবরণ সম্পাদনা' : 'নতুন পরীক্ষা তৈরি করুন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    পরীক্ষার নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ১ম সাময়িক পরীক্ষা / শাশমাহী ২০২৫"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    পরীক্ষার নাম (ইংরেজি)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1st Terminal Exam 2025"
                    value={examNameEnglish}
                    onChange={(e) => setExamNameEnglish(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    পরীক্ষার নাম (আরবি)
                  </label>
                  <input
                    type="text"
                    placeholder="الإمتحان النصف السنوي"
                    value={examNameArabic}
                    onChange={(e) => setExamNameArabic(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-arabic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    পরীক্ষার ধরন (Exam Type)
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExamType)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  >
                    <option value="TERMINAL_1">১ম সাময়িক / শাশমাহী</option>
                    <option value="TERMINAL_2">২য় সাময়িক</option>
                    <option value="ANNUAL">বার্ষিক পরীক্ষা / সালাCache</option>
                    <option value="MONTHLY">মাসিক মূল্যায়ন</option>
                    <option value="MODEL_TEST">মডেল টেস্ট</option>
                    <option value="HIFZ_COMPLETION">হিফজ সমাপনী পরীক্ষা</option>
                    <option value="QAWMI_CENTRAL">কওমি কেন্দ্রীয় / বেফাক</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    মূল্যায়ন পদ্ধতি (Grading System)
                  </label>
                  <select
                    value={gradingSystem}
                    onChange={(e) => setGradingSystem(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  >
                    <option value="QAWMI">কওমি মারহালা পদ্ধতি (মুমতাজ, জায়্যিদ জিদ্দান...)</option>
                    <option value="ALIA">আলিয়া জিপিএ পদ্ধতি (GPA 5.0 Scale)</option>
                    <option value="CUSTOM">কাস্টম প্রতিষ্ঠান পদ্ধতি</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    সমাপ্তির তারিখ
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    শিক্ষাবর্ষ / সেশন
                  </label>
                  <input
                    type="text"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    placeholder="2025"
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    হিজরি সেশন / তারিখ
                  </label>
                  <input
                    type="text"
                    value={hijriDate}
                    onChange={(e) => setHijriDate(e.target.value)}
                    placeholder="১৪৪৬ হিজরি"
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    বর্ণনা / বিশেষ নির্দেশনা
                  </label>
                  <textarea
                    rows={2}
                    placeholder="পরীক্ষা সংক্রান্ত যেকোনো সাধারণ নির্দেশনা বা নোট..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'সংরক্ষিত হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subjects Modal */}
      {subjectsModalExam && (
        <ExamSubjectsModal
          isOpen={!!subjectsModalExam}
          onClose={() => setSubjectsModalExam(null)}
          exam={subjectsModalExam}
          classes={classes}
          teachers={teachers}
          onSubjectsUpdated={onRefreshExams}
        />
      )}
    </div>
  );
};
