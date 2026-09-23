import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  CreditCard,
  Receipt,
  Calendar,
  Search,
  Filter,
  Plus,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  FileText,
  Layers,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Edit,
  ArrowRight,
  ChevronDown,
  Sparkles,
  TrendingUp,
  X,
  Ban,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PrintableMoneyReceipt } from './components/PrintableMoneyReceipt';
import { VoidReceiptModal } from './components/VoidReceiptModal';
import {
  StudentFeeEntity,
  FeePaymentRecord,
  ClassFeeStructure,
  StudentLedgerEntry,
  FeeStatus,
  FeeCategory,
  PaymentMethod,
  StudentEntity,
  ClassEntity,
  RoleType,
} from '../../types';

// Category mapping helper
export const FEE_CATEGORY_LABELS: Record<string, { bn: string; en: string }> = {
  [FeeCategory.ADMISSION]: { bn: 'ভর্তি ফি', en: 'Admission Fee' },
  [FeeCategory.MONTHLY]: { bn: 'মাসিক বেতন / টিউশন ফি', en: 'Monthly Tuition' },
  [FeeCategory.EXAMINATION]: { bn: 'পরীক্ষা ফি', en: 'Examination Fee' },
  [FeeCategory.SESSION]: { bn: 'সেশন ফি', en: 'Session Charge' },
  [FeeCategory.DEVELOPMENT]: { bn: 'উন্নয়ন ফি', en: 'Development Fee' },
  [FeeCategory.SPECIAL]: { bn: 'বিশেষ ফি', en: 'Special Fee' },
  [FeeCategory.BOARDING]: { bn: 'বোর্ডিং / খানা ফি', en: 'Boarding Fee' },
  [FeeCategory.HOSTEL]: { bn: 'হোস্টেল ও লজিং চার্জ', en: 'Hostel Fee' },
  [FeeCategory.OTHER]: { bn: 'অন্যান্য বিবিধ ফি', en: 'Other Fee' },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'ক্যাশ কাউন্টার (নগদ)',
  [PaymentMethod.BKASH]: 'বিকাশ (bKash)',
  [PaymentMethod.NAGAD]: 'নগদ (Nagad)',
  [PaymentMethod.ROCKET]: 'রকেট (Rocket)',
  [PaymentMethod.BANK_TRANSFER]: 'ব্যাংক ট্রান্সফার',
  [PaymentMethod.CHEQUE]: 'চেক (Cheque)',
};

export const FeeCollectionDashboard: React.FC = () => {
  const { tenant, user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'collection' | 'history' | 'ledger' | 'structures' | 'billing'>('collection');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [fees, setFees] = useState<StudentFeeEntity[]>([]);
  const [payments, setPayments] = useState<FeePaymentRecord[]>([]);
  const [structures, setStructures] = useState<ClassFeeStructure[]>([]);
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Ledger state
  const [selectedStudentForLedger, setSelectedStudentForLedger] = useState<string>('');
  const [studentLedgers, setStudentLedgers] = useState<StudentLedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState<boolean>(false);

  // Modals state
  const [paymentModalFee, setPaymentModalFee] = useState<StudentFeeEntity | null>(null);
  const [receiptModalPayment, setReceiptModalPayment] = useState<FeePaymentRecord | null>(null);
  const [receiptToVoid, setReceiptToVoid] = useState<FeePaymentRecord | null>(null);
  const [isAssignFeeModalOpen, setIsAssignFeeModalOpen] = useState<boolean>(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState<boolean>(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // New Student-Specific Fee Form
  const [newFeeStudentId, setNewFeeStudentId] = useState<string>('');
  const [newFeeCategory, setNewFeeCategory] = useState<FeeCategory>(FeeCategory.MONTHLY);
  const [newFeeName, setNewFeeName] = useState<string>('');
  const [newFeeMonthYear, setNewFeeMonthYear] = useState<string>('ফেব্রুয়ারি ২০২৫');
  const [newFeeOriginalAmount, setNewFeeOriginalAmount] = useState<number>(1500);
  const [newFeeDiscount, setNewFeeDiscount] = useState<number>(0);
  const [newFeeDueDate, setNewFeeDueDate] = useState<string>('2025-02-28');
  const [newFeeNotes, setNewFeeNotes] = useState<string>('');

  // Class Fee Structure Form
  const [structClassId, setStructClassId] = useState<string>('');
  const [structCategory, setStructCategory] = useState<FeeCategory>(FeeCategory.MONTHLY);
  const [structFeeName, setStructFeeName] = useState<string>('');
  const [structAmount, setStructAmount] = useState<number>(1500);
  const [structFrequency, setStructFrequency] = useState<'ONE_TIME' | 'MONTHLY' | 'PER_EXAM' | 'YEARLY'>('MONTHLY');

  // Monthly Billing Form
  const [billingMonthYear, setBillingMonthYear] = useState<string>('মার্চ ২০২৫');
  const [billingClassId, setBillingClassId] = useState<string>('ALL');
  const [billingDueDate, setBillingDueDate] = useState<string>('2025-03-10');
  const [isGeneratingBilling, setIsGeneratingBilling] = useState<boolean>(false);

  const canManageFees = user?.role === RoleType.SUPER_ADMIN || user?.role === RoleType.INSTITUTION_ADMIN || user?.role === RoleType.ACCOUNTANT;

  // Load all foundational data
  const loadData = async () => {
    setLoading(true);
    try {
      const [feesRes, paymentsRes, structRes, studentsRes, classesRes] = await Promise.all([
        api.getFees(),
        api.getFeePayments(),
        api.getClassFeeStructures(),
        api.getStudents(),
        api.getClasses(),
      ]);

      if (feesRes.success && feesRes.data) setFees(feesRes.data);
      if (paymentsRes.success && paymentsRes.data) setPayments(paymentsRes.data);
      if (structRes.success && structRes.data) setStructures(structRes.data);
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data);
        if (studentsRes.data.length > 0 && !selectedStudentForLedger) {
          setSelectedStudentForLedger(studentsRes.data[0].id);
        }
      }
      if (classesRes.success && classesRes.data) setClasses(classesRes.data);
    } catch (err: any) {
      showToast(err.message || 'ডাটা লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant?.id]);

  // Load Ledger when student changes
  useEffect(() => {
    if (!selectedStudentForLedger) return;
    const fetchLedger = async () => {
      setLedgerLoading(true);
      try {
        const res = await api.getStudentLedger(selectedStudentForLedger);
        if (res.success && res.data) {
          setStudentLedgers(res.data);
        }
      } catch (err: any) {
        console.error('Ledger error:', err);
      } finally {
        setLedgerLoading(false);
      }
    };
    fetchLedger();
  }, [selectedStudentForLedger]);

  // Overall Financial Metrics
  const metrics = useMemo(() => {
    let totalInvoiced = 0;
    let totalDiscount = 0;
    let totalPaid = 0;
    let totalDue = 0;

    fees.forEach((f) => {
      totalInvoiced += f.originalAmount || 0;
      totalDiscount += f.waiverDiscount || 0;
      totalPaid += f.paidAmount || 0;
      totalDue += f.dueAmount || 0;
    });

    const netPayableTotal = totalInvoiced - totalDiscount;
    const collectionRate = netPayableTotal > 0 ? Math.round((totalPaid / netPayableTotal) * 100) : 0;

    return {
      totalInvoiced,
      totalDiscount,
      totalPaid,
      totalDue,
      collectionRate,
    };
  }, [fees]);

  // Filtered Fees List
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const matchesSearch =
        fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(fee.studentRoll).includes(searchQuery) ||
        fee.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.feeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.monthYear.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClassFilter === 'ALL' || fee.className === selectedClassFilter || fee.classId === selectedClassFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || fee.status === selectedStatusFilter;
      const matchesCategory = selectedCategoryFilter === 'ALL' || fee.feeCategory === selectedCategoryFilter;

      return matchesSearch && matchesClass && matchesStatus && matchesCategory;
    });
  }, [fees, searchQuery, selectedClassFilter, selectedStatusFilter, selectedCategoryFilter]);

  // Handle open payment modal
  const handleOpenPayment = (fee: StudentFeeEntity) => {
    setPaymentModalFee(fee);
    setPaymentAmount(String(fee.dueAmount));
    setPaymentMethod(PaymentMethod.CASH);
    setPaymentRef('');
    setPaymentNotes('');
  };

  // Submit Payment with atomic transaction
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalFee) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('সঠিক টাকার পরিমাণ লিখুন', 'error');
      return;
    }
    if (amount > paymentModalFee.dueAmount) {
      showToast(`পরিশোধের পরিমাণ বকেয়া (৳${paymentModalFee.dueAmount})-এর চেয়ে বেশি হতে পারে না`, 'error');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await api.processFeePayment({
        feeId: paymentModalFee.id,
        amountPaid: amount,
        paymentMethod,
        transactionRef: paymentRef,
        notes: paymentNotes,
      });

      if (res.success && res.data) {
        showToast(res.message || 'পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে!', 'success');
        setPaymentModalFee(null);
        await loadData();
        // Prompt receipt view
        setReceiptModalPayment(res.data.payment);
      } else {
        showToast(res.error?.message || 'পেমেন্ট প্রক্রিয়াকরণে ত্রুটি', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'পেমেন্ট প্রক্রিয়াকরণে ত্রুটি', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Submit new student-specific fee
  const handleCreateStudentFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeStudentId) {
      showToast('অনুগ্রহ করে শিক্ষার্থী নির্বাচন করুন', 'error');
      return;
    }
    const student = students.find((s) => s.id === newFeeStudentId);
    if (!student) {
      showToast('শিক্ষার্থী পাওয়া যায়নি', 'error');
      return;
    }

    try {
      const res = await api.createStudentFee({
        studentId: student.id,
        studentName: student.nameBangla || student.nameEnglish,
        studentRoll: student.rollNo || 0,
        className: student.className || '',
        classId: student.classId,
        feeType: newFeeName || FEE_CATEGORY_LABELS[newFeeCategory]?.bn || 'মাসিক ফি',
        feeCategory: newFeeCategory,
        monthYear: newFeeMonthYear,
        originalAmount: Number(newFeeOriginalAmount),
        waiverDiscount: Number(newFeeDiscount) || 0,
        dueDate: newFeeDueDate,
        notes: newFeeNotes,
      });

      if (res.success) {
        showToast('শিক্ষার্থী ফি সফলভাবে নির্ধারণ করা হয়েছে!', 'success');
        setIsAssignFeeModalOpen(false);
        await loadData();
      } else {
        showToast(res.error?.message || 'ফি তৈরিতে ত্রুটি', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ফি তৈরিতে ত্রুটি', 'error');
    }
  };

  // Submit new class fee structure
  const handleCreateClassFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structClassId) {
      showToast('শ্রেণি নির্বাচন করুন', 'error');
      return;
    }
    const cls = classes.find((c) => c.id === structClassId);
    if (!cls) return;

    try {
      const res = await api.createClassFeeStructure({
        classId: cls.id,
        className: cls.nameBangla,
        feeCategory: structCategory,
        feeName: structFeeName || FEE_CATEGORY_LABELS[structCategory]?.bn || 'ফি',
        amount: Number(structAmount),
        frequency: structFrequency,
        description: `${cls.nameBangla} এর জন্য নির্ধারিত ফি কাঠামো`,
      });

      if (res.success) {
        showToast('শ্রেণিভিত্তিক ফি কাঠামো সংরক্ষিত হয়েছে!', 'success');
        setIsStructureModalOpen(false);
        await loadData();
      } else {
        showToast(res.error?.message || 'সংরক্ষণে ব্যর্থ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'সংরক্ষণে ব্যর্থ', 'error');
    }
  };

  // Run Monthly Billing Generator
  const handleGenerateMonthlyBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingBilling(true);
    try {
      const res = await api.generateMonthlyBilling({
        monthYear: billingMonthYear,
        classId: billingClassId,
        dueDate: billingDueDate,
      });

      if (res.success && res.data) {
        showToast(res.data.message, 'success');
        setIsBillingModalOpen(false);
        await loadData();
      } else {
        showToast(res.error?.message || 'বিল জেনারেশনে ত্রুটি', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'বিল জেনারেশনে ত্রুটি', 'error');
    } finally {
      setIsGeneratingBilling(false);
    }
  };

  // Student details for ledger view
  const currentLedgerStudent = students.find((s) => s.id === selectedStudentForLedger);
  const ledgerStudentFees = fees.filter((f) => f.studentId === selectedStudentForLedger);
  const studentTotalInvoiced = ledgerStudentFees.reduce((acc, curr) => acc + curr.originalAmount, 0);
  const studentTotalWaiver = ledgerStudentFees.reduce((acc, curr) => acc + curr.waiverDiscount, 0);
  const studentTotalPaid = ledgerStudentFees.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const studentTotalDue = ledgerStudentFees.reduce((acc, curr) => acc + curr.dueAmount, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                ফি ব্যবস্থাপনা ও শিক্ষার্থী লেজার
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                শ্রেণিভিত্তিক ফি কাঠামো, ডুপ্লিকেট পেমেন্ট প্রতিরোধ, শিক্ষার্থী লেজার এবং মানিরিসিপ্ট
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageFees && (
            <>
              <button
                id="btn-open-billing-modal"
                onClick={() => setIsBillingModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                মাসিক বিল জেনারেশন
              </button>
              <button
                id="btn-open-assign-fee"
                onClick={() => setIsAssignFeeModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                শিক্ষার্থী ফি নির্ধারণ
              </button>
            </>
          )}
          <button
            id="btn-refresh-fees"
            onClick={loadData}
            className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard (Clearly shows Total, Discount, Paid, Due) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Invoiced */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              সর্বমোট ধার্য (Total)
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              ৳{metrics.totalInvoiced.toLocaleString()}
            </span>
            <p className="text-xs text-slate-500 mt-1">সব জামাত ও সেশনের মূল মোট বিল</p>
          </div>
        </div>

        {/* Total Discount/Waiver */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              মোট ছাড় ও ওয়েভার (Discount)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ৳{metrics.totalDiscount.toLocaleString()}
            </span>
            <p className="text-xs text-slate-500 mt-1">মেধা বৃত্তি ও এতিম কোটা ছাড়</p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              মোট আদায়কৃত (Paid)
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ৳{metrics.totalPaid.toLocaleString()}
            </span>
            <p className="text-xs text-slate-500 mt-1">ক্যাশ ও ডিজিটাল পেমেন্ট জমা</p>
          </div>
        </div>

        {/* Total Due */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              সর্বমোট বকেয়া (Due)
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ৳{metrics.totalDue.toLocaleString()}
            </span>
            <p className="text-xs text-slate-500 mt-1">অবশিষ্ট আদায়যোগ্য অর্থ</p>
          </div>
        </div>

        {/* Collection Efficiency */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              আদায়ের হার (Rate)
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {metrics.collectionRate}%
              </span>
              <span className="text-xs text-slate-500">পরিশোধিত</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.collectionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          <button
            id="tab-btn-collection"
            onClick={() => setActiveTab('collection')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'collection'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            ফি আদায় ও বকেয়া তালিকা
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'collection' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {fees.length}
            </span>
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <Receipt className="w-4 h-4" />
            পেমেন্ট ইতিহাস ও মানিরিসিপ্ট
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'history' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {payments.length}
            </span>
          </button>

          <button
            id="tab-btn-ledger"
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ledger'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <FileText className="w-4 h-4" />
            শিক্ষার্থী লেজার বিবরণী
          </button>

          <button
            id="tab-btn-structures"
            onClick={() => setActiveTab('structures')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'structures'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <Layers className="w-4 h-4" />
            শ্রেণিভিত্তিক ফি কাঠামো
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'structures' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {structures.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Fee Collection & Dues List */}
      {activeTab === 'collection' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-fee-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিক্ষার্থীর নাম, রোল বা জামাত খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Class Filter */}
              <select
                id="select-class-filter"
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">সকল জামাত / শ্রেণি</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.nameBangla}>
                    {c.nameBangla}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                id="select-status-filter"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value={FeeStatus.UNPAID}>বকেয়া (Unpaid)</option>
                <option value={FeeStatus.PARTIAL}>আংশিক পরিশোধ (Partial)</option>
                <option value={FeeStatus.PAID}>পরিশোধিত (Paid)</option>
                <option value={FeeStatus.WAIVED}>মওকুফ (Waived)</option>
              </select>

              {/* Fee Category Filter */}
              <select
                id="select-category-filter"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">সকল ফি ক্যাটাগরি</option>
                {Object.entries(FEE_CATEGORY_LABELS).map(([cat, label]) => (
                  <option key={cat} value={cat}>
                    {label.bn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table with Explicit Columns: Total, Discount, Paid, Due */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">শিক্ষার্থীর তথ্য</th>
                    <th className="px-4 py-3.5">ফি বিবরণ ও মাস</th>
                    <th className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">মোট (Total)</th>
                    <th className="px-4 py-3.5 text-right font-bold text-amber-700 dark:text-amber-400">ছাড় (Discount)</th>
                    <th className="px-4 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">পরিশোধ (Paid)</th>
                    <th className="px-4 py-3.5 text-right font-bold text-rose-700 dark:text-rose-400">বকেয়া (Due)</th>
                    <th className="px-4 py-3.5 text-center">স্ট্যাটাস</th>
                    <th className="px-4 py-3.5 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                        কোনো ফি রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => {
                      const isFullyPaid = fee.status === FeeStatus.PAID;
                      const isWaived = fee.status === FeeStatus.WAIVED;
                      return (
                        <tr key={fee.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {fee.studentName}
                            </div>
                            <div className="text-xs text-slate-500">
                              রোল: {fee.studentRoll} | {fee.className}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {fee.feeType}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[11px]">
                                {fee.monthYear}
                              </span>
                              {fee.dueDate && (
                                <span className="text-[11px] text-slate-400">মেয়াদ: {fee.dueDate}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-900 dark:text-white">
                            ৳{fee.originalAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-amber-600 dark:text-amber-400">
                            {fee.waiverDiscount > 0 ? `৳${fee.waiverDiscount.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            ৳{fee.paidAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            ৳{fee.dueAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {fee.status === FeeStatus.PAID && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                <CheckCircle className="w-3 h-3" /> পরিশোধিত
                              </span>
                            )}
                            {fee.status === FeeStatus.PARTIAL && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                <Clock className="w-3 h-3" /> আংশিক পরিশোধ
                              </span>
                            )}
                            {fee.status === FeeStatus.UNPAID && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                                <AlertCircle className="w-3 h-3" /> বকেয়া
                              </span>
                            )}
                            {fee.status === FeeStatus.WAIVED && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
                                <Sparkles className="w-3 h-3" /> সম্পূর্ণ মওকুফ
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {!isFullyPaid && !isWaived && canManageFees && (
                                <button
                                  id={`btn-collect-fee-${fee.id}`}
                                  onClick={() => handleOpenPayment(fee)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                                >
                                  <Wallet className="w-3.5 h-3.5" />
                                  ফি আদায়
                                </button>
                              )}
                              <button
                                id={`btn-view-ledger-${fee.id}`}
                                onClick={() => {
                                  setSelectedStudentForLedger(fee.studentId);
                                  setActiveTab('ledger');
                                }}
                                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1"
                                title="লেজার বিবরণী দেখুন"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                লেজার
                              </button>
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
        </div>
      )}

      {/* TAB 2: Payment History & Receipts */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  সম্পূর্ণ পেমেন্ট লেনদেন ইতিহাস
                </h3>
                <p className="text-xs text-slate-500">
                  প্রত্যেকটি সফল পেমেন্টের অপরিবর্তনযোগ্য হিসাব ও মানিরিসিপ্ট
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ডাটাবেজ ট্রানজেকশন দ্বারা সুরক্ষিত ও অডিটেড
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">রশিদ নং (Receipt No)</th>
                    <th className="px-4 py-3.5">তারিখ ও সময়</th>
                    <th className="px-4 py-3.5">শিক্ষার্থীর নাম ও জামাত</th>
                    <th className="px-4 py-3.5">পেমেন্ট মাধ্যম</th>
                    <th className="px-4 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">পরিশোধের পরিমাণ</th>
                    <th className="px-4 py-3.5 text-right font-bold text-rose-700 dark:text-rose-400">অবশিষ্ট বকেয়া</th>
                    <th className="px-4 py-3.5">গ্রহণকারী</th>
                    <th className="px-4 py-3.5 text-center">মানিরিসিপ্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                        এখনো কোনো পেমেন্ট রেকর্ড করা হয়নি
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => {
                      const isVoid = p.status === 'VOIDED';
                        const isReprint = (p.reprintCount || 0) > 0;
                        const canVoid =
                          !isVoid &&
                          user &&
                          [
                            RoleType.SUPER_ADMIN,
                            RoleType.INSTITUTION_ADMIN,
                            RoleType.MUHTAMIM,
                            RoleType.ACCOUNTANT,
                          ].includes(user.role as RoleType);

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors ${
                              isVoid ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                            }`}
                          >
                            <td className="px-4 py-3.5 font-mono font-bold">
                              <div className="flex items-center gap-1.5">
                                <span className={isVoid ? 'text-rose-600 line-through' : 'text-indigo-600 dark:text-indigo-400'}>
                                  {p.receiptNo}
                                </span>
                                {isVoid && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-sans font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                    বাতিল
                                  </span>
                                )}
                                {isReprint && !isVoid && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-sans font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                    #{p.reprintCount}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                              {p.paymentDate}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {p.studentName}
                              </div>
                              <div className="text-xs text-slate-500">
                                রোল: {p.studentRoll || '—'} | {p.className}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-200">
                                {PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod}
                              </span>
                              {p.transactionRef && (
                                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                                  Trx: {p.transactionRef}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ৳{p.amountPaid.toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                              ৳{p.remainingDue.toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                              {p.receivedBy}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  id={`btn-view-receipt-${p.id}`}
                                  onClick={() => setReceiptModalPayment(p)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                  রশিদ
                                </button>
                                {canVoid && (
                                  <button
                                    id={`btn-void-receipt-${p.id}`}
                                    onClick={() => setReceiptToVoid(p)}
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
        </div>
      )}

      {/* TAB 3: Student Ledger Statement */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Student Selector Card */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div className="w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  শিক্ষার্থী নির্বাচন করুন (Select Student)
                </label>
                <select
                  id="select-student-for-ledger"
                  value={selectedStudentForLedger}
                  onChange={(e) => setSelectedStudentForLedger(e.target.value)}
                  className="mt-1 block w-full md:w-80 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBangla || s.nameEnglish} (রোল: {s.rollNo} - {s.className})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentLedgerStudent && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] text-slate-500">মোট ধার্য (Total)</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    ৳{studentTotalInvoiced.toLocaleString()}
                  </div>
                </div>
                <div className="bg-amber-50/60 dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">মোট ছাড় (Discount)</div>
                  <div className="font-mono font-bold text-amber-700 dark:text-amber-400">
                    ৳{studentTotalWaiver.toLocaleString()}
                  </div>
                </div>
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">মোট পরিশোধ (Paid)</div>
                  <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    ৳{studentTotalPaid.toLocaleString()}
                  </div>
                </div>
                <div className="bg-rose-50/60 dark:bg-rose-950/30 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800">
                  <div className="text-[11px] text-rose-700 dark:text-rose-400">বর্তমান বকেয়া (Due)</div>
                  <div className="font-mono font-bold text-rose-700 dark:text-rose-400">
                    ৳{studentTotalDue.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  শিক্ষার্থী আর্থিক খতিয়ান বিবরণী (Student Financial Ledger)
                </h3>
                <p className="text-xs text-slate-500">
                  ধার্যকৃত ফি (ডেবিট) ও জমা দেওয়া পেমেন্ট/ছাড় (ক্রেডিট)-এর পুঙ্খানুপুঙ্খ হিসাব
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                স্টেটমেন্ট প্রিন্ট
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">তারিখ</th>
                    <th className="px-4 py-3.5">বিবরণ (Description)</th>
                    <th className="px-4 py-3.5">লেনদেনের ধরণ</th>
                    <th className="px-4 py-3.5 text-right font-bold text-rose-700 dark:text-rose-400">ডেবিট / ধার্য (Debit)</th>
                    <th className="px-4 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">ক্রেডিট / জমা (Credit)</th>
                    <th className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">জের / বকেয়া ব্যালান্স (Balance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {ledgerLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        লেজার বিবরণী লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : studentLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        এই শিক্ষার্থীর কোনো লেজার লেনদেন পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    studentLedgers.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                          {l.date}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-900 dark:text-white">
                          {l.description}
                        </td>
                        <td className="px-4 py-3.5">
                          {l.type === 'FEE_CHARGED' && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-medium">
                              ফি ধার্য (ইনভয়েস)
                            </span>
                          )}
                          {l.type === 'PAYMENT_RECEIVED' && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium">
                              পেমেন্ট গৃহীত
                            </span>
                          )}
                          {l.type === 'WAIVER_APPLIED' && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-medium">
                              ছাড় / ওয়েভার কর্তন
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                          {l.debit > 0 ? `৳${l.debit.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {l.credit > 0 ? `৳${l.credit.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ৳{l.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Class Fee Structures */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                শ্রেণি ও বিভাগভিত্তিক ফি কাঠামো কনফিগারেশন
              </h3>
              <p className="text-xs text-slate-500">
                ভর্তি, মাসিক বেতন, পরীক্ষা, সেশন, উন্নয়ন, বিশেষ, বোর্ডিং ও হোস্টেল ফি তালিকা
              </p>
            </div>
            {canManageFees && (
              <button
                id="btn-add-structure"
                onClick={() => setIsStructureModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                নতুন ফি কাঠামো যুক্ত করুন
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {structures.map((s) => (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {s.className}
                    </span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">
                      {s.frequency}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-lg mt-2">
                    {s.feeName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    ক্যাটাগরি: {FEE_CATEGORY_LABELS[s.feeCategory]?.bn || s.feeCategory}
                  </p>
                  {s.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">নির্ধারিত ফি:</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ৳{s.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Payment Processing Modal */}
      {paymentModalFee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <h3 className="font-bold text-lg">ফি আদায় ও রশিদ জেনারেশন</h3>
              </div>
              <button
                onClick={() => setPaymentModalFee(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
              {/* Fee Details Banner showing Total, Discount, Paid, Due */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">শিক্ষার্থী:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {paymentModalFee.studentName} (রোল: {paymentModalFee.studentRoll})
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">জামাত ও ফি:</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {paymentModalFee.className} - {paymentModalFee.feeType}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[11px] text-slate-500">মোট ধার্য</div>
                    <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      ৳{paymentModalFee.originalAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-amber-600">ছাড়/ওয়েভার</div>
                    <div className="font-mono font-bold text-xs text-amber-600">
                      ৳{paymentModalFee.waiverDiscount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-emerald-600">পূর্বে পরিশোধ</div>
                    <div className="font-mono font-bold text-xs text-emerald-600">
                      ৳{paymentModalFee.paidAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-rose-600 font-bold">অবশিষ্ট বকেয়া</div>
                    <div className="font-mono font-bold text-sm text-rose-600">
                      ৳{paymentModalFee.dueAmount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পরিশোধের পরিমাণ (টাকা) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    id="input-payment-amount"
                    type="number"
                    min="1"
                    max={paymentModalFee.dueAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Quick Fill Buttons */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(String(paymentModalFee.dueAmount))}
                    className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 font-medium"
                  >
                    সম্পূর্ণ বকেয়া (৳{paymentModalFee.dueAmount})
                  </button>
                  {paymentModalFee.dueAmount > 500 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount('500')}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded dark:bg-slate-700 dark:text-slate-200"
                    >
                      ৳৫০০
                    </button>
                  )}
                  {paymentModalFee.dueAmount > 1000 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount('1000')}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded dark:bg-slate-700 dark:text-slate-200"
                    >
                      ৳১,০০০
                    </button>
                  )}
                </div>

                {/* Live remaining due calculation */}
                {Number(paymentAmount) > 0 && (
                  <div className="text-xs text-slate-500 mt-2 flex justify-between bg-slate-100 dark:bg-slate-900 p-2 rounded">
                    <span>এই পেমেন্টের পর অবশিষ্ট বকেয়া থাকবে:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      ৳{Math.max(0, paymentModalFee.dueAmount - Number(paymentAmount))}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পেমেন্ট মাধ্যম (Payment Method) *
                </label>
                <select
                  id="select-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([method, label]) => (
                    <option key={method} value={method}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Ref (for bKash / Nagad / Bank) */}
              {paymentMethod !== PaymentMethod.CASH && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ট্রানজেকশন আইডি / রেফারেন্স নম্বর
                  </label>
                  <input
                    id="input-payment-ref"
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="যেমন: BK-89XN2710 বা চেক নম্বর"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  মন্তব্য / রিমার্কস (ঐচ্ছিক)
                </label>
                <input
                  id="input-payment-notes"
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="যেমন: অভিভাবক জনাব আহমেদ সরাসরি পরিশোধ করেছেন"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Security and Transaction Guarantee Badge */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>অটোমেটিক ডুপ্লিকেট পেমেন্ট প্রতিরোধ ও ডাটাবেজ ট্রানজেকশন নিশ্চিত করা হয়েছে</span>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalFee(null)}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button
                  id="btn-confirm-payment"
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      প্রক্রিয়াকরণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      পেমেন্ট নিশ্চিত করুন (৳{paymentAmount})
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Professional Printable Money Receipt & PDF Layout */}
      {receiptModalPayment && (
        <PrintableMoneyReceipt
          payment={receiptModalPayment}
          tenant={tenant}
          onClose={() => setReceiptModalPayment(null)}
          onPaymentUpdated={(updated) => {
            setReceiptModalPayment(updated);
            setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          }}
          onOpenVoidModal={(p) => {
            setReceiptModalPayment(null);
            setReceiptToVoid(p);
          }}
        />
      )}

      {/* MODAL 2.5: Void / Reversal Confirmation Modal */}
      {receiptToVoid && (
        <VoidReceiptModal
          payment={receiptToVoid}
          onClose={() => setReceiptToVoid(null)}
          onSuccess={async (voided) => {
            setReceiptToVoid(null);
            setPayments((prev) => prev.map((p) => (p.id === voided.id ? voided : p)));
            await loadData();
          }}
        />
      )}

      {/* MODAL 3: Assign Student-Specific Fee Modal */}
      {isAssignFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg">শিক্ষার্থী-নির্দিষ্ট ফি নির্ধারণ</h3>
              </div>
              <button
                onClick={() => setIsAssignFeeModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudentFee} className="p-6 space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শিক্ষার্থী নির্বাচন করুন *
                </label>
                <select
                  id="select-new-fee-student"
                  value={newFeeStudentId}
                  onChange={(e) => setNewFeeStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBangla || s.nameEnglish} (রোল: {s.rollNo} - {s.className})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ফি ক্যাটাগরি *
                  </label>
                  <select
                    id="select-new-fee-category"
                    value={newFeeCategory}
                    onChange={(e) => setNewFeeCategory(e.target.value as FeeCategory)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(FEE_CATEGORY_LABELS).map(([cat, label]) => (
                      <option key={cat} value={cat}>
                        {label.bn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মাস ও বছর *
                  </label>
                  <input
                    id="input-new-fee-month"
                    type="text"
                    value={newFeeMonthYear}
                    onChange={(e) => setNewFeeMonthYear(e.target.value)}
                    placeholder="যেমন: ফেব্রুয়ারি ২০২৫"
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Fee Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ফি এর নাম / শিরোনাম (ঐচ্ছিক)
                </label>
                <input
                  id="input-new-fee-title"
                  type="text"
                  value={newFeeName}
                  onChange={(e) => setNewFeeName(e.target.value)}
                  placeholder="খালি রাখলে ক্যাটাগরির নাম ব্যবহৃত হবে"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Original Amount & Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মূল ফি (টাকা) *
                  </label>
                  <input
                    id="input-new-fee-amount"
                    type="number"
                    min="1"
                    value={newFeeOriginalAmount}
                    onChange={(e) => setNewFeeOriginalAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ছাড় / ওয়েভার (টাকা)
                  </label>
                  <input
                    id="input-new-fee-discount"
                    type="number"
                    min="0"
                    max={newFeeOriginalAmount}
                    value={newFeeDiscount}
                    onChange={(e) => setNewFeeDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-amber-600"
                  />
                </div>
              </div>

              {/* Calculation Preview Banner showing Total, Discount, Paid, Due */}
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  হিসাব সারাংশ (Fee Calculation Summary)
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div>
                    <div className="text-slate-500">মোট ধার্য</div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      ৳{newFeeOriginalAmount}
                    </div>
                  </div>
                  <div>
                    <div className="text-amber-600">ছাড়/ওয়েভার</div>
                    <div className="font-bold text-amber-600">
                      ৳{newFeeDiscount}
                    </div>
                  </div>
                  <div>
                    <div className="text-emerald-600">পরিশোধ</div>
                    <div className="font-bold text-emerald-600">৳০</div>
                  </div>
                  <div>
                    <div className="text-rose-600 font-bold">প্রাথমিক বকেয়া</div>
                    <div className="font-bold text-rose-600">
                      ৳{Math.max(0, newFeeOriginalAmount - newFeeDiscount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পরিশোধের শেষ তারিখ (Due Date)
                </label>
                <input
                  id="input-new-fee-due-date"
                  type="date"
                  value={newFeeDueDate}
                  onChange={(e) => setNewFeeDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignFeeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button
                  id="btn-submit-student-fee"
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  ফি সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Class Fee Structure Modal */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg">নতুন শ্রেণিভিত্তিক ফি কাঠামো</h3>
              </div>
              <button
                onClick={() => setIsStructureModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClassFeeStructure} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শ্রেণি / জামাত নির্বাচন করুন *
                </label>
                <select
                  id="select-struct-class"
                  value={structClassId}
                  onChange={(e) => setStructClassId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- শ্রেণি নির্বাচন করুন --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBangla}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ফি ক্যাটাগরি *
                  </label>
                  <select
                    id="select-struct-category"
                    value={structCategory}
                    onChange={(e) => setStructCategory(e.target.value as FeeCategory)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {Object.entries(FEE_CATEGORY_LABELS).map(([cat, label]) => (
                      <option key={cat} value={cat}>
                        {label.bn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    আদায়ের পৌনঃপুনিকতা (Frequency)
                  </label>
                  <select
                    id="select-struct-frequency"
                    value={structFrequency}
                    onChange={(e) => setStructFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="MONTHLY">মাসিক (Monthly)</option>
                    <option value="ONE_TIME">এককালীন (One-Time)</option>
                    <option value="PER_EXAM">প্রতি পরীক্ষা (Per Exam)</option>
                    <option value="YEARLY">বার্ষিক (Yearly)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ফি এর নাম / বিবরণ *
                </label>
                <input
                  id="input-struct-name"
                  type="text"
                  value={structFeeName}
                  onChange={(e) => setStructFeeName(e.target.value)}
                  placeholder="যেমন: মাসিক টিউশন ও তালীম ফি"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  নির্ধারিত টাকার পরিমাণ (৳) *
                </label>
                <input
                  id="input-struct-amount"
                  type="number"
                  min="1"
                  value={structAmount}
                  onChange={(e) => setStructAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStructureModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button
                  id="btn-submit-structure"
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Monthly Batch Billing Generator Modal */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold text-lg">মাসিক ব্যাচ বিলিং জেনারেশন</h3>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateMonthlyBilling} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                এক ক্লিকে সকল শিক্ষার্থীর জন্য নির্ধারিত শ্রেণিভিত্তিক কাঠামো অনুযায়ী মাসিক বিল ও লেজার ইনভয়েস তৈরি হবে। ইতোমধ্যেই বিল তৈরি করা থাকলে স্বয়ংক্রিয়ভাবে বাদ দেওয়া হবে।
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  মাস ও বছর *
                </label>
                <input
                  id="input-billing-month"
                  type="text"
                  value={billingMonthYear}
                  onChange={(e) => setBillingMonthYear(e.target.value)}
                  placeholder="যেমন: মার্চ ২০২৫ বা রমাদান ১৪৪৬"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শ্রেণি নির্বাচন করুন *
                </label>
                <select
                  id="select-billing-class"
                  value={billingClassId}
                  onChange={(e) => setBillingClassId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">সকল শ্রেণি / পুরো প্রতিষ্ঠান</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBangla}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  পরিশোধের শেষ তারিখ (Due Date)
                </label>
                <input
                  id="input-billing-due-date"
                  type="date"
                  value={billingDueDate}
                  onChange={(e) => setBillingDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>শিক্ষার্থীদের প্রোফাইলে সেট করা স্কলারশিপ ও ওয়েভার স্বয়ংক্রিয়ভাবে ছাড় হিসেবে গণিত হবে।</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBillingModalOpen(false)}
                  disabled={isGeneratingBilling}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button
                  id="btn-confirm-billing"
                  type="submit"
                  disabled={isGeneratingBilling}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingBilling ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      বিল তৈরি হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      ব্যাচ বিলিং শুরু করুন
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
