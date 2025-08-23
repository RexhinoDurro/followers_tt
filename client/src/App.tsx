// File: client/src/App.tsx
// Complete SMMA Dashboard System with Django Backend Integration

import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, DollarSign, Users, MessageSquare, BarChart3, Settings, LogOut, Eye, EyeOff, Plus, Search, Download, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, Target, FileText, Bell, Menu, X } from 'lucide-react';

// Types
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  avatar?: string;
  company?: string;
}

interface Client {
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

interface Task {
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

interface ContentPost {
  id: string;
  clientId: string;
  platform: string;
  content: string;
  scheduledDate: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  imageUrl?: string;
  engagementRate?: number;
}

interface PerformanceData {
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

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  invoiceNumber: string;
  createdAt: string;
}

// API Service
class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  
  private getHeaders(includeAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Auth
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data.user;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'client';
    company?: string;
  }): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/auth/register/`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Registration failed');
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data.user;
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout/`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<AuthUser> {
    const response = await fetch(`${this.baseUrl}/auth/me/`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to get current user');
    return response.json();
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const response = await fetch(`${this.baseUrl}/clients/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const response = await fetch(`${this.baseUrl}/clients/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    return response.json();
  }

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    const response = await fetch(`${this.baseUrl}/clients/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(clientData)
    });
    return response.json();
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData)
    });
    return response.json();
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData)
    });
    return response.json();
  }

  // Content
  async getContent(): Promise<ContentPost[]> {
    const response = await fetch(`${this.baseUrl}/content/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createContent(contentData: Partial<ContentPost>): Promise<ContentPost> {
    const response = await fetch(`${this.baseUrl}/content/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(contentData)
    });
    return response.json();
  }

  async updateContent(id: string, contentData: Partial<ContentPost>): Promise<ContentPost> {
    const response = await fetch(`${this.baseUrl}/content/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(contentData)
    });
    return response.json();
  }

  // Performance
  async getPerformanceData(clientId?: string): Promise<PerformanceData[]> {
    const url = clientId 
      ? `${this.baseUrl}/performance/?client_id=${clientId}`
      : `${this.baseUrl}/performance/`;
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createPerformanceData(data: Partial<PerformanceData>): Promise<PerformanceData> {
    const response = await fetch(`${this.baseUrl}/performance/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/messages/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async sendMessage(messageData: {
    receiverId: string;
    content: string;
  }): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(messageData)
    });
    return response.json();
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${this.baseUrl}/invoices/`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/invoices/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(invoiceData)
    });
    return response.json();
  }
}

// Context
const AuthContext = createContext<{
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}>({
  user: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: true
});

const DataContext = createContext<{
  clients: Client[];
  tasks: Task[];
  content: ContentPost[];
  performance: PerformanceData[];
  messages: Message[];
  invoices: Invoice[];
  refreshData: () => void;
  loading: boolean;
}>({
  clients: [],
  tasks: [],
  content: [],
  performance: [],
  messages: [],
  invoices: [],
  refreshData: () => {},
  loading: true
});

// UI Components
const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 justify-center';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', title, action }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    primary: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Input = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <input
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
      } ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-50`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Auth Components
const AuthForm = ({ isLogin, onToggle, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    role: 'client' as 'admin' | 'client'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const api = new ApiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await api.login(formData.email, formData.password);
      } else {
        await api.register(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your SMMA dashboard' : 'Join our SMMA platform'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <Input
                label="Company Name"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'client' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Layout
const DashboardLayout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigation = user?.role === 'admin' ? [
    { name: 'Overview', href: '#overview', icon: BarChart3 },
    { name: 'Clients', href: '#clients', icon: Users },
    { name: 'Tasks', href: '#tasks', icon: CheckCircle },
    { name: 'Content', href: '#content', icon: FileText },
    { name: 'Performance', href: '#performance', icon: TrendingUp },
    { name: 'Messages', href: '#messages', icon: MessageSquare },
    { name: 'Invoices', href: '#invoices', icon: DollarSign },
    { name: 'Settings', href: '#settings', icon: Settings }
  ] : [
    { name: 'Overview', href: '#overview', icon: BarChart3 },
    { name: 'Content', href: '#content', icon: FileText },
    { name: 'Performance', href: '#performance', icon: TrendingUp },
    { name: 'Messages', href: '#messages', icon: MessageSquare },
    { name: 'Billing', href: '#billing', icon: DollarSign }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <h1 className="text-xl font-bold text-white">SMMA Pro</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Admin Dashboard Components
const AdminOverview = () => {
  const { clients, tasks, performance, invoices } = useContext(DataContext);
  
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const overduePayments = invoices.filter(inv => inv.status === 'overdue').length;

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { name: 'Active Clients', value: activeClients, icon: Users, color: 'text-blue-600' },
    { name: 'Pending Tasks', value: pendingTasks, icon: Clock, color: 'text-yellow-600' },
    { name: 'Overdue Payments', value: overduePayments, icon: AlertCircle, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Tasks">
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <Badge variant={
                  task.status === 'completed' ? 'success' :
                  task.status === 'in-progress' ? 'primary' :
                  task.priority === 'high' ? 'danger' : 'default'
                }>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Client Status">
          <div className="space-y-4">
            {clients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    client.paymentStatus === 'paid' ? 'success' :
                    client.paymentStatus === 'overdue' ? 'danger' : 'warning'
                  }>
                    {client.paymentStatus}
                  </Badge>
                  <Badge variant={
                    client.status === 'active' ? 'success' :
                    client.status === 'pending' ? 'warning' : 'default'
                  }>
                    {client.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const ClientManagement = () => {
  const { clients, refreshData } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (client?: Client) => {
    setSelectedClient(client || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Client List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.package}</div>
                    <div className="text-sm text-gray-500">{client.platforms.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${client.monthlyFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      client.status === 'active' ? 'success' :
                      client.status === 'pending' ? 'warning' : 'default'
                    }>
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      client.paymentStatus === 'paid' ? 'success' :
                      client.paymentStatus === 'overdue' ? 'danger' : 'warning'
                    }>
                      {client.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(client)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={selectedClient}
        onSave={refreshData}
      />
    </div>
  );
};

// Client Modal Component
interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, client, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    package: '',
    monthlyFee: 0,
    platforms: [],
    accountManager: '',
    status: 'pending' as const
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        company: client.company,
        package: client.package,
        monthlyFee: client.monthlyFee,
        platforms: client.platforms,
        accountManager: client.accountManager,
        status: client.status
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: '',
        package: '',
        monthlyFee: 0,
        platforms: [],
        accountManager: '',
        status: 'pending'
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const api = new ApiService();
    
    try {
      if (client) {
        await api.updateClient(client.id, formData);
      } else {
        await api.createClient(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save client:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Edit Client' : 'Add Client'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
          <Input
            label="Package"
            value={formData.package}
            onChange={(e) => setFormData({ ...formData, package: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Monthly Fee"
            type="number"
            value={formData.monthlyFee}
            onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
            required
          />
          <Input
            label="Account Manager"
            value={formData.accountManager}
            onChange={(e) => setFormData({ ...formData, accountManager: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {client ? 'Update Client' : 'Add Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const TaskManagement = () => {
  const { tasks, clients, refreshData } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const openModal = (task?: Task) => {
    setSelectedTask(task || null);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'review': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const client = clients.find(c => c.id === task.clientId);
          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600">{task.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Client:</span>
                    <span className="text-sm font-medium">{client?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Assigned:</span>
                    <span className="text-sm font-medium">{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Due:</span>
                    <span className="text-sm font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => openModal(task)}>
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSave={refreshData}
      />
    </div>
  );
};

const TaskModal = ({ isOpen, onClose, task, onSave }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    assignedTo: '',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        clientId: task.clientId,
        assignedTo: task.assignedTo,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate.split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        description: '',
        clientId: '',
        assignedTo: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const api = new ApiService();
    
    try {
      if (task) {
        await api.updateTask(task.id, formData);
      } else {
        await api.createTask(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="Assigned To"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {task ? 'Update Task' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ContentManagement = () => {
  const { content, clients } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentPost | null>(null);

  const openModal = (content?: ContentPost) => {
    setSelectedContent(content || null);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'success';
      case 'approved': return 'primary';
      case 'pending-approval': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4" />
          Create Content
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((post) => {
          const client = clients.find(c => c.id === post.clientId);
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{post.platform}</span>
                    <Badge variant={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Client:</span>
                    <span className="text-sm font-medium">{client?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Scheduled:</span>
                    <span className="text-sm font-medium">
                      {new Date(post.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex space-x-2">
                    {post.status === 'pending-approval' && (
                      <>
                        <Button variant="success" size="sm">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="danger" size="sm">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openModal(post)}>
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content Modal */}
      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={selectedContent}
        onSave={() => {}}
      />
    </div>
  );
};

const ContentModal = ({ isOpen, onClose, content, onSave }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState({
    clientId: '',
    platform: '',
    content: '',
    scheduledDate: '',
    status: 'draft' as const
  });

  useEffect(() => {
    if (content) {
      setFormData({
        clientId: content.clientId,
        platform: content.platform,
        content: content.content,
        scheduledDate: content.scheduledDate,
        status: content.status
      });
    } else {
      setFormData({
        clientId: '',
        platform: '',
        content: '',
        scheduledDate: '',
        status: 'draft'
      });
    }
  }, [content]);

  const platforms = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={content ? 'Edit Content' : 'Create Content'}>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Platform</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Write your post content..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Scheduled Date"
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="pending-approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="posted">Posted</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {content ? 'Update Content' : 'Create Content'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Client Dashboard Components
const ClientOverview = ({ user }) => {
  const { performance, content, invoices } = useContext(DataContext);
  
  const clientPerformance = performance.find(p => p.clientId === user?.id);
  const clientContent = content.filter(c => c.clientId === user?.id);
  const clientInvoices = invoices.filter(i => i.clientId === user?.id);

  const stats = [
    { name: 'Total Followers', value: clientPerformance?.followers.toLocaleString() || '0', icon: Users, color: 'text-blue-600' },
    { name: 'Engagement Rate', value: `${clientPerformance?.engagement || 0}%`, icon: TrendingUp, color: 'text-green-600' },
    { name: 'Posts This Month', value: clientContent.length, icon: FileText, color: 'text-purple-600' },
    { name: 'Reach', value: clientPerformance?.reach?.toLocaleString() || '0', icon: Target, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Content">
          <div className="space-y-4">
            {clientContent.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{post.platform}</p>
                  <p className="text-sm text-gray-600 truncate">{post.content}</p>
                </div>
                <Badge variant={
                  post.status === 'posted' ? 'success' :
                  post.status === 'approved' ? 'primary' :
                  post.status === 'pending-approval' ? 'warning' : 'default'
                }>
                  {post.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Payment History">
          <div className="space-y-4">
            {clientInvoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${invoice.amount}</p>
                  <Badge variant={
                    invoice.status === 'paid' ? 'success' :
                    invoice.status === 'overdue' ? 'danger' : 'warning'
                  }>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Main App Components
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const api = new ApiService();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await api.login(email, password);
      setUser(userData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const newUser = await api.register(userData);
      setUser(newUser);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Handle error
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const DataProvider = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const api = new ApiService();

  const refreshData = async () => {
    setLoading(true);
    try {
      const [
        clientsData,
        tasksData,
        contentData,
        performanceData,
        messagesData,
        invoicesData
      ] = await Promise.all([
        api.getClients(),
        api.getTasks(),
        api.getContent(),
        api.getPerformanceData(),
        api.getMessages(),
        api.getInvoices()
      ]);

      setClients(clientsData);
      setTasks(tasksData);
      setContent(contentData);
      setPerformance(performanceData);
      setMessages(messagesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{
      clients,
      tasks,
      content,
      performance,
      messages,
      invoices,
      refreshData,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('overview');

  const renderAdminView = () => {
    switch (currentView) {
      case 'clients':
        return <ClientManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'content':
        return <ContentManagement />;
      case 'performance':
        return <PerformanceManagement />;
      case 'messages':
        return <MessageCenter />;
      case 'invoices':
        return <InvoiceManagement />;
      default:
        return <AdminOverview />;
    }
  };

  const renderClientView = () => {
    switch (currentView) {
      case 'content':
        return <ClientContent user={user} />;
      case 'performance':
        return <ClientPerformance user={user} />;
      case 'messages':
        return <ClientMessages user={user} />;
      case 'billing':
        return <ClientBilling user={user} />;
      default:
        return <ClientOverview user={user} />;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      setCurrentView(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <DashboardLayout user={user} onLogout={() => {}}>
      {user?.role === 'admin' ? renderAdminView() : renderClientView()}
    </DashboardLayout>
  );
};

// Additional Admin Components
const PerformanceManagement = () => {
  const { performance, clients } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Performance Data
        </Button>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client) => {
          const clientPerf = performance.find(p => p.clientId === client.id);
          return (
            <Card key={client.id} title={client.name}>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {clientPerf?.followers.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {clientPerf?.engagement || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Engagement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {clientPerf?.reach?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-gray-600">Reach</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {clientPerf?.clicks?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-gray-600">Clicks</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Performance Input Modal */}
      <PerformanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {}}
      />
    </div>
  );
};

const PerformanceModal = ({ isOpen, onClose, onSave }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState({
    clientId: '',
    month: '',
    followers: 0,
    engagement: 0,
    reach: 0,
    clicks: 0,
    impressions: 0,
    growthRate: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const api = new ApiService();
    
    try {
      await api.createPerformanceData(formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save performance data:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Performance Data">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="Month"
            type="month"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Followers"
            type="number"
            value={formData.followers}
            onChange={(e) => setFormData({ ...formData, followers: Number(e.target.value) })}
          />
          
          <Input
            label="Engagement %"
            type="number"
            step="0.01"
            value={formData.engagement}
            onChange={(e) => setFormData({ ...formData, engagement: Number(e.target.value) })}
          />
          
          <Input
            label="Growth Rate %"
            type="number"
            step="0.01"
            value={formData.growthRate}
            onChange={(e) => setFormData({ ...formData, growthRate: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Reach"
            type="number"
            value={formData.reach}
            onChange={(e) => setFormData({ ...formData, reach: Number(e.target.value) })}
          />
          
          <Input
            label="Clicks"
            type="number"
            value={formData.clicks}
            onChange={(e) => setFormData({ ...formData, clicks: Number(e.target.value) })}
          />
          
          <Input
            label="Impressions"
            type="number"
            value={formData.impressions}
            onChange={(e) => setFormData({ ...formData, impressions: Number(e.target.value) })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Performance Data
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const MessageCenter = () => {
  const { messages, clients } = useContext(DataContext);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = async (receiverId: string, content: string) => {
    const api = new ApiService();
    try {
      await api.sendMessage({ receiverId, content });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Message Center</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Client List */}
        <Card title="Clients" className="h-full">
          <div className="space-y-2 overflow-y-auto">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedChat(client.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat === client.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card title={selectedChat ? clients.find(c => c.id === selectedChat)?.name : 'Select a client'} className="h-full">
            {selectedChat ? (
              <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages
                    .filter(m => m.receiverId === selectedChat || m.senderId === selectedChat)
                    .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === selectedChat ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderId === selectedChat 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        sendMessage(selectedChat, newMessage.trim());
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (newMessage.trim()) {
                        sendMessage(selectedChat, newMessage.trim());
                      }
                    }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a client to start messaging
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const InvoiceManagement = () => {
  const { invoices, clients } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => {
                const client = clients.find(c => c.id === invoice.clientId);
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        invoice.status === 'paid' ? 'success' :
                        invoice.status === 'overdue' ? 'danger' : 'warning'
                      }>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      {invoice.status !== 'paid' && (
                        <Button variant="success" size="sm">
                          Mark Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => {}}
      />
    </div>
  );
};

const InvoiceModal = ({ isOpen, onClose, onSave }) => {
  const { clients } = useContext(DataContext);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: 0,
    dueDate: '',
    invoiceNumber: `INV-${Date.now()}`
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice">
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="Invoice Number"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            required
          />
          
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Client Components
const ClientContent = ({ user }) => {
  const { content } = useContext(DataContext);
  const clientContent = content.filter(c => c.clientId === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Content</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientContent.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-900">{post.platform}</span>
                <Badge variant={
                  post.status === 'posted' ? 'success' :
                  post.status === 'approved' ? 'primary' :
                  post.status === 'pending-approval' ? 'warning' : 'default'
                }>
                  {post.status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Scheduled:</span>
                  <span className="text-sm font-medium">
                    {new Date(post.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              {post.status === 'pending-approval' && (
                <div className="flex space-x-2 pt-3 border-t">
                  <Button variant="success" size="sm" className="flex-1">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" className="flex-1">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ClientPerformance = ({ user }) => {
  const { performance } = useContext(DataContext);
  const clientPerf = performance.find(p => p.clientId === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Performance</h1>
      
      {clientPerf ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-3xl font-bold text-gray-900">{clientPerf.followers.toLocaleString()}</p>
            <p className="text-gray-600">Total Followers</p>
          </Card>
          
          <Card className="text-center">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-3xl font-bold text-gray-900">{clientPerf.engagement}%</p>
            <p className="text-gray-600">Engagement Rate</p>
          </Card>
          
          <Card className="text-center">
            <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <p className="text-3xl font-bold text-gray-900">{clientPerf.reach.toLocaleString()}</p>
            <p className="text-gray-600">Monthly Reach</p>
          </Card>
          
          <Card className="text-center">
            <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <p className="text-3xl font-bold text-gray-900">{clientPerf.growthRate}%</p>
            <p className="text-gray-600">Growth Rate</p>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
          <p className="text-gray-600">Performance data will appear here once available.</p>
        </Card>
      )}
    </div>
  );
};

const ClientMessages = ({ user }) => {
  const { messages } = useContext(DataContext);
  const [newMessage, setNewMessage] = useState('');
  const userMessages = messages.filter(m => m.senderId === user?.id || m.receiverId === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      
      <Card className="h-96">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {userMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === user?.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Button>Send</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ClientBilling = ({ user }) => {
  const { invoices, clients } = useContext(DataContext);
  const client = clients.find(c => c.id === user?.id);
  const clientInvoices = invoices.filter(i => i.clientId === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
      
      {/* Package Info */}
      {client && (
        <Card title="Current Package">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Package</p>
              <p className="font-semibold">{client.package}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Fee</p>
              <p className="font-semibold">${client.monthlyFee}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Payment</p>
              <p className="font-semibold">{new Date(client.nextPayment).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={client.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {client.paymentStatus}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Invoice History */}
      <Card title="Payment History">
        <div className="space-y-3">
          {clientInvoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">#{invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${invoice.amount}</p>
                <Badge variant={
                  invoice.status === 'paid' ? 'success' :
                  invoice.status === 'overdue' ? 'danger' : 'warning'
                }>
                  {invoice.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Main App
const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        isLogin={isLogin}
        onToggle={() => setIsLogin(!isLogin)}
        onSuccess={() => window.location.reload()}
      />
    );
  }

  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
};

// Export wrapped in providers
export default function SMMAPro() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}