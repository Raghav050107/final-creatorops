import React, { useState, useEffect } from 'react';
import type { Creator, Deal, DealStage, Deliverable, DeliverableStatus, DeliverableType, PlatformType, ContentCategory, PaymentStatusType, CreatorRepresentationType } from '../types/creatorops';
import { X, Mail, CheckCircle2, Key, Info, UserPlus, Shield } from 'lucide-react';
import { formatINR } from '../lib/format';

const PRESET_COLORS = [
  '#4F46E5', // Indigo Sapphire
  '#EC4899', // Rose Pink
  '#10B981', // Emerald Green
  '#8B5CF6', // Purple Violet
  '#F59E0B', // Amber Yellow
  '#06B6D4', // Cyan Blue
  '#EF4444', // Red Crimson
  '#6366F1'  // Blue Indigo
];

// Add Creator Modal
interface AddCreatorModalProps {
  agencyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveCreator: (creator: Omit<Creator, 'id' | 'createdAt'>) => void;
}

export const AddCreatorModal: React.FC<AddCreatorModalProps> = ({
  agencyId,
  isOpen,
  onClose,
  onSaveCreator
}) => {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [colorCode, setColorCode] = useState(PRESET_COLORS[0]);
  const [representationType, setRepresentationType] = useState<CreatorRepresentationType>('In-House Exclusive');
  const [platforms, setPlatforms] = useState<PlatformType[]>(['YouTube', 'Instagram']);
  const [youtubeHandle, setYoutubeHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [rateNotes, setRateNotes] = useState('');

  if (!isOpen) return null;

  const togglePlatform = (p: PlatformType) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(x => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const handles: Record<string, string> = {};
    if (youtubeHandle) handles.youtube = youtubeHandle;
    if (instagramHandle) handles.instagram = instagramHandle;
    if (xHandle) handles.x = xHandle;

    onSaveCreator({
      agencyId,
      name: name.trim(),
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      colorCode,
      platforms,
      handles,
      representationType,
      rateNotes: rateNotes.trim()
    });

    setName('');
    setYoutubeHandle('');
    setInstagramHandle('');
    setXHandle('');
    setRateNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-ink">Add Creator to Roster</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Creator / Channel Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Markaroni, One MUFC, Chaos Club"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Agency Representation Status *</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepresentationType('In-House Exclusive')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  representationType === 'In-House Exclusive'
                    ? 'bg-accent text-white border-accent shadow-subtle'
                    : 'bg-white text-ink border-border hover:bg-slate-50'
                }`}
              >
                🔒 In-House Exclusive
              </button>
              <button
                type="button"
                onClick={() => setRepresentationType('Non-Exclusive / Other')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  representationType === 'Non-Exclusive / Other'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                    : 'bg-white text-ink border-border hover:bg-slate-50'
                }`}
              >
                🌐 Non-Exclusive / Other
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Photo / Avatar URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Calendar Tag Color</label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorCode(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    colorCode === c ? 'scale-110 border-slate-900 shadow-subtle' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Active Platforms</label>
            <div className="flex flex-wrap gap-1.5">
              {(['YouTube', 'Instagram', 'X', 'TikTok', 'Twitch', 'LinkedIn'] as PlatformType[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                    platforms.includes(p)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-ink border-border hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">YouTube Handle</label>
              <input
                type="text"
                value={youtubeHandle}
                onChange={(e) => setYoutubeHandle(e.target.value)}
                placeholder="@handle"
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Instagram Handle</label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@handle"
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Rate Card Notes</label>
            <textarea
              rows={2}
              value={rateNotes}
              onChange={(e) => setRateNotes(e.target.value)}
              placeholder="e.g. Dedicated Video: ₹75,000 | 60s Integration: ₹30,000"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Add Creator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Deal Modal
interface AddDealModalProps {
  creators: Creator[];
  isOpen: boolean;
  onClose: () => void;
  onSaveDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'activityLog'>) => void;
}

export const AddDealModal: React.FC<AddDealModalProps> = ({
  creators,
  isOpen,
  onClose,
  onSaveDeal
}) => {
  const [brandName, setBrandName] = useState('');
  const [brandContact, setBrandContact] = useState('');
  const [value, setValue] = useState<number>(50000);
  const [currency] = useState('INR');
  const [commissionPct, setCommissionPct] = useState<number>(15);
  const [unseenHoursCutPct, setUnseenHoursCutPct] = useState<number>(0);
  const [stage, setStage] = useState<DealStage>('Inbound');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('Invoice Pending');
  const [targetLiveDate, setTargetLiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDueDate, setPaymentDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>(
    creators.length > 0 ? [creators[0].id] : []
  );

  useEffect(() => {
    if (creators.length > 0 && selectedCreatorIds.length === 0) {
      setSelectedCreatorIds([creators[0].id]);
    }
  }, [creators]);

  if (!isOpen) return null;

  const toggleCreator = (id: string) => {
    if (selectedCreatorIds.includes(id)) {
      if (selectedCreatorIds.length === 1) return;
      setSelectedCreatorIds(selectedCreatorIds.filter(cId => cId !== id));
    } else {
      setSelectedCreatorIds([...selectedCreatorIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    onSaveDeal({
      agencyId: 'agency_unseen_hours_1',
      brandName: brandName.trim(),
      brandContact: brandContact.trim(),
      value,
      currency,
      commissionPct,
      unseenHoursCutPct,
      stage,
      paymentStatus,
      targetLiveDate,
      paymentDueDate,
      invoiceSentDate: new Date().toISOString().split('T')[0],
      creatorIds: selectedCreatorIds
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-md w-full overflow-hidden my-auto">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-ink">New Brand Sponsorship Deal</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Nike, EA Sports, NordVPN"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Brand Contact Info</label>
            <input
              type="text"
              value={brandContact}
              onChange={(e) => setBrandContact(e.target.value)}
              placeholder="email@brand.com (Contact Name)"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-ink-muted mb-1">Gross Commercial (₹)</label>
              <input
                type="number"
                min="0"
                step="5000"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-muted mb-1">Agency Cut (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={commissionPct}
                onChange={(e) => setCommissionPct(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-amber-700 mb-1">Unseen Hours Cut (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={unseenHoursCutPct}
                onChange={(e) => setUnseenHoursCutPct(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-amber-50 text-amber-900 text-xs rounded-md border border-amber-200 focus:outline-none focus:border-accent font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-700 mb-1">Target Live Date *</label>
              <input
                type="date"
                required
                value={targetLiveDate}
                onChange={(e) => setTargetLiveDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-indigo-50/50 text-ink text-xs font-semibold rounded-md border border-indigo-200 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Deadline</label>
              <input
                type="date"
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Initial Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              >
                <option value="Inbound">Inbound</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Signed">Signed</option>
                <option value="In Progress">In Progress</option>
                <option value="Delivered">Delivered</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatusType)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-semibold"
              >
                <option value="Invoice Pending">Invoice Pending</option>
                <option value="Invoice Sent">Invoice Sent</option>
                <option value="Payment Processing">Payment Processing</option>
                <option value="Paid & Completed">Paid & Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">
              Attached Creators (Multi-Creator Support) *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {creators.map(c => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCreator(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCreatorIds.includes(c.id)
                      ? 'bg-slate-900 text-white border-slate-900 shadow-subtle'
                      : 'bg-white text-ink border-border hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.colorCode }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Create Brand Deal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Deliverable Modal
interface AddDeliverableModalProps {
  deals: Deal[];
  creators: Creator[];
  presetDealId?: string;
  presetTargetLiveDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveDeliverable: (deliv: Omit<Deliverable, 'id' | 'createdAt' | 'finalMetrics'>) => void;
}

export const AddDeliverableModal: React.FC<AddDeliverableModalProps> = ({
  deals,
  creators,
  presetDealId,
  presetTargetLiveDate,
  isOpen,
  onClose,
  onSaveDeliverable
}) => {
  const [dealId, setDealId] = useState(presetDealId || (deals[0]?.id || ''));
  const [category, setCategory] = useState<ContentCategory>('sponsored');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DeliverableType>('video');
  const [platform, setPlatform] = useState<PlatformType>('YouTube');
  const [creatorId, setCreatorId] = useState<string>(creators[0]?.id || '');
  const [dueDate, setDueDate] = useState(presetTargetLiveDate || new Date().toISOString().split('T')[0]);
  const [targetLiveDate, setTargetLiveDate] = useState(presetTargetLiveDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<DeliverableStatus>('Not started');
  const [liveUrl] = useState('');

  useEffect(() => {
    if (presetDealId) {
      setDealId(presetDealId);
      const d = deals.find(x => x.id === presetDealId);
      if (d && d.creatorIds.length > 0) {
        setCreatorId(d.creatorIds[0]);
      }
    }
  }, [presetDealId, deals]);

  useEffect(() => {
    if (presetTargetLiveDate) {
      setTargetLiveDate(presetTargetLiveDate);
      setDueDate(presetTargetLiveDate);
    }
  }, [presetTargetLiveDate]);

  useEffect(() => {
    if (category === 'sponsored' && dealId) {
      const selectedDeal = deals.find(d => d.id === dealId);
      if (selectedDeal && selectedDeal.creatorIds.length > 0) {
        setCreatorId(selectedDeal.creatorIds[0]);
      }
    }
  }, [dealId, category, deals]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !creatorId) return;
    onSaveDeliverable({
      dealId: category === 'sponsored' ? dealId : undefined,
      creatorId,
      category,
      title: title.trim(),
      type,
      platform,
      dueDate,
      targetLiveDate,
      status,
      liveUrl: liveUrl.trim()
    });
    onClose();
  };

  const selectedDeal = deals.find(d => d.id === dealId);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-ink">Schedule Content on Calendar</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Content Category *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('sponsored')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  category === 'sponsored'
                    ? 'bg-accent text-white border-accent shadow-subtle'
                    : 'bg-white text-ink border-border hover:bg-slate-50'
                }`}
              >
                Sponsored Brand Deal
              </button>
              <button
                type="button"
                onClick={() => setCategory('organic')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  category === 'organic'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-subtle'
                    : 'bg-white text-ink border-border hover:bg-slate-50'
                }`}
              >
                Organic Solo Content
              </button>
            </div>
          </div>

          {category === 'sponsored' && (
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Attached Deal *</label>
              <select
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              >
                {deals.map(d => (
                  <option key={d.id} value={d.id}>{d.brandName} ({formatINR(d.value)})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Assigned Creator *</label>
            <select
              value={creatorId}
              onChange={(e) => setCreatorId(e.target.value)}
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-semibold text-accent"
            >
              {creators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Content Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. YouTube 60s Integration, Matchday Stream, IG Reel"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              >
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="X">X</option>
                <option value="TikTok">TikTok</option>
                <option value="Twitch">Twitch</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Content Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeliverableType)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              >
                <option value="video">video</option>
                <option value="reel">reel</option>
                <option value="post">post</option>
                <option value="story">story</option>
                <option value="short">short</option>
                <option value="podcast">podcast</option>
                <option value="livestream">livestream</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-700 mb-1">Target Live Date *</label>
              <input
                type="date"
                required
                value={targetLiveDate}
                onChange={(e) => setTargetLiveDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-indigo-50/50 text-ink text-xs font-semibold rounded-md border border-indigo-200 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Internal Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DeliverableStatus)}
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            >
              <option value="Not started">Not started</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Live">Live</option>
            </select>
          </div>

          {category === 'sponsored' && selectedDeal && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>
                Tracked under <strong>{selectedDeal.brandName}</strong> ({formatINR(selectedDeal.value)}). Revenue is tracked once at the deal level and will <strong>not</strong> be double-counted.
              </span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Schedule to Calendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// YouTube API Key Config Modal
interface YouTubeApiKeyModalProps {
  apiKey: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveApiKey: (key: string) => void;
}

export const YouTubeApiKeyModal: React.FC<YouTubeApiKeyModalProps> = ({
  apiKey,
  isOpen,
  onClose,
  onSaveApiKey
}) => {
  const [inputKey, setInputKey] = useState(apiKey);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-ink">YouTube Data API v3 Credentials</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-ink-muted">
            Enter your Google YouTube Data API v3 Key to enable real-time live channel analytics (24h, 7d, 30d views) and video stats auto-sync.
          </p>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">YouTube API Key</label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-bg text-ink font-mono text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-border text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-ink block">How to get a free API Key:</span>
            <p>1. Go to Google Cloud Console → APIs & Services</p>
            <p>2. Enable "YouTube Data API v3"</p>
            <p>3. Create Credentials → API Key & paste it above</p>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors shadow-subtle"
            >
              Save API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Email Digest Modal
interface EmailDigestModalProps {
  overdueDeliverables: Deliverable[];
  creators: Creator[];
  deals: Deal[];
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDigestModal: React.FC<EmailDigestModalProps> = ({
  overdueDeliverables,
  creators,
  deals,
  isOpen,
  onClose
}) => {
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSendDigest = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-ink">Daily Overdue & Deadline Digest</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-ink-muted">
            Send an instant automated email summary of all overdue items & upcoming deadlines across your roster to your team managers.
          </p>

          <div className="bg-bg p-4 rounded-xl border border-border space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-bold text-ink">Subject: [CreatorOps] Daily Overdue Digest</span>
              <span className="text-[10px] text-slate-400 font-mono">To: jordan@apexagency.co</span>
            </div>

            {overdueDeliverables.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Great news! No overdue deliverables across your roster today.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold text-warn">⚠️ {overdueDeliverables.length} Action Items Require Urgent Attention:</p>
                {overdueDeliverables.map(deliv => {
                  const c = creators.find(cr => cr.id === deliv.creatorId);
                  const d = deals.find(dl => dl.id === deliv.dealId);
                  return (
                    <div key={deliv.id} className="p-2 bg-white rounded border border-warn-border text-[11px]">
                      <span className="font-bold text-ink">{deliv.title}</span>
                      <p className="text-ink-muted mt-0.5">{c?.name} • {d?.brandName || 'Organic Content'} • Target Live: {deliv.targetLiveDate || deliv.dueDate}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-ink-muted">Close</button>
            <button
              onClick={handleSendDigest}
              disabled={sent}
              className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors shadow-subtle flex items-center gap-1.5"
            >
              {sent ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Mail className="w-4 h-4" />}
              <span>{sent ? 'Digest Sent to Managers!' : 'Send Email Digest Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
