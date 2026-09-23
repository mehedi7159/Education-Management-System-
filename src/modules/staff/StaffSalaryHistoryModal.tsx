import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  X,
  User,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { api } from '../../api';
import {
  SalaryPayrollEntity,
  StaffEntity,
  SalaryAdvanceEntity,
  StaffLoanEntity,
  SalaryIncrementEntity,
} from '../../types';
import { toBengaliNumerals, formatTaka } from '../../utils/format';
import { PrintablePayslipModal } from './PrintablePayslipModal';

interface StaffSalaryHistoryModalProps {
  staffId: string;
  onClose: () => void;
}

export const StaffSalaryHistoryModal: React.FC<StaffSalaryHistoryModalProps> = ({
  staffId,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffEntity | null>(null);
  const [payrolls, setPayrolls] = useState<SalaryPayrollEntity[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvanceEntity[]>([]);
  const [loans, setLoans] = useState<StaffLoanEntity[]>([]);
  const [increments, setIncrements] = useState<SalaryIncrementEntity[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<SalaryPayrollEntity | null>(null);
  const [activeTab, setActiveTab] = useState<'payrolls' | 'loans' | 'advances' | 'increments'>('payrolls');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const staffRes = await api.getStaffById(staffId);
        if (staffRes.success) setStaff(staffRes.data);

        // Fetch payrolls
        const payRes = await api.getSalaryPayrolls();
        if (payRes.success) {
          const staffPays = payRes.data.filter((p) => p.staffId === staffId);
          setPayrolls(staffPays.sort((a, b) => b.monthYear.localeCompare(a.monthYear)));
        }

        // Fetch advances
        const advRes = await api.getSalaryAdvances(staffId);
        if (advRes.success) setAdvances(advRes.data);

        // Fetch loans
        const loanRes = await api.getStaffLoans(staffId);
        if (loanRes.success) setLoans(loanRes.data);

        // Fetch increments
        const incRes = await api.getSalaryIncrements(staffId);
        if (incRes.success) setIncrements(incRes.data);
      } catch (err) {
        console.error('Error fetching staff salary history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [staffId]);

  const totalPaid = payrolls
    .filter((p) => p.paymentStatus === 'PAID')
    .reduce((sum, p) => sum + p.netPayable, 0);

  const totalDeductionsAll = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {staff?.nameBangla || 'শিক্ষক/স্টাফ'} — বেতন ও পেমেন্ট ইতিহাস
              </h2>
              <p className="text-xs text-slate-500">
                আইডি: {staff?.employeeId} | পদবী: {staff?.designation} | বিভাগ: {staff?.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-semibold block">বর্তমান মূল বেতন</span>
              <p className="text-lg font-bold text-emerald-950 mt-0.5">
                ৳{(staff?.baseSalary || 0).toLocaleString('bn-BD')}
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[10px] text-blue-800 font-semibold block">সর্বমোট প্রাপ্ত বেতন (Paid)</span>
              <p className="text-lg font-bold text-blue-950 mt-0.5">
                ৳{totalPaid.toLocaleString('bn-BD')}
              </p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-[10px] text-purple-800 font-semibold block">পরিশোধিত পে-রোল সংখ্যা</span>
              <p className="text-lg font-bold text-purple-950 mt-0.5">
                {toBengaliNumerals(payrolls.filter((p) => p.paymentStatus === 'PAID').length)} টি
              </p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] text-rose-800 font-semibold block">সর্বমোট কর্তন সমন্বয়</span>
              <p className="text-lg font-bold text-rose-950 mt-0.5">
                ৳{totalDeductionsAll.toLocaleString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab('payrolls')}
              className={`pb-2 px-3 font-bold text-xs border-b-2 transition-all ${
                activeTab === 'payrolls'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              মাসিক বেতন পে-রোল ({toBengaliNumerals(payrolls.length)})
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`pb-2 px-3 font-bold text-xs border-b-2 transition-all ${
                activeTab === 'loans'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              লোন / কর্জে হাসানা ({toBengaliNumerals(loans.length)})
            </button>
            <button
              onClick={() => setActiveTab('advances')}
              className={`pb-2 px-3 font-bold text-xs border-b-2 transition-all ${
                activeTab === 'advances'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              বেতন অগ্রিম ({toBengaliNumerals(advances.length)})
            </button>
            <button
              onClick={() => setActiveTab('increments')}
              className={`pb-2 px-3 font-bold text-xs border-b-2 transition-all ${
                activeTab === 'increments'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ইনক্রিমেন্ট হিস্ট্রি ({toBengaliNumerals(increments.length)})
            </button>
          </div>

          {/* Tab 1: Payrolls History */}
          {activeTab === 'payrolls' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">মাস ও বছর</th>
                    <th className="p-2.5">পে-স্লিপ নং</th>
                    <th className="p-2.5 text-right">মূল বেতন</th>
                    <th className="p-2.5 text-right">ভাতাসমূহ</th>
                    <th className="p-2.5 text-right">কর্তন</th>
                    <th className="p-2.5 text-right">নিট প্রদেয়</th>
                    <th className="p-2.5 text-center">ওয়ার্কফ্লো</th>
                    <th className="p-2.5 text-center">পেমেন্ট</th>
                    <th className="p-2.5 text-right">স্লিপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{p.monthYear}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">{p.payslipNo}</td>
                      <td className="p-2.5 text-right font-medium">৳{p.baseSalary.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right text-emerald-700">৳{p.totalAllowances.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right text-rose-700">৳{p.totalDeductions.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-900">৳{p.netPayable.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {p.workflowStatus}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="p-1 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded"
                          title="পে-স্লিপ দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Loans */}
          {activeTab === 'loans' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">আবেদনের তারিখ</th>
                    <th className="p-2.5">কারণ ও ধরন</th>
                    <th className="p-2.5 text-right">মোট মূল ঋণ</th>
                    <th className="p-2.5 text-right">মাসিক কিস্তি</th>
                    <th className="p-2.5 text-right">অবশিষ্ট ব্যালেন্স</th>
                    <th className="p-2.5 text-center">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium">{l.applicationDate}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-800">{l.purpose}</div>
                        <div className="text-[10px] text-slate-500">মোট কিস্তি: {toBengaliNumerals(l.totalInstallments)} টি</div>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">৳{l.principalAmount.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right text-rose-700">৳{l.monthlyInstallment.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right font-bold text-rose-800">৳{l.remainingBalance.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {loans.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        কোনো লোন বা কর্জের রেকর্ড নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Advances */}
          {activeTab === 'advances' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">আবেদনের তারিখ</th>
                    <th className="p-2.5">কারণ</th>
                    <th className="p-2.5 text-right">অগ্রিম অর্থ</th>
                    <th className="p-2.5 text-right">মাসিক কর্তন</th>
                    <th className="p-2.5 text-right">অবশিষ্ট দেনা</th>
                    <th className="p-2.5 text-center">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advances.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium">{a.requestDate}</td>
                      <td className="p-2.5 font-medium text-slate-800">{a.reason}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">৳{(a.amountApproved || a.amountRequested).toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right text-rose-700">৳{a.monthlyDeduction.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right font-bold text-rose-800">৳{a.remainingBalance.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {advances.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        কোনো বেতন অগ্রিম রেকর্ড নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 4: Increments */}
          {activeTab === 'increments' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">কার্যকর তারিখ</th>
                    <th className="p-2.5 text-right">পূর্বের বেতন</th>
                    <th className="p-2.5 text-right">বৃদ্ধির পরিমাণ</th>
                    <th className="p-2.5 text-right">নতুন বেতন</th>
                    <th className="p-2.5">কারণ ও অনুমোদন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {increments.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium">{inc.effectiveDate}</td>
                      <td className="p-2.5 text-right">৳{inc.previousBaseSalary.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-600">+৳{inc.incrementAmount.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right font-black text-emerald-950">৳{inc.newBaseSalary.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-slate-600">{inc.reason} ({inc.approvedBy || 'কর্তৃপক্ষ'})</td>
                    </tr>
                  ))}
                  {increments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        কোনো বেতন ইনক্রিমেন্ট রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {selectedPayslip && (
        <PrintablePayslipModal
          payroll={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
};
