import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Clock,
  BookOpen,
  TrendingUp,
  FileText,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types';
import { StaffListView } from './StaffListView';
import { TeacherDashboardView } from './TeacherDashboardView';
import { StaffAssignmentView } from './StaffAssignmentView';
import { StaffLeaveManagementView } from './StaffLeaveManagementView';
import { StaffPayrollManagementView } from './StaffPayrollManagementView';
import { StaffAdvanceIncrementView } from './StaffAdvanceIncrementView';
import { TeacherRoutineView } from './TeacherRoutineView';

interface StaffManagementDashboardProps {
  currentModule?: string;
  onNavigate?: (module: string) => void;
}

export const StaffManagementDashboard: React.FC<StaffManagementDashboardProps> = ({
  currentModule = 'staff',
  onNavigate,
}) => {
  const { user, hasPermission } = useAuth();
  
  // Map currentModule to active tab
  const getInitialTab = (): string => {
    switch (currentModule) {
      case 'teacher-portal':
        return 'portal';
      case 'teacher-assignments':
        return 'assignments';
      case 'staff-attendance':
      case 'leave-management':
        return 'leave';
      case 'staff-payroll':
      case 'payroll':
        return 'payroll';
      case 'staff-advances':
      case 'salary-advance':
      case 'salary-increment':
        return 'advances';
      case 'teacher-routine':
        return 'routine';
      default:
        if (user.role === RoleType.TEACHER && !hasPermission([RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.SUPER_ADMIN])) {
          return 'portal';
        }
        return 'list';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [currentModule, user.role]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onNavigate) {
      switch (tabId) {
        case 'portal':
          onNavigate('teacher-portal');
          break;
        case 'assignments':
          onNavigate('teacher-assignments');
          break;
        case 'leave':
          onNavigate('staff-attendance');
          break;
        case 'payroll':
          onNavigate('staff-payroll');
          break;
        case 'advances':
          onNavigate('staff-advances');
          break;
        case 'routine':
          onNavigate('teacher-routine');
          break;
        case 'list':
        default:
          onNavigate('staff');
          break;
      }
    }
  };

  const tabs = [
    { id: 'list', label: 'ওস্তাদ ও স্টাফ তালিকা', icon: Users, roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
    { id: 'portal', label: 'শিক্ষক ড্যাশবোর্ড ও পোর্টাল', icon: UserCheck, roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
    { id: 'assignments', label: 'বিষয় ও শ্রেণি দায়িত্ব', icon: BookOpen, roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
    { id: 'routine', label: 'ক্লাস রুটিন ও সময়সূচি', icon: Clock, roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
    { id: 'leave', label: 'ছুটি ও অনুপস্থিতি ব্যবস্থাপনা', icon: Calendar, roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.STAFF] },
    { id: 'payroll', label: 'বেতন ও পে-রোল (Payroll)', icon: DollarSign, roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
    { id: 'advances', label: 'অগ্রিম বেতন ও ইনক্রিমেন্ট', icon: TrendingUp, roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
  ];

  // Filter tabs based on user permissions
  const visibleTabs = tabs.filter(
    (tab) =>
      tab.id === 'portal' ||
      hasPermission(tab.roles)
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Phase 14
            </span>
            <h1 className="text-2xl font-bold text-[var(--color-text-main)]">
              ওস্তাদ ও কর্মকর্তা প্রশাসন (Teacher & Staff Management)
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            শিক্ষক প্রোফাইল, বিষয় বণ্টন, ক্লাস রুটিন, হাজিরা ও ছুটি, মাসিক পে-রোল এবং শিক্ষক ব্যক্তিগত পোর্টাল
          </p>
        </div>

        {user?.role === RoleType.TEACHER && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>শিক্ষক পারমিশন সক্রিয়: ব্যক্তিগত তথ্য ও ক্লাস নিয়ন্ত্রিত</span>
          </div>
        )}
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface)] rounded-2xl px-3 overflow-x-auto shadow-sm">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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

      {/* Tab Contents */}
      <div className="min-h-[500px]">
        {activeTab === 'list' && (
          <StaffListView
            onSelectTeacherForPortal={() => handleTabChange('portal')}
            onNavigateToTab={(tab) => handleTabChange(tab)}
          />
        )}

        {activeTab === 'portal' && (
          <TeacherDashboardView
            onNavigateToStaffList={() => handleTabChange('list')}
          />
        )}

        {activeTab === 'assignments' && <StaffAssignmentView />}

        {activeTab === 'routine' && <TeacherRoutineView />}

        {activeTab === 'leave' && <StaffLeaveManagementView />}

        {activeTab === 'payroll' && <StaffPayrollManagementView />}

        {activeTab === 'advances' && <StaffAdvanceIncrementView />}
      </div>

    </div>
  );
};
