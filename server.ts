import Database from 'better-sqlite3';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// --- SQLITE DATABASE INITIALIZATION ---
const dbPath = path.join(__dirname, 'taptrack.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    code TEXT PRIMARY KEY,
    short_code TEXT NOT NULL,
    name TEXT NOT NULL,
    room TEXT NOT NULL,
    total_sessions INTEGER DEFAULT 30,
    avg_rate INTEGER DEFAULT 90
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    rfid_uid TEXT UNIQUE,
    attended_sessions INTEGER DEFAULT 28,
    total_sessions INTEGER DEFAULT 32,
    status TEXT DEFAULT 'Good Standing'
  );

  CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT NOT NULL,
    student_roll TEXT NOT NULL,
    student_name TEXT NOT NULL,
    initials TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Marked',
    tapped_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS history_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT NOT NULL,
    session_date TEXT NOT NULL,
    room TEXT NOT NULL,
    topic TEXT NOT NULL,
    present_count INTEGER NOT NULL,
    total_count INTEGER NOT NULL,
    reader_meta TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS device_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    reader_name TEXT DEFAULT 'Reader TT-Pro-04',
    power_on INTEGER DEFAULT 1,
    range_mode TEXT DEFAULT 'mid',
    anti_collision INTEGER DEFAULT 1,
    silent_haptic INTEGER DEFAULT 1,
    buffer_kb INTEGER DEFAULT 128,
    session_paused INTEGER DEFAULT 0
  );
`);

// Seed Courses
const courseCountRow = db.prepare('SELECT COUNT(*) as c FROM courses').get() as { c: number };
if (courseCountRow.c === 0) {
  const insertCourse = db.prepare(`
    INSERT INTO courses (code, short_code, name, room, total_sessions, avg_rate)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const courses: [string, string, string, string, number, number][] = [
    ['CS-204', 'CS', 'Programming for Problem Solving', 'LH-3B', 30, 92],
    ['MA-201', 'MA', 'Advanced Calculus & Diff Eq', 'LH-2A', 30, 90],
    ['EE-101', 'EE', 'Electrical Technology', 'LH-1C', 28, 93],
    ['PH-102', 'PH', 'Classical & Quantum Physics', 'LH-4B', 28, 84],
    ['ME-205', 'ME', 'Design Innovation & DIY', 'Lab-2', 20, 94],
    ['BT-103', 'BT', 'Biology for Engineers', 'LH-1A', 24, 87],
    ['HS-104', 'HS', 'Professional Communication', 'LH-3A', 24, 90],
  ];
  for (const c of courses) {
    insertCourse.run(...c);
  }
}

