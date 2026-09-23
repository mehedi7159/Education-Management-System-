import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider, useTranslation } from './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Breadcrumb } from './components/layout/Breadcrumb';
import { DashboardView } from './modules/dashboard/DashboardView';
import { StudentListView } from './modules/students/StudentListView';
import { AdmissionWorkflowView } from './modules/admissions/AdmissionWorkflowView';
import { MultiTenancyInspectorView } from './modules/multitenancy/MultiTenancyInspectorView';
import { RbacInspectorView } from './modules/rbac/RbacInspectorView';
import { InstitutionSettingsView } from './modules/settings/InstitutionSettingsView';
import { AttendanceDashboard } from './modules/attendance/AttendanceDashboard';
import { AcademicManagementDashboard } from './modules/academics/AcademicManagementDashboard';
import { HomeworkLessonPlanView } from './modules/academics/HomeworkLessonPlanView';
import { FeeCollectionDashboard } from './modules/fees/FeeCollectionDashboard';
import { ReceiptManagementDashboard } from './modules/receipts/ReceiptManagementDashboard';
import { AccountingDashboard } from './modules/accounting/AccountingDashboard';
import { DonationsDashboard } from './modules/donations/DonationsDashboard';
import { StaffManagementDashboard } from './modules/staff/StaffManagementDashboard';
import { ExamsManagementDashboard } from './modules/exams/ExamsManagementDashboard';
import { SmsNotificationDashboard } from './modules/sms/SmsNotificationDashboard';
import { ReportsHubView } from './modules/reports/ReportsHubView';
import { GenericModulePlaceholder } from './modules/common/GenericModulePlaceholder';
import { LoginModal } from './components/auth/LoginModal';
import { PasswordChangeModal } from './components/auth/PasswordChangeModal';
import { PasswordResetModal } from './components/auth/PasswordResetModal';
import { UnauthorizedView } from './components/auth/UnauthorizedView';
import { ForbiddenView } from './components/auth/ForbiddenView';
import { BreadcrumbItem } from './types';

