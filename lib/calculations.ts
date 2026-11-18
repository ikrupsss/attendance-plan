import {
  Subject,
  TimetableSlot,
  CalendarEvent,
  DayAttendanceLog,
  SubjectStats,
  OverallStats,
  AppSettings,
} from '@/types/attendance';

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD string into Date (at midnight local time)
 */
export function parseDateISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Get day of week for a given date: 1 = Mon, 2 = Tue, ..., 5 = Fri, 6 = Sat, 0 = Sun
 */
export function getDayOfWeek(dateStr: string): number {
  const date = parseDateISO(dateStr);
  return date.getDay();
}

/**
 * Get all timetable slots scheduled for a specific date considering calendar overrides/holidays
 */
export function getScheduledSlotsForDate(
  dateStr: string,
  timetable: TimetableSlot[],
  calendarEvents: CalendarEvent[]
): { slots: TimetableSlot[]; isHoliday: boolean; holidayTitle?: string; isSpecial: boolean; specialTitle?: string } {
  // Check if date is in calendar events
  const event = calendarEvents.find((e) => e.date === dateStr);

  if (event?.type === 'holiday') {
    return { slots: [], isHoliday: true, holidayTitle: event.title, isSpecial: false };
  }

  const defaultDayOfWeek = getDayOfWeek(dateStr);

  // Sunday is normally holiday unless explicitly specified
  if (defaultDayOfWeek === 0 && (!event || event.type !== 'custom_working')) {
    return { slots: [], isHoliday: true, holidayTitle: 'Sunday Holiday', isSpecial: false };
  }

  // Saturday is normally no classes unless it's a working Saturday
  if (defaultDayOfWeek === 6 && (!event || event.type !== 'working_saturday')) {
    return { slots: [], isHoliday: true, holidayTitle: 'Saturday (No Scheduled Classes)', isSpecial: false };
  }

  // Determine effective day of week (e.g. working Saturday follows Friday)
  let effectiveDayOfWeek = defaultDayOfWeek;
  let isSpecial = false;
  let specialTitle: string | undefined;

  if (event?.type === 'working_saturday') {
    effectiveDayOfWeek = event.followsDayOfWeek ?? 5; // default to Friday
    isSpecial = true;
    specialTitle = event.title || 'Working Saturday (Friday Timetable)';
  } else if (event?.type === 'custom_working' && event.followsDayOfWeek) {
    effectiveDayOfWeek = event.followsDayOfWeek;
    isSpecial = true;
    specialTitle = event.title;
  }

  // Filter timetable for this day of week
  let slots = timetable.filter((slot) => slot.dayOfWeek === effectiveDayOfWeek);

  // Exclude specifically cancelled slot IDs
  if (event?.cancelledSlotIds && event.cancelledSlotIds.length > 0) {
    const cancelled = new Set(event.cancelledSlotIds);
    slots = slots.filter((slot) => !cancelled.has(slot.id));
  }

  // Sort by period number
  slots.sort((a, b) => a.periodNumber - b.periodNumber);

  return { slots, isHoliday: false, isSpecial, specialTitle };
}

/**
 * Count scheduled future classes for a subject between startDate and endDate
 */
export function countRemainingScheduledClasses(
  subjectId: string,
  fromInclusiveDateStr: string,
  endDateStr: string,
  timetable: TimetableSlot[],
  calendarEvents: CalendarEvent[],
  attendanceLogs: Record<string, DayAttendanceLog>
): number {
  const fromDate = parseDateISO(fromInclusiveDateStr);
  const toDate = parseDateISO(endDateStr);

  if (fromDate > toDate) return 0;

  let count = 0;
  const curr = new Date(fromDate);

  while (curr <= toDate) {
    const dateStr = formatDateISO(curr);
    const dayLog = attendanceLogs[dateStr];

    if (dayLog && dayLog.records && dayLog.records.length > 0) {
      // If this date already has attendance logged, check if there are any unlogged periods for this subject
      // In practice, if a date has already been updated, we consider those periods already accounted for in present/absent/cancelled.
      // So remaining does not double-count logged days.
    } else {
      // Date has not been logged yet; check scheduled timetable
      const { slots, isHoliday } = getScheduledSlotsForDate(dateStr, timetable, calendarEvents);
      if (!isHoliday) {
        const subjectSlots = slots.filter((s) => s.subjectId === subjectId);
        count += subjectSlots.length;
      }
    }

    curr.setDate(curr.getDate() + 1);
  }

  return count;
}

