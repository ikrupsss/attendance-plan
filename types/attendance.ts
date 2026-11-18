export type AttendanceStatus = 'attended' | 'missed' | 'cancelled';

export interface Subject {
  id: string;
  code: string;
  name: string;
  shortName: string;
  initialPresent: number;
  initialAbsent: number;
  exemptStrictWarning?: boolean; // For PC: displayed without strict 75% enforcement warning
  color: string;
  bgLight: string;
  textLight: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 0 = Sun
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  type: 'lecture' | 'lab';
  batch?: string; // e.g., 'All', 'C1', 'Lab Batch'
  room?: string;
}

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  type: 'holiday' | 'working_saturday' | 'custom_working' | 'event';
  title: string;
  description?: string;
  followsDayOfWeek?: number; // e.g. 5 for Friday timetable on working Saturday
  cancelledSlotIds?: string[]; // IDs of slots cancelled on this day
}

export interface PeriodAttendanceRecord {
  periodSlotId: string;
  periodNumber: number;
  subjectId: string;
  status: AttendanceStatus;
  startTime?: string;
  endTime?: string;
  type?: 'lecture' | 'lab';
}

export interface DayAttendanceLog {
  date: string; // YYYY-MM-DD
  updatedAt: string;
  records: PeriodAttendanceRecord[];
  isLocked?: boolean;
}

export interface SubjectStats {
  subject: Subject;
  present: number;
  absent: number;
  conducted: number;
  currentPercentage: number;
  remainingScheduled: number;
  projectedPercentage: number;
  maxMissableAt75: number;
  maxMissableAt70: number;
  classesNeededFor75: number;
  classesNeededFor70: number;
  health: 'safe' | 'warning' | 'danger' | 'exempt';
}

export interface OverallStats {
  totalPresent: number;
  totalAbsent: number;
  totalConducted: number;
  overallPercentage: number;
  totalRemaining: number;
  projectedPercentage: number;
}

export interface AppSettings {
  startDate: string; // "2026-11-17"
  endDate: string; // "2026-12-07"
  target75: number; // 75
  target70: number; // 70
  division: string; // "C1"
  darkMode: boolean;
  alarmReminderTime: string; // "19:30"
}

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  subjects: Subject[];
  timetable: TimetableSlot[];
  calendarEvents: CalendarEvent[];
  attendanceLogs: Record<string, DayAttendanceLog>;
  settings: AppSettings;
}
