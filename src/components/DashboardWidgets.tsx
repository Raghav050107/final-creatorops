import React from 'react';
import type { Agency, Deliverable, Deal, Creator, DeliverableStatus } from '../types/creatorops';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Sparkles, 
  ArrowUpRight,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { fetchYouTubeMetrics } from '../lib/youtube';
import { formatINR } from '../lib/format';

interface DashboardWidgetsProps {
  agency: Agency;
  onUpdateDeliverableStatus: (deliverableId: string, status: DeliverableStatus) => void;
  onUpdateDeliverableMetrics: (deliverableId: string, views: number, likes: number, comments: number) => void;
  onDeleteDeliverable?: (deliverableId: string) => void;
  openAddDealModal: () => void;
  openAddCreatorModal: () => void;
  setActiveTab: (tab: any) => void;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  agency,
  onUpdateDeliverableStatus,
  onUpdateDeliverableMetrics,
  onDeleteDeliverable,
  openAddDealModal,
  openAddCreatorModal,
  setActiveTab
}) => {
  const [loadingFetchId, setLoadingFetchId] = React.useState<string | null>(null);

  const activeDeals = agency.deals.filter(d => d.stage !== 'Paid');
  const totalPipelineValue = agency.deals.reduce((sum, d) => sum + d.value, 0);
  const totalClosedValue = agency.deals.filter(d => d.stage === 'Paid').reduce((sum, d) => sum + d.value, 0);
  
  const todayStr = new Date().toISOString().split('T')[0];

  const overdueDeliverables = agency.deliverables.filter(
    d => d.status !== 'Live' && (d.targetLiveDate || d.dueDate) < todayStr
  ).sort((a, b) => (a.targetLiveDate || a.dueDate).localeCompare(b.targetLiveDate || b.dueDate));

  const dueSoonDeliverables = agency.deliverables.filter(
    d => d.status !== 'Live' && (d.targetLiveDate || d.dueDate) >= todayStr
  ).sort((a, b) => (a.targetLiveDate || a.dueDate).localeCompare(b.targetLiveDate || b.dueDate));

  const getCreator = (creatorId?: string): Creator | undefined => {
    if (!creatorId) return undefined;
    return agency.creators.find(c => c.id === creatorId);
  };

  const getDeal = (dealId?: string): Deal | undefined => {
    if (!dealId) return undefined;
    return agency.deals.find(d => d.id === dealId);
  };

  const handleQuickYouTubeSync = async (deliv: Deliverable) => {
    if (!deliv.liveUrl) return;
    setLoadingFetchId(deliv.id);
    try {
      const metrics = await fetchYouTubeMetrics(deliv.liveUrl);
      onUpdateDeliverableMetrics(deliv.id, metrics.views, metrics.likes, metrics.comments);
    } catch (e) {
      alert('Could not auto-fetch metrics. Make sure it is a valid YouTube URL.');
    } finally {
      setLoadingFetchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-muted font-medium">Active Brand Deals</p>
            <h3 className="text-2xl font-bold text-ink mt-1 tabular-nums">{activeDeals.length}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{formatINR(totalPipelineValue)} in pipeline</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-accent flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-muted font-medium">Overdue Deliverables</p>
            <h3 className="text-2xl font-bold text-warn mt-1 tabular-nums">{overdueDeliverables.length}</h3>
            <p className="text-[11px] text-warn-border mt-1">Requires immediate action</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-warn-bg text-warn flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-muted font-medium">Paid & Closed Volume</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{formatINR(totalClosedValue)}</h3>
            <p className="text-[11px] text-emerald-600 mt-1">Agency commission logged</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-muted font-medium">Active Roster</p>
            <h3 className="text-2xl font-bold text-ink mt-1 tabular-nums">{agency.creators.length} Creators</h3>
            <p className="text-[11px] text-slate-400 mt-1">Multi-platform channels</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warn" />
                <h3 className="text-sm font-bold text-ink">Urgent Deliverables & Live Schedule Tracker</h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Unified Calendar</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-border">
              {overdueDeliverables.length > 0 && (
                <div className="p-4 bg-warn-bg/30">
                  <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-warn uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Overdue Action Required ({overdueDeliverables.length})</span>
                  </div>
                  <div className="space-y-2.5">
                    {overdueDeliverables.map((deliv) => {
                      const creator = getCreator(deliv.creatorId);
                      const deal = getDeal(deliv.dealId);
                      return (
                        <div
                          key={deliv.id}
                          className="bg-white p-3.5 rounded-lg border border-warn-border shadow-subtle flex items-center justify-between gap-4 hover:border-warn transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-9 h-9 rounded-full flex-shrink-0 border-2 border-white shadow-subtle overflow-hidden relative"
                              style={{ borderColor: creator?.colorCode || '#4F46E5' }}
                            >
                              <img src={creator?.photoUrl} alt={creator?.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-ink truncate">{deliv.title}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                                  {deliv.platform}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-muted">
                                <span className="font-semibold text-ink">{creator ? creator.name : 'Unassigned'}</span>
                                <span>•</span>
                                <span>{deal ? deal.brandName : 'Organic Solo'}</span>
                                <span>•</span>
                                <span className="text-warn font-semibold">Target Live: {deliv.targetLiveDate || deliv.dueDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <select
                              value={deliv.status}
                              onChange={(e) => onUpdateDeliverableStatus(deliv.id, e.target.value as DeliverableStatus)}
                              className="text-xs bg-slate-50 border border-border rounded-md px-2 py-1 font-medium text-ink focus:outline-none focus:border-accent"
                            >
                              <option value="Not started">Not started</option>
                              <option value="Draft">Draft</option>
                              <option value="Submitted">Submitted</option>
                              <option value="Approved">Approved</option>
                              <option value="Live">Live</option>
                            </select>

                            {deliv.platform === 'YouTube' && deliv.liveUrl && (
                              <button
                                onClick={() => handleQuickYouTubeSync(deliv)}
                                disabled={loadingFetchId === deliv.id}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md border border-red-200 transition-colors"
                                title="Auto-fetch YouTube Stats"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${loadingFetchId === deliv.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}

                            {onDeleteDeliverable && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove "${deliv.title}"?`)) onDeleteDeliverable(deliv.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-warn hover:bg-warn-bg rounded-md transition-colors"
                                title="Delete deliverable"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4">
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                  Upcoming Scheduled Content ({dueSoonDeliverables.length})
                </div>
                {dueSoonDeliverables.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No upcoming deliverables scheduled.</p>
                ) : (
                  <div className="space-y-2.5">
                    {dueSoonDeliverables.slice(0, 4).map((deliv) => {
                      const creator = getCreator(deliv.creatorId);
                      const deal = getDeal(deliv.dealId);
                      return (
                        <div
                          key={deliv.id}
                          className="bg-white p-3 rounded-lg border border-border shadow-subtle flex items-center justify-between gap-4 hover:border-accent transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full flex-shrink-0 border-2 overflow-hidden"
                              style={{ borderColor: creator?.colorCode || '#4F46E5' }}
                            >
                              <img src={creator?.photoUrl} alt={creator?.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-ink truncate">{deliv.title}</p>
                              <p className="text-[11px] text-ink-muted mt-0.5">
                                {creator ? creator.name : 'Unassigned'} • {deal ? deal.brandName : 'Organic Solo'} • Target Live: {deliv.targetLiveDate || deliv.dueDate}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            deliv.status === 'Live' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            deliv.status === 'Approved' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {deliv.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-ink text-white p-5 rounded-xl shadow-card relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            <h3 className="text-sm font-bold tracking-tight">Agency Quick Actions</h3>
            <p className="text-xs text-indigo-200 mt-1">Run campaign deals & manage roster deadlines.</p>
            <div className="mt-4 space-y-2 relative z-10">
              <button
                onClick={openAddDealModal}
                className="w-full py-2 px-3 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle text-center transition-colors"
              >
                + New Brand Sponsorship Deal
              </button>
              <button
                onClick={openAddCreatorModal}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg text-center transition-colors backdrop-blur-sm"
              >
                + Add Creator to Roster
              </button>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Creator Roster ({agency.creators.length})</h3>
              <button
                onClick={() => setActiveTab('creators')}
                className="text-xs text-accent hover:underline font-semibold"
              >
                Manage All
              </button>
            </div>
            <div className="space-y-3">
              {agency.creators.map((c) => {
                const creatorDeals = agency.deals.filter(d => d.creatorIds.includes(c.id));
                return (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full border-2 overflow-hidden"
                        style={{ borderColor: c.colorCode }}
                      >
                        <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink leading-none">{c.name}</p>
                        <p className="text-[10px] text-ink-muted mt-1">{c.platforms.join(', ')}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {creatorDeals.length} deals
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
