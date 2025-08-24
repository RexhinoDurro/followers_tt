// types/index.ts - All type definitions
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  avatar?: string;
  company?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  package: string;
  monthlyFee: number;
  startDate: string;
  status: 'active' | 'pending' | 'paused';
  paymentStatus: 'paid' | 'overdue' | 'pending';
  platforms: string[];
  accountManager: string;
  nextPayment: string;
  totalSpent: number;
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  description: string;
  createdAt: string;
}

export interface ContentPost {
  id: string;
  clientId: string;
  platform: string;
  content: string;
  scheduledDate: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  imageUrl?: string;
  engagementRate?: number;
}

export interface PerformanceData {
  id: string;
  clientId: string;
  month: string;
  followers: number;
  engagement: number;
  reach: number;
  clicks: number;
  impressions: number;
  growthRate: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  invoiceNumber: string;
  createdAt: string;
}

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
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