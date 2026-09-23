import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { StudentEntity, AdmissionFormData } from '../../../types';
import { Button } from '../../../components/common/Button';
import { formatDate, toBengaliNumerals } from '../../../utils/format';

interface PrintableAdmissionFormProps {
  student: StudentEntity;
  formData?: AdmissionFormData;
  onClose?: () => void;
}

export const PrintableAdmissionForm: React.FC<PrintableAdmissionFormProps> = ({
  student,
  formData,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden when printing */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white shadow-lg print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">ভর্তি আবেদন ফরম (Official Admission Form)</h3>
            <p className="text-xs text-slate-300">
              ভর্তি নং: <span className="font-mono text-sky-400 font-bold">{student.admissionNo}</span> • দাখিলা: {student.dakhilaNo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            আবেদন ফরম প্রিন্ট করুন
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

      {/* Printable Sheet */}
      <div className="printable-form bg-white text-slate-900 p-8 rounded-2xl shadow-md print:shadow-none print:p-0 max-w-4xl mx-auto border border-slate-300 print:border-none">
        {/* Header */}
        <div className="text-center relative pb-4 border-b-2 border-slate-800">
          <div className="text-sm font-arabic font-bold text-slate-800">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">দারুল উলূম ইসলামিয়া মাদ্রাসা ও এতিমখানা</h1>
          <p className="text-xs text-slate-600">মিরপুর-১২, ঢাকা-১২১৬ | ফোন: ০১৭১১-০০০০০১, ০১৮১১-০০০০০২</p>
          <div className="inline-block mt-2 px-6 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wide">
            ভর্তি আবেদন ফরম (ADMISSION APPLICATION FORM)
          </div>

          {/* Photo Slot */}
          <div className="absolute top-0 right-0 w-28 h-32 border-2 border-slate-400 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center text-center p-1">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt="Student"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">পাসপোর্ট সাইজ ছবি</span>
            )}
          </div>
        </div>

        {/* Form Meta Numbers */}
        <div className="grid grid-cols-4 gap-2 my-3 p-2 bg-slate-50 border border-slate-300 rounded text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">ভর্তি ফরম নম্বর:</span>
            <span className="font-bold font-mono">{student.admissionNo}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">শিক্ষাবর্ষ / সেশন:</span>
            <span className="font-bold">{student.sessionName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">শ্রেণি ও রোল:</span>
            <span className="font-bold">{student.className} (রোল: {toBengaliNumerals(student.rollNo)})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">ভর্তির তারিখ:</span>
            <span className="font-bold">{formatDate(student.admissionDate)}</span>
          </div>
        </div>

        {/* Section 1: Student Information */}
        <div className="mb-4">
          <h3 className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-800 mb-2">
            ১. শিক্ষার্থীর ব্যক্তিগত পরিচিতি (Student Information)
          </h3>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 w-1/4 font-semibold text-slate-600">শিক্ষার্থীর নাম (বাংলা):</td>
                <td className="py-1.5 w-1/4 font-bold text-slate-900">{student.nameBangla}</td>
                <td className="py-1.5 w-1/4 font-semibold text-slate-600">Student Name (English):</td>
                <td className="py-1.5 w-1/4 font-medium text-slate-900">{student.nameEnglish}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold text-slate-600">জন্ম তারিখ ও বয়স:</td>
                <td className="py-1.5 font-medium">{formatDate(student.dateOfBirth)}</td>
                <td className="py-1.5 font-semibold text-slate-600">রক্তের গ্রুপ ও ধর্ম:</td>
                <td className="py-1.5 font-medium">{student.bloodGroup || 'N/A'} • {student.religion || 'ইসলাম'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold text-slate-600">জন্ম নিবন্ধন নম্বর (NID/BRN):</td>
                <td className="py-1.5 font-mono">{student.birthCertificateNo || 'জমা দেওয়া হয়েছে'}</td>
                <td className="py-1.5 font-semibold text-slate-600">আবাসিক ব্যবস্থা:</td>
                <td className="py-1.5 font-medium">
                  {student.isResidential
                    ? `আবাসিক (${student.residenceHall || 'ছাত্রাবাস'}, রুম: ${student.roomNo || 'N/A'})`
                    : 'অনাবাসিক'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold text-slate-600">পূর্ববর্তী প্রতিষ্ঠান ও শ্রেণি:</td>
                <td colSpan={3} className="py-1.5 font-medium">{student.previousInstitution || 'প্রথম ভর্তি'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Guardian & Parent Info */}
        <div className="mb-4">
          <h3 className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-800 mb-2">
            ২. পিতামাতা ও আইনি অভিভাবকের বিবরণ (Guardian Information)
          </h3>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 w-1/4 font-semibold text-slate-600">আইনি অভিভাবক:</td>
                <td className="py-1.5 w-1/4 font-bold text-slate-900">
                  {student.guardianName} ({student.guardianRelation})
                </td>
                <td className="py-1.5 w-1/4 font-semibold text-slate-600">অভিভাবকের মোবাইল:</td>
                <td className="py-1.5 w-1/4 font-bold text-slate-900">{student.guardianMobile}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold text-slate-600">পিতার নাম ও পেশা:</td>
                <td className="py-1.5 font-medium">{student.fatherName} ({student.fatherOccupation || 'ব্যবসা'})</td>
                <td className="py-1.5 font-semibold text-slate-600">পিতার মোবাইল ও NID:</td>
                <td className="py-1.5 font-medium">{student.fatherMobile || student.guardianMobile}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1.5 font-semibold text-slate-600">মাতার নাম ও পেশা:</td>
                <td className="py-1.5 font-medium">{student.motherName || 'উল্লেখ নেই'} ({student.motherOccupation || 'গৃহিণী'})</td>
                <td className="py-1.5 font-semibold text-slate-600">মাতার মোবাইল:</td>
                <td className="py-1.5 font-medium">{student.motherMobile || 'উল্লেখ নেই'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Address */}
        <div className="mb-4">
          <h3 className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-800 mb-2">
            ৩. স্থায়ী ও বর্তমান ঠিকানা (Address)
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-600 block">বর্তমান ঠিকানা:</span>
              <p className="text-slate-900 mt-0.5">{student.presentAddress}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-600 block">স্থায়ী ঠিকানা:</span>
              <p className="text-slate-900 mt-0.5">{student.permanentAddress}</p>
            </div>
          </div>
        </div>

        {/* Section 4: Pledge / Declaration */}
        <div className="p-3 bg-slate-50 border border-slate-300 rounded text-[11px] leading-relaxed text-slate-700 mb-8">
          <p className="font-bold text-slate-900 mb-1">অঙ্গীকারনামা (Pledge & Undertaking):</p>
          আমি এই মর্মে অঙ্গীকার করছি যে, উপরে বর্ণিত যাবতীয় তথ্য সম্পূর্ণ সত্য ও সঠিক। মাদ্রাসার নিয়মানুবর্তিতা, ইসলামী অনুশাসন ও সুন্নতি জীবনযাত্রার সকল নিয়ম-কানুন আমার সন্তান/পোষ্য সর্বদা মেনে চলবে। কোনো প্রকার শৃঙ্খলা ভঙ্গ করলে মাদ্রাসা কর্তৃপক্ষের গৃহীত যেকোনো সিদ্ধান্ত আমি মানতে বাধ্য থাকব।
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs pt-8">
          <div>
            <div className="border-t border-slate-400 pt-1 font-semibold">শিক্ষার্থী / ছাত্রের স্বাক্ষর</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-semibold">অভিভাবকের স্বাক্ষর</div>
          </div>
          <div>
            <div className="border-t border-slate-400 pt-1 font-semibold">মুহতামিম / ভর্তি ইনচার্জের সিল</div>
          </div>
        </div>
      </div>
    </div>
  );
};
