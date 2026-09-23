import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Printer,
  ChevronRight,
  Sparkles,
  Briefcase,
  GraduationCap,
  Shield,
  Layers,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  StaffEntity,
  TeacherSubjectAssignment,
  TeacherClassAssignment,
  TeacherRoutineEntity,
  LeaveApplicationEntity,
  SalaryPayrollEntity,
  SalaryAdvanceEntity,
  StaffActivityHistoryEntity,
  LeaveType,
  RoutineDay,
  RoleType,
} from '../../types';

interface TeacherDashboardViewProps {
  onNavigateToStaffList?: () => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  onNavigateToStaffList,
}) => {
  const { user, hasPermission } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  
  const [dashboardData, setDashboardData] = useState<{
    staff: StaffEntity | null;
    subjectAssignments: TeacherSubjectAssignment[];
    classAssignments: TeacherClassAssignment[];
    weeklyRoutines: TeacherRoutineEntity[];
    recentLeaves: LeaveApplicationEntity[];
    recentPayrolls: SalaryPayrollEntity[];
    activeAdvance: SalaryAdvanceEntity | null;
    activities: StaffActivityHistoryEntity[];
    attendanceStats: {
      presentDays: number;
      absentDays: number;
      lateDays: number;
      leaveDays: number;
      percentage: number;
    };
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'routine' | 'assignments' | 'leave' | 'payroll' | 'advance' | 'activities'>('routine');
  
  // Leave form modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    totalDays: 1,
    reason: '',
    emergencyContactDuringLeave: '',
    substituteTeacherName: '',
  });

  // Selected routine day
  const [selectedDay, setSelectedDay] = useState<RoutineDay>('SATURDAY');

  // Load staff list on mount
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.getStaff();
        if (res.success) {
          setStaffList(res.data);
          
          // Determine initial teacher ID:
          // If logged in as teacher, match their userId or staff list
          const matched = res.data.find((s) => s.userId === user?.id || s.email === user?.email);
          if (matched) {
            setSelectedStaffId(matched.id);
          } else if (res.data.length > 1) {
            // Default to Mufti Tariq Jamil (stf-2) for demonstration if admin
            setSelectedStaffId(res.data[1].id);
          } else if (res.data.length > 0) {
            setSelectedStaffId(res.data[0].id);
          }
        }
      } catch (err: any) {
        showToast('স্টাফ তথ্য লোড করতে ব্যর্থ হয়েছে।', 'error');
      }
    };
    fetchStaff();
  }, [user]);

  // Load teacher dashboard summary when selectedStaffId changes
  useEffect(() => {
    if (!selectedStaffId) return;
    loadDashboardSummary(selectedStaffId);
  }, [selectedStaffId]);

  const loadDashboardSummary = async (staffId: string) => {
    setLoading(true);
    try {
      const res = await api.getTeacherDashboardSummary(staffId);
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err: any) {
      showToast('শিক্ষক ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardData?.staff) return;

    if (!leaveForm.reason) {
      showToast('ছুটির কারণ উল্লেখ করুন।', 'error');
      return;
    }

    try {
      const res = await api.applyLeave({
        staffId: dashboardData.staff.id,
        staffName: dashboardData.staff.nameBangla,
        employeeId: dashboardData.staff.employeeId,
        designation: dashboardData.staff.designation,
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        totalDays: Number(leaveForm.totalDays) || 1,
        reason: leaveForm.reason,
        emergencyContactDuringLeave: leaveForm.emergencyContactDuringLeave,
        substituteTeacherName: leaveForm.substituteTeacherName,
      });

      if (res.success) {
        showToast('ছুটির আবেদন সফলভাবে জমা দেওয়া হয়েছে।', 'success');
        setIsLeaveModalOpen(false);
        setLeaveForm({
          leaveType: 'CASUAL',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          totalDays: 1,
          reason: '',
          emergencyContactDuringLeave: '',
          substituteTeacherName: '',
        });
        loadDashboardSummary(dashboardData.staff.id);
      } else {
        showToast(res.error?.message || 'ছুটির আবেদন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast('ছুটির আবেদন পাঠাতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  const canSwitchTeacher = hasPermission([RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT]);

  const daysList: { id: RoutineDay; label: string }[] = [
    { id: 'SATURDAY', label: 'শনিবার' },
    { id: 'SUNDAY', label: 'রবিবার' },
    { id: 'MONDAY', label: 'সোমবার' },
    { id: 'TUESDAY', label: 'মঙ্গলবার' },
    { id: 'WEDNESDAY', label: 'বুধবার' },
    { id: 'THURSDAY', label: 'বৃহস্পতিবার' },
  ];

  if (loading && !dashboardData) {
    return (
      <div className="p-8 text-center text-[var(--color-text-secondary)]">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-medium">শিক্ষক পোর্টাল তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  const staff = dashboardData?.staff;
  const allowances = staff?.allowances || { houseRent: 0, medical: 0, conveyance: 0, foodOrMess: 0, specialDuty: 0, other: 0 };
  const totalAllowances =
    (allowances.houseRent || 0) +
    (allowances.medical || 0) +
    (allowances.conveyance || 0) +
    (allowances.foodOrMess || 0) +
    (allowances.specialDuty || 0) +
    (allowances.other || 0);
  const grossSalary = (staff?.baseSalary || 0) + totalAllowances;

  const currentDayRoutines = (dashboardData?.weeklyRoutines || []).filter((r) => r.dayOfWeek === selectedDay);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / Switcher */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Profile Overview */}
          <div className="flex items-center gap-5">
            {staff?.photoUrl ? (
              <img
                src={staff.photoUrl}
                alt={staff.nameBangla}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 flex items-center justify-center border-4 border-white/20 text-white text-3xl font-bold shadow-lg">
                {staff?.nameBangla.charAt(0) || 'ও'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {staff?.nameBangla}
                </h1>
                <span className="text-xs bg-emerald-700/80 px-2.5 py-0.5 rounded-full font-mono">
                  {staff?.employeeId}
                </span>
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
                  {staff?.status === 'ACTIVE' ? 'সক্রিয় শিক্ষক' : staff?.status}
                </span>
              </div>
              <p className="text-emerald-200 text-sm mt-1">{staff?.designation} • {staff?.department} বিভাগ</p>
              <p className="text-xs text-emerald-300/80 mt-2 flex items-center gap-3 flex-wrap">
                <span>📱 {staff?.mobile}</span>
                <span>🎓 {staff?.qualification}</span>
                <span>📅 যোগদানের সন: {staff?.joiningDate}</span>
              </p>
            </div>
          </div>

          {/* Teacher Switcher (for Admins / Multi-role) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {canSwitchTeacher && staffList.length > 1 && (
              <div className="bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <span className="text-xs text-emerald-200 font-medium pl-2">শিক্ষক পরিবর্তন:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="bg-emerald-950/80 text-white text-xs rounded-xl px-3 py-1.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.nameBangla} ({stf.designation})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              ছুটির আবেদন করুন
            </button>
          </div>

        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10">
            <span className="text-emerald-200 text-xs block">অর্পিত বিষয় সংখ্যা</span>
            <span className="text-2xl font-bold mt-0.5 block">
              {dashboardData?.subjectAssignments.length || 0} টি বিষয়
            </span>
            <span className="text-[10px] text-emerald-300">
              সাপ্তাহিক {dashboardData?.subjectAssignments.reduce((sum, s) => sum + s.weeklyPeriodsCount, 0) || 0} পিরিয়ড
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10">
            <span className="text-emerald-200 text-xs block">আজকের ক্লাস</span>
            <span className="text-2xl font-bold mt-0.5 block">
              {currentDayRoutines.length} টি ঘণ্টা
            </span>
            <span className="text-[10px] text-emerald-300">
              {daysList.find((d) => d.id === selectedDay)?.label} সময়সূচি
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10">
            <span className="text-emerald-200 text-xs block">চলতি মাসে উপস্থিতি</span>
            <span className="text-2xl font-bold mt-0.5 block text-emerald-300">
              {dashboardData?.attendanceStats.percentage || 95}%
            </span>
            <span className="text-[10px] text-emerald-200/80">
              উপস্থিত: {dashboardData?.attendanceStats.presentDays} দিন | ছুটি: {dashboardData?.attendanceStats.leaveDays} দিন
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10">
            <span className="text-emerald-200 text-xs block">সর্বমোট মাসিক বেতন</span>
            <span className="text-2xl font-bold mt-0.5 block">
              ৳{grossSalary.toLocaleString('bn-BD')}
            </span>
            <span className="text-[10px] text-emerald-300">
              মূল: ৳{(staff?.baseSalary || 0).toLocaleString('bn-BD')} + ভাতা: ৳{totalAllowances.toLocaleString('bn-BD')}
            </span>
          </div>
        </div>

      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl px-3 overflow-x-auto shadow-sm">
        {[
          { id: 'routine', label: 'ক্লাস রুটিন ও সময়সূচি', icon: Clock },
          { id: 'assignments', label: 'আমার বিষয় ও শ্রেণি দায়িত্ব', icon: BookOpen },
          { id: 'leave', label: 'ছুটির আবেদন ও রেকর্ড', icon: Calendar },
          { id: 'payroll', label: 'আমার বেতন ও পে-স্লিপ', icon: DollarSign },
          { id: 'advance', label: 'বেতন অগ্রিম ও ইনক্রিমেন্ট', icon: FileText },
          { id: 'activities', label: 'খেদমত ও কার্যক্রম ইতিহাস', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROUTINE */}
      {activeTab === 'routine' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                সাপ্তাহিক ক্লাস রুটিন ও সময়সূচি
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                দিনভিত্তিক সময়সূচি এবং কক্ষ নম্বর বিস্তারিত
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {daysList.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedDay === day.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {currentDayRoutines.length === 0 ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center text-[var(--color-text-secondary)]">
              <Clock className="w-12 h-12 mx-auto mb-3 text-emerald-600/50" />
              <h4 className="text-base font-bold text-[var(--color-text-main)]">
                {daysList.find((d) => d.id === selectedDay)?.label} এ কোনো নির্ধারিত ক্লাস নেই
              </h4>
              <p className="text-xs mt-1">অন্যান্য দিনের রুটিন দেখতে উপরের বার থেকে দিন নির্বাচন করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentDayRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm hover:border-emerald-500/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                      পিরিয়ড #{routine.periodNumber}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-text-secondary)] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {routine.startTime} - {routine.endTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[var(--color-text-main)]">
                      {routine.subjectName}
                    </h4>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">
                      {routine.className} ({routine.sectionName})
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span>📍 {routine.roomNo || 'হলরুম'}</span>
                    <span>সেশন: {routine.academicSessionName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Assignments */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-main)]">
                  অর্পিত বিষয়সমূহ (Subject Responsibilities)
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  পাঠদানের দায়িত্বপ্রাপ্ত কিতাব ও শ্রেণি
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                {dashboardData?.subjectAssignments.length} টি বিষয়
              </span>
            </div>

            <div className="space-y-3">
              {dashboardData?.subjectAssignments.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-emerald-600 font-semibold block">
                      {sub.className} • {sub.sectionName}
                    </span>
                    <span className="font-bold text-sm text-[var(--color-text-main)]">
                      {sub.subjectName}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-secondary)] block mt-0.5">
                      শিক্ষাবর্ষ: {sub.academicSessionName}
                    </span>
                  </div>
                  <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-xl border border-emerald-500/20 whitespace-nowrap">
                    {sub.weeklyPeriodsCount} ঘণ্টা/সপ্তাহ
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Class Incharge Assignments */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-main)]">
                  শ্রেণি ইনচার্জ ও অভিভাবক দায়িত্ব
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  শ্রেণি শিক্ষক ও নজরদারি দায়িত্বপ্রাপ্ত জামাত
                </p>
              </div>
              <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-lg">
                {dashboardData?.classAssignments.length} টি জামাত
              </span>
            </div>

            <div className="space-y-3">
              {dashboardData?.classAssignments.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                  কোন শ্রেণি শিক্ষক দায়িত্ব অর্পিত হয়নি।
                </div>
              ) : (
                dashboardData?.classAssignments.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-sm text-[var(--color-text-main)]">
                        {cls.className}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] block mt-0.5">
                        {cls.sectionName} ({cls.academicSessionName})
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-lg">
                      {cls.role === 'CLASS_TEACHER' ? 'শ্রেণি শিক্ষক (Class Teacher)' : 'বিভাগীয় প্রধান'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE APPLICATIONS */}
      {activeTab === 'leave' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                ছুটির আবেদন ও মঞ্জুরি ইতিহাস
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                নৈমিত্তিক, অসুস্থতাজনিত ও জরুরি ছুটির রেকর্ড
              </p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              নতুন ছুটির আবেদন
            </button>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            {dashboardData?.recentLeaves.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                পূর্বে কোনো ছুটির আবেদন করা হয়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                    <tr>
                      <th className="p-4">ছুটির ধরন</th>
                      <th className="p-4">সময়কাল</th>
                      <th className="p-4">মোট দিন</th>
                      <th className="p-4">ছুটির কারণ</th>
                      <th className="p-4">বিকল্প শিক্ষক</th>
                      <th className="p-4">অবস্থা</th>
                      <th className="p-4">পর্যালোচনা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-[var(--color-border)]">
                    {dashboardData?.recentLeaves.map((lv) => (
                      <tr key={lv.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                        <td className="p-4 font-semibold text-[var(--color-text-main)]">
                          {lv.leaveType === 'CASUAL' ? 'নৈমিত্তিক ছুটি' : lv.leaveType === 'SICK' ? 'চিকিৎসাজনিত ছুটি' : lv.leaveType}
                        </td>
                        <td className="p-4 font-mono">
                          {lv.startDate} হতে {lv.endDate}
                        </td>
                        <td className="p-4 font-bold">{lv.totalDays} দিন</td>
                        <td className="p-4 max-w-xs truncate">{lv.reason}</td>
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
                        <td className="p-4 text-[11px] text-[var(--color-text-secondary)]">
                          {lv.reviewedBy ? `${lv.reviewedBy}` : 'প্রক্রিয়াধীন'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PAYROLL & PAYSLIPS */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                মাসিক বেতন ও পে-স্লিপ হিস্ট্রি
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                বেতন শিট, ভাতা বিবরণ ও কর্তন সংক্রান্ত নথিপত্র
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[var(--color-text-secondary)] block">বর্তমান মূল বেতন</span>
              <span className="text-lg font-bold text-emerald-600">
                ৳{(staff?.baseSalary || 0).toLocaleString('bn-BD')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData?.recentPayrolls.map((payroll) => (
              <div
                key={payroll.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-600 font-semibold">{payroll.payslipNo}</span>
                    <h4 className="text-base font-bold text-[var(--color-text-main)]">
                      মাস: {payroll.monthYear}
                    </h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      payroll.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {payroll.paymentStatus === 'PAID' ? 'পরিশোধিত' : 'অপেক্ষমান'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">মূল বেতন (Base Salary):</span>
                    <span className="font-semibold">৳{payroll.baseSalary.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">ভাতাসমূহ (Total Allowances):</span>
                    <span className="font-semibold text-emerald-600">+৳{payroll.totalAllowances.toLocaleString('bn-BD')}</span>
                  </div>
                  {payroll.advanceDeduction > 0 && (
                    <div className="flex items-center justify-between text-rose-600">
                      <span>অগ্রিম কিস্তি কর্তন (Advance Deduction):</span>
                      <span className="font-semibold">-৳{payroll.advanceDeduction.toLocaleString('bn-BD')}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-2 text-sm font-bold text-[var(--color-text-main)]">
                    <span>প্রদেয় মোট (Net Payable):</span>
                    <span className="text-emerald-600 font-mono text-base">
                      ৳{payroll.netPayable.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>

                {payroll.paymentStatus === 'PAID' && (
                  <div className="pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)] flex items-center justify-between">
                    <span>পরিশোধের তারিখ: {payroll.paymentDate}</span>
                    <span className="font-mono">ভাউচার: {payroll.transactionVoucherNo}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADVANCE & INCREMENTS */}
      {activeTab === 'advance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Advance */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-3">
              বেতন অগ্রিম স্থিতি (Salary Advance)
            </h3>

            {dashboardData?.activeAdvance ? (
              <div className="space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-emerald-700">
                    {dashboardData.activeAdvance.advanceNo}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {dashboardData.activeAdvance.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--color-text-secondary)] block">মঞ্জুরকৃত অগ্রিম:</span>
                    <span className="font-bold text-sm">৳{dashboardData.activeAdvance.amountApproved.toLocaleString('bn-BD')}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-secondary)] block">বকেয়া কিস্তি স্থিতি:</span>
                    <span className="font-bold text-sm text-amber-600">
                      ৳{dashboardData.activeAdvance.remainingBalance.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>

                <div className="text-xs border-t border-emerald-500/20 pt-2 space-y-1">
                  <p>মাসিক কিস্তি কর্তন: ৳{dashboardData.activeAdvance.monthlyDeduction.toLocaleString('bn-BD')}/মাস</p>
                  <p>পরিশোধ সম্পন্ন: ৳{dashboardData.activeAdvance.totalRepaid.toLocaleString('bn-BD')}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--color-text-secondary)]">
                কোন সক্রিয় বেতন অগ্রিম নেই।
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[var(--color-text-main)] border-b border-[var(--color-border)] pb-3">
              বাৎসরিক ইনক্রিমেন্ট ও প্রাতিষ্ঠানিক সুবিধা
            </h3>
            <div className="space-y-3 text-xs text-[var(--color-text-secondary)] leading-relaxed">
              <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)]">
                <span className="font-bold text-[var(--color-text-main)] block mb-1">
                  ইনক্রিমেন্ট নীতি (Increment Policy)
                </span>
                প্রতি বছর জুলাই সেশনে কার্যসম্পাদন ও খেদমতের ভিত্তিতে মজলিসে শুরার অনুমোদনক্রমে বার্ষিক বেতন বৃদ্ধি সমন্বয় করা হয়।
              </div>
              <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)]">
                <span className="font-bold text-[var(--color-text-main)] block mb-1">
                  অগ্রিম বেতন সমন্বয় (Advance Policy)
                </span>
                অনুমোদিত অগ্রিম আবেদনসমূহ কর্মচারীর সর্বোচ্চ ৩ থেকে ৬ মাসের সমান কিস্তিতে স্বয়ংক্রিয়ভাবে মাসিক পে-রোলে কর্তনযোগ্য।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITIES & CAREER TIMELINE */}
      {activeTab === 'activities' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                খেদমতকাল ও প্রাতিষ্ঠানিক কার্যক্রম টাইমলাইন
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                যোগদান, পদোন্নতি, বেতন বৃদ্ধি এবং অর্পিত দায়িত্বের ধারাবাহিক রেকর্ড
              </p>
            </div>
          </div>

          <div className="relative border-l-2 border-emerald-500/30 ml-4 pl-6 space-y-6">
            {dashboardData?.activities.map((act) => (
              <div key={act.id} className="relative group">
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-[var(--color-surface)] shadow" />
                <div className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                      {act.title}
                    </h4>
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {act.date}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {act.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)]">
                    <span>কর্তৃপক্ষ: {act.performedBy}</span>
                    {act.referenceNo && <span>রেফারেন্স: {act.referenceNo}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEAVE APPLICATION MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                ছুটির আবেদন ফরম (Leave Application)
              </h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">ছুটির ধরন *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as LeaveType })}
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
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">শেষের তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
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
                  value={leaveForm.totalDays}
                  onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ছুটির সুনির্দিষ্ট কারণ *</label>
                <textarea
                  rows={3}
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="যেমন: গ্রামের বাড়ি সফর / অসুস্থতা / পারিবারিক প্রয়োজন"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">ছুটিকালীন জরুরি মোবাইল</label>
                  <input
                    type="tel"
                    value={leaveForm.emergencyContactDuringLeave}
                    onChange={(e) => setLeaveForm({ ...leaveForm, emergencyContactDuringLeave: e.target.value })}
                    placeholder="01819-XXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">বিকল্প শিক্ষকের নাম</label>
                  <input
                    type="text"
                    value={leaveForm.substituteTeacherName}
                    onChange={(e) => setLeaveForm({ ...leaveForm, substituteTeacherName: e.target.value })}
                    placeholder="দায়িত্ব নেবেন যিনি"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  আবেদন পাঠান
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
