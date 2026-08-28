import React from 'react';
import type { Manager } from '../types/creatorops';
import { Mail, Search, LogIn, ShieldCheck, LogOut, KeyRound, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  managers: Manager[];
  activeManager: Manager;
  setActiveManager: (manager: Manager) => void;
  openEmailDigestModal: () => void;
  openAuthModal?: () => void;
  openAccountSettingsModal?: () => void;
  openMobileSidebar?: () => void;
  overdueCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  managers,
  activeManager,
  setActiveManager,
  openEmailDigestModal,
  openAuthModal,
  openAccountSettingsModal,
  openMobileSidebar,
  overdueCount,
  searchQuery,
  setSearchQuery
}) => {
  const { user, agency, logout } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-subtle">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {openMobileSidebar && (
          <button
            onClick={openMobileSidebar}
            className="md:hidden p-1.5 text-ink-muted hover:text-ink bg-bg border border-border rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-sm sm:text-base font-bold text-ink tracking-tight truncate max-w-[140px] sm:max-w-none">{title}</h2>
        
        {/* Cloud Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{agency ? agency.name : 'Unseen Hours'}</span>
        </div>

        {overdueCount > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-warn-bg text-warn px-2.5 py-0.5 rounded-full border border-warn-border">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
            {overdueCount} {overdueCount === 1 ? 'overdue' : 'overdue'}
          </span>
        )}
      </div>

      {/* Center Search */}
      <div className="relative w-36 sm:w-64 md:w-72">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-8 sm:pl-9 pr-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent focus:bg-white transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Email Digest Button */}
        <button
          onClick={openEmailDigestModal}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent bg-bg hover:bg-slate-100 border border-border px-3 py-1.5 rounded-md transition-colors shadow-subtle"
          title="Send daily digest email of overdue items"
        >
          <Mail className="w-3.5 h-3.5 text-accent" />
          <span>Email Digest</span>
        </button>

        {/* Switch Agency / Login Button */}
        {openAuthModal && (
          <button
            onClick={openAuthModal}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-accent bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-md transition-colors shadow-subtle"
            title="Switch agency workspace or sign in"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Switch Workspace</span>
          </button>
        )}

        {/* Manager User Seat & Dropdown */}
        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-ink leading-none">{user ? user.name : activeManager.name}</p>
            <p className="text-[10px] text-accent font-bold leading-tight mt-0.5 uppercase">
              {user ? user.role : 'Manager'}
            </p>
          </div>

          <div className="relative group">
            <img
              src={user?.avatarUrl || activeManager.avatarUrl}
              alt={user?.name || activeManager.name}
              className="w-8 h-8 rounded-full border-2 border-accent/40 object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all shadow-subtle"
            />
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-modal hidden group-hover:block p-2 z-50 animate-in fade-in zoom-in duration-100">
              <div className="px-2 py-1 text-[10px] font-extrabold text-ink-muted uppercase border-b border-border/60 pb-1 mb-1">
                Active Agency Workspace
              </div>
              <div className="px-2 py-1 bg-slate-50 rounded-lg mb-2 text-xs font-extrabold text-ink flex items-center justify-between">
                <span className="truncate">{agency ? agency.name : 'Unseen Hours'}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">Cloud</span>
              </div>

              {/* Account Settings Option */}
              {openAccountSettingsModal && (
                <button
                  onClick={openAccountSettingsModal}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors mb-1"
                >
                  <KeyRound className="w-3.5 h-3.5 text-accent" />
                  <span>Account & Workspace Settings</span>
                </button>
              )}

              <div className="px-2 py-1 text-[10px] font-extrabold text-ink-muted uppercase border-t border-border/60 pt-1">
                Switch Team Seat
              </div>
              {managers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveManager(m)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                    activeManager.id === m.id ? 'bg-accent-light text-accent font-semibold' : 'text-ink hover:bg-slate-50'
                  }`}
                >
                  <img src={m.avatarUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                  <span className="truncate">{m.name}</span>
                </button>
              ))}

              <div className="border-t border-border/60 mt-1 pt-1 space-y-1">
                {openAuthModal && (
                  <button
                    onClick={openAuthModal}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-accent hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Create / Switch Agency</span>
                  </button>
                )}
                {user && (
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-warn hover:bg-warn-bg rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
