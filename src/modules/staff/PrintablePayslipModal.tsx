import React from 'react';
import {
  Printer,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  X,
  CreditCard,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { SalaryPayrollEntity } from '../../types';
import { toBengaliNumerals, formatTaka } from '../../utils/format';

interface PrintablePayslipModalProps {
  payroll: SalaryPayrollEntity;
  onClose: () => void;
}

export const PrintablePayslipModal: React.FC<PrintablePayslipModalProps> = ({
  payroll,
  onClose,
}) => {
  const getBengaliMonthYear = (ym: string) => {
    const [year, month] = ym.split('-');
    const months = [
      'জানুয়ারি',
      'ফেব্রুয়ারি',
      'মার্চ',
      'এপ্রিল',
      'মে',
      'জুন',
      'জুলাই',
      'আগস্ট',
      'সেপ্টেম্বর',
      'অক্টোবর',
      'নভেম্বর',
      'ডিসেম্বর',
    ];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${monthName} ${toBengaliNumerals(year)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col print:shadow-none print:w-full print:rounded-none">
        
        {/* Action Header (Hidden during Print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                ব্যক্তিগত বেতন বিবরণী ও পে-স্লিপ
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {payroll.payslipNo} | {payroll.staffName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              পে-স্লিপ প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Card */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-800 bg-white border border-slate-200 m-2 sm:m-4 rounded-xl print:m-0 print:border-0 print:p-4">
          
          {/* Institution Header */}
          <div className="text-center border-b-2 border-emerald-800 pb-3 space-y-0.5">
            <div className="text-[10px] tracking-widest text-emerald-800 font-serif font-semibold">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
            <h1 className="text-xl font-black text-emerald-950">
              জামিয়া আরাবিয়া দারুল উলুম মাদরাসা
            </h1>
            <p className="text-[11px] text-slate-600">
              হিসাব ও অর্থ বিভাগ — কেন্দ্রীয় বেতন বিবরণী ও পেমেন্ট রসিদ
            </p>
            <div className="inline-block px-3 py-0.5 mt-1 bg-emerald-50 border border-emerald-300 rounded-full text-xs font-bold text-emerald-900">
              মাসিক বেতন স্লিপ (Salary Slip): {getBengaliMonthYear(payroll.monthYear)}
            </div>
          </div>

          {/* Employee & Payslip Metadata */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs print:bg-transparent">
            <div className="space-y-1">
              <div>
                <span className="text-slate-500">শিক্ষক/কর্মকর্তার নাম: </span>
                <span className="font-bold text-slate-900">{payroll.staffName}</span>
              </div>
              <div>
                <span className="text-slate-500">পদবী: </span>
                <span className="font-semibold text-slate-800">{payroll.designation}</span>
              </div>
              <div>
                <span className="text-slate-500">বিভাগ: </span>
                <span className="font-medium text-slate-700">{payroll.department}</span>
              </div>
            </div>
            <div className="space-y-1 text-right sm:text-left">
              <div>
                <span className="text-slate-500">কর্মচারী আইডি: </span>
                <span className="font-mono font-bold text-slate-900">{payroll.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-500">পে-স্লিপ নম্বর: </span>
                <span className="font-mono font-semibold text-slate-800">{payroll.payslipNo}</span>
              </div>
              <div>
                <span className="text-slate-500">পরিশোধের অবস্থা: </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    payroll.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {payroll.paymentStatus === 'PAID' ? 'পরিশোধিত (PAID)' : 'প্রস্তুত / অপেক্ষমান'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Earnings Column */}
            <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-emerald-800 text-white font-bold p-2 text-center text-xs">
                  উপার্জন ও ভাতাসমূহ (Earnings & Allowances)
                </div>
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">মূল বেতন (Basic Salary)</td>
                      <td className="p-2 text-right font-semibold text-slate-900">
                        {toBengaliNumerals(payroll.baseSalary)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">বাড়ি ভাড়া ভাতা (House Rent)</td>
                      <td className="p-2 text-right text-slate-800">
                        {toBengaliNumerals(payroll.allowances?.houseRent || 0)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">চিকিৎসা ভাতা (Medical Allowance)</td>
                      <td className="p-2 text-right text-slate-800">
                        {toBengaliNumerals(payroll.allowances?.medical || 0)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">যাতায়াত ভাতা (Conveyance)</td>
                      <td className="p-2 text-right text-slate-800">
                        {toBengaliNumerals(payroll.allowances?.conveyance || 0)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">খাবার / মেস ভাতা (Food Allowance)</td>
                      <td className="p-2 text-right text-slate-800">
                        {toBengaliNumerals(payroll.allowances?.foodOrMess || 0)} ৳
                      </td>
                    </tr>
                    {(payroll.allowances?.specialDuty || 0) > 0 && (
                      <tr className="hover:bg-slate-50">
                        <td className="p-2 text-slate-700">বিশেষ দায়িত্ব ভাতা (Special Duty)</td>
                        <td className="p-2 text-right text-slate-800">
                          {toBengaliNumerals(payroll.allowances?.specialDuty || 0)} ৳
                        </td>
                      </tr>
                    )}
                    {(payroll.bonusAmount || 0) > 0 && (
                      <tr className="hover:bg-slate-50 bg-purple-50/50">
                        <td className="p-2 text-purple-900 font-medium">
                          উৎসব/বিশেষ বোনাস {payroll.bonusType ? `(${payroll.bonusType})` : ''}
                        </td>
                        <td className="p-2 text-right font-bold text-purple-900">
                          {toBengaliNumerals(payroll.bonusAmount || 0)} ৳
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-100 p-2.5 border-t border-slate-300 flex justify-between items-center font-bold text-slate-900">
                <span>সর্বমোট উপার্জন (Gross):</span>
                <span className="text-sm text-emerald-900">{toBengaliNumerals(payroll.grossSalary)} ৳</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-rose-800 text-white font-bold p-2 text-center text-xs">
                  কর্তনসমূহ (Deductions)
                </div>
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">অগ্রিম বেতন সমন্বয় (Salary Advance)</td>
                      <td className="p-2 text-right font-medium text-rose-700">
                        {toBengaliNumerals(payroll.advanceDeduction || 0)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">লোন / কর্জে হাসানা কিস্তি (Loan Repayment)</td>
                      <td className="p-2 text-right font-medium text-rose-700">
                        {toBengaliNumerals(payroll.loanDeduction || 0)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">অনুপস্থিতি কর্তন ({toBengaliNumerals(payroll.absentDays || 0)} দিন)</td>
                      <td className="p-2 text-right font-medium text-rose-700">
                        {toBengaliNumerals(payroll.absentDeduction || 0)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">প্রভিডেন্ট ফান্ড কর্তন (Provident Fund)</td>
                      <td className="p-2 text-right font-medium text-rose-700">
                        {toBengaliNumerals(payroll.providentFundDeduction || 0)} ৳
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 text-slate-700">অন্যান্য কর্তন (Other Deductions)</td>
                      <td className="p-2 text-right font-medium text-rose-700">
                        {toBengaliNumerals(payroll.otherDeductions || 0)} ৳
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-rose-50 p-2.5 border-t border-slate-300 flex justify-between items-center font-bold text-rose-950">
                <span>সর্বমোট কর্তন (Total Deductions):</span>
                <span className="text-sm text-rose-700">{toBengaliNumerals(payroll.totalDeductions)} ৳</span>
              </div>
            </div>

          </div>

          {/* Net Payable Highlight Banner */}
          <div className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                সর্বমোট নিট প্রদেয় বেতন (Net Payable Amount)
              </span>
              <span className="text-[11px] text-slate-600">
                কথায়: <span className="font-semibold text-emerald-950">{formatTaka(payroll.netPayable)} টাকা মাত্র</span>
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">
              {toBengaliNumerals(payroll.netPayable)} ৳
            </div>
          </div>

          {/* Payment Disbursement Details if Paid */}
          {payroll.paymentStatus === 'PAID' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1 text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                পরিশোধের বিবরণ ও অডিট ট্রেইল
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
                <div>
                  <span className="text-slate-400">পেমেন্ট মেথড:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {payroll.paymentMethod === 'BANK_TRANSFER' ? 'ব্যাংক ট্রান্সফার' : 'ক্যাশ'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">ভাউচার নম্বর:</span>{' '}
                  <span className="font-mono font-semibold text-slate-800">{payroll.transactionVoucherNo || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">পরিশোধের তারিখ:</span>{' '}
                  <span className="font-semibold text-slate-800">{payroll.paymentDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400">বিতরণকারী:</span>{' '}
                  <span className="font-semibold text-slate-800">{payroll.disbursedBy || 'হিসাবরক্ষক'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                গ্রহীতার স্বাক্ষর (Recipient)
              </div>
              <div className="text-[10px] text-slate-500">{payroll.staffName}</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                হিসাবরক্ষক (Accountant)
              </div>
              <div className="text-[10px] text-slate-500">প্রস্তুতকারী ও যাচাইকারী</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                মুহতামিম / প্রিন্সিপাল (Principal)
              </div>
              <div className="text-[10px] text-slate-500">অনুমোদনকারী</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
