import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  CreditCard,
  Building,
  User,
  ArrowRight,
  Send,
  Download,
  AlertCircle,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCheck,
  ShieldCheck,
  History,
  BarChart3,
  Search,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  SalaryPayrollEntity,
  StaffEntity,
  PaymentMethod,
  PayrollWorkflowStatus,
  DepartmentType,
  RoleType,
} from '../../types';
import { toBengaliNumerals, formatTaka } from '../../utils/format';
import { PrintableSalarySheet } from './PrintableSalarySheet';
import { PrintablePayslipModal } from './PrintablePayslipModal';
import { StaffSalaryHistoryModal } from './StaffSalaryHistoryModal';
import { StaffLoanManagementModal } from './StaffLoanManagementModal';
import { SalaryReportView } from './SalaryReportView';

export const StaffPayrollManagementView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState<SalaryPayrollEntity[]>([]);
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);

  // Filtering & Selection State
  const [selectedMonth, setSelectedMonth] = useState('2025-02');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PayrollWorkflowStatus>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayrollIds, setSelectedPayrollIds] = useState<string[]>([]);

  // Modals
  const [selectedPayslip, setSelectedPayslip] = useState<SalaryPayrollEntity | null>(null);
  const [selectedHistoryStaffId, setSelectedHistoryStaffId] = useState<string | null>(null);
  const [isSalarySheetOpen, setIsSalarySheetOpen] = useState(false);
  const [isLoanManagerOpen, setIsLoanManagerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Single Disburse Modal
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [disbursingPayroll, setDisbursingPayroll] = useState<SalaryPayrollEntity | null>(null);
  const [disburseForm, setDisburseForm] = useState({
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    accountName: 'ইসলামী ব্যাংক বাংলাদেশ (চলতি হিসাব: ২০৫০১৭৭...)',
    disbursedBy: user?.fullName || 'মাওলানা হাবিবুর রহমান (হিসাবরক্ষক)',
  });

  // Edit / Adjust Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<SalaryPayrollEntity | null>(null);
  const [editForm, setEditForm] = useState<{
    baseSalary: number;
    houseRent: number;
    medical: number;
    conveyance: number;
    foodOrMess: number;
    specialDuty: number;
    otherAllowance: number;
    bonusAmount: number;
    bonusType: string;
    advanceDeduction: number;
    loanDeduction: number;
    absentDays: number;
    absentDeduction: number;
    providentFundDeduction: number;
    otherDeductions: number;
    remarks: string;
  }>({
    baseSalary: 0,
    houseRent: 0,
    medical: 0,
    conveyance: 0,
    foodOrMess: 0,
    specialDuty: 0,
    otherAllowance: 0,
    bonusAmount: 0,
    bonusType: '',
    advanceDeduction: 0,
    loanDeduction: 0,
    absentDays: 0,
    absentDeduction: 0,
    providentFundDeduction: 0,
    otherDeductions: 0,
    remarks: '',
  });

  // New Single Payroll Modal
  const [isNewPayrollOpen, setIsNewPayrollOpen] = useState(false);
  const [newPayrollStaffId, setNewPayrollStaffId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, staffRes] = await Promise.all([
        api.getSalaryPayrolls(
          departmentFilter !== 'ALL' ? (departmentFilter as DepartmentType) : undefined,
          selectedMonth,
          statusFilter !== 'ALL' ? statusFilter : undefined
        ),
        api.getStaff(),
      ]);

      if (payRes.success) {
        setPayrolls(payRes.data);
      }
      if (staffRes.success) {
        setStaffList(staffRes.data);
      }
    } catch (err) {
      showToast('বেতন ও পে-রোল তথ্য লোড করতে ত্রুটি হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSelectedPayrollIds([]);
  }, [selectedMonth, statusFilter, departmentFilter]);

  // Generation
  const handleGenerateMonthlyPayroll = async () => {
    try {
      const res = await api.generateMonthlyPayroll(selectedMonth);
      if (res.success) {
        showToast(
          res.message || `${selectedMonth} মাসের বেতন তালিকা সফলভাবে প্রস্তুত হয়েছে।`,
          'success'
        );
        loadData();
      } else {
        showToast(res.error?.message || 'বেতন তালিকা তৈরিতে সমস্যা হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  // Reviewing
  const handleReviewSingle = async (payroll: SalaryPayrollEntity) => {
    try {
      const reviewer = user?.fullName || 'হিসাব নিরীক্ষক';
      const res = await api.reviewSalaryPayroll(payroll.id, reviewer);
      if (res.success) {
        showToast(res.message || 'বেতন বিল সফলভাবে যাচাই করা হয়েছে।', 'success');
        loadData();
      } else {
        showToast(res.error?.message || 'যাচাই ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  const handleReviewBatch = async () => {
    const idsToReview =
      selectedPayrollIds.length > 0
        ? selectedPayrollIds
        : payrolls.filter((p) => p.workflowStatus === 'DRAFT').map((p) => p.id);

    if (idsToReview.length === 0) {
      showToast('যাচাই করার মতো কোনো খসড়া পে-রোল নেই।', 'info');
      return;
    }

    try {
      const reviewer = user?.fullName || 'হিসাব নিরীক্ষক';
      const res = await api.reviewBatchSalaryPayroll(idsToReview, reviewer);
      if (res.success) {
        showToast(res.message || 'নির্বাচিত পে-রোলসমূহ যাচাই সম্পন্ন হয়েছে।', 'success');
        setSelectedPayrollIds([]);
        loadData();
      } else {
        showToast(res.error?.message || 'ব্যাচ রিভিউ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  // Approving
  const handleApproveSingle = async (payroll: SalaryPayrollEntity) => {
    try {
      const approver = user?.fullName || 'মুহতামিম / প্রিন্সিপাল';
      const res = await api.approveSalaryPayroll(payroll.id, approver);
      if (res.success) {
        showToast(res.message || 'বেতন বিল চূড়ান্ত অনুমোদন লাভ করেছে।', 'success');
        loadData();
      } else {
        showToast(res.error?.message || 'অনুমোদন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  const handleApproveBatch = async () => {
    const idsToApprove =
      selectedPayrollIds.length > 0
        ? selectedPayrollIds
        : payrolls
            .filter((p) => p.workflowStatus === 'REVIEWED' || p.workflowStatus === 'DRAFT')
            .map((p) => p.id);

    if (idsToApprove.length === 0) {
      showToast('অনুমোদন করার মতো কোনো অপেক্ষমান পে-রোল নেই।', 'info');
      return;
    }

    try {
      const approver = user?.fullName || 'মুহতামিম / প্রিন্সিপাল';
      const res = await api.approveBatchSalaryPayroll(idsToApprove, approver);
      if (res.success) {
        showToast(res.message || 'নির্বাচিত পে-রোলসমূহ সফলভাবে অনুমোদিত হয়েছে।', 'success');
        setSelectedPayrollIds([]);
        loadData();
      } else {
        showToast(res.error?.message || 'ব্যাচ অনুমোদন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  // Disbursing
  const handleOpenDisburseSingle = (payroll: SalaryPayrollEntity) => {
    setDisbursingPayroll(payroll);
    setDisburseForm({
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      accountName: 'ইসলামী ব্যাংক বাংলাদেশ (চলতি হিসাব: ২০৫০১৭৭...)',
      disbursedBy: user?.fullName || 'মাওলানা হাবিবুর রহমান (হিসাবরক্ষক)',
    });
    setIsDisburseModalOpen(true);
  };

  const handleDisburseSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disbursingPayroll) return;

    try {
      const res = await api.disburseSalary(
        disbursingPayroll.id,
        disburseForm.paymentMethod,
        disburseForm.accountName,
        undefined,
        disburseForm.disbursedBy
      );

      if (res.success) {
        showToast(
          `${disbursingPayroll.staffName}-এর বেতন সফলভাবে পরিশোধ ও লেজারে লিপিবদ্ধ করা হয়েছে।`,
          'success'
        );
        setIsDisburseModalOpen(false);
        setDisbursingPayroll(null);
        loadData();
      } else {
        showToast(res.error?.message || 'পরিশোধ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'পরিশোধে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleBulkDisburse = async () => {
    const eligiblePayrolls = payrolls.filter(
      (p) =>
        p.paymentStatus === 'UNPAID' &&
        (selectedPayrollIds.length === 0 || selectedPayrollIds.includes(p.id))
    );

    if (eligiblePayrolls.length === 0) {
      showToast('পরিশোধযোগ্য কোনো অপেক্ষমান বেতন নেই।', 'info');
      return;
    }

    const totalToPay = eligiblePayrolls.reduce((sum, p) => sum + p.netPayable, 0);

    if (
      !window.confirm(
        `আপনি কি ${eligiblePayrolls.length} জন কর্মচারীর মোট ৳${totalToPay.toLocaleString(
          'bn-BD'
        )} বেতন একযোগে পরিশোধ ও ভাউচার প্রস্তুত করতে চান?`
      )
    ) {
      return;
    }

    try {
      const res = await api.disburseBulkSalary(
        eligiblePayrolls.map((p) => p.id),
        PaymentMethod.BANK_TRANSFER,
        'ইসলামী ব্যাংক বাংলাদেশ (চলতি হিসাব)',
        user?.fullName || 'মুহতামিম / প্রধান হিসাবরক্ষক'
      );

      if (res.success) {
        showToast('সকল অপেক্ষমান বেতন সফলভাবে পরিশোধ ও হিসাবভুক্ত হয়েছে।', 'success');
        setSelectedPayrollIds([]);
        loadData();
      } else {
        showToast(res.error?.message || 'একযোগে পরিশোধ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'পরিশোধে সমস্যা হয়েছে।', 'error');
    }
  };

  // Editing Payroll
  const handleOpenEdit = (payroll: SalaryPayrollEntity) => {
    setEditingPayroll(payroll);
    setEditForm({
      baseSalary: payroll.baseSalary,
      houseRent: payroll.allowances?.houseRent || 0,
      medical: payroll.allowances?.medical || 0,
      conveyance: payroll.allowances?.conveyance || 0,
      foodOrMess: payroll.allowances?.foodOrMess || 0,
      specialDuty: payroll.allowances?.specialDuty || 0,
      otherAllowance: payroll.allowances?.other || 0,
      bonusAmount: payroll.bonusAmount || 0,
      bonusType: payroll.bonusType || '',
      advanceDeduction: payroll.advanceDeduction || 0,
      loanDeduction: payroll.loanDeduction || 0,
      absentDays: payroll.absentDays || 0,
      absentDeduction: payroll.absentDeduction || 0,
      providentFundDeduction: payroll.providentFundDeduction || 0,
      otherDeductions: payroll.otherDeductions || 0,
      remarks: payroll.remarks || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;

    try {
      const updates: Partial<SalaryPayrollEntity> = {
        baseSalary: Number(editForm.baseSalary),
        allowances: {
          houseRent: Number(editForm.houseRent),
          medical: Number(editForm.medical),
          conveyance: Number(editForm.conveyance),
          foodOrMess: Number(editForm.foodOrMess),
          specialDuty: Number(editForm.specialDuty),
          other: Number(editForm.otherAllowance),
        },
        bonusAmount: Number(editForm.bonusAmount),
        bonusType: editForm.bonusType || undefined,
        advanceDeduction: Number(editForm.advanceDeduction),
        loanDeduction: Number(editForm.loanDeduction),
        absentDays: Number(editForm.absentDays),
        absentDeduction: Number(editForm.absentDeduction),
        providentFundDeduction: Number(editForm.providentFundDeduction),
        otherDeductions: Number(editForm.otherDeductions),
        remarks: editForm.remarks,
      };

      const res = await api.updateSalaryPayroll(editingPayroll.id, updates);
      if (res.success) {
        showToast('পে-রোল তথ্য সফলভাবে হালনাগাদ করা হয়েছে।', 'success');
        setIsEditModalOpen(false);
        setEditingPayroll(null);
        loadData();
      } else {
        showToast(res.error?.message || 'আপডেট ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  // Deleting Payroll
  const handleDeletePayroll = async (payroll: SalaryPayrollEntity) => {
    if (payroll.paymentStatus === 'PAID') {
      showToast('পরিশোধিত পে-রোল মুছে ফেলা নিষিদ্ধ।', 'error');
      return;
    }

    if (!window.confirm(`আপনি কি ${payroll.staffName}-এর এই পে-রোল রেকর্ডটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await api.deleteSalaryPayroll(payroll.id);
      if (res.success) {
        showToast('পে-রোল রেকর্ড সফলভাবে অপসারিত হয়েছে।', 'success');
        loadData();
      } else {
        showToast(res.error?.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  // Add Single Manual Payroll
  const handleCreateSinglePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayrollStaffId) {
      showToast('অনুগ্রহ করে শিক্ষক বা স্টাফ নির্বাচন করুন।', 'error');
      return;
    }

    const stf = staffList.find((s) => s.id === newPayrollStaffId);
    if (!stf) return;

    try {
      const res = await api.createSalaryPayroll({
        staffId: stf.id,
        staffName: stf.nameBangla,
        employeeId: stf.employeeId,
        designation: stf.designation,
        department: stf.department,
        monthYear: selectedMonth,
        baseSalary: stf.baseSalary,
        allowances: stf.allowances || {
          houseRent: 0,
          medical: 0,
          conveyance: 0,
          foodOrMess: 0,
          specialDuty: 0,
          other: 0,
        },
        totalAllowances: 0,
        bonusAmount: 0,
        grossSalary: stf.baseSalary,
        advanceDeduction: 0,
        loanDeduction: 0,
        absentDays: 0,
        absentDeduction: 0,
        providentFundDeduction: 0,
        otherDeductions: 0,
        totalDeductions: 0,
        netPayable: stf.baseSalary,
        workflowStatus: 'DRAFT',
        paymentStatus: 'UNPAID',
      });

      if (res.success) {
        showToast(`${stf.nameBangla}-এর পে-রোল সফলভাবে তৈরি হয়েছে।`, 'success');
        setIsNewPayrollOpen(false);
        setNewPayrollStaffId('');
        loadData();
      } else {
        showToast(res.error?.message || 'পে-রোল তৈরি ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'সার্ভার ত্রুটি।', 'error');
    }
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedPayrollIds.length === filteredPayrolls.length) {
      setSelectedPayrollIds([]);
    } else {
      setSelectedPayrollIds(filteredPayrolls.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedPayrollIds.includes(id)) {
      setSelectedPayrollIds(selectedPayrollIds.filter((item) => item !== id));
    } else {
      setSelectedPayrollIds([...selectedPayrollIds, id]);
    }
  };

  // Computed values
  const filteredPayrolls = payrolls.filter((p) => {
    const matchesSearch =
      p.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payslipNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + p.netPayable, 0);

  // Workflow stage counts
  const draftCount = payrolls.filter((p) => p.workflowStatus === 'DRAFT').length;
  const reviewCount = payrolls.filter((p) => p.workflowStatus === 'REVIEWED').length;
  const approvedCount = payrolls.filter((p) => p.workflowStatus === 'APPROVED').length;
  const paidCount = payrolls.filter((p) => p.paymentStatus === 'PAID').length;

  // Live calculation for edit modal
  const editComputedAllowances =
    Number(editForm.houseRent || 0) +
    Number(editForm.medical || 0) +
    Number(editForm.conveyance || 0) +
    Number(editForm.foodOrMess || 0) +
    Number(editForm.specialDuty || 0) +
    Number(editForm.otherAllowance || 0);

  const editComputedGross =
    Number(editForm.baseSalary || 0) +
    editComputedAllowances +
    Number(editForm.bonusAmount || 0);

  const editComputedDeductions =
    Number(editForm.advanceDeduction || 0) +
    Number(editForm.loanDeduction || 0) +
    Number(editForm.absentDeduction || 0) +
    Number(editForm.providentFundDeduction || 0) +
    Number(editForm.otherDeductions || 0);

  const editComputedNet = Math.max(0, editComputedGross - editComputedDeductions);

  return (
    <div className="space-y-6">
      
      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            সর্বমোট ধার্য বেতন (Gross)
          </span>
          <p className="text-2xl font-bold mt-1 text-[var(--color-text-main)]">
            ৳{totalGross.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">মূল বেতন, ভাতাসমূহ ও বোনাস</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            মোট কর্তন (Advance/Loan/PF)
          </span>
          <p className="text-2xl font-bold mt-1 text-rose-600">
            ৳{totalDeductions.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-rose-600 font-medium">অগ্রিম, লোন কিস্তি ও অবৈতনিক ছুটি</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            সর্বমোট নিট প্রদেয় (Net Payable)
          </span>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            ৳{totalNet.toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">প্রকৃত বণ্টনযোগ্য মোট বেতন</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
            পরিশোধের অগ্রগতি
          </span>
          <p className="text-2xl font-bold mt-1 text-teal-600">
            {toBengaliNumerals(paidCount)} / {toBengaliNumerals(payrolls.length)} জন
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">
            অপেক্ষমান: {toBengaliNumerals(payrolls.length - paidCount)} জন
          </span>
        </div>
      </div>

      {/* Workflow Stage Pipeline Navigation Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Workflow State Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
            }`}
          >
            সকল পে-রোল ({toBengaliNumerals(payrolls.length)})
          </button>

          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              statusFilter === 'DRAFT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            ১. খসড়া ({toBengaliNumerals(draftCount)})
          </button>

          <button
            onClick={() => setStatusFilter('REVIEWED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              statusFilter === 'REVIEWED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ২. যাচাইকৃত ({toBengaliNumerals(reviewCount)})
          </button>

          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              statusFilter === 'APPROVED'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            ৩. অনুমোদিত ({toBengaliNumerals(approvedCount)})
          </button>

          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            ৪. পরিশোধিত ({toBengaliNumerals(paidCount)})
          </button>
        </div>

        {/* Action Modules Shortcut Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSalarySheetOpen(true)}
            className="px-3 py-1.5 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text-main)] text-xs font-bold rounded-xl border border-[var(--color-border)] shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            মাসিক বেতন শিট
          </button>

          <button
            onClick={() => setIsLoanManagerOpen(true)}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-700" />
            লোন ও কর্জে হাসানা
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
            বেতন রিপোর্ট
          </button>
        </div>

      </div>

      {/* Control Toolbar (Month, Department, Search, Action buttons) */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">মাস:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">বিভাগ:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">সকল বিভাগ</option>
              <option value="কিতাব বিভাগ">কিতাব বিভাগ</option>
              <option value="হিফজ বিভাগ">হিফজ বিভাগ</option>
              <option value="নূরানী বিভাগ">নূরানী বিভাগ</option>
              <option value="প্রশাসন ও হিসাব">প্রশাসন ও হিসাব</option>
              <option value="সাধারণ বিভাগ">সাধারণ বিভাগ</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="শিক্ষক খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)] outline-none focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>
        </div>

        {/* Process Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateMonthlyPayroll}
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            মাসিক পে-রোল প্রস্তুত করুন
          </button>

          <button
            onClick={() => setIsNewPayrollOpen(true)}
            className="px-3 py-1.5 bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text-main)] text-xs font-semibold rounded-xl border border-[var(--color-border)] shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            একক পে-রোল যোগ
          </button>

          {/* Batch review button */}
          <button
            onClick={handleReviewBatch}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            একযোগে রিভিউ
          </button>

          {/* Batch approve button */}
          <button
            onClick={handleApproveBatch}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            একযোগে অনুমোদন
          </button>

          {/* Bulk Disburse */}
          {payrolls.some((p) => p.paymentStatus === 'UNPAID') && (
            <button
              onClick={handleBulkDisburse}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              একযোগে পরিশোধ
            </button>
          )}
        </div>

      </div>

      {/* Master Payroll Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">লোড হচ্ছে...</div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
            এই নির্বাচনের জন্য কোনো পে-রোল পাওয়া যায়নি। &quot;মাসিক পে-রোল প্রস্তুত করুন&quot; বোতামে ক্লিক করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                <tr>
                  <th className="p-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedPayrollIds.length === filteredPayrolls.length &&
                        filteredPayrolls.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="p-3">পে-স্লিপ ও শিক্ষক</th>
                  <th className="p-3">বিভাগ ও পদবী</th>
                  <th className="p-3 text-right">মূল বেতন</th>
                  <th className="p-3 text-right">ভাতাসমূহ</th>
                  <th className="p-3 text-right">বোনাস</th>
                  <th className="p-3 text-right">অগ্রিম কর্তন</th>
                  <th className="p-3 text-right">লোন কর্তন</th>
                  <th className="p-3 text-right">মোট কর্তন</th>
                  <th className="p-3 text-right">নিট প্রদেয়</th>
                  <th className="p-3 text-center">ওয়ার্কফ্লো অবস্থা</th>
                  <th className="p-3 text-center">পেমেন্ট</th>
                  <th className="p-3 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y border-[var(--color-border)]">
                {filteredPayrolls.map((payroll) => (
                  <tr
                    key={payroll.id}
                    className={`hover:bg-[var(--color-surface-hover)] transition-colors ${
                      selectedPayrollIds.includes(payroll.id) ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPayrollIds.includes(payroll.id)}
                        onChange={() => toggleSelectOne(payroll.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[var(--color-text-main)]">
                        {payroll.staffName}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                        {payroll.payslipNo} ({payroll.employeeId})
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{payroll.department}</div>
                      <div className="text-[10px] text-slate-500">{payroll.designation}</div>
                    </td>
                    <td className="p-3 text-right font-medium">
                      ৳{payroll.baseSalary.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 text-right text-emerald-600 font-medium">
                      ৳{payroll.totalAllowances.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 text-right text-purple-600 font-medium">
                      ৳{(payroll.bonusAmount || 0).toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 text-right text-rose-600 font-medium">
                      ৳{(payroll.advanceDeduction || 0).toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 text-right text-rose-600 font-medium">
                      ৳{(payroll.loanDeduction || 0).toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-700">
                      ৳{payroll.totalDeductions.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-800 text-sm">
                      ৳{payroll.netPayable.toLocaleString('bn-BD')}
                    </td>

                    {/* Workflow status badge */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          payroll.workflowStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : payroll.workflowStatus === 'APPROVED'
                            ? 'bg-purple-100 text-purple-800'
                            : payroll.workflowStatus === 'REVIEWED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {payroll.workflowStatus === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                        {payroll.workflowStatus === 'APPROVED' && <CheckCheck className="w-3 h-3" />}
                        {payroll.workflowStatus === 'REVIEWED' && <ShieldCheck className="w-3 h-3" />}
                        {payroll.workflowStatus === 'DRAFT' && <Clock className="w-3 h-3" />}
                        {payroll.workflowStatus === 'PAID'
                          ? 'পরিশোধিত'
                          : payroll.workflowStatus === 'APPROVED'
                          ? 'অনুমোদিত'
                          : payroll.workflowStatus === 'REVIEWED'
                          ? 'যাচাইকৃত'
                          : 'খসড়া'}
                      </span>
                    </td>

                    {/* Payment status */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          payroll.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {payroll.paymentStatus === 'PAID' ? 'PAID' : 'UNPAID'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Payslip preview */}
                        <button
                          onClick={() => setSelectedPayslip(payroll)}
                          title="ব্যক্তিগত পে-স্লিপ দেখুন ও প্রিন্ট করুন"
                          className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Staff Ledger & History */}
                        <button
                          onClick={() => setSelectedHistoryStaffId(payroll.staffId)}
                          title="বেতন ও লোন ইতিহাস"
                          className="p-1 text-slate-600 hover:text-purple-700 hover:bg-slate-100 rounded"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        {/* Workflow Review Action (if DRAFT) */}
                        {payroll.workflowStatus === 'DRAFT' && (
                          <button
                            onClick={() => handleReviewSingle(payroll)}
                            title="যাচাই ও অডিট সম্পন্ন করুন"
                            className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-300 rounded"
                          >
                            রিভিউ
                          </button>
                        )}

                        {/* Workflow Approve Action (if REVIEWED or DRAFT) */}
                        {(payroll.workflowStatus === 'REVIEWED' || payroll.workflowStatus === 'DRAFT') && (
                          <button
                            onClick={() => handleApproveSingle(payroll)}
                            title="মুহতামিম চূড়ান্ত অনুমোদন"
                            className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-300 rounded"
                          >
                            অনুমোদন
                          </button>
                        )}

                        {/* Workflow Disburse Action (if not PAID) */}
                        {payroll.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => handleOpenDisburseSingle(payroll)}
                            title="বেতন পরিশোধ করুন"
                            className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            পরিশোধ
                          </button>
                        )}

                        {/* Edit Action (if not paid) */}
                        {payroll.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => handleOpenEdit(payroll)}
                            title="সংশোধন করুন"
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Action (if not paid & draft) */}
                        {payroll.paymentStatus !== 'PAID' && payroll.workflowStatus === 'DRAFT' && (
                          <button
                            onClick={() => handleDeletePayroll(payroll)}
                            title="মুছে ফেলুন"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Adjust Payroll Modal */}
      {isEditModalOpen && editingPayroll && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-4 text-xs text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  বেতন ও কর্তন সমন্বয় (Adjust Payroll)
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingPayroll.staffName} ({editingPayroll.employeeId}) — {editingPayroll.department}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {/* Basic Salary & Bonus */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block">মূল বেতন ও উৎসব বোনাস</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">মূল বেতন (Base Salary)</label>
                    <input
                      type="number"
                      value={editForm.baseSalary}
                      onChange={(e) => setEditForm({ ...editForm, baseSalary: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">উৎসব / বিশেষ বোনাস</label>
                    <input
                      type="number"
                      value={editForm.bonusAmount}
                      onChange={(e) => setEditForm({ ...editForm, bonusAmount: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-purple-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">বোনাসের ধরন</label>
                    <input
                      type="text"
                      placeholder="যেমন: ঈদুল ফিতর"
                      value={editForm.bonusType}
                      onChange={(e) => setEditForm({ ...editForm, bonusType: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Allowances Breakdown */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">ভাতাসমূহ (Allowances)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[10px]">বাড়ি ভাড়া (House Rent)</label>
                    <input
                      type="number"
                      value={editForm.houseRent}
                      onChange={(e) => setEditForm({ ...editForm, houseRent: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">চিকিৎসা ভাতা (Medical)</label>
                    <input
                      type="number"
                      value={editForm.medical}
                      onChange={(e) => setEditForm({ ...editForm, medical: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">যাতায়াত (Conveyance)</label>
                    <input
                      type="number"
                      value={editForm.conveyance}
                      onChange={(e) => setEditForm({ ...editForm, conveyance: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">খাবার / মেস (Food)</label>
                    <input
                      type="number"
                      value={editForm.foodOrMess}
                      onChange={(e) => setEditForm({ ...editForm, foodOrMess: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">বিশেষ দায়িত্ব (Duty)</label>
                    <input
                      type="number"
                      value={editForm.specialDuty}
                      onChange={(e) => setEditForm({ ...editForm, specialDuty: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">অন্যান্য ভাতা (Other)</label>
                    <input
                      type="number"
                      value={editForm.otherAllowance}
                      onChange={(e) => setEditForm({ ...editForm, otherAllowance: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200 space-y-2">
                <span className="font-bold text-rose-900 text-xs block">কর্তনসমূহ (Deductions)</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-rose-800 text-[10px]">বেতন অগ্রিম কর্তন (Advance)</label>
                    <input
                      type="number"
                      value={editForm.advanceDeduction}
                      onChange={(e) => setEditForm({ ...editForm, advanceDeduction: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-rose-300 text-rose-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-800 text-[10px]">লোন কিস্তি কর্তন (Loan)</label>
                    <input
                      type="number"
                      value={editForm.loanDeduction}
                      onChange={(e) => setEditForm({ ...editForm, loanDeduction: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-rose-300 text-rose-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-rose-800 text-[10px]">অনুপস্থিত দিন ও কর্তন</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        placeholder="দিন"
                        value={editForm.absentDays}
                        onChange={(e) => setEditForm({ ...editForm, absentDays: Number(e.target.value) })}
                        className="w-14 p-1.5 rounded-lg border border-rose-300 text-center"
                      />
                      <input
                        type="number"
                        placeholder="টাকা"
                        value={editForm.absentDeduction}
                        onChange={(e) => setEditForm({ ...editForm, absentDeduction: Number(e.target.value) })}
                        className="flex-1 p-1.5 rounded-lg border border-rose-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-rose-800 text-[10px]">প্রভিডেন্ট ফান্ড (PF)</label>
                    <input
                      type="number"
                      value={editForm.providentFundDeduction}
                      onChange={(e) => setEditForm({ ...editForm, providentFundDeduction: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-rose-300"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-rose-800 text-[10px]">অন্যান্য বিশেষ কর্তন</label>
                    <input
                      type="number"
                      value={editForm.otherDeductions}
                      onChange={(e) => setEditForm({ ...editForm, otherDeductions: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg border border-rose-300"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Summary Bar */}
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">সর্বমোট উপার্জন (Gross): ৳{editComputedGross.toLocaleString('bn-BD')}</span>
                  <span className="text-rose-700 block">মোট কর্তন: ৳{editComputedDeductions.toLocaleString('bn-BD')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-bold block">চূড়ান্ত নিট প্রদেয় (Net)</span>
                  <span className="text-lg font-black text-emerald-950">৳{editComputedNet.toLocaleString('bn-BD')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Manual Single New Payroll Modal */}
      {isNewPayrollOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                নতুন একক পে-রোল তৈরি
              </h3>
              <button
                onClick={() => setIsNewPayrollOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSinglePayroll} className="space-y-3 text-xs text-slate-800">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">মাস ও বছর</label>
                <input
                  type="month"
                  value={selectedMonth}
                  disabled
                  className="w-full p-2 rounded-xl border border-slate-300 bg-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">শিক্ষক / স্টাফ নির্বাচন *</label>
                <select
                  value={newPayrollStaffId}
                  onChange={(e) => setNewPayrollStaffId(e.target.value)}
                  required
                  className="w-full p-2 rounded-xl border border-slate-300 outline-none"
                >
                  <option value="">নির্বাচন করুন</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBangla} ({s.employeeId}) — {s.designation} (বেতন: ৳{s.baseSalary})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPayrollOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  পে-রোল তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Modal */}
      {isDisburseModalOpen && disbursingPayroll && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                বেতন পরিশোধ ও ভাউচার তৈরি
              </h3>
              <button
                onClick={() => setIsDisburseModalOpen(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisburseSingleSubmit} className="space-y-3 text-xs text-slate-800">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">গৃহীতা শিক্ষক:</span>
                  <span className="font-bold text-slate-800">{disbursingPayroll.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পদবী ও বিভাগ:</span>
                  <span className="font-semibold text-slate-700">
                    {disbursingPayroll.designation}, {disbursingPayroll.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ধার্যকৃত মোট বেতন:</span>
                  <span className="font-medium text-slate-800">৳{disbursingPayroll.grossSalary.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোট কর্তন:</span>
                  <span className="font-medium text-rose-600">-৳{disbursingPayroll.totalDeductions.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="font-bold text-slate-900">নিট প্রদেয় অর্থ:</span>
                  <span className="font-black text-emerald-800 text-sm">
                    ৳{disbursingPayroll.netPayable.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">পেমেন্ট মেথড *</label>
                <select
                  value={disburseForm.paymentMethod}
                  onChange={(e) =>
                    setDisburseForm({ ...disburseForm, paymentMethod: e.target.value as PaymentMethod })
                  }
                  className="w-full p-2 rounded-xl border border-slate-300 outline-none"
                >
                  <option value={PaymentMethod.BANK_TRANSFER}>ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                  <option value={PaymentMethod.CASH}>নগদ ক্যাশ (Cash)</option>
                  <option value={PaymentMethod.CHEQUE}>চেক (Cheque)</option>
                  <option value={PaymentMethod.BKASH}>বিকাশ (bKash)</option>
                  <option value={PaymentMethod.NAGAD}>নগদ (Nagad)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">পরিশোধিত ব্যাংক/ক্যাশ হিসাব *</label>
                <input
                  type="text"
                  value={disburseForm.accountName}
                  onChange={(e) => setDisburseForm({ ...disburseForm, accountName: e.target.value })}
                  required
                  className="w-full p-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">বিতরণকারী হিসাবরক্ষক</label>
                <input
                  type="text"
                  value={disburseForm.disbursedBy}
                  onChange={(e) => setDisburseForm({ ...disburseForm, disbursedBy: e.target.value })}
                  required
                  className="w-full p-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisburseModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  পরিশোধ ও ভাউচার প্রস্তুত
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Master Salary Sheet */}
      {isSalarySheetOpen && (
        <PrintableSalarySheet
          monthYear={selectedMonth}
          payrolls={payrolls}
          onClose={() => setIsSalarySheetOpen(false)}
        />
      )}

      {/* Printable Individual Payslip */}
      {selectedPayslip && (
        <PrintablePayslipModal
          payroll={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}

      {/* Individual Staff History & Ledger */}
      {selectedHistoryStaffId && (
        <StaffSalaryHistoryModal
          staffId={selectedHistoryStaffId}
          onClose={() => setSelectedHistoryStaffId(null)}
        />
      )}

      {/* Qard-e-Hasana & Loan Management Modal */}
      {isLoanManagerOpen && (
        <StaffLoanManagementModal
          onClose={() => setIsLoanManagerOpen(false)}
          onLoanUpdated={() => loadData()}
        />
      )}

      {/* Salary Financial Analytics Report */}
      {isReportOpen && (
        <SalaryReportView
          monthYear={selectedMonth}
          payrolls={payrolls}
          onClose={() => setIsReportOpen(false)}
        />
      )}

    </div>
  );
};
