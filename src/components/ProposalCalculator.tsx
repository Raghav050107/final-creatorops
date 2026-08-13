import React, { useState } from 'react';
import type { Agency, Creator, DeliverableType, PlatformType } from '../types/creatorops';
import { 
  Calculator, 
  Copy, 
  Check, 
  Plus, 
  Sparkles, 
  Receipt, 
  Trash2
} from 'lucide-react';
import { formatINR } from '../lib/format';

interface DeliverableSelection {
  id: string;
  creatorId: string;
  title: string;
  type: DeliverableType;
  platform: PlatformType;
  unitPrice: number;
  quantity: number;
}

interface ProposalCalculatorProps {
  agency: Agency;
  onSaveDealFromProposal: (dealData: { brandName: string; value: number; commissionPct: number; creatorIds: string[]; targetLiveDate: string }) => void;
}

const DELIVERABLE_PRESETS: { label: string; type: DeliverableType; platform: PlatformType; defaultPrice: number }[] = [
  { label: 'YouTube Dedicated Video', type: 'video', platform: 'YouTube', defaultPrice: 75000 },
  { label: 'YouTube 60s Integration', type: 'video', platform: 'YouTube', defaultPrice: 30000 },
  { label: 'Instagram Reel', type: 'reel', platform: 'Instagram', defaultPrice: 25000 },
  { label: 'TikTok Short', type: 'short', platform: 'TikTok', defaultPrice: 28000 },
  { label: 'X Thread / Post', type: 'post', platform: 'X', defaultPrice: 8000 },
  { label: 'Podcast Sponsorship', type: 'podcast', platform: 'YouTube', defaultPrice: 60000 },
  { label: 'Livestream Integration', type: 'livestream', platform: 'Twitch', defaultPrice: 20000 },
];

