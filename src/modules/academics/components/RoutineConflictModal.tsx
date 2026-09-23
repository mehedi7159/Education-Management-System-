import React from 'react';
import {
  AlertTriangle,
  X,
  UserCheck,
  Building,
  GraduationCap,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { RoutineConflict, ClassRoutineSlotEntity } from '../../../types';
import { DAY_NAMES_SHORT_BN } from '../../../utils/routineConflictDetector';

interface RoutineConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: RoutineConflict[];
  candidateSlot: Partial<ClassRoutineSlotEntity>;
  onForceOverwrite?: () => void;
  canOverwrite?: boolean;
}

export const RoutineConflictModal: React.FC<RoutineConflictModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  candidateSlot,
  onForceOverwrite,
  canOverwrite = false,
}) => {
  if (!isOpen || conflicts.length === 0) return null;

  const dayLabel = candidateSlot.dayOfWeek
    ? DAY_NAMES_SHORT_BN[candidateSlot.dayOfWeek] || candidateSlot.dayOfWeek
    : '';

  return (
    <div
      id="routine-conflict-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="routine-conflict-modal-card"
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-rose-500/50 dark:border-rose-600/60 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Urgent Warning Header Banner */}
        <div className="bg-linear-to-r from-rose-600 to-amber-600 px-6 py-4 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  রুটিনে সময়সূচি সংঘাত সনাক্ত হয়েছে!
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white text-rose-700 text-xs font-black uppercase">
                  {conflicts.length} টি সংঘাত (Conflict)
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                শিক্ষক, কক্ষ বা জামাতের ডাবল-বুকিং এর কারণে এই পিরিয়ডটি কার্যকর করা যাবে না।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Context Notice */}
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">
                স্বয়ংক্রিয় রুটিন সংঘাত রোধ সিস্টেম:
              </span>
              একই সময়ে একজন উস্তাদজি একাধিক ক্লাসে উপস্থিত থাকতে পারবেন না এবং একটি কক্ষে একই সময়ে একাধিক ক্লাস পরিচালিত হতে পারবে না। অনুগ্রহ করে নিচের সংঘাতের বিবরণ দেখুন:
            </div>
          </div>

          {/* List of Conflicts */}
          <div className="space-y-4">
            {conflicts.map((conflict, idx) => {
              const isTeacher = conflict.type === 'TEACHER_DOUBLE_BOOKED';
              const isRoom = conflict.type === 'ROOM_DOUBLE_BOOKED';
              const isClass = conflict.type === 'CLASS_DOUBLE_BOOKED';

              return (
                <div
                  key={conflict.id || idx}
                  className="p-4 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-stone-50 dark:bg-stone-800/60 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          isTeacher
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                            : isRoom
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300'
                        }`}
                      >
                        {isTeacher && <UserCheck className="w-3.5 h-3.5" />}
                        {isRoom && <Building className="w-3.5 h-3.5" />}
                        {isClass && <GraduationCap className="w-3.5 h-3.5" />}
                        {conflict.title}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {dayLabel} • {conflict.existingSlot.startTime} - {conflict.existingSlot.endTime}
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                    {conflict.description}
                  </p>

                  {/* Visual Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    {/* Candidate Slot */}
                    <div className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700/60">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                        👉 নতুন বরাদ্দ করতে চাওয়া হচ্ছিল:
                      </span>
                      <div className="space-y-0.5 text-stone-900 dark:text-stone-100 font-medium">
                        <div>
                          <strong>জামাত:</strong> {candidateSlot.className || 'নির্বাচিত জামাত'}
                        </div>
                        <div>
                          <strong>বিষয়:</strong> {candidateSlot.subjectName || 'নির্বাচিত বিষয়'}
                        </div>
                        <div>
                          <strong>উস্তাদজি:</strong>{' '}
                          <span className={isTeacher ? 'text-rose-600 font-bold' : ''}>
                            {candidateSlot.teacherName || 'অনির্ধারিত'}
                          </span>
                        </div>
                        {candidateSlot.roomNo && (
                          <div>
                            <strong>কক্ষ নং:</strong>{' '}
                            <span className={isRoom ? 'text-rose-600 font-bold' : ''}>
                              {candidateSlot.roomNo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Existing Slot */}
                    <div className="p-3 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">
                        🔒 ইতোমধ্যে নির্ধারিত আছে:
                      </span>
                      <div className="space-y-0.5 text-stone-900 dark:text-stone-100 font-medium">
                        <div>
                          <strong>জামাত:</strong> {conflict.existingSlot.className}
                          {conflict.existingSlot.sectionName && ` (${conflict.existingSlot.sectionName})`}
                        </div>
                        <div>
                          <strong>বিষয়:</strong> {conflict.existingSlot.subjectName}
                        </div>
                        <div>
                          <strong>উস্তাদজি:</strong>{' '}
                          <span className={isTeacher ? 'text-rose-600 font-bold' : ''}>
                            {conflict.existingSlot.teacherName}
                          </span>
                        </div>
                        {conflict.existingSlot.roomNo && (
                          <div>
                            <strong>কক্ষ নং:</strong>{' '}
                            <span className={isRoom ? 'text-rose-600 font-bold' : ''}>
                              {conflict.existingSlot.roomNo}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center sm:text-left">
            * শিক্ষক বা কক্ষ পরিবর্তন করে পুনরায় চেষ্টা করুন।
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-conflict-modify"
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 border border-stone-300 dark:border-stone-600 rounded-xl transition-colors shadow-xs"
            >
              সংশোধন করুন (Modify Slot)
            </button>

            {canOverwrite && onForceOverwrite && (
              <button
                id="btn-conflict-force-overwrite"
                type="button"
                onClick={onForceOverwrite}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs"
              >
                বিদ্যমান স্লট প্রতিস্থাপন করুন (Overwrite)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
