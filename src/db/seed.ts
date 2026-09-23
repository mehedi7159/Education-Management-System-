/**
 * Production-Grade Seed Data for Madrasah Management & Administration SaaS
 * Phase 02: Relational Seed Generator
 */

import {
  TenantModel,
  UserModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
  UserRoleModel,
  AcademicSessionModel,
  DepartmentModel,
  ShiftModel,
  ClassModel,
  SectionModel,
  SubjectModel,
  ClassSubjectModel,
  TeacherSubjectModel,
  StudentModel,
  GuardianModel,
  StudentGuardianModel,
  StudentDocumentModel,
  StudentAcademicHistoryModel,
  AttendanceModel,
  HomeworkModel,
  LessonPlanModel,
  FeeTypeModel,
  StudentFeeModel,
  FeePaymentModel,
  ReceiptModel,
  FundModel,
  IncomeModel,
  ExpenseModel,
  FundTransferModel,
  DonorModel,
  DonationModel,
  SupplierModel,
  PurchaseModel,
  StaffModel,
  SalaryModel,
  SalaryPaymentModel,
  AdvanceModel,
  LeaveModel,
  ExamModel,
  ExamSubjectModel,
  ExamRegistrationModel,
  MarksModel,
  ResultModel,
  RoutineModel,
  NoticeModel,
  NotificationModel,
  AssetModel,
  CertificateModel,
  PromotionModel,
  AuditLogModel,
  SystemSettingModel,
  InstitutionSettingModel,
  SubscriptionModel,
  LicenseModel,
} from './schema';

import {
  SubscriptionPlan,
  MadrasahType,
  RoleType,
  DepartmentType,
  StudentStatus,
  AttendanceStatus,
  PaymentMethod,
  FeeStatus,
  ApprovalStatus,
} from '../types';

export interface ComprehensiveSeedDatabase {
  tenants: TenantModel[];
  users: UserModel[];
  roles: RoleModel[];
  permissions: PermissionModel[];
  rolePermissions: RolePermissionModel[];
  userRoles: UserRoleModel[];
  academicSessions: AcademicSessionModel[];
  departments: DepartmentModel[];
  shifts: ShiftModel[];
  classes: ClassModel[];
  sections: SectionModel[];
  subjects: SubjectModel[];
  classSubjects: ClassSubjectModel[];
  teacherSubjects: TeacherSubjectModel[];
  students: StudentModel[];
  guardians: GuardianModel[];
  studentGuardians: StudentGuardianModel[];
  studentDocuments: StudentDocumentModel[];
  studentAcademicHistories: StudentAcademicHistoryModel[];
  attendances: AttendanceModel[];
  homeworks: HomeworkModel[];
  lessonPlans: LessonPlanModel[];
  feeTypes: FeeTypeModel[];
  studentFees: StudentFeeModel[];
  feePayments: FeePaymentModel[];
  receipts: ReceiptModel[];
  funds: FundModel[];
  incomes: IncomeModel[];
  expenses: ExpenseModel[];
  fundTransfers: FundTransferModel[];
  donors: DonorModel[];
  donations: DonationModel[];
  suppliers: SupplierModel[];
  purchases: PurchaseModel[];
  staff: StaffModel[];
  salaries: SalaryModel[];
  salaryPayments: SalaryPaymentModel[];
  advances: AdvanceModel[];
  leaves: LeaveModel[];
  exams: ExamModel[];
  examSubjects: ExamSubjectModel[];
  examRegistrations: ExamRegistrationModel[];
  marks: MarksModel[];
  results: ResultModel[];
  routines: RoutineModel[];
  notices: NoticeModel[];
  notifications: NotificationModel[];
  assets: AssetModel[];
  certificates: CertificateModel[];
  promotions: PromotionModel[];
  auditLogs: AuditLogModel[];
  systemSettings: SystemSettingModel[];
  institutionSettings: InstitutionSettingModel[];
  subscriptions: SubscriptionModel[];
  licenses: LicenseModel[];
}

