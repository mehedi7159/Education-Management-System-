import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Users,
  Flag,
  X,
  AlertCircle,
} from 'lucide-react';
import { AcademicCalendarEventEntity, AcademicSession } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface AcademicCalendarTabProps {
  events: AcademicCalendarEventEntity[];
  sessions: AcademicSession[];
  onRefresh: () => void;
  canManage: boolean;
}

export const AcademicCalendarTab: React.FC<AcademicCalendarTabProps> = ({
  events,
  sessions,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEventEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    hijriDate: '',
    eventType: 'EXAM' as 'EXAM' | 'HOLIDAY' | 'EVENT' | 'ADMISSION' | 'MEETING' | 'MAHFIL' | 'DARS' | 'NATIONAL_DAY',
    isHoliday: false,
    academicSessionId: '',
    targetAudience: 'ALL' as 'ALL' | 'STUDENTS' | 'TEACHERS' | 'GUARDIANS' | 'STAFF',
    colorTag: '#3b82f6',
  });

  const filteredEvents = events.filter((e) => {
    const eType = e.eventType || e.category || 'EVENT';
    const matchesType = filterType === 'ALL' || eType === filterType;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.hijriDate && e.hijriDate.includes(searchQuery));
    return matchesType && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingEvent(null);
    const activeSession = sessions.find((s) => s.isCurrent) || sessions[0];
    const today = new Date().toISOString().split('T')[0];

    setFormData({
      title: '',
      description: '',
      startDate: today,
      endDate: today,
      hijriDate: '১৫ শাওয়াল ১৪৪৬ হিজরি',
      eventType: 'EXAM',
      isHoliday: false,
      academicSessionId: activeSession?.id || '',
      targetAudience: 'ALL',
      colorTag: '#3b82f6',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: AcademicCalendarEventEntity) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate || event.startDate,
      hijriDate: event.hijriDate || '',
      eventType: (event.eventType as any) || (event.category as any) || 'EXAM',
      isHoliday: event.isHoliday || false,
      academicSessionId: event.academicSessionId || '',
      targetAudience: event.targetAudience || 'ALL',
      colorTag: event.colorTag || event.colorCode || '#3b82f6',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে '${title}' ইভেন্টটি বর্ষপঞ্জি থেকে মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteAcademicCalendarEvent(id);
      if (res.success) {
        showToast('ইভেন্ট সফলভাবে মুছে ফেলা হয়েছে', 'success');
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
    if (!formData.title.trim() || !formData.startDate) {
      showToast('শিরোনাম ও শুরুর তারিখ আবশ্যক', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<AcademicCalendarEventEntity, 'id' | 'tenantId' | 'createdAt'> = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        hijriDate: formData.hijriDate,
        eventType: formData.eventType,
        category: (formData.eventType as any) || 'EVENT',
        isHoliday: formData.isHoliday,
        academicSessionId: formData.academicSessionId,
        targetAudience: formData.targetAudience,
        colorTag: formData.colorTag,
        colorCode: formData.colorTag,
      };

      if (editingEvent) {
        const res = await api.updateAcademicCalendarEvent(editingEvent.id, payload);
        if (res.success) {
          showToast('ইভেন্ট তথ্য সফলভাবে হালনাগাদ হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createAcademicCalendarEvent(payload);
        if (res.success) {
          showToast('নতুন অ্যাকাডেমিক ইভেন্ট সফলভাবে তৈরি হয়েছে', 'success');
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

  const getEventTypeBadge = (type: string, isHoliday?: boolean) => {
    switch (type) {
      case 'EXAM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">পরীক্ষা (Exam)</span>;
      case 'HOLIDAY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300">ছুটি (Holiday)</span>;
      case 'MAHFIL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">বার্ষিক মাহফিল / সমাবর্তন</span>;
      case 'ADMISSION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300">ভর্তি কার্যক্রম</span>;
      case 'DARS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300">দারসুল কুরআন / বয়ান</span>;
      case 'NATIONAL_DAY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300">জাতীয় দিবস</span>;
      case 'MEETING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300">অভিভাবক / শুরা সভা</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header, Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            অ্যাকাডেমিক ক্যালেন্ডার ও বার্ষিক বর্ষপঞ্জি (Academic Calendar)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            পরীক্ষার সূচি, মাহফিল, দারসুল কুরআন, জাতীয় দিবস ও মাদ্রাসা ছুটির সমন্বিত বর্ষপঞ্জি
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ইভেন্ট বা ছুটির নাম..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">সকল ইভেন্ট (All Events)</option>
            <option value="EXAM">পরীক্ষা (Exams)</option>
            <option value="HOLIDAY">ছুটি (Holidays)</option>
            <option value="MAHFIL">মাহফিল ও সমাবর্তন</option>
            <option value="ADMISSION">ভর্তি কার্যক্রম</option>
            <option value="DARS">দারসুল কুরআন</option>
            <option value="MEETING">অভিভাবক সভা</option>
            <option value="NATIONAL_DAY">জাতীয় দিবস</option>
          </select>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              নতুন ইভেন্ট যুক্ত করুন
            </button>
          )}
        </div>
      </div>

      {/* Grid of Calendar Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className={cn(
              'bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between',
              event.isHoliday
                ? 'border-red-200 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {getEventTypeBadge(event.eventType || event.category || 'EVENT', event.isHoliday)}
                    {event.isHoliday && (
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 px-2 py-0.5 rounded-full">
                        মাদ্রাসা বন্ধ
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-2">
                    {event.title}
                  </h3>
                  {event.hijriDate && (
                    <p className="text-xs font-arabic text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {event.hijriDate}
                    </p>
                  )}
                </div>
              </div>

              {event.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" /> সময়কাল:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {event.startDate} {event.endDate && event.endDate !== event.startDate ? `হতে ${event.endDate}` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-blue-600" /> লক্ষ্য দল:
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {event.targetAudience === 'ALL'
                      ? 'সকলের জন্য'
                      : event.targetAudience === 'STUDENTS'
                      ? 'শিক্ষার্থীবৃন্দ'
                      : event.targetAudience === 'TEACHERS'
                      ? 'শিক্ষকমণ্ডলী'
                      : 'অভিভাবকবৃন্দ'}
                  </span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(event)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="সম্পাদনা"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো ক্যালেন্ডার ইভেন্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            পরীক্ষা, ছুটি বা মাদ্রাসার বার্ষিক মাহফিলের তারিখ যুক্ত করতে উপরের বোতামে ক্লিক করুন।
          </p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingEvent ? 'ইভেন্ট সম্পাদনা' : 'নতুন অ্যাকাডেমিক ইভেন্ট / ছুটির তালিকা'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ইভেন্ট / ছুটির শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: ১ম সাময়িক পরীক্ষা / ঈদুল ফিতরের ছুটি"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইভেন্টের ধরন *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setFormData({
                        ...formData,
                        eventType: t,
                        isHoliday: t === 'HOLIDAY' ? true : formData.isHoliday,
                      });
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="EXAM">পরীক্ষা (Exams)</option>
                    <option value="HOLIDAY">ছুটি (Holiday)</option>
                    <option value="MAHFIL">বার্ষিক মাহফিল / সমাবর্তন</option>
                    <option value="ADMISSION">ভর্তি কার্যক্রম</option>
                    <option value="DARS">দারসুল কুরআন / ইসলাহী মজলিস</option>
                    <option value="MEETING">অভিভাবক / শুরা সভা</option>
                    <option value="NATIONAL_DAY">জাতীয় দিবস</option>
                    <option value="EVENT">সাধারণ অনুষ্ঠান</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    হিজরি তারিখ (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: ১ শাওয়াল ১৪৪৬ হিজরি"
                    value={formData.hijriDate}
                    onChange={(e) => setFormData({ ...formData, hijriDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শুরুর তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সমাপ্তির তারিখ (ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  লক্ষ্য দল (Target Audience)
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                >
                  <option value="ALL">সকলের জন্য (All)</option>
                  <option value="STUDENTS">শিক্ষার্থীবৃন্দ (Students)</option>
                  <option value="TEACHERS">শিক্ষকমণ্ডলী (Teachers)</option>
                  <option value="GUARDIANS">অভিভাবকবৃন্দ (Guardians)</option>
                  <option value="STAFF">কর্মকর্তা ও কর্মচারী (Staff)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিস্তারিত বিবরণ ও নির্দেশনা
                </label>
                <textarea
                  rows={2}
                  placeholder="ইভেন্ট বা ছুটির বিস্তারিত তথ্য..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHoliday}
                    onChange={(e) => setFormData({ ...formData, isHoliday: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded-sm border-slate-300 focus:ring-red-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    এই দিনে মাদ্রাসার নিয়মিত পাঠদান বন্ধ থাকবে (Holiday)
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
                  className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingEvent ? 'হালনাগাদ করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
