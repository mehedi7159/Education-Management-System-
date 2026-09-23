import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Users,
  DoorOpen,
  Filter,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowUpDown,
  DollarSign,
  X,
  BookOpen,
} from 'lucide-react';
import { ClassEntity, SectionEntity, DepartmentConfig, DepartmentType } from '../../../types';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface ClassesSectionsTabProps {
  classes: ClassEntity[];
  sections: SectionEntity[];
  departments: DepartmentConfig[];
  onRefresh: () => void;
  canManage: boolean;
}

export const ClassesSectionsTab: React.FC<ClassesSectionsTabProps> = ({
  classes,
  sections,
  departments,
  onRefresh,
  canManage,
}) => {
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('ALL');

  // Class Modal state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassEntity | null>(null);

  // Section Modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState<ClassEntity | null>(null);
  const [editingSection, setEditingSection] = useState<SectionEntity | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Class Form Data
  const [classForm, setClassForm] = useState({
    nameBangla: '',
    nameEnglish: '',
    nameArabic: '',
    department: DepartmentType.KITAB as DepartmentType,
    orderIndex: 1,
    tuitionFee: 1000,
    admissionFee: 1500,
  });

  // Section Form Data
  const [sectionForm, setSectionForm] = useState({
    name: '',
    capacity: 40,
    roomNumber: '',
    isActive: true,
  });

  // Filtered Classes
  const filteredClasses = classes.filter((cls) => {
    const matchesDept = filterDept === 'ALL' || cls.department === filterDept;
    const matchesSearch =
      cls.nameBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.nameEnglish && cls.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  // Handlers for Class
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassForm({
      nameBangla: '',
      nameEnglish: '',
      nameArabic: '',
      department: (departments[0]?.type as DepartmentType) || (departments[0]?.code as any) || DepartmentType.KITAB,
      orderIndex: classes.length + 1,
      tuitionFee: 1000,
      admissionFee: 1500,
    });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassEntity) => {
    setEditingClass(cls);
    setClassForm({
      nameBangla: cls.nameBangla,
      nameEnglish: cls.nameEnglish || '',
      nameArabic: cls.nameArabic || '',
      department: cls.department,
      orderIndex: cls.orderIndex || 1,
      tuitionFee: cls.tuitionFee || 0,
      admissionFee: cls.admissionFee || 0,
    });
    setIsClassModalOpen(true);
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে '${name}' জামাত এবং এর সকল শাখা মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteClass(id);
      if (res.success) {
        showToast('শ্রেণি সফলভাবে মুছে ফেলা হয়েছে', 'success');
        onRefresh();
      } else {
        showToast(res.error?.message || 'মুছে ফেলা ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.nameBangla.trim()) {
      showToast('শ্রেণির বাংলা নাম প্রদান করুন', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClass) {
        const res = await api.updateClass(editingClass.id, classForm);
        if (res.success) {
          showToast('শ্রেণির তথ্য সফলভাবে হালনাগাদ হয়েছে', 'success');
          setIsClassModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createClass(classForm);
        if (res.success) {
          showToast('নতুন শ্রেণি সফলভাবে যুক্ত হয়েছে', 'success');
          setIsClassModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'তৈরি ব্যর্থ হয়েছে', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Section
  const handleOpenAddSection = (cls: ClassEntity) => {
    setSelectedClassForSection(cls);
    setEditingSection(null);
    setSectionForm({
      name: 'শাখা-ক',
      capacity: 40,
      roomNumber: '১০১',
      isActive: true,
    });
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (cls: ClassEntity, sec: SectionEntity) => {
    setSelectedClassForSection(cls);
    setEditingSection(sec);
    setSectionForm({
      name: sec.name,
      capacity: sec.capacity || 40,
      roomNumber: sec.roomNumber || '',
      isActive: sec.isActive ?? true,
    });
    setIsSectionModalOpen(true);
  };

  const handleDeleteSection = async (id: string, name: string) => {
    if (!canManage) return;
    if (!window.confirm(`আপনি কি '${name}' শাখাটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await api.deleteSection(id);
      if (res.success) {
        showToast('শাখা মুছে ফেলা হয়েছে', 'success');
        onRefresh();
      } else {
        showToast(res.error?.message || 'মুছে ফেলা সম্ভব হয়নি', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForSection || !sectionForm.name.trim()) {
      showToast('শাখার নাম উল্লেখ করুন', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSection) {
        const res = await api.updateSection(editingSection.id, {
          name: sectionForm.name,
          capacity: Number(sectionForm.capacity),
          roomNumber: sectionForm.roomNumber,
          isActive: sectionForm.isActive,
        });
        if (res.success) {
          showToast('শাখা তথ্য হালনাগাদ হয়েছে', 'success');
          setIsSectionModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'হালনাগাদ ব্যর্থ হয়েছে', 'error');
        }
      } else {
        const res = await api.createSection({
          classId: selectedClassForSection.id,
          className: selectedClassForSection.nameBangla,
          name: sectionForm.name,
          capacity: Number(sectionForm.capacity),
          roomNumber: sectionForm.roomNumber,
          isActive: sectionForm.isActive,
        });
        if (res.success) {
          showToast('নতুন শাখা সফলভাবে তৈরি হয়েছে', 'success');
          setIsSectionModalOpen(false);
          onRefresh();
        } else {
          showToast(res.error?.message || 'শাখা তৈরি ব্যর্থ হয়েছে', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header, Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            শ্রেণি ও শাখা ব্যবস্থাপনা (Classes & Sections)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            মাদ্রাসার সকল জামাত/শ্রেণি, শাখা বিভাজন, ছাত্র ধারণক্ষমতা ও ফি কাঠামো নির্ধারণ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="শ্রেণির নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
            >
              <option value="ALL">সকল বিভাগ (All Departments)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>
                  {d.nameBangla}
                </option>
              ))}
            </select>
          </div>

          {canManage && (
            <button
              onClick={handleOpenCreateClass}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              নতুন শ্রেণি যোগ করুন
            </button>
          )}
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredClasses.map((cls) => {
          const classSections = sections.filter((s) => s.classId === cls.id);
          const totalCapacity = classSections.reduce((acc, s) => acc + (s.capacity || 0), 0);

          return (
            <div
              key={cls.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    #{cls.orderIndex || 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {cls.nameBangla}
                      </h3>
                      {cls.nameArabic && (
                        <span className="text-xs font-arabic text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                          {cls.nameArabic}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {cls.department}
                      </span>
                    </div>
                    {cls.nameEnglish && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {cls.nameEnglish}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>মাসিক বেতন:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ৳{(cls.tuitionFee || 0).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>ধারণক্ষমতা:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {totalCapacity} জন
                    </span>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddSection(cls)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-md font-medium text-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> শাখা যোগ
                      </button>
                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="শ্রেণি সম্পাদনা"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.nameBangla)}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="শ্রেণি মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections List */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  নির্ধারিত শাখা ও গ্রুপসমূহ ({classSections.length} টি শাখা)
                </h4>

                {classSections.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {classSections.map((sec) => (
                      <div
                        key={sec.id}
                        className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                              {sec.name}
                            </span>
                            <span
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                sec.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              )}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {sec.roomNumber && (
                              <span className="flex items-center gap-1">
                                <DoorOpen className="w-3 h-3 text-slate-400" /> রুম: {sec.roomNumber}
                              </span>
                            )}
                            <span>সিট: {sec.capacity || 40}</span>
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditSection(cls, sec)}
                              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-sm"
                              title="শাখা সম্পাদনা"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(sec.id, sec.name)}
                              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-sm"
                              title="শাখা মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    কোনো শাখা তৈরি করা হয়নি। ডান পাশের "শাখা যোগ" বাটনে ক্লিক করে শাখা যুক্ত করুন।
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">কোনো শ্রেণি পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            আপনার মাদ্রাসার পাঠ্যক্রমের জামাত/শ্রেণি যুক্ত করতে উপরের বোতামে ক্লিক করুন অথবা প্রিসেট লোড করুন।
          </p>
        </div>
      )}

      {/* Modal for Create/Edit Class */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {editingClass ? 'শ্রেণি সম্পাদনা' : 'নতুন শ্রেণি/জামাত সংযোজন'}
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClass} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    শ্রেণির নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="উদা: মিশকাত জামাত / ১ম শ্রেণি"
                    value={classForm.nameBangla}
                    onChange={(e) => setClassForm({ ...classForm, nameBangla: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    বিভাগ নির্বাচন করুন *
                  </label>
                  <select
                    value={classForm.department}
                    onChange={(e) => setClassForm({ ...classForm, department: e.target.value as DepartmentType })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.code}>
                        {d.nameBangla} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ইংরেজি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: Mishkat Class"
                    value={classForm.nameEnglish}
                    onChange={(e) => setClassForm({ ...classForm, nameEnglish: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    আরবি নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: صف المشكاة"
                    value={classForm.nameArabic}
                    onChange={(e) => setClassForm({ ...classForm, nameArabic: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100 font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ক্রমিক নম্বর (Order)
                  </label>
                  <input
                    type="number"
                    value={classForm.orderIndex}
                    onChange={(e) => setClassForm({ ...classForm, orderIndex: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    মাসিক বেতন (৳)
                  </label>
                  <input
                    type="number"
                    value={classForm.tuitionFee}
                    onChange={(e) => setClassForm({ ...classForm, tuitionFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ভর্তি ফি (৳)
                  </label>
                  <input
                    type="number"
                    value={classForm.admissionFee}
                    onChange={(e) => setClassForm({ ...classForm, admissionFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingClass ? 'হালনাগাদ করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit Section */}
      {isSectionModalOpen && selectedClassForSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {editingSection ? 'শাখা সম্পাদনা' : 'নতুন শাখা সংযোজন'} ({selectedClassForSection.nameBangla})
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSection} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  শাখার নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদা: শাখা-ক / আবু বকর রা. গ্রুপ"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সর্বোচ্চ ধারণক্ষমতা (সিট)
                  </label>
                  <input
                    type="number"
                    value={sectionForm.capacity}
                    onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    কক্ষ নম্বর (Room No)
                  </label>
                  <input
                    type="text"
                    placeholder="উদা: ২০৩ / ৩য় তলা"
                    value={sectionForm.roomNumber}
                    onChange={(e) => setSectionForm({ ...sectionForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sectionForm.isActive}
                    onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    শাখাটি বর্তমানে সক্রিয় রাখুন (Active)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingSection ? 'হালনাগাদ করুন' : 'শাখা তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
