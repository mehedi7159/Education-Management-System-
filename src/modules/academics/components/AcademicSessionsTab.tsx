import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { AcademicSession } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../i18n';
import { cn } from '../../../utils/cn';

interface AcademicSessionsTabProps {
  sessions: AcademicSession[];
  onRefresh: () => void;
  canManage: boolean;
}

export const AcademicSessionsTab: React.FC<AcademicSessionsTabProps> = ({
  sessions,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sessionName: '',
    hijriYear: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    admissionOpen: true,
  });

  const handleOpenCreate = () => {
    setEditingSession(null);
    const nextYear = new Date().getFullYear() + 1;
    setFormData({
      sessionName: `${new Date().getFullYear()}-${nextYear}`,
      hijriYear: '১৪৪৬-১৪৪৭ হিজরি',
      startDate: `${new Date().getFullYear()}-01-01`,
      endDate: `${new Date().getFullYear()}-12-31`,
      isCurrent: sessions.length === 0,
      admissionOpen: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: AcademicSession) => {
    setEditingSession(session);
    setFormData({
      sessionName: session.sessionName || session.name || '',
      hijriYear: session.hijriYear || '',
      startDate: session.startDate,
      endDate: session.endDate,
      isCurrent: session.isCurrent,
      admissionOpen: session.admissionOpen !== undefined ? session.admissionOpen : session.admissionStatus === 'OPEN',
    });
    setIsModalOpen(true);
  };

  const handleSetCurrent = async (session: AcademicSession) => {
    if (!canManage) return;
    try {
      const res = await api.updateAcademicSession(session.id, { isCurrent: true });
      if (res.success) {
        showToast(`'${session.sessionName || session.name}' শিক্ষাবর্ষ বর্তমান সেশন হিসেবে নির্ধারিত হয়েছে`, 'success');
        onRefresh();
      } else {
        showToast(res.error?.message || 'সেশন পরিবর্তন ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে '${name}' শিক্ষাবর্ষটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteAcademicSession(id);
      if (res.success) {
        showToast('শিক্ষাবর্ষ সফলভাবে মুছে ফেলা হয়েছে', 'success');
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
    if (!formData.sessionName || !formData.startDate || !formData.endDate) {
      showToast('সবগুলো আবশ্যকীয় ঘর পূরণ করুন', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<AcademicSession, 'id' | 'tenantId'> = {
        name: formData.sessionName,
        sessionName: formData.sessionName,
        hijriYear: formData.hijriYear,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        admissionOpen: formData.admissionOpen,
        admissionStatus: formData.admissionOpen ? 'OPEN' : 'CLOSED',
      };

      if (editingSession) {
        const res = await api.updateAcademicSession(editingSession.id, payload);
        if (res.success) {
          showToast('শিক্ষাবর্ষ সফলভাবে হালনাগাদ করা হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createAcademicSession(payload);
        if (res.success) {
          showToast('নতুন শিক্ষাবর্ষ সফলভাবে তৈরি হয়েছে', 'success');
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
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            শিক্ষাবর্ষ ও অ্যাকাডেমিক সেশন ব্যবস্থাপনা
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মাদ্রাসার বার্ষিক শিক্ষাবর্ষ, হিজরি ক্যালেন্ডার সংযোগ ও ভর্তি সেশনের সময়সীমা নির্ধারণ
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            নতুন শিক্ষাবর্ষ যুক্ত করুন
          </button>
        )}
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              'relative rounded-xl border p-5 transition-all shadow-sm bg-white dark:bg-slate-900 flex flex-col justify-between',
              session.isCurrent
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            )}
          >
            {session.isCurrent && (
              <span className="absolute -top-3 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-xs">
                <Sparkles className="w-3 h-3" />
                বর্তমান সেশন (Current)
              </span>
            )}

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    শিক্ষাবর্ষ: {session.sessionName || session.name}
                  </h3>
                  {session.hijriYear && (
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {session.hijriYear}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> মেয়াদকাল:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {session.startDate} হতে {session.endDate}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">ভর্তি কার্যক্রম:</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md font-medium text-[11px]',
                      (session.admissionOpen !== undefined ? session.admissionOpen : session.admissionStatus === 'OPEN')
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                    )}
                  >
                    {(session.admissionOpen !== undefined ? session.admissionOpen : session.admissionStatus === 'OPEN') ? 'ভর্তি চলছে (Open)' : 'ভর্তি বন্ধ (Closed)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {!session.isCurrent && canManage ? (
                <button
                  onClick={() => handleSetCurrent(session)}
                  className="text-xs font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  সেশন সক্রিয় করুন
                </button>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> সক্রিয়
                </span>
              )}

              {canManage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(session)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(session.id, session.sessionName || session.name)}
                    className="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো শিক্ষাবর্ষ যুক্ত করা হয়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            মাদ্রাসার নিয়মিত শ্রেণি কার্যক্রম শুরু করতে প্রথমে একটি শিক্ষাবর্ষ তৈরি করুন।
          </p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {editingSession ? 'শিক্ষাবর্ষ সম্পাদনা' : 'নতুন শিক্ষাবর্ষ তৈরি'}
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
                  শিক্ষাবর্ষের নাম (ঈসাব্দ / শিক্ষাবর্ষ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: ২০২৫-২০২৬ বা ২০২৫"
                  value={formData.sessionName}
                  onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  হিজরি শিক্ষাবর্ষ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="উদা: ১৪৪৬-১৪৪৭ হিজরি"
                  value={formData.hijriYear}
                  onChange={(e) => setFormData({ ...formData, hijriYear: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                />
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
                    সমাপ্তির তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    বর্তমান সক্রিয় শিক্ষাবর্ষ (Current Active Session) হিসেবে নির্ধারণ করুন
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.admissionOpen}
                    onChange={(e) => setFormData({ ...formData, admissionOpen: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    এই শিক্ষাবর্ষে নতুন ভর্তি ফরম গ্রহণ উন্মুক্ত থাকবে (Admission Open)
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
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingSession ? 'হালনাগাদ করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
