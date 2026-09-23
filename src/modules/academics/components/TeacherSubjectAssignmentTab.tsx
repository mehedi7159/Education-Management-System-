import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Users,
  BookOpen,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import {
  TeacherSubjectAssignmentEntity,
  ClassEntity,
  SectionEntity,
  SubjectEntity,
  StaffEntity,
  RoleType,
} from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface TeacherSubjectAssignmentTabProps {
  assignments: TeacherSubjectAssignmentEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  subjects: SubjectEntity[];
  onRefresh: () => void;
  canManage: boolean;
}

export const TeacherSubjectAssignmentTab: React.FC<TeacherSubjectAssignmentTabProps> = ({
  assignments,
  classes,
  sections,
  subjects,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();

  const [teachers, setTeachers] = useState<StaffEntity[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeacherSubjectAssignmentEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    teacherId: '',
    teacherName: '',
    classId: '',
    className: '',
    sectionId: '',
    sectionName: '',
    subjectId: '',
    subjectName: '',
    role: 'SUBJECT_TEACHER' as 'SUBJECT_TEACHER' | 'CLASS_TEACHER' | 'ASSISTANT_TEACHER' | 'SUBSTITUTE',
    periodsPerWeek: 5,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const res = await api.getStaff();
      if (res.success && res.data) {
        setTeachers(res.data);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesTeacher = filterTeacher === 'ALL' || a.teacherId === filterTeacher;
    const matchesClass = filterClass === 'ALL' || a.classId === filterClass;
    const matchesSearch =
      a.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeacher && matchesClass && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    const firstTeacher = teachers[0];
    const firstClass = classes[0];
    const classSecs = sections.filter((s) => s.classId === firstClass?.id);
    const firstSubject = subjects[0];

    setFormData({
      teacherId: firstTeacher?.id || '',
      teacherName: firstTeacher ? (firstTeacher.nameBangla || firstTeacher.nameEnglish) : 'মুফতি আব্দুর রহমান',
      classId: firstClass?.id || '',
      className: firstClass?.nameBangla || '',
      sectionId: classSecs[0]?.id || '',
      sectionName: classSecs[0]?.name || 'শাখা-ক',
      subjectId: firstSubject?.id || '',
      subjectName: firstSubject?.nameBangla || '',
      role: 'SUBJECT_TEACHER',
      periodsPerWeek: 5,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (assignment: TeacherSubjectAssignmentEntity) => {
    setEditingAssignment(assignment);
    setFormData({
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      classId: assignment.classId,
      className: assignment.className,
      sectionId: assignment.sectionId || '',
      sectionName: assignment.sectionName || '',
      subjectId: assignment.subjectId,
      subjectName: assignment.subjectName,
      role: (assignment.role as any) || 'SUBJECT_TEACHER',
      periodsPerWeek: assignment.periodsPerWeek || 5,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, teacher: string, subject: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${teacher} ওস্তাদজির '${subject}' বিষয়ের দায়িত্ব মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteTeacherAssignment(id);
      if (res.success) {
        showToast('শিক্ষক অ্যাসাইনমেন্ট সফলভাবে মুছে ফেলা হয়েছে', 'success');
        onRefresh();
      } else {
        showToast(res.error?.message || 'মুছে ফেলা ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId || !formData.classId || !formData.subjectId) {
      showToast('শিক্ষক, শ্রেণি ও বিষয় নির্বাচন আবশ্যক', 'warning');
      return;
    }

    const tObj = teachers.find((t) => t.id === formData.teacherId);
    const cObj = classes.find((c) => c.id === formData.classId);
    const sObj = subjects.find((s) => s.id === formData.subjectId);
    const secObj = sections.find((sec) => sec.id === formData.sectionId);

    setIsSubmitting(true);
    try {
      const payload: Omit<TeacherSubjectAssignmentEntity, 'id' | 'tenantId'> = {
        teacherId: formData.teacherId,
        teacherName: tObj ? (tObj.nameBangla || tObj.nameEnglish) : formData.teacherName,
        employeeId: tObj?.employeeId || 'EMP-01',
        classId: formData.classId,
        className: cObj?.nameBangla || formData.className,
        sectionId: formData.sectionId,
        sectionName: secObj?.name || formData.sectionName,
        subjectId: formData.subjectId,
        subjectName: sObj?.nameBangla || formData.subjectName,
        role: formData.role,
        weeklyPeriodsCount: Number(formData.periodsPerWeek),
        periodsPerWeek: Number(formData.periodsPerWeek),
        assignedAt: new Date().toISOString().split('T')[0],
      };

      if (editingAssignment) {
        const res = await api.updateTeacherAssignment(editingAssignment.id, payload);
        if (res.success) {
          showToast('শিক্ষক অ্যাসাইনমেন্ট হালনাগাদ হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createTeacherAssignment(payload);
        if (res.success) {
          showToast('ওস্তাদজির পাঠদান দায়িত্ব সফলভাবে যুক্ত হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'যুক্ত করা ব্যর্থ হয়েছে', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'CLASS_TEACHER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> শ্রেণি শিক্ষক / নিগরান
          </span>
        );
      case 'ASSISTANT_TEACHER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800">
            সহকারী শিক্ষক
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
            বিষয় শিক্ষক
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header, Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            শিক্ষক-বিষয় বণ্টন ও নিগরান নির্ধারণ (Teacher Subject Assignment)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            কোন জামাতে কোন ওস্তাদজি কোন কিতাব পড়াবেন এবং শ্রেণি শিক্ষক (নিগরান) এর দায়িত্ব বণ্টন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ওস্তাদজি, কিতাব বা জামাত..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">সকল ওস্তাদজি (All Teachers)</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nameBangla || t.nameEnglish} ({t.designation || t.mobile})
              </option>
            ))}
          </select>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">সকল শ্রেণি (All Classes)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameBangla}
              </option>
            ))}
          </select>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              নতুন দায়িত্ব বণ্টন করুন
            </button>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            বণ্টনকৃত পাঠদান তালিকা ({filteredAssignments.length} টি অ্যাসাইনমেন্ট)
          </h3>
        </div>

        {filteredAssignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">ওস্তাদজির নাম (Teacher)</th>
                  <th className="py-3 px-4">জামাত ও শ্রেণি</th>
                  <th className="py-3 px-4">শাখা</th>
                  <th className="py-3 px-4">কিতাব / বিষয়</th>
                  <th className="py-3 px-4 text-center">সাপ্তাহিক পিরিয়ড</th>
                  <th className="py-3 px-4 text-center">দায়িত্বের ধরন</th>
                  {canManage && <th className="py-3 px-4 text-right">পদক্ষেপ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          {a.teacherName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {a.teacherName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {a.className}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {a.sectionName || 'সাধারণ'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        {a.subjectName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                      {a.periodsPerWeek || 5} টি
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getRoleBadge(a.role)}
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.teacherName, a.subjectName)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <UserCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              কোনো শিক্ষক অ্যাসাইনমেন্ট পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>

      {/* Modal for Assigning Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingAssignment ? 'শিক্ষক অ্যাসাইনমেন্ট সম্পাদনা' : 'নতুন পাঠদান দায়িত্ব বণ্টন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ওস্তাদজি / শিক্ষক নির্বাচন করুন *
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => {
                    const t = teachers.find((item) => item.id === e.target.value);
                    setFormData({
                      ...formData,
                      teacherId: e.target.value,
                      teacherName: t ? (t.nameBangla || t.nameEnglish) : '',
                    });
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                >
                  <option value="">-- ওস্তাদজি নির্বাচন করুন --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameBangla || t.nameEnglish} ({t.designation || t.mobile || t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    জামাত / শ্রেণি *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const c = classes.find((item) => item.id === e.target.value);
                      const classSecs = sections.filter((s) => s.classId === e.target.value);
                      setFormData({
                        ...formData,
                        classId: e.target.value,
                        className: c?.nameBangla || '',
                        sectionId: classSecs[0]?.id || '',
                        sectionName: classSecs[0]?.name || '',
                      });
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBangla}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শাখা (Section)
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => {
                      const s = sections.find((sec) => sec.id === e.target.value);
                      setFormData({
                        ...formData,
                        sectionId: e.target.value,
                        sectionName: s?.name || '',
                      });
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="">সকল শাখা / সাধারণ</option>
                    {sections
                      .filter((s) => s.classId === formData.classId)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পঠিতব্য কিতাব / বিষয় *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => {
                    const sub = subjects.find((s) => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      subjectId: e.target.value,
                      subjectName: sub?.nameBangla || '',
                      periodsPerWeek: sub?.weeklyPeriods || formData.periodsPerWeek,
                    });
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nameBangla} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    দায়িত্বের ভূমিকা (Role) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="SUBJECT_TEACHER">বিষয় শিক্ষক (Subject Teacher)</option>
                    <option value="CLASS_TEACHER">শ্রেণি শিক্ষক / নিগরান ওস্তাদ (Class Teacher)</option>
                    <option value="ASSISTANT_TEACHER">সহকারী শিক্ষক (Assistant)</option>
                    <option value="SUBSTITUTE">বিকল্প / বদলি শিক্ষক (Substitute)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সাপ্তাহিক পিরিয়ড সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={formData.periodsPerWeek}
                    onChange={(e) => setFormData({ ...formData, periodsPerWeek: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingAssignment ? 'হালনাগাদ করুন' : 'নির্ধারণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
