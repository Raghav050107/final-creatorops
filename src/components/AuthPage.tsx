import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, switchDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(agencyName, name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (userType: 'jordan' | 'sam') => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoUser(userType);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Branding Banner */}
        <div className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-center border-b border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            UH
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">CreatorOps SaaS</h2>
          <p className="text-xs text-slate-400 mt-1">Enterprise Creator & Talent Management System</p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Agency
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
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
    </div>
  );
};
