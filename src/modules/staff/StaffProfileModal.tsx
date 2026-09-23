import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  CreditCard,
  GraduationCap,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { StaffEntity, TeacherSubjectAssignment, TeacherClassAssignment, StaffActivityHistoryEntity } from '../../types';

interface StaffProfileModalProps {
  staff: StaffEntity;
  subjectAssignments?: TeacherSubjectAssignment[];
  classAssignments?: TeacherClassAssignment[];
  activities?: StaffActivityHistoryEntity[];
  onClose: () => void;
  onEdit?: (staff: StaffEntity) => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  staff,
  subjectAssignments = [],
  classAssignments = [],
  activities = [],
  onClose,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'salary' | 'assignments' | 'history'>('info');

  const staffSubjects = subjectAssignments.filter((s) => s.teacherId === staff.id);
  const staffClasses = classAssignments.filter((c) => c.teacherId === staff.id);
  const staffActivities = activities.filter((a) => a.staffId === staff.id);

  const allowances = staff.allowances || {
    houseRent: 0,
    medical: 0,
    conveyance: 0,
    foodOrMess: 0,
    specialDuty: 0,
    other: 0,
  };

  const totalAllowances =
    (allowances.houseRent || 0) +
    (allowances.medical || 0) +
    (allowances.conveyance || 0) +
    (allowances.foodOrMess || 0) +
    (allowances.specialDuty || 0) +
    (allowances.other || 0);

