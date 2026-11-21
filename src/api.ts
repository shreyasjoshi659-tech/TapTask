import type {
  DeviceSettings,
  HistoryResponse,
  OverviewResponse,
  RangeMode,
  SessionLog,
  StudentRecord,
} from './types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchOverview(): Promise<OverviewResponse> {
  const res = await fetch('/api/overview');
  return parseJson<OverviewResponse>(res);
}

export async function recordTap(student: {
  name: string;
  roll: string;
  initials: string;
}): Promise<SessionLog> {
  const res = await fetch('/api/tap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  });
  return parseJson<SessionLog>(res);
}

export async function toggleSessionPause(): Promise<{ sessionPaused: boolean }> {
  const res = await fetch('/api/session/toggle-pause', { method: 'POST' });
  return parseJson<{ sessionPaused: boolean }>(res);
}

export async function fetchStudents(): Promise<StudentRecord[]> {
  const res = await fetch('/api/students');
  return parseJson<StudentRecord[]>(res);
}

export async function createStudent(payload: {
  name: string;
  roll: string;
  rfid_uid?: string;
}): Promise<StudentRecord> {
  const res = await fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson<StudentRecord>(res);
}

export async function markStudentPresent(roll: string): Promise<StudentRecord> {
  const res = await fetch(`/api/students/${encodeURIComponent(roll)}/mark-present`, {
    method: 'POST',
  });
  return parseJson<StudentRecord>(res);
}

export async function fetchHistory(course = 'CS-204'): Promise<HistoryResponse> {
  const res = await fetch(`/api/history?course=${encodeURIComponent(course)}`);
  return parseJson<HistoryResponse>(res);
}

export async function fetchDeviceSettings(): Promise<DeviceSettings> {
  const res = await fetch('/api/device');
  return parseJson<DeviceSettings>(res);
}

export async function updateDeviceSettings(patch: {
  power_on?: number;
  range_mode?: RangeMode;
  anti_collision?: number;
  silent_haptic?: number;
  buffer_kb?: number;
}): Promise<DeviceSettings> {
  const res = await fetch('/api/device', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return parseJson<DeviceSettings>(res);
}
