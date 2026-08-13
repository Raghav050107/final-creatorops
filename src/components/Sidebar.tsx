import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  CalendarDays, 
  Users, 
  TrendingUp, 
  FileText, 
  Sparkles,
  ChevronRight,
  Video,
  Calculator
} from 'lucide-react';

export type NavTab = 'dashboard' | 'deals' | 'calendar' | 'analytics' | 'calculator' | 'creators' | 'revenue' | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  agencyName: string;
  overdueCount: number;
  openAddCreatorModal: () => void;
  openAddDealModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  overdueCount,
  openAddCreatorModal,
  openAddDealModal
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: overdueCount > 0 ? overdueCount : null, badgeColor: 'bg-warn text-white' },
    { id: 'deals' as NavTab, label: 'Deals Kanban', icon: Kanban },
    { id: 'calendar' as NavTab, label: 'Unified Calendar', icon: CalendarDays, highlight: true },
    { id: 'analytics' as NavTab, label: 'Channel Analytics', icon: Video, badge: 'Real API' },
    { id: 'calculator' as NavTab, label: 'Proposal Calculator', icon: Calculator, badge: 'Tool' },
    { id: 'creators' as NavTab, label: 'Creator Roster', icon: Users },
    { id: 'revenue' as NavTab, label: 'Revenue Analytics', icon: TrendingUp },
    { id: 'reports' as NavTab, label: 'Brand Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0 z-30 select-none">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold shadow-subtle">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-ink text-sm leading-snug tracking-tight">Unseen Hours</h1>
            <p className="text-[11px] text-accent font-semibold truncate max-w-[140px]">Talent Operations</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 flex flex-col gap-2 border-b border-border bg-bg/50">
        <button
          onClick={openAddDealModal}
          className="w-full py-2 px-3 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md shadow-subtle flex items-center justify-between transition-colors"
        >
          <span>+ New Brand Deal</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-80" />
        </button>

        <button
          onClick={openAddCreatorModal}
          className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 text-ink text-xs font-medium border border-border rounded-md shadow-subtle flex items-center justify-between transition-colors text-left"
        >
          <span>+ Add Creator</span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          Workspace Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-accent-light text-accent font-semibold shadow-subtle'
                  : 'text-ink-muted hover:text-ink hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="text-[9px] font-bold bg-indigo-100 text-accent px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Core
                  </span>
                )}
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border bg-bg/30">
        <div className="p-2.5 bg-white border border-border rounded-lg text-[11px] space-y-1">
          <div className="flex items-center justify-between text-ink-muted font-medium">
            <span>Roster Status</span>
            <span className="text-emerald-600 font-bold">● Active</span>
          </div>
          <p className="text-[10px] text-slate-400">All deliverables synced across creators</p>
        </div>
      </div>
    </aside>
  );
};
