import React, { useState, useEffect } from 'react';
import { CloudSyncEngine, encodeWorkspaceToToken } from '../lib/cloudSync';
import { useAuth } from '../context/AuthContext';
import { loadAgencyData } from '../lib/store';
import { X, Smartphone, Check, RefreshCw, AlertCircle, Copy, Link2, Share2, Key } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshWorkspace: () => Promise<void>;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, onRefreshWorkspace }) => {
  const { user } = useAuth();
  const [inputCode, setInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isPairing, setIsPairing] = useState(false);
  const [pairingSuccess, setPairingSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSyncingLive, setIsSyncingLive] = useState(false);

  const agency = loadAgencyData();
  const currentCode = CloudSyncEngine.getSyncCode();
  const syncUrl = CloudSyncEngine.getOneClickSyncUrl(user, agency);
  const syncKey = encodeWorkspaceToToken(user, agency);

  // On Modal Open: Immediately Push Workspace & Code to Cloud Serverless Vault
  useEffect(() => {
    if (isOpen) {
      setIsSyncingLive(true);
      const email = user?.email || 'admin@unseenhours.com';
      CloudSyncEngine.pushWorkspace(email, user || { email, name: 'Agency Owner' }, agency)
        .finally(() => setIsSyncingLive(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsPairing(true);
    setErrorMsg('');
    setPairingSuccess(false);

    try {
      // If user pasted a full sync URL (e.g. https://creatoropsfinal.netlify.app/?syncToken=...)
      let cleanInput = inputCode.trim();
      if (cleanInput.includes('syncToken=')) {
        const urlObj = new URL(cleanInput);
        cleanInput = urlObj.searchParams.get('syncToken') || cleanInput;
      }

      const pairedData = await CloudSyncEngine.pairDeviceWithSyncCode(cleanInput);
      if (pairedData && pairedData.agency) {
        await onRefreshWorkspace();
        setPairingSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        setErrorMsg('Could not read sync code or key. Please copy the 1-Click Link or Pairing Key and try again.');
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
              <h3 className="text-base font-bold text-white">Cross-Device Workspace Sync</h3>
              <p className="text-xs text-slate-400">Link computer & phone to the exact same live agency workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* OPTION 1: 1-CLICK SYNC LINK */}
          <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Share2 className="w-4 h-4" /> Option 1: Instant 1-Click Sync Link
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                {isSyncingLive && <RefreshCw className="w-3 h-3 animate-spin" />}
                {isSyncingLive ? 'Syncing...' : 'Recommended'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2.5">
              Send this link to your phone via WhatsApp/Email. Opening it on your phone will instantly load this workspace:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={syncUrl}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 font-bold"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied Link!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* OPTION 2: PAIRING KEY & CODE */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-violet-400" /> Option 2: Pairing Key / Code
              </span>
              <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                Code: {currentCode}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={syncKey}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 truncate focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyKey}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey ? 'Copied Key!' : 'Copy Key'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-bold uppercase text-slate-500 absolute">
              ENTER LINK, KEY, OR CODE ON PHONE
            </span>
          </div>

          {/* INPUT FORM ON TARGET DEVICE */}
          <form onSubmit={handlePairDevice} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" /> Paste Link, Key, or Code Below:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Paste 1-Click Link, Key, or type UH-XXXX"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono tracking-wider text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-bold"
                />
                <button
                  type="submit"
                  disabled={isPairing || !inputCode.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  {isPairing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                  {isPairing ? 'Linking...' : 'Link Device'}
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
                <span>Workspace Linked Successfully! Loading workspace...</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
