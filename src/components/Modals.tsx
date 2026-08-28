import React, { useState, useEffect } from 'react';
import type { Creator, Deal, DealStage, Deliverable, DeliverableStatus, DeliverableType, PlatformType, ContentCategory, PaymentStatusType, CreatorRepresentationType } from '../types/creatorops';
import { X, Mail, CheckCircle2, Key, Info, UserPlus, Shield, Tag, Instagram, Video } from 'lucide-react';
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
                  <Instagram className="w-3 h-3 text-pink-600" />
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
