import React, { useState, useEffect, type JSX } from 'react';
import { 
  Plus, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Trash2,
  Settings
} from 'lucide-react';

// Type definitions
interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  followers_count: number;
  engagement_rate: number;
  last_sync: string;
  created_at: string;
}

interface Platform {
  id: string;
  name: string;
  icon: () => JSX.Element;
  color: string;
  description: string;
  features: string[];
  comingSoon?: boolean;
}

interface OAuthResponse {
  oauth_url: string;
  state: string;
}

interface ConnectionResponse {
  message: string;
  account: ConnectedAccount;
}

interface AccountsResponse {
  accounts: ConnectedAccount[];
}

const SocialMediaConnector: React.FC = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mock API service - replace with your actual API calls
  const ApiService = {
    async getConnectedAccounts(): Promise<AccountsResponse> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        accounts: [
          {
            id: '1',
            platform: 'instagram',
            username: 'your_business_account',
            is_active: true,
            followers_count: 15420,
            engagement_rate: 4.2,
            last_sync: new Date(Date.now() - 300000).toISOString(),
            created_at: new Date(Date.now() - 86400000 * 7).toISOString()
          }
        ]
      };
    },

    async initiateOAuth(platform: string): Promise<OAuthResponse> {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate OAuth initiation
      const mockUrls: Record<string, string> = {
        instagram: 'https://api.instagram.com/oauth/authorize?client_id=mock&response_type=code&scope=instagram_basic',
        youtube: 'https://accounts.google.com/oauth2/auth?client_id=mock&response_type=code&scope=youtube.readonly'
      };

      return {
        oauth_url: mockUrls[platform],
        state: 'mock_state_token'
      };
    },

    async handleOAuthCallback(platform: string, _code: string, _state: string): Promise<ConnectionResponse> {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      const mockAccount: ConnectedAccount = {
        id: Date.now().toString(),
        platform,
        username: platform === 'instagram' ? 'new_instagram_account' : 'New YouTube Channel',
        is_active: true,
        followers_count: Math.floor(Math.random() * 10000) + 1000,
        engagement_rate: Math.random() * 5 + 2,
        last_sync: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      return {
        message: `${platform} account connected successfully`,
        account: mockAccount
      };
    },

    async disconnectAccount(_accountId: string): Promise<{ message: string }> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { message: 'Account disconnected successfully' };
    },

    async triggerSync(_accountId: string): Promise<{ message: string }> {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { message: 'Sync completed successfully' };
    }
  };

  const platforms: Platform[] = [
    {
      id: 'instagram',
      name: 'Instagram Business',
      icon: () => (
        <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          IG
        </div>
      ),
      color: 'from-purple-500 to-pink-500',
      description: 'Connect your Instagram Business account to track followers, engagement, and post performance.',
      features: ['Real-time follower count', 'Engagement analytics', 'Post metrics', 'Story insights']
    },
    {
      id: 'youtube',
      name: 'YouTube Channel',
      icon: () => (
        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          YT
        </div>
      ),
      color: 'from-red-500 to-red-600',
      description: 'Connect your YouTube channel to monitor subscribers, views, and video performance.',
      features: ['Subscriber growth', 'Video analytics', 'Watch time metrics', 'Revenue tracking']
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: () => (
        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-lg">
          TT
        </div>
      ),
      color: 'from-gray-800 to-black',
      description: 'Connect your TikTok account to track followers, video views, and trending content.',
      features: ['Follower analytics', 'Video performance', 'Trending insights', 'Engagement metrics'],
      comingSoon: true
    }
  ];

  const fetchConnectedAccounts = async (): Promise<void> => {
    try {
      setError(null);
      const data = await ApiService.getConnectedAccounts();
      setConnectedAccounts(data.accounts);
    } catch (err) {
      setError('Failed to fetch connected accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string): Promise<void> => {
  try {
    setConnecting(platform);
    setError(null);
    
    // ✅ CORRECT: Use the public method
    const response = await ApiService.initiateOAuth(platform);
    
    if (response && typeof response === 'object' && 'oauth_url' in response) {
      // Redirect to OAuth URL (backend will handle callback)
      window.location.href = response.oauth_url;
    } else {
      throw new Error('No OAuth URL received');
    }
    
  } catch (err) {
    setError(`Failed to connect ${platform} account`);
    console.error(err);
    setConnecting(null);
  }
};

  const handleDisconnect = async (accountId: string, username: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to disconnect ${username}? This will stop data collection but preserve historical data.`)) {
      return;
    }

    try {
      setError(null);
      await ApiService.disconnectAccount(accountId);
      
      // Remove from local state
      setConnectedAccounts(prev => prev.filter(account => account.id !== accountId));
      setSuccess('Account disconnected successfully');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to disconnect account');
      console.error(err);
    }
  };

  const handleSync = async (accountId: string): Promise<void> => {
    try {
      setError(null);
      await ApiService.triggerSync(accountId);
      
      // Update last sync time in local state
      setConnectedAccounts(prev => 
        prev.map(account => 
          account.id === accountId 
            ? { ...account, last_sync: new Date().toISOString() }
            : account
        )
      );
      
      setSuccess('Account synced successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to sync account');
      console.error(err);
    }
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getConnectedAccount = (platformId: string): ConnectedAccount | undefined => {
    return connectedAccounts.find(account => account.platform === platformId);
  };

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl border p-6">
                <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Connect Your Social Media Accounts
        </h1>
        <p className="text-gray-600">
          Connect your social media accounts to start tracking real-time analytics and performance metrics.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedAccounts.map((account) => {
              const platform = platforms.find(p => p.id === account.platform);
              return (
                <div key={account.id} className="bg-white rounded-xl border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {platform?.icon()}
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.username}</h3>
                        <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSync(account.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Sync now"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDisconnect(account.id, account.username)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Disconnect"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                    <span>Last sync: {formatTime(account.last_sync)}</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const isConnected = getConnectedAccount(platform.id);
            const isConnecting = connecting === platform.id;
            
            return (
              <div
                key={platform.id}
                className={`bg-white rounded-xl border p-6 shadow-sm ${
                  isConnected ? 'border-green-200 bg-green-50' : 'hover:shadow-md transition-shadow'
                }`}
              >
                <div className="flex items-center mb-4">
                  {platform.icon()}
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                    {platform.comingSoon && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{platform.description}</p>
                
                <ul className="space-y-1 mb-6">
                  {platform.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Connected as {isConnected.username}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isConnecting || platform.comingSoon}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      platform.comingSoon
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${platform.color} text-white hover:opacity-90 disabled:opacity-50`
                    }`}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : platform.comingSoon ? (
                      'Coming Soon'
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Connect {platform.name}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-700 mb-4">
          Having trouble connecting your accounts? Check out our setup guide for step-by-step instructions.
        </p>
        <div className="flex space-x-4">
          <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <ExternalLink className="w-4 h-4 mr-2" />
            Setup Guide
          </button>
          <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <ExternalLink className="w-4 h-4 mr-2" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaConnector;