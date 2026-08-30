import React, { useState, useRef, useEffect } from 'react';
import type { Manager } from '../types/creatorops';
import { Mail, Search, LogOut, KeyRound, Menu, Smartphone } from 'lucide-react';
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
  openSyncModal?: () => void;
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
  openAccountSettingsModal,
  openMobileSidebar,
  openSyncModal,
  searchQuery,
  setSearchQuery
}) => {
  const { user, agency, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between shadow-subtle shrink-0 font-sans z-30">
      {/* Mobile Hamburger Button */}
      <div className="flex items-center gap-2">
        {openMobileSidebar && (
          <button
            onClick={openMobileSidebar}
            className="md:hidden p-1.5 text-ink-muted hover:text-ink hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-sm sm:text-base font-bold text-ink truncate max-w-[140px] sm:max-w-xs">{title}</h2>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6 relative hidden sm:block">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search creators, brand deals, status..."
          className="w-full pl-8 sm:pl-9 pr-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent focus:bg-white transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Device Sync Button */}
        {openSyncModal && (
          <button
            onClick={openSyncModal}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1.5 rounded-lg transition-all shadow-subtle"
            title="Link computer and phone via 6-digit sync code"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Sync Devices</span>
          </button>
        )}

        {/* Email Digest Button */}
        <button
          onClick={openEmailDigestModal}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent bg-bg hover:bg-slate-100 border border-border px-3 py-1.5 rounded-md transition-colors shadow-subtle"
          title="Send daily digest email of overdue items"
        >
          <Mail className="w-3.5 h-3.5 text-accent" />
          <span className="hidden md:inline">Email Digest</span>
        </button>

        {/* Manager User Seat & Dropdown */}
        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-right hidden sm:block focus:outline-none"
          >
            <p className="text-xs font-bold text-ink leading-none">{user ? user.name : activeManager.name}</p>
            <p className="text-[10px] text-accent font-bold leading-tight mt-0.5 uppercase">
              {user ? user.role : activeManager.role}
            </p>
          </button>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative focus:outline-none"
          >
            <img
              src={user?.avatarUrl || activeManager.avatarUrl}
              alt={user?.name || activeManager.name}
              className="w-8 h-8 rounded-full border-2 border-accent/40 object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all shadow-subtle"
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-xl shadow-modal p-2.5 z-50 animate-in fade-in zoom-in duration-150">
              <div className="px-2 py-1 text-[10px] font-extrabold text-ink-muted uppercase border-b border-border/60 pb-1 mb-1.5">
                Active Agency Workspace
              </div>
              <div className="px-2 py-1.5 bg-slate-50 rounded-lg mb-2 text-xs font-extrabold text-ink flex items-center justify-between">
                <span className="truncate">{agency ? agency.name : 'Unseen Hours'}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">Cloud Synced</span>
              </div>

              {openSyncModal && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    openSyncModal();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 rounded-lg transition-colors mb-1 text-left"
                >
                  <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Sync Phone / Pair Device</span>
                </button>
              )}

              {openAccountSettingsModal && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    openAccountSettingsModal();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mb-1 text-left"
                >
                  <KeyRound className="w-4 h-4 text-accent shrink-0" />
                  <span>Account & Workspace Settings</span>
                </button>
              )}

              <div className="px-2 py-1 text-[10px] font-extrabold text-ink-muted uppercase border-t border-border/60 pt-1.5">
                Switch Team Seat
              </div>
              {managers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveManager(m);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                    activeManager.id === m.id ? 'bg-accent-light text-accent font-semibold' : 'text-ink hover:bg-slate-50'
                  }`}
                >
                  <img src={m.avatarUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                  <span className="truncate">{m.name}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-2 border-t border-border/60 pt-2 text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
