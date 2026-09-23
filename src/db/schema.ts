/**
 * TypeScript Data Model Definitions for Madrasah Management & Administration SaaS
 * Implements the normalized PostgreSQL relational schema in TypeScript.
 */

import {
  SubscriptionPlan,
  MadrasahType,
  RoleType,
  DepartmentType,
  StudentStatus,
  AttendanceStatus,
  PaymentMethod,
  FeeStatus,
  TransactionType,
  ApprovalStatus,
} from '../types';

export type Gender = 'MALE' | 'FEMALE';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ExamType = 'MONTHLY' | 'FIRST_TERM' | 'MID_TERM' | 'FINAL' | 'CENTRAL_BEFAQ';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Base traits
export interface AuditableEntity {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  createdBy?: string;
}

export interface TenantScopedEntity {
  tenantId: string;
}

// 1. Tenancy & IAM
export interface TenantModel extends AuditableEntity {
  id: string;
  code: string;
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  madrasahType: MadrasahType;
  eiinCode?: string;
  registrationNo?: string;
  establishedYear?: number;
  address: string;
  district: string;
  division?: string;
  phone: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  currency: string;
  planType: SubscriptionPlan;
  isActive: boolean;
}

export interface UserModel extends AuditableEntity, Partial<TenantScopedEntity> {
  id: string;
  username: string;
  email?: string;
  mobile: string;
  passwordHash: string;
  fullName: string;
  role: RoleType;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
}

export interface RoleModel extends AuditableEntity, Partial<TenantScopedEntity> {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystemRole: boolean;
}

export interface PermissionModel {
  id: string;
  module: string;
  action: string;
  code: string;
  description?: string;
  createdAt: string;
}

export interface RolePermissionModel {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
}

export interface UserRoleModel {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
}

// 2. Academic
export interface AcademicSessionModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  name: string;
  hijriYear?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface DepartmentModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  type: DepartmentType;
  nameBangla: string;
  nameEnglish: string;
  description?: string;
}

export interface ShiftModel extends TenantScopedEntity {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface ClassModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  departmentId: string;
  nameBangla: string;
  nameEnglish: string;
  orderIndex: number;
}

export interface SectionModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  classId: string;
  shiftId?: string;
  name: string;
  capacity: number;
  roomNumber?: string;
}

export interface SubjectModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  code: string;
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  totalMarks: number;
  passMarks: number;
  isOptional: boolean;
}

export interface ClassSubjectModel {
  id: string;
  classId: string;
  subjectId: string;
  createdAt: string;
}

export interface TeacherSubjectModel {
  id: string;
  staffId: string;
  subjectId: string;
  assignedDate: string;
}

// 3. Students & Guardians
export interface StudentModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  studentIdCardNo: string;
  admissionNo: string;
  admissionDate: string;
  nameBangla: string;
  nameEnglish: string;
  nameArabic?: string;
  gender: Gender;
  dateOfBirth: string;
  bloodGroup?: BloodGroup;
  birthCertificateNo?: string;
  classId: string;
  sectionId: string;
  rollNo: number;
  isResidential: boolean;
  roomNumber?: string;
  seatNumber?: string;
  status: StudentStatus;
  photoUrl?: string;
  fatherNameBangla: string;
  motherNameBangla: string;
  guardianName: string;
  guardianRelation: string;
  guardianMobile: string;
  presentAddress: string;
  permanentAddress: string;
  previousMadrasah?: string;
  tcNumber?: string;
}

export interface GuardianModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  nameBangla: string;
  nameEnglish?: string;
  relation: string;
  nidNumber?: string;
  mobileNumber: string;
  altMobileNumber?: string;
  occupation?: string;
  yearlyIncome?: number;
  presentAddress: string;
  permanentAddress?: string;
}

export interface StudentGuardianModel {
  id: string;
  studentId: string;
  guardianId: string;
  isPrimary: boolean;
  relationType: string;
}

