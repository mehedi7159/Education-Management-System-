import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Save,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import {
  ExamEntity,
  ExamSubjectEntity,
  ClassEntity,
  StaffEntity,
} from '../../../types';

interface ExamSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamEntity;
  classes: ClassEntity[];
  teachers: StaffEntity[];
  onSubjectsUpdated?: () => void;
}

export const ExamSubjectsModal: React.FC<ExamSubjectsModalProps> = ({
  isOpen,
  onClose,
  exam,
  classes,
  teachers,
  onSubjectsUpdated,
}) => {
  const { showToast } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [subjects, setSubjects] = useState<ExamSubjectEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);

  // Form state for adding/editing a subject
  const [isEditing, setIsEditing] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [fullMarks, setFullMarks] = useState(100);
  const [passMarks, setPassMarks] = useState(40);
  const [theoryFullMarks, setTheoryFullMarks] = useState(100);
  const [oralFullMarks, setOralFullMarks] = useState(0);
  const [mcqFullMarks, setMcqFullMarks] = useState(0);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [examDate, setExamDate] = useState('');
  const [roomNo, setRoomNo] = useState('');

  const loadSubjects = async () => {
    if (!exam.id) return;
    setIsLoading(true);
    try {
      const res = await api.getExamSubjects(exam.id);
      if (res.success && res.data) {
        setSubjects(res.data);
      }
    } catch (err: any) {
      showToast('বিষয় তালিকা লোড করতে ব্যর্থ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
      if (classes.length > 0 && !selectedClassId) {
        setSelectedClassId(classes[0].id);
      }
    }
  }, [isOpen, exam.id]);

  const filteredSubjects = subjects.filter(
    (s) => !selectedClassId || s.classId === selectedClassId
  );

  const resetForm = () => {
    setIsEditing(false);
    setEditSubjectId(null);
    setSubjectName('');
    setSubjectCode('');
    setFullMarks(100);
    setPassMarks(40);
    setTheoryFullMarks(100);
    setOralFullMarks(0);
    setMcqFullMarks(0);
    setAssignedTeacherId('');
    setExamDate('');
    setRoomNo('');
  };

  const handleStartEdit = (s: ExamSubjectEntity) => {
    setIsEditing(true);
    setEditSubjectId(s.id);
    setSubjectName(s.subjectName);
    setSubjectCode(s.subjectCode || '');
    setFullMarks(s.fullMarks);
    setPassMarks(s.passMarks);
    setTheoryFullMarks(s.theoryFullMarks ?? s.fullMarks);
    setOralFullMarks(s.oralFullMarks || 0);
    setMcqFullMarks(s.mcqFullMarks || 0);
    setAssignedTeacherId(s.assignedTeacherId || '');
    setExamDate(s.examDate || '');
    setRoomNo(s.roomNo || '');
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      showToast('বিষয়ের নাম প্রদান করুন', 'warning');
      return;
    }
    if (!selectedClassId) {
      showToast('শ্রেণি নির্বাচন করুন', 'warning');
      return;
    }

    const cls = classes.find((c) => c.id === selectedClassId);
    const teacher = teachers.find((t) => t.id === assignedTeacherId);

    const calculatedTotal = Number(theoryFullMarks) + Number(oralFullMarks) + Number(mcqFullMarks);
    const resolvedFullMarks = Number(fullMarks) || calculatedTotal || 100;

    try {
      if (isEditing && editSubjectId) {
        const res = await api.updateExamSubject(editSubjectId, {
          subjectName: subjectName.trim(),
          subjectCode: subjectCode.trim() || undefined,
          fullMarks: resolvedFullMarks,
          passMarks: Number(passMarks) || 40,
          theoryFullMarks: Number(theoryFullMarks) || 0,
          oralFullMarks: Number(oralFullMarks) || 0,
          mcqFullMarks: Number(mcqFullMarks) || 0,
          assignedTeacherId: assignedTeacherId || undefined,
          assignedTeacherName: teacher ? teacher.nameBangla : undefined,
          examDate: examDate || undefined,
          roomNo: roomNo.trim() || undefined,
        });

        if (res.success) {
          showToast('বিষয় সফলভাবে আপডেট হয়েছে', 'success');
          resetForm();
          loadSubjects();
          onSubjectsUpdated?.();
        } else {
          showToast(res.error?.message || 'আপডেট ব্যর্থ', 'error');
        }
      } else {
        const res = await api.createExamSubject({
          examId: exam.id,
          classId: selectedClassId,
          className: cls ? cls.nameBangla : 'সাধারণ শ্রেণি',
          subjectId: `sbj-custom-${Date.now()}`,
          subjectName: subjectName.trim(),
          subjectCode: subjectCode.trim() || undefined,
          fullMarks: resolvedFullMarks,
          passMarks: Number(passMarks) || 40,
          theoryFullMarks: Number(theoryFullMarks) || 0,
          oralFullMarks: Number(oralFullMarks) || 0,
          mcqFullMarks: Number(mcqFullMarks) || 0,
          assignedTeacherId: assignedTeacherId || undefined,
          assignedTeacherName: teacher ? teacher.nameBangla : undefined,
          examDate: examDate || undefined,
          roomNo: roomNo.trim() || undefined,
        });

        if (res.success) {
          showToast('নতুন বিষয় সংযুক্ত করা হয়েছে', 'success');
          resetForm();
          loadSubjects();
          onSubjectsUpdated?.();
        } else {
          showToast(res.error?.message || 'সংযুক্ত করতে ব্যর্থ', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${name}' বিষয়টি এই পরীক্ষা হতে মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      const res = await api.deleteExamSubject(id);
      if (res.success) {
        showToast('বিষয় মুছে ফেলা হয়েছে', 'info');
        loadSubjects();
        onSubjectsUpdated?.();
      } else {
        showToast(res.error?.message || 'মুছতে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    }
  };

  const handleAutoPopulate = async () => {
    if (!selectedClassId) {
      showToast('দয়া করে শ্রেণি নির্বাচন করুন', 'warning');
      return;
    }
    setIsPopulating(true);
    try {
      const res = await api.populateExamSubjectsFromCurriculum(exam.id, selectedClassId);
      if (res.success) {
        showToast(res.message || 'সিলেবাস হতে বিষয়াবলী সফলভাবে লোড হয়েছে', 'success');
        loadSubjects();
        onSubjectsUpdated?.();
      } else {
        showToast(res.error?.message || 'বিষয়াবলী লোড করতে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsPopulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="exam-subjects-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="exam-subjects-modal-content"
        className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                পরীক্ষার বিষয় ও মানবণ্টন নির্ধারণ
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              পরীক্ষা: <span className="font-medium text-stone-800 dark:text-stone-200">{exam.name}</span>{' '}
              ({exam.year})
            </p>
          </div>
          <button
            id="btn-close-subjects-modal"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Class selector & Auto-populate bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
                জামাত / শ্রেণি নির্বাচন:
              </label>
              <select
                id="select-subject-class"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  resetForm();
                }}
                className="px-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nameBangla} ({cls.nameEnglish})
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-auto-populate-curriculum"
              type="button"
              onClick={handleAutoPopulate}
              disabled={isPopulating || !selectedClassId}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isPopulating ? 'সিলেবাস লোড হচ্ছে...' : 'সিলেবাস হতে স্বয়ংক্রিয় বিষয় লোড করুন'}</span>
            </button>
          </div>

          {/* Add / Edit Subject Form */}
          <form
            id="form-exam-subject"
            onSubmit={handleSaveSubject}
            className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                {isEditing ? <Edit2 className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                <span>{isEditing ? 'বিষয় ও মানবণ্টন সম্পাদনা' : 'নতুন বিষয় সংযুক্ত করুন'}</span>
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline"
                >
                  বাতিল করুন
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  বিষয়ের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-subject-name"
                  type="text"
                  required
                  placeholder="যেমন: কুরআন মাজীদ ও তাজবীদ / হিফজ"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  বিষয় কোড
                </label>
                <input
                  id="input-subject-code"
                  type="text"
                  placeholder="যেমন: QRN-101"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  মোট নম্বর (Full Marks)
                </label>
                <input
                  id="input-full-marks"
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={fullMarks}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setFullMarks(val);
                  }}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  পাস নম্বর (Pass Marks)
                </label>
                <input
                  id="input-pass-marks"
                  type="number"
                  min="0"
                  max={fullMarks}
                  required
                  value={passMarks}
                  onChange={(e) => setPassMarks(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  লিখিত / তাত্ত্বিক নম্বর
                </label>
                <input
                  id="input-theory-marks"
                  type="number"
                  min="0"
                  max={fullMarks}
                  value={theoryFullMarks}
                  onChange={(e) => setTheoryFullMarks(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  মৌখিক / নাজেরা / হিফজ
                </label>
                <input
                  id="input-oral-marks"
                  type="number"
                  min="0"
                  max={fullMarks}
                  value={oralFullMarks}
                  onChange={(e) => setOralFullMarks(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  এমসিকিউ / ব্যবহারিক
                </label>
                <input
                  id="input-mcq-marks"
                  type="number"
                  min="0"
                  max={fullMarks}
                  value={mcqFullMarks}
                  onChange={(e) => setMcqFullMarks(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  মূল্যায়নকারী শিক্ষক (Assigned Teacher)
                </label>
                <select
                  id="select-assigned-teacher"
                  value={assignedTeacherId}
                  onChange={(e) => setAssignedTeacherId(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                >
                  <option value="">-- শিক্ষক নির্ধারণ করুন (ঐচ্ছিক) --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nameBangla} ({t.designation || 'উস্তাদ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  পরীক্ষার তারিখ
                </label>
                <input
                  id="input-exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  পরীক্ষা কক্ষ (Room No)
                </label>
                <input
                  id="input-room-no"
                  type="text"
                  placeholder="যেমন: ১০১ / হলরুম"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="btn-save-subject"
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'পরিবর্তন সংরক্ষণ করুন' : 'বিষয় যুক্ত করুন'}</span>
              </button>
            </div>
          </form>

          {/* Subjects Table */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                এই শ্রেণির পরীক্ষার বিষয়সমূহ ({filteredSubjects.length} টি)
              </h4>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                মোট পূর্ণমান: {filteredSubjects.reduce((acc, s) => acc + (s.fullMarks || 0), 0)}
              </span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-sm text-stone-500">লোড হচ্ছে...</div>
            ) : filteredSubjects.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  এই শ্রেণিতে এখনও কোনো পরীক্ষার বিষয় নির্ধারণ করা হয়নি।
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  উপরের ফর্ম ব্যবহার করে বিষয় যুক্ত করুন অথবা 'সিলেবাস হতে স্বয়ংক্রিয় বিষয় লোড করুন' বাটনে ক্লিক করুন।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="px-3 py-2.5">ক্রম</th>
                      <th className="px-3 py-2.5">বিষয়ের নাম</th>
                      <th className="px-3 py-2.5">কোড</th>
                      <th className="px-3 py-2.5 text-center">পূর্ণমান</th>
                      <th className="px-3 py-2.5 text-center">পাস নম্বর</th>
                      <th className="px-3 py-2.5 text-center">লিখিত / মৌখিক</th>
                      <th className="px-3 py-2.5">পরীক্ষক শিক্ষক</th>
                      <th className="px-3 py-2.5">তারিখ ও কক্ষ</th>
                      <th className="px-3 py-2.5 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                    {filteredSubjects.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                        <td className="px-3 py-2.5 font-medium">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-semibold text-stone-900 dark:text-stone-100">
                          {s.subjectName}
                        </td>
                        <td className="px-3 py-2.5 text-stone-500 font-mono text-[11px]">
                          {s.subjectCode || '—'}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-stone-900 dark:text-stone-100">
                          {s.fullMarks}
                        </td>
                        <td className="px-3 py-2.5 text-center text-amber-600 dark:text-amber-400 font-medium">
                          {s.passMarks}
                        </td>
                        <td className="px-3 py-2.5 text-center text-[11px] text-stone-600 dark:text-stone-400">
                          লি: {s.theoryFullMarks ?? s.fullMarks} | মৌ: {s.oralFullMarks || 0}
                        </td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-300">
                          {s.assignedTeacherName ? (
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3 text-stone-400" />
                              {s.assignedTeacherName}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">নির্ধারিত নেই</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-stone-500">
                          {s.examDate || '—'} {s.roomNo ? `(${s.roomNo})` : ''}
                        </td>
                        <td className="px-3 py-2.5 text-right space-x-1">
                          <button
                            onClick={() => handleStartEdit(s)}
                            className="p-1 text-stone-500 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                            title="সম্পাদনা"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(s.id, s.subjectName)}
                            className="p-1 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
