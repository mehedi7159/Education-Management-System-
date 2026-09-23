import {
  Tenant,
  MadrasahType,
  SubscriptionPlan,
  DepartmentType,
  AcademicSession,
  ShiftEntity,
  DepartmentConfig,
  ClassEntity,
  SectionEntity,
  SubjectEntity,
  GradingSystemConfig,
  FeeTypeEntity,
  PaymentMethodConfig,
  FundEntity,
  AccountEntity,
  PaymentMethod,
  InstitutionFullConfig,
} from '../types';
import { TenantRepository, getRawStoreForAuditing } from './tenantRepository';
import { logSecurityEvent } from './tenantContext';

export interface InstitutionValidationError {
  field: string;
  messageBn: string;
}

export interface InstitutionSetupPayload {
  // Identity & Profile
  nameEnglish: string;
  nameBangla: string;
  nameArabic?: string;
  madrasahType: MadrasahType;
  logoUrl?: string;
  address: string;
  district: string;
  thana?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  website?: string;
  eiinCode?: string;
  boardCode?: string;
  registrationNo?: string;
  establishedYear: number;
  affiliation?: string;

  // Academic Setup
  sessionName: string;
  sessionStartDate: string;
  sessionEndDate: string;
  shifts: Omit<ShiftEntity, 'id' | 'tenantId'>[];
  departments: Omit<DepartmentConfig, 'id' | 'tenantId'>[];
  classes: Omit<ClassEntity, 'id' | 'tenantId'>[];
  sections: Omit<SectionEntity, 'id' | 'tenantId' | 'class'>[];
  subjects: Omit<SubjectEntity, 'id' | 'tenantId'>[];

  // Grading & Assessment
  gradingSystem: GradingSystemConfig;

  // Financial Configuration
  feeTypes: Omit<FeeTypeEntity, 'id' | 'tenantId'>[];
  funds: Omit<FundEntity, 'id' | 'tenantId'>[];
  paymentMethods: Omit<PaymentMethodConfig, 'id' | 'tenantId'>[];
}

// Pre-defined templates for rapid, authentic setup
export const INSTITUTION_TEMPLATES: Record<
  MadrasahType,
  {
    labelBn: string;
    descriptionBn: string;
    defaultData: Partial<InstitutionSetupPayload>;
  }
