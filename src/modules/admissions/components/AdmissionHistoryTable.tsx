import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Printer,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Receipt,
  Users,
} from 'lucide-react';
import { AdmissionReceiptEntity, ClassEntity } from '../../../types';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { formatTaka, toBengaliNumerals, formatDate } from '../../../utils/format';

interface HistoryProps {
  receipts: AdmissionReceiptEntity[];
  classes: ClassEntity[];
  onSelectReceipt: (receipt: AdmissionReceiptEntity) => void;
  onNewAdmissionClick: () => void;
}

export const AdmissionHistoryTable: React.FC<HistoryProps> = ({
  receipts,
  classes,
  onSelectReceipt,
  onNewAdmissionClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchSearch =
        !searchTerm.trim() ||
        r.studentNameBangla.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentNameEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.formNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.guardianMobile.includes(searchTerm);

      const matchClass = selectedClass === 'ALL' || r.className === selectedClass;
      const matchStatus = selectedStatus === 'ALL' || r.paymentStatus === selectedStatus;

      return matchSearch && matchClass && matchStatus;
    });
  }, [receipts, searchTerm, selectedClass, selectedStatus]);

  // Aggregate Metrics
  const totalCollected = receipts.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
  const totalDue = receipts.reduce((sum, r) => sum + (r.dueAmount || 0), 0);
  const totalWaivers = receipts.reduce((sum, r) => sum + (r.discountAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">মোট ভর্তি সম্পন্ন</span>
            <h3 className="text-2xl font-bold text-[var(--color-text-main)] mt-1">
              {toBengaliNumerals(receipts.length)} <span className="text-xs font-normal">জন</span>
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">মোট সংগৃহীত ফি</span>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatTaka(totalCollected)}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">অবশিষ্ট বকেয়া ফি</span>
            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {formatTaka(totalDue)}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] font-medium">অনুমোদিত বিশেষ ছাড়</span>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {formatTaka(totalWaivers)}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="search-admission-receipts"
              type="text"
              placeholder="শিক্ষার্থীর নাম, ভর্তি নং, রসিদ নং বা মোবাইল নম্বর দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <Select
            id="filter-admission-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-36 text-xs"
          >
            <option value="ALL">সকল শ্রেণি</option>
            {classes.map((c) => (
              <option key={c.id} value={c.nameBangla}>
                {c.nameBangla}
              </option>
            ))}
          </Select>

          <Select
            id="filter-admission-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-32 text-xs"
          >
            <option value="ALL">সকল স্ট্যাটাস</option>
            <option value="PAID">পরিশোধিত</option>
            <option value="PARTIAL">আংশিক</option>
            <option value="UNPAID">বকেয়া</option>
          </Select>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onNewAdmissionClick}
          className="bg-[var(--color-primary)] text-white text-xs font-bold shrink-0 w-full sm:w-auto"
        >
          + নতুন শিক্ষার্থী ভর্তি
        </Button>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="px-4 py-3 font-semibold">রসিদ ও ভর্তি নং</th>
                <th className="px-4 py-3 font-semibold">শিক্ষার্থীর নাম</th>
                <th className="px-4 py-3 font-semibold">শ্রেণি ও শাখা</th>
                <th className="px-4 py-3 font-semibold">রোল নং</th>
                <th className="px-4 py-3 font-semibold">অভিভাবক ও মোবাইল</th>
                <th className="px-4 py-3 font-semibold text-right">মোট ফি</th>
                <th className="px-4 py-3 font-semibold text-right">আদায়</th>
                <th className="px-4 py-3 font-semibold text-right">বকেয়া</th>
                <th className="px-4 py-3 font-semibold text-center">স্ট্যাটাস</th>
                <th className="px-4 py-3 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    কোনো ভর্তির রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-[var(--color-surface-muted)]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[var(--color-primary)] block">
                        {r.receiptNo}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        {r.admissionNo} • {formatDate(r.admissionDate)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.studentPhotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150'}
                          alt={r.studentNameBangla}
                          className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-[var(--color-text-main)] truncate max-w-[140px]">
                            {r.studentNameBangla}
                          </p>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            {r.isResidential ? 'আবাসিক' : 'অনাবাসিক'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-[var(--color-text-main)]">
                      {r.className}
                      <span className="block text-[10px] text-[var(--color-text-muted)] font-normal">
                        শাখা: {r.sectionName}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-bold text-[var(--color-text-main)]">
                      {toBengaliNumerals(r.rollNo)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--color-text-main)]">{r.guardianName}</p>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{r.guardianMobile}</span>
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-[var(--color-text-main)]">
                      {formatTaka(r.totalAmount)}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatTaka(r.paidAmount)}
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-rose-500">
                      {r.dueAmount > 0 ? formatTaka(r.dueAmount) : '—'}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.dueAmount === 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : r.paidAmount > 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {r.dueAmount === 0 ? 'পরিশোধিত' : r.paidAmount > 0 ? 'আংশিক' : 'বকেয়া'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectReceipt(r)}
                        className="text-xs py-1 px-2.5 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1 text-[var(--color-primary)]" />
                        রসিদ প্রিন্ট
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
