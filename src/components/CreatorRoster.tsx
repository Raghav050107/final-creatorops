import React, { useState } from 'react';
import type { Agency, Creator, Deal, PaymentStatusType, CreatorRepresentationType } from '../types/creatorops';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Receipt,
  Filter,
  Shield,
  Globe
} from 'lucide-react';
import { formatINR } from '../lib/format';

interface CreatorRosterProps {
  agency: Agency;
  onAddCreator: (creator: Omit<Creator, 'id' | 'createdAt'>) => void;
  onUpdateCreator: (creator: Creator) => void;
  onDeleteCreator: (creatorId: string) => void;
  onOpenInvoiceModal?: (creatorId: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

const PAYMENT_STATUS_COLORS: Record<PaymentStatusType, string> = {
  'Invoice Pending': 'bg-amber-50 text-amber-800 border-amber-200',
  'Invoice Sent': 'bg-blue-50 text-blue-800 border-blue-200',
  'Payment Processing': 'bg-purple-50 text-purple-800 border-purple-200',
  'Paid & Completed': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Overdue': 'bg-red-50 text-red-800 border-red-200'
};

export const CreatorRoster: React.FC<CreatorRosterProps> = ({
  agency,
  onDeleteCreator,
  onOpenInvoiceModal,
  setIsAddModalOpen
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [representationFilter, setRepresentationFilter] = useState<'all' | CreatorRepresentationType>('all');
  const [printingCreator, setPrintingCreator] = useState<Creator | null>(null);

  const filteredCreators = agency.creators.filter(c => {
    if (representationFilter !== 'all' && c.representationType !== representationFilter) return false;
    return true;
  });

  const getCreatorDeals = (creatorId: string): Deal[] => {
    let creatorDeals = agency.deals.filter(d => d.creatorIds.includes(creatorId));
    
    if (selectedMonth !== 'all') {
      creatorDeals = creatorDeals.filter(d => {
        const dealDate = d.targetLiveDate || d.createdAt;
        return dealDate.startsWith(selectedMonth);
      });
    }
    return creatorDeals;
  };

  const handlePrintStatement = (creator: Creator) => {
    setPrintingCreator(creator);
    setTimeout(() => {
      window.print();
      setPrintingCreator(null);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Banner */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Creator Roster & Earnings Performance Directory</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Filter in-house exclusive roster talent vs non-exclusive roster, view active deals, commercials, and payment status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Representation Filter Pill */}
          <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border">
            <button
              onClick={() => setRepresentationFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                representationFilter === 'all' ? 'bg-white text-ink shadow-subtle' : 'text-ink-muted'
              }`}
            >
              All Roster ({agency.creators.length})
            </button>
            <button
              onClick={() => setRepresentationFilter('In-House Exclusive')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                representationFilter === 'In-House Exclusive' ? 'bg-accent text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              🔒 In-House Exclusive
            </button>
            <button
              onClick={() => setRepresentationFilter('Non-Exclusive / Other')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                representationFilter === 'Non-Exclusive / Other' ? 'bg-slate-900 text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              🌐 Non-Exclusive
            </button>
          </div>

          {/* Month-Wise Stats Filter */}
          <div className="flex items-center gap-1.5 bg-bg p-1.5 rounded-lg border border-border">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <span className="text-xs font-bold text-ink-muted">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2 py-0.5 bg-white text-ink text-xs font-bold rounded border border-border focus:outline-none focus:border-accent"
            >
              <option value="all">All Months</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-10">October 2026</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-1.5 px-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Roster Talent</span>
          </button>
        </div>
      </div>

      {/* Roster Cards List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCreators.map((creator) => {
          const creatorDeals = getCreatorDeals(creator.id);
          const activeDeals = creatorDeals.filter(d => d.stage !== 'Paid');
          const isExclusive = creator.representationType === 'In-House Exclusive';

          const totalGrossCommercials = creatorDeals.reduce((sum, d) => sum + d.value, 0);
          
          const totalNetPayoutReceived = creatorDeals.reduce((sum, d) => {
            const cutPct = d.commissionPct + (d.unseenHoursCutPct || 0);
            return sum + (d.value * (100 - cutPct)) / 100;
          }, 0);

          return (
            <div
              key={creator.id}
              className="bg-surface rounded-xl border border-border shadow-card overflow-hidden hover:shadow-modal transition-all space-y-4 p-6"
            >
              {/* Creator Profile Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-full border-2 overflow-hidden shadow-subtle flex-shrink-0"
                    style={{ borderColor: creator.colorCode }}
                  >
                    <img src={creator.photoUrl} alt={creator.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-ink">{creator.name}</h4>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: creator.colorCode }} />
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        isExclusive ? 'bg-indigo-50 text-accent border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isExclusive ? <Shield className="w-3 h-3 text-accent" /> : <Globe className="w-3 h-3 text-slate-500" />}
                        <span>{creator.representationType || 'In-House Exclusive'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {creator.platforms.map(p => (
                        <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overall Summary Pills */}
                <div className="flex items-center gap-3 bg-bg p-2.5 rounded-xl border border-border text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-ink-muted uppercase block">Gross Commercials</span>
                    <span className="font-extrabold text-ink font-mono tabular-nums">{formatINR(totalGrossCommercials)}</span>
                  </div>
                  <div className="border-l border-border pl-3">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Net Payout Received</span>
                    <span className="font-extrabold text-emerald-600 font-mono tabular-nums">{formatINR(totalNetPayoutReceived)}</span>
                  </div>
                  <div className="border-l border-border pl-3">
                    <span className="text-[10px] font-bold text-accent uppercase block">Active Deals</span>
                    <span className="font-bold text-accent font-mono tabular-nums">{activeDeals.length} Deals</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintStatement(creator)}
                    className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-border text-ink text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-subtle"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Statement</span>
                  </button>

                  {onOpenInvoiceModal && (
                    <button
                      onClick={() => onOpenInvoiceModal(creator.id)}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-subtle"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Payout Invoice</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${creator.name} from roster?`)) onDeleteCreator(creator.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-warn hover:bg-warn-bg rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DETAILED BRAND DEALS TABLE FOR THIS CREATOR */}
              <div>
                <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Assigned Sponsorship Deals Breakdown ({creatorDeals.length})</span>
                  {selectedMonth !== 'all' && (
                    <span className="text-[11px] text-accent font-semibold">Filtered by: {selectedMonth}</span>
                  )}
                </h5>

                {creatorDeals.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border rounded-xl text-slate-400 text-xs">
                    No deals found for {creator.name} {selectedMonth !== 'all' ? `in ${selectedMonth}` : ''}.
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden shadow-subtle">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-bg text-ink-muted font-bold uppercase text-[10px] tracking-wider border-b border-border">
                        <tr>
                          <th className="p-3">Brand Deal</th>
                          <th className="p-3">Stage & Status</th>
                          <th className="p-3 text-right">Gross Commercial</th>
                          <th className="p-3 text-right">Unseen Hours Cut</th>
                          <th className="p-3 text-right">Net Creator Share</th>
                          <th className="p-3">Payment Status & Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-white">
                        {creatorDeals.map((deal) => {
                          const cutPct = deal.commissionPct + (deal.unseenHoursCutPct || 0);
                          const unseenCutVal = (deal.value * cutPct) / 100;
                          const netPayoutVal = deal.value - unseenCutVal;
                          const statusType: PaymentStatusType = deal.paymentStatus || (deal.stage === 'Paid' ? 'Paid & Completed' : 'Invoice Sent');

                          return (
                            <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <span className="font-bold text-ink block">{deal.brandName}</span>
                                <span className="text-[10px] text-ink-muted font-mono">
                                  Target Live: {deal.targetLiveDate || 'TBD'}
                                </span>
                              </td>

                              <td className="p-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  deal.stage === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  deal.stage === 'In Progress' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {deal.stage}
                                </span>
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-ink tabular-nums">
                                {formatINR(deal.value)}
                              </td>

                              <td className="p-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                                <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  {cutPct}% (-{formatINR(unseenCutVal)})
                                </span>
                              </td>

                              <td className="p-3 text-right font-mono font-extrabold text-emerald-700 text-sm tabular-nums">
                                {formatINR(netPayoutVal)}
                              </td>

                              <td className="p-3">
                                <div className="space-y-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${PAYMENT_STATUS_COLORS[statusType]}`}>
                                    {statusType}
                                  </span>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {deal.invoiceSentDate && <div>Invoice: {deal.invoiceSentDate}</div>}
                                    {deal.paymentDueDate && <div className="font-semibold text-slate-700">Due: {deal.paymentDueDate}</div>}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PRINTABLE CREATOR STATEMENT OVERLAY */}
      {printingCreator && (
        <div className="fixed inset-0 bg-white z-[100] p-8 text-slate-900 font-sans print:block hidden">
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-extrabold">{agency.name} — Talent Performance & Commercials Statement</h1>
              <p className="text-xs text-slate-600">Roster Creator: <strong className="text-slate-900">{printingCreator.name}</strong> ({printingCreator.representationType || 'In-House Exclusive'})</p>
              <p className="text-xs text-slate-500">Statement Date: {new Date().toLocaleDateString()}</p>
            </div>
            <img src={printingCreator.photoUrl} alt={printingCreator.name} className="w-12 h-12 rounded-full border object-cover" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Campaign Commercials & Payment Status Log</h3>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border">Brand Deal</th>
                  <th className="p-2 border">Stage</th>
                  <th className="p-2 border text-right">Gross Commercial</th>
                  <th className="p-2 border text-right">Unseen Hours Cut</th>
                  <th className="p-2 border text-right">Net Creator Share</th>
                  <th className="p-2 border">Payment Status & Deadline</th>
                </tr>
              </thead>
              <tbody>
                {getCreatorDeals(printingCreator.id).map(d => {
                  const cut = (d.value * (d.commissionPct + (d.unseenHoursCutPct || 0))) / 100;
                  const net = d.value - cut;
                  return (
                    <tr key={d.id}>
                      <td className="p-2 border font-bold">{d.brandName}</td>
                      <td className="p-2 border">{d.stage}</td>
                      <td className="p-2 border text-right font-mono">{formatINR(d.value)}</td>
                      <td className="p-2 border text-right font-mono text-amber-700">-{formatINR(cut)}</td>
                      <td className="p-2 border text-right font-mono font-bold text-emerald-700">{formatINR(net)}</td>
                      <td className="p-2 border">
                        <div>{d.paymentStatus || 'Invoice Sent'}</div>
                        <div className="text-[10px] text-slate-500">Due: {d.paymentDueDate || 'Net 30'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
