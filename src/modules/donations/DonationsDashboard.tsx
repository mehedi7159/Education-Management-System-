import React, { useState, useEffect } from 'react';
import {
  DonationEntity,
  FundEntity,
  ProjectEntity,
  DonorEntity,
  FundTransferEntity,
  AccountEntity,
} from '../../types';
import { api } from '../../api';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { PAYMENT_METHOD_LABELS, DONOR_CATEGORY_LABELS } from '../../constants';
import {
  HandCoins,
  Plus,
  Search,
  Filter,
  Users,
  Layers,
  Target,
  ArrowRightLeft,
  FileText,
  Printer,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Edit2,
  Award,
  Heart,
  BookOpen,
} from 'lucide-react';

import { NewDonationModal } from './NewDonationModal';
import { NewDonorModal } from './NewDonorModal';
import { DonorProfileModal } from './DonorProfileModal';
import { FundTransferModal } from './FundTransferModal';
import { NewProjectModal } from './NewProjectModal';
import { NewFundModal } from './NewFundModal';
import { DonationReceiptPrintModal } from './DonationReceiptPrintModal';
import { VoidDonationModal } from './VoidDonationModal';
import { DonationReportsTab } from './DonationReportsTab';

interface DonationsDashboardProps {
  onNavigate?: (module: string) => void;
  currentModule?: string;
}

type TabType = 'donations' | 'donors' | 'funds' | 'projects' | 'transfers' | 'reports';

