import React, { useState } from 'react';
import {
  Fingerprint,
  RefreshCw,
  CheckCircle2,
  Wifi,
  WifiOff,
  Server,
  Zap,
  Clock,
} from 'lucide-react';
import { BiometricDeviceEntity, BiometricPunchLog, StudentEntity, StaffEntity } from '../../../types';

interface BiometricIntegrationHubProps {
  devices: BiometricDeviceEntity[];
  logs: BiometricPunchLog[];
  students: StudentEntity[];
  staffList: StaffEntity[];
  onSyncLogs: (deviceId?: string) => Promise<any>;
  onTriggerPunch: (params: {
    userType: 'STUDENT' | 'STAFF';
    idCardOrEmpId: string;
    verifyMode: 'FINGERPRINT' | 'FACE' | 'RFID_CARD';
    deviceId?: string;
  }) => Promise<any>;
}

export const BiometricIntegrationHub: React.FC<BiometricIntegrationHubProps> = ({
  devices,
  logs,
  students,
  staffList,
  onSyncLogs,
  onTriggerPunch,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Punch Simulator state
  const [simPersonType, setSimPersonType] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const [simPersonId, setSimPersonId] = useState<string>(students[0]?.id || '');
  const [simDeviceId, setSimDeviceId] = useState<string>(devices[0]?.id || 'bdev-01');
  const [simVerifyMode, setSimVerifyMode] = useState<'FINGERPRINT' | 'FACE' | 'RFID_CARD'>(
    'FINGERPRINT'
  );
  const [isPunching, setIsPunching] = useState(false);

  const handleSync = async (deviceId?: string) => {
    try {
      setIsSyncing(true);
      const res = await onSyncLogs(deviceId);
      setSyncFeedback(
        `সফল! বায়োমেট্রিক ডিভাইস থেকে ${res?.syncedCount || 0} টি নতুন পাঞ্চ রেকর্ড সিঙ্ক হয়েছে এবং হাজিরা খাতায় আপডেট করা হয়েছে।`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsPunching(true);
      const selectedStudent = students.find((s) => s.id === simPersonId);
      const selectedStaff = staffList.find((s) => s.id === simPersonId);
      const cardOrEmpId =
        simPersonType === 'STUDENT'
          ? selectedStudent?.studentIdCardNo || simPersonId
          : selectedStaff?.employeeId || simPersonId;

      await onTriggerPunch({
        userType: simPersonType,
        idCardOrEmpId: cardOrEmpId,
        deviceId: simDeviceId,
        verifyMode: simVerifyMode,
      });
      setSyncFeedback(
        `সফল পাঞ্চ ট্রানজিট! ${simPersonType === 'STUDENT' ? 'শিক্ষার্থীর' : 'উস্তাদের'} পাঞ্চ সফলভাবে গৃহীত ও স্বয়ংক্রিয় হাজিরা লিপিবদ্ধ হয়েছে।`
      );
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setIsPunching(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">{syncFeedback}</span>
        </div>
      )}

      {/* Header & Sync Master Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-2xl">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>বায়োমেট্রিক ও ডিজিটাল ডিভাইস হাব (ZKTeco / Realtime Integration)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                সক্রিয় (ONLINE)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ফিঙ্গারপ্রিন্ট, ফেস রিকগনিশন ও RFID কার্ড রিডারের সাথে রিয়েল-টাইম ডাটা সিঙ্ক্রোনাইজেশন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSync()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'সিঙ্ক করা হচ্ছে...' : 'সকল ডিভাইস সিঙ্ক করুন'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Connected Devices & Punch Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Connected Devices Bento */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-600" />
              <span>সংযুক্ত বায়োমেট্রিক মেশিন তালিকা ({devices.length} টি মেশিন)</span>
            </div>
            <span className="text-xs text-slate-400">TCP/IP Port: 4370</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {devices.map((dev) => (
              <div
                key={dev.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {dev.deviceName}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      মডেল: {dev.deviceModel} • অবস্থান: {dev.location}
                    </p>
                  </div>
                  {dev.status === 'ONLINE' ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Wifi className="w-3 h-3" /> অনলাইন
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      <WifiOff className="w-3 h-3" /> অফলাইন
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <span>IP: {dev.ipAddress}:{dev.port}</span>
                  <span>আজকের পাঞ্চ: {dev.totalPunchesToday || 0}</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">শেষ সিঙ্ক: {dev.lastSyncTime ? dev.lastSyncTime : 'অদ্যাবধি হয়নি'}</span>
                  <button
                    onClick={() => handleSync(dev.id)}
                    disabled={isSyncing}
                    className="text-xs font-bold text-cyan-600 hover:text-cyan-700"
                  >
                    সিঙ্ক
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Biometric Punch Simulator */}
        <div className="bg-gradient-to-br from-cyan-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 shadow-xl space-y-4 border border-cyan-800/40">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm pb-2 border-b border-cyan-800/40">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>পাঞ্চ টেস্ট সিমুলেটর (Live Punch Test)</span>
          </div>
          <p className="text-xs text-slate-300">
            মেশিনের বাস্তব সংযোগ ব্যতিরেকে সরাসরি আঙুলের ছাপ বা কার্ড পাঞ্চ পরীক্ষা করে হাজিরা রেকর্ড পরীক্ষা করুন।
          </p>

          <form onSubmit={handleTestPunch} className="space-y-3">
            {/* Person Type */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSimPersonType('STUDENT');
                  setSimPersonId(students[0]?.id || '');
                }}
                className={`py-1.5 rounded-lg font-bold transition ${
                  simPersonType === 'STUDENT'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                শিক্ষার্থী
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimPersonType('STAFF');
                  setSimPersonId(staffList[0]?.id || '');
                }}
                className={`py-1.5 rounded-lg font-bold transition ${
                  simPersonType === 'STAFF'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                উস্তাদ / স্টাফ
              </button>
            </div>

            {/* Select Person */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                ব্যক্তি নির্বাচন
              </label>
              <select
                value={simPersonId}
                onChange={(e) => setSimPersonId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              >
                {simPersonType === 'STUDENT'
                  ? students.map((st) => (
                      <option key={st.id} value={st.id}>
                        [রোল {st.rollNo}] {st.nameBangla}
                      </option>
                    ))
                  : staffList.map((stf) => (
                      <option key={stf.id} value={stf.id}>
                        {stf.nameBangla} ({stf.designation})
                      </option>
                    ))}
              </select>
            </div>

            {/* Verification Method */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                যাচাই পদ্ধতি (Verification Mode)
              </label>
              <select
                value={simVerifyMode}
                onChange={(e) => setSimVerifyMode(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              >
                <option value="FINGERPRINT">আঙুলের ছাপ (Fingerprint)</option>
                <option value="FACE">ফেস রিকগনিশন (Face Scan)</option>
                <option value="RFID_CARD">স্মার্ট আইডি কার্ড (RFID Card)</option>
              </select>
            </div>

            {/* Submit Punch */}
            <button
              type="submit"
              disabled={isPunching}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition mt-2 disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{isPunching ? 'পাঞ্চ হচ্ছে...' : 'এখনই ফিঙ্গার পাঞ্চ করুন'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Raw Biometric Punch Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-600" />
          <span>ডিভাইস থেকে সংগৃহীত রিয়েল-টাইম পাঞ্চ লগ (Biometric Punch Stream)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">পাঞ্চ টাইমস্ট্যাম্প</th>
                <th className="px-4 py-3">ডিভাইস আইডি ও নাম</th>
                <th className="px-4 py-3">ব্যবহারকারী ও কার্ড আইডি</th>
                <th className="px-4 py-3">যাচাই পদ্ধতি</th>
                <th className="px-4 py-3 text-center">সিঙ্ক স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    কোনো পাঞ্চ লগ এখনো জমা হয়নি। পাঞ্চ টেস্ট করে দেখতে পারেন।
                  </td>
                </tr>
              ) : (
                logs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 font-mono text-slate-900 dark:text-slate-100">
                      {log.punchTime}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">
                      {log.deviceName || log.deviceId}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-cyan-700 dark:text-cyan-400">
                      {log.userName} ({log.userCardOrEmpId})
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.verifyMode}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.syncedToAttendance
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {log.syncedToAttendance ? 'সিঙ্কড' : 'অপেক্ষমান'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
