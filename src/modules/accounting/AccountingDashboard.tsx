import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Calendar,
  Search,
  Filter,
  Printer,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  PlusCircle,
  Clock,
  Download,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Layers,
  Sparkles,
  ChevronRight,
  Eye,
  Lock,
  Tag,
  Users,
} from 'lucide-react';
import {
  AccountEntity,
  FundEntity,
  TransactionEntity,
  DailyClosingEntity,
  TransactionType,
  ApprovalStatus,
  IncomeCategory,
  ExpenseCategory,
} from '../../types';
import { formatTaka, toBengaliNumerals, formatDate } from '../../utils/format';
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '../../constants';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VoucherPrintModal } from './VoucherPrintModal';
import { VoidTransactionModal } from './VoidTransactionModal';
import { IncomeEntryModal } from './IncomeEntryModal';
import { ExpenseEntryModal } from './ExpenseEntryModal';
import { TransferModal } from './TransferModal';
import { DailyClosingModal } from './DailyClosingModal';
import { NewAccountFundModal } from './NewAccountFundModal';

type AccountingTab = 'OVERVIEW' | 'LEDGER' | 'ACCOUNTS_FUNDS' | 'DAILY_CLOSING' | 'REPORTS';

export interface AccountingDashboardProps {
  onNavigate?: (module: string) => void;
}

