// client/src/dashboard/admin/AdminContent.tsx - Complete Implementation
import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Calendar, Clock, Eye, Heart, MessageCircle,
  Share2, TrendingUp, Edit,
  CheckCircle, XCircle, Search,
  BarChart3
} from 'lucide-react';
import { Card, Button, Modal, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';

interface ContentPost {
  id: string;
  client: string;
  client_name: string;
  platform: string;
  content: string;
  scheduled_date: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  image_url?: string;
  engagement_rate?: number;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
  platforms: string[];
}

const AdminContent: React.FC = () => {
  const [content, setContent] = useState<ContentPost[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentPost[]>([]);
  const [filterClient, setFilterClient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateContent, setShowCreateContent] = useState(false);
  const [showContentDetails, setShowContentDetails] = useState<ContentPost | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');

  const [newContent, setNewContent] = useState({
    client: '',
    platform: 'instagram',
    content: '',
    scheduled_date: '',
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contentData, clientsData] = await Promise.all([
        ApiService.getContent(),
        ApiService.getClients()
      ]);
      
      setContent(Array.isArray(contentData) ? contentData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createContent({
        ...newContent,
        status: 'approved' // Admin can directly approve
      });
      await fetchData();
      setShowCreateContent(false);
      setNewContent({
        client: '',
        platform: 'instagram',
        content: '',
        scheduled_date: '',
        image_url: ''
      });
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  const handleApproveContent = async (contentId: string) => {
    try {
      await ApiService.approveContent(contentId);
      await fetchData();
    } catch (error) {
      console.error('Failed to approve content:', error);
    }
  };

  const handleRejectContent = async (contentId: string) => {
    try {
      await ApiService.rejectContent(contentId);
      await fetchData();
    } catch (error) {
      console.error('Failed to reject content:', error);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedContent.length === 0) return;
    
    try {
      await ApiService.bulkApproveContent({
        content_ids: selectedContent.map(c => c.id),
        action,
        feedback: action === 'reject' ? 'Bulk rejected by admin' : undefined
      });
      setSelectedContent([]);
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
    }
  };

  const toggleContentSelection = (content: ContentPost) => {
    setSelectedContent(prev => 
      prev.find(c => c.id === content.id)
        ? prev.filter(c => c.id !== content.id)
        : [...prev, content]
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
    const matchesClient = filterClient === 'all' || post.client === filterClient;
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    const matchesSearch = searchTerm === '' || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesClient && matchesStatus && matchesPlatform && matchesSearch;
  });

  const stats = {
    total: content.length,
    draft: content.filter(c => c.status === 'draft').length,
    pending: content.filter(c => c.status === 'pending-approval').length,
    approved: content.filter(c => c.status === 'approved').length,
    posted: content.filter(c => c.status === 'posted').length,
    thisWeek: content.filter(c => {
      const created = new Date(c.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length
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
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage and approve client content across all platforms</p>
        </div>
        <div className="flex gap-3">
          {selectedContent.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="success" 
                size="sm"
                onClick={() => handleBulkAction('approve')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve ({selectedContent.length})
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => handleBulkAction('reject')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject ({selectedContent.length})
              </Button>
            </div>
          )}
          <Button onClick={() => setShowCreateContent(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm">Total Posts</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
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
        
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
            <Edit className="w-8 h-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm">This Week</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.thisWeek}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
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
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((post) => (
            <Card key={post.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedContent.find(c => c.id === post.id) !== undefined}
                  onChange={() => toggleContentSelection(post)}
                  className="w-4 h-4 text-purple-600"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                  <Badge variant={getStatusColor(post.status)}>
                    {post.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              
              {post.image_url && (
                <div className="h-48 bg-gray-100 -mx-6 -mt-6 mb-4 overflow-hidden">
                  <img 
                    src={post.image_url} 
                    alt="Content preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{post.client_name}</p>
                  <p className="font-medium text-gray-900 capitalize">{post.platform}</p>
                </div>
                
                <p className="text-gray-700 text-sm line-clamp-3">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(post.scheduled_date).toLocaleDateString()}
                  </span>
                  {post.engagement_rate && (
                    <span>
                      <Heart className="w-3 h-3 inline mr-1" />
                      {(post.engagement_rate * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              
              {post.status === 'pending-approval' && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button 
                    size="sm" 
                    variant="success"
                    className="flex-1"
                    onClick={() => handleApproveContent(post.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleRejectContent(post.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowContentDetails(post)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                {post.status === 'posted' && (
                  <div className="flex gap-1 text-sm text-gray-600">
                    <Heart className="w-4 h-4" />
                    <MessageCircle className="w-4 h-4" />
                    <Share2 className="w-4 h-4" />
                  </div>
                )}
              </div>
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
                  <th className="text-left pb-3">
                    <input
                      type="checkbox"
                      checked={selectedContent.length === filteredContent.length && filteredContent.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContent(filteredContent);
                        } else {
                          setSelectedContent([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left pb-3 font-medium text-gray-900">Client</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Platform</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Content</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Scheduled</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Status</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredContent.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={selectedContent.find(c => c.id === post.id) !== undefined}
                        onChange={() => toggleContentSelection(post)}
                      />
                    </td>
                    <td className="py-4 text-gray-900">{post.client_name}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPlatformIcon(post.platform)}</span>
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
                      <div className="flex gap-2">
                        {post.status === 'pending-approval' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleApproveContent(post.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectContent(post.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowContentDetails(post)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={newContent.client}
              onChange={(e) => setNewContent({ ...newContent, client: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
          </div>
          
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
              <input
                type="datetime-local"
                value={newContent.scheduled_date}
                onChange={(e) => setNewContent({ ...newContent, scheduled_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={newContent.image_url}
                onChange={(e) => setNewContent({ ...newContent, image_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateContent(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create & Approve
            </Button>
          </div>
        </form>
      </Modal>

      {/* Content Details Modal */}
      {showContentDetails && (
        <Modal
          isOpen={!!showContentDetails}
          onClose={() => setShowContentDetails(null)}
          title="Content Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Client</label>
                <p className="text-gray-900">{showContentDetails.client_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Platform</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlatformIcon(showContentDetails.platform)}</span>
                  <span className="capitalize">{showContentDetails.platform}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant={getStatusColor(showContentDetails.status)}>
                  {showContentDetails.status.replace('-', ' ')}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Scheduled Date</label>
                <p className="text-gray-900">{new Date(showContentDetails.scheduled_date).toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Content</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{showContentDetails.content}</p>
            </div>
            
            {showContentDetails.image_url && (
              <div>
                <label className="text-sm font-medium text-gray-600">Image</label>
                <img 
                  src={showContentDetails.image_url} 
                  alt="Content" 
                  className="mt-2 max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            {showContentDetails.engagement_rate && (
              <div>
                <label className="text-sm font-medium text-gray-600">Engagement Rate</label>
                <p className="text-gray-900">{(showContentDetails.engagement_rate * 100).toFixed(1)}%</p>
              </div>
            )}
            
            {showContentDetails.approved_by_name && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Approved By</label>
                  <p className="text-gray-900">{showContentDetails.approved_by_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Approved At</label>
                  <p className="text-gray-900">
                    {showContentDetails.approved_at && new Date(showContentDetails.approved_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminContent;