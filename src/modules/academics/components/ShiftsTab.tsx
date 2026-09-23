import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { ShiftEntity } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface ShiftsTabProps {
  shifts: ShiftEntity[];
  onRefresh: () => void;
  canManage: boolean;
}

export const ShiftsTab: React.FC<ShiftsTabProps> = ({ shifts, onRefresh, canManage }) => {
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nameBangla: '',
    nameEnglish: '',
    startTime: '07:30',
    endTime: '13:00',
    halfDayEndTime: '11:30',
    graceMinutes: 15,
    isResidential: false,
    isActive: true,
  });

  const getShiftIcon = (name: string) => {
    if (name.includes('প্রভাত') || name.includes('সকাল') || name.includes('Morning')) {
      return <Sunrise className="w-5 h-5 text-amber-500" />;
    }
    if (name.includes('দিবা') || name.includes('Day')) {
      return <Sun className="w-5 h-5 text-orange-500" />;
    }
    if (name.includes('সান্ধ্য') || name.includes('Evening')) {
      return <Sunset className="w-5 h-5 text-purple-500" />;
    }
    return <Moon className="w-5 h-5 text-indigo-500" />;
  };

  const handleOpenCreate = () => {
    setEditingShift(null);
    setFormData({
      nameBangla: '',
      nameEnglish: '',
      startTime: '07:30',
      endTime: '13:00',
      halfDayEndTime: '11:30',
      graceMinutes: 15,
      isResidential: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift: ShiftEntity) => {
    setEditingShift(shift);
    setFormData({
      nameBangla: shift.nameBangla,
      nameEnglish: shift.nameEnglish || '',
      startTime: shift.startTime,
      endTime: shift.endTime,
      halfDayEndTime: shift.halfDayEndTime || '',
      graceMinutes: shift.graceMinutes || 15,
      isResidential: shift.isResidential || false,
      isActive: shift.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে '${name}' শিফটটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteShift(id);
      if (res.success) {
        showToast('শিফট সফলভাবে মুছে ফেলা হয়েছে', 'success');
        onRefresh();
      } else {
        showToast(res.error?.message || 'মুছে ফেলা সম্ভব হয়নি', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBangla.trim() || !formData.startTime || !formData.endTime) {
      showToast('আবশ্যকীয় সব তথ্য প্রদান করুন', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShift) {
        const res = await api.updateShift(editingShift.id, formData);
        if (res.success) {
          showToast('শিফটের সময়সূচি সফলভাবে হালনাগাদ হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createShift(formData);
        if (res.success) {
          showToast('নতুন শিফট সফলভাবে তৈরি হয়েছে', 'success');
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
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            শিফট ও সময়সূচি ব্যবস্থাপনা (Shifts & Timings)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মাদ্রাসার প্রভাতী, দিবা, সান্ধ্যকালীন হিফজ ও অনাবাসিক/আবাসিক শিফট কনফিগারেশন
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            নতুন শিফট তৈরি করুন
          </button>
        )}
      </div>

      {/* Grid of Shifts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                    {getShiftIcon(shift.nameBangla)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {shift.nameBangla}
                    </h3>
                    {shift.nameEnglish && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {shift.nameEnglish}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full mt-1',
                    shift.isActive ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-400'
                  )}
                  title={shift.isActive ? 'সক্রিয় শিফট' : 'নিষ্ক্রিয়'}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-500">নিয়মিত সময়সূচি:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>

                {shift.halfDayEndTime && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-slate-500">অর্ধদিবস সমাপ্তি (বৃহস্পতিবার):</span>
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      {shift.halfDayEndTime}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="text-slate-500">দেরিতে উপস্থিতির ছাড় (Grace):</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {shift.graceMinutes || 15} মিনিট
                  </span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(shift)}
                  className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="সম্পাদনা করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(shift.id, shift.nameBangla)}
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

      {shifts.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো শিফট কনফিগার করা হয়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            ক্লাস ও হাজিরা সুষ্ঠুভাবে পরিচালনার জন্য প্রভাতী বা দিবা শিফট তৈরি করুন।
          </p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                {editingShift ? 'শিফট সম্পাদনা' : 'নতুন শিফট তৈরি'}
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
                    শিফটের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: প্রভাতী শিফট / দিবা শিফট"
                    value={formData.nameBangla}
                    onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইংরেজি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: Morning Shift"
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শুরুর সময় (Start Time) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সমাপ্তির সময় (End Time) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    অর্ধদিবস ছুটি (বৃহস্পতিবার)
                  </label>
                  <input
                    type="time"
                    value={formData.halfDayEndTime}
                    onChange={(e) => setFormData({ ...formData, halfDayEndTime: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    লেট কাউন্টের গ্রেস টাইম (মিনিট)
                  </label>
                  <input
                    type="number"
                    value={formData.graceMinutes}
                    onChange={(e) => setFormData({ ...formData, graceMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    শিফটটি বর্তমানে সক্রিয় রাখুন (Active)
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
                  className="px-5 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingShift ? 'হালনাগাদ করুন' : 'শিফট তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
