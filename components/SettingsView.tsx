'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Moon,
  Sun,
  Shield,
  Save,
  CheckCircle2,
  FileJson,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';

export default function SettingsView() {
  const {
    state,
    updateSubject,
    updateSettings,
    exportData,
    importData,
    resetData,
    showToast,
  } = useAttendance();

  // Settings form states
  const [target75, setTarget75] = useState(state.settings.target75);
  const [target70, setTarget70] = useState(state.settings.target70);
  const [startDate, setStartDate] = useState(state.settings.startDate);
  const [endDate, setEndDate] = useState(state.settings.endDate);
  const [division, setDivision] = useState(state.settings.division);

  // Initial subjects editing states
  const [editingSubjects, setEditingSubjects] = useState(
    state.subjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      initialPresent: s.initialPresent,
      initialAbsent: s.initialAbsent,
    }))
  );

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      target75: Number(target75),
      target70: Number(target70),
      startDate,
      endDate,
      division,
    });
  };

  const handleSaveSubjectBaselines = () => {
    editingSubjects.forEach((sub) => {
      updateSubject(sub.id, {
        initialPresent: Number(sub.initialPresent),
        initialAbsent: Number(sub.initialAbsent),
      });
    });
    showToast('Initial attendance baselines updated.', 'success');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const ok = importData(parsed);
        if (ok) {
          // Sync local form state
          if (parsed.settings) {
            setTarget75(parsed.settings.target75 || 75);
            setTarget70(parsed.settings.target70 || 70);
            setStartDate(parsed.settings.startDate || '2026-11-17');
            setEndDate(parsed.settings.endDate || '2026-12-07');
            setDivision(parsed.settings.division || 'C1');
          }
          if (Array.isArray(parsed.subjects)) {
            setEditingSubjects(
              parsed.subjects.map((s: typeof state.subjects[0]) => ({
                id: s.id,
                name: s.name,
                code: s.code,
                initialPresent: s.initialPresent,
                initialAbsent: s.initialAbsent,
              }))
            );
          }
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-4">
      {/* REQUIRED LOCALSTORAGE NOTICE (Explicit requirement from Section 9) */}
      <div className="p-4 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 text-xs shadow-soft flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Device Storage Notice</p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Your attendance data is stored in this browser. Export backups regularly. Clearing browser data or switching devices may remove access to your records.
          </p>
        </div>
      </div>

      {/* Backup and Restore Actions */}
      <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-purple-100/80 dark:border-purple-900/30 shadow-card space-y-3">
        <h3 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9] flex items-center gap-1.5">
          <FileJson className="w-4 h-4 text-[#7F4EB9]" />
          <span>Data Backup &amp; Portability</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={exportData}
            className="py-2.5 px-3 rounded-2xl bg-purple-100/80 dark:bg-purple-950/70 text-[#7F4EB9] dark:text-[#B290DC] text-xs font-bold flex items-center justify-center gap-2 active-press hover:bg-purple-200/80 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="cursor-pointer py-2.5 px-3 rounded-2xl bg-[#7F4EB9] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-soft active-press hover:opacity-95 transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* General Settings Form */}
      <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-purple-100/80 dark:border-purple-900/30 shadow-card space-y-4">
        <h3 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9] flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#7F4EB9]" />
          <span>Tracking Period &amp; Targets</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                End Date (Term End)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                Target (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={target75}
                onChange={(e) => setTarget75(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                Soft Target (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={target70}
                onChange={(e) => setTarget70(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                Division
              </label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-[#7F4EB9] text-white font-bold text-xs shadow-soft active-press hover:opacity-95"
            >
              Save Parameters
            </button>
          </div>
        </form>
      </div>

      {/* Editable Initial Attendance Baselines */}
      <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-purple-100/80 dark:border-purple-900/30 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
              Edit Initial Attendance Figures
            </h3>
            <p className="text-[10px] text-stone-500">
              Baseline attendance prior to 17 November
            </p>
          </div>

          <button
            onClick={handleSaveSubjectBaselines}
            className="py-1 px-3 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#7F4EB9] dark:text-[#B290DC] text-xs font-bold flex items-center gap-1 active-press"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          {editingSubjects.map((sub, idx) => (
            <div
              key={sub.id}
              className="p-3 rounded-2xl bg-[#FAF7EE] dark:bg-[#201B2A] flex items-center justify-between gap-2"
            >
              <div>
                <p className="font-bold text-[#2D253A] dark:text-[#F3EEF9]">{sub.name}</p>
                <p className="text-[10px] text-stone-500">{sub.code}</p>
              </div>

              <div className="flex items-center gap-2">
                <div>
                  <span className="text-[10px] text-stone-500 block">Present</span>
                  <input
                    type="number"
                    min={0}
                    value={sub.initialPresent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingSubjects((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, initialPresent: val } : item))
                      );
                    }}
                    className="w-16 p-1.5 rounded-lg border border-purple-100 dark:border-purple-900 bg-white dark:bg-[#15111B] text-center font-bold"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 block">Absent</span>
                  <input
                    type="number"
                    min={0}
                    value={sub.initialAbsent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingSubjects((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, initialAbsent: val } : item))
                      );
                    }}
                    className="w-16 p-1.5 rounded-lg border border-purple-100 dark:border-purple-900 bg-white dark:bg-[#15111B] text-center font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Application / Factory Reset Section */}
      <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-rose-100 dark:border-rose-950/40 shadow-card space-y-2">
        <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4" />
          <span>Reset Application Data</span>
        </h3>
        <p className="text-[11px] text-stone-500">
          Restore default baseline attendance (17 Nov initial figures) and wipe logged updates.
        </p>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="mt-2 py-2 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs font-bold active-press hover:bg-rose-100"
        >
          Reset to Initial Baseline
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsResetConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-rose-200 dark:border-rose-900 shadow-floating space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h4 className="text-sm font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                Reset Application?
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                This will reset your attendance logs and re-seed the original prompt baseline. This action cannot be undone unless you have exported a JSON backup.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetData();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-soft"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
