// client/src/pages/client/ClientOverview.tsx - Enhanced with Account Linking
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
  AlertCircle,
  RefreshCw,
  Plus,
  Link,
  Settings,
  Download} from 'lucide-react';
import { Card, Badge, Button, Modal } from '../../components/ui';
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

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  followers_count: number;
  engagement_rate: number;
  posts_count: number;
  last_sync: string;
  created_at: string;
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

interface Message {
  id: string;
  sender_name: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const ClientOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Modal states
  const [showConnectAccount, setShowConnectAccount] = useState(false);
  const [showCreateContent, setShowCreateContent] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  // Form states
  const [newContent, setNewContent] = useState({
    platform: '',
    content: '',
    scheduled_date: ''
  });

  const [newMessage, setNewMessage] = useState({
    content: ''
  });

  // Helper functions
  const safeNumber = (value: number | string | null | undefined, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
  };

  const safeToFixed = (value: number | string | null | undefined, decimals: number = 1): string => {
    const num = safeNumber(value);
    return num.toFixed(decimals);
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

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsData, 
        accountsData, 
        performanceData, 
        contentData, 
        invoicesData,
        messagesData
      ] = await Promise.all([
        ApiService.getClientDashboardStats(),
        ApiService.getConnectedAccounts(),
        ApiService.getPerformanceData(),
        ApiService.getContent(),
        ApiService.getInvoices(),
        ApiService.getMessages(),
      ]);

