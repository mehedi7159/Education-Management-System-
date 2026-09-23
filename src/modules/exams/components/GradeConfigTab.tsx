import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Info,
  Sliders,
} from 'lucide-react';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { GradeConfigEntity, GradeRule } from '../../../types';

export const GradeConfigTab: React.FC = () => {
  const { showToast } = useToast();
  const [configs, setConfigs] = useState<GradeConfigEntity[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Active config being edited
  const [name, setName] = useState('');
  const [systemType, setSystemType] = useState<'QAWMI' | 'ALIA' | 'CUSTOM'>('QAWMI');
  const [rules, setRules] = useState<GradeRule[]>([]);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getGradeConfigs();
      if (res.success && res.data) {
        setConfigs(res.data);
        if (res.data.length > 0 && !selectedConfigId) {
          const defaultCfg = res.data.find((c) => c.isDefault) || res.data[0];
          setSelectedConfigId(defaultCfg.id);
          populateForm(defaultCfg);
        }
      }
    } catch (err: any) {
      showToast('গ্রেডিং কনফিগারেশন লোড ব্যর্থ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const populateForm = (cfg: GradeConfigEntity) => {
    setName(cfg.name);
    const normalizedType: 'QAWMI' | 'ALIA' | 'CUSTOM' =
      cfg.systemType?.startsWith('ALIA') ? 'ALIA' : cfg.systemType?.startsWith('QAWMI') ? 'QAWMI' : 'CUSTOM';
    setSystemType(normalizedType);
    setRules(cfg.rules ? [...cfg.rules] : []);
  };

  const handleSelectConfig = (id: string) => {
    setSelectedConfigId(id);
    const target = configs.find((c) => c.id === id);
    if (target) populateForm(target);
  };

  // Presets
  const applyQawmiPreset = () => {
    setName('কওমি মাদ্রাসা ঐতিহ্যবাহী মারহালা পদ্ধতি (বেফাক মানদণ্ড)');
    setSystemType('QAWMI');
    setRules([
      {
        gradeName: 'মুমতাজ (Star / 80%+)',
        gradeNameEnglish: 'Mumtaz (Distinction)',
        minPercentage: 80,
        maxPercentage: 100,
        status: 'PASSED',
        remarksBn: 'অসাধারণ ও অনন্য কৃতিত্বপূর্ণ সাফল্য',
        colorTag: 'emerald',
      },
      {
        gradeName: 'জায়্যিদ জিদ্দান (1st Div / 65-79%)',
        gradeNameEnglish: 'Jayyid Jiddan (First Class)',
        minPercentage: 65,
        maxPercentage: 79.99,
        status: 'PASSED',
        remarksBn: 'প্রথম বিভাগে অত্যন্ত সন্তোষজনক ফলাফল',
        colorTag: 'blue',
      },
      {
        gradeName: 'জায়্যিদ (2nd Div / 50-64%)',
        gradeNameEnglish: 'Jayyid (Second Class)',
        minPercentage: 50,
        maxPercentage: 64.99,
        status: 'PASSED',
        remarksBn: 'দ্বিতীয় বিভাগে উত্তীর্ণ, আরও মেহনত প্রয়োজন',
        colorTag: 'cyan',
      },
      {
        gradeName: 'মাকবুল (3rd Div / 40-49%)',
        gradeNameEnglish: 'Maqbool (Pass)',
        minPercentage: 40,
        maxPercentage: 49.99,
        status: 'PASSED',
        remarksBn: 'সাধারণ পাশ, গভীর অধ্যয়ন বাঞ্ছনীয়',
        colorTag: 'amber',
      },
      {
        gradeName: 'রাসিব (Failed / 0-39%)',
        gradeNameEnglish: 'Rasib (Failed)',
        minPercentage: 0,
        maxPercentage: 39.99,
        status: 'FAILED',
        remarksBn: 'অকৃতকার্য, বিশেষ পুনরাবৃত্তি আবশ্যক',
        colorTag: 'rose',
      },
    ]);
    showToast('কওমি মারহালা মূল্যায়ন মানদণ্ড লোড করা হয়েছে', 'info');
  };

  const applyAliaPreset = () => {
    setName('মাদ্রাসা শিক্ষা বোর্ড ও আলিয়া জিপিএ পদ্ধতি (GPA 5.0)');
    setSystemType('ALIA');
    setRules([
      {
        gradeName: 'A+',
        gradeNameEnglish: 'A Plus',
        minPercentage: 80,
        maxPercentage: 100,
        gpaPoint: 5.0,
        status: 'PASSED',
        remarksBn: 'সর্বোচ্চ জিপিএ প্রাপ্তি',
        colorTag: 'emerald',
      },
      {
        gradeName: 'A',
        gradeNameEnglish: 'A Regular',
        minPercentage: 70,
        maxPercentage: 79.99,
        gpaPoint: 4.0,
        status: 'PASSED',
        remarksBn: 'উত্তম ফলাফল',
        colorTag: 'blue',
      },
      {
        gradeName: 'A-',
        gradeNameEnglish: 'A Minus',
        minPercentage: 60,
        maxPercentage: 69.99,
        gpaPoint: 3.5,
        status: 'PASSED',
        remarksBn: 'সন্তোষজনক',
        colorTag: 'cyan',
      },
      {
        gradeName: 'B',
        gradeNameEnglish: 'B Grade',
        minPercentage: 50,
        maxPercentage: 59.99,
        gpaPoint: 3.0,
        status: 'PASSED',
        remarksBn: 'চলতি মান',
        colorTag: 'amber',
      },
      {
        gradeName: 'C',
        gradeNameEnglish: 'C Grade',
        minPercentage: 40,
        maxPercentage: 49.99,
        gpaPoint: 2.0,
        status: 'PASSED',
        remarksBn: 'সাধারণ পাশ',
        colorTag: 'amber',
      },
      {
        gradeName: 'D',
        gradeNameEnglish: 'D Grade',
        minPercentage: 33,
        maxPercentage: 39.99,
        gpaPoint: 1.0,
        status: 'PASSED',
        remarksBn: 'প্রান্তিক পাশ',
        colorTag: 'orange',
      },
      {
        gradeName: 'F',
        gradeNameEnglish: 'Fail',
        minPercentage: 0,
        maxPercentage: 32.99,
        gpaPoint: 0.0,
        status: 'FAILED',
        remarksBn: 'অকৃতকার্য',
        colorTag: 'rose',
      },
    ]);
    showToast('আলিয়া জিপিএ ৫.০ মানদণ্ড লোড করা হয়েছে', 'info');
  };

  const handleRuleChange = (index: number, field: keyof GradeRule, value: any) => {
    setRules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      {
        gradeName: 'নতুন গ্রেড',
        gradeNameEnglish: 'New Grade',
        minPercentage: 0,
        maxPercentage: 100,
        gpaPoint: 0.0,
        status: 'PASSED',
        remarksBn: '',
        colorTag: 'blue',
      },
    ]);
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('কনফিগারেশনের নাম প্রদান করুন', 'warning');
      return;
    }
    if (rules.length === 0) {
      showToast('কমপক্ষে একটি গ্রেড রুল নির্ধারণ করুন', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (selectedConfigId) {
        const res = await api.updateGradeConfig(selectedConfigId, {
          name: name.trim(),
          systemType,
          rules,
        });
        if (res.success) {
          showToast('গ্রেডিং পদ্ধতি সফলভাবে সংরক্ষিত হয়েছে', 'success');
          loadConfigs();
        } else {
          showToast(res.error?.message || 'সংরক্ষণে ব্যর্থ', 'error');
        }
      } else {
        const res = await api.createGradeConfig({
          name: name.trim(),
          systemType,
          rules,
          isDefault: true,
        });
        if (res.success && res.data) {
          showToast('নতুন গ্রেডিং পদ্ধতি তৈরি হয়েছে', 'success');
          setSelectedConfigId(res.data.id);
          loadConfigs();
        } else {
          showToast(res.error?.message || 'তৈরি করতে ব্যর্থ', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'ত্রুটি ঘটেছে', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="grade-config-tab" className="space-y-6">
      {/* Top Selector & Quick Presets */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                গ্রেডিং ও জিপিএ মূল্যায়ন পদ্ধতি কনফিগারেশন
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                কওমি মারহালা মানদণ্ড, আলিয়া জিপিএ ৫.০ অথবা প্রতিষ্ঠানের নিজস্ব কাস্টম নিয়ম নির্ধারণ করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyQawmiPreset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>কওমি মারহালা প্রিসেট</span>
            </button>

            <button
              type="button"
              onClick={applyAliaPreset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>আলিয়া জিপিএ প্রিসেট</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedConfigId('');
                setName('কাস্টম মূল্যায়ন পদ্ধতি');
                setSystemType('CUSTOM');
                setRules([]);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন নিয়ম তৈরি</span>
            </button>
          </div>
        </div>

        {/* Existing Configs Dropdown */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
            বিদ্যমান কনফিগারেশন নির্বাচন করুন:
          </label>
          <select
            value={selectedConfigId}
            onChange={(e) => handleSelectConfig(e.target.value)}
            className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
          >
            {configs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.systemType}) {c.isDefault ? '— [ডিফল্ট]' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSaveConfig} className="space-y-6">
        <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                পদ্ধতির শিরোনাম / নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: কওমি মাদ্রাসা ঐতিহ্যবাহী মারহালা পদ্ধতি"
                className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                সিস্টেমের ধরন (System Type)
              </label>
              <select
                value={systemType}
                onChange={(e) => setSystemType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
              >
                <option value="QAWMI">কওমি মারহালা (বেফাকুল মাদারিসিল আরাবিয়া)</option>
                <option value="ALIA">আলিয়া জিপিএ স্কেল ৫.০ (বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড)</option>
                <option value="CUSTOM">কাস্টম প্রাতিষ্ঠানিক গ্রেডিং</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                গ্রেড ও নম্বর সীমানা বিভাজন (Grade Thresholds)
              </h4>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                শতকরা প্রাপ্ত নম্বরের ভিত্তিতে স্বয়ংক্রিয়ভাবে গ্রেড ও জিপিএ পয়েন্ট অর্পিত হবে
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRule}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ধাপ যুক্ত করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-3 py-3">গ্রেডের নাম (বাংলা)</th>
                  <th className="px-3 py-3">গ্রেডের নাম (ইংরেজি)</th>
                  <th className="px-3 py-3 w-28 text-center">সর্বনিম্ন %</th>
                  <th className="px-3 py-3 w-28 text-center">সর্বোচ্চ %</th>
                  {systemType === 'ALIA' && (
                    <th className="px-3 py-3 w-24 text-center">জিপিএ পয়েন্ট</th>
                  )}
                  <th className="px-3 py-3 w-28 text-center">অবস্থা</th>
                  <th className="px-3 py-3">গুণগত মন্তব্য</th>
                  <th className="px-3 py-3 w-12 text-center">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                {rules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="px-3 py-2 text-center text-stone-400 font-medium">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={rule.gradeName}
                        onChange={(e) => handleRuleChange(idx, 'gradeName', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={rule.gradeNameEnglish || ''}
                        onChange={(e) => handleRuleChange(idx, 'gradeNameEnglish', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                      />
                    </td>

                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={rule.minPercentage}
                        onChange={(e) =>
                          handleRuleChange(idx, 'minPercentage', Number(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 text-center bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </td>

                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={rule.maxPercentage}
                        onChange={(e) =>
                          handleRuleChange(idx, 'maxPercentage', Number(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 text-center bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </td>

                    {systemType === 'ALIA' && (
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.01"
                          value={rule.gpaPoint || 0}
                          onChange={(e) =>
                            handleRuleChange(idx, 'gpaPoint', Number(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 text-center font-bold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    <td className="px-3 py-2 text-center">
                      <select
                        value={rule.status}
                        onChange={(e) =>
                          handleRuleChange(idx, 'status', e.target.value as 'PASSED' | 'FAILED')
                        }
                        className={`px-2 py-1 text-xs rounded border ${
                          rule.status === 'PASSED'
                            ? 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'text-rose-700 border-rose-300 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        <option value="PASSED">উত্তীর্ণ (Pass)</option>
                        <option value="FAILED">অনুত্তীর্ণ (Fail)</option>
                      </select>
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="মন্তব্য..."
                        value={rule.remarksBn || ''}
                        onChange={(e) => handleRuleChange(idx, 'remarksBn', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
                      />
                    </td>

                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            id="btn-save-grade-config"
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সংরক্ষিত হচ্ছে...' : 'গ্রেডিং কনফিগারেশন সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
