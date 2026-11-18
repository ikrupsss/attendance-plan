import { Subject, TimetableSlot, CalendarEvent, AppSettings } from '@/types/attendance';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'maths',
    code: '25EMAB101',
    name: 'Mathematics',
    shortName: 'Maths',
    initialPresent: 28,
    initialAbsent: 12,
    exemptStrictWarning: false,
    color: '#8B5CF6', // Purple/Lavender
    bgLight: 'bg-purple-50 dark:bg-purple-950/30',
    textLight: 'text-purple-700 dark:text-purple-300',
  },
  {
    id: 'chem',
    code: '25ECHB102',
    name: 'Chemistry',
    shortName: 'Chemistry',
    initialPresent: 22,
    initialAbsent: 3,
    exemptStrictWarning: false,
    color: '#06B6D4', // Cyan/Mint accent
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/30',
    textLight: 'text-cyan-700 dark:text-cyan-300',
  },
  {
    id: 'pc',
    code: '25EHSH101',
    name: 'Professional Communication',
    shortName: 'PC',
    initialPresent: 8,
    initialAbsent: 2,
    exemptStrictWarning: true, // Displayed, but exempt from strict 75% enforcement warning
    color: '#A855F7', // Soft Violet
    bgLight: 'bg-violet-50 dark:bg-violet-950/30',
    textLight: 'text-violet-700 dark:text-violet-300',
  },
  {
    id: 'cprog',
    code: '25ECSF107',
    name: 'C Programming',
    shortName: 'C Prog',
    initialPresent: 17,
    initialAbsent: 1,
    exemptStrictWarning: false, // Already includes club attendance
    color: '#10B981', // Emerald / Mint
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    textLight: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'ded',
    code: '26ECSF101',
    name: 'Digital Electronics Design',
    shortName: 'DED',
    initialPresent: 17,
    initialAbsent: 2,
    exemptStrictWarning: false,
    color: '#EC4899', // Soft Rose / Magenta
    bgLight: 'bg-pink-50 dark:bg-pink-950/30',
    textLight: 'text-pink-700 dark:text-pink-300',
  },
  {
    id: 'bee',
    code: '26EEEF102',
    name: 'Basic Electrical Engineering',
    shortName: 'BEE',
    initialPresent: 15,
    initialAbsent: 5,
    exemptStrictWarning: false,
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    textLight: 'text-amber-700 dark:text-amber-300',
  },
  {
    id: 'si',
    code: '26ECRH101',
    name: 'Social Innovation',
    shortName: 'SI',
    initialPresent: 13,
    initialAbsent: 3,
    exemptStrictWarning: false,
    color: '#14B8A6', // Teal / Pastel Mint
    bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    textLight: 'text-teal-700 dark:text-teal-300',
  },
];

