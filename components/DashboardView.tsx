'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { SubjectStats } from '@/types/attendance';
import {
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Info,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenUpdateModal: () => void;
  onSelectSubjectForWhatIf: (subjectId: string) => void;
}

export default function DashboardView({
  onOpenUpdateModal,
  onSelectSubjectForWhatIf,
}: DashboardViewProps) {
  const { subjectStats, overallStats, state } = useAttendance();
  const [selectedSubjectModal, setSelectedSubjectModal] = useState<SubjectStats | null>(null);

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-4">
      {/* Prominent Primary Call-To-Action Button */}
      <div className="bg-gradient-to-r from-[#7F4EB9] via-[#8E65D3] to-[#A855F7] rounded-3xl p-4 text-white shadow-floating relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-6 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 bg-white/15 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              Daily Attendance Action
            </span>
            <h2 className="text-lg font-extrabold tracking-tight">
              UPDATE TODAY&apos;S ATTENDANCE
            </h2>
            <p className="text-xs text-purple-100/90 mt-0.5 font-medium">
              Mark individual periods, multi-period labs &amp; cancellations
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between">
          <span className="text-xs text-purple-100 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-ping inline-block" />
            Division {state.settings.division} Schedule
          </span>

          <button
            onClick={onOpenUpdateModal}
            className="py-2 px-4 rounded-xl bg-white text-[#673A9A] font-bold text-xs shadow-soft hover:bg-purple-50 active-press transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4 text-[#7F4EB9]" />
            <span>Mark Today</span>
          </button>
        </div>
      </div>

      {/* Overall Semester Stats Card */}
      <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-4 border border-purple-100/80 dark:border-purple-900/30 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700/80 dark:text-purple-300/80">
              Overall Academic Status
            </h3>
            <p className="text-2xl font-black text-[#2D253A] dark:text-[#F3EEF9] mt-0.5">
              {overallStats.overallPercentage.toFixed(1)}%
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 ${
              overallStats.overallPercentage >= state.settings.target75
                ? 'bg-mint-100 dark:bg-mint-950/60 text-mint-800 dark:text-mint-300'
                : overallStats.overallPercentage >= state.settings.target70
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
            }`}
          >
            {overallStats.overallPercentage >= state.settings.target75 ? (
              <ShieldCheck className="w-4 h-4 text-mint-600 dark:text-mint-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            <span>
              {overallStats.overallPercentage >= state.settings.target75
                ? 'Target Maintained'
                : overallStats.overallPercentage >= state.settings.target70
                ? 'Borderline Zone'
                : 'Critical Shortage'}
            </span>
          </div>
        </div>

        {/* Overall Progress Bar with Target Ticks */}
        <div className="relative pt-1 pb-2">
          <div className="w-full h-3 bg-purple-50 dark:bg-[#251F33] rounded-full overflow-hidden flex">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallStats.overallPercentage >= state.settings.target75
                  ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                  : overallStats.overallPercentage >= state.settings.target70
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, overallStats.overallPercentage))}%` }}
            />
          </div>

          {/* 70% and 75% target indicator markers */}
          <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400 mt-1.5 font-medium px-0.5">
            <span>0%</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              70% Soft Target
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              75% Required Target
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* 4 Summary Metric Columns */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-purple-50 dark:border-purple-950 text-center">
          <div className="bg-[#FAF7EE] dark:bg-[#221D2C] p-2 rounded-2xl">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
              Attended
            </p>
            <p className="text-base font-bold text-mint-600 dark:text-mint-400 mt-0.5">
              {overallStats.totalPresent}
            </p>
          </div>

          <div className="bg-[#FAF7EE] dark:bg-[#221D2C] p-2 rounded-2xl">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
              Missed
            </p>
            <p className="text-base font-bold text-rose-500 dark:text-rose-400 mt-0.5">
              {overallStats.totalAbsent}
            </p>
          </div>

          <div className="bg-[#FAF7EE] dark:bg-[#221D2C] p-2 rounded-2xl">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
              Conducted
            </p>
            <p className="text-base font-bold text-purple-900 dark:text-purple-200 mt-0.5">
              {overallStats.totalConducted}
            </p>
          </div>

          <div className="bg-[#FAF7EE] dark:bg-[#221D2C] p-2 rounded-2xl">
            <p className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
              Remaining
            </p>
            <p className="text-base font-bold text-stone-700 dark:text-stone-300 mt-0.5">
              {overallStats.totalRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Subject Cards Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-sm font-bold text-[#2D253A] dark:text-[#F3EEF9]">
            Subject-wise Tracking
          </h2>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Current percentage &amp; projected absence allowances
          </p>
        </div>
        <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg">
          {subjectStats.length} Subjects
        </span>
      </div>

      {/* Individual Subject Cards Grid */}
      <div className="space-y-3">
        {subjectStats.map((stat) => {
          const { subject } = stat;
          const isExempt = subject.exemptStrictWarning;

          // Health badge styling
          let badgeStyle = 'bg-mint-100 text-mint-800 dark:bg-mint-950/80 dark:text-mint-300';
          let healthLabel = 'Comfortable';

          if (isExempt) {
            badgeStyle = 'bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300';
            healthLabel = 'Exempt from 75%';
          } else if (stat.health === 'warning') {
            badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
            healthLabel = 'Approaching 70%';
          } else if (stat.health === 'danger') {
            badgeStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
            healthLabel = 'Below 70% Alert';
          }

          return (
            <div
              key={subject.id}
              onClick={() => setSelectedSubjectModal(stat)}
              className="bg-white dark:bg-[#1A1622] rounded-3xl p-4 border border-purple-100/70 dark:border-purple-900/30 shadow-card hover:border-purple-200 transition-all cursor-pointer active-press"
            >
              {/* Card Top Row: Title, Code & Health Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                      {subject.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                      {subject.code}
                    </span>
                    {subject.id === 'cprog' && (
                      <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                        Includes club attendance
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}>
                    {healthLabel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>

              {/* Attendance Progress & Current Percentage */}
              <div className="flex items-end justify-between my-2">
                <div>
                  <span className="text-2xl font-black text-[#2D253A] dark:text-[#F3EEF9]">
                    {stat.currentPercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 ml-2">
                    ({stat.present}/{stat.conducted} attended)
                  </span>
                </div>

                <div className="text-right text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  Projected: <span className="font-bold text-purple-700 dark:text-purple-300">{stat.projectedPercentage.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress Bar with 75% target line */}
              <div className="relative w-full h-2 bg-purple-50 dark:bg-[#251F33] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isExempt
                      ? 'bg-violet-400'
                      : stat.currentPercentage >= state.settings.target75
                      ? 'bg-mint-500'
                      : stat.currentPercentage >= state.settings.target70
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, stat.currentPercentage))}%` }}
                />
              </div>

              {/* Absences Allowances and Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-purple-50 dark:border-purple-900/30 text-[11px]">
                <div className="bg-[#FDFCF7] dark:bg-[#221D2C] p-2 rounded-xl text-center">
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Remaining
                  </p>
                  <p className="text-xs font-bold text-purple-800 dark:text-purple-200 mt-0.5">
                    {stat.remainingScheduled} classes
                  </p>
                </div>

                <div className="bg-[#FDFCF7] dark:bg-[#221D2C] p-2 rounded-xl text-center">
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Can Miss @ 75%
                  </p>
                  <p
                    className={`text-xs font-extrabold mt-0.5 ${
                      stat.maxMissableAt75 > 0
                        ? 'text-mint-600 dark:text-mint-400'
                        : stat.maxMissableAt75 === 0 && stat.currentPercentage >= 75
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {stat.maxMissableAt75} classes
                  </p>
                </div>

                <div className="bg-[#FDFCF7] dark:bg-[#221D2C] p-2 rounded-xl text-center">
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Can Miss @ 70%
                  </p>
                  <p className="text-xs font-extrabold text-stone-700 dark:text-stone-300 mt-0.5">
                    {stat.maxMissableAt70} classes
                  </p>
                </div>
              </div>

              {/* Sub-note for PC or subjects below 75% */}
              {isExempt && (
                <p className="text-[10px] text-purple-600/80 dark:text-purple-300/80 mt-2 flex items-center gap-1 font-medium">
                  <Info className="w-3 h-3 text-purple-500 shrink-0" />
                  <span>PC attendance is monitored but does not have a strict 75% bar.</span>
                </p>
              )}

              {!isExempt && stat.classesNeededFor75 > 0 && (
                <div className="mt-2.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 flex items-center justify-between text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    Must attend next {stat.classesNeededFor75} classes to hit 75%
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSubjectForWhatIf(subject.id);
                    }}
                    className="underline text-[10px] hover:text-rose-900"
                  >
                    Simulate
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subject Detail Drawer / Modal */}
      {selectedSubjectModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
          onClick={() => setSelectedSubjectModal(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#1A1622] rounded-t-3xl sm:rounded-3xl p-5 border border-purple-100 dark:border-purple-900/40 shadow-floating"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {selectedSubjectModal.subject.code}
                </span>
                <h3 className="text-base font-bold text-[#2D253A] dark:text-[#F3EEF9] mt-1">
                  {selectedSubjectModal.subject.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-purple-50 dark:border-purple-950">
                <span className="text-stone-500">Current Percentage:</span>
                <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                  {selectedSubjectModal.currentPercentage.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-purple-50 dark:border-purple-950">
                <span className="text-stone-500">Conducted Classes:</span>
                <span className="font-semibold">{selectedSubjectModal.conducted} ({selectedSubjectModal.present} present, {selectedSubjectModal.absent} missed)</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-purple-50 dark:border-purple-950">
                <span className="text-stone-500">Remaining Scheduled:</span>
                <span className="font-semibold">{selectedSubjectModal.remainingScheduled} classes</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-purple-50 dark:border-purple-950">
                <span className="text-stone-500">Max Missable at 75% Target:</span>
                <span className="font-bold text-mint-600 dark:text-mint-400">
                  {selectedSubjectModal.maxMissableAt75} classes
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-purple-50 dark:border-purple-950">
                <span className="text-stone-500">Max Missable at 70% Target:</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">
                  {selectedSubjectModal.maxMissableAt70} classes
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-purple-50 dark:border-purple-950">
                <span className="text-stone-500">Projected 100% Attendance:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {selectedSubjectModal.projectedPercentage.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  const subId = selectedSubjectModal.subject.id;
                  setSelectedSubjectModal(null);
                  onSelectSubjectForWhatIf(subId);
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-[#7F4EB9] text-white text-xs font-semibold shadow-soft flex items-center justify-center gap-1.5 active-press"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Simulate Absences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
