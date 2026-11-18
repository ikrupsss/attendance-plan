'use client';

import React from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useAttendance();

  if (!toast) return null;

  const bgClasses = {
    success: 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50',
    error: 'bg-rose-900/90 text-rose-100 border-rose-700/50',
    info: 'bg-purple-900/90 text-purple-100 border-purple-700/50',
  }[toast.type];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-[92vw] w-auto animate-fade-in pointer-events-none">
      <div
        className={`px-4 py-3 rounded-2xl shadow-floating backdrop-blur-md border text-sm font-medium flex items-center gap-2.5 ${bgClasses}`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-purple-300 shrink-0" />}
        <span className="leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
