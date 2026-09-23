import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Printer,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Phone,
  MoreVertical,
  LayoutGrid,
  List,
  Users,
  CheckCircle2,
  Home,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { api } from '../../api';
import {
  StudentEntity,
  ClassEntity,
  SectionEntity,
  StudentStatus,
  DepartmentType,
} from '../../types';
import { toBengaliNumerals, formatDate, formatBdMobile } from '../../utils/format';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import {
  TableContainer,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from '../../components/common/Table';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PageHeader } from '../../components/layout/PageHeader';
import { Can } from '../../components/auth/Can';
import { useToast } from '../../context/ToastContext';

// Subcomponents
import { StudentProfileModal } from './components/StudentProfileModal';
import { StudentFormModal } from './components/StudentFormModal';
import { PrintableStudentProfile } from './components/PrintableStudentProfile';
import { PrintableStudentIdCard } from './components/PrintableStudentIdCard';
import { exportStudentsToCSV, printStudentListReport } from './utils/studentExport';

export const StudentListView: React.FC<{ onNewAdmission?: () => void }> = ({ onNewAdmission }) => {
  const { tenant } = useAuth();
  const { t, language } = useTranslation();
  const { showToast } = useToast();

  // Core Data State
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<SectionEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedResidential, setSelectedResidential] = useState<string>('ALL');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // View & Sort States
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'admissionDate' | 'id'>('roll');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Active Modals & Selected Student
  const [profileStudent, setProfileStudent] = useState<StudentEntity | null>(null);
  const [editStudent, setEditStudent] = useState<StudentEntity | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [printProfileStudent, setPrintProfileStudent] = useState<StudentEntity | null>(null);
  const [printIdCardStudent, setPrintIdCardStudent] = useState<StudentEntity | null>(null);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [classRes, secRes, studentRes] = await Promise.all([
        api.getClasses(tenant.id),
        api.getSections(tenant.id),
        api.getStudents(tenant.id, {
          search: searchQuery,
          classId: selectedClass,
          sectionId: selectedSection,
          department: selectedDepartment,
          status: selectedStatus,
          gender: selectedGender,
          isResidential: selectedResidential,
          bloodGroup: selectedBloodGroup,
        }),
      ]);

      if (classRes.success) setClasses(classRes.data);
      if (secRes.success) setSections(secRes.data);
      if (studentRes.success) setStudents(studentRes.data);
    } catch (err: any) {
      showToast(err.message || 'ডাটা লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    tenant.id,
    searchQuery,
    selectedClass,
    selectedSection,
    selectedDepartment,
    selectedStatus,
    selectedGender,
    selectedResidential,
    selectedBloodGroup,
  ]);

  // Handle Quick Delete
  const handleDeleteStudent = async (student: StudentEntity) => {
    if (!confirm(`আপনি কি নিশ্চিত যে '${student.nameBangla}' (রোল: ${student.rollNo}) কে তালিকা থেকে মুছে ফেলতে চান?`)) {
      return;
    }
    const res = await api.deleteStudent(student.id, tenant.id);
    if (res.success) {
      showToast(`শিক্ষার্থী '${student.nameBangla}' মুছে ফেলা হয়েছে`, 'success');
      loadData();
    } else {
      showToast(res.error?.message || 'শিক্ষার্থী মুছে ফেলা সম্ভব হয়নি', 'error');
    }
  };

  // Sort and Filtered List
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'roll') {
        comparison = a.rollNo - b.rollNo;
      } else if (sortBy === 'name') {
        comparison = (a.nameBangla || '').localeCompare(b.nameBangla || '');
      } else if (sortBy === 'admissionDate') {
        comparison = new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime();
      } else if (sortBy === 'id') {
        comparison = (a.studentIdCardNo || '').localeCompare(b.studentIdCardNo || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [students, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedStudents.slice(start, start + itemsPerPage);
  }, [sortedStudents, currentPage, itemsPerPage]);

  // Reset filter count
  const activeFilterCount = [
    selectedClass !== 'ALL',
    selectedSection !== 'ALL',
    selectedDepartment !== 'ALL',
    selectedStatus !== 'ALL',
    selectedGender !== 'ALL',
    selectedResidential !== 'ALL',
    selectedBloodGroup !== 'ALL',
    Boolean(searchQuery),
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('ALL');
    setSelectedSection('ALL');
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    setSelectedGender('ALL');
    setSelectedResidential('ALL');
    setSelectedBloodGroup('ALL');
    setCurrentPage(1);
  };

  // Metrics KPI calculations
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.status === 'ACTIVE').length;
  const residentialCount = students.filter((s) => s.isResidential).length;
  const maleCount = students.filter((s) => s.gender === 'MALE').length;
  const femaleCount = students.filter((s) => s.gender === 'FEMALE').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title={t('nav.students_list', 'শিক্ষার্থী ও অভিভাবক ব্যবস্থাপনা')}
        subtitle={`${tenant.nameBangla} — মোট তালিকাভুক্ত শিক্ষার্থী: ${toBengaliNumerals(totalCount)} জন`}
        badge={
          <Badge variant="primary">
            {tenant.academicYear || '1446-1447 হি. / 2025-2026'}
          </Badge>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              onClick={() => exportStudentsToCSV(students, classes, sections, tenant)}
            >
              এক্সেল / CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => printStudentListReport(students, classes, sections, tenant)}
            >
              রিপোর্ট প্রিন্ট
            </Button>
            <Can do="student.create">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<UserPlus className="w-4 h-4" />}
                onClick={() => {
                  if (onNewAdmission) {
                    onNewAdmission();
                  } else {
                    setEditStudent(null);
                    setIsFormModalOpen(true);
                  }
                }}
              >
                নতুন ছাত্র ভর্তি (8-Step)
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--color-text-muted)] block">মোট শিক্ষার্থী</span>
            <span className="text-base font-bold text-[var(--color-text-main)]">
              {toBengaliNumerals(totalCount)} জন
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--color-text-muted)] block">সক্রিয় / অধ্যয়নরত</span>
            <span className="text-base font-bold text-teal-700">
              {toBengaliNumerals(activeCount)} জন
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--color-text-muted)] block">আবাসিক ছাত্রাবাস</span>
            <span className="text-base font-bold text-amber-700">
              {toBengaliNumerals(residentialCount)} জন
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3.5 rounded-2xl flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--color-text-muted)] block">ছাত্র / ছাত্রী অনুপাত</span>
            <span className="text-xs font-bold text-[var(--color-text-main)]">
              পু: {toBengaliNumerals(maleCount)} | ম: {toBengaliNumerals(femaleCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter Suite */}
      <div className="bg-[var(--color-surface)] p-4 rounded-3xl border border-[var(--color-border)] shadow-2xs space-y-3">
        {/* Main Search Bar & Quick Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <Input
              placeholder="নাম, রোল, আইডি, ভর্তি নং, অভিভাবকের মোবাইল..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
            >
              <option value="ALL">সকল শ্রেণি / জামাত</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.nameBangla} ({cls.department})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="ACTIVE">সক্রিয় (Active)</option>
              <option value="INACTIVE">নিষ্ক্রিয়</option>
              <option value="TRANSFERRED">ছাড়পত্রপ্রাপ্ত</option>
              <option value="GRADUATED">উত্তীর্ণ / ফারেগ</option>
              <option value="EXPELLED">বহিষ্কৃত</option>
              <option value="DROPPED">বাতিল</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Button
              variant={showAdvancedFilters ? 'primary' : 'outline'}
              size="sm"
              className="w-full text-xs"
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              onClick={() => setShowAdvancedFilters((p) => !p)}
            >
              ফিল্টার {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                title="ফিল্টার রিসেট করুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[var(--color-border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
                বিভাগ (Department)
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
              >
                <option value="ALL">সকল বিভাগ</option>
                <option value="GENERAL">সাধারণ</option>
                <option value="NURANI">নূরানী</option>
                <option value="HIFZ">হিফজুল কুরআন</option>
                <option value="NAJERA">নাজেরা</option>
                <option value="KITAB">কিতাব বিভাগ</option>
                <option value="DAWRA_HADITH">দাওরায়ে হাদীস</option>
                <option value="IFTA">উচ্চতর ইফতা</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
                শাখা (Section)
              </label>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
              >
                <option value="ALL">সকল শাখা</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
                আবাসন ব্যবস্থা
              </label>
              <select
                value={selectedResidential}
                onChange={(e) => {
                  setSelectedResidential(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
              >
                <option value="ALL">সকল শিক্ষার্থী</option>
                <option value="true">আবাসিক (Residential)</option>
                <option value="false">অনাবাসিক (Non-Residential)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
                লিঙ্গ (Gender)
              </label>
              <select
                value={selectedGender}
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
              >
                <option value="ALL">উভয় (সকল)</option>
                <option value="MALE">পুরুষ (ছাত্র)</option>
                <option value="FEMALE">মহিলা (ছাত্রী)</option>
              </select>
            </div>
          </div>
        )}

        {/* View Switcher & Sorting Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--color-border-subtle)] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-muted)]">সর্টিং:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-1 px-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] font-medium"
            >
              <option value="roll">রোল নম্বর অনুসারে</option>
              <option value="name">নামের বর্ণানুক্রমিক</option>
              <option value="admissionDate">ভর্তির তারিখ</option>
              <option value="id">শিক্ষার্থী আইডি</option>
            </select>
            <button
              onClick={() => setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))}
              className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] transition-colors"
              title={sortOrder === 'asc' ? 'ছোট থেকে বড়' : 'বড় থেকে ছোট'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--color-surface-muted)] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-2xs font-bold'
                    : 'text-[var(--color-text-muted)]'
                }`}
                title="টেবিল ভিউ"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-2xs font-bold'
                    : 'text-[var(--color-text-muted)]'
                }`}
                title="কার্ড ভিউ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
              <span>প্রতি পাতায়:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs py-1 px-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <option value={10}>১০</option>
                <option value={25}>২৫</option>
                <option value={50}>৫০</option>
                <option value={100}>১০০</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)]">
          <LoadingSpinner size="lg" text="শিক্ষার্থীদের পূর্ণাঙ্গ বিবরণী লোড হচ্ছে..." />
        </div>
      ) : sortedStudents.length === 0 ? (
        <EmptyState
          title="কোনো শিক্ষার্থী পাওয়া যায়নি"
          description="অনুসন্ধানের সাথে মিল রয়েছে এমন কোনো শিক্ষার্থীর তথ্য তালিকায় নেই।"
          actionText="নতুন শিক্ষার্থী ভর্তি করুন"
          onAction={() => {
            setEditStudent(null);
            setIsFormModalOpen(true);
          }}
        />
      ) : viewMode === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedStudents.map((std) => {
              const stdClass = classes.find((c) => c.id === std.classId);
              const stdSec = sections.find((s) => s.id === std.sectionId);

              return (
                <div
                  key={std.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-emerald-800">
                          {std.photoUrl ? (
                            <img
                              src={std.photoUrl}
                              alt={std.nameBangla}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            std.nameBangla.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[var(--color-text-main)] line-clamp-1">
                            {std.nameBangla}
                          </h4>
                          <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                            {std.nameEnglish || 'Student'}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          std.status === 'ACTIVE'
                            ? 'success'
                            : std.status === 'TRANSFERRED'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {std.status}
                      </Badge>
                    </div>

                    {/* ID & Roll badges */}
                    <div className="flex items-center gap-2 mb-3 text-xs">
                      <span className="font-mono font-bold bg-[var(--color-surface-muted)] px-2.5 py-0.5 rounded-lg text-[var(--color-text-main)]">
                        {std.studentIdCardNo}
                      </span>
                      <span className="font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg">
                        রোল: {toBengaliNumerals(std.rollNo)}
                      </span>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-1.5 text-xs border-t border-b border-[var(--color-border-subtle)] py-2.5 my-2.5">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">শ্রেণি / শাখা:</span>
                        <span className="font-semibold text-[var(--color-text-main)]">
                          {stdClass?.nameBangla || std.className || '-'} (
                          {stdSec?.name || std.sectionName || '-'})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">অভিভাবক:</span>
                        <span className="font-medium text-[var(--color-text-main)]">
                          {std.guardianName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-text-muted)]">মোবাইল:</span>
                        <a
                          href={`tel:${std.guardianMobile}`}
                          className="font-mono font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {formatBdMobile(std.guardianMobile)}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">আবাসন:</span>
                        <span
                          className={`font-semibold ${
                            std.isResidential ? 'text-amber-600' : 'text-slate-500'
                          }`}
                        >
                          {std.isResidential ? 'আবাসিক ছাত্র' : 'অনাবাসিক'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPrintProfileStudent(std)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                        title="প্রোফাইল প্রিন্ট"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPrintIdCardStudent(std)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                        title="আইডি কার্ড"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditStudent(std);
                          setIsFormModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                        title="সম্পাদনা"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs"
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      onClick={() => setProfileStudent(std)}
                    >
                      প্রোফাইল
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedStudents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            locale={language}
          />
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="space-y-0">
          <TableContainer>
            <TableHeader>
              <TableHead className="w-14 text-center">রোল</TableHead>
              <TableHead>আইডি ও ভর্তি নম্বর</TableHead>
              <TableHead>শিক্ষার্থীর নাম ও ছবি</TableHead>
              <TableHead>শ্রেণি ও শাখা</TableHead>
              <TableHead>অভিভাবক ও মোবাইল</TableHead>
              <TableHead className="text-center">আবাসন</TableHead>
              <TableHead className="text-center">অবস্থা</TableHead>
              <TableHead className="text-right">পদক্ষেপ</TableHead>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((std) => {
                const stdClass = classes.find((c) => c.id === std.classId);
                const stdSec = sections.find((s) => s.id === std.sectionId);

                return (
                  <TableRow key={std.id}>
                    {/* Roll */}
                    <TableCell className="text-center font-bold text-base text-[var(--color-primary)]">
                      {toBengaliNumerals(std.rollNo)}
                    </TableCell>

                    {/* ID & Admission */}
                    <TableCell>
                      <div className="font-mono font-bold text-xs text-[var(--color-text-main)]">
                        {std.studentIdCardNo}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                        {std.admissionNo}
                      </div>
                    </TableCell>

                    {/* Name & Photo */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-emerald-800">
                          {std.photoUrl ? (
                            <img
                              src={std.photoUrl}
                              alt={std.nameBangla}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            std.nameBangla.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--color-text-main)]">
                            {std.nameBangla}
                          </div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            {std.nameEnglish || '-'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Class & Section */}
                    <TableCell>
                      <div className="font-semibold text-xs text-[var(--color-text-main)]">
                        {stdClass?.nameBangla || std.className || '-'}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">
                        {stdSec?.name || std.sectionName || 'সাধারণ শাখা'}
                      </div>
                    </TableCell>

                    {/* Guardian & Mobile */}
                    <TableCell>
                      <div className="text-xs font-semibold text-[var(--color-text-main)]">
                        {std.guardianName}
                      </div>
                      <a
                        href={`tel:${std.guardianMobile}`}
                        className="text-[11px] font-mono text-[var(--color-primary)] hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {formatBdMobile(std.guardianMobile)}
                      </a>
                    </TableCell>

                    {/* Residential */}
                    <TableCell className="text-center">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          std.isResidential
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {std.isResidential ? 'আবাসিক' : 'অনাবাসিক'}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          std.status === 'ACTIVE'
                            ? 'success'
                            : std.status === 'TRANSFERRED'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {std.status === 'ACTIVE'
                          ? 'সক্রিয়'
                          : std.status === 'TRANSFERRED'
                          ? 'ছাড়পত্র'
                          : std.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => setProfileStudent(std)}
                        >
                          প্রোফাইল
                        </Button>
                        <button
                          onClick={() => setPrintProfileStudent(std)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)] transition-colors"
                          title="প্রোফাইল প্রিন্ট"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPrintIdCardStudent(std)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)] transition-colors"
                          title="আইডি কার্ড"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditStudent(std);
                            setIsFormModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-muted)] transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(std)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedStudents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            locale={language}
          />
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Student Profile Modal */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          tenant={tenant}
          classes={classes}
          sections={sections}
          onClose={() => setProfileStudent(null)}
          onEdit={(std) => {
            setProfileStudent(null);
            setEditStudent(std);
            setIsFormModalOpen(true);
          }}
          onPrintProfile={(std) => setPrintProfileStudent(std)}
          onPrintIdCard={(std) => setPrintIdCardStudent(std)}
          onUpdateSuccess={(updated) => {
            setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          }}
        />
      )}

      {/* 2. Add / Edit Student Form Modal */}
      {isFormModalOpen && (
        <StudentFormModal
          isOpen={isFormModalOpen}
          student={editStudent}
          tenant={tenant}
          classes={classes}
          sections={sections}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditStudent(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}

      {/* 3. Printable Profile (Biodata) Document */}
      {printProfileStudent && (
        <PrintableStudentProfile
          student={printProfileStudent}
          tenant={tenant}
          classes={classes}
          sections={sections}
          onClose={() => setPrintProfileStudent(null)}
        />
      )}

      {/* 4. Printable Smart Student ID Card */}
      {printIdCardStudent && (
        <PrintableStudentIdCard
          student={printIdCardStudent}
          tenant={tenant}
          classes={classes}
          sections={sections}
          onClose={() => setPrintIdCardStudent(null)}
        />
      )}
    </div>
  );
};
