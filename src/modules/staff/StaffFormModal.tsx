import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, CreditCard, GraduationCap, Briefcase, Calendar, DollarSign, MapPin, Building, Shield } from 'lucide-react';
import { StaffEntity, DepartmentType, RoleType, StaffStatus } from '../../types';

interface StaffFormModalProps {
  initialStaff?: StaffEntity | null;
  onClose: () => void;
  onSubmit: (staffData: Omit<StaffEntity, 'id' | 'tenantId'>) => Promise<void>;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  initialStaff,
  onClose,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'salary' | 'address'>('basic');

  const [formData, setFormData] = useState({
    employeeId: '',
    nameBangla: '',
    nameEnglish: '',
    photoUrl: '',
    mobile: '',
    email: '',
    nid: '',
    qualification: '',
    designation: '',
    department: DepartmentType.KITAB,
    role: RoleType.TEACHER,
    joiningDate: new Date().toISOString().split('T')[0],
    baseSalary: 25000,
    allowances: {
      houseRent: 4000,
      medical: 1000,
      conveyance: 1000,
      foodOrMess: 1500,
      specialDuty: 1500,
      other: 0,
    },
    presentAddress: '',
    permanentAddress: '',
    status: 'ACTIVE' as StaffStatus,
    bloodGroup: 'B+',
    gender: 'MALE' as 'MALE' | 'FEMALE',
  });

