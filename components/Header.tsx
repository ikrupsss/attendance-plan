'use client';

import React, { useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { CheckCircle2, Clock, CalendarDays, Moon, Sun, Sparkles } from 'lucide-react';
import { parseDateISO } from '@/lib/calculations';

interface HeaderProps {
  onOpenUpdateModal: () => void;
}

export default function Header({ onOpenUpdateModal }: HeaderProps) {
  const { state, updateSettings, todayDateStr, hasUpdatedToday } = useAttendance();

  // Calculate days remaining until end date (7 December 2026)
  const countdownDays = useMemo(() => {
    try {
      const today = parseDateISO(todayDateStr);
      const end = parseDateISO(state.settings.endDate);
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  }, [todayDateStr, state.settings.endDate]);

  // Formatted display date (e.g. Wednesday, 18 Nov 2026)
  const formattedToday = useMemo(() => {
    try {
      const date = parseDateISO(todayDateStr);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return todayDateStr;
    }
  }, [todayDateStr]);

  const toggleDarkMode = () => {
    updateSettings({ darkMode: !state.settings.darkMode });
  };

  return (
    <header className="pt-5 pb-3 px-4 max-w-lg mx-auto w-full">
      {/* Top row: Brand & Quick actions */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7F4EB9] to-[#A855F7] flex items-center justify-center text-white shadow-soft">
            <Sparkles className="w-5 h-5 text-mint-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#2D253A] dark:text-[#F3EEF9] leading-tight">
              ATTENDANCE PLAN
            </h1>
            <p className="text-xs font-medium text-purple-700/70 dark:text-purple-300/70 tracking-wide">
              Stay ahead of every class.
            </p>
          </div>
        </div>

        {/* Dark mode & info buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1926] border border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-soft hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
          >
            {state.settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Date & Countdown Pill Bar */}
      <div className="flex items-center justify-between bg-white/80 dark:bg-[#1B1723]/80 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-purple-100/70 dark:border-purple-900/30 shadow-soft text-xs mb-3.5">
        <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200 font-medium">
          <CalendarDays className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>{formattedToday}</span>
        </div>

        <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-[#7F4EB9] dark:text-[#B290DC]" />
          <span>
            {countdownDays > 0
              ? `${countdownDays} days left to 7 Dec`
              : countdownDays === 0
              ? 'Last day of term!'
              : 'Term completed'}
          </span>
        </div>
      </div>

      {/* Daily Update Prompt Reminder Banner */}
      <div
        onClick={onOpenUpdateModal}
        className={`cursor-pointer rounded-2xl p-3 px-3.5 border transition-all duration-200 active-press shadow-soft flex items-center justify-between gap-3 ${
          hasUpdatedToday
            ? 'bg-mint-50/70 dark:bg-mint-950/20 border-mint-200 dark:border-mint-800/40 text-mint-900 dark:text-mint-200'
            : 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50 text-purple-950 dark:text-purple-100 hover:border-purple-300'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              hasUpdatedToday
                ? 'bg-mint-500 text-white'
                : 'bg-[#7F4EB9] text-white animate-pulse'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">
              {hasUpdatedToday
                ? "Today's attendance recorded"
                : "Have you updated today's attendance?"}
            </p>
            <p className="text-[11px] text-purple-600/80 dark:text-purple-300/80 truncate">
              {hasUpdatedToday
                ? 'Tap here to review or edit your marks'
                : '7:30 PM reminder: Tap to mark today’s periods'}
            </p>
          </div>
        </div>

        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl shrink-0 ${
            hasUpdatedToday
              ? 'bg-mint-200/80 dark:bg-mint-900/60 text-mint-800 dark:text-mint-200'
              : 'bg-[#7F4EB9] text-white shadow-sm'
          }`}
        >
          {hasUpdatedToday ? 'Review' : 'Update'}
        </span>
      </div>
    </header>
  );
}
