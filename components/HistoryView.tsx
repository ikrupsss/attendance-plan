'use client';

import React, { useState, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { parseDateISO, formatDateISO } from '@/lib/calculations';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Slash,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HistoryViewProps {
  onEditDate: (dateStr: string) => void;
}

export default function HistoryView({ onEditDate }: HistoryViewProps) {
  const { state, deleteDayAttendance } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'perfect' | 'missed' | 'cancelled'>('all');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date(2026, 10, 1)); // November 2026

  // Subject dictionary
  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof state.subjects[0]>();
    state.subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [state.subjects]);

  // All logged days sorted in descending order (newest first)
  const loggedDays = useMemo(() => {
    return Object.values(state.attendanceLogs)
      .filter((log) => log.records && log.records.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.attendanceLogs]);

  // Compute status for any date: 'green' (fully attended), 'yellow' (partial), 'red' (any missed), 'grey' (holiday/none)
  const getDateStatus = (dateStr: string) => {
    const log = state.attendanceLogs[dateStr];
    const holidayEvent = state.calendarEvents.find((e) => e.date === dateStr && e.type === 'holiday');

    if (holidayEvent) return 'holiday';

    if (!log || !log.records || log.records.length === 0) {
      return 'unrecorded';
    }

    const attended = log.records.filter((r) => r.status === 'attended').length;
    const missed = log.records.filter((r) => r.status === 'missed').length;

    if (missed > 0 && attended === 0) return 'red';
    if (missed > 0 && attended > 0) return 'yellow';
    if (attended > 0 && missed === 0) return 'green';
    return 'grey';
  };

  // Filtered log list
  const filteredLogs = useMemo(() => {
    return loggedDays.filter((log) => {
      const attended = log.records.filter((r) => r.status === 'attended').length;
      const missed = log.records.filter((r) => r.status === 'missed').length;

      // Status filter
      if (statusFilter === 'perfect' && (missed > 0 || attended === 0)) return false;
      if (statusFilter === 'missed' && missed === 0) return false;
      if (statusFilter === 'cancelled' && !log.records.some((r) => r.status === 'cancelled')) return false;

      // Search query (matches date or subject name/code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = log.date.includes(q);
        const matchesSubject = log.records.some((rec) => {
          const sub = subjectMap.get(rec.subjectId);
          return (
            sub?.name.toLowerCase().includes(q) ||
            sub?.code.toLowerCase().includes(q) ||
            sub?.shortName.toLowerCase().includes(q)
          );
        });
        return matchesDate || matchesSubject;
      }

      return true;
    });
  }, [loggedDays, statusFilter, searchQuery, subjectMap]);

  // Calendar matrix generator for the month
  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday start: Mon = 0, Sun = 6
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysArray: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Empty lead slots
    for (let i = 0; i < adjustedFirstDay; i++) {
      daysArray.push({ dateStr: '', dayNumber: 0, isCurrentMonth: false });
    }

    // Days in this month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysArray.push({ dateStr, dayNumber: d, isCurrentMonth: true });
    }

    return daysArray;
  }, [currentCalendarMonth]);

  const monthLabel = currentCalendarMonth.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-4">
      {/* Visual Calendar View Card */}
      <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-4 border border-purple-100/80 dark:border-purple-900/30 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#7F4EB9]" />
            <h3 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
              {monthLabel}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setCurrentCalendarMonth(
                  new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1)
                )
              }
              className="p-1 px-2 text-xs font-bold rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
            >
              ‹
            </button>
            <button
              onClick={() =>
                setCurrentCalendarMonth(
                  new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1)
                )
              }
              className="p-1 px-2 text-xs font-bold rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
            >
              ›
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-600 dark:text-stone-400 mb-1">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const status = getDateStatus(cell.dateStr);

            let dotColor = 'bg-transparent text-stone-700 dark:text-stone-300';
            if (status === 'green') {
              dotColor = 'bg-mint-100 dark:bg-mint-950/80 text-mint-800 dark:text-mint-300 border border-mint-400 font-bold';
            } else if (status === 'yellow') {
              dotColor = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-400 font-bold';
            } else if (status === 'red') {
              dotColor = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-400 font-bold';
            } else if (status === 'holiday') {
              dotColor = 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 line-through';
            }

            return (
              <button
                key={cell.dateStr}
                onClick={() => onEditDate(cell.dateStr)}
                className={`h-8 rounded-xl text-xs flex flex-col items-center justify-center transition-all active:scale-95 hover:border-purple-300 ${dotColor}`}
              >
                <span>{cell.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 pt-3 mt-3 border-t border-purple-50 dark:border-purple-950">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-mint-500 inline-block" /> Full
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Partial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Missed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 inline-block" /> Holiday
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search date or subject (e.g. Maths, Chem)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#1A1622] border border-purple-100 dark:border-purple-900/40 text-xs text-[#2D253A] dark:text-[#F3EEF9] placeholder:text-stone-400 outline-none focus:border-purple-300 shadow-soft"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'perfect', label: '100% Attended' },
            { id: 'missed', label: 'Had Absences' },
            { id: 'cancelled', label: 'Had Cancellations' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id as typeof statusFilter)}
              className={`py-1 px-3 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-[#7F4EB9] text-white shadow-soft'
                  : 'bg-white dark:bg-[#1A1622] text-stone-600 dark:text-stone-400 border border-purple-100 dark:border-purple-900/30'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Log Feed */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-8 text-center border border-purple-100/70 dark:border-purple-900/30 shadow-card">
            <Clock className="w-8 h-8 text-purple-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
              No Attendance Logs Found
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Tap &quot;UPDATE TODAY&apos;S ATTENDANCE&quot; to log your daily attendance.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const formattedDate = parseDateISO(log.date).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const attendedCount = log.records.filter((r) => r.status === 'attended').length;
            const missedCount = log.records.filter((r) => r.status === 'missed').length;
            const cancelledCount = log.records.filter((r) => r.status === 'cancelled').length;

            return (
              <div
                key={log.date}
                className="bg-white dark:bg-[#1A1622] rounded-3xl p-4 border border-purple-100/80 dark:border-purple-900/30 shadow-card"
              >
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-purple-50 dark:border-purple-950">
                  <div>
                    <h4 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                      {formattedDate}
                    </h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      Logged {new Date(log.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditDate(log.date)}
                      className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7F4EB9] dark:text-[#B290DC] text-xs font-semibold flex items-center gap-1 hover:bg-purple-100"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete attendance record for ${log.date}?`)) {
                          deleteDayAttendance(log.date);
                        }
                      }}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day Summary Pills */}
                <div className="flex items-center gap-2 mb-3 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-mint-50 dark:bg-mint-950/50 text-mint-700 dark:text-mint-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {attendedCount} Attended
                  </span>
                  {missedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {missedCount} Missed
                    </span>
                  )}
                  {cancelledCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium flex items-center gap-1">
                      <Slash className="w-3 h-3" /> {cancelledCount} Cancelled
                    </span>
                  )}
                </div>

                {/* Individual Period Breakdown */}
                <div className="space-y-1.5">
                  {log.records.map((rec, i) => {
                    const sub = subjectMap.get(rec.subjectId);

                    return (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-[#FAF7EE] dark:bg-[#201B2A] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-stone-500">
                            P{rec.periodNumber}
                          </span>
                          <span className="font-semibold text-[#2D253A] dark:text-[#F3EEF9]">
                            {sub ? sub.name : rec.subjectId}
                          </span>
                          {rec.type === 'lab' && (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1 rounded">
                              Lab
                            </span>
                          )}
                        </div>

                        <div>
                          {rec.status === 'attended' && (
                            <span className="text-[11px] font-bold text-mint-600 dark:text-mint-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Attended
                            </span>
                          )}
                          {rec.status === 'missed' && (
                            <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Missed
                            </span>
                          )}
                          {rec.status === 'cancelled' && (
                            <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                              <Slash className="w-3 h-3" /> Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
