// client/src/dashboard/admin/AdminContent.tsx - COMPLETE with DELETE Features
import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Calendar, Clock, Heart,
  Share2, TrendingUp, Edit, CheckCircle, XCircle, Search,
  BarChart3, Download, Upload, ExternalLink,
  Trash2, AlertTriangle, Image as ImageIcon
  } from 'lucide-react';
import { Card, Button, Modal, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';
import { ImageGallery } from '../../components/ImageGallery';
import { DropdownMenu } from '../../components/DropdownMenu';

interface ContentPost {
  id: string;
  client: string;
  client_name: string;
  platform: string;
  title: string;
  content: string;
  scheduled_date: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'posted';
  images?: Array<{ id: string; image_url: string; caption?: string; order: number }>;
  engagement_rate?: number;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  posted_at?: string;
  post_url?: string;
  admin_message?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
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
  const [showEditModal, setShowEditModal] = useState<ContentPost | null>(null);
  const [showPostModal, setShowPostModal] = useState<ContentPost | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ContentPost | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [showImageGallery, setShowImageGallery] = useState<{images: any[], index: number} | null>(null);

  const [newContent, setNewContent] = useState({
    client: '',
    platform: 'instagram',
    title: '',
    content: '',
    scheduled_date: '',
    admin_message: '',
    images: [] as File[],
    needs_client_approval: false
  });

  const [editContent, setEditContent] = useState({
    title: '',
    content: '',
    scheduled_date: '',
    admin_message: '',
    images: [] as File[],
    delete_old_images: false
  });

  const [postData, setPostData] = useState({
    post_url: '',
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);

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
      const formData = new FormData();
      formData.append('client', newContent.client);
      formData.append('platform', newContent.platform);
      formData.append('title', newContent.title);
      formData.append('content', newContent.content);
      formData.append('scheduled_date', newContent.scheduled_date);
      formData.append('admin_message', newContent.admin_message);
      formData.append('needs_client_approval', newContent.needs_client_approval.toString());
      
      newContent.images.forEach((img) => {
        formData.append('images', img);
      });

      await ApiService.createContent(formData);
      await fetchData();
      setShowCreateContent(false);
      setNewContent({
        client: '',
        platform: 'instagram',
        title: '',
        content: '',
        scheduled_date: '',
        admin_message: '',
        images: [],
        needs_client_approval: false
      });
      setImagePreview([]);
    } catch (error) {
      console.error('Failed to create content:', error);
      alert('Failed to create content');
    }
  };

  const handleEditContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    try {
      const formData = new FormData();
      formData.append('title', editContent.title);
      formData.append('content', editContent.content);
      formData.append('scheduled_date', editContent.scheduled_date);
      formData.append('admin_message', editContent.admin_message);
      formData.append('delete_old_images', editContent.delete_old_images.toString());
      
      editContent.images.forEach((img) => {
        formData.append('images', img);
      });

      await ApiService.updateContent(showEditModal.id, formData);
      await fetchData();
      setShowEditModal(null);
      setEditContent({
        title: '',
        content: '',
        scheduled_date: '',
        admin_message: '',
        images: [],
        delete_old_images: false
      });
      setImagePreview([]);
    } catch (error) {
      console.error('Failed to update content:', error);
      alert('Failed to update content');
    }
  };

  const handleMarkPosted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPostModal) return;

    try {
      await ApiService.markContentPosted(showPostModal.id, postData);
      await fetchData();
      setShowPostModal(null);
      setPostData({
        post_url: '',
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0
      });
    } catch (error) {
      console.error('Failed to mark as posted:', error);
      alert('Failed to mark as posted');
    }
  };

  const handleDeleteContent = async () => {
    if (!showDeleteConfirm) return;

    try {
      await ApiService.deleteContent(showDeleteConfirm.id);
      await fetchData();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContent.length === 0) return;

    try {
      await ApiService.bulkDeleteContent({
        content_ids: selectedContent.map(c => c.id)
      });
      setSelectedContent([]);
      setShowBulkDeleteConfirm(false);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const files = Array.from(e.target.files || []);
    
    if (isEdit) {
      setEditContent(prev => ({ ...prev, images: files }));
    } else {
      setNewContent(prev => ({ ...prev, images: files }));
    }
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleDownloadPost = async (postId: string) => {
    try {
      const response = await fetch(`${ApiService.getBaseURL()}/content/${postId}/download/`, {
        headers: {
          'Authorization': `Token ${ApiService.getToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `post_${postId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download post data');
    }
  };

  const handleDownloadImages = async (postId: string) => {
    try {
      const response = await fetch(`${ApiService.getBaseURL()}/content/${postId}/download_images/`, {
        headers: {
          'Authorization': `Token ${ApiService.getToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `post_${postId}_images.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download images');
    }
  };

  const openEditModal = (post: ContentPost) => {
    setShowEditModal(post);
    setEditContent({
      title: post.title,
      content: post.content,
      scheduled_date: post.scheduled_date,
      admin_message: post.admin_message || '',
      images: [],
      delete_old_images: false
    });
  };

  const openPostModal = (post: ContentPost) => {
    setShowPostModal(post);
    setPostData({
      post_url: post.post_url || '',
      likes: post.likes || 0,
      comments: post.comments || 0,
      shares: post.shares || 0,
      views: post.views || 0
    });
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

  // Bulk Mark Posted handler
  const handleBulkMarkPosted = async () => {
    if (selectedContent.length === 0) return;
    try {
      // You may want to prompt for post URLs and stats, but here we just mark as posted with empty/default data
      await ApiService.bulkMarkContentPosted({
        content_ids: selectedContent.map(c => c.id),
        // Optionally, you can add more fields if your API expects them
      });
      setSelectedContent([]);
      await fetchData();
    } catch (error) {
      console.error('Failed to bulk mark as posted:', error);
      alert('Failed to bulk mark as posted');
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
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  async function handleSetDraft(id: string) {
    try {
      await ApiService.setContentDraft(id);
      await fetchData();
    } catch (error) {
      console.error('Failed to set content to draft:', error);
      alert('Failed to set content to draft');
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage and approve client content across all platforms</p>
        </div>
        <div className="flex gap-3">
          {/* Bulk Actions */}
          {selectedContent.length > 0 && (
            <div className="flex gap-2">
              <Button variant="success" size="sm" onClick={() => handleBulkAction('approve')}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve ({selectedContent.length})
              </Button>
              <Button variant="primary" size="sm" onClick={handleBulkMarkPosted}>
                <Upload className="w-4 h-4 mr-1" />
                Mark Posted ({selectedContent.length})
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleBulkAction('reject')}>
                <XCircle className="w-4 h-4 mr-1" />
                Reject ({selectedContent.length})
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowBulkDeleteConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedContent.length})
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
            <Card key={post.id} className="overflow-visible relative">
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
              
              {/* Images Display */}
              {post.images && post.images.length > 0 && (
                <div className="h-48 bg-gray-100 mb-4 overflow-hidden relative rounded-lg">
                  <img 
                    src={post.images[0].image_url} 
                    alt="Content preview" 
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setShowImageGallery({images: post.images!, index: 0})}
                  />
                  {post.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {post.images.length} images
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{post.client_name}</p>
                  {post.title && <p className="font-bold text-gray-900">{post.title}</p>}
                  <p className="font-medium text-gray-700 capitalize">{post.platform}</p>
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
              
              {/* Updated Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                {post.status === 'pending-approval' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleApproveContent(post.id)} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectContent(post.id)} className="flex-1">
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                
                {post.status === 'approved' && (
                  <Button size="sm" variant="primary" onClick={() => openPostModal(post)} className="flex-1">
                    <Upload className="w-4 h-4 mr-1" />
                    Mark Posted
                  </Button>
                )}
                
                {post.images && post.images.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowImageGallery({images: post.images!, index: 0})}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    View ({post.images.length})
                  </Button>
                )}
                
                {/* Dropdown Menu for Other Actions */}
                <DropdownMenu
                  items={[
                    {
                      label: 'Edit Post',
                      icon: <Edit className="w-4 h-4" />,
                      onClick: () => openEditModal(post)
                    },
                    ...(post.status !== 'draft' ? [{
                      label: 'Set to Draft',
                      icon: <Edit className="w-4 h-4" />,
                      onClick: () => handleSetDraft(post.id)
                    }] : []),
                    ...(post.images && post.images.length > 0 ? [{
                      label: 'Download Images',
                      icon: <Download className="w-4 h-4" />,
                      onClick: () => handleDownloadImages(post.id)
                    }] : []),
                    {
                      label: 'Download Data',
                      icon: <Download className="w-4 h-4" />,
                      onClick: () => handleDownloadPost(post.id)
                    },
                    ...(post.post_url ? [{
                      label: 'View Posted',
                      icon: <ExternalLink className="w-4 h-4" />,
                      onClick: () => window.open(post.post_url, '_blank')
                    }] : []),
                    {
                      label: 'Delete Post',
                      icon: <Trash2 className="w-4 h-4" />,
                      onClick: () => setShowDeleteConfirm(post),
                      variant: 'danger' as const
                    }
                  ]}
                />
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
                  <th className="text-left pb-3 font-medium text-gray-900">Images</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Client</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Platform</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Title/Content</th>
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
                    <td className="py-4">
                      {post.images && post.images.length > 0 ? (
                        <div className="flex gap-1">
                          <img 
                            src={post.images[0].image_url} 
                            alt="Preview" 
                            className="w-12 h-12 object-cover rounded"
                          />
                          {post.images.length > 1 && (
                            <span className="text-xs text-gray-500">+{post.images.length - 1}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No images</span>
                      )}
                    </td>
                    <td className="py-4 text-gray-900">{post.client_name}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                        <span className="capitalize">{post.platform}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      {post.title && <p className="font-semibold text-gray-900">{post.title}</p>}
                      <p className="text-gray-700 truncate max-w-xs text-sm">{post.content}</p>
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
                          onClick={() => openEditModal(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {post.images && post.images.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadImages(post.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setShowDeleteConfirm(post)}
                        >
                          <Trash2 className="w-4 h-4" />
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
        onClose={() => {
          setShowCreateContent(false);
          setImagePreview([]);
        }}
        title="Create New Content"
        size="lg"
      >
        <form onSubmit={handleCreateContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform *</label>
            <select
              value={newContent.platform}
              onChange={(e) => setNewContent({ ...newContent, platform: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Post title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date *</label>
              <input
                type="datetime-local"
                value={newContent.scheduled_date}
                onChange={(e) => setNewContent({ ...newContent, scheduled_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e, false)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {imagePreview.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message to Client</label>
            <textarea
              value={newContent.admin_message}
              onChange={(e) => setNewContent({ ...newContent, admin_message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Add notes or instructions for the client..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="needs_approval"
              checked={newContent.needs_client_approval}
              onChange={(e) => setNewContent({ ...newContent, needs_client_approval: e.target.checked })}
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="needs_approval" className="ml-2 text-sm text-gray-700">
              Needs client approval before posting
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateContent(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {newContent.needs_client_approval ? 'Create & Send for Approval' : 'Create & Approve'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal
          isOpen={!!showEditModal}
          onClose={() => {
            setShowEditModal(null);
            setImagePreview([]);
          }}
          title="Edit Content"
          size="lg"
        >
          <form onSubmit={handleEditContent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={editContent.title}
                onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={editContent.content}
                onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date</label>
              <input
                type="datetime-local"
                value={editContent.scheduled_date}
                onChange={(e) => setEditContent({ ...editContent, scheduled_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Existing Images */}
            {showEditModal.images && showEditModal.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {showEditModal.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt="Current"
                      className="w-full h-24 object-cover rounded"
                    />
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="delete_old"
                    checked={editContent.delete_old_images}
                    onChange={(e) => setEditContent({ ...editContent, delete_old_images: e.target.checked })}
                    className="w-4 h-4 text-purple-600"
                  />
                  <label htmlFor="delete_old" className="ml-2 text-sm text-gray-700">
                    Delete old images when uploading new ones
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e, true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {imagePreview.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Message</label>
              <textarea
                value={editContent.admin_message}
                onChange={(e) => setEditContent({ ...editContent, admin_message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mark as Posted Modal */}
      {showPostModal && (
        <Modal
          isOpen={!!showPostModal}
          onClose={() => setShowPostModal(null)}
          title="Mark as Posted"
          size="md"
        >
          <form onSubmit={handleMarkPosted} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Post URL *</label>
              <input
                type="url"
                value={postData.post_url}
                onChange={(e) => setPostData({ ...postData, post_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Likes</label>
                <input
                  type="number"
                  value={postData.likes}
                  onChange={(e) => setPostData({ ...postData, likes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <input
                  type="number"
                  value={postData.comments}
                  onChange={(e) => setPostData({ ...postData, comments: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shares</label>
                <input
                  type="number"
                  value={postData.shares}
                  onChange={(e) => setPostData({ ...postData, shares: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Views</label>
                <input
                  type="number"
                  value={postData.views}
                  onChange={(e) => setPostData({ ...postData, views: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPostModal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="success">
                <Upload className="w-4 h-4 mr-2" />
                Mark as Posted
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Delete Content Post"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900 font-semibold">Are you sure you want to delete this post?</p>
                <p className="text-gray-600 mt-1">
                  This will permanently delete <strong>{showDeleteConfirm.title || 'this content'}</strong> and all associated images.
                </p>
                <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                <strong>Client:</strong> {showDeleteConfirm.client_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Platform:</strong> {showDeleteConfirm.platform}
              </p>
              {showDeleteConfirm.images && showDeleteConfirm.images.length > 0 && (
                <p className="text-sm text-gray-600">
                  <strong>Images:</strong> {showDeleteConfirm.images.length} file(s) will be deleted
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteContent}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <Modal
          isOpen={showBulkDeleteConfirm}
          onClose={() => setShowBulkDeleteConfirm(false)}
          title="Delete Multiple Posts"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-900 font-semibold">
                  Are you sure you want to delete {selectedContent.length} post(s)?
                </p>
                <p className="text-gray-600 mt-1">
                  This will permanently delete all selected posts and their associated images.
                </p>
                <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
              <p className="text-sm font-semibold text-gray-700 mb-2">Posts to be deleted:</p>
              <ul className="space-y-1">
                {selectedContent.map(post => (
                  <li key={post.id} className="text-sm text-gray-600">
                    • {post.title || post.content.substring(0, 50)} ({post.client_name})
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedContent.length} Post(s)
              </Button>
            </div>
          </div>
        </Modal>
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

export default AdminContent;