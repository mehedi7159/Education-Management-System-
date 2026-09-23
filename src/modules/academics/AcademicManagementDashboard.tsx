import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Layers,
  GraduationCap,
  Clock,
  BookOpen,
  UserCheck,
  FileText,
  Sparkles,
  Plus,
  RefreshCw,
  Award,
  Settings,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../i18n';
import {
  AcademicSession,
  DepartmentConfig,
  ClassEntity,
  SectionEntity,
  ShiftEntity,
  SubjectEntity,
  ClassSubjectEntity,
  TeacherSubjectAssignmentEntity,
  SyllabusEntity,
  AcademicCalendarEventEntity,
  RoleType,
} from '../../types';
import { cn } from '../../utils/cn';

import { AcademicSessionsTab } from './components/AcademicSessionsTab';
import { DepartmentsTab } from './components/DepartmentsTab';
import { ClassesSectionsTab } from './components/ClassesSectionsTab';
import { ShiftsTab } from './components/ShiftsTab';
import { SubjectsTab } from './components/SubjectsTab';
import { ClassSubjectAssignmentTab } from './components/ClassSubjectAssignmentTab';
import { TeacherSubjectAssignmentTab } from './components/TeacherSubjectAssignmentTab';
import { SyllabusManagementTab } from './components/SyllabusManagementTab';
import { AcademicCalendarTab } from './components/AcademicCalendarTab';
import { RoutineBuilderTab } from './components/RoutineBuilderTab';
import { InstitutionPresetModal } from './components/InstitutionPresetModal';

