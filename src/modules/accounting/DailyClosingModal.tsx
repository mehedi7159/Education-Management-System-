import React, { useState, useEffect } from 'react';
import { Calendar, X, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Building2, Wallet, FileText } from 'lucide-react';
import { AccountEntity, TransactionEntity, ApprovalStatus, TransactionType, DailyClosingEntity } from '../../types';
import { formatTaka, toBengaliNumerals, formatDate } from '../../utils/format';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface DailyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountEntity[];
  transactions: TransactionEntity[];
  onSuccess: (closing: DailyClosingEntity) => void;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  isOpen,
  onClose,
  accounts,
  transactions,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [closingDate, setClosingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [physicalCashCount, setPhysicalCashCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('দিনশেষে ক্যাশ ড্রয়ার ও ব্যাংক অ্যাকাউন্ট হিসাব যাচাইকৃত।');
  const [closedBy, setClosedBy] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setClosingDate(new Date().toISOString().split('T')[0]);
      setNotes('দিনশেষে ক্যাশ ড্রয়ার ও ব্যাংক অ্যাকাউন্ট হিসাব যাচাইকৃত।');
      setClosedBy(user?.fullName || user?.username || 'মাওলানা হাবিবুর রহমান (হিসাবরক্ষক)');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Filter transactions for this date
  const dayTxs = transactions.filter(
    (t) => t.transactionDate === closingDate && t.status !== ApprovalStatus.VOIDED
  );

  let totalCashIncome = 0;
  let totalBankIncome = 0;
  let totalCashExpense = 0;
  let totalBankExpense = 0;

  for (const t of dayTxs) {
    const isCash = t.accountType === 'CASH' || t.accountName.toLowerCase().includes('ক্যাশ');
    if (t.type === TransactionType.INCOME) {
      if (isCash) totalCashIncome += t.amount;
      else totalBankIncome += t.amount;
    } else if (t.type === TransactionType.EXPENSE) {
      if (isCash) totalCashExpense += t.amount;
      else totalBankExpense += t.amount;
    }
  }

  // Current balance
  let systemCashBalance = 0;
  let systemBankBalance = 0;
  for (const a of accounts) {
    if (a.accountType === 'CASH') systemCashBalance += a.balance;
    else systemBankBalance += a.balance;
  }

  const enteredCash = physicalCashCount !== '' ? parseFloat(physicalCashCount) || 0 : systemCashBalance;
  const discrepancy = enteredCash - systemCashBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const res = await api.performDailyClosing({
        closingDate,
        physicalCashCount: enteredCash,
        notes: notes.trim(),
        closedBy: closedBy.trim(),
      });

      if (res.success && res.data) {
        showToast(res.message || 'দৈনিক হিসাব সফলভাবে ক্লোজ করা হয়েছে।', 'success');
        onSuccess(res.data);
        onClose();
      } else {
        showToast(res.error?.message || 'দৈনিক ক্লোজিং ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ক্লোজিং প্রক্রিয়ায় সমস্যা হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">দৈনিক ক্যাশ ও ব্যাংক হিসাব ক্লোজিং</h3>
              <p className="text-xs text-slate-300">দিনশেষে ক্যাশ মিলকরণ এবং অডিট ভেরিফিকেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date Picker & Closed By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                ক্লোজিংয়ের তারিখ *
              </label>
              <input
                type="date"
                required
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ক্লোজকারী হিসাবরক্ষক *</label>
              <input
                type="text"
                required
                value={closedBy}
                onChange={(e) => setClosedBy(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Today's Inflow & Outflow Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            {/* Cash Activity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <Wallet className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-xs text-slate-800">ক্যাশ কাউন্টার (আজকের লেনদেন)</h4>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">আজকের ক্যাশ আদায়:</span>
                  <span className="font-mono font-bold text-emerald-700">+{formatTaka(totalCashIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">আজকের ক্যাশ খরচ:</span>
                  <span className="font-mono font-bold text-rose-700">-{formatTaka(totalCashExpense)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold">
                  <span className="text-slate-700">ক্যাশ ড্রয়ার স্থিতি:</span>
                  <span className="font-mono font-bold text-slate-900">{formatTaka(systemCashBalance)}</span>
                </div>
              </div>
            </div>

            {/* Bank Activity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <Building2 className="w-4 h-4 text-blue-700" />
                <h4 className="font-bold text-xs text-slate-800">ব্যাংক অ্যাকাউন্ট (আজকের লেনদেন)</h4>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">আজকের ব্যাংক জমা:</span>
                  <span className="font-mono font-bold text-emerald-700">+{formatTaka(totalBankIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">আজকের ব্যাংক পেমেন্ট:</span>
                  <span className="font-mono font-bold text-rose-700">-{formatTaka(totalBankExpense)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold">
                  <span className="text-slate-700">ব্যাংক ব্যালান্স স্থিতি:</span>
                  <span className="font-mono font-bold text-slate-900">{formatTaka(systemBankBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Cash Reconciliation */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h4 className="text-xs font-bold text-emerald-950 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              বাস্তব ক্যাশ গণনা ও ড্রয়ার রিকনসিলিয়েশন (Physical Cash Count)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  হাতে থাকা ক্যাশ গণনা (টাকা)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">৳</span>
                  <input
                    type="number"
                    step="any"
                    placeholder={systemCashBalance.toString()}
                    value={physicalCashCount}
                    onChange={(e) => setPhysicalCashCount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">ফাঁকা রাখলে সিস্টেম ব্যালান্স গণ্য হবে।</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ক্যাশ মিল / অমিল (Discrepancy)
                </label>
                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    discrepancy === 0
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : discrepancy > 0
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {discrepancy === 0 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>শতভাগ নির্ভুল মিল (৳ ০.০০)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-700" />
                      <span>
                        {discrepancy > 0 ? `উদ্বৃত্ত: +${formatTaka(discrepancy)}` : `ঘাটতি: ${formatTaka(discrepancy)}`}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  মোট দিনশেষ স্থিতি: {formatTaka(enteredCash + systemBankBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              ক্লোজিং বিবরণ ও মন্তব্য (Notes)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              id="confirm-daily-closing-btn"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-black disabled:opacity-50 rounded-xl shadow-md cursor-pointer transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {submitting ? 'ক্লোজিং প্রক্রিয়াধীন...' : 'দৈনিক ক্লোজিং নিশ্চিত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
