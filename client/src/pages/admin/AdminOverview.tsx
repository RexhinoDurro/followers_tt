// client/src/pages/admin/AdminOverview.tsx - Fixed with proper type handling
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  Clock, 
  AlertCircle,
  TrendingUp,
  FileText,
  MessageSquare,
  RefreshCw,
  Plus,
  Calendar,
  Target
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
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
}

const AdminOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to safely convert to number and format
  const safeNumber = (value: number | string | null | undefined, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
  };

  // Helper function to format numbers with toFixed safely
  const safeToFixed = (value: number | string | null | undefined, decimals: number = 1): string => {
    const num = safeNumber(value);
    return num.toFixed(decimals);
  };

  // Helper function to format currency
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

      const [statsData, clientsData, tasksData, contentData] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getClients(),
        ApiService.getTasks(),
        ApiService.getContent(),
      ]);

      setStats(statsData);
      setClients(Array.isArray(clientsData) ? clientsData : clientsData?.results || []);
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData?.results || []);
      setContent(Array.isArray(contentData) ? contentData : contentData?.results || []);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      await ApiService.updateTask(taskId, { status: newStatus });
      await fetchData(); // Refresh data
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
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to update content:', err);
    }
  };

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
    {
      name: 'Followers Delivered',
      value: safeNumber(stats?.total_followers_delivered).toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      trend: `+${safeToFixed(stats?.monthly_growth_rate)}%`
    }
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
          <Button size="sm" variant="outline">
            <Calendar className="w-4 h-4 mr-1" />
            View All
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
                  <Badge variant={
                    task.status === 'completed' ? 'success' :
                    task.status === 'in-progress' ? 'primary' :
                    task.status === 'review' ? 'warning' : 'default'
                  }>
                    {task.status.replace('-', ' ')}
                  </Badge>
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
                <div className="text-right">
                  <Badge variant={
                    client.payment_status === 'paid' ? 'success' :
                    client.payment_status === 'overdue' ? 'danger' : 'warning'
                  }>
                    {client.payment_status}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: ${client.total_spent.toLocaleString()}
                  </p>
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
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleContentApproval(post.id, false)}
                  >
                    Request Changes
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
    </div>
  );
};

export default AdminOverview;