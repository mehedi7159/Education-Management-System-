import React, { useState, useEffect } from 'react';
import {
  Save,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  Edit3,
  ShieldAlert,
  User,
  Info,
} from 'lucide-react';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  ExamEntity,
  ExamSubjectEntity,
  ExamMarkEntity,
  ClassEntity,
  SectionEntity,
  RoleType,
} from '../../../types';
import { ExamStatusBadge } from './ExamStatusBadge';
import { AuthorizedCorrectionModal } from './AuthorizedCorrectionModal';

interface MarksEntryTabProps {
  exams: ExamEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  initialExamId?: string;
  initialClassId?: string;
  onNavigateToTabulation?: (examId: string, classId: string) => void;
}

export const MarksEntryTab: React.FC<MarksEntryTabProps> = ({
  exams,
  classes,
  sections,
  initialExamId,
  initialClassId,
  onNavigateToTabulation,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || exams[0]?.id || ''
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [subjects, setSubjects] = useState<ExamSubjectEntity[]>([]);
  const [marks, setMarks] = useState<ExamMarkEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Correction Modal State
  const [correctionTargetMark, setCorrectionTargetMark] = useState<ExamMarkEntity | null>(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  const currentExam = exams.find((e) => e.id === selectedExamId);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Role checks
  const isAdminOrMuhtamim =
    user?.role === RoleType.SUPER_ADMIN ||
    user?.role === RoleType.INSTITUTION_ADMIN ||
    user?.role === RoleType.MUHTAMIM;

  // Teacher assigned check
  const isTeacherRole = user?.role === RoleType.TEACHER;
  const isAssignedTeacher =
    !isTeacherRole ||
    (currentSubject?.assignedTeacherId &&
      (currentSubject.assignedTeacherId === user?.id ||
        (user as any)?.staffId === currentSubject.assignedTeacherId));

  const hasEntryPermission = isAdminOrMuhtamim || isAssignedTeacher;

  // Workflow status locks
  const isExamLocked =
    currentExam?.isLocked ||
    currentExam?.status === 'ARCHIVED' ||
    currentExam?.status === 'PUBLISHED';
  const isExamDraft = currentExam?.status === 'DRAFT';

  const canDirectlyEdit = hasEntryPermission && !isExamLocked && !isExamDraft;

  // Load subjects when exam or class changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedExamId) return;
      try {
        const res = await api.getExamSubjects(
          selectedExamId,
          selectedClassId || undefined
        );
        if (res.success && res.data) {
          setSubjects(res.data);
          if (res.data.length > 0) {
            setSelectedSubjectId(res.data[0].id);
          } else {
            setSelectedSubjectId('');
            setMarks([]);
          }
        }
      } catch (err) {
        showToast('বিষয় লোড করতে ব্যর্থ', 'error');
      }
    };

    fetchSubjects();
  }, [selectedExamId, selectedClassId]);

  // Load marks
  const loadMarks = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSubjectId) {
      setMarks([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.getExamMarks(
        selectedExamId,
        selectedClassId,
        selectedSubjectId,
        selectedSectionId !== 'ALL' ? selectedSectionId : undefined
      );
      if (res.success && res.data) {
        setMarks(res.data);
      }
    } catch (err: any) {
      showToast('নম্বর তালিকা লোড করতে ব্যর্থ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarks();
  }, [selectedExamId, selectedClassId, selectedSubjectId, selectedSectionId]);

  // Local state update handlers for row editing
  const handleMarkChange = (
    studentId: string,
    field: 'theoryMarks' | 'oralMarks' | 'mcqMarks' | 'isAbsent' | 'isExpelled' | 'remarks',
    value: any
  ) => {
    if (!canDirectlyEdit) return;

    setMarks((prev) =>
      prev.map((m) => {
        if (m.studentId !== studentId) return m;

        const updated = { ...m, [field]: value };

        const theory = Number(updated.theoryMarks) || 0;
        const oral = Number(updated.oralMarks) || 0;
        const mcq = Number(updated.mcqMarks) || 0;
        const total = updated.isAbsent ? 0 : theory + oral + mcq;

        updated.totalObtained = total;
        updated.isPassed = !updated.isAbsent && total >= (currentSubject?.passMarks || 40);

        return updated;
      })
    );
  };

  // Quick action: set all students full marks or marks
  const handleQuickFullTheoryMarks = () => {
    if (!canDirectlyEdit || !currentSubject) return;
    const maxTheory = currentSubject.theoryFullMarks ?? currentSubject.fullMarks;
    setMarks((prev) =>
      prev.map((m) => ({
        ...m,
        theoryMarks: maxTheory,
        totalObtained: (m.isAbsent ? 0 : maxTheory + (m.oralMarks || 0) + (m.mcqMarks || 0)),
        isPassed: true,
      }))
    );
  };

  // Save all marks batch
  const handleSaveMarks = async () => {
    if (!canDirectlyEdit) {
      showToast('বর্তমান স্ট্যাটাসে সাধারণ নম্বর এন্ট্রি অনুমোদিত নয়।', 'error');
      return;
    }
    if (!selectedExamId || !selectedClassId || !selectedSubjectId) {
      showToast('পরীক্ষা, শ্রেণি ও বিষয় নির্বাচন করুন', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        examId: selectedExamId,
        classId: selectedClassId,
        sectionId: selectedSectionId !== 'ALL' ? selectedSectionId : undefined,
        subjectId: selectedSubjectId,
        marks: marks.map((m) => ({
          studentId: m.studentId,
          studentName: m.studentName,
          rollNo: m.rollNo,
          theoryMarks: Number(m.theoryMarks) || 0,
          oralMarks: Number(m.oralMarks) || 0,
          mcqMarks: Number(m.mcqMarks) || 0,
          isAbsent: m.isAbsent,
          isExpelled: m.isExpelled,
          remarks: m.remarks,
        })),
      };

      const res = await api.saveExamMarks(payload);
      if (res.success) {
        showToast(res.message || 'নম্বরসমূহ সফলভাবে সংরক্ষিত হয়েছে', 'success');
        loadMarks();
      } else {
        showToast(res.error?.message || 'সংরক্ষণে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const classSections = sections.filter((s) => s.classId === selectedClassId);

  return (
    <div id="marks-entry-tab" className="space-y-6">
      {/* Selection & Controls Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              পরীক্ষা নির্বাচন করুন:
            </label>
            <select
              id="entry-select-exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              জামাত / শ্রেণি:
            </label>
            <select
              id="entry-select-class"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId('ALL');
              }}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nameBangla}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              শাখা:
            </label>
            <select
              id="entry-select-section"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            >
              <option value="ALL">সকল শাখা</option>
              {classSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              পরীক্ষার বিষয়:
            </label>
            <select
              id="entry-select-subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
            >
              {subjects.length === 0 ? (
                <option value="">কোনো বিষয় নির্ধারিত নেই</option>
              ) : (
                subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subjectName} (পূর্ণমান: {sub.fullMarks})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Status and Permission Banners */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {currentExam && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">পরীক্ষার অবস্থা:</span>
                <ExamStatusBadge status={currentExam.status} isLocked={currentExam.isLocked} />
              </div>
            )}

            {currentSubject && (
              <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  পূর্ণমান: {currentSubject.fullMarks}
                </span>
                <span>(লিখিত: {currentSubject.theoryFullMarks ?? currentSubject.fullMarks} | মৌখিক: {currentSubject.oralFullMarks || 0})</span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400">
                  পাস নম্বর: {currentSubject.passMarks}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canDirectlyEdit && (
              <button
                type="button"
                onClick={handleQuickFullTheoryMarks}
                className="px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 rounded-lg transition-colors"
                title="সকল শিক্ষার্থীকে লিখিত বিষয়ে সর্বোচ্চ নম্বর দিন"
              >
                সবাইকে পূর্ণ নম্বর
              </button>
            )}

            <button
              id="btn-save-marks"
              type="button"
              onClick={handleSaveMarks}
              disabled={!canDirectlyEdit || isSaving || marks.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'নম্বর সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </div>

        {/* Teacher permission warning */}
        {isTeacherRole && !isAssignedTeacher && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              অনুমতি সীমাবদ্ধ: আপনি এই বিষয়ের জন্য নির্ধারিত শিক্ষক নন। শুধুমাত্র নির্ধারিত শিক্ষক বা
              প্রশাসক নম্বর এন্ট্রি করতে পারবেন।
            </span>
          </div>
        )}

        {/* Result Locked Warning Banner */}
        {isExamLocked && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  ফলাফল লকড করা হয়েছে। সাধারণ ব্যবহারকারী বা শিক্ষক নম্বর পরিবর্তন করতে পারবেন না।
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  কোনো সংশোধন আবশ্যক হলে শুধুমাত্র মুহতামিম বা পরীক্ষা কমিটি অডিট লগ সংরক্ষণের মাধ্যমে
                  অনুমোদিত সংশোধন করতে পারবেন।
                </p>
              </div>
            </div>

            {isAdminOrMuhtamim && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-700 whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                অ্যাডমিন সংশোধন উন্মুক্ত
              </span>
            )}
          </div>
        )}

        {/* Draft Notice */}
        {isExamDraft && (
          <div className="p-3 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-stone-500 flex-shrink-0" />
            <span>
              এই পরীক্ষাটি বর্তমানে <strong>খসড়া (DRAFT)</strong> অবস্থায় রয়েছে। নম্বর এন্ট্রি চালু করতে
              পরীক্ষা তালিকা থেকে স্ট্যাটাস পরিবর্তন করে 'নম্বর এন্ট্রি' করুন।
            </span>
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-stone-500">নম্বর ফর্দ লোড হচ্ছে...</div>
        ) : marks.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
            <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              কোনো শিক্ষার্থী পাওয়া যায়নি
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              এই শ্রেণি ও বিষয়ে কোনো শিক্ষার্থী অন্তর্ভুক্ত নেই। অনুগ্রহ করে প্রথমে 'শিক্ষার্থী নিবন্ধন'
              ট্যাব থেকে শিক্ষার্থীদের নিবন্ধন সম্পন্ন করুন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">রোল</th>
                  <th className="px-3 py-3">শিক্ষার্থীর নাম</th>
                  <th className="px-3 py-3 text-center w-28">
                    লিখিত ({currentSubject?.theoryFullMarks ?? currentSubject?.fullMarks ?? 100})
                  </th>
                  <th className="px-3 py-3 text-center w-28">
                    মৌখিক ({currentSubject?.oralFullMarks || 0})
                  </th>
                  <th className="px-3 py-3 text-center w-24">অনুপস্থিত</th>
                  <th className="px-3 py-3 text-center w-24">বহিষ্কৃত</th>
                  <th className="px-3 py-3 text-center w-28 font-bold">মোট প্রাপ্ত</th>
                  <th className="px-3 py-3 text-center w-24">ফলাফল</th>
                  <th className="px-3 py-3">মন্তব্য</th>
                  {isExamLocked && isAdminOrMuhtamim && (
                    <th className="px-3 py-3 text-right">অনুমোদিত সংশোধন</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {marks.map((row) => {
                  const theoryLimit = currentSubject?.theoryFullMarks ?? currentSubject?.fullMarks ?? 100;
                  const oralLimit = currentSubject?.oralFullMarks || 0;

                  return (
                    <tr
                      key={row.studentId}
                      className={`hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors ${
                        row.isAbsent ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center font-bold text-stone-900 dark:text-stone-100">
                        {row.rollNo}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-stone-900 dark:text-stone-100">
                        {row.studentName}
                      </td>

                      {/* Theory marks input */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max={theoryLimit}
                          disabled={!canDirectlyEdit || row.isAbsent || row.isExpelled}
                          value={row.theoryMarks ?? ''}
                          onChange={(e) =>
                            handleMarkChange(
                              row.studentId,
                              'theoryMarks',
                              Math.min(theoryLimit, Math.max(0, Number(e.target.value) || 0))
                            )
                          }
                          className="w-20 px-2 py-1 text-center font-medium bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:bg-stone-100 dark:disabled:bg-stone-900"
                        />
                      </td>

                      {/* Oral marks input */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max={oralLimit}
                          disabled={!canDirectlyEdit || oralLimit === 0 || row.isAbsent || row.isExpelled}
                          value={row.oralMarks ?? ''}
                          onChange={(e) =>
                            handleMarkChange(
                              row.studentId,
                              'oralMarks',
                              Math.min(oralLimit, Math.max(0, Number(e.target.value) || 0))
                            )
                          }
                          className="w-20 px-2 py-1 text-center font-medium bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 disabled:bg-stone-100 dark:disabled:bg-stone-900"
                        />
                      </td>

                      {/* Absent checkbox */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          disabled={!canDirectlyEdit}
                          checked={row.isAbsent || false}
                          onChange={(e) =>
                            handleMarkChange(row.studentId, 'isAbsent', e.target.checked)
                          }
                          className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                        />
                      </td>

                      {/* Expelled checkbox */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          disabled={!canDirectlyEdit}
                          checked={row.isExpelled || false}
                          onChange={(e) =>
                            handleMarkChange(row.studentId, 'isExpelled', e.target.checked)
                          }
                          className="w-4 h-4 text-rose-700 rounded border-stone-300 focus:ring-rose-600"
                        />
                      </td>

                      {/* Total obtained */}
                      <td className="px-3 py-2.5 text-center font-bold text-sm text-stone-900 dark:text-stone-100">
                        {row.isAbsent ? (
                          <span className="text-rose-600 font-normal text-xs">অনুপস্থিত</span>
                        ) : row.isExpelled ? (
                          <span className="text-rose-700 font-normal text-xs">বহিষ্কৃত</span>
                        ) : (
                          row.totalObtained ?? (row.theoryMarks || 0) + (row.oralMarks || 0)
                        )}
                      </td>

                      {/* Grade pill */}
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            row.isAbsent || row.isExpelled
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : row.isPassed !== false
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {row.isAbsent
                            ? 'অনুপস্থিত'
                            : row.isExpelled
                            ? 'বহিষ্কৃত'
                            : row.grade || (row.isPassed ? 'পাস' : 'ফেল')}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          placeholder="মন্তব্য..."
                          disabled={!canDirectlyEdit}
                          value={row.remarks || ''}
                          onChange={(e) =>
                            handleMarkChange(row.studentId, 'remarks', e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                        />
                      </td>

                      {/* Authorized Correction button for locked exams */}
                      {isExamLocked && isAdminOrMuhtamim && (
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setCorrectionTargetMark(row);
                              setIsCorrectionModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 rounded-md transition-colors"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>অনুমোদিত সংশোধন</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Authorized Correction Modal */}
      <AuthorizedCorrectionModal
        isOpen={isCorrectionModalOpen}
        onClose={() => {
          setIsCorrectionModalOpen(false);
          setCorrectionTargetMark(null);
        }}
        mark={correctionTargetMark}
        onCorrectionSuccess={loadMarks}
      />
    </div>
  );
};
