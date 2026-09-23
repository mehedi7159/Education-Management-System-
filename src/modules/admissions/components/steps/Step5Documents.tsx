import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  FileCheck,
  Paperclip,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { AdmissionFormData, StudentDocument } from '../../../../types';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';

interface Step5Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
}

const COMMON_DOC_TYPES = [
  { type: 'BIRTH_CERTIFICATE', label: 'জন্ম নিবন্ধন সনদের কপি (Birth Certificate)', required: true },
  { type: 'TRANSFER_CERTIFICATE', label: 'ছাড়পত্র / টিসি (Transfer Certificate)', required: false },
  { type: 'MARKSHEET', label: 'পূর্ববর্তী পরীক্ষার মার্কশিট / সনদ (Marksheet)', required: false },
  { type: 'NID_COPY', label: 'পিতা / অভিভাবকের এনআইডি কপি (Guardian NID)', required: true },
  { type: 'MEDICAL_DOC', label: 'মেডিকেল সার্টিফিকেট / রক্তের গ্রুপ রিপোর্ট', required: false },
  { type: 'OTHER', label: 'অন্যান্য প্রশংসাপত্র / দলিল (Other Document)', required: false },
] as const;

export const Step5Documents: React.FC<Step5Props> = ({ formData, updateFormData }) => {
  const [newDocType, setNewDocType] = useState<string>('BIRTH_CERTIFICATE');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocRemarks, setNewDocRemarks] = useState('');

  const handleAddQuickDoc = (type: any, defaultTitle: string) => {
    const existing = formData.documents.find((d) => d.type === type);
    if (existing) return;

    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title: defaultTitle,
      fileName: `${type.toLowerCase()}_scan.pdf`,
      fileSize: '১.২ মেগাবাইট',
      uploadDate: new Date().toISOString().split('T')[0],
      remarks: 'ভর্তি ফরমের সাথে সত্যায়িত কপি জমা দেওয়া হয়েছে',
    };

    updateFormData({
      documents: [...formData.documents, newDoc],
    });
  };

  const handleRemoveDoc = (id: string) => {
    updateFormData({
      documents: formData.documents.filter((d) => d.id !== id),
    });
  };

  const handleCustomAdd = () => {
    if (!newDocTitle.trim()) return;
    const newDoc: StudentDocument = {
      id: `doc-${Date.now()}`,
      type: newDocType as any,
      title: newDocTitle.trim(),
      fileName: `${newDocTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: '৮৫০ কিলোবাইট',
      uploadDate: new Date().toISOString().split('T')[0],
      remarks: newDocRemarks.trim() || 'সংযুক্তি প্রস্তুত',
    };

    updateFormData({
      documents: [...formData.documents, newDoc],
    });

    setNewDocTitle('');
    setNewDocRemarks('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
          ৫
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            কাগজপত্র ও সনদ সংযুক্তি (Document Attachments)
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            জন্ম নিবন্ধন, ছাড়পত্র, মার্কশিট এবং অভিভাবকের এনআইডি কপি সংযুক্তি
          </p>
        </div>
      </div>

      {/* Recommended Document Check List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[var(--color-text-main)]">
          প্রয়োজনীয় সনদের চেকলিস্ট (Quick Attach Common Documents)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {COMMON_DOC_TYPES.map((item) => {
            const isAttached = formData.documents.some((d) => d.type === item.type);
            return (
              <div
                key={item.type}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isAttached
                    ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      isAttached
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text-main)] truncate">
                      {item.label}
                    </p>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {item.required ? 'বাধ্যতামূলক (Required)' : 'ঐচ্ছিক (Optional)'}
                    </span>
                  </div>
                </div>

                <div>
                  {isAttached ? (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4 mr-1" /> সংযুক্ত
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddQuickDoc(item.type, item.label)}
                      className="text-xs py-1 px-2"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> যুক্ত করুন
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attached Documents Table */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-[var(--color-primary)]" />
            সংযুক্ত সনদের তালিকা ({formData.documents.length} টি ফাইল)
          </h4>
        </div>

        {formData.documents.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--color-text-muted)]">
            এখনও কোনো সনদ বা ফাইল যুক্ত করা হয়নি। উপরের তালিকা থেকে যুক্ত করুন।
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {formData.documents.map((doc) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-text-main)] truncate">
                      {doc.title}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                      ফাইল: {doc.fileName} • সাইজ: {doc.fileSize} • তারিখ: {doc.uploadDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                    যাচাইকৃত কপি
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Document */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] space-y-3">
        <h4 className="text-xs font-bold text-[var(--color-text-main)]">
          অন্যান্য কাস্টম ফাইল বা প্রত্যয়নপত্র সংযুক্তি
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              সনদের ধরন (Document Category)
            </label>
            <Select
              id="custom-doc-type"
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
            >
              <option value="BIRTH_CERTIFICATE">জন্ম নিবন্ধন</option>
              <option value="TRANSFER_CERTIFICATE">ছাড়পত্র (TC)</option>
              <option value="MARKSHEET">মার্কশিট</option>
              <option value="NID_COPY">এনআইডি কপি</option>
              <option value="MEDICAL_DOC">মেডিকেল রিপোর্ট</option>
              <option value="OTHER">অন্যান্য</option>
            </Select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              ফাইলের শিরোনাম / নাম
            </label>
            <Input
              id="custom-doc-title"
              type="text"
              placeholder="যেমন: হিফজ সমাপ্তির সনদপত্র"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1">
              মন্তব্য / বিবরণ
            </label>
            <Input
              id="custom-doc-remarks"
              type="text"
              placeholder="যেমন: মূল কপি সংরক্ষিত"
              value={newDocRemarks}
              onChange={(e) => setNewDocRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCustomAdd}
            disabled={!newDocTitle.trim()}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            তালিকায় যুক্ত করুন
          </Button>
        </div>
      </div>
    </div>
  );
};
