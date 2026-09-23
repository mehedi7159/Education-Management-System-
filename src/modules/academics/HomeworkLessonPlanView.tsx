import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Paperclip,
  History,
  Edit3,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Send,
  Check,
  Layers,
  Search,
  Filter,
  User,
  Eye,
  CheckSquare,
  X,
  Award,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../i18n';
import { HomeworkEntity, LessonPlanEntity, ClassEntity, SectionEntity, SubjectEntity, RoleType } from '../../types';
import { cn } from '../../utils/cn';

export const HomeworkLessonPlanView: React.FC = () => {
  const { user, tenant, hasPermission } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<'HOMEWORK' | 'CREATE_HOMEWORK' | 'LESSON_PLANS' | 'CREATE_LESSON_PLAN' | 'TEACHER_HISTORY'>('HOMEWORK');

  const [homeworks, setHomeworks] = useState<HomeworkEntity[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<SectionEntity[]>([]);
  const [subjects, setSubjects] = useState<SubjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter states
  const [filterClassId, setFilterClassId] = useState<string>('ALL');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Homework Form State
  const [hwForm, setHwForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    attachmentName: '',
    attachmentUrl: '',
    deadline: '',
    isPublished: true,
  });

  const [editingHwId, setEditingHwId] = useState<string | null>(null);

  // Lesson Plan Form State
  const [lpForm, setLpForm] = useState({
    date: new Date().toISOString().split('T')[0],
    classId: '',
    sectionId: '',
    subjectId: '',
    topic: '',
    learningObjective: '',
    activities: '',
    homeworkRef: '',
    notes: '',
  });

  const isTeacherOrAdmin = hasPermission([RoleType.TEACHER, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.SUPER_ADMIN]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [hwRes, lpRes, clsRes, secRes, subRes] = await Promise.all([
        api.getHomeworks(tenant?.id),
        api.getLessonPlans(tenant?.id),
        api.getClasses(tenant?.id),
        api.getSections(tenant?.id),
        api.getSubjects ? api.getSubjects(tenant?.id) : Promise.resolve({ success: true, data: [] }),
      ]);

      if (hwRes.success && hwRes.data) setHomeworks(hwRes.data);
      if (lpRes.success && lpRes.data) setLessonPlans(lpRes.data);
      if (clsRes.success && clsRes.data) setClasses(clsRes.data);
      if (secRes.success && secRes.data) setSections(secRes.data);
      if (subRes.success && subRes.data) setSubjects(subRes.data);
    } catch (err) {
      console.error('Failed to load homework and lesson plan data:', err);
      showToast('ডেটা লোড করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  const handleCreateOrUpdateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacherOrAdmin) {
      showToast('আপনার হোমওয়ার্ক তৈরি বা সম্পাদনার অনুমতি নেই!', 'error');
      return;
    }

    if (!hwForm.classId || !hwForm.subjectId || !hwForm.title || !hwForm.deadline) {
      showToast('দয়া করে শ্রেণি, বিষয়, শিরোনাম ও ডেডলাইন পূরণ করুন।', 'error');
      return;
    }

    const selectedClass = classes.find((c) => c.id === hwForm.classId);
    const selectedSection = sections.find((s) => s.id === hwForm.sectionId);
    const selectedSubject = subjects.find((s) => s.id === hwForm.subjectId);

    try {
      if (editingHwId) {
        // Edit before deadline check
        const targetHw = homeworks.find((h) => h.id === editingHwId);
        if (targetHw && new Date(targetHw.deadline) < new Date() && !hasPermission([RoleType.INSTITUTION_ADMIN, RoleType.SUPER_ADMIN])) {
          showToast('ডেডলাইন পার হয়ে যাওয়ায় এই হোমওয়ার্ক আর সম্পাদনা করা যাবে না।', 'error');
          return;
        }

        const res = await api.updateHomework(editingHwId, {
          classId: hwForm.classId,
          className: selectedClass?.nameBangla || selectedClass?.nameEnglish || '',
          sectionId: hwForm.sectionId,
          sectionName: selectedSection?.name || 'সকল শাখা',
          subjectId: hwForm.subjectId,
          subjectName: selectedSubject?.nameBangla || selectedSubject?.nameEnglish || 'সাধারণ বিষয়',
          title: hwForm.title,
          description: hwForm.description,
          attachmentName: hwForm.attachmentName,
          attachmentUrl: hwForm.attachmentUrl || '#',
          deadline: hwForm.deadline,
          isPublished: hwForm.isPublished,
        }, tenant?.id);

        if (res.success && res.data) {
          setHomeworks(homeworks.map((h) => (h.id === editingHwId ? res.data : h)));
          showToast('হোমওয়ার্ক সফলভাবে আপডেট করা হয়েছে!', 'success');
          setEditingHwId(null);
          setActiveTab('HOMEWORK');
        } else {
          showToast(res.error?.message || 'আপডেট ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createHomework({
          classId: hwForm.classId,
          className: selectedClass?.nameBangla || selectedClass?.nameEnglish || '',
          sectionId: hwForm.sectionId,
          sectionName: selectedSection?.name || 'সকল শাখা',
          subjectId: hwForm.subjectId,
          subjectName: selectedSubject?.nameBangla || selectedSubject?.nameEnglish || 'সাধারণ বিষয়',
          title: hwForm.title,
          description: hwForm.description,
          attachmentName: hwForm.attachmentName || (hwForm.attachmentUrl ? 'সংযুক্ত ডকুমেন্ট' : undefined),
          attachmentUrl: hwForm.attachmentUrl || '#',
          deadline: hwForm.deadline,
          isPublished: hwForm.isPublished,
          isCompleted: false,
          teacherId: user.id,
          teacherName: user.fullName,
        }, tenant?.id);

        if (res.success && res.data) {
          setHomeworks([res.data, ...homeworks]);
          showToast('হোমওয়ার্ক সফলভাবে তৈরি ও প্রকাশিত হয়েছে!', 'success');
          setHwForm({
            classId: '',
            sectionId: '',
            subjectId: '',
            title: '',
            description: '',
            attachmentName: '',
            attachmentUrl: '',
            deadline: '',
            isPublished: true,
          });
          setActiveTab('HOMEWORK');
        } else {
          showToast(res.error?.message || 'তৈরি করতে ব্যর্থ হয়েছে', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('সার্ভার ত্রুটি ঘটেছে', 'error');
    }
  };

  const handleToggleCompletion = async (hw: HomeworkEntity) => {
    if (!isTeacherOrAdmin) {
      showToast('শুধুমাত্র শিক্ষক ও অ্যাডমিন হোমওয়ার্ক স্ট্যাটাস পরিবর্তন করতে পারবেন।', 'error');
      return;
    }
    try {
      const res = await api.updateHomework(hw.id, { isCompleted: !hw.isCompleted }, tenant?.id);
      if (res.success && res.data) {
        setHomeworks(homeworks.map((h) => (h.id === hw.id ? res.data : h)));
        showToast(res.data.isCompleted ? 'হোমওয়ার্ক সম্পন্ন হিসেবে চিহ্নিত হয়েছে।' : 'হোমওয়ার্ক অসম্পূর্ণ হিসেবে সেট করা হয়েছে।', 'success');
      }
    } catch (err) {
      showToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleStartEdit = (hw: HomeworkEntity) => {
    const isPastDeadline = new Date(hw.deadline) < new Date();
    if (isPastDeadline && !hasPermission([RoleType.INSTITUTION_ADMIN, RoleType.SUPER_ADMIN])) {
      showToast('ডেডলাইন শেষ হয়ে যাওয়ায় এই হোমওয়ার্ক এডিট করা নিষিদ্ধ।', 'error');
      return;
    }
    setEditingHwId(hw.id);
    setHwForm({
      classId: hw.classId,
      sectionId: hw.sectionId,
      subjectId: hw.subjectId,
      title: hw.title,
      description: hw.description,
      attachmentName: hw.attachmentName || '',
      attachmentUrl: hw.attachmentUrl || '',
      deadline: hw.deadline,
      isPublished: hw.isPublished,
    });
    setActiveTab('CREATE_HOMEWORK');
  };

  const handleCreateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacherOrAdmin) {
      showToast('পাঠ পরিকল্পনা তৈরির অনুমতি নেই!', 'error');
      return;
    }

    if (!lpForm.date || !lpForm.classId || !lpForm.subjectId || !lpForm.topic) {
      showToast('তারিখ, শ্রেণি, বিষয় ও মূল টপিক আবশ্যক।', 'error');
      return;
    }

    const selectedClass = classes.find((c) => c.id === lpForm.classId);
    const selectedSection = sections.find((s) => s.id === lpForm.sectionId);
    const selectedSubject = subjects.find((s) => s.id === lpForm.subjectId);

    try {
      const res = await api.createLessonPlan({
        date: lpForm.date,
        classId: lpForm.classId,
        className: selectedClass?.nameBangla || selectedClass?.nameEnglish || '',
        sectionId: lpForm.sectionId,
        sectionName: selectedSection?.name || 'সকল শাখা',
        subjectId: lpForm.subjectId,
        subjectName: selectedSubject?.nameBangla || selectedSubject?.nameEnglish || 'সাধারণ বিষয়',
        topic: lpForm.topic,
        learningObjective: lpForm.learningObjective,
        activities: lpForm.activities,
        homeworkRef: lpForm.homeworkRef,
        notes: lpForm.notes,
        teacherId: user.id,
        teacherName: user.fullName,
      }, tenant?.id);

      if (res.success && res.data) {
        setLessonPlans([res.data, ...lessonPlans]);
        showToast('পাঠ পরিকল্পনা সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        setLpForm({
          date: new Date().toISOString().split('T')[0],
          classId: '',
          sectionId: '',
          subjectId: '',
          topic: '',
          learningObjective: '',
          activities: '',
          homeworkRef: '',
          notes: '',
        });
        setActiveTab('LESSON_PLANS');
      } else {
        showToast(res.error?.message || 'সংরক্ষণ ব্যর্থ হয়েছে', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি', 'error');
    }
  };

  const filteredHomeworks = homeworks.filter((hw) => {
    if (!hw.isPublished && !isTeacherOrAdmin) return false;
    if (filterClassId !== 'ALL' && hw.classId !== filterClassId) return false;
    if (filterSubjectId !== 'ALL' && hw.subjectId !== filterSubjectId) return false;
    if (searchQuery && !hw.title.toLowerCase().includes(searchQuery.toLowerCase()) && !hw.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredLessonPlans = lessonPlans.filter((lp) => {
    if (filterClassId !== 'ALL' && lp.classId !== filterClassId) return false;
    if (filterSubjectId !== 'ALL' && lp.subjectId !== filterSubjectId) return false;
    return true;
  });

  const teacherHistoryHomeworks = homeworks.filter((hw) => hw.teacherId === user.id || isTeacherOrAdmin);
  const teacherHistoryLessonPlans = lessonPlans.filter((lp) => lp.teacherId === user.id || isTeacherOrAdmin);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] w-fit mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>PHASE 09 — একাডেমিক ও শিক্ষক টুলস</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">হোমওয়ার্ক ও পাঠ পরিকল্পনা (Homework & Lesson Plan)</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            শিক্ষকদের হোমওয়ার্ক এসাইনমেন্ট তৈরি, প্রকাশ, ডেডলাইন ম্যানেজমেন্ট, শিক্ষার্থী অগ্রগতি ট্র্যাকিং এবং দৈনিক পাঠ পরিকল্পনা।
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTeacherOrAdmin && (
            <>
              <button
                onClick={() => {
                  setEditingHwId(null);
                  setHwForm({
                    classId: '',
                    sectionId: '',
                    subjectId: '',
                    title: '',
                    description: '',
                    attachmentName: '',
                    attachmentUrl: '',
                    deadline: '',
                    isPublished: true,
                  });
                  setActiveTab('CREATE_HOMEWORK');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন হোমওয়ার্ক</span>
              </button>
              <button
                onClick={() => setActiveTab('CREATE_LESSON_PLAN')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>পাঠ পরিকল্পনা</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-[var(--color-border)] pb-2">
        <button
          onClick={() => setActiveTab('HOMEWORK')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 cursor-pointer',
            activeTab === 'HOMEWORK'
              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-main)]'
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>সকল হোমওয়ার্ক ({filteredHomeworks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LESSON_PLANS')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 cursor-pointer',
            activeTab === 'LESSON_PLANS'
              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-main)]'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>পাঠ পরিকল্পনা তালিকা ({filteredLessonPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEACHER_HISTORY')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0 cursor-pointer',
            activeTab === 'TEACHER_HISTORY'
              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-main)]'
          )}
        >
          <History className="w-4 h-4" />
          <span>শিক্ষক ইতিহাস (Teacher History)</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      {(activeTab === 'HOMEWORK' || activeTab === 'LESSON_PLANS') && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] ml-2" />
            <input
              type="text"
              placeholder="হোমওয়ার্ক বা বিষয় খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">শ্রেণি:</span>
              <select
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-main)]"
              >
                <option value="ALL">সকল শ্রেণি</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nameBangla || cls.nameEnglish}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">বিষয়:</span>
              <select
                value={filterSubjectId}
                onChange={(e) => setFilterSubjectId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-main)]"
              >
                <option value="ALL">সকল বিষয়</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nameBangla || sub.nameEnglish}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: HOMEWORK LIST */}
      {activeTab === 'HOMEWORK' && (
        <div className="space-y-4">
          {filteredHomeworks.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
              <BookOpen className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-semibold text-[var(--color-text-main)]">কোনো হোমওয়ার্ক পাওয়া যায়নি</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">এই মুহূর্তে কোনো সক্রিয় হোমওয়ার্ক এসাইনমেন্ট নেই।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHomeworks.map((hw) => {
                const isDeadlinePassed = new Date(hw.deadline) < new Date();
                return (
                  <div
                    key={hw.id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-[var(--color-primary)]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                          {hw.subjectName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {hw.isCompleted ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> সম্পন্ন
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> প্রগতিতে
                            </span>
                          )}
                          {!hw.isPublished && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-500">
                              ড্রাফট
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-[var(--color-text-main)] mb-1 leading-snug">{hw.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
                        <span className="font-medium text-[var(--color-text-main)]">{hw.className}</span>
                        <span>•</span>
                        <span>{hw.sectionName}</span>
                      </div>

                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-4">{hw.description}</p>

                      {hw.attachmentName && (
                        <a
                          href={hw.attachmentUrl || '#'}
                          className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-surface-muted)] text-xs text-[var(--color-primary)] font-medium mb-4 hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{hw.attachmentName}</span>
                        </a>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[var(--color-border)] mt-auto space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--color-text-muted)]">ডেডলাইন:</span>
                        <span className={cn('font-semibold', isDeadlinePassed ? 'text-rose-600' : 'text-[var(--color-text-main)]')}>
                          {new Date(hw.deadline).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                        <span>ওস্তাদ: {hw.teacherName}</span>
                        <span>{hw.createdAt.split(' ')[0]}</span>
                      </div>

                      {isTeacherOrAdmin && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)]">
                          <button
                            onClick={() => handleToggleCompletion(hw)}
                            className={cn(
                              'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
                              hw.isCompleted
                                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            )}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{hw.isCompleted ? 'অসম্পূর্ণ করুন' : 'সম্পন্ন করুন'}</span>
                          </button>
                          <button
                            onClick={() => handleStartEdit(hw)}
                            disabled={isDeadlinePassed && !hasPermission([RoleType.INSTITUTION_ADMIN, RoleType.SUPER_ADMIN])}
                            className="p-1.5 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] disabled:opacity-40 cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE / EDIT HOMEWORK */}
      {activeTab === 'CREATE_HOMEWORK' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-main)]">
                {editingHwId ? 'হোমওয়ার্ক সম্পাদনা করুন (Edit Homework)' : 'নতুন হোমওয়ার্ক তৈরি করুন (Create Homework)'}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">শ্রেণি, শাখা, বিষয় নির্বাচন করুন এবং বিস্তারিত প্রদান করুন।</p>
            </div>
            <button
              onClick={() => setActiveTab('HOMEWORK')}
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateOrUpdateHomework} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">শ্রেণি নির্বাচন *</label>
                <select
                  required
                  value={hwForm.classId}
                  onChange={(e) => setHwForm({ ...hwForm, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                >
                  <option value="">-- শ্রেণি বেছে নিন --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBangla || c.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">শাখা (Section)</label>
                <select
                  value={hwForm.sectionId}
                  onChange={(e) => setHwForm({ ...hwForm, sectionId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                >
                  <option value="">সকল শাখা (All Sections)</option>
                  {sections
                    .filter((s) => !hwForm.classId || s.classId === hwForm.classId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">বিষয় নির্বাচন *</label>
                <select
                  required
                  value={hwForm.subjectId}
                  onChange={(e) => setHwForm({ ...hwForm, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                >
                  <option value="">-- বিষয় বেছে নিন --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nameBangla || sub.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">হোমওয়ার্ক শিরোনাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: সূরা বাকারাহ ১-১০ আয়াত মুখস্থ ও আরবি হরফের মাখরাজ মশক"
                value={hwForm.title}
                onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">বিস্তারিত বিবরণ (Description)</label>
              <textarea
                rows={4}
                placeholder="হোমওয়ার্ক সংক্রান্ত বিস্তারিত নির্দেশনা..."
                value={hwForm.description}
                onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">সংযুক্ত ফাইলের নাম (Attachment Name)</label>
                <input
                  type="text"
                  placeholder="যেমন: worksheet_01.pdf"
                  value={hwForm.attachmentName}
                  onChange={(e) => setHwForm({ ...hwForm, attachmentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">জমার শেষ সময় (Deadline) *</label>
                <input
                  type="datetime-local"
                  required
                  value={hwForm.deadline}
                  onChange={(e) => setHwForm({ ...hwForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={hwForm.isPublished}
                onChange={(e) => setHwForm({ ...hwForm, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-[var(--color-text-main)]">
                তাৎক্ষণিকভাবে শিক্ষার্থীদের জন্য প্রকাশ করুন (Publish Now)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setActiveTab('HOMEWORK')}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{editingHwId ? 'আপডেট ও সেভ করুন' : 'হোমওয়ার্ক প্রকাশ করুন'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: LESSON PLANS */}
      {activeTab === 'LESSON_PLANS' && (
        <div className="space-y-4">
          {filteredLessonPlans.length === 0 ? (
            <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
              <FileText className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
              <h3 className="text-base font-semibold text-[var(--color-text-main)]">কোনো পাঠ পরিকল্পনা পাওয়া যায়নি</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">শিক্ষকগণ এখনো কোনো দৈনিক পাঠ পরিকল্পনা এন্ট্রি করেননি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredLessonPlans.map((lp) => (
                <div key={lp.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                      {lp.subjectName}
                    </span>
                    <span className="text-xs font-medium text-[var(--color-text-muted)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {lp.date}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-main)] mb-1">{lp.topic}</h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <span className="font-semibold text-[var(--color-text-main)]">{lp.className}</span>
                      <span>•</span>
                      <span>{lp.sectionName}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[var(--color-text-main)] bg-[var(--color-surface-muted)] p-3.5 rounded-xl">
                    <div>
                      <span className="font-semibold text-[var(--color-primary)]">শিক্ষণ ফল (Objective):</span>
                      <p className="mt-0.5 text-[var(--color-text-muted)]">{lp.learningObjective}</p>
                    </div>
                    <div className="pt-2 border-t border-[var(--color-border)]">
                      <span className="font-semibold text-[var(--color-primary)]">কার্যক্রম (Activities):</span>
                      <p className="mt-0.5 whitespace-pre-line text-[var(--color-text-muted)]">{lp.activities}</p>
                    </div>
                    {lp.notes && (
                      <div className="pt-2 border-t border-[var(--color-border)]">
                        <span className="font-semibold text-[var(--color-primary)]">বিশেষ নোট:</span>
                        <p className="mt-0.5 text-[var(--color-text-muted)]">{lp.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                    <span>ওস্তাদ: {lp.teacherName}</span>
                    <span>তৈরি: {lp.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CREATE LESSON PLAN */}
      {activeTab === 'CREATE_LESSON_PLAN' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-main)]">দৈনিক পাঠ পরিকল্পনা তৈরি করুন (Create Lesson Plan)</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">ক্লাসের টপিক, শিখন ফল ও শিক্ষক নোট রেকর্ড করুন।</p>
            </div>
            <button
              onClick={() => setActiveTab('LESSON_PLANS')}
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateLessonPlan} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">তারিখ (Date) *</label>
                <input
                  type="date"
                  required
                  value={lpForm.date}
                  onChange={(e) => setLpForm({ ...lpForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">শ্রেণি নির্বাচন *</label>
                <select
                  required
                  value={lpForm.classId}
                  onChange={(e) => setLpForm({ ...lpForm, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                >
                  <option value="">-- শ্রেণি বেছে নিন --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBangla || c.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">বিষয় নির্বাচন *</label>
                <select
                  required
                  value={lpForm.subjectId}
                  onChange={(e) => setLpForm({ ...lpForm, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
                >
                  <option value="">-- বিষয় বেছে নিন --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nameBangla || sub.nameEnglish}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">পাঠের টপিক (Topic) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: নুন সাকিন ও তানভীন ইখফার কায়দা"
                value={lpForm.topic}
                onChange={(e) => setLpForm({ ...lpForm, topic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">শিখন উদ্দেশ্য (Learning Objective)</label>
              <input
                type="text"
                placeholder="শিক্ষার্থীরা পবিত্র কোরআনে ইখফার হরফ চিনে শুদ্ধ উচ্চারণ করতে পারবে।"
                value={lpForm.learningObjective}
                onChange={(e) => setLpForm({ ...lpForm, learningObjective: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">ক্লাস কার্যক্রম ও পদ্ধতি (Activities)</label>
              <textarea
                rows={3}
                placeholder="১. বোর্ডে ১৫টি হরফ প্রদর্শন। ২. একক পঠন ও দলগত মশক।"
                value={lpForm.activities}
                onChange={(e) => setLpForm({ ...lpForm, activities: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">শিক্ষক নোট ও মূল্যায়ন (Notes)</label>
              <textarea
                rows={2}
                placeholder="আজকের পাঠে শিক্ষার্থীদের অংশগ্রহণ বেশ ভালো ছিল..."
                value={lpForm.notes}
                onChange={(e) => setLpForm({ ...lpForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-main)]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setActiveTab('LESSON_PLANS')}
                className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>পাঠ পরিকল্পনা সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: TEACHER HISTORY VIEW */}
      {activeTab === 'TEACHER_HISTORY' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-main)]">{user.fullName}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">ইমেইল: {user.email} | ভূমিকা: {user.role}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-text-muted)]">মোট হোমওয়ার্ক তৈরি:</div>
              <div className="text-lg font-bold text-[var(--color-primary)]">{teacherHistoryHomeworks.length} টি</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                <span>আমার তৈরি হোমওয়ার্ক ইতিহাস ({teacherHistoryHomeworks.length})</span>
              </h4>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {teacherHistoryHomeworks.map((hw) => (
                  <div key={hw.id} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--color-primary)]">{hw.subjectName}</span>
                      <span className="text-[var(--color-text-muted)]">{hw.createdAt}</span>
                    </div>
                    <h5 className="text-sm font-bold text-[var(--color-text-main)]">{hw.title}</h5>
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span>শ্রেণি: {hw.className}</span>
                      <span>ডেডлайн: {hw.deadline.replace('T', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>আমার দৈনিক পাঠ পরিকল্পনা ইতিহাস ({teacherHistoryLessonPlans.length})</span>
              </h4>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {teacherHistoryLessonPlans.map((lp) => (
                  <div key={lp.id} className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600">{lp.subjectName}</span>
                      <span className="text-[var(--color-text-muted)]">তারিখ: {lp.date}</span>
                    </div>
                    <h5 className="text-sm font-bold text-[var(--color-text-main)]">{lp.topic}</h5>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      <span>শ্রেণি: {lp.className}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
