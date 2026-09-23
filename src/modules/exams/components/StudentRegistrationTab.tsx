import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  FileBadge,
  Search,
  RefreshCw,
  Printer,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import {
  ExamEntity,
  ExamStudentRegistrationEntity,
  ClassEntity,
  SectionEntity,
} from '../../../types';

interface StudentRegistrationTabProps {
  exams: ExamEntity[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  initialExamId?: string;
  initialClassId?: string;
}

export const StudentRegistrationTab: React.FC<StudentRegistrationTabProps> = ({
  exams,
  classes,
  sections,
  initialExamId,
  initialClassId,
}) => {
  const { showToast } = useToast();

  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId || exams[0]?.id || ''
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || classes[0]?.id || ''
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [registrations, setRegistrations] = useState<ExamStudentRegistrationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (initialExamId) setSelectedExamId(initialExamId);
    if (initialClassId) setSelectedClassId(initialClassId);
  }, [initialExamId, initialClassId]);

  const loadRegistrations = async () => {
    if (!selectedExamId) return;
    setIsLoading(true);
    try {
      const res = await api.getExamRegistrations(
        selectedExamId,
        selectedClassId || undefined,
        selectedSectionId !== 'ALL' ? selectedSectionId : undefined
      );
      if (res.success && res.data) {
        setRegistrations(res.data);
      }
    } catch (err: any) {
      showToast('নিবন্ধন তালিকা লোড ব্যর্থ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [selectedExamId, selectedClassId, selectedSectionId]);

  const handleRegisterAll = async () => {
    if (!selectedExamId || !selectedClassId) {
      showToast('পরীক্ষা ও শ্রেণি নির্বাচন করুন', 'warning');
      return;
    }
    setIsRegistering(true);
    try {
      const res = await api.registerStudentsForExam(
        selectedExamId,
        selectedClassId,
        selectedSectionId !== 'ALL' ? selectedSectionId : undefined
      );
      if (res.success) {
        showToast(res.message || 'শিক্ষার্থীদের সফলভাবে নিবন্ধিত করা হয়েছে', 'success');
        loadRegistrations();
      } else {
        showToast(res.error?.message || 'নিবন্ধন সম্পন্ন হয়নি', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleToggleAdmitCard = async (reg: ExamStudentRegistrationEntity) => {
    try {
      const nextState = !reg.admitCardIssued;
      const res = await api.updateExamRegistration(reg.id, {
        admitCardIssued: nextState,
      });
      if (res.success) {
        showToast(
          nextState ? 'প্রবেশপত্র প্রদান সম্পন্ন' : 'প্রবেশপত্র প্রত্যাহার করা হয়েছে',
          'info'
        );
        loadRegistrations();
      }
    } catch (err: any) {
      showToast('স্ট্যাটাস পরিবর্তনে ত্রুটি', 'error');
    }
  };

  const handleToggleFeeCleared = async (reg: ExamStudentRegistrationEntity) => {
    try {
      const nextState = !reg.feeCleared;
      const res = await api.updateExamRegistration(reg.id, {
        feeCleared: nextState,
      });
      if (res.success) {
        showToast(
          nextState ? 'ফি পরিশোধ ছাড়পত্র দেওয়া হয়েছে' : 'ফি ছাড়পত্র বাতিল করা হয়েছে',
          'info'
        );
        loadRegistrations();
      }
    } catch (err: any) {
      showToast('স্ট্যাটাস পরিবর্তনে ত্রুটি', 'error');
    }
  };

  const currentExam = exams.find((e) => e.id === selectedExamId);
  const classSections = sections.filter((s) => s.classId === selectedClassId);

  const filteredRegistrations = registrations.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.studentName || r.studentNameBangla || '').toLowerCase().includes(q) ||
      (r.studentIdCardNo && r.studentIdCardNo.toLowerCase().includes(q)) ||
      (r.registrationNo && r.registrationNo.toLowerCase().includes(q)) ||
      String(r.rollNo).includes(q)
    );
  });

  return (
    <div id="exam-student-registration-tab" className="space-y-6">
      {/* Control / Filter Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              পরীক্ষা নির্বাচন করুন:
            </label>
            <select
              id="reg-select-exam"
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
              id="reg-select-class"
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
              id="reg-select-section"
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
              শিক্ষার্থী খুঁজুন:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                id="input-search-registrations"
                type="text"
                placeholder="রোল, নাম বা আইডি..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Action Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              মোট নিবন্ধিত শিক্ষার্থী: {registrations.length} জন
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              প্রবেশপত্র প্রস্তুত: {registrations.filter((r) => r.admitCardIssued).length} জন
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-register-all-students"
              type="button"
              onClick={handleRegisterAll}
              disabled={isRegistering || !selectedClassId}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRegistering ? 'নিবন্ধন সম্পন্ন হচ্ছে...' : 'শ্রেণির সকল শিক্ষার্থী নিবন্ধন করুন'}</span>
            </button>

            <button
              id="btn-refresh-registrations"
              type="button"
              onClick={loadRegistrations}
              className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 rounded-lg transition-colors"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-stone-500">
            নিবন্ধন ডেটা লোড হচ্ছে...
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600 mb-3" />
            <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              কোনো নিবন্ধিত শিক্ষার্থী পাওয়া যায়নি
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              এই পরীক্ষায় উক্ত শ্রেণির ছাত্রছাত্রীরা এখনও নিবন্ধিত হয়নি। এক ক্লিকে নিবন্ধন করতে উপরের{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">'শ্রেণির সকল শিক্ষার্থী নিবন্ধন করুন'</strong>{' '}
              বাটনটিতে চাপ দিন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="px-4 py-3">রোল</th>
                  <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                  <th className="px-4 py-3">দাখিলা / কার্ড নং</th>
                  <th className="px-4 py-3">পরীক্ষা নিবন্ধন নম্বর</th>
                  <th className="px-4 py-3">শ্রেণি ও শাখা</th>
                  <th className="px-4 py-3 text-center">ফি ছাড়পত্র</th>
                  <th className="px-4 py-3 text-center">প্রবেশপত্র (Admit Card)</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {filteredRegistrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-100">
                      {reg.rollNo}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100">
                      {reg.studentName}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-stone-500">
                      {reg.studentIdCardNo || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      {reg.registrationNo}
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      {reg.className} {reg.sectionName ? `(${reg.sectionName})` : ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleFeeCleared(reg)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          reg.feeCleared
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {reg.feeCleared ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>পরিশোধিত</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>বকেয়া রয়েছে</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleAdmitCard(reg)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          reg.admitCardIssued
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        <FileBadge className="w-3.5 h-3.5" />
                        <span>{reg.admitCardIssued ? 'ইস্যু করা হয়েছে' : 'ইস্যু করুন'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {reg.status === 'REGISTERED' ? 'নিবন্ধিত' : reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