export const AccountingDashboard: React.FC<AccountingDashboardProps> = ({ onNavigate }) => {
  const { tenant, user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AccountingTab>('OVERVIEW');
  const [loading, setLoading] = useState<boolean>(true);

  // Core accounting entities
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);
  const [funds, setFunds] = useState<FundEntity[]>([]);
  const [transactions, setTransactions] = useState<TransactionEntity[]>([]);
  const [dailyClosings, setDailyClosings] = useState<DailyClosingEntity[]>([]);

  // Modals state
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDailyClosingModalOpen, setIsDailyClosingModalOpen] = useState(false);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [newAccountFundMode, setNewAccountFundMode] = useState<'ACCOUNT' | 'FUND'>('ACCOUNT');

  // Selected for View / Void
  const [selectedVoucher, setSelectedVoucher] = useState<TransactionEntity | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [transactionToVoid, setTransactionToVoid] = useState<TransactionEntity | null>(null);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);

  // Ledger Filter states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [ledgerAccountFilter, setLedgerAccountFilter] = useState<string>('ALL');
  const [ledgerFundFilter, setLedgerFundFilter] = useState<string>('ALL');
  const [ledgerCategoryFilter, setLedgerCategoryFilter] = useState<string>('ALL');
  const [ledgerDateFilter, setLedgerDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');

  // Reports Filter states
  const [reportPeriod, setReportPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedReportYear, setSelectedReportYear] = useState<number>(new Date().getFullYear());
  const [selectedReportMonth, setSelectedReportMonth] = useState<number>(new Date().getMonth() + 1);

  // Load Data
  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [accRes, fndRes, txRes, dcRes] = await Promise.all([
        api.getAccounts(),
        api.getFunds(),
        api.getTransactions(),
        api.getDailyClosings(),
      ]);

      if (accRes.success && accRes.data) setAccounts(accRes.data);
      if (fndRes.success && fndRes.data) setFunds(fndRes.data);
      if (txRes.success && txRes.data) setTransactions(txRes.data);
      if (dcRes.success && dcRes.data) setDailyClosings(dcRes.data);
    } catch (err: any) {
      showToast(err.message || 'হিসাবরক্ষণ তথ্য লোড ব্যর্থ হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancialData();
  }, [tenant?.id]);

  // Aggregate Balances
  const totalCashBalance = useMemo(() => {
    return accounts
      .filter((a) => a.accountType === 'CASH')
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [accounts]);

  const totalBankBalance = useMemo(() => {
    return accounts
      .filter((a) => a.accountType !== 'CASH')
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [accounts]);

  const totalConsolidatedBalance = totalCashBalance + totalBankBalance;

  // Active Valid Transactions (Excluding VOIDED from financial calculations)
  const validTransactions = useMemo(() => {
    return transactions.filter((t) => t.status !== ApprovalStatus.VOIDED);
  }, [transactions]);

  // Lifetime & Current Month Totals
  const currentMonthTotals = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let income = 0;
    let expense = 0;

    for (const t of validTransactions) {
      if (t.transactionDate.startsWith(currentYearMonth)) {
        if (t.type === TransactionType.INCOME) income += t.amount;
        else if (t.type === TransactionType.EXPENSE) expense += t.amount;
      }
    }

    return {
      income,
      expense,
      net: income - expense,
    };
  }, [validTransactions]);

  // Income Category Breakdown
  const incomeCategoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of validTransactions) {
      if (t.type === TransactionType.INCOME) {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    }
    return map;
  }, [validTransactions]);

  // Expense Category Breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of validTransactions) {
      if (t.type === TransactionType.EXPENSE) {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    }
    return map;
  }, [validTransactions]);

  // Filtered Ledger Entries
  const filteredLedgerTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return transactions.filter((tx) => {
      // Search
      if (ledgerSearch.trim()) {
        const query = ledgerSearch.toLowerCase().trim();
        const matchesVoucher = tx.voucherNo.toLowerCase().includes(query);
        const matchesRef = tx.reference.toLowerCase().includes(query);
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesCreated = tx.createdBy?.toLowerCase().includes(query);
        if (!matchesVoucher && !matchesRef && !matchesDesc && !matchesCat && !matchesCreated) {
          return false;
        }
      }

      // Type
      if (ledgerTypeFilter !== 'ALL' && tx.type !== ledgerTypeFilter) {
        return false;
      }

      // Account
      if (ledgerAccountFilter !== 'ALL' && tx.accountId !== ledgerAccountFilter) {
        return false;
      }

      // Fund
      if (ledgerFundFilter !== 'ALL' && tx.fundId !== ledgerFundFilter) {
        return false;
      }

      // Category
      if (ledgerCategoryFilter !== 'ALL' && tx.category !== ledgerCategoryFilter) {
        return false;
      }

      // Date Range
      if (ledgerDateFilter === 'TODAY' && tx.transactionDate !== todayStr) {
        return false;
      }
      if (ledgerDateFilter === 'MONTH') {
        const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        if (!tx.transactionDate.startsWith(currentMonthPrefix)) return false;
      }
      if (ledgerDateFilter === 'YEAR') {
        const currentYearPrefix = `${now.getFullYear()}`;
        if (!tx.transactionDate.startsWith(currentYearPrefix)) return false;
      }

      return true;
    });
  }, [
    transactions,
    ledgerSearch,
    ledgerTypeFilter,
    ledgerAccountFilter,
    ledgerFundFilter,
    ledgerCategoryFilter,
    ledgerDateFilter,
  ]);

  // Running balance calculation for ledger (sorted oldest to newest for mathematical accumulation, then rendered newest first)
  const ledgerWithRunningBalance = useMemo(() => {
    // Clone and sort ascending by date
    const ascending = [...filteredLedgerTransactions].sort(
      (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );

    let cumulativeBalance = 0;
    const itemsWithBalance = ascending.map((item) => {
      if (item.status !== ApprovalStatus.VOIDED) {
        if (item.type === TransactionType.INCOME) {
          cumulativeBalance += item.amount;
        } else if (item.type === TransactionType.EXPENSE) {
          cumulativeBalance -= item.amount;
        }
      }
      return {
        ...item,
        runningBalance: cumulativeBalance,
      };
    });

    // Reverse back to newest first for display
    return itemsWithBalance.reverse();
  }, [filteredLedgerTransactions]);

  // Report Period Transactions
  const reportTransactions = useMemo(() => {
    return validTransactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      if (reportPeriod === 'MONTHLY') {
        return (
          txDate.getFullYear() === selectedReportYear &&
          txDate.getMonth() + 1 === selectedReportMonth
        );
      } else {
        return txDate.getFullYear() === selectedReportYear;
      }
    });
  }, [validTransactions, reportPeriod, selectedReportYear, selectedReportMonth]);

  const reportIncomeTotal = useMemo(() => {
    return reportTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [reportTransactions]);

  const reportExpenseTotal = useMemo(() => {
    return reportTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [reportTransactions]);

  const reportNetBalance = reportIncomeTotal - reportExpenseTotal;

  // Handlers for callbacks
  const handleTransactionCreated = (newTx: TransactionEntity) => {
    loadFinancialData();
    setSelectedVoucher(newTx);
    setIsVoucherModalOpen(true);
  };

  const handleTransactionVoided = (updatedTx: TransactionEntity) => {
    loadFinancialData();
    setIsVoidModalOpen(false);
  };

  const handleAccountCreated = (newAcc: AccountEntity) => {
    setAccounts((prev) => [...prev, newAcc]);
  };

  const handleFundCreated = (newFund: FundEntity) => {
    setFunds((prev) => [...prev, newFund]);
  };

  const handleDailyClosingSuccess = (closing: DailyClosingEntity) => {
    setDailyClosings((prev) => [closing, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans text-slate-800">
      {/* Top Header & Navigation Banner */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PHASE 12 • আর্থিক ও হিসাব মডিউল
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-500 font-medium">দ্বি-তরফা খতিয়ান ও ক্যাশ রিকনসিলিয়েশন</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Wallet className="w-7 h-7 text-emerald-600" />
                মাদ্রাসা হিসাবরক্ষণ ও তহবিল ব্যবস্থাপনা (Accounting & Finance)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                ছাত্র ফি, অনুদান ও ওয়াকফ আয় | বেতন, মেস ও মাহফিল ব্যয় | ক্যাশ ও ব্যাংক ক্লোজিং
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsIncomeModalOpen(true)}
                id="btn-new-income-voucher"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                <ArrowDownRight className="w-4 h-4" />
                + নতুন আয় ভাউচার
              </button>

              <button
                onClick={() => setIsExpenseModalOpen(true)}
                id="btn-new-expense-voucher"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                - নতুন ব্যয় ভাউচার
              </button>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                id="btn-transfer-funds"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                স্থানান্তর (Transfer)
              </button>

              <button
                onClick={() => setIsDailyClosingModalOpen(true)}
                id="btn-daily-closing-wizard"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ক্যাশ ক্লোজিং
              </button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              id="tab-accounting-overview"
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              সারসংক্ষেপ ও ব্যালান্স (Overview & Balance)
            </button>

            <button
              onClick={() => setActiveTab('LEDGER')}
              id="tab-accounting-ledger"
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'LEDGER'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              হিসাবের খতিয়ান (General Ledger)
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ACCOUNTS_FUNDS')}
              id="tab-accounting-accounts"
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'ACCOUNTS_FUNDS'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              ক্যাশ ও ব্যাংক হিসাব / ফান্ড ({accounts.length + funds.length})
            </button>

            <button
              onClick={() => setActiveTab('DAILY_CLOSING')}
              id="tab-accounting-closing"
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'DAILY_CLOSING'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              দৈনিক ক্লোজিং হিস্ট্রি ({dailyClosings.length})
            </button>

            <button
              onClick={() => setActiveTab('REPORTS')}
              id="tab-accounting-reports"
              className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'REPORTS'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <PieChart className="w-4 h-4" />
              মাসিক ও বার্ষিক আর্থিক প্রতিবেদন
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: OVERVIEW & BALANCE */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Consolidated Balance Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-slate-300 font-semibold tracking-wide">সর্বমোট স্থিতি (Total Balance)</span>
                    <h3 className="text-2xl font-black font-mono mt-1 text-white tracking-tight">
                      {formatTaka(totalConsolidatedBalance)}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">ক্যাশ ব্যালান্স:</span>
                    <span className="font-mono font-bold text-emerald-300">{formatTaka(totalCashBalance)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ব্যাংক ব্যালান্স:</span>
                    <span className="font-mono font-bold text-blue-300">{formatTaka(totalBankBalance)}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Income Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">চলতি মাসের মোট আয় (Income)</span>
                    <h3 className="text-2xl font-black font-mono mt-1 text-emerald-700 tracking-tight">
                      {formatTaka(currentMonthTotals.income)}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ছাত্র বেতন, অনুদান ও অন্যান্য নিয়মিত আদায়
                </p>
              </div>

              {/* Monthly Expense Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">চলতি মাসের মোট ব্যয় (Expense)</span>
                    <h3 className="text-2xl font-black font-mono mt-1 text-rose-700 tracking-tight">
                      {formatTaka(currentMonthTotals.expense)}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">চলতি মাসের নিট উদ্বৃত্ত:</span>
                  <span
                    className={`font-mono font-bold ${
                      currentMonthTotals.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatTaka(currentMonthTotals.net)}
                  </span>
                </div>
              </div>
            </div>

            {/* Income vs Expense Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Categories Panel */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">আয়ের খাতসমূহ (Income Categories)</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    মোট খাত: {Object.keys(incomeCategoryBreakdown).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    IncomeCategory.STUDENT_FEES,
                    IncomeCategory.ADMISSION,
                    IncomeCategory.DONATIONS,
                    IncomeCategory.GRANTS,
                    IncomeCategory.OTHER_INCOME,
                  ].map((cat) => {
                    const amt = incomeCategoryBreakdown[cat] || 0;
                    const totalInc = Object.values(incomeCategoryBreakdown).reduce((a, b) => a + b, 0);
                    const pct = totalInc > 0 ? Math.round((amt / totalInc) * 100) : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">{INCOME_CATEGORY_LABELS[cat]?.bn || cat}</span>
                          <span className="font-mono font-bold text-emerald-800">
                            {formatTaka(amt)} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expense Categories Panel */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-rose-600" />
                    <h3 className="font-bold text-slate-900 text-sm">ব্যয়ের খাতসমূহ (Expense Categories)</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    মোট খাত: {Object.keys(expenseCategoryBreakdown).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    ExpenseCategory.SALARY,
                    ExpenseCategory.FOOD,
                    ExpenseCategory.ELECTRICITY,
                    ExpenseCategory.EDUCATION,
                    ExpenseCategory.MAINTENANCE,
                    ExpenseCategory.TRANSPORT,
                    ExpenseCategory.EVENTS,
                    ExpenseCategory.MAHFIL,
                    ExpenseCategory.OTHER,
                  ].map((cat) => {
                    const amt = expenseCategoryBreakdown[cat] || 0;
                    const totalExp = Object.values(expenseCategoryBreakdown).reduce((a, b) => a + b, 0);
                    const pct = totalExp > 0 ? Math.round((amt / totalExp) * 100) : 0;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">{EXPENSE_CATEGORY_LABELS[cat]?.bn || cat}</span>
                          <span className="font-mono font-bold text-rose-800">
                            {formatTaka(amt)} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Transactions Snippet */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">সাম্প্রতিক লেনদেন সমূহ (Recent Transactions)</h3>
                  <p className="text-xs text-slate-500">সর্বশেষ আর্থিক ভাউচার ও রসিদের তালিকা</p>
                </div>
                <button
                  onClick={() => setActiveTab('LEDGER')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  সম্পূর্ণ লেজার দেখুন
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">ভাউচার নং</th>
                      <th className="py-2.5 px-3">রেফারেন্স</th>
                      <th className="py-2.5 px-3">খাত (Category)</th>
                      <th className="py-2.5 px-3">হিসাব ও ফান্ড</th>
                      <th className="py-2.5 px-3 text-right">টাকা (Amount)</th>
                      <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.slice(0, 5).map((tx) => {
                      const isIncome = tx.type === TransactionType.INCOME;
                      const isVoided = tx.status === ApprovalStatus.VOIDED;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{formatDate(tx.transactionDate)}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {tx.voucherNo}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{tx.reference}</td>
                          <td className="py-3 px-3 font-medium text-slate-800">{tx.category}</td>
                          <td className="py-3 px-3 text-slate-600">{tx.accountName}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-sm whitespace-nowrap">
                            <span className={isVoided ? 'line-through text-slate-400' : isIncome ? 'text-emerald-700' : 'text-rose-700'}>
                              {isIncome ? '+' : '-'}{formatTaka(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedVoucher(tx);
                                setIsVoucherModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            >
                              ভাউচার দেখুন
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GENERAL LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ভাউচার নং, রেফারেন্স বা বিবরণ দিয়ে খুঁজুন..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Type Filter */}
                <div>
                  <select
                    value={ledgerTypeFilter}
                    onChange={(e) => setLedgerTypeFilter(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="ALL">সকল লেনদেন (All Types)</option>
                    <option value={TransactionType.INCOME}>কেবল আদায় / আয় (Income)</option>
                    <option value={TransactionType.EXPENSE}>কেবল খরচ / ব্যয় (Expense)</option>
                    <option value={TransactionType.FUND_TRANSFER}>অভ্যন্তরীণ স্থানান্তর (Transfer)</option>
                  </select>
                </div>

                {/* Account Filter */}
                <div>
                  <select
                    value={ledgerAccountFilter}
                    onChange={(e) => setLedgerAccountFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="ALL">সকল হিসাব (All Accounts)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <select
                    value={ledgerDateFilter}
                    onChange={(e) => setLedgerDateFilter(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="ALL">সব সময় (All Time)</option>
                    <option value="TODAY">আজকের লেনদেন (Today)</option>
                    <option value="MONTH">চলতি মাস (This Month)</option>
                    <option value="YEAR">চলতি অর্থবছর (This Year)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>ফিল্টারকৃত মোট এন্ট্রি: <b className="text-slate-800 font-mono">{ledgerWithRunningBalance.length}</b> টি</span>
                <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  দ্বি-তরফা খতিয়ানের চলমান ব্যালান্স স্বয়ংক্রিয়ভাবে হিসাবকৃত
                </span>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold">
                      <th className="py-3 px-3 whitespace-nowrap">তারিখ</th>
                      <th className="py-3 px-3 whitespace-nowrap">ভাউচার নং</th>
                      <th className="py-3 px-3 whitespace-nowrap">রেফারেন্স</th>
                      <th className="py-3 px-3">খাত ও বিবরণ</th>
                      <th className="py-3 px-3 whitespace-nowrap">হিসাব</th>
                      <th className="py-3 px-3 whitespace-nowrap">তহবিল</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">জমা / আয় (৳)</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">খরচ / ব্যয় (৳)</th>
                      <th className="py-3 px-3 text-right whitespace-nowrap">চলমান ব্যালান্স (৳)</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">স্ট্যাটাস</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerWithRunningBalance.map((item) => {
                      const isIncome = item.type === TransactionType.INCOME;
                      const isExpense = item.type === TransactionType.EXPENSE;
                      const isVoided = item.status === ApprovalStatus.VOIDED;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/90 transition ${
                            isVoided ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">
                            {formatDate(item.transactionDate)}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.voucherNo}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {item.reference}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <p className="font-bold text-slate-800 text-xs">{item.category}</p>
                            <p className="text-slate-500 text-[11px] truncate">{item.description}</p>
                          </td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{item.accountName}</td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{item.fundName || 'সাধারণ'}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                            {isIncome && !isVoided ? formatTaka(item.amount) : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                            {isExpense && !isVoided ? formatTaka(item.amount) : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap bg-slate-50/50">
                            {formatTaka(item.runningBalance)}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {isVoided ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                বাতিলকৃত (Void)
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                অনুমোদিত
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedVoucher(item);
                                  setIsVoucherModalOpen(true);
                                }}
                                title="ভাউচার প্রিন্ট ও বিস্তারিত"
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              {!isVoided && (
                                <button
                                  onClick={() => {
                                    setTransactionToVoid(item);
                                    setIsVoidModalOpen(true);
                                  }}
                                  title="ভাউচার বাতিল ও অডিট রিভার্সাল"
                                  className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACCOUNTS & FUNDS */}
        {activeTab === 'ACCOUNTS_FUNDS' && (
          <div className="space-y-6">
            {/* Cash & Bank Accounts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">ক্যাশ ও ব্যাংক হিসাবসমূহ (Cash & Bank Accounts)</h3>
                  <p className="text-xs text-slate-500">মাদ্রাসার প্রধান ক্যাশ ড্রয়ার ও ব্যাংক সঞ্চয়ী/চলতি হিসাব</p>
                </div>
                <button
                  onClick={() => {
                    setNewAccountFundMode('ACCOUNT');
                    setIsNewAccountModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  নতুন অ্যাকাউন্ট যোগ
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((acc) => {
                  const isCash = acc.accountType === 'CASH';
                  return (
                    <div
                      key={acc.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2.5 rounded-xl ${isCash ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isCash ? <Wallet className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase">
                              {isCash ? 'ক্যাশ কাউন্টার' : 'ব্যাংক হিসাব'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">{acc.accountName}</h4>
                          </div>
                        </div>
                      </div>

                      {acc.accountNumber && (
                        <p className="text-xs text-slate-500 font-mono mb-2">
                          হিসাব নং: <b className="text-slate-700">{acc.accountNumber}</b> {acc.branchName ? `(${acc.branchName})` : ''}
                        </p>
                      )}

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs text-slate-500">বর্তমান স্থিতি:</span>
                        <span className="font-mono font-bold text-lg text-slate-900">{formatTaka(acc.balance)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funds Section */}
            <div>
              <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">তহবিল ও ফান্ড ব্যবস্থাপনা (Funds Management)</h3>
                  <p className="text-xs text-slate-500">লিল্লাহ, সাধারণ, বোর্ডিং ও মসজিদ ভবন তহবিলের পৃথক ব্যালান্স</p>
                </div>
                <button
                  onClick={() => {
                    setNewAccountFundMode('FUND');
                    setIsNewAccountModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer border border-slate-300"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  নতুন ফান্ড যোগ
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {funds.map((fnd) => (
                  <div
                    key={fnd.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{fnd.nameBangla}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">{fnd.nameEnglish}</p>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-500">ফান্ড স্থিতি:</span>
                      <span className="font-mono font-bold text-base text-emerald-800">
                        {formatTaka(fnd.currentBalance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DAILY CLOSING */}
        {activeTab === 'DAILY_CLOSING' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">দৈনিক ক্যাশ ও ব্যাংক হিসাব ক্লোজিং লগ (Daily Closing Records)</h3>
                <p className="text-xs text-slate-500">দিনশেষে হিসাবরক্ষক ও মুহতামিমের ক্যাশ কাউন্ট ভেরিফিকেশন সনদ</p>
              </div>
              <button
                onClick={() => setIsDailyClosingModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                আজকের ক্যাশ ক্লোজিং সম্পাদন
              </button>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold">
                      <th className="py-3 px-3 whitespace-nowrap">ক্লোজিং তারিখ</th>
                      <th className="py-3 px-3 whitespace-nowrap">প্রারম্ভিক ক্যাশ (৳)</th>
                      <th className="py-3 px-3 whitespace-nowrap">আজকের ক্যাশ আদায় (৳)</th>
                      <th className="py-3 px-3 whitespace-nowrap">আজকের ক্যাশ খরচ (৳)</th>
                      <th className="py-3 px-3 whitespace-nowrap">সমাপনী ক্যাশ স্থিতি (৳)</th>
                      <th className="py-3 px-3 whitespace-nowrap">গণনাকৃত বাস্তব ক্যাশ (৳)</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">মিল / গরমিল (Discrepancy)</th>
                      <th className="py-3 px-3 whitespace-nowrap">ক্লোজকারী</th>
                      <th className="py-3 px-3 text-center whitespace-nowrap">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyClosings.map((dc) => (
                      <tr key={dc.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {formatDate(dc.closingDate)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {formatTaka(dc.openingCashBalance)}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-700 font-bold whitespace-nowrap">
                          +{formatTaka(dc.totalCashIncome)}
                        </td>
                        <td className="py-3 px-3 font-mono text-rose-700 font-bold whitespace-nowrap">
                          -{formatTaka(dc.totalCashExpense)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-900 font-bold whitespace-nowrap">
                          {formatTaka(dc.closingCashBalance)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-900 font-bold whitespace-nowrap bg-slate-50">
                          {formatTaka(dc.physicalCashCount ?? 0)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {dc.discrepancy === 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              শতভাগ নির্ভুল মিল (৳ ০.০০)
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              পার্থক্য: {formatTaka(dc.discrepancy ?? 0)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{dc.closedBy}</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {dc.status === 'VERIFIED' ? 'যাচাইকৃত' : 'খসড়া'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCIAL REPORTS */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-6">
            {/* Report Control Toolbar */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    onClick={() => setReportPeriod('MONTHLY')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      reportPeriod === 'MONTHLY'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    মাসিক প্রতিবেদন (Monthly)
                  </button>
                  <button
                    onClick={() => setReportPeriod('ANNUAL')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      reportPeriod === 'ANNUAL'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    বার্ষিক অডিট প্রতিবেদন (Annual)
                  </button>
                </div>

                {reportPeriod === 'MONTHLY' && (
                  <select
                    value={selectedReportMonth}
                    onChange={(e) => setSelectedReportMonth(parseInt(e.target.value, 10))}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {[
                      { num: 1, label: 'জানুয়ারি' },
                      { num: 2, label: 'ফেব্রুয়ারি' },
                      { num: 3, label: 'মার্চ' },
                      { num: 4, label: 'এপ্রিল' },
                      { num: 5, label: 'মে' },
                      { num: 6, label: 'জুন' },
                      { num: 7, label: 'জুলাই' },
                      { num: 8, label: 'আগস্ট' },
                      { num: 9, label: 'সেপ্টেম্বর' },
                      { num: 10, label: 'অক্টোবর' },
                      { num: 11, label: 'নভেম্বর' },
                      { num: 12, label: 'ডিসেম্বর' },
                    ].map((m) => (
                      <option key={m.num} value={m.num}>{m.label}</option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedReportYear}
                  onChange={(e) => setSelectedReportYear(parseInt(e.target.value, 10))}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-medium font-mono"
                >
                  {[2024, 2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  প্রতিবেদন প্রিন্ট / PDF
                </button>
              </div>
            </div>

            {/* Printable Report Document Card */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm print:border-none print:shadow-none space-y-6">
              {/* Institution Header */}
              <div className="text-center pb-6 border-b-2 border-slate-800">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  {tenant?.nameBangla || 'আল-জামিয়াতুল ইসলামিয়া দারুল উলুম'}
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  {tenant?.nameEnglish || 'Al-Jamiatul Islamia Darul Uloom'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {tenant?.address || 'মিরপুর-১২, ঢাকা-১২১৬'}
                </p>
                <div className="inline-block mt-3 px-4 py-1 rounded-md text-xs font-bold bg-slate-100 border border-slate-300 text-slate-800 uppercase tracking-wide">
                  {reportPeriod === 'MONTHLY'
                    ? `আয় ও ব্যয়ের মাসিক আর্থিক বিবরণী (মাস: ${selectedReportMonth}/${selectedReportYear})`
                    : `বার্ষিক আর্থিক আয়-ব্যয় ও উদ্বৃত্ত বিবরণী (অর্থবছর: ${selectedReportYear})`}
                </div>
              </div>

              {/* High Level Financial Summary Cards */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block">মোট সংগৃহীত আয় (Total Income)</span>
                  <span className="text-xl font-black font-mono text-emerald-950 mt-1 block">
                    {formatTaka(reportIncomeTotal)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-xs text-rose-800 font-semibold block">মোট পরিশোধিত ব্যয় (Total Expense)</span>
                  <span className="text-xl font-black font-mono text-rose-950 mt-1 block">
                    {formatTaka(reportExpenseTotal)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-xs text-blue-800 font-semibold block">নিট স্থিতি / উদ্বৃত্ত (Net Surplus)</span>
                  <span className={`text-xl font-black font-mono mt-1 block ${reportNetBalance >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {formatTaka(reportNetBalance)}
                  </span>
                </div>
              </div>

              {/* Two Column Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Side */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-emerald-700 text-white font-bold text-xs flex justify-between">
                    <span>আয়ের খাতসমূহ (Income Particulars)</span>
                    <span>পরিমাণ (টাকা)</span>
                  </div>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {[
                        IncomeCategory.STUDENT_FEES,
                        IncomeCategory.ADMISSION,
                        IncomeCategory.DONATIONS,
                        IncomeCategory.GRANTS,
                        IncomeCategory.OTHER_INCOME,
                      ].map((cat) => {
                        const catTxs = reportTransactions.filter(
                          (t) => t.type === TransactionType.INCOME && t.category === cat
                        );
                        const catAmt = catTxs.reduce((sum, t) => sum + t.amount, 0);

                        return (
                          <tr key={cat} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-700 font-medium">
                              {INCOME_CATEGORY_LABELS[cat]?.bn || cat}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                              {formatTaka(catAmt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50/80 font-bold border-t border-emerald-200">
                        <td className="py-2.5 px-3 text-emerald-950">সর্বমোট আয়:</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-950 font-black">
                          {formatTaka(reportIncomeTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Expense Side */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-rose-700 text-white font-bold text-xs flex justify-between">
                    <span>ব্যয়ের খাতসমূহ (Expense Particulars)</span>
                    <span>পরিমাণ (টাকা)</span>
                  </div>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {[
                        ExpenseCategory.SALARY,
                        ExpenseCategory.ELECTRICITY,
                        ExpenseCategory.FOOD,
                        ExpenseCategory.EDUCATION,
                        ExpenseCategory.MAINTENANCE,
                        ExpenseCategory.TRANSPORT,
                        ExpenseCategory.EVENTS,
                        ExpenseCategory.MAHFIL,
                        ExpenseCategory.OTHER,
                      ].map((cat) => {
                        const catTxs = reportTransactions.filter(
                          (t) => t.type === TransactionType.EXPENSE && t.category === cat
                        );
                        const catAmt = catTxs.reduce((sum, t) => sum + t.amount, 0);

                        return (
                          <tr key={cat} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-700 font-medium">
                              {EXPENSE_CATEGORY_LABELS[cat]?.bn || cat}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-800">
                              {formatTaka(catAmt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-rose-50/80 font-bold border-t border-rose-200">
                        <td className="py-2.5 px-3 text-rose-950">সর্বমোট ব্যয়:</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-950 font-black">
                          {formatTaka(reportExpenseTotal)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-16 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
                <div>
                  <div className="border-t border-slate-400 mx-auto w-32 mb-1.5"></div>
                  <p className="font-bold text-slate-800">হিসাবরক্ষক</p>
                  <p className="text-[10px] text-slate-400">Accountant</p>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-auto w-32 mb-1.5"></div>
                  <p className="font-bold text-slate-800">নিরীক্ষক / অডিটর</p>
                  <p className="text-[10px] text-slate-400">Internal Auditor</p>
                </div>
                <div>
                  <div className="border-t border-slate-400 mx-auto w-32 mb-1.5"></div>
                  <p className="font-bold text-slate-800">মুহতামিম / অধ্যক্ষ</p>
                  <p className="text-[10px] text-slate-400">Principal / Rector</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Integrations */}
      <IncomeEntryModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        accounts={accounts}
        funds={funds}
        onSuccess={handleTransactionCreated}
      />

      <ExpenseEntryModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        accounts={accounts}
        funds={funds}
        onSuccess={handleTransactionCreated}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        funds={funds}
        onSuccess={handleTransactionCreated}
      />

      <DailyClosingModal
        isOpen={isDailyClosingModalOpen}
        onClose={() => setIsDailyClosingModalOpen(false)}
        accounts={accounts}
        transactions={transactions}
        onSuccess={handleDailyClosingSuccess}
      />

      <NewAccountFundModal
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        defaultMode={newAccountFundMode}
        onAccountCreated={handleAccountCreated}
        onFundCreated={handleFundCreated}
      />

      <VoucherPrintModal
        transaction={selectedVoucher}
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
      />

      <VoidTransactionModal
        transaction={transactionToVoid}
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        onSuccess={handleTransactionVoided}
      />
    </div>
  );
};
