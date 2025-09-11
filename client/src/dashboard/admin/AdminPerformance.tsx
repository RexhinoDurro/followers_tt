// client/src/dashboard/admin/AdminPerformance.tsx - Fixed TypeScript errors
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, Eye, Heart, BarChart3,
  Download, RefreshCw, Target, Award, Zap,
  ArrowUp, ArrowDown, Activity, Globe, 
  PieChart, DollarSign, ChevronRight
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';

interface PerformanceData {
  id: string;
  client: string;
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

interface Client {
  id: string;
  name: string;
  company: string;
  status: string;
  monthly_fee: number;
  platforms: string[];
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

interface AnalyticsOverview {
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

const AdminPerformance: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'realtime' | 'analytics'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedClient, selectedTimeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsData, metricsResponse, overviewData] = await Promise.all([
        ApiService.getClients(),
        ApiService.getRealTimeMetrics(),
        ApiService.getAnalyticsOverview()
      ]);

      setClients(Array.isArray(clientsData) ? clientsData : []);
      
      // Type the metrics response properly
      const metricsData = metricsResponse as { data?: RealTimeMetric[] } | RealTimeMetric[];
      setRealTimeMetrics(Array.isArray(metricsData) ? metricsData : metricsData?.data || []);
      
      // Type the overview data properly
      setAnalyticsOverview(overviewData as AnalyticsOverview);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const clientId = selectedClient !== 'all' ? selectedClient : undefined;
      const data = await ApiService.getPerformanceData(clientId);
      setPerformanceData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    }
  };

  const generateClientReport = async (clientId: string) => {
    try {
      const report = await ApiService.getClientPerformanceReport(clientId);
      // In a real app, this would open a detailed report modal or download PDF
      console.log('Client report:', report);
    } catch (error) {
      console.error('Failed to generate client report:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
    const icons: Record<string, string> = {
      instagram: '📸',
      tiktok: '🎵',
      youtube: '🎥',
      facebook: '📘',
      twitter: '🐦',
      linkedin: '💼'
    };
    return icons[platform] || '📱';
  };

  const calculateTotalMetrics = () => {
    return {
      totalFollowers: realTimeMetrics.reduce((sum, metric) => sum + metric.followers_count, 0),
      avgEngagement: realTimeMetrics.reduce((sum, metric) => sum + metric.engagement_rate, 0) / (realTimeMetrics.length || 1),
      totalReach: realTimeMetrics.reduce((sum, metric) => sum + metric.reach, 0),
      totalGrowth: realTimeMetrics.reduce((sum, metric) => sum + metric.daily_growth, 0)
    };
  };

  const totalMetrics = calculateTotalMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Track client performance and agency growth metrics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'clients', label: 'Client Performance', icon: Users },
              { id: 'realtime', label: 'Real-time Metrics', icon: Activity },
              { id: 'analytics', label: 'Advanced Analytics', icon: PieChart }
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
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Followers</p>
                      <p className="text-3xl font-bold">{formatNumber(totalMetrics.totalFollowers)}</p>
                      <div className="flex items-center mt-1">
                        {formatGrowthRate(5.2)}
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
                        {formatGrowthRate(2.8)}
                        <span className="text-green-200 text-sm ml-1">vs last month</span>
                      </div>
                    </div>
                    <Heart className="w-10 h-10 text-green-200" />
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Reach</p>
                      <p className="text-3xl font-bold">{formatNumber(totalMetrics.totalReach)}</p>
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
                      <p className="text-orange-100">Daily Growth</p>
                      <p className="text-3xl font-bold">+{formatNumber(Math.abs(totalMetrics.totalGrowth))}</p>
                      <div className="flex items-center mt-1">
                        {formatGrowthRate(8.3)}
                        <span className="text-orange-200 text-sm ml-1">vs yesterday</span>
                      </div>
                    </div>
                    <TrendingUp className="w-10 h-10 text-orange-200" />
                  </div>
                </Card>
              </div>

              {/* Agency Performance Summary */}
              {analyticsOverview && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Agency Growth">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Clients</span>
                        <span className="text-2xl font-bold text-gray-900">{clients.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Clients</span>
                        <span className="text-xl font-semibold text-green-600">
                          {clients.filter(c => c.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Monthly Revenue</span>
                        <span className="text-xl font-semibold text-purple-600">
                          {formatCurrency(clients.reduce((sum, c) => sum + (c.status === 'active' ? c.monthly_fee : 0), 0))}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card title="Task Performance">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Task Completion Rate</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {analyticsOverview.completion_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-lg font-semibold text-green-600">
                            {analyticsOverview.task_stats.completed}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">In Progress</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {analyticsOverview.task_stats.in_progress}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pending</p>
                          <p className="text-lg font-semibold text-yellow-600">
                            {analyticsOverview.task_stats.pending}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Top Performing Clients */}
              <Card title="Top Performing Clients" action={
                <Button size="sm" variant="outline">
                  View All
                </Button>
              }>
                <div className="space-y-4">
                  {performanceData
                    .sort((a, b) => b.followers - a.followers)
                    .slice(0, 5)
                    .map((data) => (
                      <div key={data.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {data.client_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{data.client_name}</p>
                            <p className="text-sm text-gray-600">{formatNumber(data.followers)} followers</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{data.engagement.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">engagement</p>
                        </div>
                        <div className="text-right">
                          {formatGrowthRate(data.growth_rate)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateClientReport(data.client)}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}

          {/* Client Performance Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>

              {/* Performance Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-3 font-medium text-gray-900">Client</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Followers</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Engagement</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Reach</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Growth</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Revenue</th>
                        <th className="text-left pb-3 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {performanceData.map((data) => (
                        <tr key={data.id} className="hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {data.client_name.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-900">{data.client_name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-900">{formatNumber(data.followers)}</td>
                          <td className="py-4 text-gray-900">{data.engagement.toFixed(1)}%</td>
                          <td className="py-4 text-gray-900">{formatNumber(data.reach)}</td>
                          <td className="py-4">{formatGrowthRate(data.growth_rate)}</td>
                          <td className="py-4 text-gray-900">
                            {formatCurrency(clients.find(c => c.id === data.client)?.monthly_fee || 0)}
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateClientReport(data.client)}
                              >
                                <BarChart3 className="w-4 h-4 mr-1" />
                                Report
                              </Button>
                              <Button size="sm" variant="outline">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Real-time Metrics Tab */}
          {activeTab === 'realtime' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realTimeMetrics.map((metric) => (
                  <Card key={metric.account.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getPlatformIcon(metric.account.platform)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{metric.account.username}</p>
                          <p className="text-sm text-gray-600 capitalize">{metric.account.platform}</p>
                        </div>
                      </div>
                      <Badge variant="success">Live</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Followers</span>
                        <span className="text-xl font-bold text-gray-900">
                          {formatNumber(metric.followers_count)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Engagement</span>
                        <span className="text-lg font-semibold text-purple-600">
                          {metric.engagement_rate.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Reach</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {formatNumber(metric.reach)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Daily Growth</span>
                        <div className="flex items-center space-x-1">
                          {formatGrowthRate(metric.daily_growth)}
                          <span className="text-gray-900 font-medium">
                            {metric.daily_growth >= 0 ? '+' : ''}{metric.daily_growth}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      Last updated: {new Date(metric.last_updated).toLocaleString()}
                    </div>
                  </Card>
                ))}
              </div>

              {realTimeMetrics.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Real-time Data Available</h3>
                  <p className="text-gray-600 mb-4">Connect social media accounts to see real-time metrics</p>
                  <Button>
                    <Globe className="w-4 h-4 mr-2" />
                    Connect Accounts
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Advanced Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Platform Distribution">
                  <div className="space-y-4">
                    {['Instagram', 'YouTube', 'TikTok', 'Facebook'].map((platform) => {
                      const count = realTimeMetrics.filter(m => 
                        m.account.platform.toLowerCase() === platform.toLowerCase()
                      ).length;
                      const percentage = (count / realTimeMetrics.length) * 100 || 0;
                      
                      return (
                        <div key={platform} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getPlatformIcon(platform.toLowerCase())}</span>
                            <span className="font-medium text-gray-900">{platform}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card title="Revenue Analysis">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(clients.reduce((sum, c) => sum + (c.status === 'active' ? c.monthly_fee : 0), 0))}
                        </p>
                        <p className="text-sm text-gray-600">Monthly Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{clients.filter(c => c.status === 'active').length}</p>
                        <p className="text-sm text-gray-600">Active Clients</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Revenue per Client</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(clients.length > 0 ? clients.reduce((sum, c) => sum + c.monthly_fee, 0) / clients.length : 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue Growth</span>
                        <span className="font-semibold text-green-600">+15.2%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="Performance Benchmarks">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-gray-900">{totalMetrics.avgEngagement.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Average Engagement</p>
                    <p className="text-xs text-green-600 mt-1">Above industry avg (3.5%)</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Award className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((clients.filter(c => c.status === 'active').length / clients.length) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Client Retention</p>
                    <p className="text-xs text-green-600 mt-1">Excellent retention rate</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(totalMetrics.totalFollowers / (clients.length || 1))}
                    </p>
                    <p className="text-sm text-gray-600">Avg Followers per Client</p>
                    <p className="text-xs text-blue-600 mt-1">Growing steadily</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { AdminPerformance };