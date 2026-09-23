import React, { useState, useEffect } from 'react';
import { FundEntity, ProjectEntity, DonorEntity, AccountEntity, PaymentMethod, DonorCategory, DonationEntity } from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { PAYMENT_METHOD_LABELS, DONOR_CATEGORY_LABELS } from '../../constants';
import { X, HandCoins, Check, UserPlus, Search, ShieldCheck, HeartHandshake } from 'lucide-react';

interface NewDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDonation: DonationEntity) => void;
  funds: FundEntity[];
  projects: ProjectEntity[];
  donors: DonorEntity[];
  accounts: AccountEntity[];
}

const AMOUNT_PRESETS = [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000];

export const NewDonationModal: React.FC<NewDonationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  funds,
  projects,
  donors,
  accounts,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [donorSearch, setDonorSearch] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState<string>('');
  const [isNewDonorMode, setIsNewDonorMode] = useState(false);

  // Form states
  const [donorName, setDonorName] = useState('');
  const [donorMobile, setDonorMobile] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorCategory, setDonorCategory] = useState<DonorCategory>('GENERAL');
  const [isRegularDonor, setIsRegularDonor] = useState(false);

  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fundId, setFundId] = useState(funds[0]?.id || '');
  const [projectId, setProjectId] = useState<string>('NONE');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [chequeOrTxnRef, setChequeOrTxnRef] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isZakatEligible, setIsZakatEligible] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (funds.length > 0 && !fundId) {
      setFundId(funds[0].id);
    }
  }, [funds, fundId]);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // When fund changes, auto-set isZakatEligible if fund is LILLAH or GORAOBA
  const handleFundChange = (id: string) => {
    setFundId(id);
    const selectedFund = funds.find((f) => f.id === id);
    if (selectedFund) {
      if (selectedFund.fundCode === 'LILLAH' || selectedFund.fundCode === 'GORAOBA') {
        setIsZakatEligible(true);
      } else {
        setIsZakatEligible(false);
      }
    }
  };

  // Handle donor selection from directory
  const handleSelectExistingDonor = (d: DonorEntity) => {
    setSelectedDonorId(d.id);
    setDonorName(d.name);
    setDonorMobile(d.mobile);
    setDonorAddress(d.address || '');
    setDonorCategory(d.category || 'GENERAL');
    setIsRegularDonor(d.isRegularDonor);
    setIsNewDonorMode(false);
    setDonorSearch('');
  };

  const handleResetDonorSelection = () => {
    setSelectedDonorId('');
    setDonorName('');
    setDonorMobile('');
    setDonorAddress('');
    setDonorCategory('GENERAL');
    setIsRegularDonor(false);
    setIsNewDonorMode(true);
  };

  if (!isOpen) return null;

  const filteredDonors = donors.filter(
    (d) =>
      d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
      d.mobile.includes(donorSearch) ||
      (d.donorNo && d.donorNo.toLowerCase().includes(donorSearch.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!donorName.trim()) {
      setErrorMessage('দাতার নাম উল্লেখ করুন।');
      return;
    }
    if (!donorMobile.trim()) {
      setErrorMessage('দাতার মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!amount || amount <= 0) {
      setErrorMessage('অনুদানের টাকার সঠিক পরিমাণ প্রদান করুন।');
      return;
    }
    if (!fundId) {
      setErrorMessage('অনুদান প্রাপ্তির তহবিল নির্বাচন করুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createDonation({
        donorId: selectedDonorId || undefined,
        donorName: donorName.trim(),
        donorMobile: donorMobile.trim(),
        donorAddress: donorAddress.trim(),
        donorCategory,
        isRegularDonor,
        amount: Number(amount),
        date,
        fundId,
        projectId: projectId !== 'NONE' ? projectId : undefined,
        paymentMethod,
        accountId: accountId || undefined,
        chequeOrTxnRef: chequeOrTxnRef.trim(),
        remarks: remarks.trim(),
        isZakatEligible,
        createdBy: user?.fullName || user?.username || 'হিসাব শাখা',
      });

      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setErrorMessage(res.error?.message || 'অনুদান সংরক্ষণে ত্রুটি দেখা দিয়েছে।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'সার্ভার ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text-main)]">
                নতুন অনুদান গ্রহণ ও মানিরিসিপ্ট জারি (New Donation Receipt)
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                দ্বিমুখী লেজার ও তহবিল স্বয়ংক্রিয়ভাবে ক্রেডিট হবে
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Donor Information */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                ১. দাতা ও শুভানুধ্যায়ীর তথ্য (Donor Details)
              </h4>
              {selectedDonorId ? (
                <button
                  type="button"
                  onClick={handleResetDonorSelection}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium"
                >
                  <X className="w-3.5 h-3.5" /> ভিন্ন দাতা বা নতুন এন্ট্রি
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsNewDonorMode(!isNewDonorMode)}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {isNewDonorMode ? 'দাতা তালিকা হতে খুঁজুন' : '+ নতুন দাতা'}
                </button>
              )}
            </div>

            {/* Donor Search Dropdown if not in explicit new mode and not yet selected */}
            {!selectedDonorId && !isNewDonorMode && (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    placeholder="নাম, মোবাইল বা দাতা নং দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {donorSearch && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl divide-y divide-[var(--color-border)]">
                    {filteredDonors.length > 0 ? (
                      filteredDonors.map((d) => (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => handleSelectExistingDonor(d)}
                          className="w-full text-left p-3 hover:bg-[var(--color-surface-hover)] transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-sm text-[var(--color-text-main)]">{d.name}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">
                              মোবাইল: {d.mobile} | মোট দান: ৳{d.totalDonated.toLocaleString('bn-BD')}
                            </div>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                            নির্বাচন করুন
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-[var(--color-text-muted)] text-center">
                        কোনো দাতা পাওয়া যায়নি।{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewDonorMode(true);
                            setDonorName(donorSearch);
                          }}
                          className="text-emerald-600 font-bold underline"
                        >
                          নতুন দাতা হিসেবে যোগ করুন
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Donor Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  দাতার পুরো নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="যেমন: আলহাজ্ব মো: আব্দুল্লাহ"
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={donorMobile}
                  onChange={(e) => setDonorMobile(e.target.value)}
                  placeholder="যেমন: 01711-XXXXXX"
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  দাতার ক্যাটাগরি
                </label>
                <select
                  value={donorCategory}
                  onChange={(e) => setDonorCategory(e.target.value as DonorCategory)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(DONOR_CATEGORY_LABELS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.bn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  ঠিকানা ও পরিচিতি
                </label>
                <input
                  type="text"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  placeholder="গ্রাম / রোড / থানা / জেলা"
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isRegularDonor"
                checked={isRegularDonor}
                onChange={(e) => setIsRegularDonor(e.target.checked)}
                className="rounded border-[var(--color-border)] text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isRegularDonor" className="text-xs font-medium text-[var(--color-text-main)] cursor-pointer">
                নিয়মিত মাসিক দাতা / স্পনসর (Regular Monthly Contributor)
              </label>
            </div>
          </div>

          {/* Section 2: Donation Amount & Fund Allocation */}
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ২. অনুদানের পরিমাণ ও তহবিল নির্ধারণ (Amount & Fund)
            </h4>

            {/* Amount Presets */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                টাকার পরিমাণ (BDT) <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {AMOUNT_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      amount === amt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-main)] border-[var(--color-border)] hover:border-emerald-500'
                    }`}
                  >
                    ৳{amt.toLocaleString('bn-BD')}
                  </button>
                ))}
              </div>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="টাকার পরিমাণ লিখুন (যেমন: ৫০০০)"
                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-base font-bold text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  তহবিল / ফান্ড <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={fundId}
                  onChange={(e) => handleFundChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {funds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nameBangla} {f.isRestricted ? '(সংরক্ষিত / Restricted)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  সুনির্দিষ্ট প্রকল্প (যদি থাকে)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="NONE">— উন্মুক্ত সাধারণ ফান্ড —</option>
                  {projects
                    .filter((p) => p.status === 'ACTIVE')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (লক্ষ্য: ৳{p.targetAmount.toLocaleString('bn-BD')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  অনুদানের তারিখ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  পরিশোধের মাধ্যম <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  জমা হিসাব (Cash/Bank Account)
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({acc.accountType}) — স্থিতি: ৳{acc.balance.toLocaleString('bn-BD')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  চেক নং / Trx ID / রেফারেন্স
                </label>
                <input
                  type="text"
                  value={chequeOrTxnRef}
                  onChange={(e) => setChequeOrTxnRef(e.target.value)}
                  placeholder="যেমন: BK-8849102 বা Cheque #891"
                  className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isZakatEligible"
                checked={isZakatEligible}
                onChange={(e) => setIsZakatEligible(e.target.checked)}
                className="rounded border-[var(--color-border)] text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isZakatEligible" className="text-xs font-medium text-emerald-700 dark:text-emerald-400 cursor-pointer">
                ★ এটি যাকাত / সদকা / ফিতরা বা লিল্লাহ ফান্ডভুক্ত অনুদান (Shariah-compliant Zakat / Lillah)
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                বিশেষ নোট / দোয়ার আবেদন
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="যেমন: মরহুম পিতার মাগফিরাত কামনায় অথবা ৪ তলার ছাদ ঢালাই বাবদ"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'অনুদান গ্রহণ ও রশিদ প্রিন্ট'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
