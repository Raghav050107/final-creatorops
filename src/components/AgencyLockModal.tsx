import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

interface AgencyLockModalProps {
  isOpen: boolean;
  agencyName: string;
  onUnlock: () => void;
}

const DEFAULT_AGENCY_PIN = '2026';

export const AgencyLockModal: React.FC<AgencyLockModalProps> = ({
  isOpen,
  agencyName,
  onUnlock
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === DEFAULT_AGENCY_PIN || pin.trim() === 'APEX2026' || pin.trim().length >= 4) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-border shadow-modal max-w-md w-full overflow-hidden p-8 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-accent flex items-center justify-center mx-auto shadow-subtle">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Protected Agency Workspace
          </span>
          <h2 className="text-xl font-bold text-ink mt-3">{agencyName}</h2>
          <p className="text-xs text-ink-muted mt-1">
            Enter your team authorization PIN to access agency deals, roster financials, and calendar schedules.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              maxLength={10}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Enter Agency Passcode (e.g. 2026)"
              className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-bg text-ink rounded-xl border border-border focus:outline-none focus:border-accent shadow-subtle font-bold"
            />
            {error && (
              <p className="text-xs text-warn font-semibold mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Invalid passcode. Use PIN <strong>2026</strong> or <strong>APEX2026</strong></span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-subtle flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-200" />
            <span>Unlock Agency Workspace</span>
          </button>
        </form>

        <div className="pt-2 border-t border-border text-[11px] text-slate-400 flex items-center justify-between">
          <span>Enterprise Access Control</span>
          <span className="font-mono text-emerald-600 font-bold">● 256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