  const grossSalary = (staff.baseSalary || 0) + totalAllowances;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              {staff.photoUrl ? (
                <img
                  src={staff.photoUrl}
                  alt={staff.nameBangla}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center border-4 border-white/20 text-white text-3xl font-bold shadow-lg">
                  {staff.nameBangla.charAt(0)}
                </div>
              )}
              <span
                className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 text-xs font-semibold rounded-full border border-white/30 ${
                  staff.status === 'ACTIVE'
                    ? 'bg-emerald-500 text-white'
                    : staff.status === 'ON_LEAVE'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {staff.status === 'ACTIVE' ? 'সক্রিয়' : staff.status === 'ON_LEAVE' ? 'ছুটিতে' : 'স্থগিত/অব্যাহতি'}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold">{staff.nameBangla}</h2>
                <span className="text-xs bg-emerald-700/80 px-2.5 py-0.5 rounded-full font-mono">
                  {staff.employeeId}
                </span>
              </div>
              <p className="text-emerald-100 text-sm mt-0.5">{staff.nameEnglish}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-emerald-100/90">
                <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3.5 h-3.5" />
                  {staff.designation}
                </span>
                <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg">
                  <BookOpen className="w-3.5 h-3.5" />
                  {staff.department} বিভাগ
                </span>
                <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  যোগদান: {staff.joiningDate}
                </span>
              </div>
            </div>

            {onEdit && (
              <button
                onClick={() => onEdit(staff)}
                className="mt-3 sm:mt-0 px-4 py-2 bg-white text-emerald-900 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors shadow"
              >
                প্রোফাইল সম্পাদন
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] px-6 overflow-x-auto">
          {[
            { id: 'info', label: 'মূল তথ্য ও পরিচিতি', icon: User },
            { id: 'salary', label: 'বেতন ও ভাতাসমূহ', icon: DollarSign },
            { id: 'assignments', label: 'শ্রেণি ও বিষয় দায়িত্ব', icon: BookOpen },
            { id: 'history', label: 'কার্যক্রম ও ইতিহাস', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 font-semibold bg-[var(--color-surface)]'
                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  যোগাযোগ ও ব্যক্তিগত বিবরণ
                </h3>
                <div className="bg-[var(--color-surface-hover)] p-4 rounded-xl space-y-3 border border-[var(--color-border)]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      মোবাইল নম্বর
                    </span>
                    <span className="font-medium font-mono">{staff.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      ইমেইল
                    </span>
                    <span className="font-medium">{staff.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      জাতীয় পরিচয়পত্র (NID)
                    </span>
                    <span className="font-mono font-medium">{staff.nid || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      রক্তের গ্রুপ
                    </span>
                    <span className="font-medium text-rose-600 font-semibold">{staff.bloodGroup || 'N/A'}</span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  ঠিকানা
                </h3>
                <div className="bg-[var(--color-surface-hover)] p-4 rounded-xl space-y-3 border border-[var(--color-border)]">
                  <div className="text-sm">
                    <span className="text-[var(--color-text-secondary)] block text-xs mb-1">বর্তমান ঠিকানা:</span>
                    <span className="font-medium">{staff.presentAddress || 'N/A'}</span>
                  </div>
                  {staff.permanentAddress && (
                    <div className="text-sm border-t border-[var(--color-border)] pt-2">
                      <span className="text-[var(--color-text-secondary)] block text-xs mb-1">স্থায়ী ঠিকানা:</span>
                      <span className="font-medium">{staff.permanentAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  শিক্ষাগত যোগ্যতা ও প্রাতিষ্ঠানিক তথ্য
                </h3>
                <div className="bg-[var(--color-surface-hover)] p-4 rounded-xl space-y-3 border border-[var(--color-border)]">
                  <div className="text-sm">
                    <span className="text-[var(--color-text-secondary)] block text-xs mb-1">শিক্ষাগত সনদ ও যোগ্যতা:</span>
                    <span className="font-medium flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <GraduationCap className="w-4 h-4" />
                      {staff.qualification}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-[var(--color-border)] pt-2">
                    <span className="text-[var(--color-text-secondary)]">পদবি / ডেজিগনেশন</span>
                    <span className="font-semibold">{staff.designation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">বিভাগ</span>
                    <span className="font-medium">{staff.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">যোগদানের তারিখ</span>
                    <span className="font-medium">{staff.joiningDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">বর্তমান অবস্থা</span>
                    <span className="font-medium text-emerald-600 font-semibold">{staff.status}</span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  সিস্টেম ইউজার অ্যাকাউন্ট
                </h3>
                <div className="bg-[var(--color-surface-hover)] p-4 rounded-xl space-y-2 border border-[var(--color-border)] text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">ডেজিগনেশন ও পদ</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800 font-semibold">
                      {staff.designation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">স্টাফ আইডি</span>
                    <span className="font-mono text-xs text-[var(--color-text-secondary)]">{staff.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SALARY & ALLOWANCES */}
          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">মূল বেতন (Base Salary)</span>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                    ৳{(staff.baseSalary || 0).toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-4 rounded-2xl">
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">মোট ভাতাসমূহ (Total Allowances)</span>
                  <p className="text-2xl font-bold text-teal-900 dark:text-teal-100 mt-1">
                    ৳{totalAllowances.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow">
                  <span className="text-xs font-semibold text-slate-300">সর্বমোট প্রদেয় (Gross Salary)</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    ৳{grossSalary.toLocaleString('bn-BD')}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-main)] mb-3">
                  ভাতা উপ-বিভাগ বিস্তারিত (Allowance Breakdown)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl">
                    <span className="text-xs text-[var(--color-text-secondary)] block">বাড়ি ভাড়া ভাতা</span>
                    <span className="font-bold text-sm">৳{(allowances.houseRent || 0).toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl">
                    <span className="text-xs text-[var(--color-text-secondary)] block">চিকিৎসা ভাতা</span>
                    <span className="font-bold text-sm">৳{(allowances.medical || 0).toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl">
                    <span className="text-xs text-[var(--color-text-secondary)] block">যাতায়াত ভাতা</span>
                    <span className="font-bold text-sm">৳{(allowances.conveyance || 0).toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl">
                    <span className="text-xs text-[var(--color-text-secondary)] block">খাবার / মেস ভাতা</span>
                    <span className="font-bold text-sm">৳{(allowances.foodOrMess || 0).toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl">
                    <span className="text-xs text-[var(--color-text-secondary)] block">বিশেষ দায়িত্ব ভাতা</span>
                    <span className="font-bold text-sm">৳{(allowances.specialDuty || 0).toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="p-3 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl">
                    <span className="text-xs text-[var(--color-text-secondary)] block">অন্যান্য ভাতা</span>
                    <span className="font-bold text-sm">৳{(allowances.other || 0).toLocaleString('bn-BD')}</span>
                  </div>
                </div>
              </div>

              {staff.totalAdvanceBalance !== undefined && staff.totalAdvanceBalance > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                      <span className="font-semibold text-amber-900 dark:text-amber-100 text-sm block">
                        বর্তমান সক্রিয় বেতন অগ্রিম স্থিতি
                      </span>
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        মাসিক বেতন বিল হতে নিয়মিত কিস্তিতে কর্তন হচ্ছে
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-amber-900 dark:text-amber-100">
                    ৳{staff.totalAdvanceBalance.toLocaleString('bn-BD')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-main)] mb-3 flex items-center justify-between">
                  <span>অর্পিত বিষয় ও ঘণ্টা সংখ্যা ({staffSubjects.length})</span>
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded">
                    মোট পিরিয়ড: {staffSubjects.reduce((sum, s) => sum + s.weeklyPeriodsCount, 0)}/সপ্তাহ
                  </span>
                </h4>
                {staffSubjects.length === 0 ? (
                  <div className="p-6 text-center bg-[var(--color-surface-hover)] rounded-xl text-[var(--color-text-secondary)] text-sm">
                    কোন বিষয় অর্পণ করা হয়নি।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {staffSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl flex items-start justify-between"
                      >
                        <div>
                          <span className="text-xs text-emerald-600 font-semibold block">{sub.className} ({sub.sectionName})</span>
                          <span className="font-bold text-sm text-[var(--color-text-main)]">{sub.subjectName}</span>
                          <span className="text-xs text-[var(--color-text-secondary)] block mt-1">
                            সেশন: {sub.academicSessionName}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg whitespace-nowrap">
                          {sub.weeklyPeriodsCount} ঘণ্টা/সপ্তাহ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-[var(--color-text-main)] mb-3">
                  শ্রেণি শিক্ষক / ইনচার্জ দায়িত্ব ({staffClasses.length})
                </h4>
                {staffClasses.length === 0 ? (
                  <div className="p-6 text-center bg-[var(--color-surface-hover)] rounded-xl text-[var(--color-text-secondary)] text-sm">
                    কোন শ্রেণি ইনচার্জ দায়িত্ব অর্পিত হয়নি।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {staffClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-sm text-[var(--color-text-main)]">{cls.className}</span>
                          <span className="text-xs text-[var(--color-text-secondary)] block">{cls.sectionName}</span>
                        </div>
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-lg">
                          {cls.role === 'CLASS_TEACHER' ? 'শ্রেণি শিক্ষক' : 'বিভাগীয় প্রধান'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CAREER & ACTIVITIES */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[var(--color-text-main)]">
                ক্যারিয়ার ও প্রাতিষ্ঠানিক কার্যক্রম টাইমলাইন ({staffActivities.length})
              </h4>
              {staffActivities.length === 0 ? (
                <div className="p-6 text-center bg-[var(--color-surface-hover)] rounded-xl text-[var(--color-text-secondary)] text-sm">
                  কোন কার্যক্রমের ইতিহাস লিপিবদ্ধ নেই।
                </div>
              ) : (
                <div className="relative border-l-2 border-emerald-500/30 ml-3 pl-5 space-y-6">
                  {staffActivities.map((act) => (
                    <div key={act.id} className="relative group">
                      <div className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-[var(--color-surface)] shadow" />
                      <div className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] p-4 rounded-xl">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <span className="font-bold text-sm text-[var(--color-text-main)]">{act.title}</span>
                          <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {act.date}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {act.description}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)]">
                          <span>সম্পাদনকারী: {act.performedBy}</span>
                          {act.referenceNo && <span>রেফারেন্স: {act.referenceNo}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--color-surface-hover)] border-t border-[var(--color-border)] flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-secondary)]">
            আইডি: <code className="font-mono">{staff.id}</code> | টেন্যান্ট: <code className="font-mono">{staff.tenantId}</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm font-semibold hover:bg-[var(--color-border)] transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
