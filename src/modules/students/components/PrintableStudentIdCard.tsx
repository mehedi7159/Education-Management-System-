import React from 'react';
import { Printer, X, ShieldCheck } from 'lucide-react';
import { StudentEntity, ClassEntity, SectionEntity, Tenant } from '../../../types';
import { formatDate, toBengaliNumerals } from '../../../utils/format';
import { Button } from '../../../components/common/Button';

interface PrintableStudentIdCardProps {
  student: StudentEntity;
  tenant: Tenant;
  classes: ClassEntity[];
  sections: SectionEntity[];
  onClose: () => void;
}

export const PrintableStudentIdCard: React.FC<PrintableStudentIdCardProps> = ({
  student,
  tenant,
  classes,
  sections,
  onClose,
}) => {
  const currentClass = classes.find((c) => c.id === student.classId);
  const currentSection = sections.find((s) => s.id === student.sectionId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      {/* Top Floating Control Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-xl border border-slate-200">
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Printer className="w-4 h-4" />}
          onClick={handlePrint}
        >
          আইডি কার্ড প্রিন্ট করুন
        </Button>
        <Button size="sm" variant="outline" onClick={onClose} leftIcon={<X className="w-4 h-4" />}>
          বন্ধ করুন
        </Button>
      </div>

      <div className="bg-slate-100 p-6 sm:p-10 rounded-3xl shadow-2xl print:shadow-none print:bg-white print:p-0 max-w-4xl w-full">
        <div className="text-center mb-6 print:hidden">
          <h2 className="text-lg font-bold text-slate-900">ডিজিটাল স্মার্ট স্টুডেন্ট আইডি কার্ড</h2>
          <p className="text-xs text-slate-500">
            সামনে ও পেছনের অংশ প্রিন্ট উপযোগী স্ট্যান্ডার্ড কার্ড সাইজে প্রদর্শিত (CR80: 85.6mm × 54mm)
          </p>
        </div>

        {/* Card Pair Layout (Front and Back side by side) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 print:gap-10">
          {/* ================= ID CARD FRONT ================= */}
          <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 relative flex flex-col justify-between print:shadow-none print:border-2 print:border-slate-800">
            {/* Top Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 text-center relative">
              <div className="w-12 h-12 mx-auto rounded-full bg-white p-1 shadow-md mb-1.5 flex items-center justify-center">
                {tenant.logoUrl ? (
                  <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-bold text-emerald-900 text-sm">{tenant.nameBangla.slice(0, 2)}</span>
                )}
              </div>
              <h3 className="font-bold text-sm tracking-tight leading-tight line-clamp-1">
                {tenant.nameBangla}
              </h3>
              <p className="text-[9px] text-emerald-200 tracking-wider uppercase mt-0.5">
                STUDENT IDENTITY CARD
              </p>
            </div>

            {/* Middle Profile & Avatar */}
            <div className="flex-1 flex flex-col items-center px-5 pt-3 pb-2 text-center">
              {/* Photo */}
              <div className="w-24 h-28 rounded-xl border-2 border-emerald-800 p-0.5 bg-slate-50 shadow-md mb-2 overflow-hidden">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.nameBangla}
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                    <span className="text-[10px] font-bold">ছবি</span>
                  </div>
                )}
              </div>

              {/* Student Name */}
              <h4 className="font-bold text-base text-slate-900 leading-tight">
                {student.nameBangla}
              </h4>
              <p className="text-[11px] font-semibold text-slate-600 mb-1">
                {student.nameEnglish || 'Student'}
              </p>

              {/* Student ID & Roll Pill */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full text-xs mb-3">
                <span className="font-mono font-bold text-emerald-900">{student.studentIdCardNo}</span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-emerald-950">রোল: {toBengaliNumerals(student.rollNo)}</span>
              </div>

              {/* Detailed Grid Info */}
              <div className="w-full text-[11px] space-y-1 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">শ্রেণি / জামাত:</span>
                  <span className="font-bold text-slate-900">{currentClass?.nameBangla || student.className || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">শাখা:</span>
                  <span className="font-semibold text-slate-800">{currentSection?.name || student.sectionName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">শিক্ষাবর্ষ:</span>
                  <span className="font-medium text-slate-800">{student.sessionName || '২০২৫-২০২৬'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">রক্তের গ্রুপ:</span>
                  <span className="font-bold text-rose-700">{student.bloodGroup || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">আবাসন:</span>
                  <span className="font-semibold text-emerald-800">{student.isResidential ? 'আবাসিক' : 'অনাবাসিক'}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[9px] text-slate-600">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>ভেরিফায়েড শিক্ষার্থী</span>
              </div>
              <div className="text-center font-bold text-emerald-950">
                অধ্যক্ষ / মুহতামিম
              </div>
            </div>
          </div>

          {/* ================= ID CARD BACK ================= */}
          <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 relative flex flex-col justify-between print:shadow-none print:border-2 print:border-slate-800 p-5">
            <div>
              {/* Instructions Header */}
              <div className="border-b-2 border-emerald-800 pb-2 mb-3 text-center">
                <h4 className="font-bold text-xs text-emerald-950">জরুরি যোগাযোগ ও কার্ডের শর্তাবলি</h4>
                <p className="text-[9px] text-slate-500">Terms & Emergency Information</p>
              </div>

              {/* Guardian Info */}
              <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
                <div>
                  <span className="text-slate-500 block text-[10px]">পিতা / অভিভাবক:</span>
                  <span className="font-bold text-slate-900">{student.fatherName || student.guardianName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">জরুরি মোবাইল নং:</span>
                  <span className="font-mono font-bold text-emerald-900 text-sm">{student.guardianMobile}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">স্থায়ী ঠিকানা:</span>
                  <span className="text-slate-800 text-[11px] leading-tight block">
                    {student.permanentAddress || student.presentAddress}
                  </span>
                </div>
              </div>

              {/* Terms & Regulations */}
              <div className="text-[10px] text-slate-600 space-y-1 leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                <p>১. এই কার্ডটি মাদ্রাসার সম্পত্তি, সর্বদা সাথে রাখা বাধ্যতামূলক।</p>
                <p>২. কার্ডটি হস্তান্তরযোগ্য নয় এবং হারানো গেলে তাৎক্ষণিক অফিসে জানাতে হবে।</p>
                <p>৩. কার্ডটি পাওয়া গেলে নিম্নের ঠিকানায় ফেরত দেওয়ার অনুরোধ করা হচ্ছে।</p>
              </div>
            </div>

            {/* Barcode Simulator & Address */}
            <div className="text-center pt-2 border-t border-slate-200">
              {/* Barcode line simulation */}
              <div className="flex justify-center items-center gap-0.5 h-8 px-4 mb-1">
                {[4, 2, 6, 1, 3, 5, 2, 7, 3, 2, 5, 1, 6, 3, 2, 4, 1, 5, 3, 2, 6, 2, 4, 1, 3, 5].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 h-full"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
              <div className="font-mono text-[10px] text-slate-500 font-bold mb-2 tracking-widest">
                *{student.studentIdCardNo}*
              </div>

              <p className="font-bold text-[10px] text-emerald-950">{tenant.nameBangla}</p>
              <p className="text-[9px] text-slate-500">{tenant.address}, {tenant.district}</p>
              <p className="text-[9px] text-emerald-800 font-medium">হেল্পলাইন: {tenant.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
