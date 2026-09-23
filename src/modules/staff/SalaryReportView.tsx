import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Printer,
  X,
  Building,
  DollarSign,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { SalaryPayrollEntity } from '../../types';
import { toBengaliNumerals, formatTaka } from '../../utils/format';

interface SalaryReportViewProps {
  monthYear: string;
  payrolls: SalaryPayrollEntity[];
  onClose: () => void;
}

export const SalaryReportView: React.FC<SalaryReportViewProps> = ({
  monthYear,
  payrolls,
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

  // Department-wise grouping
  const deptMap: Record<
    string,
    { count: number; gross: number; deductions: number; net: number }
  > = {};

  payrolls.forEach((p) => {
    const dept = p.department || 'অন্যান্য';
    if (!deptMap[dept]) {
      deptMap[dept] = { count: 0, gross: 0, deductions: 0, net: 0 };
    }
    deptMap[dept].count += 1;
    deptMap[dept].gross += p.grossSalary;
    deptMap[dept].deductions += p.totalDeductions;
    deptMap[dept].net += p.netPayable;
  });

  const departmentData = Object.entries(deptMap).map(([dept, val]) => ({
    department: dept,
    ...val,
  }));

  // Totals
  const grandGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const grandDeductions = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
  const grandNet = payrolls.reduce((sum, p) => sum + p.netPayable, 0);
  const totalAdvances = payrolls.reduce((sum, p) => sum + (p.advanceDeduction || 0), 0);
  const totalLoans = payrolls.reduce((sum, p) => sum + (p.loanDeduction || 0), 0);
  const totalAbsents = payrolls.reduce((sum, p) => sum + (p.absentDeduction || 0), 0);
  const totalPF = payrolls.reduce((sum, p) => sum + (p.providentFundDeduction || 0), 0);
  const totalBonuses = payrolls.reduce((sum, p) => sum + (p.bonusAmount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto flex flex-col print:shadow-none print:w-full print:rounded-none">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                বেতন রিপোর্ট ও আর্থিক বিশ্লেষণ (Payroll Financial Analytics)
              </h2>
              <p className="text-xs text-slate-500">
                কর্মকাল: {getBengaliMonthYear(monthYear)} | সর্বমোট স্টাফ: {toBengaliNumerals(payrolls.length)} জন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট রিপোর্ট
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-800 bg-white">
          
          {/* Institutional Branding */}
          <div className="text-center border-b-2 border-emerald-900/40 pb-4 space-y-1">
            <div className="text-[10px] tracking-widest text-emerald-800 font-semibold font-serif">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
              জামিয়া আরাবিয়া দারুল উলুম মাদরাসা
            </h1>
            <p className="text-xs font-medium text-slate-600">
              হিসাব ও নিরীক্ষা বিভাগ — মাসিক বেতন বিশ্লেষণ ও বাজেট রিপোর্ট
            </p>
            <div className="inline-block px-3 py-0.5 mt-1 bg-emerald-50 border border-emerald-300 rounded-full text-xs font-bold text-emerald-900">
              মাসিক আর্থিক বিবরণী: {getBengaliMonthYear(monthYear)}
            </div>
          </div>

          {/* High Level Key Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold block">সর্বমোট গ্রস বেতন বাজেট</span>
              <p className="text-xl font-bold text-slate-900 mt-1">৳{grandGross.toLocaleString('bn-BD')}</p>
              <span className="text-[10px] text-slate-400">মূল বেতন + সকল ভাতা + বোনাস</span>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-[10px] text-purple-700 font-semibold block">উৎসব ও বিশেষ বোনাস</span>
              <p className="text-xl font-bold text-purple-950 mt-1">৳{totalBonuses.toLocaleString('bn-BD')}</p>
              <span className="text-[10px] text-purple-600">উৎসব উপলক্ষে অতিরিক্ত মঞ্জুরি</span>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] text-rose-700 font-semibold block">সর্বমোট কর্তন ও সমন্বয়</span>
              <p className="text-xl font-bold text-rose-950 mt-1">৳{grandDeductions.toLocaleString('bn-BD')}</p>
              <span className="text-[10px] text-rose-600">অগ্রিম, লোন ও অনুপস্থিতি কর্তন</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-semibold block">চূড়ান্ত নিট ব্যয় (Net Disbursed)</span>
              <p className="text-xl font-black text-emerald-950 mt-1">৳{grandNet.toLocaleString('bn-BD')}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">প্রকৃত মাদরাসা তহবিল থেকে প্রদেয়</span>
            </div>
          </div>

          {/* Department-wise Financial Breakdown */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-700" />
              বিভাগওয়ারী বেতন ও বাজেট বণ্টন (Department Breakdown)
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-3">বিভাগের নাম</th>
                    <th className="p-3 text-center">জনবল</th>
                    <th className="p-3 text-right">ধার্য বেতন (Gross)</th>
                    <th className="p-3 text-right">কর্তনসমূহ</th>
                    <th className="p-3 text-right">নিট প্রদেয় (Net)</th>
                    <th className="p-3 text-right">বাজেট অংশ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departmentData.map((d) => {
                    const percentage = grandNet > 0 ? ((d.net / grandNet) * 100).toFixed(1) : '0';
                    return (
                      <tr key={d.department} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{d.department}</td>
                        <td className="p-3 text-center font-medium">{toBengaliNumerals(d.count)} জন</td>
                        <td className="p-3 text-right font-medium">৳{d.gross.toLocaleString('bn-BD')}</td>
                        <td className="p-3 text-right text-rose-700">৳{d.deductions.toLocaleString('bn-BD')}</td>
                        <td className="p-3 text-right font-bold text-emerald-900">৳{d.net.toLocaleString('bn-BD')}</td>
                        <td className="p-3 text-right">
                          <span className="font-mono font-bold text-slate-700">{toBengaliNumerals(percentage)}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 font-bold text-slate-900">
                    <td className="p-3">সর্বমোট</td>
                    <td className="p-3 text-center">{toBengaliNumerals(payrolls.length)} জন</td>
                    <td className="p-3 text-right">৳{grandGross.toLocaleString('bn-BD')}</td>
                    <td className="p-3 text-right text-rose-800">৳{grandDeductions.toLocaleString('bn-BD')}</td>
                    <td className="p-3 text-right text-emerald-950 font-black">৳{grandNet.toLocaleString('bn-BD')}</td>
                    <td className="p-3 text-right font-mono">১০০%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Deductions Deep-Dive */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-rose-700" />
              কর্তন ও তহবিল সমন্বয় বিশ্লেষণ (Deductions Analytics)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium block">বেতন অগ্রিম কর্তন</span>
                <p className="text-base font-bold text-rose-700 mt-0.5">৳{totalAdvances.toLocaleString('bn-BD')}</p>
                <span className="text-[10px] text-slate-400">অগ্রিম তহবিল সমন্বয়</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium block">লোন/কর্জ কিস্তি কর্তন</span>
                <p className="text-base font-bold text-rose-700 mt-0.5">৳{totalLoans.toLocaleString('bn-BD')}</p>
                <span className="text-[10px] text-slate-400">কর্জে হাসানা রিকভারি</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium block">অনুপস্থিতি কর্তন</span>
                <p className="text-base font-bold text-rose-700 mt-0.5">৳{totalAbsents.toLocaleString('bn-BD')}</p>
                <span className="text-[10px] text-slate-400">ছুটি অতিরিক্ত অনুপস্থিতি</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium block">প্রভিডেন্ট ফান্ড সঞ্চয়</span>
                <p className="text-base font-bold text-rose-700 mt-0.5">৳{totalPF.toLocaleString('bn-BD')}</p>
                <span className="text-[10px] text-slate-400">ভবিষ্যত কল্যাণ তহবিল</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-10 text-center text-xs text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                হিসাব কর্মকর্তা
              </div>
              <div className="text-[10px] text-slate-500">প্রতিবেদন প্রস্তুতকারী</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                অভ্যন্তরীণ নিরীক্ষক
              </div>
              <div className="text-[10px] text-slate-500">বাজেট ও অডিট পরীক্ষক</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                মুহতামিম / প্রিন্সিপাল
              </div>
              <div className="text-[10px] text-slate-500">চূড়ান্ত অনুমোদনকারী</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