export interface StudentDocumentModel {
  id: string;
  studentId: string;
  title: string;
  documentType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface StudentAcademicHistoryModel {
  id: string;
  studentId: string;
  sessionId: string;
  classId: string;
  rollNo: number;
  gpaOrDivision?: string;
  passYear: number;
  remarks?: string;
  createdAt: string;
}

// 4. Attendance & Homework
export interface AttendanceModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  date: string;
  studentId: string;
  sectionId: string;
  status: AttendanceStatus;
  inTime?: string;
  outTime?: string;
  smsSent: boolean;
  remarks?: string;
  recordedBy?: string;
}

export interface HomeworkModel extends TenantScopedEntity {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  givenDate: string;
  dueDate: string;
  assignedBy?: string;
  createdAt: string;
}

export interface LessonPlanModel extends TenantScopedEntity {
  id: string;
  subjectId: string;
  staffId: string;
  topicName: string;
  targetDate: string;
  completionDate?: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

// 5. Financial (IMMUTABLE LEDGER)
export interface FeeTypeModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  defaultAmount: number;
  isRecurring: boolean;
}

export interface StudentFeeModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  studentId: string;
  sessionId: string;
  feeTypeId: string;
  monthYear: string;
  originalAmount: number;
  waiverAmount: number;
  netPayable: number;
  paidAmount: number;
  dueAmount: number;
  status: FeeStatus;
  dueDate?: string;
}

export interface ReceiptModel extends TenantScopedEntity {
  id: string;
  receiptNo: string;
  studentId: string;
  totalAmount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  isCancelled: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
}

export interface FeePaymentModel extends TenantScopedEntity {
  id: string;
  studentFeeId: string;
  studentId: string;
  receiptId: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  transactionRefNo?: string;
  collectedBy: string;
  paymentDate: string;
  createdAt: string;
}

export interface FundModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  code: string;
  isRestricted: boolean;
  currentBalance: number;
  description?: string;
}

export interface IncomeModel extends TenantScopedEntity {
  id: string;
  fundId: string;
  voucherNo: string;
  category: string;
  amount: number;
  incomeDate: string;
  paymentMethod: PaymentMethod;
  description?: string;
  receivedFrom?: string;
  createdBy: string;
  createdAt: string;
}

export interface ExpenseModel extends TenantScopedEntity {
  id: string;
  fundId: string;
  voucherNo: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: PaymentMethod;
  description: string;
  paidTo: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
}

export interface FundTransferModel extends TenantScopedEntity {
  id: string;
  fromFundId: string;
  toFundId: string;
  amount: number;
  transferDate: string;
  reason: string;
  approvedBy: string;
  createdAt: string;
}

// 6. Donors & Purchases
export interface DonorModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  nameBangla: string;
  nameEnglish?: string;
  mobile: string;
  email?: string;
  address?: string;
  donorType: string;
  isAnonymous: boolean;
}

export interface DonationModel extends TenantScopedEntity {
  id: string;
  donorId?: string;
  fundId: string;
  receiptNo: string;
  amount: number;
  donationType: string;
  donationDate: string;
  paymentMethod: PaymentMethod;
  remarks?: string;
  createdAt: string;
}

export interface SupplierModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  address?: string;
  materials?: string;
  currentDue: number;
}

export interface PurchaseModel extends TenantScopedEntity {
  id: string;
  supplierId: string;
  invoiceNo: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  itemsDescription: string;
  createdAt: string;
}

// 7. Staff, Salaries & Leaves
export interface StaffModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  employeeId: string;
  nameBangla: string;
  nameEnglish: string;
  designation: string;
  departmentId?: string;
  mobile: string;
  email?: string;
  nidNumber?: string;
  joiningDate: string;
  baseSalary: number;
  bloodGroup?: BloodGroup;
  status: string;
  photoUrl?: string;
}

