// Authentication & User Types
export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "client"
  company?: string
  avatar?: string
  bio?: string
  name?: string
}

// Social Media Account Types
export interface SocialMediaAccount {
  id: string
  platform: "instagram" | "youtube" | "tiktok" | "twitter" | "linkedin" | "facebook"
  account_id: string
  username: string
  is_active: boolean
  last_sync: string | null
  created_at: string
  updated_at: string
}

export interface RealTimeMetrics {
  id: string
  account: SocialMediaAccount
  date: string
  followers_count: number
  following_count: number
  posts_count: number
  engagement_rate: number
  reach: number
  impressions: number
  profile_views: number
  website_clicks: number
  daily_growth: number
  created_at: string
}

export interface PostMetrics {
  id: string
  account: SocialMediaAccount
  post_id: string
  caption: string
  media_type: "image" | "video" | "carousel"
  posted_at: string
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  engagement_rate: number
  created_at: string
  updated_at: string
}

// Business Logic Types
export interface Client {
  id: string
  name: string
  email: string
  company: string
  package: string
  monthly_fee: number
  start_date: string
  status: "active" | "pending" | "paused"
  payment_status: "paid" | "overdue" | "pending"
  platforms: string[]
  account_manager: string
  next_payment: string
  total_spent: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  client: string
  client_name: string
  assigned_to: string
  status: "pending" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high"
  due_date: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ContentPost {
  id: string
  client: string
  client_name: string
  platform: "instagram" | "youtube" | "tiktok" | "twitter" | "linkedin" | "facebook"
  content: string
  scheduled_date: string
  status: "draft" | "pending-approval" | "approved" | "posted"
  image_url?: string
  engagement_rate?: number
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  posted_at?: string
  created_at: string
  updated_at: string
}

export interface PerformanceData {
  id: string
  client: string
  client_name: string
  month: string
  followers: number
  engagement: number
  reach: number
  clicks: number
  impressions: number
  growth_rate: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender: string
  sender_name: string
  receiver: string
  receiver_name: string
  content: string
  read: boolean
  timestamp: string
}

export interface Invoice {
  id: string
  client: string
  client_name: string
  invoice_number: string
  amount: number
  due_date: string
  status: "paid" | "pending" | "overdue"
  paid_at?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user: string
  title: string
  message: string
  notification_type: "task_assigned" | "payment_due" | "content_approved" | "message_received" | "performance_update"
  read: boolean
  created_at: string
  timestamp?: string
}

// Dashboard Statistics Types
export interface DashboardStats {
  total_revenue: number
  active_clients: number
  pending_tasks: number
  overdue_payments: number
  total_followers_delivered: number
  monthly_growth_rate: number
}

export interface ClientDashboardStats {
  total_followers: number
  engagement_rate: number
  posts_this_month: number
  reach: number
  growth_rate: number
  next_payment_amount: number
  next_payment_date: string
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  name: string
  role: "admin" | "client"
  company?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

// Context Types
export interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterFormData) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

// Constants
export const PLATFORMS = {
  INSTAGRAM: "instagram",
  YOUTUBE: "youtube",
  TIKTOK: "tiktok",
  TWITTER: "twitter",
  LINKEDIN: "linkedin",
  FACEBOOK: "facebook",
} as const

export const TASK_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  REVIEW: "review",
  COMPLETED: "completed",
} as const

export const CONTENT_STATUSES = {
  DRAFT: "draft",
  PENDING_APPROVAL: "pending-approval",
  APPROVED: "approved",
  POSTED: "posted",
} as const

export const USER_ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
} as const