export const ProposalCalculator: React.FC<ProposalCalculatorProps> = ({
  agency,
  onSaveDealFromProposal
}) => {
  const [brandName, setBrandName] = useState('');
  const [commissionPct, setCommissionPct] = useState<number>(15);
  const [bundleDiscountPct, setBundleDiscountPct] = useState<number>(0);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(agency.creators[0]?.id || '');
  
  const [deliverables, setDeliverables] = useState<DeliverableSelection[]>([
    {
      id: 'sel_1',
      creatorId: agency.creators[0]?.id || '',
      title: 'YouTube 60s Integration',
      type: 'video',
      platform: 'YouTube',
      unitPrice: 30000,
      quantity: 1
    }
  ]);

  const [copied, setCopied] = useState(false);
  const [converted, setConverted] = useState(false);

  const getCreator = (creatorId: string): Creator | undefined => {
    return agency.creators.find(c => c.id === creatorId);
  };

  const handleAddPreset = (preset: typeof DELIVERABLE_PRESETS[0]) => {
    const creator = getCreator(selectedCreatorId);
    if (!creator) return;

    let inferredPrice = preset.defaultPrice;
    if (preset.label.includes('Dedicated') && creator.rateNotes.includes('₹')) {
      const match = creator.rateNotes.match(/Dedicated[^₹]*₹([\d,]+)/i);
      if (match) inferredPrice = parseInt(match[1].replace(/,/g, ''), 10);
    } else if (preset.label.includes('Integration') && creator.rateNotes.includes('₹')) {
      const match = creator.rateNotes.match(/Integration[^₹]*₹([\d,]+)/i);
      if (match) inferredPrice = parseInt(match[1].replace(/,/g, ''), 10);
    } else if (preset.label.includes('Reel') && creator.rateNotes.includes('₹')) {
      const match = creator.rateNotes.match(/Reel[^₹]*₹([\d,]+)/i);
      if (match) inferredPrice = parseInt(match[1].replace(/,/g, ''), 10);
    }

    const newItem: DeliverableSelection = {
      id: `sel_${Date.now()}_${Math.random().toString().slice(-3)}`,
      creatorId: selectedCreatorId,
      title: `${preset.label} (${creator.name})`,
      type: preset.type,
      platform: preset.platform,
      unitPrice: inferredPrice,
      quantity: 1
    };

    setDeliverables([...deliverables, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setDeliverables(deliverables.filter(item => item.id !== id));
  };

  const handleUpdatePrice = (id: string, newPrice: number) => {
    setDeliverables(deliverables.map(item => item.id === id ? { ...item, unitPrice: newPrice } : item));
  };

  const handleUpdateQty = (id: string, newQty: number) => {
    setDeliverables(deliverables.map(item => item.id === id ? { ...item, quantity: Math.max(1, newQty) } : item));
  };

  // Base rate set is the gross quote for the brand. Agency cut (Unseen Hours Cut) is deducted from the gross rate.
  const grossBaseTotal = deliverables.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discountAmount = (grossBaseTotal * bundleDiscountPct) / 100;
  const finalBrandQuote = grossBaseTotal - discountAmount;

  const agencyCutAmount = (finalBrandQuote * commissionPct) / 100;
  const netCreatorPayout = finalBrandQuote - agencyCutAmount;

  const uniqueCreatorIds = Array.from(new Set(deliverables.map(d => d.creatorId)));
  const uniqueCreators = uniqueCreatorIds.map(id => getCreator(id)).filter(Boolean) as Creator[];

  const generateProposalText = (): string => {
    const brandLabel = brandName ? brandName : '[Brand Name]';
    let text = `🎯 CAMPAIGN PROPOSAL FOR ${brandLabel.toUpperCase()}\n`;
    text += `==========================================\n\n`;
    text += `Participating Roster Creators: ${uniqueCreators.map(c => c.name).join(', ')}\n\n`;
    text += `Included Campaign Deliverables:\n`;

    deliverables.forEach((item, index) => {
      const creator = getCreator(item.creatorId);
      text += `${index + 1}. ${item.title} (${creator?.name}) — ${formatINR(item.unitPrice * item.quantity)}\n`;
    });

    text += `\n------------------------------------------\n`;
    if (bundleDiscountPct > 0) {
      text += `Multi-Creator Package Discount (${bundleDiscountPct}%): -${formatINR(discountAmount)}\n`;
    }
    text += `Total Campaign Investment Quote: ${formatINR(finalBrandQuote)}\n`;
    text += `(Includes full production, publishing & Unseen Hours Agency rights)\n\n`;
    text += `Please let us know if you would like to proceed with locking in target live dates!`;

    return text;
  };

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(generateProposalText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConvertToDeal = () => {
    if (deliverables.length === 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    onSaveDealFromProposal({
      brandName: brandName.trim() || 'New Sponsored Client',
      value: finalBrandQuote,
      commissionPct,
      creatorIds: uniqueCreatorIds,
      targetLiveDate: todayStr
    });
    setConverted(true);
    setTimeout(() => setConverted(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-5 rounded-xl border border-border shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-ink">Creator Package & Proposal Calculator</h3>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Base rates set the brand quote. Unseen Hours agency cut is deducted directly from the gross rate (leaving net creator share).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyProposal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-ink border border-border text-xs font-semibold rounded-lg shadow-subtle transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Proposal Copied!' : 'Copy Proposal Text'}</span>
          </button>

          <button
            onClick={handleConvertToDeal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle transition-colors"
          >
            {converted ? <Check className="w-4 h-4 text-emerald-300" /> : <Plus className="w-4 h-4" />}
            <span>{converted ? 'Deal Created in Kanban!' : 'Convert to Brand Deal'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deliverable Builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">1. Campaign Client & Creator Specs</h4>
              <span className="text-[11px] font-semibold text-accent">{uniqueCreators.length} Creators Selected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">Brand / Client Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Nike India, Puma, Boat, EA Sports"
                  className="w-full px-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">Select Creator to Add Items</label>
                <select
                  value={selectedCreatorId}
                  onChange={(e) => setSelectedCreatorId(e.target.value)}
                  className="w-full px-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent font-semibold"
                >
                  {agency.creators.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.handles.youtube || c.handles.instagram || `@${c.name}`})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Presets Grid */}
            <div>
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-2">
                Click Preset to Add Line Item for {getCreator(selectedCreatorId)?.name}:
              </span>
              <div className="flex flex-wrap gap-2">
                {DELIVERABLE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleAddPreset(preset)}
                    className="py-1.5 px-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-border rounded-lg text-xs font-medium text-ink flex items-center gap-1.5 transition-all shadow-subtle"
                  >
                    <Plus className="w-3.5 h-3.5 text-accent" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deliverables List Table */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Selected Package Line Items ({deliverables.length})</h4>

              {deliverables.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl text-slate-400 text-xs">
                  No deliverables added yet. Click presets above to add items to your proposal package.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {deliverables.map((item) => {
                    const creator = getCreator(item.creatorId);
                    return (
                      <div
                        key={item.id}
                        className="bg-bg p-3.5 rounded-xl border border-border shadow-subtle flex flex-wrap items-center justify-between gap-3 hover:border-accent transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={creator?.photoUrl}
                            alt={creator?.name}
                            className="w-8 h-8 rounded-full object-cover border"
                            style={{ borderColor: creator?.colorCode }}
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-ink truncate block">{item.title}</span>
                            <span className="text-[10px] text-ink-muted">
                              {creator?.name} • {item.platform} ({item.type})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQty(item.id, Number(e.target.value))}
                              className="w-12 px-2 py-1 bg-white border border-border rounded text-xs text-center font-bold"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">Gross Rate (₹):</span>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                              className="w-24 px-2 py-1 bg-white border border-border rounded text-xs font-mono font-bold text-ink"
                            />
                          </div>

                          <span className="text-xs font-bold text-ink font-mono min-w-[70px] text-right">
                            {formatINR(item.unitPrice * item.quantity)}
                          </span>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-warn rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Inclusive Pricing Breakdown */}
        <div className="space-y-4">
          <div className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider border-b border-border pb-2 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-accent" />
              <span>Brand Quote & Unseen Hours Cut</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-ink-muted">
                <span>Base Rate Subtotal:</span>
                <span className="font-bold text-ink font-mono">{formatINR(grossBaseTotal)}</span>
              </div>

              <div>
                <div className="flex justify-between items-center text-ink-muted mb-1">
                  <span>Multi-Creator Package Discount:</span>
                  <span className="font-bold text-purple-600 font-mono">
                    {bundleDiscountPct}% (-{formatINR(discountAmount)})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="5"
                  value={bundleDiscountPct}
                  onChange={(e) => setBundleDiscountPct(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              {/* Brand Final Quote Callout */}
              <div className="pt-2 pb-2 border-t border-border space-y-1 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                  Final Quote to Brand (Gross Deal Value)
                </span>
                <div className="text-2xl font-black text-ink font-mono tabular-nums">
                  {formatINR(finalBrandQuote)}
                </div>
                <p className="text-[10px] text-slate-500">Brand pays this exact rate (no extra fees)</p>
              </div>

              {/* Unseen Hours Agency Cut Deduction */}
              <div className="space-y-2 pt-1 border-t border-border">
                <div className="flex justify-between items-center text-ink-muted mb-1">
                  <span>Unseen Hours Cut (%):</span>
                  <span className="font-bold text-accent font-mono">
                    {commissionPct}% (-{formatINR(agencyCutAmount)})
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={commissionPct}
                  onChange={(e) => setCommissionPct(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />

                <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                  <span className="font-semibold text-emerald-900">Net Creator Payout Share:</span>
                  <span className="font-extrabold text-emerald-700 font-mono">{formatINR(netCreatorPayout)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyProposal}
                className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-ink border border-border text-xs font-semibold rounded-lg shadow-subtle flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Proposal Text Copied!' : 'Copy Proposal Text'}</span>
              </button>

              <button
                onClick={handleConvertToDeal}
                className="w-full py-2 px-3 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle flex items-center justify-center gap-1.5 transition-colors"
              >
                {converted ? <Check className="w-4 h-4 text-emerald-300" /> : <Plus className="w-4 h-4" />}
                <span>{converted ? 'Deal Added to Kanban!' : 'Convert to Active Brand Deal'}</span>
              </button>
            </div>
          </div>

          {/* Proposal Text Preview Card */}
          <div className="bg-surface p-4 rounded-xl border border-border shadow-card space-y-2">
            <h4 className="text-[11px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Generated Brand Proposal Text Preview
            </h4>
            <textarea
              readOnly
              rows={8}
              value={generateProposalText()}
              className="w-full p-2.5 bg-bg text-ink font-mono text-[10px] rounded-lg border border-border focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
