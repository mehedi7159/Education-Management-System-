import React, { useState } from 'react';
import { DonationEntity, FundEntity, ProjectEntity, DonorEntity, FundTransferEntity } from '../../types';
import { useTranslation } from '../../i18n';
import { PAYMENT_METHOD_LABELS, DONOR_CATEGORY_LABELS } from '../../constants';
import {
  FileText,
  Calendar,
  Layers,
  Users,
  Target,
  Printer,
  Download,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

interface DonationReportsTabProps {
  donations: DonationEntity[];
  funds: FundEntity[];
  projects: ProjectEntity[];
  donors: DonorEntity[];
  transfers: FundTransferEntity[];
}

type ReportType = 'daily' | 'monthly' | 'annual' | 'donor_wise' | 'fund_wise' | 'project_wise';

export const DonationReportsTab: React.FC<DonationReportsTabProps> = ({
  donations,
  funds,
  projects,
  donors,
  transfers,
}) => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const activeDonations = donations.filter((d) => d.status !== 'VOIDED');

  // Daily calculations
  const dailyDonations = activeDonations.filter((d) => d.date === selectedDate);
  const dailyTotal = dailyDonations.reduce((sum, d) => sum + d.amount, 0);
  const dailyZakatTotal = dailyDonations.filter((d) => d.isZakatEligible).reduce((sum, d) => sum + d.amount, 0);

  // Monthly calculations
  const monthlyDonations = activeDonations.filter((d) => d.date.startsWith(selectedMonth));
  const monthlyTotal = monthlyDonations.reduce((sum, d) => sum + d.amount, 0);
  const monthlyZakatTotal = monthlyDonations.filter((d) => d.isZakatEligible).reduce((sum, d) => sum + d.amount, 0);

  // Annual calculations
  const annualDonations = activeDonations.filter((d) => d.date.startsWith(selectedYear));
  const annualTotal = annualDonations.reduce((sum, d) => sum + d.amount, 0);

  // Export CSV
  const handleExportCSV = () => {
    let rows: string[][] = [];
    let filename = `donation-report-${reportType}.csv`;

    if (reportType === 'daily') {
      rows = [
        ['রশিদ নং', 'তারিখ', 'দাতার নাম', 'মোবাইল', 'তহবিল', 'প্রকল্প', 'মাধ্যম', 'পরিমাণ (টাকা)'],
        ...dailyDonations.map((d) => [
          d.receiptNo,
          d.date,
          d.donorName,
          d.donorMobile,
          d.fundName,
          d.projectName || 'সাধারণ',
          d.paymentMethod,
          d.amount.toString(),
        ]),
      ];
    } else if (reportType === 'donor_wise') {
      rows = [
        ['দাতা কোড', 'দাতার নাম', 'মোবাইল', 'ক্যাটাগরি', 'নিয়মিত দাতা', 'রশিদ সংখ্যা', 'মোট দান (টাকা)'],
        ...donors.map((d) => [
          d.donorNo,
          d.name,
          d.mobile,
          d.category,
          d.isRegularDonor ? 'হ্যাঁ' : 'না',
          d.donationCount.toString(),
          d.totalDonated.toString(),
        ]),
      ];
    } else if (reportType === 'fund_wise') {
      rows = [
        ['তহবিলের নাম', 'কোড', 'সংরক্ষিত কি না', 'বর্তমান স্থিতি (টাকা)', 'মোট লক্ষ্যমাত্রা'],
        ...funds.map((f) => [
          f.nameBangla,
          f.fundCode || '',
          f.isRestricted ? 'সংরক্ষিত (Restricted)' : 'উন্মুক্ত',
          f.currentBalance.toString(),
          (f.targetAmount || 0).toString(),
        ]),
      ];
    } else if (reportType === 'project_wise') {
      rows = [
        ['প্রকল্পের নাম', 'তহবিল', 'আর্থিক লক্ষ্যমাত্রা', 'সংগৃহীত অনুদান', 'অবস্থা'],
        ...projects.map((p) => [
          p.name,
          p.fundName,
          p.targetAmount.toString(),
          p.raisedAmount.toString(),
          p.status,
        ]),
      ];
    } else {
      rows = [
        ['রশিদ নং', 'তারিখ', 'দাতার নাম', 'তহবিল', 'মাধ্যম', 'পরিমাণ (টাকা)'],
        ...monthlyDonations.map((d) => [
          d.receiptNo,
          d.date,
          d.donorName,
          d.fundName,
          d.paymentMethod,
          d.amount.toString(),
        ]),
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Report Switcher & Filter Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
          <button
            onClick={() => setReportType('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'daily'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            দৈনিক প্রতিবেদন
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'monthly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            মাসিক প্রতিবেদন
          </button>
          <button
            onClick={() => setReportType('annual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'annual'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            বার্ষিক প্রতিবেদন
          </button>
          <button
            onClick={() => setReportType('donor_wise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'donor_wise'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            দাতাভিত্তিক হিসাব
          </button>
          <button
            onClick={() => setReportType('fund_wise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'fund_wise'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            তহবিলভিত্তিক স্থিতি
          </button>
          <button
            onClick={() => setReportType('project_wise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              reportType === 'project_wise'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            প্রকল্পভিত্তিক অগ্রগতি
          </button>
        </div>

        {/* Action Buttons & Quick Filters */}
        <div className="flex items-center gap-2">
          {reportType === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text-main)]"
            />
          )}
          {reportType === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text-main)]"
            />
          )}
          {reportType === 'annual' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text-main)]"
            >
              {['2024', '2025', '2026', '2027'].map((yr) => (
                <option key={yr} value={yr}>
                  {yr} অর্থবছর
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-main)] hover:bg-[var(--color-bg)] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            CSV এক্সপোর্ট
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            রিপোর্ট প্রিন্ট
          </button>
        </div>
      </div>

      {/* 1. Daily Report View */}
      {reportType === 'daily' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
              <div className="text-xs text-[var(--color-text-muted)] font-medium">আজকের সর্বমোট সংগৃহীত অনুদান</div>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
                ৳{dailyTotal.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-1">মোট রশিদ: {dailyDonations.length} টি</div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
              <div className="text-xs text-[var(--color-text-muted)] font-medium">যাকাত ও লিল্লাহ খাতভুক্ত</div>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">
                ৳{dailyZakatTotal.toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                হার: {dailyTotal > 0 ? ((dailyZakatTotal / dailyTotal) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
              <div className="text-xs text-[var(--color-text-muted)] font-medium">সাধারণ ও উন্নয়ন তহবিল</div>
              <div className="text-2xl font-black text-blue-600 font-mono mt-1">
                ৳{(dailyTotal - dailyZakatTotal).toLocaleString('bn-BD')}
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-1">উন্মুক্ত ব্যবহারের ফান্ড</div>
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] font-bold text-sm text-[var(--color-text-main)] flex items-center justify-between">
              <span>{selectedDate} তারিখের অনুদান লেনদেন বিবরণী</span>
              <span className="text-xs text-[var(--color-text-muted)]">মোট {dailyDonations.length} টি ভাউচার</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase">
                  <th className="p-3">রশিদ নং</th>
                  <th className="p-3">দাতার নাম ও যোগাযোগ</th>
                  <th className="p-3">তহবিল / উদ্দেশ্য</th>
                  <th className="p-3">পরিশোধ মাধ্যম</th>
                  <th className="p-3 text-right">পরিমাণ (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
                {dailyDonations.length > 0 ? (
                  dailyDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-[var(--color-surface-hover)]">
                      <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{d.receiptNo}</td>
                      <td className="p-3">
                        <div className="font-semibold">{d.donorName}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{d.donorMobile}</div>
                      </td>
                      <td className="p-3">
                        <div>{d.fundName}</div>
                        {d.projectName && (
                          <div className="text-[11px] text-[var(--color-text-muted)]">প্রকল্প: {d.projectName}</div>
                        )}
                      </td>
                      <td className="p-3">{PAYMENT_METHOD_LABELS[d.paymentMethod] || d.paymentMethod}</td>
                      <td className="p-3 text-right font-mono font-bold text-sm">৳{d.amount.toLocaleString('bn-BD')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">
                      এই তারিখে কোনো অনুদান গ্রহণের এন্ট্রি পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Monthly Report View */}
      {reportType === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
              <div className="text-xs text-[var(--color-text-muted)] font-medium">মাসিক সর্বমোট অনুদান ({selectedMonth})</div>
              <div className="text-3xl font-black text-emerald-600 font-mono mt-1">
                ৳{monthlyTotal.toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                সংগৃহীত রশিদ: {monthlyDonations.length} টি | যাকাত খাত: ৳{monthlyZakatTotal.toLocaleString('bn-BD')}
              </p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
              <div className="text-xs text-[var(--color-text-muted)] font-medium">গড় দৈনিক অনুদান সংগ্রহ</div>
              <div className="text-3xl font-black text-blue-600 font-mono mt-1">
                ৳{Math.round(monthlyTotal / 30).toLocaleString('bn-BD')}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">চলতি মাসের ৩০ দিনের গড় হিসাব</p>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] font-bold text-sm text-[var(--color-text-main)]">
              {selectedMonth} মাসের অনুদান বিবরণী
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase">
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">রশিদ নং</th>
                  <th className="p-3">দাতার নাম</th>
                  <th className="p-3">তহবিল</th>
                  <th className="p-3 text-right">পরিমাণ (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
                {monthlyDonations.length > 0 ? (
                  monthlyDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-[var(--color-surface-hover)]">
                      <td className="p-3 whitespace-nowrap">{d.date}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{d.receiptNo}</td>
                      <td className="p-3 font-medium">{d.donorName}</td>
                      <td className="p-3">{d.fundName}</td>
                      <td className="p-3 text-right font-mono font-bold">৳{d.amount.toLocaleString('bn-BD')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">
                      এই মাসে কোনো অনুদান রেকর্ড নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Annual Report View */}
      {reportType === 'annual' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[var(--color-text-muted)] font-medium">
                {selectedYear} অর্থবছরের সর্বমোট অনুদান ও ওয়াকফ
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono mt-1">
                ৳{annualTotal.toLocaleString('bn-BD')}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> বার্ষিক নিরীক্ষিত ফান্ড
              </span>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
            <h4 className="font-bold text-sm text-[var(--color-text-main)] mb-4">
              মাসভিত্তিক অনুদান বণ্টন গ্রাফ ({selectedYear})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {[
                { m: '০১', name: 'জানুয়ারি' },
                { m: '০২', name: 'ফেব্রুয়ারি' },
                { m: '০৩', name: 'মার্চ' },
                { m: '০৪', name: 'এপ্রিল' },
                { m: '০৫', name: 'মে' },
                { m: '০৬', name: 'জুন' },
                { m: '০৭', name: 'জুলাই' },
                { m: '০৮', name: 'আগস্ট' },
                { m: '০৯', name: 'সেপ্টেম্বর' },
                { m: '১০', name: 'অক্টোবর' },
                { m: '১১', name: 'নভেম্বর' },
                { m: '১২', name: 'ডিসেম্বর' },
              ].map((item, idx) => {
                const monthCode = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
                const mTotal = activeDonations
                  .filter((d) => d.date.startsWith(monthCode))
                  .reduce((sum, d) => sum + d.amount, 0);
                const heightPercent = annualTotal > 0 ? Math.min(100, Math.max(10, (mTotal / annualTotal) * 300)) : 10;

                return (
                  <div key={item.m} className="p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] text-center flex flex-col justify-between">
                    <div className="text-xs font-semibold text-[var(--color-text-muted)]">{item.name}</div>
                    <div className="my-3">
                      <div className="w-full bg-[var(--color-surface-hover)] h-12 rounded-lg relative overflow-hidden flex items-end">
                        <div
                          className="w-full bg-emerald-500 rounded-b-lg transition-all"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-[var(--color-text-main)]">
                      ৳{mTotal.toLocaleString('bn-BD')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Donor-wise Report View */}
      {reportType === 'donor_wise' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] font-bold text-sm text-[var(--color-text-main)] flex items-center justify-between">
            <span>সম্মানিত দাতাদের সার্বিক অনুদান বিবরণী (Donor-wise Contribution)</span>
            <span className="text-xs text-[var(--color-text-muted)]">মোট দাতা: {donors.length} জন</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase">
                <th className="p-3">দাতা কোড ও নাম</th>
                <th className="p-3">মোবাইল ও ঠিকানা</th>
                <th className="p-3">ক্যাটাগরি</th>
                <th className="p-3 text-center">নিয়মিত দাতা?</th>
                <th className="p-3 text-center">রশিদ সংখ্যা</th>
                <th className="p-3 text-right">সর্বমোট অনুদান (Lifetime)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
              {donors
                .slice()
                .sort((a, b) => b.totalDonated - a.totalDonated)
                .map((d) => (
                  <tr key={d.id} className="hover:bg-[var(--color-surface-hover)]">
                    <td className="p-3">
                      <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">{d.donorNo}</div>
                      <div className="font-bold text-sm">{d.name}</div>
                    </td>
                    <td className="p-3">
                      <div>{d.mobile}</div>
                      {d.address && <div className="text-[11px] text-[var(--color-text-muted)]">{d.address}</div>}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--color-bg)] border border-[var(--color-border)]">
                        {DONOR_CATEGORY_LABELS[d.category]?.bn || d.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {d.isRegularDonor ? (
                        <span className="text-emerald-600 font-bold">✓ হ্যাঁ</span>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-medium">{d.donationCount} টি</td>
                    <td className="p-3 text-right font-mono font-bold text-sm text-emerald-600">
                      ৳{d.totalDonated.toLocaleString('bn-BD')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Fund-wise Report View */}
      {reportType === 'fund_wise' && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">কঠোর তহবিল পৃথকীকরণ ও শরীয়ত আইসোলেশন নীতি (Fund Isolation Policy):</p>
              <p className="mt-0.5">
                সংরক্ষিত তহবিল (লিল্লাহ, যাকাত, ভবন ওয়াকফ) সাধারণ প্রাতিষ্ঠানিক তহবিলের সাথে মিশ্রিত করা যাবে না। প্রতিটি তহবিলের একক ও সুনির্দিষ্ট হিসাব এবং স্থানান্তর অডিট ট্রেইল সংরক্ষিত রয়েছে।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funds.map((f) => (
              <div
                key={f.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: f.color || '#059669' }}
                ></div>
                <div className="flex items-start justify-between pt-1">
                  <div>
                    <h4 className="font-bold text-base text-[var(--color-text-main)]">{f.nameBangla}</h4>
                    <p className="text-xs text-[var(--color-text-muted)]">{f.fundCode}</p>
                  </div>
                  {f.isRestricted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      সংরক্ষিত (Restricted)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      উন্মুক্ত তহবিল
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">বর্তমান অনুমোদিত স্থিতি:</span>
                  <span className="text-xl font-mono font-bold text-emerald-600">
                    ৳{f.currentBalance.toLocaleString('bn-BD')}
                  </span>
                </div>

                {f.restrictionPurpose && (
                  <p className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-bg)] p-2.5 rounded-lg border border-[var(--color-border)]">
                    উদ্দেশ্য: {f.restrictionPurpose}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Project-wise Report View */}
      {reportType === 'project_wise' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const progress = p.targetAmount > 0 ? Math.min(100, Math.round((p.raisedAmount / p.targetAmount) * 100)) : 0;
            return (
              <div
                key={p.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-[var(--color-text-main)]">{p.name}</h4>
                    <span className="text-xs text-[var(--color-text-muted)]">সংযুক্ত ফান্ড: {p.fundName}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      p.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : p.status === 'COMPLETED'
                        ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    {p.status === 'ACTIVE' ? 'চলমান' : p.status === 'COMPLETED' ? 'সম্পন্ন' : 'স্থগিত'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-muted)]">সংগৃহীত: ৳{p.raisedAmount.toLocaleString('bn-BD')}</span>
                    <span className="font-mono font-bold text-emerald-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-[var(--color-bg)] h-3 rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                    <span>শুরু: {p.startDate}</span>
                    <span>লক্ষ্যমাত্রা: ৳{p.targetAmount.toLocaleString('bn-BD')}</span>
                  </div>
                </div>

                {p.description && (
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{p.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
