import { useMemo, useState } from 'react';
import type { StudentRecord } from '../types';

type FilterMode = 'all' | 'good' | 'risk';

interface StudentsViewProps {
  students: StudentRecord[];
  markingRoll: string | null;
  onMarkPresent: (roll: string) => void;
  onOpenAddModal: () => void;
}

export function StudentsView({
  students,
  markingRoll,
  onMarkPresent,
  onOpenAddModal,
}: StudentsViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((s) => {
      const pct = s.total_sessions > 0 ? (s.attended_sessions / s.total_sessions) * 100 : 0;
      const matchesFilter =
        filter === 'all' || (filter === 'good' && pct >= 75) || (filter === 'risk' && pct < 75);
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.roll.toLowerCase().includes(query) ||
        (s.rfid_uid || '').toLowerCase().includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [students, search, filter]);

  return (
    <section className="flex flex-col w-full space-y-4">
      {/* Nighttime Lecture Mode Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-container-low shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[18px]">bedtime</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-on-surface font-semibold truncate">
              Nighttime Lecture Mode • Auditorium C
            </span>
            <span className="text-[10px] text-outline truncate">Low Glare • Eye-Strain Safe</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary text-[10px] font-semibold uppercase shrink-0">
          OLED Black
        </span>
      </div>

      {/* Search Bar & Add Student Button */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low">
          <span className="material-symbols-outlined text-outline text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-on-surface placeholder:text-outline text-[13px] focus:outline-none border-none p-0 focus:ring-0"
            placeholder="Search student, roll, or RFID..."
            type="text"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-outline hover:text-on-surface cursor-pointer"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        <button
          onClick={onOpenAddModal}
          type="button"
          className="px-3.5 h-11 rounded-xl bg-primary text-on-primary text-[12px] font-bold flex items-center gap-1 shadow-[0_0_14px_rgba(16,185,129,0.35)] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Add</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'all', label: `All Students (${students.length})` },
            { id: 'good', label: 'Above 75%' },
            { id: 'risk', label: 'At Risk (<75%)' },
          ] as const
        ).map((pill) => {
          const active = filter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilter(pill.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] transition-colors cursor-pointer ${
                active
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant font-medium hover:bg-surface-container'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Students Directory List */}
      <div className="flex flex-col gap-2.5">
        {filteredStudents.length === 0 ? (
          <div className="p-6 rounded-xl bg-surface-container-low text-center space-y-1">
            <span className="material-symbols-outlined text-outline text-[28px]">person_search</span>
            <p className="text-[13px] text-on-surface font-medium">No matching students found</p>
            <p className="text-[11px] text-outline">
              Try clearing the search query or switching filters.
            </p>
          </div>
        ) : (
          filteredStudents.map((s) => {
            const pct =
              s.total_sessions > 0 ? Math.round((s.attended_sessions / s.total_sessions) * 100) : 0;
            const color =
              pct >= 92 ? 'text-secondary' : pct >= 75 ? 'text-primary' : 'text-error';
            const isAtMax = s.attended_sessions >= s.total_sessions;
            const isMarking = markingRoll === s.roll;

            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-sm text-primary shrink-0">
                    {s.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] text-on-surface font-semibold truncate">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-outline truncate">
                      {s.roll} • {s.status}
                      {s.rfid_uid ? ` • ${s.rfid_uid}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-[16px] font-bold ${color} block`}>{pct}%</span>
                    <span className="text-[10px] text-outline">
                      {s.attended_sessions}/{s.total_sessions}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isAtMax || isMarking}
                    onClick={() => onMarkPresent(s.roll)}
                    className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-[11px] font-bold hover:bg-primary/25 disabled:opacity-40 transition-colors cursor-pointer"
                    title="Mark student present and log NFC tap"
                  >
                    {isMarking ? '...' : '+1'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
