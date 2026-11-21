import type { DeviceSettings, RangeMode } from '../types';

const RANGE_LABELS: Record<RangeMode, string> = {
  near: 'Near-Field (3 cm)',
  mid: 'Mid-Hall (8 cm)',
  wide: 'Wide Sweep (22 cm)',
};

interface DeviceViewProps {
  device: DeviceSettings;
  onUpdateDevice: (patch: {
    power_on?: number;
    range_mode?: RangeMode;
    anti_collision?: number;
    silent_haptic?: number;
    buffer_kb?: number;
  }) => void;
  onShowToast: (msg: string) => void;
}

export function DeviceView({ device, onUpdateDevice, onShowToast }: DeviceViewProps) {
  const powerOn = Boolean(device.power_on);
  const silentHaptic = Boolean(device.silent_haptic);
  const antiCollision = Boolean(device.anti_collision);

  return (
    <section className="flex flex-col w-full space-y-4">
      {/* Hardware Telemetry Card */}
      <div className="w-full rounded-2xl bg-surface-container p-4 space-y-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center">
              <span
                className={`material-symbols-outlined text-[24px] ${
                  powerOn ? 'text-primary' : 'text-outline'
                }`}
              >
                sensors
              </span>
              {powerOn && (
                <>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping opacity-75" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
                </>
              )}
            </div>
            <div>
              <h2 className="text-[18px] text-on-surface font-bold">{device.reader_name}</h2>
              <span className="text-[11px] text-on-surface-variant">
                ISO/IEC 14443 Type A/B · Mifare
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer mt-1">
            <input
              checked={powerOn}
              onChange={(e) => onUpdateDevice({ power_on: e.target.checked ? 1 : 0 })}
              type="checkbox"
              className="sr-only peer"
              aria-label="Toggle RFID reader power"
            />
            <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:bg-primary-container transition-colors relative">
              <div
                className={`absolute top-[2px] left-[2px] bg-on-primary-container rounded-full h-5 w-5 transition-transform ${
                  powerOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-surface-container-low p-3">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
              Signal RSSI
            </span>
            <span className="text-[14px] text-primary font-bold">
              {powerOn ? '-48 dBm' : 'Offline'}
            </span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
              Hall Dock Power
            </span>
            <span className="text-[14px] text-secondary font-bold">94%</span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
              Response Time
            </span>
            <span className="text-[14px] text-on-surface font-bold">
              {powerOn ? '32 ms' : '—'}
            </span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3">
            <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
              Buffer Cache
            </span>
            <span className="text-[14px] text-on-surface font-bold">{device.buffer_kb} KB</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onShowToast(
              powerOn
                ? 'Antenna Field OK · Loop Impedance 50.2Ω'
                : 'Reader powered off — enable power toggle first',
            )
          }
          className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary text-[12px] font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">cell_tower</span>
          <span>Simulate Antenna Test / Ping Pulse</span>
        </button>
      </div>

      {/* Antenna Calibration */}
      <div className="w-full rounded-2xl bg-surface-container p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] text-on-surface font-semibold">Antenna Calibration</h3>
          <span className="text-[11px] text-secondary font-bold px-2 py-0.5 rounded-full bg-surface-container-low">
            {RANGE_LABELS[device.range_mode]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-container-low">
          {(
            [
              { id: 'near', label: 'Near-Field' },
              { id: 'mid', label: 'Mid-Hall' },
              { id: 'wide', label: 'Wide Sweep' },
            ] as const
          ).map((option) => {
            const active = device.range_mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onUpdateDevice({ range_mode: option.id });
                  onShowToast(`Calibrated to ${RANGE_LABELS[option.id]}`);
                }}
                className={`py-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-surface-container text-secondary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
          <div>
            <span className="text-[13px] text-on-surface font-semibold block">
              Lecture Silent Haptic Mode
            </span>
            <span className="text-[10px] text-on-surface-variant">
              Mutes piezo buzzers; soft tactile pulse
            </span>
          </div>
          <input
            checked={silentHaptic}
            onChange={(e) => onUpdateDevice({ silent_haptic: e.target.checked ? 1 : 0 })}
            type="checkbox"
            className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            aria-label="Toggle Lecture Silent Haptic Mode"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
          <div>
            <span className="text-[13px] text-on-surface font-semibold block">
              Anti-Collision Multi-Tap
            </span>
            <span className="text-[10px] text-on-surface-variant">
              Prevents duplicate scans within 1.5s window
            </span>
          </div>
          <input
            checked={antiCollision}
            onChange={(e) => onUpdateDevice({ anti_collision: e.target.checked ? 1 : 0 })}
            type="checkbox"
            className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
            aria-label="Toggle Anti-Collision Multi-Tap"
          />
        </div>
      </div>

      {/* Firmware & Diagnostics */}
      <div className="w-full rounded-2xl bg-surface-container p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] text-on-surface font-semibold">Firmware &amp; Diagnostics</h3>
          <span className="text-[10px] text-primary font-semibold px-2 py-0.5 rounded-full bg-surface-container-low">
            v4.2.8-nocturne
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onShowToast('All 18 hardware subsystems verified green')}
            className="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span>
            <span>Self-Diagnostic</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateDevice({ buffer_kb: 0 });
              onShowToast('Reader buffer cache cleared (0 KB)');
            }}
            className="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              cleaning_services
            </span>
            <span>Clear Cache</span>
          </button>
        </div>
      </div>
    </section>
  );
}
