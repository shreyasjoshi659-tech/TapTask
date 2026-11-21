import type { HistoryResponse, OverviewResponse } from '../types';

interface HistoryViewProps {
  history: HistoryResponse;
  overview: OverviewResponse;
  onSelectCourse: (code: string) => void;
  onOpenDeviceTab: () => void;
  onExportCsv: () => void;
}

export function HistoryView({
  history,
  overview,
  onSelectCourse,
  onOpenDeviceTab,
  onExportCsv,
}: HistoryViewProps) {
  const activeCourse =
    history.courses.find((c) => c.code === history.selectedCourse) || history.courses[0];

  const isPrimaryLiveCourse = activeCourse?.code === 'CS-204';
  const spotlightPresent = isPrimaryLiveCourse
    ? overview.present
    : Math.round(((activeCourse?.avg_rate ?? 90) / 100) * 64);
  const spotlightTotal = 64;
  const spotlightPct = isPrimaryLiveCourse
    ? overview.rate
    : ((spotlightPresent / spotlightTotal) * 100).toFixed(1);

  return (
    <section className="flex flex-col w-full space-y-5">
      {/* Course Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {history.courses.map((course) => {
          const active = course.code === history.selectedCourse;
          return (
            <button
              key={course.code}
              type="button"
              onClick={() => onSelectCourse(course.code)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] transition-colors cursor-pointer ${
                active
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'bg-surface-container-low text-on-surface-variant font-medium hover:bg-surface-container'
              }`}
            >
              {course.code}
            </button>
          );
        })}
      </div>

      {/* Spotlight Card */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-primary-container/20 text-primary text-[10px] font-bold">
                {activeCourse?.code ?? 'CS-204'}
              </span>
              <span className="text-[10px] text-secondary font-medium">
                Core Lecture • {activeCourse?.room ?? 'LH-3B'}
              </span>
            </div>
            <span className="text-[18px] text-on-surface font-bold mt-1">
              {activeCourse?.name ?? 'Programming for Problem Solving'}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Fall Semester 2024 · Thursday, Oct 24
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[22px]">code</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                Attendance Quorum
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] text-on-surface font-bold">{spotlightPresent}</span>
                <span className="text-[16px] text-on-surface-variant">/ {spotlightTotal}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[12px] font-bold">
              {spotlightPct}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
              style={{ width: `${Math.min(100, Number(spotlightPct))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container text-[13px] font-bold shadow-[0_0_16px_rgba(16,185,129,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onOpenDeviceTab}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-surface-container-high text-on-surface text-[13px] font-semibold hover:bg-surface-bright transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">sensors</span>
            <span>NFC Console</span>
          </button>
        </div>
      </div>

      {/* Timeline & Session Logs */}
      <div className="space-y-2.5">
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
          Timeline &amp; Session Logs
        </span>
        {history.timeline.length === 0 ? (
          <div className="p-5 rounded-xl bg-surface-container-low text-center">
            <p className="text-[13px] text-on-surface font-medium">
              No archived sessions yet for {history.selectedCourse}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-1">
              Session logs will appear here once synced from the lecture hall NFC reader.
            </p>
          </div>
        ) : (
          history.timeline.map((item, idx) => {
            const presentCount =
              isPrimaryLiveCourse && idx === 0 ? overview.present : item.present_count;
            const pct =
              item.total_count > 0 ? ((presentCount / item.total_count) * 100).toFixed(1) : '0.0';
            const badgeClass =
              Number(pct) >= 92
                ? 'bg-secondary-container/20 text-secondary'
                : Number(pct) >= 85
                  ? 'bg-primary-container/20 text-primary'
                  : 'bg-tertiary-container/20 text-tertiary';

            return (
              <div key={item.id} className="p-4 rounded-xl bg-surface-container-low space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-on-surface font-bold">
                    {item.session_date}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${badgeClass}`}
                  >
                    {presentCount} / {item.total_count} ({pct}%)
                  </span>
                </div>
                <p className="text-[13px] text-on-surface">{item.topic}</p>
                <p className="text-[11px] text-on-surface-variant">{item.reader_meta}</p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
