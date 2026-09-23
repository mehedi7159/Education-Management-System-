import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  X,
  AlertCircle,
  Hash,
  Clock,
  Award,
} from 'lucide-react';
import { ClassSubjectEntity, ClassEntity, SubjectEntity } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface ClassSubjectAssignmentTabProps {
  classSubjects: ClassSubjectEntity[];
  classes: ClassEntity[];
  subjects: SubjectEntity[];
  onRefresh: () => void;
  canManage: boolean;
}

export const ClassSubjectAssignmentTab: React.FC<ClassSubjectAssignmentTabProps> = ({
  classSubjects,
  classes,
  subjects,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClassSubjectEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Subjects assigned to the selected class
  const assignedSubjects = classSubjects.filter((cs) => cs.classId === (activeClass?.id || ''));

  // Form State
  const [formData, setFormData] = useState({
    subjectId: '',
    weeklyPeriods: 5,
    orderIndex: 1,
    isElective: false,
    passMarks: 40,
  });

  const handleOpenAssign = () => {
    if (!activeClass) {
      showToast('প্রথমে একটি শ্রেণি নির্বাচন করুন', 'warning');
      return;
    }
    setEditingAssignment(null);
    // Find first subject not already assigned if possible
    const unassignedSubject = subjects.find((s) => !assignedSubjects.some((as) => as.subjectId === s.id));
    const defaultSub = unassignedSubject || subjects[0];

    setFormData({
      subjectId: defaultSub ? defaultSub.id : '',
      weeklyPeriods: defaultSub?.weeklyPeriods || 5,
      orderIndex: assignedSubjects.length + 1,
      isElective: false,
      passMarks: defaultSub?.passMarks || 40,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (assignment: ClassSubjectEntity) => {
    setEditingAssignment(assignment);
    setFormData({
      subjectId: assignment.subjectId,
      weeklyPeriods: assignment.weeklyPeriods || 5,
      orderIndex: assignment.orderIndex || 1,
      isElective: assignment.isElective || false,
      passMarks: assignment.passMarks || 40,
    });
    setIsModalOpen(true);
  };

  const handleRemove = async (id: string, name: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি '${activeClass?.nameBangla}' জামাত হতে '${name}' বিষয়টির পাঠদান অপসারণ করতে চান?`)) return;

    try {
      const res = await api.deleteClassSubject(id);
      if (res.success) {
        showToast('বিষয়টি শ্রেণি থেকে অপসারণ করা হয়েছে', 'success');
        onRefresh();
      } else {
        showToast(res.error?.message || 'অপসারণ ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass || !formData.subjectId) {
      showToast('শ্রেণি ও বিষয় নির্বাচন করুন', 'warning');
      return;
    }

    const selectedSub = subjects.find((s) => s.id === formData.subjectId);
    if (!selectedSub) {
      showToast('বিষয় তথ্য পাওয়া যায়নি', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const subjectType = (selectedSub.subjectType as any) || (formData.isElective ? 'ELECTIVE' : 'CORE');
      const marks = selectedSub.totalMarks || selectedSub.fullMarks || 100;

      if (editingAssignment) {
        const res = await api.updateClassSubject(editingAssignment.id, {
          classId: activeClass.id,
          className: activeClass.nameBangla,
          subjectId: selectedSub.id,
          subjectName: selectedSub.nameBangla,
          subjectCode: selectedSub.code,
          subjectType,
          totalMarks: marks,
          fullMarks: marks,
          passMarks: Number(formData.passMarks),
          weeklyPeriods: Number(formData.weeklyPeriods),
          orderIndex: Number(formData.orderIndex),
          isMandatory: !formData.isElective,
          isElective: formData.isElective,
        });
        if (res.success) {
          showToast('শ্রেণি-বিষয় তথ্য সফলভাবে হালনাগাদ হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createClassSubject({
          classId: activeClass.id,
          className: activeClass.nameBangla,
          subjectId: selectedSub.id,
          subjectName: selectedSub.nameBangla,
          subjectCode: selectedSub.code,
          subjectType,
          totalMarks: marks,
          fullMarks: marks,
          passMarks: Number(formData.passMarks),
          weeklyPeriods: Number(formData.weeklyPeriods),
          orderIndex: Number(formData.orderIndex),
          isMandatory: !formData.isElective,
          isElective: formData.isElective,
        });
        if (res.success) {
          showToast('শ্রেণিতে কিতাব/বিষয় সফলভাবে যুক্ত হয়েছে', 'success');
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

  const totalFullMarks = assignedSubjects.reduce((acc, s) => acc + (s.fullMarks || 100), 0);
  const totalWeeklyPeriods = assignedSubjects.reduce((acc, s) => acc + (s.weeklyPeriods || 5), 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            শ্রেণি-বিষয় অ্যাসাইনমেন্ট ও সিলেবাস কাঠামো (Class Curriculum)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            কোন জামাতে কোন কোন কিতাব বা বিষয় পঠিত হবে, সাপ্তাহিক পিরিয়ড ও পূর্ণমান বণ্টন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
              জামাত/শ্রেণি:
            </label>
            <select
              value={selectedClassId || activeClass?.id || ''}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-indigo-900 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nameBangla} ({cls.department})
                </option>
              ))}
            </select>
          </div>

          {canManage && (
            <button
              onClick={handleOpenAssign}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              এই শ্রেণিতে বিষয় যুক্ত করুন
            </button>
          )}
        </div>
      </div>

      {activeClass && (
        <>
          {/* Class Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">নির্ধারিত কিতাব/বিষয়</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {assignedSubjects.length} টি বিষয়
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">সাপ্তাহিক মোট ক্লাস/পিরিয়ড</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {totalWeeklyPeriods} পিরিয়ড / সপ্তাহ
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">মোট পরীক্ষার পূর্ণমান</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {totalFullMarks} নম্বর
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Subjects Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                '{activeClass.nameBangla}' জামাতের পাঠ্যতালিকা
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                বিভাগ: {activeClass.department}
              </span>
            </div>

            {assignedSubjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">ক্রম</th>
                      <th className="py-3 px-4">বিষয় ও কিতাবের নাম</th>
                      <th className="py-3 px-4">কোড</th>
                      <th className="py-3 px-4 text-center">সাপ্তাহিক পিরিয়ড</th>
                      <th className="py-3 px-4 text-center">পূর্ণমান</th>
                      <th className="py-3 px-4 text-center">পাস নম্বর</th>
                      <th className="py-3 px-4 text-center">ধরন</th>
                      {canManage && <th className="py-3 px-4 text-right">পদক্ষেপ</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {assignedSubjects.map((as, index) => (
                      <tr key={as.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          {as.orderIndex || index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {as.subjectName}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                          {as.subjectCode}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {as.weeklyPeriods || 5} টি
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {as.fullMarks || 100}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-500">
                          {as.passMarks || 40}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {as.isElective ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                              ঐচ্ছিক
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                              বাধ্যতামূলক
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit(as)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="সম্পাদনা"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemove(as.id, as.subjectName)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="অপসারণ"
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
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  এই জামাতে এখনো কোনো পাঠ্যবই বা কিতাব যুক্ত করা হয়নি।
                </p>
                {canManage && (
                  <button
                    onClick={handleOpenAssign}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> প্রথম কিতাব যুক্ত করুন
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal for Assigning / Editing Subject */}
      {isModalOpen && activeClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingAssignment ? 'অ্যাসাইনমেন্ট সম্পাদনা' : 'শ্রেণিতে কিতাব যুক্ত করুন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500">জামাত/শ্রেণি:</span>{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{activeClass.nameBangla}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  কিতাব/বিষয় নির্বাচন করুন *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => {
                    const sub = subjects.find((s) => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      subjectId: e.target.value,
                      weeklyPeriods: sub?.weeklyPeriods || formData.weeklyPeriods,
                      passMarks: sub?.passMarks || formData.passMarks,
                    });
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBangla} ({s.code}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সাপ্তাহিক পিরিয়ড
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyPeriods}
                    onChange={(e) => setFormData({ ...formData, weeklyPeriods: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পাস নম্বর
                  </label>
                  <input
                    type="number"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ক্রমিক নং
                  </label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isElective}
                    onChange={(e) => setFormData({ ...formData, isElective: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    এটি একটি ঐচ্ছিক বিষয় (Elective Subject)
                  </span>
                </label>
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
                  className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
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
