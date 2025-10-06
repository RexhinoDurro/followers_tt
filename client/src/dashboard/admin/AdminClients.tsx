// client/src/dashboard/admin/AdminClients.tsx - With Payment Verification
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, MoreVertical, Edit, 
  DollarSign, TrendingUp, Mail, 
  CheckCircle, AlertCircle, RefreshCw, Clock} from 'lucide-react';
import { Card, Button, Modal, Input, Badge } from '../../components/ui';
import type { FormSubmitHandler } from '../../types';
import ApiService from '../../services/ApiService';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  package: string;
  monthly_fee: number;
  status: 'active' | 'pending' | 'paused';
  payment_status: 'paid' | 'overdue' | 'pending';
  platforms: string[];
  account_manager: string;
  next_payment: string;
  total_spent: number;
  created_at: string;
}

interface PaymentVerification {
  id: string;
  client_name: string;
  client_email: string;
  client_full_name: string;
  plan: string;
  amount: number;
  submitted_at: string;
  status: string;
}

const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [, setShowEditClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Payment verification states
  const [pendingVerifications, setPendingVerifications] = useState<PaymentVerification[]>([]);
  const [showVerificationsModal, setShowVerificationsModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);
  const [selectedPlanForApproval, setSelectedPlanForApproval] = useState('');

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    package: 'starter',
    monthly_fee: 1500,
    platforms: [] as string[]
  });

  useEffect(() => {
    fetchClients();
    fetchPendingVerifications();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching clients...');
      
      const data = await ApiService.getClients();
      console.log('Received clients data:', data);
      
      const clientsArray = Array.isArray(data) ? data : [];
      
      console.log('Setting clients:', clientsArray);
      setClients(clientsArray);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const data = await ApiService.getPendingVerifications();
      console.log('Pending verifications:', data);
      if (typeof data === 'object' && data !== null && 'verifications' in data) {
        setPendingVerifications((data as { verifications: PaymentVerification[] }).verifications || []);
      } else {
        setPendingVerifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
      setPendingVerifications([]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchClients();
    await fetchPendingVerifications();
  };

  const handleApproveVerification = async () => {
    if (!selectedVerification || !selectedPlanForApproval) {
      alert('Please select a plan for approval');
      return;
    }

    try {
      await ApiService.approvePaymentVerification(
        selectedVerification.id,
        selectedPlanForApproval
      );
      
      alert('Payment verification approved successfully!');
      
      // Refresh data
      await fetchClients();
      await fetchPendingVerifications();
      
      // Close modal
      setSelectedVerification(null);
      setSelectedPlanForApproval('');
      setShowVerificationsModal(false);
      
    } catch (error) {
      console.error('Failed to approve verification:', error);
      alert('Failed to approve verification. Please try again.');
    }
  };

  const handleAddClient: FormSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding client:', newClient);
      
      await fetchClients();
      setShowAddClient(false);
      setNewClient({
        name: '',
        email: '',
        company: '',
        package: 'starter',
        monthly_fee: 1500,
        platforms: []
      });
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    
    try {
      console.log('Deleting client:', clientId);
      await fetchClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const handleUpdatePaymentStatus = async (clientId: string, newStatus: string) => {
    try {
      await ApiService.updatePaymentStatus(clientId, newStatus);
      await fetchClients();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    revenue: clients.reduce((sum, c) => sum + (c.status === 'active' ? c.monthly_fee : 0), 0),
    overdue: clients.filter(c => c.payment_status === 'overdue').length,
    pendingVerifications: pendingVerifications.length
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
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage your agency's client accounts</p>
        </div>
        <div className="flex gap-3">
          {pendingVerifications.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setShowVerificationsModal(true)}
              className="relative"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending Verifications
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {pendingVerifications.length}
              </span>
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddClient(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Clients</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Clients</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Monthly Revenue</p>
              <p className="text-3xl font-bold">${stats.revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Overdue Payments</p>
              <p className="text-3xl font-bold">{stats.overdue}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Pending Approvals</p>
              <p className="text-3xl font-bold">{stats.pendingVerifications}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-200" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={((e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={((e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* No Clients Message */}
      {clients.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clients Yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first client</p>
          <Button onClick={() => setShowAddClient(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Client
          </Button>
        </Card>
      )}

      {/* Clients Grid */}
      {filteredClients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.company}</p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowClientDetails(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setShowEditClient(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit Client
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete Client
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {client.email}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Package:</span>
                  <Badge variant="primary">{client.package}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Fee:</span>
                  <span className="font-semibold">${client.monthly_fee}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={
                    client.status === 'active' ? 'success' :
                    client.status === 'pending' ? 'warning' : 'default'
                  }>
                    {client.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <Badge variant={
                    client.payment_status === 'paid' ? 'success' :
                    client.payment_status === 'overdue' ? 'danger' : 'warning'
                  }>
                    {client.payment_status}
                  </Badge>
                </div>
                
                {client.platforms && client.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {client.platforms.map((platform, idx) => (
                      <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {platform}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Next payment: {new Date(client.next_payment).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {client.payment_status !== 'paid' && (
                    <Button 
                      size="sm" 
                      variant="success"
                      onClick={() => handleUpdatePaymentStatus(client.id, 'paid')}
                    >
                      Mark Paid
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Stats
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Verifications Modal */}
      <Modal
        isOpen={showVerificationsModal}
        onClose={() => {
          setShowVerificationsModal(false);
          setSelectedVerification(null);
          setSelectedPlanForApproval('');
        }}
        title="Pending Payment Verifications"
        size="lg"
      >
        <div className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No pending verifications</p>
            </div>
          ) : (
            pendingVerifications.map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{verification.client_name}</h3>
                    <p className="text-sm text-gray-600">{verification.client_email}</p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Client Full Name:</p>
                    <p className="font-medium text-gray-900">{verification.client_full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requested Plan:</p>
                    <p className="font-medium text-gray-900">{verification.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount:</p>
                    <p className="font-medium text-gray-900">${verification.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted:</p>
                    <p className="font-medium text-gray-900">
                      {new Date(verification.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Plan to Approve:
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={selectedVerification?.id === verification.id ? selectedPlanForApproval : ''}
                      onChange={(e) => {
                        setSelectedVerification(verification);
                        setSelectedPlanForApproval(e.target.value);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a plan...</option>
                      <option value="starter">Starter - $100/mo</option>
                      <option value="pro">Pro - $250/mo</option>
                      <option value="premium">Premium - $400/mo</option>
                    </select>
                    <Button
                      onClick={() => {
                        setSelectedVerification(verification);
                        if (selectedPlanForApproval) {
                          handleApproveVerification();
                        }
                      }}
                      disabled={!selectedPlanForApproval || selectedVerification?.id !== verification.id}
                      variant="success"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Add Client Modal - same as before */}
      <Modal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        title="Add New Client"
        size="lg"
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Client Name"
              value={newClient.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={newClient.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, email: e.target.value })}
              required
            />
          </div>
          
          <Input
            label="Company"
            value={newClient.company}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, company: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
              <select
                value={newClient.package}
                onChange={(e) => setNewClient({ ...newClient, package: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="starter">Starter - $1,500/mo</option>
                <option value="growth">Growth - $3,000/mo</option>
                <option value="professional">Professional - $5,000/mo</option>
                <option value="enterprise">Enterprise - Custom</option>
              </select>
            </div>
            
            <Input
              label="Monthly Fee"
              type="number"
              value={newClient.monthly_fee}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClient({ ...newClient, monthly_fee: parseInt(e.target.value) })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
            <div className="flex flex-wrap gap-3">
              {['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn'].map(platform => (
                <label key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    value={platform}
                    checked={newClient.platforms.includes(platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewClient({ ...newClient, platforms: [...newClient.platforms, platform] });
                      } else {
                        setNewClient({ ...newClient, platforms: newClient.platforms.filter(p => p !== platform) });
                      }
                    }}
                    className="mr-2"
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddClient(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Client
            </Button>
          </div>
        </form>
      </Modal>

      {/* Client Details Modal - same as before */}
      {selectedClient && showClientDetails && (
        <Modal
          isOpen={showClientDetails}
          onClose={() => {
            setShowClientDetails(false);
            setSelectedClient(null);
          }}
          title={`Client Details - ${selectedClient.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{selectedClient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedClient.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Company</label>
                <p className="text-gray-900">{selectedClient.company}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Package</label>
                <p className="text-gray-900">{selectedClient.package}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Fee</label>
                <p className="text-gray-900">${selectedClient.monthly_fee}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Badge variant={
                  selectedClient.status === 'active' ? 'success' :
                  selectedClient.status === 'pending' ? 'warning' : 'default'
                }>
                  {selectedClient.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <Badge variant={
                  selectedClient.payment_status === 'paid' ? 'success' :
                  selectedClient.payment_status === 'overdue' ? 'danger' : 'warning'
                }>
                  {selectedClient.payment_status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Manager</label>
                <p className="text-gray-900">{selectedClient.account_manager}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Spent</label>
                <p className="text-gray-900">${selectedClient.total_spent.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Next Payment</label>
                <p className="text-gray-900">{new Date(selectedClient.next_payment).toLocaleDateString()}</p>
              </div>
            </div>
            
            {selectedClient.platforms && selectedClient.platforms.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-600">Platforms</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedClient.platforms.map((platform, idx) => (
                    <Badge key={idx} variant="primary">{platform}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setShowClientDetails(false);
                setSelectedClient(null);
              }}>
                Close
              </Button>
              <Button onClick={() => {
                setShowClientDetails(false);
                setShowEditClient(true);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Client
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminClients;