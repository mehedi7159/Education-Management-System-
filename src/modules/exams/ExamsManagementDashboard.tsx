import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Edit,
  FileSpreadsheet,
  TrendingUp,
  Search,
  Settings,
  ShieldAlert,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ExamEntity,
  ClassEntity,
  SectionEntity,
  StaffEntity,
  GradeConfigEntity,
  RoleType,
} from '../../types';
import { ExamListTab } from './components/ExamListTab';
import { StudentRegistrationTab } from './components/StudentRegistrationTab';
import { MarksEntryTab } from './components/MarksEntryTab';
import { TabulationSheetTab } from './components/TabulationSheetTab';
import { ClassPerformanceTab } from './components/ClassPerformanceTab';
import { StudentResultPortal } from './components/StudentResultPortal';
import { GradeConfigTab } from './components/GradeConfigTab';
import { AuditLogsTab } from './components/AuditLogsTab';

export type ExamTabType =
  | 'exams'
  | 'registration'
  | 'marks'
  | 'tabulation'
  | 'performance'
  | 'portal'
  | 'grading'
  | 'audit';

export const ExamsManagementDashboard: React.FC = () => {
  const { tenant, user } = useAuth();
  const { showToast } = useToast();

  const isStudentOrGuardian =
    user?.role === RoleType.STUDENT || user?.role === RoleType.GUARDIAN;
  const isTeacher = user?.role === RoleType.TEACHER;

  // Set default active tab based on user role
  const [activeTab, setActiveTab] = useState<ExamTabType>(
    isStudentOrGuardian ? 'portal' : 'exams'
  );

  // Core entities
  const [exams, setExams] = useState<ExamEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<SectionEntity[]>([]);
  const [teachers, setTeachers] = useState<StaffEntity[]>([]);
  const [gradeConfigs, setGradeConfigs] = useState<GradeConfigEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Contextual drill-down selections
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [examsRes, classesRes, sectionsRes, staffRes, configsRes] = await Promise.all([
        api.getExams(tenant.id),
        api.getClasses(tenant.id),
        api.getSections(tenant.id),
        api.getStaff(tenant.id),
        api.getGradeConfigs(tenant.id),
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

      if (staffRes.success && staffRes.data) {
        setTeachers(staffRes.data);
      }

      if (configsRes.success && configsRes.data) {
        setGradeConfigs(configsRes.data);
      }
    } catch (err: any) {
      showToast('পরীক্ষা মডিউলের ডেটা লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [tenant.id]);

  // Quick navigation helpers
  const handleNavigateToMarksEntry = (examId: string, classId?: string) => {
    setSelectedExamId(examId);
    if (classId) setSelectedClassId(classId);
    setActiveTab('marks');
  };

  const handleNavigateToRegistration = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('registration');
  };

  const handleNavigateToTabulation = (examId: string, classId?: string) => {
    setSelectedExamId(examId);
    if (classId) setSelectedClassId(classId);
    setActiveTab('tabulation');
  };

  return (
    <div id="exams-management-hub" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              পরীক্ষা, ফলাফল ও মেধা মূল্যায়ন সিস্টেম
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
              বেফাক (কওমি) ও আলিয়া জিপিএ
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            স্বয়ংক্রিয় ফলাফল তৈরি, ডায়নামিক গ্রেডিং স্কেল, শ্রেণি পারফরম্যান্স অ্যানালিটিক্স ও প্রিন্ট-রেডি নম্বরপত্র
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium border border-stone-200 dark:border-stone-700">
            মোট পরীক্ষা: <strong className="text-emerald-600 dark:text-emerald-400">{exams.length}</strong> টি
          </span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-1 overflow-x-auto">
        {!isStudentOrGuardian && !isTeacher && (
          <button
            id="tab-btn-exams"
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'exams'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>পরীক্ষার তালিকা ও সময়সূচি</span>
          </button>
        )}

        {!isStudentOrGuardian && !isTeacher && (
          <button
            id="tab-btn-registration"
            type="button"
            onClick={() => setActiveTab('registration')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'registration'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>শিক্ষার্থী নিবন্ধন ও প্রবেশপত্র</span>
          </button>
        )}

        {!isStudentOrGuardian && (
          <button
            id="tab-btn-marks"
            type="button"
            onClick={() => setActiveTab('marks')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'marks'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>নম্বর এন্ট্রি ও মূল্যায়ন</span>
          </button>
        )}

        {!isStudentOrGuardian && (
          <button
            id="tab-btn-tabulation"
            type="button"
            onClick={() => setActiveTab('tabulation')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'tabulation'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ট্যাবুলেশন শিট ও মেধা তালিকা</span>
          </button>
        )}

        {!isStudentOrGuardian && (
          <button
            id="tab-btn-performance"
            type="button"
            onClick={() => setActiveTab('performance')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'performance'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>শ্রেণি পারফরম্যান্স ও বিষয় বিশ্লেষণ</span>
          </button>
        )}

        {/* Student & Guardian Portal Tab */}
        <button
          id="tab-btn-portal"
          type="button"
          onClick={() => setActiveTab('portal')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'portal'
              ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>ফলাফল অনুসন্ধান ও নম্বরপত্র</span>
        </button>

        {!isStudentOrGuardian && !isTeacher && (
          <button
            id="tab-btn-grading"
            type="button"
            onClick={() => setActiveTab('grading')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'grading'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>গ্রেডিং কনফিগারেশন</span>
          </button>
        )}

        {!isStudentOrGuardian && !isTeacher && (
          <button
            id="tab-btn-audit"
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>অডিট লগ ও সংশোধন</span>
          </button>
        )}
      </div>

      {/* Tab Content Panes */}
      <div className="pt-2">
        {activeTab === 'exams' && (
          <ExamListTab
            exams={exams}
            classes={classes}
            teachers={teachers}
            onRefreshExams={loadAllData}
            onNavigateToMarksEntry={handleNavigateToMarksEntry}
            onNavigateToRegistration={handleNavigateToRegistration}
            onNavigateToTabulation={handleNavigateToTabulation}
          />
        )}

        {activeTab === 'registration' && (
          <StudentRegistrationTab
            exams={exams}
            classes={classes}
            sections={sections}
            initialExamId={selectedExamId}
            initialClassId={selectedClassId}
          />
        )}

        {activeTab === 'marks' && (
          <MarksEntryTab
            exams={exams}
            classes={classes}
            sections={sections}
            initialExamId={selectedExamId}
            initialClassId={selectedClassId}
            onNavigateToTabulation={handleNavigateToTabulation}
          />
        )}

        {activeTab === 'tabulation' && (
          <TabulationSheetTab
            exams={exams}
            classes={classes}
            sections={sections}
            initialExamId={selectedExamId}
            initialClassId={selectedClassId}
          />
        )}

        {activeTab === 'performance' && (
          <ClassPerformanceTab
            exams={exams}
            classes={classes}
            initialExamId={selectedExamId}
            initialClassId={selectedClassId}
          />
        )}

        {activeTab === 'portal' && <StudentResultPortal exams={exams} />}

        {activeTab === 'grading' && <GradeConfigTab />}

        {activeTab === 'audit' && <AuditLogsTab exams={exams} />}
      </div>
    </div>
  );
};
