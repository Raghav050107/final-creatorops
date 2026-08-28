export type UserRole = 'owner' | 'manager' | 'viewer';

export interface User {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthPayload {
  userId: string;
  agencyId: string;
  role: UserRole;
  email: string;
  name: string;
}

export type DealStage = 
  | 'Inbound'
  | 'Negotiating'
  | 'Signed'
  | 'In Progress'
  | 'Delivered'
  | 'Paid';

export type PaymentStatusType = 
  | 'Invoice Pending'
  | 'Invoice Sent'
  | 'Payment Processing'
  | 'Paid & Completed'
  | 'Overdue';

export type PlatformType = 
  | 'YouTube' 
  | 'Instagram' 
  | 'X' 
  | 'TikTok' 
  | 'Twitch' 
  | 'LinkedIn';

export type DeliverableType = 
  | 'video' 
  | 'reel' 
  | 'post' 
  | 'story' 
  | 'short' 
  | 'podcast' 
  | 'livestream';

export type DeliverableStatus = 
  | 'Not started' 
  | 'Draft' 
  | 'Submitted' 
  | 'Approved' 
  | 'Live';

export type ContentCategory = 'sponsored' | 'organic';

export type CreatorRepresentationType = 'In-House Exclusive' | 'Non-Exclusive / Other';

export interface Creator {
  id: string;
  agencyId: string;
  name: string;
  photoUrl: string;
  colorCode: string;
  platforms: PlatformType[];
  handles: {
    youtube?: string;
    instagram?: string;
    x?: string;
    tiktok?: string;
    twitch?: string;
    linkedin?: string;
  };
  instaReelRate?: number;
  youtubeLongVideoRate?: number;
  rateNotes: string;
  representationType?: CreatorRepresentationType;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface DealNote {
  id: string;
  dealId: string;
  agencyId: string;
  date: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  agencyId: string;
  brandName: string;
  brandContact: string;
  value: number;
  currency: string;
  commissionPct: number;
  unseenHoursCutPct?: number;
  stage: DealStage;
  targetLiveDate?: string;
  invoiceSentDate?: string;
  paymentDueDate?: string;
  paymentStatus?: PaymentStatusType;
  creatorIds: string[];
  notes?: string;
  notesList?: DealNote[];
  activityLog: ActivityLog[];
  createdAt: string;
}

export interface DeliverableMetrics {
  views: number;
  likes: number;
  comments: number;
  lastFetchedAt?: string;
  source: 'manual' | 'api';
}

export interface Deliverable {
  id: string;
  agencyId: string;
  dealId?: string;
  creatorId: string;
  category: ContentCategory;
  title: string;
  type: DeliverableType;
  platform: PlatformType;
  dueDate: string;
  targetLiveDate?: string;
  status: DeliverableStatus;
  liveUrl?: string;
  finalMetrics: DeliverableMetrics;
  createdAt: string;
}

export interface Report {
  id: string;
  agencyId: string;
  publicSlug: string;
  dealId: string;
  generatedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  currency: string;
  createdAt: string;
}

export interface DatabaseSchema {
  agencies: Agency[];
  users: User[];
  creators: Creator[];
  deals: Deal[];
  dealNotes: DealNote[];
  deliverables: Deliverable[];
  reports: Report[];
}
