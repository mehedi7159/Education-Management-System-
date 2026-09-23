import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
  User,
  Sparkles,
  Info,
} from 'lucide-react';
import { AdmissionFormData } from '../../../../types';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';

interface Step6Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
}

const SAMPLE_STUDENT_AVATARS = [
  {
    label: 'ছাত্র ১ (ক্যাপ ও পাঞ্জাবি)',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'ছাত্র ২ (কিশোর শিক্ষার্থী)',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'ছাত্র ৩ (হিফজ শিক্ষার্থী)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    label: 'ছাত্র ৪ (নূরানী শিশু)',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  },
];

export const Step6Photo: React.FC<Step6Props> = ({ formData, updateFormData }) => {
  const [photoUrlInput, setPhotoUrlInput] = useState(formData.photoUrl || '');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleApplyUrl = () => {
    if (photoUrlInput.trim()) {
      updateFormData({ photoUrl: photoUrlInput.trim() });
    }
  };

  const handleSimulateWebcamCapture = () => {
    // Pick next avatar or randomized sample
    const randomAvatar = SAMPLE_STUDENT_AVATARS[Math.floor(Math.random() * SAMPLE_STUDENT_AVATARS.length)];
    updateFormData({ photoUrl: randomAvatar.url });
    setPhotoUrlInput(randomAvatar.url);
    setIsCameraActive(false);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local object URL for instant preview
      const localUrl = URL.createObjectURL(file);
      updateFormData({ photoUrl: localUrl });
      setPhotoUrlInput(localUrl);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
          ৬
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            শিক্ষার্থীর ছবি ও বায়োমেট্রিক প্রোফাইল (Photo & Biometrics)
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            পাসপোর্ট সাইজ রঙিন ছবি আপলোড করুন অথবা ক্যামেরা দিয়ে সরাসরি ছবি তুলুন
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Live Photo Card Preview */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-surface-muted)] text-center">
          <div className="relative w-44 h-52 rounded-xl overflow-hidden shadow-md border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
            {formData.photoUrl ? (
              <img
                src={formData.photoUrl}
                alt="Student Passport"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <User className="w-16 h-16 mb-2 stroke-[1.5]" />
                <span className="text-xs font-medium">ছবি নির্বাচন করা হয়নি</span>
              </div>
            )}

            {formData.photoUrl && (
              <span className="absolute bottom-2 right-2 p-1 rounded-full bg-emerald-500 text-white shadow-sm">
                <CheckCircle className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="text-xs font-semibold text-[var(--color-text-main)] mb-1">
            পাসপোর্ট সাইজ ছবি (Passport Size: 45x35mm)
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] max-w-xs">
            সাদা বা হালকা ব্যাকগ্রাউন্ড, স্পষ্ট মুখাবয়ব ও শালীন পোশাক বা টুপি পরিহিত
          </p>
        </div>

        {/* Right: Upload Controls & Avatar Selector */}
        <div className="md:col-span-7 space-y-4">
          {/* File Upload Input */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[var(--color-primary)]" />
              কম্পিউটার বা মোবাইল থেকে আপলোড করুন
            </h4>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-sm">
                <Upload className="w-4 h-4 mr-2" />
                ফাইল নির্বাচন করুন (JPG/PNG)
                <input
                  type="file"
                  id="student-photo-file-upload"
                  accept="image/*"
                  onChange={handleFileUploadSim}
                  className="hidden"
                />
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSimulateWebcamCapture}
                className="text-xs"
              >
                <Camera className="w-4 h-4 mr-1.5 text-sky-500" />
                ওয়েবক্যাম দিয়ে ছবি তুলুন
              </Button>
            </div>
          </div>

          {/* Quick Avatar Gallery */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              নমুনা ছবি থেকে দ্রুত নির্বাচন করুন (Demo Avatars)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_STUDENT_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    updateFormData({ photoUrl: av.url });
                    setPhotoUrlInput(av.url);
                  }}
                  className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    formData.photoUrl === av.url
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/30 bg-[var(--color-primary-light)]/20'
                      : 'border-[var(--color-border-subtle)] hover:border-slate-400 bg-[var(--color-surface-card)]'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-14 h-14 rounded-lg object-cover mx-auto mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] font-medium text-[var(--color-text-main)] block truncate">
                    {av.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct URL Input */}
          <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-2">
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)]">
              সরাসরি ছবির ওয়েব লিংক (Image URL - ঐচ্ছিক)
            </label>
            <div className="flex gap-2">
              <Input
                id="photo-url-input"
                type="text"
                placeholder="https://example.com/student-photo.jpg"
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyUrl}
                className="text-xs px-3 shrink-0"
              >
                প্রয়োগ করুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
