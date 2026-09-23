import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Home,
  BookOpen,
  MapPin,
  Camera,
  Upload,
  Shield,
  Save,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  StudentEntity,
  ClassEntity,
  SectionEntity,
  Tenant,
  StudentStatus,
  DepartmentType,
} from '../../../types';
import { Button } from '../../../components/common/Button';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../api';

interface StudentFormModalProps {
  isOpen: boolean;
  student?: StudentEntity | null; // null for add, object for edit
  tenant: Tenant;
  classes: ClassEntity[];
  sections: SectionEntity[];
  onClose: () => void;
  onSuccess: (student: StudentEntity) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  student,
  tenant,
  classes,
  sections,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!student;
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<StudentEntity>>({
    studentIdCardNo: '',
    admissionNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    nameBangla: '',
    nameEnglish: '',
    nameArabic: '',
    gender: 'MALE',
    dateOfBirth: '2015-01-01',
    bloodGroup: 'B+',
    religion: 'ইসলাম',
    birthCertificateNo: '',
    previousInstitution: '',
    classId: classes[0]?.id || '',
    sectionId: sections[0]?.id || '',
    sessionName: '1446-1447 হি. / 2025-2026',
    rollNo: 1,
    dakhilaNo: '',
    registrationNo: '',
    department: DepartmentType.GENERAL,
    shiftName: 'দিবা শিফট (Day Shift)',
    biometricId: '',

    // Guardian
    fatherName: '',
    fatherOccupation: 'ব্যবসা',
    fatherMobile: '',
    fatherNid: '',
    motherName: '',
    motherOccupation: 'গৃহিণী',
    motherMobile: '',
    motherNid: '',
    guardianName: '',
    guardianRelation: 'পিতা',
    guardianMobile: '',
    guardianNid: '',
    guardianOccupation: '',
    guardianEmail: '',

    // Address
    presentAddress: '',
    presentDistrict: tenant.district || 'ঢাকা',
    presentThana: '',
    permanentAddress: '',
    permanentDistrict: tenant.district || 'ঢাকা',
    permanentThana: '',

    // Residential
    isResidential: false,
    residenceHall: '',
    roomNo: '',
    bedNo: '',
    status: StudentStatus.ACTIVE,
    photoUrl: '',
    medicalNotes: '',
    generalNotes: '',
  });

  const [sameAddress, setSameAddress] = useState(false);

