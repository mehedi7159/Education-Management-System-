import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Plus,
  Filter,
  Search,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  StaffEntity,
  LeaveApplicationEntity,
  LeaveType,
} from '../../types';

export const StaffLeaveManagementView: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<LeaveApplicationEntity[]>([]);
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);
  
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    staffId: '',
    leaveType: 'CASUAL' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    totalDays: 1,
    reason: '',
    emergencyContactDuringLeave: '',
    substituteTeacherName: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [leavesRes, staffRes] = await Promise.all([
        api.getLeaveApplications(),
        api.getStaff(),
      ]);

      if (leavesRes.success) setLeaves(leavesRes.data);
      if (staffRes.success) {
        setStaffList(staffRes.data);
        if (staffRes.data.length > 0) {
          setApplyForm((prev) => ({ ...prev, staffId: staffRes.data[0].id }));
        }
      }
    } catch (err) {
      showToast('ছুটির তথ্য লোড করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (
    leaveId: string,
    status: 'APPROVED' | 'REJECTED',
    teacherName: string
  ) => {
    try {
      const reviewer = user?.fullName || 'মুহতামিম / প্রশাসন';
      const res = await api.updateLeaveStatus(leaveId, status, reviewer);
      if (res.success) {
        showToast(
          `${teacherName}-এর ছুটির আবেদন ${status === 'APPROVED' ? 'মঞ্জুর' : 'প্রত্যাখ্যান'} করা হয়েছে।`,
          'success'
        );
        loadData();
      } else {
        showToast(res.error?.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const stf = staffList.find((s) => s.id === applyForm.staffId);
    if (!stf) {
      showToast('শিক্ষক নির্বাচন করুন।', 'error');
      return;
    }

    try {
      const res = await api.applyLeave({
        staffId: stf.id,
        staffName: stf.nameBangla,
        employeeId: stf.employeeId,
        designation: stf.designation,
        leaveType: applyForm.leaveType,
        startDate: applyForm.startDate,
        endDate: applyForm.endDate,
        totalDays: Number(applyForm.totalDays) || 1,
        reason: applyForm.reason,
        emergencyContactDuringLeave: applyForm.emergencyContactDuringLeave,
        substituteTeacherName: applyForm.substituteTeacherName,
      });

      if (res.success) {
        showToast('ছুটির আবেদন সফলভাবে দাখিল করা হয়েছে।', 'success');
        setIsApplyModalOpen(false);
        loadData();
      } else {
        showToast(res.error?.message || 'আবেদন জমা দিতে সমস্যা হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('আবেদন পাঠানো সম্ভব হয়নি।', 'error');
    }
  };

  const filteredLeaves = leaves.filter((lv) => {
    const matchesSearch =
      lv.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lv.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lv.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || lv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">অপেক্ষমান আবেদন (Pending Review)</span>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            {pendingCount} টি
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">মুহতামিম/প্রশাসনের সিদ্ধান্ত প্রয়োজন</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">অনুমোদিত ছুটি (Approved)</span>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {approvedCount} টি
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">হাজিরা খাতা ও বেতনে সমন্বিত</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">মোট আবেদন সংখ্যা</span>
          <p className="text-2xl font-bold mt-1 text-[var(--color-text-main)]">
            {leaves.length} টি
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">চলতি শিক্ষাবর্ষ রেকর্ড</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="শিক্ষকের নাম, আইডি দিয়ে খুঁজুন..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-[var(--color-text-main)] outline-none"
        >
          <option value="ALL">সকল অবস্থা (All Status)</option>
          <option value="PENDING">বিবেচনাধীন (Pending)</option>
          <option value="APPROVED">অনুমোদিত (Approved)</option>
          <option value="REJECTED">প্রত্যাখ্যাত (Rejected)</option>
        </select>

        {/* Apply Leave Button */}
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          ছুটির আবেদন দাখিল
        </button>

      </div>

      {/* Leaves Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">লোড হচ্ছে...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">কোন ছুটির রেকর্ড পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                <tr>
                  <th className="p-4">শিক্ষক / স্টাফ</th>
                  <th className="p-4">ছুটির ধরন</th>
                  <th className="p-4">সময়কাল</th>
                  <th className="p-4">দিন</th>
                  <th className="p-4">কারণ ও জরুরি যোগাযোগ</th>
                  <th className="p-4">বিকল্প শিক্ষক</th>
                  <th className="p-4">অবস্থা</th>
                  <th className="p-4 text-right">সিদ্ধান্ত / অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y border-[var(--color-border)]">
                {filteredLeaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-[var(--color-text-main)] block">{lv.staffName}</span>
                      <span className="text-[11px] text-[var(--color-text-secondary)]">{lv.designation} • {lv.employeeId}</span>
                    </td>
                    <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400">
                      {lv.leaveType === 'CASUAL' ? 'নৈমিত্তিক ছুটি' : lv.leaveType === 'SICK' ? 'চিকিৎসাজনিত ছুটি' : lv.leaveType}
                    </td>
                    <td className="p-4 font-mono">
                      {lv.startDate} হতে {lv.endDate}
                    </td>
                    <td className="p-4 font-bold">{lv.totalDays} দিন</td>
                    <td className="p-4 max-w-xs">
                      <span className="block truncate font-medium">{lv.reason}</span>
                      {lv.emergencyContactDuringLeave && (
                        <span className="text-[10px] text-[var(--color-text-secondary)] block">
                          জরুরি: {lv.emergencyContactDuringLeave}
                        </span>
                      )}
                    </td>
                    <td className="p-4">{lv.substituteTeacherName || 'N/A'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          lv.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lv.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {lv.status === 'APPROVED' ? 'অনুমোদিত' : lv.status === 'PENDING' ? 'বিবেচনাধীন' : 'প্রত্যাখ্যাত'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {lv.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdateStatus(lv.id, 'APPROVED', lv.staffName)}
                            title="অনুমোদন করুন"
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                          >
                            মঞ্জুর
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(lv.id, 'REJECTED', lv.staffName)}
                            title="প্রত্যাখ্যান করুন"
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all"
                          >
                            বাতিল
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          {lv.reviewedBy ? `কর্তৃপক্ষ: ${lv.reviewedBy}` : 'সম্পন্ন'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* APPLY LEAVE MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                ছুটির আবেদন দাখিল ফরম
              </h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">শিক্ষক / স্টাফ নির্বাচন করুন *</label>
                <select
                  value={applyForm.staffId}
                  onChange={(e) => setApplyForm({ ...applyForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.nameBangla} ({stf.designation} - {stf.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ছুটির ধরন *</label>
                <select
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value as LeaveType })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CASUAL">নৈমিত্তিক ছুটি (Casual Leave)</option>
                  <option value="SICK">চিকিৎসাজনিত ছুটি (Sick Leave)</option>
                  <option value="EMERGENCY">জরুরি পারিবারিক ছুটি (Emergency Leave)</option>
                  <option value="UNPAID">বিনা বেতনে ছুটি (Unpaid Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">শুরুর তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শেষের তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">মোট দিন সংখ্যা</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={applyForm.totalDays}
                  onChange={(e) => setApplyForm({ ...applyForm, totalDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ছুটির সুনির্দিষ্ট কারণ *</label>
                <textarea
                  rows={2}
                  required
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="ছুটির সুনির্দিষ্ট কারণ ও বিবরণ লিখুন"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ছুটিকালীন জরুরি মোবাইল</label>
                  <input
                    type="tel"
                    value={applyForm.emergencyContactDuringLeave}
                    onChange={(e) => setApplyForm({ ...applyForm, emergencyContactDuringLeave: e.target.value })}
                    placeholder="01819-XXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">বিকল্প শিক্ষকের নাম</label>
                  <input
                    type="text"
                    value={applyForm.substituteTeacherName}
                    onChange={(e) => setApplyForm({ ...applyForm, substituteTeacherName: e.target.value })}
                    placeholder="দায়িত্ব প্রাপ্ত ওস্তাদ"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  আবেদন দাখিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
