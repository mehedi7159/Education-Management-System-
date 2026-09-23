import React, { useState, useEffect } from 'react';
import { PlusCircle, X, ArrowUpRight, Wallet, Building2, Tag, Calendar, User, FileText, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { AccountEntity, FundEntity, TransactionEntity, TransactionType, ExpenseCategory } from '../../types';
import { formatTaka } from '../../utils/format';
import { EXPENSE_CATEGORY_LABELS } from '../../constants';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ExpenseEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountEntity[];
  funds: FundEntity[];
  onSuccess: (newTx: TransactionEntity) => void;
}

export const ExpenseEntryModal: React.FC<ExpenseEntryModalProps> = ({
  isOpen,
  onClose,
  accounts,
  funds,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedFundId, setSelectedFundId] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory | string>(ExpenseCategory.FOOD);
  const [reference, setReference] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setReference(`BILL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setDescription('');
      setCategory(ExpenseCategory.FOOD);
      setCreator(user?.fullName || user?.username || 'মাওলানা হাবিবুর রহমান (হিসাবরক্ষক)');

      if (accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accounts[0].id);
      }
      if (funds.length > 0 && !selectedFundId) {
        setSelectedFundId(funds[0].id);
      }
    }
  }, [isOpen, accounts, funds, user]);

  if (!isOpen) return null;

  const currentAccount = accounts.find((a) => a.id === selectedAccountId);
  const currentFund = funds.find((f) => f.id === selectedFundId);
  const parsedAmount = parseFloat(amount) || 0;
  const isInsufficientBalance = currentAccount ? parsedAmount > currentAccount.balance : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parsedAmount || parsedAmount <= 0) {
      showToast('ব্যয়ের টাকার পরিমাণ ০ অপেক্ষা বেশি হতে হবে।', 'error');
      return;
    }
    if (!selectedAccountId) {
      showToast('ক্যাশ বা ব্যাংক হিসাব নির্বাচন করুন।', 'error');
      return;
    }
    if (!selectedFundId) {
      showToast('তহবিল নির্বাচন করুন।', 'error');
      return;
    }
    if (!reference.trim()) {
      showToast('বিল/ভাউচার রেফারেন্স নম্বর প্রদান করা বাধ্যতামূলক।', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('ব্যয়ের সুনির্দিষ্ট বিবরণ প্রদান করুন।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.recordFinancialTransaction({
        type: TransactionType.EXPENSE,
        amount: parsedAmount,
        fundId: selectedFundId,
        accountId: selectedAccountId,
        category,
        transactionDate: date,
        description: description.trim(),
        reference: reference.trim(),
        createdBy: creator.trim(),
      });

      if (res.success && res.data) {
        showToast(res.message || 'ব্যয় ভাউচার সফলভাবে পরিশোধ ও লেজারে লিপিবদ্ধ হয়েছে।', 'success');
        onSuccess(res.data);
        onClose();
      } else {
        showToast(res.error?.message || 'ব্যয় ভাউচার সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ভাউচার তৈরির সময় সমস্যা দেখা দিয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-rose-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-700/80 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">নতুন ব্যয় ভাউচার অন্তর্ভুক্তি</h3>
              <p className="text-xs text-rose-100">বেতন, বিদ্যুৎ, খাদ্যদ্রব্য, মাহফিল ও প্রশাসনিক ব্যয়</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-200 hover:text-white rounded-lg hover:bg-rose-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Transaction Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                লেনদেনের তারিখ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-rose-600" />
                ব্যয়ের পরিমাণ (টাকা) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Selector (Cash or Bank) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-rose-600" />
                  হিসাব / অ্যাকাউন্ট <span className="text-rose-500">*</span>
                </span>
                {currentAccount && (
                  <span className={`text-[11px] font-semibold font-mono ${isInsufficientBalance ? 'text-rose-600' : 'text-slate-600'}`}>
                    স্থিতি: {formatTaka(currentAccount.balance)}
                  </span>
                )}
              </label>
              <select
                required
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountName} ({acc.accountType === 'CASH' ? 'ক্যাশ' : 'ব্যাংক'} - {formatTaka(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Fund Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-600" />
                  তহবিল / ফান্ড <span className="text-rose-500">*</span>
                </span>
                {currentFund && (
                  <span className="text-[11px] text-slate-600 font-semibold font-mono">
                    ফান্ড স্থিতি: {formatTaka(currentFund.currentBalance)}
                  </span>
                )}
              </label>
              <select
                required
                value={selectedFundId}
                onChange={(e) => setSelectedFundId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {funds.map((fnd) => (
                  <option key={fnd.id} value={fnd.id}>
                    {fnd.nameBangla}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Insufficient balance alert */}
          {isInsufficientBalance && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                সতর্কতা: নির্বাচিত হিসাবে পর্যাপ্ত তহবিল নেই (বর্তমান স্থিতি: {formatTaka(currentAccount?.balance || 0)})।
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expense Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-600" />
                ব্যয়ের খাত (Expense Category) <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium"
              >
                <option value={ExpenseCategory.SALARY}>বেতন (Salary)</option>
                <option value={ExpenseCategory.ELECTRICITY}>বিদ্যুৎ বিল (Electricity)</option>
                <option value={ExpenseCategory.FOOD}>খাদ্যদ্রব্য ও মেস (Food)</option>
                <option value={ExpenseCategory.EDUCATION}>শিক্ষা ও পাঠ্যপুস্তক (Education)</option>
                <option value={ExpenseCategory.MAINTENANCE}>রক্ষণাবেক্ষণ ও মেরামত (Maintenance)</option>
                <option value={ExpenseCategory.TRANSPORT}>যাতায়াত ও পরিবহন (Transport)</option>
                <option value={ExpenseCategory.EVENTS}>অনুষ্ঠান ও সেমিনার (Events)</option>
                <option value={ExpenseCategory.MAHFIL}>বার্ষিক ওয়াজ ও মাহফিল (Mahfil)</option>
                <option value={ExpenseCategory.OTHER}>অন্যান্য ব্যয় (Other)</option>
              </select>
            </div>

            {/* Reference (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                রেফারেন্স / বিল / ভাউচার নং <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: BILL-DESCO-01, VCH-99..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              ব্যয়ের বিস্তারিত বিবরণ (Description) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="কি বাবদ খরচ করা হলো এবং ভেন্ডর বা সামগ্রীর বিবরণ উল্লেখ করুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
            />
          </div>

          {/* Creator / Authorized By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-600" />
              ব্যয় অনুমোদনকারী / প্রস্তুতকারী (Created by) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>

          {/* Real-time Summary Card */}
          {parsedAmount > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs flex items-center justify-between">
              <div>
                <p className="text-rose-900 font-medium">পরিশোধিতব্য ভাউচার মোট:</p>
                <p className="font-bold text-base text-rose-950 font-mono">{formatTaka(parsedAmount)}</p>
              </div>
              <div className="text-right text-rose-800">
                <p>হিসাব: <span className="font-bold">{currentAccount?.accountName}</span></p>
                <p>তহবিল: <span className="font-bold">{currentFund?.nameBangla}</span></p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              id="submit-expense-voucher-btn"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'পরিশোধ হচ্ছে...' : 'ব্যয় ভাউচার নিশ্চিত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