/**
 * Calculate the maximum classes that can be missed out of remaining classes
 * to maintain at least target percentage T (e.g. 75% -> 0.75).
 * 
 * Target formula:
 * (Present + Remaining - Missed) / (Conducted + Remaining) >= T
 * Missed <= Present + Remaining - ceil(T * (Conducted + Remaining))
 */
export function calculateMaxMissable(
  present: number,
  conducted: number,
  remaining: number,
  targetPercentage: number
): number {
  const totalFinalClasses = conducted + remaining;
  if (totalFinalClasses === 0) return 0;

  const targetRatio = targetPercentage / 100;
  // Minimum required present classes to hit or exceed target
  const requiredFinalPresent = Math.ceil(targetRatio * totalFinalClasses);
  const maxPossiblePresent = present + remaining;

  if (maxPossiblePresent < requiredFinalPresent) {
    // Cannot reach target even with 100% attendance in remaining classes
    return 0;
  }

  const maxMissable = maxPossiblePresent - requiredFinalPresent;
  // Cannot miss more than the total remaining classes
  return Math.max(0, Math.min(remaining, maxMissable));
}

/**
 * Calculate how many consecutive future classes a student must attend
 * to bring their attendance up to the target percentage, assuming no fixed cap.
 */
export function calculateClassesNeeded(
  present: number,
  conducted: number,
  targetPercentage: number
): number {
  if (conducted === 0) return 0;
  const currentRatio = present / conducted;
  const targetRatio = targetPercentage / 100;

  if (currentRatio >= targetRatio) return 0;
  if (targetRatio >= 1) return 999; // impossible if already missed one

  // (present + x) / (conducted + x) >= targetRatio
  // present + x >= targetRatio * conducted + targetRatio * x
  // x * (1 - targetRatio) >= targetRatio * conducted - present
  // x >= (targetRatio * conducted - present) / (1 - targetRatio)
  const x = Math.ceil((targetRatio * conducted - present) / (1 - targetRatio));
  return Math.max(0, x);
}

/**
 * Calculate complete statistics for a single subject
 */
