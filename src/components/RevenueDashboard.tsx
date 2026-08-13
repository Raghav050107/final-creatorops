import React, { useState } from 'react';
import type { Agency } from '../types/creatorops';
import { TrendingUp, DollarSign, PieChart, Users, Filter } from 'lucide-react';
import { formatINR } from '../lib/format';

interface RevenueDashboardProps {
  agency: Agency;
}

export const RevenueDashboard: React.FC<RevenueDashboardProps> = ({ agency }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Filter agency deals by selected month
  const filteredDeals = agency.deals.filter(d => {
    if (selectedMonth === 'all') return true;
    const dealDate = d.targetLiveDate || d.createdAt;
    return dealDate.startsWith(selectedMonth);
  });

  const paidDeals = filteredDeals.filter(d => d.stage === 'Paid');
  const inProgressDeals = filteredDeals.filter(d => d.stage !== 'Paid');

  const closedGrossVolume = paidDeals.reduce((sum, d) => sum + d.value, 0);
  const pipelineGrossVolume = inProgressDeals.reduce((sum, d) => sum + d.value, 0);

  const closedAgencyCommission = paidDeals.reduce((sum, d) => {
    const cut = d.commissionPct + (d.unseenHoursCutPct || 0);
    return sum + (d.value * cut) / 100;
  }, 0);

  const pipelineAgencyCommission = inProgressDeals.reduce((sum, d) => {
    const cut = d.commissionPct + (d.unseenHoursCutPct || 0);
    return sum + (d.value * cut) / 100;
  }, 0);

  const creatorRevenueList = agency.creators.map(creator => {
    const creatorDeals = filteredDeals.filter(d => d.creatorIds.includes(creator.id));
    const paid = creatorDeals.filter(d => d.stage === 'Paid');
    const closedVal = paid.reduce((sum, d) => sum + d.value, 0);
    const creatorNetPayout = paid.reduce((sum, d) => {
      const cut = d.commissionPct + (d.unseenHoursCutPct || 0);
      return sum + (d.value * (100 - cut)) / 100;
    }, 0);
    const totalDealsCount = creatorDeals.length;

    return {
      creator,
      closedVal,
      creatorNetPayout,
      totalDealsCount
    };
  }).sort((a, b) => b.closedVal - a.closedVal);

  return (
    <div className="space-y-6">
      {/* Month Filter Header */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Unseen Hours Revenue & Commission Analytics</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Track month-by-month gross campaign volume, net Unseen Hours cut, and talent payouts.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-bg p-1.5 rounded-lg border border-border">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-xs font-bold text-ink-muted">Month Filter:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1 bg-white text-ink text-xs font-bold rounded-md border border-border focus:outline-none focus:border-accent"
          >
            <option value="all">All Time (Total History)</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-10">October 2026</option>
          </select>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-accent" />
            Closed Gross Deal Volume
          </span>
          <h4 className="text-2xl font-black text-ink font-mono tabular-nums">{formatINR(closedGrossVolume)}</h4>
          <p className="text-[10px] text-slate-400">
            {selectedMonth !== 'all' ? `Closed volume in ${selectedMonth}` : 'Total completed volume'}
          </p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Unseen Hours Cut Retained
          </span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono tabular-nums">{formatINR(closedAgencyCommission)}</h4>
          <p className="text-[10px] text-emerald-600 font-medium">Net agency revenue logged</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
            <PieChart className="w-3.5 h-3.5 text-indigo-600" />
            Pipeline Commission Expected
          </span>
          <h4 className="text-2xl font-black text-accent font-mono tabular-nums">{formatINR(pipelineAgencyCommission)}</h4>
          <p className="text-[10px] text-slate-400">From {formatINR(pipelineGrossVolume)} active pipeline</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-1">
          <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Active Creator Roster
          </span>
          <h4 className="text-2xl font-black text-ink font-mono tabular-nums">{agency.creators.length} Creators</h4>
          <p className="text-[10px] text-slate-400">Monetized talent pool</p>
        </div>
      </div>

      {/* Creator Revenue Breakdown Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-ink">
              Creator Revenue & Payout Distribution {selectedMonth !== 'all' ? `(${selectedMonth})` : ''}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">Earnings and Unseen Hours cut split across roster talent.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg text-ink-muted border-b border-border font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Creator Name</th>
                <th className="p-3">Total Deals ({selectedMonth})</th>
                <th className="p-3">Paid Gross Volume</th>
                <th className="p-3">Creator Net Payout</th>
                <th className="p-3">Unseen Hours Cut Retained</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {creatorRevenueList.map(({ creator, closedVal, creatorNetPayout, totalDealsCount }) => {
                const commissionRetained = closedVal - creatorNetPayout;
                return (
                  <tr key={creator.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={creator.photoUrl}
                          alt={creator.name}
                          className="w-7 h-7 rounded-full object-cover border"
                          style={{ borderColor: creator.colorCode }}
                        />
                        <div>
                          <span className="font-bold text-ink block">{creator.name}</span>
                          <span className="text-[10px] text-ink-muted">{creator.platforms.join(', ')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-ink">{totalDealsCount} deals</td>
                    <td className="p-3 font-bold font-mono text-ink tabular-nums">{formatINR(closedVal)}</td>
                    <td className="p-3 font-bold font-mono text-emerald-600 tabular-nums">{formatINR(creatorNetPayout)}</td>
                    <td className="p-3 font-bold font-mono text-accent tabular-nums">{formatINR(commissionRetained)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
