import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  Users,
  FileSpreadsheet,
  ShieldAlert,
  Edit,
  History,
  RefreshCw,
  Plus,
  Sliders,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ExamEntity,
  ClassEntity,
  SectionEntity,
  StaffEntity,
} from '../../types';

import { ExamListTab } from './components/ExamListTab';
import { MarksEntryTab } from './components/MarksEntryTab';
import { StudentRegistrationTab } from './components/StudentRegistrationTab';
import { TabulationSheetTab } from './components/TabulationSheetTab';
import { GradeConfigTab } from './components/GradeConfigTab';
import { AuditLogsTab } from './components/AuditLogsTab';

export const ExamManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'EXAM_LIST' | 'MARKS_ENTRY' | 'REGISTRATION' | 'TABULATION' | 'GRADE_CONFIG' | 'AUDIT_LOGS'
  >('EXAM_LIST');

  // Shared entity state
  const [exams, setExams] = useState<ExamEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<SectionEntity[]>([]);
  const [teachers, setTeachers] = useState<StaffEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cross-tab selection memory
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [examsRes, classesRes, sectionsRes, teachersRes] = await Promise.all([
        api.getExams(),
        api.getClasses(),
        api.getSections(),
        api.getStaff(),
      ]);

      if (examsRes.success && examsRes.data) {
        setExams(examsRes.data);
        if (examsRes.data.length > 0 && !selectedExamId) {
          setSelectedExamId(examsRes.data[0].id);
        }
      }

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data);
        if (classesRes.data.length > 0 && !selectedClassId) {
          setSelectedClassId(classesRes.data[0].id);
        }
      }

      if (sectionsRes.success && sectionsRes.data) {
        setSections(sectionsRes.data);
      }

      if (teachersRes.success && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
    } catch (err) {
      showToast('পরীক্ষা মডিউলের ডেটা লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNavigateToMarksEntry = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('MARKS_ENTRY');
  };

  const handleNavigateToRegistration = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('REGISTRATION');
  };

  const handleNavigateToTabulation = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('TABULATION');
  };

  return (
    <div id="exam-management-dashboard" className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                পরীক্ষা ও ফলাফল মূল্যায়ন ব্যবস্থাপনা (Exam Management)
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                পরীক্ষা তৈরি, মানবণ্টন, শিক্ষকভিত্তিক নম্বর এন্ট্রি, ফলাফল লক ও অডিট ট্রেইল সহ কওমি ও আলিয়া মূল্যায়ন
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 overflow-x-auto print:hidden">
        <button
          id="tab-btn-exams"
          onClick={() => setActiveTab('EXAM_LIST')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'EXAM_LIST'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>পরীক্ষাসমূহ (Exams)</span>
        </button>

        <button
          id="tab-btn-marks-entry"
          onClick={() => setActiveTab('MARKS_ENTRY')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'MARKS_ENTRY'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Edit className="w-4 h-4" />
          <span>নম্বর এন্ট্রি (Marks Entry)</span>
        </button>

        <button
          id="tab-btn-registration"
          onClick={() => setActiveTab('REGISTRATION')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'REGISTRATION'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>শিক্ষার্থী নিবন্ধন (Registration)</span>
        </button>

        <button
          id="tab-btn-tabulation"
          onClick={() => setActiveTab('TABULATION')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'TABULATION'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>নম্বর ফর্দ ও মেধা তালিকা (Tabulation)</span>
        </button>

        <button
          id="tab-btn-grade-config"
          onClick={() => setActiveTab('GRADE_CONFIG')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'GRADE_CONFIG'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>গ্রেডিং ও জিপিএ কনফিগারেশন</span>
        </button>

        <button
          id="tab-btn-audit-logs"
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>সংশোধন অডিট লগ (Audit Trail)</span>
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'EXAM_LIST' && (
        <ExamListTab
          exams={exams}
          classes={classes}
          teachers={teachers}
          onRefreshExams={loadData}
          onNavigateToMarksEntry={handleNavigateToMarksEntry}
          onNavigateToRegistration={handleNavigateToRegistration}
          onNavigateToTabulation={handleNavigateToTabulation}
        />
      )}

      {activeTab === 'MARKS_ENTRY' && (
        <MarksEntryTab
          exams={exams}
          classes={classes}
          sections={sections}
          initialExamId={selectedExamId}
          initialClassId={selectedClassId}
          onNavigateToTabulation={handleNavigateToTabulation}
        />
      )}

      {activeTab === 'REGISTRATION' && (
        <StudentRegistrationTab
          exams={exams}
          classes={classes}
          sections={sections}
          initialExamId={selectedExamId}
          initialClassId={selectedClassId}
        />
      )}

      {activeTab === 'TABULATION' && (
        <TabulationSheetTab
          exams={exams}
          classes={classes}
          sections={sections}
          initialExamId={selectedExamId}
          initialClassId={selectedClassId}
        />
      )}

      {activeTab === 'GRADE_CONFIG' && <GradeConfigTab />}

      {activeTab === 'AUDIT_LOGS' && <AuditLogsTab exams={exams} />}
    </div>
  );
};
