import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import { StudentEntity, ClassEntity, SectionEntity, Tenant } from '../../../types';
import { formatDate, toBengaliNumerals } from '../../../utils/format';
import { Button } from '../../../components/common/Button';

interface PrintableStudentProfileProps {
  student: StudentEntity;
  tenant: Tenant;
  classes: ClassEntity[];
  sections: SectionEntity[];
  onClose: () => void;
}

export const PrintableStudentProfile: React.FC<PrintableStudentProfileProps> = ({
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex justify-center p-2 sm:p-6 print:p-0 print:bg-white">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200">
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Printer className="w-4 h-4" />}
          onClick={handlePrint}
        >
          প্রিন্ট করুন (Print)
        </Button>
        <Button size="sm" variant="outline" onClick={onClose} leftIcon={<X className="w-4 h-4" />}>
          বন্ধ করুন
        </Button>
      </div>

      {/* Main A4 Printable Document Container */}
      <div className="bg-white text-slate-900 w-full max-w-4xl min-h-[297mm] p-8 sm:p-12 rounded-2xl shadow-2xl print:shadow-none print:rounded-none print:w-full print:p-8 print:m-0 border border-slate-200 print:border-none">
        {/* Official Madrasah Header */}
        <div className="text-center border-b-2 border-emerald-900 pb-5 mb-6 relative">
          <div className="flex items-center justify-between mb-2">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt="Logo"
                className="w-18 h-18 object-contain rounded-full border border-emerald-800/20 p-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-18 h-18 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl border-2 border-emerald-900 shadow-xs">
                {tenant.nameBangla.slice(0, 2)}
              </div>
            )}
            <div className="flex-1 px-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900 font-serif tracking-tight">
                {tenant.nameBangla}
              </h1>
              {tenant.nameArabic && (
                <p className="text-base text-emerald-950/80 font-arabic dir-rtl mt-0.5" dir="rtl">
                  {tenant.nameArabic}
                </p>
              )}
              <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase mt-0.5">
                {tenant.nameEnglish || 'Integrated Islamic Education & Hifz Institute'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {tenant.address}, {tenant.district} | হেল্পলাইন: {tenant.phone} | ইমেইল: {tenant.email || 'info@madrasah.edu.bd'}
              </p>
            </div>
            {/* Student Photo */}
            <div className="w-24 h-28 border-2 border-slate-400 bg-slate-100 rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-1 shrink-0">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.nameBangla}
                  className="w-full h-full object-cover rounded"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                  পাসপোর্ট সাইজ ছবি
                </div>
              )}
            </div>
          </div>

          <div className="inline-block bg-emerald-900 text-white font-bold px-6 py-1 rounded-full text-xs tracking-wider uppercase mt-2 shadow-xs">
            শিক্ষার্থী পূর্ণাঙ্গ পরিচিতি ও ভর্তি সনদপত্র (STUDENT BIODATA & PROFILE)
          </div>
        </div>

        {/* Essential Academic Identification Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl mb-6 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">শিক্ষার্থী আইডি (Student ID):</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{student.studentIdCardNo}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">ভর্তি নম্বর (Admission No):</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{student.admissionNo}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">ভর্তির তারিখ:</span>
            <span className="font-bold text-slate-900">{formatDate(student.admissionDate, 'bn')}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">শিক্ষার্থীর অবস্থা:</span>
            <span className="font-bold text-emerald-800">
              {student.status === 'ACTIVE' ? 'নিয়মিত ও সক্রিয়' : student.status}
            </span>
          </div>
        </div>

        {/* Section 1: Personal Information */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-emerald-300 pb-1 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800 inline-block"></span>
            ১. শিক্ষার্থীর ব্যক্তিগত ও পরিচয়মূলক তথ্য (Personal Information)
          </h2>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50 w-1/4">পূর্ণ নাম (বাংলা):</td>
                <td className="py-2 px-3 font-bold text-slate-900 w-1/4">{student.nameBangla}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50 w-1/4">Full Name (English):</td>
                <td className="py-2 px-3 font-medium text-slate-900 w-1/4">{student.nameEnglish || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">الاسم بالعربية:</td>
                <td className="py-2 px-3 font-arabic text-sm text-slate-900" dir="rtl">{student.nameArabic || 'N/A'}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">লিঙ্গ (Gender):</td>
                <td className="py-2 px-3 text-slate-900">{student.gender === 'FEMALE' ? 'মহিলা (Female)' : 'পুরুষ (Male)'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">জন্ম তারিখ (DOB):</td>
                <td className="py-2 px-3 text-slate-900">{formatDate(student.dateOfBirth, 'bn')}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">রক্তের গ্রুপ (Blood Group):</td>
                <td className="py-2 px-3 font-bold text-rose-700">{student.bloodGroup || 'অজানা'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">ধর্ম (Religion):</td>
                <td className="py-2 px-3 text-slate-900">{student.religion || 'ইসলাম'}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">জন্ম নিবন্ধন নম্বর (BRN):</td>
                <td className="py-2 px-3 font-mono font-medium text-slate-900">{student.birthCertificateNo || 'প্রযোজ্য নয়'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">বায়োমেট্রিক পাঞ্চ আইডি:</td>
                <td className="py-2 px-3 font-mono text-slate-900">{student.biometricId || 'N/A'}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">পূর্ববর্তী শিক্ষা প্রতিষ্ঠান:</td>
                <td className="py-2 px-3 text-slate-900">{student.previousInstitution || 'কোনো পূর্ববর্তী প্রতিষ্ঠান নেই'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Academic & Institutional Information */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-emerald-300 pb-1 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800 inline-block"></span>
            ২. অ্যাকাডেমিক ও শ্রেণিবিন্যাস সংক্রান্ত তথ্য (Academic Details)
          </h2>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50 w-1/4">শ্রেণি / জামাত:</td>
                <td className="py-2 px-3 font-bold text-emerald-900 w-1/4">
                  {currentClass?.nameBangla || student.className || 'N/A'}
                </td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50 w-1/4">শাখা (Section):</td>
                <td className="py-2 px-3 font-bold text-slate-900 w-1/4">
                  {currentSection?.name || student.sectionName || 'N/A'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">রোল নম্বর:</td>
                <td className="py-2 px-3 font-bold text-base text-emerald-900">
                  {toBengaliNumerals(student.rollNo)}
                </td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">শিক্ষাবর্ষ (Session):</td>
                <td className="py-2 px-3 text-slate-900">{student.sessionName || '1446-1447 হি. / 2025-2026'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">দাখিলা নম্বর (Dakhila No):</td>
                <td className="py-2 px-3 font-mono text-slate-900">{student.dakhilaNo || 'N/A'}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">রেজিস্ট্রেশন নম্বর:</td>
                <td className="py-2 px-3 font-mono text-slate-900">{student.registrationNo || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">অ্যাকাডেমিক বিভাগ:</td>
                <td className="py-2 px-3 font-medium text-slate-900">{student.department || currentClass?.department || 'সাধারণ'}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">শিফট (Shift):</td>
                <td className="py-2 px-3 text-slate-900">{student.shiftName || 'দিবা শিফট (Day)'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">আবাসিক অবস্থা:</td>
                <td className="py-2 px-3 font-bold text-slate-900">
                  {student.isResidential ? 'আবাসিক (Residential Student)' : 'অনাবাসিক (Day Scholar)'}
                </td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">ছাত্রাবাস / কক্ষ / সিট:</td>
                <td className="py-2 px-3 text-slate-900">
                  {student.isResidential
                    ? `${student.residenceHall || 'প্রধান ছাত্রাবাস'} (কক্ষ: ${student.roomNo || 'N/A'}, সিট: ${student.bedNo || 'N/A'})`
                    : 'প্রযোজ্য নয়'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Guardian & Family Information */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-emerald-300 pb-1 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800 inline-block"></span>
            ৩. পিতা, মাতা ও অভিভাবকের তথ্যাবলি (Guardian & Family Details)
          </h2>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50 w-1/4">পিতার নাম:</td>
                <td className="py-2 px-3 font-bold text-slate-900 w-1/4">{student.fatherName || student.guardianName}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50 w-1/4">পিতার পেশা:</td>
                <td className="py-2 px-3 text-slate-900 w-1/4">{student.fatherOccupation || 'ব্যবসা / চাকরি'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">পিতার মোবাইল:</td>
                <td className="py-2 px-3 font-mono text-slate-900">{student.fatherMobile || student.guardianMobile}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">পিতার এনআইডি:</td>
                <td className="py-2 px-3 font-mono text-slate-900">{student.fatherNid || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">মাতার নাম:</td>
                <td className="py-2 px-3 font-bold text-slate-900">{student.motherName || 'মোসাম্মৎ আয়েশা বেগম'}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">মাতার পেশা:</td>
                <td className="py-2 px-3 text-slate-900">{student.motherOccupation || 'গৃহিণী'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">মাতার মোবাইল:</td>
                <td className="py-2 px-3 font-mono text-slate-900">{student.motherMobile || 'N/A'}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">মাতার এনআইডি:</td>
                <td className="py-2 px-3 font-mono text-slate-900">{student.motherNid || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">আইনি অভিভাবকের নাম:</td>
                <td className="py-2 px-3 font-bold text-emerald-950">{student.guardianName} ({student.guardianRelation || 'পিতা'})</td>
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">জরুরি যোগাযোগ মোবাইল:</td>
                <td className="py-2 px-3 font-bold font-mono text-emerald-900">{student.guardianMobile}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Address Details */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-emerald-300 pb-1 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-800 inline-block"></span>
            ৪. স্থায়ী ও বর্তমান ঠিকানা (Address Details)
          </h2>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50 w-1/4">বর্তমান ঠিকানা:</td>
                <td className="py-2 px-3 text-slate-900" colSpan={3}>
                  {student.presentAddress}
                  {student.presentThana && `, থানা: ${student.presentThana}`}
                  {student.presentDistrict && `, জেলা: ${student.presentDistrict}`}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3 font-semibold text-slate-600 bg-slate-50">স্থায়ী ঠিকানা:</td>
                <td className="py-2 px-3 text-slate-900" colSpan={3}>
                  {student.permanentAddress || student.presentAddress}
                  {student.permanentThana && `, থানা: ${student.permanentThana}`}
                  {student.permanentDistrict && `, জেলা: ${student.permanentDistrict}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Declaration & Official Signatures */}
        <div className="mt-8 pt-4 border-t-2 border-slate-300 text-xs">
          <p className="text-[11px] text-slate-600 text-justify mb-8 leading-relaxed">
            <strong>অঙ্গীকারনামা:</strong> আমি এই মর্মে প্রত্যয়ন করছি যে, উপরোক্ত সমস্ত তথ্যাদি সম্পূর্ণ নির্ভুল এবং সত্য। মাদ্রাসার যাবতীয় নিয়ম-শৃঙ্খলা, পাঠ্যক্রম এবং ওস্তাদগণের দিকনির্দেশনা নিষ্ঠার সহিত মেনে চলতে শিক্ষার্থী ও অভিভাবক উভয়ই বাধ্য থাকিব।
          </p>
          <div className="grid grid-cols-3 gap-8 text-center pt-8">
            <div>
              <div className="border-t border-slate-800 pt-1.5 font-semibold text-slate-800">
                অভিভাবকের স্বাক্ষর ও তারিখ
              </div>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1.5 font-semibold text-slate-800">
                নাজেমে তা'লীমাত (শিক্ষা সচিব)
              </div>
            </div>
            <div>
              <div className="border-t border-slate-800 pt-1.5 font-bold text-emerald-950">
                মুহতামিম / অধ্যক্ষের স্বাক্ষর ও সিল
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer Notice */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
          <span>ইলেকট্রনিক্যালি জেনারেটকৃত নথি — {tenant.nameBangla} সেন্ট্রাল ডেটাবেস</span>
          <span>প্রিন্ট তারিখ ও সময়: {new Date().toLocaleDateString('bn-BD')}</span>
        </div>
      </div>
    </div>
  );
};
