import {
  Subject,
  TimetableSlot,
  CalendarEvent,
  DayAttendanceLog,
  AppSettings,
  AppDataBackup,
} from '@/types/attendance';
import {
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_CALENDAR_EVENTS,
  DEFAULT_SETTINGS,
} from '@/data/initialData';

export const STORAGE_KEY = 'attendance_plan_v1_store';

export interface AppStoreState {
  subjects: Subject[];
  timetable: TimetableSlot[];
  calendarEvents: CalendarEvent[];
  attendanceLogs: Record<string, DayAttendanceLog>;
  settings: AppSettings;
}

export const INITIAL_APP_STATE: AppStoreState = {
  subjects: INITIAL_SUBJECTS,
  timetable: INITIAL_TIMETABLE,
  calendarEvents: INITIAL_CALENDAR_EVENTS,
  attendanceLogs: {},
  settings: DEFAULT_SETTINGS,
};

/**
 * Safely load state from localStorage with fallback to default state
 */
export function loadStateFromStorage(): AppStoreState {
  if (typeof window === 'undefined') {
    return INITIAL_APP_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_APP_STATE;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return INITIAL_APP_STATE;
    }

    return {
      subjects: Array.isArray(parsed.subjects) ? parsed.subjects : INITIAL_APP_STATE.subjects,
      timetable: Array.isArray(parsed.timetable) ? parsed.timetable : INITIAL_APP_STATE.timetable,
      calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : INITIAL_APP_STATE.calendarEvents,
      attendanceLogs: parsed.attendanceLogs && typeof parsed.attendanceLogs === 'object' ? parsed.attendanceLogs : {},
      settings: parsed.settings && typeof parsed.settings === 'object' ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
    };
  } catch (err) {
    console.error('Failed to load attendance state from localStorage:', err);
    return INITIAL_APP_STATE;
  }
}

/**
 * Save state to localStorage
 */
export function saveStateToStorage(state: AppStoreState): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to save attendance state to localStorage:', err);
    return false;
  }
}

/**
 * Generate a JSON backup file for download
 */
export function exportBackup(state: AppStoreState): void {
  const backup: AppDataBackup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    subjects: state.subjects,
    timetable: state.timetable,
    calendarEvents: state.calendarEvents,
    attendanceLogs: state.attendanceLogs,
    settings: state.settings,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `attendance-plan-backup-${new Date().toISOString().split('T')[0]}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Validate imported backup object
 */
export function validateImportedData(data: unknown): data is AppDataBackup {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.subjects) || d.subjects.length === 0) return false;
  if (!Array.isArray(d.timetable)) return false;
  if (!d.attendanceLogs || typeof d.attendanceLogs !== 'object') return false;

  const sampleSubject = d.subjects[0];
  if (!sampleSubject || typeof sampleSubject !== 'object' || !('id' in sampleSubject) || !('code' in sampleSubject)) {
    return false;
  }

  return true;
}