export const SEED_DATA: ComprehensiveSeedDatabase = {
  // 1. Tenants
  tenants: [
    {
      id: 'tenant-001',
      code: 'DARUL_ULOOM_DHK',
      nameBangla: 'জামেয়া ইসলামিয়া দারুল উলুম ঢাকা',
      nameEnglish: 'Jamia Islamia Darul Uloom Dhaka',
      nameArabic: 'الجامعة الإسلامية دار العلوم دكا',
      madrasahType: MadrasahType.QAWMI,
      eiinCode: '134521',
      registrationNo: 'REG-QWM-8401',
      establishedYear: 1984,
      address: 'মিরপুর-১২, ঢাকা-১২১৬',
      district: 'ঢাকা',
      division: 'ঢাকা',
      phone: '01712-345678',
      email: 'info@darululoomdhaka.edu.bd',
      website: 'https://darululoomdhaka.edu.bd',
      currency: 'BDT',
      planType: SubscriptionPlan.PROFESSIONAL,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'tenant-002',
      code: 'AL_HIKMAH_CTG',
      nameBangla: 'আল হিকমাহ ইসলামিক ক্যাডেট মাদ্রাসা',
      nameEnglish: 'Al-Hikmah Islamic Cadet Madrasah',
      nameArabic: 'مدرسة الحكمة الإسلامية النموذجية',
      madrasahType: MadrasahType.CADET,
      eiinCode: '145672',
      registrationNo: 'REG-CDT-1205',
      establishedYear: 2012,
      address: 'হালিশহর, চট্টগ্রাম',
      district: 'চট্টগ্রাম',
      division: 'চট্টগ্রাম',
      phone: '01812-987654',
      email: 'contact@alhikmah.edu.bd',
      website: 'https://alhikmah.edu.bd',
      currency: 'BDT',
      planType: SubscriptionPlan.ENTERPRISE,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  // 2. Users
  users: [
    {
      id: 'usr-super',
      username: 'superadmin',
      email: 'admin@madrasah.saas',
      mobile: '01700000001',
      passwordHash: '$2a$12$e8x/kZ1N...hash...',
      fullName: 'মাওলানা আব্দুল্লাহ আল-মামুন (সিস্টেম অ্যাডমিন)',
      role: RoleType.SUPER_ADMIN,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'usr-admin',
      tenantId: 'tenant-001',
      username: 'admin_dhaka',
      email: 'admin@darululoomdhaka.edu.bd',
      mobile: '01711111111',
      passwordHash: '$2a$12$e8x/kZ1N...hash...',
      fullName: 'মাওলানা মাহমুদ হাসান (প্রশাসক)',
      role: RoleType.INSTITUTION_ADMIN,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'usr-accountant',
      tenantId: 'tenant-001',
      username: 'accountant',
      email: 'accounts@darululoomdhaka.edu.bd',
      mobile: '01733333333',
      passwordHash: '$2a$12$e8x/kZ1N...hash...',
      fullName: 'মাওলানা হাবিবুর রহমান (হিসাবরক্ষক)',
      role: RoleType.ACCOUNTANT,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'usr-teacher',
      tenantId: 'tenant-001',
      username: 'teacher_tariq',
      email: 'tariq@darululoomdhaka.edu.bd',
      mobile: '01744444444',
      passwordHash: '$2a$12$e8x/kZ1N...hash...',
      fullName: 'মুফতি তারিক জামিল (সিনিয়র ওস্তাদ)',
      role: RoleType.TEACHER,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  // 3. Roles & Permissions
  roles: [
    { id: 'role-super', code: 'SUPER_ADMIN', name: 'সুপার অ্যাডমিন', isSystemRole: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'role-inst-admin', tenantId: 'tenant-001', code: 'INSTITUTION_ADMIN', name: 'প্রতিষ্ঠান অ্যাডমিন', isSystemRole: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'role-muhtamim', tenantId: 'tenant-001', code: 'MUHTAMIM', name: 'মুহতামিম / প্রিন্সিপাল', isSystemRole: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'role-accountant', tenantId: 'tenant-001', code: 'ACCOUNTANT', name: 'হিসাবরক্ষক / ক্যাশিয়ার', isSystemRole: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'role-teacher', tenantId: 'tenant-001', code: 'TEACHER', name: 'শিক্ষক / ওস্তাদ', isSystemRole: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'role-guardian', tenantId: 'tenant-001', code: 'GUARDIAN', name: 'অভিভাবক', isSystemRole: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'role-student', tenantId: 'tenant-001', code: 'STUDENT', name: 'শিক্ষার্থী', isSystemRole: true, createdAt: '2025-01-01T00:00:00Z' },
  ],

  permissions: [
    { id: 'p-1', module: 'STUDENTS', action: 'CREATE', code: 'STUDENTS:CREATE', description: 'নতুন ছাত্র ভর্তি নিবন্ধন', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'p-2', module: 'STUDENTS', action: 'READ', code: 'STUDENTS:READ', description: 'শিক্ষার্থী তথ্য অবলোকন', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'p-3', module: 'FEES', action: 'COLLECT', code: 'FEES:COLLECT', description: 'ফি আদায় ও মানিরিসিপ্ট প্রিন্ট', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'p-4', module: 'ACCOUNTING', action: 'APPROVE', code: 'ACCOUNTING:APPROVE', description: 'ভাউচার ও তহবিল ছাড় অনুমোদন', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'p-5', module: 'ATTENDANCE', action: 'TAKE', code: 'ATTENDANCE:TAKE', description: 'দৈনিক রোলকল ও হাজিরা এন্ট্রি', createdAt: '2025-01-01T00:00:00Z' },
  ],

  rolePermissions: [
    { id: 'rp-1', roleId: 'role-inst-admin', permissionId: 'p-1', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'rp-2', roleId: 'role-inst-admin', permissionId: 'p-2', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'rp-3', roleId: 'role-accountant', permissionId: 'p-3', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'rp-4', roleId: 'role-muhtamim', permissionId: 'p-4', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'rp-5', roleId: 'role-teacher', permissionId: 'p-5', createdAt: '2025-01-01T00:00:00Z' },
  ],

  userRoles: [
    { id: 'ur-1', userId: 'usr-admin', roleId: 'role-inst-admin', assignedAt: '2025-01-01T00:00:00Z' },
    { id: 'ur-2', userId: 'usr-accountant', roleId: 'role-accountant', assignedAt: '2025-01-01T00:00:00Z' },
    { id: 'ur-3', userId: 'usr-teacher', roleId: 'role-teacher', assignedAt: '2025-01-01T00:00:00Z' },
  ],

  // 4. Academic Sessions
  academicSessions: [
    {
      id: 'sess-2025',
      tenantId: 'tenant-001',
      name: 'শিক্ষাবর্ষ ২০২৫-২০২৬',
      hijriYear: '১৪৪৬-১৪৪৭ হিজরি',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isCurrent: true,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  // 5. Departments
  departments: [
    { id: 'dept-1', tenantId: 'tenant-001', type: DepartmentType.NURANI, nameBangla: 'নূরানী বিভাগ', nameEnglish: 'Nurani Dept', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'dept-2', tenantId: 'tenant-001', type: DepartmentType.HIFZ, nameBangla: 'হিফজুল কুরআন বিভাগ', nameEnglish: 'Hifz Dept', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'dept-3', tenantId: 'tenant-001', type: DepartmentType.KITAB, nameBangla: 'কিতাব বিভাগ', nameEnglish: 'Kitab Dept', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'dept-4', tenantId: 'tenant-001', type: DepartmentType.DAWRA_HADITH, nameBangla: 'দাওরায়ে হাদিস (তাকমীল)', nameEnglish: 'Dawra-e-Hadith', createdAt: '2025-01-01T00:00:00Z' },
  ],

  // 6. Shifts
  shifts: [
    { id: 'shf-1', tenantId: 'tenant-001', name: 'প্রভাতী শিফট', startTime: '06:30 AM', endTime: '12:00 PM', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'shf-2', tenantId: 'tenant-001', name: 'দিবা শিফট', startTime: '09:00 AM', endTime: '04:30 PM', createdAt: '2025-01-01T00:00:00Z' },
  ],

  // 7. Classes
  classes: [
    { id: 'cls-1', tenantId: 'tenant-001', departmentId: 'dept-1', nameBangla: 'নূরানী ১ম শ্রেণি', nameEnglish: 'Nurani Class One', orderIndex: 1, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cls-2', tenantId: 'tenant-001', departmentId: 'dept-2', nameBangla: 'হিফজুল কুরআন বিভাগ', nameEnglish: 'Hifzul Quran', orderIndex: 2, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cls-3', tenantId: 'tenant-001', departmentId: 'dept-3', nameBangla: 'মীযান ও নাহবেমীর (কিতাব)', nameEnglish: 'Mizan & Nahbemir', orderIndex: 3, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cls-4', tenantId: 'tenant-001', departmentId: 'dept-3', nameBangla: 'শরহে বেকায়া (কিতাব)', nameEnglish: 'Sharhe Bekaya', orderIndex: 4, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cls-5', tenantId: 'tenant-001', departmentId: 'dept-4', nameBangla: 'দাওরায়ে হাদিস (তাকমীল)', nameEnglish: 'Dawra-e Hadith (Masters)', orderIndex: 5, createdAt: '2025-01-01T00:00:00Z' },
  ],

  // 8. Sections
  sections: [
    { id: 'sec-1', tenantId: 'tenant-001', classId: 'cls-1', shiftId: 'shf-1', name: 'শাখা-ক (আবু বকর রা.)', capacity: 35, roomNumber: '১০১', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'sec-2', tenantId: 'tenant-001', classId: 'cls-2', shiftId: 'shf-1', name: 'হিফজ গ্রুপ-১ (ওসমান রা.)', capacity: 25, roomNumber: '২০১', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'sec-3', tenantId: 'tenant-001', classId: 'cls-3', shiftId: 'shf-2', name: 'শাখা-ক', capacity: 30, roomNumber: '৩০১', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'sec-4', tenantId: 'tenant-001', classId: 'cls-5', shiftId: 'shf-2', name: 'মুহাদ্দিস হল', capacity: 35, roomNumber: '৪০১', createdAt: '2025-01-01T00:00:00Z' },
  ],

  // 9. Subjects
  subjects: [
    { id: 'sub-1', tenantId: 'tenant-001', code: 'NUR-QRN-01', nameBangla: 'কুরআন মজিদ ও তাজবীদ', nameEnglish: 'Quran & Tajweed', nameArabic: 'القرآن المجيد والتجويد', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'sub-2', tenantId: 'tenant-001', code: 'KIT-MIZ-01', nameBangla: 'মীযানুস সারফ ও মুনশাইব', nameEnglish: 'Mizanus Sarf', nameArabic: 'ميزان الصرف', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'sub-3', tenantId: 'tenant-001', code: 'DWR-BUK-01', nameBangla: 'সহীহ আল-বুখারী (১ম ও ২য় খণ্ড)', nameEnglish: 'Sahih Al-Bukhari', nameArabic: 'صحيح البخاري', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'sub-4', tenantId: 'tenant-001', code: 'GEN-BNG-01', nameBangla: 'বাংলা সাহিত্য ও ব্যাকরণ', nameEnglish: 'Bangla Language', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'sub-5', tenantId: 'tenant-001', code: 'GEN-MTH-01', nameBangla: 'গণিত', nameEnglish: 'Mathematics', totalMarks: 100, passMarks: 33, isOptional: false, createdAt: '2025-01-01T00:00:00Z' },
  ],

  classSubjects: [
    { id: 'cs-1', classId: 'cls-1', subjectId: 'sub-1', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cs-2', classId: 'cls-1', subjectId: 'sub-4', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cs-3', classId: 'cls-1', subjectId: 'sub-5', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cs-4', classId: 'cls-3', subjectId: 'sub-2', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'cs-5', classId: 'cls-5', subjectId: 'sub-3', createdAt: '2025-01-01T00:00:00Z' },
  ],

  teacherSubjects: [
    { id: 'ts-1', staffId: 'stf-3', subjectId: 'sub-1', assignedDate: '2025-01-01' },
    { id: 'ts-2', staffId: 'stf-2', subjectId: 'sub-2', assignedDate: '2025-01-01' },
    { id: 'ts-3', staffId: 'stf-1', subjectId: 'sub-3', assignedDate: '2025-01-01' },
  ],

  // 10. Students
  students: [
    {
      id: 'std-001',
      tenantId: 'tenant-001',
      studentIdCardNo: 'DUD-2025-001',
      admissionNo: 'ADM-4421',
      admissionDate: '2025-01-05',
      nameBangla: 'মুহাম্মদ আব্দুল্লাহ',
      nameEnglish: 'Muhammad Abdullah',
      nameArabic: 'محمد عبد الله',
      gender: 'MALE',
      dateOfBirth: '2015-03-12',
      bloodGroup: 'B+',
      birthCertificateNo: '20152692518001234',
      classId: 'cls-1',
      sectionId: 'sec-1',
      rollNo: 1,
      isResidential: false,
      status: StudentStatus.ACTIVE,
      fatherNameBangla: 'মাওলানা রফিকুল ইসলাম',
      motherNameBangla: 'আয়েশা বেগম',
      guardianName: 'মাওলানা রফিকুল ইসলাম',
      guardianRelation: 'পিতা',
      guardianMobile: '01712-445566',
      presentAddress: 'মিরপুর-১০, ঢাকা',
      permanentAddress: 'গ্রাম: চর বাশগাড়ী, রায়পুরা, নরসিংদী',
      createdAt: '2025-01-05T08:00:00Z',
    },
    {
      id: 'std-002',
      tenantId: 'tenant-001',
      studentIdCardNo: 'DUD-2025-002',
      admissionNo: 'ADM-4422',
      admissionDate: '2025-01-06',
      nameBangla: 'মুহাম্মদ ওমর ফারুক',
      nameEnglish: 'Muhammad Omar Faruk',
      gender: 'MALE',
      dateOfBirth: '2014-07-20',
      bloodGroup: 'A+',
      birthCertificateNo: '20142692518005678',
      classId: 'cls-2',
      sectionId: 'sec-2',
      rollNo: 2,
      isResidential: true,
      roomNumber: 'বোর্ডিং-২০৪',
      seatNumber: '০২',
      status: StudentStatus.ACTIVE,
      fatherNameBangla: 'জনাব হারুনুর রশিদ',
      motherNameBangla: 'রোকেয়া খাতুন',
      guardianName: 'জনাব হারুনুর রশিদ',
      guardianRelation: 'পিতা',
      guardianMobile: '01819-334455',
      presentAddress: 'পল্লবী, মিরপুর, ঢাকা',
      permanentAddress: 'হোমনা, কুমিল্লা',
      createdAt: '2025-01-06T09:00:00Z',
    },
    {
      id: 'std-003',
      tenantId: 'tenant-001',
      studentIdCardNo: 'DUD-2025-003',
      admissionNo: 'ADM-4423',
      admissionDate: '2025-01-08',
      nameBangla: 'মুহাম্মদ উসমান গণি',
      nameEnglish: 'Muhammad Usman Goni',
      gender: 'MALE',
      dateOfBirth: '2013-09-15',
      bloodGroup: 'O+',
      classId: 'cls-2',
      sectionId: 'sec-2',
      rollNo: 3,
      isResidential: true,
      roomNumber: 'বোর্ডিং-২০৫',
      seatNumber: '০৩',
      status: StudentStatus.ACTIVE,
      fatherNameBangla: 'জনাব নুরুল ইসলাম',
      motherNameBangla: 'খাদিজা আক্তার',
      guardianName: 'জনাব নুরুল ইসলাম',
      guardianRelation: 'পিতা',
      guardianMobile: '01911-889900',
      presentAddress: 'সাভার, ঢাকা',
      permanentAddress: 'সিংগাইর, মানিকগঞ্জ',
      createdAt: '2025-01-08T10:00:00Z',
    },
    {
      id: 'std-004',
      tenantId: 'tenant-001',
      studentIdCardNo: 'DUD-2025-004',
      admissionNo: 'ADM-4424',
      admissionDate: '2025-01-10',
      nameBangla: 'মুহাম্মদ সালমান ফারসী',
      nameEnglish: 'Salman Farsi',
      gender: 'MALE',
      dateOfBirth: '2011-04-10',
      bloodGroup: 'AB+',
      classId: 'cls-3',
      sectionId: 'sec-3',
      rollNo: 1,
      isResidential: true,
      roomNumber: 'কিতাব হল-৩০২',
      seatNumber: '০১',
      status: StudentStatus.ACTIVE,
      fatherNameBangla: 'মুহাম্মদ মোশাররফ হোসেন',
      motherNameBangla: 'আমেনা খাতুন',
      guardianName: 'মুহাম্মদ মোশাররফ হোসেন',
      guardianRelation: 'পিতা',
      guardianMobile: '01711-223344',
      presentAddress: 'উত্তরা, ঢাকা',
      permanentAddress: 'ভৈরব, কিশোরগঞ্জ',
      createdAt: '2025-01-10T10:30:00Z',
    },
    {
      id: 'std-005',
      tenantId: 'tenant-001',
      studentIdCardNo: 'DUD-2025-005',
      admissionNo: 'ADM-4425',
      admissionDate: '2025-01-12',
      nameBangla: 'মুহাম্মদ আবু বকর সিদ্দিক',
      nameEnglish: 'Abu Bakr Siddiq',
      gender: 'MALE',
      dateOfBirth: '2008-11-25',
      bloodGroup: 'B+',
      classId: 'cls-5',
      sectionId: 'sec-4',
      rollNo: 1,
      isResidential: true,
      roomNumber: 'দাওরায়ে হাদিস হল-৪০১',
      seatNumber: '০১',
      status: StudentStatus.ACTIVE,
      fatherNameBangla: 'আলহাজ্ব বশির আহমেদ',
      motherNameBangla: 'ফাতেমা বেগম',
      guardianName: 'আলহাজ্ব বশির আহমেদ',
      guardianRelation: 'পিতা',
      guardianMobile: '01678-554433',
      presentAddress: 'গাজীপুর সদর',
      permanentAddress: 'শ্রীপুর, গাজীপুর',
      createdAt: '2025-01-12T11:00:00Z',
    },
  ],

  // 11. Guardians
  guardians: [
    {
      id: 'grd-01',
      tenantId: 'tenant-001',
      nameBangla: 'মাওলানা রফিকুল ইসলাম',
      nameEnglish: 'Maulana Rafiqul Islam',
      relation: 'পিতা',
      nidNumber: '19802692518001111',
      mobileNumber: '01712-445566',
      occupation: 'ইমাম ও শিক্ষক',
      yearlyIncome: 240000,
      presentAddress: 'মিরপুর-১০, ঢাকা',
      permanentAddress: 'রায়পুরা, নরসিংদী',
      createdAt: '2025-01-05T08:00:00Z',
    },
  ],

  studentGuardians: [
    { id: 'sg-1', studentId: 'std-001', guardianId: 'grd-01', isPrimary: true, relationType: 'FATHER' },
  ],

  studentDocuments: [
    { id: 'doc-1', studentId: 'std-001', title: 'ডিজিটাল জন্ম সনদ', documentType: 'BIRTH_CERTIFICATE', fileUrl: '/uploads/docs/bc_std001.pdf', uploadedAt: '2025-01-05T08:30:00Z' },
  ],

  studentAcademicHistories: [
    { id: 'sah-1', studentId: 'std-001', sessionId: 'sess-2025', classId: 'cls-1', rollNo: 1, gpaOrDivision: 'মুমতাজ (Mumtaz)', passYear: 2024, createdAt: '2025-01-05T08:00:00Z' },
  ],

  // 12. Attendance
  attendances: [
    { id: 'att-1', tenantId: 'tenant-001', date: '2025-02-18', studentId: 'std-001', sectionId: 'sec-1', status: AttendanceStatus.PRESENT, inTime: '07:45 AM', smsSent: false, createdAt: '2025-02-18T08:00:00Z' },
    { id: 'att-2', tenantId: 'tenant-001', date: '2025-02-18', studentId: 'std-002', sectionId: 'sec-2', status: AttendanceStatus.PRESENT, inTime: '06:30 AM', smsSent: false, createdAt: '2025-02-18T08:00:00Z' },
    { id: 'att-3', tenantId: 'tenant-001', date: '2025-02-18', studentId: 'std-003', sectionId: 'sec-2', status: AttendanceStatus.ABSENT, inTime: undefined, smsSent: true, remarks: 'অসুস্থতার কারণে অনুপস্থিত', createdAt: '2025-02-18T08:00:00Z' },
  ],

  homeworks: [
    { id: 'hw-1', tenantId: 'tenant-001', sectionId: 'sec-1', title: 'সূরা আল-ফাতিহা ও সূরা নাস মুখস্থ পড়া', description: 'মাখরাজ ও সিফাত সহ ৫ বার তেলাওয়াত করে ওস্তাদজিকে শুনাতে হবে।', givenDate: '2025-02-18', dueDate: '2025-02-19', createdAt: '2025-02-18T10:00:00Z' },
  ],

  lessonPlans: [
    { id: 'lp-1', tenantId: 'tenant-001', subjectId: 'sub-1', staffId: 'stf-3', topicName: 'নূন সাকিন ও তানভীনের চারটি কায়েদা', targetDate: '2025-02-20', isCompleted: false, createdAt: '2025-02-18T09:00:00Z' },
  ],

  // 13. Financial: FeeTypes, StudentFees, Receipts & Payments
  feeTypes: [
    { id: 'ft-1', tenantId: 'tenant-001', nameBangla: 'মাসিক শিক্ষা ফি (টিউশন)', nameEnglish: 'Monthly Tuition Fee', defaultAmount: 1500, isRecurring: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'ft-2', tenantId: 'tenant-001', nameBangla: 'আবাসিক খানা ও বোর্ডিং চার্জ', nameEnglish: 'Boarding & Food Fee', defaultAmount: 2500, isRecurring: true, createdAt: '2025-01-01T00:00:00Z' },
    { id: 'ft-3', tenantId: 'tenant-001', nameBangla: 'নতুন ভর্তি ও সেশন ফি', nameEnglish: 'Admission & Session Fee', defaultAmount: 3000, isRecurring: false, createdAt: '2025-01-01T00:00:00Z' },
  ],

  studentFees: [
    {
      id: 'fee-01',
      tenantId: 'tenant-001',
      studentId: 'std-001',
      sessionId: 'sess-2025',
      feeTypeId: 'ft-1',
      monthYear: '2025-02',
      originalAmount: 1500,
      waiverAmount: 0,
      netPayable: 1500,
      paidAmount: 1500,
      dueAmount: 0,
      status: FeeStatus.PAID,
      dueDate: '2025-02-10',
      createdAt: '2025-02-01T00:00:00Z',
    },
    {
      id: 'fee-02',
      tenantId: 'tenant-001',
      studentId: 'std-002',
      sessionId: 'sess-2025',
      feeTypeId: 'ft-2',
      monthYear: '2025-02',
      originalAmount: 4000,
      waiverAmount: 1000,
      netPayable: 3000,
      paidAmount: 2000,
      dueAmount: 1000,
      status: FeeStatus.PARTIAL,
      dueDate: '2025-02-10',
      createdAt: '2025-02-01T00:00:00Z',
    },
    {
      id: 'fee-03',
      tenantId: 'tenant-001',
      studentId: 'std-003',
      sessionId: 'sess-2025',
      feeTypeId: 'ft-2',
      monthYear: '2025-02',
      originalAmount: 4000,
      waiverAmount: 0,
      netPayable: 4000,
      paidAmount: 0,
      dueAmount: 4000,
      status: FeeStatus.UNPAID,
      dueDate: '2025-02-10',
      createdAt: '2025-02-01T00:00:00Z',
    },
  ],

  receipts: [
    {
      id: 'rec-001',
      tenantId: 'tenant-001',
      receiptNo: 'REC-2025-00101',
      studentId: 'std-001',
      totalAmount: 1500,
      paymentDate: '2025-02-05T10:00:00Z',
      paymentMethod: PaymentMethod.CASH,
      isCancelled: false,
      createdAt: '2025-02-05T10:00:00Z',
    },
  ],

  feePayments: [
    {
      id: 'pay-001',
      tenantId: 'tenant-001',
      studentFeeId: 'fee-01',
      studentId: 'std-001',
      receiptId: 'rec-001',
      amountPaid: 1500,
      paymentMethod: PaymentMethod.CASH,
      collectedBy: 'usr-accountant',
      paymentDate: '2025-02-05T10:00:00Z',
      createdAt: '2025-02-05T10:00:00Z',
    },
  ],

  // 14. Funds, Incomes, Expenses & Transfers
  funds: [
    {
      id: 'fnd-1',
      tenantId: 'tenant-001',
      nameBangla: 'সাধারণ তহবিল (General Fund)',
      nameEnglish: 'General Fund',
      code: 'FUND_GEN',
      isRestricted: false,
      currentBalance: 385400,
      description: 'ছাত্রদের বেতন ও মাদ্রাসার সার্বিক প্রশাসনিক ব্যয় নির্বাহের মূল তহবিল',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'fnd-2',
      tenantId: 'tenant-001',
      nameBangla: 'লিল্লাহ ও এতিমখানা তহবিল (Lillah Fund)',
      nameEnglish: 'Lillah Fund',
      code: 'FUND_LIL',
      isRestricted: true,
      currentBalance: 542100,
      description: 'যাকাত, ফিতরা ও সদকা; শুধুমাত্র উপযুক্ত গরীব ও এতিম ছাত্রদের জন্য সুনির্দিষ্ট',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'fnd-3',
      tenantId: 'tenant-001',
      nameBangla: 'বোর্ডিং ও খানা তহবিল (Boarding Fund)',
      nameEnglish: 'Boarding Fund',
      code: 'FUND_BRD',
      isRestricted: false,
      currentBalance: 125000,
      description: 'আবাসিক শিক্ষার্থীদের খাদ্য ও বাবুর্চি খরচ',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'fnd-4',
      tenantId: 'tenant-001',
      nameBangla: 'মসজিদ ও ভবন নির্মাণ তহবিল (Building Fund)',
      nameEnglish: 'Building Fund',
      code: 'FUND_BLD',
      isRestricted: true,
      currentBalance: 890000,
      description: 'মাদ্রাসার অবকাঠামো ও স্থায়ী সম্পদ উন্নয়ন',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  incomes: [
    {
      id: 'inc-01',
      tenantId: 'tenant-001',
      fundId: 'fnd-1',
      voucherNo: 'VOUCH-IN-2025-0101',
      category: 'শিক্ষার্থী ফি আদায়',
      amount: 45000,
      incomeDate: '2025-02-18',
      paymentMethod: PaymentMethod.CASH,
      description: 'নূরানী ও কিতাব বিভাগের মাসিক ফি কালেকশন',
      createdBy: 'usr-accountant',
      createdAt: '2025-02-18T12:00:00Z',
    },
    {
      id: 'inc-02',
      tenantId: 'tenant-001',
      fundId: 'fnd-2',
      voucherNo: 'VOUCH-IN-2025-0102',
      category: 'যাকাত অনুদান',
      amount: 100000,
      incomeDate: '2025-02-17',
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      description: 'আলহাজ্ব কবির হোসেন সাহেবের বার্ষিক যাকাত অনুদান',
      receivedFrom: 'আলহাজ্ব কবির হোসেন',
      createdBy: 'usr-accountant',
      createdAt: '2025-02-17T11:00:00Z',
    },
  ],

  expenses: [
    {
      id: 'exp-01',
      tenantId: 'tenant-001',
      fundId: 'fnd-3',
      voucherNo: 'VOUCH-EX-2025-0103',
      category: 'ছাত্রদের খাদ্যদ্রব্য ও চাউল ক্রয়',
      amount: 32400,
      expenseDate: '2025-02-16',
      paymentMethod: PaymentMethod.CASH,
      description: 'মিরপুর আড়ৎ থেকে ১০ বস্তা নাজিরশাইল চাউল ও ডাল ক্রয়',
      paidTo: 'বিসমিল্লাহ রাইস এজেন্সি',
      approvalStatus: ApprovalStatus.APPROVED,
      approvedBy: 'usr-admin',
      approvedAt: '2025-02-16T15:00:00Z',
      createdBy: 'usr-accountant',
      createdAt: '2025-02-16T14:00:00Z',
    },
  ],

  fundTransfers: [
    {
      id: 'ftr-01',
      tenantId: 'tenant-001',
      fromFundId: 'fnd-1',
      toFundId: 'fnd-3',
      amount: 25000,
      transferDate: '2025-02-10',
      reason: 'বোর্ডিং খাদ্যদ্রব্য ক্রয়ের জন্য সাধারণ ফান্ড থেকে জরুরি স্থানান্তর',
      approvedBy: 'usr-admin',
      createdAt: '2025-02-10T11:00:00Z',
    },
  ],

  // 15. Donors, Donations, Suppliers & Purchases
  donors: [
    {
      id: 'dnr-1',
      tenantId: 'tenant-001',
      nameBangla: 'আলহাজ্ব কবির হোসেন',
      nameEnglish: 'Kabir Hossain',
      mobile: '01711-998877',
      address: 'উত্তরা, ঢাকা',
      donorType: 'INDIVIDUAL',
      isAnonymous: false,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  donations: [
    {
      id: 'don-01',
      tenantId: 'tenant-001',
      donorId: 'dnr-1',
      fundId: 'fnd-2',
      receiptNo: 'DON-REC-2025-001',
      amount: 100000,
      donationType: 'ZAKAT',
      donationDate: '2025-02-17',
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      remarks: 'লিল্লাহ ফান্ডে এতিমদের খাবারের জন্য',
      createdAt: '2025-02-17T11:00:00Z',
    },
  ],

  suppliers: [
    {
      id: 'sup-1',
      tenantId: 'tenant-001',
      companyName: 'বিসমিল্লাহ রাইস এজেন্সি',
      contactPerson: 'হাজী মোজাম্মেল হক',
      mobile: '01811-223344',
      address: 'মিরপুর-১ পাইকারি আড়ৎ',
      materials: 'চাউল, আটা, তেল, ডাল',
      currentDue: 12000,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  purchases: [
    {
      id: 'pur-1',
      tenantId: 'tenant-001',
      supplierId: 'sup-1',
      invoiceNo: 'INV-BRA-889',
      purchaseDate: '2025-02-16',
      totalAmount: 32400,
      paidAmount: 20400,
      dueAmount: 12000,
      itemsDescription: '১০ বস্তা নাজিরশাইল চাউল, ২ বস্তা মসুর ডাল',
      createdAt: '2025-02-16T14:00:00Z',
    },
  ],

  // 16. Staff & Salaries
  staff: [
    {
      id: 'stf-1',
      tenantId: 'tenant-001',
      employeeId: 'EMP-01',
      nameBangla: 'আল্লামা মুফতি রফীকুল ইসলাম',
      nameEnglish: 'Mufti Rafiqul Islam',
      designation: 'মুহতামিম ও শায়খুল হাদিস',
      departmentId: 'dept-4',
      mobile: '01712-111111',
      joiningDate: '2005-06-01',
      baseSalary: 45000,
      bloodGroup: 'B+',
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'stf-2',
      tenantId: 'tenant-001',
      employeeId: 'EMP-02',
      nameBangla: 'মুফতি তারিক জামিল',
      nameEnglish: 'Mufti Tariq Jamil',
      designation: 'নায়েবে মুহতামিম ও মুহাদ্দিস',
      departmentId: 'dept-3',
      mobile: '01712-222222',
      joiningDate: '2010-08-15',
      baseSalary: 35000,
      bloodGroup: 'A+',
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'stf-3',
      tenantId: 'tenant-001',
      employeeId: 'EMP-03',
      nameBangla: 'হাফেজ ক্বারী আব্দুর রহমান',
      nameEnglish: 'Hafez Qari Abdur Rahman',
      designation: 'প্রধান ক্বারী (হিফজ প্রধান)',
      departmentId: 'dept-2',
      mobile: '01712-333333',
      joiningDate: '2015-02-01',
      baseSalary: 28000,
      bloodGroup: 'O+',
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'stf-4',
      tenantId: 'tenant-001',
      employeeId: 'EMP-04',
      nameBangla: 'মাওলানা হাবিবুর রহমান',
      nameEnglish: 'Maulana Habibur Rahman',
      designation: 'প্রধান হিসাবরক্ষক ও ক্যাশিয়ার',
      departmentId: 'dept-1',
      mobile: '01712-444444',
      joiningDate: '2018-04-10',
      baseSalary: 25000,
      bloodGroup: 'AB+',
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  salaries: [
    {
      id: 'sal-1',
      tenantId: 'tenant-001',
      staffId: 'stf-1',
      baseAmount: 45000,
      houseRentAllowance: 5000,
      medicalAllowance: 2000,
      specialAllowance: 3000,
      providentFundDeduction: 2000,
      netPayable: 53000,
      effectiveFrom: '2025-01-01',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],

  salaryPayments: [
    {
      id: 'spay-01',
      tenantId: 'tenant-001',
      staffId: 'stf-1',
      monthYear: '2025-01',
      paidAmount: 53000,
      deductionAmount: 0,
      bonusAmount: 0,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      disbursementDate: '2025-02-01',
      approvedBy: 'usr-admin',
      createdAt: '2025-02-01T10:00:00Z',
    },
  ],

  advances: [],
  leaves: [],

  // 17. Exams, Marks & Results
  exams: [
    {
      id: 'ex-01',
      tenantId: 'tenant-001',
      sessionId: 'sess-2025',
      classId: 'cls-1',
      titleBangla: '১ম সাময়িক পরীক্ষা ২০২৫',
      titleEnglish: 'First Term Examination 2025',
      examType: 'FIRST_TERM',
      startDate: '2025-03-05',
      endDate: '2025-03-15',
      isPublished: false,
      createdAt: '2025-02-10T00:00:00Z',
    },
  ],

  examSubjects: [
    { id: 'exsub-1', examId: 'ex-01', subjectId: 'sub-1', examDate: '2025-03-05', startTime: '09:00 AM', endTime: '11:30 AM', totalMarks: 100, passMarks: 33 },
  ],

  examRegistrations: [
    { id: 'exreg-1', examId: 'ex-01', studentId: 'std-001', admitCardNo: 'ADMIT-2025-001', isClearedFees: true, createdAt: '2025-02-15T00:00:00Z' },
  ],

  marks: [
    { id: 'mrk-1', examSubjectId: 'exsub-1', studentId: 'std-001', writtenMarks: 85, vivaOrOralMarks: 10, practicalMarks: 0, totalMarks: 95, isAbsent: false, grade: 'মুমতাজ (Mumtaz)', enteredBy: 'usr-teacher', createdAt: '2025-03-06T00:00:00Z' },
  ],

  results: [
    { id: 'res-1', examId: 'ex-01', studentId: 'std-001', grandTotalMarks: 95, percentage: 95, divisionOrGrade: 'মুমতাজ (A+)', positionInClass: 1, isPassed: true, createdAt: '2025-03-16T00:00:00Z' },
  ],

  // 18. Routines, Notices & Notifications
  routines: [
    { id: 'rtn-1', tenantId: 'tenant-001', sessionId: 'sess-2025', classId: 'cls-1', sectionId: 'sec-1', dayOfWeek: 'SATURDAY', periodNumber: 1, startTime: '07:30 AM', endTime: '08:15 AM', subjectName: 'কুরআন মজিদ', teacherName: 'হাফেজ ক্বারী আব্দুর রহমান', createdAt: '2025-01-01T00:00:00Z' },
  ],

  notices: [
    { id: 'not-01', tenantId: 'tenant-001', title: 'পবিত্র শব-ই-বরাত উপলক্ষে মাদ্রাসা ছুটি ঘোষণা', content: 'আগামী ১৫ই শাবান রোজ মঙ্গলবার মাদ্রাসার সকল বিভাগের শ্রেণি কার্যক্রম বন্ধ থাকিবে।', publishDate: '2025-02-18', targetAudience: 'ALL', priority: 'URGENT', createdAt: '2025-02-18T09:00:00Z' },
    { id: 'not-02', tenantId: 'tenant-001', title: '১ম সাময়িক পরীক্ষার সময়সূচী ও প্রবেশপত্র বিতরণ', content: 'আসন্ন ১ম সাময়িক পরীক্ষা আগামী মাসের ৫ তারিখ হইতে আরম্ভ হইবে।', publishDate: '2025-02-14', targetAudience: 'STUDENTS', priority: 'HIGH', createdAt: '2025-02-14T09:00:00Z' },
  ],

  notifications: [
    { id: 'ntf-1', tenantId: 'tenant-001', recipientId: 'usr-admin', title: 'বকেয়া ফি অ্যালার্ট', message: 'চলতি মাসে ১২ জন শিক্ষার্থীর ফি বকেয়া রয়েছে।', type: 'IN_APP', isRead: false, sentAt: '2025-02-18T10:00:00Z' },
  ],

  // 19. Assets, Certificates, Promotions & Alumni
  assets: [
    { id: 'ast-1', tenantId: 'tenant-001', assetName: 'সেগুন কাঠের রেহাল (ডেক্স)', category: 'FURNITURE', quantity: 120, purchaseCost: 96000, condition: 'GOOD', createdAt: '2025-01-01T00:00:00Z' },
  ],

  certificates: [
    { id: 'cert-1', tenantId: 'tenant-001', studentId: 'std-001', certificateType: 'ADMISSION_CERTIFICATE', certificateNo: 'SANAD-2025-001', issueDate: '2025-01-10', issuedBy: 'মুহতামিম', createdAt: '2025-01-10T00:00:00Z' },
  ],

  promotions: [],

  // 20. Audit Logs, Settings & Subscriptions
  auditLogs: [
    { id: 'aud-1', tenantId: 'tenant-001', userId: 'usr-admin', entityName: 'Student', entityId: 'std-001', action: 'CREATE', ipAddress: '103.205.71.12', userAgent: 'Chrome/120.0.0', createdAt: '2025-01-05T08:00:00Z' },
    { id: 'aud-2', tenantId: 'tenant-001', userId: 'usr-accountant', entityName: 'FeePayment', entityId: 'pay-001', action: 'CREATE', ipAddress: '103.205.71.12', userAgent: 'Chrome/120.0.0', createdAt: '2025-02-05T10:00:00Z' },
  ],

  systemSettings: [
    { id: 'sys-1', key: 'PLATFORM_NAME', value: 'Madrasah Management SaaS Platform', description: 'Global platform name', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 'sys-2', key: 'DEFAULT_TIMEZONE', value: 'Asia/Dhaka', description: 'Bangladesh Standard Time', updatedAt: '2025-01-01T00:00:00Z' },
  ],

  institutionSettings: [
    { id: 'iset-1', tenantId: 'tenant-001', key: 'RECEIPT_PREFIX', value: 'REC-DUD', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 'iset-2', tenantId: 'tenant-001', key: 'SMS_GATEWAY_ACTIVE', value: 'true', updatedAt: '2025-01-01T00:00:00Z' },
  ],

  subscriptions: [
    { id: 'sub-01', tenantId: 'tenant-001', plan: SubscriptionPlan.PROFESSIONAL, startDate: '2025-01-01T00:00:00Z', endDate: '2026-01-01T00:00:00Z', isActive: true, amountPaid: 35000, transactionId: 'TXN-BKASH-8827', createdAt: '2025-01-01T00:00:00Z' },
  ],

  licenses: [
    { id: 'lic-01', tenantId: 'tenant-001', licenseKey: 'LIC-MADRASAH-DUD-2025-ENTERPRISE-BD', maxStudents: 1500, maxStaff: 100, expiresAt: '2026-01-01T00:00:00Z', isValid: true, createdAt: '2025-01-01T00:00:00Z' },
  ],
};
