import React, { useEffect } from 'react';
import {
  CreditCard,
  Percent,
  Receipt,
  Wallet,
  Coins,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Building,
} from 'lucide-react';
import {
  AdmissionFormData,
  AdmissionFeeBreakdown,
  WaiverCategory,
  PaymentMethod,
  AccountEntity,
  FundEntity,
} from '../../../../types';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';
import { formatTaka, toBengaliNumerals, numberToBanglaWords } from '../../../../utils/format';

interface Step7Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
  accounts: AccountEntity[];
  funds: FundEntity[];
}

export const Step7AdmissionFee: React.FC<Step7Props> = ({
  formData,
  updateFormData,
  accounts,
  funds,
}) => {
  const { feeBreakdown, discountType, discountValue, waiverCategory } = formData;

  // Calculate Subtotal
  const totalAmount =
    (Number(feeBreakdown.admissionFee) || 0) +
    (Number(feeBreakdown.sessionFee) || 0) +
    (Number(feeBreakdown.idCardAndDiaryFee) || 0) +
    (Number(feeBreakdown.monthlyTuitionFee) || 0) +
    (Number(feeBreakdown.boardingCharge) || 0) +
    (Number(feeBreakdown.otherFee) || 0);

  // Calculate Discount Amount
  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = Math.round((totalAmount * (Number(discountValue) || 0)) / 100);
  } else {
    discountAmount = Number(discountValue) || 0;
  }
  discountAmount = Math.min(totalAmount, Math.max(0, discountAmount));

  // Net Payable
  const netPayable = Math.max(0, totalAmount - discountAmount);

  // Sync state whenever total/discount changes
  const updateFeeItem = (field: keyof AdmissionFeeBreakdown, value: number) => {
    const updatedBreakdown = {
      ...feeBreakdown,
      [field]: Math.max(0, value),
    };

    const newTotal =
      (Number(updatedBreakdown.admissionFee) || 0) +
      (Number(updatedBreakdown.sessionFee) || 0) +
      (Number(updatedBreakdown.idCardAndDiaryFee) || 0) +
      (Number(updatedBreakdown.monthlyTuitionFee) || 0) +
      (Number(updatedBreakdown.boardingCharge) || 0) +
      (Number(updatedBreakdown.otherFee) || 0);

    let newDiscount = 0;
    if (discountType === 'PERCENTAGE') {
      newDiscount = Math.round((newTotal * (Number(discountValue) || 0)) / 100);
    } else {
      newDiscount = Number(discountValue) || 0;
    }
    newDiscount = Math.min(newTotal, Math.max(0, newDiscount));
    const newNet = Math.max(0, newTotal - newDiscount);

    // If paid amount was equal to previous net or higher, keep it in sync
    const currentPaid = Number(formData.paidAmount) || 0;
    const newPaid = currentPaid > 0 ? Math.min(newNet, currentPaid) : 0;
    const newDue = Math.max(0, newNet - newPaid);

    updateFormData({
      feeBreakdown: updatedBreakdown,
      discountAmount: newDiscount,
      netPayable: newNet,
      paidAmount: newPaid,
      dueAmount: newDue,
    });
  };

  const handleDiscountChange = (type: 'FIXED' | 'PERCENTAGE', val: number) => {
    let newDiscount = 0;
    if (type === 'PERCENTAGE') {
      newDiscount = Math.round((totalAmount * val) / 100);
    } else {
      newDiscount = val;
    }
    newDiscount = Math.min(totalAmount, Math.max(0, newDiscount));
    const newNet = Math.max(0, totalAmount - newDiscount);
    const newDue = Math.max(0, newNet - (Number(formData.paidAmount) || 0));

    updateFormData({
      discountType: type,
      discountValue: val,
      discountAmount: newDiscount,
      netPayable: newNet,
      dueAmount: newDue,
    });
  };

  const handlePaidAmountChange = (amount: number) => {
    const validPaid = Math.min(netPayable, Math.max(0, amount));
    const validDue = Math.max(0, netPayable - validPaid);
    updateFormData({
      paidAmount: validPaid,
      dueAmount: validDue,
    });
  };

  const setFullPayment = () => {
    handlePaidAmountChange(netPayable);
  };

  const setZeroPayment = () => {
    handlePaidAmountChange(0);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
          ৭
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            ভর্তি ফি, ছাড় ও পেমেন্ট হিসাব (Admission Fee & Payment)
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            ভর্তি ফি ব্রেকডাউন, বিশেষ ছাড়/বৃত্তি এবং তাৎক্ষণিক পেমেন্ট গ্রহণ ও রসিদ প্রস্তুত
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Itemized Breakdown & Waiver */}
        <div className="lg:col-span-7 space-y-4">
          {/* Itemized Fee Form */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[var(--color-primary)]" />
              ভর্তি ফি এর খাতসমূহ (Itemized Fee Breakdown)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  মূল ভর্তি ফি (Admission Fee) ৳
                </label>
                <Input
                  id="fee-admission"
                  type="number"
                  min="0"
                  value={feeBreakdown.admissionFee}
                  onChange={(e) => updateFeeItem('admissionFee', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  বার্ষিক সেশন চার্জ (Session Fee) ৳
                </label>
                <Input
                  id="fee-session"
                  type="number"
                  min="0"
                  value={feeBreakdown.sessionFee}
                  onChange={(e) => updateFeeItem('sessionFee', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  আইডি কার্ড ও ডায়েরি ফি ৳
                </label>
                <Input
                  id="fee-idcard"
                  type="number"
                  min="0"
                  value={feeBreakdown.idCardAndDiaryFee}
                  onChange={(e) => updateFeeItem('idCardAndDiaryFee', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  প্রথম মাসের টিউশন ফি (Tuition) ৳
                </label>
                <Input
                  id="fee-tuition"
                  type="number"
                  min="0"
                  value={feeBreakdown.monthlyTuitionFee}
                  onChange={(e) => updateFeeItem('monthlyTuitionFee', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  বোর্ডিং / আবাসিক চার্জ ৳
                </label>
                <Input
                  id="fee-boarding"
                  type="number"
                  min="0"
                  value={feeBreakdown.boardingCharge}
                  onChange={(e) => updateFeeItem('boardingCharge', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  অন্যান্য বিবিধ ফি (Other Fees) ৳
                </label>
                <Input
                  id="fee-other"
                  type="number"
                  min="0"
                  value={feeBreakdown.otherFee}
                  onChange={(e) => updateFeeItem('otherFee', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Waiver & Discount Card */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              বিশেষ ছাড় / বৃত্তি / মওকুফ (Discount & Scholarship Waiver)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  ছাড়ের ক্যাটাগরি (Waiver Type)
                </label>
                <Select
                  id="waiver-category"
                  value={waiverCategory}
                  onChange={(e) => updateFormData({ waiverCategory: e.target.value as WaiverCategory })}
                >
                  <option value={WaiverCategory.NONE}>কোনো ছাড় নেই</option>
                  <option value={WaiverCategory.GENERAL}>সাধারণ ছাড়</option>
                  <option value={WaiverCategory.ORPHAN_YATEEM}>এতিম / লিল্লাহ বৃত্তি</option>
                  <option value={WaiverCategory.POOR_STUDENT}>দরিদ্র / অসচ্ছল শিক্ষার্থী</option>
                  <option value={WaiverCategory.MERIT_SCHOLAR}>মেধা বৃত্তি / হাফেজ</option>
                  <option value={WaiverCategory.STAFF_WARD}>শিক্ষক / স্টাফ সন্তান</option>
                  <option value={WaiverCategory.SIBLING_DISCOUNT}>সহোদর ভাই/বোন ছাড়</option>
                </Select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  ছাড়ের ধরন (Type)
                </label>
                <Select
                  id="discount-type"
                  value={discountType}
                  onChange={(e) => handleDiscountChange(e.target.value as any, discountValue)}
                >
                  <option value="FIXED">নির্দিষ্ট টাকা (৳ Fixed)</option>
                  <option value="PERCENTAGE">শতকরা হার (% Percent)</option>
                </Select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  ছাড়ের পরিমাণ {discountType === 'PERCENTAGE' ? '(%)' : '(৳)'}
                </label>
                <Input
                  id="discount-val"
                  type="number"
                  min="0"
                  value={discountValue || 0}
                  onChange={(e) => handleDiscountChange(discountType, parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {discountAmount > 0 && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                  ছাড়ের অনুমোদন ও কারণ (Waiver Approval Reason)
                </label>
                <Input
                  id="waiver-reason"
                  type="text"
                  placeholder="যেমন: মুহতামিম সাহেবের অনুমোদনে এতিম কোটায় ১০০% ভর্তি ফি মওকুফ"
                  value={formData.waiverReason || ''}
                  onChange={(e) => updateFormData({ waiverReason: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Calculation Summary & Payment Gateway */}
        <div className="lg:col-span-5 space-y-4">
          {/* Summary Box */}
          <div className="p-5 rounded-2xl border-2 border-[var(--color-primary)]/40 bg-[var(--color-surface-card)] shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-[var(--color-text-main)] flex items-center justify-between">
              <span>হিসাব বিবরণী (Fee Summary)</span>
              <Receipt className="w-4 h-4 text-[var(--color-primary)]" />
            </h4>

            <div className="space-y-2 text-xs divide-y divide-[var(--color-border-subtle)]">
              <div className="flex justify-between py-1 text-[var(--color-text-muted)]">
                <span>মোট নির্ধারিত ফি (Total Fee):</span>
                <span className="font-semibold text-[var(--color-text-main)]">{formatTaka(totalAmount)}</span>
              </div>

              <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400">
                <span>মোট ছাড় / ওয়েভার (Discount):</span>
                <span className="font-semibold">- {formatTaka(discountAmount)}</span>
              </div>

              <div className="flex justify-between py-2 text-sm font-bold text-[var(--color-primary)]">
                <span>সর্বমোট প্রদেয় (Net Payable):</span>
                <span>{formatTaka(netPayable)}</span>
              </div>
            </div>

            {/* Quick In-Words text */}
            <div className="p-2.5 rounded-lg bg-[var(--color-surface-muted)] text-[11px] font-medium text-[var(--color-text-muted)]">
              কথায়: <span className="font-bold text-[var(--color-text-main)]">{numberToBanglaWords(netPayable)}</span>
            </div>

            {/* Payment Controls */}
            <div className="space-y-3 pt-2 border-t border-[var(--color-border-subtle)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--color-text-main)]">
                  জমা প্রদানকৃত টাকা (Paid Amount) ৳
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={setFullPayment}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                  >
                    সম্পূর্ণ পরিশোধ
                  </button>
                  <button
                    type="button"
                    onClick={setZeroPayment}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                  >
                    বকেয়া (Pay Later)
                  </button>
                </div>
              </div>

              <Input
                id="paid-amount-input"
                type="number"
                min="0"
                max={netPayable}
                value={formData.paidAmount}
                onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                className="text-base font-bold"
              />

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <span className="text-[var(--color-text-muted)] font-medium">অবশিষ্ট বকেয়া (Due Amount):</span>
                <span className={`font-bold ${formData.dueAmount > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {formatTaka(formData.dueAmount)}
                </span>
              </div>
            </div>

            {/* Payment Method & Target Fund */}
            {formData.paidAmount > 0 && (
              <div className="space-y-3 pt-2 border-t border-[var(--color-border-subtle)] animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                      পেমেন্ট মাধ্যম (Method)
                    </label>
                    <Select
                      id="payment-method-select"
                      value={formData.paymentMethod}
                      onChange={(e) => updateFormData({ paymentMethod: e.target.value as PaymentMethod })}
                    >
                      <option value={PaymentMethod.CASH}>নগদ (Cash Counter)</option>
                      <option value={PaymentMethod.BKASH}>বিকাশ (bKash)</option>
                      <option value={PaymentMethod.NAGAD}>নগদ পে (Nagad)</option>
                      <option value={PaymentMethod.ROCKET}>রকেট (Rocket)</option>
                      <option value={PaymentMethod.BANK_TRANSFER}>ব্যাংক জমা (Bank)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                      জমা অ্যাকাউন্ট (Account)
                    </label>
                    <Select
                      id="target-account-select"
                      value={formData.targetAccountId || (accounts[0]?.id || '')}
                      onChange={(e) => updateFormData({ targetAccountId: e.target.value })}
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountName} ({acc.accountType})
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
                    পেমেন্ট রেফারেন্স / রসিদের মন্তব্য
                  </label>
                  <Input
                    id="receipt-notes-input"
                    type="text"
                    placeholder="যেমন: নগদ গ্রহণ রশিদ নং-০১"
                    value={formData.receiptNotes || ''}
                    onChange={(e) => updateFormData({ receiptNotes: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
