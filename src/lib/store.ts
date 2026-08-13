import type { Agency } from '../types/creatorops';

const STORAGE_KEY = 'creatorops_agency_data_permanent_v1';

export const INITIAL_AGENCY: Agency = {
  id: 'agency_unseen_hours_1',
  name: 'Unseen Hours',
  managers: [
    {
      id: 'mgr_jordan',
      agencyId: 'agency_unseen_hours_1',
      name: 'Jordan Miller',
      email: 'jordan@unseenhours.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'Senior Talent Director'
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
      rateNotes: 'Gaming/Sports Dedicated: ₹50,000 | Reel/Short: ₹22,000 | Brand Post: ₹10,000',
      representationType: 'Non-Exclusive / Other',
      createdAt: '2026-02-10T14:30:00Z'
    }
  ],
  deals: [
    {
      id: 'deal_101',
      agencyId: 'agency_unseen_hours_1',
      brandName: 'NordVPN',
      brandContact: 'clara@nordvpn.com',
      value: 145000,
      currency: 'INR',
      commissionPct: 15,
      unseenHoursCutPct: 15,
      stage: 'In Progress',
      targetLiveDate: '2026-07-28',
      invoiceSentDate: '2026-07-25',
      paymentDueDate: '2026-08-10',
      paymentStatus: 'Invoice Sent',
      creatorIds: ['c_markaroni', 'c_divyanshcr7'],
      notesList: [
        {
          id: 'n_101_1',
          date: 'Jul 22, 2026, 11:30 AM',
          author: 'Jordan Miller',
          text: 'Campaign contract signed across Markaroni & DivyanshCR7. Brand brief & custom promo code UNSEEN15 delivered to creators.'
        },
        {
          id: 'n_101_2',
          date: 'Jul 24, 2026, 04:15 PM',
          author: 'Sam Chen',
          text: 'Draft video received from Markaroni. Audio call integration approved by NordVPN brand lead.'
        }
      ],
      activityLog: [
        { id: 'act_1', date: '2026-07-20', author: 'Jordan Miller', text: 'Campaign contract signed across Markaroni & DivyanshCR7.' },
        { id: 'act_2', date: '2026-07-22', author: 'Sam Chen', text: 'Custom discount links and brief delivered to creators.' }
      ],
      createdAt: '2026-07-15T10:00:00Z'
    },
    {
      id: 'deal_102',
      agencyId: 'agency_unseen_hours_1',
      brandName: 'EA Sports FC 25',
      brandContact: 'creators@ea.com',
      value: 180000,
      currency: 'INR',
      commissionPct: 18,
      unseenHoursCutPct: 18,
      stage: 'Signed',
      targetLiveDate: '2026-08-02',
      invoiceSentDate: '2026-07-27',
      paymentDueDate: '2026-08-15',
      paymentStatus: 'Invoice Pending',
      creatorIds: ['c_onemufc', 'c_divyanshcr7'],
      notesList: [
        {
          id: 'n_102_1',
          date: 'Jul 24, 2026, 02:00 PM',
          author: 'Jordan Miller',
          text: 'Launch campaign locked for FC25 Ultimate Team gameplay integrations. High priority release scheduled for launch weekend.'
        }
      ],
      activityLog: [
        { id: 'act_3', date: '2026-07-24', author: 'Jordan Miller', text: 'Launch campaign locked for FC25 Ultimate Team gameplay integrations.' }
      ],
      createdAt: '2026-07-22T11:20:00Z'
    },
    {
      id: 'deal_103',
      agencyId: 'agency_unseen_hours_1',
      brandName: 'Raycast Pro',
      brandContact: 'partnerships@raycast.com',
      value: 65000,
      currency: 'INR',
      commissionPct: 15,
      unseenHoursCutPct: 15,
      stage: 'Delivered',
      targetLiveDate: '2026-07-15',
      invoiceSentDate: '2026-07-16',
      paymentDueDate: '2026-07-30',
      paymentStatus: 'Payment Processing',
      creatorIds: ['c_markaroni'],
      notesList: [
        {
          id: 'n_103_1',
          date: 'Jul 16, 2026, 09:45 AM',
          author: 'Sam Chen',
          text: 'YouTube integration went live on schedule. Invoice sent to Raycast finance team.'
        }
      ],
      activityLog: [
        { id: 'act_4', date: '2026-07-16', author: 'Sam Chen', text: 'Deliverable completed and metrics syncing enabled.' }
      ],
      createdAt: '2026-07-01T15:45:00Z'
    }
  ],
  deliverables: [
    {
      id: 'deliv_1',
      dealId: 'deal_101',
      creatorId: 'c_markaroni',
      category: 'sponsored',
      title: 'NordVPN Ultimate Security Setup & Speed Test',
      type: 'video',
      platform: 'YouTube',
      dueDate: '2026-07-25',
      targetLiveDate: '2026-07-28',
      status: 'Submitted',
      liveUrl: 'https://youtube.com/watch?v=mockNord1',
      finalMetrics: {
        views: 124500,
        likes: 8900,
        comments: 640,
        source: 'manual'
      },
      createdAt: '2026-07-16T12:00:00Z'
    },
    {
      id: 'deliv_2',
      dealId: 'deal_101',
      creatorId: 'c_divyanshcr7',
      category: 'sponsored',
      title: 'How I Protect My Gaming Ping - NordVPN 60s Integration',
      type: 'short',
      platform: 'YouTube',
      dueDate: '2026-07-26',
      targetLiveDate: '2026-07-28',
      status: 'Approved',
      liveUrl: 'https://youtube.com/shorts/mockNord2',
      finalMetrics: {
        views: 85200,
        likes: 6200,
        comments: 310,
        source: 'manual'
      },
      createdAt: '2026-07-17T14:00:00Z'
    },
    {
      id: 'deliv_3',
      dealId: 'deal_102',
      creatorId: 'c_onemufc',
      category: 'sponsored',
      title: 'EA Sports FC 25 Career Mode First Look & Gameplay',
      type: 'video',
      platform: 'YouTube',
      dueDate: '2026-07-31',
      targetLiveDate: '2026-08-02',
      status: 'Draft',
      finalMetrics: {
        views: 0,
        likes: 0,
        comments: 0,
        source: 'manual'
      },
      createdAt: '2026-07-23T10:00:00Z'
    },
    {
      id: 'deliv_4',
      dealId: 'deal_103',
      creatorId: 'c_markaroni',
      category: 'sponsored',
      title: 'Raycast Pro Mac Productivity Workflow',
      type: 'video',
      platform: 'YouTube',
      dueDate: '2026-07-14',
      targetLiveDate: '2026-07-15',
      status: 'Live',
      liveUrl: 'https://youtube.com/watch?v=mockRaycast',
      finalMetrics: {
        views: 94000,
        likes: 7100,
        comments: 520,
        source: 'manual'
      },
      createdAt: '2026-07-02T16:00:00Z'
    }
  ],
  reports: [
    {
      id: 'rep_1',
      publicSlug: 'nordvpn-q3-campaign-8812',
      dealId: 'deal_101',
      generatedAt: '2026-07-29T10:00:00Z'
    }
  ]
};

export const loadAgencyData = (): Agency => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_AGENCY;
    const data = JSON.parse(raw) as Agency;
    if (!data || !data.creators || !data.deals) return INITIAL_AGENCY;

    // Preserve agency name as Unseen Hours
    data.name = 'Unseen Hours';

    // Auto-migrate deal notes into notesList if present
    if (data.deals && Array.isArray(data.deals)) {
      data.deals = data.deals.map((d: any) => {
        if (!d.notesList) d.notesList = [];
        if (d.notes && d.notes.trim() !== '') {
          const alreadyPresent = d.notesList.some((n: any) => n.text.trim() === d.notes.trim());
          if (!alreadyPresent) {
            d.notesList.unshift({
              id: `legacy_${d.id}`,
              date: 'Previous Note',
              author: 'Agency Manager',
              text: d.notes
            });
          }
        }
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
