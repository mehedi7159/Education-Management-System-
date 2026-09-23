import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Briefcase,
  Layers,
  BarChart3,
  Smartphone,
  Fingerprint,
  CheckCircle2,
  Clock,
  History,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import {
  StudentEntity,
  StaffEntity,
  ClassEntity,
  SectionEntity,
  ShiftEntity,
  AttendanceEntity,
  AttendanceLockConfig,
  BiometricDeviceEntity,
  BiometricPunchLog,
  SmsAlertRecord,
  AttendanceStatus,
} from '../../types';
import { StudentDailyMarking } from './components/StudentDailyMarking';
import { StaffDailyMarking } from './components/StaffDailyMarking';
import { MonthlyRegisterMatrix } from './components/MonthlyRegisterMatrix';
import { StudentAttendanceHistory } from './components/StudentAttendanceHistory';
import { AbsenteeSmsHub } from './components/AbsenteeSmsHub';
import { AttendanceReportsAnalytics } from './components/AttendanceReportsAnalytics';
import { BiometricIntegrationHub } from './components/BiometricIntegrationHub';
import { AuthorizedCorrectionModal } from './components/AuthorizedCorrectionModal';

export const AttendanceDashboard: React.FC = () => {
  const { tenant } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'STUDENT_DAILY'
    | 'STAFF_DAILY'
    | 'MONTHLY_MATRIX'
    | 'STUDENT_HISTORY'
    | 'ABSENTEE_SMS'
    | 'REPORTS'
    | 'BIOMETRIC'
  >('STUDENT_DAILY');

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Core Data States
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<SectionEntity[]>([]);
  const [shifts, setShifts] = useState<ShiftEntity[]>([]);
  const [attendances, setAttendances] = useState<AttendanceEntity[]>([]);
  const [lockConfig, setLockConfig] = useState<AttendanceLockConfig | null>(null);
  const [biometricDevices, setBiometricDevices] = useState<BiometricDeviceEntity[]>([]);
  const [biometricLogs, setBiometricLogs] = useState<BiometricPunchLog[]>([]);
  const [smsAlerts, setSmsAlerts] = useState<SmsAlertRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Authorized Correction Modal State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [preselectedCorrectionRecord, setPreselectedCorrectionRecord] = useState<AttendanceEntity | null>(null);

  // Load Data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [
        studentsRes,
        staffRes,
        classesRes,
        sectionsRes,
        shiftsRes,
        attendancesRes,
        lockConfigRes,
        devicesRes,
        logsRes,
      ] = await Promise.all([
        api.getStudents(),
        api.getStaff(),
        api.getClasses(),
        api.getSections(),
        api.getShifts(),
        api.getAttendance(),
        api.getAttendanceLockConfig(),
        api.getBiometricDevices(),
        api.getBiometricLogs(50),
      ]);

      if (studentsRes.success && studentsRes.data) setStudents(studentsRes.data);
      if (staffRes.success && staffRes.data) setStaffList(staffRes.data);
      if (classesRes.success && classesRes.data) setClasses(classesRes.data);
      if (sectionsRes.success && sectionsRes.data) setSections(sectionsRes.data);
      if (shiftsRes.success && shiftsRes.data) setShifts(shiftsRes.data);
      if (attendancesRes.success && attendancesRes.data) setAttendances(attendancesRes.data);
      if (lockConfigRes.success && lockConfigRes.data) setLockConfig(lockConfigRes.data);
      if (devicesRes.success && devicesRes.data) setBiometricDevices(devicesRes.data);
      if (logsRes.success && logsRes.data) setBiometricLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load attendance dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [tenant?.id]);

  // Batch Attendance Save Handler
  const handleSaveAttendanceBatch = async (records: Array<any>) => {
    await api.saveAttendanceBatch(records);
    const updated = await api.getAttendance();
    if (updated.success && updated.data) {
      setAttendances(updated.data);
    }
  };

  // Authorized Correction Handler
  const handleRecordCorrection = async (params: {
    studentId?: string;
    staffId?: string;
    attendanceId?: string;
    date: string;
    newStatus: AttendanceStatus;
    reason: string;
    remarks?: string;
  }) => {
    await api.recordIndividualCorrection({
      attendanceId: params.attendanceId,
      studentId: params.studentId,
      staffId: params.staffId,
      date: params.date,
      newStatus: params.newStatus,
      reason: params.reason,
      remarks: params.remarks,
    });
    const updated = await api.getAttendance();
    if (updated.success && updated.data) {
      setAttendances(updated.data);
    }
  };

  // SMS Dispatch Handler
  const handleSendAbsenteeSms = async (studentIds: string[], template: string) => {
    const res = await api.sendAbsentGuardianSms(studentIds, selectedDate, template);
    if (res.success && res.data) {
      setSmsAlerts((prev) => [...res.data, ...prev]);
    }
  };

  // Biometric Sync Handler
  const handleSyncBiometric = async (deviceId?: string) => {
    const res = await api.syncBiometricLogs(deviceId);
    const [devicesRes, logsRes, updatedAtts] = await Promise.all([
      api.getBiometricDevices(),
      api.getBiometricLogs(50),
      api.getAttendance(),
    ]);
    if (devicesRes.success && devicesRes.data) setBiometricDevices(devicesRes.data);
    if (logsRes.success && logsRes.data) setBiometricLogs(logsRes.data);
    if (updatedAtts.success && updatedAtts.data) setAttendances(updatedAtts.data);
    return res.data;
  };

  // Trigger Mock Punch
  const handleTriggerPunch = async (params: {
    userType: 'STUDENT' | 'STAFF';
    idCardOrEmpId: string;
    verifyMode: 'FINGERPRINT' | 'FACE' | 'RFID_CARD';
    deviceId?: string;
  }) => {
    const res = await api.triggerMockBiometricPunch(params);
    const [devicesRes, logsRes, updatedAtts] = await Promise.all([
      api.getBiometricDevices(),
      api.getBiometricLogs(50),
      api.getAttendance(),
    ]);
    if (devicesRes.success && devicesRes.data) setBiometricDevices(devicesRes.data);
    if (logsRes.success && logsRes.data) setBiometricLogs(logsRes.data);
    if (updatedAtts.success && updatedAtts.data) setAttendances(updatedAtts.data);
    return res.data;
  };

  const openCorrection = (record?: AttendanceEntity) => {
    setPreselectedCorrectionRecord(record || null);
    setIsCorrectionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">হাজিরা ব্যবস্থাপনা মডিউল লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-2xl shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  হাজিরা ও উপস্থিতি ব্যবস্থাপনা
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  PHASE 08 ACTIVE
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                শিক্ষার্থী ও উস্তাদদের দৈনিক হাজিরা, বায়োমেট্রিক ডিভাইস সংযোগ, লক ও এসএমএস সমন্বয়।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openCorrection()}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-xl transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>অনুমোদিত সংশোধন</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 no-scrollbar">
          {[
            { id: 'STUDENT_DAILY', label: 'শিক্ষার্থী হাজিরা', icon: Users },
            { id: 'STAFF_DAILY', label: 'উস্তাদ ও স্টাফ হাজিরা', icon: Briefcase },
            { id: 'MONTHLY_MATRIX', label: 'মাসিক রেজিস্টার খাতা', icon: Layers },
            { id: 'STUDENT_HISTORY', label: 'শিক্ষার্থী হিস্ট্রি', icon: History },
            { id: 'ABSENTEE_SMS', label: 'অনুপস্থিতি SMS ইঞ্জিন', icon: Smartphone },
            { id: 'REPORTS', label: 'অ্যানালিটিক্স ও রিপোর্ট', icon: BarChart3 },
            { id: 'BIOMETRIC', label: 'বায়োমেট্রিক ও ডিভাইস হাব', icon: Fingerprint },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab View Rendering */}
      {activeTab === 'STUDENT_DAILY' && (
        <StudentDailyMarking
          students={students}
          classes={classes}
          sections={sections}
          shifts={shifts}
          attendances={attendances}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onSaveBatch={handleSaveAttendanceBatch}
          onOpenCorrectionModal={openCorrection}
          lockConfig={lockConfig}
          isAdmin={true}
        />
      )}

      {activeTab === 'STAFF_DAILY' && (
        <StaffDailyMarking
          staffList={staffList}
          attendances={attendances}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onSaveBatch={handleSaveAttendanceBatch}
          onOpenCorrectionModal={openCorrection}
          lockConfig={lockConfig}
          isAdmin={true}
        />
      )}

      {activeTab === 'MONTHLY_MATRIX' && (
        <MonthlyRegisterMatrix
          students={students}
          staffList={staffList}
          classes={classes}
          sections={sections}
          attendances={attendances}
        />
      )}

      {activeTab === 'STUDENT_HISTORY' && (
        <StudentAttendanceHistory
          students={students}
          classes={classes}
          sections={sections}
          attendances={attendances}
          onOpenCorrectionModal={openCorrection}
        />
      )}

      {activeTab === 'ABSENTEE_SMS' && (
        <AbsenteeSmsHub
          students={students}
          classes={classes}
          attendances={attendances}
          selectedDate={selectedDate}
          onSendSms={handleSendAbsenteeSms}
          smsAlerts={smsAlerts}
        />
      )}

      {activeTab === 'REPORTS' && (
        <AttendanceReportsAnalytics
          students={students}
          staffList={staffList}
          classes={classes}
          sections={sections}
          attendances={attendances}
          selectedDate={selectedDate}
        />
      )}

      {activeTab === 'BIOMETRIC' && (
        <BiometricIntegrationHub
          devices={biometricDevices}
          logs={biometricLogs}
          students={students}
          staffList={staffList}
          onSyncLogs={handleSyncBiometric}
          onTriggerPunch={handleTriggerPunch}
        />
      )}

      {/* Authorized Correction Modal */}
      <AuthorizedCorrectionModal
        isOpen={isCorrectionModalOpen}
        onClose={() => {
          setIsCorrectionModalOpen(false);
          setPreselectedCorrectionRecord(null);
        }}
        onSubmit={handleRecordCorrection}
        students={students}
        staffList={staffList}
        attendances={attendances}
        selectedDate={selectedDate}
        preselectedRecord={preselectedCorrectionRecord}
      />
    </div>
  );
};
