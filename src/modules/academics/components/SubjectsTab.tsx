import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Bookmark,
  Award,
  BookMarked,
  X,
  AlertCircle,
} from 'lucide-react';
import { SubjectEntity, DepartmentConfig, DepartmentType } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface SubjectsTabProps {
  subjects: SubjectEntity[];
  departments: DepartmentConfig[];
  onRefresh: () => void;
  canManage: boolean;
}

export const SubjectsTab: React.FC<SubjectsTabProps> = ({
  subjects,
  departments,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nameBangla: '',
    nameEnglish: '',
    nameArabic: '',
    code: '',
    department: DepartmentType.KITAB as DepartmentType,
    fullMarks: 100,
    passMarks: 40,
    type: 'COMPULSORY' as 'COMPULSORY' | 'ELECTIVE' | 'HIFZ' | 'ORAL' | 'PRACTICAL',
    author: '',
    weeklyPeriods: 5,
    description: '',
  });

  const filteredSubjects = subjects.filter((s) => {
    const matchesDept = filterDept === 'ALL' || s.department === filterDept;
    const matchesType = filterType === 'ALL' || s.type === filterType;
    const matchesSearch =
      s.nameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameArabic && s.nameArabic.includes(searchQuery)) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((s.author || s.authorName || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesType && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData({
      nameBangla: '',
      nameEnglish: '',
      nameArabic: '',
      code: `SUB-${Math.floor(100 + Math.random() * 900)}`,
      department: (departments[0]?.code as DepartmentType) || DepartmentType.KITAB,
      fullMarks: 100,
      passMarks: 40,
      type: 'COMPULSORY',
      author: '',
      weeklyPeriods: 5,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subject: SubjectEntity) => {
    setEditingSubject(subject);
    setFormData({
      nameBangla: subject.nameBangla,
      nameEnglish: subject.nameEnglish || '',
      nameArabic: subject.nameArabic || '',
      code: subject.code || '',
      department: (subject.department as DepartmentType) || DepartmentType.KITAB,
      fullMarks: subject.fullMarks || subject.totalMarks || 100,
      passMarks: subject.passMarks || 40,
      type: (subject.type as any) || 'COMPULSORY',
      author: subject.author || subject.authorName || '',
      weeklyPeriods: subject.weeklyPeriods || 5,
      description: subject.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে '${name}' কিতাব/বিষয়টি মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteSubject(id);
      if (res.success) {
        showToast('বিষয় সফলভাবে মুছে ফেলা হয়েছে', 'success');
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
    if (!formData.nameBangla.trim() || !formData.code.trim()) {
      showToast('বিষয়ের নাম এবং কোড প্রদান আবশ্যক', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<SubjectEntity, 'id' | 'tenantId'> = {
        nameBangla: formData.nameBangla,
        nameEnglish: formData.nameEnglish,
        nameArabic: formData.nameArabic,
        code: formData.code,
        department: formData.department,
        totalMarks: Number(formData.fullMarks) || 100,
        fullMarks: Number(formData.fullMarks) || 100,
        passMarks: Number(formData.passMarks) || 40,
        type: formData.type,
        author: formData.author,
        authorName: formData.author,
        weeklyPeriods: Number(formData.weeklyPeriods) || 5,
        description: formData.description,
      };

      if (editingSubject) {
        const res = await api.updateSubject(editingSubject.id, payload);
        if (res.success) {
          showToast('বিষয়ের তথ্য সফলভাবে হালনাগাদ হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createSubject(payload);
        if (res.success) {
          showToast('নতুন কিতাব/বিষয় সফলভাবে তৈরি হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'তৈরি ব্যর্থ হয়েছে', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'COMPULSORY':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">বাধ্যতামূলক (Compulsory)</span>;
      case 'ELECTIVE':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">ঐচ্ছিক (Elective)</span>;
      case 'HIFZ':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">হিফজ ও তাজবীদ</span>;
      case 'ORAL':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">মৌখিক / তাকরার</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header, Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            কিতাব ও বিষয় ভাণ্ডার (Subject & Book Repository)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            কওমি ও আলিয়া মাদ্রাসার কিতাবসমূহ, আরবি সাহিত্য, হাদিস, তাফসীর, ফিকহ ও সাধারণ পাঠ্যবই
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="কিতাব, বিষয় বা লেখকের নাম..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
            >
              <option value="ALL">সকল বিভাগ (All)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>
                  {d.nameBangla}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">সকল ধরন (All Types)</option>
            <option value="COMPULSORY">বাধ্যতামূলক</option>
            <option value="ELECTIVE">ঐচ্ছিক</option>
            <option value="HIFZ">হিফজ ও তাজবীদ</option>
            <option value="ORAL">মৌখিক / তাকরার</option>
          </select>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              নতুন কিতাব/বিষয় যুক্ত করুন
            </button>
          )}
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                      {subject.code}
                    </span>
                    {getTypeBadge(subject.type || 'COMPULSORY')}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {subject.nameBangla}
                  </h3>
                  {subject.nameArabic && (
                    <p className="text-xs font-arabic text-emerald-700 dark:text-emerald-400">
                      {subject.nameArabic}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md block">
                    পূর্ণমান: {subject.fullMarks || subject.totalMarks || 100}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    পাস: {subject.passMarks || 40}
                  </span>
                </div>
              </div>

              {(subject.author || subject.authorName) && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>মুসান্নিফ / লেখক: <strong className="text-slate-700 dark:text-slate-300">{subject.author || subject.authorName}</strong></span>
                </p>
              )}

              {subject.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {subject.description}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>বিভাগ: <strong className="text-slate-700 dark:text-slate-200">{subject.department}</strong></span>
                <span>সাপ্তাহিক পিরিয়ড: <strong className="text-teal-600 dark:text-teal-400">{subject.weeklyPeriods || 5} টি</strong></span>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(subject)}
                  className="p-1.5 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="সম্পাদনা করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id, subject.nameBangla)}
                  className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো বিষয় বা কিতাব পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            আপনার মাদ্রাসার পাঠ্যক্রমের কিতাব/বিষয় যুক্ত করতে উপরের বোতামে ক্লিক করুন।
          </p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                {editingSubject ? 'কিতাব/বিষয় সম্পাদনা' : 'নতুন কিতাব/বিষয় সংযোজন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    কিতাব/বিষয়ের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: হেদায়াতুন নাহব / কুরআন নাজেরা"
                    value={formData.nameBangla}
                    onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিষয় কোড *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: SUB-101 / ARB-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    আরবি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: هداية النحو / تيسير المنطق"
                    value={formData.nameArabic}
                    onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-arabic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মুসান্নিফ / লেখক
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: আল্লামা ইবনে মালিক / ইমাম শাফিয়ী রহ."
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিভাগ নির্বাচন *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.nameBangla}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিষয়ের ধরন *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="COMPULSORY">বাধ্যতামূলক (Compulsory)</option>
                    <option value="ELECTIVE">ঐচ্ছিক (Elective)</option>
                    <option value="HIFZ">হিফজুল কুরআন ও তাজবীদ</option>
                    <option value="ORAL">মৌখিক / তাকরার</option>
                    <option value="PRACTICAL">ব্যবহারিক / আমলী মশক</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মোট পূর্ণমান *
                  </label>
                  <input
                    type="number"
                    value={formData.fullMarks}
                    onChange={(e) => setFormData({ ...formData, fullMarks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পাস নম্বর *
                  </label>
                  <input
                    type="number"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সাপ্তাহিক পিরিয়ড
                  </label>
                  <input
                    type="number"
                    value={formData.weeklyPeriods}
                    onChange={(e) => setFormData({ ...formData, weeklyPeriods: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  সংক্ষিপ্ত বিবরণ / অধ্যয়নের লক্ষ্য
                </label>
                <textarea
                  rows={2}
                  placeholder="কিতাব বা বিষয়ের সারসংক্ষেপ..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-800 dark:text-slate-100 resize-none"
                />
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
                  className="px-5 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingSubject ? 'হালনাগাদ করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
