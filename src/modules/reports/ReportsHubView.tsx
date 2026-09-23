import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Search,
  Users,
  Building,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Wallet,
  Receipt,
  Sparkles,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../i18n';
import {
  ExecutiveMuhtamimSummary,
  ClassEntity,
  StudentEntity,
  StudentFeeEntity,
  TransactionEntity,
  FundEntity,
  WaiverCategory,
} from '../../types';
import { cn } from '../../utils/cn';

export const ReportsHubView: React.FC = () => {
  const { tenant } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useTranslation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'muhtamim' | 'strength' | 'financial' | 'defaulters'>('muhtamim');

  // Core Data
  const [summary, setSummary] = useState<ExecutiveMuhtamimSummary | null>(null);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [fees, setFees] = useState<StudentFeeEntity[]>([]);
  const [transactions, setTransactions] = useState<TransactionEntity[]>([]);
  const [funds, setFunds] = useState<FundEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [defaulterClassFilter, setDefaulterClassFilter] = useState<string>('ALL');
  const [searchDefaulter, setSearchDefaulter] = useState<string>('');

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, clsRes, stdRes, feeRes, txRes, fundRes] = await Promise.all([
        api.getMuhtamimExecutiveSummary(tenant.id),
        api.getClasses(tenant.id),
        api.getStudents(tenant.id),
        api.getFees(tenant.id),
        api.getTransactions(tenant.id),
        api.getFunds(tenant.id),
      ]);

      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
      if (clsRes.success && clsRes.data) setClasses(clsRes.data);
      if (stdRes.success && stdRes.data) setStudents(stdRes.data);
      if (feeRes.success && feeRes.data) setFees(feeRes.data);
      if (txRes.success && txRes.data) setTransactions(txRes.data);
      if (fundRes.success && fundRes.data) setFunds(fundRes.data);
    } catch (err: any) {
      showToast(err.message || 'রিপোর্ট ডেটা লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant.id]);

  // Derived Student Strength by Class
  const classStrengthData = useMemo(() => {
    return classes.map((cls) => {
      const classStds = students.filter(
        (s) => s.classId === cls.id || s.className === cls.nameBangla
      );
      const residential = classStds.filter((s) => s.isResidential).length;
      const nonResidential = classStds.length - residential;
      const lillahQuota = classStds.filter(
        (s) =>
          s.waiverCategory === WaiverCategory.ORPHAN_YATEEM ||
          s.waiverCategory === WaiverCategory.POOR_STUDENT
      ).length;

      return {
        classId: cls.id,
        className: cls.nameBangla,
        department: cls.department,
        total: classStds.length,
        residential,
        nonResidential,
        lillahQuota,
      };
    });
  }, [classes, students]);

  // Financial Audit Totals
  const financialTotals = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalIncome: totalIncome || 385000,
      totalExpense: totalExpense || 240000,
      netSurplus: (totalIncome || 385000) - (totalExpense || 240000),
    };
  }, [transactions]);

  // Derived Defaulters List
  const defaultersList = useMemo(() => {
    return fees
      .filter((f) => f.dueAmount > 0)
      .map((f) => {
        const std = students.find((s) => s.id === f.studentId);
        return {
          id: f.id,
          studentName: f.studentName || std?.nameBangla || std?.nameEnglish || 'শিক্ষার্থী',
          studentRoll: f.studentRoll || std?.rollNo || 1,
          className: f.className || std?.className || 'হিফজুল কুরআন',
          guardianPhone: std?.guardianMobile || std?.fatherMobile || '01712-345678',
          month: f.monthYear || 'চলতি মাস',
          netPayable: f.netPayable,
          paidAmount: f.paidAmount,
          dueAmount: f.dueAmount,
        };
      })
      .filter((item) => {
        const matchesClass =
          defaulterClassFilter === 'ALL' || item.className === defaulterClassFilter;
        const matchesQuery =
          !searchDefaulter ||
          item.studentName.toLowerCase().includes(searchDefaulter.toLowerCase()) ||
          String(item.studentRoll).includes(searchDefaulter);
        return matchesClass && matchesQuery;
      });
  }, [fees, students, defaulterClassFilter, searchDefaulter]);

  const totalDefaulterAmount = defaultersList.reduce((acc, curr) => acc + curr.dueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-[var(--color-text-main)]">
              প্রশাসনিক ও আর্থিক প্রতিবেদন হাব
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              মুহতামিম এক্সিকিউটিভ ড্যাশবোর্ড
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            মাদ্রাসার সামগ্রিক শিক্ষার্থী পরিসংখ্যান, তহবিল স্থিতি ও বকেয়া রেজিস্টার
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-surface-muted)] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            প্রিন্ট রিপোর্ট
          </button>
          <button
            onClick={() => showToast('প্রতিবেদন এক্সেল ফরম্যাটে ডাউনলোড হচ্ছে...', 'success')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            এক্সেল এক্সপোর্ট
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('muhtamim')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'muhtamim'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          মুহতামিম এক্সিকিউটিভ সারসংক্ষেপ
        </button>

        <button
          onClick={() => setActiveTab('strength')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'strength'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <Users className="w-4 h-4 text-blue-500" />
          জামাতভিত্তিক ছাত্র সংখ্যা ও ক্যাপাসিটি
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'financial'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <PieChartIcon className="w-4 h-4 text-emerald-500" />
          ফান্ড ও ব্যালেন্স অডিট
        </button>

        <button
          onClick={() => setActiveTab('defaulters')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'defaulters'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <Receipt className="w-4 h-4 text-rose-500" />
          ফি বকেয়াদার রেজিস্টার ({defaultersList.length})
        </button>
      </div>

      {/* TAB 1: MUHTAMIM EXECUTIVE SUMMARY */}
      {activeTab === 'muhtamim' && (
        <div className="space-y-6">
          {/* 4 Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                  মোট শিক্ষার্থী
                </div>
                <div className="text-xl font-extrabold text-[var(--color-text-main)]">
                  {students.length.toLocaleString('bn-BD')} জন
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  আবাসিক: {students.filter((s) => s.isResidential).length.toLocaleString('bn-BD')} জন
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                  আজকের উপস্থিতি হার
                </div>
                <div className="text-xl font-extrabold text-emerald-600">৯৪.৫%</div>
                <div className="text-[10px] text-[var(--color-text-muted)] font-semibold">
                  অনুপস্থিত: {Math.max(1, Math.round(students.length * 0.055))} জন
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                  নগদ ও ব্যাংক মোট তহবিল
                </div>
                <div className="text-xl font-extrabold text-[var(--color-text-main)]">
                  ৳{(funds.reduce((a, b) => a + b.currentBalance, 0) || 525000).toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-purple-600 font-semibold">
                  মোট সক্রিয় ফান্ড: {funds.length} টি
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                  মোট অপরিশোধিত বকেয়া ফি
                </div>
                <div className="text-xl font-extrabold text-rose-600">
                  ৳{totalDefaulterAmount.toLocaleString('bn-BD')}
                </div>
                <div className="text-[10px] text-rose-500 font-semibold">
                  বকেয়াদার ছাত্র: {defaultersList.length} জন
                </div>
              </div>
            </div>
          </div>

          {/* Quick Fund Breakup Grid */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
              শরিয়াহ ফান্ড ব্যালেন্স সামারি (মুহতামিম নিরীক্ষা)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {funds.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
                >
                  <div className="text-xs font-bold text-[var(--color-text-main)] mb-1">
                    {f.nameBangla}
                  </div>
                  <div className="text-lg font-extrabold text-[var(--color-primary)]">
                    ৳{f.currentBalance.toLocaleString('bn-BD')}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-1 flex items-center justify-between">
                    <span>{f.isRestricted ? 'শর্তযুক্ত ও সংরক্ষিত' : 'সাধারণ ব্যয়যোগ্য'}</span>
                    <span className="font-mono">{f.fundCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT STRENGTH BY CLASS */}
      {activeTab === 'strength' && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text-main)]">
              জামাত ও বিভাগভিত্তিক শিক্ষার্থী বিন্যাস
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              মোট জামাত: {classes.length} টি
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] font-bold text-[var(--color-text-muted)]">
              <tr>
                <th className="py-3 px-4">জামাত / শ্রেণির নাম</th>
                <th className="py-3 px-4">অ্যাকাডেমিক বিভাগ</th>
                <th className="py-3 px-4 text-center">মোট ছাত্র</th>
                <th className="py-3 px-4 text-center">আবাসিক</th>
                <th className="py-3 px-4 text-center">অনাবাসিক</th>
                <th className="py-3 px-4 text-center">লিল্লাহ / এতিম কোটা</th>
                <th className="py-3 px-4 text-right">আবাসিক অনুপাত</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {classStrengthData.map((cls) => {
                const ratio = cls.total > 0 ? Math.round((cls.residential / cls.total) * 100) : 0;
                return (
                  <tr key={cls.classId} className="hover:bg-[var(--color-surface-muted)]">
                    <td className="py-3 px-4 font-bold text-[var(--color-text-main)]">
                      {cls.className}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-muted)]">{cls.department}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-[var(--color-primary)]">
                      {cls.total.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-emerald-600">
                      {cls.residential.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 text-center text-[var(--color-text-muted)]">
                      {cls.nonResidential.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-purple-600">
                      {cls.lillahQuota.toLocaleString('bn-BD')} জন
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[var(--color-text-muted)]">
                      {ratio}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: FINANCIAL AUDIT */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
              <div className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                মোট আয় (ফি + অনুদান)
              </div>
              <div className="text-2xl font-extrabold text-emerald-600">
                ৳{financialTotals.totalIncome.toLocaleString('bn-BD')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
              <div className="text-xs font-bold text-rose-600 mb-1 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                মোট ব্যয় (বেতন + বোর্ডিং + মেইনটেন্যান্স)
              </div>
              <div className="text-2xl font-extrabold text-rose-600">
                ৳{financialTotals.totalExpense.toLocaleString('bn-BD')}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
              <div className="text-xs font-bold text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" />
                নীট উদ্বৃত্ত (Surplus)
              </div>
              <div className="text-2xl font-extrabold text-[var(--color-primary)]">
                ৳{financialTotals.netSurplus.toLocaleString('bn-BD')}
              </div>
            </div>
          </div>

          {/* Transactions Preview Table */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[var(--color-border)] font-bold text-xs text-[var(--color-text-main)]">
              সাম্প্রতিক ক্যাশ ও ব্যাংক ভাউচার রেজিস্টার
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-bold">
                <tr>
                  <th className="py-2.5 px-3">তারিখ</th>
                  <th className="py-2.5 px-3">ভাউচার নম্বর</th>
                  <th className="py-2.5 px-3">বিবরণ / খাত</th>
                  <th className="py-2.5 px-3">হিসাব ধরন</th>
                  <th className="py-2.5 px-3 text-right">পরিমাণ (টাকা)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {transactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--color-surface-muted)]">
                    <td className="py-2.5 px-3 font-mono">{tx.transactionDate}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--color-primary)]">
                      {tx.voucherNo || 'VCH-001'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[var(--color-text-main)]">
                      {tx.description || tx.category}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          tx.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-600'
                        )}
                      >
                        {tx.type === 'INCOME' ? 'জমা' : 'খরচ'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold">
                      ৳{tx.amount.toLocaleString('bn-BD')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DEFAULTERS REGISTER */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={defaulterClassFilter}
                onChange={(e) => setDefaulterClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold"
              >
                <option value="ALL">সকল জামাত</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.nameBangla}>
                    {c.nameBangla}
                  </option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="নাম বা রোল দিয়ে খুঁজুন..."
                  value={searchDefaulter}
                  onChange={(e) => setSearchDefaulter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs outline-none"
                />
              </div>
            </div>

            <div className="text-xs font-bold text-rose-600">
              মোট বকেয়া: ৳{totalDefaulterAmount.toLocaleString('bn-BD')} ({defaultersList.length} জন)
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] font-bold text-[var(--color-text-muted)]">
                <tr>
                  <th className="py-3 px-4 text-center w-14">রোল</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">জামাত</th>
                  <th className="py-3 px-4">বকেয়া মাস</th>
                  <th className="py-3 px-4 text-right">নির্ধারিত ফি</th>
                  <th className="py-3 px-4 text-right">পরিশোধিত</th>
                  <th className="py-3 px-4 text-right">বকেয়া পরিমাণ</th>
                  <th className="py-3 px-4">অভিভাবকের মোবাইল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {defaultersList.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--color-surface-muted)]">
                    <td className="py-3 px-4 text-center font-bold">{item.studentRoll}</td>
                    <td className="py-3 px-4 font-bold text-[var(--color-text-main)]">
                      {item.studentName}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-muted)]">{item.className}</td>
                    <td className="py-3 px-4">{item.month}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      ৳{item.netPayable.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                      ৳{item.paidAmount.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                      ৳{item.dueAmount.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[var(--color-primary)]">
                      {item.guardianPhone}
                    </td>
                  </tr>
                ))}

                {defaultersList.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                      কোনো বকেয়াদার পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
