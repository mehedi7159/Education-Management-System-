import React from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { AdmissionReceiptEntity } from '../../../types';
import { Button } from '../../../components/common/Button';
import { formatTaka, toBengaliNumerals, numberToBanglaWords, formatDate } from '../../../utils/format';

interface PrintableReceiptProps {
  receipt: AdmissionReceiptEntity;
  onClose?: () => void;
}

export const PrintableAdmissionReceipt: React.FC<PrintableReceiptProps> = ({ receipt, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const copies = [
    { title: 'শিক্ষার্থী কপি (Student Copy)', tagClass: 'bg-blue-100 text-blue-800' },
    { title: 'অফিস কপি (Office Copy)', tagClass: 'bg-emerald-100 text-emerald-800' },
    { title: 'হিসাব বিভাগ কপি (Accounts Copy)', tagClass: 'bg-amber-100 text-amber-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden when printing */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white shadow-lg print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">ভর্তি ফি ও মানি রসিদ (Official Admission Money Receipt)</h3>
            <p className="text-xs text-slate-300">
              রসিদ নম্বর: <span className="font-mono text-emerald-400 font-bold">{receipt.receiptNo}</span> • ফরম: {receipt.formNo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            রসিদ প্রিন্ট করুন (৩ কপি)
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-white border-slate-700 hover:bg-slate-800"
            >
              <X className="w-4 h-4 mr-1" /> বন্ধ করুন
            </Button>
          )}
        </div>
      </div>

      {/* Printable Area containing 3 Identical Slip Copies */}
      <div className="printable-receipt-container space-y-6 bg-white text-slate-900 p-2 sm:p-6 rounded-2xl shadow-md print:shadow-none print:p-0">
        {copies.map((copy, index) => (
          <div
            key={index}
            className="receipt-slip p-5 rounded-xl border-2 border-dashed border-slate-400 bg-white relative print:border-black print:mb-4 print:page-break-inside-avoid"
          >
            {/* Copy Badge */}
            <div className="absolute top-4 right-4 print:top-2 print:right-2">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border border-current ${copy.tagClass}`}>
                {copy.title}
              </span>
            </div>

            {/* Bismillah Header */}
            <div className="text-center mb-2">
              <span className="text-sm font-arabic font-bold text-slate-700">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                দারুল উলূম ইসলামিয়া মাদ্রাসা ও এতিমখানা
              </h2>
              <p className="text-[11px] text-slate-600">
                মিরপুর-১২, ঢাকা-১২১৬ | মোবাইল: ০১৭১১-০০০০০১, ০১৮১১-০০০০০২ | স্থাপিত: ১৯৯৮ ইং
              </p>
              <div className="inline-block px-4 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mt-1 border border-slate-300">
                ভর্তি ফি আদায় রসিদ (ADMISSION MONEY RECEIPT)
              </div>
            </div>

            {/* Receipt Meta Details Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs my-3">
              <div>
                <span className="text-slate-500 text-[10px] block">রসিদ নম্বর:</span>
                <span className="font-bold font-mono text-slate-900">{receipt.receiptNo}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ভর্তি / ফরম নম্বর:</span>
                <span className="font-bold font-mono text-slate-900">{receipt.formNo}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">আদায়ের তারিখ:</span>
                <span className="font-bold text-slate-900">{formatDate(receipt.admissionDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ভাউচার নম্বর:</span>
                <span className="font-bold font-mono text-slate-900">{receipt.voucherNo || 'VCH-ADM-001'}</span>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
              <div>
                <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
                <p className="font-bold text-slate-900 text-sm">{receipt.studentNameBangla}</p>
              </div>
              <div>
                <span className="text-slate-500">পিতা / অভিভাবক:</span>
                <p className="font-semibold text-slate-800">{receipt.guardianName} ({receipt.guardianMobile})</p>
              </div>
              <div>
                <span className="text-slate-500">শ্রেণি ও শাখা:</span>
                <p className="font-bold text-slate-900">{receipt.className} - {receipt.sectionName}</p>
              </div>
              <div>
                <span className="text-slate-500">রোল নম্বর:</span>
                <p className="font-bold text-slate-900">{toBengaliNumerals(receipt.rollNo)}</p>
              </div>
              <div>
                <span className="text-slate-500">শিক্ষাবর্ষ:</span>
                <p className="font-semibold text-slate-800">{receipt.sessionName}</p>
              </div>
              <div>
                <span className="text-slate-500">আবাসিক অবস্থা:</span>
                <p className="font-semibold text-slate-800">{receipt.isResidential ? 'আবাসিক' : 'অনাবাসিক'}</p>
              </div>
            </div>

            {/* Fee Items Table */}
            <table className="w-full text-xs border-collapse border border-slate-300 mb-3">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 px-2 py-1 text-left">ক্রম</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">ফি এর বিবরণ (Particulars)</th>
                  <th className="border border-slate-300 px-2 py-1 text-right">পরিমাণ (৳)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-2 py-1 text-center">১</td>
                  <td className="border border-slate-300 px-2 py-1">ভর্তি ও রেজিস্ট্রেশন ফি</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-medium">
                    {formatTaka(receipt.feeBreakdown.admissionFee)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-2 py-1 text-center">২</td>
                  <td className="border border-slate-300 px-2 py-1">বার্ষিক সেশন চার্জ</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-medium">
                    {formatTaka(receipt.feeBreakdown.sessionFee)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-2 py-1 text-center">৩</td>
                  <td className="border border-slate-300 px-2 py-1">আইডি কার্ড, ডায়েরি ও সিলেবাস</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-medium">
                    {formatTaka(receipt.feeBreakdown.idCardAndDiaryFee)}
                  </td>
                </tr>
                {receipt.feeBreakdown.monthlyTuitionFee > 0 && (
                  <tr>
                    <td className="border border-slate-300 px-2 py-1 text-center">৪</td>
                    <td className="border border-slate-300 px-2 py-1">১ম মাসের মাসিক বেতন</td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-medium">
                      {formatTaka(receipt.feeBreakdown.monthlyTuitionFee)}
                    </td>
                  </tr>
                )}
                {receipt.feeBreakdown.boardingCharge > 0 && (
                  <tr>
                    <td className="border border-slate-300 px-2 py-1 text-center">৫</td>
                    <td className="border border-slate-300 px-2 py-1">আবাসিক বোর্ডিং চার্জ</td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-medium">
                      {formatTaka(receipt.feeBreakdown.boardingCharge)}
                    </td>
                  </tr>
                )}
                {receipt.feeBreakdown.otherFee > 0 && (
                  <tr>
                    <td className="border border-slate-300 px-2 py-1 text-center">৬</td>
                    <td className="border border-slate-300 px-2 py-1">অন্যান্য বিবিধ ফি</td>
                    <td className="border border-slate-300 px-2 py-1 text-right font-medium">
                      {formatTaka(receipt.feeBreakdown.otherFee)}
                    </td>
                  </tr>
                )}

                {/* Subtotal & Discounts */}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="border border-slate-300 px-2 py-1 text-right">
                    মোট নির্ধারিত ফি (Subtotal):
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-right">
                    {formatTaka(receipt.totalAmount)}
                  </td>
                </tr>

                {receipt.discountAmount > 0 && (
                  <tr className="text-emerald-700 font-semibold">
                    <td colSpan={2} className="border border-slate-300 px-2 py-1 text-right">
                      বিশেষ ছাড় / বৃত্তি ({receipt.waiverCategory}):
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      - {formatTaka(receipt.discountAmount)}
                    </td>
                  </tr>
                )}

                <tr className="bg-slate-100 font-bold text-sm">
                  <td colSpan={2} className="border border-slate-300 px-2 py-1 text-right">
                    আদায়কৃত মোট টাকা (Paid Amount):
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-right text-emerald-800">
                    {formatTaka(receipt.paidAmount)}
                  </td>
                </tr>

                {receipt.dueAmount > 0 && (
                  <tr className="text-rose-600 font-bold">
                    <td colSpan={2} className="border border-slate-300 px-2 py-1 text-right">
                      অবশিষ্ট বকেয়া (Due Amount):
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-right">
                      {formatTaka(receipt.dueAmount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* In Words & Payment Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-200 mb-6">
              <div>
                কথায়: <span className="font-bold text-slate-900">{numberToBanglaWords(receipt.paidAmount)}</span>
              </div>
              <div>
                পদ্ধতি: <span className="font-semibold">{receipt.paymentMethod}</span> ({receipt.accountName})
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-[11px] text-slate-700">
              <div>
                <div className="border-t border-slate-400 pt-1 font-semibold">
                  {receipt.collectedBy || 'আদায়কারী'}
                </div>
                <span className="text-[10px] text-slate-500">আদায়কারীর স্বাক্ষর</span>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 font-semibold">হিসাব বিভাগ</div>
                <span className="text-[10px] text-slate-500">হিসাব রক্ষকের স্বাক্ষর</span>
              </div>
              <div>
                <div className="border-t border-slate-400 pt-1 font-semibold">মুহতামিম / অধ্যক্ষ</div>
                <span className="text-[10px] text-slate-500">কর্তৃপক্ষের সিল ও স্বাক্ষর</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
