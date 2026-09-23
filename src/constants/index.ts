import { RoleType, DepartmentType, MadrasahType, SubscriptionPlan, PaymentMethod, IncomeCategory, ExpenseCategory, FundCodeType, DonorCategory } from '../types';

export const APP_NAME_BN = 'মাদ্রাসা ম্যানেজমেন্ট ও অ্যাডমিনিস্ট্রেশন সিস্টেম';
export const APP_NAME_EN = 'Madrasah Management SaaS Platform';
export const APP_VERSION = 'v1.0.0-PROD';

export const ROLE_LABELS: Record<RoleType, { bn: string; en: string; ar: string }> = {
  [RoleType.SUPER_ADMIN]: { bn: 'সুপার অ্যাডমিন', en: 'Super Admin', ar: 'المسؤول العام' },
  [RoleType.INSTITUTION_ADMIN]: { bn: 'প্রতিষ্ঠান প্রশাসক', en: 'Institution Admin', ar: 'مدير المؤسسة' },
  [RoleType.MUHTAMIM]: { bn: 'মুহতামিম / মহাপরিচালক', en: 'Director / Muhtamim', ar: 'المهتم / المدير العام' },
  [RoleType.ACCOUNTANT]: { bn: 'হিসাবরক্ষক', en: 'Accountant', ar: 'المحاسب' },
  [RoleType.TEACHER]: { bn: 'শিক্ষক / ওস্তাদজি', en: 'Teacher', ar: 'الأستاذ / المعلم' },
  [RoleType.STAFF]: { bn: 'কর্মচারী', en: 'Staff', ar: 'الموظف' },
  [RoleType.GUARDIAN]: { bn: 'অভিভাবক', en: 'Guardian', ar: 'ولي الأمر' },
  [RoleType.STUDENT]: { bn: 'শিক্ষার্থী / তালেবে ইলম', en: 'Student', ar: 'الطالب' },
};

export const MADRASAH_TYPE_LABELS: Record<MadrasahType, { bn: string; en: string }> = {
  [MadrasahType.QAWMI]: { bn: 'কওমি মাদ্রাসা', en: 'Qawmi Madrasah' },
  [MadrasahType.ALIA]: { bn: 'আলিয়া মাদ্রাসা', en: 'Alia Madrasah' },
  [MadrasahType.HIFZ]: { bn: 'হিফজুল কুরআন মাদ্রাসা', en: 'Hifzul Quran Madrasah' },
  [MadrasahType.NURANI]: { bn: 'নূরানী ও কিন্ডারগার্টেন', en: 'Nurani & Kindergarten' },
  [MadrasahType.CADET]: { bn: 'ইসলামিক ক্যাডেট মাদ্রাসা', en: 'Islamic Cadet Madrasah' },
  [MadrasahType.COMBINED]: { bn: 'সমন্বিত দ্বীনি শিক্ষা প্রতিষ্ঠান', en: 'Combined Islamic Institute' },
};