export const DonationsDashboard: React.FC<DonationsDashboardProps> = ({ onNavigate, currentModule }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Data states
  const [donations, setDonations] = useState<DonationEntity[]>([]);
  const [funds, setFunds] = useState<FundEntity[]>([]);
  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [donors, setDonors] = useState<DonorEntity[]>([]);
  const [transfers, setTransfers] = useState<FundTransferEntity[]>([]);
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (currentModule === 'donors') return 'donors';
    if (currentModule === 'funds') return 'funds';
    if (currentModule === 'projects') return 'projects';
    if (currentModule === 'transfers') return 'transfers';
    if (currentModule === 'donation-reports') return 'reports';
    return 'donations';
  });

  useEffect(() => {
    if (currentModule === 'donors') setActiveTab('donors');
    else if (currentModule === 'funds') setActiveTab('funds');
    else if (currentModule === 'projects') setActiveTab('projects');
    else if (currentModule === 'transfers') setActiveTab('transfers');
    else if (currentModule === 'donation-reports') setActiveTab('reports');
  }, [currentModule]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [fundFilter, setFundFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isNewDonationOpen, setIsNewDonationOpen] = useState(false);
  const [isNewDonorOpen, setIsNewDonorOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonorEntity | null>(null);
  const [viewingDonorId, setViewingDonorId] = useState<string | null>(null);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectEntity | null>(null);

  const [isNewFundOpen, setIsNewFundOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<FundEntity | null>(null);

  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<DonationEntity | null>(null);
  const [selectedDonationForVoid, setSelectedDonationForVoid] = useState<DonationEntity | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, fundsRes, projectsRes, donorsRes, transfersRes, accountsRes, analyticsRes] =
        await Promise.all([
          api.getDonations(),
          api.getFunds(),
          api.getProjects(),
          api.getDonors(),
          api.getFundTransfers(),
          api.getAccounts(),
          api.getDonationAnalytics(),
        ]);

      if (donationsRes.success && donationsRes.data) setDonations(donationsRes.data);
      if (fundsRes.success && fundsRes.data) setFunds(fundsRes.data);
      if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
      if (donorsRes.success && donorsRes.data) setDonors(donorsRes.data);
      if (transfersRes.success && transfersRes.data) setTransfers(transfersRes.data);
      if (accountsRes.success && accountsRes.data) setAccounts(accountsRes.data);
      if (analyticsRes.success && analyticsRes.data) setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load donation data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Donations
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donorMobile.includes(searchTerm);
    const matchesFund = fundFilter === 'ALL' || d.fundId === fundFilter;
    const matchesProject = projectFilter === 'ALL' || d.projectId === projectFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesFund && matchesProject && matchesStatus;
  });

  // Filtered Donors
  const filteredDonors = donors.filter((d) => {
    return (
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.mobile.includes(searchTerm) ||
      (d.donorNo && d.donorNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Total metrics
  const totalRaised = analytics?.totalRaised || donations.filter((d) => d.status !== 'VOIDED').reduce((sum, d) => sum + d.amount, 0);
  const totalZakatRaised = analytics?.totalZakatRaised || donations.filter((d) => d.status !== 'VOIDED' && d.isZakatEligible).reduce((sum, d) => sum + d.amount, 0);
  const regularDonorsCount = donors.filter((d) => d.isRegularDonor).length;
  const totalFundsBalance = funds.reduce((sum, f) => sum + f.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <HandCoins className="w-3.5 h-3.5" />
                ফেজ ১৩ • অনুদান, যাকাত ও তহবিল ব্যবস্থাপনা
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 text-white/90 rounded-full text-xs font-semibold">
                শরীয়ত সম্মত আইসোলেশন
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              দান, সদকা, যাকাত ও ওয়াকফ ফান্ড ম্যানেজমেন্ট
            </h1>
            <p className="text-sm text-emerald-100/80 mt-1 max-w-2xl">
              সংরক্ষিত ফান্ডের পুঙ্খানুপুঙ্খ সুরক্ষা, ডিজিটাল রশিদ জারি, দাতা ডিরেক্টরি এবং কঠোর অডিট ট্রেইল সম্বলিত দ্বিমুখী হিসাবায়ন
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsNewDonationOpen(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              নতুন অনুদান গ্রহণ
            </button>
            <button
              onClick={() => setIsTransferOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 flex items-center gap-2 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4" />
              তহবিল স্থানান্তর
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Raised */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              মোট সংগৃহীত অনুদান
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text-main)] font-mono">
            ৳{totalRaised.toLocaleString('bn-BD')}
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            মোট সংগৃহীত রশিদ: {donations.filter((d) => d.status !== 'VOIDED').length} টি
          </p>
        </div>

        {/* Zakat & Lillah */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              যাকাত ও লিল্লাহ ফান্ড
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            ৳{totalZakatRaised.toLocaleString('bn-BD')}
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            মুস্তাহিক এতিম ও দরিদ্র ছাত্রদের জন্য সংরক্ষিত
          </p>
        </div>

        {/* Regular Donors */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              নিয়মিত দাতা / স্পনসর
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[var(--color-text-main)] font-mono">
            {regularDonorsCount} <span className="text-sm font-normal text-[var(--color-text-muted)]">/ {donors.length} জন</span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            মাসিক নিয়মিত পৃষ্ঠপোষক
          </p>
        </div>

        {/* Total Funds Balance */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
              সর্বমোট তহবিল স্থিতি
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ৳{totalFundsBalance.toLocaleString('bn-BD')}
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            {funds.length} টি সক্রিয় ফান্ডে বর্তমান জমা
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2 flex flex-wrap items-center gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'donations'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <FileText className="w-4 h-4" />
          অনুদান ও মানিরিসিপ্ট তালিকা ({donations.length})
        </button>

        <button
          onClick={() => setActiveTab('donors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'donors'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <Users className="w-4 h-4" />
          দাতা ডিরেক্টরি ({donors.length})
        </button>

        <button
          onClick={() => setActiveTab('funds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'funds'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          তহবিল ও আইসোলেশন ({funds.length})
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <Target className="w-4 h-4" />
          ওয়াকফ ও উন্নয়ন প্রকল্প ({projects.length})
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'transfers'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          তহবিল স্থানান্তর অডিট ({transfers.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <Award className="w-4 h-4" />
          রিপোর্ট ও বিশ্লেষণ (Reports Engine)
        </button>
      </div>

      {/* Tab 1: Donations List */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="রশিদ নং, দাতার নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={fundFilter}
                onChange={(e) => setFundFilter(e.target.value)}
                className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-main)]"
              >
                <option value="ALL">সকল তহবিল</option>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameBangla}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-main)]"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="COLLECTED">গৃহীত (Collected)</option>
                <option value="VOIDED">বাতিলকৃত (Voided)</option>
              </select>

              <button
                onClick={() => setIsNewDonationOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> নতুন অনুদান
              </button>
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase">
                  <th className="p-3.5">রশিদ নং ও তারিখ</th>
                  <th className="p-3.5">দাতার নাম ও যোগাযোগ</th>
                  <th className="p-3.5">তহবিল ও প্রকল্প</th>
                  <th className="p-3.5">মাধ্যম ও রেফারেন্স</th>
                  <th className="p-3.5 text-right">টাকার পরিমাণ (BDT)</th>
                  <th className="p-3.5 text-center">পরিস্থিতি</th>
                  <th className="p-3.5 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((don) => (
                    <tr key={don.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {don.receiptNo}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{don.date}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[var(--color-text-main)] text-sm">{don.donorName}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">{don.donorMobile}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-emerald-800 dark:text-emerald-300">{don.fundName}</div>
                        {don.projectName && (
                          <div className="text-[11px] text-[var(--color-text-muted)]">
                            প্রকল্প: {don.projectName}
                          </div>
                        )}
                        {don.isZakatEligible && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            ★ যাকাত / লিল্লাহ
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div>{PAYMENT_METHOD_LABELS[don.paymentMethod] || don.paymentMethod}</div>
                        {don.chequeOrTxnRef && (
                          <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
                            রেফ: {don.chequeOrTxnRef}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-base text-slate-900 dark:text-white">
                        ৳{don.amount.toLocaleString('bn-BD')}
                      </td>

                      <td className="p-3.5 text-center">
                        {don.status === 'VOIDED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            বাতিলকৃত (Void)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> আদায়কৃত
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDonationForReceipt(don)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg transition-colors"
                            title="রশিদ প্রিন্ট করুন"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {don.status !== 'VOIDED' && (
                            <button
                              onClick={() => setSelectedDonationForVoid(don)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg transition-colors"
                              title="রশিদ বাতিল করুন (Void)"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[var(--color-text-muted)]">
                      কোনো অনুদানের তথ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Donor Directory */}
      {activeTab === 'donors' && (
        <div className="space-y-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="দাতার নাম, মোবাইল বা কোড দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => {
                setEditingDonor(null);
                setIsNewDonorOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> নতুন দাতা নিবন্ধন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map((d) => (
              <div
                key={d.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] text-emerald-600 font-semibold">{d.donorNo}</span>
                      <h3 className="font-bold text-base text-[var(--color-text-main)]">{d.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {DONOR_CATEGORY_LABELS[d.category]?.bn || d.category}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-[var(--color-text-muted)] mt-3">
                    <div>মোবাইল: {d.mobile}</div>
                    {d.email && <div>ইমেইল: {d.email}</div>}
                    {d.address && <div>ঠিকানা: {d.address}</div>}
                    {d.isRegularDonor && (
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">
                        ★ নিয়মিত মাসিক অনুদানকারী {d.monthlyCommitment ? `(অঙ্গীকার: ৳${d.monthlyCommitment.toLocaleString('bn-BD')})` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase">মোট অবদান</div>
                    <div className="font-mono font-black text-emerald-600 text-base">
                      ৳{d.totalDonated.toLocaleString('bn-BD')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingDonorId(d.id)}
                      className="px-3 py-1.5 bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-xs font-semibold rounded-lg text-emerald-600 flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> লেজার
                    </button>
                    <button
                      onClick={() => {
                        setEditingDonor(d);
                        setIsNewDonorOpen(true);
                      }}
                      className="p-1.5 text-[var(--color-text-muted)] hover:text-emerald-600 rounded-lg transition-colors"
                      title="সম্পাদনা"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Funds & Isolation */}
      {activeTab === 'funds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                প্রাতিষ্ঠানিক তহবিল তালিকা ও পৃথকীকরণ নীতিমালা
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                শরীয়তের বিধান অনুযায়ী নির্ধারিত ফান্ড সুরক্ষা ও স্বাধীন ব্যালেন্স
              </p>
            </div>
            <button
              onClick={() => {
                setEditingFund(null);
                setIsNewFundOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> নতুন ফান্ড তৈরি
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funds.map((f) => (
              <div
                key={f.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: f.color || '#059669' }}
                ></div>
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)] uppercase">
                        {f.fundCode}
                      </span>
                      <h4 className="font-bold text-base text-[var(--color-text-main)]">{f.nameBangla}</h4>
                    </div>
                    {f.isRestricted ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        সংরক্ষিত
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        উন্মুক্ত
                      </span>
                    )}
                  </div>

                  {f.restrictionPurpose && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)]">
                      {f.restrictionPurpose}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">বর্তমান স্থিতি</div>
                    <div className="font-mono font-black text-emerald-600 text-xl">
                      ৳{f.currentBalance.toLocaleString('bn-BD')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingFund(f);
                      setIsNewFundOpen(true);
                    }}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-emerald-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                উন্নয়ন, অবকাঠামো ও বিশেষ দাতব্য প্রকল্পসমূহ
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                লক্ষ্যমাত্রাভিত্তিক তহবিল সংগ্রহ ও স্বয়ংক্রিয় প্রগ্রেস ট্র্যাকিং
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProject(null);
                setIsNewProjectOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> নতুন প্রকল্প তৈরি
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => {
              const progress = p.targetAmount > 0 ? Math.min(100, Math.round((p.raisedAmount / p.targetAmount) * 100)) : 0;
              return (
                <div
                  key={p.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-[var(--color-text-main)]">{p.name}</h4>
                      <div className="text-xs text-[var(--color-text-muted)]">তহবিল: {p.fundName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : p.status === 'COMPLETED'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? 'চলমান' : p.status === 'COMPLETED' ? 'সম্পন্ন' : 'স্থগিত'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setIsNewProjectOpen(true);
                        }}
                        className="p-1 text-[var(--color-text-muted)] hover:text-emerald-600 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-text-muted)]">
                        সংগৃহীত: ৳{p.raisedAmount.toLocaleString('bn-BD')} / লক্ষ্য: ৳{p.targetAmount.toLocaleString('bn-BD')}
                      </span>
                      <span className="font-mono font-bold text-emerald-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-[var(--color-bg)] h-3 rounded-full overflow-hidden border border-[var(--color-border)]">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-[var(--color-text-muted)]">{p.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Fund Transfers Audit Trail */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
            <div>
              <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                তহবিল স্থানান্তর অডিট লগ ও ফতোয়া অনুমোদন রেকর্ড
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                প্রতিটি স্থানান্তরের পেছনে মুহতামিম ও শরীয়ত অনুমোদন সংরক্ষিত
              </p>
            </div>
            <button
              onClick={() => setIsTransferOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> নতুন স্থানান্তর
            </button>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold uppercase">
                  <th className="p-3.5">তারিখ ও অডিট আইডি</th>
                  <th className="p-3.5">উৎস ও গন্তব্য তহবিল</th>
                  <th className="p-3.5">উদ্দেশ্য ও খাত</th>
                  <th className="p-3.5">শরীয়ত যুক্তি / ফতোয়া রেফ</th>
                  <th className="p-3.5 text-right">পরিমাণ (BDT)</th>
                  <th className="p-3.5 text-center">অনুমোদনকারী</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text-main)]">
                {transfers.length > 0 ? (
                  transfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-sm">{tr.date}</div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)]">{tr.id.slice(0, 8)}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className="text-rose-600">{tr.fromFundName}</span>
                          <span className="text-[var(--color-text-muted)]">➔</span>
                          <span className="text-emerald-600">{tr.toFundName}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-[var(--color-text-main)]">{tr.purpose}</div>
                      </td>

                      <td className="p-3.5">
                        {tr.shariahJustification ? (
                          <div className="space-y-0.5">
                            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                              {tr.shariahJustification}
                            </div>
                            {tr.fatwaOrResolutionRef && (
                              <div className="text-[10px] font-mono text-[var(--color-text-muted)]">
                                রেফ: {tr.fatwaOrResolutionRef}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">সাধারণ পরিচালন স্থানান্তর</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                        ৳{tr.amount.toLocaleString('bn-BD')}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {tr.authorizedBy}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">
                      কোনো তহবিল স্থানান্তর রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Reports Engine */}
      {activeTab === 'reports' && (
        <DonationReportsTab
          donations={donations}
          funds={funds}
          projects={projects}
          donors={donors}
          transfers={transfers}
        />
      )}

      {/* Modals */}
      {isNewDonationOpen && (
        <NewDonationModal
          isOpen={isNewDonationOpen}
          onClose={() => setIsNewDonationOpen(false)}
          onSuccess={(newDonation) => {
            setIsNewDonationOpen(false);
            loadData();
            setSelectedDonationForReceipt(newDonation);
          }}
          funds={funds}
          projects={projects}
          donors={donors}
          accounts={accounts}
        />
      )}

      {isNewDonorOpen && (
        <NewDonorModal
          isOpen={isNewDonorOpen}
          onClose={() => {
            setIsNewDonorOpen(false);
            setEditingDonor(null);
          }}
          onSuccess={() => {
            setIsNewDonorOpen(false);
            setEditingDonor(null);
            loadData();
          }}
          initialDonor={editingDonor}
        />
      )}

      {viewingDonorId && (
        <DonorProfileModal
          isOpen={!!viewingDonorId}
          donorId={viewingDonorId}
          onClose={() => setViewingDonorId(null)}
          onPrintReceipt={(donation) => {
            setSelectedDonationForReceipt(donation);
          }}
        />
      )}

      {isTransferOpen && (
        <FundTransferModal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          onSuccess={() => {
            setIsTransferOpen(false);
            loadData();
          }}
          funds={funds}
        />
      )}

      {isNewProjectOpen && (
        <NewProjectModal
          isOpen={isNewProjectOpen}
          onClose={() => {
            setIsNewProjectOpen(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            setIsNewProjectOpen(false);
            setEditingProject(null);
            loadData();
          }}
          funds={funds}
          initialProject={editingProject}
        />
      )}

      {isNewFundOpen && (
        <NewFundModal
          isOpen={isNewFundOpen}
          onClose={() => {
            setIsNewFundOpen(false);
            setEditingFund(null);
          }}
          onSuccess={() => {
            setIsNewFundOpen(false);
            setEditingFund(null);
            loadData();
          }}
          initialFund={editingFund}
        />
      )}

      {selectedDonationForReceipt && (
        <DonationReceiptPrintModal
          isOpen={!!selectedDonationForReceipt}
          donation={selectedDonationForReceipt}
          onClose={() => setSelectedDonationForReceipt(null)}
        />
      )}

      {selectedDonationForVoid && (
        <VoidDonationModal
          isOpen={!!selectedDonationForVoid}
          donation={selectedDonationForVoid}
          onClose={() => setSelectedDonationForVoid(null)}
          onSuccess={() => {
            setSelectedDonationForVoid(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
