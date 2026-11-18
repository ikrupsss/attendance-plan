'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Navbar, { NavTab } from '@/components/Navbar';
import DashboardView from '@/components/DashboardView';
import TimetableCalendarView from '@/components/TimetableCalendarView';
import HistoryView from '@/components/HistoryView';
import WhatIfCalculator from '@/components/WhatIfCalculator';
import SettingsView from '@/components/SettingsView';
import DailyUpdateModal from '@/components/DailyUpdateModal';
import { useAttendance } from '@/context/AttendanceContext';

export default function Home() {
  const { hasUpdatedToday, isLoaded } = useAttendance();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [targetDateForUpdate, setTargetDateForUpdate] = useState<string | undefined>(undefined);
  const [whatIfTargetSubject, setWhatIfTargetSubject] = useState<string | undefined>(undefined);

  const handleOpenUpdateModal = (dateStr?: string) => {
    setTargetDateForUpdate(dateStr);
    setIsUpdateModalOpen(true);
  };

  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'update') {
      handleOpenUpdateModal();
      return;
    }
    setActiveTab(tab);
  };

  const handleNavigateToWhatIf = (subjectId: string) => {
    setWhatIfTargetSubject(subjectId);
    setActiveTab('whatif');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-3xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-full border-2 border-[#7F4EB9] border-t-transparent animate-spin" />
        </div>
        <p className="mt-3 text-xs font-semibold text-purple-800 dark:text-purple-300">
          Loading Attendance Plan...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-between selection:bg-purple-200">
      <div>
        {/* Top Header with title, current date, countdown, and daily check */}
        <Header onOpenUpdateModal={() => handleOpenUpdateModal()} />

        {/* Tab View Container */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenUpdateModal={() => handleOpenUpdateModal()}
              onSelectSubjectForWhatIf={handleNavigateToWhatIf}
            />
          )}

          {activeTab === 'timetable' && <TimetableCalendarView />}

          {activeTab === 'history' && (
            <HistoryView onEditDate={(date) => handleOpenUpdateModal(date)} />
          )}

          {activeTab === 'whatif' && (
            <WhatIfCalculator initialSubjectId={whatIfTargetSubject} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </div>
      </div>

      {/* Bottom Thumb-Friendly Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        hasUpdatedToday={hasUpdatedToday}
      />

      {/* Daily Update Modal Sheet */}
      <DailyUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        initialDate={targetDateForUpdate}
      />
    </main>
  );
}
