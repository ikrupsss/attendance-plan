'use client';

import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  History,
  Calculator,
  Settings,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'update' | 'timetable' | 'history' | 'whatif' | 'settings';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  hasUpdatedToday: boolean;
}

export default function Navbar({ activeTab, onSelectTab, hasUpdatedToday }: NavbarProps) {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'update' as NavTab,
      label: 'Update',
      icon: CalendarCheck,
      highlight: !hasUpdatedToday,
    },
    { id: 'timetable' as NavTab, label: 'Timetable', icon: CalendarDays },
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'whatif' as NavTab, label: 'What-If', icon: Calculator },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#181420]/95 backdrop-blur-lg border-t border-purple-100/80 dark:border-purple-950/80 px-2 py-1.5 pb-safe shadow-[0_-4px_20px_rgba(103,58,154,0.06)]">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#7F4EB9] dark:text-[#B290DC] font-semibold'
                  : 'text-stone-400 dark:text-stone-400 hover:text-purple-600 dark:hover:text-purple-300'
              }`}
            >
              {/* Highlight dot if update needed */}
              {item.highlight && (
                <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-mint-500 ring-2 ring-white dark:ring-[#181420] animate-pulse" />
              )}

              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-purple-100/70 dark:bg-purple-950/70' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
