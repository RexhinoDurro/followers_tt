import React, { useState, useEffect, type JSX } from 'react';
import { 
  Users, 
  TrendingUp, 
  Eye, 
  Heart, 
  RefreshCw, 
  Plus, 
  Wifi, 
  WifiOff
} from 'lucide-react';

// Type definitions
interface Account {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  followers_count: number;
  engagement_rate: number;
  posts_count: number;
  last_sync: string;
}

interface Metric {
  account: {
    id: string;
    platform: string;
    username: string;
  };
  followers_count: number;
  engagement_rate: number;
  reach: number;
  daily_growth: number;
}

interface ApiResponse<T> {
  accounts?: T[];
  data?: T[];
}

const RealTimeDashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnectAccount = async (platform: string) => {
    try {
      const response = await fetch(`/api/oauth/${platform}/init`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.auth_url) {
        // Open OAuth window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const oauthWindow = window.open(
          data.auth_url,
          'Connect Account',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Handle OAuth callback
        window.addEventListener('message', async (event) => {
          if (event.origin === window.location.origin && event.data?.type === 'oauth_callback') {
            if (oauthWindow) oauthWindow.close();
            
            const { code, state } = event.data;
            
            // Complete OAuth flow
            const callbackResponse = await fetch(`/api/oauth/${platform}/callback`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ code, state })
            });
            
            if (callbackResponse.ok) {
              await fetchData(); // Refresh data after successful connection
            }
          }
        });
      }
    } catch (error) {
      setError('Failed to initiate account connection');
      console.error('Connection error:', error);
    }
  };

  // API service with real endpoints
  const ApiService = {
    async getConnectedAccounts(): Promise<ApiResponse<Account>> {
      const response = await fetch('/api/social-accounts', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      return await response.json();
    },

    async getRealTimeMetrics(): Promise<ApiResponse<Metric>> {
      const response = await fetch('/api/realtime-metrics', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      return await response.json();
    },

    async triggerManualSync(accountId: string): Promise<{ message: string }> {
      const response = await fetch(`/api/social-accounts/${accountId}/sync`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to trigger sync');
      
      return await response.json();
    }
  };

  const fetchData = async (): Promise<void> => {
    try {
      setError(null);
      const [accountsData, metricsData] = await Promise.all([
        ApiService.getConnectedAccounts(),
        ApiService.getRealTimeMetrics()
      ]);

      setAccounts(accountsData.accounts || []);
      setMetrics(metricsData.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async (accountId: string): Promise<void> => {
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

  const getPlatformIcon = (platform: string): JSX.Element => {
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
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
              <div className="space-y-4">
                <button
                  onClick={() => handleConnectAccount('instagram')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-pink-600 font-bold text-xs">IG</span>
                  </div>
                  <span>Connect Instagram</span>
                </button>
                <button
                  onClick={() => handleConnectAccount('youtube')}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">YT</span>
                  </div>
                  <span>Connect YouTube</span>
                </button>
              </div>
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