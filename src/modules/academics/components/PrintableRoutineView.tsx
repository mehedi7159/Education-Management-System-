import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  Building,
  GraduationCap,
  UserCheck,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';
import {
  ClassEntity,
  SectionEntity,
  StaffEntity,
  SubjectEntity,
  ShiftEntity,
  AcademicSession,
  ClassRoutineSlotEntity,
  RoutinePeriod,
  DayOfWeek,
  Tenant,
} from '../../../types';
import { DAY_NAMES_SHORT_BN, DAY_NAMES_BN } from '../../../utils/routineConflictDetector';

interface PrintableRoutineViewProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  routineType: 'CLASS' | 'TEACHER' | 'ROOM' | 'ALL_CLASSES';
  targetClass?: ClassEntity;
  targetSection?: SectionEntity;
  targetTeacher?: StaffEntity;
  targetRoom?: string;
  targetShift?: ShiftEntity;
  activeSession?: AcademicSession;
  allRoutineSlots: ClassRoutineSlotEntity[];
  periods: RoutinePeriod[];
  days: DayOfWeek[];
  classes: ClassEntity[];
  teachers: StaffEntity[];
}

export const PrintableRoutineView: React.FC<PrintableRoutineViewProps> = ({
  isOpen,
  onClose,
  tenant,
  routineType,
  targetClass,
  targetSection,
  targetTeacher,
  targetRoom,
  targetShift,
  activeSession,
  allRoutineSlots,
  periods,
  days,
  classes,
  teachers,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Filter slots based on target
  let filteredSlots = allRoutineSlots;
  let printTitle = '';
  let printSubtitle = '';

  if (routineType === 'CLASS' && targetClass) {
    filteredSlots = allRoutineSlots.filter((s) => {
      if (s.classId !== targetClass.id) return false;
      if (targetSection && s.sectionId && s.sectionId !== targetSection.id) return false;
      return true;
    });
    printTitle = `জামাতভিত্তিক সাপ্তাহিক ক্লাস রুটিন (${targetClass.nameBangla})`;
    printSubtitle = `জামাত: ${targetClass.nameBangla}${targetSection ? ` • শাখা: ${targetSection.name}` : ''}${
      targetShift ? ` • শিফট: ${targetShift.nameBangla}` : ''
    }`;
  } else if (routineType === 'TEACHER' && targetTeacher) {
    filteredSlots = allRoutineSlots.filter((s) => s.teacherId === targetTeacher.id);
    printTitle = `উস্তাদভিত্তিক সাপ্তাহিক কার্যতালিকা ও ক্লাস রুটিন`;
    printSubtitle = `উস্তাদ: ${targetTeacher.nameBangla} (${targetTeacher.designation}) • বিভাগ: ${targetTeacher.department || 'সাধারণ'}`;
  } else if (routineType === 'ROOM' && targetRoom) {
    filteredSlots = allRoutineSlots.filter(
      (s) => s.roomNo?.toLowerCase() === targetRoom.toLowerCase()
    );
    printTitle = `কক্ষভিত্তিক সাপ্তাহিক সময়সূচি ও রুটিন`;
    printSubtitle = `কক্ষ / হলরুম নং: ${targetRoom}`;
  } else {
    printTitle = `সকল জামাতের সাপ্তাহিক মাস্টার ক্লাস রুটিন`;
    printSubtitle = `শিক্ষাবর্ষ: ${activeSession?.name || 'চলতি শিক্ষাবর্ষ'}`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
              রুটিন প্রিন্ট প্রিভিউ (Printable Routine Sheet)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>মুদ্রণ করুন (Print / Save PDF)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div ref={printAreaRef} className="p-8 sm:p-10 overflow-y-auto bg-white text-stone-950 font-serif">
          {/* Institutional Letterhead */}
          <div className="text-center pb-4 mb-4 border-b-2 border-stone-900">
            <div className="text-xs font-bold tracking-widest text-stone-600 font-sans mb-1">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
              {tenant.nameBangla || tenant.nameEnglish || 'মাদরাসা শিক্ষা ব্যবস্থাপনা'}
            </h1>
            <p className="text-xs text-stone-700 font-sans mt-0.5">
              {tenant.address}, {tenant.district} {tenant.phone ? `• মোবাইল: ${tenant.phone}` : ''}
            </p>
            <div className="inline-block mt-2 px-4 py-1 rounded-full border border-stone-800 bg-stone-50 font-sans">
              <span className="text-xs font-bold text-stone-900">{printTitle}</span>
            </div>
            <div className="text-xs text-stone-700 font-sans mt-1.5 font-medium">
              {printSubtitle} {activeSession ? `• শিক্ষাবর্ষ: ${activeSession.name}` : ''}
            </div>
          </div>

          {/* Timetable Matrix Grid for Print */}
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse border-2 border-stone-900 text-xs font-sans">
              <thead>
                <tr className="bg-stone-100 text-stone-950 border-b-2 border-stone-900 font-bold">
                  <th className="p-2.5 border border-stone-800 w-28 text-center">
                    বার / দিন
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.periodNumber}
                      className="p-2 border border-stone-800 text-center min-w-[110px]"
                    >
                      <div className="font-bold">{p.periodName}</div>
                      <div className="text-[10px] text-stone-600 font-mono font-normal">
                        {p.startTime} - {p.endTime}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {days.map((day) => (
                  <tr key={day} className="border-b border-stone-800">
                    <td className="p-2 border border-stone-800 font-bold bg-stone-50 text-center">
                      <div className="text-xs">{DAY_NAMES_SHORT_BN[day]}</div>
                      <div className="text-[9px] text-stone-500 font-normal font-sans">
                        {day}
                      </div>
                    </td>

                    {periods.map((period) => {
                      const matchedSlots = filteredSlots.filter(
                        (s) =>
                          s.dayOfWeek === day &&
                          Number(s.periodNumber) === period.periodNumber
                      );

                      return (
                        <td
                          key={period.periodNumber}
                          className="p-1.5 border border-stone-800 align-top text-center"
                        >
                          {matchedSlots.length > 0 ? (
                            <div className="space-y-1">
                              {matchedSlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="p-1 rounded bg-stone-50 border border-stone-400"
                                >
                                  <div className="font-bold text-[11px] text-stone-950 leading-tight">
                                    {slot.subjectName}
                                  </div>

                                  {routineType !== 'TEACHER' && (
                                    <div className="text-[10px] text-stone-800 leading-tight mt-0.5">
                                      {slot.teacherName}
                                    </div>
                                  )}

                                  {routineType !== 'CLASS' && (
                                    <div className="text-[10px] font-semibold text-stone-900 leading-tight mt-0.5">
                                      {slot.className}
                                      {slot.sectionName ? ` (${slot.sectionName})` : ''}
                                    </div>
                                  )}

                                  {slot.roomNo && routineType !== 'ROOM' && (
                                    <div className="text-[9px] text-stone-600 mt-0.5">
                                      কক্ষ: {slot.roomNo}
                                    </div>
                                  )}

                                  {slot.shiftName && (
                                    <div className="text-[8px] text-stone-500 mt-0.5">
                                      {slot.shiftName}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-10 flex items-center justify-center text-stone-300 text-[10px]">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Routine Notes & Guidelines */}
          <div className="mt-4 p-2.5 rounded border border-stone-300 bg-stone-50 text-[11px] font-sans text-stone-700 space-y-0.5">
            <div className="font-bold text-stone-900">নির্দেশনাবলী ও নিয়মাবলি:</div>
            <div>১. নির্ধারিত সময়ের অন্তত ৫ মিনিট পূর্বে সকল উস্তাদজি ও তালিবে ইলমদের জামাতে উপস্থিতি আবশ্যক।</div>
            <div>২. বিশেষ কোনো ছুটি বা পরিবর্তনের ক্ষেত্রে নাজেমে তা'লীমাত-এর পূর্বানুমতি প্রযোজ্য।</div>
          </div>

          {/* Formal Signatures Footer */}
          <div className="mt-12 pt-6 grid grid-cols-3 gap-6 text-center text-xs font-sans text-stone-800">
            <div>
              <div className="border-t border-stone-800 pt-1 font-bold">
                {routineType === 'CLASS' ? 'শ্রেণি শিক্ষক / জিম্মাদার' : 'সংশ্লিষ্ট উস্তাদজি'}
              </div>
              <div className="text-[10px] text-stone-500">স্বাক্ষর ও তারিখ</div>
            </div>
            <div>
              <div className="border-t border-stone-800 pt-1 font-bold">
                নাজেমে তা'লীমাত (শিক্ষা সচিব)
              </div>
              <div className="text-[10px] text-stone-500">স্বাক্ষর ও সিল</div>
            </div>
            <div>
              <div className="border-t border-stone-800 pt-1 font-bold">
                মুহতামিম / প্রিন্সিপাল
              </div>
              <div className="text-[10px] text-stone-500">অনুমোদন ও অফিসিয়াল সিল</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
