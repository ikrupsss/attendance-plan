'use client';

import React, { useState, useMemo } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { TimetableSlot, CalendarEvent } from '@/types/attendance';
import {
  formatDateISO,
  parseDateISO,
  getScheduledSlotsForDate,
} from '@/lib/calculations';
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CalendarCheck,
  CalendarX,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

export default function TimetableCalendarView() {
  const {
    state,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    addCalendarEvent,
    deleteCalendarEvent,
  } = useAttendance();

  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'calendar'>('weekly');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1); // 1 = Monday

  // Timetable Slot Modal State
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // Calendar Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState('2026-11-20');
  const [newEventType, setNewEventType] = useState<'holiday' | 'working_saturday'>('holiday');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Form State for editing/adding slot
  const [slotDay, setSlotDay] = useState<number>(1);
  const [slotPeriod, setSlotPeriod] = useState<number>(1);
  const [slotStart, setSlotStart] = useState<string>('09:00');
  const [slotEnd, setSlotEnd] = useState<string>('10:00');
  const [slotSubjectId, setSlotSubjectId] = useState<string>('maths');
  const [slotType, setSlotType] = useState<'lecture' | 'lab'>('lecture');

  const days = [
    { id: 1, name: 'Mon', full: 'Monday' },
    { id: 2, name: 'Tue', full: 'Tuesday' },
    { id: 3, name: 'Wed', full: 'Wednesday' },
    { id: 4, name: 'Thu', full: 'Thursday' },
    { id: 5, name: 'Fri', full: 'Friday' },
    { id: 6, name: 'Sat', full: 'Saturday' },
  ];

  // Subject dictionary
  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof state.subjects[0]>();
    state.subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [state.subjects]);

  // Current day's slots sorted
  const currentDaySlots = useMemo(() => {
    return state.timetable
      .filter((s) => s.dayOfWeek === selectedDayOfWeek)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }, [state.timetable, selectedDayOfWeek]);

  // Generate date list between start and end date for Academic Calendar view
  const semesterDaysList = useMemo(() => {
    const list: {
      dateStr: string;
      dateObj: Date;
      slots: TimetableSlot[];
      isHoliday: boolean;
      holidayTitle?: string;
      isSpecial: boolean;
      specialTitle?: string;
    }[] = [];

    const start = parseDateISO(state.settings.startDate);
    const end = parseDateISO(state.settings.endDate);
    const curr = new Date(start);

    while (curr <= end) {
      const dateStr = formatDateISO(curr);
      const schedule = getScheduledSlotsForDate(dateStr, state.timetable, state.calendarEvents);
      list.push({
        dateStr,
        dateObj: new Date(curr),
        ...schedule,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return list;
  }, [state.settings.startDate, state.settings.endDate, state.timetable, state.calendarEvents]);

  // Slot handlers
  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    setSlotDay(selectedDayOfWeek);
    setSlotPeriod((currentDaySlots[currentDaySlots.length - 1]?.periodNumber || 0) + 1);
    setSlotStart('09:00');
    setSlotEnd('10:00');
    setSlotSubjectId(state.subjects[0]?.id || 'maths');
    setSlotType('lecture');
    setIsSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotDay(slot.dayOfWeek);
    setSlotPeriod(slot.periodNumber);
    setSlotStart(slot.startTime);
    setSlotEnd(slot.endTime);
    setSlotSubjectId(slot.subjectId);
    setSlotType(slot.type);
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot) {
      updateTimetableSlot({
        ...editingSlot,
        dayOfWeek: slotDay,
        periodNumber: slotPeriod,
        startTime: slotStart,
        endTime: slotEnd,
        subjectId: slotSubjectId,
        type: slotType,
      });
    } else {
      addTimetableSlot({
        id: `slot-${Date.now()}`,
        dayOfWeek: slotDay,
        periodNumber: slotPeriod,
        startTime: slotStart,
        endTime: slotEnd,
        subjectId: slotSubjectId,
        type: slotType,
      });
    }
    setIsSlotModalOpen(false);
  };

  // Event handlers
  const handleSaveCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    addCalendarEvent({
      date: newEventDate,
      type: newEventType,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      followsDayOfWeek: newEventType === 'working_saturday' ? 5 : undefined,
    });

    setNewEventTitle('');
    setNewEventDesc('');
    setIsEventModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-4">
      {/* Sub-tab Navigation: Weekly vs Academic Calendar */}
      <div className="flex bg-white dark:bg-[#1A1622] rounded-2xl p-1 border border-purple-100/80 dark:border-purple-900/30 shadow-soft">
        <button
          onClick={() => setActiveSubTab('weekly')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'weekly'
              ? 'bg-[#7F4EB9] text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:text-purple-700'
          }`}
        >
          Weekly Timetable (C1)
        </button>

        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'calendar'
              ? 'bg-[#7F4EB9] text-white shadow-soft'
              : 'text-stone-600 dark:text-stone-400 hover:text-purple-700'
          }`}
        >
          Academic Calendar
        </button>
      </div>

      {/* WEEKLY TIMETABLE VIEW */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-3">
          {/* Day Selector Pills */}
          <div className="flex justify-between gap-1 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDayOfWeek(day.id)}
                className={`flex-1 py-2 px-1 rounded-2xl text-xs font-bold transition-all ${
                  selectedDayOfWeek === day.id
                    ? 'bg-[#7F4EB9] text-white shadow-soft'
                    : 'bg-white dark:bg-[#1A1622] text-stone-600 dark:text-stone-400 border border-purple-100/70 dark:border-purple-900/30 hover:border-purple-200'
                }`}
              >
                {day.name}
              </button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
              {days.find((d) => d.id === selectedDayOfWeek)?.full} Schedule
            </h3>

            <button
              onClick={handleOpenAddSlot}
              className="py-1 px-3 rounded-xl bg-purple-100/80 dark:bg-purple-950/70 text-[#7F4EB9] dark:text-[#B290DC] text-xs font-semibold flex items-center gap-1 active-press"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Period</span>
            </button>
          </div>

          {/* Periods List */}
          <div className="space-y-2.5">
            {currentDaySlots.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1622] rounded-3xl p-6 text-center border border-purple-100/70 dark:border-purple-900/30">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  No periods scheduled for {days.find((d) => d.id === selectedDayOfWeek)?.full}.
                </p>
                <button
                  onClick={handleOpenAddSlot}
                  className="mt-3 text-xs text-[#7F4EB9] font-bold underline"
                >
                  Add a period
                </button>
              </div>
            ) : (
              currentDaySlots.map((slot) => {
                const sub = subjectMap.get(slot.subjectId);

                return (
                  <div
                    key={slot.id}
                    className="bg-white dark:bg-[#1A1622] rounded-2xl p-3 px-3.5 border border-purple-100/70 dark:border-purple-900/30 shadow-soft flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#7F4EB9] dark:text-[#B290DC] flex flex-col items-center justify-center font-bold text-xs">
                        <span className="text-[9px] uppercase tracking-tighter opacity-70">P</span>
                        <span>{slot.periodNumber}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                            {sub ? sub.name : slot.subjectId}
                          </p>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              slot.type === 'lab'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {slot.type === 'lab' ? 'Lab' : 'Lecture'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          {slot.startTime} – {slot.endTime} • {sub?.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSlot(slot)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTimetableSlot(slot.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ACADEMIC CALENDAR VIEW */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                Academic Calendar (COE Schedule)
              </h3>
              <p className="text-[11px] text-stone-500">
                17 Nov – 7 Dec 2026 Tracking Period
              </p>
            </div>

            <button
              onClick={() => setIsEventModalOpen(true)}
              className="py-1 px-3 rounded-xl bg-purple-100/80 dark:bg-purple-950/70 text-[#7F4EB9] dark:text-[#B290DC] text-xs font-semibold flex items-center gap-1 active-press"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holiday / Special</span>
            </button>
          </div>

          {/* List of Dates */}
          <div className="space-y-2">
            {semesterDaysList.map((day) => {
              const formatted = day.dateObj.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              const isLogged = !!state.attendanceLogs[day.dateStr];

              return (
                <div
                  key={day.dateStr}
                  className={`p-3 rounded-2xl border transition-all ${
                    day.isHoliday
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/30'
                      : day.isSpecial
                      ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200/70 dark:border-purple-900/40'
                      : 'bg-white dark:bg-[#1A1622] border-purple-100/70 dark:border-purple-900/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                          {formatted}
                        </span>
                        {day.isHoliday && (
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.2 rounded-md">
                            Holiday: {day.holidayTitle}
                          </span>
                        )}
                        {day.isSpecial && (
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.2 rounded-md">
                            {day.specialTitle}
                          </span>
                        )}
                        {isLogged && (
                          <span className="text-[9px] font-semibold text-mint-700 dark:text-mint-300 bg-mint-100 dark:bg-mint-950 px-1.5 py-0.2 rounded">
                            Logged
                          </span>
                        )}
                      </div>

                      {!day.isHoliday && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                          {day.slots.length} periods scheduled:{' '}
                          {day.slots
                            .map((s) => subjectMap.get(s.subjectId)?.shortName || s.subjectId)
                            .join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Delete custom event if exists for this date */}
                    {state.calendarEvents.some((e) => e.date === day.dateStr) && (
                      <button
                        onClick={() => deleteCalendarEvent(day.dateStr)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Remove calendar rule for this day"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit / Add Slot Modal */}
      {isSlotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsSlotModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-purple-100 dark:border-purple-900/40 shadow-floating"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                {editingSlot ? 'Edit Timetable Period' : 'Add Timetable Period'}
              </h3>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Day of Week
                </label>
                <select
                  value={slotDay}
                  onChange={(e) => setSlotDay(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                >
                  {days.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Period Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={slotPeriod}
                    onChange={(e) => setSlotPeriod(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Period Type
                  </label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value as 'lecture' | 'lab')}
                    className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab (Multi-period)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Subject
                </label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                >
                  {state.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#7F4EB9] text-white font-bold text-xs shadow-soft active-press"
                >
                  {editingSlot ? 'Save Changes' : 'Add Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Calendar Event Modal */}
      {isEventModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsEventModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#1A1622] rounded-3xl p-5 border border-purple-100 dark:border-purple-900/40 shadow-floating"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#2D253A] dark:text-[#F3EEF9]">
                Add Holiday or Special Working Day
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCalendarEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Rule Type
                </label>
                <select
                  value={newEventType}
                  onChange={(e) =>
                    setNewEventType(e.target.value as 'holiday' | 'working_saturday')
                  }
                  className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                >
                  <option value="holiday">Holiday (No Classes)</option>
                  <option value="working_saturday">Working Saturday (Follows Friday Schedule)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Title / Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kannada Rajyotsava"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                />
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 font-semibold mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. University declared holiday"
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-100 dark:border-purple-900 bg-[#FAF7EE] dark:bg-[#251F33] text-[#2D253A] dark:text-[#F3EEF9]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#7F4EB9] text-white font-bold text-xs shadow-soft active-press"
                >
                  Add Calendar Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
