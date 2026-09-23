import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Receipt,
  FileCheck,
  History,
  Printer,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import {
  AdmissionTransactionResult,
  AdmissionReceiptEntity,
  ClassEntity,
  SectionEntity,
  AcademicSession,
  ShiftEntity,
  AccountEntity,
  FundEntity,
  StudentEntity,
} from '../../types';
import { api } from '../../api';
import { Button } from '../../components/common/Button';
import { AdmissionWizard } from './components/AdmissionWizard';
import { AdmissionHistoryTable } from './components/AdmissionHistoryTable';
import { AdmissionSuccessModal } from './components/AdmissionSuccessModal';
import { PrintableAdmissionReceipt } from './components/PrintableAdmissionReceipt';
import { PrintableAdmissionForm } from './components/PrintableAdmissionForm';
import { toBengaliNumerals } from '../../utils/format';

type ViewMode = 'WIZARD' | 'HISTORY' | 'PRINT_RECEIPT' | 'PRINT_FORM';

export const AdmissionWorkflowView: React.FC<{ onNavigateToStudents?: () => void }> = ({
  onNavigateToStudents,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('WIZARD');
  const [loading, setLoading] = useState(true);

  // Core configuration data
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [sections, setSections] = useState<SectionEntity[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [shifts, setShifts] = useState<ShiftEntity[]>([]);
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);
  const [funds, setFunds] = useState<FundEntity[]>([]);
  const [receipts, setReceipts] = useState<AdmissionReceiptEntity[]>([]);

  // Post-admission state
  const [lastAdmissionResult, setLastAdmissionResult] = useState<AdmissionTransactionResult | null>(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<AdmissionReceiptEntity | null>(null);
  const [selectedStudentForFormPrint, setSelectedStudentForFormPrint] = useState<StudentEntity | null>(null);

  // Load all required data for the admission workflow
  const loadData = async () => {
    setLoading(true);
    try {
      const [
        classesRes,
        sectionsRes,
        sessionsRes,
        shiftsRes,
        accountsRes,
        fundsRes,
        receiptsRes,
      ] = await Promise.all([
        api.getClasses(),
        api.getSections(),
        api.getAcademicSessions(),
        api.getShifts(),
        api.getAccounts(),
        api.getFunds(),
        api.getAdmissionReceipts(),
      ]);

      if (classesRes.success) setClasses(classesRes.data);
      if (sectionsRes.success) setSections(sectionsRes.data);
      if (sessionsRes.success) setSessions(sessionsRes.data);
      if (shiftsRes.success) setShifts(shiftsRes.data);
      if (accountsRes.success) setAccounts(accountsRes.data);
      if (fundsRes.success) setFunds(fundsRes.data);
      if (receiptsRes.success) setReceipts(receiptsRes.data);
    } catch (err) {
      console.error('Failed to load admission configuration', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdmissionSuccess = (result: AdmissionTransactionResult) => {
    setLastAdmissionResult(result);
    // Refresh receipts list
    loadData();
  };

  const handleOpenReceiptPrint = (receipt: AdmissionReceiptEntity) => {
    setSelectedReceiptForPrint(receipt);
    setViewMode('PRINT_RECEIPT');
  };

  const handleOpenFormPrint = (student: StudentEntity) => {
    setSelectedStudentForFormPrint(student);
    setViewMode('PRINT_FORM');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          ভর্তি সিস্টেম ও কনফিগারেশন লোড হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Workflow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold">
              PHASE 07
            </span>
            <h1 className="text-xl font-bold text-[var(--color-text-main)]">
              ভর্তি কার্যক্রম ও মানি রসিদ (Admission Management System)
            </h1>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            ৮-ধাপের নির্ভুল ভর্তি ফরম, অটো রোল নির্ধারণ, ফি ক্যালকুলেশন ও ডাটাবেজ ট্রানজেকশন
          </p>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === 'WIZARD' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('WIZARD')}
            className={`text-xs font-bold ${
              viewMode === 'WIZARD'
                ? 'bg-[var(--color-primary)] text-white'
                : ''
            }`}
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            নতুন ভর্তি ফরম (8 Steps)
          </Button>

          <Button
            type="button"
            variant={viewMode === 'HISTORY' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('HISTORY')}
            className={`text-xs font-bold ${
              viewMode === 'HISTORY'
                ? 'bg-[var(--color-primary)] text-white'
                : ''
            }`}
          >
            <History className="w-4 h-4 mr-1.5" />
            ভর্তির তালিকা ও রসিদ ({toBengaliNumerals(receipts.length)})
          </Button>
        </div>
      </div>

      {/* Main Views */}
      {viewMode === 'WIZARD' && (
        <AdmissionWizard
          classes={classes}
          sections={sections}
          sessions={sessions}
          shifts={shifts}
          accounts={accounts}
          funds={funds}
          onAdmissionSuccess={handleAdmissionSuccess}
          onCancel={() => setViewMode('HISTORY')}
        />
      )}

      {viewMode === 'HISTORY' && (
        <AdmissionHistoryTable
          receipts={receipts}
          classes={classes}
          onSelectReceipt={handleOpenReceiptPrint}
          onNewAdmissionClick={() => setViewMode('WIZARD')}
        />
      )}

      {viewMode === 'PRINT_RECEIPT' && selectedReceiptForPrint && (
        <div className="space-y-4 animate-fadeIn">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode('HISTORY')}
            className="print:hidden text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            ভর্তির তালিকায় ফিরে যান
          </Button>
          <PrintableAdmissionReceipt
            receipt={selectedReceiptForPrint}
            onClose={() => setViewMode('HISTORY')}
          />
        </div>
      )}

      {viewMode === 'PRINT_FORM' && selectedStudentForFormPrint && (
        <div className="space-y-4 animate-fadeIn">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode('HISTORY')}
            className="print:hidden text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            ফিরে যান
          </Button>
          <PrintableAdmissionForm
            student={selectedStudentForFormPrint}
            onClose={() => setViewMode('HISTORY')}
          />
        </div>
      )}

      {/* Success Modal when transaction finishes */}
      {lastAdmissionResult && (
        <AdmissionSuccessModal
          result={lastAdmissionResult}
          onPrintReceipt={() => {
            setSelectedReceiptForPrint(lastAdmissionResult.receipt);
            setLastAdmissionResult(null);
            setViewMode('PRINT_RECEIPT');
          }}
          onPrintForm={() => {
            setSelectedStudentForFormPrint(lastAdmissionResult.student);
            setLastAdmissionResult(null);
            setViewMode('PRINT_FORM');
          }}
          onResetForNewAdmission={() => {
            setLastAdmissionResult(null);
            setViewMode('WIZARD');
          }}
          onGoToStudents={() => {
            setLastAdmissionResult(null);
            if (onNavigateToStudents) {
              onNavigateToStudents();
            } else {
              setViewMode('HISTORY');
            }
          }}
        />
      )}
    </div>
  );
};