function MainShell() {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [simulatedUnauthorized, setSimulatedUnauthorized] = useState(false);

  const { isAuthenticated, isRouteAllowed } = useAuth();
  const { t, language } = useTranslation();

  // Dynamic breadcrumb generation
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (currentModule === 'dashboard') {
      return [{ label: t('nav.dashboard', 'ড্যাশবোর্ড') }];
    }
    if (currentModule === 'multitenancy') {
      return [{ label: t('nav.multitenancy', 'মাল্টি-টেন্যান্ট আইসোলেশন ও নিরাপত্তা (Phase 03)') }];
    }
    if (currentModule === 'rbac') {
      return [{ label: t('nav.rbac', 'অথেনটিকেশন ও RBAC অ্যাক্সেস কন্ট্রোল (Phase 04)') }];
    }
    if (currentModule === 'students' || currentModule === 'students_list') {
      return [
        { label: t('nav.students', 'শিক্ষার্থী ব্যবস্থাপনা'), href: 'students' },
        { label: t('nav.students_list', 'শিক্ষার্থীদের তালিকা') },
      ];
    }
    if (currentModule === 'admissions') {
      return [
        { label: t('nav.students', 'শিক্ষার্থী ব্যবস্থাপনা'), href: 'students' },
        { label: t('nav.admissions', 'নতুন ভর্তি ফরম') },
      ];
    }
    if (
      currentModule === 'academics' ||
      currentModule === 'academic-structure' ||
      currentModule === 'classes' ||
      currentModule === 'subjects' ||
      currentModule === 'class-subjects' ||
      currentModule === 'teacher-assignment' ||
      currentModule === 'syllabus' ||
      currentModule === 'academic-calendar' ||
      currentModule === 'shifts' ||
      currentModule === 'sessions'
    ) {
      return [{ label: t('nav.academics', 'অ্যাকাডেমিক ব্যবস্থাপনা (Phase 16)') }];
    }
    if (currentModule === 'attendance') {
      return [{ label: t('nav.attendance', 'উপস্থিতি ও হাজিরা খাতা') }];
    }
    if (currentModule === 'fees') {
      return [{ label: t('nav.fees', 'ফি ম্যানেজমেন্ট ও লেজার') }];
    }
    if (currentModule === 'receipts') {
      return [
        { label: t('nav.fees', 'ফি ও রশিদ সংগ্রহ'), href: 'fees' },
        { label: t('nav.receipts', 'অফিসিয়াল মানিরিসিপ্ট ও অডিট (Phase 11)') },
      ];
    }
    if (currentModule === 'accounting') {
      return [{ label: t('nav.accounting', 'হিসাবরক্ষণ ও আর্থিক বিবরণী') }];
    }
    if (
      currentModule === 'donations' ||
      currentModule === 'donors' ||
      currentModule === 'funds' ||
      currentModule === 'projects' ||
      currentModule === 'transfers' ||
      currentModule === 'donation-reports'
    ) {
      return [{ label: t('nav.donations', 'তহবিল ও অনুদান ব্যবস্থাপনা (Phase 13)') }];
    }
    if (
      currentModule === 'staff' ||
      currentModule === 'teacher-portal' ||
      currentModule === 'staff-attendance' ||
      currentModule === 'leave-management' ||
      currentModule === 'staff-payroll' ||
      currentModule === 'payroll' ||
      currentModule === 'teacher-routine' ||
      currentModule === 'teacher-assignments' ||
      currentModule === 'staff-advances' ||
      currentModule === 'salary-advance' ||
      currentModule === 'salary-increment'
    ) {
      return [{ label: t('nav.staff', 'ওস্তাদ ও কর্মকর্তা ব্যবস্থাপনা (Phase 14)') }];
    }
    if (currentModule === 'exams') {
      return [{ label: t('nav.exams', 'পরীক্ষা ও ফলাফল') }];
    }
    if (currentModule === 'homework-plan') {
      return [{ label: t('nav.homework_plan', 'হোমওয়ার্ক ও পাঠ পরিকল্পনা') }];
    }
    if (currentModule === 'sms') {
      return [{ label: t('nav.sms', 'এসএমএস ও অভিভাবক যোগাযোগ') }];
    }
    if (currentModule === 'reports') {
      return [{ label: t('nav.reports', 'প্রতিবেদন ও রিপোর্ট') }];
    }
    if (currentModule === 'settings') {
      return [{ label: t('nav.settings', 'সেটিংস ও নিরাপত্তা') }];
    }
    return [{ label: currentModule }];
  };

  // Render active module component with route authorization guard
  const renderCurrentView = () => {
    // 1. Check if unauthenticated (or simulated 401 unauthenticated state)
    if (!isAuthenticated || simulatedUnauthorized) {
      return (
        <UnauthorizedView
          onLoginClick={() => {
            setSimulatedUnauthorized(false);
            setIsLoginModalOpen(true);
          }}
          onBackToDashboard={() => {
            setSimulatedUnauthorized(false);
            setCurrentModule('dashboard');
          }}
        />
      );
    }

    // 2. Check granular route authorization
    const routeCheck = isRouteAllowed(currentModule);
    if (!routeCheck.allowed) {
      return (
        <ForbiddenView
          requiredPermission={routeCheck.requiredPermission}
          moduleName={currentModule}
          onBackToDashboard={() => setCurrentModule('dashboard')}
        />
      );
    }

    // 3. Authorized View Switching
    switch (currentModule) {
      case 'dashboard':
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} />;
      case 'multitenancy':
        return <MultiTenancyInspectorView />;
      case 'rbac':
        return (
          <RbacInspectorView
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onOpenChangePasswordModal={() => setIsPasswordChangeModalOpen(true)}
            onOpenResetPasswordModal={() => setIsPasswordResetModalOpen(true)}
            onSimulateUnauthorized={() => setSimulatedUnauthorized(true)}
            onNavigateToRoute={(route) => setCurrentModule(route)}
          />
        );
      case 'students':
      case 'students_list':
        return <StudentListView onNewAdmission={() => setCurrentModule('admissions')} />;
      case 'admissions':
      case 'admission':
        return <AdmissionWorkflowView onNavigateToStudents={() => setCurrentModule('students')} />;
      case 'academics':
      case 'academic-structure':
      case 'classes':
      case 'subjects':
      case 'class-subjects':
      case 'teacher-assignment':
      case 'syllabus':
      case 'academic-calendar':
      case 'shifts':
      case 'sessions':
        return <AcademicManagementDashboard />;
      case 'attendance':
        return <AttendanceDashboard />;
      case 'homework-plan':
      case 'lesson-plans':
        return <HomeworkLessonPlanView />;
      case 'fees':
        return <FeeCollectionDashboard />;
      case 'receipts':
        return <ReceiptManagementDashboard onNavigate={(mod: string) => setCurrentModule(mod)} />;
      case 'accounting':
        return <AccountingDashboard onNavigate={(mod: string) => setCurrentModule(mod)} />;
      case 'donations':
      case 'donors':
      case 'funds':
      case 'projects':
      case 'transfers':
      case 'donation-reports':
        return <DonationsDashboard currentModule={currentModule} onNavigate={(mod: string) => setCurrentModule(mod)} />;
      case 'staff':
      case 'teacher-portal':
      case 'staff-attendance':
      case 'leave-management':
      case 'staff-payroll':
      case 'payroll':
      case 'teacher-routine':
      case 'teacher-assignments':
      case 'staff-advances':
      case 'salary-advance':
      case 'salary-increment':
        return <StaffManagementDashboard currentModule={currentModule} onNavigate={(mod: string) => setCurrentModule(mod)} />;
      case 'exams':
        return <ExamsManagementDashboard />;
      case 'sms':
      case 'notices':
        return <SmsNotificationDashboard />;
      case 'reports':
        return <ReportsHubView />;
      case 'settings':
      case 'institution-setup':
        return <InstitutionSettingsView />;
      default:
        return <DashboardView onNavigate={(mod) => setCurrentModule(mod)} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)] text-[var(--color-text-main)] transition-colors duration-200">
      {/* Sidebar (Fixed Desktop + Off-canvas Mobile) */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(mod) => {
          setSimulatedUnauthorized(false);
          setCurrentModule(mod);
        }}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onToggleMobileSidebar={() => setIsOpenMobile(true)}
          onToggleCollapseDesktop={() => setIsCollapsed(!isCollapsed)}
          onNavigate={(mod) => {
            setSimulatedUnauthorized(false);
            setCurrentModule(mod);
          }}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenChangePasswordModal={() => setIsPasswordChangeModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Breadcrumb
            items={getBreadcrumbs()}
            onNavigate={(path) => setCurrentModule(path)}
          />
          {renderCurrentView()}
        </main>
      </div>

      {/* Authentication & Security Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenForgotPassword={() => {
          setIsLoginModalOpen(false);
          setIsPasswordResetModalOpen(true);
        }}
      />

      <PasswordChangeModal
        isOpen={isPasswordChangeModalOpen}
        onClose={() => setIsPasswordChangeModalOpen(false)}
      />

      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
        onSuccessLogin={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <MainShell />
          </ToastProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
