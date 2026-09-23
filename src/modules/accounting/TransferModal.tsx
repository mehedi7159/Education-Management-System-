import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, X, Building2, Tag, Calendar, User, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AccountEntity, FundEntity, TransactionEntity } from '../../types';
import { formatTaka } from '../../utils/format';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountEntity[];
  funds: FundEntity[];
  onSuccess: (newTx: TransactionEntity) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  funds,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [fundId, setFundId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && accounts.length >= 2) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[1].id);
      if (funds.length > 0) setFundId(funds[0].id);
      setReference(`TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setDescription('');
      setAmount('');
    }
  }, [isOpen, accounts, funds]);

  if (!isOpen) return null;

  const sourceAccount = accounts.find((a) => a.id === fromAccountId);
  const targetAccount = accounts.find((a) => a.id === toAccountId);
  const parsedAmount = parseFloat(amount) || 0;
  const isInsufficient = sourceAccount ? parsedAmount > sourceAccount.balance : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fromAccountId === toAccountId) {
      showToast('উৎস হিসাব এবং গন্তব্য হিসাব ভিন্ন হতে হবে।', 'error');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      showToast('স্থানান্তরের পরিমাণ ০ অপেক্ষা বেশি হতে হবে।', 'error');
      return;
    }
    if (isInsufficient) {
      showToast('উৎস হিসাবে পর্যাপ্ত স্থিতি নেই।', 'error');
      return;
    }
    if (!reference.trim()) {
      showToast('রেফারেন্স / চেক নং প্রদান আবশ্যক।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.recordFundOrAccountTransfer({
        fromAccountId,
        toAccountId,
        fundId,
        amount: parsedAmount,
        transactionDate: date,
        description: description.trim() || `${sourceAccount?.accountName} হতে ${targetAccount?.accountName}-এ তহবিল স্থানান্তর`,
        reference: reference.trim(),
        createdBy: user?.fullName || user?.username || 'হিসাব শাখা',
      });

      if (res.success && res.data) {
        showToast(res.message || 'তহবিল স্থানান্তর সফল হয়েছে।', 'success');
        onSuccess(res.data);
        onClose();
      } else {
        showToast(res.error?.message || 'তহবিল স্থানান্তর ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'স্থানান্তর প্রক্রিয়ায় সমস্যা দেখা দিয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-200">
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-700/80 rounded-xl">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">হিসাব ও তহবিল স্থানান্তর (Internal Transfer)</h3>
              <p className="text-xs text-blue-100">ক্যাশ ড্রয়ার থেকে ব্যাংক জমা অথবা ব্যাংক থেকে ক্যাশ উত্তোলন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">উৎস হিসাব (From) *</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} ({formatTaka(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">গন্তব্য হিসাব (To) *</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} ({formatTaka(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">স্থানান্তরের ফান্ড *</label>
              <select
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>{f.nameBangla}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">টাকার পরিমাণ (৳) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {isInsufficient && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>উৎস হিসাবে পর্যাপ্ত অর্থ নেই (বর্তমান স্থিতি: {formatTaka(sourceAccount?.balance || 0)})।</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">তারিখ *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">রেফারেন্স / চেক নং *</label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">স্থানান্তরের কারণ / বিবরণ</label>
            <input
              type="text"
              placeholder="ব্যাংকে ক্যাশ ডিপোজিট বা দৈনন্দিন খরচ বাবদ উত্তোলন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              disabled={submitting || isInsufficient}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'স্থানান্তর হচ্ছে...' : 'স্থানান্তর সম্পন্ন করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
