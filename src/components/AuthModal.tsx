import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  ArrowRight, 
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchDemoUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
      onClose();
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white font-extrabold shadow-lg shadow-accent/40">
              UH
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide">
                CreatorOps Multi-Tenant Cloud
              </h3>
              <p className="text-[11px] text-slate-300">
                Enterprise Talent Management SaaS
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1.5 bg-bg border-b border-border">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
              mode === 'login' ? 'bg-surface text-ink shadow-subtle' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Sign In to Workspace
          </button>
          <button
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
              mode === 'register' ? 'bg-surface text-ink shadow-subtle' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Create New Agency
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                    Agency Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Talent Group"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@unseenhours.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to Agency</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Workspace & Start Free</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-3 border-t border-border">
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 text-center">
              Quick 1-Click Demo Logins (Unseen Hours)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('jordan')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-ink truncate">Jordan Miller</p>
                <p className="text-[9px] text-accent font-bold">Agency Owner</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sam')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-ink truncate">Sam Chen</p>
                <p className="text-[9px] text-emerald-700 font-bold">Campaign Manager</p>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
