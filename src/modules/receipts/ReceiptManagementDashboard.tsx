import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Ban,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  Plus,
  RefreshCw,
  Building2,
  CreditCard,
  User,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  FeePaymentRecord,
  StudentFeeEntity,
  StudentEntity,
  ClassEntity,
  PaymentMethod,
  RoleType,
} from '../../types';
import { formatTaka, toBengaliNumerals, formatDate } from '../../utils/format';
import { PAYMENT_METHOD_LABELS } from '../../constants';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PrintableMoneyReceipt } from '../fees/components/PrintableMoneyReceipt';
import { VoidReceiptModal } from '../fees/components/VoidReceiptModal';

export interface ReceiptManagementDashboardProps {
  onNavigate?: (module: string) => void;
}

export const ReceiptManagementDashboard: React.FC<ReceiptManagementDashboardProps> = ({ onNavigate }) => {
  const { tenant, user } = useAuth();
  const { showToast } = useToast();

  const [receipts, setReceipts] = useState<FeePaymentRecord[]>([]);
  const [fees, setFees] = useState<StudentFeeEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'VALID' | 'VOIDED'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  // Active Modals
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<FeePaymentRecord | null>(null);
  const [receiptToVoid, setReceiptToVoid] = useState<FeePaymentRecord | null>(null);
  const [isGenerateReceiptModalOpen, setIsGenerateReceiptModalOpen] = useState<boolean>(false);

  // Quick Generate Receipt Form States
  const [selectedFeeId, setSelectedFeeId] = useState<string>('');
  const [genAmountPaid, setGenAmountPaid] = useState<string>('');
  const [genPaymentMethod, setGenPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [genTrxRef, setGenTrxRef] = useState<string>('');
  const [genNotes, setGenNotes] = useState<string>('');
  const [isSubmittingGen, setIsSubmittingGen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receiptsRes, feesRes, classesRes, studentsRes] = await Promise.all([
        api.getFeePayments(),
        api.getFees(),
        api.getClasses(),
        api.getStudents(),
      ]);

      if (receiptsRes.success && receiptsRes.data) {
        setReceipts(receiptsRes.data);
      }
      if (feesRes.success && feesRes.data) {
        setFees(feesRes.data);
      }
      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data);
      }
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data);
      }
    } catch (err: any) {
      showToast('ডাটা লোড ত্রুটি', 'error', err.message || 'রশিদ তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalReceiptsCount = receipts.length;
    const validReceipts = receipts.filter((r) => r.status !== 'VOIDED');
    const voidedReceipts = receipts.filter((r) => r.status === 'VOIDED');

    const totalCollectedAmount = validReceipts.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
    const totalVoidedAmount = voidedReceipts.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayReceipts = validReceipts.filter((r) => r.paymentDate && r.paymentDate.startsWith(todayStr));
    const todayCollectedAmount = todayReceipts.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    return {
      totalReceiptsCount,
      validReceiptsCount: validReceipts.length,
      totalCollectedAmount,
      voidedReceiptsCount: voidedReceipts.length,
      totalVoidedAmount,
      todayReceiptsCount: todayReceipts.length,
      todayCollectedAmount,
    };
  }, [receipts]);

  // Filtered Receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          r.receiptNo?.toLowerCase().includes(q) ||
          r.studentName?.toLowerCase().includes(q) ||
          (r.studentRoll && String(r.studentRoll).includes(q)) ||
          r.className?.toLowerCase().includes(q) ||
          (r.transactionRef && r.transactionRef.toLowerCase().includes(q)) ||
          (r.receivedBy && r.receivedBy.toLowerCase().includes(q)) ||
          (r.feeType && r.feeType.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // 2. Class Filter
      if (selectedClass !== 'ALL' && r.className !== selectedClass) {
        return false;
      }

      // 3. Payment Method Filter
      if (selectedMethod !== 'ALL' && r.paymentMethod !== selectedMethod) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus === 'VALID' && r.status === 'VOIDED') {
        return false;
      }
      if (selectedStatus === 'VOIDED' && r.status !== 'VOIDED') {
        return false;
      }

      // 5. Date Range Filter
      if (dateRangeFilter !== 'ALL' && r.paymentDate) {
        const paymentDateObj = new Date(r.paymentDate.replace(' ', 'T'));
        const now = new Date();

        if (dateRangeFilter === 'TODAY') {
          const todayStr = now.toISOString().split('T')[0];
          if (!r.paymentDate.startsWith(todayStr)) return false;
        } else if (dateRangeFilter === 'WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (paymentDateObj < sevenDaysAgo) return false;
        } else if (dateRangeFilter === 'MONTH') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (paymentDateObj < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [receipts, searchQuery, selectedClass, selectedMethod, selectedStatus, dateRangeFilter]);

  // Handle Quick Generate Receipt Submit
  const handleGenerateReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId) {
      showToast('ফি নির্বাচন করুন', 'warning', 'যে ফি-এর বিপরীতে রশিদ করবেন তা সিলেক্ট করুন');
      return;
    }

    const feeToPay = fees.find((f) => f.id === selectedFeeId);
    if (!feeToPay) return;

    const amount = parseFloat(genAmountPaid);
    if (isNaN(amount) || amount <= 0 || amount > feeToPay.dueAmount) {
      showToast(
        'ভুল টাকার পরিমাণ',
        'error',
        `টাকার পরিমাণ অবশ্যই ১ থেকে বকেয়া ৳${feeToPay.dueAmount} এর মধ্যে হতে হবে।`
      );
      return;
    }

    try {
      setIsSubmittingGen(true);
      const res = await api.processFeePayment({
        feeId: feeToPay.id,
        amountPaid: amount,
        paymentMethod: genPaymentMethod,
        transactionRef: genTrxRef || undefined,
        notes: genNotes || undefined,
        receivedBy: user?.fullName || 'হিসাব শাখা',
      });

      if (res.success && res.data) {
        showToast(
          'রশিদ তৈরি সফল!',
          'success',
          res.message || `রশিদ #${res.data.payment.receiptNo} জেনারেট হয়েছে।`
        );
        setIsGenerateReceiptModalOpen(false);
        setSelectedFeeId('');
        setGenAmountPaid('');
        setGenTrxRef('');
        setGenNotes('');
        await loadData();
        // Immediately preview generated receipt
        setSelectedReceiptForPrint(res.data.payment);
      } else {
        showToast(
          'রশিদ তৈরিতে ব্যর্থ',
          'error',
          res.error?.message || 'পেমেন্ট প্রসেসিং সম্পন্ন হতে পারেনি'
        );
      }
    } catch (err: any) {
      showToast('ত্রুটি', 'error', err.message);
    } finally {
      setIsSubmittingGen(false);
    }
  };

  const handleReceiptUpdated = (updatedReceipt: FeePaymentRecord) => {
    setReceipts((prev) => prev.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r)));
    if (selectedReceiptForPrint?.id === updatedReceipt.id) {
      setSelectedReceiptForPrint(updatedReceipt);
    }
  };

  const handleVoidSuccess = async (voidedReceipt: FeePaymentRecord) => {
    handleReceiptUpdated(voidedReceipt);
    setReceiptToVoid(null);
    if (selectedReceiptForPrint?.id === voidedReceipt.id) {
      setSelectedReceiptForPrint(voidedReceipt);
    }
    await loadData();
  };

  const canVoid =
    user &&
    [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT].includes(
      user.role as RoleType
    );

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              পেশাদার রশিদ ব্যবস্থাপনা ও রেজিস্টার
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              অপরিবর্তনযোগ্য অডিট সিস্টেম
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            স্বতন্ত্র ইউনিক রশিদ নম্বর, রিপ্রিন্ট ট্র্যাকিং, রিভার্সাল অডিট এবং ৩-কপি মাদরাসা প্রিন্ট ভাউচার
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-refresh-receipts"
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            রিফ্রেশ
          </button>

          <button
            type="button"
            id="btn-print-receipt-register"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            রেজিস্টার প্রিন্ট
          </button>

          <button
            type="button"
            id="btn-open-generate-receipt-modal"
            onClick={() => setIsGenerateReceiptModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            নতুন রশিদ ইস্যু করুন
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Receipts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">মোট সংগৃহীত রশিদ</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {stats.totalReceiptsCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              (বৈধ: {stats.validReceiptsCount})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">সব জামাত ও শিক্ষাবর্ষ অন্তর্ভুক্ত</p>
        </div>

        {/* Card 2: Total Amount Collected */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">মোট সংগৃহীত অর্থ (Paid)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {formatTaka(stats.totalCollectedAmount)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">সফল ও নিরীক্ষিত রশিদের হিসাব</p>
        </div>

        {/* Card 3: Voided / Reversed Receipts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">বাতিল ও রিভার্সাল রশিদ</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
              {stats.voidedReceiptsCount}
            </span>
            <span className="text-xs text-rose-500 font-mono">
              ({formatTaka(stats.totalVoidedAmount)})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">লেজার ও একাউন্টিংয়ে স্বয়ংক্রিয় সমন্বিত</p>
        </div>

        {/* Card 4: Today's Receipts */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">আজকের সংগৃহীত রশিদ</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {stats.todayReceiptsCount} টি
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {formatTaka(stats.todayCollectedAmount)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">আজকের সক্রিয় ক্যাশ কাউন্টার সংগ্রহ</p>
        </div>
      </div>

      {/* 2. Advanced Search & Filtering Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Quick Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="input-search-receipts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="রশিদ নম্বর, শিক্ষার্থীর নাম, রোল বা Trx ID খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">সকল শ্রেণি / জামাত</option>
              {classes.map((c) => (
                <option key={c.id} value={c.nameBangla}>
                  {c.nameBangla}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">সকল পেমেন্ট মাধ্যম</option>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {String(v)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">সকল অবস্থা (Status)</option>
              <option value="VALID">শুধুমাত্র বৈধ (Valid)</option>
              <option value="VOIDED">বাতিলকৃত (Voided)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Badges */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">সময়সীমা:</span>
            <div className="flex items-center gap-1">
              {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDateRangeFilter(r)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    dateRangeFilter === r
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {r === 'ALL' && 'সবসময়'}
                  {r === 'TODAY' && 'আজকের রশিদ'}
                  {r === 'WEEK' && 'গত ৭ দিন'}
                  {r === 'MONTH' && 'চলতি মাস'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-500">
            মোট <strong>{filteredReceipts.length}</strong> টি রশিদ পাওয়া গেছে
          </div>
        </div>
      </div>

      {/* 3. Receipts Register Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              অফিসিয়াল মানিরিসিপ্ট রেজিস্টার
            </h3>
            <p className="text-xs text-slate-500">
              রশিদ নং ক্রমানুসারে সাজানো এবং রিপ্রিন্ট ও রিভার্সাল অডিটযুক্ত
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            অপরিবর্তনযোগ্য ঐতিহাসিক রেকর্ড
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase bg-slate-50 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">রশিদ নং (Receipt No)</th>
                <th className="px-4 py-3">তারিখ ও সময়</th>
                <th className="px-4 py-3">শিক্ষার্থীর নাম ও জামাত</th>
                <th className="px-4 py-3">ফি-এর খাত</th>
                <th className="px-4 py-3 text-right">আদায়কৃত অর্থ</th>
                <th className="px-4 py-3 text-right">অবশিষ্ট বকেয়া</th>
                <th className="px-4 py-3">পদ্ধতি ও Trx</th>
                <th className="px-4 py-3">আদায়কারী</th>
                <th className="px-4 py-3 text-center">অবস্থা (Status)</th>
                <th className="px-4 py-3 text-center print:hidden">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    রশিদ ডাটা লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    কোনো মানিরিসিপ্ট রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => {
                  const isVoid = r.status === 'VOIDED';
                  const isReprint = (r.reprintCount || 0) > 0;

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors ${
                        isVoid ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Receipt No */}
                      <td className="px-4 py-3 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className={isVoid ? 'text-rose-600 line-through' : 'text-indigo-600 dark:text-indigo-400'}>
                            {r.receiptNo}
                          </span>
                          {isReprint && !isVoid && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[10px] font-sans font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              title={`পুনঃমুদ্রণ হয়েছে ${r.reprintCount} বার`}
                            >
                              #{r.reprintCount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <div>{r.paymentDate?.split(' ')[0]}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {r.paymentDate?.split(' ')[1]?.substring(0, 5)}
                        </div>
                      </td>

                      {/* Student & Class */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          রোল #{toBengaliNumerals(r.studentRoll || 0) || '—'} • {r.className}
                        </div>
                      </td>

                      {/* Fee Type */}
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <div className="font-medium">{r.feeType || 'নিয়মিত ফি'}</div>
                        <div className="text-[10px] text-slate-400">{r.monthYear || 'চলতি সেশন'}</div>
                      </td>

                      {/* Paid Amount */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                        {formatTaka(r.amountPaid)}
                      </td>

                      {/* Due Amount */}
                      <td className="px-4 py-3 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                        {formatTaka(r.remainingDue)}
                      </td>

                      {/* Payment Method & Trx */}
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200">
                          {PAYMENT_METHOD_LABELS[r.paymentMethod] || r.paymentMethod}
                        </span>
                        {r.transactionRef && (
                          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                            Trx: {r.transactionRef}
                          </div>
                        )}
                      </td>

                      {/* Collector */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {r.receivedBy || 'হিসাব শাখা'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {isVoid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            <Ban className="w-3 h-3" /> বাতিলকৃত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="w-3 h-3" /> কার্যকর
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View & Print Button */}
                          <button
                            type="button"
                            id={`btn-view-receipt-${r.id}`}
                            onClick={() => setSelectedReceiptForPrint(r)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-colors"
                            title="রশিদ দেখুন ও প্রিন্ট করুন"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          {/* Void / Reversal Button */}
                          {!isVoid && canVoid && (
                            <button
                              type="button"
                              id={`btn-void-receipt-${r.id}`}
                              onClick={() => setReceiptToVoid(r)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 rounded-lg transition-colors"
                              title="রশিদ বাতিল ও সমন্বয় করুন"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Quick Generate Receipt Modal */}
      {isGenerateReceiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">নতুন রশিদ ইস্যু ও ফি সংগ্রহ</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateReceiptModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateReceiptSubmit} className="p-6 space-y-4">
              {/* Fee Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  বকেয়া ফি নির্বাচন করুন <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedFeeId}
                  onChange={(e) => {
                    const feeId = e.target.value;
                    setSelectedFeeId(feeId);
                    const selected = fees.find((f) => f.id === feeId);
                    if (selected) {
                      setGenAmountPaid(String(selected.dueAmount));
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- শিক্ষার্থী ও ফি নির্বাচন করুন --</option>
                  {fees
                    .filter((f) => f.dueAmount > 0)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.studentName} ({f.className}) — {f.feeType} [বকেয়া: {formatTaka(f.dueAmount)}]
                      </option>
                    ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  পরিশোধের পরিমাণ (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={genAmountPaid}
                  onChange={(e) => setGenAmountPaid(e.target.value)}
                  placeholder="যেমন: ১৫০০"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    পেমেন্ট মাধ্যম
                  </label>
                  <select
                    value={genPaymentMethod}
                    onChange={(e) => setGenPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={PaymentMethod.CASH}>নগদ ক্যাশ কাউন্টার</option>
                    <option value={PaymentMethod.BKASH}>বিকাশ (bKash)</option>
                    <option value={PaymentMethod.NAGAD}>নগদ (Nagad)</option>
                    <option value={PaymentMethod.ROCKET}>রকেট (Rocket)</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>ব্যাংক ডিপোজিট / ট্রান্সফার</option>
                    <option value={PaymentMethod.CHEQUE}>চেক (Cheque)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    ট্রানজেকশন রেফারেন্স / TrxID
                  </label>
                  <input
                    type="text"
                    value={genTrxRef}
                    onChange={(e) => setGenTrxRef(e.target.value)}
                    placeholder="যেমন: BK-89102X"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  রশিদ মন্তব্য / নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="যেমন: বিশেষ ছাড় পরবর্তী সম্পূর্ণ পরিশোধ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateReceiptModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGen}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingGen ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ইস্যু করা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-3.5 h-3.5" />
                      রশিদ জেনারেট ও প্রিন্ট করুন
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Printable 3-Copy Receipt View Modal */}
      {selectedReceiptForPrint && (
        <PrintableMoneyReceipt
          payment={selectedReceiptForPrint}
          tenant={tenant}
          onClose={() => setSelectedReceiptForPrint(null)}
          onPaymentUpdated={handleReceiptUpdated}
          onOpenVoidModal={(paymentToVoid) => {
            setSelectedReceiptForPrint(null);
            setReceiptToVoid(paymentToVoid);
          }}
        />
      )}

      {/* 6. Void / Reversal Confirmation Modal */}
      {receiptToVoid && (
        <VoidReceiptModal
          payment={receiptToVoid}
          onClose={() => setReceiptToVoid(null)}
          onSuccess={handleVoidSuccess}
        />
      )}
    </div>
  );
};
