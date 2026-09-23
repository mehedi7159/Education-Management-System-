import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Users,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react';
import { DepartmentConfig, DepartmentType } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface DepartmentsTabProps {
  departments: DepartmentConfig[];
  classesCountByDept: Record<string, number>;
  onRefresh: () => void;
  canManage: boolean;
}

export const DepartmentsTab: React.FC<DepartmentsTabProps> = ({
  departments,
  classesCountByDept,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: DepartmentType.KITAB as DepartmentType,
    nameBangla: '',
    nameEnglish: '',
    nameArabic: '',
    headOfDepartment: '',
    description: '',
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({
      code: DepartmentType.KITAB,
      nameBangla: '',
      nameEnglish: '',
      nameArabic: '',
      headOfDepartment: '',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentConfig) => {
    setEditingDept(dept);
    setFormData({
      code: (dept.code || dept.type) as DepartmentType,
      nameBangla: dept.nameBangla,
      nameEnglish: dept.nameEnglish || '',
      nameArabic: dept.nameArabic || '',
      headOfDepartment: dept.headOfDepartment || dept.headName || '',
      description: dept.description || '',
      isActive: dept.isActive !== undefined ? dept.isActive : dept.isEnabled,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে '${name}' বিভাগটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteDepartment(id);
      if (res.success) {
        showToast('বিভাগ সফলভাবে মুছে ফেলা হয়েছে', 'success');
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
    if (!formData.nameBangla.trim()) {
      showToast('বিভাগের বাংলা নাম প্রদান করুন', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<DepartmentConfig, 'id' | 'tenantId'> = {
        type: formData.code,
        code: formData.code,
        nameBangla: formData.nameBangla,
        nameEnglish: formData.nameEnglish,
        nameArabic: formData.nameArabic,
        headName: formData.headOfDepartment,
        headOfDepartment: formData.headOfDepartment,
        description: formData.description,
        isEnabled: formData.isActive,
        isActive: formData.isActive,
      };

      if (editingDept) {
        const res = await api.updateDepartment(editingDept.id, payload);
        if (res.success) {
          showToast('বিভাগ তথ্য সফলভাবে হালনাগাদ হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createDepartment(payload);
        if (res.success) {
          showToast('নতুন বিভাগ সফলভাবে যুক্ত হয়েছে', 'success');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            বিভাগ ও অনুষদ ব্যবস্থাপনা (Departments)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মাদ্রাসার স্বতন্ত্র অনুষদ (যেমন: নূরানী, নাজেরা, হিফজ, কিতাব, ইফতা, আলিয়া ও জেনারেল) কনফিগারেশন
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            নতুন বিভাগ যুক্ত করুন
          </button>
        )}
      </div>

      {/* Grid of Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const deptKey = dept.code || dept.type;
          const classCount = (deptKey ? classesCountByDept[deptKey] : 0) || 0;
          const isDeptActive = dept.isActive !== undefined ? dept.isActive : dept.isEnabled;
          const hodName = dept.headOfDepartment || dept.headName;

          return (
            <div
              key={dept.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      {dept.code || dept.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-2">
                      {dept.nameBangla}
                    </h3>
                    {dept.nameArabic && (
                      <p className="text-xs font-arabic text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {dept.nameArabic}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full mt-1',
                      isDeptActive ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-400'
                    )}
                    title={isDeptActive ? 'সক্রিয় বিভাগ' : 'নিষ্ক্রিয়'}
                  />
                </div>

                {dept.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                    {dept.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <BookOpen className="w-3.5 h-3.5" /> মোট শ্রেণি/জামাত:
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">
                      {classCount} টি জামাত
                    </span>
                  </div>

                  {hodName && (
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5" /> বিভাগীয় প্রধান (HOD):
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {hodName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id, dept.nameBangla)}
                    className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো বিভাগ যুক্ত করা হয়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            আপনার মাদ্রাসার নূরানী, হিফজ বা কিতাব বিভাগ কনফিগার করতে নতুন বিভাগ যোগ করুন।
          </p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingDept ? 'বিভাগ সম্পাদনা' : 'নতুন বিভাগ সংযোজন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিভাগ কোড / ধরন *
                  </label>
                  <select
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value as DepartmentType })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value={DepartmentType.NURANI}>নূরানী বিভাগ (NURANI)</option>
                    <option value={DepartmentType.NAJERA}>নাজেরা বিভাগ (NAJERA)</option>
                    <option value={DepartmentType.HIFZ}>হিফজুল কুরআন বিভাগ (HIFZ)</option>
                    <option value={DepartmentType.KITAB}>কিতাব বিভাগ (KITAB)</option>
                    <option value={DepartmentType.DAWRA_HADITH}>দাওরায়ে হাদিস / তাকমীল (DAWRA_HADITH)</option>
                    <option value={DepartmentType.IFTA}>ইফতা ও ফতোয়া (IFTA)</option>
                    <option value={DepartmentType.DAKHIL}>দাখিল ও আলিম (DAKHIL)</option>
                    <option value={DepartmentType.GENERAL}>জেনারেল শিক্ষা (GENERAL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিভাগের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: কিতাব বিভাগ / নাজেরা"
                    value={formData.nameBangla}
                    onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইংরেজি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: Kitab Department"
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    আরবি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: قسم الكتب / قسم الحفظ"
                    value={formData.nameArabic}
                    onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-arabic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিভাগীয় প্রধান / নাজেমে তালীমাত (Head of Dept)
                </label>
                <input
                  type="text"
                  placeholder="উদা: মুফতি আব্দুল্লাহ আল-মামুন"
                  value={formData.headOfDepartment}
                  onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিবরণ / পাঠ্যক্রমের উদ্দেশ্য
                </label>
                <textarea
                  rows={2}
                  placeholder="বিভাগের শিক্ষা কার্যক্রম ও বিশেষ নিয়মাবলী..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    বিভাগটি বর্তমানে সক্রিয় রাখুন (Active)
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
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingDept ? 'হালনাগাদ করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
