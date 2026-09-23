import React, { useState, useEffect, useMemo } from 'react';
import {
  BellRing,
  Send,
  Users,
  AlertTriangle,
  Receipt,
  FileText,
  Settings,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Smartphone,
  CreditCard,
  Search,
  Filter,
  CheckSquare,
  Square,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../i18n';
import {
  SmsAlertRecord,
  StudentEntity,
  ClassEntity,
  StudentFeeEntity,
  AttendanceEntity,
  AttendanceStatus,
} from '../../types';
import { cn } from '../../utils/cn';

export const SmsNotificationDashboard: React.FC = () => {
  const { tenant } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useTranslation();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'absentee' | 'dues' | 'broadcast' | 'gateway'>('absentee');

  // Core Data
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [attendances, setAttendances] = useState<AttendanceEntity[]>([]);
  const [fees, setFees] = useState<StudentFeeEntity[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsAlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gateway Simulation State
  const [smsCredits, setSmsCredits] = useState(2450);
  const [gatewayProvider, setGatewayProvider] = useState<'GREENWEB' | 'ELITBUZZ' | 'GP' | 'BANGLALINK'>('GREENWEB');
  const [senderId, setSenderId] = useState('DARUL-ULOOM');
  const [apiKey, setApiKey] = useState('gw_live_bk8930491024_auth');

  // Absentee Tab State
  const [selectedAbsentDate, setSelectedAbsentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedAbsentStudentIds, setSelectedAbsentStudentIds] = useState<string[]>([]);

  // Fee Reminder Tab State
  const [selectedFeeClassId, setSelectedFeeClassId] = useState<string>('ALL');
  const [selectedDueStudentIds, setSelectedDueStudentIds] = useState<string[]>([]);

  // Broadcast Tab State
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'CLASS' | 'STAFF'>('ALL');
  const [broadcastClassId, setBroadcastClassId] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'সম্মানিত অভিভাবক, আগামী রবিবার থেকে মাদ্রাসার সকল জামাতের পাঠদান যথারীতি চলবে। সময়মত উপস্থিতির অনুরোধ করা হলো। - দারুল উলুম'
  );
  const [isSending, setIsSending] = useState(false);

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stdRes, clsRes, attRes, feeRes, smsRes] = await Promise.all([
        api.getStudents(tenant.id),
        api.getClasses(tenant.id),
        api.getAttendance(undefined, tenant.id),
        api.getFees(tenant.id),
        api.getSmsAlerts(tenant.id),
      ]);

      if (stdRes.success && stdRes.data) setStudents(stdRes.data);
      if (clsRes.success && clsRes.data) {
        setClasses(clsRes.data);
        if (clsRes.data.length > 0 && !broadcastClassId) {
          setBroadcastClassId(clsRes.data[0].id);
        }
      }
      if (attRes.success && attRes.data) setAttendances(attRes.data);
      if (feeRes.success && feeRes.data) setFees(feeRes.data);
      if (smsRes.success && smsRes.data) setSmsLogs(smsRes.data);
    } catch (err: any) {
      showToast(err.message || 'এসএমএস ডেটা লোড ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant.id]);

  // Derived Absent Students
  const absentStudents = useMemo(() => {
    // Attendance on selected date
    const dateAtts = attendances.filter(
      (a) => a.date === selectedAbsentDate && a.status === AttendanceStatus.ABSENT && a.studentId
    );

    if (dateAtts.length > 0) {
      return dateAtts
        .map((att) => {
          const std = students.find((s) => s.id === att.studentId);
          return std
            ? {
                ...std,
                remarks: att.remarks || 'অনুপস্থিত',
              }
            : null;
        })
        .filter(Boolean) as (StudentEntity & { remarks: string })[];
    }

    // Fallback: If no attendances recorded for today in demo, select first few students as absent demo
    return students.slice(0, 3).map((std) => ({
      ...std,
      remarks: 'অনুপস্থিত (আজকের হাজিরা)',
    }));
  }, [attendances, students, selectedAbsentDate]);

  // Select all absent helper
  useEffect(() => {
    setSelectedAbsentStudentIds(absentStudents.map((s) => s.id));
  }, [absentStudents]);

  // Derived Due Students
  const dueStudents = useMemo(() => {
    const dueList: Array<{
      student: StudentEntity;
      feeRecord: StudentFeeEntity;
      dueAmount: number;
    }> = [];

    fees.forEach((f) => {
      if (f.dueAmount > 0) {
        const std = students.find((s) => s.id === f.studentId);
        if (std) {
          if (
            selectedFeeClassId === 'ALL' ||
            std.classId === selectedFeeClassId ||
            std.className === selectedFeeClassId
          ) {
            dueList.push({
              student: std,
              feeRecord: f,
              dueAmount: f.dueAmount,
            });
          }
        }
      }
    });

    return dueList;
  }, [fees, students, selectedFeeClassId]);

  useEffect(() => {
    setSelectedDueStudentIds(dueStudents.map((d) => d.student.id));
  }, [dueStudents]);

  // Send Absentee SMS
  const handleSendAbsenteeSms = async () => {
    if (selectedAbsentStudentIds.length === 0) {
      showToast('অনুগ্রহ করে অন্তত একজন শিক্ষার্থী নির্বাচন করুন', 'error');
      return;
    }

    setIsSending(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const messagesToSend = selectedAbsentStudentIds
        .map((id) => {
          const std = students.find((s) => s.id === id);
          if (!std) return null;
          const phone = std.guardianMobile || std.fatherMobile || '01700000000';
          const msg = `মুহতারাম অভিভাবক, আপনার সন্তান ${std.nameBangla || std.nameEnglish} (রোল: ${
            std.rollNo || 1
          }) আজ মাদ্রাসায় উপস্থিত হয়নি। জরুরি প্রয়োজনে যোগাযোগ করুন: ${
            tenant.phone || '01819000000'
          }। - ${tenant.nameBangla}`;
          return {
            recipientName: std.guardianName || 'অভিভাবক',
            recipientMobile: phone,
            studentName: std.nameBangla || std.nameEnglish,
            rollNo: std.rollNo || 1,
            className: std.className || 'সাধারণ',
            date: today,
            messageText: msg,
          };
        })
        .filter(Boolean) as Array<Omit<SmsAlertRecord, 'id' | 'sentAt' | 'status' | 'tenantId'>>;

      const res = await api.sendBulkSmsAlerts(messagesToSend, tenant.id);
      if (res.success) {
        showToast(res.message || 'অনুপস্থিতি এসএমএস সফলভাবে প্রেরিত হয়েছে', 'success');
        setSmsCredits((prev) => Math.max(0, prev - messagesToSend.length));
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'এসএমএস পাঠাতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Send Due Fee Reminder SMS
  const handleSendDueReminders = async () => {
    if (selectedDueStudentIds.length === 0) {
      showToast('অনুগ্রহ করে শিক্ষার্থী নির্বাচন করুন', 'error');
      return;
    }

    setIsSending(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const messagesToSend = selectedDueStudentIds
        .map((id) => {
          const item = dueStudents.find((d) => d.student.id === id);
          if (!item) return null;
          const phone = item.student.guardianMobile || item.student.fatherMobile || '01711000000';
          const msg = `মুহতারাম অভিভাবক, ${item.student.nameBangla} এর ${item.feeRecord.monthYear || 'চলতি'} মাসের বকেয়া ফি ৳${
            item.dueAmount
          } দ্রুত পরিশোধের বিনীত অনুরোধ করা হলো। - ${tenant.nameBangla}`;
          return {
            recipientName: item.student.guardianName || 'অভিভাবক',
            recipientMobile: phone,
            studentName: item.student.nameBangla || item.student.nameEnglish,
            rollNo: item.student.rollNo || 1,
            className: item.student.className || 'সাধারণ',
            date: today,
            messageText: msg,
          };
        })
        .filter(Boolean) as Array<Omit<SmsAlertRecord, 'id' | 'sentAt' | 'status' | 'tenantId'>>;

      const res = await api.sendBulkSmsAlerts(messagesToSend, tenant.id);
      if (res.success) {
        showToast(res.message || 'বকেয়া ফি তাগাদা বার্তা পাঠানো হয়েছে', 'success');
        setSmsCredits((prev) => Math.max(0, prev - messagesToSend.length));
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'এসএমএস পাঠাতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Send Custom Broadcast SMS
  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      showToast('অনুগ্রহ করে বার্তার টেক্সট লিখুন', 'error');
      return;
    }

    setIsSending(true);
    try {
      let recipients: StudentEntity[] = [];
      if (broadcastTarget === 'ALL') {
        recipients = students;
      } else if (broadcastTarget === 'CLASS') {
        recipients = students.filter(
          (s) => s.classId === broadcastClassId || s.className === broadcastClassId
        );
      } else {
        recipients = students.slice(0, 10);
      }

      if (recipients.length === 0) {
        showToast('প্রাপক পাওয়া যায়নি', 'error');
        setIsSending(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const messagesToSend = recipients.map((s) => ({
        recipientName: s.guardianName || 'অভিভাবক',
        recipientMobile: s.guardianMobile || s.fatherMobile || '01700000000',
        studentName: s.nameBangla || s.nameEnglish,
        rollNo: s.rollNo || 1,
        className: s.className || 'সাধারণ',
        date: today,
        messageText: broadcastMessage,
      }));

      const res = await api.sendBulkSmsAlerts(messagesToSend, tenant.id);
      if (res.success) {
        showToast(res.message || 'নোটিশ এসএমএস সফলভাবে প্রচার করা হয়েছে', 'success');
        setSmsCredits((prev) => Math.max(0, prev - messagesToSend.length));
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'প্রচার বার্তা ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Pre-defined templates for Broadcast
  const templates = [
    {
      title: 'রমজান ও ঈদের ছুটি',
      text: `মুহতারাম অভিভাবক, পবিত্র মাহে রমজান ও ঈদুল ফিতর উপলক্ষে আগামী ২৫ মার্চ থেকে মাদ্রাসা বন্ধ থাকবে। বিস্তারিত নোটিশ বোর্ডে। - ${tenant.nameBangla}`,
    },
    {
      title: 'বার্ষিক ওয়াজ মাহফিলের দাওয়াত',
      text: `আসসালামু আলাইকুম। মাদ্রাসার বার্ষিক ওয়াজ মাহফিল ও দস্তারবন্দী আগামী শুক্রবার অনুষ্ঠিত হবে। আপনার উপস্থিতি ও দোয়া কাম্য। - ${tenant.nameBangla}`,
    },
    {
      title: 'জরুরি শীতকালীন সময়সূচি',
      text: `তীব্র শীতের কারণে আগামীকাল থেকে মাদ্রাসার ক্লাস সকাল ৯:০০ টা থেকে শুরু হবে। যথাসময়ে উপস্থিতির অনুরোধ। - ${tenant.nameBangla}`,
    },
    {
      title: 'সাময়িক পরীক্ষার ফলাফল প্রকাশ',
      text: `মুহতারাম অভিভাবক, ১ম সাময়িক পরীক্ষার ফলাফল প্রকাশিত হয়েছে। অফিস থেকে ফলাফল সনদপত্র সংগ্রহের অনুরোধ করা হলো। - ${tenant.nameBangla}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BellRing className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-[var(--color-text-main)]">
              এসএমএস ও অভিভাবক যোগাযোগ গেটওয়ে
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              মাস্কিং এসএমএস লাইভ
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            দৈনিক অনুপস্থিতি সতর্কতা, বকেয়া ফি তাগাদা বার্তা ও নোটিশ প্রচার ইঞ্জিন
          </p>
        </div>

        {/* SMS Credits Box */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
          <Smartphone className="w-5 h-5 text-[var(--color-primary)]" />
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
              অবশিষ্ট এসএমএস ক্রেডিট
            </div>
            <div className="text-base font-extrabold text-[var(--color-text-main)]">
              {smsCredits.toLocaleString('bn-BD')} টি বার্তা
            </div>
          </div>
          <button
            onClick={() => {
              setSmsCredits((p) => p + 1000);
              showToast('১,০০০ টি এসএমএস ক্রেডিট রিচার্জ করা হয়েছে।', 'success');
            }}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold hover:opacity-80 transition-all cursor-pointer"
          >
            + রিচার্জ
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('absentee')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'absentee'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          আজকের অনুপস্থিতি বার্তা ({absentStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('dues')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'dues'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <Receipt className="w-4 h-4 text-rose-500" />
          বকেয়া ফি তাগাদা ({dueStudents.length})
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'broadcast'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <Send className="w-4 h-4 text-blue-500" />
          কাস্টম নোটিশ ও প্রচার
        </button>

        <button
          onClick={() => setActiveTab('gateway')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer',
            activeTab === 'gateway'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary-light)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)]'
          )}
        >
          <Settings className="w-4 h-4 text-slate-500" />
          গেটওয়ে কনফিগ ও লগ
        </button>
      </div>

      {/* TAB 1: ABSENTEE SMS ALERTS */}
      {activeTab === 'absentee' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[var(--color-text-main)]">
                হাজিরার তারিখ:
              </label>
              <input
                type="date"
                value={selectedAbsentDate}
                onChange={(e) => setSelectedAbsentDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold"
              />
              <span className="text-xs text-[var(--color-text-muted)]">
                অনুপস্থিত শিক্ষার্থী: <strong className="text-[var(--color-text-main)]">{absentStudents.length}</strong> জন
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (selectedAbsentStudentIds.length === absentStudents.length) {
                    setSelectedAbsentStudentIds([]);
                  } else {
                    setSelectedAbsentStudentIds(absentStudents.map((s) => s.id));
                  }
                }}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
              >
                {selectedAbsentStudentIds.length === absentStudents.length
                  ? 'সব আনচেক করুন'
                  : 'সব সিলেক্ট করুন'}
              </button>

              <button
                onClick={handleSendAbsenteeSms}
                disabled={isSending || selectedAbsentStudentIds.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSending
                  ? 'পাঠানো হচ্ছে...'
                  : `নির্বাচিত ${selectedAbsentStudentIds.length} জন অভিভাবককে এসএমএস পাঠান`}
              </button>
            </div>
          </div>

          {/* Absent Students Table */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] font-bold text-[var(--color-text-muted)]">
                <tr>
                  <th className="py-3 px-4 text-center w-12">নির্বাচন</th>
                  <th className="py-3 px-4 text-center w-14">রোল</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">শ্রেণি</th>
                  <th className="py-3 px-4">অভিভাবক</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4">বার্তা প্রিভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {absentStudents.map((std) => {
                  const isChecked = selectedAbsentStudentIds.includes(std.id);
                  const phone = std.guardianMobile || std.fatherMobile || '01711-223344';
                  return (
                    <tr
                      key={std.id}
                      className={cn(
                        'hover:bg-[var(--color-surface-muted)] transition-colors',
                        isChecked && 'bg-amber-500/5'
                      )}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (isChecked) {
                              setSelectedAbsentStudentIds((p) => p.filter((id) => id !== std.id));
                            } else {
                              setSelectedAbsentStudentIds((p) => [...p, std.id]);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[var(--color-primary)]" />
                          ) : (
                            <Square className="w-4 h-4 text-[var(--color-text-muted)]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{std.rollNo || 1}</td>
                      <td className="py-3 px-4 font-bold text-[var(--color-text-main)]">
                        {std.nameBangla || std.nameEnglish}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-muted)]">{std.className}</td>
                      <td className="py-3 px-4">{std.guardianName || std.fatherName || 'অভিভাবক'}</td>
                      <td className="py-3 px-4 font-mono font-medium text-[var(--color-primary)]">
                        {phone}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[var(--color-text-muted)] truncate max-w-xs">
                        মুহতারাম অভিভাবক, আপনার সন্তান {std.nameBangla} আজ মাদ্রাসায় অনুপস্থিত...
                      </td>
                    </tr>
                  );
                })}

                {absentStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                      এই তারিখে কোনো অনুপস্থিত শিক্ষার্থী নেই। আলহামদুলিল্লাহ!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DUE FEE REMINDER SMS */}
      {activeTab === 'dues' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[var(--color-text-main)]">
                শ্রেণি নির্বাচন:
              </label>
              <select
                value={selectedFeeClassId}
                onChange={(e) => setSelectedFeeClassId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold"
              >
                <option value="ALL">সকল শ্রেণি</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.nameBangla}
                  </option>
                ))}
              </select>

              <span className="text-xs text-[var(--color-text-muted)]">
                মোট বকেয়াদার: <strong className="text-rose-600">{dueStudents.length}</strong> জন
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (selectedDueStudentIds.length === dueStudents.length) {
                    setSelectedDueStudentIds([]);
                  } else {
                    setSelectedDueStudentIds(dueStudents.map((d) => d.student.id));
                  }
                }}
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
              >
                {selectedDueStudentIds.length === dueStudents.length
                  ? 'সব আনচেক করুন'
                  : 'সব সিলেক্ট করুন'}
              </button>

              <button
                onClick={handleSendDueReminders}
                disabled={isSending || selectedDueStudentIds.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSending
                  ? 'পাঠানো হচ্ছে...'
                  : `নির্বাচিত ${selectedDueStudentIds.length} জন অভিভাবককে বকেয়া তাগাদা পাঠান`}
              </button>
            </div>
          </div>

          {/* Dues Table */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] font-bold text-[var(--color-text-muted)]">
                <tr>
                  <th className="py-3 px-4 text-center w-12">নির্বাচন</th>
                  <th className="py-3 px-4 text-center w-14">রোল</th>
                  <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-4">শ্রেণি</th>
                  <th className="py-3 px-4">ফি মাস / বিবরণ</th>
                  <th className="py-3 px-4 text-right">বকেয়া পরিমাণ</th>
                  <th className="py-3 px-4">অভিভাবকের মোবাইল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {dueStudents.map(({ student, feeRecord, dueAmount }) => {
                  const isChecked = selectedDueStudentIds.includes(student.id);
                  const phone = student.guardianMobile || student.fatherMobile || '01712-345678';
                  return (
                    <tr
                      key={student.id}
                      className={cn(
                        'hover:bg-[var(--color-surface-muted)] transition-colors',
                        isChecked && 'bg-rose-500/5'
                      )}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (isChecked) {
                              setSelectedDueStudentIds((p) => p.filter((id) => id !== student.id));
                            } else {
                              setSelectedDueStudentIds((p) => [...p, student.id]);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Square className="w-4 h-4 text-[var(--color-text-muted)]" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{student.rollNo || 1}</td>
                      <td className="py-3 px-4 font-bold text-[var(--color-text-main)]">
                        {student.nameBangla || student.nameEnglish}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-muted)]">{student.className}</td>
                      <td className="py-3 px-4 font-medium">{feeRecord.monthYear || 'চলতি মাস'}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                        ৳{dueAmount.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[var(--color-primary)]">
                        {phone}
                      </td>
                    </tr>
                  );
                })}

                {dueStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                      এই ক্যাটাগরিতে কোনো বকেয়া ফি নেই। মাশাআল্লাহ!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Message Composer */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--color-primary)]" />
              নোটিশ ও প্রচার বার্তা কম্পোজার
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                  প্রাপক গ্রুপ নির্বাচন
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e: any) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold"
                >
                  <option value="ALL">সকল শিক্ষার্থী ও অভিভাবক ({students.length} জন)</option>
                  <option value="CLASS">নির্দিষ্ট শ্রেণি / জামাত</option>
                  <option value="STAFF">সকল শিক্ষক ও স্টাফ</option>
                </select>
              </div>

              {broadcastTarget === 'CLASS' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    শ্রেণি নির্ধারণ করুন
                  </label>
                  <select
                    value={broadcastClassId}
                    onChange={(e) => setBroadcastClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameBangla}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[var(--color-text-main)]">
                  বার্তার টেক্সট (বাংলা ইউনিকোড):
                </label>
                <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                  {broadcastMessage.length} অক্ষর | {Math.ceil(broadcastMessage.length / 70) || 1} টি এসএমএস
                </span>
              </div>
              <textarea
                rows={5}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="এখানে আপনার নোটিশ বা ঘোষণা বার্তাটি বাংলায় লিখুন..."
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs leading-relaxed outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                মাস্কিং প্রেরক: <strong>{senderId}</strong>
              </span>

              <button
                onClick={handleSendBroadcast}
                disabled={isSending || !broadcastMessage.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'প্রচার হচ্ছে...' : 'এসএমএস প্রচার করুন'}
              </button>
            </div>
          </div>

          {/* Right: Quick Template Selector */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              রেডিমেড টেমপ্লেট লাইব্রেরি
            </h3>

            <div className="space-y-2">
              {templates.map((tpl, i) => (
                <div
                  key={i}
                  onClick={() => setBroadcastMessage(tpl.text)}
                  className="p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface-muted)] cursor-pointer transition-all text-xs"
                >
                  <div className="font-bold text-[var(--color-text-main)] mb-1">{tpl.title}</div>
                  <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2">
                    {tpl.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GATEWAY CONFIG & DELIVERY LOGS */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gateway Settings Form */}
            <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <Settings className="w-4 h-4 text-[var(--color-primary)]" />
                এসএমএস গেটওয়ে কনফিগারেশন
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[var(--color-text-main)] mb-1">
                    টেলিকম / গেটওয়ে প্রোভাইডার
                  </label>
                  <select
                    value={gatewayProvider}
                    onChange={(e: any) => setGatewayProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-medium"
                  >
                    <option value="GREENWEB">Greenweb BD (গ্রীনওয়েব)</option>
                    <option value="ELITBUZZ">Elitbuzz Technologies</option>
                    <option value="GP">Grameenphone Business</option>
                    <option value="BANGLALINK">Banglalink Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-main)] mb-1">
                    অনুমোদিত প্রেরক নাম (Masking Sender ID)
                  </label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-bold text-[var(--color-primary)] outline-none"
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    বিটিআরসি অনুমোদিত ১১ অক্ষরের আলফানিউমেরিক আইডি
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-[var(--color-text-main)] mb-1">
                    API Secret Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                  />
                </div>

                <button
                  onClick={() => showToast('গেটওয়ে সেটিংস সফলভাবে আপডেট করা হয়েছে।', 'success')}
                  className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:opacity-90 transition-all shadow-xs cursor-pointer"
                >
                  সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </div>

            {/* Delivery Status & Stats */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  সাম্প্রতিক প্রেরিত এসএমএস হিস্টোরি ও ডেলিভারি লগ
                </h3>
                <span className="text-xs text-[var(--color-text-muted)]">
                  মোট প্রেরিত: {smsLogs.length} টি
                </span>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-surface-muted)] border-b border-[var(--color-border)] font-bold text-[var(--color-text-muted)]">
                    <tr>
                      <th className="py-2.5 px-3">প্রাপক মোবাইল</th>
                      <th className="py-2.5 px-3">বার্তার বিষয়বস্তু</th>
                      <th className="py-2.5 px-3">প্রেরণের সময়</th>
                      <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {smsLogs.slice(0, 8).map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--color-surface-muted)]">
                        <td className="py-2 px-3 font-mono font-bold text-[var(--color-text-main)]">
                          {log.recipientMobile}
                        </td>
                        <td className="py-2 px-3 text-[var(--color-text-muted)] max-w-xs truncate">
                          {log.messageText}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[var(--color-text-muted)]">
                          {log.sentAt}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {log.status === 'DELIVERED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> ডেলিভার্ড
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> ব্যর্থ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {smsLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-xs text-[var(--color-text-muted)]">
                          এখনো কোনো বার্তা পাঠানো হয়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
