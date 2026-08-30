import React, { useState, useEffect } from 'react';
import { CloudSyncEngine } from '../lib/cloudSync';
import { useAuth } from '../context/AuthContext';
import { loadAgencyData } from '../lib/store';
import { X, Smartphone, Laptop, Check, RefreshCw, AlertCircle, Copy, Link2 } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshWorkspace: () => Promise<void>;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, onRefreshWorkspace }) => {
  const { user } = useAuth();
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSyncingLive, setIsSyncingLive] = useState(false);

  const currentCode = CloudSyncEngine.getSyncCode();

  // On Modal Open: Immediately Push Workspace & Code to Cloud Master Vault
  useEffect(() => {
    if (isOpen) {
      setIsSyncingLive(true);
      const email = user?.email || 'admin@unseenhours.com';
      const agency = loadAgencyData();
      CloudSyncEngine.pushWorkspace(email, user || { email, name: 'Agency Owner' }, agency)
        .finally(() => setIsSyncingLive(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsPairing(true);
    setErrorMsg('');
    setPairingSuccess(false);

    try {
      const pairedData = await CloudSyncEngine.pairDeviceWithSyncCode(inputCode);
      if (pairedData && pairedData.agency) {
        await onRefreshWorkspace();
        setPairingSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg('Invalid Sync Code. Please check the 6-character code on your computer and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not pair device. Please verify connection.');
    } finally {
      setIsPairing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cross-Device Cloud Sync</h3>
              <p className="text-xs text-slate-400">Link your phone and computer to the exact same live workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Box 1: Current Device Sync Code */}
          <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Laptop className="w-4 h-4" /> This Device's Sync Code
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                {isSyncingLive && <RefreshCw className="w-3 h-3 animate-spin" />}
                {isSyncingLive ? 'Syncing...' : 'Live & Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Type this 6-character code on your phone to instantly load this computer's workspace:
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-indigo-300">
                {currentCode}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs font-semibold uppercase text-slate-500 absolute">
              OR PAIR ANOTHER DEVICE
            </span>
          </div>

          {/* Box 2: Enter Sync Code from Computer */}
          <form onSubmit={handlePairDevice} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" /> Enter Sync Code from Your Computer
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="e.g. UH-8492"
                  maxLength={7}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase font-bold"
                />
                <button
                  type="submit"
                  disabled={isPairing || !inputCode.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {isPairing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  {isPairing ? 'Pairing...' : 'Link Device'}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {pairingSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Device Linked Successfully! Loading computer's workspace...</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