export function calculateSubjectStats(
  subject: Subject,
  attendanceLogs: Record<string, DayAttendanceLog>,
  timetable: TimetableSlot[],
  calendarEvents: CalendarEvent[],
  settings: AppSettings,
  currentDateStr: string = formatDateISO(new Date())
): SubjectStats {
  // 1. Start with initial counts
  let loggedPresent = 0;
  let loggedAbsent = 0;

  // 2. Aggregate logged attendance from attendance logs
  Object.values(attendanceLogs).forEach((log) => {
    if (log && log.records) {
      log.records.forEach((rec) => {
        if (rec.subjectId === subject.id) {
          if (rec.status === 'attended') {
            loggedPresent += 1;
          } else if (rec.status === 'missed') {
            loggedAbsent += 1;
          }
          // 'cancelled' does not add to present or absent
        }
      });
    }
  });

  const present = subject.initialPresent + loggedPresent;
  const absent = subject.initialAbsent + loggedAbsent;
  const conducted = present + absent;

  const currentPercentage = conducted > 0 ? (present / conducted) * 100 : 100.0;

  // 3. Calculate remaining scheduled classes from currentDateStr to settings.endDate
  // If currentDateStr < settings.startDate, start counting from settings.startDate
  const countFromDate = currentDateStr < settings.startDate ? settings.startDate : currentDateStr;
  const remainingScheduled = countRemainingScheduledClasses(
    subject.id,
    countFromDate,
    settings.endDate,
    timetable,
    calendarEvents,
    attendanceLogs
  );

  // 4. Projected percentage if attending ALL remaining scheduled classes
  const totalFinalClasses = conducted + remainingScheduled;
  const projectedPercentage =
    totalFinalClasses > 0 ? ((present + remainingScheduled) / totalFinalClasses) * 100 : 100.0;

  // 5. Calculate absence allowances
  const maxMissableAt75 = calculateMaxMissable(present, conducted, remainingScheduled, settings.target75);
  const maxMissableAt70 = calculateMaxMissable(present, conducted, remainingScheduled, settings.target70);

  // 6. Calculate classes needed if below targets
  const classesNeededFor75 = calculateClassesNeeded(present, conducted, settings.target75);
  const classesNeededFor70 = calculateClassesNeeded(present, conducted, settings.target70);

  // 7. Health status badge
  let health: 'safe' | 'warning' | 'danger' | 'exempt' = 'safe';
  if (subject.exemptStrictWarning) {
    health = 'exempt';
  } else if (currentPercentage >= settings.target75) {
    health = 'safe';
  } else if (currentPercentage >= settings.target70) {
    health = 'warning';
  } else {
    health = 'danger';
  }

  return {
    subject,
    present,
    absent,
    conducted,
    currentPercentage,
    remainingScheduled,
    projectedPercentage,
    maxMissableAt75,
    maxMissableAt70,
    classesNeededFor75,
    classesNeededFor70,
    health,
  };
}

/**
 * Calculate overall stats across all subjects
 */
export function calculateOverallStats(subjectStatsList: SubjectStats[]): OverallStats {
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalRemaining = 0;

  subjectStatsList.forEach((stat) => {
    totalPresent += stat.present;
    totalAbsent += stat.absent;
    totalRemaining += stat.remainingScheduled;
  });

  const totalConducted = totalPresent + totalAbsent;
  const overallPercentage = totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 100.0;

  const totalFinal = totalConducted + totalRemaining;
  const projectedPercentage =
    totalFinal > 0 ? ((totalPresent + totalRemaining) / totalFinal) * 100 : 100.0;

  return {
    totalPresent,
    totalAbsent,
    totalConducted,
    overallPercentage,
    totalRemaining,
    projectedPercentage,
  };
}

/**
 * Simulate what-if attendance for a subject
 */
export function simulateSubjectAttendance(
  stat: SubjectStats,
  additionalMissed: number,
  additionalAttended: number = 0,
  target75: number = 75,
  target70: number = 70
) {
  // Projected present and conducted
  const simPresent = stat.present + additionalAttended;
  const simAbsent = stat.absent + additionalMissed;
  const simConducted = simPresent + simAbsent;

  const newPercentage = simConducted > 0 ? (simPresent / simConducted) * 100 : 100.0;

  // Remaining classes adjusted for simulation
  const remainingAfterSim = Math.max(0, stat.remainingScheduled - additionalMissed - additionalAttended);
  const totalFinalSim = simConducted + remainingAfterSim;

  // Max missable in the remaining balance after this simulation
  const maxMissable75 = calculateMaxMissable(simPresent, simConducted, remainingAfterSim, target75);
  const maxMissable70 = calculateMaxMissable(simPresent, simConducted, remainingAfterSim, target70);

  // Projected final percentage if attending all remaining after simulation
  const finalProjectedPercentage =
    totalFinalSim > 0 ? ((simPresent + remainingAfterSim) / totalFinalSim) * 100 : 100.0;

  const maintains75 = finalProjectedPercentage >= target75;
  const maintains70 = finalProjectedPercentage >= target70;

  return {
    simPresent,
    simAbsent,
    simConducted,
    newPercentage,
    remainingAfterSim,
    finalProjectedPercentage,
    maxMissable75,
    maxMissable70,
    maintains75,
    maintains70,
  };
}