  // Populate when editing or generating new ID
  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        presentDistrict: student.presentDistrict || tenant.district || 'ঢাকা',
        permanentDistrict: student.permanentDistrict || tenant.district || 'ঢাকা',
      });
      if (student.presentAddress === student.permanentAddress) {
        setSameAddress(true);
      }
    } else {
      // Auto-generate student ID & admission number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const prefix = tenant.code ? tenant.code.toUpperCase() : 'STD';
      const year = new Date().getFullYear();
      setFormData({
        studentIdCardNo: `${prefix}-${year}-${randomNum}`,
        admissionNo: `ADM-${randomNum}`,
        admissionDate: new Date().toISOString().split('T')[0],
        nameBangla: '',
        nameEnglish: '',
        nameArabic: '',
        gender: 'MALE',
        dateOfBirth: '2015-01-01',
        bloodGroup: 'B+',
        religion: 'ইসলাম',
        birthCertificateNo: '',
        previousInstitution: '',
        classId: classes[0]?.id || '',
        sectionId: sections[0]?.id || '',
        sessionName: '1446-1447 হি. / 2025-2026',
        rollNo: Math.floor(Math.random() * 30) + 1,
        dakhilaNo: `DAK-${randomNum}`,
        registrationNo: `REG-${year}-${randomNum}`,
        department: DepartmentType.GENERAL,
        shiftName: 'দিবা শিফট (Day Shift)',
        biometricId: `BIO-${randomNum}`,
        fatherName: '',
        fatherOccupation: 'ব্যবসা',
        fatherMobile: '',
        fatherNid: '',
        motherName: '',
        motherOccupation: 'গৃহিণী',
        motherMobile: '',
        motherNid: '',
        guardianName: '',
        guardianRelation: 'পিতা',
        guardianMobile: '',
        guardianNid: '',
        guardianOccupation: '',
        guardianEmail: '',
        presentAddress: 'মিরপুর, ঢাকা',
        presentDistrict: tenant.district || 'ঢাকা',
        presentThana: 'মিরপুর',
        permanentAddress: 'মিরপুর, ঢাকা',
        permanentDistrict: tenant.district || 'ঢাকা',
        permanentThana: 'মিরপুর',
        isResidential: false,
        residenceHall: 'প্রধান ছাত্রাবাস',
        roomNo: '১০১',
        bedNo: '১',
        status: StudentStatus.ACTIVE,
        photoUrl: '',
        medicalNotes: '',
        generalNotes: '',
      });
      setSameAddress(true);
    }
  }, [student, tenant, classes, sections, isOpen]);

  if (!isOpen) return null;

  // Filter sections based on selected class
  const availableSections = sections.filter((s) => !formData.classId || s.classId === formData.classId);

  // Sync father to guardian if relation is father
  const handleFatherChange = (name: string, mobile: string) => {
    setFormData((prev) => ({
      ...prev,
      fatherName: name,
      fatherMobile: mobile,
      guardianName: prev.guardianRelation === 'পিতা' ? name : prev.guardianName,
      guardianMobile: prev.guardianRelation === 'পিতা' ? mobile : prev.guardianMobile,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট হতে পারবে', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nameBangla?.trim()) {
      showToast('শিক্ষার্থীর বাংলা নাম লিখুন', 'error');
      setActiveStep(1);
      return;
    }
    if (!formData.guardianName?.trim()) {
      showToast('অভিভাবকের নাম লিখুন', 'error');
      setActiveStep(3);
      return;
    }
    if (!formData.guardianMobile?.trim()) {
      showToast('অভিভাবকের মোবাইল নম্বর লিখুন', 'error');
      setActiveStep(3);
      return;
    }

    try {
      setSubmitting(true);
      const selectedClassObj = classes.find((c) => c.id === formData.classId);
      const selectedSecObj = sections.find((s) => s.id === formData.sectionId);

      const finalPayload: any = {
        ...formData,
        className: selectedClassObj?.nameBangla,
        sectionName: selectedSecObj?.name,
        permanentAddress: sameAddress ? formData.presentAddress : formData.permanentAddress,
        permanentDistrict: sameAddress ? formData.presentDistrict : formData.permanentDistrict,
        permanentThana: sameAddress ? formData.presentThana : formData.permanentThana,
      };

      if (isEditing && student) {
        const res = await api.updateStudent(student.id, finalPayload, tenant.id);
        if (res.success) {
          showToast('শিক্ষার্থীর তথ্য সফলভাবে হালনাগাদ করা হয়েছে', 'success');
          onSuccess(res.data);
          onClose();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createStudent(finalPayload, tenant.id);
        if (res.success) {
          showToast('নতুন শিক্ষার্থী সফলভাবে ভর্তি করা হয়েছে', 'success');
          onSuccess(res.data);
          onClose();
        } else {
          showToast(res.error?.message || 'ভর্তি প্রক্রিয়া সম্পন্ন করা যায়নি', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: '১. ব্যক্তিগত তথ্য', icon: <UserCheck className="w-4 h-4" /> },
    { id: 2, title: '২. অ্যাকাডেমিক ও ভর্তি', icon: <BookOpen className="w-4 h-4" /> },
    { id: 3, title: '৩. পিতা-মাতা ও অভিভাবক', icon: <Home className="w-4 h-4" /> },
    { id: 4, title: '৪. ঠিকানা ও আবাসন', icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold">
              {isEditing ? 'শিক্ষার্থীর তথ্য সম্পাদনা' : 'নতুন শিক্ষার্থী ভর্তি ও নিবন্ধন ফরম'}
            </h2>
            <p className="text-xs text-emerald-200">
              {tenant.nameBangla} — সকল ফিল্ড যথাযথভাবে পূরণ করুন
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-[var(--color-surface-muted)]/50 border-b border-[var(--color-border)] flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
                }`}
              >
                {step.icon}
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= STEP 1: PERSONAL INFO ================= */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Photo Upload Box */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[var(--color-surface-muted)]/30 rounded-2xl border border-[var(--color-border)]">
                <div className="w-24 h-28 rounded-2xl border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-surface)] flex flex-col items-center justify-center overflow-hidden relative group">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Student"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-2 text-[var(--color-text-muted)]">
                      <Camera className="w-6 h-6 mx-auto mb-1 text-[var(--color-primary)]" />
                      <span className="text-[10px] block font-medium">ছবি আপলোড</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Choose Photo"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="text-xs font-bold text-[var(--color-text-main)]">
                    শিক্ষার্থীর পাসপোর্ট সাইজ ছবি
                  </h4>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    জেপিজি বা পিএনজি ফরম্যাট, সর্বোচ্চ ফাইল সাইজ ২ মেগাবাইট
                  </p>
                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
                    <label className="cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity">
                      ফাইল নির্বাচন
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, photoUrl: '' }))}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        ছবি সরান
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    শিক্ষার্থীর পূর্ণ নাম (বাংলায়) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মুহাম্মদ আব্দুল্লাহ"
                    value={formData.nameBangla || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, nameBangla: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    Student Name (English)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Muhammad Abdullah"
                    value={formData.nameEnglish || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, nameEnglish: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    الاسم بالعربية (আরবি নাম)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="محمد عبد الله"
                    value={formData.nameArabic || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, nameArabic: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] font-arabic"
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    লিঙ্গ (Gender)
                  </label>
                  <select
                    value={formData.gender || 'MALE'}
                    onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value as any }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  >
                    <option value="MALE">পুরুষ (Male)</option>
                    <option value="FEMALE">মহিলা (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    জন্ম তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth || '2015-01-01'}
                    onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={formData.bloodGroup || 'B+'}
                    onChange={(e) => setFormData((p) => ({ ...p, bloodGroup: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    ধর্ম (Religion)
                  </label>
                  <input
                    type="text"
                    value={formData.religion || 'ইসলাম'}
                    onChange={(e) => setFormData((p) => ({ ...p, religion: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              {/* IDs and Birth Cert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    জন্ম নিবন্ধন নম্বর (১৭ ডিজিট)
                  </label>
                  <input
                    type="text"
                    placeholder="2015xxxxxxxxxxxxx"
                    value={formData.birthCertificateNo || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, birthCertificateNo: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[var(--color-text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    পূর্ববর্তী শিক্ষা প্রতিষ্ঠানের নাম (যদি থাকে)
                  </label>
                  <input
                    type="text"
                    placeholder="পূর্বের মাদ্রাসার নাম"
                    value={formData.previousInstitution || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, previousInstitution: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: ACADEMIC INFO ================= */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    শ্রেণি / জামাত <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => {
                      const newClassId = e.target.value;
                      const validSec = sections.find((s) => s.classId === newClassId);
                      setFormData((p) => ({
                        ...p,
                        classId: newClassId,
                        sectionId: validSec ? validSec.id : '',
                      }));
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameBangla} ({cls.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    শাখা (Section) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData((p) => ({ ...p, sectionId: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  >
                    {availableSections.length > 0 ? (
                      availableSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))
                    ) : (
                      <option value="">কোনো শাখা পাওয়া যায়নি</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    রোল নম্বর (Roll No) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData((p) => ({ ...p, rollNo: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] font-bold"
                  />
                </div>
              </div>

              {/* Student ID & Admission Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    শিক্ষার্থী আইডি (Student ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentIdCardNo}
                    onChange={(e) => setFormData((p) => ({ ...p, studentIdCardNo: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono font-bold text-[var(--color-text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    ভর্তি নম্বর (Admission No)
                  </label>
                  <input
                    type="text"
                    value={formData.admissionNo}
                    onChange={(e) => setFormData((p) => ({ ...p, admissionNo: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[var(--color-text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    ভর্তির তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData((p) => ({ ...p, admissionDate: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              {/* Dakhila, Reg & Shift */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    দাখিলা নম্বর (Dakhila No)
                  </label>
                  <input
                    type="text"
                    placeholder="কওমি দাখিলা কোড"
                    value={formData.dakhilaNo || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, dakhilaNo: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    রেজিস্ট্রেশন নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="বোর্ড রেজিস্ট্রেশন"
                    value={formData.registrationNo || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, registrationNo: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    বিভাগ (Department)
                  </label>
                  <select
                    value={formData.department || DepartmentType.GENERAL}
                    onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value as any }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  >
                    <option value="GENERAL">সাধারণ (General)</option>
                    <option value="NURANI">নূরানী বিভাগ</option>
                    <option value="HIFZ">হিফজুল কুরআন</option>
                    <option value="NAJERA">নাজেরা বিভাগ</option>
                    <option value="KITAB">কিতাব বিভাগ</option>
                    <option value="DAWRA_HADITH">দাওরায়ে হাদীস</option>
                    <option value="IFTA">উচ্চতর ইফতা</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    বায়োমেট্রিক আইডি
                  </label>
                  <input
                    type="text"
                    placeholder="কার্ড পাঞ্চ আইডি"
                    value={formData.biometricId || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, biometricId: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: GUARDIAN INFO ================= */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Father Information */}
              <div className="p-4 bg-[var(--color-surface-muted)]/40 rounded-2xl border border-[var(--color-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  পিতার তথ্যাবলি (Father's Information)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      পিতার নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="পিতার নাম লিখুন"
                      value={formData.fatherName || ''}
                      onChange={(e) => handleFatherChange(e.target.value, formData.fatherMobile || '')}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      পিতার মোবাইল নং
                    </label>
                    <input
                      type="text"
                      placeholder="017xxxxxxxx"
                      value={formData.fatherMobile || ''}
                      onChange={(e) => handleFatherChange(formData.fatherName || '', e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      পিতার পেশা
                    </label>
                    <input
                      type="text"
                      placeholder="ব্যবসা / চাকরি"
                      value={formData.fatherOccupation || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, fatherOccupation: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      পিতার এনআইডি নং
                    </label>
                    <input
                      type="text"
                      placeholder="জাতীয় পরিচয়পত্র নম্বর"
                      value={formData.fatherNid || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, fatherNid: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Mother Information */}
              <div className="p-4 bg-[var(--color-surface-muted)]/40 rounded-2xl border border-[var(--color-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  মাতার তথ্যাবলি (Mother's Information)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      মাতার নাম
                    </label>
                    <input
                      type="text"
                      placeholder="মাতার নাম লিখুন"
                      value={formData.motherName || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, motherName: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      মাতার মোবাইল নং
                    </label>
                    <input
                      type="text"
                      placeholder="018xxxxxxxx"
                      value={formData.motherMobile || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, motherMobile: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      মাতার পেশা
                    </label>
                    <input
                      type="text"
                      placeholder="গৃহিণী / চাকরি"
                      value={formData.motherOccupation || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, motherOccupation: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      মাতার এনআইডি নং
                    </label>
                    <input
                      type="text"
                      placeholder="জাতীয় পরিচয়পত্র নম্বর"
                      value={formData.motherNid || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, motherNid: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Legal Guardian */}
              <div className="p-4 bg-[var(--color-surface)] rounded-2xl border-2 border-emerald-500/40 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    প্রাথমিক অভিভাবক ও জরুরি যোগাযোগ (Legal Guardian) <span className="text-rose-500">*</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--color-text-muted)]">সম্পর্ক:</span>
                    <select
                      value={formData.guardianRelation}
                      onChange={(e) => {
                        const rel = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          guardianRelation: rel,
                          guardianName: rel === 'পিতা' ? p.fatherName || '' : rel === 'মাতা' ? p.motherName || '' : p.guardianName,
                          guardianMobile: rel === 'পিতা' ? p.fatherMobile || '' : rel === 'মাতা' ? p.motherMobile || '' : p.guardianMobile,
                        }));
                      }}
                      className="text-xs py-1 px-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] font-bold"
                    >
                      <option value="পিতা">পিতা (Father)</option>
                      <option value="মাতা">মাতা (Mother)</option>
                      <option value="চাচা">চাচা / মামা</option>
                      <option value="ভাই">বড় ভাই</option>
                      <option value="দাদা">দাদা / নানা</option>
                      <option value="অন্যান্য">অন্যান্য আইনি অভিভাবক</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      অভিভাবকের নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="অভিভাবকের নাম"
                      value={formData.guardianName || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, guardianName: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      জরুরি মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="017xxxxxxxx"
                      value={formData.guardianMobile || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, guardianMobile: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono font-bold text-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      অভিভাবকের এনআইডি / ইমেইল
                    </label>
                    <input
                      type="text"
                      placeholder="এনআইডি বা ইমেইল"
                      value={formData.guardianNid || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, guardianNid: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: ADDRESS & RESIDENTIAL ================= */}
          {activeStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Addresses */}
              <div className="p-4 bg-[var(--color-surface-muted)]/40 rounded-2xl border border-[var(--color-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  বর্তমান ও স্থায়ী ঠিকানা
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                      বর্তমান ঠিকানা (গ্রাম/মহল্লা, বাসা নং, রোড) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: বাড়ি-১২, রোড-৪, মিরপুর-১০"
                      value={formData.presentAddress || ''}
                      onChange={(e) => setFormData((p) => ({ ...p, presentAddress: e.target.value }))}
                      className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                        থানা / উপজেলা
                      </label>
                      <input
                        type="text"
                        placeholder="থানার নাম"
                        value={formData.presentThana || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, presentThana: e.target.value }))}
                        className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                        জেলা (District)
                      </label>
                      <input
                        type="text"
                        placeholder="জেলার নাম"
                        value={formData.presentDistrict || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, presentDistrict: e.target.value }))}
                        className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAddress}
                        onChange={(e) => setSameAddress(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>স্থায়ী ঠিকানা বর্তমান ঠিকানার অনুরূপ (Same as present address)</span>
                    </label>
                  </div>

                  {!sameAddress && (
                    <div className="pt-2 border-t border-[var(--color-border-subtle)] space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                          স্থায়ী ঠিকানা
                        </label>
                        <input
                          type="text"
                          placeholder="স্থায়ী ঠিকানা লিখুন"
                          value={formData.permanentAddress || ''}
                          onChange={(e) => setFormData((p) => ({ ...p, permanentAddress: e.target.value }))}
                          className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Residential & Boarding */}
              <div className="p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    ছাত্রাবাস ও বোর্ডিং সুবিধা (Residential Info)
                  </h4>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={formData.isResidential}
                      onChange={(e) => setFormData((p) => ({ ...p, isResidential: e.target.checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>আবাসিক শিক্ষার্থী (Residential)</span>
                  </label>
                </div>

                {formData.isResidential && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                        ছাত্রাবাস / হল
                      </label>
                      <input
                        type="text"
                        placeholder="প্রধান ছাত্রাবাস"
                        value={formData.residenceHall || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, residenceHall: e.target.value }))}
                        className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                        কক্ষ নম্বর (Room No)
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: ১০২"
                        value={formData.roomNo || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, roomNo: e.target.value }))}
                        className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                        খাট / সিট নম্বর (Bed/Seat)
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: ৩"
                        value={formData.bedNo || ''}
                        onChange={(e) => setFormData((p) => ({ ...p, bedNo: e.target.value }))}
                        className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Special & Medical Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    শারীরিক ও স্বাস্থ্য সতর্কতা (Allergies/Medical Notes)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="অ্যালার্জি, হাঁপানি বা কোনো জরুরি স্বাস্থ্য নির্দেশনা..."
                    value={formData.medicalNotes || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, medicalNotes: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-main)] mb-1">
                    মুহতামিম / প্রাতিষ্ঠানিক মন্তব্য
                  </label>
                  <textarea
                    rows={2}
                    placeholder="বিশেষ কোনো সুযোগ-সুবিধা বা মন্তব্য..."
                    value={formData.generalNotes || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, generalNotes: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            <div>
              {activeStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                >
                  পূর্ববর্তী ধাপ
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                বাতিল
              </Button>
              {activeStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
                >
                  পরবর্তী ধাপ
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {isEditing ? 'তথ্য সংরক্ষণ করুন' : 'ভর্তি নিশ্চিত করুন'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
