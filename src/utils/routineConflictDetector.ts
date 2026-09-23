import { ClassRoutineSlotEntity, RoutineConflict, DayOfWeek } from '../types';

export const DAY_NAMES_BN: Record<DayOfWeek, string> = {
  SATURDAY: 'শনিবার (Saturday)',
  SUNDAY: 'রবিবার (Sunday)',
  MONDAY: 'সোমবার (Monday)',
  TUESDAY: 'মঙ্গলবার (Tuesday)',
  WEDNESDAY: 'বুধবার (Wednesday)',
  THURSDAY: 'বৃহস্পতিবার (Thursday)',
  FRIDAY: 'শুক্রবার (Friday)',
};

export const DAY_NAMES_SHORT_BN: Record<DayOfWeek, string> = {
  SATURDAY: 'শনিবার',
  SUNDAY: 'রবিবার',
  MONDAY: 'সোমবার',
  TUESDAY: 'মঙ্গলবার',
  WEDNESDAY: 'বুধবার',
  THURSDAY: 'বৃহস্পতিবার',
  FRIDAY: 'শুক্রবার',
};

/**
 * Checks if two time ranges overlap (format: "HH:mm")
 */
export const doTimeRangesOverlap = (
  startA?: string,
  endA?: string,
  startB?: string,
  endB?: string
): boolean => {
  if (!startA || !endA || !startB || !endB) return false;
  return startA < endB && endA > startB;
};

/**
 * Detects any scheduling conflicts for a candidate routine slot against existing routine slots.
 * Checks for:
 * 1. Teacher Double-Booking (same teacher in another class/room at the same day & time/period)
 * 2. Room Double-Booking (same room used by another class at the same day & time/period)
 * 3. Class & Section Double-Booking (class already has another subject at the same day & time/period)
 */
export const detectRoutineConflicts = (
  candidate: Partial<ClassRoutineSlotEntity>,
  existingSlots: ClassRoutineSlotEntity[],
  currentSlotIdToIgnore?: string
): RoutineConflict[] => {
  const conflicts: RoutineConflict[] = [];

  if (!candidate.dayOfWeek) {
    return conflicts;
  }

  for (const slot of existingSlots) {
    // Ignore the slot being edited
    if (currentSlotIdToIgnore && slot.id === currentSlotIdToIgnore) {
      continue;
    }
    if (candidate.id && slot.id === candidate.id) {
      continue;
    }

    // Must be same day of the week
    if (slot.dayOfWeek !== candidate.dayOfWeek) {
      continue;
    }

    // Check if period matches OR time ranges overlap
    const samePeriod =
      candidate.periodNumber !== undefined &&
      slot.periodNumber !== undefined &&
      Number(candidate.periodNumber) === Number(slot.periodNumber);

    const timeOverlap = doTimeRangesOverlap(
      candidate.startTime,
      candidate.endTime,
      slot.startTime,
      slot.endTime
    );

    const isSlotTimeConflicting = samePeriod || timeOverlap;

    if (!isSlotTimeConflicting) {
      continue;
    }

    const dayName = DAY_NAMES_SHORT_BN[slot.dayOfWeek] || slot.dayOfWeek;
    const timeLabel = `${slot.startTime || '—'} হতে ${slot.endTime || '—'}`;
    const periodLabel = `${slot.periodNumber ? `${slot.periodNumber}ম পিরিয়ড` : ''} (${timeLabel})`;

    // 1. Teacher Double-Booking Check
    if (
      candidate.teacherId &&
      slot.teacherId &&
      candidate.teacherId === slot.teacherId
    ) {
      conflicts.push({
        id: `conflict-teacher-${slot.id}-${Date.now()}`,
        type: 'TEACHER_DOUBLE_BOOKED',
        title: 'উস্তাদজি / শিক্ষক ডাবল-বুকিং সংঘাত (Teacher Double-Booked)',
        description: `উস্তাদ **${slot.teacherName || 'নির্বাচিত শিক্ষক'}** ইতোমধ্যে ${dayName} ${periodLabel} এ জামাত **${slot.className}**${
          slot.sectionName ? ` (শাখা: ${slot.sectionName})` : ''
        }-এ বিষয় **"${slot.subjectName}"**${
          slot.roomNo ? ` (কক্ষ: ${slot.roomNo})` : ''
        } পাঠদানে নির্ধারিত আছেন। একই সময়ে অন্য জামাতে ক্লাস বরাদ্দ করা যাবে না।`,
        severity: 'ERROR',
        conflictingSlot: candidate,
        existingSlot: slot,
        dayOfWeek: slot.dayOfWeek,
        periodNumber: slot.periodNumber,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }

    // 2. Room Double-Booking Check
    if (
      candidate.roomNo &&
      candidate.roomNo.trim() !== '' &&
      slot.roomNo &&
      slot.roomNo.trim() !== '' &&
      candidate.roomNo.trim().toLowerCase() === slot.roomNo.trim().toLowerCase()
    ) {
      conflicts.push({
        id: `conflict-room-${slot.id}-${Date.now()}`,
        type: 'ROOM_DOUBLE_BOOKED',
        title: 'কক্ষ / রুম ডাবল-বুকিং সংঘাত (Room Double-Booked)',
        description: `কক্ষ নং **"${slot.roomNo}"** ইতোমধ্যে ${dayName} ${periodLabel} এ জামাত **${slot.className}** এর জন্য বরাদ্দ রয়েছে (পাঠদান করছেন: ${slot.teacherName}, বিষয়: ${slot.subjectName})।`,
        severity: 'ERROR',
        conflictingSlot: candidate,
        existingSlot: slot,
        dayOfWeek: slot.dayOfWeek,
        periodNumber: slot.periodNumber,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }

    // 3. Class & Section Double-Booking Check
    if (
      candidate.classId &&
      slot.classId &&
      candidate.classId === slot.classId
    ) {
      // If candidate has a specific section and existing has section
      const sectionClash =
        !candidate.sectionId ||
        !slot.sectionId ||
        candidate.sectionId === 'ALL' ||
        slot.sectionId === 'ALL' ||
        candidate.sectionId === slot.sectionId;

      if (sectionClash) {
        conflicts.push({
          id: `conflict-class-${slot.id}-${Date.now()}`,
          type: 'CLASS_DOUBLE_BOOKED',
          title: 'জামাত / শ্রেণির সময়সূচি সংঘাত (Class Overlap)',
          description: `জামাত **${slot.className}**${
            slot.sectionName ? ` (শাখা: ${slot.sectionName})` : ''
          }-এ ${dayName} ${periodLabel} এ ইতোমধ্যে বিষয় **"${slot.subjectName}"** (উস্তাদ: ${slot.teacherName}) নির্ধারিত আছে।`,
          severity: 'ERROR',
          conflictingSlot: candidate,
          existingSlot: slot,
          dayOfWeek: slot.dayOfWeek,
          periodNumber: slot.periodNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      }
    }
  }

  return conflicts;
};
