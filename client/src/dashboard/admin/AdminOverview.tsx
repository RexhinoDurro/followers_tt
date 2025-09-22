// client/src/pages/admin/AdminOverview.tsx - Enhanced with Full Functionality
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  Clock, 
  AlertCircle,
  FileText,
  MessageSquare,
  RefreshCw,
  Plus,
  Target,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { Card, Badge, Button, Modal, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';

interface DashboardStats {
  total_revenue: number | string;
  active_clients: number | string;
  pending_tasks: number | string;
  overdue_payments: number | string;
  total_followers_delivered: number | string;
  monthly_growth_rate: number | string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  package: string;
  monthly_fee: number;
  status: 'active' | 'pending' | 'paused';
  payment_status: 'paid' | 'overdue' | 'pending';
  platforms: string[];
  next_payment: string;
  total_spent: number;
  account_manager: string;
  created_at: string;
}

interface Task {
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

interface ContentPost {
  id: string;
  client_name: string;
  platform: string;
  content: string;
  scheduled_date: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  engagement_rate?: number;
  created_at: string;
}

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

const AdminOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [] = useState<string | null>(null);
  const [] = useState<string[]>([]);

  // Modal states
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState<Client | null>(null);

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    client: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: ''
  });

  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: '',
    due_date: '',
    description: ''
  });

  // Helper function to safely convert to number and format
  const safeNumber = (value: number | string | null | undefined, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
  };

  const formatCurrency = (value: number | string | null | undefined): string => {
    const num = safeNumber(value);
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, clientsData, tasksData, contentData, invoicesData] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getClients(),
        ApiService.getTasks(),
        ApiService.getContent(),
        ApiService.getInvoices(),
      ]);

      setStats(statsData as DashboardStats);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setTasks(
        Array.isArray(tasksData)
          ? tasksData
          : (typeof tasksData === 'object' && tasksData !== null && Array.isArray((tasksData as any).results))
            ? (tasksData as any).results
            : []
      );
      setContent(
        Array.isArray(contentData)
          ? contentData
          : (typeof contentData === 'object' && contentData !== null && 'results' in contentData && Array.isArray((contentData as any).results))
            ? (contentData as any).results
            : []
      );
      setInvoices(
        Array.isArray(invoicesData)
          ? invoicesData
          : (typeof invoicesData === 'object' && invoicesData !== null && 'results' in invoicesData && Array.isArray((invoicesData as any).results))
            ? (invoicesData as any).results
            : []
      );
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await ApiService.updateTask(taskId, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleContentApproval = async (contentId: string, approve: boolean) => {
    try {
      if (approve) {
        await ApiService.approveContent(contentId);
      } else {
        await ApiService.rejectContent(contentId);
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to update content:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createTask(newTask);
      setShowCreateTask(false);
      setNewTask({
        title: '',
        description: '',
        client: '',
        assigned_to: '',
        priority: 'medium',
        due_date: ''
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...newInvoice,
        amount: parseFloat(newInvoice.amount),
        invoice_number: `INV-${Date.now()}`
      };
      await ApiService.createInvoice(invoiceData);
      setShowCreateInvoice(false);
      setNewInvoice({
        client: '',
        amount: '',
        due_date: '',
        description: ''
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to create invoice:', err);
    }
  };

  const handlePaymentStatusUpdate = async (clientId: string, status: string) => {
    try {
      await ApiService.updatePaymentStatus(clientId, status);
      await fetchData();
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  const handleMarkInvoicePaid = async (invoiceId: string) => {
    try {
      await ApiService.markInvoicePaid(invoiceId);
      await fetchData();
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      name: 'Monthly Revenue', 
      value: formatCurrency(stats?.total_revenue), 
      icon: DollarSign, 
      color: 'text-green-600',
      trend: safeNumber(stats?.total_revenue) > 0 ? '+12%' : null 
    },
    { 
      name: 'Active Clients', 
      value: safeNumber(stats?.active_clients).toString(), 
      icon: Users, 
      color: 'text-blue-600',
      trend: '+3 this week'
    },
    { 
      name: 'Pending Tasks', 
      value: safeNumber(stats?.pending_tasks).toString(), 
      icon: Clock, 
      color: 'text-yellow-600',
      trend: null
    },
    { 
      name: 'Overdue Payments', 
      value: safeNumber(stats?.overdue_payments).toString(), 
      icon: AlertCircle, 
      color: 'text-red-600',
      trend: null
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.first_name || user.name || 'Admin'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your agency today.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <Button onClick={() => setShowCreateInvoice(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.trend && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stat.trend}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gray-50`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card title="Recent Tasks" action={
          <Button size="sm" variant="outline" onClick={() => setShowCreateTask(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        }>
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">{task.title}</p>
                    <Badge variant={
                      task.priority === 'high' ? 'danger' :
                      task.priority === 'medium' ? 'warning' : 'default'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {task.client_name} • Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{task.assigned_to}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-6">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No tasks found</p>
              </div>
            )}
          </div>
        </Card>

        {/* Client Overview */}
        <Card title="Client Status" action={
          <Button size="sm" variant="outline">
            <Users className="w-4 h-4 mr-1" />
            Manage Clients
          </Button>
        }>
          <div className="space-y-4">
            {clients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <Badge variant={
                      client.status === 'active' ? 'success' :
                      client.status === 'pending' ? 'warning' : 'default'
                    }>
                      {client.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{client.company}</p>
                  <p className="text-sm text-gray-500">
                    ${client.monthly_fee}/month • Next: {new Date(client.next_payment).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-1 mt-2">
                    {client.platforms && client.platforms.map((platform, idx) => (
                      <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    client.payment_status === 'paid' ? 'success' :
                    client.payment_status === 'overdue' ? 'danger' : 'warning'
                  }>
                    {client.payment_status}
                  </Badge>
                  <button
                    onClick={() => setShowClientDetails(client)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {clients.length === 0 && (
              <div className="text-center py-6">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No clients found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Content Approval Section */}
      <Card title="Content Pending Approval" action={
        <Button size="sm" variant="outline">
          <FileText className="w-4 h-4 mr-1" />
          View All Content
        </Button>
      }>
        <div className="space-y-4">
          {content.filter(c => c.status === 'pending-approval').slice(0, 3).map((post) => (
            <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{post.client_name}</span>
                    <Badge variant="primary">{post.platform}</Badge>
                    <span className="text-sm text-gray-500">
                      Scheduled: {new Date(post.scheduled_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="success"
                    onClick={() => handleContentApproval(post.id, true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleContentApproval(post.id, false)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
                <Badge variant="warning">Pending Review</Badge>
              </div>
            </div>
          ))}
          {content.filter(c => c.status === 'pending-approval').length === 0 && (
            <div className="text-center py-6">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No content pending approval</p>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Invoices */}
      <Card title="Recent Invoices" action={
        <Button size="sm" variant="outline" onClick={() => setShowCreateInvoice(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Invoice
        </Button>
      }>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 font-medium text-gray-900">Invoice</th>
                <th className="pb-3 font-medium text-gray-900">Client</th>
                <th className="pb-3 font-medium text-gray-900">Amount</th>
                <th className="pb-3 font-medium text-gray-900">Due Date</th>
                <th className="pb-3 font-medium text-gray-900">Status</th>
                <th className="pb-3 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="py-4 font-medium text-gray-900">
                    #{invoice.invoice_number}
                  </td>
                  <td className="py-4 text-gray-900">
                    {invoice.client_name}
                  </td>
                  <td className="py-4 text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="py-4 text-gray-600">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <Badge variant={
                      invoice.status === 'paid' ? 'success' :
                      invoice.status === 'overdue' ? 'danger' : 'warning'
                    }>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {invoice.status === 'pending' && (
                      <Button size="sm" onClick={() => handleMarkInvoicePaid(invoice.id)}>
                        Mark Paid
                      </Button>
                    )}
                    {invoice.status === 'paid' && (
                      <Button size="sm" variant="outline">Download</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="text-center py-6">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No invoices found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Plus className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Add New Client</h3>
          <p className="text-sm text-gray-600">Onboard a new client to your agency</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Client Messages</h3>
          <p className="text-sm text-gray-600">View and respond to client communications</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Analytics Report</h3>
          <p className="text-sm text-gray-600">Generate performance reports for clients</p>
        </Card>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create New Task"
        size="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={newTask.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <select
              value={newTask.client}
              onChange={(e) => setNewTask({ ...newTask, client: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Assigned To"
            value={newTask.assigned_to}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, assigned_to: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input
              label="Due Date"
              type="datetime-local"
              value={newTask.due_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, due_date: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateTask(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateInvoice}
        onClose={() => setShowCreateInvoice(false)}
        title="Create New Invoice"
        size="md"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            <select
              value={newInvoice.client}
              onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={newInvoice.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={newInvoice.due_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={newInvoice.description}
              onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
              placeholder="Service description..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateInvoice(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Client Details Modal */}
      {showClientDetails && (
        <Modal
          isOpen={!!showClientDetails}
          onClose={() => setShowClientDetails(null)}
          title={`Client Details - ${showClientDetails.name}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Company</label>
                <p className="text-gray-900">{showClientDetails.company}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{showClientDetails.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Package</label>
                <p className="text-gray-900">{showClientDetails.package}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Fee</label>
                <p className="text-gray-900">{formatCurrency(showClientDetails.monthly_fee)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant={
                  showClientDetails.status === 'active' ? 'success' :
                  showClientDetails.status === 'pending' ? 'warning' : 'default'
                }>
                  {showClientDetails.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    showClientDetails.payment_status === 'paid' ? 'success' :
                    showClientDetails.payment_status === 'overdue' ? 'danger' : 'warning'
                  }>
                    {showClientDetails.payment_status}
                  </Badge>
                  {showClientDetails.payment_status !== 'paid' && (
                    <button
                      onClick={() => handlePaymentStatusUpdate(showClientDetails.id, 'paid')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Manager</label>
                <p className="text-gray-900">{showClientDetails.account_manager}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Spent</label>
                <p className="text-gray-900">{formatCurrency(showClientDetails.total_spent)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Platforms</label>
              <div className="flex space-x-2 mt-1">
                {showClientDetails.platforms.map((platform, idx) => (
                  <Badge key={idx} variant="primary">{platform}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Next Payment Date</label>
              <p className="text-gray-900">{new Date(showClientDetails.next_payment).toLocaleDateString()}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminOverview;