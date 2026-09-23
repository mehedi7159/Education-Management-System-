import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Search,
  CheckSquare,
  Sparkles,
  Calendar,
  X,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { SyllabusEntity, ClassEntity, SubjectEntity, AcademicSession } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface SyllabusManagementTabProps {
  syllabuses: SyllabusEntity[];
  classes: ClassEntity[];
  subjects: SubjectEntity[];
  sessions: AcademicSession[];
  onRefresh: () => void;
  canManage: boolean;
}

export const SyllabusManagementTab: React.FC<SyllabusManagementTabProps> = ({
  syllabuses,
  classes,
  subjects,
  sessions,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();

  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterTerm, setFilterTerm] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<SyllabusEntity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    classId: '',
    className: '',
    subjectId: '',
    subjectName: '',
    academicSessionId: '',
    term: '১ম সাময়িক',
    unitName: '',
    topicTitle: '',
    description: '',
    targetCompletionDate: '',
    estimatedPeriods: 10,
    status: 'PLANNED' as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW',
    completionPercentage: 0,
  });

  const filteredSyllabuses = syllabuses.filter((s) => {
    const sTerm = s.term || s.termName || '';
    const sTitle = s.topicTitle || '';
    const sUnit = s.unitName || '';
    const sSubject = s.subjectName || '';
    const matchesClass = filterClass === 'ALL' || s.classId === filterClass;
    const matchesSubject = filterSubject === 'ALL' || s.subjectId === filterSubject;
    const matchesTerm = filterTerm === 'ALL' || sTerm === filterTerm;
    const matchesSearch =
      sTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sSubject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSubject && matchesTerm && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingSyllabus(null);
    const activeSession = sessions.find((s) => s.isCurrent) || sessions[0];
    const defaultClass = classes[0];
    const defaultSubject = subjects[0];

    setFormData({
      classId: defaultClass?.id || '',
      className: defaultClass?.nameBangla || '',
      subjectId: defaultSubject?.id || '',
      subjectName: defaultSubject?.nameBangla || '',
      academicSessionId: activeSession?.id || '',
      term: '১ম সাময়িক',
      unitName: 'অধ্যায় ১ / বাবে আওয়াল',
      topicTitle: '',
      description: '',
      targetCompletionDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      estimatedPeriods: 10,
      status: 'PLANNED',
      completionPercentage: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (syllabus: SyllabusEntity) => {
    setEditingSyllabus(syllabus);
    setFormData({
      classId: syllabus.classId,
      className: syllabus.className,
      subjectId: syllabus.subjectId,
      subjectName: syllabus.subjectName,
      academicSessionId: syllabus.academicSessionId || '',
      term: syllabus.term || syllabus.termName || '১ম সাময়িক',
      unitName: syllabus.unitName || '',
      topicTitle: syllabus.topicTitle || '',
      description: syllabus.description || '',
      targetCompletionDate: syllabus.targetCompletionDate || '',
      estimatedPeriods: syllabus.estimatedPeriods || 10,
      status: (syllabus.status as any) || 'PLANNED',
      completionPercentage: syllabus.completionPercentage || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি '${title}' সিলেবাস অধ্যায়টি মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteSyllabus(id);
      if (res.success) {
        showToast('সিলেবাস সফলভাবে মুছে ফেলা হয়েছে', 'success');
        onRefresh();
      } else {
        showToast(res.error?.message || 'মুছে ফেলা ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleQuickStatusChange = async (syllabus: SyllabusEntity, newStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW') => {
    if (!canManage) return;
    try {
      const pct = newStatus === 'COMPLETED' ? 100 : newStatus === 'IN_PROGRESS' ? 50 : 0;
      const res = await api.updateSyllabus(syllabus.id, {
        status: newStatus,
        completionPercentage: pct,
      });
      if (res.success) {
        showToast('সিলেবাস অগ্রগতি হালনাগাদ হয়েছে', 'success');
        onRefresh();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId || !formData.topicTitle.trim()) {
      showToast('শ্রেণি, বিষয় এবং পাঠ শিরোনাম পূরণ করুন', 'warning');
      return;
    }

    const cObj = classes.find((c) => c.id === formData.classId);
    const sObj = subjects.find((s) => s.id === formData.subjectId);

    setIsSubmitting(true);
    try {
      const payload = {
        classId: formData.classId,
        className: cObj?.nameBangla || formData.className,
        subjectId: formData.subjectId,
        subjectName: sObj?.nameBangla || formData.subjectName,
        academicSessionId: formData.academicSessionId,
        term: formData.term,
        unitName: formData.unitName,
        topicTitle: formData.topicTitle,
        description: formData.description,
        targetCompletionDate: formData.targetCompletionDate,
        estimatedPeriods: Number(formData.estimatedPeriods),
        status: formData.status,
        completionPercentage: Number(formData.completionPercentage),
      };

      if (editingSyllabus) {
        const res = await api.updateSyllabus(editingSyllabus.id, payload);
        if (res.success) {
          showToast('সিলেবাস সফলভাবে হালনাগাদ হয়েছে', 'success');
          setIsModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createSyllabus(payload);
        if (res.success) {
          showToast('নতুন সিলেবাস যুক্ত হয়েছে', 'success');
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

  const getStatusBadge = (status: string, pct: number) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> সমাপ্ত (১০০%)
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> চলমান ({pct}%)
          </span>
        );
      case 'REVIEW':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> রিভিশন / তাকরার
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            পরিকল্পিত (০%)
          </span>
        );
    }
  };

  // Completion calculation
  const completedCount = syllabuses.filter((s) => s.status === 'COMPLETED').length;
  const overallProgress = syllabuses.length > 0 ? Math.round((completedCount / syllabuses.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header, Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            টার্মভিত্তিক সিলেবাস ও পাঠ অগ্রগতি (Syllabus & Lesson Progress)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ১ম সাময়িক, ২য় সাময়িক ও বার্ষিক পরীক্ষার কিতাবভিত্তিক সবক বিভাজন এবং সমাপ্তি ট্র্যাকিং
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="অধ্যায় বা সবকের শিরোনাম..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">সকল শ্রেণি (All Classes)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameBangla}
              </option>
            ))}
          </select>

          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
          >
            <option value="ALL">সকল টার্ম (All Terms)</option>
            <option value="১ম সাময়িক">১ম সাময়িক</option>
            <option value="২য় সাময়িক">২য় সাময়িক</option>
            <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা</option>
            <option value="দাওরায়ে হাদিস কেন্দ্রীয় পরীক্ষা">দাওরায়ে হাদিস কেন্দ্রীয় পরীক্ষা</option>
          </select>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              নতুন সিলেবাস আইটেম
            </button>
          )}
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-lg shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              সার্বিক শিক্ষাবর্ষের সিলেবাস অগ্রগতি
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              মোট {syllabuses.length} টি পাঠ্য এককের মধ্যে {completedCount} টি সম্পূর্ণ সমাপ্ত হয়েছে
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
            <span>অগ্রগতি হার</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-purple-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Syllabuses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSyllabuses.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                    {s.term || s.termName || '১ম সাময়িক'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 ml-2">
                    {s.className}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-2">
                    {s.topicTitle || s.subjectName}
                  </h3>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {s.subjectName} {s.unitName ? `• ${s.unitName}` : ''}
                  </p>
                </div>
                {getStatusBadge(s.status || 'PLANNED', s.completionPercentage || 0)}
              </div>

              {s.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                  {s.description}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" /> সমাপ্তির লক্ষ্যমাত্রা:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {s.targetCompletionDate || 'অনির্দিষ্ট'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> আনুমানিক পিরিয়ড:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {s.estimatedPeriods || 10} টি ক্লাস
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {canManage ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickStatusChange(s, s.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED')}
                    className={cn(
                      'text-[11px] font-semibold px-2 py-1 rounded-md transition-colors flex items-center gap-1',
                      s.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    )}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    {s.status === 'COMPLETED' ? 'সম্পন্ন হয়েছে' : 'সমাপ্ত চিহ্নিত করুন'}
                  </button>
                </div>
              ) : <div />}

              {canManage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="সম্পাদনা"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.topicTitle || s.subjectName || 'সিলেবাস')}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSyllabuses.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো সিলেবাস বা সবক তালিকা পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            পরীক্ষার প্রস্তুতি ও নিয়মিত পাঠদানের জন্য সিলেবাসের আইটেম যোগ করুন।
          </p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {editingSyllabus ? 'সিলেবাস সম্পাদনা' : 'নতুন পাঠ্য সবক / সিলেবাস আইটেম'}
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
                    জামাত / শ্রেণি *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const c = classes.find((item) => item.id === e.target.value);
                      setFormData({
                        ...formData,
                        classId: e.target.value,
                        className: c?.nameBangla || '',
                      });
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
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
                    কিতাব / বিষয় *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => {
                      const s = subjects.find((sub) => sub.id === e.target.value);
                      setFormData({
                        ...formData,
                        subjectId: e.target.value,
                        subjectName: s?.nameBangla || '',
                      });
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.nameBangla} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    টার্ম / পরীক্ষা *
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="১ম সাময়িক">১ম সাময়িক</option>
                    <option value="২য় সাময়িক">২য় সাময়িক</option>
                    <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা</option>
                    <option value="দাওরায়ে হাদিস কেন্দ্রীয় পরীক্ষা">দাওরায়ে হাদিস কেন্দ্রীয় পরীক্ষা</option>
                    <option value="মাসিক মূল্যায়ন">মাসিক মূল্যায়ন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইউনিট / বাবের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: বাবে আওয়াল / অধ্যায় ১"
                    value={formData.unitName}
                    onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পাঠ বা সবকের মূল শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: এসম ও ফে'লের প্রকারভেদ এবং এরাব বিশ্লেষণ"
                  value={formData.topicTitle}
                  onChange={(e) => setFormData({ ...formData, topicTitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সমাপ্তির লক্ষ্যমাত্রা তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.targetCompletionDate}
                    onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    আনুমানিক পিরিয়ড
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedPeriods}
                    onChange={(e) => setFormData({ ...formData, estimatedPeriods: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বর্তমান অবস্থা
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    <option value="PLANNED">পরিকল্পিত (Planned)</option>
                    <option value="IN_PROGRESS">চলমান (In Progress)</option>
                    <option value="COMPLETED">সমাপ্ত (Completed)</option>
                    <option value="REVIEW">রিভিশন (Review)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিস্তারিত বর্ণনা ও পৃষ্ঠাসংখ্যা
                </label>
                <textarea
                  rows={2}
                  placeholder="কিতাবের অমুক পৃষ্ঠা হতে অমুক পৃষ্ঠা পর্যন্ত..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800 dark:text-slate-100 resize-none"
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
                  className="px-5 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingSyllabus ? 'হালনাগাদ করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
