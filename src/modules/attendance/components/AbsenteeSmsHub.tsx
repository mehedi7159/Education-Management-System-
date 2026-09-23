import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  PhoneCall,
  Calendar,
  Layers,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { StudentEntity, ClassEntity, AttendanceEntity, AttendanceStatus, SmsAlertRecord } from '../../../types';

interface AbsenteeSmsHubProps {
  students: StudentEntity[];
  classes: ClassEntity[];
  attendances: AttendanceEntity[];
  selectedDate: string;
  onSendSms: (studentIds: string[], template: string) => Promise<void>;
  smsAlerts: SmsAlertRecord[];
}

export const AbsenteeSmsHub: React.FC<AbsenteeSmsHubProps> = ({
  students,
  classes,
  attendances,
  selectedDate,
  onSendSms,
  smsAlerts,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [smsTemplate, setSmsTemplate] = useState<string>(
    'সম্মানিত অভিভাবক, আপনার সন্তান [নাম] (রোল: [রোল], [শ্রেণি]), অদ্য [তারিখ] তারিখে মাদ্রাসায় অনুপস্থিত। জামিয়া কর্তৃপক্ষ।'
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Find students marked as ABSENT on the selected date
  const dateAttendances = attendances.filter((a) => a.date === selectedDate);
  const attendanceMap = new Map(dateAttendances.map((a) => [a.studentId, a]));

  const absentStudents = students
    .filter((st) => {
      if (selectedClassId !== 'ALL' && st.classId !== selectedClassId) return false;
      const att = attendanceMap.get(st.id);
      return att ? att.status === AttendanceStatus.ABSENT : false;
    })
    .map((st) => {
      const cls = classes.find((c) => c.id === st.classId);
      return {
        ...st,
        className: cls?.nameBangla || 'শ্রেণি',
      };
    });

  // Select all toggler
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === absentStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(absentStudents.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSend = async () => {
    if (selectedStudentIds.length === 0) {
      alert('অনুগ্রহ করে অন্তত একজন অনুপস্থিত শিক্ষার্থী নির্বাচন করুন।');
      return;
    }
    try {
      setIsSending(true);
      await onSendSms(selectedStudentIds, smsTemplate);
      setSendSuccessMsg(
        `সফল! ${selectedStudentIds.length} জন অনুপস্থিত শিক্ষার্থীর অভিভাবকের কাছে এসএমএস সফলভাবে প্রেরণ করা হয়েছে।`
      );
      setSelectedStudentIds([]);
      setTimeout(() => setSendSuccessMsg(null), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Alert message if success */}
      {sendSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{sendSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner & SMS Template Designer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Template Box */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  অনুপস্থিতি এসএমএস নোটিফিকেশন ইঞ্জিন (SMS Alert Dispatcher)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  হাজিরা খাতা থেকে অনুপস্থিত চিহ্নিত হওয়া মাত্রই অভিভাবকদের তাৎক্ষণিক সতর্কবার্তা পাঠান।
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>এসএমএস বার্তা টেমপ্লেট (SMS Message Body)</span>
              <span className="text-[11px] text-slate-400">ভেরিয়েবল: [নাম], [রোল], [শ্রেণি], [তারিখ]</span>
            </label>
            <textarea
              rows={3}
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">শ্রেণি ফিল্টার:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
              >
                <option value="ALL">সকল শ্রেণি</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameBangla}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSend}
              disabled={isSending || selectedStudentIds.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSending
                  ? 'প্রেরণ করা হচ্ছে...'
                  : `নির্বাচিত ${selectedStudentIds.length} জন অভিভাবককে এসএমএস পাঠান`}
              </span>
            </button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              এসএমএস প্রিভিউ (Sample Preview)
            </div>
            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
              {smsTemplate
                .replace('[নাম]', 'মুহাম্মদ আনাস ইবনে মালেক')
                .replace('[রোল]', '৫')
                .replace('[শ্রেণি]', 'নূরানী ১ম শ্রেণি')
                .replace('[তারিখ]', selectedDate)}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500">
            গেಟ್‌ওয়ে: গ্রামীণফোন / রবি এসএমএস বাল্ক চ্যানেল (DLR সক্রিয়)
          </div>
        </div>
      </div>

      {/* Absent Students Selection Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-600" />
            <span>অদ্যকার ({selectedDate}) অনুপস্থিত শিক্ষার্থীদের তালিকা ({absentStudents.length} জন)</span>
          </div>

          {absentStudents.length > 0 && (
            <button
              onClick={handleToggleSelectAll}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 transition"
            >
              {selectedStudentIds.length === absentStudents.length ? 'সব আনচেক করুন' : 'সবাইকে সিলেক্ট করুন'}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={absentStudents.length > 0 && selectedStudentIds.length === absentStudents.length}
                    onChange={handleToggleSelectAll}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                </th>
                <th className="px-4 py-3 w-14 text-center">রোল</th>
                <th className="px-4 py-3">শিক্ষার্থীর নাম</th>
                <th className="px-4 py-3">শ্রেণি</th>
                <th className="px-4 py-3">অভিভাবকের নাম</th>
                <th className="px-4 py-3">মোবাইল নম্বর</th>
                <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {absentStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-1.5 text-emerald-500 opacity-60" />
                    আজকের তারিখে কোনো শিক্ষার্থী অনুপস্থিত চিহ্নিত করা হয়নি অথবা সবাই উপস্থিত।
                  </td>
                </tr>
              ) : (
                absentStudents.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                        isChecked ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                      onClick={() => handleToggleSelect(st.id)}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(st.id)}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {st.rollNo}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {st.nameBangla}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {st.className}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {st.guardianName || st.fatherName || 'মাওলানা রফিকুল ইসলাম'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                        {st.guardianMobile || '01711-223344'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          অনুপস্থিত
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Dispatched SMS Logs */}
      {smsAlerts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>সাম্প্রতিক প্রেরিত এসএমএস হিস্ট্রি (Delivery Logs)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">সময়</th>
                  <th className="px-4 py-2.5">শিক্ষার্থী</th>
                  <th className="px-4 py-2.5">মোবাইল</th>
                  <th className="px-4 py-2.5">বার্তা বিবরণ</th>
                  <th className="px-4 py-2.5 text-center">ডেলিভারি স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {smsAlerts.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                      {log.sentAt}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100">
                      {log.studentName} ({log.className})
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                      {log.recipientMobile}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                      {log.messageText}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
