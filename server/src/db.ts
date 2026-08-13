import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { DatabaseSchema, Agency, User, Creator, Deal, DealNote, Deliverable, Report } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'creatorops_db.json');

const INITIAL_PASSWORD_HASH = bcrypt.hashSync('admin123', 10);

const SEED_DATA: DatabaseSchema = {
  agencies: [
    {
      id: 'agency_unseen_hours_1',
      name: 'Unseen Hours',
      slug: 'unseen-hours',
      currency: 'INR',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ],
  users: [
    {
      id: 'user_admin_1',
      agencyId: 'agency_unseen_hours_1',
      name: 'Jordan Miller',
      email: 'admin@unseenhours.com',
      passwordHash: INITIAL_PASSWORD_HASH,
      role: 'owner',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'user_manager_1',
      agencyId: 'agency_unseen_hours_1',
      name: 'Sam Chen',
      email: 'sam@unseenhours.com',
      passwordHash: INITIAL_PASSWORD_HASH,
      role: 'manager',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      createdAt: '2026-01-05T00:00:00Z'
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
      activityLog: [
        { id: 'act_1', date: '2026-07-20', author: 'Jordan Miller', text: 'Campaign contract signed across Markaroni & DivyanshCR7.' }
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
      activityLog: [
        { id: 'act_4', date: '2026-07-16', author: 'Sam Chen', text: 'Deliverable completed and metrics syncing enabled.' }
      ],
      createdAt: '2026-07-01T15:45:00Z'
    }
  ],
  dealNotes: [
    {
      id: 'n_101_1',
      dealId: 'deal_101',
      agencyId: 'agency_unseen_hours_1',
      date: 'Jul 22, 2026, 11:30 AM',
      author: 'Jordan Miller',
      text: 'Campaign contract signed across Markaroni & DivyanshCR7. Brand brief & custom promo code UNSEEN15 delivered to creators.',
      createdAt: '2026-07-22T11:30:00Z'
    },
    {
      id: 'n_101_2',
      dealId: 'deal_101',
      agencyId: 'agency_unseen_hours_1',
      date: 'Jul 24, 2026, 04:15 PM',
      author: 'Sam Chen',
      text: 'Draft video received from Markaroni. Audio call integration approved by NordVPN brand lead.',
      createdAt: '2026-07-24T16:15:00Z'
    },
    {
      id: 'n_102_1',
      dealId: 'deal_102',
      agencyId: 'agency_unseen_hours_1',
      date: 'Jul 24, 2026, 02:00 PM',
      author: 'Jordan Miller',
      text: 'Launch campaign locked for FC25 Ultimate Team gameplay integrations. High priority release scheduled for launch weekend.',
      createdAt: '2026-07-24T14:00:00Z'
    },
    {
      id: 'n_103_1',
      dealId: 'deal_103',
      agencyId: 'agency_unseen_hours_1',
      date: 'Jul 16, 2026, 09:45 AM',
      author: 'Sam Chen',
      text: 'YouTube integration went live on schedule. Invoice sent to Raycast finance team.',
      createdAt: '2026-07-16T09:45:00Z'
    }
  ],
  deliverables: [
    {
      id: 'deliv_1',
      agencyId: 'agency_unseen_hours_1',
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
      agencyId: 'agency_unseen_hours_1',
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
      agencyId: 'agency_unseen_hours_1',
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
      agencyId: 'agency_unseen_hours_1',
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
      agencyId: 'agency_unseen_hours_1',
      publicSlug: 'nordvpn-q3-campaign-8812',
      dealId: 'deal_101',
      generatedAt: '2026-07-29T10:00:00Z'
    }
  ]
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.readData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed.agencies && parsed.users) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading database file, resetting to seed data:', err);
    }
    this.saveData(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  private saveData(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error writing database file:', err);
    }
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  public mutate(fn: (db: DatabaseSchema) => void) {
    fn(this.data);
    this.saveData(this.data);
  }

  // --- Multi-Tenant Query Helpers ---

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findAgencyById(agencyId: string): Agency | undefined {
    return this.data.agencies.find(a => a.id === agencyId);
  }

  public getAgencyCreators(agencyId: string): Creator[] {
    return this.data.creators.filter(c => c.agencyId === agencyId);
  }

  public getAgencyDeals(agencyId: string): Deal[] {
    const deals = this.data.deals.filter(d => d.agencyId === agencyId);
    return deals.map(deal => {
      const notesList = this.data.dealNotes
        .filter(n => n.dealId === deal.id && n.agencyId === agencyId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return {
        ...deal,
        notesList
      };
    });
  }

  public getAgencyDeliverables(agencyId: string): Deliverable[] {
    return this.data.deliverables.filter(d => d.agencyId === agencyId);
  }

  public getAgencyReports(agencyId: string): Report[] {
    return this.data.reports.filter(r => r.agencyId === agencyId);
  }

  public getAgencyUsers(agencyId: string): Omit<User, 'passwordHash'>[] {
    return this.data.users
      .filter(u => u.agencyId === agencyId)
      .map(({ passwordHash, ...user }) => user);
  }
}

export const db = new Database();
