import React, { useState, useEffect } from 'react';
import type { Creator, Deal, DealStage, Deliverable, DeliverableStatus, DeliverableType, PlatformType, ContentCategory, PaymentStatusType, CreatorRepresentationType } from '../types/creatorops';
import { X, Mail, CheckCircle2, UserPlus, Shield, Tag, Camera, Video, Edit3, Check } from 'lucide-react';

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

// 1. Add Creator Modal
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
  const [instaReelRate, setInstaReelRate] = useState<number | ''>(25000);
  const [youtubeLongVideoRate, setYoutubeLongVideoRate] = useState<number | ''>(80000);
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
      instaReelRate: Number(instaReelRate) || 0,
      youtubeLongVideoRate: Number(youtubeLongVideoRate) || 0,
      rateNotes: rateNotes.trim()
    });

    setName('');
    setYoutubeHandle('');
    setInstagramHandle('');
    setXHandle('');
    setInstaReelRate(25000);
    setYoutubeLongVideoRate(80000);
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
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

          {/* Rate Card Inputs Section */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2.5">
            <label className="block text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-accent" />
              <span>Commercial Rate Card Prices (₹)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-pink-600" />
                  <span>1 Insta Reel (₹)</span>
                </label>
                <input
                  type="number"
                  required
                  value={instaReelRate}
                  onChange={(e) => setInstaReelRate(e.target.value ? Number(e.target.value) : '')}
                  placeholder="25000"
                  className="w-full px-2.5 py-1.5 bg-white text-ink text-xs font-mono font-bold rounded-md border border-border focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Video className="w-3 h-3 text-red-600" />
                  <span>1 Long Video (₹)</span>
                </label>
                <input
                  type="number"
                  required
                  value={youtubeLongVideoRate}
                  onChange={(e) => setYoutubeLongVideoRate(e.target.value ? Number(e.target.value) : '')}
                  placeholder="80000"
                  className="w-full px-2.5 py-1.5 bg-white text-ink text-xs font-mono font-bold rounded-md border border-border focus:outline-none focus:border-accent"
                />
              </div>
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
            <label className="block text-xs font-bold text-ink-muted mb-1">Rate Card Additional Notes</label>
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

// 2. Edit Rate Card Modal
interface EditRateCardModalProps {
  creator: Creator | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCreator: (updatedCreator: Creator) => void;
}

export const EditRateCardModal: React.FC<EditRateCardModalProps> = ({
  creator,
  isOpen,
  onClose,
  onUpdateCreator
}) => {
  const [instaReelRate, setInstaReelRate] = useState<number | ''>(25000);
  const [youtubeLongVideoRate, setYoutubeLongVideoRate] = useState<number | ''>(80000);
  const [rateNotes, setRateNotes] = useState('');
  const [representationType, setRepresentationType] = useState<CreatorRepresentationType>('In-House Exclusive');

  useEffect(() => {
    if (creator) {
      setInstaReelRate(creator.instaReelRate || 25000);
      setYoutubeLongVideoRate(creator.youtubeLongVideoRate || 80000);
      setRateNotes(creator.rateNotes || '');
      setRepresentationType(creator.representationType || 'In-House Exclusive');
    }
  }, [creator]);

  if (!isOpen || !creator) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCreator({
      ...creator,
      instaReelRate: Number(instaReelRate) || 0,
      youtubeLongVideoRate: Number(youtubeLongVideoRate) || 0,
      rateNotes: rateNotes.trim(),
      representationType
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-white">Edit Commercial Rate Card: {creator.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-3">
            <label className="block text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-accent" />
              <span>Update Rate Prices for {creator.name}</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-pink-600" />
                  <span>1 Insta Reel (₹)</span>
                </label>
                <input
                  type="number"
                  required
                  value={instaReelRate}
                  onChange={(e) => setInstaReelRate(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-white text-ink text-xs font-mono font-bold rounded-lg border border-border focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-red-600" />
                  <span>1 Long Video (₹)</span>
                </label>
                <input
                  type="number"
                  required
                  value={youtubeLongVideoRate}
                  onChange={(e) => setYoutubeLongVideoRate(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-white text-ink text-xs font-mono font-bold rounded-lg border border-border focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Rate Card Additional Notes</label>
            <textarea
              rows={3}
              value={rateNotes}
              onChange={(e) => setRateNotes(e.target.value)}
              placeholder="e.g. YouTube Dedicated: ₹80,000 | 60s Integration: ₹35,000 | Instagram Reel: ₹25,000"
              className="w-full px-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Agency Representation Type</span>
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
                🌐 Non-Exclusive
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-3.5 py-2 text-xs font-bold text-ink-muted hover:text-ink">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover transition-all flex items-center gap-1.5 shadow-subtle"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Rate Card Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Add Deal Modal
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
  const [value, setValue] = useState('');
  const [commissionPct, setCommissionPct] = useState(15);
  const [unseenHoursCutPct, setUnseenHoursCutPct] = useState(15);
  const [stage, setStage] = useState<DealStage>('Inbound');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('Invoice Pending');
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [targetLiveDate, setTargetLiveDate] = useState('');
  const [invoiceSentDate, setInvoiceSentDate] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');

  if (!isOpen) return null;

  const toggleCreator = (id: string) => {
    if (selectedCreatorIds.includes(id)) {
      setSelectedCreatorIds(selectedCreatorIds.filter(x => x !== id));
    } else {
      setSelectedCreatorIds([...selectedCreatorIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || selectedCreatorIds.length === 0) return;

    onSaveDeal({
      agencyId: 'agency_unseen_hours_1',
      brandName: brandName.trim(),
      brandContact: brandContact.trim(),
      value: parseFloat(value) || 0,
      currency: 'INR',
      commissionPct,
      unseenHoursCutPct,
      stage,
      paymentStatus,
      creatorIds: selectedCreatorIds,
      targetLiveDate: targetLiveDate || undefined,
      invoiceSentDate: invoiceSentDate || undefined,
      paymentDueDate: paymentDueDate || undefined
    });

    setBrandName('');
    setBrandContact('');
    setValue('');
    setSelectedCreatorIds([]);
    setTargetLiveDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-ink">New Brand Sponsorship Deal</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Brand Name *</label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. NordVPN, Nike, EA Sports"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Brand Lead Email</label>
            <input
              type="email"
              value={brandContact}
              onChange={(e) => setBrandContact(e.target.value)}
              placeholder="partnerships@brand.com"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Gross Deal Value (INR ₹) *</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="150000"
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-accent mb-1">Unseen Hours Cut (%)</label>
              <input
                type="number"
                value={unseenHoursCutPct}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setUnseenHoursCutPct(val);
                  setCommissionPct(val);
                }}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-mono font-bold text-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Assigned Roster Creator(s) *</label>
            <div className="flex flex-wrap gap-2">
              {creators.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCreator(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    selectedCreatorIds.includes(c.id)
                      ? 'bg-accent text-white border-accent shadow-subtle'
                      : 'bg-white text-ink border-border hover:bg-slate-50'
                  }`}
                >
                  <img src={c.photoUrl} alt={c.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-bold"
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
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-bold"
              >
                <option value="Invoice Pending">Invoice Pending</option>
                <option value="Invoice Sent">Invoice Sent</option>
                <option value="Payment Processing">Payment Processing</option>
                <option value="Paid & Completed">Paid & Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-ink-muted uppercase mb-1">Target Live Date</label>
              <input
                type="date"
                value={targetLiveDate}
                onChange={(e) => setTargetLiveDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-bg text-ink text-xs rounded-md border border-border"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted uppercase mb-1">Invoice Sent Date</label>
              <input
                type="date"
                value={invoiceSentDate}
                onChange={(e) => setInvoiceSentDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-bg text-ink text-xs rounded-md border border-border"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted uppercase mb-1">Payment Due Date</label>
              <input
                type="date"
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-bg text-ink text-xs rounded-md border border-border"
              />
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
              Save Brand Deal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Add Deliverable Modal
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
  const [creatorId, setCreatorId] = useState(creators[0]?.id || '');
  const [category, setCategory] = useState<ContentCategory>('sponsored');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DeliverableType>('video');
  const [platform, setPlatform] = useState<PlatformType>('YouTube');
  const [dueDate, setDueDate] = useState('');
  const [targetLiveDate, setTargetLiveDate] = useState(presetTargetLiveDate || '');
  const [status, setStatus] = useState<DeliverableStatus>('Not started');
  const [liveUrl, setLiveUrl] = useState('');

  useEffect(() => {
    if (presetDealId) setDealId(presetDealId);
    if (presetTargetLiveDate) setTargetLiveDate(presetTargetLiveDate);
  }, [presetDealId, presetTargetLiveDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !creatorId) return;

    onSaveDeliverable({
      dealId: dealId || undefined,
      creatorId,
      category,
      title: title.trim(),
      type,
      platform,
      dueDate: dueDate || targetLiveDate || new Date().toISOString().split('T')[0],
      targetLiveDate: targetLiveDate || undefined,
      status,
      liveUrl: liveUrl.trim() || undefined
    });

    setTitle('');
    setLiveUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-ink">Schedule Deliverable Item</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
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
                🏷️ Sponsored Deal
              </button>
              <button
                type="button"
                onClick={() => setCategory('organic')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  category === 'organic'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-subtle'
                    : 'bg-white text-ink border-border hover:bg-slate-50'
                }`}
              >
                🌱 Organic Content
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Deliverable Title / Topic *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NordVPN 60s Integration & Speed Test"
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Associated Brand Deal</label>
              <select
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              >
                <option value="">(None / General Roster)</option>
                {deals.map(d => (
                  <option key={d.id} value={d.id}>{d.brandName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Assigned Creator *</label>
              <select
                required
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              >
                {creators.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
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
                <option value="X">X (Twitter)</option>
                <option value="TikTok">TikTok</option>
                <option value="Twitch">Twitch</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Format Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeliverableType)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent"
              >
                <option value="video">Dedicated / Integrated Video</option>
                <option value="reel">Instagram Reel</option>
                <option value="short">YouTube Short</option>
                <option value="post">Feed Post</option>
                <option value="story">Story</option>
                <option value="podcast">Podcast</option>
                <option value="livestream">Livestream</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Draft Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-accent mb-1">Target Live Date *</label>
              <input
                type="date"
                required
                value={targetLiveDate}
                onChange={(e) => setTargetLiveDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:border-accent font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DeliverableStatus)}
              className="w-full px-3 py-1.5 bg-bg text-ink text-xs rounded-md border border-border focus:outline-none focus:border-accent font-bold"
            >
              <option value="Not started">Not started</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted to Brand</option>
              <option value="Approved">Approved</option>
              <option value="Live">Live</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-muted mb-1">Live Post URL (if published)</label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
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
              Save Deliverable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Email Digest Modal
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
  const [recipientEmail, setRecipientEmail] = useState('admin@unseenhours.com');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSendDigest = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-ink">Daily Overdue Digest Email</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-ink">Digest Dispatched Successfully!</h4>
            <p className="text-xs text-ink-muted">
              Sent summary email of {overdueDeliverables.length} overdue item(s) to {recipientEmail}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendDigest} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-muted mb-1">Recipient Email Address *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent font-bold"
              />
            </div>

            <div className="p-3 bg-bg rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-ink">
                <span>Overdue Deliverables Preview</span>
                <span className="text-warn font-bold">{overdueDeliverables.length} Items Overdue</span>
              </div>
              <div className="divide-y divide-border/60 max-h-48 overflow-y-auto pr-1">
                {overdueDeliverables.map(deliv => {
                  const creator = creators.find(c => c.id === deliv.creatorId);
                  const deal = deals.find(d => d.id === deliv.dealId);
                  return (
                    <div key={deliv.id} className="py-2 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-ink">{deliv.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {creator?.name} • {deal?.brandName || 'Direct'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-warn bg-warn-bg px-2 py-0.5 rounded border border-warn-border">
                        Due: {deliv.targetLiveDate || deliv.dueDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-3.5 py-2 text-xs text-ink-muted hover:text-ink font-bold">
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Digest Email Now</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
