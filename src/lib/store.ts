import type { Agency } from '../types/creatorops';

const STORAGE_KEY = 'creatorops_agency_data_permanent_v4';

export const INITIAL_AGENCY: Agency = {
  id: 'agency_unseen_hours_1',
  name: 'Unseen Hours',
  managers: [
    {
      id: 'mgr_jordan',
      agencyId: 'agency_unseen_hours_1',
      name: 'Jordan Miller',
      email: 'admin@unseenhours.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'Agency Owner / Talent Director'
    },
    {
      id: 'mgr_sam',
      agencyId: 'agency_unseen_hours_1',
      name: 'Sam Chen',
      email: 'sam@unseenhours.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      role: 'Campaign Operations Manager'
    }
  ],
  creators: [
    {
      id: 'c_markaroni',
      agencyId: 'agency_unseen_hours_1',
      name: 'Markaroni',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
      colorCode: '#6366F1',
      platforms: ['YouTube', 'Instagram', 'TikTok'],
      handles: {
        youtube: '@Markaroni',
        instagram: '@markaroni_official',
        tiktok: '@markaroni_tok'
      },
      instaReelRate: 25000,
      youtubeLongVideoRate: 80000,
      rateNotes: 'YouTube Dedicated: ₹80,000 | 60s Integration: ₹35,000 | Instagram Reel: ₹25,000',
      representationType: 'In-House Exclusive',
      createdAt: '2026-01-15T09:00:00Z'
    },
    {
      id: 'c_onemufc',
      agencyId: 'agency_unseen_hours_1',
      name: 'OneMUFC',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
      colorCode: '#EF4444',
      platforms: ['YouTube', 'X', 'Twitch'],
      handles: {
        youtube: '@OneMUFC',
        x: '@OneMUFC_News',
        twitch: 'onemufc_live'
      },
      instaReelRate: 20000,
      youtubeLongVideoRate: 60000,
      rateNotes: 'Football Matchday Vlog: ₹60,000 | Live Stream Sponsor: ₹30,000 | X Post Thread: ₹12,000',
      representationType: 'In-House Exclusive',
      createdAt: '2026-01-20T11:00:00Z'
    },
    {
      id: 'c_divyanshcr7',
      agencyId: 'agency_unseen_hours_1',
      name: 'DivyanshCR7',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      colorCode: '#10B981',
      platforms: ['YouTube', 'Instagram', 'X'],
      handles: {
        youtube: '@DivyanshCR7',
        instagram: '@divyansh_cr7',
        x: '@divyanshCR7'
      },
      instaReelRate: 22000,
      youtubeLongVideoRate: 50000,
      rateNotes: 'Gaming/Sports Dedicated: ₹50,000 | Reel/Short: ₹22,000 | Brand Post: ₹10,000',
      representationType: 'Non-Exclusive / Other',
      createdAt: '2026-02-10T14:30:00Z'
    }
  ],
  deals: [],
  deliverables: [],
  reports: []
};

export const loadAgencyData = (): Agency => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_AGENCY;
    const data = JSON.parse(raw) as Agency;
    if (!data) return INITIAL_AGENCY;

    // PRESERVE USER DELETIONS! Only fallback if property is NOT an array!
    if (!Array.isArray(data.managers)) {
      data.managers = INITIAL_AGENCY.managers;
    }
    if (!Array.isArray(data.creators)) {
      data.creators = INITIAL_AGENCY.creators;
    }
    if (!Array.isArray(data.deals)) {
      data.deals = [];
    }
    if (!Array.isArray(data.deliverables)) {
      data.deliverables = [];
    }
    if (!Array.isArray(data.reports)) {
      data.reports = [];
    }

    if (data.deals && Array.isArray(data.deals)) {
      data.deals = data.deals.map((d: any) => {
        if (!d.notesList) d.notesList = [];
        return d;
      });
    }

    return data;
  } catch (err) {
    console.error('Failed to load agency data, using default:', err);
    return INITIAL_AGENCY;
  }
};

export const saveAgencyData = (data: Agency): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save agency data:', err);
  }
};

export const resetWorkspaceData = (): Agency => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AGENCY));
  } catch (err) {
    console.error('Failed to reset workspace data:', err);
  }
  return INITIAL_AGENCY;
};
