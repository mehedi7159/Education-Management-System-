import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  RotateCcw,
  Sliders,
  Sparkles,
  Check,
  Download,
  Upload,
  Layers,
  Layout,
  Type,
  Square,
  Copy,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  ThemePresetId,
  BorderRadiusScale,
  SpacingScale,
  FontScale,
  SidebarStyleVariant,
  TopbarStyleVariant,
  CardStyleVariant,
  TableStyleVariant,
  ButtonStyleVariant,
  FormStyleVariant,
} from '../../theme';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const {
    themePreset,
    isDark,
    tokens,
    setThemePreset,
    toggleDarkMode,
    updateColorToken,
    updateComponentArchetype,
    resetTheme,
    exportThemeJson,
    importThemeJson,
  } = useTheme();

  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'components' | 'json'>('presets');
  const [jsonInput, setJsonInput] = useState('');

  // Primary color presets
  const PRIMARY_COLOR_PRESETS = [
    { name: 'Islamic Emerald', value: '#047857' },
    { name: 'Forest Green', value: '#15803d' },
    { name: 'Teal Scholar', value: '#0f766e' },
    { name: 'Royal Blue', value: '#1d4ed8' },
    { name: 'Navy Blue', value: '#1e3a8a' },
    { name: 'Indigo Wisdom', value: '#4338ca' },
    { name: 'Deep Purple', value: '#6d28d9' },
    { name: 'Ruby Crimson', value: '#be123c' },
    { name: 'Warm Terracotta', value: '#c2410c' },
    { name: 'Slate Steel', value: '#334155' },
  ];

  // Secondary color presets
  const SECONDARY_COLOR_PRESETS = [
    { name: 'Islamic Gold', value: '#b45309' },
    { name: 'Warm Amber', value: '#d97706' },
    { name: 'Teal Accent', value: '#0d9488' },
    { name: 'Emerald Mint', value: '#10b981' },
    { name: 'Sky Azure', value: '#0284c7' },
    { name: 'Rose Red', value: '#e11d48' },
    { name: 'Violet', value: '#7c3aed' },
  ];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportThemeJson());
    showToast('থিম কনফিগারেশন JSON ক্লিপবোর্ডে কপি হয়েছে', 'success');
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      showToast('অনুগ্রহ করে বৈধ JSON পেস্ট করুন', 'warning');
      return;
    }
    const ok = importThemeJson(jsonInput);
    if (ok) {
      showToast('নতুন ডিজাইন সিস্টেম সফলভাবে প্রয়োগ হয়েছে!', 'success');
      setJsonInput('');
    } else {
      showToast('JSON পার্স করতে ব্যর্থ হয়েছে। ফরমেট সঠিক কিনা দেখুন।', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="সেন্ট্রালাইজড ডিজাইন সিস্টেম ও থিম কাস্টমাইজেশন"
      subtitle="গ্লোবাল ব্র্যান্ড কালার, টাইপোগ্রাফি, বর্ডার রেডিয়াস, শ্যাডো ও কম্পোনেন্ট আর্কিটেকচার ম্যানেজার"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            থিম প্রিসেট ও ডার্ক মোড
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'colors'
                ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            কালার প্যালেট ও টোকেন
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'components'
                ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            কম্পোনেন্ট স্টাইল ও রেডিয়াস
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            JSON এক্সপোর্ট / ইম্পোর্ট
          </button>
        </div>

        {/* TAB 1: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Islamic Green */}
              <div
                onClick={() => setThemePreset('islamic-green')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  themePreset === 'islamic-green' && !isDark
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-[var(--color-border)] hover:border-emerald-400 bg-[var(--color-surface)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#047857] inline-block shadow-xs" />
                    <span className="font-bold text-sm text-[var(--color-text-main)]">
                      ইসলামিক সবুজ
                    </span>
                  </div>
                  {themePreset === 'islamic-green' && !isDark && (
                    <Check className="w-4 h-4 text-emerald-700 font-bold" />
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  মাদ্রাসার জন্য শান্তিময় সবুজ ও স্বর্ণালী কালার কম্বিনেশন (Default)
                </p>
                <div className="flex gap-1.5 mt-3">
                  <span className="w-6 h-6 rounded-md bg-[#047857]" />
                  <span className="w-6 h-6 rounded-md bg-[#b45309]" />
                  <span className="w-6 h-6 rounded-md bg-[#ecfdf5]" />
                  <span className="w-6 h-6 rounded-md bg-[#ffffff] border border-gray-200" />
                </div>
              </div>

              {/* Professional Blue */}
              <div
                onClick={() => setThemePreset('professional-blue')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  themePreset === 'professional-blue' && !isDark
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-[var(--color-border)] hover:border-blue-400 bg-[var(--color-surface)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#1d4ed8] inline-block shadow-xs" />
                    <span className="font-bold text-sm text-[var(--color-text-main)]">
                      প্রফেশনাল নীল
                    </span>
                  </div>
                  {themePreset === 'professional-blue' && !isDark && (
                    <Check className="w-4 h-4 text-blue-700 font-bold" />
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  কর্পোরেট ইনস্টিটিউশনাল নীল ও টিল কালার স্কিম
                </p>
                <div className="flex gap-1.5 mt-3">
                  <span className="w-6 h-6 rounded-md bg-[#1d4ed8]" />
                  <span className="w-6 h-6 rounded-md bg-[#0f766e]" />
                  <span className="w-6 h-6 rounded-md bg-[#eff6ff]" />
                  <span className="w-6 h-6 rounded-md bg-[#ffffff] border border-gray-200" />
                </div>
              </div>

              {/* Dark Theme */}
              <div
                onClick={() => setThemePreset('dark')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isDark || themePreset === 'dark'
                    ? 'border-emerald-500 bg-slate-900 text-white shadow-md ring-2 ring-emerald-500/30'
                    : 'border-[var(--color-border)] hover:border-slate-600 bg-[var(--color-surface)]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#10b981] inline-block shadow-xs" />
                    <span className="font-bold text-sm">মিডনাইট ডার্ক</span>
                  </div>
                  {(isDark || themePreset === 'dark') && (
                    <Check className="w-4 h-4 text-emerald-400 font-bold" />
                  )}
                </div>
                <p className="text-xs opacity-75">
                  রাতের কাজের উপযোগী হাই-কনট্রাস্ট চোখের সুরক্ষার ডার্ক মোড
                </p>
                <div className="flex gap-1.5 mt-3">
                  <span className="w-6 h-6 rounded-md bg-[#10b981]" />
                  <span className="w-6 h-6 rounded-md bg-[#0b0f19] border border-slate-700" />
                  <span className="w-6 h-6 rounded-md bg-[#111827] border border-slate-700" />
                  <span className="w-6 h-6 rounded-md bg-[#1f2937]" />
                </div>
              </div>
            </div>

            {/* Dark Mode Quick Toggle */}
            <div className="p-4 rounded-2xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-primary)]">
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                    ডার্ক মোড টগল
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    বর্তমান অবস্থা: {isDark ? 'ডার্ক মোড সক্রিয়' : 'লাইট মোড সক্রিয়'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={isDark ? 'primary' : 'outline'}
                onClick={toggleDarkMode}
                leftIcon={isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              >
                {isDark ? 'লাইট মোডে যান' : 'ডার্ক মোডে যান'}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: COLORS */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Primary Color Section */}
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                    প্রাইমারি ব্র্যান্ড কালার (Primary Color)
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    বাটন, একটিভ ন্যাভ, প্রধান হাইলাইটস ও ব্র্যান্ড আইডেন্টিটি
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.colors.primary}
                    onChange={(e) => updateColorToken('primary', e.target.value)}
                    className="w-9 h-9 rounded-xl border border-[var(--color-border)] cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="font-mono text-xs font-bold">{tokens.colors.primary}</span>
                </div>
              </div>

              {/* Swatches */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {PRIMARY_COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateColorToken('primary', c.value)}
                    className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all ${
                      tokens.colors.primary.toLowerCase() === c.value.toLowerCase()
                        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 font-bold'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary / Accent Color Section */}
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                    সেকেন্ডারি / অ্যাকসেন্ট কালার (Secondary / Accent Color)
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    ব্যাজ, হাইলাইট নোট, গোল্ডেন মেডেল ও পরিপূরক কালার
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tokens.colors.secondary}
                    onChange={(e) => updateColorToken('secondary', e.target.value)}
                    className="w-9 h-9 rounded-xl border border-[var(--color-border)] cursor-pointer p-0.5 bg-transparent"
                  />
                  <span className="font-mono text-xs font-bold">{tokens.colors.secondary}</span>
                </div>
              </div>

              {/* Secondary Swatches */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {SECONDARY_COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateColorToken('secondary', c.value)}
                    className={`p-2 rounded-xl text-left border text-xs flex items-center gap-2 transition-all ${
                      tokens.colors.secondary.toLowerCase() === c.value.toLowerCase()
                        ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 font-bold'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background & Surface Customizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-[var(--color-text-main)]">
                    ব্যাকগ্রাউন্ড ক্যানভাস (Background)
                  </h5>
                  <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                    {tokens.colors.bg}
                  </span>
                </div>
                <input
                  type="color"
                  value={tokens.colors.bg.startsWith('#') ? tokens.colors.bg : '#f8fafc'}
                  onChange={(e) => updateColorToken('bg', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border)] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-[var(--color-text-main)]">
                    কার্ড ও সারফেস কালার (Surface)
                  </h5>
                  <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                    {tokens.colors.surface}
                  </span>
                </div>
                <input
                  type="color"
                  value={tokens.colors.surface.startsWith('#') ? tokens.colors.surface : '#ffffff'}
                  onChange={(e) => updateColorToken('surface', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-[var(--color-border)] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPONENTS & RADIUS */}
        {activeTab === 'components' && (
          <div className="space-y-4">
            {/* Border Radius Archetype */}
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
              <h4 className="font-bold text-xs text-[var(--color-text-main)]">
                বর্ডার রেডিয়াস স্কেল (Border Radius Scale)
              </h4>
              <p className="text-xs text-[var(--color-text-muted)]">
                অ্যাপ্লিকেশনের কার্ড, বাটন ও ইনপুটের কোণার বক্রতা নির্ধারণ করুন
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {[
                  { id: 'none', label: 'ধারালো (Sharp 0px)' },
                  { id: 'subtle', label: 'সূক্ষ্ম (Subtle 4-8px)' },
                  { id: 'smooth', label: 'স্মুথ (Smooth 10-18px)' },
                  { id: 'rounded', label: 'গোলাকার (Rounded 20px+)' },
                  { id: 'pill', label: 'পিল / ক্যাপসুল (Pill)' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() =>
                      updateComponentArchetype('radiusScale', r.id as BorderRadiusScale)
                    }
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      tokens.components.radiusScale === r.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold shadow-2xs'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Component Archetype Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card Style */}
              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  কার্ড স্টাইল (Card Archetype)
                </label>
                <select
                  value={tokens.components.cardStyle}
                  onChange={(e) =>
                    updateComponentArchetype('cardStyle', e.target.value as CardStyleVariant)
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                >
                  <option value="classic">ক্লাসিক (Border + Subtle Shadow)</option>
                  <option value="flat">ফ্ল্যাট মিউটেড (Muted Flat Background)</option>
                  <option value="outline">আউটলাইন (Crisp Border 1.5px)</option>
                  <option value="elevated">এলিভেটেড (Floating Soft Shadow)</option>
                </select>
              </div>

              {/* Sidebar Style */}
              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  সাইডবার আর্কিটেকচার (Sidebar)
                </label>
                <select
                  value={tokens.components.sidebarStyle}
                  onChange={(e) =>
                    updateComponentArchetype('sidebarStyle', e.target.value as SidebarStyleVariant)
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                >
                  <option value="classic">ক্লাসিক স্ট্যান্ডার্ড (Classic 1px Border)</option>
                  <option value="bordered">স্ট্রং বর্ডার (Strong 2px)</option>
                  <option value="elevated">এলিভেটেড শ্যাডো (Elevated Shadow)</option>
                </select>
              </div>

              {/* Topbar Style */}
              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  টপবার আর্কিটেকচার (Topbar)
                </label>
                <select
                  value={tokens.components.topbarStyle}
                  onChange={(e) =>
                    updateComponentArchetype('topbarStyle', e.target.value as TopbarStyleVariant)
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                >
                  <option value="classic">ক্লাসিক স্ট্যান্ডার্ড (Classic Bordered)</option>
                  <option value="floating">ফ্লোটিং শ্যাডো (Floating Elevation)</option>
                  <option value="bordered">স্ট্রং বর্ডার (Crisp Border)</option>
                </select>
              </div>

              {/* Table Style */}
              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  টেবিল স্টাইল (Table Archetype)
                </label>
                <select
                  value={tokens.components.tableStyle}
                  onChange={(e) =>
                    updateComponentArchetype('tableStyle', e.target.value as TableStyleVariant)
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                >
                  <option value="modern">মডার্ন ক্লিন (Modern Hover)</option>
                  <option value="compact">কমপ্যাক্ট ডেনসিটি (Compact Rows)</option>
                  <option value="bordered">সম্পূর্ণ বর্ডারড (Bordered Cells)</option>
                  <option value="striped">স্ট্রাইপড জেব্রা (Striped Alternating)</option>
                </select>
              </div>

              {/* Button Style */}
              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  বাটন ভ্যারিয়েন্ট (Button Style)
                </label>
                <select
                  value={tokens.components.buttonStyle}
                  onChange={(e) =>
                    updateComponentArchetype('buttonStyle', e.target.value as ButtonStyleVariant)
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                >
                  <option value="solid">সলিড ফিল্ড (Solid Filled)</option>
                  <option value="subtle">সাবটল সফট (Subtle Soft)</option>
                  <option value="outline">আউটলাইন (Outline Border)</option>
                </select>
              </div>

              {/* Form Input Style */}
              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  ফর্ম ইনপুট স্টাইল (Form Controls)
                </label>
                <select
                  value={tokens.components.formStyle}
                  onChange={(e) =>
                    updateComponentArchetype('formStyle', e.target.value as FormStyleVariant)
                  }
                  className="w-full text-xs p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)]"
                >
                  <option value="classic">ক্লাসিক বর্ডারড (Classic 1px)</option>
                  <option value="filled">ফিল্ড মিউটেড (Filled Background)</option>
                  <option value="rounded">স্মুথ রাউন্ডেড (Rounded)</option>
                </select>
              </div>
            </div>

            {/* Density & Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  স্পেসিং ও প্যাডিং ঘনত্ব (Spacing Density)
                </label>
                <div className="flex gap-2">
                  {(['compact', 'comfortable', 'spacious'] as SpacingScale[]).map((sp) => (
                    <button
                      key={sp}
                      onClick={() => updateComponentArchetype('spacingScale', sp)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        tokens.components.spacingScale === sp
                          ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                          : 'border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'
                      }`}
                    >
                      {sp === 'compact' ? 'কমপ্যাক্ট' : sp === 'comfortable' ? 'স্বাভাবিক' : 'খোলামেলা'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2">
                <label className="block text-xs font-bold text-[var(--color-text-main)]">
                  ফন্ট স্কেল (Font Scale)
                </label>
                <div className="flex gap-2">
                  {(['compact', 'normal', 'large'] as FontScale[]).map((fs) => (
                    <button
                      key={fs}
                      onClick={() => updateComponentArchetype('fontScale', fs)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        tokens.components.fontScale === fs
                          ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                          : 'border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'
                      }`}
                    >
                      {fs === 'compact' ? 'ছোট (Compact)' : fs === 'normal' ? 'মিডিয়াম' : 'বড় (Large)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: JSON IMPORT / EXPORT */}
        {activeTab === 'json' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                    বর্তমান ডিজাইন সিস্টেম JSON
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    যেকোনো নতুন মাদ্রাসা বা ব্র্যান্ড থিম কনফিগারেশন সংরক্ষণ বা শেয়ার করতে পারেন
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Copy className="w-4 h-4" />}
                  onClick={handleCopyJson}
                >
                  JSON কপি করুন
                </Button>
              </div>

              <pre className="p-3 rounded-xl bg-[var(--color-surface-muted)] text-[11px] font-mono max-h-48 overflow-y-auto border border-[var(--color-border)] text-[var(--color-text-main)]">
                {exportThemeJson()}
              </pre>
            </div>

            {/* Import Custom Theme JSON */}
            <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
              <h4 className="font-bold text-sm text-[var(--color-text-main)]">
                কাস্টম থিম JSON ইম্পোর্ট করুন
              </h4>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="এখানে এক্সপোর্টকৃত JSON পেস্ট করুন..."
                rows={4}
                className="w-full text-xs font-mono p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={handleImportJson}
              >
                থিম ইম্পোর্ট ও প্রয়োগ করুন
              </Button>
            </div>
          </div>
        )}

        {/* Live Mini Preview Strip */}
        <div className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              লাইভ কম্পোনেন্ট প্রিভিউ (Live Design System Preview)
            </span>
            <Badge variant="primary" size="sm">
              Live CSS Variables
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="primary">
              Primary Action
            </Button>
            <Button size="sm" variant="secondary">
              Secondary Button
            </Button>
            <Button size="sm" variant="outline">
              Outline Button
            </Button>
            <Badge variant="success">সফল স্ট্যাটাস</Badge>
            <Badge variant="warning">অপেক্ষমান</Badge>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[var(--color-surface-muted)] text-[var(--color-text-main)]">
              Tokenized Text
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => {
              if (confirm('আপনি কি নিশ্চিত যে সকল কাস্টমাইজেশন রিসেট করে ডিফল্ট ইসলামিক গ্রিন থিমে ফিরে যেতে চান?')) {
                resetTheme();
                showToast('থিম ডিফল্ট অবস্থায় রিসেট হয়েছে', 'info');
              }
            }}
          >
            ডিফল্ট রিসেট
          </Button>
          <Button size="sm" variant="primary" onClick={onClose}>
            সম্পন্ন
          </Button>
        </div>
      </div>
    </Modal>
  );
};
