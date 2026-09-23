import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Sparkles,
  School,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Wallet,
  Award,
  BookOpen,
  Layers,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  MadrasahType,
  DepartmentType,
  PaymentMethod,
  ShiftEntity,
  DepartmentConfig,
  ClassEntity,
  SectionEntity,
  SubjectEntity,
  FeeTypeEntity,
  FundEntity,
  PaymentMethodConfig,
  GradingSystemConfig,
} from '../../types';
import {
  InstitutionService,
  InstitutionSetupPayload,
  INSTITUTION_TEMPLATES,
  InstitutionValidationError,
} from '../../services/institutionService';
import { useAuth } from '../../context/AuthContext';

interface InstitutionSetupWizardProps {
  onClose?: () => void;
  onSuccess?: (newTenantId: string) => void;
}

const WIZARD_STEPS = [
  { id: 1, titleBn: 'পরিচিতি ও ধরণ', subtitleBn: 'নাম, ধরন ও যোগাযোগ তথ্য', icon: Building2 },
  { id: 2, titleBn: 'শিক্ষাবর্ষ ও শিফট', subtitleBn: 'সেশন, সময়সূচি ও বিভাগ', icon: Clock },
  { id: 3, titleBn: 'জামাত ও শাখা', subtitleBn: 'শ্রেণি ও সেকশন বিন্যাস', icon: Layers },
  { id: 4, titleBn: 'কিতাব ও বিষয়', subtitleBn: 'বিষয় তালিকা ও নম্বর বিভাজন', icon: BookOpen },
  { id: 5, titleBn: 'গ্রেডিং ও মূল্যায়ন', subtitleBn: 'মারহালা ও জিপিএ স্কেল', icon: Award },
  { id: 6, titleBn: 'ফি, ফান্ড ও পেমেন্ট', subtitleBn: 'ফি কাঠামো ও লেনদেন মাধ্যম', icon: Wallet },
  { id: 7, titleBn: 'যাচাই ও সমাপ্তি', subtitleBn: 'চূড়ান্ত যাচাই ও চালু করুন', icon: CheckCircle2 },
];

