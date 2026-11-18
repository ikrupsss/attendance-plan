'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  formatDateISO,
  parseDateISO,
  getScheduledSlotsForDate,
} from '@/lib/calculations';
import { AttendanceStatus, PeriodAttendanceRecord } from '@/types/attendance';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Slash,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  CalendarX,
  X,
} from 'lucide-react';

interface DailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export default function DailyUpdateModal({
  isOpen,
  onClose,
  initialDate,
}: DailyUpdateModalProps) {
  const {
    state,
    todayDateStr,
    updateDayAttendance,
  } = useAttendance();

  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayDateStr);
  const [periodMarks, setPeriodMarks] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selectedDate when initialDate changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate || todayDateStr);
    }
  }, [isOpen, initialDate, todayDateStr]);

  // Find subject details by id
  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof state.subjects[0]>();
    state.subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [state.subjects]);

  // Get scheduled timetable slots for selected date
  const scheduleInfo = useMemo(() => {
    return getScheduledSlotsForDate(selectedDate, state.timetable, state.calendarEvents);
  }, [selectedDate, state.timetable, state.calendarEvents]);

  // Existing log for this date (if previously submitted)
  const existingLog = state.attendanceLogs[selectedDate];

  // Initialize marks whenever selectedDate changes or scheduleInfo changes
  useEffect(() => {
    const initialMarks: Record<string, AttendanceStatus> = {};

    if (existingLog && existingLog.records && existingLog.records.length > 0) {
      // Prefill with previously submitted marks
      existingLog.records.forEach((rec) => {
        initialMarks[rec.periodSlotId] = rec.status;
      });
    }

    setPeriodMarks(initialMarks);
  }, [selectedDate, existingLog]);

  if (!isOpen) return null;

  // Change date helpers
  const handleShiftDate = (days: number) => {
    const d = parseDateISO(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(formatDateISO(d));
  };

  const handleMarkPeriod = (slotId: string, status: AttendanceStatus) => {
    setPeriodMarks((prev) => ({
      ...prev,
      [slotId]: status,
    }));
  };

  // Shortcut: "Attended everything today"
  const handleMarkAllAttended = () => {
    const allAttended: Record<string, AttendanceStatus> = {};
    scheduleInfo.slots.forEach((slot) => {
      allAttended[slot.id] = 'attended';
    });
    setPeriodMarks(allAttended);
  };

  // Shortcut: "All classes conducted were attended" or custom
  const handleClearAll = () => {
    setPeriodMarks({});
  };

  const handleSubmit = () => {
    if (scheduleInfo.isHoliday) {
      onClose();
      return;
    }

    // Check if any scheduled periods are unmarked
    const unmarkedSlots = scheduleInfo.slots.filter((slot) => !periodMarks[slot.id]);
    if (unmarkedSlots.length > 0) {
      const confirmProceed = window.confirm(
        `You have ${unmarkedSlots.length} unmarked period(s). Would you like to mark the remaining unmarked periods as 'Not Conducted'?`
      );
      if (!confirmProceed) {
        return;
      }
    }

    setIsSubmitting(true);

    const records: PeriodAttendanceRecord[] = scheduleInfo.slots.map((slot) => {
      const status = periodMarks[slot.id] || 'cancelled';
      return {
        periodSlotId: slot.id,
        periodNumber: slot.periodNumber,
        subjectId: slot.subjectId,
        status,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: slot.type,
      };
    });

    updateDayAttendance(selectedDate, records);
    setIsSubmitting(false);
    onClose();
  };

  // Formatted date string
  const formattedSelectedDate = (() => {
    try {
      const d = parseDateISO(selectedDate);
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  })();

  const isToday = selectedDate === todayDateStr;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1A1622] rounded-t-3xl sm:rounded-3xl shadow-floating border border-purple-100 dark:border-purple-900/40 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-3 border-b border-purple-100/70 dark:border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#7F4EB9] dark:text-[#B290DC] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                Update Attendance
              </h2>
              <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70">
                Division {state.settings.division} Timetable
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector Navigation */}
        <div className="px-5 py-2.5 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100/50 dark:border-purple-900/20 flex items-center justify-between">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#221D2C] border border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 active-press"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <p className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9] flex items-center justify-center gap-1.5">
              <span>{formattedSelectedDate}</span>
              {isToday && (
                <span className="text-[10px] bg-mint-100 dark:bg-mint-950/80 text-mint-700 dark:text-mint-300 px-1.5 py-0.2 rounded-md font-semibold">
                  Today
                </span>
              )}
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-[11px] text-purple-600 dark:text-purple-400 bg-transparent underline cursor-pointer outline-none"
            />
          </div>

          <button
            onClick={() => handleShiftDate(1)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#221D2C] border border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-50 active-press"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Holiday or Special Day Notice */}
          {scheduleInfo.isHoliday && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <CalendarX className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">
                  {scheduleInfo.holidayTitle || 'Holiday'}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  No classes are scheduled on this day. If you had special extra classes, you can add them in the Timetable section.
                </p>
              </div>
            </div>
          )}

          {scheduleInfo.isSpecial && (
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-200 flex items-center gap-2.5 text-xs">
              <Info className="w-4 h-4 text-[#7F4EB9] shrink-0" />
              <span>
                <strong>Special Schedule:</strong> {scheduleInfo.specialTitle}
              </span>
            </div>
          )}

          {/* Quick Shortcuts Bar (Only if there are periods) */}
          {scheduleInfo.slots.length > 0 && (
            <div className="flex items-center justify-between gap-2 pb-1">
              <button
                type="button"
                onClick={handleMarkAllAttended}
                className="flex-1 py-2 px-3 rounded-xl bg-mint-50 dark:bg-mint-950/30 border border-mint-200 dark:border-mint-800/40 text-mint-800 dark:text-mint-300 text-xs font-semibold flex items-center justify-center gap-1.5 active-press hover:bg-mint-100/70 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-mint-600 dark:text-mint-400" />
                <span>Attended everything today</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium active-press hover:bg-stone-200 dark:hover:bg-stone-700"
              >
                Reset
              </button>
            </div>
          )}

          {/* Scheduled Periods List */}
          <div className="space-y-3">
            {scheduleInfo.slots.length === 0 && !scheduleInfo.isHoliday ? (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400 text-xs">
                No classes scheduled for this day in Division {state.settings.division} timetable.
              </div>
            ) : (
              scheduleInfo.slots.map((slot) => {
                const sub = subjectMap.get(slot.subjectId);
                const mark = periodMarks[slot.id];

                return (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-2xl bg-[#FDFCF7] dark:bg-[#1F1A2A] border border-purple-100 dark:border-purple-900/30 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2 py-0.5 rounded-lg">
                            Period {slot.periodNumber}
                          </span>
                          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              slot.type === 'lab'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                            }`}
                          >
                            {slot.type === 'lab' ? 'Lab (Multi-period)' : 'Lecture'}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-[#2D253A] dark:text-[#F3EEF9] mt-1">
                          {sub ? sub.name : slot.subjectId}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {sub ? sub.code : ''}
                        </p>
                      </div>
                    </div>

                    {/* Period Attendance Radios / Toggle Buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleMarkPeriod(slot.id, 'attended')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active-press ${
                          mark === 'attended'
                            ? 'bg-mint-500 text-white shadow-soft ring-2 ring-mint-300 dark:ring-mint-700'
                            : 'bg-white dark:bg-[#251F33] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60 hover:bg-mint-50/50'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Attended</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkPeriod(slot.id, 'missed')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active-press ${
                          mark === 'missed'
                            ? 'bg-rose-500 text-white shadow-soft ring-2 ring-rose-300 dark:ring-rose-800'
                            : 'bg-white dark:bg-[#251F33] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60 hover:bg-rose-50/50'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Missed</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkPeriod(slot.id, 'cancelled')}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all active-press ${
                          mark === 'cancelled'
                            ? 'bg-stone-500 text-white shadow-soft ring-2 ring-stone-300 dark:ring-stone-600'
                            : 'bg-white dark:bg-[#251F33] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700/60 hover:bg-stone-100'
                        }`}
                      >
                        <Slash className="w-3 h-3" />
                        <span className="text-[11px]">Cancelled</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer with Submit Action */}
        <div className="p-4 px-5 border-t border-purple-100/70 dark:border-purple-900/30 bg-[#FAF7EE] dark:bg-[#17131F] flex items-center justify-between gap-3">
          <div className="text-xs text-stone-600 dark:text-stone-400">
            {scheduleInfo.slots.length > 0 && (
              <span>
                {Object.values(periodMarks).filter((m) => m === 'attended').length} attended,{' '}
                {Object.values(periodMarks).filter((m) => m === 'missed').length} missed
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting || scheduleInfo.slots.length === 0}
            onClick={handleSubmit}
            className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#7F4EB9] to-[#996DCF] text-white font-semibold text-xs shadow-floating hover:opacity-95 active-press disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
