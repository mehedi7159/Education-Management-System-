import React, { useState } from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Ban,
  CheckCircle2,
  Building2,
  Calendar,
  User,
  GraduationCap,
  CreditCard,
  QrCode,
  Layers,
} from 'lucide-react';
import { FeePaymentRecord, Tenant, PaymentMethod, RoleType } from '../../../types';
import { formatTaka, toBengaliNumerals, numberToBanglaWords, formatDate } from '../../../utils/format';
import { PAYMENT_METHOD_LABELS } from '../../../constants';
import { api } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

interface PrintableMoneyReceiptProps {
  payment: FeePaymentRecord;
  tenant: Tenant | null;
  onClose: () => void;
  onPaymentUpdated?: (updated: FeePaymentRecord) => void;
  onOpenVoidModal?: (payment: FeePaymentRecord) => void;
}

export const PrintableMoneyReceipt: React.FC<PrintableMoneyReceiptProps> = ({
  payment,
  tenant,
  onClose,
  onPaymentUpdated,
  onOpenVoidModal,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copyMode, setCopyMode] = useState<'1-copy' | '2-copy' | '3-copy'>('2-copy');
  const [isReprinting, setIsReprinting] = useState<boolean>(false);

  const isVoided = payment.status === 'VOIDED';
  const isReprint = (payment.reprintCount || 0) > 0;

  const handlePrint = async () => {
    // If not first time viewing, record reprint audit
    if (payment.reprintCount !== undefined && !isVoided) {
      try {
        setIsReprinting(true);
        const res = await api.recordReceiptReprint(payment.id);
        if (res.success && res.data) {
          onPaymentUpdated?.(res.data);
        }
      } catch {
        // Continue to print even if audit log fails
      } finally {
        setIsReprinting(false);
      }
    }
    window.print();
  };

  const copies = copyMode === '1-copy'
    ? [{ key: 'student', title: 'গ্রাহক / শিক্ষার্থী কপি (Student Copy)', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300' }]
    : copyMode === '2-copy'
    ? [
        { key: 'student', title: 'শিক্ষার্থী কপি (Student Copy)', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
        { key: 'office', title: 'অফিস / হিসাব শাখা কপি (Office Copy)', badgeBg: 'bg-blue-50 text-blue-800 border-blue-300' },
      ]
    : [
        { key: 'student', title: 'শিক্ষার্থী কপি (Student Copy)', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
        { key: 'office', title: 'হিসাব শাখা কপি (Accounts Copy)', badgeBg: 'bg-blue-50 text-blue-800 border-blue-300' },
        { key: 'audit', title: 'নিরীক্ষা / মুহতামিম কপি (Audit Copy)', badgeBg: 'bg-amber-50 text-amber-800 border-amber-300' },
      ];

  const canVoid =
    !isVoided &&
    user &&
    [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT].includes(
      user.role as RoleType
    );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:border-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Top Action Toolbar (Hidden when printing) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${isVoided ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isVoided ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">অফিসিয়াল মানিরিসিপ্ট ভাউচার</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  #{payment.receiptNo}
                </span>
                {isVoided && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    বাতিলকৃত (VOIDED)
                  </span>
                )}
                {isReprint && !isVoided && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    পুনঃমুদ্রণ ({payment.reprintCount} বার)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                মুদ্রণযোগ্য A4/A5 লেআউট • প্রতিষ্ঠান ও শিক্ষার্থীর নিজস্ব কপি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy layout selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setCopyMode('1-copy')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  copyMode === '1-copy' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ১ কপি
              </button>
              <button
                type="button"
                onClick={() => setCopyMode('2-copy')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  copyMode === '2-copy' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ২ কপি (আদর্শ)
              </button>
              <button
                type="button"
                onClick={() => setCopyMode('3-copy')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  copyMode === '3-copy' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                ৩ কপি (মাদরাসা)
              </button>
            </div>

            {/* Void button if authorized */}
            {canVoid && onOpenVoidModal && (
              <button
                type="button"
                onClick={() => onOpenVoidModal(payment)}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                title="ভুল এন্ট্রি হলে রশিদ বাতিল ও সমন্বয় করুন"
              >
                <Ban className="w-3.5 h-3.5" />
                বাতিল / রিভার্সাল
              </button>
            )}

            {/* Print button */}
            <button
              type="button"
              id="btn-print-official-receipt"
              onClick={handlePrint}
              disabled={isReprinting}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              {isReprint ? 'রিপ্রিন্ট করুন' : 'প্রিন্ট / PDF'}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Void Warning Banner if Voided */}
        {isVoided && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 p-3 px-6 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200 print:hidden">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>সতর্কতা:</strong> এই রশিদটি বাতিল করা হয়েছে। রিভার্সাল ভাউচার: <code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1 py-0.5 rounded">{payment.reversalVoucherNo || 'N/A'}</code> • কারণ: {payment.voidReason} • বাতিলকারী: {payment.voidedBy} ({payment.voidedAt})
              </span>
            </div>
            <span className="font-bold px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100">
              অকার্যকর
            </span>
          </div>
        )}

        {/* Printable Area - Supports Multi-Copy Layout */}
        <div id="printable-receipt-container" className="p-4 sm:p-6 overflow-y-auto space-y-8 bg-slate-100 dark:bg-slate-950/50 print:bg-white print:p-0 print:space-y-6">
          {copies.map((copy, index) => (
            <div
              key={copy.key}
              className="relative bg-white text-slate-900 rounded-xl border-2 border-slate-300 shadow-md p-5 sm:p-6 overflow-hidden print:border-slate-800 print:shadow-none print:rounded-none print:m-0 print:p-4"
              style={{ minHeight: copyMode === '1-copy' ? 'auto' : '360px' }}
            >
              {/* Background Void Watermark */}
              {isVoided && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
                  <div className="transform -rotate-12 border-8 border-dashed border-rose-500/40 text-rose-600/30 font-black text-5xl sm:text-7xl uppercase tracking-widest px-8 py-4 rounded-3xl">
                    বাতিলকৃত / VOIDED
                  </div>
                </div>
              )}

              {/* Background Institution Watermark (Subtle) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] z-0">
                <Building2 className="w-80 h-80 text-slate-900" />
              </div>

              {/* Top Perforation Indicator (if not first copy) */}
              {index > 0 && (
                <div className="border-t-2 border-dashed border-slate-400 mb-6 -mt-3 pt-2 text-center print:block">
                  <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase bg-white px-3 -mt-4 inline-block">
                    ✂ কুপন কাটার অংশ (Cut along perforation line)
                  </span>
                </div>
              )}

              <div className="relative z-10 space-y-4">
                {/* 1. Header: Bismillah, Institution Logo, Name, Address */}
                <div className="border-b-2 border-slate-800 pb-3">
                  <div className="text-center font-serif text-xs text-slate-500 italic mb-1">
                    بِسْمِ اللهِ الرَّحْمٰনِ الرَّحِيْمِ
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    {/* Institution Logo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl border border-slate-200 p-1 flex items-center justify-center bg-slate-50 overflow-hidden">
                      {tenant?.logoUrl ? (
                        <img
                          src={tenant.logoUrl}
                          alt={tenant.nameBangla || 'Madrasah Logo'}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-emerald-700 text-white flex flex-col items-center justify-center text-center p-1 font-bold">
                          <Building2 className="w-6 h-6 mb-0.5" />
                          <span className="text-[9px] leading-tight">মাদরাসা</span>
                        </div>
                      )}
                    </div>

                    {/* Institution Name & Details */}
                    <div className="text-center flex-1">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                        {tenant?.nameBangla || 'দারুল উলুম ঢাকা মডেল কামিল মাদরাসা'}
                      </h2>
                      {tenant?.nameEnglish && (
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          {tenant.nameEnglish}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 mt-0.5">
                        {tenant?.address ? `${tenant.address}, ${tenant.district || ''}` : 'মিরপুর-১০, ঢাকা-১২১৬, বাংলাদেশ'} • ফোন: {tenant?.phone || '০১৭০০-০০০০০০'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        হিসাব ও অর্থ বিভাগ — কেন্দ্রীয় ক্যাশ ও ফি আদায় কাউন্টার
                      </p>
                    </div>

                    {/* Copy Badge & QR Stamp */}
                    <div className="w-20 sm:w-24 shrink-0 flex flex-col items-end text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${copy.badgeBg}`}>
                        {copy.title.split('(')[0]}
                      </span>
                      <div className="mt-1.5 p-1 border border-slate-300 rounded bg-slate-50 flex flex-col items-center">
                        <QrCode className="w-9 h-9 text-slate-800" />
                        <span className="text-[8px] font-mono text-slate-500 mt-0.5">VERIFIED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Voucher Meta: Receipt No, Date, Student & Class Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans">
                  <div>
                    <span className="text-slate-500 block text-[11px]">রশিদ নম্বর (Receipt No):</span>
                    <span className="font-mono font-bold text-indigo-900 text-sm">
                      {payment.receiptNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">তারিখ ও সময় (Date):</span>
                    <span className="font-semibold text-slate-800">
                      {payment.paymentDate ? formatDate(payment.paymentDate.split(' ')[0], 'bn') : '—'}
                      <span className="text-[11px] font-mono text-slate-500 ml-1">
                        {payment.paymentDate?.split(' ')[1]?.substring(0, 5) || ''}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">শিক্ষার্থীর নাম (Student):</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {payment.studentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">শ্রেণি ও রোল (Class & Roll):</span>
                    <span className="font-semibold text-slate-800">
                      {payment.className} • রোল #{toBengaliNumerals(payment.studentRoll || 0) || '—'}
                    </span>
                  </div>
                </div>

                {/* 3. Itemized Financial Breakdown Table */}
                <table className="w-full text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 text-center w-10">ক্র.</th>
                      <th className="p-2 border-r border-slate-300 text-left">ফি-এর বিবরণ ও খাত</th>
                      <th className="p-2 border-r border-slate-300 text-center">মাস / সেশন</th>
                      <th className="p-2 border-r border-slate-300 text-right">মূল ধার্য (Amount)</th>
                      <th className="p-2 border-r border-slate-300 text-right">ছাড় / ওয়েভার</th>
                      <th className="p-2 border-r border-slate-300 text-right font-bold text-emerald-800">পরিশোধিত (Paid)</th>
                      <th className="p-2 text-right font-bold text-rose-800">অবশিষ্ট বকেয়া (Due)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2.5 border-r border-slate-300 text-center font-mono">১</td>
                      <td className="p-2.5 border-r border-slate-300">
                        <div className="font-bold text-slate-900 text-sm">
                          {payment.feeType || 'শিক্ষার্থী নিয়মিত বেতন ও ফি'}
                        </div>
                        {payment.notes && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            মন্তব্য: {payment.notes}
                          </div>
                        )}
                        {payment.transactionRef && (
                          <div className="text-[11px] font-mono text-indigo-700 mt-0.5">
                            লেনদেন আইডি (Trx ID): {payment.transactionRef}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-medium text-slate-700">
                        {payment.monthYear || 'চলতি শিক্ষাবর্ষ'}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-right font-mono font-medium">
                        {formatTaka(payment.originalAmount || payment.amountPaid + payment.remainingDue)}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-right font-mono text-slate-600">
                        {payment.waiverDiscount ? formatTaka(payment.waiverDiscount) : '৳ ০.০০'}
                      </td>
                      <td className="p-2.5 border-r border-slate-300 text-right font-mono font-bold text-sm text-emerald-700 bg-emerald-50/40">
                        {formatTaka(payment.amountPaid)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-sm text-rose-700 bg-rose-50/40">
                        {formatTaka(payment.remainingDue)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-400 font-bold">
                      <td colSpan={5} className="p-2 text-right border-r border-slate-300">
                        মোট আদায়কৃত অর্থ (Net Amount Received):
                      </td>
                      <td className="p-2 text-right font-mono text-sm text-emerald-800 bg-emerald-100/60 border-r border-slate-300">
                        {formatTaka(payment.amountPaid)}
                      </td>
                      <td className="p-2 text-right font-mono text-sm text-rose-800 bg-rose-100/60">
                        {formatTaka(payment.remainingDue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* 4. Words, Payment Method & Collector Row */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-500 font-medium">কথায় (In Words): </span>
                      <strong className="text-slate-900 font-serif">
                        {numberToBanglaWords(payment.amountPaid)}
                      </strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-slate-500">পেমেন্ট মাধ্যম: </span>
                        <strong className="text-slate-900">
                          {PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500">আদায়কারী (Collector): </span>
                        <strong className="text-slate-900">
                          {payment.receivedBy || 'হিসাব শাখা'}
                        </strong>
                      </div>
                    </div>
                  </div>
                  {isReprint && !isVoided && (
                    <div className="text-[10px] text-amber-800 font-medium pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>
                        ⚠ এই কপিটি একটি সিস্টেমিক পুনঃমুদ্রণ (কপি #{payment.reprintCount})।
                      </span>
                      <span>
                        সর্বশেষ পুনঃমুদ্রণ: {payment.lastReprintedAt || '—'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 5. Official Signature Blocks */}
                <div className="pt-8 pb-2 grid grid-cols-4 gap-4 text-center text-xs text-slate-700">
                  <div>
                    <div className="border-t border-slate-400 pt-1 text-[11px] font-medium">
                      শিক্ষার্থী / অভিভাবকের স্বাক্ষর
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 text-[11px] font-medium">
                      আদায়কারী ও প্রস্তুতকারী
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{payment.receivedBy}</div>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 text-[11px] font-medium">
                      হিসাবরক্ষক (Accountant)
                    </div>
                  </div>
                  <div>
                    <div className="border-t-2 border-slate-800 pt-1 text-[11px] font-bold text-slate-950">
                      মুহতামিম / অধ্যক্ষ (সিলসহ)
                    </div>
                  </div>
                </div>

                {/* 6. Footer Disclaimer */}
                <div className="text-[10px] text-center text-slate-400 border-t border-slate-200 pt-1.5 flex items-center justify-between">
                  <span>কম্পিউটার জেনারেটেড ডিজিটাল মানিরিসিপ্ট • মাদরাসা ম্যানেজমেন্ট সিস্টেম</span>
                  <span>রশিদ আইডি: {payment.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
