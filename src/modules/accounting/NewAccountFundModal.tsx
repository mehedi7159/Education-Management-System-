import React, { useState } from 'react';
import { PlusCircle, X, Building2, Tag, Wallet, CheckCircle2 } from 'lucide-react';
import { AccountEntity, FundEntity } from '../../types';
import { api } from '../../api';
import { useToast } from '../../context/ToastContext';

interface NewAccountFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'ACCOUNT' | 'FUND';
  onAccountCreated: (account: AccountEntity) => void;
  onFundCreated: (fund: FundEntity) => void;
}

export const NewAccountFundModal: React.FC<NewAccountFundModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'ACCOUNT',
  onAccountCreated,
  onFundCreated,
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'ACCOUNT' | 'FUND'>(defaultMode);

  // Account form state
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'CASH' | 'BANK' | 'MOBILE_BANKING'>('BANK');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  // Fund form state
  const [fundNameBangla, setFundNameBangla] = useState('');
  const [fundNameEnglish, setFundNameEnglish] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);
  const [fundDescription, setFundDescription] = useState('');
  const [fundInitialBalance, setFundInitialBalance] = useState('');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      showToast('হিসাবের নাম প্রদান আবশ্যক।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createAccount({
        accountName: accountName.trim(),
        accountType,
        accountNumber: accountNumber.trim() || undefined,
        bankName: bankName.trim() || undefined,
        branchName: branchName.trim() || undefined,
        balance: parseFloat(initialBalance) || 0,
        isActive: true,
      });

      if (res.success && res.data) {
        showToast(res.message || 'হিসাব সফলভাবে তৈরি হয়েছে।', 'success');
        onAccountCreated(res.data);
        onClose();
      } else {
        showToast(res.error?.message || 'হিসাব তৈরি ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'সমস্যা হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundNameBangla.trim()) {
      showToast('তহবিলের নাম (বাংলা) আবশ্যক।', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createFund({
        nameBangla: fundNameBangla.trim(),
        nameEnglish: fundNameEnglish.trim() || fundNameBangla.trim(),
        isRestricted,
        currentBalance: parseFloat(fundInitialBalance) || 0,
        description: fundDescription.trim(),
      });

      if (res.success && res.data) {
        showToast(res.message || 'তহবিল সফলভাবে তৈরি হয়েছে।', 'success');
        onFundCreated(res.data);
        onClose();
      } else {
        showToast(res.error?.message || 'তহবিল তৈরি ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'সমস্যা হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            {mode === 'ACCOUNT' ? <Building2 className="w-5 h-5 text-emerald-400" /> : <Tag className="w-5 h-5 text-emerald-400" />}
            <h3 className="font-bold text-lg">
              {mode === 'ACCOUNT' ? 'নতুন ক্যাশ / ব্যাংক হিসাব যোগ করুন' : 'নতুন তহবিল / ফান্ড তৈরি করুন'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <button
            onClick={() => setMode('ACCOUNT')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'ACCOUNT'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            ক্যাশ / ব্যাংক একাউন্ট
          </button>
          <button
            onClick={() => setMode('FUND')}
            className={`pb-3 px-4 font-bold text-xs border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              mode === 'FUND'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Tag className="w-4 h-4" />
            তহবিল / ফান্ড
          </button>
        </div>

        {mode === 'ACCOUNT' ? (
          <form onSubmit={handleAccountSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">হিসাবের ধরন *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['BANK', 'CASH', 'MOBILE_BANKING'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAccountType(t)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      accountType === t
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t === 'BANK' ? '🏦 ব্যাংক হিসাব' : t === 'CASH' ? '💵 ক্যাশ ড্রয়ার' : '📱 মোবাইল ব্যাংকিং'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">হিসাবের শিরোনাম (Account Name) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: ইসলামী ব্যাংক বাংলাদেশ লি. অথবা প্রধান ক্যাশ কাউন্টার"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {accountType !== 'CASH' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাকাউন্ট নম্বর</label>
                  <input
                    type="text"
                    placeholder="২০৫০১২৩৪৪৫৬৭৮"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শাখা (Branch)</label>
                  <input
                    type="text"
                    placeholder="মিরপুর শাখা"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রারম্ভিক স্থিতি (Initial Balance ৳)</label>
              <input
                type="number"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'তৈরি হচ্ছে...' : 'হিসাব তৈরি করুন'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFundSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">তহবিলের নাম (বাংলায়) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: লিল্লাহ ও এতিমখানা তহবিল, বোর্ডিং তহবিল"
                value={fundNameBangla}
                onChange={(e) => setFundNameBangla(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">তহবিলের নাম (ইংরেজিতে)</label>
              <input
                type="text"
                placeholder="যেমন: Lillah and Orphan Fund"
                value={fundNameEnglish}
                onChange={(e) => setFundNameEnglish(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রারম্ভিক তহবিল স্থিতি (৳)</label>
              <input
                type="number"
                placeholder="0.00"
                value={fundInitialBalance}
                onChange={(e) => setFundInitialBalance(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">উদ্দেশ্য ও বিবরণ</label>
              <textarea
                rows={2}
                placeholder="তহবিলের ব্যয়ের নীতিমালা বা শর্ত..."
                value={fundDescription}
                onChange={(e) => setFundDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="restricted-checkbox"
                checked={isRestricted}
                onChange={(e) => setIsRestricted(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="restricted-checkbox" className="text-xs text-slate-700 font-medium">
                শর্তযুক্ত/নির্দিষ্ট তহবিল (Restricted Fund - কেবল নির্ধারিত খাতে ব্যয়যোগ্য)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'তৈরি হচ্ছে...' : 'তহবিল তৈরি করুন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
