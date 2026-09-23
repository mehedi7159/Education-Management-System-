import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  User,
  Layers,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  StaffEntity,
  TeacherSubjectAssignment,
  TeacherClassAssignment,
} from '../../types';

export const StaffAssignmentView: React.FC = () => {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subjects' | 'classes'>('subjects');
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [classAssignments, setClassAssignments] = useState<TeacherClassAssignment[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Subject assignment form state
  const [subjectForm, setSubjectForm] = useState({
    teacherId: '',
    classId: 'cls-1',
    className: 'দাওরায়ে হাদিস (মাস্টার্স)',
    sectionId: 'sec-1',
    sectionName: 'শাখা-ক (আবু বকর রা.)',
    subjectId: 'sub-101',
    subjectName: 'সহীহ বুখারী শরীফ (১ম খণ্ড)',
    academicSessionId: 'sess-2025',
    academicSessionName: '২০২৫-২০২৬',
    weeklyPeriodsCount: 6,
  });

  // Class assignment form state
  const [classForm, setClassForm] = useState({
    teacherId: '',
    classId: 'cls-1',
    className: 'দাওরায়ে হাদিস (মাস্টার্স)',
    sectionId: 'sec-1',
    sectionName: 'শাখা-ক (আবু বকর রা.)',
    academicSessionId: 'sess-2025',
    academicSessionName: '২০২৫-২০২৬',
    role: 'CLASS_TEACHER' as 'CLASS_TEACHER' | 'HEAD_TEACHER' | 'ASSISTANT_INCHARGE' | 'NAZEM_TALIMAT',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, subRes, clsRes] = await Promise.all([
        api.getStaff(),
        api.getTeacherSubjectAssignments(),
        api.getTeacherClassAssignments(),
      ]);

      if (staffRes.success) {
        setStaffList(staffRes.data);
        if (staffRes.data.length > 0) {
          setSubjectForm((prev) => ({ ...prev, teacherId: staffRes.data[0].id }));
          setClassForm((prev) => ({ ...prev, teacherId: staffRes.data[0].id }));
        }
      }
      if (subRes.success) setSubjectAssignments(subRes.data);
      if (clsRes.success) setClassAssignments(clsRes.data);
    } catch (err: any) {
      showToast('অ্যাসাইনমেন্ট তথ্য লোড করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubjectAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = staffList.find((s) => s.id === subjectForm.teacherId);
    if (!teacher) {
      showToast('শিক্ষক নির্বাচন করুন।', 'error');
      return;
    }

    try {
      const res = await api.assignTeacherSubject({
        ...subjectForm,
        employeeId: teacher.employeeId,
        teacherName: teacher.nameBangla,
        weeklyPeriodsCount: Number(subjectForm.weeklyPeriodsCount) || 1,
      });

      if (res.success) {
        showToast(`${teacher.nameBangla}-এর জন্য বিষয় দায়িত্ব সফলভাবে অর্পণ করা হয়েছে।`, 'success');
        setIsSubjectModalOpen(false);
        loadData();
      } else {
        showToast(res.error?.message || 'দায়িত্ব অর্পণ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast('দায়িত্ব অর্পণে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleCreateClassAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = staffList.find((s) => s.id === classForm.teacherId);
    if (!teacher) {
      showToast('শিক্ষক নির্বাচন করুন।', 'error');
      return;
    }

    try {
      const res = await api.assignTeacherClass({
        ...classForm,
        employeeId: teacher.employeeId,
        teacherName: teacher.nameBangla,
      });

      if (res.success) {
        showToast(`${teacher.nameBangla}-এর জন্য শ্রেণি দায়িত্ব সফলভাবে অর্পণ করা হয়েছে।`, 'success');
        setIsClassModalOpen(false);
        loadData();
      } else {
        showToast(res.error?.message || 'শ্রেণি দায়িত্ব অর্পণ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast('শ্রেণি দায়িত্ব অর্পণে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleDeleteSubjectAssignment = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" বিষয়টি দায়িত্ব হতে প্রত্যাহার করতে চান?`)) return;
    try {
      const res = await api.removeTeacherSubjectAssignment(id);
      if (res.success) {
        showToast('বিষয় দায়িত্ব প্রত্যাহার করা হয়েছে।', 'success');
        loadData();
      }
    } catch (err) {
      showToast('প্রত্যাহার ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleDeleteClassAssignment = async (id: string, className: string) => {
    if (!window.confirm(`আপনি কি "${className}" জামাতের দায়িত্ব প্রত্যাহার করতে চান?`)) return;
    try {
      const res = await api.removeTeacherClassAssignment(id);
      if (res.success) {
        showToast('শ্রেণি দায়িত্ব প্রত্যাহার করা হয়েছে।', 'success');
        loadData();
      }
    } catch (err) {
      showToast('প্রত্যাহার ব্যর্থ হয়েছে।', 'error');
    }
  };

  const filteredSubjects = subjectAssignments.filter(
    (s) =>
      s.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClasses = classAssignments.filter(
    (c) =>
      c.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">মোট বিষয় দায়িত্ব বণ্টন</span>
          <p className="text-2xl font-bold mt-1 text-[var(--color-text-main)]">
            {subjectAssignments.length} টি অ্যাসাইনমেন্ট
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">
            সর্বমোট সাপ্তাহিক ঘণ্টা: {subjectAssignments.reduce((sum, s) => sum + s.weeklyPeriodsCount, 0)} পিরিয়ড
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">শ্রেণি শিক্ষক ও ইনচার্জ</span>
          <p className="text-2xl font-bold mt-1 text-[var(--color-text-main)]">
            {classAssignments.length} টি জামাত
          </p>
          <span className="text-[10px] text-teal-600 font-medium">ক্লাস মনিটরিং ও শিক্ষার্থী তত্ত্বাবধান</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">দায়িত্বপ্রাপ্ত ওস্তাদ সংখ্যা</span>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {new Set([...subjectAssignments.map((s) => s.teacherId), ...classAssignments.map((c) => c.teacherId)]).size} জন
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">কার্যকর পাঠদান শিক্ষক</span>
        </div>
      </div>

      {/* Navigation and Action Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Sub-tabs */}
        <div className="flex items-center gap-2 bg-[var(--color-surface-hover)] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'subjects'
                ? 'bg-[var(--color-surface)] text-emerald-600 shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
            }`}
          >
            পাঠদান বিষয় দায়িত্ব ({subjectAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'classes'
                ? 'bg-[var(--color-surface)] text-emerald-600 shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
            }`}
          >
            শ্রেণি শিক্ষক দায়িত্ব ({classAssignments.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="শিক্ষক, বিষয় বা শ্রেণি দিয়ে খুঁজুন..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] outline-none"
          />
        </div>

        {/* Add Assignment Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            বিষয় দায়িত্ব অর্পণ
          </button>
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            শ্রেণি শিক্ষক অর্পণ
          </button>
        </div>

      </div>

      {/* TABLE 1: SUBJECT ASSIGNMENTS */}
      {activeTab === 'subjects' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
              কোন বিষয় দায়িত্ব অর্পণের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                  <tr>
                    <th className="p-4">দায়িত্বপ্রাপ্ত শিক্ষক</th>
                    <th className="p-4">কিতাব / বিষয়ের নাম</th>
                    <th className="p-4">শ্রেণি ও শাখা</th>
                    <th className="p-4">সাপ্তাহিক পিরিয়ড</th>
                    <th className="p-4">শিক্ষাবর্ষ</th>
                    <th className="p-4 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[var(--color-border)]">
                  {filteredSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                            {sub.teacherName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[var(--color-text-main)] block">{sub.teacherName}</span>
                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono">{sub.teacherId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-[var(--color-text-main)]">
                        {sub.subjectName}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">{sub.className}</span>
                        <span className="text-[11px] text-[var(--color-text-secondary)]">{sub.sectionName}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg font-bold text-xs">
                          {sub.weeklyPeriodsCount} ঘণ্টা/সপ্তাহ
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[var(--color-text-secondary)]">
                        {sub.academicSessionName}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteSubjectAssignment(sub.id, sub.subjectName)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                          title="দায়িত্ব প্রত্যাহার"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TABLE 2: CLASS ASSIGNMENTS */}
      {activeTab === 'classes' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
              কোন শ্রেণি শিক্ষক অর্পণের তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                  <tr>
                    <th className="p-4">দায়িত্বপ্রাপ্ত ওস্তাদ</th>
                    <th className="p-4">জামাত / শ্রেণি</th>
                    <th className="p-4">শাখা</th>
                    <th className="p-4">অর্পিত পদমর্যাদা</th>
                    <th className="p-4">শিক্ষাবর্ষ</th>
                    <th className="p-4 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[var(--color-border)]">
                  {filteredClasses.map((cls) => (
                    <tr key={cls.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                      <td className="p-4 font-bold text-[var(--color-text-main)]">
                        {cls.teacherName}
                      </td>
                      <td className="p-4 font-bold text-teal-700 dark:text-teal-400">
                        {cls.className}
                      </td>
                      <td className="p-4 text-[var(--color-text-secondary)]">
                        {cls.sectionName}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-lg">
                          {cls.role === 'CLASS_TEACHER' ? 'শ্রেণি শিক্ষক (Class Teacher)' : 'বিভাগীয় প্রধান'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[var(--color-text-secondary)]">
                        {cls.academicSessionName}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteClassAssignment(cls.id, cls.className)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                          title="দায়িত্ব প্রত্যাহার"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBJECT ASSIGNMENT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                নতুন বিষয় পাঠদান দায়িত্ব অর্পণ
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubjectAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">শিক্ষক নির্বাচন করুন *</label>
                <select
                  value={subjectForm.teacherId}
                  onChange={(e) => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.nameBangla} ({stf.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">শ্রেণি / জামাত *</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.className}
                    onChange={(e) => setSubjectForm({ ...subjectForm, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শাখা *</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.sectionName}
                    onChange={(e) => setSubjectForm({ ...subjectForm, sectionName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিষয় / কিতাবের নাম *</label>
                <input
                  type="text"
                  required
                  value={subjectForm.subjectName}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                  placeholder="যেমন: সহীহ বুখারী শরীফ"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">সাপ্তাহিক পিরিয়ড সংখ্যা *</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={subjectForm.weeklyPeriodsCount}
                    onChange={(e) => setSubjectForm({ ...subjectForm, weeklyPeriodsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শিক্ষাবর্ষ</label>
                  <input
                    type="text"
                    value={subjectForm.academicSessionName}
                    onChange={(e) => setSubjectForm({ ...subjectForm, academicSessionName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASS ASSIGNMENT MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                শ্রেণি ইনচার্জ / শ্রেণি শিক্ষক অর্পণ
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClassAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">শিক্ষক নির্বাচন করুন *</label>
                <select
                  value={classForm.teacherId}
                  onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.nameBangla} ({stf.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">শ্রেণি / জামাত *</label>
                  <input
                    type="text"
                    required
                    value={classForm.className}
                    onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শাখা *</label>
                  <input
                    type="text"
                    required
                    value={classForm.sectionName}
                    onChange={(e) => setClassForm({ ...classForm, sectionName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">দায়িত্বের ধরন *</label>
                <select
                  value={classForm.role}
                  onChange={(e) => setClassForm({ ...classForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                >
                  <option value="CLASS_TEACHER">শ্রেণি শিক্ষক (Class Teacher)</option>
                  <option value="DEPARTMENT_HEAD">বিভাগীয় প্রধান (Department Head)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  অর্পণ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
