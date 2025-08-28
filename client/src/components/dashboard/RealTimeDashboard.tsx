import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Eye, 
  Heart, 
  RefreshCw, 
  Plus, 
  Wifi, 
  WifiOff,
  Instagram,
  Youtube
} from 'lucide-react';

const RealTimeDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Mock API service - replace with your actual API calls
  const ApiService = {
    async getConnectedAccounts() {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        accounts: [
          {
            id: '1',
            platform: 'instagram',
            username: 'your_brand',
            is_active: true,
            followers_count: 15420,
            engagement_rate: 4.2,
            posts_count: 156,
            last_sync: new Date().toISOString()
          },
          {
            id: '2',
            platform: 'youtube',
            username: 'Your Channel',
            is_active: true,
            followers_count: 8340,
            engagement_rate: 6.8,
            posts_count: 42,
            last_sync: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
          }
        ]
      };
    },

    async getRealTimeMetrics() {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        data: [
          {
            account: { id: '1', platform: 'instagram', username: 'your_brand' },
            followers_count: 15420 + Math.floor(Math.random() * 10),
            engagement_rate: 4.2 + (Math.random() * 0.5 - 0.25),
            reach: 28500 + Math.floor(Math.random() * 1000),
            daily_growth: Math.floor(Math.random() * 20) + 5
          },
          {
            account: { id: '2', platform: 'youtube', username: 'Your Channel' },
            followers_count: 8340 + Math.floor(Math.random() * 5),
            engagement_rate: 6.8 + (Math.random() * 0.3 - 0.15),
            reach: 45200 + Math.floor(Math.random() * 2000),
            daily_growth: Math.floor(Math.random() * 15) + 2
          }
        ]
      };
    },

    async triggerManualSync(accountId) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { message: 'Sync completed successfully' };
    }
  };

  const fetchData = async () => {
    try {
      setError(null);
      const [accountsData, metricsData] = await Promise.all([
        ApiService.getConnectedAccounts(),
        ApiService.getRealTimeMetrics()
      ]);

      setAccounts(accountsData.accounts);
      setMetrics(metricsData.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (accountId) => {
    try {
      setSyncing(true);
      await ApiService.triggerManualSync(accountId);
      await fetchData(); // Refresh data after sync
    } catch (err) {
      setError('Failed to sync account data');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const getPlatformIcon = (platform) => {
    const iconClass = "w-6 h-6";
    switch (platform) {
      case 'instagram':
        return <div className="w-6 h-6 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">IG</div>;
      case 'youtube':
        return <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">YT</div>;
      case 'tiktok':
        return <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">TT</div>;
      default:
        return <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">?</div>;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 1000 / 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your social media dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Real-Time Social Media Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {lastUpdated && (
                <>Last updated: {formatTime(lastUpdated.toISOString())}</>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {error && (
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <WifiOff className="w-4 h-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={syncing}
              className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Refresh All
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Connected Accounts Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Accounts</h2>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Connected</h3>
              <p className="text-gray-600 mb-4">Connect your social media accounts to start tracking real-time metrics</p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Connect Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(account.platform)}
                      <div>
                        <p className="font-medium text-gray-900">{account.username}</p>
                        <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {account.is_active ? (
                        <Wifi className="w-4 h-4 text-green-500" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Followers:</span>
                      <span className="font-medium">{formatNumber(account.followers_count)}</span>
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
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last sync: {formatTime(account.last_sync)}</span>
                    <button
                      onClick={() => handleManualSync(account.id)}
                      disabled={syncing}
                      className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-Time Metrics */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {metrics.map((metric) => (
              <div key={metric.account.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(metric.account.platform)}
                    <span className="font-medium text-gray-900">{metric.account.username}</span>
                  </div>
                  <span className="text-xs text-gray-500">LIVE</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {formatNumber(metric.followers_count)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Followers</p>
                    <p className="text-xs text-green-600 font-medium">
                      +{metric.daily_growth} today
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-pink-500" />
                        <span className="text-sm font-medium">{metric.engagement_rate.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Engagement</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-purple-500" />
                        <span className="text-sm font-medium">{formatNumber(metric.reach)}</span>
                      </div>
                      <p className="text-xs text-gray-500">Reach</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Growth Trends */}
        {metrics.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Growth Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(metrics.reduce((sum, m) => sum + m.followers_count, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Followers</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {(metrics.reduce((sum, m) => sum + m.engagement_rate, 0) / metrics.length).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Avg Engagement</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(metrics.reduce((sum, m) => sum + m.reach, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Reach</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeDashboard;