import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, History, X, User, Calendar, FileText } from 'lucide-react';
import { AttendanceStatus, StudentEntity, StaffEntity, AttendanceEntity } from '../../../types';

interface AuthorizedCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    studentId?: string;
    staffId?: string;
    attendanceId?: string;
    date: string;
    newStatus: AttendanceStatus;
    reason: string;
    remarks?: string;
  }) => Promise<void>;
  students: StudentEntity[];
  staffList: StaffEntity[];
  attendances: AttendanceEntity[];
  selectedDate: string;
  preselectedRecord?: AttendanceEntity | null;
}

export const AuthorizedCorrectionModal: React.FC<AuthorizedCorrectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  students,
  staffList,
  attendances,
  selectedDate,
  preselectedRecord,
}) => {
  const [userType, setUserType] = useState<'STUDENT' | 'STAFF'>(
    preselectedRecord?.staffId ? 'STAFF' : 'STUDENT'
  );
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    preselectedRecord?.studentId || preselectedRecord?.staffId || (students[0]?.id || '')
  );
  const [targetDate, setTargetDate] = useState<string>(preselectedRecord?.date || selectedDate);
  const [newStatus, setNewStatus] = useState<AttendanceStatus>(
    preselectedRecord?.status || AttendanceStatus.PRESENT
  );
  const [reason, setReason] = useState<string>('');
  const [remarks, setRemarks] = useState<string>(preselectedRecord?.remarks || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Find existing record to display audit trail
  const currentRecord =
    preselectedRecord ||
    attendances.find(
      (a) =>
        a.date === targetDate &&
        ((userType === 'STUDENT' && a.studentId === selectedPersonId) ||
          (userType === 'STAFF' && a.staffId === selectedPersonId))
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('সংশোধনের কারণ উল্লেখ করা বাধ্যতামূলক (Reason is required for audit trail).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        studentId: userType === 'STUDENT' ? selectedPersonId : undefined,
        staffId: userType === 'STAFF' ? selectedPersonId : undefined,
        attendanceId: currentRecord?.id,
        date: targetDate,
        newStatus,
        reason,
        remarks,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-700 dark:text-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                অনুমোদিত হাজিরা সংশোধন (Authorized Correction)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                লক বা পূর্ববর্তী তারিখের হাজিরা সংশোধনে অডিট ট্রেইল ও কারণ নথিভুক্ত হবে।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setUserType('STUDENT');
                setSelectedPersonId(students[0]?.id || '');
              }}
              className={`py-2 px-3 text-sm font-semibold rounded-lg transition ${
                userType === 'STUDENT'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              শিক্ষার্থী (Student)
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('STAFF');
                setSelectedPersonId(staffList[0]?.id || '');
              }}
              className={`py-2 px-3 text-sm font-semibold rounded-lg transition ${
                userType === 'STAFF'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              উস্তাদ ও কর্মকর্তা (Staff)
            </button>
          </div>

          {/* Date & Person Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>হাজিরার তারিখ (Date)</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{userType === 'STUDENT' ? 'শিক্ষার্থী নির্বাচন' : 'উস্তাদ/কর্মকর্তা নির্বাচন'}</span>
              </label>
              <select
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              >
                {userType === 'STUDENT'
                  ? students.map((st) => (
                      <option key={st.id} value={st.id}>
                        [রোল {st.rollNo}] {st.nameBangla} ({st.studentIdCardNo || st.id})
                      </option>
                    ))
                  : staffList.map((stf) => (
                      <option key={stf.id} value={stf.id}>
                        {stf.nameBangla} - {stf.designation} ({stf.employeeId || stf.id})
                      </option>
                    ))}
              </select>
            </div>
          </div>

          {/* Current Status Preview vs New Status Selection */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">বর্তমান স্ট্যাটাস (Current):</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  currentRecord?.status === AttendanceStatus.PRESENT
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : currentRecord?.status === AttendanceStatus.ABSENT
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                    : currentRecord?.status === AttendanceStatus.LATE
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                    : currentRecord?.status === AttendanceStatus.LEAVE
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {currentRecord?.status || 'তথ্য পাওয়া যায়নি (Not Set)'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                নতুন সংশোধিত স্ট্যাটাস (New Status)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { status: AttendanceStatus.PRESENT, label: 'উপস্থিত (P)', color: 'emerald' },
                  { status: AttendanceStatus.ABSENT, label: 'অনুপস্থিত (A)', color: 'rose' },
                  { status: AttendanceStatus.LATE, label: 'বিলম্বিত (L)', color: 'amber' },
                  { status: AttendanceStatus.LEAVE, label: 'ছুটি (Leave)', color: 'blue' },
                ].map((item) => (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => setNewStatus(item.status)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition text-center ${
                      newStatus === item.status
                        ? item.color === 'emerald'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : item.color === 'rose'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : item.color === 'amber'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <span>সংশোধনের অনুমোদিত কারণ (Mandatory Audit Reason) *</span>
              </span>
              <span className="text-[11px] text-rose-500 font-medium">বাধ্যতামূলক</span>
            </label>
            <input
              type="text"
              placeholder="যেমন: অভিভাবকের লিখিত দরখাস্ত মঞ্জুর / বায়োমেট্রিক ট্রানজিট ত্রুটি"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Optional Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              অতিরিক্ত মন্তব্য (Optional Remarks)
            </label>
            <input
              type="text"
              placeholder="মন্তব্য বা রেফারেন্স নম্বর..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Audit History Timeline if already modified */}
          {currentRecord?.auditHistory && currentRecord.auditHistory.length > 0 && (
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <History className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী সংশোধন অডিট রেকর্ড ({currentRecord.auditHistory.length} বার)</span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto text-xs text-slate-600 dark:text-slate-400">
                {currentRecord.auditHistory.map((h, i) => (
                  <div key={i} className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{h.changedBy}</span> ({h.changedByRole}):{' '}
                    <span className="text-amber-700 dark:text-amber-300">{h.previousStatus} ➔ {h.newStatus}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">কারণ: {h.reason} ({new Date(h.timestamp).toLocaleTimeString()})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'অনুমোদন ও সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
