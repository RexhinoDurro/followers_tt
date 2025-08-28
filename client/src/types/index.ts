// client/src/types/index.ts - Updated AuthUser type to match backend
export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'client';
  company?: string;
  avatar?: string;
  // Computed property for full name
  name?: string;
}

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
}

export interface Task {
  id: string;
  title: string;
  client_name: string;
  assigned_to: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  description: string;
  created_at: string;
}

export interface ContentPost {
  id: string;
  client_name: string;
  platform: string;
  content: string;
  scheduled_date: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  image_url?: string;
  engagement_rate?: number;
}

export interface PerformanceData {
  id: string;
  client_name: string;
  month: string;
  followers: number;
  engagement: number;
  reach: number;
  clicks: number;
  impressions: number;
  growth_rate: number;
}

export interface Message {
  id: string;
  sender_name: string;
  receiver_name: string;
  content: string;
  read: boolean;
  timestamp: string;
}

export interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
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