> = {
  [MadrasahType.QAWMI]: {
    labelBn: 'কওমি জামেয়া মাদ্রাসা (দরসে নেজামী)',
    descriptionBn: 'বেফাক ও আল-হাইআতুল উলয়া মানসম্মত পূর্ণাঙ্গ কওমি সিলেবাস, মারহালা গ্রেডিং ও লিল্লাহ ফান্ড',
    defaultData: {
      madrasahType: MadrasahType.QAWMI,
      affiliation: 'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ (বেফাক)',
      sessionName: '১৪৪৬-১৪৪৭ হিজরি / ২০২৫-২০২৬ শিক্ষাবর্ষ',
      sessionStartDate: '2025-01-01',
      sessionEndDate: '2025-12-31',
      shifts: [
        {
          nameBangla: 'প্রভাতী শিফট (সকাল)',
          nameEnglish: 'Morning Shift',
          startTime: '07:00',
          endTime: '12:30',
          isResidential: false,
          isActive: true,
        },
        {
          nameBangla: 'আবাসিক / পূর্ণকালীন',
          nameEnglish: 'Residential Full-Time',
          startTime: '06:00',
          endTime: '22:00',
          isResidential: true,
          isActive: true,
        },
      ],
      departments: [
        {
          type: DepartmentType.NURANI,
          nameBangla: 'নূরানী ও নাজেরা বিভাগ',
          nameEnglish: 'Nurani & Nazera Dept',
          nameArabic: 'قسم النورانية والناظرة',
          headName: 'মুফতি ক্বারী হাবিবুল্লাহ',
          isEnabled: true,
        },
        {
          type: DepartmentType.HIFZ,
          nameBangla: 'হিফজুল কুরআন বিভাগ',
          nameEnglish: 'Hifzul Quran Dept',
          nameArabic: 'قسم تحفيظ القرآن الكريم',
          headName: 'হাফেজ ক্বারী সিরাজুল ইসলাম',
          isEnabled: true,
        },
        {
          type: DepartmentType.KITAB,
          nameBangla: 'কিতাব বিভাগ (দরসে নেজামী)',
          nameEnglish: 'Kitab Dept (Dars-e-Nizami)',
          nameArabic: 'قسم الكتب والدرس النظامي',
          headName: 'মাওলানা মাহমুদ হাসান',
          isEnabled: true,
        },
        {
          type: DepartmentType.DAWRA_HADITH,
          nameBangla: 'দাওরায়ে হাদিস (তাকমীল সমমান)',
          nameEnglish: 'Dawra-e Hadith (Masters)',
          nameArabic: 'قسم دورة الحديث الشريف',
          headName: 'মাওলানা মুফতি আব্দুর রহমান',
          isEnabled: true,
        },
        {
          type: DepartmentType.IFTA,
          nameBangla: 'উচ্চতর ইসলামী আইন ও ফতোয়া (ইফতা)',
          nameEnglish: 'Ifta & Islamic Jurisprudence',
          nameArabic: 'قسم الإفتاء والدراسات الإسلامية',
          headName: 'মুফতি এনামুল হক কাসেমী',
          isEnabled: true,
        },
      ],
      classes: [
        { nameBangla: 'নূরানী ১ম শ্রেণি', nameEnglish: 'Nurani Class One', department: DepartmentType.NURANI, orderIndex: 1, totalStudents: 0 },
        { nameBangla: 'নাজেরা কুরআনুল কারীম', nameEnglish: 'Nazera Quran', department: DepartmentType.NURANI, orderIndex: 2, totalStudents: 0 },
        { nameBangla: 'হিফজুল কুরআন খানা', nameEnglish: 'Hifz Department', department: DepartmentType.HIFZ, orderIndex: 3, totalStudents: 0 },
        { nameBangla: 'মীযান ও মুনশাইব (কিতাব ১ম বর্ষ)', nameEnglish: 'Mizan & Munshaib', department: DepartmentType.KITAB, orderIndex: 4, totalStudents: 0 },
        { nameBangla: 'নাহবেমীর (কিতাব ২য় বর্ষ)', nameEnglish: 'Nahbemir', department: DepartmentType.KITAB, orderIndex: 5, totalStudents: 0 },
        { nameBangla: 'হেদায়াতুন্নাহু ও কাফিয়া (৩য় বর্ষ)', nameEnglish: 'Hidayatun Nahu', department: DepartmentType.KITAB, orderIndex: 6, totalStudents: 0 },
        { nameBangla: 'শরহে বেকায়া ও জালালাইন (৪র্থ বর্ষ)', nameEnglish: 'Sharhe Bekaya', department: DepartmentType.KITAB, orderIndex: 7, totalStudents: 0 },
        { nameBangla: 'দাওরায়ে হাদিস (মাস্টার্স)', nameEnglish: 'Dawra-e Hadith (Takmeel)', department: DepartmentType.DAWRA_HADITH, orderIndex: 8, totalStudents: 0 },
      ],
      sections: [
        { classId: '', name: 'শাখা আলিফ (أ)', capacity: 40, roomNumber: '১০১' },
        { classId: '', name: 'শাখা বা (ب)', capacity: 40, roomNumber: '১০২' },
        { classId: '', name: 'শাখা জিম (ج)', capacity: 35, roomNumber: '১০৩' },
      ],
      subjects: [
        { classId: '', nameBangla: 'কুরআনুল কারীম ও তাজবীদ', nameEnglish: 'Quran & Tajweed', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'হাদিস শরীফ ও উসূলে হাদিস', nameEnglish: 'Hadith Studies', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'আল-ফিকহ ও ইসলামী বিধিবিধান', nameEnglish: 'Islamic Fiqh', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'নাহু ও সরফ (আরবি ব্যাকরণ)', nameEnglish: 'Arabic Grammar', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'বাংলা সাহিত্য ও রচনা', nameEnglish: 'Bangla Literature', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'ইংরেজি ও সাধারণ গণিত', nameEnglish: 'English & Math', totalMarks: 100, passMarks: 40 },
      ],
      gradingSystem: {
        systemType: 'QAWMI_MARHALA',
        passMarkPercentage: 33,
        rules: [
          { gradeBangla: 'মুমতাজ (স্টার / অনন্য)', gradeEnglish: 'Mumtaz (Star)', gradeArabic: 'ممتاز', minPercentage: 80, maxPercentage: 100, isPassing: true, remarksBn: 'সর্বোচ্চ মেধা ও গৌরবজনক কৃতিত্ব' },
          { gradeBangla: 'জায়্যিদ জিদ্দান (প্রথম বিভাগ)', gradeEnglish: 'Jayyid Jiddan (1st Div)', gradeArabic: 'جيد جدا', minPercentage: 65, maxPercentage: 79, isPassing: true, remarksBn: 'খুব ভালো ও প্রশংসনীয় ফলাফল' },
          { gradeBangla: 'জায়্যিদ (দ্বিতীয় বিভাগ)', gradeEnglish: 'Jayyid (2nd Div)', gradeArabic: 'جيد', minPercentage: 50, maxPercentage: 64, isPassing: true, remarksBn: 'সন্তোষজনক মান' },
          { gradeBangla: 'মাকবুল (তৃতীয় বিভাগ / পাস)', gradeEnglish: 'Maqbool (Pass)', gradeArabic: 'مقبول', minPercentage: 33, maxPercentage: 49, isPassing: true, remarksBn: 'উত্তীর্ণ' },
          { gradeBangla: 'রাসিব (অকৃতকার্য)', gradeEnglish: 'Rasib (Fail)', gradeArabic: 'راسب', minPercentage: 0, maxPercentage: 32, isPassing: false, remarksBn: 'পুনরায় পরীক্ষার সুপারিশ' },
        ],
      },
      feeTypes: [
        { nameBangla: 'ভর্তি ও সেশন ফি', nameEnglish: 'Admission & Session Fee', code: 'ADM_FEE', defaultAmount: 3000, frequency: 'ONE_TIME', isMandatory: true, description: 'নতুন শিক্ষাবর্ষে ভর্তির এককালীন ফি' },
        { nameBangla: 'মাসিক খোরাকী ও লজিং চার্জ', nameEnglish: 'Monthly Fooding & Boarding', code: 'MONTHLY_MEAL', defaultAmount: 3500, frequency: 'MONTHLY', isMandatory: true, description: 'আবাসিক ছাত্রদের তিন বেলা উন্নত খাবার ও লজিং ফি' },
        { nameBangla: 'মাসিক টিউশন ফি (বেতন)', nameEnglish: 'Monthly Tuition Fee', code: 'MONTHLY_TUITION', defaultAmount: 1200, frequency: 'MONTHLY', isMandatory: true, description: 'মাসিক পাঠদান ফি' },
        { nameBangla: 'সাময়িক ও বার্ষিক পরীক্ষা ফি', nameEnglish: 'Exam Fee', code: 'EXAM_FEE', defaultAmount: 600, frequency: 'PER_EXAM', isMandatory: true, description: 'ত্রৈমাসিক ও বার্ষিক পরীক্ষা ফি' },
        { nameBangla: 'কিতাব ও গ্রন্থাগার ফি', nameEnglish: 'Library Fee', code: 'LIB_FEE', defaultAmount: 500, frequency: 'YEARLY', isMandatory: false, description: 'দরসি কিতাব ও লাইব্রেরি ফান্ড' },
      ],
      funds: [
        { nameBangla: 'সাধারণ অপারেটিং তহবিল', nameEnglish: 'General Fund', currentBalance: 0, isRestricted: false, description: 'দৈনন্দিন ব্যয়, স্টাফদের হাদিয়া ও বিল পরিশোধ' },
        { nameBangla: 'লিল্লাহ বোর্ডিং ও যাকাত তহবিল', nameEnglish: 'Lillah Boarding & Zakat Fund', currentBalance: 0, isRestricted: true, description: 'গরিব ও এতিম ছাত্রদের খাদ্য, চিকিৎসা ও পোশাক সহায়তা' },
        { nameBangla: 'মসজিদ ও নির্মাণ তহবিল', nameEnglish: 'Construction Fund', currentBalance: 0, isRestricted: true, description: 'নতুন ভবন, ক্লাসরুম ও মসজিদ সম্প্রসারণ ফান্ড' },
        { nameBangla: 'শিক্ষক-কর্মচারী কল্যাণ তহবিল', nameEnglish: 'Staff Welfare Fund', currentBalance: 0, isRestricted: true, description: 'আসাতিযায়ে কেরামের আপদকালীন স্বাস্থ্য ও কল্যাণ' },
      ],
      paymentMethods: [
        { methodType: PaymentMethod.CASH, providerName: 'ক্যাশ কাউন্টার (হিসাব শাখা)', accountNumber: 'CASH-COUNTER-01', accountTitle: 'মাদ্রাসা সাধারণ ক্যাশ', instructionsBn: 'মাদ্রাসার হিসাব অফিসে সরাসরি নগদ জমা প্রদান করুন', isActive: true },
        { methodType: PaymentMethod.BKASH, providerName: 'বিকাশ মার্চেন্ট অ্যাকাউন্ট', accountNumber: '01712-000000', accountTitle: 'মাদ্রাসা বিকাশ পে', instructionsBn: 'বিকাশ পেমেন্ট করে ট্রানজেকশন আইডি সংগ্রহ করুন', isActive: true },
        { methodType: PaymentMethod.NAGAD, providerName: 'নগদ মার্চেন্ট পে', accountNumber: '01812-000000', accountTitle: 'মাদ্রাসা নগদ অ্যাকাউন্ট', instructionsBn: 'নগদ মার্চেন্ট পে অপশন ব্যবহার করুন', isActive: true },
        { methodType: PaymentMethod.BANK_TRANSFER, providerName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি', accountNumber: '2050XXXXXXXXXXXXX', accountTitle: 'মাদ্রাসা সাধারণ ফান্ড', branchName: 'লোকাল ব্রাঞ্চ', instructionsBn: 'ব্যাংক ডিপোজিট স্লিপ হিসাব বিভাগে জমা দিন', isActive: true },
      ],
    },
  },

  [MadrasahType.HIFZ]: {
    labelBn: 'তাহফিজুল কুরআন ও নূরানী মাদ্রাসা',
    descriptionBn: 'নাজেরা, তাজবীদ, ৩০ পারা সম্পূর্ণ হিফজ, দৌর ও ক্যালিগ্রাফি ফোকাসড মাদ্রাসা',
    defaultData: {
      madrasahType: MadrasahType.HIFZ,
      sessionName: '২০২৫-২০২৬ হিফজ শিক্ষাবর্ষ',
      sessionStartDate: '2025-01-01',
      sessionEndDate: '2025-12-31',
      shifts: [
        { nameBangla: 'আবাসিক হিফজ শিফট (২৪ ঘণ্টা)', nameEnglish: 'Full-time Hifz Shift', startTime: '04:30', endTime: '22:00', isResidential: true, isActive: true },
        { nameBangla: 'অনাবাসিক ডে শিফট', nameEnglish: 'Day Non-residential Shift', startTime: '08:00', endTime: '16:00', isResidential: false, isActive: true },
      ],
      departments: [
        { type: DepartmentType.NURANI, nameBangla: 'নূরানী কিন্ডারগার্টেন বিভাগ', nameEnglish: 'Nurani Dept', isEnabled: true },
        { type: DepartmentType.NAJERA, nameBangla: 'নাজেরা কুরআনুল কারীম বিভাগ', nameEnglish: 'Nazera Dept', isEnabled: true },
        { type: DepartmentType.HIFZ, nameBangla: 'তাহফিজুল কুরআনুল কারীম (হিফজ খানা)', nameEnglish: 'Tahfeezul Quran Dept', isEnabled: true },
      ],
      classes: [
        { nameBangla: 'নূরানী প্রাক-প্রাথমিক', nameEnglish: 'Nurani Pre-Primary', department: DepartmentType.NURANI, orderIndex: 1 },
        { nameBangla: 'নূরানী ১ম শ্রেণি (আমপারা)', nameEnglish: 'Nurani Class One', department: DepartmentType.NURANI, orderIndex: 2 },
        { nameBangla: 'নাজেরা মশ্ক ও সহীহ তিলাওয়াত', nameEnglish: 'Nazera Mashk', department: DepartmentType.NAJERA, orderIndex: 3 },
        { nameBangla: 'হিফজুল কুরআন (নাজেরা সমাপন)', nameEnglish: 'Hifz (Beginner)', department: DepartmentType.HIFZ, orderIndex: 4 },
        { nameBangla: 'হিফজুল কুরআন (৫ পারা পর্যন্ত)', nameEnglish: 'Hifz (Mid Level)', department: DepartmentType.HIFZ, orderIndex: 5 },
        { nameBangla: 'হিফজুল কুরআন (সম্পূর্ণ ৩০ পারা ও দৌর)', nameEnglish: 'Hifz (Complete & Dawr)', department: DepartmentType.HIFZ, orderIndex: 6 },
      ],
      sections: [
        { classId: '', name: 'মদিনা শাখা', capacity: 30, roomNumber: 'হিজরত-০১' },
        { classId: '', name: 'মক্কা শাখা', capacity: 30, roomNumber: 'হারামাইন-০২' },
      ],
      subjects: [
        { classId: '', nameBangla: 'হিফজুল কুরআন ও দৈনিক সবক', nameEnglish: 'Daily Hifz Sabak', totalMarks: 100, passMarks: 50 },
        { classId: '', nameBangla: 'সবকপারা ও বিগত অংশের দৌর', nameEnglish: 'Sabakpara & Revision', totalMarks: 100, passMarks: 50 },
        { classId: '', nameBangla: 'মাখরাজ, তাজবীদ ও লাহজা', nameEnglish: 'Tajweed & Makhraj', totalMarks: 100, passMarks: 50 },
        { classId: '', nameBangla: 'মাসনুন দুআ, সুন্নাত ও আদব', nameEnglish: 'Dua & Manners', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'বাংলা, ইংরেজি ও গণিত বেসিক', nameEnglish: 'General Basics', totalMarks: 100, passMarks: 40 },
      ],
      gradingSystem: {
        systemType: 'QAWMI_MARHALA',
        passMarkPercentage: 50,
        rules: [
          { gradeBangla: 'মুমতাজ (প্রথম বিভাগ স্টার)', gradeEnglish: 'Mumtaz (Star)', minPercentage: 80, maxPercentage: 100, isPassing: true, remarksBn: 'নিখুঁত হিফজ ও চমৎকার তিলাওয়াত' },
          { gradeBangla: 'জায়্যিদ জিদ্দান (প্রথম বিভাগ)', gradeEnglish: 'Jayyid Jiddan', minPercentage: 65, maxPercentage: 79, isPassing: true, remarksBn: 'চমৎকার সবক ও দৌর' },
          { gradeBangla: 'জায়্যিদ (দ্বিতীয় বিভাগ)', gradeEnglish: 'Jayyid', minPercentage: 50, maxPercentage: 64, isPassing: true, remarksBn: 'সন্তোষজনক' },
          { gradeBangla: 'রাসিব (অনুত্তীর্ণ)', gradeEnglish: 'Rasib (Repeat)', minPercentage: 0, maxPercentage: 49, isPassing: false, remarksBn: 'পুনরায় মশকের নির্দেশ' },
        ],
      },
      feeTypes: [
        { nameBangla: 'নতুন হিফজ ভর্তি ফি', nameEnglish: 'Hifz Admission Fee', code: 'HIFZ_ADM', defaultAmount: 4000, frequency: 'ONE_TIME', isMandatory: true },
        { nameBangla: 'মাসিক খাবার ও লজিং ফি', nameEnglish: 'Monthly Fooding Fee', code: 'HIFZ_MEAL', defaultAmount: 3800, frequency: 'MONTHLY', isMandatory: true },
        { nameBangla: 'মাসিক হিফজ প্রশিক্ষণ ফি', nameEnglish: 'Hifz Tuition Fee', code: 'HIFZ_TUITION', defaultAmount: 1500, frequency: 'MONTHLY', isMandatory: true },
      ],
      funds: [
        { nameBangla: 'হিফজ খাদ্য ও সাধারণ ফান্ড', nameEnglish: 'Hifz Operating Fund', currentBalance: 0, isRestricted: false },
        { nameBangla: 'লিল্লাহ ও হাফেজ সম্মাননা ফান্ড', nameEnglish: 'Hafez Sponsorship Fund', currentBalance: 0, isRestricted: true },
      ],
      paymentMethods: [
        { methodType: PaymentMethod.CASH, providerName: 'ক্যাশ কাউন্টার', accountNumber: 'CASH-01', isActive: true },
        { methodType: PaymentMethod.BKASH, providerName: 'বিকাশ মার্চেন্ট', accountNumber: '01700-000000', isActive: true },
      ],
    },
  },

  [MadrasahType.ALIA]: {
    labelBn: 'আলিয়া ও দাখিল মাদ্রাসা (বোর্ড অনুমোদিত)',
    descriptionBn: 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড অনুমোদিত ইবতেদায়ী, দাখিল ও আলিম স্তরের সমন্বিত শিক্ষা',
    defaultData: {
      madrasahType: MadrasahType.ALIA,
      affiliation: 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড, ঢাকা',
      sessionName: '২০২৫-২০২৬ শিক্ষাবর্ষ',
      sessionStartDate: '2025-01-01',
      sessionEndDate: '2025-12-31',
      shifts: [
        { nameBangla: 'প্রভাতী শিফট', nameEnglish: 'Morning Shift', startTime: '07:30', endTime: '12:00', isResidential: false, isActive: true },
        { nameBangla: 'দিবা শিফট', nameEnglish: 'Day Shift', startTime: '12:15', endTime: '17:00', isResidential: false, isActive: true },
      ],
      departments: [
        { type: DepartmentType.GENERAL, nameBangla: 'ইবতেদায়ী শাখা (১ম-৫ম)', nameEnglish: 'Ebtedayee Division', isEnabled: true },
        { type: DepartmentType.DAKHIL, nameBangla: 'দাখিল শাখা (৬ষ্ঠ-১০ম)', nameEnglish: 'Dakhil Division', isEnabled: true },
      ],
      classes: [
        { nameBangla: '১ম শ্রেণি (ইবতেদায়ী)', nameEnglish: 'Class 1 (Ebtedayee)', department: DepartmentType.GENERAL, orderIndex: 1 },
        { nameBangla: '৫ম শ্রেণি (ইবতেদায়ী সমাপনী)', nameEnglish: 'Class 5', department: DepartmentType.GENERAL, orderIndex: 2 },
        { nameBangla: '৬ষ্ঠ শ্রেণি (দাখিল)', nameEnglish: 'Class 6 (Dakhil)', department: DepartmentType.DAKHIL, orderIndex: 3 },
        { nameBangla: '৯ম শ্রেণি (দাখিল বিজ্ঞান ও সাধারণ)', nameEnglish: 'Class 9', department: DepartmentType.DAKHIL, orderIndex: 4 },
        { nameBangla: '১০ম শ্রেণি (দাখিল পরীক্ষার্থী)', nameEnglish: 'Class 10 (Dakhil Candidate)', department: DepartmentType.DAKHIL, orderIndex: 5 },
      ],
      sections: [
        { classId: '', name: 'শাখা ক (গোলাপ)', capacity: 45, roomNumber: '১০১' },
        { classId: '', name: 'শাখা খ (শাপলা)', capacity: 45, roomNumber: '১০২' },
      ],
      subjects: [
        { classId: '', nameBangla: 'কুরআন মাজীদ ও তাজবীদ', nameEnglish: 'Quran Majid', totalMarks: 100, passMarks: 33 },
        { classId: '', nameBangla: 'হাদিস শরীফ ও ফিকহ', nameEnglish: 'Hadith & Fiqh', totalMarks: 100, passMarks: 33 },
        { classId: '', nameBangla: 'বাংলা সাহিত্য ও সহপাঠ', nameEnglish: 'Bangla', totalMarks: 100, passMarks: 33 },
        { classId: '', nameBangla: 'ইংরেজি ১ম ও ২য় পত্র', nameEnglish: 'English', totalMarks: 100, passMarks: 33 },
        { classId: '', nameBangla: 'গণিত ও উচ্চতর গণিত', nameEnglish: 'Mathematics', totalMarks: 100, passMarks: 33 },
        { classId: '', nameBangla: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameEnglish: 'ICT', totalMarks: 50, passMarks: 17 },
      ],
      gradingSystem: {
        systemType: 'ALIA_GPA',
        passMarkPercentage: 33,
        rules: [
          { gradeBangla: 'A+ (জিপিএ ৫.০০)', gradeEnglish: 'A+ (GPA 5.00)', gpaPoint: 5.0, minPercentage: 80, maxPercentage: 100, isPassing: true, remarksBn: 'অসাধারণ ফলাফল' },
          { gradeBangla: 'A (জিপিএ ৪.০০)', gradeEnglish: 'A (GPA 4.00)', gpaPoint: 4.0, minPercentage: 70, maxPercentage: 79, isPassing: true, remarksBn: 'উত্তম' },
          { gradeBangla: 'A- (জিপিএ ৩.৫০)', gradeEnglish: 'A- (GPA 3.50)', gpaPoint: 3.5, minPercentage: 60, maxPercentage: 69, isPassing: true, remarksBn: 'ভালো' },
          { gradeBangla: 'B (জিপিএ ৩.০০)', gradeEnglish: 'B (GPA 3.00)', gpaPoint: 3.0, minPercentage: 50, maxPercentage: 59, isPassing: true, remarksBn: 'সন্তোষজনক' },
          { gradeBangla: 'C (জিপিএ ২.০০)', gradeEnglish: 'C (GPA 2.00)', gpaPoint: 2.0, minPercentage: 40, maxPercentage: 49, isPassing: true, remarksBn: 'চলতি মান' },
          { gradeBangla: 'D (জিপিএ ১.০০)', gradeEnglish: 'D (GPA 1.00)', gpaPoint: 1.0, minPercentage: 33, maxPercentage: 39, isPassing: true, remarksBn: 'পাস' },
          { gradeBangla: 'F (জিপিএ ০.০০ / ফেল)', gradeEnglish: 'F (GPA 0.00)', gpaPoint: 0.0, minPercentage: 0, maxPercentage: 32, isPassing: false, remarksBn: 'অনুত্তীর্ণ' },
        ],
      },
      feeTypes: [
        { nameBangla: 'বাৎসরিক সেশন ফি', nameEnglish: 'Session Fee', code: 'SESSION_FEE', defaultAmount: 2500, frequency: 'YEARLY', isMandatory: true },
        { nameBangla: 'মাসিক টিউশন ফি', nameEnglish: 'Tuition Fee', code: 'TUITION', defaultAmount: 800, frequency: 'MONTHLY', isMandatory: true },
        { nameBangla: 'টার্ম ও বোর্ড মডেল টেস্ট ফি', nameEnglish: 'Exam Fee', code: 'EXAM_FEE', defaultAmount: 500, frequency: 'PER_EXAM', isMandatory: true },
      ],
      funds: [
        { nameBangla: 'মাদ্রাসা সাধারণ ও উন্নয়ন তহবিল', nameEnglish: 'General & Development Fund', currentBalance: 0, isRestricted: false },
        { nameBangla: 'দরিদ্র শিক্ষার্থী কল্যাণ ও উপবৃত্তি', nameEnglish: 'Stipend & Welfare Fund', currentBalance: 0, isRestricted: true },
      ],
      paymentMethods: [
        { methodType: PaymentMethod.CASH, providerName: 'মাদ্রাসা ক্যাশ শাখা', accountNumber: 'CASH-01', isActive: true },
        { methodType: PaymentMethod.BKASH, providerName: 'বিকাশ পেমেন্ট গেটওয়ে', accountNumber: '01800-000000', isActive: true },
        { methodType: PaymentMethod.BANK_TRANSFER, providerName: 'সোনালী ব্যাংক পিএলসি', accountNumber: '0011XXXXXXXXXX', isActive: true },
      ],
    },
  },

  [MadrasahType.CADET]: {
    labelBn: 'ইসলামিক ক্যাডেট মাদ্রাসা',
    descriptionBn: 'ইংরেজি ও সাধারণ শিক্ষা, হিফজ এবং মিলিটারি ডিসিপ্লিন সমন্বিত ক্যাডেট ব্যবস্থা',
    defaultData: {
      madrasahType: MadrasahType.CADET,
      sessionName: '২০২৫-২০২৬ ক্যাডেট সেশন',
      sessionStartDate: '2025-01-01',
      sessionEndDate: '2025-12-31',
      shifts: [
        { nameBangla: 'ক্যাডেট সার্বক্ষণিক শিফট', nameEnglish: 'Cadet Residential Shift', startTime: '05:00', endTime: '22:00', isResidential: true, isActive: true },
      ],
      departments: [
        { type: DepartmentType.GENERAL, nameBangla: 'ক্যাডেট একাডেমিক শাখা', nameEnglish: 'Cadet Academic Dept', isEnabled: true },
      ],
      classes: [
        { nameBangla: 'ক্যাডেট ক্লাস সিক্স (৬ষ্ঠ)', nameEnglish: 'Cadet Class 6', department: DepartmentType.GENERAL, orderIndex: 1 },
        { nameBangla: 'ক্যাডেট ক্লাস সেভেন (৭ম)', nameEnglish: 'Cadet Class 7', department: DepartmentType.GENERAL, orderIndex: 2 },
        { nameBangla: 'ক্যাডেট ক্লাস এইট (৮ম)', nameEnglish: 'Cadet Class 8', department: DepartmentType.GENERAL, orderIndex: 3 },
      ],
      sections: [
        { classId: '', name: 'আল-ফাতিহ স্কোয়াড', capacity: 30, roomNumber: 'ক্যাডেট-০১' },
        { classId: '', name: 'তারেক বিন জিয়াদ স্কোয়াড', capacity: 30, roomNumber: 'ক্যাডেট-০২' },
      ],
      subjects: [
        { classId: '', nameBangla: 'কুরআন ও ইসলামিক স্টাডিজ', nameEnglish: 'Quran & Islamic Studies', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'ইংলিশ ল্যাঙ্গুয়েজ ও স্পোকেন', nameEnglish: 'English & Spoken', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'ম্যাথ ও জেনারেল সায়েন্স', nameEnglish: 'Math & Science', totalMarks: 100, passMarks: 40 },
      ],
      gradingSystem: {
        systemType: 'ALIA_GPA',
        passMarkPercentage: 40,
        rules: [
          { gradeBangla: 'A+ (অনন্য কৃতিত্ব)', gradeEnglish: 'A+ (Star)', gpaPoint: 5.0, minPercentage: 80, maxPercentage: 100, isPassing: true },
          { gradeBangla: 'A (উত্তম)', gradeEnglish: 'A (Excellent)', gpaPoint: 4.0, minPercentage: 70, maxPercentage: 79, isPassing: true },
          { gradeBangla: 'B (সন্তোষজনক)', gradeEnglish: 'B (Good)', gpaPoint: 3.0, minPercentage: 50, maxPercentage: 69, isPassing: true },
          { gradeBangla: 'F (ফেল)', gradeEnglish: 'F (Fail)', gpaPoint: 0.0, minPercentage: 0, maxPercentage: 39, isPassing: false },
        ],
      },
      feeTypes: [
        { nameBangla: 'ক্যাডেট ভর্তি ও ইউনিফর্ম ফি', nameEnglish: 'Cadet Admission & Uniform', code: 'CADET_ADM', defaultAmount: 15000, frequency: 'ONE_TIME', isMandatory: true },
        { nameBangla: 'ক্যাডেট সমন্বিত মাসিক প্যাকেজ', nameEnglish: 'Monthly Package', code: 'CADET_MONTHLY', defaultAmount: 12000, frequency: 'MONTHLY', isMandatory: true },
      ],
      funds: [
        { nameBangla: 'ক্যাডেট উন্নয়ন ও অপারেটিং ফান্ড', nameEnglish: 'Cadet Fund', currentBalance: 0, isRestricted: false },
      ],
      paymentMethods: [
        { methodType: PaymentMethod.BKASH, providerName: 'বিকাশ গেটওয়ে', accountNumber: '01812-987654', isActive: true },
        { methodType: PaymentMethod.BANK_TRANSFER, providerName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি', accountNumber: '2050XXXXXXXXXXXXX', isActive: true },
      ],
    },
  },

  [MadrasahType.NURANI]: {
    labelBn: 'নূরানী ও কিন্ডারগার্টেন মাদ্রাসা',
    descriptionBn: 'নূরানী বোর্ড পদ্ধতি, প্রাথমিক কুরআন, বাংলা, ইংরেজি ও গণিত শিক্ষা',
    defaultData: {
      madrasahType: MadrasahType.NURANI,
      sessionName: '২০২৫-২০২৬ শিক্ষাবর্ষ',
      sessionStartDate: '2025-01-01',
      sessionEndDate: '2025-12-31',
      shifts: [
        { nameBangla: 'প্রভাতী শিফট', nameEnglish: 'Morning Shift', startTime: '07:30', endTime: '12:00', isResidential: false, isActive: true },
      ],
      departments: [
        { type: DepartmentType.NURANI, nameBangla: 'নূরানী বিভাগ', nameEnglish: 'Nurani Dept', isEnabled: true },
      ],
      classes: [
        { nameBangla: 'নূরানী শিশু শ্রেণি', nameEnglish: 'Nurani Play', department: DepartmentType.NURANI, orderIndex: 1 },
        { nameBangla: 'নূরানী ১ম শ্রেণি', nameEnglish: 'Nurani Class 1', department: DepartmentType.NURANI, orderIndex: 2 },
        { nameBangla: 'নূরানী ২য় শ্রেণি', nameEnglish: 'Nurani Class 2', department: DepartmentType.NURANI, orderIndex: 3 },
        { nameBangla: 'নূরানী ৩য় শ্রেণি', nameEnglish: 'Nurani Class 3', department: DepartmentType.NURANI, orderIndex: 4 },
      ],
      sections: [{ classId: '', name: 'শাখা ক', capacity: 35, roomNumber: '১০১' }],
      subjects: [
        { classId: '', nameBangla: 'কুরআন মাজীদ ও আমপারা', nameEnglish: 'Quran Majid', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'বাংলা ও সুন্দর হাতের লেখা', nameEnglish: 'Bangla', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'ইংরেজি ও সাধারণ গণিত', nameEnglish: 'English & Math', totalMarks: 100, passMarks: 40 },
      ],
      gradingSystem: {
        systemType: 'QAWMI_MARHALA',
        passMarkPercentage: 40,
        rules: [
          { gradeBangla: 'মুমতাজ (স্টার)', gradeEnglish: 'Mumtaz', minPercentage: 80, maxPercentage: 100, isPassing: true },
          { gradeBangla: 'জায়্যিদ জিদ্দান', gradeEnglish: 'Jayyid Jiddan', minPercentage: 65, maxPercentage: 79, isPassing: true },
          { gradeBangla: 'জায়্যিদ', gradeEnglish: 'Jayyid', minPercentage: 50, maxPercentage: 64, isPassing: true },
          { gradeBangla: 'মাকবুল', gradeEnglish: 'Maqbool', minPercentage: 40, maxPercentage: 49, isPassing: true },
          { gradeBangla: 'রাসিব', gradeEnglish: 'Rasib', minPercentage: 0, maxPercentage: 39, isPassing: false },
        ],
      },
      feeTypes: [
        { nameBangla: 'ভর্তি ফি', nameEnglish: 'Admission Fee', code: 'ADM', defaultAmount: 2000, frequency: 'ONE_TIME', isMandatory: true },
        { nameBangla: 'মাসিক টিউশন ফি', nameEnglish: 'Tuition', code: 'TUITION', defaultAmount: 800, frequency: 'MONTHLY', isMandatory: true },
      ],
      funds: [{ nameBangla: 'সাধারণ তহবিল', nameEnglish: 'General Fund', currentBalance: 0, isRestricted: false }],
      paymentMethods: [{ methodType: PaymentMethod.CASH, providerName: 'ক্যাশ কাউন্টার', accountNumber: 'CASH', isActive: true }],
    },
  },

  [MadrasahType.COMBINED]: {
    labelBn: 'কম্বাইন্ড / সমন্বিত মাদ্রাসা',
    descriptionBn: 'হিফজ, কিতাব এবং জাতীয় কারিকুলাম সমন্বিত মাদ্রাসা কাঠামো',
    defaultData: {
      madrasahType: MadrasahType.COMBINED,
      sessionName: '২০২৫-২০২৬ শিক্ষাবর্ষ',
      sessionStartDate: '2025-01-01',
      sessionEndDate: '2025-12-31',
      shifts: [
        { nameBangla: 'দিবা শিফট', nameEnglish: 'Day Shift', startTime: '08:00', endTime: '16:00', isResidential: false, isActive: true },
        { nameBangla: 'আবাসিক শিফট', nameEnglish: 'Residential Shift', startTime: '06:00', endTime: '21:30', isResidential: true, isActive: true },
      ],
      departments: [
        { type: DepartmentType.HIFZ, nameBangla: 'হিফজ বিভাগ', nameEnglish: 'Hifz Dept', isEnabled: true },
        { type: DepartmentType.GENERAL, nameBangla: 'জেনারেল কারিকুলাম', nameEnglish: 'General Dept', isEnabled: true },
      ],
      classes: [
        { nameBangla: 'হিফজ শ্রেণি', nameEnglish: 'Hifz Class', department: DepartmentType.HIFZ, orderIndex: 1 },
        { nameBangla: '৬ষ্ঠ শ্রেণি (সমন্বিত)', nameEnglish: 'Class 6', department: DepartmentType.GENERAL, orderIndex: 2 },
      ],
      sections: [{ classId: '', name: 'শাখা ক', capacity: 35 }],
      subjects: [
        { classId: '', nameBangla: 'কুরআন ও তাজবীদ', nameEnglish: 'Quran', totalMarks: 100, passMarks: 40 },
        { classId: '', nameBangla: 'বাংলা ও ইংরেজি', nameEnglish: 'Bangla & English', totalMarks: 100, passMarks: 40 },
      ],
      gradingSystem: {
        systemType: 'QAWMI_MARHALA',
        passMarkPercentage: 40,
        rules: [
          { gradeBangla: 'মুমতাজ (স্টার)', gradeEnglish: 'Mumtaz', minPercentage: 80, maxPercentage: 100, isPassing: true },
          { gradeBangla: 'জায়্যিদ জিদ্দান', gradeEnglish: 'Jayyid Jiddan', minPercentage: 65, maxPercentage: 79, isPassing: true },
          { gradeBangla: 'মাকবুল', gradeEnglish: 'Maqbool', minPercentage: 40, maxPercentage: 64, isPassing: true },
          { gradeBangla: 'রাসিব', gradeEnglish: 'Rasib', minPercentage: 0, maxPercentage: 39, isPassing: false },
        ],
      },
      feeTypes: [
        { nameBangla: 'ভর্তি ফি', nameEnglish: 'Admission Fee', code: 'ADM', defaultAmount: 3000, frequency: 'ONE_TIME', isMandatory: true },
        { nameBangla: 'মাসিক ফি', nameEnglish: 'Monthly Fee', code: 'MONTHLY', defaultAmount: 2000, frequency: 'MONTHLY', isMandatory: true },
      ],
      funds: [{ nameBangla: 'সাধারণ তহবিল', nameEnglish: 'General Fund', currentBalance: 0, isRestricted: false }],
      paymentMethods: [{ methodType: PaymentMethod.CASH, providerName: 'ক্যাশ কাউন্টার', accountNumber: 'CASH', isActive: true }],
    },
  },
};

const TENANTS_STORAGE_KEY = 'madrasah_saas_tenants_store';
const GRADING_STORAGE_PREFIX = 'madrasah_saas_grading_';

export class InstitutionService {
  /**
   * Validates all required fields for a new institution setup
   */
  public static validateSetupPayload(payload: Partial<InstitutionSetupPayload>): InstitutionValidationError[] {
    const errors: InstitutionValidationError[] = [];

    // Basic Information
    if (!payload.nameBangla?.trim()) {
      errors.push({ field: 'nameBangla', messageBn: 'প্রতিষ্ঠানের বাংলা নাম আবশ্যক' });
    }
    if (!payload.nameEnglish?.trim()) {
      errors.push({ field: 'nameEnglish', messageBn: 'প্রতিষ্ঠানের ইংরেজি নাম আবশ্যক' });
    }
    if (!payload.madrasahType) {
      errors.push({ field: 'madrasahType', messageBn: 'মাদ্রাসার ধরন নির্বাচন করুন' });
    }
    if (!payload.address?.trim()) {
      errors.push({ field: 'address', messageBn: 'প্রতিষ্ঠানের বিস্তারিত ঠিকানা লিখুন' });
    }
    if (!payload.district?.trim()) {
      errors.push({ field: 'district', messageBn: 'জেলা নির্বাচন বা ইনপুট আবশ্যক' });
    }
    if (!payload.phone?.trim()) {
      errors.push({ field: 'phone', messageBn: 'মোবাইল নম্বর আবশ্যক' });
    } else {
      const cleanPhone = payload.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 11 || (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('8801'))) {
        errors.push({ field: 'phone', messageBn: 'সঠিক বাংলাদেশী মোবাইল নম্বর (যেমন: 017XXXXXXXX) প্রদান করুন' });
      }
    }

    if (payload.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email.trim())) {
        errors.push({ field: 'email', messageBn: 'সঠিক ইমেইল ঠিকানা প্রদান করুন' });
      }
    }

    // Academic Structure
    if (!payload.sessionName?.trim()) {
      errors.push({ field: 'sessionName', messageBn: 'শিক্ষাবর্ষের নাম আবশ্যক (যেমন: ১৪৪৬-১৪৪৭ হি. / ২০২৫-২০২৬)' });
    }
    if (!payload.sessionStartDate) {
      errors.push({ field: 'sessionStartDate', messageBn: 'শিক্ষাবর্ষ শুরুর তারিখ আবশ্যক' });
    }
    if (!payload.sessionEndDate) {
      errors.push({ field: 'sessionEndDate', messageBn: 'শিক্ষাবর্ষ সমাপ্তির তারিখ আবশ্যক' });
    }

    if (!payload.classes || payload.classes.length === 0) {
      errors.push({ field: 'classes', messageBn: 'অন্তত একটি জামাত বা শ্রেণি যুক্ত করুন' });
    }

    if (!payload.sections || payload.sections.length === 0) {
      errors.push({ field: 'sections', messageBn: 'অন্তত একটি শাখা (সেকশন) যুক্ত করুন' });
    }

    if (!payload.shifts || payload.shifts.length === 0) {
      errors.push({ field: 'shifts', messageBn: 'অন্তত একটি শিফট যুক্ত করুন' });
    }

    if (!payload.subjects || payload.subjects.length === 0) {
      errors.push({ field: 'subjects', messageBn: 'অন্তত একটি বিষয় বা কিতাব যুক্ত করুন' });
    }

    // Financial
    if (!payload.feeTypes || payload.feeTypes.length === 0) {
      errors.push({ field: 'feeTypes', messageBn: 'অন্তত একটি ফি-এর খাত যুক্ত করুন' });
    }

    if (!payload.funds || payload.funds.length === 0) {
      errors.push({ field: 'funds', messageBn: 'অন্তত একটি আর্থিক তহবিল যুক্ত করুন' });
    }

    if (!payload.paymentMethods || payload.paymentMethods.length === 0) {
      errors.push({ field: 'paymentMethods', messageBn: 'অন্তত একটি পেমেন্ট পদ্ধতি যুক্ত করুন' });
    }

    return errors;
  }

  /**
   * Retrieves full configuration for an institution
   */
  public static async getTenantConfig(tenant: Tenant): Promise<InstitutionFullConfig> {
    const rawDb = getRawStoreForAuditing();
    const tenantId = tenant.id;

    const [classes, sections, shifts, subjects, feeTypes, paymentMethods, funds, rawSessions, departments] =
      await Promise.all([
        TenantRepository.findMany('classes', undefined, tenantId),
        TenantRepository.findMany('sections', undefined, tenantId),
        TenantRepository.findMany('shifts', undefined, tenantId),
        TenantRepository.findMany('subjects', undefined, tenantId),
        TenantRepository.findMany('feeTypes', undefined, tenantId),
        TenantRepository.findMany('paymentMethods', undefined, tenantId),
        TenantRepository.findMany('funds', undefined, tenantId),
        TenantRepository.findMany('academicSessions', undefined, tenantId),
        TenantRepository.findMany('departments', undefined, tenantId),
      ]);

    // Retrieve custom grading system from storage if stored
    let gradingSystem: GradingSystemConfig;
    try {
      const stored = localStorage.getItem(`${GRADING_STORAGE_PREFIX}${tenantId}`);
      if (stored) {
        gradingSystem = JSON.parse(stored);
      } else {
        // Default based on type
        gradingSystem =
          INSTITUTION_TEMPLATES[tenant.madrasahType]?.defaultData.gradingSystem ||
          INSTITUTION_TEMPLATES[MadrasahType.QAWMI].defaultData.gradingSystem!;
      }
    } catch {
      gradingSystem = INSTITUTION_TEMPLATES[MadrasahType.QAWMI].defaultData.gradingSystem!;
    }

    // Default session if none found
    let sessions = rawSessions;
    if (!sessions || sessions.length === 0) {
      sessions = [
        {
          id: `ses-${tenantId}`,
          tenantId,
          name: '১৪৪৬-১৪৪৭ হিজরি / ২০২৫-২০২৬ শিক্ষাবর্ষ',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          isCurrent: true,
        },
      ];
    }

    return {
      tenant,
      sessions,
      activeSessionId: sessions.find((s) => s.isCurrent)?.id || sessions[0].id,
      departments: departments || [],
      classes: classes || [],
      sections: sections || [],
      shifts: shifts || [],
      subjects: subjects || [],
      gradingSystem,
      feeTypes: feeTypes || [],
      funds: funds || [],
      paymentMethods: paymentMethods || [],
    };
  }

  /**
   * Saves updates to an existing institution's full configuration
   */
  public static async updateInstitutionConfig(
    tenantId: string,
    updates: Partial<InstitutionFullConfig>
  ): Promise<boolean> {
    const rawDb = getRawStoreForAuditing();

    if (updates.gradingSystem) {
      try {
        localStorage.setItem(`${GRADING_STORAGE_PREFIX}${tenantId}`, JSON.stringify(updates.gradingSystem));
      } catch (e) {
        console.error('Failed to store grading config', e);
      }
    }

    if (updates.classes) {
      rawDb.classes = rawDb.classes.filter((c) => c.tenantId !== tenantId).concat(updates.classes);
    }
    if (updates.sections) {
      rawDb.sections = rawDb.sections.filter((s) => s.tenantId !== tenantId).concat(updates.sections);
    }
    if (updates.shifts) {
      rawDb.shifts = rawDb.shifts.filter((s) => s.tenantId !== tenantId).concat(updates.shifts);
    }
    if (updates.subjects) {
      rawDb.subjects = rawDb.subjects.filter((s) => s.tenantId !== tenantId).concat(updates.subjects);
    }
    if (updates.feeTypes) {
      rawDb.feeTypes = rawDb.feeTypes.filter((f) => f.tenantId !== tenantId).concat(updates.feeTypes);
    }
    if (updates.paymentMethods) {
      rawDb.paymentMethods = rawDb.paymentMethods.filter((p) => p.tenantId !== tenantId).concat(updates.paymentMethods);
    }
    if (updates.funds) {
      rawDb.funds = rawDb.funds.filter((f) => f.tenantId !== tenantId).concat(updates.funds);
    }
    if (updates.departments) {
      rawDb.departments = rawDb.departments.filter((d) => d.tenantId !== tenantId).concat(updates.departments);
    }

    logSecurityEvent('INSTITUTION_CONFIG_UPDATE', `config:${tenantId}`, tenantId, 'ALLOWED', 'Updated institution configuration');
    return true;
  }

  /**
   * Executes the Complete Setup Wizard for a new institution.
   * Generates a fully functional, usable tenant with row-level isolated collections.
   */
  public static async createInstitutionWithWizard(
    payload: InstitutionSetupPayload
  ): Promise<{ tenant: Tenant; config: InstitutionFullConfig }> {
    // 1. Strict Validation
    const validationErrors = this.validateSetupPayload(payload);
    if (validationErrors.length > 0) {
      const err = new Error(validationErrors[0].messageBn);
      (err as any).validationErrors = validationErrors;
      throw err;
    }

    // 2. Generate unique tenant ID and unique code
    const generatedId = `tenant-${Date.now().toString(36)}`;
    const codePrefix = payload.nameEnglish
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .slice(0, 12) || 'MADRASAH';
    const generatedCode = `${codePrefix}_${Math.floor(100 + Math.random() * 900)}`;

    const newTenant: Tenant = {
      id: generatedId,
      code: generatedCode,
      nameBangla: payload.nameBangla.trim(),
      nameEnglish: payload.nameEnglish.trim(),
      nameArabic: payload.nameArabic?.trim() || undefined,
      madrasahType: payload.madrasahType,
      eiinCode: payload.eiinCode?.trim() || undefined,
      boardCode: payload.boardCode?.trim() || undefined,
      registrationNo: payload.registrationNo?.trim() || undefined,
      address: payload.address.trim(),
      district: payload.district.trim(),
      thana: payload.thana?.trim() || undefined,
      phone: payload.phone.trim(),
      altPhone: payload.altPhone?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      website: payload.website?.trim() || undefined,
      logoUrl: payload.logoUrl || undefined,
      planType: SubscriptionPlan.STANDARD,
      isActive: true,
      currency: 'BDT',
      establishedYear: payload.establishedYear || new Date().getFullYear(),
      affiliation: payload.affiliation?.trim() || undefined,
    };

    const rawDb = getRawStoreForAuditing();

    // 3. Academic Session
    const sessionId = `ses-${Date.now()}`;
    const newSession: AcademicSession = {
      id: sessionId,
      tenantId: generatedId,
      name: payload.sessionName.trim(),
      startDate: payload.sessionStartDate,
      endDate: payload.sessionEndDate,
      isCurrent: true,
    };
    rawDb.academicSessions.unshift(newSession);

    // 4. Shifts
    const newShifts: ShiftEntity[] = payload.shifts.map((s, i) => ({
      ...s,
      id: `shf-${generatedId}-${i + 1}`,
      tenantId: generatedId,
    }));
    rawDb.shifts.unshift(...newShifts);

    // 5. Departments
    const newDepartments: DepartmentConfig[] = payload.departments.map((d, i) => ({
      ...d,
      id: `dept-${generatedId}-${i + 1}`,
      tenantId: generatedId,
    }));
    rawDb.departments.unshift(...newDepartments);

    // 6. Classes
    const newClasses: ClassEntity[] = payload.classes.map((c, i) => ({
      ...c,
      id: `cls-${generatedId}-${i + 1}`,
      tenantId: generatedId,
      orderIndex: i + 1,
      totalStudents: 0,
    }));
    rawDb.classes.unshift(...newClasses);

    // 7. Sections (Bind to first class if not bound)
    const primaryClassId = newClasses[0]?.id || `cls-${generatedId}-1`;
    const newSections: SectionEntity[] = payload.sections.map((s, i) => ({
      ...s,
      id: `sec-${generatedId}-${i + 1}`,
      tenantId: generatedId,
      classId: s.classId || primaryClassId,
    }));
    rawDb.sections.unshift(...newSections);

    // 8. Subjects
    const newSubjects: SubjectEntity[] = payload.subjects.map((sub, i) => ({
      ...sub,
      id: `sbj-${generatedId}-${i + 1}`,
      tenantId: generatedId,
      classId: sub.classId || primaryClassId,
    }));
    rawDb.subjects.unshift(...newSubjects);

    // 9. Fee Types
    const newFeeTypes: FeeTypeEntity[] = payload.feeTypes.map((f, i) => ({
      ...f,
      id: `fee-typ-${generatedId}-${i + 1}`,
      tenantId: generatedId,
    }));
    rawDb.feeTypes.unshift(...newFeeTypes);

    // 10. Funds & Initial Accounts
    const newFunds: FundEntity[] = payload.funds.map((fn, i) => ({
      ...fn,
      id: `fund-${generatedId}-${i + 1}`,
      tenantId: generatedId,
    }));
    rawDb.funds.unshift(...newFunds);

    const newAccount: AccountEntity = {
      id: `acc-${generatedId}-1`,
      tenantId: generatedId,
      accountName: `${newTenant.nameBangla} প্রধান হিসাব`,
      accountType: 'CASH',
      balance: 0,
    };
    rawDb.accounts.unshift(newAccount);

    // 11. Payment Methods
    const newPaymentMethods: PaymentMethodConfig[] = payload.paymentMethods.map((p, i) => ({
      ...p,
      id: `pm-${generatedId}-${i + 1}`,
      tenantId: generatedId,
    }));
    rawDb.paymentMethods.unshift(...newPaymentMethods);

    // 12. Save Grading System to storage
    try {
      localStorage.setItem(`${GRADING_STORAGE_PREFIX}${generatedId}`, JSON.stringify(payload.gradingSystem));
    } catch {
      // ignore
    }

    // 13. Persist new Tenant to dynamic tenants store
    this.persistNewTenant(newTenant);

    logSecurityEvent(
      'INSTITUTION_INITIALIZED',
      `tenant:${generatedId}`,
      generatedId,
      'ALLOWED',
      `New institution '${newTenant.nameBangla}' created via Setup Wizard`
    );

    const fullConfig: InstitutionFullConfig = {
      tenant: newTenant,
      sessions: [newSession],
      activeSessionId: sessionId,
      departments: newDepartments,
      classes: newClasses,
      sections: newSections,
      shifts: newShifts,
      subjects: newSubjects,
      gradingSystem: payload.gradingSystem,
      feeTypes: newFeeTypes,
      funds: newFunds,
      paymentMethods: newPaymentMethods,
    };

    return { tenant: newTenant, config: fullConfig };
  }

  /**
   * Helper to persist newly created tenants so they persist across sessions
   */
  public static persistNewTenant(newTenant: Tenant): void {
    try {
      const stored = localStorage.getItem(TENANTS_STORAGE_KEY);
      const list: Tenant[] = stored ? JSON.parse(stored) : [];
      const existingIdx = list.findIndex((t) => t.id === newTenant.id);
      if (existingIdx >= 0) {
        list[existingIdx] = newTenant;
      } else {
        list.push(newTenant);
      }
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist new tenant', e);
    }
  }

  /**
   * Retrieves any extra tenants saved in localStorage
   */
  public static getStoredExtraTenants(): Tenant[] {
    try {
      const stored = localStorage.getItem(TENANTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