export const InstitutionSetupWizard: React.FC<InstitutionSetupWizardProps> = ({ onClose, onSuccess }) => {
  const { addTenant } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<MadrasahType>(MadrasahType.QAWMI);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<InstitutionValidationError[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Core Wizard Form State initialized from default Qawmi template
  const defaultTemplate = INSTITUTION_TEMPLATES[MadrasahType.QAWMI].defaultData;
  const [formData, setFormData] = useState<InstitutionSetupPayload>({
    nameBangla: 'দারুল উলুম ইসলামিয়া আল-জামিয়া',
    nameEnglish: 'Darul Uloom Islamia Al-Jamia',
    nameArabic: 'جامعة دار العلوم الإسلامية',
    madrasahType: MadrasahType.QAWMI,
    logoUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=120&auto=format&fit=crop&q=80',
    address: 'মাদ্রাসাপাড়া, মেইন রোড, ওয়ার্ড নং ০৪',
    district: 'ঢাকা',
    thana: 'মিরপুর',
    phone: '01711002233',
    altPhone: '01811002233',
    email: 'info@darululoom-jamia.edu.bd',
    website: 'https://darululoom-jamia.edu.bd',
    eiinCode: '134521',
    boardCode: 'BEFAQ-DHK-452',
    registrationNo: 'REG-2024-889',
    establishedYear: 1998,
    affiliation: defaultTemplate.affiliation || 'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ',

    sessionName: defaultTemplate.sessionName || '১৪৪৬-১৪৪৭ হিজরি / ২০২৫-২০২৬ শিক্ষাবর্ষ',
    sessionStartDate: defaultTemplate.sessionStartDate || '2025-01-01',
    sessionEndDate: defaultTemplate.sessionEndDate || '2025-12-31',

    shifts: (defaultTemplate.shifts as any[]) || [],
    departments: (defaultTemplate.departments as any[]) || [],
    classes: (defaultTemplate.classes as any[]) || [],
    sections: (defaultTemplate.sections as any[]) || [],
    subjects: (defaultTemplate.subjects as any[]) || [],
    gradingSystem: defaultTemplate.gradingSystem || {
      systemType: 'QAWMI_MARHALA',
      passMarkPercentage: 33,
      rules: [],
    },
    feeTypes: (defaultTemplate.feeTypes as any[]) || [],
    funds: (defaultTemplate.funds as any[]) || [],
    paymentMethods: (defaultTemplate.paymentMethods as any[]) || [],
  });

  // Apply predefined template
  const handleApplyTemplate = (type: MadrasahType) => {
    setSelectedTemplate(type);
    const tmpl = INSTITUTION_TEMPLATES[type]?.defaultData;
    if (!tmpl) return;

    setFormData((prev) => ({
      ...prev,
      madrasahType: type,
      affiliation: tmpl.affiliation || '',
      sessionName: tmpl.sessionName || prev.sessionName,
      sessionStartDate: tmpl.sessionStartDate || prev.sessionStartDate,
      sessionEndDate: tmpl.sessionEndDate || prev.sessionEndDate,
      shifts: tmpl.shifts ? JSON.parse(JSON.stringify(tmpl.shifts)) : prev.shifts,
      departments: tmpl.departments ? JSON.parse(JSON.stringify(tmpl.departments)) : prev.departments,
      classes: tmpl.classes ? JSON.parse(JSON.stringify(tmpl.classes)) : prev.classes,
      sections: tmpl.sections ? JSON.parse(JSON.stringify(tmpl.sections)) : prev.sections,
      subjects: tmpl.subjects ? JSON.parse(JSON.stringify(tmpl.subjects)) : prev.subjects,
      gradingSystem: tmpl.gradingSystem ? JSON.parse(JSON.stringify(tmpl.gradingSystem)) : prev.gradingSystem,
      feeTypes: tmpl.feeTypes ? JSON.parse(JSON.stringify(tmpl.feeTypes)) : prev.feeTypes,
      funds: tmpl.funds ? JSON.parse(JSON.stringify(tmpl.funds)) : prev.funds,
      paymentMethods: tmpl.paymentMethods ? JSON.parse(JSON.stringify(tmpl.paymentMethods)) : prev.paymentMethods,
    }));
  };

  // Step Validation Check
  const validateCurrentStep = (): boolean => {
    setValidationErrors([]);
    setGeneralError(null);
    const allErrors = InstitutionService.validateSetupPayload(formData);

    let stepErrors: InstitutionValidationError[] = [];
    if (currentStep === 1) {
      stepErrors = allErrors.filter((e) =>
        ['nameBangla', 'nameEnglish', 'madrasahType', 'address', 'district', 'phone', 'email'].includes(e.field)
      );
    } else if (currentStep === 2) {
      stepErrors = allErrors.filter((e) =>
        ['sessionName', 'sessionStartDate', 'sessionEndDate', 'shifts'].includes(e.field)
      );
    } else if (currentStep === 3) {
      stepErrors = allErrors.filter((e) => ['classes', 'sections'].includes(e.field));
    } else if (currentStep === 4) {
      stepErrors = allErrors.filter((e) => ['subjects'].includes(e.field));
    } else if (currentStep === 6) {
      stepErrors = allErrors.filter((e) => ['feeTypes', 'funds', 'paymentMethods'].includes(e.field));
    }

    if (stepErrors.length > 0) {
      setValidationErrors(stepErrors);
      setGeneralError(stepErrors[0].messageBn);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit and launch institution
  const handleCompleteSetup = async () => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const result = await InstitutionService.createInstitutionWithWizard(formData);
      addTenant(result.tenant);
      if (onSuccess) {
        onSuccess(result.tenant.id);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setGeneralError(err.message || 'প্রতিষ্ঠান সেটআপ সংরক্ষণে ত্রুটি দেখা দিয়েছে');
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field error helper
  const getFieldError = (fieldName: string) => {
    return validationErrors.find((e) => e.field === fieldName)?.messageBn;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-main)] flex items-center gap-2">
                নতুন প্রতিষ্ঠান সেটআপ উইজার্ড (Setup Wizard)
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30">
                  ৭টি সুনির্দিষ্ট ধাপ
                </span>
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                সকল মৌলিক তথ্য, শিক্ষাবর্ষ, জামাত, কিতাব, ফি ও গ্রেডিং কনফিগার করে সম্পূর্ণ সচল প্রতিষ্ঠান তৈরি করুন
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg)] rounded-xl transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {WIZARD_STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] opacity-60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-white text-[var(--color-primary)]'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                  </span>
                  <span>{step.titleBn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {generalError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* ----------------- STEP 1: IDENTITY & IDENTIFIERS ----------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Template Quick Selection */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" /> দ্রুত রেডিমেড টেমপ্লেট নির্বাচন (১-ক্লিকে কনফিগারেশন লোড)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {Object.entries(INSTITUTION_TEMPLATES).map(([typeKey, tmpl]) => {
                    const isSelected = selectedTemplate === typeKey;
                    return (
                      <button
                        key={typeKey}
                        type="button"
                        onClick={() => handleApplyTemplate(typeKey as MadrasahType)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]'
                            : 'border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                        }`}
                      >
                        <div className="font-semibold text-[var(--color-text-main)] mb-1 flex items-center justify-between">
                          <span>{tmpl.labelBn}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                          {tmpl.descriptionBn}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Institution Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    প্রতিষ্ঠানের নাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameBangla}
                    onChange={(e) => setFormData({ ...formData, nameBangla: e.target.value })}
                    placeholder="যেমন: জামেয়া ইসলামিয়া দারুল উলুম"
                    className={`w-full px-3 py-2 rounded-xl text-sm border bg-[var(--color-bg)] ${
                      getFieldError('nameBangla') ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--color-border)]'
                    }`}
                  />
                  {getFieldError('nameBangla') && (
                    <p className="text-[11px] text-rose-500 mt-1">{getFieldError('nameBangla')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    প্রতিষ্ঠানের নাম (ইংরেজি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    placeholder="e.g. Jamia Islamia Darul Uloom"
                    className={`w-full px-3 py-2 rounded-xl text-sm border bg-[var(--color-bg)] ${
                      getFieldError('nameEnglish') ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--color-border)]'
                    }`}
                  />
                  {getFieldError('nameEnglish') && (
                    <p className="text-[11px] text-rose-500 mt-1">{getFieldError('nameEnglish')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    প্রতিষ্ঠানের নাম (আরবি - ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.nameArabic || ''}
                    onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                    placeholder="الجامعة الإسلامية دار العلوم"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>
              </div>

              {/* Madrasah Type & Affiliation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    মাদ্রাসার ধরণ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.madrasahType}
                    onChange={(e) => handleApplyTemplate(e.target.value as MadrasahType)}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-main)]"
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
                    বোর্ড / শিক্ষাবোর্ড অ্যাফিলিয়েশন
                  </label>
                  <input
                    type="text"
                    value={formData.affiliation || ''}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                    placeholder="যেমন: বেফাকুল মাদারিসিল আরাবিয়া / মাদ্রাসা বোর্ড"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    প্রতিষ্ঠা সাল
                  </label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) || 2000 })}
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>
              </div>

              {/* Codes & Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    ইআইআইএন (EIIN) কোড (প্রযোজ্য ক্ষেত্রে)
                  </label>
                  <input
                    type="text"
                    value={formData.eiinCode || ''}
                    onChange={(e) => setFormData({ ...formData, eiinCode: e.target.value })}
                    placeholder="যেমন: 134521"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    বোর্ড রেজিস্ট্রেশন / ইলহাক কোড
                  </label>
                  <input
                    type="text"
                    value={formData.boardCode || ''}
                    onChange={(e) => setFormData({ ...formData, boardCode: e.target.value })}
                    placeholder="যেমন: BEFAQ-1025"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    সরকারি বা ট্রাস্ট নিবন্ধন নং
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNo || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                    placeholder="যেমন: REG-TR-458"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>
              </div>

              {/* Contacts & Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    প্রধান মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0171XXXXXXXX"
                    className={`w-full px-3 py-2 rounded-xl text-sm border bg-[var(--color-bg)] ${
                      getFieldError('phone') ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--color-border)]'
                    }`}
                  />
                  {getFieldError('phone') && (
                    <p className="text-[11px] text-rose-500 mt-1">{getFieldError('phone')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    বিকল্প মোবাইল / ল্যান্ডলাইন
                  </label>
                  <input
                    type="tel"
                    value={formData.altPhone || ''}
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                    placeholder="018XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    অফিসিয়াল ইমেইল
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="office@madrasah.edu.bd"
                    className={`w-full px-3 py-2 rounded-xl text-sm border bg-[var(--color-bg)] ${
                      getFieldError('email') ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--color-border)]'
                    }`}
                  />
                  {getFieldError('email') && (
                    <p className="text-[11px] text-rose-500 mt-1">{getFieldError('email')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    ওয়েবসাইট লিঙ্ক
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://madrasah.edu.bd"
                    className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                  />
                </div>
              </div>

              {/* Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    বিস্তারিত ঠিকানা (গ্রাম/রোড/ওয়ার্ড) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="মাদ্রাসাপাড়া, ডাকঘর, ওয়ার্ড নং ০৪"
                    className={`w-full px-3 py-2 rounded-xl text-sm border bg-[var(--color-bg)] ${
                      getFieldError('address') ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--color-border)]'
                    }`}
                  />
                  {getFieldError('address') && (
                    <p className="text-[11px] text-rose-500 mt-1">{getFieldError('address')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                    জেলা <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="যেমন: ঢাকা, চট্টগ্রাম, সিলেট"
                    className={`w-full px-3 py-2 rounded-xl text-sm border bg-[var(--color-bg)] ${
                      getFieldError('district') ? 'border-rose-500 ring-1 ring-rose-500' : 'border-[var(--color-border)]'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ----------------- STEP 2: SESSIONS, SHIFTS & DEPARTMENTS ----------------- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Academic Session */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                  প্রাথমিক শিক্ষাবর্ষ নির্ধারণ (Academic Session)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                      শিক্ষাবর্ষের নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.sessionName}
                      onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                      placeholder="১৪৪৬-১৪৪৭ হিজরি / ২০২৫-২০২৬"
                      className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                      শুরুর তারিখ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.sessionStartDate}
                      onChange={(e) => setFormData({ ...formData, sessionStartDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5">
                      সমাপ্তির তারিখ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.sessionEndDate}
                      onChange={(e) => setFormData({ ...formData, sessionEndDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg)]"
                    />
                  </div>
                </div>
              </div>

              {/* Shifts */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    মাদ্রাসার শিফটসমূহ (Shifts)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        shifts: [
                          ...formData.shifts,
                          {
                            nameBangla: 'নতুন শিফট',
                            nameEnglish: 'New Shift',
                            startTime: '08:00',
                            endTime: '13:00',
                            isResidential: false,
                            isActive: true,
                          },
                        ],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> শিফট যোগ করুন
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.shifts.map((shift, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-[var(--color-text-muted)] block mb-1">শিফটের নাম (বাংলা)</label>
                        <input
                          type="text"
                          value={shift.nameBangla}
                          onChange={(e) => {
                            const copy = [...formData.shifts];
                            copy[idx].nameBangla = e.target.value;
                            setFormData({ ...formData, shifts: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[var(--color-text-muted)] block mb-1">শুরু ও সমাপ্তি</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={shift.startTime}
                            onChange={(e) => {
                              const copy = [...formData.shifts];
                              copy[idx].startTime = e.target.value;
                              setFormData({ ...formData, shifts: copy });
                            }}
                            className="w-full px-1.5 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px]"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={shift.endTime}
                            onChange={(e) => {
                              const copy = [...formData.shifts];
                              copy[idx].endTime = e.target.value;
                              setFormData({ ...formData, shifts: copy });
                            }}
                            className="w-full px-1.5 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[11px]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shift.isResidential}
                            onChange={(e) => {
                              const copy = [...formData.shifts];
                              copy[idx].isResidential = e.target.checked;
                              setFormData({ ...formData, shifts: copy });
                            }}
                            className="rounded text-[var(--color-primary)]"
                          />
                          <span className="text-[11px] font-medium">আবাসিক শিফট</span>
                        </label>
                      </div>
                      <div className="flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = formData.shifts.filter((_, i) => i !== idx);
                            setFormData({ ...formData, shifts: copy });
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departments */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  অ্যাকাডেমিক বিভাগসমূহ (Departments)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.departments.map((dept, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        dept.isEnabled
                          ? 'border-[var(--color-border)] bg-[var(--color-bg)]'
                          : 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dept.isEnabled}
                            onChange={(e) => {
                              const copy = [...formData.departments];
                              copy[idx].isEnabled = e.target.checked;
                              setFormData({ ...formData, departments: copy });
                            }}
                            className="rounded text-[var(--color-primary)]"
                          />
                          <span className="font-semibold text-xs text-[var(--color-text-main)]">
                            {dept.nameBangla}
                          </span>
                        </label>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {dept.type}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={dept.headName || ''}
                        onChange={(e) => {
                          const copy = [...formData.departments];
                          copy[idx].headName = e.target.value;
                          setFormData({ ...formData, departments: copy });
                        }}
                        placeholder="বিভাগীয় প্রধানের নাম (যেমন: মুফতি হাবিবুল্লাহ)"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ----------------- STEP 3: CLASSES & SECTIONS ----------------- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Classes / Jamats */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                      <School className="w-4 h-4 text-[var(--color-primary)]" />
                      জামাত / শ্রেণিসমূহ (Classes)
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      মাদ্রাসার প্রাথমিক থেকে সর্বোচ্চ স্তর পর্যন্ত জামাতের তালিকা
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        classes: [
                          ...formData.classes,
                          {
                            nameBangla: 'নতুন শ্রেণি',
                            nameEnglish: 'New Class',
                            department: DepartmentType.GENERAL,
                            orderIndex: formData.classes.length + 1,
                            totalStudents: 0,
                          },
                        ],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> নতুন জামাত যোগ
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.classes.map((cls, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-wrap items-center gap-3 text-xs"
                    >
                      <span className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-[180px]">
                        <input
                          type="text"
                          value={cls.nameBangla}
                          onChange={(e) => {
                            const copy = [...formData.classes];
                            copy[idx].nameBangla = e.target.value;
                            setFormData({ ...formData, classes: copy });
                          }}
                          placeholder="জামাতের নাম (বাংলা)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] font-medium"
                        />
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <input
                          type="text"
                          value={cls.nameEnglish || ''}
                          onChange={(e) => {
                            const copy = [...formData.classes];
                            copy[idx].nameEnglish = e.target.value;
                            setFormData({ ...formData, classes: copy });
                          }}
                          placeholder="Class Name (English)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                        />
                      </div>
                      <div className="w-36">
                        <select
                          value={cls.department || DepartmentType.GENERAL}
                          onChange={(e) => {
                            const copy = [...formData.classes];
                            copy[idx].department = e.target.value as DepartmentType;
                            setFormData({ ...formData, classes: copy });
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
                          const copy = formData.classes.filter((_, i) => i !== idx);
                          setFormData({ ...formData, classes: copy });
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      শাখা ও সেকশনসমূহ (Sections)
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      শাখার নাম (যেমন: শাখা আলিফ, বা, জিম অথবা ক, খ) ও আসন ধারণক্ষমতা
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        sections: [
                          ...formData.sections,
                          {
                            classId: '',
                            name: `শাখা নতুন (${formData.sections.length + 1})`,
                            capacity: 35,
                            roomNumber: '১০১',
                          },
                        ],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> শাখা যোগ করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {formData.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--color-text-main)]">শাখা #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = formData.sections.filter((_, i) => i !== idx);
                            setFormData({ ...formData, sections: copy });
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={sec.name}
                        onChange={(e) => {
                          const copy = [...formData.sections];
                          copy[idx].name = e.target.value;
                          setFormData({ ...formData, sections: copy });
                        }}
                        placeholder="শাখার নাম"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--color-text-muted)] block">আসন সংখ্যা</label>
                          <input
                            type="number"
                            value={sec.capacity || 40}
                            onChange={(e) => {
                              const copy = [...formData.sections];
                              copy[idx].capacity = parseInt(e.target.value) || 30;
                              setFormData({ ...formData, sections: copy });
                            }}
                            className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--color-text-muted)] block">রুম নং</label>
                          <input
                            type="text"
                            value={sec.roomNumber || ''}
                            onChange={(e) => {
                              const copy = [...formData.sections];
                              copy[idx].roomNumber = e.target.value;
                              setFormData({ ...formData, sections: copy });
                            }}
                            placeholder="১০১"
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

          {/* ----------------- STEP 4: SUBJECTS & BOOKS ----------------- */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                      কিতাব ও বিষয় তালিকা (Subjects & Dars)
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      মোট নম্বর, পাস নম্বর ও বিষয়ের বাংলা-ইংরেজি নাম
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        subjects: [
                          ...formData.subjects,
                          {
                            classId: '',
                            nameBangla: 'নতুন কিতাব / বিষয়',
                            nameEnglish: 'New Subject',
                            totalMarks: 100,
                            passMarks: 40,
                          },
                        ],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> বিষয় যোগ করুন
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.subjects.map((sub, idx) => (
                    <div
                      key={idx}
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
                            const copy = [...formData.subjects];
                            copy[idx].nameBangla = e.target.value;
                            setFormData({ ...formData, subjects: copy });
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
                            const copy = [...formData.subjects];
                            copy[idx].nameEnglish = e.target.value;
                            setFormData({ ...formData, subjects: copy });
                          }}
                          placeholder="Subject Name (English)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] text-[var(--color-text-muted)] block">মোট নম্বর</label>
                        <input
                          type="number"
                          value={sub.totalMarks}
                          onChange={(e) => {
                            const copy = [...formData.subjects];
                            copy[idx].totalMarks = parseInt(e.target.value) || 100;
                            setFormData({ ...formData, subjects: copy });
                          }}
                          className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] text-[var(--color-text-muted)] block">পাস নম্বর</label>
                        <input
                          type="number"
                          value={sub.passMarks}
                          onChange={(e) => {
                            const copy = [...formData.subjects];
                            copy[idx].passMarks = parseInt(e.target.value) || 40;
                            setFormData({ ...formData, subjects: copy });
                          }}
                          className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const copy = formData.subjects.filter((_, i) => i !== idx);
                          setFormData({ ...formData, subjects: copy });
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ----------------- STEP 5: GRADING SYSTEM ----------------- */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      মূল্যায়ন ও ফলাফল গ্রেডিং কাঠামো (Grading System)
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      কওমি মারহালা গ্রেডিং পদ্ধতি অথবা আলিয়া / সরকারি জিপিএ ৫.০০ স্কেল
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          gradingSystem: INSTITUTION_TEMPLATES[MadrasahType.QAWMI].defaultData.gradingSystem!,
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        formData.gradingSystem.systemType === 'QAWMI_MARHALA'
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                      }`}
                    >
                      বেফাক / কওমি মারহালা
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          gradingSystem: INSTITUTION_TEMPLATES[MadrasahType.ALIA].defaultData.gradingSystem!,
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        formData.gradingSystem.systemType === 'ALIA_GPA'
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'border-[var(--color-border)] hover:bg-[var(--color-bg)]'
                      }`}
                    >
                      বোর্ড জিপিএ ৫.০০ স্কেল
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                        <th className="py-2 px-3">গ্রেড / মারহালা (বাংলা)</th>
                        <th className="py-2 px-3">গ্রেড কোড (ইংরেজি / আরবি)</th>
                        <th className="py-2 px-3">শতকরা নম্বর সীমা (%)</th>
                        <th className="py-2 px-3">জিপিএ পয়েন্ট</th>
                        <th className="py-2 px-3">স্ট্যাটাস</th>
                        <th className="py-2 px-3">মন্তব্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {formData.gradingSystem.rules.map((rule, rIdx) => (
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
            </div>
          )}

          {/* ----------------- STEP 6: FEES, FUNDS & PAYMENT METHODS ----------------- */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Fee Types */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    ফি-এর খাতসমূহ (Fee Types)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        feeTypes: [
                          ...formData.feeTypes,
                          {
                            nameBangla: 'নতুন ফি',
                            nameEnglish: 'New Fee',
                            code: `FEE_${formData.feeTypes.length + 1}`,
                            defaultAmount: 500,
                            frequency: 'MONTHLY',
                            isMandatory: true,
                          },
                        ],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> ফি যোগ করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.feeTypes.map((fee, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={fee.nameBangla}
                          onChange={(e) => {
                            const copy = [...formData.feeTypes];
                            copy[idx].nameBangla = e.target.value;
                            setFormData({ ...formData, feeTypes: copy });
                          }}
                          className="font-bold text-xs px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex-1 mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = formData.feeTypes.filter((_, i) => i !== idx);
                            setFormData({ ...formData, feeTypes: copy });
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--color-text-muted)] block">ডিফল্ট পরিমাণ (৳)</label>
                          <input
                            type="number"
                            value={fee.defaultAmount}
                            onChange={(e) => {
                              const copy = [...formData.feeTypes];
                              copy[idx].defaultAmount = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, feeTypes: copy });
                            }}
                            className="w-full px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] font-bold text-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--color-text-muted)] block">আদায়ের সময়কাল</label>
                          <select
                            value={fee.frequency}
                            onChange={(e) => {
                              const copy = [...formData.feeTypes];
                              copy[idx].frequency = e.target.value as any;
                              setFormData({ ...formData, feeTypes: copy });
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
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    প্রাতিষ্ঠানিক তহবিলসমূহ (Institutional Funds)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        funds: [
                          ...formData.funds,
                          {
                            nameBangla: 'নতুন তহবিল',
                            nameEnglish: 'New Fund',
                            currentBalance: 0,
                            isRestricted: false,
                          },
                        ],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> তহবিল যোগ করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.funds.map((fnd, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          value={fnd.nameBangla}
                          onChange={(e) => {
                            const copy = [...formData.funds];
                            copy[idx].nameBangla = e.target.value;
                            setFormData({ ...formData, funds: copy });
                          }}
                          className="w-full font-bold px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] mb-1"
                        />
                        <label className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                          <input
                            type="checkbox"
                            checked={fnd.isRestricted}
                            onChange={(e) => {
                              const copy = [...formData.funds];
                              copy[idx].isRestricted = e.target.checked;
                              setFormData({ ...formData, funds: copy });
                            }}
                            className="rounded text-[var(--color-primary)]"
                          />
                          সংরক্ষিত / নির্দিষ্ট খাত (যেমন: যাকাত/লিল্লাহ)
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const copy = formData.funds.filter((_, i) => i !== idx);
                          setFormData({ ...formData, funds: copy });
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
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    পেমেন্ট ও জমা পদ্ধতি (Payment Channels)
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paymentMethods: [
                          ...formData.paymentMethods,
                          {
                            methodType: PaymentMethod.BKASH,
                            providerName: 'বিকাশ পেমেন্ট',
                            accountNumber: '01XXXXXXXXX',
                            isActive: true,
                          },
                        ],
                      })
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> পেমেন্ট পদ্ধতি যোগ
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.paymentMethods.map((pm, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--color-text-main)]">{pm.providerName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = formData.paymentMethods.filter((_, i) => i !== idx);
                            setFormData({ ...formData, paymentMethods: copy });
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--color-text-muted)] block">পদ্ধতি</label>
                          <select
                            value={pm.methodType}
                            onChange={(e) => {
                              const copy = [...formData.paymentMethods];
                              copy[idx].methodType = e.target.value as PaymentMethod;
                              setFormData({ ...formData, paymentMethods: copy });
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
                          <label className="text-[10px] text-[var(--color-text-muted)] block">হিসাব / কাউন্টার নং</label>
                          <input
                            type="text"
                            value={pm.accountNumber || ''}
                            onChange={(e) => {
                              const copy = [...formData.paymentMethods];
                              copy[idx].accountNumber = e.target.value;
                              setFormData({ ...formData, paymentMethods: copy });
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

          {/* ----------------- STEP 7: REVIEW & COMPLETE ----------------- */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                      <School className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text-main)]">
                        {formData.nameBangla}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {formData.nameEnglish} • {formData.district}
                      </p>
                      <span className="inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                        {formData.madrasahType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <span className="text-xs text-[var(--color-text-muted)] block">শিক্ষাবর্ষ</span>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">{formData.sessionName}</span>
                  </div>
                </div>

                {/* Configuration Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[var(--color-border)] text-xs">
                  <div className="p-3 rounded-xl bg-[var(--color-bg)]">
                    <span className="text-[var(--color-text-muted)] block mb-1">মোট জামাত / শ্রেণি</span>
                    <span className="text-base font-bold text-[var(--color-text-main)]">
                      {formData.classes.length} টি
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg)]">
                    <span className="text-[var(--color-text-muted)] block mb-1">মোট শাখা</span>
                    <span className="text-base font-bold text-[var(--color-text-main)]">
                      {formData.sections.length} টি
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg)]">
                    <span className="text-[var(--color-text-muted)] block mb-1">মোট কিতাব ও বিষয়</span>
                    <span className="text-base font-bold text-[var(--color-text-main)]">
                      {formData.subjects.length} টি
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--color-bg)]">
                    <span className="text-[var(--color-text-muted)] block mb-1">ফি-এর খাত</span>
                    <span className="text-base font-bold text-[var(--color-text-main)]">
                      {formData.feeTypes.length} টি
                    </span>
                  </div>
                </div>

                {/* Readiness Checklist */}
                <div className="pt-4 space-y-2.5">
                  <span className="text-xs font-semibold text-[var(--color-text-main)] block mb-2">
                    সিস্টেম প্রস্তুতকরণ চেকলিস্ট (Readiness Verification)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>মাল্টি-টেন্যান্ট আইসোলেশন ও ডেডিকেটেড আইডি রেডি</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>প্রাথমিক হিসাব খাতা ও সাধারণ তহবিল সক্রিয়</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>৮-ধাপ ভর্তি প্রক্রিয়া ও হাজিরা শিট কনফিগারেশন প্রস্তুত</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>ফলাফল ও গ্রেডিং রুলস সক্রিয়</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/60 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-main)] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> পূর্ববর্তী ধাপ
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
              >
                পরবর্তী ধাপ <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteSetup}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    প্রতিষ্ঠান তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    প্রতিষ্ঠান চালু করুন (Launch Madrasah)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
