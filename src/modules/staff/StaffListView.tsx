import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Building,
  DollarSign,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  StaffEntity,
  DepartmentType,
  RoleType,
  StaffStatus,
  TeacherSubjectAssignment,
  TeacherClassAssignment,
  StaffActivityHistoryEntity,
} from '../../types';
import { StaffProfileModal } from './StaffProfileModal';
import { StaffFormModal } from './StaffFormModal';

interface StaffListViewProps {
  onSelectTeacherForPortal?: (teacherId: string) => void;
  onNavigateToTab?: (tabName: string) => void;
}

export const StaffListView: React.FC<StaffListViewProps> = ({
  onSelectTeacherForPortal,
  onNavigateToTab,
}) => {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const [staffList, setStaffList] = useState<StaffEntity[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [classAssignments, setClassAssignments] = useState<TeacherClassAssignment[]>([]);
  const [activities, setActivities] = useState<StaffActivityHistoryEntity[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Modals
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState<StaffEntity | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffEntity | null>(null);

  // Increment Modal State
  const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false);
  const [incrementStaff, setIncrementStaff] = useState<StaffEntity | null>(null);
  const [incrementData, setIncrementData] = useState({
    incrementAmount: 2000,
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: 'বাৎসরিক পারফরম্যান্স সন্তোষজনক মূল্যায়ন ও শুরা সিদ্ধান্ত',
    approvedBy: 'মজলিসে শুরা ও মুহতামিম',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, subRes, clsRes, actRes] = await Promise.all([
        api.getStaff(),
        api.getTeacherSubjectAssignments(),
        api.getTeacherClassAssignments(),
        api.getStaffActivities(),
      ]);

      if (staffRes.success) setStaffList(staffRes.data);
      if (subRes.success) setSubjectAssignments(subRes.data);
      if (clsRes.success) setClassAssignments(clsRes.data);
      if (actRes.success) setActivities(actRes.data);
    } catch (err: any) {
      showToast('স্টাফ তথ্য লোড করতে ত্রুটি হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveStaff = async (formData: Omit<StaffEntity, 'id' | 'tenantId'>) => {
    if (editingStaff) {
      const res = await api.updateStaff(editingStaff.id, formData);
      if (res.success) {
        showToast('স্টাফ প্রোফাইল সফলভাবে আপডেট করা হয়েছে।', 'success');
        loadData();
      } else {
        throw new Error(res.error?.message || 'আপডেট ব্যর্থ হয়েছে।');
      }
    } else {
      const res = await api.createStaff(formData);
      if (res.success) {
        showToast('নতুন শিক্ষক/স্টাফ সফলভাবে যুক্ত করা হয়েছে।', 'success');
        loadData();
      } else {
        throw new Error(res.error?.message || 'যুক্ত করতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${name}"-কে অপসারণ করতে চান?`)) {
      return;
    }

    try {
      const res = await api.deleteStaff(staffId);
      if (res.success) {
        showToast('স্টাফ অপসারিত হয়েছে।', 'success');
        loadData();
      } else {
        showToast(res.error?.message || 'অপসারণ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  const handleSaveIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incrementStaff) return;

    try {
      const res = await api.recordSalaryIncrement({
        staffId: incrementStaff.id,
        staffName: incrementStaff.nameBangla,
        employeeId: incrementStaff.employeeId,
        designation: incrementStaff.designation,
        previousBaseSalary: incrementStaff.baseSalary,
        incrementAmount: Number(incrementData.incrementAmount),
        incrementPercentage: incrementStaff.baseSalary > 0 ? (Number(incrementData.incrementAmount) / incrementStaff.baseSalary) * 100 : 0,
        newBaseSalary: incrementStaff.baseSalary + Number(incrementData.incrementAmount),
        effectiveDate: incrementData.effectiveDate,
        reason: incrementData.reason,
        approvedBy: incrementData.approvedBy,
      });

      if (res.success) {
        showToast(`${incrementStaff.nameBangla}-এর ইনক্রিমেন্ট কার্যকর করা হয়েছে।`, 'success');
        setIsIncrementModalOpen(false);
        setIncrementStaff(null);
        loadData();
      } else {
        showToast(res.error?.message || 'ইনক্রিমেন্ট রেকর্ড ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast('ইনক্রিমেন্ট প্রয়োগে সমস্যা হয়েছে।', 'error');
    }
  };

  const filteredStaff = staffList.filter((stf) => {
    const matchesSearch =
      stf.nameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stf.mobile.includes(searchQuery) ||
      stf.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === 'ALL' || stf.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'ALL' || stf.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalMonthlyPayroll = staffList.reduce((sum, s) => {
    const allowances = s.allowances || { houseRent: 0, medical: 0, conveyance: 0, foodOrMess: 0, specialDuty: 0, other: 0 };
    const totAllow = (allowances.houseRent || 0) + (allowances.medical || 0) + (allowances.conveyance || 0) + (allowances.foodOrMess || 0) + (allowances.specialDuty || 0) + (allowances.other || 0);
    return sum + (s.baseSalary || 0) + totAllow;
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">মোট শিক্ষক ও ওস্তাদ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-[var(--color-text-main)]">
            {staffList.filter((s) => s.department !== DepartmentType.GENERAL).length} জন
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">কিতাব, হিফজ ও নূরানী অনুষদ</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">প্রশাসনিক কর্মকর্তা ও স্টাফ</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-[var(--color-text-main)]">
            {staffList.filter((s) => s.department === DepartmentType.GENERAL).length} জন
          </p>
          <span className="text-[10px] text-teal-600 font-medium">হিসাব, অফিস ও পরিচালনা</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">সক্রিয় ও উপস্থিত স্টাফ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-600">
            {staffList.filter((s) => s.status === 'ACTIVE').length} জন
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            ছুটিতে: {staffList.filter((s) => s.status === 'ON_LEAVE').length} জন
          </span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">মাসিক মোট পে-রোল বরাদ্দ</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-[var(--color-text-main)]">
            ৳{totalMonthlyPayroll.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">মূল বেতন + নির্ধারিত ভাতাসমূহ</span>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, মোবাইল, আইডি, পদবি দিয়ে অনুসন্ধান..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-[var(--color-text-main)] outline-none"
        >
          <option value="ALL">সকল বিভাগ (All Dept)</option>
          <option value={DepartmentType.KITAB}>কিতাব বিভাগ</option>
          <option value={DepartmentType.HIFZ}>হিফজুল কুরআন বিভাগ</option>
          <option value={DepartmentType.NURANI}>নূরানী ও নাজেরা</option>
          <option value={DepartmentType.IFTA}>দারুল ইফতা</option>
          <option value={DepartmentType.GENERAL}>সাধারণ প্রশাসন</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] text-[var(--color-text-main)] outline-none"
        >
          <option value="ALL">সকল স্ট্যাটাস</option>
          <option value="ACTIVE">সক্রিয় (Active)</option>
          <option value="ON_LEAVE">ছুটিতে (On Leave)</option>
          <option value="SUSPENDED">স্থগিত</option>
          <option value="RESIGNED">অব্যাহতি</option>
        </select>

        {/* Add Staff Button */}
        <button
          onClick={() => {
            setEditingStaff(null);
            setIsFormModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          নতুন শিক্ষক/স্টাফ যুক্ত করুন
        </button>

      </div>

      {/* Staff Directory Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
            লোড হচ্ছে...
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
            কোন শিক্ষক বা স্টাফের রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                <tr>
                  <th className="p-4">শিক্ষক / স্টাফের নাম</th>
                  <th className="p-4">পদবি ও বিভাগ</th>
                  <th className="p-4">যোগাযোগ ও NID</th>
                  <th className="p-4">যোগ্যতা ও সন</th>
                  <th className="p-4">মূল বেতন ও ভাতা</th>
                  <th className="p-4">অবস্থা</th>
                  <th className="p-4 text-right">কার্যক্রম (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-[var(--color-border)]">
                {filteredStaff.map((stf) => {
                  const allowances = stf.allowances || { houseRent: 0, medical: 0, conveyance: 0, foodOrMess: 0, specialDuty: 0, other: 0 };
                  const totAllow = (allowances.houseRent || 0) + (allowances.medical || 0) + (allowances.conveyance || 0) + (allowances.foodOrMess || 0) + (allowances.specialDuty || 0) + (allowances.other || 0);
                  const gross = (stf.baseSalary || 0) + totAllow;

                  return (
                    <tr key={stf.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {stf.photoUrl ? (
                            <img
                              src={stf.photoUrl}
                              alt={stf.nameBangla}
                              className="w-10 h-10 rounded-xl object-cover border border-[var(--color-border)]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 flex items-center justify-center font-bold text-sm">
                              {stf.nameBangla.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-sm text-[var(--color-text-main)] block">
                              {stf.nameBangla}
                            </span>
                            <span className="text-[11px] text-[var(--color-text-secondary)]">
                              {stf.nameEnglish} • <code className="font-mono text-[10px] bg-[var(--color-surface-hover)] px-1 rounded">{stf.employeeId}</code>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-[var(--color-text-main)] block">{stf.designation}</span>
                        <span className="text-[11px] text-emerald-600 font-medium">{stf.department} বিভাগ</span>
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-medium text-[var(--color-text-main)] block">{stf.mobile}</span>
                        <span className="text-[11px] text-[var(--color-text-secondary)]">
                          NID: {stf.nid || 'N/A'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-[var(--color-text-main)] block">{stf.qualification}</span>
                        <span className="text-[11px] text-[var(--color-text-secondary)]">
                          যোগদান: {stf.joiningDate}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-[var(--color-text-main)] block">
                          ৳{gross.toLocaleString('bn-BD')}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          মূল: ৳{(stf.baseSalary || 0).toLocaleString('bn-BD')} + ভাতা: ৳{totAllow.toLocaleString('bn-BD')}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            stf.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : stf.status === 'ON_LEAVE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {stf.status === 'ACTIVE' ? 'সক্রিয়' : stf.status === 'ON_LEAVE' ? 'ছুটিতে' : stf.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* View Profile */}
                          <button
                            onClick={() => setSelectedStaffForProfile(stf)}
                            title="সম্পূর্ণ প্রোফাইল দেখুন"
                            className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-emerald-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Record Increment */}
                          <button
                            onClick={() => {
                              setIncrementStaff(stf);
                              setIsIncrementModalOpen(true);
                            }}
                            title="বেতন বৃদ্ধি (ইনক্রিমেন্ট) যোগ করুন"
                            className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-emerald-600 transition-colors"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => {
                              setEditingStaff(stf);
                              setIsFormModalOpen(true);
                            }}
                            title="সম্পাদন করুন"
                            className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-teal-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteStaff(stf.id, stf.nameBangla)}
                            title="অপসারণ"
                            className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedStaffForProfile && (
        <StaffProfileModal
          staff={selectedStaffForProfile}
          subjectAssignments={subjectAssignments}
          classAssignments={classAssignments}
          activities={activities}
          onClose={() => setSelectedStaffForProfile(null)}
          onEdit={(stf) => {
            setSelectedStaffForProfile(null);
            setEditingStaff(stf);
            setIsFormModalOpen(true);
          }}
        />
      )}

      {/* Staff Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <StaffFormModal
          initialStaff={editingStaff}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingStaff(null);
          }}
          onSubmit={handleSaveStaff}
        />
      )}

      {/* Salary Increment Modal */}
      {isIncrementModalOpen && incrementStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-main)]">
                  বার্ষিক বেতন বৃদ্ধি (Salary Increment)
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {incrementStaff.nameBangla} ({incrementStaff.employeeId})
                </p>
              </div>
              <button
                onClick={() => {
                  setIsIncrementModalOpen(false);
                  setIncrementStaff(null);
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIncrement} className="space-y-4 text-xs">
              <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <span className="text-[var(--color-text-secondary)] block">বর্তমান মূল বেতন</span>
                  <span className="font-bold text-sm">৳{incrementStaff.baseSalary.toLocaleString('bn-BD')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[var(--color-text-secondary)] block">ইনক্রিমেন্ট পরবর্তী মূল বেতন</span>
                  <span className="font-bold text-base text-emerald-600">
                    ৳{(incrementStaff.baseSalary + Number(incrementData.incrementAmount || 0)).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">ইনক্রিমেন্টের পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={incrementData.incrementAmount}
                  onChange={(e) => setIncrementData({ ...incrementData, incrementAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">কার্যকর হওয়ার তারিখ *</label>
                <input
                  type="date"
                  required
                  value={incrementData.effectiveDate}
                  onChange={(e) => setIncrementData({ ...incrementData, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ইনক্রিমেন্টের কারণ ও রেফারেন্স *</label>
                <input
                  type="text"
                  required
                  value={incrementData.reason}
                  onChange={(e) => setIncrementData({ ...incrementData, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">অনুমোদনকারী কর্তৃপক্ষ *</label>
                <input
                  type="text"
                  required
                  value={incrementData.approvedBy}
                  onChange={(e) => setIncrementData({ ...incrementData, approvedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsIncrementModalOpen(false);
                    setIncrementStaff(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  ইনক্রিমেন্ট কার্যকর করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
