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

export interface Manager {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

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
  date: string;
  author: string;
  text: string;
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

export type FinalMetrics = DeliverableMetrics;

export interface Deliverable {
  id: string;
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

export interface YouTubeVideoItem {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  url: string;
}

export interface YouTubeChannelAnalytics {
  creatorId?: string;
  channelId?: string;
  channelTitle?: string;
  title?: string;
  handle?: string;
  avatarUrl?: string;
  subscriberCount: number;
  totalViews: number;
  totalVideos?: number;
  views24h: number;
  views7d: number;
  views30d: number;
  likes7d: number;
  comments7d: number;
  recentUploads: YouTubeVideoItem[];
  lastUpdated?: string;
  lastFetchedAt?: string;
  isRealApi?: boolean;
}

export interface Report {
  id: string;
  agencyId?: string;
  publicSlug: string;
  dealId: string;
  generatedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  managers: Manager[];
  creators: Creator[];
  deals: Deal[];
  deliverables: Deliverable[];
  reports: Report[];
}
