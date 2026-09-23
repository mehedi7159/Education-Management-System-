import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  GraduationCap,
  MapPin,
  FileText,
  Camera,
  Coins,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  AdmissionFormData,
  ClassEntity,
  SectionEntity,
  AcademicSession,
  ShiftEntity,
  AccountEntity,
  FundEntity,
  AdmissionType,
  WaiverCategory,
  PaymentMethod,
  DepartmentType,
  AdmissionTransactionResult,
} from '../../../types';
import { Button } from '../../../components/common/Button';
import { Step1StudentInfo } from './steps/Step1StudentInfo';
import { Step2GuardianInfo } from './steps/Step2GuardianInfo';
import { Step3AcademicInfo } from './steps/Step3AcademicInfo';
import { Step4Address } from './steps/Step4Address';
import { Step5Documents } from './steps/Step5Documents';
import { Step6Photo } from './steps/Step6Photo';
import { Step7AdmissionFee } from './steps/Step7AdmissionFee';
import { Step8Confirmation } from './steps/Step8Confirmation';
import { api } from '../../../api';
import { toBengaliNumerals } from '../../../utils/format';

interface WizardProps {
  classes: ClassEntity[];
  sections: SectionEntity[];
  sessions: AcademicSession[];
  shifts: ShiftEntity[];
  accounts: AccountEntity[];
  funds: FundEntity[];
  onAdmissionSuccess: (result: AdmissionTransactionResult) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, title: 'ব্যক্তিগত তথ্য', en: 'Student Info', icon: User },
  { id: 2, title: 'অভিভাবক', en: 'Guardian', icon: Users },
  { id: 3, title: 'একাডেমিক', en: 'Academic', icon: GraduationCap },
  { id: 4, title: 'ঠিকানা', en: 'Address', icon: MapPin },
  { id: 5, title: 'কাগজপত্র', en: 'Documents', icon: FileText },
  { id: 6, title: 'ছবি ও প্রোফাইল', en: 'Photo', icon: Camera },
  { id: 7, title: 'ভর্তি ফি ও হিসাব', en: 'Admission Fee', icon: Coins },
  { id: 8, title: 'যাচাই ও কনফার্ম', en: 'Confirmation', icon: CheckCircle },
];

const INITIAL_FORM_DATA: AdmissionFormData = {
  // 1. Student Info
  nameBangla: '',
  nameEnglish: '',
  nameArabic: '',
  gender: 'MALE',
  dateOfBirth: '2014-01-01',
  bloodGroup: 'B+',
  religion: 'ইসলাম',
  birthCertificateNo: '',
  previousInstitution: '',
  previousResult: '',
  isResidential: true,
  residenceHall: 'হযরত আবু বকর (রা.) ছাত্রাবাস',
  roomNo: '২০৪',
  bedNo: 'খাট-১',
  medicalNotes: '',
  generalNotes: '',

  // 2. Guardian Info
  guardianName: '',
  guardianRelation: 'পিতা',
  guardianMobile: '',
  guardianNid: '',
  guardianOccupation: '',
  guardianEmail: '',
  fatherName: '',
  fatherOccupation: 'ব্যবসা',
  fatherMobile: '',
  fatherNid: '',
  motherName: '',
  motherOccupation: 'গৃহিণী',
  motherMobile: '',
  motherNid: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',

  // 3. Academic Info
  admissionType: AdmissionType.NEW_ADMISSION,
  admissionDate: new Date().toISOString().split('T')[0],
  formNumber: 'FORM-2025-101',
  admissionNo: 'ADM-2025-0001',
  dakhilaNo: 'DAK-2025-0001',
  registrationNo: '',
  department: DepartmentType.KITAB,
  classId: '',
  className: '',
  sectionId: '',
  sectionName: '',
  sessionId: '',
  sessionName: '',
  shiftId: '',
  shiftName: '',
  rollNo: 1,

  // 4. Address
  presentDivision: 'ঢাকা',
  presentDistrict: 'ঢাকা',
  presentThana: 'মিরপুর',
  presentPostCode: '১২১৬',
  presentAddress: 'বাড়ি নং ১২, রোড নং ৫, ব্লক-বি',
  isPermanentSameAsPresent: true,
  permanentDivision: 'ঢাকা',
  permanentDistrict: 'ঢাকা',
  permanentThana: 'মিরপুর',
  permanentPostCode: '১২১৬',
  permanentAddress: 'বাড়ি নং ১২, রোড নং ৫, ব্লক-বি',

  // 5. Documents
  documents: [
    {
      id: 'doc-init-1',
      type: 'BIRTH_CERTIFICATE',
      title: 'জন্ম নিবন্ধন সনদের ফটোকপি',
      fileName: 'birth_certificate.pdf',
      fileSize: '১.১ মেগাবাইট',
      uploadDate: new Date().toISOString().split('T')[0],
      remarks: 'সত্যায়িত কপি গৃহীত',
    },
    {
      id: 'doc-init-2',
      type: 'NID_COPY',
      title: 'পিতার জাতীয় পরিচয়পত্রের কপি',
      fileName: 'father_nid.pdf',
      fileSize: '৯৫০ কিলোবাইট',
      uploadDate: new Date().toISOString().split('T')[0],
      remarks: 'এনআইডি সার্ভার যাচাইকৃত',
    },
  ],

  // 6. Photo
  photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300',

  // 7. Fee & Payment
  feeBreakdown: {
    admissionFee: 3000,
    sessionFee: 1500,
    idCardAndDiaryFee: 500,
    monthlyTuitionFee: 1000,
    boardingCharge: 2500,
    otherFee: 0,
  },
  waiverCategory: WaiverCategory.NONE,
  discountType: 'FIXED',
  discountValue: 0,
  discountAmount: 0,
  waiverReason: '',
  netPayable: 8500,
  paidAmount: 8500,
  dueAmount: 0,
  paymentMethod: PaymentMethod.CASH,
  targetAccountId: '',
  receiptNotes: 'ভর্তি ফি নগদ গ্রহণ করা হলো।',
};

export const AdmissionWizard: React.FC<WizardProps> = ({
  classes,
  sections,
  sessions,
  shifts,
  accounts,
  funds,
  onAdmissionSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AdmissionFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Initialize defaults from classes and sessions
  useEffect(() => {
    if (classes.length > 0 && !formData.classId) {
      const defaultClass = classes[0];
      const validSections = sections.filter((s) => s.classId === defaultClass.id);
      const defaultSection = validSections[0];
      const defaultSession = sessions.find((s) => s.isCurrent) || sessions[0];
      const defaultShift = shifts[0];
      const defaultAccount = accounts[0];

      setFormData((prev: AdmissionFormData) => ({
        ...prev,
        classId: defaultClass.id,
        className: defaultClass.nameBangla,
        department: defaultClass.department,
        sectionId: defaultSection ? defaultSection.id : '',
        sectionName: defaultSection ? defaultSection.name : '',
        sessionId: defaultSession ? defaultSession.id : '',
        sessionName: defaultSession ? defaultSession.name : '',
        shiftId: defaultShift ? defaultShift.id : '',
        shiftName: defaultShift ? defaultShift.nameBangla : '',
        targetAccountId: defaultAccount ? defaultAccount.id : '',
      }));
    }
  }, [classes, sections, sessions, shifts, accounts]);

  // Update numbers when class or section changes
  const fetchNextNumbers = async () => {
    try {
      const res = await api.getNextAdmissionNumbers(formData.classId, formData.sectionId);
      if (res.success && res.data) {
        setFormData((prev: AdmissionFormData) => ({
          ...prev,
          rollNo: res.data.nextRoll,
          formNumber: res.data.formNumber,
          admissionNo: res.data.admissionNo,
          dakhilaNo: res.data.studentIdCardNo,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (formData.classId) {
      fetchNextNumbers();
    }
  }, [formData.classId, formData.sectionId]);

  const updateFormData = (fields: Partial<AdmissionFormData>) => {
    setFormData((prev: AdmissionFormData) => ({ ...prev, ...fields }));
    // Clear field-specific errors
    if (Object.keys(fields).length > 0) {
      const fieldName = Object.keys(fields)[0];
      if (errors[fieldName]) {
        setErrors((prev: Record<string, string>) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    }
  };

  // Step Validation
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.nameBangla.trim()) newErrors.nameBangla = 'শিক্ষার্থীর বাংলা নাম আবশ্যক';
      if (!formData.nameEnglish.trim()) newErrors.nameEnglish = 'শিক্ষার্থীর ইংরেজি নাম আবশ্যক';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'জন্ম তারিখ প্রদান করুন';
    } else if (stepNumber === 2) {
      if (!formData.guardianName.trim()) newErrors.guardianName = 'অভিভাবকের নাম আবশ্যক';
      if (!formData.guardianMobile.trim()) newErrors.guardianMobile = 'অভিভাবকের মোবাইল নম্বর আবশ্যক';
    } else if (stepNumber === 3) {
      if (!formData.classId) newErrors.classId = 'শ্রেণি নির্বাচন করুন';
      if (!formData.sectionId) newErrors.sectionId = 'শাখা নির্বাচন করুন';
      if (!formData.rollNo || formData.rollNo < 1) newErrors.rollNo = 'সঠিক রোল নম্বর দিন';
    } else if (stepNumber === 4) {
      if (!formData.presentDistrict.trim()) newErrors.presentDistrict = 'জেলা আবশ্যক';
      if (!formData.presentThana.trim()) newErrors.presentThana = 'থানা আবশ্যক';
      if (!formData.presentAddress.trim()) newErrors.presentAddress = 'বিস্তারিত ঠিকানা আবশ্যক';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 8) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await api.processAdmission(formData);
      if (res.success && res.data) {
        onAdmissionSuccess(res.data);
      } else {
        setSubmissionError(res.error?.message || 'ভর্তি প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      setSubmissionError(err.message || 'ডাটাবেজ ট্রানজেকশনে অপ্রত্যাশিত সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Stepper Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
              ধাপ {toBengaliNumerals(currentStep)} / {toBengaliNumerals(STEPS.length)}
            </span>
            <h2 className="text-base font-bold text-[var(--color-text-main)]">
              {STEPS[currentStep - 1].title} ({STEPS[currentStep - 1].en})
            </h2>
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
            ফরম: <span className="font-mono text-[var(--color-text-main)]">{formData.formNumber}</span>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isDone || validateStep(currentStep)) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm ring-2 ring-[var(--color-primary)]/20'
                    : isDone
                    ? 'border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{toBengaliNumerals(step.id)}</span>
                </div>
                <span className="text-[10px] font-medium truncate w-full">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 flex items-start gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold">ভর্তি প্রক্রিয়ায় সমস্যা হয়েছে:</p>
            <p className="mt-0.5">{submissionError}</p>
          </div>
        </div>
      )}

      {/* Step Form Container */}
      <div className="p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-sm">
        {currentStep === 1 && (
          <Step1StudentInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <Step2GuardianInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <Step3AcademicInfo
            formData={formData}
            updateFormData={updateFormData}
            classes={classes}
            sections={sections}
            sessions={sessions}
            shifts={shifts}
            errors={errors}
            onAutoSuggestRoll={fetchNextNumbers}
          />
        )}

        {currentStep === 4 && (
          <Step4Address
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        )}

        {currentStep === 5 && (
          <Step5Documents
            formData={formData}
            updateFormData={updateFormData}
          />
        )}

        {currentStep === 6 && (
          <Step6Photo
            formData={formData}
            updateFormData={updateFormData}
          />
        )}

        {currentStep === 7 && (
          <Step7AdmissionFee
            formData={formData}
            updateFormData={updateFormData}
            accounts={accounts}
            funds={funds}
          />
        )}

        {currentStep === 8 && (
          <Step8Confirmation
            formData={formData}
            updateFormData={updateFormData}
            onGoToStep={(s) => setCurrentStep(s)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Stepper Footer Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 mt-6 border-t border-[var(--color-border-subtle)]">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                পূর্ববর্তী ধাপ
              </Button>
            ) : (
              onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  className="w-full sm:w-auto"
                >
                  বাতিল করুন
                </Button>
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 8 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold w-full sm:w-auto"
              >
                পরবর্তী ধাপ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-md w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ডাটাবেজে ভর্তি সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    চূড়ান্ত ভর্তি সম্পন্ন করুন (Complete Admission)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
