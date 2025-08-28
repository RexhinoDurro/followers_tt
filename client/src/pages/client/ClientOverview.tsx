// client/src/pages/client/ClientOverview.tsx - Fixed with proper type handling
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Target,
  MessageCircle,
  Calendar,
  CreditCard,
  Eye,
  Heart,
  Share2,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';

interface ClientStats {
  total_followers: number | string;
  engagement_rate: number | string;
  posts_this_month: number | string;
  reach: number | string;
  growth_rate: number | string;
  next_payment_amount: number | string;
  next_payment_date: string;
}

interface PerformanceData {
  id: string;
  month: string;
  followers: number;
  engagement: number;
  reach: number;
  clicks: number;
  impressions: number;
  growth_rate: number;
}

interface ContentPost {
  id: string;
  platform: string;
  content: string;
  scheduled_date: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  engagement_rate?: number;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

const ClientOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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

      const [statsData, performanceData, contentData, invoicesData] = await Promise.all([
        ApiService.getClientDashboardStats(),
        ApiService.getPerformanceData(),
        ApiService.getContent(),
        ApiService.getInvoices(),
      ]);

      setStats(statsData);
      setPerformance(Array.isArray(performanceData) ? performanceData : performanceData?.results || []);
      setContent(Array.isArray(contentData) ? contentData : contentData?.results || []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : invoicesData?.results || []);
    } catch (err: any) {
      console.error('Failed to fetch client dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'client') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== 'client') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only available for client accounts.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
      name: 'Total Followers', 
      value: safeNumber(stats?.total_followers).toLocaleString(), 
      icon: Users, 
      color: 'text-blue-600',
      trend: stats?.growth_rate ? `+${safeToFixed(stats.growth_rate)}%` : null,
      trendColor: 'text-green-600'
    },
    { 
      name: 'Engagement Rate', 
      value: `${safeToFixed(stats?.engagement_rate)}%`, 
      icon: Heart, 
      color: 'text-pink-600',
      trend: '+2.3%',
      trendColor: 'text-green-600'
    },
    { 
      name: 'Monthly Reach', 
      value: safeNumber(stats?.reach).toLocaleString(), 
      icon: Eye, 
      color: 'text-purple-600',
      trend: '+15%',
      trendColor: 'text-green-600'
    },
    { 
      name: 'Posts This Month', 
      value: safeNumber(stats?.posts_this_month).toString(), 
      icon: FileText, 
      color: 'text-green-600',
      trend: null,
      trendColor: null
    }
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'posted': return 'success';
      case 'approved': return 'primary';
      case 'pending-approval': return 'warning';
      case 'draft': return 'default';
      case 'paid': return 'success';
      case 'overdue': return 'danger';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'youtube': return '🎥';
      case 'facebook': return '📘';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.first_name || user.name || 'Client'}! 🚀
          </h1>
          <p className="text-gray-600 mt-1">Here's how your social media is performing.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Team
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
                  <p className={`text-sm font-medium mt-1 ${stat.trendColor}`}>
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    {stat.trend} this month
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

      {/* Payment Status Alert */}
      {stats?.next_payment_date && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Next Payment Due</p>
                <p className="text-sm text-blue-700">
                  {formatCurrency(stats.next_payment_amount)} due on {new Date(stats.next_payment_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button size="sm">
              Pay Now
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <Card title="Recent Content" action={
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            New Post
          </Button>
        }>
          <div className="space-y-4">
            {content.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 capitalize">{post.platform}</span>
                    <Badge variant={getStatusBadgeVariant(post.status)}>
                      {post.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(post.scheduled_date).toLocaleDateString()}
                    </span>
                    {post.engagement_rate && (
                      <span>
                        <Heart className="w-3 h-3 inline mr-1" />
                        {safeToFixed(post.engagement_rate)}% engagement
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {content.length === 0 && (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No content yet</p>
                <Button size="sm">Create Your First Post</Button>
              </div>
            )}
          </div>
        </Card>

        {/* Performance Overview */}
        <Card title="Performance Overview" action={
          <Button size="sm" variant="outline">
            <Target className="w-4 h-4 mr-1" />
            Full Report
          </Button>
        }>
          <div className="space-y-4">
            {performance.slice(0, 3).map((data) => (
              <div key={data.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(data.month).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>
                      <Users className="w-3 h-3 inline mr-1" />
                      {safeNumber(data.followers).toLocaleString()} followers
                    </span>
                    <span>
                      <Eye className="w-3 h-3 inline mr-1" />
                      {safeNumber(data.reach).toLocaleString()} reach
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {safeToFixed(data.engagement)}%
                  </p>
                  <p className="text-sm text-gray-500">engagement</p>
                  {safeNumber(data.growth_rate) > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      +{safeToFixed(data.growth_rate)}% growth
                    </p>
                  )}
                </div>
              </div>
            ))}
            {performance.length === 0 && (
              <div className="text-center py-6">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Performance data will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card title="Payment History" action={
        <Button size="sm" variant="outline">
          View All Invoices
        </Button>
      }>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 font-medium text-gray-900">Invoice</th>
                <th className="pb-3 font-medium text-gray-900">Amount</th>
                <th className="pb-3 font-medium text-gray-900">Due Date</th>
                <th className="pb-3 font-medium text-gray-900">Status</th>
                <th className="pb-3 font-medium text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="py-4 font-medium text-gray-900">
                    #{invoice.invoice_number}
                  </td>
                  <td className="py-4 text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="py-4 text-gray-600">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {invoice.status === 'pending' && (
                      <Button size="sm">Pay Now</Button>
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
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No invoices yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Message Team</h3>
          <p className="text-sm text-gray-600">Get help or discuss your strategy</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Content Calendar</h3>
          <p className="text-sm text-gray-600">View and approve upcoming posts</p>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Analytics Report</h3>
          <p className="text-sm text-gray-600">Download detailed performance data</p>
        </Card>
      </div>
    </div>
  );
};

export default ClientOverview;