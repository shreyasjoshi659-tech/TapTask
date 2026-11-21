import { useState } from 'react';

interface FacultyModalProps {
  open: boolean;
  onClose: () => void;
}

export function FacultyModal({ open, onClose }: FacultyModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0F172A] rounded-2xl p-5 border border-slate-700/80 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-[18px] text-white font-semibold">Faculty Profile</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="text-center space-y-1">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500 text-slate-950 font-bold text-xl flex items-center justify-center">
            AV
          </div>
          <h4 className="text-[18px] text-white font-bold">Prof. Alistair Vance</h4>
          <p className="text-[12px] text-emerald-400 font-semibold">
            Department Head, Faculty of Computing
          </p>
          <p className="text-[12px] text-slate-400">
            alistair.vance@university.edu • Room 402
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[13px] font-semibold cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface AddStudentModalProps {
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: { name: string; roll: string; rfid_uid?: string }) => Promise<void>;
}

export function AddStudentModal({ open, isSaving, onClose, onSave }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedRoll = roll.trim().toUpperCase();
    const trimmedRfid = rfidUid.trim().toUpperCase();

    if (!trimmedName || !trimmedRoll) {
      setError('Please enter both student name and roll number.');
      return;
    }

    setError('');
    try {
      await onSave({
        name: trimmedName,
        roll: trimmedRoll,
        rfid_uid: trimmedRfid || undefined,
      });
      setName('');
      setRoll('');
      setRfidUid('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll student.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#0F172A] rounded-2xl p-5 border border-slate-700/80 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] text-white font-semibold">Enroll New Student</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Full Name (e.g. Priya Nair)"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
        />
        <input
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
          type="text"
          placeholder="Roll Number (e.g. 21CS063)"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
        />
        <input
          value={rfidUid}
          onChange={(e) => setRfidUid(e.target.value)}
          type="text"
          placeholder="RFID UID (optional, e.g. RFID-1063)"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
        />

        {error && <p className="text-[12px] text-rose-400 font-medium">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-sm font-bold cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save to DB'}
          </button>
        </div>
      </form>
    </div>
  );
}
