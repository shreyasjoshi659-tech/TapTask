import type { OverviewResponse } from '../types';

interface OverviewViewProps {
  overview: OverviewResponse;
  isTapping: boolean;
  isTogglingPause: boolean;
  onSimulateTap: () => void;
  onTogglePause: () => void;
  onOpenFacultyModal: () => void;
}

export function OverviewView({
  overview,
  isTapping,
  isTogglingPause,
  onSimulateTap,
  onTogglePause,
  onOpenFacultyModal,
}: OverviewViewProps) {
  const pctNum = Number(overview.rate);
  const absentPct = Math.max(0, 100 - pctNum).toFixed(1);
  const roundedPct = Math.round(pctNum);

  return (
    <section className="flex flex-col w-full space-y-4">
      {/* Low-Light Night Hall Banner */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-indigo-500/20 backdrop-blur-md shadow-sm">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-base select-none" aria-hidden="true">
            🌙
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-slate-200 font-medium truncate">
              Nighttime Lecture Hall Mode
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
              Low Glare Activated
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[14px] text-cyan-400">dark_mode</span>
          <span>OLED Black</span>
        </span>
      </div>

      {/* Active Session Card */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">event</span>
            Thursday, Oct 24, 2024
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold">
            Period 03 • 10:00 - 11:30 AM
          </span>
        </div>
        <div className="bg-[#0F172A] p-4 rounded-xl shadow-lg border border-slate-800/80 flex flex-col space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  overview.sessionPaused || !overview.readerPowerOn
                    ? 'bg-amber-400'
                    : 'bg-emerald-400 animate-ping'
                }`}
              />
              <span
                className={`text-[10px] uppercase tracking-wider font-bold ${
                  overview.sessionPaused || !overview.readerPowerOn
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {!overview.readerPowerOn
                  ? 'Reader Offline'
                  : overview.sessionPaused
                    ? 'Session Paused'
                    : 'Live Lecture Tracking'}
              </span>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60 font-medium">
              Lecture Hall 3B
            </span>
          </div>
          <h2 className="text-[18px] leading-6 text-white tracking-tight font-semibold">
            CS-204: Programming for Problem Solving
          </h2>
          <button
            onClick={onOpenFacultyModal}
            className="flex items-center gap-1 text-[12px] text-slate-300 hover:text-emerald-400 transition-colors text-left cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px] text-emerald-400">school</span>
            <span className="hover:underline">Prof. Alistair Vance • Faculty of Computing</span>
          </button>
        </div>
      </div>

      {/* Attendance Metrics Bento */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#0F172A] border border-slate-800/90 p-3 rounded-xl shadow-md flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Roster</span>
          <div className="flex items-baseline space-x-1 my-1">
            <span className="text-[24px] text-white font-bold">{overview.totalRoster}</span>
            <span className="text-[10px] text-slate-400">students</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined text-[13px] text-indigo-400">groups</span>
            <span className="text-[10px] text-slate-300 font-semibold">Batch &apos;25</span>
          </div>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl shadow-md flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400 uppercase font-bold">Present</span>
          <div className="flex items-baseline space-x-1 my-1">
            <span className="text-[24px] text-emerald-300 font-bold">{overview.present}</span>
            <span className="material-symbols-outlined text-[16px] text-emerald-400">
              trending_up
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold">{overview.rate}% present</span>
          </div>
        </div>
        <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl shadow-md flex flex-col justify-between">
          <span className="text-[10px] text-rose-400 uppercase font-bold">Unmarked</span>
          <div className="flex items-baseline space-x-1 my-1">
            <span className="text-[24px] text-rose-400 font-bold">{overview.absent}</span>
            <span className="material-symbols-outlined text-[16px] text-rose-400">pending</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="text-[10px] font-semibold">{absentPct}% left</span>
          </div>
        </div>
      </div>

      {/* Quorum Ring Gauge */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-emerald-400 transition-all duration-500"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${overview.rate}, 100`}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-emerald-300">{roundedPct}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] text-white font-semibold">
              {overview.rate}% Quorum Reached
            </span>
            <span className="text-[12px] text-slate-400">
              Class meets official accreditation threshold
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold shrink-0">
          Valid Session
        </span>
      </div>

      {/* Hardware Telemetry Reader Card */}
      <div className="bg-[#0F172A] border border-cyan-950/60 p-4 rounded-xl shadow-lg flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <span className="material-symbols-outlined text-[20px]">sensors</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] text-white font-bold">Reader TT-Pro-04</span>
              <span className="text-[12px] text-slate-400">
                Antenna A1 • Near-Field ISO/IEC 14443
              </span>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
              overview.readerPowerOn
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                overview.readerPowerOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{overview.readerPowerOn ? 'ONLINE' : 'STANDBY'}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Signal</span>
            <span className="text-[12px] font-semibold text-emerald-400">
              {overview.readerPowerOn ? '-48 dBm' : '—'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Battery</span>
            <span className="text-[12px] font-semibold text-white">94% Charged</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">Read Latency</span>
            <span className="text-[12px] font-semibold text-cyan-300">
              {overview.readerPowerOn ? '32 ms' : 'Paused'}
            </span>
          </div>
        </div>
        <button
          onClick={onSimulateTap}
          disabled={isTapping}
          type="button"
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 rounded-xl text-[12px] font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[19px]">contactless</span>
          <span>
            {isTapping ? 'Logging NFC Tap...' : 'Simulate Student Tap (NFC Pulse)'}
          </span>
        </button>
      </div>

      {/* Live Tap Registry */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-[18px] text-white font-semibold">Live Tap Registry</h3>
          <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
            Live Stream
          </span>
        </div>
        <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Auto-Syncing
        </span>
      </div>

      <div className="flex flex-col space-y-2.5">
        {overview.logs.map((log) => {
          const isMarked = log.status === 'Marked';
          return (
            <div
              key={log.id}
              className="bg-[#0F172A] border border-slate-800/80 p-3 rounded-xl shadow-md flex items-center justify-between transition-all duration-300"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full border flex items-center justify-center text-[12px] font-bold shrink-0 ${
                    isMarked
                      ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-950/50 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {log.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] text-white font-semibold truncate">
                    {log.student_name}
                  </span>
                  <span
                    className={`text-[12px] ${isMarked ? 'text-slate-400' : 'text-amber-400'}`}
                  >
                    Roll #{log.student_roll} • {log.tapped_at}
                  </span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                  isMarked
                    ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isMarked ? 'check_circle' : 'hourglass_empty'}
                </span>
                {log.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Session Controls */}
      <div className="flex items-center justify-between p-3 bg-[#0F172A] border border-slate-800/90 rounded-xl shadow-md">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-[20px] text-emerald-400">tune</span>
          <span className="text-[12px] text-white font-semibold">Session Controls</span>
        </div>
        <button
          onClick={onTogglePause}
          disabled={isTogglingPause}
          type="button"
          className={`px-3 py-1 rounded-full border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
            overview.sessionPaused
              ? 'bg-cyan-900 text-cyan-200 border-cyan-500/40 hover:bg-cyan-800'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">
            {overview.sessionPaused ? 'play_circle' : 'pause_circle'}
          </span>
          <span>{overview.sessionPaused ? 'Resume Session' : 'Pause Session'}</span>
        </button>
      </div>
    </section>
  );
}
