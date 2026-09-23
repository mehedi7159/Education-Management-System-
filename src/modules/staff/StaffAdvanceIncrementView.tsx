import React, { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  SalaryAdvanceEntity,
  SalaryIncrementEntity,
  StaffEntity,
} from '../../types';

export const StaffAdvanceIncrementView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'advance' | 'increment'>('advance');
  const [advances, setAdvances] = useState<SalaryAdvanceEntity[]>([]);
  const [increments, setIncrements] = useState<SalaryIncrementEntity[]>([]);
  const [staffList, setStaffList] = useState<StaffEntity[]>([]);
  
  // Advance Request Modal
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    staffId: '',
    amountRequested: 10000,
    monthlyDeduction: 2500,
    repaymentMonths: 4,
    reason: 'জরুরি পারিবারিক প্রয়োজন',
  });

  // Increment Modal
  const [isIncrementModalOpen, setIsIncrementModalOpen] = useState(false);
  const [incrementForm, setIncrementForm] = useState({
    staffId: '',
    incrementAmount: 2000,
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: 'বাৎসরিক পারফরম্যান্স সন্তোষজনক মূল্যায়ন ও শুরা সিদ্ধান্ত',
    approvedBy: 'মজলিসে শুরা ও মুহতামিম',
    resolutionNo: 'RES-2025/12',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [advRes, incRes, staffRes] = await Promise.all([
        api.getSalaryAdvances(),
        api.getSalaryIncrements(),
        api.getStaff(),
      ]);

      if (advRes.success) setAdvances(advRes.data);
      if (incRes.success) setIncrements(incRes.data);
      if (staffRes.success) {
        setStaffList(staffRes.data);
        if (staffRes.data.length > 0) {
          setAdvanceForm((prev) => ({ ...prev, staffId: staffRes.data[0].id }));
          setIncrementForm((prev) => ({ ...prev, staffId: staffRes.data[0].id }));
        }
      }
    } catch (err) {
      showToast('তথ্য লোড করতে সমস্যা হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    const stf = staffList.find((s) => s.id === advanceForm.staffId);
    if (!stf) return;

    try {
      const res = await api.requestSalaryAdvance({
        staffId: stf.id,
        staffName: stf.nameBangla,
        employeeId: stf.employeeId,
        designation: stf.designation,
        amountRequested: Number(advanceForm.amountRequested),
        amountApproved: Number(advanceForm.amountRequested),
        monthlyDeduction: Number(advanceForm.monthlyDeduction),
        repaymentMonths: Number(advanceForm.repaymentMonths),
        reason: advanceForm.reason,
      });

      if (res.success) {
        showToast('বেতন অগ্রিমের আবেদন সফলভাবে জমা হয়েছে।', 'success');
        setIsAdvanceModalOpen(false);
        loadData();
      } else {
        showToast(res.error?.message || 'আবেদন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('আবেদন পাঠানো সম্ভব হয়নি।', 'error');
    }
  };

  const handleApproveAdvance = async (adv: SalaryAdvanceEntity) => {
    try {
      const res = await api.approveSalaryAdvance(
        adv.id,
        adv.amountRequested,
        adv.repaymentMonths || 4,
        user?.fullName || 'মুহতামিম সাহেব',
        'প্রধান ক্যাশ কাউন্টার'
      );
      if (res.success) {
        showToast(`${adv.staffName}-এর বেতন অগ্রিম মঞ্জুর ও হিসাবভুক্ত হয়েছে।`, 'success');
        loadData();
      } else {
        showToast(res.error?.message || 'অনুমোদন ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('অনুমোদনে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleRejectAdvance = async (advanceId: string) => {
    try {
      const res = await api.rejectSalaryAdvance(
        advanceId,
        'নীতিমালা বহির্ভূত / চলতি কিস্তি চলমান থাকায় স্থগিত',
        user?.fullName || 'মুহতামিম সাহেব'
      );
      if (res.success) {
        showToast('আবেদন প্রত্যাখ্যান করা হয়েছে।', 'info');
        loadData();
      }
    } catch (err) {
      showToast('প্রত্যাখ্যান ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleSaveIncrement = async (e: React.FormEvent) => {
    e.preventDefault();
    const stf = staffList.find((s) => s.id === incrementForm.staffId);
    if (!stf) return;

    const incAmt = Number(incrementForm.incrementAmount);
    const prevBase = stf.baseSalary;
    const newBase = prevBase + incAmt;
    const incPct = prevBase > 0 ? (incAmt / prevBase) * 100 : 0;

    try {
      const res = await api.recordSalaryIncrement({
        staffId: stf.id,
        staffName: stf.nameBangla,
        employeeId: stf.employeeId,
        designation: stf.designation,
        previousBaseSalary: prevBase,
        incrementAmount: incAmt,
        incrementPercentage: incPct,
        newBaseSalary: newBase,
        effectiveDate: incrementForm.effectiveDate,
        reason: incrementForm.reason,
        approvedBy: incrementForm.approvedBy,
        resolutionNo: incrementForm.resolutionNo,
      });

      if (res.success) {
        showToast(`${stf.nameBangla}-এর ইনক্রিমেন্ট কার্যকর করা হয়েছে।`, 'success');
        setIsIncrementModalOpen(false);
        loadData();
      } else {
        showToast(res.error?.message || 'ইনক্রিমেন্ট রেকর্ড ব্যর্থ হয়েছে।', 'error');
      }
    } catch (err) {
      showToast('ইনক্রিমেন্ট প্রয়োগে সমস্যা হয়েছে।', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">সক্রিয় বেতন অগ্রিম স্থিতি</span>
          <p className="text-2xl font-bold mt-1 text-amber-600">
            ৳{advances.filter((a) => a.status === 'APPROVED' || a.status === 'DISBURSED').reduce((sum, a) => sum + a.remainingBalance, 0).toLocaleString('bn-BD')}
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">মাসিক কিস্তিতে কর্তনযোগ্য</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">অপেক্ষমান অগ্রিম আবেদন</span>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {advances.filter((a) => a.status === 'PENDING').length} টি
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">মুহতামিমের অনুমোদন প্রয়োজন</span>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">বাৎসরিক ইনক্রিমেন্ট রেকর্ড</span>
          <p className="text-2xl font-bold mt-1 text-[var(--color-text-main)]">
            {increments.length} টি
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">মজলিসে শুরা অনুমোদিত বৃদ্ধি</span>
        </div>
      </div>

      {/* Navigation and Action Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Sub-tabs */}
        <div className="flex items-center gap-2 bg-[var(--color-surface-hover)] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('advance')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'advance'
                ? 'bg-[var(--color-surface)] text-emerald-600 shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
            }`}
          >
            বেতন অগ্রিম (Salary Advance)
          </button>
          <button
            onClick={() => setActiveTab('increment')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'increment'
                ? 'bg-[var(--color-surface)] text-emerald-600 shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]'
            }`}
          >
            বেতন বৃদ্ধি ও ইনক্রিমেন্ট লগ
          </button>
        </div>

        {/* Action Button */}
        {activeTab === 'advance' ? (
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            নতুন অগ্রিম আবেদন
          </button>
        ) : (
          <button
            onClick={() => setIsIncrementModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            নতুন ইনক্রিমেন্ট যোগ করুন
          </button>
        )}

      </div>

      {/* TAB 1: ADVANCES TABLE */}
      {activeTab === 'advance' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {advances.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
              কোন বেতন অগ্রিমের রেকর্ড নেই।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                  <tr>
                    <th className="p-4">ভাউচার / নং</th>
                    <th className="p-4">শিক্ষক / স্টাফ</th>
                    <th className="p-4">আবেদনকৃত ও মঞ্জুরকৃত</th>
                    <th className="p-4">মাসিক কিস্তি</th>
                    <th className="p-4">বকেয়া স্থিতি</th>
                    <th className="p-4">কারণ</th>
                    <th className="p-4">অবস্থা</th>
                    <th className="p-4 text-right">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[var(--color-border)]">
                  {advances.map((adv) => (
                    <tr key={adv.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-600">
                        {adv.advanceNo}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[var(--color-text-main)] block">{adv.staffName}</span>
                        <span className="text-[11px] text-[var(--color-text-secondary)]">{adv.employeeId}</span>
                      </td>
                      <td className="p-4 font-medium">
                        ৳{adv.amountRequested.toLocaleString('bn-BD')}
                        {adv.amountApproved > 0 && adv.amountApproved !== adv.amountRequested && (
                          <span className="text-[10px] text-emerald-600 block font-bold">
                            মঞ্জুর: ৳{adv.amountApproved.toLocaleString('bn-BD')}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold">
                        ৳{adv.monthlyDeduction.toLocaleString('bn-BD')}/মাস
                        <span className="text-[10px] text-[var(--color-text-secondary)] block">
                          ({adv.repaymentMonths || 4} কিস্তিতে)
                        </span>
                      </td>
                      <td className="p-4 font-bold text-amber-600">
                        ৳{adv.remainingBalance.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-4 max-w-xs truncate">{adv.reason}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            adv.status === 'APPROVED' || adv.status === 'DISBURSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : adv.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : adv.status === 'FULLY_REPAID'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {adv.status === 'APPROVED'
                            ? 'মঞ্জুরকৃত'
                            : adv.status === 'DISBURSED'
                            ? 'বিতরণকৃত'
                            : adv.status === 'PENDING'
                            ? 'অপেক্ষমান'
                            : adv.status === 'FULLY_REPAID'
                            ? 'পরিশোধিত'
                            : 'প্রত্যাখ্যাত'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {adv.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleApproveAdvance(adv)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                            >
                              মঞ্জুর
                            </button>
                            <button
                              onClick={() => handleRejectAdvance(adv.id)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                            >
                              বাতিল
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCREMENTS TABLE */}
      {activeTab === 'increment' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {increments.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--color-text-secondary)]">
              কোন বেতন বৃদ্ধির রেকর্ড পাওয়া যায়নি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                  <tr>
                    <th className="p-4">শিক্ষক / কর্মকর্তা</th>
                    <th className="p-4">পূর্বের মূল বেতন</th>
                    <th className="p-4">বৃদ্ধিকৃত অর্থ</th>
                    <th className="p-4">নতুন নির্ধারিত মূল বেতন</th>
                    <th className="p-4">কার্যকর তারিখ</th>
                    <th className="p-4">কারণ ও অনুমোদন</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[var(--color-border)]">
                  {increments.map((inc) => (
                    <tr key={inc.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-[var(--color-text-main)] block">{inc.staffName}</span>
                        <span className="text-[11px] text-[var(--color-text-secondary)]">{inc.employeeId}</span>
                      </td>
                      <td className="p-4 font-medium">
                        ৳{inc.previousBaseSalary.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        +৳{inc.incrementAmount.toLocaleString('bn-BD')} ({inc.incrementPercentage.toFixed(1)}%)
                      </td>
                      <td className="p-4 font-bold text-sm text-[var(--color-text-main)]">
                        ৳{inc.newBaseSalary.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-4 font-mono">{inc.effectiveDate}</td>
                      <td className="p-4">
                        <span className="font-medium block">{inc.reason}</span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">
                          অনুমোদন: {inc.approvedBy} • স্মারক: {inc.resolutionNo || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADVANCE REQUEST MODAL */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                বেতন অগ্রিম আবেদন ফরম
              </h3>
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestAdvance} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">শিক্ষক / স্টাফ নির্বাচন করুন *</label>
                <select
                  value={advanceForm.staffId}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.nameBangla} ({stf.designation} - মূল বেতন: ৳{stf.baseSalary.toLocaleString('bn-BD')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">প্রার্থিত অগ্রিম টাকার পরিমাণ *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={advanceForm.amountRequested}
                  onChange={(e) => {
                    const amt = Number(e.target.value);
                    setAdvanceForm({
                      ...advanceForm,
                      amountRequested: amt,
                      monthlyDeduction: Math.round(amt / (advanceForm.repaymentMonths || 4)),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">কিস্তির মাস সংখ্যা</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={advanceForm.repaymentMonths}
                    onChange={(e) => {
                      const count = Number(e.target.value) || 1;
                      setAdvanceForm({
                        ...advanceForm,
                        repaymentMonths: count,
                        monthlyDeduction: Math.round(advanceForm.amountRequested / count),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">মাসিক কর্তন (স্বয়ংক্রিয়)</label>
                  <input
                    type="number"
                    required
                    value={advanceForm.monthlyDeduction}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, monthlyDeduction: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">অগ্রিম গ্রহণের সুনির্দিষ্ট কারণ *</label>
                <textarea
                  rows={2}
                  required
                  value={advanceForm.reason}
                  onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                  placeholder="জরুরি পারিবারিক খরচ, চিকিৎসা অথবা বাড়ি মেরামত"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  আবেদন দাখিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCREMENT MODAL */}
      {isIncrementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--color-text-main)]">
                বার্ষিক বেতন বৃদ্ধি (Salary Increment)
              </h3>
              <button
                onClick={() => setIsIncrementModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIncrement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">শিক্ষক / কর্মকর্তা নির্বাচন করুন *</label>
                <select
                  value={incrementForm.staffId}
                  onChange={(e) => setIncrementForm({ ...incrementForm, staffId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.id}>
                      {stf.nameBangla} ({stf.designation} - বর্তমান মূল বেতন: ৳{stf.baseSalary.toLocaleString('bn-BD')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">ইনক্রিমেন্ট টাকার পরিমাণ *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={incrementForm.incrementAmount}
                  onChange={(e) => setIncrementForm({ ...incrementForm, incrementAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">কার্যকর তারিখ *</label>
                <input
                  type="date"
                  required
                  value={incrementForm.effectiveDate}
                  onChange={(e) => setIncrementForm({ ...incrementForm, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ইনক্রিমেন্টের কারণ / সিদ্ধান্ত *</label>
                <input
                  type="text"
                  required
                  value={incrementForm.reason}
                  onChange={(e) => setIncrementForm({ ...incrementForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">অনুমোদনকারী কর্তৃপক্ষ *</label>
                  <input
                    type="text"
                    required
                    value={incrementForm.approvedBy}
                    onChange={(e) => setIncrementForm({ ...incrementForm, approvedBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">স্মারক / রেজুলেশন নং</label>
                  <input
                    type="text"
                    value={incrementForm.resolutionNo}
                    onChange={(e) => setIncrementForm({ ...incrementForm, resolutionNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIncrementModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  ইনক্রিমেন্ট প্রয়োগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
