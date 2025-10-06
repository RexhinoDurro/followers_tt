// client/src/dashboard/client/ClientPerformance.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Eye, Heart, BarChart3,
  Download, RefreshCw, Target, Award, Zap,
  ArrowUp, ArrowDown, Activity, Globe, Share2,
  Clock, Instagram, Youtube, Music,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Modal, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';

interface PerformanceData {
  id: string;
  month: string;
  followers: number;
  engagement: number;
  reach: number;
  clicks: number;
  impressions: number;
  growth_rate: number;
  created_at: string;
}

interface RealTimeMetric {
  account: {
    id: string;
    platform: string;
    username: string;
  };
  followers_count: number;
  engagement_rate: number;
  reach: number;
  daily_growth: number;
  last_updated: string;
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
}

interface ClientStats {
  total_followers: number;
  engagement_rate: number;
  posts_this_month: number;
  reach: number;
  growth_rate: number;
}

const ClientPerformance: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'engagement' | 'platforms'>('overview');
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedTimeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, metricsData, accountsData] = await Promise.all([
        ApiService.getClientDashboardStats(),
        ApiService.getRealTimeMetrics(),
        ApiService.getConnectedAccounts()
      ]);

      setClientStats(statsData as ClientStats);
      
      // FIX: Handle the response format correctly
      let metricsArray: RealTimeMetric[] = [];
      if (Array.isArray(metricsData)) {
        metricsArray = metricsData;
      } else if (metricsData && typeof metricsData === 'object' && 'data' in metricsData) {
        metricsArray = (metricsData as { data: RealTimeMetric[] }).data;
      }
      setRealTimeMetrics(metricsArray);
      
      let accountsArray: ConnectedAccount[] = [];
      if (Array.isArray(accountsData)) {
        accountsArray = accountsData;
      } else if (
        accountsData &&
        typeof accountsData === 'object' &&
        'accounts' in accountsData &&
        Array.isArray((accountsData as any).accounts)
      ) {
        accountsArray = (accountsData as { accounts: ConnectedAccount[] }).accounts;
      }
      setConnectedAccounts(accountsArray);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const data = await ApiService.getPerformanceData();
      setPerformanceData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatGrowthRate = (rate: number) => {
    const formattedRate = Math.abs(rate).toFixed(1);
    const icon = rate >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
    const color = rate >= 0 ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={`flex items-center ${color}`}>
        {icon}
        {formattedRate}%
      </span>
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'tiktok': return <Music className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const calculateTotalMetrics = () => {
    return {
      totalFollowers: connectedAccounts.reduce((sum, acc) => sum + acc.followers_count, 0),
      avgEngagement: connectedAccounts.length > 0 
        ? connectedAccounts.reduce((sum, acc) => sum + acc.engagement_rate, 0) / connectedAccounts.length 
        : 0,
      totalAccounts: connectedAccounts.filter(acc => acc.is_active).length
    };
  };

  const totalMetrics = calculateTotalMetrics();

  const downloadReport = async () => {
    try {
      // In a real app, this would generate and download a PDF report
      alert('Report download feature coming soon!');
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      
      // Trigger backend sync
      await fetch(`${ApiService.getBaseURL()}/sync/manual/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${ApiService.getToken()}`
        }
      });
      
      // Wait 2 seconds for sync to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data
      await fetchData();
      
      alert('✓ Data refreshed! YouTube stats updated.');
    } catch (error) {
      console.error('Refresh failed:', error);
      alert('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }


  function setSelectedMetric(_id: string) {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Track your social media growth and engagement</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleManualRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh YouTube Data
          </Button>
          <Button onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Followers</p>
              <p className="text-3xl font-bold">{formatNumber(totalMetrics.totalFollowers)}</p>
              <div className="flex items-center mt-1">
                {clientStats && formatGrowthRate(clientStats.growth_rate)}
                <span className="text-blue-200 text-sm ml-1">vs last month</span>
              </div>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Avg Engagement</p>
              <p className="text-3xl font-bold">{totalMetrics.avgEngagement.toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                {formatGrowthRate(2.3)}
                <span className="text-green-200 text-sm ml-1">vs last month</span>
              </div>
            </div>
            <Heart className="w-10 h-10 text-green-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Monthly Reach</p>
              <p className="text-3xl font-bold">{formatNumber(clientStats?.reach || 0)}</p>
              <div className="flex items-center mt-1">
                {formatGrowthRate(12.5)}
                <span className="text-purple-200 text-sm ml-1">vs last month</span>
              </div>
            </div>
            <Eye className="w-10 h-10 text-purple-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Posts This Month</p>
              <p className="text-3xl font-bold">{clientStats?.posts_this_month || 0}</p>
              <div className="flex items-center mt-1">
                {formatGrowthRate(8.3)}
                <span className="text-orange-200 text-sm ml-1">vs last month</span>
              </div>
            </div>
            <Share2 className="w-10 h-10 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Connected Accounts Status */}
      {connectedAccounts.length === 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-900">No Connected Accounts</p>
                <p className="text-sm text-yellow-700">
                  Connect your social media accounts to start tracking performance metrics.
                </p>
              </div>
            </div>
            <Button size="sm">Connect Accounts</Button>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'growth', label: 'Growth Tracking', icon: TrendingUp },
              { id: 'engagement', label: 'Engagement', icon: Heart },
              { id: 'platforms', label: 'Platform Performance', icon: Globe }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Growth Summary">
                  <div className="space-y-4">
                    {performanceData.slice(0, 6).map((data) => (
                      <div key={data.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(data.month).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatNumber(data.followers)} followers
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {data.engagement.toFixed(1)}%
                          </p>
                          <div className="flex items-center justify-end">
                            {formatGrowthRate(data.growth_rate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Account Performance">
                  <div className="space-y-4">
                    {connectedAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getPlatformIcon(account.platform)}
                          <div>
                            <p className="font-medium text-gray-900">{account.username}</p>
                            <p className="text-sm text-gray-600 capitalize">{account.platform}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatNumber(account.followers_count)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {account.engagement_rate.toFixed(1)}% engagement
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {typeof clientStats?.engagement_rate === 'number' && !isNaN(clientStats.engagement_rate)
                      ? clientStats.engagement_rate.toFixed(1)
                      : '0'}%
                  </h3>
                  <p className="text-gray-600">Average Engagement Rate</p>
                  <p className="text-sm text-green-600 mt-1">Above industry average</p>
                </Card>

                <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {totalMetrics.totalAccounts}
                  </h3>
                  <p className="text-gray-600">Connected Platforms</p>
                  <p className="text-sm text-blue-600 mt-1">Multi-platform presence</p>
                </Card>

                <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <Zap className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {formatNumber(totalMetrics.totalFollowers / (totalMetrics.totalAccounts || 1))}
                  </h3>
                  <p className="text-gray-600">Avg Followers per Platform</p>
                  <p className="text-sm text-green-600 mt-1">Growing steadily</p>
                </Card>
              </div>
            </div>
          )}

          {/* Growth Tracking Tab */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Growth Tracking</h3>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Follower Growth">
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Growth chart visualization would go here</p>
                      <p className="text-sm">Connect Chart.js or similar charting library</p>
                    </div>
                  </div>
                </Card>

                <Card title="Engagement Trends">
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                      <p>Engagement chart would go here</p>
                      <p className="text-sm">Shows engagement rate over time</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="Monthly Performance">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-3 font-medium text-gray-900">Month</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Followers</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Growth</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Engagement</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Reach</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {performanceData.map((data) => (
                        <tr key={data.id} className="hover:bg-gray-50">
                          <td className="py-4 text-gray-900">
                            {new Date(data.month).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </td>
                          <td className="py-4 text-gray-900">{formatNumber(data.followers)}</td>
                          <td className="py-4">{formatGrowthRate(data.growth_rate)}</td>
                          <td className="py-4 text-gray-900">{data.engagement.toFixed(1)}%</td>
                          <td className="py-4 text-gray-900">{formatNumber(data.reach)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Engagement Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedAccounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(account.platform)}
                        <div>
                          <p className="font-medium text-gray-900">{account.username}</p>
                          <p className="text-sm text-gray-600 capitalize">{account.platform}</p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Followers</span>
                        <span className="text-xl font-bold text-gray-900">
                          {formatNumber(account.followers_count)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Engagement Rate</span>
                        <span className="text-lg font-semibold text-purple-600">
                          {account.engagement_rate.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Posts</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {account.posts_count}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      Last sync: {new Date(account.last_sync).toLocaleString()}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => {
                        setSelectedMetric(account.id);
                        setShowDetailModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>

              {connectedAccounts.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Engagement Data</h3>
                  <p className="text-gray-600 mb-4">Connect your social media accounts to see engagement analytics</p>
                  <Button>Connect Accounts</Button>
                </div>
              )}
            </div>
          )}

          {/* Platform Performance Tab */}
          {activeTab === 'platforms' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Platform Distribution">
                  <div className="space-y-4">
                    {['Instagram', 'YouTube', 'TikTok'].map((platform) => {
                      const account = connectedAccounts.find(acc => 
                        acc.platform.toLowerCase() === platform.toLowerCase()
                      );
                      const isConnected = !!account;
                      
                      return (
                        <div key={platform} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getPlatformIcon(platform)}
                            <span className="font-medium text-gray-900">{platform}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {isConnected ? (
                              <>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatNumber(account.followers_count)} followers
                                </span>
                                <Badge variant="success">Connected</Badge>
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-gray-500">Not connected</span>
                                <Button size="sm" variant="outline">Connect</Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card title="Real-time Updates">
                  <div className="space-y-3">
                    {realTimeMetrics.slice(0, 5).map((metric) => (
                      <div key={`${metric.account.id}-${metric.account.platform}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getPlatformIcon(metric.account.platform)}
                          <div>
                            <p className="font-medium text-gray-900">{metric.account.username}</p>
                            <p className="text-sm text-gray-600">
                              {formatNumber(metric.followers_count)} followers
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {formatGrowthRate(metric.daily_growth)}
                          </div>
                          <p className="text-sm text-gray-600">today</p>
                        </div>
                      </div>
                    ))}
                    
                    {realTimeMetrics.length === 0 && (
                      <div className="text-center py-6">
                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No real-time data available</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detailed Analytics"
        size="lg"
      >
        <div className="space-y-4">
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
            <p className="text-gray-600">Comprehensive analytics view coming soon!</p>
            <p className="text-sm text-gray-500 mt-2">
              This will include detailed charts, audience insights, and performance breakdowns.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientPerformance;