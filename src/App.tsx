import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createStudent,
  fetchDeviceSettings,
  fetchHistory,
  fetchOverview,
  fetchStudents,
  markStudentPresent,
  recordTap,
  toggleSessionPause,
  updateDeviceSettings,
} from './api';
import { DeviceView } from './components/DeviceView';
import { HistoryView } from './components/HistoryView';
import { AddStudentModal, FacultyModal } from './components/Modals';
import { OverviewView } from './components/OverviewView';
import { StudentsView } from './components/StudentsView';
import type {
  DeviceSettings,
  HistoryResponse,
  OverviewResponse,
  RangeMode,
  StudentRecord,
  TabId,
} from './types';

const SUBTITLES: Record<TabId, string> = {
  overview: 'Overview',
  students: 'Students',
  history: 'History',
  device: 'RFID Device & Settings',
};

const SAMPLE_TAP_POOL = [
  { name: 'Priya Nair', roll: '21CS63', initials: 'PN' },
  { name: "Liam O'Connor", roll: '21CS09', initials: 'LO' },
  { name: 'Ananya Deshmukh', roll: '21CS31', initials: 'AD' },
  { name: 'Marcus Thorne', roll: '21CS14', initials: 'MT' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [device, setDevice] = useState<DeviceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isTapping, setIsTapping] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [markingRoll, setMarkingRoll] = useState<string | null>(null);
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const tapPoolIndexRef = useRef(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2600);
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setLoadError(null);
      const [ov, st, hist, dev] = await Promise.all([
        fetchOverview(),
        fetchStudents(),
        fetchHistory('CS-204'),
        fetchDeviceSettings(),
      ]);
      setOverview(ov);
      setStudents(st);
      setHistory(hist);
      setDevice(dev);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to reach TapTrack backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllData();
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [loadAllData]);

  function handleSwitchTab(tab: TabId) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function handleSimulateTap() {
    if (isTapping) return;
    setIsTapping(true);
    try {
      const candidate = SAMPLE_TAP_POOL[tapPoolIndexRef.current % SAMPLE_TAP_POOL.length];
      const saved = await recordTap(candidate);
      tapPoolIndexRef.current += 1;
      const updatedOverview = await fetchOverview();
      setOverview(updatedOverview);
      showToast(`Saved to DB: ${saved.student_name} (#${saved.student_roll}) Marked`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to record tap');
    } finally {
      setIsTapping(false);
    }
  }

  async function handleTogglePause() {
    if (isTogglingPause) return;
    setIsTogglingPause(true);
    try {
      const res = await toggleSessionPause();
      setOverview((prev) => (prev ? { ...prev, sessionPaused: res.sessionPaused } : prev));
      setDevice((prev) => (prev ? { ...prev, session_paused: res.sessionPaused ? 1 : 0 } : prev));
      showToast(res.sessionPaused ? 'RFID Session paused.' : 'RFID Session resumed.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update session state');
    } finally {
      setIsTogglingPause(false);
    }
  }

  async function handleMarkStudentPresent(roll: string) {
    setMarkingRoll(roll);
    try {
      const updated = await markStudentPresent(roll);
      setStudents((prev) => prev.map((s) => (s.roll === roll ? updated : s)));
      const updatedOverview = await fetchOverview();
      setOverview(updatedOverview);
      showToast(`Marked ${updated.name} present & logged tap`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to mark student present');
    } finally {
      setMarkingRoll(null);
    }
  }

  async function handleAddStudent(payload: { name: string; roll: string; rfid_uid?: string }) {
    setIsSavingStudent(true);
    try {
      const created = await createStudent(payload);
      setStudents((prev) => [created, ...prev]);
      showToast(`Enrolled ${created.name} (${created.roll})`);
    } finally {
      setIsSavingStudent(false);
    }
  }

  async function handleSelectCourse(code: string) {
    try {
      const nextHistory = await fetchHistory(code);
      setHistory(nextHistory);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load course history');
    }
  }

  function handleExportCsv() {
    const link = document.createElement('a');
    link.href = '/api/history/export';
    link.download = 'CS-204-attendance-logs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CS-204-attendance-logs.csv');
  }

  async function handleUpdateDevice(patch: {
    power_on?: number;
    range_mode?: RangeMode;
    anti_collision?: number;
    silent_haptic?: number;
    buffer_kb?: number;
  }) {
    try {
      const updated = await updateDeviceSettings(patch);
      setDevice(updated);
      if (patch.power_on !== undefined) {
        setOverview((prev) =>
          prev ? { ...prev, readerPowerOn: Boolean(updated.power_on) } : prev,
        );
        showToast(updated.power_on ? 'Reader TT-Pro-04 powered ON' : 'Reader TT-Pro-04 standby');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save device settings');
    }
  }

  const nfcIsActive = Boolean(overview?.readerPowerOn && !overview?.sessionPaused);

  return (
    <div className="bg-[#090D16] text-[#F8FAFC] antialiased flex flex-col min-h-screen w-full">
      {/* TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-[#090D16]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="h-16 px-5 flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]">
              <span className="material-symbols-outlined text-[20px]">nfc</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] leading-6 text-emerald-400 font-bold tracking-tight drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]">
                TapTrack
              </span>
              <span className="text-[10px] leading-3 text-slate-400 uppercase tracking-widest font-semibold">
                {SUBTITLES[activeTab]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                nfcIsActive
                  ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  nfcIsActive
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]'
                    : 'bg-amber-400'
                }`}
              />
              <span>
                {!overview?.readerPowerOn
                  ? 'NFC Off'
                  : overview?.sessionPaused
                    ? 'Paused'
                    : 'NFC Active'}
              </span>
            </div>

            <button
              onClick={() => setFacultyModalOpen(true)}
              aria-label="Faculty Profile"
              className="w-9 h-9 rounded-full ring-2 ring-emerald-500/50 hover:ring-emerald-400 bg-emerald-500 text-[#022c22] font-bold text-xs flex items-center justify-center shrink-0 focus:outline-none transition-all shadow-[0_0_10px_rgba(16,185,129,0.25)] cursor-pointer"
              type="button"
            >
              AV
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col relative w-full max-w-lg mx-auto pt-20 pb-28 px-4 bg-[#090D16]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
              <span className="material-symbols-outlined text-[24px]">nfc</span>
            </div>
            <p className="text-[13px] text-slate-400 font-medium">
              Connecting to TapTrack database...
            </p>
          </div>
        ) : loadError || !overview || !history || !device ? (
          <div className="bg-[#0F172A] border border-rose-500/30 rounded-xl p-5 text-center space-y-3 mt-6">
            <span className="material-symbols-outlined text-rose-400 text-[28px]">error</span>
            <p className="text-[14px] text-white font-semibold">Connection Issue</p>
            <p className="text-[12px] text-slate-400">
              {loadError || 'Unable to load lecture session data.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadAllData();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-[12px] font-bold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                overview={overview}
                isTapping={isTapping}
                isTogglingPause={isTogglingPause}
                onSimulateTap={() => void handleSimulateTap()}
                onTogglePause={() => void handleTogglePause()}
                onOpenFacultyModal={() => setFacultyModalOpen(true)}
              />
            )}

            {activeTab === 'students' && (
              <StudentsView
                students={students}
                markingRoll={markingRoll}
                onMarkPresent={(roll) => void handleMarkStudentPresent(roll)}
                onOpenAddModal={() => setAddStudentModalOpen(true)}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                history={history}
                overview={overview}
                onSelectCourse={(code) => void handleSelectCourse(code)}
                onOpenDeviceTab={() => handleSwitchTab('device')}
                onExportCsv={handleExportCsv}
              />
            )}

            {activeTab === 'device' && (
              <DeviceView
                device={device}
                onUpdateDevice={(patch) => void handleUpdateDevice(patch)}
                onShowToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* TOAST */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-[12px] font-semibold shadow-2xl whitespace-nowrap"
        >
          {toastMsg}
        </div>
      )}

      {/* MODALS */}
      <FacultyModal open={facultyModalOpen} onClose={() => setFacultyModalOpen(false)} />
      <AddStudentModal
        open={addStudentModalOpen}
        isSaving={isSavingStudent}
        onClose={() => setAddStudentModalOpen(false)}
        onSave={handleAddStudent}
      />

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe bg-[#090D16]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
        <div className="h-16 max-w-lg mx-auto px-2 flex items-center justify-around">
          {(
            [
              { id: 'overview', icon: 'dashboard', label: 'Overview' },
              { id: 'students', icon: 'group', label: 'Students' },
              { id: 'history', icon: 'calendar_month', label: 'History' },
              { id: 'device', icon: 'sensors', label: 'Device' },
            ] as const
          ).map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSwitchTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  active ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