// Division C1 Timetable (Monday through Friday standard schedule)
// Period 1: 09:00 - 10:00
// Period 2: 10:00 - 11:00
// Break: 11:00 - 11:15
// Period 3: 11:15 - 12:15
// Period 4: 12:15 - 13:15
// Lunch: 13:15 - 14:00
// Period 5: 14:00 - 15:00
// Period 6: 15:00 - 16:00
export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // MONDAY (Day 1)
  { id: 'mon-p1', dayOfWeek: 1, periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectId: 'maths', type: 'lecture' },
  { id: 'mon-p2', dayOfWeek: 1, periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectId: 'chem', type: 'lecture' },
  { id: 'mon-p3', dayOfWeek: 1, periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectId: 'bee', type: 'lecture' },
  { id: 'mon-p4', dayOfWeek: 1, periodNumber: 4, startTime: '12:15', endTime: '13:15', subjectId: 'ded', type: 'lecture' },
  { id: 'mon-p5', dayOfWeek: 1, periodNumber: 5, startTime: '14:00', endTime: '15:00', subjectId: 'cprog', type: 'lecture' },
  { id: 'mon-p6', dayOfWeek: 1, periodNumber: 6, startTime: '15:00', endTime: '16:00', subjectId: 'si', type: 'lecture' },

  // TUESDAY (Day 2)
  { id: 'tue-p1', dayOfWeek: 2, periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectId: 'bee', type: 'lecture' },
  { id: 'tue-p2', dayOfWeek: 2, periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectId: 'maths', type: 'lecture' },
  { id: 'tue-p3', dayOfWeek: 2, periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectId: 'chem', type: 'lecture' },
  { id: 'tue-p4', dayOfWeek: 2, periodNumber: 4, startTime: '12:15', endTime: '13:15', subjectId: 'pc', type: 'lecture' },
  { id: 'tue-p5', dayOfWeek: 2, periodNumber: 5, startTime: '14:00', endTime: '15:00', subjectId: 'cprog', type: 'lab' },
  { id: 'tue-p6', dayOfWeek: 2, periodNumber: 6, startTime: '15:00', endTime: '16:00', subjectId: 'cprog', type: 'lab' },

  // WEDNESDAY (Day 3)
  { id: 'wed-p1', dayOfWeek: 3, periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectId: 'ded', type: 'lecture' },
  { id: 'wed-p2', dayOfWeek: 3, periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectId: 'maths', type: 'lecture' },
  { id: 'wed-p3', dayOfWeek: 3, periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectId: 'chem', type: 'lecture' },
  { id: 'wed-p4', dayOfWeek: 3, periodNumber: 4, startTime: '12:15', endTime: '13:15', subjectId: 'si', type: 'lecture' },
  { id: 'wed-p5', dayOfWeek: 3, periodNumber: 5, startTime: '14:00', endTime: '15:00', subjectId: 'ded', type: 'lab' },
  { id: 'wed-p6', dayOfWeek: 3, periodNumber: 6, startTime: '15:00', endTime: '16:00', subjectId: 'ded', type: 'lab' },

  // THURSDAY (Day 4)
  { id: 'thu-p1', dayOfWeek: 4, periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectId: 'cprog', type: 'lecture' },
  { id: 'thu-p2', dayOfWeek: 4, periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectId: 'bee', type: 'lecture' },
  { id: 'thu-p3', dayOfWeek: 4, periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectId: 'maths', type: 'lecture' },
  { id: 'thu-p4', dayOfWeek: 4, periodNumber: 4, startTime: '12:15', endTime: '13:15', subjectId: 'pc', type: 'lecture' },
  { id: 'thu-p5', dayOfWeek: 4, periodNumber: 5, startTime: '14:00', endTime: '15:00', subjectId: 'chem', type: 'lab' },
  { id: 'thu-p6', dayOfWeek: 4, periodNumber: 6, startTime: '15:00', endTime: '16:00', subjectId: 'chem', type: 'lab' },

  // FRIDAY (Day 5)
  { id: 'fri-p1', dayOfWeek: 5, periodNumber: 1, startTime: '09:00', endTime: '10:00', subjectId: 'maths', type: 'lecture' },
  { id: 'fri-p2', dayOfWeek: 5, periodNumber: 2, startTime: '10:00', endTime: '11:00', subjectId: 'ded', type: 'lecture' },
  { id: 'fri-p3', dayOfWeek: 5, periodNumber: 3, startTime: '11:15', endTime: '12:15', subjectId: 'bee', type: 'lecture' },
  { id: 'fri-p4', dayOfWeek: 5, periodNumber: 4, startTime: '12:15', endTime: '13:15', subjectId: 'cprog', type: 'lecture' },
  { id: 'fri-p5', dayOfWeek: 5, periodNumber: 5, startTime: '14:00', endTime: '15:00', subjectId: 'chem', type: 'lecture' },
  { id: 'fri-p6', dayOfWeek: 5, periodNumber: 6, startTime: '15:00', endTime: '16:00', subjectId: 'bee', type: 'lab' },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    date: '2026-11-27',
    type: 'holiday',
    title: 'Kannada Rajyotsava Holiday',
    description: 'State holiday — University closed, no classes scheduled.',
  },
  {
    date: '2026-11-28',
    type: 'working_saturday',
    title: 'Working Saturday (Friday Timetable)',
    description: 'Compensatory working day following Friday schedule.',
    followsDayOfWeek: 5, // Follows Friday
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  startDate: '2026-11-17',
  endDate: '2026-12-07',
  target75: 75,
  target70: 70,
  division: 'C1',
  darkMode: false,
  alarmReminderTime: '19:30',
};
