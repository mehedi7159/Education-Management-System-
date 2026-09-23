import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Layers,
  Check,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../../api';
import { AcademicPresetType } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { cn } from '../../../utils/cn';

interface InstitutionPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied: () => void;
}

export const InstitutionPresetModal: React.FC<InstitutionPresetModalProps> = ({
  isOpen,
  onClose,
  onApplied,
}) => {
  const { showToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<'QAWMI' | 'ALIA' | 'HIFZ' | 'NURANI'>('QAWMI');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'QAWMI' as const,
      title: 'কওমি মাদ্রাসা (দরসে নিজামী পূর্ণাঙ্গ পাঠ্যক্রম)',
      badge: 'বেফাক / হাইয়াতুল উলয়া',
      description: 'নূরানী, নাজেরা, হিফজ এবং কিতাব বিভাগের তাইসীর, মীযান, নাহবেমীর, হেদায়াতুন নাহব, কাফিয়া, শরহে বেকায়া, জালালাইন, মেশকাত, দাওরায়ে হাদিস (তাকমীল) ও ইফতা পাঠ্যক্রম।',
      features: ['১০+ জামাত/শ্রেণি', 'দরসে নিজামী কিতাবসমূহ', 'হিজরি শিক্ষাবর্ষ কনফিগারেশন', 'তাকরার ও মৌখিক পরীক্ষা'],
    },
    {
      id: 'HIFZ' as const,
      title: 'হিফজুল কুরআন ও ক্যাডেট মাদ্রাসা',
      badge: 'হিফজ ও হিফজ সমাপনী',
      description: 'নাজেরা কুরআন, হিফজ বিভাগ (মুতাওয়াসসিতাহ ও তাকমীলুল হিফজ), আন্তর্জাতিক তাজবীদ ও ক্যাডেট সিলেবাস সমন্বিত আধুনিক মাদ্রাসা কাঠামো।',
      features: ['পারা ও রুকু ভিত্তিক ট্র্যাকিং', 'সবক ও আমুখতার সূচি', 'প্রভাতী ও দিবা শিফট', 'তাজবীদ ও মাসনুন দোয়া'],
    },
    {
      id: 'NURANI' as const,
      title: 'নূরানী ও কিন্ডারগার্টেন মাদ্রাসা',
      badge: 'শিশুতোষ কুরআন শিক্ষা',
      description: 'নূরানী প্লে, নার্সারি, নূরানী ১ম, ২য় ও ৩য় শ্রেণির পাঠ্যবই, বিশুদ্ধ মাখরাজ, ক্যালিগ্রাফি ও প্রাথমিক জেনারেল শিক্ষা সমন্বিত শিক্ষাক্রম।',
      features: ['শিশুতোষ নূরানী স্তর', 'আমপারা ও নাজেরা প্রস্তুতি', 'প্রাথমিক বিষয়সমূহ', 'সহজ মূল্যায়ন পদ্ধতি'],
    },
    {
      id: 'ALIA' as const,
      title: 'আলিয়া মাদ্রাসা (মাদ্রাসা শিক্ষা বোর্ড)',
      badge: 'বাংলাদেশ মাদ্রাসা শিক্ষাবোর্ড',
      description: 'ইবতেদায়ী ১ম-৫ম, দাখিল (সাধারণ ও বিজ্ঞান), আলিম, ফাজিল ও কামিল বোর্ড অনুমোদিত জাতীয় পাঠ্যক্রম ও বিষয় কাঠামো।',
      features: ['বোর্ড নির্ধারিত সিলেবাস', 'দাখিল ও আলিম বিষয়সমূহ', 'বিজ্ঞান ও সাধারণ বিভাগ', 'গ্রেডিং পয়েন্ট সিস্টেম'],
    },
  ];

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const presetTypeMap: Record<'QAWMI' | 'ALIA' | 'HIFZ' | 'NURANI', AcademicPresetType> = {
        QAWMI: 'QAWMI_STANDARD',
        HIFZ: 'HIFZ_CADET',
        NURANI: 'NURANI_KG',
        ALIA: 'ALIA_MADRASA',
      };
      const res = await api.applyAcademicStructurePreset(presetTypeMap[selectedPreset]);
      if (res.success) {
        showToast('প্রাতিষ্ঠানিক অ্যাকাডেমিক কাঠামো সফলভাবে সেটআপ করা হয়েছে!', 'success');
        onApplied();
        onClose();
      } else {
        showToast(res.error?.message || 'প্রিসেট প্রয়োগ ব্যর্থ হয়েছে', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              মাদ্রাসার অ্যাকাডেমিক স্ট্রাকচার প্রিসেট লোডার
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              আপনার প্রতিষ্ঠানের ধরন অনুযায়ী এক ক্লিকে বিভাগ, জামাত ও কিতাবের তালিকা স্বয়ংক্রিয়ভাবে তৈরি করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-bold">নোট:</span> প্রিসেট প্রয়োগ করলে আপনার মাদ্রাসার জন্য স্ট্যান্ডার্ড বিভাগ, ক্লাস ও কিতাবের তালিকা স্বয়ংক্রিয়ভাবে যোগ হবে। পরবর্তীতে আপনি এগুলো নিজের মতো সম্পাদন বা নতুন সংযোজন করতে পারবেন।
            </div>
          </div>

          <div className="space-y-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  selectedPreset === preset.id
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {preset.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {preset.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
                      >
                        <Check className="w-3 h-3" /> {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      selectedPreset === preset.id
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    )}
                  >
                    {selectedPreset === preset.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            নির্বাচিত: <strong>{presets.find((p) => p.id === selectedPreset)?.title}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {isApplying ? 'প্রয়োগ হচ্ছে...' : 'এই প্রিসেটটি সেটআপ করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