export interface SalaryModel extends TenantScopedEntity {
  id: string;
  staffId: string;
  baseAmount: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  providentFundDeduction: number;
  netPayable: number;
  effectiveFrom: string;
  createdAt: string;
}

export interface SalaryPaymentModel extends TenantScopedEntity {
  id: string;
  staffId: string;
  monthYear: string;
  paidAmount: number;
  deductionAmount: number;
  bonusAmount: number;
  paymentMethod: PaymentMethod;
  disbursementDate: string;
  approvedBy: string;
  createdAt: string;
}

export interface AdvanceModel extends TenantScopedEntity {
  id: string;
  staffId: string;
  amount: number;
  requestDate: string;
  reason: string;
  repaidAmount: number;
  monthlyDeduction: number;
  isFullyRepaid: boolean;
  createdAt: string;
}

export interface LeaveModel extends TenantScopedEntity {
  id: string;
  staffId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  createdAt: string;
}

// 8. Exams & Results
export interface ExamModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  sessionId: string;
  classId: string;
  titleBangla: string;
  titleEnglish: string;
  examType: ExamType;
  startDate: string;
  endDate: string;
  isPublished: boolean;
}

export interface ExamSubjectModel {
  id: string;
  examId: string;
  subjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passMarks: number;
}

export interface ExamRegistrationModel {
  id: string;
  examId: string;
  studentId: string;
  admitCardNo: string;
  isClearedFees: boolean;
  createdAt: string;
}

export interface MarksModel extends AuditableEntity {
  id: string;
  examSubjectId: string;
  studentId: string;
  writtenMarks: number;
  vivaOrOralMarks: number;
  practicalMarks: number;
  totalMarks: number;
  isAbsent: boolean;
  grade?: string;
  remarks?: string;
  enteredBy: string;
}

export interface ResultModel {
  id: string;
  examId: string;
  studentId: string;
  grandTotalMarks: number;
  percentage: number;
  divisionOrGrade: string;
  positionInClass?: number;
  isPassed: boolean;
  remarks?: string;
  createdAt: string;
}

// 9. Routine, Notices & Notifications
export interface RoutineModel extends TenantScopedEntity {
  id: string;
  sessionId: string;
  classId: string;
  sectionId: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  createdAt: string;
}

export interface NoticeModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  expireDate?: string;
  targetAudience: string;
  priority: string;
  attachmentUrl?: string;
}

export interface NotificationModel extends TenantScopedEntity {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  sentAt: string;
}

// 10. Assets, Certificates, Promotions & Alumni
export interface AssetModel extends AuditableEntity, TenantScopedEntity {
  id: string;
  assetName: string;
  category: string;
  quantity: number;
  purchaseDate?: string;
  purchaseCost?: number;
  locationRoom?: string;
  condition: string;
}

export interface CertificateModel extends TenantScopedEntity {
  id: string;
  studentId: string;
  certificateType: string;
  certificateNo: string;
  issueDate: string;
  issuedBy: string;
  createdAt: string;
}

export interface PromotionModel extends TenantScopedEntity {
  id: string;
  studentId: string;
  fromSessionId: string;
  toSessionId: string;
  fromClassId: string;
  toClassId: string;
  promotedDate: string;
  remarks?: string;
}

// 11. Audit Logs & System Settings
export interface AuditLogModel extends Partial<TenantScopedEntity> {
  id: string;
  userId?: string;
  entityName: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL' | 'APPROVE';
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SystemSettingModel {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export interface InstitutionSettingModel extends TenantScopedEntity {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface SubscriptionModel extends TenantScopedEntity {
  id: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  isActive: boolean;
  amountPaid: number;
  transactionId?: string;
  createdAt: string;
}

export interface LicenseModel extends TenantScopedEntity {
  id: string;
  licenseKey: string;
  maxStudents: number;
  maxStaff: number;
  expiresAt: string;
  isValid: boolean;
  createdAt: string;
}
