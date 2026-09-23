import React from 'react';
import { Printer, X, ShieldAlert, CheckCircle2, Building2, Tag, Calendar, User, FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { TransactionEntity, ApprovalStatus, TransactionType, IncomeCategory, ExpenseCategory } from '../../types';
import { formatTaka, toBengaliNumerals, formatDate } from '../../utils/format';
import { INCOME_CATEGORY_LABELS, EXPENSE_CATEGORY_LABELS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

interface VoucherPrintModalProps {
  transaction: TransactionEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VoucherPrintModal: React.FC<VoucherPrintModalProps> = ({ transaction, isOpen, onClose }) => {
  const { tenant } = useAuth();

  if (!isOpen || !transaction) return null;

  const isIncome = transaction.type === TransactionType.INCOME;
  const isVoided = transaction.status === ApprovalStatus.VOIDED;

  const getCategoryLabel = (category: string) => {
    const inc = INCOME_CATEGORY_LABELS[category as IncomeCategory];
    if (inc) return inc.bn;
    const exp = EXPENSE_CATEGORY_LABELS[category as ExpenseCategory];
    if (exp) return exp.bn;
    return category;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Bar - Hidden on Print */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isIncome ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {isIncome ? 'আদায় / জমা ভাউচার' : 'ব্যয় / খরচ ভাউচার'} #{transaction.voucherNo}
              </h3>
              <p className="text-xs text-slate-300">অফিসিয়াল আর্থিক রসিদ ও ভাউচার কপি</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-voucher-action-btn"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট ভাউচার
            </button>
            <button
              onClick={onClose}
              id="close-voucher-modal-btn"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Area */}
        <div className="p-8 bg-white text-slate-800 print:p-0 relative" id="printable-voucher-document">
          {/* Watermark if Voided */}
          {isVoided && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-rose-600/15 border-8 border-rose-600/20 text-6xl font-black px-12 py-6 rounded-3xl -rotate-12 select-none tracking-widest">
                বাতিলকৃত / VOIDED
              </div>
            </div>
          )}

          {/* Institutional Letterhead */}
          <div className="text-center pb-6 border-b-2 border-slate-800">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                {tenant?.logoUrl ? (
                  <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>م</span>
                )}
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  {tenant?.nameBangla || 'আল-জামিয়াতুল ইসলামিয়া দারুল উলুম'}
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  {tenant?.nameEnglish || 'Al-Jamiatul Islamia Darul Uloom'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              {tenant?.address || 'মিরপুর-১২, ঢাকা-১২১৬'} | ফোন: {tenant?.phone || '০১৭১২-৩৪৫৬৭৮'} | ইমেইল: {tenant?.email || 'darululoom@madrasah.edu.bd'}
            </p>
          </div>

          {/* Voucher Title Badge */}
          <div className="my-6 flex items-center justify-between">
            <div>
              <span
                className={`inline-block px-4 py-1 rounded-md text-sm font-bold tracking-wide uppercase ${
                  isIncome ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isIncome ? 'জমা / আয় ভাউচার (CREDIT VOUCHER)' : 'খরচ / ব্যয় ভাউচার (DEBIT VOUCHER)'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">ভাউচার নম্বর:</p>
              <p className="text-base font-mono font-bold text-slate-900">{transaction.voucherNo}</p>
            </div>
          </div>

          {/* Void Alert Banner */}
          {isVoided && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">এই আর্থিক ভাউচারটি আনুষ্ঠানিকভাবে বাতিল করা হয়েছে (Voided)</h4>
                  <p className="text-xs mt-1">বাতিলের কারণ: {transaction.voidReason || 'উল্লেখ করা হয়নি'}</p>
                  <p className="text-xs mt-0.5 text-rose-600">
                    বাতিল করেছেন: {transaction.voidedBy} ({transaction.voidedAt ? formatDate(transaction.voidedAt) : ''})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Key Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
            <div>
              <p className="text-slate-500">লেনদেনের তারিখ:</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{formatDate(transaction.transactionDate)}</p>
            </div>
            <div>
              <p className="text-slate-500">তহবিল / ফান্ড:</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{transaction.fundName || 'সাধারণ তহবিল'}</p>
            </div>
            <div>
              <p className="text-slate-500">ক্যাশ / ব্যাংক হিসাব:</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{transaction.accountName}</p>
            </div>
            <div>
              <p className="text-slate-500">রেফারেন্স / স্মারক নং:</p>
              <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{transaction.reference}</p>
            </div>
          </div>

          {/* Voucher Table */}
          <table className="w-full border-collapse border border-slate-300 text-sm mb-6">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold text-left">
                <th className="border border-slate-300 p-3 w-12 text-center">ক্রম</th>
                <th className="border border-slate-300 p-3">খাত (Category) ও বিবরণ (Particulars)</th>
                <th className="border border-slate-300 p-3 w-40 text-right">টাকার পরিমাণ (টাকা)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-3 text-center align-top font-mono">১</td>
                <td className="border border-slate-300 p-3 align-top">
                  <p className="font-bold text-slate-900 text-base mb-1">
                    {getCategoryLabel(transaction.category)}
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">{transaction.description}</p>
                  {transaction.reference && (
                    <p className="text-slate-500 font-mono text-xs mt-2 bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-200">
                      রেফারেন্স: {transaction.reference}
                    </p>
                  )}
                </td>
                <td className="border border-slate-300 p-3 text-right align-top font-mono font-bold text-lg text-slate-900">
                  {formatTaka(transaction.amount)}
                </td>
              </tr>
              {/* Total Row */}
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="border border-slate-300 p-3 text-right text-slate-700">
                  মোট পরিমাণ:
                </td>
                <td className="border border-slate-300 p-3 text-right text-emerald-800 font-mono text-xl">
                  {formatTaka(transaction.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in Words box */}
          <div className="p-3 mb-10 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
            <span className="text-emerald-900 font-medium">
              কথায়: <span className="font-bold">{toBengaliNumerals(transaction.amount)} টাকা মাত্র</span>
            </span>
            <span className="text-emerald-700 font-mono text-[11px]">
              কালেক্টর/হিসাবরক্ষক: {transaction.createdBy}
            </span>
          </div>

          {/* Official Signature Lines */}
          <div className="pt-12 grid grid-cols-4 gap-4 text-center text-xs text-slate-600 border-t border-slate-200">
            <div>
              <div className="border-t border-slate-400 mx-auto w-28 mb-1.5"></div>
              <p className="font-semibold text-slate-800">প্রস্তুতকারী</p>
              <p className="text-[10px] text-slate-400">Prepared By</p>
            </div>
            <div>
              <div className="border-t border-slate-400 mx-auto w-28 mb-1.5"></div>
              <p className="font-semibold text-slate-800">হিসাবরক্ষক</p>
              <p className="text-[10px] text-slate-400">Accountant</p>
            </div>
            <div>
              <div className="border-t border-slate-400 mx-auto w-28 mb-1.5"></div>
              <p className="font-semibold text-slate-800">মুহতামিম / অধ্যক্ষ</p>
              <p className="text-[10px] text-slate-400">Principal</p>
            </div>
            <div>
              <div className="border-t border-slate-400 mx-auto w-28 mb-1.5"></div>
              <p className="font-semibold text-slate-800">গ্রহীতার স্বাক্ষর</p>
              <p className="text-[10px] text-slate-400">Received By</p>
            </div>
          </div>

          {/* Footer System Notice */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>সিস্টেম জেনারেটেড ডিজিটাল ভাউচার | নিরাপদ হিসাব ব্যবস্থা</span>
            <span>প্রিন্ট সময়: {new Date().toLocaleString('bn-BD')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
