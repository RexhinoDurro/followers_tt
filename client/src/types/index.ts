// client/src/types/index.ts - Complete type definitions
import React from 'react';
export * from './events';

// Authentication & User Types
export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'client';
  company?: string;
  avatar?: string;
  bio?: string;
  // Computed property for full name
  name?: string;
}

// Social Media Account Types
export interface SocialMediaAccount {
  id: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook';
  account_id: string;
  username: string;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface RealTimeMetrics {
  id: string;
  account: SocialMediaAccount;
  date: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  reach: number;
  impressions: number;
  profile_views: number;
  website_clicks: number;
  daily_growth: number;
  created_at: string;
}

export interface PostMetrics {
  id: string;
  account: SocialMediaAccount;
  post_id: string;
  caption: string;
  media_type: 'image' | 'video' | 'carousel';
  posted_at: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  created_at: string;
  updated_at: string;
}

// Business Logic Types
export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  package: string;
  monthly_fee: number;
  start_date: string;
  status: 'active' | 'pending' | 'paused';
  payment_status: 'paid' | 'overdue' | 'pending';
  platforms: string[];
  account_manager: string;
  next_payment: string;
  total_spent: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  client: string; // Client ID
  client_name: string;
  assigned_to: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPost {
  id: string;
  client: string; // Client ID
  client_name: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'facebook';
  content: string;
  scheduled_date: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  image_url?: string;
  engagement_rate?: number;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceData {
  id: string;
  client: string; // Client ID
  client_name: string;
  month: string;
  followers: number;
  engagement: number;
  reach: number;
  clicks: number;
  impressions: number;
  growth_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender: string; // User ID
  sender_name: string;
  receiver: string; // User ID
  receiver_name: string;
  content: string;
  read: boolean;
  timestamp: string;
}

export interface Invoice {
  id: string;
  client: string; // Client ID
  client_name: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  paid_at?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user: string; // User ID
  title: string;
  message: string;
  notification_type: 'task_assigned' | 'payment_due' | 'content_approved' | 'message_received' | 'performance_update';
  read: boolean;
  created_at: string;
}

// Update NotificationSerializer type if needed
export interface NotificationSerializer {
  id: string;
  user: string;
  title: string;
  message: string;
  notification_type: string;
  read: boolean;
  created_at: string;
}

// Service-related types
export interface Service {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  type: 'followers' | 'likes' | 'comments' | 'views' | 'shares' | 'subscribers';
  description: string;
  icon: string;
  minQuantity: number;
  maxQuantity: number;
  basePrice: number;
  features: string[];
}

export interface ServiceCategory {
  platform: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  services: Service[];
}

export interface Package {
  id: string;
  serviceId: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  popular?: boolean;
  features: string[];
  deliveryTime: string;
  guarantee: string;
}

// Dashboard Statistics Types
export interface DashboardStats {
  total_revenue: number;
  active_clients: number;
  pending_tasks: number;
  overdue_payments: number;
  total_followers_delivered: number;
  monthly_growth_rate: number;
}

export interface ClientDashboardStats {
  total_followers: number;
  engagement_rate: number;
  posts_this_month: number;
  reach: number;
  growth_rate: number;
  next_payment_amount: number;
  next_payment_date: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T[];
  results?: T[];
  accounts?: T[];
  count?: number;
  next?: string;
  previous?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// OAuth Types
export interface OAuthInitiateResponse {
  oauth_url: string;
  state: string;
}

export interface OAuthCallbackResponse {
  message: string;
  account: {
    id: string;
    platform: string;
    username: string;
    created: boolean;
  };
}

export interface ConnectedAccountsResponse {
  accounts: Array<{
    id: string;
    platform: string;
    username: string;
    is_active: boolean;
    last_sync: string | null;
    created_at: string;
    followers_count: number;
    engagement_rate: number;
    posts_count: number;
  }>;
  total_count: number;
}

// Sync Types
export interface SyncLog {
  id: string;
  sync_type: 'profile' | 'posts' | 'metrics';
  status: 'success' | 'failed' | 'in_progress';
  records_processed: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration?: number;
}

export interface SyncStatusResponse {
  account: {
    id: string;
    platform: string;
    username: string;
    is_active: boolean;
    last_sync: string | null;
  };
  sync_logs: SyncLog[];
  can_sync_now: boolean;
}

// UI Component Types
export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'client';
  company?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Analytics Types
export interface AnalyticsOverview {
  client_growth: Array<{
    date: string;
    count: number;
  }>;
  revenue_trends: Array<{
    month: string;
    total: number;
  }>;
  task_stats: {
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
  };
  completion_rate: number;
}

export interface ClientPerformanceReport {
  client_name: string;
  period: string;
  performance_data: PerformanceData[];
  summary: {
    follower_growth: number;
    avg_engagement: number;
    total_reach: number;
    current_followers: number;
  };
  content_stats: {
    total_posts: number;
    approved_posts: number;
    posted_content: number;
  };
}

// File Upload Types
export interface FileUpload {
  id: string;
  name: string;
  file: string; // URL
  file_type: 'image' | 'video' | 'document' | 'other';
  client: string; // Client ID
  client_name: string;
  uploaded_by: string; // User ID
  uploaded_by_name: string;
  size: number;
  created_at: string;
}

// Bulk Operation Types
export interface BulkTaskUpdate {
  task_ids: string[];
  status?: Task['status'];
  assigned_to?: string;
  priority?: Task['priority'];
}

export interface BulkContentApproval {
  content_ids: string[];
  action: 'approve' | 'reject';
  feedback?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface GrowthChartData {
  followers: ChartDataPoint[];
  engagement: ChartDataPoint[];
  reach: ChartDataPoint[];
}

// Platform-specific Types
export interface InstagramMetrics extends RealTimeMetrics {
  stories_views?: number;
  reel_plays?: number;
  saved_posts?: number;
}

export interface YouTubeMetrics extends RealTimeMetrics {
  subscribers_gained?: number;
  subscribers_lost?: number;
  watch_time_minutes?: number;
  avg_view_duration?: number;
}

export interface TikTokMetrics extends RealTimeMetrics {
  video_views?: number;
  shares_count?: number;
  trending_score?: number;
}

// Context Types
export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterFormData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface DataContextType {
  clients: Client[];
  tasks: Task[];
  content: ContentPost[];
  performance: PerformanceData[];
  messages: Message[];
  invoices: Invoice[];
  refreshData: () => void;
  loading: boolean;
  error: string | null;
}

// Hook Return Types
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((val: T) => T)) => void;
  removeValue: () => void;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Constants
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  FACEBOOK: 'facebook'
} as const;

export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed'
} as const;

export const CONTENT_STATUSES = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending-approval',
  APPROVED: 'approved',
  POSTED: 'posted'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client'
} as const;

// Utility Types
export type Platform = keyof typeof PLATFORMS;
export type TaskStatus = keyof typeof TASK_STATUSES;
export type ContentStatus = keyof typeof CONTENT_STATUSES;
export type UserRole = keyof typeof USER_ROLES;