export const AcademicManagementDashboard: React.FC = () => {
  const { user, tenant, hasPermission } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<
    | 'CLASSES_SECTIONS'
    | 'ROUTINES'
    | 'DEPARTMENTS'
    | 'SUBJECTS'
    | 'CLASS_SUBJECTS'
    | 'TEACHER_SUBJECTS'
    | 'SYLLABUS'
    | 'CALENDAR'
    | 'SESSIONS'
    | 'SHIFTS'
  >('CLASSES_SECTIONS');

  const [isLoading, setIsLoading] = useState(true);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  // Entities state
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [departments, setDepartments] = useState<DepartmentConfig[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<SectionEntity[]>([]);
  const [shifts, setShifts] = useState<ShiftEntity[]>([]);
  const [subjects, setSubjects] = useState<SubjectEntity[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubjectEntity[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherSubjectAssignmentEntity[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [syllabuses, setSyllabuses] = useState<SyllabusEntity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEventEntity[]>([]);

  // Permission check: Admin or Head Teacher or Super Admin
  const canManage =
    user?.role === RoleType.SUPER_ADMIN ||
    user?.role === RoleType.INSTITUTION_ADMIN ||
    user?.role === RoleType.MUHTAMIM ||
    hasPermission('MANAGE_CLASSES' as any);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        sessionsRes,
        deptRes,
        classesRes,
        sectionsRes,
        shiftsRes,
        subjectsRes,
        csRes,
        taRes,
        sylRes,
        calRes,
        staffRes,
      ] = await Promise.all([
        api.getAcademicSessions(),
        api.getDepartments(),
        api.getClasses(),
        api.getSections(),
        api.getShifts(),
        api.getSubjects(),
        api.getClassSubjects(),
        api.getTeacherAssignments(),
        api.getSyllabuses(),
        api.getAcademicCalendarEvents(),
        api.getStaff ? api.getStaff() : Promise.resolve({ success: true, data: [] }),
      ]);

      if (sessionsRes.success && sessionsRes.data) setSessions(sessionsRes.data);
      if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
      if (classesRes.success && classesRes.data) setClasses(classesRes.data);
      if (sectionsRes.success && sectionsRes.data) setSections(sectionsRes.data);
      if (shiftsRes.success && shiftsRes.data) setShifts(shiftsRes.data);
      if (subjectsRes.success && subjectsRes.data) setSubjects(subjectsRes.data);
      if (csRes.success && csRes.data) setClassSubjects(csRes.data);
      if (taRes.success && taRes.data) setTeacherAssignments(taRes.data);
      if (sylRes.success && sylRes.data) setSyllabuses(sylRes.data);
      if (calRes.success && calRes.data) setCalendarEvents(calRes.data);
      if (staffRes?.success && staffRes.data) {
        setTeachers(staffRes.data);
      }
    } catch (err) {
      console.error('Failed to load academic management data:', err);
      showToast('অ্যাকাডেমিক তথ্য লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute classes count by department
  const classesCountByDept: Record<string, number> = {};
  classes.forEach((c) => {
    classesCountByDept[c.department] = (classesCountByDept[c.department] || 0) + 1;
  });

  const currentSession = sessions.find((s) => s.isCurrent) || sessions[0];

  const navTabs = [
    { id: 'CLASSES_SECTIONS', label: 'শ্রেণি ও শাখা', icon: GraduationCap, count: classes.length },
    { id: 'ROUTINES', label: 'ক্লাস রুটিন ও সময়সূচি', icon: Clock, count: 'নতুন' },
    { id: 'DEPARTMENTS', label: 'বিভাগ ও অনুষদ', icon: Layers, count: departments.length },
    { id: 'SUBJECTS', label: 'কিতাব ও বিষয় ভাণ্ডার', icon: BookOpen, count: subjects.length },
    { id: 'CLASS_SUBJECTS', label: 'শ্রেণি কারিকুলাম', icon: BookOpen, count: classSubjects.length },
    { id: 'TEACHER_SUBJECTS', label: 'ওস্তাদজি বণ্টন', icon: UserCheck, count: teacherAssignments.length },
    { id: 'SYLLABUS', label: 'সিলেবাস ও সবক', icon: FileText, count: syllabuses.length },
    { id: 'CALENDAR', label: 'বার্ষিক ক্যালেন্ডার', icon: Calendar, count: calendarEvents.length },
    { id: 'SESSIONS', label: 'শিক্ষাবর্ষ ও সেশন', icon: Calendar, count: sessions.length },
    { id: 'SHIFTS', label: 'শিফট ও সময়সূচি', icon: Clock, count: shifts.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Metrics */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Academic Management Suite &bull; Phase 16</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              একাডেমিক কাঠামো ও পাঠ্যক্রম ব্যবস্থাপনা
            </h1>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
              কওমি, হিফজ, নূরানী ও আলিয়া মাদ্রাসার জামাত, শাখা, দরসে নিজামী কিতাব, ওস্তাদজি বণ্টন, সিলেবাস ও বার্ষিক অ্যাকাডেমিক ক্যালেন্ডার কনফিগারেশন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              মাদ্রাসা প্রিসেট লোড করুন
            </button>

            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl transition-colors border border-white/10 backdrop-blur-xs"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-white/5 backdrop-blur-xs rounded-lg p-2.5 border border-white/5">
            <span className="text-[11px] text-emerald-200 block">বর্তমান সেশন</span>
            <span className="text-sm font-bold text-white truncate block">
              {currentSession?.sessionName || currentSession?.name || '২০২৫-২০২৬'}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-lg p-2.5 border border-white/5">
            <span className="text-[11px] text-emerald-200 block">মোট জামাত/শ্রেণি</span>
            <span className="text-sm font-bold text-white">{classes.length} টি</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-lg p-2.5 border border-white/5">
            <span className="text-[11px] text-emerald-200 block">শাখা ও গ্রুপ</span>
            <span className="text-sm font-bold text-white">{sections.length} টি শাখা</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-lg p-2.5 border border-white/5">
            <span className="text-[11px] text-emerald-200 block">কিতাব ও বিষয়</span>
            <span className="text-sm font-bold text-white">{subjects.length} টি</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-lg p-2.5 border border-white/5">
            <span className="text-[11px] text-emerald-200 block">শিক্ষক বণ্টন</span>
            <span className="text-sm font-bold text-white">{teacherAssignments.length} টি</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-lg p-2.5 border border-white/5">
            <span className="text-[11px] text-emerald-200 block">বর্ষপঞ্জি ইভেন্ট</span>
            <span className="text-sm font-bold text-white">{calendarEvents.length} টি</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-1 overflow-x-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap',
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  isActive
                    ? 'bg-emerald-700/80 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {isLoading ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">অ্যাকাডেমিক তথ্য লোড হচ্ছে...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'CLASSES_SECTIONS' && (
            <ClassesSectionsTab
              classes={classes}
              sections={sections}
              departments={departments}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'ROUTINES' && (
            <RoutineBuilderTab
              classes={classes}
              sections={sections}
              shifts={shifts}
              subjects={subjects}
              teachers={teachers}
              sessions={sessions}
            />
          )}

          {activeTab === 'DEPARTMENTS' && (
            <DepartmentsTab
              departments={departments}
              classesCountByDept={classesCountByDept}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'SUBJECTS' && (
            <SubjectsTab
              subjects={subjects}
              departments={departments}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'CLASS_SUBJECTS' && (
            <ClassSubjectAssignmentTab
              classSubjects={classSubjects}
              classes={classes}
              subjects={subjects}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'TEACHER_SUBJECTS' && (
            <TeacherSubjectAssignmentTab
              assignments={teacherAssignments}
              classes={classes}
              sections={sections}
              subjects={subjects}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'SYLLABUS' && (
            <SyllabusManagementTab
              syllabuses={syllabuses}
              classes={classes}
              subjects={subjects}
              sessions={sessions}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'CALENDAR' && (
            <AcademicCalendarTab
              events={calendarEvents}
              sessions={sessions}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'SESSIONS' && (
            <AcademicSessionsTab
              sessions={sessions}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}

          {activeTab === 'SHIFTS' && (
            <ShiftsTab
              shifts={shifts}
              onRefresh={fetchAllData}
              canManage={canManage}
            />
          )}
        </div>
      )}

      {/* Preset Modal */}
      <InstitutionPresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onApplied={fetchAllData}
      />
    </div>
  );
};
