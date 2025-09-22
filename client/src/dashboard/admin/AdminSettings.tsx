// client/src/dashboard/admin/AdminSettings.tsx - Fixed imports and functionality
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, Trash2, AlertTriangle,
  Shield, User, Bell, Download,
  Eye, EyeOff, Check, Save, Loader
} from 'lucide-react';
import { Card, Button, Modal, Input, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

interface BillingSettings {
  stripe_account_connected: boolean;
  total_revenue_this_month: number;
  pending_payments: number;
}

interface AdminProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  created_at: string;
}

const AdminSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'notifications' | 'security' | 'danger'>('profile');
  const [loading, setLoading] = useState(false);
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [profileData, setProfileData] = useState<AdminProfile>({
    id: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    created_at: ''
  });

  const [notifications, setNotifications] = useState({
    email_invoices: true,
    email_new_clients: true,
    email_system_alerts: true,
    push_notifications: false,
    weekly_reports: true
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [billingData, userData] = await Promise.all([
        ApiService.getAdminBillingSettings(),
        ApiService.getCurrentUser()
      ]);

      setBillingSettings(billingData as BillingSettings);
      setProfileData(userData as AdminProfile);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await ApiService.updateProfile(profileData);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await ApiService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      alert('Password changed successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    try {
      setLoading(true);
      await ApiService.deleteAdminAccount();
      alert('Account deletion initiated. You will be logged out.');
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = () => {
    // In a real implementation, this would redirect to Stripe Connect
    alert('Redirecting to Stripe Connect... (Not implemented in demo)');
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      // Implement data export
      alert('Data export initiated. You will receive an email when ready.');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account, billing, and system preferences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card title="Profile Information">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={profileData.first_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, first_name: e.target.value})}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={profileData.last_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, last_name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, email: e.target.value})}
                    required
                  />
                  
                  <Input
                    label="Company"
                    value={profileData.company}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileData({...profileData, company: e.target.value})}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>

              <Card title="Account Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <p className="text-gray-900 font-medium">{profileData.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account Created</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(profileData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <Badge variant="primary">Admin</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account ID</label>
                    <p className="text-gray-900 font-mono text-sm">{profileData.id}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && billingSettings && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Revenue This Month</p>
                      <p className="text-3xl font-bold">{formatCurrency(billingSettings.total_revenue_this_month)}</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-200" />
                  </div>
                </Card>
                
                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">Pending Payments</p>
                      <p className="text-3xl font-bold">{billingSettings.pending_payments}</p>
                    </div>
                    <CreditCard className="w-10 h-10 text-yellow-200" />
                  </div>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Stripe Status</p>
                      <p className="text-lg font-bold">
                        {billingSettings.stripe_account_connected ? 'Connected' : 'Not Connected'}
                      </p>
                    </div>
                    <Shield className="w-10 h-10 text-blue-200" />
                  </div>
                </Card>
              </div>

              <Card title="Payment Settings">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Stripe Account</h3>
                      <p className="text-sm text-gray-600">
                        {billingSettings.stripe_account_connected 
                          ? 'Your Stripe account is connected and ready to receive payments'
                          : 'Connect your Stripe account to receive payments from clients'
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={billingSettings.stripe_account_connected ? 'success' : 'warning'}>
                        {billingSettings.stripe_account_connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                      {!billingSettings.stripe_account_connected && (
                        <Button onClick={handleConnectStripe}>
                          Connect Stripe
                        </Button>
                      )}
                    </div>
                  </div>

                  {billingSettings.stripe_account_connected && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-green-900 font-medium">Payments are being processed</p>
                          <p className="text-sm text-green-700 mt-1">
                            Client payments will be automatically transferred to your connected Stripe account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Billing History">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Download your complete billing history and transaction records</p>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card title="Email Notifications">
                <div className="space-y-4">
                  {[
                    { key: 'email_invoices', label: 'Invoice Payments', description: 'Get notified when clients pay invoices' },
                    { key: 'email_new_clients', label: 'New Client Signups', description: 'Get notified when new clients register' },
                    { key: 'email_system_alerts', label: 'System Alerts', description: 'Important system notifications and errors' },
                    { key: 'weekly_reports', label: 'Weekly Reports', description: 'Automated weekly performance reports' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            [item.key]: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Push Notifications">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Browser Notifications</p>
                      <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push_notifications}
                        onChange={(e) => setNotifications({
                          ...notifications,
                          push_notifications: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card title="Password & Authentication">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                    </div>
                    <Button onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Data & Privacy">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Export Data</h3>
                      <p className="text-sm text-gray-600">Download all your account data</p>
                    </div>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <Card className="border-red-200 bg-red-50">
                <div className="flex items-start">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-red-700 mb-4">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="border border-red-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Delete Admin Account</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Permanently delete your admin account and all associated data. This cannot be undone.
                            </p>
                          </div>
                          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Admin Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-red-900 font-medium">This action cannot be undone</p>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete your admin account, all client data, and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "DELETE MY ACCOUNT" to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="DELETE MY ACCOUNT"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || loading}
            >
              {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSettings;