// Seed Students
const studentCountRow = db.prepare('SELECT COUNT(*) as c FROM students').get() as { c: number };
if (studentCountRow.c === 0) {
  const insertStudent = db.prepare(`
    INSERT INTO students (roll, name, initials, rfid_uid, attended_sessions, total_sessions, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const students: [string, string, string, string, number, number, string][] = [
    ['21CS019', 'Emily Watson', 'EW', 'RFID-1019', 29, 32, 'Good Standing'],
    ['21CS004', 'Aarav Sharma', 'AS', 'RFID-1004', 28, 32, 'Good Standing'],
    ['21CS055', 'Devansh Verma', 'DV', 'RFID-1055', 22, 32, 'Shortage Warning'],
    ['21CS011', 'Sophia Chen', 'SC', 'RFID-1011', 31, 32, 'Exemplary'],
    ['21CS033', 'Marcus Brody', 'MB', 'RFID-1033', 23, 32, 'Attendance Low'],
    ['21CS042', 'Rohan Patel', 'RP', 'RFID-1042', 27, 32, 'Good Standing'],
  ];
  for (const s of students) {
    insertStudent.run(...s);
  }
}

// Seed Live Session Logs (inserted oldest-first so ORDER BY id DESC shows Aarav Sharma first)
const logCountRow = db.prepare('SELECT COUNT(*) as c FROM session_logs').get() as { c: number };
if (logCountRow.c === 0) {
  const insertLog = db.prepare(`
    INSERT INTO session_logs (course_code, student_roll, student_name, initials, status, tapped_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const logs: [string, string, string, string, string, string][] = [
    ['CS-204', '21CS55', 'Devansh Verma', 'DV', 'Not Marked', 'Tap Pending'],
    ['CS-204', '21CS11', 'Sophia Chen', 'SC', 'Marked', '10:35:00 AM'],
    ['CS-204', '21CS42', 'Rohan Patel', 'RP', 'Marked', '10:39:10 AM'],
    ['CS-204', '21CS19', 'Emily Watson', 'EW', 'Marked', '10:41:50 AM'],
    ['CS-204', '21CS04', 'Aarav Sharma', 'AS', 'Marked', '10:42:15 AM'],
  ];
  for (const l of logs) {
    insertLog.run(...l);
  }
}

// Seed History Sessions
const histCountRow = db.prepare('SELECT COUNT(*) as c FROM history_sessions').get() as { c: number };
if (histCountRow.c === 0) {
  const insertHist = db.prepare(`
    INSERT INTO history_sessions (course_code, session_date, room, topic, present_count, total_count, reader_meta)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const history: [string, string, string, string, number, number, string][] = [
    [
      'CS-204',
      'Oct 24, 2024 · Today',
      'LH-3B',
      'Topic: Multi-dimensional Arrays & Pointer Arithmetic',
      58,
      64,
      'NFC Reader Logged: 10:02 AM - 10:14 AM (98% Tap speed)',
    ],
    [
      'CS-204',
      'Oct 22, 2024 · Tuesday',
      'LH-3B',
      'Topic: Structs, Memory Alignment, & Unions',
      60,
      64,
      'NFC Reader Logged: 10:01 AM - 10:12 AM · Synchronized',
    ],
    [
      'CS-204',
      'Oct 17, 2024 · Thursday',
      'LH-3B',
      'Topic: Dynamic Heap Allocation (malloc / free)',
      52,
      64,
      'NFC Reader Logged: 10:05 AM - 10:18 AM · 12 Absentees',
    ],
    [
      'MA-201',
      'Oct 23, 2024 · Wednesday',
      'LH-2A',
      'Topic: Laplace Transforms & Convolution Theorem',
      57,
      64,
      'NFC Reader Logged: 09:00 AM - 09:11 AM · Synchronized',
    ],
    [
      'EE-101',
      'Oct 21, 2024 · Monday',
      'LH-1C',
      'Topic: Three-Phase Induction Circuits',
      60,
      64,
      'NFC Reader Logged: 02:00 PM - 02:13 PM · Synchronized',
    ],
    [
      'PH-102',
      'Oct 18, 2024 · Friday',
      'LH-4B',
      'Topic: Wave-Particle Duality & Schrodinger Equation',
      54,
      64,
      'NFC Reader Logged: 11:30 AM - 11:44 AM · 10 Absentees',
    ],
  ];
  for (const h of history) {
    insertHist.run(...h);
  }
}

db.prepare('INSERT OR IGNORE INTO device_settings (id) VALUES (1)').run();

// --- HELPERS ---
function deriveStanding(attended: number, total: number): string {
  const pct = total > 0 ? (attended / total) * 100 : 0;
  if (pct >= 95) return 'Exemplary';
  if (pct >= 75) return 'Good Standing';
  if (pct >= 70) return 'Attendance Low';
  return 'Shortage Warning';
}

function escapeCsvCell(value: string | number): string {
  const raw = String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function formatNowTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// --- EXPRESS SERVER ---
const app = express();
app.use(express.json({ limit: '64kb' }));

// GET /api/overview
app.get('/api/overview', (_req, res) => {
  const logs = db
    .prepare('SELECT * FROM session_logs ORDER BY id DESC LIMIT 30')
    .all() as Array<{ status: string }>;
  const settings = db
    .prepare('SELECT * FROM device_settings WHERE id = 1')
    .get() as { session_paused: number; power_on: number };

  const totalMarkedRow = db
    .prepare("SELECT COUNT(*) as c FROM session_logs WHERE status = 'Marked'")
    .get() as { c: number };

  // Base 54 + marked logs (4 seeded Marked logs => initial 58/64)
  const totalRoster = 64;
  const present = Math.min(totalRoster, 54 + totalMarkedRow.c);
  const absent = Math.max(0, totalRoster - present);
  const rate = ((present / totalRoster) * 100).toFixed(1);

  res.json({
    totalRoster,
    present,
    absent,
    rate,
    sessionPaused: Boolean(settings.session_paused),
    readerPowerOn: Boolean(settings.power_on),
    logs,
  });
});

// POST /api/tap
app.post('/api/tap', (req, res) => {
  const settings = db
    .prepare('SELECT session_paused, power_on FROM device_settings WHERE id = 1')
    .get() as { session_paused: number; power_on: number };

  if (!settings.power_on) {
    res.status(409).json({ error: 'RFID reader is powered off. Enable it in Device settings.' });
    return;
  }

  if (settings.session_paused) {
    res.status(409).json({ error: 'Session is paused. Resume reader first.' });
    return;
  }

  const body = req.body as { name?: unknown; roll?: unknown; initials?: unknown };
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const roll = typeof body.roll === 'string' ? body.roll.trim().toUpperCase() : '';

  if (!name || name.length > 80 || !roll || roll.length > 24) {
    res.status(400).json({ error: 'Valid student name and roll number are required.' });
    return;
  }

  const rawInitials =
    typeof body.initials === 'string' && body.initials.trim()
      ? body.initials.trim().toUpperCase().slice(0, 2)
      : name
          .split(/\s+/)
          .map((part) => part[0] || '')
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'ST';

  const now = formatNowTime();
  const info = db
    .prepare(`
      INSERT INTO session_logs (course_code, student_roll, student_name, initials, status, tapped_at)
      VALUES ('CS-204', ?, ?, ?, 'Marked', ?)
    `)
    .run(roll, name, rawInitials, now);

  res.status(201).json({
    id: Number(info.lastInsertRowid),
    course_code: 'CS-204',
    student_roll: roll,
    student_name: name,
    initials: rawInitials,
    status: 'Marked',
    tapped_at: now,
  });
});

// POST /api/session/toggle-pause
app.post('/api/session/toggle-pause', (_req, res) => {
  const current = db
    .prepare('SELECT session_paused FROM device_settings WHERE id = 1')
    .get() as { session_paused: number };
  const next = current.session_paused ? 0 : 1;
  db.prepare('UPDATE device_settings SET session_paused = ? WHERE id = 1').run(next);
  res.json({ sessionPaused: Boolean(next) });
});

// GET /api/students
app.get('/api/students', (_req, res) => {
  const students = db.prepare('SELECT * FROM students ORDER BY id ASC').all();
  res.json(students);
});

// POST /api/students
app.post('/api/students', (req, res) => {
  const body = req.body as { name?: unknown; roll?: unknown; rfid_uid?: unknown };
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const roll = typeof body.roll === 'string' ? body.roll.trim().toUpperCase() : '';
  const customRfid = typeof body.rfid_uid === 'string' ? body.rfid_uid.trim().toUpperCase() : '';

  if (!name || name.length > 80 || !roll || roll.length > 24) {
    res.status(400).json({ error: 'Name and Roll number are required.' });
    return;
  }

  if (customRfid && customRfid.length > 32) {
    res.status(400).json({ error: 'RFID UID must be 32 characters or fewer.' });
    return;
  }

  const initials =
    name
      .split(/\s+/)
      .map((part) => part[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ST';
  const rfidUid = customRfid || `RFID-${Date.now().toString().slice(-4)}`;

  try {
    const info = db
      .prepare(`
        INSERT INTO students (roll, name, initials, rfid_uid, attended_sessions, total_sessions, status)
        VALUES (?, ?, ?, ?, 28, 32, 'Good Standing')
      `)
      .run(roll, name, initials, rfidUid);
    const created = db.prepare('SELECT * FROM students WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch {
    res.status(409).json({ error: 'Roll number or RFID UID already exists.' });
  }
});

// POST /api/students/:roll/mark-present
app.post('/api/students/:roll/mark-present', (req, res) => {
  const roll = String(req.params.roll || '').trim().toUpperCase();
  if (!roll || roll.length > 24) {
    res.status(400).json({ error: 'Invalid roll number.' });
    return;
  }

  const student = db
    .prepare('SELECT * FROM students WHERE roll = ?')
    .get(roll) as
    | {
        id: number;
        roll: string;
        name: string;
        initials: string;
        attended_sessions: number;
        total_sessions: number;
      }
    | undefined;

  if (!student) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const newAttended = Math.min(student.total_sessions, student.attended_sessions + 1);
  const newStatus = deriveStanding(newAttended, student.total_sessions);

  db.prepare('UPDATE students SET attended_sessions = ?, status = ? WHERE roll = ?').run(
    newAttended,
    newStatus,
    roll,
  );

  const now = formatNowTime();
  db.prepare(`
    INSERT INTO session_logs (course_code, student_roll, student_name, initials, status, tapped_at)
    VALUES ('CS-204', ?, ?, ?, 'Marked', ?)
  `).run(student.roll, student.name, student.initials, now);

  const updated = db.prepare('SELECT * FROM students WHERE roll = ?').get(roll);
  res.json(updated);
});

// GET /api/history
app.get('/api/history', (req, res) => {
  const rawCourse = typeof req.query.course === 'string' ? req.query.course.trim().toUpperCase() : 'CS-204';
  const courseCode = /^[A-Z]{2,4}-\d{3}$/.test(rawCourse) ? rawCourse : 'CS-204';

  const courses = db.prepare('SELECT * FROM courses ORDER BY code ASC').all();
  const timeline = db
    .prepare('SELECT * FROM history_sessions WHERE course_code = ? ORDER BY id ASC')
    .all(courseCode);

  res.json({ selectedCourse: courseCode, courses, timeline });
});

// GET /api/history/export
app.get('/api/history/export', (_req, res) => {
  const logs = db
    .prepare('SELECT * FROM session_logs ORDER BY id DESC')
    .all() as Array<{
    id: number;
    course_code: string;
    student_roll: string;
    student_name: string;
    status: string;
    tapped_at: string;
  }>;

  const lines = [
    'ID,Course,Roll,Student Name,Status,Timestamp',
    ...logs.map((l) =>
      [
        escapeCsvCell(l.id),
        escapeCsvCell(l.course_code),
        escapeCsvCell(l.student_roll),
        escapeCsvCell(l.student_name),
        escapeCsvCell(l.status),
        escapeCsvCell(l.tapped_at),
      ].join(','),
    ),
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="CS-204-attendance-logs.csv"');
  res.send(lines.join('\n'));
});

// GET /api/device
app.get('/api/device', (_req, res) => {
  const settings = db.prepare('SELECT * FROM device_settings WHERE id = 1').get();
  res.json(settings);
});

// PATCH /api/device
app.patch('/api/device', (req, res) => {
  const body = req.body as Record<string, unknown>;
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.power_on !== undefined) {
    const val = body.power_on === true || body.power_on === 1 ? 1 : 0;
    updates.push('power_on = ?');
    values.push(val);
  }
  if (body.range_mode !== undefined) {
    if (body.range_mode !== 'near' && body.range_mode !== 'mid' && body.range_mode !== 'wide') {
      res.status(400).json({ error: 'Invalid range_mode value.' });
      return;
    }
    updates.push('range_mode = ?');
    values.push(body.range_mode);
  }
  if (body.anti_collision !== undefined) {
    const val = body.anti_collision === true || body.anti_collision === 1 ? 1 : 0;
    updates.push('anti_collision = ?');
    values.push(val);
  }
  if (body.silent_haptic !== undefined) {
    const val = body.silent_haptic === true || body.silent_haptic === 1 ? 1 : 0;
    updates.push('silent_haptic = ?');
    values.push(val);
  }
  if (body.buffer_kb !== undefined) {
    const parsed = Number(body.buffer_kb);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 4096) {
      res.status(400).json({ error: 'Invalid buffer_kb value.' });
      return;
    }
    updates.push('buffer_kb = ?');
    values.push(parsed);
  }

  if (updates.length > 0) {
    db.prepare(`UPDATE device_settings SET ${updates.join(', ')} WHERE id = 1`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM device_settings WHERE id = 1').get();
  res.json(updated);
});

// --- FRONTEND SERVING (VITE DEV MIDDLEWARE OR PRODUCTION DIST) ---
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TapTrack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TapTrack server:', err);
  process.exit(1);
});
