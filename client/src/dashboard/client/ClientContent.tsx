import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { 
  Plus, Calendar, Clock, Eye, Heart, MessageCircle, Share2, Edit, CheckCircle, 
  ExternalLink, Image, Send, ArrowLeft
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';
import type { ContentPost } from '../../types';
import { ImageGallery } from '../../components/ImageGallery';

// Enhanced ContentPost interface for this component
interface EnhancedContentPost extends ContentPost {
  title?: string;
  images?: Array<{ image_url: string }>;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  post_url?: string;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  is_active: boolean;
  followers_count?: number;
  engagement_rate?: number;
  posts_count?: number;
  last_sync?: string;
  created_at?: string;
}

interface ContentFormData {
  platform: string;
  social_account: string;
  title: string;
  content: string;
  scheduled_date: string;
  admin_message: string;
  images: File[];
}

const ClientContent: React.FC = () => {
  const [content, setContent] = useState<EnhancedContentPost[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'create' | 'calendar'>('grid');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [showImageGallery, setShowImageGallery] = useState<{images: any[], index: number} | null>(null);

  const [formData, setFormData] = useState<ContentFormData>({
    platform: '',
    social_account: '',
    title: '',
    content: '',
    scheduled_date: '',
    admin_message: '',
    images: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contentData, accountsData] = await Promise.all([
        ApiService.getContent(),
        ApiService.getConnectedAccounts()
      ]);
      
      // Handle contentData with proper typing
      const contentArray = Array.isArray(contentData) 
        ? contentData as EnhancedContentPost[]
        : (contentData as any)?.results || [] as EnhancedContentPost[];
      setContent(contentArray);
      
      // Handle accountsData with proper typing
      const accountsArray = Array.isArray(accountsData) 
        ? accountsData as ConnectedAccount[]
        : (accountsData as any)?.accounts || [] as ConnectedAccount[];
      setConnectedAccounts(accountsArray.filter((acc: ConnectedAccount) => acc.is_active));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    setFormData(prev => ({ ...prev, images: files }));
    
    const previews = files.map((file: File) => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_: File, i: number) => i !== index);
    const newPreviews = imagePreview.filter((_: string, i: number) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('platform', formData.platform);
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('scheduled_date', formData.scheduled_date);
      submitData.append('admin_message', formData.admin_message);
      
      if (formData.social_account) {
        submitData.append('social_account', formData.social_account);
      }
      
      formData.images.forEach((img: File) => {
        submitData.append('images', img);
      });

      await ApiService.createContent(submitData);
      
      // Reset form
      setFormData({
        platform: '',
        social_account: '',
        title: '',
        content: '',
        scheduled_date: '',
        admin_message: '',
        images: []
      } as ContentFormData);
      setImagePreview([]);
      
      // Refresh data and switch to grid view
      await fetchData();
      setViewMode('grid');
      alert('Content submitted for approval!');
      
    } catch (error) {
      console.error('Failed to create content:', error);
      alert('Failed to submit content. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      instagram: '📸',
      youtube: '🎥',
      tiktok: '🎵'
    };
    return icons[platform] || '📱';
  };

  const getStatusColor = (status: string): 'default' | 'warning' | 'primary' | 'success' => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending-approval': return 'warning';
      case 'approved': return 'primary';
      case 'posted': return 'success';
      default: return 'default';
    }
  };

  const filteredContent = content.filter(post => {
    if (filterPlatform === 'all') return true;
    return post.platform === filterPlatform;
  });

  const stats = {
    total: content.length,
    draft: content.filter(c => c.status === 'draft').length,
    pending: content.filter(c => c.status === 'pending-approval').length,
    approved: content.filter(c => c.status === 'approved').length,
    posted: content.filter(c => c.status === 'posted').length
  };

  const platformStats = ['instagram', 'youtube', 'tiktok'].map(platform => ({
    platform,
    count: content.filter(c => c.platform === platform).length,
    account: connectedAccounts.find(acc => acc.platform === platform && acc.is_active)
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // CREATE CONTENT VIEW
  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('grid')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Content</h1>
              <p className="text-gray-600 mt-1">Schedule your social media post</p>
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <Card title="Select Platform">
          <div className="grid grid-cols-3 gap-4">
            {['instagram', 'youtube', 'tiktok'].map((platform) => {
              const account = connectedAccounts.find(acc => acc.platform === platform && acc.is_active);
              const isDisabled = !account;
              
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      setFormData(prev => ({ ...prev, platform, social_account: account.id }));
                    }
                  }}
                  disabled={isDisabled}
                  className={`p-6 border-2 rounded-xl transition-all ${
                    formData.platform === platform
                      ? 'border-purple-600 bg-purple-50'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-3xl">{getPlatformIcon(platform)}</span>
                    <span className="font-medium capitalize">{platform}</span>
                    {account && (
                      <span className="text-xs text-gray-600">@{account.username}</span>
                    )}
                    {!account && (
                      <Badge variant="warning">Not Connected</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Post Details */}
        <Card title="Post Details">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter a catchy title for your post"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Description / Caption *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={6}
                placeholder="Write your post content here..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content.length} characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>
        </Card>

        {/* Images Upload */}
        <Card title="Upload Images">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer block">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click to upload images</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
              </label>
            </div>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Message to Admin */}
        <Card title="Message to Admin (Optional)">
          <textarea
            value={formData.admin_message}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_message: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={4}
            placeholder="Add any special instructions or notes for your admin..."
          />
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setViewMode('grid')}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !formData.platform}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      </div>
    );
  }

  // GRID VIEW (DEFAULT)
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-600 mt-1">Plan and manage your social media content</p>
        </div>
        <Button onClick={() => setViewMode('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platformStats.map(({ platform, count, account }) => (
          <div
            key={platform}
            className={`cursor-pointer transition-all ${
              filterPlatform === platform ? 'ring-2 ring-purple-600 bg-purple-50' : ''
            }`}
            onClick={() => setFilterPlatform(filterPlatform === platform ? 'all' : platform)}
          >
            <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getPlatformIcon(platform)}</span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{platform}</p>
                  {account && (
                    <p className="text-sm text-gray-600">@{account.username}</p>
                  )}
                  {!account && (
                    <Badge variant="warning">Not Connected</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">posts</p>
              </div>
            </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-purple-900">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm">Posted</p>
              <p className="text-2xl font-bold text-green-900">{stats.posted}</p>
            </div>
            <Share2 className="w-8 h-8 text-green-400" />
          </div>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterPlatform('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterPlatform === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Content
          </button>
          {['instagram', 'youtube', 'tiktok'].map(platform => (
            <button
              key={platform}
              onClick={() => setFilterPlatform(filterPlatform === platform ? 'all' : platform)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                filterPlatform === platform
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{getPlatformIcon(platform)}</span>
              <span className="capitalize">{platform}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'calendar' ? 'grid' : 'calendar')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
            viewMode === 'calendar'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar View</span>
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            {post.images && post.images.length > 0 && (
              <div className="h-48 bg-gray-100 -mx-6 -mt-6 mb-4 overflow-hidden">
                <img 
                  src={post.images[0].image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                <span className="font-medium text-gray-900 capitalize">{post.platform}</span>
              </div>
              <Badge variant={getStatusColor(post.status)}>
                {post.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{post.content}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(post.scheduled_date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(post.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {post.status === 'posted' && (
              <>
                {post.post_url && (
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live Post
                    </Button>
                  </a>
                )}
                
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-pink-600">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes || 0}
                    </span>
                    <span className="flex items-center text-blue-600">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments || 0}
                    </span>
                    <span className="flex items-center text-green-600">
                      <Share2 className="w-4 h-4 mr-1" />
                      {post.shares || 0}
                    </span>
                    <span className="flex items-center text-purple-600">
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </>
            )}
            
            {post.images && post.images.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => setShowImageGallery({images: post.images!, index: 0})}
              >
                <Image className="w-4 h-4 mr-2" />
                View Images ({post.images.length})
              </Button>
            )}

            {post.status === 'draft' && (
              <Button size="sm" variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-1" />
                Edit Draft
              </Button>
            )}
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Content Yet</h3>
          <p className="text-gray-600 mb-4">Create your first post to get started</p>
          <Button onClick={() => setViewMode('create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </Card>
      )}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <ImageGallery
          images={showImageGallery.images}
          isOpen={!!showImageGallery}
          onClose={() => setShowImageGallery(null)}
          initialIndex={showImageGallery.index}
        />
      )}
    </div>
  );
};

export default ClientContent;