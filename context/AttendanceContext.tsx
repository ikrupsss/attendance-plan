'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Subject,
  TimetableSlot,
  CalendarEvent,
  DayAttendanceLog,
  PeriodAttendanceRecord,
  AppSettings,
  SubjectStats,
  OverallStats,
  AppDataBackup,
} from '@/types/attendance';
import {
  loadStateFromStorage,
  saveStateToStorage,
  exportBackup,
  validateImportedData,
  INITIAL_APP_STATE,
  AppStoreState,
} from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/data/initialData';
import {
  calculateSubjectStats,
  calculateOverallStats,
  formatDateISO,
} from '@/lib/calculations';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AttendanceContextType {
  state: AppStoreState;
  isLoaded: boolean;
  subjectStats: SubjectStats[];
  overallStats: OverallStats;
  todayDateStr: string;
  hasUpdatedToday: boolean;
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // Actions
  updateDayAttendance: (date: string, records: PeriodAttendanceRecord[]) => void;
  deleteDayAttendance: (date: string) => void;
  updateSubject: (subjectId: string, updates: Partial<Subject>) => void;
  addTimetableSlot: (slot: TimetableSlot) => void;
  updateTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (slotId: string) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (date: string) => void;
  updateSettings: (settingsUpdates: Partial<AppSettings>) => void;
  exportData: () => void;
  importData: (jsonObj: unknown) => boolean;
  resetData: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppStoreState>(INITIAL_APP_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Today's date string (defaulting to current machine date)
  const [todayDateStr, setTodayDateStr] = useState<string>('2026-11-18');

  useEffect(() => {
    // Determine today in local time
    const today = formatDateISO(new Date());
    setTodayDateStr(today);

    // Load from localStorage
    const saved = loadStateFromStorage();
    setState(saved);
    setIsLoaded(true);

    // Apply dark mode class to document
    if (saved.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      saveStateToStorage(state);
      if (state.settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [state, isLoaded]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Check if today has attendance records logged
  const hasUpdatedToday = useMemo(() => {
    const todayLog = state.attendanceLogs[todayDateStr];
    return !!(todayLog && todayLog.records && todayLog.records.length > 0);
  }, [state.attendanceLogs, todayDateStr]);

  // Derived subject statistics
  const subjectStats = useMemo(() => {
    return state.subjects.map((sub) =>
      calculateSubjectStats(
        sub,
        state.attendanceLogs,
        state.timetable,
        state.calendarEvents,
        state.settings,
        todayDateStr
      )
    );
  }, [state.subjects, state.attendanceLogs, state.timetable, state.calendarEvents, state.settings, todayDateStr]);

  // Derived overall statistics
  const overallStats = useMemo(() => {
    return calculateOverallStats(subjectStats);
  }, [subjectStats]);

  // Action: Update attendance for a specific day
  const updateDayAttendance = useCallback(
    (date: string, records: PeriodAttendanceRecord[]) => {
      setState((prev) => {
        const updatedLogs = {
          ...prev.attendanceLogs,
          [date]: {
            date,
            updatedAt: new Date().toISOString(),
            records,
          },
        };
        return {
          ...prev,
          attendanceLogs: updatedLogs,
        };
      });

      const attendedCount = records.filter((r) => r.status === 'attended').length;
      const missedCount = records.filter((r) => r.status === 'missed').length;
      showToast(
        `Attendance updated successfully! You attended ${attendedCount} period${attendedCount === 1 ? '' : 's'} and missed ${missedCount}.`,
        'success'
      );
    },
    [showToast]
  );

  // Action: Delete attendance log for a day
  const deleteDayAttendance = useCallback(
    (date: string) => {
      setState((prev) => {
        const nextLogs = { ...prev.attendanceLogs };
        delete nextLogs[date];
        return {
          ...prev,
          attendanceLogs: nextLogs,
        };
      });
      showToast(`Removed attendance record for ${date}.`, 'info');
    },
    [showToast]
  );

  // Action: Update subject initial attendance or details
  const updateSubject = useCallback(
    (subjectId: string, updates: Partial<Subject>) => {
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) => (s.id === subjectId ? { ...s, ...updates } : s)),
      }));
      showToast('Subject details updated.', 'success');
    },
    [showToast]
  );

  // Action: Timetable slot management
  const addTimetableSlot = useCallback(
    (slot: TimetableSlot) => {
      setState((prev) => ({
        ...prev,
        timetable: [...prev.timetable, slot],
      }));
      showToast('Period added to timetable.', 'success');
    },
    [showToast]
  );

  const updateTimetableSlot = useCallback(
    (updated: TimetableSlot) => {
      setState((prev) => ({
        ...prev,
        timetable: prev.timetable.map((s) => (s.id === updated.id ? updated : s)),
      }));
      showToast('Timetable period updated.', 'success');
    },
    [showToast]
  );

  const deleteTimetableSlot = useCallback(
    (slotId: string) => {
      setState((prev) => ({
        ...prev,
        timetable: prev.timetable.filter((s) => s.id !== slotId),
      }));
      showToast('Timetable period removed.', 'info');
    },
    [showToast]
  );

  // Action: Calendar events
  const addCalendarEvent = useCallback(
    (event: CalendarEvent) => {
      setState((prev) => {
        const existingFiltered = prev.calendarEvents.filter((e) => e.date !== event.date);
        return {
          ...prev,
          calendarEvents: [...existingFiltered, event],
        };
      });
      showToast(`Calendar event saved for ${event.date}.`, 'success');
    },
    [showToast]
  );

  const deleteCalendarEvent = useCallback(
    (date: string) => {
      setState((prev) => ({
        ...prev,
        calendarEvents: prev.calendarEvents.filter((e) => e.date !== date),
      }));
      showToast(`Calendar event removed for ${date}.`, 'info');
    },
    [showToast]
  );

  // Action: Settings
  const updateSettings = useCallback(
    (settingsUpdates: Partial<AppSettings>) => {
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...settingsUpdates },
      }));
      showToast('Settings saved.', 'success');
    },
    [showToast]
  );

  // Action: Backup / Restore
  const exportData = useCallback(() => {
    exportBackup(state);
    showToast('Backup JSON downloaded.', 'success');
  }, [state, showToast]);

  const importData = useCallback(
    (jsonObj: unknown): boolean => {
      if (!validateImportedData(jsonObj)) {
        showToast('Invalid backup file structure.', 'error');
        return false;
      }

      setState({
        subjects: jsonObj.subjects,
        timetable: jsonObj.timetable,
        calendarEvents: jsonObj.calendarEvents || [],
        attendanceLogs: jsonObj.attendanceLogs || {},
        settings: { ...DEFAULT_SETTINGS, ...jsonObj.settings },
      });

      showToast('Data imported and restored successfully!', 'success');
      return true;
    },
    [showToast]
  );

  const resetData = useCallback(() => {
    setState(INITIAL_APP_STATE);
    saveStateToStorage(INITIAL_APP_STATE);
    showToast('Application reset to initial semester baseline.', 'info');
  }, [showToast]);

  return (
    <AttendanceContext.Provider
      value={{
        state,
        isLoaded,
        subjectStats,
        overallStats,
        todayDateStr,
        hasUpdatedToday,
        toast,
        showToast,
        updateDayAttendance,
        deleteDayAttendance,
        updateSubject,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        addCalendarEvent,
        deleteCalendarEvent,
        updateSettings,
        exportData,
        importData,
        resetData,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
