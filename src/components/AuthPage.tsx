import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SyncModal } from './SyncModal';
import { 
  Building2, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  Smartphone,
  Link2,
  Sparkles
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, switchDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [agencyName, setAgencyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!agencyName.trim()) throw new Error('Agency Name is required');
        if (!name.trim()) throw new Error('Your Name is required');
        await register(agencyName, name, email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (userType: 'jordan' | 'sam') => {
    setError('');
    setLoading(true);
    try {
      await switchDemoUser(userType);
    } catch (err: any) {
      setError(err?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Brand Top Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">CreatorOps Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Unseen Hours Talent Agency Platform</p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'login'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
              mode === 'register'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Register Agency
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Agency / Company Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="e.g. Unseen Hours"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@unseenhours.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Agency Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Device Pairing Short-Cut Button */}
        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Link Phone via 6-Digit Sync Code</span>
            <Link2 className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Logins:</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('jordan')}
              disabled={loading}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-white">Agency Owner</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">admin@unseenhours.com</p>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('sam')}
              disabled={loading}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-all"
            >
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white">Operations Manager</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">sam@unseenhours.com</p>
            </button>
          </div>
        </div>
      </div>

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onRefreshWorkspace={async () => {
          window.location.reload();
        }}
      />
    </div>
  );
};
