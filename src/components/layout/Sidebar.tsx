import React, { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  Receipt,
  CircleDollarSign,
  HandCoins,
  Award,
  Users,
  BellRing,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Building2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { MAIN_NAVIGATION, NavItem } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils/cn';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  ShieldCheck,
  KeyRound,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  Receipt,
  CircleDollarSign,
  HandCoins,
  Award,
  Users,
  BellRing,
  FileSpreadsheet,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
}) => {
  const { tenant, hasPermission, user } = useAuth();
  const { t, language } = useTranslation();
  const [expandedNavs, setExpandedNavs] = useState<Record<string, boolean>>({
    students: true,
    academics: false,
  });

  const toggleSubmenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNavs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredNavigation = MAIN_NAVIGATION.filter((item) => hasPermission(item.roles));

  const content = (
    <div className="flex flex-col h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] select-none">
      {/* Brand & Institution Header */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[var(--color-text-main)] truncate leading-tight">
                {language === 'bn' ? tenant.nameBangla : tenant.nameEnglish}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  EIIN: {tenant.eiinCode || 'N/A'}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                  {tenant.district}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {!isCollapsed && (
          <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-subtle)]">
            {language === 'bn' ? 'প্রধান মেন্যু' : 'Main Modules'}
          </div>
        )}

        {filteredNavigation.map((item: NavItem) => {
          const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
          const isActive = currentModule === item.id || (item.children && item.children.some((c) => c.id === currentModule));
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = !!expandedNavs[item.id];
          const label = t(item.labelKey, language === 'bn' ? item.defaultLabelBn : item.defaultLabelEn);

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (hasChildren) {
                    setExpandedNavs((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                  } else {
                    onSelectModule(item.id);
                    onCloseMobile();
                  }
                }}
                title={isCollapsed ? label : undefined}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer text-left',
                  isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IconComponent className={cn('w-4 h-4 shrink-0', isActive ? 'text-[var(--color-primary)]' : 'opacity-75')} />
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </div>

                {!isCollapsed && hasChildren && (
                  <span
                    onClick={(e) => toggleSubmenu(item.id, e)}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                )}
              </button>

              {/* Child Submenu */}
              {!isCollapsed && hasChildren && isExpanded && (
                <div className="pl-9 pr-1 py-1 space-y-1">
                  {item.children?.filter((child) => hasPermission(child.roles)).map((child) => {
                    const isChildActive = currentModule === child.id;
                    const childLabel = t(child.labelKey, language === 'bn' ? child.defaultLabelBn : child.defaultLabelEn);

                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          onSelectModule(child.id);
                          onCloseMobile();
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors',
                          isChildActive
                            ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary-light)]/60'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', isChildActive ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600')} />
                        <span className="truncate">{childLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tenant / User Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/50">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-text-main)] truncate">{user.fullName}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:block shrink-0 transition-all duration-300 z-30 h-screen sticky top-0',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 md:hidden shadow-2xl transition-transform duration-300',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {content}
      </div>
    </>
  );
};
