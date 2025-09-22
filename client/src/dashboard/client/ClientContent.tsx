// client/src/dashboard/client/ClientContent.tsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Calendar, Clock, Eye, Heart, MessageCircle,
  Share2, Edit, CheckCircle
} from 'lucide-react';
import { Card, Button, Modal, Input, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';

interface ContentPost {
  id: string;
  platform: string;
  content: string;
  scheduled_date: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  image_url?: string;
  engagement_rate?: number;
  created_at: string;
}

const ClientContent: React.FC = () => {
  const [content, setContent] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [showCreateContent, setShowCreateContent] = useState(false);
  const [newContent, setNewContent] = useState({
    platform: 'instagram',
    content: '',
    scheduled_date: '',
    image_url: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getContent();
      setContent(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createContent(newContent);
      await fetchContent();
      setShowCreateContent(false);
      setNewContent({
        platform: 'instagram',
        content: '',
        scheduled_date: '',
        image_url: ''
      });
    } catch (error) {
      console.error('Failed to create content:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending-approval': return 'warning';
      case 'approved': return 'primary';
      case 'posted': return 'success';
      default: return 'default';
    }
  };

  const filteredContent = content.filter(post => {
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesPlatform && matchesStatus;
  });

  const stats = {
    total: content.length,
    draft: content.filter(c => c.status === 'draft').length,
    pending: content.filter(c => c.status === 'pending-approval').length,
    approved: content.filter(c => c.status === 'approved').length,
    posted: content.filter(c => c.status === 'posted').length
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-600 mt-1">Plan and manage your social media content</p>
        </div>
        <Button onClick={() => setShowCreateContent(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm">Total Posts</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
            <Edit className="w-8 h-8 text-gray-400" />
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

      {/* Filters and View Mode */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending-approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="posted">Posted</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((post) => (
            <Card key={post.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden">
              {post.image_url && (
                <div className="h-48 bg-gray-100 -mx-6 -mt-6 mb-4 overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt="Content preview" 
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
              
              <p className="text-gray-700 mb-4 line-clamp-3">
                {post.content}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.scheduled_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(post.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {post.status === 'posted' && post.engagement_rate && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="flex items-center text-pink-600">
                        <Heart className="w-4 h-4 mr-1" />
                        {(post.engagement_rate * 100).toFixed(1)}%
                      </span>
                      <span className="flex items-center text-blue-600">
                        <Eye className="w-4 h-4 mr-1" />
                        12.5K
                      </span>
                      <span className="flex items-center text-green-600">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        234
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {post.status === 'draft' && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Submit
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3 font-medium text-gray-900">Platform</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Content</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Scheduled</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Status</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Engagement</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredContent.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getPlatformIcon(post.platform)}</span>
                        <span className="capitalize">{post.platform}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-gray-700 truncate max-w-xs">{post.content}</p>
                    </td>
                    <td className="py-4 text-gray-600">
                      {new Date(post.scheduled_date).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <Badge variant={getStatusColor(post.status)}>
                        {post.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4">
                      {post.engagement_rate ? `${(post.engagement_rate * 100).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar View Coming Soon</h3>
            <p className="text-gray-600">A visual calendar to manage your content schedule</p>
          </div>
        </Card>
      )}

      {/* Create Content Modal */}
      <Modal
        isOpen={showCreateContent}
        onClose={() => setShowCreateContent(false)}
        title="Create New Content"
        size="lg"
      >
        <form onSubmit={handleCreateContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
            <select
              value={newContent.platform}
              onChange={(e) => setNewContent({ ...newContent, platform: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={newContent.content}
              onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={6}
              placeholder="Write your post content here..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {newContent.content.length} characters
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Schedule Date"
              type="datetime-local"
              value={newContent.scheduled_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContent({ ...newContent, scheduled_date: e.target.value })}
              required
            />
            
            <Input
              label="Image URL (optional)"
              type="url"
              value={newContent.image_url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContent({ ...newContent, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
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
    </div>
  );
};

export default ClientContent;