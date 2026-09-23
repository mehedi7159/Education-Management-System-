import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  CreditCard,
  Edit3,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Award,
  BookOpen,
  DollarSign,
  UserCheck,
  Heart,
  Home,
  Shield,
  Upload,
  Trash2,
  ExternalLink,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  StudentEntity,
  ClassEntity,
  SectionEntity,
  Tenant,
  StudentStatus,
  StudentDocument,
  StudentAcademicHistoryRecord,
  StudentFeeEntity,
} from '../../../types';
import { formatDate, toBengaliNumerals, formatTaka } from '../../../utils/format';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Tabs } from '../../../components/common/Tabs';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';

interface StudentProfileModalProps {
  student: StudentEntity;
  tenant: Tenant;
  classes: ClassEntity[];
  sections: SectionEntity[];
  onClose: () => void;
  onEdit: (student: StudentEntity) => void;
  onPrintProfile: (student: StudentEntity) => void;
  onPrintIdCard: (student: StudentEntity) => void;
  onUpdateSuccess: (updatedStudent: StudentEntity) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student: initialStudent,
  tenant,
  classes,
  sections,
  onClose,
  onEdit,
  onPrintProfile,
  onPrintIdCard,
  onUpdateSuccess,
}) => {
  const [student, setStudent] = useState<StudentEntity>(initialStudent);
  const [activeTab, setActiveTab] = useState('overview');
  const [fees, setFees] = useState<StudentFeeEntity[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Document Upload State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<StudentDocument['type']>('BIRTH_CERTIFICATE');
  const [docRemarks, setDocRemarks] = useState('');

  // Academic History State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyExam, setHistoryExam] = useState('');
  const [historyInst, setHistoryInst] = useState('');
  const [historyBoard, setHistoryBoard] = useState('');
  const [historyYear, setHistoryYear] = useState<number>(2024);
  const [historyResult, setHistoryResult] = useState('');
  const [historyMarks, setHistoryMarks] = useState('');

  const { showToast } = useToast();

  const currentClass = classes.find((c) => c.id === student.classId);
  const currentSection = sections.find((s) => s.id === student.sectionId);

  // Load fee details
  useEffect(() => {
    let isMounted = true;
    const fetchFees = async () => {
      setLoadingFees(true);
      const res = await api.getFees(tenant.id);
      if (isMounted && res.success) {
        // Filter fees belonging to this student or class
        const studentFees = res.data.filter(
          (f) => f.studentId === student.id || f.studentRoll === student.rollNo
        );
        setFees(studentFees);
      }
      if (isMounted) setLoadingFees(false);
    };
    fetchFees();
    return () => {
      isMounted = false;
    };
  }, [tenant.id, student.id, student.rollNo]);

  // Handle Quick Status Change
  const handleStatusChange = async (newStatus: StudentStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await api.updateStudent(student.id, { status: newStatus }, tenant.id);
      if (res.success) {
        setStudent(res.data);
        onUpdateSuccess(res.data);
        showToast(`শিক্ষার্থীর স্ট্যাটাস পরিবর্তন করে '${newStatus}' করা হয়েছে`, 'success');
      } else {
        showToast(res.error?.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle adding new document
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      showToast('নথির শিরোনাম লিখুন', 'error');
      return;
    }

    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      type: docType,
      fileName: `${docTitle.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      remarks: docRemarks.trim() || undefined,
    };

    const updatedDocs = [...(student.documents || []), newDoc];
    const res = await api.updateStudent(student.id, { documents: updatedDocs }, tenant.id);
    if (res.success) {
      setStudent(res.data);
      onUpdateSuccess(res.data);
      showToast('নথি সফলভাবে সংযুক্ত করা হয়েছে', 'success');
      setIsDocModalOpen(false);
      setDocTitle('');
      setDocRemarks('');
    } else {
      showToast('নথি আপলোড ব্যর্থ হয়েছে', 'error');
    }
  };

  // Handle delete document
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই নথিটি মুছে ফেলতে চান?')) return;
    const updatedDocs = (student.documents || []).filter((d) => d.id !== docId);
    const res = await api.updateStudent(student.id, { documents: updatedDocs }, tenant.id);
    if (res.success) {
      setStudent(res.data);
      onUpdateSuccess(res.data);
      showToast('নথি মুছে ফেলা হয়েছে', 'success');
    }
  };

  // Handle add academic history
  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyExam.trim() || !historyInst.trim()) {
      showToast('পরীক্ষা ও শিক্ষা প্রতিষ্ঠানের নাম আবশ্যক', 'error');
      return;
    }

    const newHistory: StudentAcademicHistoryRecord = {
      id: `hist-${Date.now()}`,
      examOrClass: historyExam.trim(),
      institutionName: historyInst.trim(),
      boardOrWafaq: historyBoard.trim() || 'বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ',
      passingYear: historyYear,
      resultOrGrade: historyResult.trim() || 'মুমতাজ (স্টার মার্কস)',
      marksObtained: historyMarks ? Number(historyMarks) : undefined,
    };

    const updatedHistory = [...(student.academicHistory || []), newHistory];
    const res = await api.updateStudent(student.id, { academicHistory: updatedHistory }, tenant.id);
    if (res.success) {
      setStudent(res.data);
      onUpdateSuccess(res.data);
      showToast('পূর্ববর্তী শিক্ষাগত রেকর্ড যুক্ত করা হয়েছে', 'success');
      setIsHistoryModalOpen(false);
      setHistoryExam('');
      setHistoryInst('');
      setHistoryBoard('');
      setHistoryResult('');
      setHistoryMarks('');
    }
  };

  const tabsConfig = [
    { id: 'overview', label: 'সারসংক্ষেপ ও পরিচয়', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'guardian', label: 'অভিভাবক ও পরিবার', icon: <Home className="w-4 h-4" /> },
    { id: 'academics', label: 'একাডেমিক ও শিক্ষাবর্ষ', icon: <BookOpen className="w-4 h-4" /> },
    {
      id: 'documents',
      label: 'নথিপত্র ও আর্কাইভ',
      icon: <FileText className="w-4 h-4" />,
      badge: student.documents?.length || 0,
    },
    {
      id: 'fees',
      label: 'ফি ও লেনদেন',
      icon: <DollarSign className="w-4 h-4" />,
      badge: fees.length,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-22 h-22 rounded-2xl bg-white p-1 shadow-lg border-2 border-emerald-400 overflow-hidden">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.nameBangla}
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-800 text-white flex items-center justify-center text-2xl font-bold rounded-xl">
                    {student.nameBangla.slice(0, 2)}
                  </div>
                )}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${
                  student.status === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : student.status === 'TRANSFERRED'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                title={`Status: ${student.status}`}
              />
            </div>

            {/* Title & Key Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {student.nameBangla}
                </h2>
                {student.nameArabic && (
                  <span className="text-sm font-arabic text-emerald-200/90 dir-rtl px-2 py-0.5 bg-white/10 rounded-md" dir="rtl">
                    {student.nameArabic}
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-200 font-medium tracking-wide mb-3">
                {student.nameEnglish || 'Student of ' + tenant.nameBangla}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-white/15 px-3 py-1 rounded-lg font-mono font-bold text-white flex items-center gap-1.5">
                  ID: {student.studentIdCardNo}
                </span>
                <span className="bg-emerald-700/80 px-3 py-1 rounded-lg font-bold text-white">
                  রোল: {toBengaliNumerals(student.rollNo)}
                </span>
                <span className="bg-teal-700/80 px-3 py-1 rounded-lg font-semibold text-white">
                  {currentClass?.nameBangla || student.className || 'শ্রেণি নির্দিষ্ট নয়'} (
                  {currentSection?.name || student.sectionName || 'শাখা-ক'})
                </span>
                <span
                  className={`px-3 py-1 rounded-lg font-bold ${
                    student.isResidential
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {student.isResidential ? 'আবাসিক' : 'অনাবাসিক'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-500 border-none text-xs"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={() => onPrintProfile(student)}
                >
                  প্রোফাইল প্রিন্ট
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  onClick={() => onPrintIdCard(student)}
                >
                  আইডি কার্ড
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs w-full"
                leftIcon={<Edit3 className="w-4 h-4" />}
                onClick={() => onEdit(student)}
              >
                তথ্য সম্পাদনা (Edit)
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={setActiveTab} variant="line" />
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--color-surface-muted)]/30">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Status Bar Changer */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-text-main)]">
                      বর্তমান প্রাতিষ্ঠানিক স্ট্যাটাস
                    </h4>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      ভর্তি রেজিস্ট্রেশন ও কার্যকারিতা নিয়ন্ত্রণ
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="text-xs font-bold py-1.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] focus:ring-2 focus:ring-[var(--color-primary)]"
                    value={student.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value as StudentStatus)}
                  >
                    <option value="ACTIVE">সক্রিয় (Active)</option>
                    <option value="INACTIVE">নিষ্ক্রিয় (Inactive)</option>
                    <option value="TRANSFERRED">ছাড়পত্রপ্রাপ্ত (Transferred)</option>
                    <option value="GRADUATED">উত্তীর্ণ / ফারেগ (Graduated)</option>
                    <option value="EXPELLED">বহিষ্কৃত (Expelled)</option>
                    <option value="DROPPED">বাতিল (Dropped)</option>
                  </select>
                </div>
              </div>

              {/* Personal Demographic Information */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
                  <UserCheck className="w-4 h-4 text-[var(--color-primary)]" />
                  ব্যক্তিগত ও পরিচিতিমূলক তথ্য
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">ভর্তি নম্বর:</span>
                    <span className="font-mono font-bold text-[var(--color-text-main)]">
                      {student.admissionNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">ভর্তির তারিখ:</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {formatDate(student.admissionDate, 'bn')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">জন্ম তারিখ:</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {formatDate(student.dateOfBirth, 'bn')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">লিঙ্গ (Gender):</span>
                    <span className="font-bold text-[var(--color-text-main)]">
                      {student.gender === 'FEMALE' ? 'মহিলা' : 'পুরুষ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">রক্তের গ্রুপ:</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {student.bloodGroup || 'অজানা'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">ধর্ম:</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {student.religion || 'ইসলাম'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">
                      জন্ম নিবন্ধন নম্বর:
                    </span>
                    <span className="font-mono font-bold text-[var(--color-text-main)]">
                      {student.birthCertificateNo || 'প্রযোজ্য নয়'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">বায়োমেট্রিক আইডি:</span>
                    <span className="font-mono font-semibold text-[var(--color-text-main)]">
                      {student.biometricId || 'সংযুক্ত নেই'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">
                      পূর্ববর্তী শিক্ষা প্রতিষ্ঠান:
                    </span>
                    <span className="font-medium text-[var(--color-text-main)]">
                      {student.previousInstitution || 'কোনো পূর্ববর্তী প্রতিষ্ঠান নেই'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boarding & Residential Info */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
                  <Home className="w-4 h-4 text-[var(--color-primary)]" />
                  ছাত্রাবাস ও আবাসন বিবরণী
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">আবাসিক স্ট্যাটাস:</span>
                    <span className="font-bold text-[var(--color-text-main)]">
                      {student.isResidential ? 'আবাসিক শিক্ষার্থী (Boarder)' : 'অনাবাসিক (Day Scholar)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">ছাত্রাবাস / হল:</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {student.isResidential ? student.residenceHall || 'প্রধান ছাত্রাবাস' : 'প্রযোজ্য নয়'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">কক্ষ ও সিট নম্বর:</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {student.isResidential
                        ? `কক্ষ: ${student.roomNo || 'N/A'}, সিট: ${student.bedNo || 'N/A'}`
                        : 'প্রযোজ্য নয়'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical & General Notes */}
              {(student.medicalNotes || student.generalNotes) && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                  <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    স্বাস্থ্য ও প্রশাসনিক মন্তব্য
                  </h3>
                  <div className="space-y-3 text-xs">
                    {student.medicalNotes && (
                      <div className="bg-rose-50/60 border border-rose-200/80 p-3 rounded-xl">
                        <span className="font-bold text-rose-800 block mb-1">
                          শারীরিক ও স্বাস্থ্য সংক্রান্ত সতর্কতা:
                        </span>
                        <p className="text-rose-900">{student.medicalNotes}</p>
                      </div>
                    )}
                    {student.generalNotes && (
                      <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl">
                        <span className="font-bold text-amber-800 block mb-1">প্রশাসনিক মন্তব্য:</span>
                        <p className="text-amber-900">{student.generalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: GUARDIAN & FAMILY ================= */}
          {activeTab === 'guardian' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Parents Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Father */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border-subtle)] pb-2.5">
                    <h4 className="font-bold text-sm text-[var(--color-text-main)] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      পিতার তথ্যাবলি
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      পিতা
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[var(--color-text-muted)] block">পিতার নাম:</span>
                      <span className="font-bold text-sm text-[var(--color-text-main)]">
                        {student.fatherName || student.guardianName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] block">পেশা:</span>
                      <span className="font-medium text-[var(--color-text-main)]">
                        {student.fatherOccupation || 'ব্যবসা / চাকরি'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] block">মোবাইল নম্বর:</span>
                      <a
                        href={`tel:${student.fatherMobile || student.guardianMobile}`}
                        className="font-mono font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {student.fatherMobile || student.guardianMobile}
                      </a>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] block">এনআইডি (NID):</span>
                      <span className="font-mono text-[var(--color-text-main)]">
                        {student.fatherNid || 'রেকর্ড নেই'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mother */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border-subtle)] pb-2.5">
                    <h4 className="font-bold text-sm text-[var(--color-text-main)] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                      মাতার তথ্যাবলি
                    </h4>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      মাতা
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[var(--color-text-muted)] block">মাতার নাম:</span>
                      <span className="font-bold text-sm text-[var(--color-text-main)]">
                        {student.motherName || 'মোসাম্মৎ আয়েশা বেগম'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] block">পেশা:</span>
                      <span className="font-medium text-[var(--color-text-main)]">
                        {student.motherOccupation || 'গৃহিণী'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] block">মোবাইল নম্বর:</span>
                      {student.motherMobile ? (
                        <a
                          href={`tel:${student.motherMobile}`}
                          className="font-mono font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {student.motherMobile}
                        </a>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">প্রযোজ্য নয়</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] block">এনআইডি (NID):</span>
                      <span className="font-mono text-[var(--color-text-main)]">
                        {student.motherNid || 'রেকর্ড নেই'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Guardian Card */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border-subtle)] pb-2.5">
                  <h4 className="font-bold text-sm text-[var(--color-text-main)] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    আইনি অভিভাবক ও জরুরি যোগাযোগ
                  </h4>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                    সম্পর্ক: {student.guardianRelation || 'পিতা'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">অভিভাবকের নাম:</span>
                    <span className="font-bold text-sm text-[var(--color-text-main)]">
                      {student.guardianName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">জরুরি মোবাইল নং:</span>
                    <a
                      href={`tel:${student.guardianMobile}`}
                      className="font-mono font-bold text-base text-[var(--color-primary)] flex items-center gap-1.5 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {student.guardianMobile}
                    </a>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">অভিভাবকের পেশা:</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {student.guardianOccupation || student.fatherOccupation || 'ব্যবসা'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">এনআইডি নম্বর:</span>
                    <span className="font-mono font-semibold text-[var(--color-text-main)]">
                      {student.guardianNid || student.fatherNid || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">ইমেইল:</span>
                    <span className="font-medium text-[var(--color-text-main)]">
                      {student.guardianEmail || 'ইমেইল নেই'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                <h4 className="font-bold text-sm text-[var(--color-text-main)] mb-4 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  ঠিকানা ও যোগাযোগের বিবরণী
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[var(--color-surface-muted)]/50 p-4 rounded-xl border border-[var(--color-border-subtle)]">
                    <span className="font-bold text-[var(--color-text-main)] block mb-1 text-xs">
                      বর্তমান ঠিকানা (Present Address):
                    </span>
                    <p className="text-[var(--color-text-main)] leading-relaxed">
                      {student.presentAddress}
                    </p>
                    {(student.presentThana || student.presentDistrict) && (
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                        থানা: {student.presentThana || '-'}, জেলা: {student.presentDistrict || '-'}
                      </p>
                    )}
                  </div>
                  <div className="bg-[var(--color-surface-muted)]/50 p-4 rounded-xl border border-[var(--color-border-subtle)]">
                    <span className="font-bold text-[var(--color-text-main)] block mb-1 text-xs">
                      স্থায়ী ঠিকানা (Permanent Address):
                    </span>
                    <p className="text-[var(--color-text-main)] leading-relaxed">
                      {student.permanentAddress || student.presentAddress}
                    </p>
                    {(student.permanentThana || student.permanentDistrict) && (
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                        থানা: {student.permanentThana || '-'}, জেলা: {student.permanentDistrict || '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ACADEMICS & HISTORY ================= */}
          {activeTab === 'academics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Current Academic Enrollment */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-4 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
                  <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                  বর্তমান শ্রেণি ও শিক্ষাবর্ষের বিবরণী
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">শ্রেণি / জামাত:</span>
                    <span className="font-bold text-sm text-[var(--color-primary)]">
                      {currentClass?.nameBangla || student.className || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">শাখা (Section):</span>
                    <span className="font-bold text-[var(--color-text-main)]">
                      {currentSection?.name || student.sectionName || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">রোল নম্বর:</span>
                    <span className="font-bold text-base text-[var(--color-text-main)]">
                      {toBengaliNumerals(student.rollNo)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">শিক্ষাবর্ষ (Session):</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {student.sessionName || '1446-1447 হি. / 2025-2026'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">দাখিলা নম্বর:</span>
                    <span className="font-mono font-bold text-[var(--color-text-main)]">
                      {student.dakhilaNo || 'D-4412'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">রেজিস্ট্রেশন নম্বর:</span>
                    <span className="font-mono font-bold text-[var(--color-text-main)]">
                      {student.registrationNo || 'REG-2025-991'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">বিভাগ (Dept):</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {student.department || currentClass?.department || 'সাধারণ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)] block mb-0.5">শিফট:</span>
                    <span className="font-semibold text-[var(--color-text-main)]">
                      {student.shiftName || 'দিবা শিফট'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Past Academic Milestones & History */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border-subtle)] pb-2.5">
                  <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    পূর্ববর্তী ফলাফল ও শিক্ষাগত রেকর্ড
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsHistoryModalOpen(true)}
                  >
                    নতুন রেকর্ড যোগ
                  </Button>
                </div>

                {(!student.academicHistory || student.academicHistory.length === 0) ? (
                  <div className="text-center py-8 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-muted)]/30 rounded-xl border border-dashed border-[var(--color-border)]">
                    পূর্ববর্তী পরীক্ষার কোনো রেকর্ড সংরক্ষণ করা হয়নি।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                          <th className="p-2.5">পরীক্ষা / শ্রেণি</th>
                          <th className="p-2.5">শিক্ষা প্রতিষ্ঠান</th>
                          <th className="p-2.5">বোর্ড / বেফাক</th>
                          <th className="p-2.5">পাসের সন</th>
                          <th className="p-2.5">প্রাপ্ত ফলাফল</th>
                          <th className="p-2.5">মোট নম্বর</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {student.academicHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-[var(--color-surface-muted)]/40">
                            <td className="p-2.5 font-bold text-[var(--color-text-main)]">
                              {item.examOrClass}
                            </td>
                            <td className="p-2.5 font-medium">{item.institutionName}</td>
                            <td className="p-2.5 text-[var(--color-text-muted)]">{item.boardOrWafaq || '-'}</td>
                            <td className="p-2.5 font-mono">{item.passingYear}</td>
                            <td className="p-2.5 font-bold text-emerald-700 bg-emerald-50/50 rounded">
                              {item.resultOrGrade}
                            </td>
                            <td className="p-2.5 font-mono">{item.marksObtained || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: DOCUMENTS & ARCHIVE ================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-2xs">
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-text-main)]">
                    ডিজিটাল নথিপত্র ও আর্কাইভ ভল্ট
                  </h4>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    জন্ম সনদ, ছাড়পত্র, মার্কশিট ও এনআইডি কপির ডিজিটাল সংগ্রহ
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={() => setIsDocModalOpen(true)}
                >
                  নতুন নথি সংযুক্ত করুন
                </Button>
              </div>

              {(!student.documents || student.documents.length === 0) ? (
                <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-[var(--color-text-muted)]/50" />
                  <p>এখনও কোনো ডিজিটাল নথি আপলোড করা হয়নি।</p>
                  <Button size="sm" variant="outline" onClick={() => setIsDocModalOpen(true)}>
                    প্রথম নথি যুক্ত করুন
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {doc.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[var(--color-text-main)] line-clamp-1 mb-1">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          সংযুক্তির তারিখ: {formatDate(doc.uploadDate, 'bn')}
                        </p>
                        {doc.remarks && (
                          <p className="text-[11px] text-[var(--color-text-muted)] italic mt-2">
                            "{doc.remarks}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3 mt-4 text-xs">
                        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                          {doc.fileSize || '1.2 MB'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              showToast(`নথি '${doc.title}' প্রিভিউ প্রস্তুত করা হচ্ছে`, 'info')
                            }
                            className="p-1.5 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
                            title="Preview"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: FEES & FINANCIALS ================= */}
          {activeTab === 'fees' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Financial KPI Summary for this Student */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl">
                  <span className="text-xs text-[var(--color-text-muted)] block mb-1">
                    মোট নির্ধারিত ফি (Total Payable)
                  </span>
                  <span className="text-lg font-bold text-[var(--color-text-main)]">
                    {formatTaka(fees.reduce((acc, f) => acc + f.netPayable, 0))}
                  </span>
                </div>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl">
                  <span className="text-xs text-emerald-600 block mb-1">
                    পরিশোধিত ফি (Paid Amount)
                  </span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatTaka(fees.reduce((acc, f) => acc + f.paidAmount, 0))}
                  </span>
                </div>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl">
                  <span className="text-xs text-rose-600 block mb-1">
                    সর্বমোট বকেয়া (Total Due)
                  </span>
                  <span className="text-lg font-bold text-rose-700">
                    {formatTaka(fees.reduce((acc, f) => acc + f.dueAmount, 0))}
                  </span>
                </div>
              </div>

              {/* Fees List */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xs">
                <h4 className="font-bold text-sm text-[var(--color-text-main)] mb-4 flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  ফি ও রসিদ হিস্ট্রি
                </h4>

                {fees.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                    বর্তমান শিক্ষাবর্ষে কোনো বকেয়া বা ফি রেকর্ড পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                          <th className="p-2.5">ফি বিবরণী</th>
                          <th className="p-2.5">মাস / সময়</th>
                          <th className="p-2.5 text-right">নির্ধারিত</th>
                          <th className="p-2.5 text-right">পরিশোধিত</th>
                          <th className="p-2.5 text-right">বকেয়া</th>
                          <th className="p-2.5 text-center">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border-subtle)]">
                        {fees.map((fee) => (
                          <tr key={fee.id} className="hover:bg-[var(--color-surface-muted)]/40">
                            <td className="p-2.5 font-bold text-[var(--color-text-main)]">
                              {fee.feeType}
                            </td>
                            <td className="p-2.5">{fee.monthYear}</td>
                            <td className="p-2.5 text-right font-mono">{formatTaka(fee.netPayable)}</td>
                            <td className="p-2.5 text-right font-mono text-emerald-700 font-bold">
                              {formatTaka(fee.paidAmount)}
                            </td>
                            <td className="p-2.5 text-right font-mono text-rose-700 font-bold">
                              {formatTaka(fee.dueAmount)}
                            </td>
                            <td className="p-2.5 text-center">
                              <Badge
                                variant={
                                  fee.status === 'PAID'
                                    ? 'success'
                                    : fee.status === 'PARTIAL'
                                    ? 'warning'
                                    : 'danger'
                                }
                                size="sm"
                              >
                                {fee.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between shrink-0">
          <div className="text-xs text-[var(--color-text-muted)]">
            নিবন্ধন আইডি: <span className="font-mono font-bold text-[var(--color-text-main)]">{student.studentIdCardNo}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            বন্ধ করুন
          </Button>
        </div>
      </div>

      {/* ================= SUB-MODAL: ADD DOCUMENT ================= */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--color-text-main)]">নতুন নথি সংযুক্ত করুন</h3>
              <button onClick={() => setIsDocModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--color-text-main)] mb-1">
                  নথির শিরোনাম / বিবরণ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: জন্ম সনদপত্রের ফটোকপি"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                />
              </div>
              <div>
                <label className="block font-bold text-[var(--color-text-main)] mb-1">
                  নথির ধরন (Document Type)
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                >
                  <option value="BIRTH_CERTIFICATE">জন্ম নিবন্ধন সনদ (Birth Certificate)</option>
                  <option value="TRANSFER_CERTIFICATE">ছাড়পত্র / প্রশংসাপত্র (Transfer Certificate)</option>
                  <option value="MARKSHEET">পূর্ববর্তী মার্কশিট / ফলাফল</option>
                  <option value="NID_COPY">পিতা/মাতার এনআইডি কার্ড কপি</option>
                  <option value="MEDICAL_DOC">চিকিৎসা ও স্বাস্থ্য রিপোর্ট</option>
                  <option value="PHOTO">অতিরিক্ত পাসপোর্ট ছবি</option>
                  <option value="OTHER">অন্যান্য প্রাতিষ্ঠানিক নথি</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[var(--color-text-main)] mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="বিশেষ দ্রষ্টব্য..."
                  value={docRemarks}
                  onChange={(e) => setDocRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsDocModalOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  সংরক্ষণ করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: ADD ACADEMIC HISTORY ================= */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--color-text-main)]">
                পূর্ববর্তী শিক্ষাগত রেকর্ড যুক্ত করুন
              </h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddHistory} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--color-text-main)] mb-1">
                    পরীক্ষা / শ্রেণি <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ইবতেদায়ি সমাপনী / হিফজ"
                    value={historyExam}
                    onChange={(e) => setHistoryExam(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text-main)] mb-1">পাসের সন</label>
                  <input
                    type="number"
                    value={historyYear}
                    onChange={(e) => setHistoryYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[var(--color-text-main)] mb-1">
                  শিক্ষা প্রতিষ্ঠানের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="পূর্ববর্তী মাদ্রাসার নাম"
                  value={historyInst}
                  onChange={(e) => setHistoryInst(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--color-text-main)] mb-1">বোর্ড / বেফাক</label>
                  <input
                    type="text"
                    placeholder="বেফাক / বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড"
                    value={historyBoard}
                    onChange={(e) => setHistoryBoard(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[var(--color-text-main)] mb-1">প্রাপ্ত গ্রেড / মারহালা</label>
                  <input
                    type="text"
                    placeholder="যেমন: মুমতাজ / GPA 5.00"
                    value={historyResult}
                    onChange={(e) => setHistoryResult(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsHistoryModalOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  যুক্ত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
