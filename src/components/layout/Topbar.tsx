import React, { useState } from 'react';
import {
  Menu,
  Search,
  Globe,
  Palette,
  Bell,
  Building2,
  ChevronDown,
  UserCheck,
  Moon,
  Sun,
  Check,
  ShieldCheck,
  KeyRound,
  LogOut,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuth, DEMO_TENANTS } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { ROLE_LABELS } from '../../constants';
import { RoleType, LanguageCode, ThemeMode } from '../../types';
import { Dropdown } from '../common/Dropdown';
import { Badge } from '../common/Badge';
import { ThemeCustomizerModal } from '../theme/ThemeCustomizerModal';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  onToggleCollapseDesktop: () => void;
  onNavigate?: (module: string) => void;
  onOpenLoginModal?: () => void;
  onOpenChangePasswordModal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileSidebar,
  onToggleCollapseDesktop,
  onNavigate,
  onOpenLoginModal,
  onOpenChangePasswordModal,
}) => {
  const { user, tenant, setTenant, tenants, switchRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);

  // Tenant switcher items
  const activeTenantsList = tenants && tenants.length > 0 ? tenants : DEMO_TENANTS;
  const tenantMenuItems = [
    ...activeTenantsList.map((tItem) => ({
      id: tItem.id,
      label: `${tItem.nameBangla} (${tItem.district}) ${tItem.id === tenant.id ? '✓' : ''}`,
      icon: <Building2 className="w-4 h-4 text-[var(--color-primary)]" />,
      onClick: () => setTenant(tItem),
    })),
    {
      id: 'new-institution-wizard',
      label: '+ নতুন মাদ্রাসা বা শাখা সেটআপ (Wizard)',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      onClick: () => onNavigate?.('settings'),
    },
  ];

  // Role switcher items
  const roleMenuItems = Object.values(RoleType).map((role) => ({
    id: role,
    label: `${ROLE_LABELS[role][language] || ROLE_LABELS[role].bn} ${role === user.role ? '✓' : ''}`,
    icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
    onClick: () => switchRole(role),
  }));

  // Language switcher items
  const languageMenuItems = [
    {
      id: 'bn',
      label: 'বাংলা (Bengali)',
      icon: language === 'bn' ? <Check className="w-4 h-4 text-emerald-600" /> : undefined,
      onClick: () => setLanguage('bn' as LanguageCode),
    },
    {
      id: 'en',
      label: 'English (US)',
      icon: language === 'en' ? <Check className="w-4 h-4 text-emerald-600" /> : undefined,
      onClick: () => setLanguage('en' as LanguageCode),
    },
    {
      id: 'ar',
      label: 'العربية (Arabic)',
      icon: language === 'ar' ? <Check className="w-4 h-4 text-emerald-600" /> : undefined,
      onClick: () => setLanguage('ar' as LanguageCode),
    },
  ];

  // Theme switcher items
  const themeMenuItems = [
    {
      id: 'islamic-green',
      label: language === 'bn' ? 'ইসলামিক সবুজ (Islamic Green)' : 'Islamic Green',
      icon: <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block" />,
      onClick: () => setTheme('islamic-green' as ThemeMode),
    },
    {
      id: 'professional-blue',
      label: language === 'bn' ? 'প্রফেশনাল ব্লু (Royal Blue)' : 'Professional Blue',
      icon: <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block" />,
      onClick: () => setTheme('professional-blue' as ThemeMode),
    },
    {
      id: 'dark',
      label: language === 'bn' ? 'ডার্ক মোড (Dark Mode)' : 'Dark Mode',
      icon: <Moon className="w-3.5 h-3.5 text-amber-400" />,
      onClick: () => setTheme('dark' as ThemeMode),
    },
    {
      id: 'theme-customizer',
      label: '🎨 ডিজাইন সিস্টেম ও থিম কাস্টমাইজেশন...',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      onClick: () => setIsThemeCustomizerOpen(true),
    },
  ];

  const profileMenuItems = [
    {
      id: 'rbac-audit',
      label: 'RBAC ও নিরাপত্তা অডিট (P-04)',
      icon: <KeyRound className="w-3.5 h-3.5 text-purple-600" />,
      onClick: () => onNavigate?.('rbac'),
    },
    {
      id: 'login-modal',
      label: 'লগইন উইন্ডো (লগইন/সুইচ)',
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
      onClick: () => onOpenLoginModal?.(),
    },
    {
      id: 'change-password',
      label: 'পাসওয়ার্ড পরিবর্তন করুন',
      icon: <Lock className="w-3.5 h-3.5 text-blue-600" />,
      onClick: () => onOpenChangePasswordModal?.(),
    },
    {
      id: 'logout',
      label: 'সেশন লগআউট (Logout)',
      icon: <LogOut className="w-3.5 h-3.5 text-rose-600" />,
      onClick: () => logout(),
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
      {/* Left: Sidebar Toggle & Search */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleCollapseDesktop}
          className="hidden md:flex p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          aria-label="Toggle Sidebar Collapse"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:flex items-center w-64 lg:w-80">
          <Search className="absolute left-3 w-4 h-4 text-[var(--color-text-subtle)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search', 'শিক্ষার্থী, ওস্তাদ বা রশিদ খুঁজুন...')}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 text-[var(--color-text-main)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] transition-all"
          />
        </div>
      </div>

      {/* Right: Tenant, Role, Language, Theme, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Phase 03 Multi-Tenant Security & Isolation Inspector Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('multitenancy')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
            title="মাল্টি-টেন্যান্ট আইসোলেশন ও নিরাপত্তা অডিট (Phase 03)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">টেন্যান্ট আইসোলেশন (P-03)</span>
          </button>
        )}

        {/* Phase 04 Auth & RBAC Permissions Inspector Button */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('rbac')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all cursor-pointer"
            title="অথেনটিকেশন ও RBAC পারমিশন অডিট (Phase 04)"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden lg:inline">RBAC ও এক্সেস (P-04)</span>
          </button>
        )}

        {/* Tenant Switcher (Commercial Multi-tenant feature) */}
        <Dropdown
          align="right"
          trigger={
            <button className="hidden xl:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-text-main)] transition-colors">
              <Building2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="truncate max-w-[140px]">{tenant.nameBangla}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          }
          items={tenantMenuItems}
        />

        {/* Role Quick-Switcher for previewing all RBAC Dashboards */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-border)] hover:opacity-90 transition-opacity">
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {ROLE_LABELS[user.role][language] || ROLE_LABELS[user.role].bn}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
          }
          items={roleMenuItems}
        />

        {/* Language Selector */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-main)] transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
            </button>
          }
          items={languageMenuItems}
        />

        {/* Theme Switcher */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-main)] transition-colors"
              title="Theme Settings"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Palette className="w-4 h-4" />}
            </button>
          }
          items={themeMenuItems}
        />

        {/* Notifications Bell */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-main)] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--color-surface)]" />
          </button>
        </div>

        {/* User Profile Avatar with Action Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-[var(--color-border)] hover:opacity-85 transition-opacity cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.fullName.charAt(0) || 'ম'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-[var(--color-text-main)] leading-tight truncate max-w-[130px]">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] leading-none mt-0.5">
                  {user.username}
                </p>
              </div>
            </button>
          }
          items={profileMenuItems}
        />
      </div>

      {/* Theme Customizer & Design System Modal */}
      {isThemeCustomizerOpen && (
        <ThemeCustomizerModal
          isOpen={isThemeCustomizerOpen}
          onClose={() => setIsThemeCustomizerOpen(false)}
        />
      )}
    </header>
  );
};