      setStats(statsData as ClientStats);
      setConnectedAccounts(
        Array.isArray(accountsData)
          ? accountsData
          : (accountsData && typeof accountsData === 'object' && 'accounts' in accountsData && Array.isArray((accountsData as any).accounts))
            ? (accountsData as any).accounts
            : []
      );
      setPerformance(
        Array.isArray(performanceData)
          ? performanceData
          : (performanceData && typeof performanceData === 'object' && 'results' in performanceData && Array.isArray((performanceData as any).results))
            ? (performanceData as any).results
            : []
      );
      setContent(
        Array.isArray(contentData)
          ? contentData
          : (contentData && typeof contentData === 'object' && 'results' in contentData && Array.isArray((contentData as any).results))
            ? (contentData as any).results
            : []
      );
      setInvoices(
        Array.isArray(invoicesData)
          ? invoicesData
          : (invoicesData && typeof invoicesData === 'object' && 'results' in invoicesData && Array.isArray((invoicesData as any).results))
            ? (invoicesData as any).results
            : []
      );
      setMessages(
        Array.isArray(messagesData)
          ? messagesData
          : (messagesData && typeof messagesData === 'object' && 'results' in messagesData && Array.isArray((messagesData as any).results))
            ? (messagesData as any).results
            : []
      );
    } catch (err: any) {
      console.error('Failed to fetch client dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (platform: string) => {
    try {
      setConnectingPlatform(platform);
      
      // Initiate OAuth flow
      const response = await ApiService.initiateOAuth(platform);

      // Narrow the type of response before accessing its properties
      if (response && typeof response === 'object' && 'oauth_url' in response) {
        // Open OAuth URL in new window
        const popup = window.open(
          (response as { oauth_url: string }).oauth_url,
          `${platform}_oauth`,
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for OAuth callback
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setConnectingPlatform(null);
            fetchData(); // Refresh data
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error(`Failed to connect ${platform}:`, err);
      setError(`Failed to connect ${platform} account`);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnectAccount = async (accountId: string, username: string) => {
    if (!window.confirm(`Disconnect ${username}? Historical data will be preserved.`)) {
      return;
    }

    try {
      await ApiService.disconnectAccount(accountId);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to disconnect account:', err);
      setError('Failed to disconnect account');
    }
  };

  const handleSyncAccount = async (accountId: string) => {
    try {
      await ApiService.triggerManualSync(accountId);
      setTimeout(fetchData, 2000); // Refresh after 2 seconds
    } catch (err: any) {
      console.error('Failed to sync account:', err);
      setError('Failed to sync account');
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createContent(newContent);
      setShowCreateContent(false);
      setNewContent({ platform: '', content: '', scheduled_date: '' });
      await fetchData();
    } catch (err) {
      console.error('Failed to create content:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send to admin (assuming admin ID is available)
      await ApiService.sendMessage('admin', newMessage.content);
      setShowSendMessage(false);
      setNewMessage({ content: '' });
      await fetchData();
    } catch (err) {
      console.error('Failed to send message:', err);
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

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-purple-500 to-pink-500' },
    { id: 'youtube', name: 'YouTube', icon: '🎥', color: 'from-red-500 to-red-600' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-gray-800 to-black', disabled: true },
  ];

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
          <Button onClick={() => setShowConnectAccount(true)}>
            <Link className="w-4 h-4 mr-2" />
            Connect Account
          </Button>
          <Button onClick={() => setShowSendMessage(true)}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Team
          </Button>
        </div>
      </div>

      {/* Connected Accounts Status */}
      {connectedAccounts.length === 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-900">Connect Your Social Media Accounts</p>
                <p className="text-sm text-yellow-700">
                  To start tracking your performance, connect your Instagram, YouTube, or TikTok accounts.
                </p>
              </div>
            </div>
            <Button onClick={() => setShowConnectAccount(true)}>
              Connect Now
            </Button>
          </div>
        </Card>
      )}
      
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

      {/* Connected Accounts Grid */}
      {connectedAccounts.length > 0 && (
        <Card title="Connected Social Media Accounts" action={
          <Button size="sm" variant="outline" onClick={() => setShowConnectAccount(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Account
          </Button>
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getPlatformIcon(account.platform)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{account.username}</p>
                      <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSyncAccount(account.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Sync now"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDisconnectAccount(account.id, account.username)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Disconnect"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Followers:</span>
                    <span className="font-medium">{account.followers_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Engagement:</span>
                    <span className="font-medium">{account.engagement_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posts:</span>
                    <span className="font-medium">{account.posts_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                  <span>Last sync: {formatTime(account.last_sync)}</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <Card title="Recent Content" action={
          <Button size="sm" variant="outline" onClick={() => setShowCreateContent(true)}>
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
                    <Badge variant={
                      post.status === 'posted' ? 'success' :
                      post.status === 'approved' ? 'primary' :
                      post.status === 'pending-approval' ? 'warning' : 'default'
                    }>
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
                <Button size="sm" onClick={() => setShowCreateContent(true)}>Create Your First Post</Button>
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

      {/* Recent Messages */}
      <Card title="Recent Messages" action={
        <Button size="sm" variant="outline" onClick={() => setShowSendMessage(true)}>
          <MessageCircle className="w-4 h-4 mr-1" />
          Send Message
        </Button>
      }>
        <div className="space-y-4">
          {messages.slice(0, 3).map((message) => (
            <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {message.sender_name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{message.sender_name}</span>
                  <span className="text-sm text-gray-500">{formatTime(message.timestamp)}</span>
                  {!message.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-6">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No messages yet</p>
            </div>
          )}
        </div>
      </Card>

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
                    <Badge variant={
                      invoice.status === 'paid' ? 'success' :
                      invoice.status === 'overdue' ? 'danger' : 'warning'
                    }>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    {invoice.status === 'pending' && (
                      <Button size="sm">Pay Now</Button>
                    )}
                    {invoice.status === 'paid' && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
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

      {/* Connect Account Modal */}
      <Modal
        isOpen={showConnectAccount}
        onClose={() => setShowConnectAccount(false)}
        title="Connect Social Media Account"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const isConnected = connectedAccounts.some(acc => acc.platform === platform.id);
            const isConnecting = connectingPlatform === platform.id;
            
            return (
              <div
                key={platform.id}
                className={`border rounded-lg p-6 text-center ${
                  isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-purple-300'
                } ${platform.disabled ? 'opacity-50' : ''}`}
              >
                <div className="text-4xl mb-4">{platform.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{platform.name}</h3>
                
                {isConnected ? (
                  <div className="text-green-600">
                    <div className="w-5 h-5 mx-auto mb-2">✅</div>
                    <p className="text-sm">Connected</p>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnectAccount(platform.id)}
                    disabled={isConnecting || platform.disabled}
                    className={`w-full bg-gradient-to-r ${platform.color} text-white hover:opacity-90 disabled:opacity-50`}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : platform.disabled ? (
                      'Coming Soon'
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Safe & Secure:</strong> We use official APIs and OAuth authentication. 
            Your login credentials are never stored or shared.
          </p>
        </div>
      </Modal>

      {/* Create Content Modal */}
      <Modal
        isOpen={showCreateContent}
        onClose={() => setShowCreateContent(false)}
        title="Create New Content"
        size="md"
      >
        <form onSubmit={handleCreateContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <select
              value={newContent.platform}
              onChange={(e) => setNewContent({ ...newContent, platform: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select Platform</option>
              {connectedAccounts.map((account) => (
                <option key={account.id} value={account.platform}>
                  {account.platform} (@{account.username})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={newContent.content}
              onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={6}
              placeholder="Write your post content here..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Date
            </label>
            <input
              type="datetime-local"
              value={newContent.scheduled_date}
              onChange={(e) => setNewContent({ ...newContent, scheduled_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateContent(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>

      {/* Send Message Modal */}
      <Modal
        isOpen={showSendMessage}
        onClose={() => setShowSendMessage(false)}
        title="Send Message to Team"
        size="md"
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={4}
              placeholder="Type your message here..."
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowSendMessage(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div
            className="cursor-pointer"
            onClick={() => setShowSendMessage(true)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowSendMessage(true); }}
          >
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Message Team</h3>
            <p className="text-sm text-gray-600">Get help or discuss your strategy</p>
          </div>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div
            className="cursor-pointer"
            onClick={() => setShowCreateContent(true)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowCreateContent(true); }}
          >
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Content Calendar</h3>
            <p className="text-sm text-gray-600">Create and schedule new posts</p>
          </div>
        </Card>
        
        <Card className="text-center p-6 hover:shadow-lg transition-shadow">
          <div className="cursor-pointer">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Analytics Report</h3>
            <p className="text-sm text-gray-600">Download detailed performance data</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientOverview;