import React, { useState, useEffect } from 'react';
import { DonorEntity, DonationEntity } from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { DONOR_CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from '../../constants';
import { X, User, Phone, MapPin, Mail, Calendar, Award, Receipt, Printer, CheckCircle2 } from 'lucide-react';

interface DonorProfileModalProps {
  donorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintReceipt: (donation: DonationEntity) => void;
}

export const DonorProfileModal: React.FC<DonorProfileModalProps> = ({
  donorId,
  isOpen,
  onClose,
  onPrintReceipt,
}) => {
  const { t } = useTranslation();
  const [donor, setDonor] = useState<DonorEntity | null>(null);
  const [history, setHistory] = useState<DonationEntity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && donorId) {
      loadDonorDetails(donorId);
    }
  }, [isOpen, donorId]);

  const loadDonorDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.getDonorById(id);
      if (res.success && res.data) {
        setDonor(res.data.donor);
        setHistory(res.data.donationHistory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !donorId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text-main)]">
                দাতার পূর্ণাঙ্গ প্রোফাইল ও অনুদান বিবরণী (Donor Ledger)
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                দাতা কোড: {donor?.donorNo || 'DNR-XXXX'}
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

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
              দাতার তথ্য লোড হচ্ছে...
            </div>
          ) : donor ? (
            <>
              {/* Profile Card */}
              <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[var(--color-text-main)]">{donor.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {DONOR_CATEGORY_LABELS[donor.category]?.bn || donor.category}
                      </span>
                      {donor.isRegularDonor && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          ★ নিয়মিত দাতা
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)] mt-2">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> {donor.mobile}
                      </span>
                      {donor.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" /> {donor.email}
                        </span>
                      )}
                      {donor.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {donor.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lifetime Contribution Stat */}
                  <div className="text-right bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl">
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">সর্বমোট অবদান (Lifetime)</div>
                    <div className="text-2xl font-black text-emerald-600 font-mono">
                      ৳{donor.totalDonated.toLocaleString('bn-BD')}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">
                      মোট রশিদের সংখ্যা: {donor.donationCount} টি
                    </div>
                  </div>
                </div>

                {donor.notes && (
                  <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
                    <span className="font-semibold text-[var(--color-text-main)]">বিশেষ নোট: </span>
                    {donor.notes}
                  </div>
                )}
              </div>

              {/* Donation History Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    পূর্বের অনুদানের ইতিহাস ({history.length} টি রশিদ)
                  </h4>
                </div>

                <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase">
                        <th className="p-3">রশিদ নং</th>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">তহবিল / প্রকল্প</th>
                        <th className="p-3">মাধ্যম</th>
                        <th className="p-3 text-right">পরিমাণ</th>
                        <th className="p-3 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
                      {history.length > 0 ? (
                        history.map((don) => (
                          <tr key={don.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                            <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {don.receiptNo}
                            </td>
                            <td className="p-3 whitespace-nowrap">{don.date}</td>
                            <td className="p-3">
                              <div className="font-medium">{don.fundName}</div>
                              {don.projectName && (
                                <div className="text-[11px] text-[var(--color-text-muted)]">
                                  প্রকল্প: {don.projectName}
                                </div>
                              )}
                            </td>
                            <td className="p-3">{PAYMENT_METHOD_LABELS[don.paymentMethod] || don.paymentMethod}</td>
                            <td className="p-3 text-right font-bold font-mono">
                              ৳{don.amount.toLocaleString('bn-BD')}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => onPrintReceipt(don)}
                                className="p-1.5 hover:bg-[var(--color-bg)] rounded text-emerald-600 hover:text-emerald-700 transition-colors"
                                title="রশিদ প্রিন্ট করুন"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-[var(--color-text-muted)]">
                            কোনো অনুদানের রেকর্ড পাওয়া যায়নি।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
