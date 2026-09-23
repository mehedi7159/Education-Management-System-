import React, { useState, useEffect } from 'react';
import {
  Building2,
  School,
  Clock,
  Layers,
  BookOpen,
  Award,
  Wallet,
  CreditCard,
  Save,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  RotateCcw,
  Check,
  ShieldAlert,
} from 'lucide-react';
import {
  Tenant,
  MadrasahType,
  DepartmentType,
  PaymentMethod,
  InstitutionFullConfig,
  ClassEntity,
  SectionEntity,
  ShiftEntity,
  DepartmentConfig,
  SubjectEntity,
  FeeTypeEntity,
  FundEntity,
  PaymentMethodConfig,
  GradingSystemConfig,
} from '../../types';
import { InstitutionService, INSTITUTION_TEMPLATES } from '../../services/institutionService';
import { useAuth } from '../../context/AuthContext';
import { InstitutionSetupWizard } from './InstitutionSetupWizard';

type SettingsTab = 'profile' | 'academic' | 'classes' | 'subjects' | 'grading' | 'finance';

export const InstitutionSettingsView: React.FC = () => {
  const { tenant, updateTenant, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Full configuration state for active tenant
  const [config, setConfig] = useState<InstitutionFullConfig | null>(null);

  // Editable profile state
  const [profileForm, setProfileForm] = useState({
    nameBangla: '',
    nameEnglish: '',
    nameArabic: '',
    madrasahType: MadrasahType.QAWMI,
    eiinCode: '',
    boardCode: '',
    registrationNo: '',
    establishedYear: 2000,
    affiliation: '',
    address: '',
    district: '',
    thana: '',
    phone: '',
    altPhone: '',
    email: '',
    website: '',
    logoUrl: '',
  });

  // Load configuration on tenant change
  useEffect(() => {
    loadInstitutionConfig();
  }, [tenant.id]);

  const loadInstitutionConfig = async () => {
    setIsLoading(true);
    try {
      const data = await InstitutionService.getTenantConfig(tenant);
      setConfig(data);
      setProfileForm({
        nameBangla: data.tenant.nameBangla || '',
        nameEnglish: data.tenant.nameEnglish || '',
        nameArabic: data.tenant.nameArabic || '',
        madrasahType: data.tenant.madrasahType || MadrasahType.QAWMI,
        eiinCode: data.tenant.eiinCode || '',
        boardCode: data.tenant.boardCode || '',
        registrationNo: data.tenant.registrationNo || '',
        establishedYear: data.tenant.establishedYear || 2000,
        affiliation: data.tenant.affiliation || '',
        address: data.tenant.address || '',
        district: data.tenant.district || '',
        thana: data.tenant.thana || '',
        phone: data.tenant.phone || '',
        altPhone: data.tenant.altPhone || '',
        email: data.tenant.email || '',
        website: data.tenant.website || '',
        logoUrl: data.tenant.logoUrl || '',
      });
    } catch (err: any) {
      setErrorMessage('প্রতিষ্ঠান কনফিগারেশন লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.nameBangla.trim() || !profileForm.nameEnglish.trim() || !profileForm.phone.trim()) {
      setErrorMessage('প্রতিষ্ঠানের বাংলা নাম, ইংরেজি নাম এবং মোবাইল নম্বর আবশ্যক');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      updateTenant(tenant.id, {
        nameBangla: profileForm.nameBangla.trim(),
        nameEnglish: profileForm.nameEnglish.trim(),
        nameArabic: profileForm.nameArabic.trim() || undefined,
        madrasahType: profileForm.madrasahType,
        eiinCode: profileForm.eiinCode.trim() || undefined,
        boardCode: profileForm.boardCode.trim() || undefined,
        registrationNo: profileForm.registrationNo.trim() || undefined,
        establishedYear: profileForm.establishedYear,
        affiliation: profileForm.affiliation.trim() || undefined,
        address: profileForm.address.trim(),
        district: profileForm.district.trim(),
        thana: profileForm.thana.trim() || undefined,
        phone: profileForm.phone.trim(),
        altPhone: profileForm.altPhone.trim() || undefined,
        email: profileForm.email.trim() || undefined,
        website: profileForm.website.trim() || undefined,
        logoUrl: profileForm.logoUrl.trim() || undefined,
      });

      setSuccessMessage('প্রতিষ্ঠানের পরিচিতি ও যোগাযোগের তথ্য সফলভাবে হালনাগাদ করা হয়েছে');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage('সংরক্ষণে ত্রুটি দেখা দিয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAllConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await InstitutionService.updateInstitutionConfig(tenant.id, config);
      setSuccessMessage('প্রতিষ্ঠানের সম্পূর্ণ কনফিগারেশন ডাটাবেজে সংরক্ষিত হয়েছে');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage('কনফিগারেশন সংরক্ষণে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <RotateCcw className="w-8 h-8 animate-spin text-[var(--color-primary)] mb-3" />
        <p className="text-sm text-[var(--color-text-muted)] font-medium">
          প্রতিষ্ঠান কনফিগারেশন ডাটা লোড হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold shadow-inner">
            <School className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--color-text-main)]">
                {tenant.nameBangla}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                {tenant.madrasahType}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--color-text-muted)] font-mono">
                আইডি: {tenant.id}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {tenant.nameEnglish} • {tenant.address}, {tenant.district} • ফোন: {tenant.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity font-semibold text-xs flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> নতুন প্রতিষ্ঠান সেটআপ উইজার্ড
          </button>
          <button
            type="button"
            onClick={handleSaveAllConfig}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <Building2 className="w-4 h-4" /> প্রতিষ্ঠান পরিচিতি
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'academic'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <Clock className="w-4 h-4" /> শিক্ষাবর্ষ ও শিফট
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'classes'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <Layers className="w-4 h-4" /> জামাত / শ্রেণি ও শাখা
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'subjects'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <BookOpen className="w-4 h-4" /> কিতাব ও বিষয়সমূহ
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'grading'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <Award className="w-4 h-4" /> মূল্যায়ন ও গ্রেডিং পদ্ধতি
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'finance'
              ? 'bg-[var(--color-primary)] text-white shadow-sm'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          <Wallet className="w-4 h-4" /> ফি, ফান্ড ও পেমেন্ট
        </button>
      </div>

      {/* Tab 1: Profile & Identity */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
              প্রতিষ্ঠানের নাম ও মৌলিক পরিচয়
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              বাংলা, ইংরেজি ও আরবি নাম, ধরণ ও অফিশিয়াল কোডসমূহ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                প্রতিষ্ঠানের নাম (বাংলা) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.nameBangla}
                onChange={(e) => setProfileForm({ ...profileForm, nameBangla: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                প্রতিষ্ঠানের নাম (ইংরেজি) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={profileForm.nameEnglish}
                onChange={(e) => setProfileForm({ ...profileForm, nameEnglish: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                প্রতিষ্ঠানের নাম (আরবি)
              </label>
              <input
                type="text"
                dir="rtl"
                value={profileForm.nameArabic}
                onChange={(e) => setProfileForm({ ...profileForm, nameArabic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                মাদ্রাসার ধরণ
              </label>
              <select
                value={profileForm.madrasahType}
                onChange={(e) => setProfileForm({ ...profileForm, madrasahType: e.target.value as MadrasahType })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              >
                <option value={MadrasahType.QAWMI}>কওমি মাদ্রাসা (দরসে নেজামী)</option>
                <option value={MadrasahType.HIFZ}>হিফজুল কুরআন মাদ্রাসা</option>
                <option value={MadrasahType.ALIA}>আলিয়া মাদ্রাসা (বোর্ড অনুমোদিত)</option>
                <option value={MadrasahType.CADET}>ইসলামিক ক্যাডেট মাদ্রাসা</option>
                <option value={MadrasahType.NURANI}>নূরানী কিন্ডারগার্টেন</option>
                <option value={MadrasahType.COMBINED}>কম্বাইন্ড / সমন্বিত মাদ্রাসা</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                বোর্ড / কেন্দ্রীয় অ্যাফিলিয়েশন
              </label>
              <input
                type="text"
                value={profileForm.affiliation}
                onChange={(e) => setProfileForm({ ...profileForm, affiliation: e.target.value })}
                placeholder="যেমন: বেফাকুল মাদারিসিল আরাবিয়া"
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                প্রতিষ্ঠা সাল
              </label>
              <input
                type="number"
                value={profileForm.establishedYear}
                onChange={(e) => setProfileForm({ ...profileForm, establishedYear: parseInt(e.target.value) || 2000 })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                ইআইআইএন (EIIN) কোড
              </label>
              <input
                type="text"
                value={profileForm.eiinCode}
                onChange={(e) => setProfileForm({ ...profileForm, eiinCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                বোর্ড কোড / ইলহাক নম্বর
              </label>
              <input
                type="text"
                value={profileForm.boardCode}
                onChange={(e) => setProfileForm({ ...profileForm, boardCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                নিবন্ধন / ট্রাস্ট নম্বর
              </label>
              <input
                type="text"
                value={profileForm.registrationNo}
                onChange={(e) => setProfileForm({ ...profileForm, registrationNo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)]">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] mb-3">
              যোগাযোগ ও অবস্থানের তথ্য
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                  প্রধান মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                  বিকল্প মোবাইল
                </label>
                <input
                  type="tel"
                  value={profileForm.altPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, altPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                  অফিসিয়াল ইমেইল
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                  ওয়েবসাইট
                </label>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                  পূর্ণাঙ্গ ঠিকানা
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                  জেলা
                </label>
                <input
                  type="text"
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--color-border)]">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> পরিচিতি সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Academic Sessions & Shifts */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          {/* Sessions */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                  শিক্ষাবর্ষসমূহ (Academic Sessions)
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  মাদ্রাসার বর্তমান সক্রিয় ও পূর্ববর্তী শিক্ষাবর্ষের তালিকা
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSession = {
                    id: `ses-${Date.now()}`,
                    tenantId: tenant.id,
                    name: 'নতুন শিক্ষাবর্ষ ২০২৬',
                    startDate: '2026-01-01',
                    endDate: '2026-12-31',
                    isCurrent: false,
                  };
                  setConfig({ ...config, sessions: [...config.sessions, newSession] });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> শিক্ষাবর্ষ যোগ করুন
              </button>
            </div>

            <div className="space-y-3">
              {config.sessions.map((ses, idx) => (
                <div
                  key={ses.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">শিক্ষাবর্ষের নাম</span>
                    <input
                      type="text"
                      value={ses.name}
                      onChange={(e) => {
                        const copy = [...config.sessions];
                        copy[idx].name = e.target.value;
                        setConfig({ ...config, sessions: copy });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] font-bold text-sm"
                    />
                  </div>
                  <div className="w-36">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">শুরুর তারিখ</span>
                    <input
                      type="date"
                      value={ses.startDate}
                      onChange={(e) => {
                        const copy = [...config.sessions];
                        copy[idx].startDate = e.target.value;
                        setConfig({ ...config, sessions: copy });
                      }}
                      className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div className="w-36">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">সমাপ্তির তারিখ</span>
                    <input
                      type="date"
                      value={ses.endDate}
                      onChange={(e) => {
                        const copy = [...config.sessions];
                        copy[idx].endDate = e.target.value;
                        setConfig({ ...config, sessions: copy });
                      }}
                      className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-text-muted)] block mb-1">সক্রিয় সেশন</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="activeSessionRadio"
                        checked={ses.isCurrent}
                        onChange={() => {
                          const copy = config.sessions.map((s) => ({
                            ...s,
                            isCurrent: s.id === ses.id,
                          }));
                          setConfig({ ...config, sessions: copy, activeSessionId: ses.id });
                        }}
                        className="text-[var(--color-primary)]"
                      />
                      <span className="font-semibold">{ses.isCurrent ? 'বর্তমান সেশন' : 'নির্বাচন করুন'}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shifts */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                শিফট ও সময়সূচি (Shifts)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newShift: ShiftEntity = {
                    id: `shf-${Date.now()}`,
                    tenantId: tenant.id,
                    nameBangla: 'নতুন শিফট',
                    nameEnglish: 'New Shift',
                    startTime: '08:00',
                    endTime: '13:00',
                    isResidential: false,
                    isActive: true,
                  };
                  setConfig({ ...config, shifts: [...config.shifts, newShift] });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> শিফট যোগ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.shifts.map((shf, idx) => (
                <div
                  key={shf.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={shf.nameBangla}
                      onChange={(e) => {
                        const copy = [...config.shifts];
                        copy[idx].nameBangla = e.target.value;
                        setConfig({ ...config, shifts: copy });
                      }}
                      className="font-bold text-sm px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex-1 mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = config.shifts.filter((_, i) => i !== idx);
                        setConfig({ ...config, shifts: copy });
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">শুরুর সময়</span>
                      <input
                        type="time"
                        value={shf.startTime}
                        onChange={(e) => {
                          const copy = [...config.shifts];
                          copy[idx].startTime = e.target.value;
                          setConfig({ ...config, shifts: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">সমাপ্তির সময়</span>
                      <input
                        type="time"
                        value={shf.endTime}
                        onChange={(e) => {
                          const copy = [...config.shifts];
                          copy[idx].endTime = e.target.value;
                          setConfig({ ...config, shifts: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={shf.isResidential}
                      onChange={(e) => {
                        const copy = [...config.shifts];
                        copy[idx].isResidential = e.target.checked;
                        setConfig({ ...config, shifts: copy });
                      }}
                      className="rounded text-[var(--color-primary)]"
                    />
                    <span className="font-semibold text-[var(--color-text-main)]">
                      আবাসিক ছাত্রদের জন্য শিফট (Full-time Boarding)
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Classes & Sections */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--color-primary)]" />
                  জামাত / শ্রেণিসমূহ (Classes)
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  মাদ্রাসার সমস্ত জামাত এবং সংশ্লিষ্ট অ্যাকাডেমিক বিভাগ
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newClass: ClassEntity = {
                    id: `cls-${Date.now()}`,
                    tenantId: tenant.id,
                    nameBangla: 'নতুন শ্রেণি',
                    nameEnglish: 'New Class',
                    department: DepartmentType.GENERAL,
                    orderIndex: config.classes.length + 1,
                    totalStudents: 0,
                  };
                  setConfig({ ...config, classes: [...config.classes, newClass] });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> জামাত যোগ করুন
              </button>
            </div>

            <div className="space-y-2.5">
              {config.classes.map((cls, idx) => (
                <div
                  key={cls.id}
                  className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-wrap items-center gap-3 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={cls.nameBangla}
                      onChange={(e) => {
                        const copy = [...config.classes];
                        copy[idx].nameBangla = e.target.value;
                        setConfig({ ...config, classes: copy });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] font-medium"
                    />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <input
                      type="text"
                      value={cls.nameEnglish || ''}
                      onChange={(e) => {
                        const copy = [...config.classes];
                        copy[idx].nameEnglish = e.target.value;
                        setConfig({ ...config, classes: copy });
                      }}
                      placeholder="Class Name"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={cls.department || DepartmentType.GENERAL}
                      onChange={(e) => {
                        const copy = [...config.classes];
                        copy[idx].department = e.target.value as DepartmentType;
                        setConfig({ ...config, classes: copy });
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs"
                    >
                      <option value={DepartmentType.NURANI}>নূরানী বিভাগ</option>
                      <option value={DepartmentType.NAJERA}>নাজেরা বিভাগ</option>
                      <option value={DepartmentType.HIFZ}>হিফজ বিভাগ</option>
                      <option value={DepartmentType.KITAB}>কিতাব বিভাগ</option>
                      <option value={DepartmentType.DAWRA_HADITH}>দাওরায়ে হাদিস</option>
                      <option value={DepartmentType.IFTA}>ইফতা বিভাগ</option>
                      <option value={DepartmentType.GENERAL}>সাধারণ</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = config.classes.filter((_, i) => i !== idx);
                      setConfig({ ...config, classes: copy });
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  শাখা ও সেকশনসমূহ (Sections)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newSection: SectionEntity = {
                    id: `sec-${Date.now()}`,
                    tenantId: tenant.id,
                    classId: config.classes[0]?.id || 'cls-1',
                    name: `শাখা নতুন (${config.sections.length + 1})`,
                    capacity: 35,
                    roomNumber: '১০১',
                  };
                  setConfig({ ...config, sections: [...config.sections, newSection] });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> শাখা যোগ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {config.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={sec.name}
                      onChange={(e) => {
                        const copy = [...config.sections];
                        copy[idx].name = e.target.value;
                        setConfig({ ...config, sections: copy });
                      }}
                      className="font-bold text-xs px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex-1 mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = config.sections.filter((_, i) => i !== idx);
                        setConfig({ ...config, sections: copy });
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">আসন সংখ্যা</span>
                      <input
                        type="number"
                        value={sec.capacity || 40}
                        onChange={(e) => {
                          const copy = [...config.sections];
                          copy[idx].capacity = parseInt(e.target.value) || 30;
                          setConfig({ ...config, sections: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">রুম নং</span>
                      <input
                        type="text"
                        value={sec.roomNumber || ''}
                        onChange={(e) => {
                          const copy = [...config.sections];
                          copy[idx].roomNumber = e.target.value;
                          setConfig({ ...config, sections: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Subjects */}
      {activeTab === 'subjects' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                কিতাব ও বিষয় তালিকা (Subjects & Books)
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                প্রতিটি কিতাব বা বিষয়ের বাংলা-ইংরেজি নাম, মোট নম্বর ও পাস নম্বর
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const newSubject: SubjectEntity = {
                  id: `sbj-${Date.now()}`,
                  tenantId: tenant.id,
                  classId: config.classes[0]?.id || 'cls-1',
                  nameBangla: 'নতুন কিতাব / বিষয়',
                  nameEnglish: 'New Subject',
                  totalMarks: 100,
                  passMarks: 40,
                };
                setConfig({ ...config, subjects: [...config.subjects, newSubject] });
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> বিষয় যোগ করুন
            </button>
          </div>

          <div className="space-y-2.5">
            {config.subjects.map((sub, idx) => (
              <div
                key={sub.id}
                className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-wrap items-center gap-3 text-xs"
              >
                <span className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[10px]">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={sub.nameBangla}
                    onChange={(e) => {
                      const copy = [...config.subjects];
                      copy[idx].nameBangla = e.target.value;
                      setConfig({ ...config, subjects: copy });
                    }}
                    placeholder="কিতাব বা বিষয়ের নাম (বাংলা)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] font-medium"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <input
                    type="text"
                    value={sub.nameEnglish || ''}
                    onChange={(e) => {
                      const copy = [...config.subjects];
                      copy[idx].nameEnglish = e.target.value;
                      setConfig({ ...config, subjects: copy });
                    }}
                    placeholder="Subject Name"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
                <div className="w-24">
                  <span className="text-[10px] text-[var(--color-text-muted)] block">মোট নম্বর</span>
                  <input
                    type="number"
                    value={sub.totalMarks}
                    onChange={(e) => {
                      const copy = [...config.subjects];
                      copy[idx].totalMarks = parseInt(e.target.value) || 100;
                      setConfig({ ...config, subjects: copy });
                    }}
                    className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                  />
                </div>
                <div className="w-24">
                  <span className="text-[10px] text-[var(--color-text-muted)] block">পাস নম্বর</span>
                  <input
                    type="number"
                    value={sub.passMarks}
                    onChange={(e) => {
                      const copy = [...config.subjects];
                      copy[idx].passMarks = parseInt(e.target.value) || 40;
                      setConfig({ ...config, subjects: copy });
                    }}
                    className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const copy = config.subjects.filter((_, i) => i !== idx);
                    setConfig({ ...config, subjects: copy });
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Grading System */}
      {activeTab === 'grading' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                ফলাফল ও গ্রেডিং কাঠামো কনফিগারেশন
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                কওমি মারহালা (বেফাক) বা আলিয়া শিক্ষা বোর্ডের গ্রেডিং রুলস
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    gradingSystem: INSTITUTION_TEMPLATES[MadrasahType.QAWMI].defaultData.gradingSystem!,
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
              >
                কওমি বেফাক স্কেল লোড করুন
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    gradingSystem: INSTITUTION_TEMPLATES[MadrasahType.ALIA].defaultData.gradingSystem!,
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] hover:bg-[var(--color-bg)]"
              >
                আলিয়া বোর্ড জিপিএ লোড করুন
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <th className="py-2.5 px-3">গ্রেড / মারহালা (বাংলা)</th>
                  <th className="py-2.5 px-3">গ্রেড কোড</th>
                  <th className="py-2.5 px-3">শতকরা নম্বর সীমা (%)</th>
                  <th className="py-2.5 px-3">জিপিএ পয়েন্ট</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {config.gradingSystem.rules.map((rule, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[var(--color-bg)]/40">
                    <td className="py-2.5 px-3 font-semibold text-[var(--color-text-main)]">
                      {rule.gradeBangla}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-text-muted)]">
                      {rule.gradeEnglish} {rule.gradeArabic && `(${rule.gradeArabic})`}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {rule.minPercentage}% - {rule.maxPercentage}%
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {rule.gpaPoint !== undefined ? rule.gpaPoint.toFixed(2) : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          rule.isPassing
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {rule.isPassing ? 'উত্তীর্ণ (Pass)' : 'অনুত্তীর্ণ (Fail)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-text-muted)]">
                      {rule.remarksBn || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Finance & Payments */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          {/* Fee Types */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                ফি-এর খাতসমূহ (Fee Structure)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newFee: FeeTypeEntity = {
                    id: `fee-typ-${Date.now()}`,
                    tenantId: tenant.id,
                    nameBangla: 'নতুন ফি',
                    nameEnglish: 'New Fee',
                    code: `FEE_${config.feeTypes.length + 1}`,
                    defaultAmount: 500,
                    frequency: 'MONTHLY',
                    isMandatory: true,
                  };
                  setConfig({ ...config, feeTypes: [...config.feeTypes, newFee] });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> ফি যোগ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.feeTypes.map((fee, idx) => (
                <div
                  key={fee.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={fee.nameBangla}
                      onChange={(e) => {
                        const copy = [...config.feeTypes];
                        copy[idx].nameBangla = e.target.value;
                        setConfig({ ...config, feeTypes: copy });
                      }}
                      className="font-bold text-xs px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex-1 mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = config.feeTypes.filter((_, i) => i !== idx);
                        setConfig({ ...config, feeTypes: copy });
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">ডিফল্ট পরিমাণ (৳)</span>
                      <input
                        type="number"
                        value={fee.defaultAmount}
                        onChange={(e) => {
                          const copy = [...config.feeTypes];
                          copy[idx].defaultAmount = parseInt(e.target.value) || 0;
                          setConfig({ ...config, feeTypes: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] font-bold text-emerald-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">আদায়ের সময়কাল</span>
                      <select
                        value={fee.frequency}
                        onChange={(e) => {
                          const copy = [...config.feeTypes];
                          copy[idx].frequency = e.target.value as any;
                          setConfig({ ...config, feeTypes: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                      >
                        <option value="MONTHLY">মাসিক</option>
                        <option value="ONE_TIME">এককালীন</option>
                        <option value="YEARLY">বাৎসরিক</option>
                        <option value="PER_EXAM">প্রতি পরীক্ষা</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funds */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-600" />
                প্রাতিষ্ঠানিক তহবিলসমূহ (Funds)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newFund: FundEntity = {
                    id: `fund-${Date.now()}`,
                    tenantId: tenant.id,
                    nameBangla: 'নতুন তহবিল',
                    nameEnglish: 'New Fund',
                    currentBalance: 0,
                    isRestricted: false,
                  };
                  setConfig({ ...config, funds: [...config.funds, newFund] });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> তহবিল যোগ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.funds.map((fn, idx) => (
                <div
                  key={fn.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={fn.nameBangla}
                      onChange={(e) => {
                        const copy = [...config.funds];
                        copy[idx].nameBangla = e.target.value;
                        setConfig({ ...config, funds: copy });
                      }}
                      className="w-full font-bold px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] mb-1"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                      <input
                        type="checkbox"
                        checked={fn.isRestricted}
                        onChange={(e) => {
                          const copy = [...config.funds];
                          copy[idx].isRestricted = e.target.checked;
                          setConfig({ ...config, funds: copy });
                        }}
                        className="rounded text-[var(--color-primary)]"
                      />
                      সংরক্ষিত খাত (লিল্লাহ / যাকাত / বিশেষ দান)
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = config.funds.filter((_, i) => i !== idx);
                      setConfig({ ...config, funds: copy });
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                পেমেন্ট ও কালেকশন চ্যানেলসমূহ (Payment Methods)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const newMethod: PaymentMethodConfig = {
                    id: `pm-${Date.now()}`,
                    tenantId: tenant.id,
                    methodType: PaymentMethod.BKASH,
                    providerName: 'বিকাশ পেমেন্ট',
                    accountNumber: '01XXXXXXXXX',
                    isActive: true,
                  };
                  setConfig({ ...config, paymentMethods: [...config.paymentMethods, newMethod] });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> পেমেন্ট পদ্ধতি যোগ
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.paymentMethods.map((pm, idx) => (
                <div
                  key={pm.id}
                  className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={pm.providerName}
                      onChange={(e) => {
                        const copy = [...config.paymentMethods];
                        copy[idx].providerName = e.target.value;
                        setConfig({ ...config, paymentMethods: copy });
                      }}
                      className="font-bold text-xs px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex-1 mr-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = config.paymentMethods.filter((_, i) => i !== idx);
                        setConfig({ ...config, paymentMethods: copy });
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">পদ্ধতির ধরণ</span>
                      <select
                        value={pm.methodType}
                        onChange={(e) => {
                          const copy = [...config.paymentMethods];
                          copy[idx].methodType = e.target.value as PaymentMethod;
                          setConfig({ ...config, paymentMethods: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                      >
                        <option value={PaymentMethod.CASH}>ক্যাশ কাউন্টার</option>
                        <option value={PaymentMethod.BKASH}>বিকাশ (bKash)</option>
                        <option value={PaymentMethod.NAGAD}>নগদ (Nagad)</option>
                        <option value={PaymentMethod.ROCKET}>রকেট (Rocket)</option>
                        <option value={PaymentMethod.BANK_TRANSFER}>ব্যাংক ট্রান্সফার</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">হিসাব / কাউন্টার নং</span>
                      <input
                        type="text"
                        value={pm.accountNumber || ''}
                        onChange={(e) => {
                          const copy = [...config.paymentMethods];
                          copy[idx].accountNumber = e.target.value;
                          setConfig({ ...config, paymentMethods: copy });
                        }}
                        className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">অভিভাবকদের জন্য নির্দেশনা</span>
                    <input
                      type="text"
                      value={pm.instructionsBn || ''}
                      onChange={(e) => {
                        const copy = [...config.paymentMethods];
                        copy[idx].instructionsBn = e.target.value;
                        setConfig({ ...config, paymentMethods: copy });
                      }}
                      placeholder="পেমেন্ট স্লিপ সংরক্ষণ করুন..."
                      className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Setup Wizard Modal */}
      {isWizardOpen && (
        <InstitutionSetupWizard
          onClose={() => setIsWizardOpen(false)}
          onSuccess={(newTenantId) => {
            setIsWizardOpen(false);
            setSuccessMessage('নতুন প্রতিষ্ঠান সফলভাবে তৈরি ও সক্রিয় করা হয়েছে!');
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
        />
      )}
    </div>
  );
};
