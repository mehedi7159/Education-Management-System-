import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  UserPlus,
  Receipt,
  CalendarCheck,
  FileText,
  AlertCircle,
  Building,
  ShieldCheck,
  CircleDollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';
import { formatTaka, toBengaliNumerals, formatDate } from '../../utils/format';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageHeader } from '../../components/layout/PageHeader';
import { Modal } from '../../components/common/Modal';
import { RoleType } from '../../types';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalFundsBalance: number;
  monthlyCollection: number;
  monthlyExpense: number;
  outstandingDues: number;
  todayCollection: number;
  recentActivities: any[];
  recentStudents: any[];
  fundsSummary: any[];
}

export const DashboardView: React.FC<{ onNavigate: (moduleId: string) => void }> = ({ onNavigate }) => {
  const { tenant, user } = useAuth();
  const { t, language } = useTranslation();
  const { success, info } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setLoading(true);
      const res = await api.getDashboardStats(tenant.id);
      if (isMounted && res.success) {
        setStats(res.data);
      }
      if (isMounted) setLoading(false);
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [tenant.id]);

  const handleQuickAction = (type: string) => {
    setModalType(type);
    setIsQuickActionModalOpen(true);
  };

  if (loading || !stats) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" text={t('common.loading', 'ড্যাশবোর্ডের তথ্য লোড হচ্ছে...')} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title={t('dashboard.title', 'প্রশাসনিক ড্যাশবোর্ড')}
        subtitle={`${tenant.nameBangla} — ${tenant.code}`}
        badge={
          <Badge variant="primary" size="md">
            {tenant.madrasahType}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Building className="w-4 h-4 text-[var(--color-primary)]" />}
              onClick={() => onNavigate('settings')}
            >
              প্রতিষ্ঠান সেটআপ (Phase 05)
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
              onClick={() => onNavigate('multitenancy')}
            >
              আইসোলেশন অডিট
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Receipt className="w-4 h-4" />}
              onClick={() => handleQuickAction('fee')}
            >
              {t('dashboard.collectFeeBtn', 'ফি আদায়')}
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => onNavigate('admissions')}
            >
              {t('dashboard.newAdmissionBtn', 'নতুন ভর্তি (৮-ধাপ)')}
            </Button>
          </div>
        }
      />

      {/* Role Notice Banner if in preview mode */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary-border)] text-xs text-[var(--color-primary)]">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            {language === 'bn' ? (
              <>আপনি বর্তমানে <strong>{user.fullName}</strong> হিসেবে <strong>{user.role}</strong> মোডে সিস্টেমটি দেখছেন।</>
            ) : (
              <>Currently viewing as <strong>{user.fullName}</strong> ({user.role})</>
            )}
          </span>
        </div>
        <span className="hidden sm:inline font-bold px-2 py-0.5 rounded bg-[var(--color-surface)] shadow-2xs">
          Multi-Tenant Isolated: {tenant.code}
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                {t('dashboard.totalStudents', 'মোট শিক্ষার্থী')}
              </p>
              <h3 className="text-2xl font-bold text-[var(--color-text-main)] mt-1.5">
                {toBengaliNumerals(stats.totalStudents)} <span className="text-xs font-normal text-[var(--color-text-muted)]">জন</span>
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-semibold">
                <span>{toBengaliNumerals(stats.activeStudents)} জন নিয়মিত</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Total Fund Balance */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                {t('dashboard.cashBalance', 'মোট তহবিল স্থিতি')}
              </p>
              <h3 className="text-2xl font-bold text-[var(--color-text-main)] mt-1.5">
                {formatTaka(stats.totalFundsBalance, language)}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--color-text-muted)]">
                <span>৪টি তহবিলের সমষ্টিক স্থিতি</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Monthly Collection */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                {t('dashboard.monthlyCollection', 'চলতি মাসের ফি আদায়')}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1.5">
                {formatTaka(stats.monthlyCollection, language)}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>আজকের আদায় {formatTaka(stats.todayCollection, language)}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Outstanding Dues */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                {t('dashboard.outstandingDues', 'বকেয়া ফি পাওনা')}
              </p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1.5">
                {formatTaka(stats.outstandingDues, language)}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-rose-500 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>তাগাদা নোটিশ প্রস্তুত</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Funds & Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fund Breakdown Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-sm">
                  {language === 'bn' ? 'তহবিলভিত্তিক ব্যালান্স বিভাজন' : 'Fund Breakdown & Balances'}
                </CardTitle>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {language === 'bn' ? 'লিল্লাহ, সাধারণ ও বোর্ডিং ফান্ডের বর্তমান হিসাব' : 'General, Lillah & Boarding fund current balances'}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onNavigate('accounting')}>
                {t('common.view', 'লেজার দেখুন')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {stats.fundsSummary.map((fund) => (
                  <div
                    key={fund.id}
                    className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[var(--color-text-main)] truncate">
                        {fund.nameBangla}
                      </span>
                      {fund.isRestricted && (
                        <Badge variant="warning" size="sm">
                          নির্দিষ্ট ফান্ড
                        </Badge>
                      )}
                    </div>
                    <div className="text-lg font-bold text-[var(--color-primary)]">
                      {formatTaka(fund.currentBalance, language)}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1 mt-1">
                      {fund.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Financial Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t('dashboard.recentActivities', 'সাম্প্রতিক আর্থিক লেনদেন')}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => onNavigate('accounting')}>
                {t('common.all', 'সবগুলো')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {stats.recentActivities.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                        }`}
                      >
                        {tx.type === 'INCOME' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--color-text-main)] truncate">
                          {tx.category}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          <span>{tx.voucherNo}</span>
                          <span>•</span>
                          <span>{tx.fundName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${
                          tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'} {formatTaka(tx.amount, language)}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {tx.transactionDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Quick Links, Admitted Students, Daily Attendance */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t('dashboard.quickActions', 'প্রশাসনিক শর্টকাট')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => handleQuickAction('admission')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-main)]">
                    {t('dashboard.newAdmissionBtn', 'নতুন ছাত্র ভর্তি')}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--color-text-subtle)] group-hover:text-[var(--color-primary)] transition-colors" />
              </button>

              <button
                onClick={() => handleQuickAction('fee')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-main)]">
                    {t('dashboard.collectFeeBtn', 'ফি কালেকশন ও মানিরিসিপ্ট')}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--color-text-subtle)] group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => handleQuickAction('attendance')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-main)]">
                    {t('dashboard.takeAttendanceBtn', 'দৈনিক হাজিরা গ্রহণ')}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--color-text-subtle)] group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                onClick={() => handleQuickAction('expense')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-main)]">
                    {t('dashboard.addExpenseBtn', 'ব্যয় ভাউচার প্রস্তুত')}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--color-text-subtle)] group-hover:text-rose-600 transition-colors" />
              </button>
            </CardContent>
          </Card>

          {/* Recent Admitted Students Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t('dashboard.recentStudents', 'সর্বশেষ ভর্তি হওয়া শিক্ষার্থী')}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => onNavigate('students')}>
                {t('common.view', 'সকল')}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentStudents.map((std) => (
                  <div key={std.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center font-bold text-[var(--color-primary)] text-xs shrink-0">
                        {toBengaliNumerals(std.rollNo)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--color-text-main)] truncate">{std.nameBangla}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">{std.studentIdCardNo}</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      {std.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Preview Modal */}
      <Modal
        isOpen={isQuickActionModalOpen}
        onClose={() => setIsQuickActionModalOpen(false)}
        title={
          modalType === 'admission'
            ? 'নতুন শিক্ষার্থী ভর্তি প্রক্রিয়া (উইজার্ড)'
            : modalType === 'fee'
            ? 'ফি আদায় ও রশিদ জেনারেশন'
            : modalType === 'attendance'
            ? 'দৈনিক হাজিরা ইনপুট'
            : 'ব্যয় ভাউচার এন্ট্রি'
        }
        subtitle={`${tenant.nameBangla} — রিয়েল টাইম ডাটা এন্ট্রি`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsQuickActionModalOpen(false)}>
              {t('common.cancel', 'বন্ধ করুন')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                success(
                  'কার্যক্রম সফলভাবে নথিভুক্ত করা হয়েছে',
                  'পরবর্তী মডিউল ইন্টিগ্রেশন প্রম্পটে পূর্ণাঙ্গ ফর্ম যুক্ত হবে।'
                );
                setIsQuickActionModalOpen(false);
              }}
            >
              {t('common.confirm', 'নিশ্চিত করুন')}
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-2 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-primary-border)] flex items-start gap-2.5 text-[var(--color-primary)]">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">মডিউল আর্কিটেকচার সক্রিয়</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                এটি ফেজ-১ এর ফাউন্ডেশনাল শেল। আপনি মাস্টার প্রম্পটের পরবর্তী নির্দেশনায় যে মডিউল আহ্বান করবেন (যেমন: ৮-ধাপের ভর্তি উইজার্ড, পূর্ণাঙ্গ ফি ও রশিদ ব্যবস্থা বা উপস্থিতি ইঞ্জিন), তার পূর্ণাঙ্গ ডাটাবেজ বাইন্ডিং সহ কাজ করবে।
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
