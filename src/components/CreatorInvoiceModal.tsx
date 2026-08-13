import React, { useState, useEffect } from 'react';
import type { Agency } from '../types/creatorops';
import { X, Printer, Receipt, Sparkles, AlertCircle } from 'lucide-react';
import { formatINR } from '../lib/format';

interface CreatorInvoiceModalProps {
  agency: Agency;
  isOpen: boolean;
  onClose: () => void;
  initialCreatorId?: string;
  initialDealId?: string;
}

export const CreatorInvoiceModal: React.FC<CreatorInvoiceModalProps> = ({
  agency,
  isOpen,
  onClose,
  initialCreatorId,
  initialDealId
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    initialCreatorId || agency.creators[0]?.id || ''
  );
  
  const creatorDeals = agency.deals.filter(d => d.creatorIds.includes(selectedCreatorId));

  const [selectedDealId, setSelectedDealId] = useState<string>(
    initialDealId && creatorDeals.some(d => d.id === initialDealId)
      ? initialDealId
      : (creatorDeals[0]?.id || '')
  );

  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer (NEFT/RTGS)' | 'UPI Direct' | 'Wire Transfer'>('Bank Transfer (NEFT/RTGS)');
  const [transactionRef] = useState(`TXN_${Date.now().toString().slice(-6)}`);
  const [invoiceDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialCreatorId) {
      setSelectedCreatorId(initialCreatorId);
      const filtered = agency.deals.filter(d => d.creatorIds.includes(initialCreatorId));
      if (filtered.length > 0) {
        setSelectedDealId(initialDealId && filtered.some(d => d.id === initialDealId) ? initialDealId : filtered[0].id);
      } else {
        setSelectedDealId('');
      }
    }
  }, [initialCreatorId, initialDealId, agency.deals]);

  if (!isOpen) return null;

  const creator = agency.creators.find(c => c.id === selectedCreatorId);
  const deal = agency.deals.find(d => d.id === selectedDealId);

  const grossDealValue = deal ? deal.value : 0;
  const commissionPct = deal ? deal.commissionPct : 15;
  const unseenCutPct = deal ? (deal.unseenHoursCutPct || 0) : 0;
  const totalCutPct = commissionPct + unseenCutPct;
  const agencyCutAmount = (grossDealValue * totalCutPct) / 100;
  const netCreatorPayout = grossDealValue - agencyCutAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-2xl w-full overflow-hidden my-auto flex flex-col">
        {/* Modal Controls Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-ink">
              Payout Remittance Invoice — <span className="text-accent">{creator?.name}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!deal}
              className="py-1.5 px-3.5 bg-accent hover:bg-accent-hover disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection Form Bar */}
        <div className="p-4 bg-bg border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">
              Select Campaign Deal ({creator?.name} Deals Only)
            </label>
            {creatorDeals.length === 0 ? (
              <p className="text-xs text-warn font-semibold py-1.5 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>No active brand deals assigned to {creator?.name}</span>
              </p>
            ) : (
              <select
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent"
              >
                {creatorDeals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.brandName} ({formatINR(d.value)}) — Stage: {d.stage}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-ink-muted mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent"
            >
              <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI Direct">UPI Direct</option>
              <option value="Wire Transfer">Wire Transfer</option>
            </select>
          </div>
        </div>

        {/* PRINTABLE REMITTANCE INVOICE SHEET */}
        {creatorDeals.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <AlertCircle className="w-8 h-8 text-warn mx-auto" />
            <p className="font-bold text-slate-700 text-sm">{creator?.name} has no assigned brand deals yet.</p>
            <p className="text-slate-500">Assign {creator?.name} to a brand sponsorship deal in the Kanban board to generate a payout remittance invoice.</p>
          </div>
        ) : (
          <div className="p-8 bg-white text-slate-900 space-y-6 font-sans id-printable-invoice">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
              <div>
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">UNSEEN HOURS AGENCY</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Talent Management & Brand Activation Hub</p>
                <p className="text-xs text-slate-500">Bangalore • Mumbai • New Delhi</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Remittance Advice Statement
                </span>
                <p className="text-xs font-mono font-bold text-slate-700 mt-2">Statement #: INV-{transactionRef}</p>
                <p className="text-xs text-slate-500 font-mono">Date: {invoiceDate}</p>
              </div>
            </div>

            {/* Parties Meta Grid */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Remitter Agency:
                </span>
                <p className="font-bold text-slate-900 text-sm">Unseen Hours</p>
                <p className="text-slate-600 mt-0.5">Finance & Talent Operations</p>
                <p className="text-slate-600 font-mono">payouts@unseenhours.com</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Beneficiary (Creator Roster):
                </span>
                <p className="font-bold text-slate-900 text-sm">{creator?.name || 'Creator'}</p>
                <p className="text-slate-600 mt-0.5">
                  Primary Handle: <span className="font-mono">{creator?.handles.youtube || creator?.handles.instagram || `@${creator?.name}`}</span>
                </p>
                <p className="text-slate-600 font-mono">Payment Mode: {paymentMethod}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Campaign Activation / Brand Sponsorship</th>
                    <th className="p-3 text-right">Gross Deal Amount</th>
                    <th className="p-3 text-right">Unseen Hours Cut ({totalCutPct}%)</th>
                    <th className="p-3 text-right">Net Creator Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{deal?.brandName || 'Brand Sponsorship'} Campaign</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Stage: {deal?.stage || 'Paid'} • Target Live: {deal?.targetLiveDate || 'Completed'}
                      </p>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {formatINR(grossDealValue)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-red-600">
                      -{formatINR(agencyCutAmount)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-emerald-700 text-sm">
                      {formatINR(netCreatorPayout)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net Calculation Callout */}
            <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Total Net Payout Transferred to {creator?.name}
                </span>
                <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                  Ref: {transactionRef} • Status: <strong className="text-emerald-800">Approved for Remittance</strong>
                </p>
              </div>
              <div className="text-2xl font-black text-emerald-800 font-mono">
                {formatINR(netCreatorPayout)}
              </div>
            </div>

            {/* Signatures Footer */}
            <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">Authorized Unseen Hours Manager Signature</p>
                <div className="h-10 border-b border-slate-300 w-48 mt-2 flex items-center">
                  <span className="font-mono text-[11px] text-accent italic font-bold">Jordan Miller (Senior Talent Manager)</span>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <p>Generated via Unseen Hours Agency Hub</p>
                <p className="font-mono">Confidential Talent Financial Record</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
