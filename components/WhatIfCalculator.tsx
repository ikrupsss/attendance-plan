'use client';

import React, { useState, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { simulateSubjectAttendance } from '@/lib/calculations';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface WhatIfCalculatorProps {
  initialSubjectId?: string;
}

export default function WhatIfCalculator({ initialSubjectId }: WhatIfCalculatorProps) {
  const { subjectStats, state } = useAttendance();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjectStats[0]?.subject.id || 'maths'
  );
  const [additionalMissed, setAdditionalMissed] = useState<number>(0);
  const [additionalAttended, setAdditionalAttended] = useState<number>(0);

  // Selected subject stat
  const currentStat = useMemo(() => {
    return subjectStats.find((s) => s.subject.id === selectedSubjectId) || subjectStats[0];
  }, [subjectStats, selectedSubjectId]);

  // Simulation output
  const simulation = useMemo(() => {
    if (!currentStat) return null;
    return simulateSubjectAttendance(
      currentStat,
      additionalMissed,
      additionalAttended,
      state.settings.target75,
      state.settings.target70
    );
  }, [currentStat, additionalMissed, additionalAttended, state.settings.target75, state.settings.target70]);

  const handleResetSimulation = () => {
    setAdditionalMissed(0);
    setAdditionalAttended(0);
  };

  if (!currentStat || !simulation) return null;

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-4">
      {/* Simulation Info Banner */}
      <div className="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/40 rounded-2xl p-3 px-3.5 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200 shadow-soft">
        <Sparkles className="w-4 h-4 text-[#7F4EB9] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">What-If Attendance Simulator</p>
          <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-0.5">
            Test hypothetical scenarios (e.g. missing upcoming classes). Simulations are strictly isolated and never modify your actual records.
          </p>
        </div>
      </div>

      {/* Main Simulation Sandbox Card */}
      <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-purple-100/80 dark:border-purple-900/30 shadow-card space-y-4">
        {/* Subject Dropdown Selector */}
        <div>
          <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5">
            Select Subject to Simulate
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setAdditionalMissed(0);
              setAdditionalAttended(0);
            }}
            className="w-full p-3 rounded-2xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-sm font-bold text-[#2D253A] dark:text-[#F3EEF9] outline-none"
          >
            {subjectStats.map((s) => (
              <option key={s.subject.id} value={s.subject.id}>
                {s.subject.name} ({s.subject.code}) — {s.currentPercentage.toFixed(1)}%
              </option>
            ))}
          </select>
        </div>

        {/* Current Baseline Overview */}
        <div className="p-3 rounded-2xl bg-[#FDFCF7] dark:bg-[#201B2A] border border-purple-100/60 dark:border-purple-900/30 flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] text-stone-500 font-semibold">Current Baseline</p>
            <p className="text-base font-extrabold text-[#2D253A] dark:text-[#F3EEF9]">
              {currentStat.currentPercentage.toFixed(1)}%
            </p>
            <p className="text-[10px] text-stone-500">
              {currentStat.present}/{currentStat.conducted} classes attended
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-stone-500 font-semibold">Remaining Scheduled</p>
            <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
              {currentStat.remainingScheduled} classes
            </p>
            <p className="text-[10px] text-stone-500">
              till 7 December 2026
            </p>
          </div>
        </div>

        {/* Interactive Stepper 1: Additional Absences */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              What if I miss more classes?
            </span>
            <span className="text-xs font-bold text-rose-500">
              +{additionalMissed} missed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdditionalMissed((v) => Math.max(0, v - 1))}
              className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-base active-press hover:bg-purple-100"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="range"
              min={0}
              max={Math.max(10, currentStat.remainingScheduled)}
              value={additionalMissed}
              onChange={(e) => setAdditionalMissed(Number(e.target.value))}
              className="flex-1 accent-rose-500 h-2 bg-stone-100 dark:bg-stone-800 rounded-lg cursor-pointer"
            />

            <button
              onClick={() => setAdditionalMissed((v) => v + 1)}
              className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-base active-press hover:bg-purple-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Stepper 2: Additional Attended Classes */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              What if I attend additional classes?
            </span>
            <span className="text-xs font-bold text-mint-600 dark:text-mint-400">
              +{additionalAttended} attended
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdditionalAttended((v) => Math.max(0, v - 1))}
              className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-base active-press hover:bg-purple-100"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="range"
              min={0}
              max={Math.max(10, currentStat.remainingScheduled)}
              value={additionalAttended}
              onChange={(e) => setAdditionalAttended(Number(e.target.value))}
              className="flex-1 accent-mint-500 h-2 bg-stone-100 dark:bg-stone-800 rounded-lg cursor-pointer"
            />

            <button
              onClick={() => setAdditionalAttended((v) => v + 1)}
              className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-base active-press hover:bg-purple-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reset Simulation Controls */}
        {(additionalMissed > 0 || additionalAttended > 0) && (
          <div className="flex justify-end">
            <button
              onClick={handleResetSimulation}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset sliders</span>
            </button>
          </div>
        )}

        {/* SIMULATION RESULTS CARD */}
        <div className="mt-4 p-4 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-[#221D2C] border border-purple-200/80 dark:border-purple-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Simulated Attendance Result
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-[#2D253A] dark:text-[#F3EEF9]">
                  {simulation.newPercentage.toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  (was {currentStat.currentPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                simulation.newPercentage >= state.settings.target75
                  ? 'bg-mint-500 text-white'
                  : simulation.newPercentage >= state.settings.target70
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {simulation.newPercentage >= state.settings.target75 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>
                {simulation.newPercentage >= state.settings.target75
                  ? '>= 75% Safe'
                  : simulation.newPercentage >= state.settings.target70
                  ? '70% - 75% Borderline'
                  : '< 70% Alert'}
              </span>
            </div>
          </div>

          {/* Threshold Criteria Status Breakdown */}
          <div className="space-y-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/40 text-xs">
            {/* 75% Target Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-[#1A1622]/80">
              <div className="flex items-center gap-2">
                {simulation.maintains75 ? (
                  <ShieldCheck className="w-4 h-4 text-mint-500 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                    75% Primary Target
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Remaining allowance: {simulation.maxMissable75} more classes can be missed
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  simulation.maintains75
                    ? 'bg-mint-100 text-mint-800 dark:bg-mint-950 dark:text-mint-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {simulation.maintains75 ? 'Maintained' : 'Breached'}
              </span>
            </div>

            {/* 70% Soft Target Status */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-[#1A1622]/80">
              <div className="flex items-center gap-2">
                {simulation.maintains70 ? (
                  <ShieldCheck className="w-4 h-4 text-mint-500 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                    70% Soft Target
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Remaining allowance: {simulation.maxMissable70} more classes can be missed
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  simulation.maintains70
                    ? 'bg-mint-100 text-mint-800 dark:bg-mint-950 dark:text-mint-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {simulation.maintains70 ? 'Maintained' : 'Breached'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
