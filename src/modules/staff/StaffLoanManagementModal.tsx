import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Send,
  User,
  Calendar,
  FileText,
  DollarSign,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  StaffLoanEntity,
  StaffEntity,
  LoanStatus,
  PaymentMethod,
} from '../../types';
import { toBengaliNumerals, formatTaka } from '../../utils/format';

interface StaffLoanManagementModalProps {
  onClose: () => void;
  onLoanUpdated?: () => void;
}

export const StaffLoanManagementModal: React.FC<StaffLoanManagementModalProps> = ({
  onClose,
  onLoanUpdated,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<StaffLoanEntity[]>([]);
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);

  // Form State
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [formData, setFormData] = useState({
    staffId: '',
    principalAmount: 20000,
    monthlyInstallment: 2000,
    totalInstallments: 10,
    purpose: 'পারিবারিক ও চিকিৎসা প্রয়োজনে কর্জে হাসানা',
  });

  // Disbursement state
  const [disbursingLoan, setDisbursingLoan] = useState<StaffLoanEntity | null>(null);
  const [disburseMethod, setDisburseMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [disburseAccount, setDisburseAccount] = useState('সাধারণ ক্যাশ কাউন্টার');

  const loadData = async () => {
    setLoading(true);
    try {
      const [loanRes, staffRes] = await Promise.all([
        api.getStaffLoans(),
        api.getStaff(),
      ]);

      if (loanRes.success) setLoans(loanRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
    } catch (err) {
      showToast('লোন তথ্য লোড করতে ত্রুটি হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffId) {
      showToast('শিক্ষক / স্টাফ নির্বাচন করুন।', 'error');
      return;
    }

    try {
      const res = await api.applyStaffLoan({
        staffId: formData.staffId,
        principalAmount: Number(formData.principalAmount),
        monthlyInstallment: Number(formData.monthlyInstallment),
        totalInstallments: Number(formData.totalInstallments),
        purpose: formData.purpose,
      });

      if (res.success) {
        showToast('লোন আবেদন সফলভাবে জমা হয়েছে।', 'success');
        setIsApplyOpen(false);
        loadData();
        if (onLoanUpdated) onLoanUpdated();
      } else {
        showToast(res.error?.message || 'আবেদন জমা ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    try {
      const approver = user?.fullName || 'মুহতামিম / প্রিন্সিপাল';
      const res = await api.approveStaffLoan(loanId, approver);
      if (res.success) {
        showToast('লোন সফলভাবে অনুমোদন লাভ করেছে।', 'success');
        loadData();
        if (onLoanUpdated) onLoanUpdated();
      } else {
        showToast(res.error?.message || 'অনুমোদন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disbursingLoan) return;

    try {
      const res = await api.disburseStaffLoan(
        disbursingLoan.id,
        disburseMethod,
        disburseAccount,
        undefined,
        user?.fullName || 'মাওলানা হাবিবুর রহমান (হিসাবরক্ষক)'
      );

      if (res.success) {
        showToast('লোন অর্থ সফলভাবে বিতরণ ও ভাউচার সম্পন্ন হয়েছে।', 'success');
        setDisbursingLoan(null);
        loadData();
        if (onLoanUpdated) onLoanUpdated();
      } else {
        showToast(res.error?.message || 'বিতরণ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('সার্ভার ত্রুটি।', 'error');
    }
  };

  // Calculations
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED');
  const totalPrincipal = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalRecovered = totalPrincipal - totalOutstanding;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                শিক্ষক ও স্টাফ লোন / কর্জে হাসানা তহবিল
              </h2>
              <p className="text-xs text-slate-500">
                বিনা সুদে কল্যাণমূলক কর্জে হাসানা ও মাসিক কিস্তি ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApplyOpen(true)}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              নতুন লোন / কর্জ আবেদন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 text-xs">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-[10px] text-purple-800 font-semibold block">সর্বমোট মঞ্জুরিকৃত কর্জ</span>
              <p className="text-xl font-bold text-purple-950 mt-0.5">
                ৳{totalPrincipal.toLocaleString('bn-BD')}
              </p>
              <span className="text-[10px] text-purple-600">মোট {toBengaliNumerals(loans.length)} টি লোন</span>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] text-rose-800 font-semibold block">বর্তমান বকেয়া দেনা (Outstanding)</span>
              <p className="text-xl font-bold text-rose-950 mt-0.5">
                ৳{totalOutstanding.toLocaleString('bn-BD')}
              </p>
              <span className="text-[10px] text-rose-600">চলমান কিস্তির অধীনে</span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-semibold block">সর্বমোট আদায়কৃত (Recovered)</span>
              <p className="text-xl font-bold text-emerald-950 mt-0.5">
                ৳{totalRecovered.toLocaleString('bn-BD')}
              </p>
              <span className="text-[10px] text-emerald-600">বেতন থেকে অটো কর্তনকৃত</span>
            </div>
          </div>

          {/* Loan Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-500">তথ্য লোড হচ্ছে...</div>
            ) : loans.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                বর্তমানে কোনো লোন বা কর্জে হাসানার আবেদন নেই।
              </div>
            ) : (
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3">শিক্ষক / স্টাফ</th>
                    <th className="p-3">উদ্দেশ্য</th>
                    <th className="p-3 text-right">মূল ঋণ</th>
                    <th className="p-3 text-right">মাসিক কিস্তি</th>
                    <th className="p-3 text-right">অবশিষ্ট ব্যালেন্স</th>
                    <th className="p-3 text-center">অবস্থা</th>
                    <th className="p-3 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{loan.staffName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          আইডি: {loan.staffId} | {loan.applicationDate}
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {loan.purpose}
                        <div className="text-[10px] text-slate-400">
                          মোট কিস্তি: {toBengaliNumerals(loan.totalInstallments)} টি
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        ৳{loan.principalAmount.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3 text-right font-semibold text-rose-700">
                        ৳{loan.monthlyInstallment.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3 text-right font-black text-rose-800">
                        ৳{loan.remainingBalance.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            loan.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : loan.status === 'ACTIVE' || loan.status === 'DISBURSED'
                              ? 'bg-purple-100 text-purple-800'
                              : loan.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {loan.status === 'COMPLETED'
                            ? 'পরিশোধিত'
                            : loan.status === 'ACTIVE' || loan.status === 'DISBURSED'
                            ? 'চলমান'
                            : loan.status === 'APPROVED'
                            ? 'অনুমোদিত'
                            : 'অপেক্ষমান'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {loan.status === 'PENDING' && (
                            <button
                              onClick={() => handleApproveLoan(loan.id)}
                              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded font-semibold text-[10px]"
                            >
                              অনুমোদন
                            </button>
                          )}

                          {loan.status === 'APPROVED' && (
                            <button
                              onClick={() => setDisbursingLoan(loan)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              অর্থ বিতরণ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </div>

      {/* Apply Loan Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                নতুন কর্জে হাসানা / লোন আবেদন
              </h3>
              <button onClick={() => setIsApplyOpen(false)} className="text-slate-500 hover:text-slate-800">
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyLoan} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">শিক্ষক / স্টাফ নির্বাচন *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  required
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none"
                >
                  <option value="">নির্বাচন করুন</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nameBangla} ({s.employeeId}) — মূল বেতন: ৳{s.baseSalary}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">মোট লোনের পরিমাণ (টাকা) *</label>
                <input
                  type="number"
                  value={formData.principalAmount}
                  onChange={(e) => {
                    const principal = Number(e.target.value);
                    const installments = formData.totalInstallments || 1;
                    setFormData({
                      ...formData,
                      principalAmount: principal,
                      monthlyInstallment: Math.round(principal / installments),
                    });
                  }}
                  required
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">মোট কিস্তির সংখ্যা (মাস)</label>
                  <input
                    type="number"
                    value={formData.totalInstallments}
                    onChange={(e) => {
                      const installments = Number(e.target.value) || 1;
                      setFormData({
                        ...formData,
                        totalInstallments: installments,
                        monthlyInstallment: Math.round(formData.principalAmount / installments),
                      });
                    }}
                    required
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">মাসিক কিস্তি কর্তন</label>
                  <input
                    type="number"
                    value={formData.monthlyInstallment}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyInstallment: Number(e.target.value) })
                    }
                    required
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">লোন গ্রহণের উদ্দেশ্য / কারণ</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-md"
                >
                  আবেদন জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Loan Modal */}
      {disbursingLoan && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                কর্জে হাসানা অর্থ বিতরণ ও ক্যাশ অনুমোদন
              </h3>
              <button onClick={() => setDisbursingLoan(null)} className="text-slate-500 hover:text-slate-800">
                ✕
              </button>
            </div>

            <form onSubmit={handleDisburseSubmit} className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">শিক্ষক:</span>
                  <span className="font-bold text-slate-900">{disbursingLoan.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">মঞ্জুরিকৃত অর্থ:</span>
                  <span className="font-black text-purple-950 text-sm">
                    ৳{disbursingLoan.principalAmount.toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">মাসিক বেতন কর্তন:</span>
                  <span className="font-semibold text-rose-700">
                    ৳{disbursingLoan.monthlyInstallment.toLocaleString('bn-BD')} ({toBengaliNumerals(disbursingLoan.totalInstallments)} মাস)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">পেমেন্ট মেথড</label>
                <select
                  value={disburseMethod}
                  onChange={(e) => setDisburseMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                >
                  <option value={PaymentMethod.CASH}>নগদ ক্যাশ (Cash)</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>ব্যাংক ট্রান্সফার</option>
                  <option value={PaymentMethod.CHEQUE}>চেক</option>
                  <option value={PaymentMethod.BKASH}>বিকাশ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">যে হিসাব থেকে প্রদান করা হচ্ছে</label>
                <input
                  type="text"
                  value={disburseAccount}
                  onChange={(e) => setDisburseAccount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisbursingLoan(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  বিতরণ সম্পন্ন ও ভাউচার তৈরি
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
