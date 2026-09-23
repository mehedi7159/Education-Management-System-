import React, { useRef } from 'react';
import { DonationEntity } from '../../types';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { PAYMENT_METHOD_LABELS, DONOR_CATEGORY_LABELS } from '../../constants';
import { Printer, X, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';

interface DonationReceiptPrintModalProps {
  donation: DonationEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DonationReceiptPrintModal: React.FC<DonationReceiptPrintModalProps> = ({
  donation,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { tenant } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const numberToBengaliWords = (num: number): string => {
    if (!num || isNaN(num)) return 'শূন্য টাকা মাত্র';
    return `${num.toLocaleString('bn-BD')} টাকা মাত্র`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Actions (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-[var(--color-text-main)]">
              অফিসিয়াল দান ও সদকা প্রাপ্তি রশিদ (Donation Receipt)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              প্রিন্ট রশিদ / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div ref={printRef} className="p-8 bg-white text-slate-900 printable-receipt font-sans">
          {/* Institution Header */}
          <div className="text-center border-b-2 border-emerald-700 pb-5 mb-6">
            <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold mb-2 tracking-wide uppercase">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • মানিরিসিপ্ট / অনুদান রশিদ
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 tracking-tight">
              {tenant?.nameBangla || 'জামিয়া ইসলামিয়া দারুল উলুম মাদ্রাসা'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {tenant?.address || 'মিরপুর-১২, পল্লবী, ঢাকা-১২১৬'} | মোবাইল: {tenant?.phone || '০১৭০০-০০০০০০'}
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-semibold text-emerald-700">
              <span className="px-2.5 py-0.5 bg-emerald-100 rounded-md">তহবিল ও সমাজকল্যাণ বিভাগ</span>
              <span>•</span>
              <span>স্থাপিত: {tenant?.establishedYear || '১৯৮৫'}</span>
              <span>•</span>
              <span>ইআইআইএন: {tenant?.eiinCode || '১৩৪৫৮২'}</span>
            </div>
          </div>

          {/* Receipt Meta Bar */}
          <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm">
            <div>
              <span className="text-slate-500 font-medium">রশিদ নম্বর:</span>{' '}
              <span className="font-mono font-bold text-emerald-800 text-base">{donation.receiptNo}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">তারিখ:</span>{' '}
              <span className="font-semibold text-slate-800">{donation.date}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">পরিস্থিতি:</span>{' '}
              {donation.status === 'VOIDED' ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                  বাতিলকৃত (VOIDED)
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> আদায়কৃত
                </span>
              )}
            </div>
          </div>

          {/* Voided Banner if applicable */}
          {donation.status === 'VOIDED' && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">এই রশিদটি দাপ্তরিকভাবে বাতিল (Voided) করা হয়েছে।</p>
                <p className="text-xs mt-1">কারণ: {donation.voidReason} | বাতিলকারী: {donation.voidedBy} ({donation.voidedAt?.slice(0, 10)})</p>
              </div>
            </div>
          )}

          {/* Donor Information */}
          <div className="border border-slate-200 rounded-xl p-5 mb-6 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              সম্মানিত দাতা / পৃষ্ঠপোষকের বিবরণ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm">
              <div>
                <span className="text-slate-500">দাতার নাম:</span>{' '}
                <span className="font-bold text-slate-900 text-base">{donation.donorName}</span>
              </div>
              <div>
                <span className="text-slate-500">মোবাইল:</span>{' '}
                <span className="font-medium text-slate-800">{donation.donorMobile}</span>
              </div>
              {donation.donorAddress && (
                <div className="md:col-span-2">
                  <span className="text-slate-500">ঠিকানা:</span>{' '}
                  <span className="text-slate-800">{donation.donorAddress}</span>
                </div>
              )}
              {donation.donorCategory && (
                <div>
                  <span className="text-slate-500">দাতার ক্যাটাগরি:</span>{' '}
                  <span className="font-medium text-emerald-700">
                    {DONOR_CATEGORY_LABELS[donation.donorCategory]?.bn || donation.donorCategory}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Donation Details Table */}
          <table className="w-full border-collapse border border-slate-200 rounded-lg overflow-hidden mb-6 text-sm">
            <thead>
              <tr className="bg-emerald-800 text-white text-left text-xs uppercase">
                <th className="p-3">ক্রমিক</th>
                <th className="p-3">তহবিল / উদ্দেশ্য খাত</th>
                <th className="p-3">প্রকল্প (যদি থাকে)</th>
                <th className="p-3">পরিশোধের মাধ্যম</th>
                <th className="p-3 text-right">টাকার পরিমাণ (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 text-slate-500 font-mono">০১</td>
                <td className="p-3">
                  <div className="font-bold text-slate-900">{donation.fundName}</div>
                  {donation.isZakatEligible && (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ★ যাকাত ও লিল্লাহ ফান্ড প্রযোজ্য
                    </span>
                  )}
                </td>
                <td className="p-3 text-slate-700">
                  {donation.projectName || '— উন্মুক্ত প্রতিষ্ঠান তহবিল —'}
                </td>
                <td className="p-3 text-slate-700">
                  <div>{PAYMENT_METHOD_LABELS[donation.paymentMethod] || donation.paymentMethod}</div>
                  {donation.chequeOrTxnRef && (
                    <div className="text-xs text-slate-500 font-mono">রেফ/Trx: {donation.chequeOrTxnRef}</div>
                  )}
                </td>
                <td className="p-3 text-right font-bold text-slate-900 text-base font-mono">
                  ৳{donation.amount.toLocaleString('bn-BD')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={4} className="p-3 text-right text-slate-700">
                  সর্বমোট গৃহীত অনুদান:
                </td>
                <td className="p-3 text-right text-emerald-900 text-lg font-mono">
                  ৳{donation.amount.toLocaleString('bn-BD')}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Amount in words & Remarks */}
          <div className="space-y-3 mb-8 text-sm">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <span className="text-emerald-900 font-medium">কথায়: </span>
              <span className="font-bold text-emerald-950">{numberToBengaliWords(donation.amount)}</span>
            </div>

            {donation.remarks && (
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">বিশেষ মন্তব্য/নোট: </span>
                {donation.remarks}
              </div>
            )}
          </div>

          {/* Hadith / Dua Blessing */}
          <div className="p-4 border border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl text-center mb-8 text-xs text-emerald-900 italic">
            "مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنْبُلَةٍ مِائَةُ حَبَّةٍ"
            <br />
            আল্লাহ তাআলা আপনার এই দানকে কবুল করুন, আপনার ধন-সম্পদে প্রভূত বরকত দান করুন এবং উভয় জগতে উত্তম প্রতিদান দান করুন। আমিন।
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200 text-xs text-slate-700 text-center">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold">
                আদায়কারী / হিসাবরক্ষকের স্বাক্ষর
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{donation.createdBy || 'হিসাব শাখা'}</div>
            </div>
            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1 font-semibold">
                মুহতামিম / অনুমোদিত কর্তৃপক্ষের স্বাক্ষর ও সিল
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{tenant?.nameBangla}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
