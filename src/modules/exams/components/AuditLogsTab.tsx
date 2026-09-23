import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  User,
  Calendar,
  FileText,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { ExamAuditLogEntity, ExamEntity } from '../../../types';

interface AuditLogsTabProps {
  exams: ExamEntity[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ exams }) => {
  const { showToast } = useToast();
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<ExamAuditLogEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getExamAuditLogs(
        selectedExamId !== 'ALL' ? selectedExamId : undefined
      );
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err: any) {
      showToast('অডিট লগ লোড করতে ব্যর্থ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedExamId]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.studentName || '').toLowerCase().includes(q) ||
      (log.subjectName || '').toLowerCase().includes(q) ||
      (log.changedByName || log.performedBy || '').toLowerCase().includes(q) ||
      (log.reason || log.details || '').toLowerCase().includes(q) ||
      (log.resolutionNo && log.resolutionNo.toLowerCase().includes(q)) ||
      String(log.rollNo || '').includes(q)
    );
  });

  return (
    <div id="exam-audit-logs-tab" className="space-y-6">
      {/* Top Controls Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
              পরীক্ষা অনুযায়ী ফিল্টার:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 font-medium"
            >
              <option value="ALL">সকল পরীক্ষা</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.year})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2" />
            <input
              type="text"
              placeholder="শিক্ষার্থী, পরীক্ষক বা কারণ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            মোট সংশোধন রেকর্ড: <strong>{filteredLogs.length} টি</strong>
          </span>
          <button
            type="button"
            onClick={loadLogs}
            className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 rounded-lg transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audit Log Cards / Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-stone-500">অডিট লগ লোড হচ্ছে...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
            <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              কোনো অনুমোদিত সংশোধনের রেকর্ড নেই
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
              লকড বা প্রকাশিত পরীক্ষার কোনো নম্বরে পরিবর্তন করা হলে তা সম্পূর্ণ অডিট ট্রেইল ও সুনির্দিষ্ট কারণ
              সহ এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200 dark:divide-stone-800">
            {filteredLogs.map((log) => {
              const prevTotal =
                (log.previousTheoryMarks || 0) +
                (log.previousOralMarks || 0) +
                (log.previousMcqMarks || 0);
              const newTotal =
                (log.newTheoryMarks || 0) +
                (log.newOralMarks || 0) +
                (log.newMcqMarks || 0);
              const diff = newTotal - prevTotal;

              return (
                <div key={log.id} className="p-5 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                          {log.studentName} (রোল: {log.rollNo})
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                          বিষয়: {log.subjectName}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          পরীক্ষা: {log.examName}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5 pt-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>সংশোধনকারী:</span>
                        <strong className="text-stone-800 dark:text-stone-200">
                          {log.changedByName}
                        </strong>
                        <span className="text-stone-400">({log.changedByRole})</span>
                        <span className="text-stone-400">•</span>
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(log.createdAt || log.performedAt || Date.now()).toLocaleString('bn-BD')}</span>
                      </div>
                    </div>

                    {/* Marks comparison pill */}
                    <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block">পূর্ববর্তী নম্বর</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-300 line-through">
                          {prevTotal} ({log.previousGrade || '—'})
                        </span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-stone-400" />

                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">সংশোধিত নম্বর</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">
                          {newTotal} ({log.newGrade || '—'})
                        </span>
                      </div>

                      <span
                        className={`ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          diff > 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : diff < 0
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                  </div>

                  {/* Reason box */}
                  <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700/60 text-xs">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          সংশোধনের সুস্পষ্ট কারণ ও যুক্তি:
                        </span>
                        <p className="text-stone-700 dark:text-stone-300">{log.reason}</p>
                        {log.resolutionNo && (
                          <div className="text-[11px] text-stone-500 font-mono pt-1">
                            রেজুলেশন / মেমো নম্বর: <strong>{log.resolutionNo}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