export const DEPARTMENT_LABELS: Record<DepartmentType, { bn: string; en: string }> = {
  [DepartmentType.NURANI]: { bn: 'নূরানী বিভাগ', en: 'Nurani Department' },
  [DepartmentType.NAJERA]: { bn: 'নাজেরা বিভাগ', en: 'Najera Department' },
  [DepartmentType.HIFZ]: { bn: 'হিফজুল কুরআন বিভাগ', en: 'Hifz Department' },
  [DepartmentType.KITAB]: { bn: 'কিতাব বিভাগ', en: 'Kitab Department' },
  [DepartmentType.DAWRA_HADITH]: { bn: 'দাওরায়ে হাদিস (তাকমীল)', en: 'Dawra-e Hadith' },
  [DepartmentType.IFTA]: { bn: 'ইফতা ও ফতোয়া বিভাগ', en: 'Ifta & Fatwa Dept' },
  [DepartmentType.DAKHIL]: { bn: 'দাখিল ও আলিম', en: 'Dakhil & Alim' },
  [DepartmentType.GENERAL]: { bn: 'জেনারেল শিক্ষা', en: 'General Education' },
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BANGLADESH_DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'ক্যাশ কাউন্টার (নগদ)',
  [PaymentMethod.BKASH]: 'বিকাশ (bKash)',
  [PaymentMethod.NAGAD]: 'নগদ (Nagad)',
  [PaymentMethod.ROCKET]: 'রকেট (Rocket)',
  [PaymentMethod.BANK_TRANSFER]: 'ব্যাংক ডিপোজিট / ট্রান্সফার',
  [PaymentMethod.CHEQUE]: 'চেক (Cheque)',
};

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, { bn: string; en: string }> = {
  [IncomeCategory.STUDENT_FEES]: { bn: 'শিক্ষার্থী ফি (Student fees)', en: 'Student fees' },
  [IncomeCategory.ADMISSION]: { bn: 'ভর্তি ফি (Admission)', en: 'Admission' },
  [IncomeCategory.DONATIONS]: { bn: 'দান ও সদকা (Donations)', en: 'Donations' },
  [IncomeCategory.GRANTS]: { bn: 'সরকারি ও প্রাতিষ্ঠানিক অনুদান (Grants)', en: 'Grants' },
  [IncomeCategory.OTHER_INCOME]: { bn: 'অন্যান্য আয় (Other income)', en: 'Other income' },
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, { bn: string; en: string }> = {
  [ExpenseCategory.SALARY]: { bn: 'শিক্ষক ও স্টাফ বেতন (Salary)', en: 'Salary' },
  [ExpenseCategory.ELECTRICITY]: { bn: 'বিদ্যুৎ ও ইউটিলিটি বিল (Electricity)', en: 'Electricity' },
  [ExpenseCategory.FOOD]: { bn: 'খাদ্য ও মেস সামগ্রী (Food)', en: 'Food' },
  [ExpenseCategory.EDUCATION]: { bn: 'শিক্ষা ও শিক্ষা উপকরণ (Education)', en: 'Education' },
  [ExpenseCategory.MAINTENANCE]: { bn: 'মেরামত ও রক্ষণাবেক্ষণ (Maintenance)', en: 'Maintenance' },
  [ExpenseCategory.TRANSPORT]: { bn: 'যাতায়াত ও পরিবহন (Transport)', en: 'Transport' },
  [ExpenseCategory.EVENTS]: { bn: 'অনুষ্ঠান ও প্রতিযোগিতা (Events)', en: 'Events' },
  [ExpenseCategory.MAHFIL]: { bn: 'বার্ষিক ওয়াজ মাহফিল (Mahfil)', en: 'Mahfil' },
  [ExpenseCategory.OTHER]: { bn: 'অন্যান্য ব্যয় (Other)', en: 'Other' },
};

export const FUND_TYPE_LABELS: Record<FundCodeType, { bn: string; en: string; isRestricted: boolean; purposeBn: string }> = {
  GENERAL: {
    bn: 'সাধারণ তহবিল (General Fund)',
    en: 'General Fund',
    isRestricted: false,
    purposeBn: 'সাধারণ পরিচালন ও প্রশাসনিক ব্যয় নির্বাহের উন্মুক্ত তহবিল',
  },
  FEE: {
    bn: 'ফি তহবিল (Fee & Tuition Fund)',
    en: 'Fee & Tuition Fund',
    isRestricted: false,
    purposeBn: 'শিক্ষার্থীদের মাসিক বেতন ও সেশন ফি সংগ্রহ তহবিল',
  },
  LILLAH: {
    bn: 'লিল্লাহ ও যাকাত তহবিল (Lillah & Zakat)',
    en: 'Lillah & Zakat Fund',
    isRestricted: true,
    purposeBn: 'শরীয়ত নির্ধারিত দরিদ্র, মুস্তাহিক ও এতিম শিক্ষার্থীদের খোরাকী ও পোশাকের জন্য সুনির্দিষ্ট তহবিল',
  },
  GORAOBA: {
    bn: 'গোরাবা ও এতিম কল্যাণ (Goraoba Welfare)',
    en: 'Goraoba & Orphan Welfare',
    isRestricted: true,
    purposeBn: 'অসহায়, নিঃস্ব ও এতিম ছাত্রদের চিকিৎসা, কিতাব ও পুনর্বাসন সহায়তা তহবিল',
  },
  BOARDING: {
    bn: 'বোর্ডিং ও মেস তহবিল (Boarding & Mess)',
    en: 'Boarding & Mess Fund',
    isRestricted: false,
    purposeBn: 'আবাসিক বাবুর্চি খরচ, গ্যাস, চাল-ডাল ও খাদ্য সামগ্রী ক্রয় তহবিল',
  },
  BUILDING: {
    bn: 'মসজিদ ও ভবন নির্মাণ (Building & Infra)',
    en: 'Building & Masjid Fund',
    isRestricted: true,
    purposeBn: 'মাদ্রাসা কমপ্লেক্স, মসজিদ সম্প্রসারণ ও স্থায়ী অবকাঠামো উন্নয়ন ওয়াকফ তহবিল',
  },
  MAHFIL: {
    bn: 'বার্ষিক মাহফিল ও সম্মেলন (Mahfil Fund)',
    en: 'Annual Mahfil & Conference Fund',
    isRestricted: false,
    purposeBn: 'বার্ষিক ওয়াজ মাহফিল, দস্তারবন্দী ও আন্তর্জাতিক কেরাত সম্মেলন তহবিল',
  },
  PROJECT: {
    bn: 'বিশেষ প্রকল্প ও ওয়াকফ (Project Fund)',
    en: 'Special Project & Waqf Fund',
    isRestricted: true,
    purposeBn: 'সুনির্দিষ্ট দাতব্য প্রকল্প (যেমন: লাইব্রেরি, কুরআন প্রিন্ট, টিউবওয়েল) বাস্তবায়ন তহবিল',
  },
  CUSTOM: {
    bn: 'বিশেষায়িত কাস্টম তহবিল',
    en: 'Custom Dedicated Fund',
    isRestricted: false,
    purposeBn: 'অন্যান্য সুনির্দিষ্ট প্রতিষ্ঠানীয় তহবিল',
  },
};

export const DONOR_CATEGORY_LABELS: Record<DonorCategory, { bn: string; en: string }> = {
  GENERAL: { bn: 'সাধারণ দাতা (General Donor)', en: 'General Donor' },
  LIFETIME: { bn: 'আজীবন সদস্য (Lifetime Member)', en: 'Lifetime Member' },
  CORPORATE: { bn: 'কর্পোরেট ও ব্যবসায়ী (Corporate & Business)', en: 'Corporate Donor' },
  EXPATRIATE: { bn: 'প্রবাসী শুভাকাঙ্ক্ষী (Expatriate / NRB)', en: 'Expatriate Donor' },
  MONTHLY_SPONSOR: { bn: 'মাসিক স্পনসর (Monthly Sponsor)', en: 'Monthly Sponsor' },
  WELL_WISHER: { bn: 'সম্মানিত শুভানুধ্যায়ী (Well-Wisher)', en: 'Well Wisher' },
};

export interface NavItem {
  id: string;
  labelKey: string;
  defaultLabelBn: string;
  defaultLabelEn: string;
  icon: string;
  roles: RoleType[];
  badgeKey?: string;
  children?: {
    id: string;
    labelKey: string;
    defaultLabelBn: string;
    defaultLabelEn: string;
    roles: RoleType[];
  }[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  {
    id: 'dashboard',
    labelKey: 'nav.dashboard',
    defaultLabelBn: 'ড্যাশবোর্ড',
    defaultLabelEn: 'Dashboard',
    icon: 'LayoutDashboard',
    roles: Object.values(RoleType),
  },
  {
    id: 'multitenancy',
    labelKey: 'nav.multitenancy',
    defaultLabelBn: 'মাল্টি-টেন্যান্ট আইসোলেশন (P-03)',
    defaultLabelEn: 'Multi-Tenant Security',
    icon: 'ShieldCheck',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM],
  },
  {
    id: 'rbac',
    labelKey: 'nav.rbac',
    defaultLabelBn: 'অথেনটিকেশন ও RBAC (P-04)',
    defaultLabelEn: 'Auth & Access Control',
    icon: 'KeyRound',
    roles: Object.values(RoleType),
  },
  {
    id: 'students',
    labelKey: 'nav.students',
    defaultLabelBn: 'শিক্ষার্থী ব্যবস্থাপনা',
    defaultLabelEn: 'Students',
    icon: 'GraduationCap',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.ACCOUNTANT],
    children: [
      { id: 'students-list', labelKey: 'nav.students_list', defaultLabelBn: 'শিক্ষার্থীদের তালিকা', defaultLabelEn: 'Student Directory', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
      { id: 'admission', labelKey: 'nav.admission', defaultLabelBn: 'নতুন ভর্তি (৮-ধাপ)', defaultLabelEn: 'Admission Wizard', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'id-cards', labelKey: 'nav.id_cards', defaultLabelBn: 'আইডি কার্ড প্রিন্ট', defaultLabelEn: 'Student ID Cards', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN] },
    ],
  },
  {
    id: 'academics',
    labelKey: 'nav.academics',
    defaultLabelBn: 'অ্যাকাডেমিক ব্যবস্থাপনা (P-16)',
    defaultLabelEn: 'Academic Management',
    icon: 'BookOpen',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER],
    children: [
      { id: 'academic-structure', labelKey: 'nav.academic_structure', defaultLabelBn: 'অ্যাকাডেমিক পূর্ণাঙ্গ ড্যাশবোর্ড', defaultLabelEn: 'Academic Structure Suite', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'classes', labelKey: 'nav.classes', defaultLabelBn: 'শ্রেণি ও শাখা', defaultLabelEn: 'Classes & Sections', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'subjects', labelKey: 'nav.subjects', defaultLabelBn: 'কিতাব ও বিষয় ভাণ্ডার', defaultLabelEn: 'Subjects & Books', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'class-subjects', labelKey: 'nav.class_subjects', defaultLabelBn: 'শ্রেণি কারিকুলাম ম্যাপিং', defaultLabelEn: 'Class Curriculum Mapping', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'teacher-assignment', labelKey: 'nav.teacher_assignment', defaultLabelBn: 'ওস্তাদজি-কিতাব বণ্টন', defaultLabelEn: 'Teacher Subject Assignment', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'syllabus', labelKey: 'nav.syllabus', defaultLabelBn: 'সিলেবাস ও সবক ট্র্যাকিং', defaultLabelEn: 'Syllabus & Milestones', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
      { id: 'academic-calendar', labelKey: 'nav.academic_calendar', defaultLabelBn: 'বার্ষিক বর্ষপঞ্জি ও ইভেন্ট', defaultLabelEn: 'Academic Calendar', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
      { id: 'routine', labelKey: 'nav.routine', defaultLabelBn: 'ক্লাস রুটিন', defaultLabelEn: 'Class Routine', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
      { id: 'lesson-plans', labelKey: 'nav.lesson_plans', defaultLabelBn: 'হোমওয়ার্ক ও পাঠ পরিকল্পনা', defaultLabelEn: 'Homework & Lesson Plans', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER] },
    ],
  },
  {
    id: 'attendance',
    labelKey: 'nav.attendance',
    defaultLabelBn: 'দৈনিক হাজিরা',
    defaultLabelEn: 'Attendance',
    icon: 'CalendarCheck2',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.GUARDIAN],
  },
  {
    id: 'fees',
    labelKey: 'nav.fees',
    defaultLabelBn: 'ফি ও রশিদ সংগ্রহ',
    defaultLabelEn: 'Fees & Receipts',
    icon: 'Receipt',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT, RoleType.GUARDIAN],
    children: [
      { id: 'fees', labelKey: 'nav.fees_collection', defaultLabelBn: 'ফি আদায় ও লেজার', defaultLabelEn: 'Fee Collection', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT, RoleType.GUARDIAN] },
      { id: 'receipts', labelKey: 'nav.receipts_management', defaultLabelBn: 'মানিরিসিপ্ট ও অডিট', defaultLabelEn: 'Receipts & Audit', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
    ],
  },
  {
    id: 'accounting',
    labelKey: 'nav.accounting',
    defaultLabelBn: 'হিসাব ও তহবিল',
    defaultLabelEn: 'Accounting & Funds',
    icon: 'CircleDollarSign',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT],
  },
  {
    id: 'donations',
    labelKey: 'nav.donations',
    defaultLabelBn: 'দান ও যাকাত ফান্ড',
    defaultLabelEn: 'Donations & Funds',
    icon: 'HandCoins',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT],
    children: [
      { id: 'donations', labelKey: 'nav.donations_list', defaultLabelBn: 'অনুদান ও রশিদ সংগ্রহ', defaultLabelEn: 'Donations & Receipts', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'donors', labelKey: 'nav.donors_directory', defaultLabelBn: 'দাতা ডিরেক্টরি', defaultLabelEn: 'Donor Directory', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'funds', labelKey: 'nav.funds_list', defaultLabelBn: 'তহবিল ও শরীয়াহ ফান্ড', defaultLabelEn: 'Funds & Accounts', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'projects', labelKey: 'nav.projects_list', defaultLabelBn: 'উন্নয়ন ও ওয়াকফ প্রকল্প', defaultLabelEn: 'Projects & Waqf', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'transfers', labelKey: 'nav.transfers_list', defaultLabelBn: 'তহবিল স্থানান্তর ও অডিট', defaultLabelEn: 'Fund Transfers & Audit', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'donation-reports', labelKey: 'nav.donation_reports', defaultLabelBn: 'অনুদান রিপোর্ট ও বিশ্লেষণ', defaultLabelEn: 'Donation Reports', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
    ],
  },
  {
    id: 'exams',
    labelKey: 'nav.exams',
    defaultLabelBn: 'পরীক্ষা ও ফলাফল',
    defaultLabelEn: 'Exams & Results',
    icon: 'Award',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.GUARDIAN, RoleType.STUDENT],
  },
  {
    id: 'homework-plan',
    labelKey: 'nav.homework_plan',
    defaultLabelBn: 'হোমওয়ার্ক ও পাঠ পরিকল্পনা',
    defaultLabelEn: 'Homework & Lesson Plan',
    icon: 'BookOpen',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.GUARDIAN, RoleType.STUDENT],
  },
  {
    id: 'staff',
    labelKey: 'nav.staff',
    defaultLabelBn: 'ওস্তাদ ও কর্মচারী ব্যবস্থাপনা (P-14)',
    defaultLabelEn: 'Teachers & Staff Management',
    icon: 'Users',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT, RoleType.TEACHER, RoleType.STAFF],
    children: [
      { id: 'staff', labelKey: 'nav.staff_directory', defaultLabelBn: 'ওস্তাদ ও স্টাফ তালিকা', defaultLabelEn: 'Staff Directory', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'teacher-portal', labelKey: 'nav.teacher_portal', defaultLabelBn: 'শিক্ষক ড্যাশবোর্ড (My Portal)', defaultLabelEn: 'Teacher Portal', roles: [RoleType.TEACHER, RoleType.STAFF, RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'teacher-assignments', labelKey: 'nav.teacher_assignments', defaultLabelBn: 'বিষয় ও শ্রেণি বন্টন', defaultLabelEn: 'Class & Subject Assign', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'staff-attendance', labelKey: 'nav.staff_attendance', defaultLabelBn: 'শিক্ষক ও স্টাফ হাজিরা', defaultLabelEn: 'Staff Attendance', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.STAFF] },
      { id: 'leave-management', labelKey: 'nav.leave_management', defaultLabelBn: 'ছুটি আবেদন ও অনুমোদন', defaultLabelEn: 'Leave Management', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.STAFF] },
      { id: 'payroll', labelKey: 'nav.payroll', defaultLabelBn: 'বেতন শিট ও পে-স্লিপ', defaultLabelEn: 'Payroll & Payslips', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT] },
      { id: 'salary-advance', labelKey: 'nav.salary_advance', defaultLabelBn: 'অগ্রিম বেতন ও কিস্তি', defaultLabelEn: 'Salary Advance', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT, RoleType.TEACHER] },
      { id: 'salary-increment', labelKey: 'nav.salary_increment', defaultLabelBn: 'ইনক্রিমেন্ট ট্র্যাকার', defaultLabelEn: 'Increment Tracker', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM] },
      { id: 'teacher-routine', labelKey: 'nav.teacher_routine', defaultLabelBn: 'ক্লাস রুটিন ও সময়সূচি', defaultLabelEn: 'Class Routine', roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.TEACHER, RoleType.STUDENT, RoleType.GUARDIAN] },
    ],
  },
  {
    id: 'notices',
    labelKey: 'nav.notices',
    defaultLabelBn: 'নোটিশ বোর্ড',
    defaultLabelEn: 'Notices',
    icon: 'BellRing',
    roles: Object.values(RoleType),
  },
  {
    id: 'reports',
    labelKey: 'nav.reports',
    defaultLabelBn: 'রিপোর্ট হাব',
    defaultLabelEn: 'Reports Hub',
    icon: 'FileSpreadsheet',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN, RoleType.MUHTAMIM, RoleType.ACCOUNTANT],
  },
  {
    id: 'settings',
    labelKey: 'nav.settings',
    defaultLabelBn: 'প্রতিষ্ঠান সেটিংস',
    defaultLabelEn: 'Settings',
    icon: 'Settings',
    roles: [RoleType.SUPER_ADMIN, RoleType.INSTITUTION_ADMIN],
  },
];