  useEffect(() => {
    if (initialStaff) {
      setFormData({
        employeeId: initialStaff.employeeId || '',
        nameBangla: initialStaff.nameBangla || '',
        nameEnglish: initialStaff.nameEnglish || '',
        photoUrl: initialStaff.photoUrl || '',
        mobile: initialStaff.mobile || '',
        email: initialStaff.email || '',
        nid: initialStaff.nid || '',
        qualification: initialStaff.qualification || '',
        designation: initialStaff.designation || '',
        department: initialStaff.department || DepartmentType.KITAB,
        role: RoleType.TEACHER,
        joiningDate: initialStaff.joiningDate || new Date().toISOString().split('T')[0],
        baseSalary: initialStaff.baseSalary || 20000,
        allowances: initialStaff.allowances || {
          houseRent: 0,
          medical: 0,
          conveyance: 0,
          foodOrMess: 0,
          specialDuty: 0,
          other: 0,
        },
        presentAddress: initialStaff.presentAddress || '',
        permanentAddress: initialStaff.permanentAddress || '',
        status: (initialStaff.status as StaffStatus) || 'ACTIVE',
        bloodGroup: initialStaff.bloodGroup || 'B+',
        gender: (initialStaff as any).gender || 'MALE',
      });
    }
  }, [initialStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameBangla || !formData.mobile || !formData.designation) {
      alert('অনুগ্রহ করে নাম (বাংলা), মোবাইল নম্বর এবং পদবি প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const { role, ...payload } = formData;
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const totalAllowances =
    Number(formData.allowances.houseRent || 0) +
    Number(formData.allowances.medical || 0) +
    Number(formData.allowances.conveyance || 0) +
    Number(formData.allowances.foodOrMess || 0) +
    Number(formData.allowances.specialDuty || 0) +
    Number(formData.allowances.other || 0);

  const grossSalary = Number(formData.baseSalary || 0) + totalAllowances;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-hover)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                {initialStaff ? 'শিক্ষক / স্টাফ প্রোফাইল সম্পাদন' : 'নতুন শিক্ষক / স্টাফ অন্তর্ভুক্তি'}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {initialStaff ? `${initialStaff.nameBangla} (${initialStaff.employeeId})` : 'সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-[var(--color-border)] px-6 bg-[var(--color-surface)]">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'basic'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <User className="w-4 h-4" />
            পরিচিতি ও প্রাতিষ্ঠানিক তথ্য
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('salary')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'salary'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            বেতন ও ভাতাসমূহ
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('address')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === 'address'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-[var(--color-text-secondary)]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            ঠিকানা ও যোগাযোগ
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: BASIC INFO */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    শিক্ষক/স্টাফ নাম (বাংলায়) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameBangla}
                    onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                    placeholder="যেমন: মুফতি তারিক জামিল"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    নাম (ইংরেজিতে)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    placeholder="e.g. Mufti Tariq Jamil"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    এমপ্লয়ী আইডি (Employee ID)
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="স্বয়ংক্রিয় তৈরি হবে (e.g. EMP-05)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    পদবি / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="যেমন: নায়েবে মুহতামিম ও মুহাদ্দিস"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    বিভাগ / Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as DepartmentType })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value={DepartmentType.KITAB}>কিতাব বিভাগ (Kitab)</option>
                    <option value={DepartmentType.HIFZ}>হিফজুল কুরআন বিভাগ (Hifz)</option>
                    <option value={DepartmentType.NURANI}>নূরানী ও নাজেরা (Noorani)</option>
                    <option value={DepartmentType.IFTA}>দারুল ইফতা ও ফতোয়া (Fatwa)</option>
                    <option value={DepartmentType.GENERAL}>সাধারণ প্রশাসন (General)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    শিক্ষাগত যোগ্যতা ও সনদ
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="যেমন: দাওরায়ে হাদিস, ইফতা"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    যোগদানের তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    সিস্টেম রোল (Role)
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value={RoleType.TEACHER}>শিক্ষক (Teacher)</option>
                    <option value={RoleType.INSTITUTION_ADMIN}>প্রশাসক (Admin)</option>
                    <option value={RoleType.ACCOUNTANT}>হিসাবরক্ষক (Accountant)</option>
                    <option value={RoleType.MUHTAMIM}>মুহতামিম (Principal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    স্ট্যাটাস (Status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffStatus })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="ACTIVE">সক্রিয় (Active)</option>
                    <option value="ON_LEAVE">ছুটিতে (On Leave)</option>
                    <option value="SUSPENDED">সাময়িক স্থগিত (Suspended)</option>
                    <option value="RESIGNED">অব্যাহতি / ইস্তফা (Resigned)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    ছবি URL (Photo URL)
                  </label>
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SALARY & ALLOWANCES */}
          {activeSection === 'salary' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                    সর্বমোট বেতন (Gross Salary)
                  </span>
                  <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    ৳{grossSalary.toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="text-right text-xs text-emerald-700 dark:text-emerald-300">
                  <span>মূল বেতন: ৳{(formData.baseSalary || 0).toLocaleString('bn-BD')}</span>
                  <br />
                  <span>ভাতাসমূহ: ৳{totalAllowances.toLocaleString('bn-BD')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  মূল বেতন (Basic Salary) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-base font-bold rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="border-t border-[var(--color-border)] pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
                  ভাতা কাঠামো (Monthly Allowances)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">বাড়ি ভাড়া ভাতা</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances.houseRent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: { ...formData.allowances, houseRent: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">চিকিৎসা ভাতা</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances.medical}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: { ...formData.allowances, medical: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">যাতায়াত ভাতা</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances.conveyance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: { ...formData.allowances, conveyance: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">খাবার / মেস ভাতা</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances.foodOrMess}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: { ...formData.allowances, foodOrMess: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">বিশেষ দায়িত্ব ভাতা</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances.specialDuty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: { ...formData.allowances, specialDuty: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] mb-1">অন্যান্য ভাতা</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.allowances.other}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowances: { ...formData.allowances, other: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ADDRESS & CONTACT */}
          {activeSection === 'address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="01819-XXXXXX"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    ইমেইল ঠিকানা
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ustad@example.com"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  জাতীয় পরিচয়পত্র নম্বর (NID)
                </label>
                <input
                  type="text"
                  value={formData.nid}
                  onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                  placeholder="১৯৮৮২৬৯২৫..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  বর্তমান ঠিকানা
                </label>
                <textarea
                  rows={2}
                  value={formData.presentAddress}
                  onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
                  placeholder="মাদ্রাসা কোয়ার্টার / বাড়ি নং, রোড, থানা, জেলা"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                  স্থায়ী ঠিকানা
                </label>
                <textarea
                  rows={2}
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : initialStaff ? 'আপডেট সংরক্ষণ করুন' : 'নতুন স্টাফ যুক্ত করুন'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
