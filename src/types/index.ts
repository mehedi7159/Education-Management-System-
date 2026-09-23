export type LanguageCode = 'bn' | 'en' | 'ar';
export type ThemeMode = 'islamic-green' | 'professional-blue' | 'dark';

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  MUHTAMIM = 'MUHTAMIM',
  ACCOUNTANT = 'ACCOUNTANT',
  TEACHER = 'TEACHER',
  STAFF = 'STAFF',
  GUARDIAN = 'GUARDIAN',
  STUDENT = 'STUDENT',
}

export enum MadrasahType {
  QAWMI = 'QAWMI',
  ALIA = 'ALIA',
  HIFZ = 'HIFZ',
  NURANI = 'NURANI',
  CADET = 'CADET',
  COMBINED = 'COMBINED',
}

export enum DepartmentType {
  NURANI = 'NURANI',
  NAJERA = 'NAJERA',
  HIFZ = 'HIFZ',
  KITAB = 'KITAB',
  DAWRA_HADITH = 'DAWRA_HADITH',
  IFTA = 'IFTA',
  DAKHIL = 'DAKHIL',
  GENERAL = 'GENERAL',
}

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  GRADUATED = 'GRADUATED',
  EXPELLED = 'EXPELLED',
  DROPPED = 'DROPPED',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
}

export enum FeeStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  WAIVED = 'WAIVED',
}

export enum FeeCategory {
  ADMISSION = 'ADMISSION',
  MONTHLY = 'MONTHLY',
  EXAMINATION = 'EXAMINATION',
  SESSION = 'SESSION',
  DEVELOPMENT = 'DEVELOPMENT',
  SPECIAL = 'SPECIAL',
  BOARDING = 'BOARDING',
  HOSTEL = 'HOSTEL',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  ROCKET = 'ROCKET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  FUND_TRANSFER = 'FUND_TRANSFER',
}

export enum IncomeCategory {
  STUDENT_FEES = 'STUDENT_FEES',
  ADMISSION = 'ADMISSION',
  DONATIONS = 'DONATIONS',
  GRANTS = 'GRANTS',
  OTHER_INCOME = 'OTHER_INCOME',
}

export enum ExpenseCategory {
  SALARY = 'SALARY',
  ELECTRICITY = 'ELECTRICITY',
  FOOD = 'FOOD',
  EDUCATION = 'EDUCATION',
  MAINTENANCE = 'MAINTENANCE',
  TRANSPORT = 'TRANSPORT',
  EVENTS = 'EVENTS',
  MAHFIL = 'MAHFIL',
  OTHER = 'OTHER',
}

export enum ApprovalStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  VOIDED = 'VOIDED',
}

export interface Tenant {
  id: string;
  code: string;
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  madrasahType: MadrasahType;
  eiinCode?: string;
  boardCode?: string;
  registrationNo?: string;
  address: string;
  district: string;
  thana?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  planType: SubscriptionPlan;
  isActive: boolean;
  currency: string;
  establishedYear: number;
  affiliation?: string;
  academicYear?: string;
}

export interface ShiftEntity {
  id: string;
  tenantId: string;
  nameBangla: string;
  nameEnglish: string;
  startTime: string; // e.g. "07:00"
  endTime: string;   // e.g. "12:30"
  halfDayEndTime?: string;
  graceMinutes?: number;
  isResidential: boolean;
  isActive: boolean;
}

export interface DepartmentConfig {
  id: string;
  tenantId: string;
  type: DepartmentType;
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  headName?: string;
  headOfDepartment?: string;
  isEnabled: boolean;
  isActive?: boolean;
  code?: string;
  description?: string;
}

export interface GradeRule {
  gradeBangla?: string;   // e.g. "মুমতাজ (স্টার)" or "A+"
  gradeEnglish?: string;  // e.g. "Mumtaz" or "A+"
  gradeArabic?: string;   // e.g. "ممتاز"
  gpaPoint?: number;      // e.g. 5.0
  minPercentage: number;  // e.g. 80
  maxPercentage: number;  // e.g. 100
  isPassing?: boolean;
  remarksBn?: string;     // e.g. "অসাধারণ কৃতিত্ব"
  gradeName?: string;     // e.g. "মুমতাজ (Star / 80%+)"
  gradeNameEnglish?: string;
  status?: 'PASSED' | 'FAILED';
  colorTag?: string;
}

export interface GradingSystemConfig {
  systemType: 'QAWMI_MARHALA' | 'ALIA_GPA' | 'CUSTOM' | 'QAWMI' | 'ALIA';
  passMarkPercentage: number;
  rules: GradeRule[];
}

