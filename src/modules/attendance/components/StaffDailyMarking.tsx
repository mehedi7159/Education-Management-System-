import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  Check,
  Calendar,
  Edit3,
  Award,
  Users,
} from 'lucide-react';
import {
  AttendanceStatus,
  StaffEntity,
  AttendanceEntity,
  AttendanceLockConfig,
  DepartmentType,
} from '../../../types';
import { AttendanceLockBanner } from './AttendanceLockBanner';

interface StaffDailyMarkingProps {
  staffList: StaffEntity[];
  attendances: AttendanceEntity[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaveBatch: (records: Partial<AttendanceEntity>[]) => Promise<void>;
  onOpenCorrectionModal: (record?: AttendanceEntity) => void;
  lockConfig: AttendanceLockConfig | null;
  isAdmin: boolean;
}

export const StaffDailyMarking: React.FC<StaffDailyMarkingProps> = ({
  staffList,
  attendances,
  selectedDate,
  onDateChange,
  onSaveBatch,
  onOpenCorrectionModal,
  lockConfig,
  isAdmin,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state keyed by staffId
  const [localStaffMap, setLocalStaffMap] = useState<
    Record<
      string,
      {
        status: AttendanceStatus;
        checkInTime: string;
        checkOutTime: string;
        lateMinutes?: number;
        remarks: string;
        source?: 'MANUAL' | 'BIOMETRIC' | 'RFID' | 'BULK_ACTION';
        attendanceId?: string;
      }
    >
  >({});

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Lock logic
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHourMinute = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const cutoffTime = lockConfig?.cutoffTime || '10:30';
  const isPastDate = selectedDate < new Date().toISOString().split('T')[0];
  const isTimeLocked = isToday && lockConfig?.autoLockEnabled && currentHourMinute > cutoffTime;
  const isLocked = (isPastDate || isTimeLocked) && !isAdmin;

  // Sync state
  useEffect(() => {
    const map: Record<string, any> = {};
    const staffAtts = attendances.filter((a) => a.date === selectedDate && !!a.staffId);
    const existingMap = new Map(staffAtts.map((a) => [a.staffId, a]));

    staffList.forEach((stf) => {
      const existing = existingMap.get(stf.id);
      if (existing) {
        map[stf.id] = {
          status: existing.status,
          checkInTime: existing.checkInTime || '08:15 AM',
          checkOutTime: existing.checkOutTime || '04:30 PM',
          lateMinutes: existing.lateMinutes,
          remarks: existing.remarks || '',
          source: existing.source || 'MANUAL',
          attendanceId: existing.id,
        };
      } else {
        map[stf.id] = {
          status: AttendanceStatus.PRESENT,
          checkInTime: '08:15 AM',
          checkOutTime: '04:30 PM',
          remarks: '',
          source: 'MANUAL',
        };
      }
    });
    setLocalStaffMap(map);
  }, [selectedDate, staffList, attendances]);

  // Filter staff
  const filteredStaff = staffList.filter((stf) => {
    if (selectedDept !== 'ALL' && (stf as any).department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = stf.nameBangla.toLowerCase().includes(q) || (stf.nameEnglish && stf.nameEnglish.toLowerCase().includes(q));
      const matchEmpId = stf.employeeId?.toLowerCase().includes(q);
      const matchDesig = stf.designation.toLowerCase().includes(q);
      if (!matchName && !matchEmpId && !matchDesig) return false;
    }
    return true;
  });

  // Calculate stats
  const totalStaff = filteredStaff.length;
  const presentStaff = filteredStaff.filter(
    (s) => localStaffMap[s.id]?.status === AttendanceStatus.PRESENT
  ).length;
  const absentStaff = filteredStaff.filter(
    (s) => localStaffMap[s.id]?.status === AttendanceStatus.ABSENT
  ).length;
  const lateStaff = filteredStaff.filter(
    (s) => localStaffMap[s.id]?.status === AttendanceStatus.LATE
  ).length;
  const leaveStaff = filteredStaff.filter(
    (s) => localStaffMap[s.id]?.status === AttendanceStatus.LEAVE
  ).length;
  const staffRate = totalStaff > 0 ? Math.round(((presentStaff + lateStaff) / totalStaff) * 100) : 0;

  const handleStatusChange = (staffId: string, newStatus: AttendanceStatus) => {
    if (isLocked) {
      alert('হাজিরা খাতা লক রয়েছে।');
      return;
    }
    setLocalStaffMap((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        status: newStatus,
      },
    }));
  };

