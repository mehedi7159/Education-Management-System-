import React from 'react';
import {
  FileCheck2,
  Lock,
  CheckCircle2,
  Clock,
  FileEdit,
  AlertTriangle,
} from 'lucide-react';
import { ExamWorkflowStatus } from '../../../types';

interface ExamStatusBadgeProps {
  status?: ExamWorkflowStatus;
  isLocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ExamStatusBadge: React.FC<ExamStatusBadgeProps> = ({
  status = 'DRAFT',
  isLocked,
  size = 'md',
}) => {
  const configMap: Record<
    ExamWorkflowStatus,
    { label: string; subLabel: string; bg: string; text: string; border: string; icon: any }
  > = {
    DRAFT: {
      label: 'খসড়া',
      subLabel: 'Draft',
      bg: 'bg-stone-50 dark:bg-stone-900/50',
      text: 'text-stone-700 dark:text-stone-300',
      border: 'border-stone-200 dark:border-stone-800',
      icon: FileEdit,
    },
    MARKS_ENTRY: {
      label: 'নম্বর এন্ট্রি চলছে',
      subLabel: 'Marks Entry',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Clock,
    },
    VERIFICATION: {
      label: 'যাচাই ও নিরীক্ষণ',
      subLabel: 'Verification',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
    },
    LOCKED: {
      label: 'ফলাফল লকড',
      subLabel: 'Locked',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: Lock,
    },
    TABULATION: {
      label: 'ট্যাবুলেশন প্রস্তুত',
      subLabel: 'Tabulation',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: FileCheck2,
    },
    REVIEWED: {
      label: 'পর্যালোচিত',
      subLabel: 'Reviewed',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-800',
      icon: CheckCircle2,
    },
    PUBLISHED: {
      label: 'ফলাফল প্রকাশিত',
      subLabel: 'Published',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    },
    ARCHIVED: {
      label: 'আর্কাইভকৃত',
      subLabel: 'Archived',
      bg: 'bg-stone-100 dark:bg-stone-800',
      text: 'text-stone-600 dark:text-stone-400',
      border: 'border-stone-300 dark:border-stone-700',
      icon: Lock,
    },
  };

  const current = configMap[status] || configMap.DRAFT;
  const Icon = isLocked && status !== 'LOCKED' && status !== 'PUBLISHED' ? Lock : current.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  return (
    <span
      id={`exam-status-badge-${status.toLowerCase()}`}
      className={`inline-flex items-center font-medium rounded-md border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{current.label}</span>
      <span className="text-[10px] opacity-70">({current.subLabel})</span>
    </span>
  );
};
