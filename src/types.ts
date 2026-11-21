export type TabId = 'overview' | 'students' | 'history' | 'device';

export interface SessionLog {
  id: number;
  course_code: string;
  student_roll: string;
  student_name: string;
  initials: string;
  status: 'Marked' | 'Not Marked' | string;
  tapped_at: string;
}

export interface OverviewResponse {
  totalRoster: number;
  present: number;
  absent: number;
  rate: string;
  sessionPaused: boolean;
  readerPowerOn: boolean;
  logs: SessionLog[];
}

export interface StudentRecord {
  id: number;
  roll: string;
  name: string;
  initials: string;
  rfid_uid: string | null;
  attended_sessions: number;
  total_sessions: number;
  status: string;
}

export interface CourseRecord {
  code: string;
  short_code: string;
  name: string;
  room: string;
  total_sessions: number;
  avg_rate: number;
}

export interface HistorySession {
  id: number;
  course_code: string;
  session_date: string;
  room: string;
  topic: string;
  present_count: number;
  total_count: number;
  reader_meta: string;
}

export interface HistoryResponse {
  selectedCourse: string;
  courses: CourseRecord[];
  timeline: HistorySession[];
}

export type RangeMode = 'near' | 'mid' | 'wide';

export interface DeviceSettings {
  id: number;
  reader_name: string;
  power_on: number;
  range_mode: RangeMode;
  anti_collision: number;
  silent_haptic: number;
  buffer_kb: number;
  session_paused: number;
}