  const handleTimeChange = (staffId: string, field: 'checkInTime' | 'checkOutTime', value: string) => {
    setLocalStaffMap((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [field]: value,
      },
    }));
  };

  const handleRemarksChange = (staffId: string, text: string) => {
    setLocalStaffMap((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        remarks: text,
      },
    }));
  };

  const handleQuickMarkAll = (status: AttendanceStatus) => {
    if (isLocked) {
      alert('হাজিরা খাতা লক রয়েছে।');
      return;
    }
    setLocalStaffMap((prev) => {
      const updated = { ...prev };
      filteredStaff.forEach((s) => {
        updated[s.id] = {
          ...updated[s.id],
          status,
          source: 'BULK_ACTION',
        };
      });
      return updated;
    });
  };

  const handleSaveAll = async () => {
    if (isLocked) {
      alert('হাজিরা খাতা লক রয়েছে।');
      return;
    }
    try {
      setIsSaving(true);
      const recordsToSave: Partial<AttendanceEntity>[] = filteredStaff.map((stf) => {
        const entry = localStaffMap[stf.id];
        return {
          id: entry?.attendanceId,
          staffId: stf.id,
          staffName: stf.nameBangla,
          staffEmployeeId: stf.employeeId,
          staffDesignation: stf.designation,
          department: (stf as any).department || DepartmentType.KITAB,
          date: selectedDate,
          status: entry?.status || AttendanceStatus.PRESENT,
          checkInTime: entry?.checkInTime,
          checkOutTime: entry?.checkOutTime,
          lateMinutes: entry?.lateMinutes,
          remarks: entry?.remarks,
          source: entry?.source || 'MANUAL',
        };
      });

      await onSaveBatch(recordsToSave);
      setSaveSuccessMsg(`সফল! ${recordsToSave.length} জন উস্তাদ ও কর্মকর্তার আজকের (${selectedDate}) হাজিরা ডাটাবেজে সংরক্ষিত হয়েছে।`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Attendance Lock Banner */}
      <AttendanceLockBanner
        isLocked={Boolean(isLocked)}
        lockConfig={lockConfig}
        selectedDate={selectedDate}
        isToday={isToday}
        isAdmin={isAdmin}
        onOpenCorrectionModal={() => onOpenCorrectionModal()}
      />

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Control Filters & Staff Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">সকল বিভাগ (All Departments)</option>
              <option value={DepartmentType.KITAB}>কিতাব ও হাদিস বিভাগ</option>
              <option value={DepartmentType.HIFZ}>হিফজুল কুরআন</option>
              <option value={DepartmentType.NURANI}>নূরানী বিভাগ</option>
              <option value={DepartmentType.GENERAL}>প্রশাসনিক ও সাধারণ</option>
            </select>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="ওস্তাদের নাম বা আইডি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Live Staff Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">মোট উস্তাদ/স্টাফ</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalStaff} জন</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">উপস্থিত (Present)</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{presentStaff} জন</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/60">
            <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">অনুপস্থিত (Absent)</div>
            <div className="text-xl font-bold text-rose-700 dark:text-rose-300">{absentStaff} জন</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">বিলম্ব (Late)</div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300">{lateStaff} জন</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800/60">
            <div className="text-[11px] font-medium text-blue-700 dark:text-blue-300">ছুটি (Leave)</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{leaveStaff} জন</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60">
            <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300">স্টাফ উপস্থিতির হার</div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{staffRate}%</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            কুইক অ্যাকশন:
          </span>
          <button
            type="button"
            disabled={isLocked}
            onClick={() => handleQuickMarkAll(AttendanceStatus.PRESENT)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-lg transition disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>সকল শিক্ষক উপস্থিত</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isSaving || isLocked}
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'উস্তাদ হাজিরা সংরক্ষণ করুন'}</span>
        </button>
      </div>

      {/* Staff Attendance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5">উস্তাদ ও কর্মকর্তা</th>
                <th className="px-4 py-3.5">পদবি ও বিভাগ</th>
                <th className="px-4 py-3.5 text-center w-72">হাজিরা স্ট্যাটাস</th>
                <th className="px-4 py-3.5 w-32">ইন টাইম (Check In)</th>
                <th className="px-4 py-3.5 w-32">আউট টাইম (Check Out)</th>
                <th className="px-4 py-3.5">মন্তব্য / সোর্স</th>
                <th className="px-4 py-3.5 text-center w-20">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    কোনো উস্তাদ বা কর্মচারীর রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredStaff.map((stf) => {
                  const entry = localStaffMap[stf.id] || {
                    status: AttendanceStatus.PRESENT,
                    checkInTime: '08:15 AM',
                    checkOutTime: '04:30 PM',
                  };

                  return (
                    <tr
                      key={stf.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition ${
                        entry.status === AttendanceStatus.ABSENT
                          ? 'bg-rose-50/20 dark:bg-rose-950/10'
                          : entry.status === AttendanceStatus.LATE
                          ? 'bg-amber-50/20 dark:bg-amber-950/10'
                          : entry.status === AttendanceStatus.LEAVE
                          ? 'bg-blue-50/20 dark:bg-blue-950/10'
                          : ''
                      }`}
                    >
                      {/* Staff Info */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{stf.nameBangla}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>আইডি: {stf.employeeId || stf.id}</span>
                          {stf.mobile && <span> • {stf.mobile}</span>}
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {stf.designation}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {(stf as any).department || 'সাধারণ'}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stf.id, AttendanceStatus.PRESENT)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.PRESENT
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                            }`}
                          >
                            উপস্থিত (P)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stf.id, AttendanceStatus.ABSENT)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.ABSENT
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                            }`}
                          >
                            অনুপস্থিত (A)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stf.id, AttendanceStatus.LATE)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.LATE
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                            }`}
                          >
                            দেরি (L)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stf.id, AttendanceStatus.LEAVE)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                              entry.status === AttendanceStatus.LEAVE
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                            }`}
                          >
                            ছুটি (Leave)
                          </button>
                        </div>
                      </td>

                      {/* Check-In Time */}
                      <td className="px-4 py-3 text-xs">
                        <input
                          type="text"
                          value={entry.checkInTime || '08:15 AM'}
                          onChange={(e) => handleTimeChange(stf.id, 'checkInTime', e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </td>

                      {/* Check-Out Time */}
                      <td className="px-4 py-3 text-xs">
                        <input
                          type="text"
                          value={entry.checkOutTime || '04:30 PM'}
                          onChange={(e) => handleTimeChange(stf.id, 'checkOutTime', e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </td>

                      {/* Remarks & Source */}
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="মন্তব্য..."
                            value={entry.remarks || ''}
                            onChange={(e) => handleRemarksChange(stf.id, e.target.value)}
                            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-28 focus:outline-none"
                          />
                          {entry.source === 'BIOMETRIC' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                              বায়োমেট্রিক
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const foundAtt = attendances.find((a) => a.date === selectedDate && a.staffId === stf.id);
                            onOpenCorrectionModal(foundAtt || ({
                              staffId: stf.id,
                              staffName: stf.nameBangla,
                              date: selectedDate,
                              status: entry.status,
                              remarks: entry.remarks,
                            } as any));
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                          title="অনুমোদিত সংশোধন"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
