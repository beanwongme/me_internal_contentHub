// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'writer' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
}

// Content Types
export interface Content {
  id: string;
  title: string;
  type: 'product' | 'thought_leadership' | 'company_news' | 'customer_story' | 'promotional';
  status: 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived';
  author: User;
  channels: Channel[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  publishedAt?: string;
  performance?: ContentPerformance;
}

export interface ContentPerformance {
  views: number;
  clicks: number;
  engagement: number;
  shares: number;
}

// Channel Types
export interface Channel {
  id: string;
  name: string;
  type: 'social' | 'cms' | 'notification';
  platform: string;
  icon: string;
  connected: boolean;
  status?: 'active' | 'error' | 'pending';
}

// Idea Types
export interface Idea {
  id: string;
  headline: string;
  summary: string;
  source: string;
  sourceUrl: string;
  relevanceScore: number;
  keywords: string[];
  createdAt: string;
  saved: boolean;
}

// Brief Types
export interface Brief {
  id: string;
  topic: string;
  keywords: string[];
  talkingPoints: string[];
  tone: ToneSettings;
  audience: string;
  channels: string[];
  length: 'short' | 'medium' | 'long';
  contentType: string;
}

export interface ToneSettings {
  formality: number;
  enthusiasm: number;
  complexity: number;
  personality: number;
}

// Draft Types
export interface Draft {
  id: string;
  content: string;
  channel: string;
  model: string;
  tokens: number;
  cost: number;
  duration: number;
  createdAt: string;
  versions: DraftVersion[];
}

export interface DraftVersion {
  id: string;
  content: string;
  createdAt: string;
  author: User;
}

// Company Content Types
export interface CompanyProfile {
  name: string;
  legalName: string;
  overview: LocalizedText;
  tagline: LocalizedText;
  founded: number;
  locations: Location[];
  contacts: ContactInfo;
  socialProfiles: SocialProfiles;
}

export interface LocalizedText {
  en: string;
  'zh-HK'?: string;
  'zh-CN'?: string;
}

export interface Location {
  city: string;
  type: 'headquarters' | 'regional_office' | 'remote' | 'service';
  address?: string;
  timezone?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
}

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  name: LocalizedText;
  category: string[];
  description: {
    short: LocalizedText;
    full: LocalizedText;
  };
  features: Feature[];
  benefits: string[];
  useCases: UseCase[];
  pricing?: PricingInfo;
  availability: 'in_stock' | 'out_of_stock' | 'coming_soon';
  media: MediaAsset[];
}

export interface Feature {
  name: string;
  description: string;
  benefit: string;
}

export interface UseCase {
  scenario: string;
  outcome: string;
  testimonialId?: string;
}

export interface PricingInfo {
  currency: string;
  tiers: PricingTier[];
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
}

// Case Study Types
export interface CaseStudy {
  id: string;
  title: string;
  client: {
    name: string;
    industry: string;
    size: string;
  };
  challenge: {
    situation: string;
    stakes: string;
  };
  solution: {
    approach: string;
    implementation: string;
  };
  results: {
    metrics: Metric[];
    testimonial?: string;
    quoteAttribution?: string;
  };
  visibility: 'public' | 'internal' | 'restricted';
  approvalStatus: 'pending' | 'client_approved' | 'published';
  media: MediaAsset[];
}

export interface Metric {
  label: string;
  value: string;
  change?: string;
}

// Media Types
export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  tags: string[];
  uploadedBy: User;
  uploadedAt: string;
  usageCount: number;
  rights?: RightsInfo;
}

export interface RightsInfo {
  license: string;
  expiration?: string;
  attribution?: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: 'content_created' | 'content_updated' | 'content_published' | 'ai_generated' | 'review_submitted' | 'comment_added';
  actor: User;
  target?: string;
  targetType?: string;
  description: string;
  createdAt: string;
}

// Pipeline Types
export interface PipelineStage {
  id: string;
  name: string;
  key: string;
  count: number;
  items: Content[];
}

// AI Agent Types
export interface AIAgent {
  id: string;
  name: string;
  type: 'research' | 'writing' | 'image';
  provider: string;
  model: string;
  status: 'active' | 'inactive' | 'error';
  config: AgentConfig;
  description?: string;
}

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  customParams?: Record<string, unknown>;
}

// Settings Types
export interface KeywordPool {
  id: string;
  name: string;
  keywords: string[];
  priority: 'high' | 'medium' | 'low';
  active: boolean;
}

// Stats Types
export interface DashboardStats {
  contentCreated: number;
  contentTrend: number;
  aiUtilization: number;
  aiTrend: number;
  approvalRate: number;
  approvalTrend: number;
  channelReach: number;
  reachTrend: number;
}

// Content Brief Type for AI Generation
export interface ContentBrief {
  id?: string;
  title: string;
  objective: string;
  targetAudience: string;
  keyMessages: string[];
  callToAction?: string;
  keywords?: string[];
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  channels?: string[];
}
