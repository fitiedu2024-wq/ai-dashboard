/**
 * API Response Types
 */

// User types
export interface User {
  id: number;
  email: string;
  quota: number;
  is_admin: boolean;
  role: string;
  is_active: boolean;
  last_login: string | null;
  last_ip: string | null;
  last_geo: string | null;
  created_at: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Analysis types
export interface PageAnalysis {
  title: { text: string; length: number; score: number };
  meta_description: { text: string; length: number; score: number };
  headers: { h1_count: number; h2_count: number; h3_count: number; score: number; h1_texts: string[] };
  images: { total: number; with_alt: number; alt_coverage: number };
  links: { internal: number };
  content: { word_count: number };
  technical: { has_schema: boolean; mobile_friendly: boolean; has_open_graph: boolean };
  overall_score: number;
}

export interface PageData {
  url: string;
  status: 'success' | 'error';
  analysis?: PageAnalysis;
  trackers?: TrackingPixels;
  internal_links?: string[];
  response_time?: number;
  error?: string;
}

export interface TrackingPixels {
  google_analytics: boolean;
  google_tag_manager: boolean;
  facebook_pixel: boolean;
  tiktok_pixel: boolean;
  linkedin_insight: boolean;
  hotjar: boolean;
  google_analytics_id?: string;
  gtm_id?: string;
  fb_pixel_id?: string;
}

export interface SiteAnalysis {
  domain: string;
  total_pages: number;
  failed_pages?: number;
  crawl_time?: number;
  avg_seo_score: number;
  avg_word_count: number;
  avg_alt_coverage: number;
  schema_coverage: number;
  mobile_coverage?: number;
  og_coverage?: number;
  trackers?: TrackingPixels;
  pages: PageData[];
  issues: string[];
  recommendations: string[];
  error?: string;
}

export interface KeywordGap {
  keyword: string;
  competitor_usage: number;
  priority: 'high' | 'medium' | 'low';
  volume: string;
  difficulty: string;
  current_rank?: string;
  cpc?: string;
}

export interface AnalysisResult {
  success: boolean;
  job_id?: string;
  status?: string;
  data?: {
    your_site: SiteAnalysis;
    competitors: Record<string, SiteAnalysis>;
    content_gaps?: { keyword_gaps: KeywordGap[] };
    analyzed_at?: string;
  };
  remaining_quota?: number;
  cached?: boolean;
  error?: string;
}

// Ads Analysis types
export interface SocialAccounts {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface AdsPlatform {
  status: string;
  url: string;
  note?: string;
  username?: string;
}

export interface AdsAnalysisResult {
  success: boolean;
  data?: {
    social_accounts: SocialAccounts;
    platforms: {
      meta: AdsPlatform;
      tiktok: AdsPlatform;
      google: AdsPlatform;
    };
  };
  error?: string;
}

// SEO Comparison types
export interface SEOComparisonResult {
  success: boolean;
  data?: {
    your_site: SiteAnalysis;
    competitors: Record<string, SiteAnalysis>;
    insights: string[];
  };
  error?: string;
}

// Keyword Analysis types
export interface KeywordData {
  term: string;
  volume: string;
  difficulty: string;
  priority: string;
  current_rank: string;
  cpc: string;
}

export interface KeywordAnalysisResult {
  success: boolean;
  data?: {
    site_analysis: SiteAnalysis;
    keywords: KeywordData[];
    opportunities: number;
    recommendations: string[];
  };
  error?: string;
}

// Sentiment Analysis types
export interface SentimentResult {
  success: boolean;
  sentiment?: {
    score: number;
    magnitude: number;
    label: 'Positive' | 'Negative' | 'Neutral';
  };
  entities?: Array<{
    name: string;
    type: string;
    salience: number;
  }>;
  error?: string;
}

// Vision AI types
export interface VisionAIResult {
  success: boolean;
  data?: {
    logos: Array<{ name: string; confidence: number }>;
    web_entities: Array<{ name: string; score: number }>;
    labels: Array<{ name: string; confidence: number }>;
  };
  error?: string;
}

// Admin types
export interface AdminStats {
  total_users: number;
  online_users: number;
  total_reports: number;
  reports_today: number;
}

export interface ActivityLog {
  id: number;
  user_email: string;
  action: string;
  details: string | null;
  ip_address: string | null;
  geo_location: string | null;
  created_at: string;
}

export interface AdminUsersResponse {
  users: User[];
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
}

// API Error
export interface APIError {
  detail: string;
  status?: number;
}

// Generic API Response wrapper
export interface APIResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
