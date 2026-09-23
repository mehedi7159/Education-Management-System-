import React from 'react';
import {
  Printer,
  Download,
  Building,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';
import { SalaryPayrollEntity, DepartmentType } from '../../types';
import { toBengaliNumerals, formatTaka } from '../../utils/format';

interface PrintableSalarySheetProps {
  monthYear: string;
  payrolls: SalaryPayrollEntity[];
  onClose: () => void;
}

export const PrintableSalarySheet: React.FC<PrintableSalarySheetProps> = ({
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = [
      'ক্র নং',
      'আইডি',
      'নাম',
      'পদবী',
      'বিভাগ',
      'মূল বেতন',
      'বাড়ি ভাড়া',
      'চিকিৎসা',
      'যাতায়াত',
      'খাবার/মেস',
      'বিশেষ দায়িত্ব',
      'অন্যান্য ভাতা',
      'মোট ভাতা',
      'বোনাস',
      'মোট ধার্যকৃত বেতন',
      'অগ্রিম কর্তন',
      'লোন কর্তন',
      'অনুপস্থিতি কর্তন',
      'প্রভিডেন্ট ফান্ড',
      'অন্যান্য কর্তন',
      'মোট কর্তন',
      'নিট প্রদেয় বেতন',
      'পরিশোধের অবস্থা',
      'পেমেন্ট মেথড',
    ];

    const rows = payrolls.map((p, idx) => [
      idx + 1,
      p.employeeId,
      `"${p.staffName}"`,
      `"${p.designation}"`,
      `"${p.department}"`,
      p.baseSalary,
      p.allowances?.houseRent || 0,
      p.allowances?.medical || 0,
      p.allowances?.conveyance || 0,
      p.allowances?.foodOrMess || 0,
      p.allowances?.specialDuty || 0,
      p.allowances?.other || 0,
      p.totalAllowances,
      p.bonusAmount || 0,
      p.grossSalary,
      p.advanceDeduction || 0,
      p.loanDeduction || 0,
      p.absentDeduction || 0,
      p.providentFundDeduction || 0,
      p.otherDeductions || 0,
      p.totalDeductions,
      p.netPayable,
      p.paymentStatus === 'PAID' ? 'পরিশোধিত' : 'অপেক্ষমান',
      p.paymentMethod || 'ক্যাশ / ব্যাংক',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Salary-Sheet-${monthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grand totals
  const totalBase = payrolls.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalHouseRent = payrolls.reduce((sum, p) => sum + (p.allowances?.houseRent || 0), 0);
  const totalMedical = payrolls.reduce((sum, p) => sum + (p.allowances?.medical || 0), 0);
  const totalConveyance = payrolls.reduce((sum, p) => sum + (p.allowances?.conveyance || 0), 0);
  const totalFood = payrolls.reduce((sum, p) => sum + (p.allowances?.foodOrMess || 0), 0);
  const totalDuty = payrolls.reduce((sum, p) => sum + (p.allowances?.specialDuty || 0), 0);
  const totalOtherAllow = payrolls.reduce((sum, p) => sum + (p.allowances?.other || 0), 0);
  const totalBonus = payrolls.reduce((sum, p) => sum + (p.bonusAmount || 0), 0);
  const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalAdvance = payrolls.reduce((sum, p) => sum + (p.advanceDeduction || 0), 0);
  const totalLoan = payrolls.reduce((sum, p) => sum + (p.loanDeduction || 0), 0);
  const totalAbsent = payrolls.reduce((sum, p) => sum + (p.absentDeduction || 0), 0);
  const totalPF = payrolls.reduce((sum, p) => sum + (p.providentFundDeduction || 0), 0);
  const totalOtherDeduct = payrolls.reduce((sum, p) => sum + (p.otherDeductions || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalNetPayable = payrolls.reduce((sum, p) => sum + p.netPayable, 0);
  const paidCount = payrolls.filter((p) => p.paymentStatus === 'PAID').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto flex flex-col print:max-h-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Modal Header & Print Bar (Hidden in Print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                মাসিক বেতন শিট (Monthly Salary Sheet)
              </h2>
              <p className="text-xs text-slate-600">
                কর্মকাল: {getBengaliMonthYear(monthYear)} | সর্বমোট শিক্ষক ও স্টাফ: {toBengaliNumerals(payrolls.length)} জন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              CSV ডাউনলোড
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              প্রিন্ট / PDF সংরক্ষণ
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-8 space-y-6 print:p-2 print:space-y-4 text-xs text-slate-800 bg-white">
          
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-emerald-900/40 pb-4 space-y-1">
            <div className="text-[11px] tracking-widest text-emerald-800 font-semibold font-serif">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              জামিয়া আরাবিয়া দারুল উলুম মাদরাসা
            </h1>
            <p className="text-xs font-medium text-slate-700">
              হিসাব ও অর্থ বিভাগ — কেন্দ্রীয় বেতন ও ভাতা বিবরণী
            </p>
            <div className="inline-block px-4 py-1 mt-1 bg-emerald-50 border border-emerald-300 rounded-full text-xs font-bold text-emerald-900">
              মাসিক বেতন শিট: {getBengaliMonthYear(monthYear)} খ্রি.
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl print:bg-transparent print:border-slate-300">
            <div>
              <span className="text-[10px] text-slate-600 font-medium">মোট শিক্ষক/স্টাফ:</span>
              <p className="text-sm font-bold text-slate-900">{toBengaliNumerals(payrolls.length)} জন</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-medium">সর্বমোট ধার্য বেতন:</span>
              <p className="text-sm font-bold text-slate-900">{formatTaka(totalGross)}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-medium">সর্বমোট কর্তন (Advance/Loan/PF):</span>
              <p className="text-sm font-bold text-rose-700">{formatTaka(totalDeductions)}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-medium">সর্বমোট নিট প্রদেয় (Net):</span>
              <p className="text-sm font-bold text-emerald-800">{formatTaka(totalNetPayable)}</p>
            </div>
          </div>

          {/* Master Salary Ledger Table */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px] leading-tight">
              <thead>
                <tr className="bg-emerald-900 text-white font-bold text-center border-b border-slate-400 divide-x divide-emerald-800">
                  <th className="p-2 w-7" rowSpan={2}>ক্র</th>
                  <th className="p-2 w-24 text-left" rowSpan={2}>শিক্ষক / স্টাফের বিবরণ</th>
                  <th className="p-2 w-16" rowSpan={2}>বিভাগ</th>
                  <th className="p-2 w-16" rowSpan={2}>মূল বেতন</th>
                  <th className="p-1.5" colSpan={6}>ভাতাসমূহ (Allowances)</th>
                  <th className="p-2 w-14" rowSpan={2}>বোনাস</th>
                  <th className="p-2 w-16 bg-emerald-950" rowSpan={2}>ধার্য বেতন (Gross)</th>
                  <th className="p-1.5" colSpan={4}>কর্তনসমূহ (Deductions)</th>
                  <th className="p-2 w-14" rowSpan={2}>মোট কর্তন</th>
                  <th className="p-2 w-18 bg-emerald-950" rowSpan={2}>নিট প্রদেয় (Net)</th>
                  <th className="p-2 w-14" rowSpan={2}>অবস্থা</th>
                  <th className="p-2 w-20" rowSpan={2}>স্বাক্ষর / রসিদ</th>
                </tr>
                <tr className="bg-emerald-800 text-[10px] text-white text-center border-b border-slate-400 divide-x divide-emerald-700">
                  <th className="p-1 w-11">বাড়িভাড়া</th>
                  <th className="p-1 w-11">চিকিৎসা</th>
                  <th className="p-1 w-11">যাতায়াত</th>
                  <th className="p-1 w-11">খাবার</th>
                  <th className="p-1 w-11">দায়িত্ব</th>
                  <th className="p-1 w-11">অন্যান্য</th>
                  <th className="p-1 w-11">অগ্রিম</th>
                  <th className="p-1 w-11">লোন</th>
                  <th className="p-1 w-11">অনুপস্থিত</th>
                  <th className="p-1 w-11">PF/অন্যান্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {payrolls.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 divide-x divide-slate-200 ${
                      idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <td className="p-1.5 text-center font-medium text-slate-600">
                      {toBengaliNumerals(idx + 1)}
                    </td>
                    <td className="p-1.5 font-medium">
                      <div className="font-bold text-slate-900">{p.staffName}</div>
                      <div className="text-[10px] text-slate-600">
                        {p.designation} <span className="text-slate-400">({p.employeeId})</span>
                      </div>
                    </td>
                    <td className="p-1.5 text-center text-[10px] text-slate-700">{p.department}</td>
                    <td className="p-1.5 text-right font-semibold text-slate-900">
                      {toBengaliNumerals(p.baseSalary)}
                    </td>
                    <td className="p-1.5 text-right text-slate-700">
                      {toBengaliNumerals(p.allowances?.houseRent || 0)}
                    </td>
                    <td className="p-1.5 text-right text-slate-700">
                      {toBengaliNumerals(p.allowances?.medical || 0)}
                    </td>
                    <td className="p-1.5 text-right text-slate-700">
                      {toBengaliNumerals(p.allowances?.conveyance || 0)}
                    </td>
                    <td className="p-1.5 text-right text-slate-700">
                      {toBengaliNumerals(p.allowances?.foodOrMess || 0)}
                    </td>
                    <td className="p-1.5 text-right text-slate-700">
                      {toBengaliNumerals(p.allowances?.specialDuty || 0)}
                    </td>
                    <td className="p-1.5 text-right text-slate-700">
                      {toBengaliNumerals(p.allowances?.other || 0)}
                    </td>
                    <td className="p-1.5 text-right text-purple-800 font-medium">
                      {toBengaliNumerals(p.bonusAmount || 0)}
                    </td>
                    <td className="p-1.5 text-right font-bold text-slate-900 bg-slate-100/60">
                      {toBengaliNumerals(p.grossSalary)}
                    </td>
                    <td className="p-1.5 text-right text-rose-700 font-medium">
                      {toBengaliNumerals(p.advanceDeduction || 0)}
                    </td>
                    <td className="p-1.5 text-right text-rose-700 font-medium">
                      {toBengaliNumerals(p.loanDeduction || 0)}
                    </td>
                    <td className="p-1.5 text-right text-rose-700 font-medium">
                      {toBengaliNumerals(p.absentDeduction || 0)}
                    </td>
                    <td className="p-1.5 text-right text-rose-700 font-medium">
                      {toBengaliNumerals((p.providentFundDeduction || 0) + (p.otherDeductions || 0))}
                    </td>
                    <td className="p-1.5 text-right font-bold text-rose-800 bg-rose-50/40">
                      {toBengaliNumerals(p.totalDeductions)}
                    </td>
                    <td className="p-1.5 text-right font-extrabold text-emerald-900 bg-emerald-50/70">
                      {toBengaliNumerals(p.netPayable)}
                    </td>
                    <td className="p-1.5 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          p.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.paymentStatus === 'PAID' ? 'পরিশোধিত' : 'অপেক্ষমান'}
                      </span>
                    </td>
                    <td className="p-1.5 text-center text-slate-400 text-[9px]">
                      {p.paymentStatus === 'PAID' ? (
                        <span className="text-slate-600 font-mono text-[9px]">
                          {p.paymentMethod === 'BANK_TRANSFER' ? 'ব্যাংক ট্রান্সফার' : 'নগদ গ্রহণ'}
                        </span>
                      ) : (
                        <span className="border-b border-dotted border-slate-400 inline-block w-14 h-4"></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Grand Totals Footer */}
              <tfoot>
                <tr className="bg-slate-200 text-slate-900 font-bold divide-x divide-slate-300 border-t-2 border-slate-400">
                  <td className="p-2 text-center" colSpan={3}>
                    সর্বমোট (Grand Total)
                  </td>
                  <td className="p-2 text-right">{toBengaliNumerals(totalBase)}</td>
                  <td className="p-2 text-right">{toBengaliNumerals(totalHouseRent)}</td>
                  <td className="p-2 text-right">{toBengaliNumerals(totalMedical)}</td>
                  <td className="p-2 text-right">{toBengaliNumerals(totalConveyance)}</td>
                  <td className="p-2 text-right">{toBengaliNumerals(totalFood)}</td>
                  <td className="p-2 text-right">{toBengaliNumerals(totalDuty)}</td>
                  <td className="p-2 text-right">{toBengaliNumerals(totalOtherAllow)}</td>
                  <td className="p-2 text-right text-purple-900">{toBengaliNumerals(totalBonus)}</td>
                  <td className="p-2 text-right bg-slate-300 text-slate-950 font-extrabold">
                    {toBengaliNumerals(totalGross)}
                  </td>
                  <td className="p-2 text-right text-rose-800">{toBengaliNumerals(totalAdvance)}</td>
                  <td className="p-2 text-right text-rose-800">{toBengaliNumerals(totalLoan)}</td>
                  <td className="p-2 text-right text-rose-800">{toBengaliNumerals(totalAbsent)}</td>
                  <td className="p-2 text-right text-rose-800">
                    {toBengaliNumerals(totalPF + totalOtherDeduct)}
                  </td>
                  <td className="p-2 text-right bg-rose-100 text-rose-950 font-extrabold">
                    {toBengaliNumerals(totalDeductions)}
                  </td>
                  <td className="p-2 text-right bg-emerald-200 text-emerald-950 font-black text-xs">
                    {toBengaliNumerals(totalNetPayable)}
                  </td>
                  <td className="p-2 text-center text-[10px]" colSpan={2}>
                    {toBengaliNumerals(paidCount)}/{toBengaliNumerals(payrolls.length)} পরিশোধিত
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount In Words */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 print:bg-transparent">
            কথায় (সর্বমোট নিট প্রদেয়):{' '}
            <span className="text-emerald-900 underline font-bold">
              {formatTaka(totalNetPayable)} টাকা মাত্র
            </span>
          </div>

          {/* Quadruple Signature Authorizations */}
          <div className="grid grid-cols-4 gap-4 pt-12 text-center text-xs text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                হিসাবরক্ষক (Accountant)
              </div>
              <div className="text-[10px] text-slate-500">প্রস্তুতকারী</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                অভ্যন্তরীণ নিরীক্ষক (Auditor)
              </div>
              <div className="text-[10px] text-slate-500">যাচাই ও নিরীক্ষা সম্পন্ন</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                নাজেমে তালিমাত (শিক্ষা সচিব)
              </div>
              <div className="text-[10px] text-slate-500">সুপারিশকারী</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                মুহতামিম / সভাপতি (Principal)
              </div>
              <div className="text-[10px] text-slate-500">চূড়ান্ত অনুমোদন ও মঞ্জুরকারী</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