export interface GradeConfigEntity {
  id: string;
  tenantId: string;
  name: string;
  systemType: 'QAWMI_MARHALA' | 'ALIA_GPA' | 'CUSTOM' | 'QAWMI' | 'ALIA' | string;
  passMarkPercentage?: number;
  rules: GradeRule[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type FeeFrequency = 'ONE_TIME' | 'MONTHLY' | 'PER_EXAM' | 'YEARLY';

export interface FeeTypeEntity {
  id: string;
  tenantId: string;
  nameBangla: string;
  nameEnglish: string;
  code: string;
  defaultAmount: number;
  frequency: FeeFrequency;
  department?: DepartmentType | 'ALL';
  isMandatory: boolean;
  description?: string;
}

export interface PaymentMethodConfig {
  id: string;
  tenantId: string;
  methodType: PaymentMethod;
  providerName: string; // e.g. "বিকাশ মার্চেন্ট"
  accountNumber: string; // e.g. "01712-345678"
  accountTitle?: string;
  branchName?: string;
  instructionsBn?: string;
  isActive: boolean;
}

export interface InstitutionFullConfig {
  tenant: Tenant;
  sessions: AcademicSession[];
  activeSessionId: string;
  departments: DepartmentConfig[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  shifts: ShiftEntity[];
  subjects: SubjectEntity[];
  gradingSystem: GradingSystemConfig;
  feeTypes: FeeTypeEntity[];
  funds: FundEntity[];
  paymentMethods: PaymentMethodConfig[];
}

export interface User {
  id: string;
  tenantId?: string;
  username: string;
  fullName: string;
  email?: string;
  mobile: string;
  role: RoleType;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface AcademicSession {
  id: string;
  tenantId: string;
  name: string; // e.g. "1446-1447 হি. / 2025-2026"
  sessionName?: string;
  hijriYear?: string;
  gregorianYear?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  admissionStatus?: 'OPEN' | 'CLOSED';
  admissionOpen?: boolean;
  termCount?: number;
  remarks?: string;
}

export interface ClassEntity {
  id: string;
  tenantId: string;
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  code?: string;
  department: DepartmentType;
  orderIndex: number;
  totalStudents?: number;
  maxCapacity?: number;
  tuitionFee?: number;
  admissionFee?: number;
  isResidentialOnly?: boolean;
}

export interface SectionEntity {
  id: string;
  tenantId: string;
  classId: string;
  className?: string;
  name: string;
  capacity: number;
  roomNumber?: string;
  floor?: string;
  shiftId?: string;
  shiftName?: string;
  classTeacherId?: string;
  classTeacherName?: string;
  class?: ClassEntity;
  isActive?: boolean;
}

export type SubjectCategoryType = 'CORE' | 'ELECTIVE' | 'ADDITIONAL' | 'HIFZ' | 'ORAL_PRACTICAL';

export interface SubjectEntity {
  id: string;
  tenantId: string;
  classId?: string;
  className?: string;
  code?: string;
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  subjectType?: SubjectCategoryType;
  type?: string;
  department?: DepartmentType | string;
  totalMarks: number;
  fullMarks?: number;
  passMarks: number;
  writtenMarks?: number;
  oralMarks?: number;
  mcqMarks?: number;
  practicalMarks?: number;
  bookTitle?: string;
  authorName?: string;
  author?: string;
  publisher?: string;
  weeklyPeriods?: number;
  orderIndex?: number;
  description?: string;
}

export interface ClassSubjectEntity {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  subjectType: SubjectCategoryType;
  totalMarks: number;
  fullMarks?: number;
  passMarks: number;
  writtenMarks?: number;
  oralMarks?: number;
  mcqMarks?: number;
  weeklyPeriods: number;
  isMandatory: boolean;
  isElective?: boolean;
  orderIndex: number;
}

export interface SyllabusChapterItem {
  id: string;
  chapterNo: number;
  title: string;
  pageRange?: string;
  estimatedPeriods: number;
  learningObjectives?: string;
  isCompleted: boolean;
  completedDate?: string;
}

export interface SyllabusEntity {
  id: string;
  tenantId: string;
  academicSessionName?: string;
  academicSessionId?: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  bookTitle?: string;
  authorName?: string;
  termName?: string; // e.g. "১ম সাময়িক", "২য় সাময়িক", "বার্ষিক"
  term?: string;
  unitName?: string;
  topicTitle?: string;
  description?: string;
  targetCompletionDate?: string;
  estimatedPeriods?: number;
  status?: 'PENDING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW';
  completionPercentage?: number;
  chaptersOrTopics?: SyllabusChapterItem[];
  totalEstimatedPeriods?: number;
  completedPeriods?: number;
  progressPercentage?: number;
  notes?: string;
  approvedBy?: string;
  createdAt: string;
}

export type AcademicCalendarCategory =
  | 'EXAM'
  | 'HOLIDAY'
  | 'ADMISSION'
  | 'EVENT'
  | 'MEETING'
  | 'ACADEMIC'
  | 'RAMADAN';

export interface AcademicCalendarEventEntity {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  category?: AcademicCalendarCategory;
  eventType?: 'EXAM' | 'HOLIDAY' | 'EVENT' | 'ADMISSION' | 'MEETING' | 'MAHFIL' | 'DARS' | 'NATIONAL_DAY' | string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  hijriDate?: string;
  isHoliday: boolean;
  targetAudience?: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'GUARDIANS' | 'STAFF';
  colorCode?: string;
  colorTag?: string;
  academicSessionName?: string;
  academicSessionId?: string;
  createdAt: string;
}

export type AcademicPresetType =
  | 'QAWMI_STANDARD'
  | 'HIFZ_CADET'
  | 'NURANI_KG'
  | 'ALIA_MADRASA'
  | 'CUSTOM'
  | 'ALIA'
  | 'HIFZ'
  | 'NURANI'
  | 'QAWMI';

export interface StudentDocument {
  id: string;
  title: string;
  type: 'BIRTH_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 'MARKSHEET' | 'NID_COPY' | 'MEDICAL_DOC' | 'PHOTO' | 'OTHER';
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadDate: string;
  remarks?: string;
}

export interface StudentAcademicHistoryRecord {
  id: string;
  examOrClass: string;
  institutionName: string;
  boardOrWafaq?: string;
  passingYear: number;
  resultOrGrade: string;
  marksObtained?: number;
  totalMarks?: number;
  rollOrRegNo?: string;
  remarks?: string;
}

export interface StudentEntity {
  id: string;
  tenantId: string;
  studentIdCardNo: string;      // Student ID / কার্ড নম্বর
  admissionNo: string;          // ভর্তি নম্বর
  admissionDate: string;        // ভর্তি তারিখ
  nameBangla: string;           // নাম (বাংলা)
  nameEnglish: string;          // Name (English)
  nameArabic?: string;          // الاسم بالعربية
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;          // জন্ম তারিখ
  bloodGroup?: string;          // রক্তের গ্রুপ (A+, A-, B+, B-, AB+, AB-, O+, O-)
  religion?: string;            // ধর্ম (ডিফল্ট: ইসলাম)
  birthCertificateNo?: string;  // জন্ম নিবন্ধন নম্বর
  previousInstitution?: string; // পূর্ববর্তী শিক্ষা প্রতিষ্ঠান
  classId: string;              // শ্রেণি / জামাত আইডি
  className?: string;           // শ্রেণি নাম
  sectionId: string;            // শাখা আইডি
  sectionName?: string;         // শাখা নাম
  sessionId?: string;           // শিক্ষাবর্ষ আইডি
  sessionName?: string;         // শিক্ষাবর্ষ নাম
  rollNo: number;               // রোল নম্বর
  dakhilaNo?: string;           // দাখিলা নম্বর / কওমি মাদ্রাসার অনন্য ট্র্যাকিং কোড
  registrationNo?: string;      // বোর্ড / কেন্দ্রীয় রেজিস্ট্রেশন নম্বর
  department?: DepartmentType;  // অ্যাকাডেমিক বিভাগ
  shiftId?: string;             // শিফট আইডি
  shiftName?: string;           // শিফট নাম
  biometricId?: string;         // বায়োমেট্রিক পাঞ্চ / কার্ড আইডি

  // Guardian Information
  fatherName?: string;          // পিতার নাম
  fatherOccupation?: string;    // পিতার পেশা
  fatherMobile?: string;        // পিতার মোবাইল
  fatherNid?: string;           // পিতার এনআইডি
  motherName?: string;          // মাতার নাম
  motherOccupation?: string;    // মাতার পেশা
  motherMobile?: string;        // মাতার মোবাইল
  motherNid?: string;           // মাতার এনআইডি
  guardianName: string;         // অভিভাবকের নাম
  guardianRelation?: string;    // অভিভাবকের সম্পর্ক (পিতা / মাতা / চাচা / ভাই / দাদা / অন্যান্য)
  guardianMobile: string;       // অভিভাবকের মোবাইল
  guardianNid?: string;         // অভিভাবকের এনআইডি
  guardianOccupation?: string;  // অভিভাবকের পেশা
  guardianEmail?: string;       // অভিভাবকের ইমেইল

  // Address
  presentAddress: string;       // বর্তমান ঠিকানা
  presentDistrict?: string;     // বর্তমান জেলা
  presentThana?: string;        // বর্তমান থানা
  permanentAddress?: string;    // স্থায়ী ঠিকানা
  permanentDistrict?: string;   // স্থায়ী জেলা
  permanentThana?: string;      // স্থায়ী থানা

  // Institutional & Residential Details
  isResidential: boolean;       // আবাসিক / অনাবাসিক
  residenceHall?: string;       // ছাত্রাবাস / হলের নাম
  roomNo?: string;              // কক্ষ নম্বর
  bedNo?: string;               // খাট / সিট নম্বর
  status: StudentStatus;        // স্ট্যাটাস (ACTIVE, INACTIVE, TRANSFERRED, GRADUATED, EXPELLED, DROPPED)
  photoUrl?: string;            // ছবি / Avatar
  medicalNotes?: string;        // বিশেষ শারীরিক অবস্থা / এলার্জি
  generalNotes?: string;        // অধ্যক্ষ / মুহতামিমের মন্তব্য

  // Related Sub-collections
  documents?: StudentDocument[];
  academicHistory?: StudentAcademicHistoryRecord[];
  waiverPercentage?: number;
  waiverCategory?: WaiverCategory;
}

export interface StaffAllowances {
  houseRent: number;          // বাড়ি ভাড়া ভাতা
  medical: number;            // চিকিৎসা ভাতা
  conveyance: number;         // যাতায়াত / মোবাইল ভাতা
  foodOrMess: number;         // খাদ্য / মেস ভাতা
  specialDuty: number;        // বিশেষ দায়িত্ব / মোহতামিম ভাতা
  other: number;              // অন্যান্য ভাতা
}

export type StaffStatus = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'SUSPENDED';

export interface StaffEntity {
  id: string;
  tenantId: string;
  employeeId: string;         // Employee ID (e.g. EMP-01)
  nameBangla: string;         // নাম (বাংলা)
  nameEnglish: string;        // Name (English)
  nameArabic?: string;        // الاسم بالعربية
  photoUrl?: string;          // ছবি URL
  avatarUrl?: string;         // Fallback avatar
  mobile: string;             // মোবাইল নম্বর
  email?: string;             // ইমেইল
  nid?: string;               // জাতীয় পরিচয়পত্র নম্বর (NID)
  qualification: string;      // শিক্ষাগত যোগ্যতা (e.g. দাওরায়ে হাদিস, ইফতা, কামিল)
  designation: string;        // পদবী (e.g. মুহতামিম, সিনিয়র মুহাদ্দিস, হিফজ প্রধান, সহকারী শিক্ষক)
  department: DepartmentType; // বিভাগ (কিতাব, হিফজ, নূরানী, জেনারেল ইত্যাদি)
  joiningDate: string;        // যোগদানের তারিখ (YYYY-MM-DD)
  baseSalary: number;         // মূল বেতন (BDT)
  allowances?: StaffAllowances; // ভাতার বিস্তারিত
  presentAddress: string;     // বর্তমান ঠিকানা
  permanentAddress?: string;  // স্থায়ী ঠিকানা
  status: StaffStatus;        // স্ট্যাটাস (ACTIVE, ON_LEAVE, RESIGNED, SUSPENDED)
  bloodGroup?: string;        // রক্তের গ্রুপ
  emergencyContactName?: string; // জরুরি যোগাযোগকারীর নাম
  emergencyContactPhone?: string;// জরুরি যোগাযোগ নম্বর
  bankName?: string;          // ব্যাংক নাম
  bankAccountNo?: string;     // ব্যাংক একাউন্ট নম্বর
  notes?: string;             // বিশেষ মন্তব্য
  userId?: string;            // লিঙ্কড সিস্টেম ইউজার আইডি (যদি লগইন থাকে)
  totalAdvanceBalance?: number; // বর্তমান বকেয়া অগ্রিম বেতন
}

export interface TeacherSubjectAssignment {
  id: string;
  tenantId: string;
  teacherId: string;
  teacherName: string;
  employeeId: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  subjectId: string;
  subjectName: string;
  weeklyPeriodsCount: number;  // সপ্তাহে মোট পিরিয়ড সংখ্যা
  periodsPerWeek?: number;
  academicSessionName?: string;
  role?: string;
  assignedAt: string;
}

export type TeacherSubjectAssignmentEntity = TeacherSubjectAssignment;

export interface TeacherClassAssignment {
  id: string;
  tenantId: string;
  teacherId: string;
  teacherName: string;
  employeeId: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  role: 'HEAD_TEACHER' | 'CLASS_TEACHER' | 'ASSISTANT_INCHARGE' | 'NAZEM_TALIMAT';
  academicSessionName?: string;
  assignedDate: string;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'MATERNITY' | 'HAJJ' | 'EMERGENCY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveApplicationEntity {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  leaveType: LeaveType;
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  totalDays: number;
  reason: string;
  emergencyContactDuringLeave?: string;
  substituteTeacherName?: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  remarks?: string;
}

export interface StaffLeaveBalance {
  staffId: string;
  staffName: string;
  employeeId: string;
  totalCasualAllowed: number;
  usedCasual: number;
  totalSickAllowed: number;
  usedSick: number;
  usedEmergency: number;
  usedUnpaid: number;
}

export type PayrollWorkflowStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'PAID';
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'ACTIVE' | 'COMPLETED';

export interface StaffLoanEntity {
  id: string;
  tenantId: string;
  loanNo: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  principalAmount: number;
  totalInstallments: number;
  monthlyInstallment: number;
  totalRepaid: number;
  remainingBalance: number;
  purpose: string;
  status: LoanStatus;
  applicationDate: string;
  approvedBy?: string;
  approvedDate?: string;
  disbursedDate?: string;
  disbursementAccountName?: string;
  transactionVoucherNo?: string;
  remarks?: string;
  createdAt: string;
}

export interface SalaryPayrollEntity {
  id: string;
  tenantId: string;
  payslipNo: string;          // e.g. PAY-2025-02-001
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  department: DepartmentType | string;
  monthYear: string;          // e.g. "2025-02"
  baseSalary: number;
  allowances: StaffAllowances;
  totalAllowances: number;
  bonusAmount?: number;       // উৎসব ও বিশেষ বোনাস
  bonusType?: string;         // বোনাসের বিবরণ (যেমন: ঈদুল ফিতর)
  grossSalary: number;        // baseSalary + totalAllowances + bonusAmount
  advanceDeduction: number;   // মাসিক অগ্রিম কর্তন
  loanDeduction?: number;     // কর্জে হাসানা ও লোন কিস্তি কর্তন
  absentDays: number;         // অবৈতনিক অনুপস্থিত দিন
  absentDeduction: number;    // অনুপস্থিতির কারণে কর্তন
  providentFundDeduction?: number; // প্রভিডেন্ট ফান্ড কর্তন
  otherDeductions: number;    // অন্যান্য কর্তন
  totalDeductions: number;    // advanceDeduction + loanDeduction + absentDeduction + otherDeductions
  netPayable: number;         // grossSalary - totalDeductions
  workflowStatus: PayrollWorkflowStatus; // DRAFT -> REVIEWED -> APPROVED -> PAID
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL';
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  disbursedBy?: string;
  transactionVoucherNo?: string;
  disbursementAccountName?: string;
  remarks?: string;
  createdAt: string;
}

export interface SalaryAdvanceEntity {
  id: string;
  tenantId: string;
  advanceNo: string;          // e.g. ADV-2025-001
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  amountRequested: number;
  amountApproved: number;
  reason: string;
  repaymentMonths: number;    // কিস্তির মেয়াদ (মাস)
  monthlyDeduction: number;   // মাসিক কিস্তির পরিমাণ
  totalRepaid: number;        // পরিশোধিত মোট টাকা
  remainingBalance: number;   // বর্তমান অবশিষ্ট বকেয়া
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISBURSED' | 'FULLY_REPAID';
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
  disbursedDate?: string;
  disbursementAccountName?: string;
  transactionVoucherNo?: string;
  notes?: string;
}

export interface SalaryIncrementEntity {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  designation: string;
  previousBaseSalary: number;
  incrementAmount: number;
  incrementPercentage: number;
  newBaseSalary: number;
  effectiveDate: string;      // YYYY-MM-DD
  resolutionNo?: string;      // রেজুলেশন বা স্মারক নম্বর
  reason: string;             // ইনক্রিমেন্টের বিবরণ / বাৎসরিক পারফরমেন্স
  approvedBy: string;
  createdAt: string;
}

export type RoutineDay = 'SATURDAY' | 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface TeacherRoutineEntity {
  id: string;
  tenantId: string;
  teacherId: string;
  teacherName: string;
  employeeId: string;
  dayOfWeek: RoutineDay;
  periodNumber: number;       // ১, ২, ৩, ৪, ৫, ৬, ৭
  periodName?: string;        // ১ম ঘণ্টা, ২য় ঘণ্টা ইত্যাদি
  startTime: string;          // e.g. "08:00 AM"
  endTime: string;            // e.g. "08:45 AM"
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  subjectId: string;
  subjectName: string;
  roomNo?: string;
  academicSessionName?: string;
  notes?: string;
}

export type StaffActivityType =
  | 'JOINING'
  | 'PROMOTION'
  | 'SALARY_INCREMENT'
  | 'SUBJECT_ASSIGNMENT'
  | 'CLASS_ASSIGNMENT'
  | 'LEAVE_TAKEN'
  | 'ADVANCE_SALARY'
  | 'PAYROLL_DISBURSED'
  | 'WARNING_NOTICE'
  | 'APPRECIATION'
  | 'STATUS_CHANGE';

export interface StaffActivityHistoryEntity {
  id: string;
  tenantId: string;
  staffId: string;
  staffName: string;
  employeeId: string;
  activityType: StaffActivityType;
  title: string;
  description: string;
  date: string;
  performedBy: string;
  referenceNo?: string;
  metadata?: Record<string, any>;
}

export type FundCodeType = 
  | 'GENERAL'
  | 'FEE'
  | 'LILLAH'
  | 'GORAOBA'
  | 'BOARDING'
  | 'BUILDING'
  | 'MAHFIL'
  | 'PROJECT'
  | 'CUSTOM';

export interface FundEntity {
  id: string;
  tenantId: string;
  fundCode?: FundCodeType;
  nameBangla: string;
  nameEnglish: string;
  currentBalance: number;
  isRestricted: boolean;
  restrictionPurpose?: string;
  targetAmount?: number;
  description?: string;
  color?: string;
}

export type DonorCategory = 
  | 'GENERAL'
  | 'LIFETIME'
  | 'CORPORATE'
  | 'EXPATRIATE'
  | 'MONTHLY_SPONSOR'
  | 'WELL_WISHER';

export interface DonorEntity {
  id: string;
  tenantId: string;
  donorNo: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  isRegularDonor: boolean;
  monthlyCommitment?: number;
  category: DonorCategory;
  notes?: string;
  totalDonated: number;
  donationCount: number;
  lastDonationDate?: string;
  createdAt: string;
}

export interface ProjectEntity {
  id: string;
  tenantId: string;
  name: string;
  targetAmount: number;
  raisedAmount: number;
  fundId: string;
  fundName: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  description?: string;
}

export interface DonationEntity {
  id: string;
  tenantId: string;
  receiptNo: string;
  donorId?: string;
  donorName: string;
  donorMobile: string;
  donorAddress?: string;
  donorCategory?: DonorCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  fundId: string;
  fundName: string;
  fundCode?: FundCodeType;
  projectId?: string;
  projectName?: string;
  paymentMethod: PaymentMethod;
  accountId?: string;
  accountName?: string;
  chequeOrTxnRef?: string;
  remarks?: string;
  isZakatEligible?: boolean;
  status: 'CONFIRMED' | 'VOIDED';
  createdBy: string;
  createdAt: string;
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
}

export interface FundTransferAuditLog {
  timestamp: string;
  action: string;
  performedBy: string;
  notes?: string;
}

export interface FundTransferEntity {
  id: string;
  tenantId: string;
  transferNo: string;
  fromFundId: string;
  fromFundName: string;
  toFundId: string;
  toFundName: string;
  amount: number;
  date: string;
  purpose: string;
  shariahJustification?: string;
  authorizedBy: string;
  authorizedRole: string;
  fatwaOrResolutionRef?: string;
  isRestrictedTransfer: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  auditTrail: FundTransferAuditLog[];
}

export interface AccountEntity {
  id: string;
  tenantId: string;
  accountName: string;
  accountType: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  balance: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface StudentFeeEntity {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  studentRoll: number;
  className: string;
  classId?: string;
  feeType: string;
  feeCategory?: FeeCategory | string;
  monthYear: string;
  originalAmount: number;
  waiverDiscount: number;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  status: FeeStatus;
  dueDate?: string;
  createdAt?: string;
  notes?: string;
}

export interface FeePaymentRecord {
  id: string;
  tenantId: string;
  feeId: string;
  studentId: string;
  studentName: string;
  studentRoll?: number;
  className: string;
  receiptNo: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receivedBy: string;
  notes?: string;
  transactionRef?: string;
  previousPaid: number;
  remainingDue: number;
  // Professional Receipt Fields (Phase 11)
  feeType?: string;
  feeCategory?: FeeCategory | string;
  monthYear?: string;
  originalAmount?: number;
  waiverDiscount?: number;
  netPayable?: number;
  status?: 'VALID' | 'VOIDED';
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  reversalVoucherNo?: string;
  reprintCount?: number;
  lastReprintedAt?: string;
}

export type ReceiptRecord = FeePaymentRecord;

export interface VoidReceiptPayload {
  reason: string;
  voidedBy?: string;
}

export interface ClassFeeStructure {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  feeCategory: FeeCategory | string;
  feeName: string;
  amount: number;
  frequency: FeeFrequency;
  description?: string;
}

export interface StudentLedgerEntry {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  type: 'FEE_CHARGED' | 'PAYMENT_RECEIVED' | 'WAIVER_APPLIED';
  description: string;
  referenceId: string;
  debit: number; // Charges/Invoices increase amount owed
  credit: number; // Payments/Waivers reduce amount owed
  balance: number; // Cumulative due balance
}

export interface TransactionEntity {
  id: string;
  tenantId: string;
  voucherNo: string;
  fundId?: string;
  fundName: string;
  accountId?: string;
  accountName: string;
  accountType?: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory | string;
  amount: number;
  transactionDate: string;
  description: string;
  createdBy: string;
  reference: string;
  status: ApprovalStatus;
  reversalOf?: string;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface DailyClosingEntity {
  id: string;
  tenantId: string;
  closingDate: string; // YYYY-MM-DD
  openingCashBalance: number;
  openingBankBalance: number;
  totalCashIncome: number;
  totalBankIncome: number;
  totalCashExpense: number;
  totalBankExpense: number;
  closingCashBalance: number;
  closingBankBalance: number;
  totalClosingBalance: number;
  physicalCashCount?: number;
  discrepancy?: number;
  notes?: string;
  closedBy: string;
  closedAt: string;
  status: 'CLOSED' | 'VERIFIED';
  verifiedBy?: string;
}

export interface NoticeEntity {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  targetRole?: RoleType;
  publishDate: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface AttendanceAuditEntry {
  timestamp: string;
  changedBy: string;
  changedByRole?: string;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  reason: string;
}

export interface AttendanceEntity {
  id: string;
  tenantId: string;
  studentId?: string;
  studentName?: string;
  rollNo?: number;
  studentIdCardNo?: string;
  staffId?: string;
  staffName?: string;
  staffEmployeeId?: string;
  staffDesignation?: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  department?: DepartmentType;
  shiftId?: string;
  shiftName?: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes?: number;
  remarks?: string;
  source?: 'MANUAL' | 'BIOMETRIC' | 'RFID' | 'BULK_ACTION';
  biometricDeviceId?: string;
  biometricLogId?: string;
  isLocked?: boolean;
  auditHistory?: AttendanceAuditEntry[];
}

export interface BiometricDeviceEntity {
  id: string;
  tenantId: string;
  deviceName: string;
  deviceModel: string;
  ipAddress: string;
  port: number;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  lastSyncTime?: string;
  totalPunchesToday: number;
  deviceType: 'STUDENT_GATE' | 'STAFF_ROOM' | 'DORMITORY' | 'MAIN_GATE';
}

export interface BiometricPunchLog {
  id: string;
  tenantId: string;
  deviceId: string;
  deviceName: string;
  userType: 'STUDENT' | 'STAFF';
  userRefId: string;
  userCardOrEmpId: string;
  userName: string;
  punchTime: string;
  punchDate: string;
  punchType: 'CHECK_IN' | 'CHECK_OUT';
  verifyMode: 'FINGERPRINT' | 'FACE' | 'RFID_CARD' | 'PASSWORD';
  syncedToAttendance: boolean;
}

export interface AttendanceLockConfig {
  id: string;
  tenantId: string;
  autoLockEnabled: boolean;
  cutoffTime: string; // e.g. "10:30"
  allowAdminCorrection: boolean;
  pastDaysEditable: number;
  holidayDates: string[];
  weeklyHolidays: number[]; // [5] = Friday
}

export interface SmsAlertRecord {
  id: string;
  tenantId: string;
  recipientName: string;
  recipientMobile: string;
  studentName: string;
  rollNo: number;
  className: string;
  date: string;
  messageText: string;
  sentAt: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
}

export type ExamType =
  | 'FIRST_TERM'
  | 'SECOND_TERM'
  | 'ANNUAL'
  | 'MONTHLY_TEST'
  | 'ADMISSION'
  | 'MODEL_TEST'
  | 'TUTORIAL'
  | 'FINAL'
  | 'TERMINAL_1'
  | 'TERMINAL_2'
  | 'ANNUAL_EXAM';

export type ExamWorkflowStatus =
  | 'DRAFT'
  | 'MARKS_ENTRY'
  | 'TABULATION'
  | 'VERIFICATION'
  | 'REVIEWED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'LOCKED';

export interface ExamEntity {
  id: string;
  tenantId: string;
  name: string;
  nameBangla?: string;
  nameEnglish?: string;
  nameArabic?: string;
  type?: ExamType | string;
  examType?: ExamType | string;
  term?: string;
  year?: number;
  academicSession?: string;
  academicSessionId?: string;
  academicSessionName?: string;
  hijriDate?: string;
  hijriStartDate?: string;
  hijriEndDate?: string;
  gradingSystem?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ExamWorkflowStatus;
  workflowStatus?: ExamWorkflowStatus;
  isLocked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  gradingConfigId?: string;
  totalMarks?: number;
  passMarks?: number;
  publishedAt?: string;
  publishedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectMarkItem {
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  fullMarks: number;
  passMarks: number;
  writtenMarks?: number;
  oralMarks?: number;
  mcqMarks?: number;
  practicalMarks?: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gradeBangla?: string;
  gpaPoint: number;
  isPassed: boolean;
  remarks?: string;
}

export interface ResultEntity {
  id: string;
  tenantId: string;
  examId: string;
  examName?: string;
  examTerm?: string;
  academicYear?: string | number;
  studentId: string;
  studentName: string;
  studentNameEnglish?: string;
  studentNameArabic?: string;
  rollNo: number;
  classId?: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  guardianName?: string;
  guardianMobile?: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage?: number;
  gpa?: number;
  grade?: string;
  gradeBangla?: string;
  gpaOrGrade: string;
  position?: number;
  passed: boolean;
  failedSubjectCount?: number;
  subjectMarks?: SubjectMarkItem[];
  attendancePercentage?: number;
  conductOrAkhlaq?: string;
  remarks?: string;
  status?: 'DRAFT' | 'REVIEWED' | 'PUBLISHED';
  publishedAt?: string;
  publishedBy?: string;
  calculatedAt?: string;
}

export interface SubjectPerformanceItem {
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

export interface ClassPerformanceSummary {
  classId: string;
  className: string;
  examId: string;
  examName: string;
  totalStudents: number;
  appearedStudents: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  highestMarks: number;
  lowestMarks: number;
  averageMarks: number;
  averageGpa: number;
  gradeDistribution: Record<string, number>;
  subjectPerformances: SubjectPerformanceItem[];
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    rollNo: number;
    totalObtainedMarks: number;
    percentage: number;
    gpa: number;
    grade: string;
    positionInClass: number;
  }>;
}

export interface ExamSubjectEntity {
  id: string;
  tenantId: string;
  examId: string;
  classId: string;
  className?: string;
  subjectId?: string;
  subjectName: string;
  subjectCode?: string;
  fullMarks: number;
  passMarks: number;
  theoryFullMarks?: number;
  oralFullMarks?: number;
  mcqFullMarks?: number;
  roomNo?: string;
  writtenMarks?: number;
  oralMarks?: number;
  mcqMarks?: number;
  practicalMarks?: number;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  isMandatory?: boolean;
}

export interface ExamStudentRegistrationEntity {
  id: string;
  tenantId: string;
  examId: string;
  studentId: string;
  rollNo: number;
  classId: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  studentNameBangla?: string;
  studentNameEnglish?: string;
  studentName?: string;
  studentIdCardNo?: string;
  registrationNo?: string;
  admitCardIssued: boolean;
  clearanceGiven?: boolean;
  feeCleared?: boolean;
  registeredAt?: string;
  status: 'REGISTERED' | 'EXEMPTED' | 'SUSPENDED';
}

export interface ExamMarkEntity {
  id: string;
  tenantId: string;
  examId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  subjectName?: string;
  studentId: string;
  rollNo: number;
  studentName: string;
  writtenMarks?: number;
  theoryMarks?: number;
  oralMarks?: number;
  mcqMarks?: number;
  practicalMarks?: number;
  obtainedMarks?: number;
  totalObtained?: number;
  fullMarks: number;
  passMarks: number;
  isPassed: boolean;
  grade?: string;
  gradeBangla?: string;
  gpaPoint?: number;
  remarks?: string;
  isAbsent?: boolean;
  isExpelled?: boolean;
  isLocked?: boolean;
  enteredByTeacherId?: string;
  enteredByTeacherName?: string;
  enteredBy?: string;
  enteredAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ExamAuditLogEntity {
  id: string;
  tenantId: string;
  examId: string;
  examName?: string;
  classId?: string;
  className?: string;
  studentId?: string;
  studentName?: string;
  rollNo?: number;
  subjectId?: string;
  subjectName?: string;
  resolutionNo?: string;
  action?: string;
  details?: string;
  previousTheoryMarks?: number;
  previousOralMarks?: number;
  previousMcqMarks?: number;
  newTheoryMarks?: number;
  newOralMarks?: number;
  newMcqMarks?: number;
  previousTotal?: number;
  newTotal?: number;
  previousGrade?: string;
  newGrade?: string;
  reason?: string;
  changedByName?: string;
  changedByRole?: string;
  correctedBy?: string;
  correctedByRole?: string;
  correctedAt?: string;
  performedBy?: string;
  performedAt?: string;
  createdAt?: string;
}

export interface TenantSession {
  user: User;
  token: string;
  activeTenantId: string;
  impersonatedTenantId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// -------------------------------------------------------------
// Phase 04: Granular Permissions & Auth Types
// -------------------------------------------------------------
export type PermissionCode =
  | 'student.view'
  | 'student.create'
  | 'student.edit'
  | 'student.delete'
  | 'attendance.view'
  | 'attendance.manage'
  | 'fee.view'
  | 'fee.collect'
  | 'finance.view'
  | 'finance.manage'
  | 'result.enter'
  | 'result.publish'
  | 'teacher.manage'
  | 'teacher.view'
  | 'teacher.view_own'
  | 'report.view'
  | 'notice.manage'
  | 'settings.manage';

export interface AuthSession {
  token: string;
  user: User;
  tenantId: string;
  permissions: PermissionCode[];
  expiresAt: string; // ISO string
  rememberMe: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  identifier: string; // username, email, or mobile
  password: string;
  tenantId?: string;
  rememberMe?: boolean;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  identifier: string;
  method: 'EMAIL' | 'SMS';
}

export interface PasswordResetSubmit {
  identifier: string;
  resetToken: string;
  newPassword: string;
}

export interface RateLimitState {
  isLocked: boolean;
  attemptsCount: number;
  maxAttempts: number;
  lockoutRemainingSeconds: number;
  lockoutUntil?: string;
}

// -------------------------------------------------------------
// Phase 07: Admission System Types & Workflow Interfaces
// -------------------------------------------------------------
export enum AdmissionType {
  NEW_ADMISSION = 'NEW_ADMISSION',   // নতুন ভর্তি
  READMISSION = 'READMISSION',       // পুনঃভর্তি
  TRANSFER_IN = 'TRANSFER_IN',       // ছাড়পত্র নিয়ে ভর্তি (Transfer In)
  PROMOTION = 'PROMOTION',           // উত্তীর্ণ হয়ে ভর্তি (Promotion)
}

export enum WaiverCategory {
  NONE = 'NONE',                     // সাধারণ / কোনো বিশেষ ছাড় নেই
  GENERAL = 'GENERAL',               // সাধারণ ছাড়
  ORPHAN_YATEEM = 'ORPHAN_YATEEM',   // এতিম / লিল্লাহ বৃত্তি
  POOR_STUDENT = 'POOR_STUDENT',     // অসচ্ছল / দরিদ্র শিক্ষার্থী
  MERIT_SCHOLAR = 'MERIT_SCHOLAR',   // মেধা বৃত্তি / হাফেজ
  STAFF_WARD = 'STAFF_WARD',         // শিক্ষক / কর্মচারীর সন্তান
  SIBLING_DISCOUNT = 'SIBLING_DISCOUNT', // ভাই-বোন ডিসকাউন্ট
}

export interface GuardianEntity {
  id: string;
  tenantId: string;
  studentId: string;
  guardianName: string;
  relation: string; // পিতা / মাতা / চাচা / বড় ভাই / দাদা / অন্যান্য
  mobile: string;
  nid?: string;
  occupation?: string;
  email?: string;
  annualIncome?: number;
  emergencyContact?: boolean;
  address?: string;
  createdAt: string;
}

export interface AdmissionFeeBreakdown {
  admissionFee: number;       // মূল ভর্তি ফি
  sessionFee: number;         // বার্ষিক সেশন ফি
  idCardAndDiaryFee: number;  // আইডি কার্ড ও ডায়েরি ফি
  monthlyTuitionFee: number;  // প্রথম মাসের টিউশন ফি
  boardingCharge: number;     // বোর্ডিং / আবাসিক চার্জ
  otherFee: number;           // অন্যান্য বিবিধ ফি
}

export interface AdmissionReceiptEntity {
  id: string;
  tenantId: string;
  receiptNo: string;
  formNo: string;
  admissionNo: string;
  studentId: string;
  studentNameBangla: string;
  studentNameEnglish: string;
  studentPhotoUrl?: string;
  fatherName?: string;
  guardianName: string;
  guardianMobile: string;
  className: string;
  sectionName?: string;
  sessionName: string;
  rollNo: number;
  admissionType: AdmissionType;
  admissionDate: string;
  isResidential: boolean;
  feeBreakdown: AdmissionFeeBreakdown;
  totalAmount: number;
  discountAmount: number;
  waiverCategory: WaiverCategory;
  waiverReason?: string;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: FeeStatus;
  accountName?: string;
  voucherNo?: string;
  collectedBy: string;
  notes?: string;
  createdAt: string;
}

export interface AdmissionFormData {
  // Step 1: Student Information
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  bloodGroup: string;
  religion: string;
  birthCertificateNo?: string;
  previousInstitution?: string;
  previousClassOrExam?: string;
  previousResult?: string;
  isResidential: boolean;
  residenceHall?: string;
  roomNo?: string;
  bedNo?: string;
  medicalNotes?: string;
  generalNotes?: string;

  // Step 2: Guardian Information
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  guardianNid?: string;
  guardianOccupation?: string;
  guardianEmail?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobile?: string;
  fatherNid?: string;
  motherName?: string;
  motherOccupation?: string;
  motherMobile?: string;
  motherNid?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Step 3: Academic Information
  admissionType: AdmissionType;
  admissionDate: string;
  formNumber: string;
  admissionNo: string;
  sessionId: string;
  sessionName: string;
  department: DepartmentType;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  shiftId?: string;
  shiftName?: string;
  rollNo: number;
  dakhilaNo?: string;
  registrationNo?: string;

  // Step 4: Address Information
  presentDivision: string;
  presentDistrict: string;
  presentThana: string;
  presentPostCode?: string;
  presentAddress: string;
  permanentDivision: string;
  permanentDistrict: string;
  permanentThana: string;
  permanentPostCode?: string;
  permanentAddress: string;
  isPermanentSameAsPresent: boolean;

  // Step 5: Documents
  documents: StudentDocument[];

  // Step 6: Photo
  photoUrl: string;
  guardianPhotoUrl?: string;

  // Step 7: Admission Fee & Payment
  feeBreakdown: AdmissionFeeBreakdown;
  waiverCategory: WaiverCategory;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  discountAmount: number;
  waiverReason?: string;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  targetAccountId?: string;
  targetFundId?: string;
  paymentReference?: string;
  receiptNotes?: string;
}

export interface AdmissionTransactionResult {
  student: StudentEntity;
  guardian: GuardianEntity;
  feeRecord: StudentFeeEntity;
  transaction?: TransactionEntity | null;
  receipt: AdmissionReceiptEntity;
  auditLogId: string;
}

export interface HomeworkEntity {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  attachmentName?: string;
  deadline: string; // ISO date string YYYY-MM-DDTHH:mm
  isPublished: boolean;
  isCompleted: boolean;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface LessonPlanEntity {
  id: string;
  tenantId: string;
  date: string; // YYYY-MM-DD
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  learningObjective: string;
  activities: string;
  homeworkRef?: string;
  notes?: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

// -------------------------------------------------------------
// Phase 17: Examinations, Grading & Marksheet Types
// -------------------------------------------------------------
export type GradingSystemType = 'QAWMI' | 'ALIA_GPA';

export interface ExamSubjectMark {
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  passMarks: number;
  obtainedWritten: number;
  obtainedOral?: number;
  obtainedHifz?: number;
  totalObtained: number;
  grade: string;
  gradePoint?: number;
  passed: boolean;
}

export interface DetailedExamResultEntity extends Omit<ResultEntity, 'subjectMarks'> {
  sectionName?: string;
  gradingSystem: GradingSystemType;
  percentage: number;
  subjectMarks: (SubjectMarkItem | ExamSubjectMark)[];
  attendanceRate?: number;
  behaviorScore?: string;
  remarks?: string;
  publishedAt?: string;
}

// -------------------------------------------------------------
// Phase 18: SMS Notification Engine Types
// -------------------------------------------------------------
export interface SmsTemplateEntity {
  id: string;
  tenantId: string;
  title: string;
  category: 'ATTENDANCE_ABSENT' | 'FEE_REMINDER' | 'EXAM_RESULT' | 'GENERAL_NOTICE' | 'EMERGENCY_HOLIDAY';
  bodyBangla: string;
  variables: string[];
  isDefault: boolean;
}

export interface SmsGatewayConfig {
  provider: 'GREENWEB' | 'ELITBUZZ' | 'TELETALK' | 'BANGLALINK' | 'INFOBIP' | 'CUSTOM';
  apiKey: string;
  senderId: string;
  balanceCredits: number;
  perSmsCost: number;
  isActive: boolean;
}

// -------------------------------------------------------------
// Phase 19: Reports & Analytics Summaries
// -------------------------------------------------------------
export interface ExecutiveMuhtamimSummary {
  tenantName: string;
  totalStudents: number;
  activeStudents: number;
  residentialStudents: number;
  totalStaff: number;
  todayAttendancePercent: number;
  monthFeesTotal: number;
  monthFeesCollected: number;
  monthFeesDue: number;
  cashInHand: number;
  bankBalance: number;
  zakatFundBalance: number;
  generalFundBalance: number;
  lillahFundBalance: number;
  recentDonationsTotal: number;
}

// -------------------------------------------------------------
// Phase 20: Class Routine & Conflict Management System
// -------------------------------------------------------------
export type DayOfWeek =
  | 'SATURDAY'
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY';

export interface RoutinePeriod {
  periodNumber: number;
  periodName: string;
  startTime: string; // "08:00"
  endTime: string;   // "08:45"
  isBreak?: boolean;
}

export interface ClassRoutineSlotEntity {
  id: string;
  tenantId: string;
  academicSessionId?: string;
  academicSessionName?: string;
  classId: string;
  className: string;
  sectionId?: string;
  sectionName?: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  periodName?: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  teacherId: string;
  teacherName: string;
  teacherEmployeeId?: string;
  roomNo?: string;
  buildingName?: string;
  shiftId?: string;
  shiftName?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export type RoutineConflictType =
  | 'TEACHER_DOUBLE_BOOKED'
  | 'ROOM_DOUBLE_BOOKED'
  | 'CLASS_DOUBLE_BOOKED';

export interface RoutineConflict {
  id: string;
  type: RoutineConflictType;
  title: string;
  description: string;
  severity: 'ERROR' | 'WARNING';
  conflictingSlot: Partial<ClassRoutineSlotEntity>;
  existingSlot: ClassRoutineSlotEntity;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface RoutineTemplateSlot {
  id?: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  periodName?: string;
  startTime: string;
  endTime: string;
  subjectId?: string;
  subjectName: string;
  subjectCode?: string;
  teacherId?: string;
  teacherName?: string;
  roomNo?: string;
  shiftId?: string;
  shiftName?: string;
  note?: string;
}

export interface RoutineTemplateEntity {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category?: 'QAWMI_KITAB' | 'HIFZ' | 'NOORANI' | 'GENERAL' | 'CUSTOM' | string;
  classId?: string;
  className?: string;
  shiftId?: string;
  shiftName?: string;
  slots: RoutineTemplateSlot[];
  isDefault?: boolean;
  tags?: string[];
  totalWeeklyPeriods: number;
  createdAt: string;
  updatedAt?: string;
}


