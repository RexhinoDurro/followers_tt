// client/src/dashboard/admin/AdminSettings.tsx - Complete with Bank Details
import React, { useState, useEffect } from 'react';
import {
  User, Lock, Upload, Camera, Save, AlertCircle, CheckCircle,
  DollarSign, CreditCard, Shield, Trash2, AlertTriangle,
  Bell, Eye, EyeOff, Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';

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
  avatar?: string;
  bio?: string;
  created_at: string;
}

interface BankSettings {
  admin_full_name: string;
  iban: string;
  bank_name: string;
  swift_code: string;
  additional_info: string;
}

interface BankSettingsResponse {
  id?: string;
  admin_full_name: string;
  iban: string;
  bank_name: string;
  swift_code: string;
  additional_info: string;
  configured: boolean;
  updated_at?: string;
}

const AdminSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null);

  // Profile state
  const [profileData, setProfileData] = useState<AdminProfile>({
    id: '',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    bio: '',
    created_at: ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.avatar || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Bank settings state
  const [bankSettings, setBankSettings] = useState<BankSettings>({
    admin_full_name: '',
    iban: '',
    bank_name: '',
    swift_code: '',
    additional_info: ''
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    email_invoices: true,
    email_new_clients: true,
    email_system_alerts: true,
    weekly_reports: true
  });

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    fetchAdminData();
    fetchBankSettings();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [billingData, userData] = await Promise.all([
        ApiService.getAdminBillingSettings().catch(() => ({
          stripe_account_connected: false,
          total_revenue_this_month: 0,
          pending_payments: 0
        })),
        ApiService.getCurrentUser()
      ]);

      setBillingSettings(billingData as BillingSettings);
      setProfileData(userData as AdminProfile);
      const typedUserData = userData as AdminProfile;
      if (typedUserData.avatar) {
        setProfilePhoto(typedUserData.avatar);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankSettings = async () => {
    try {
      const data = await ApiService.getAdminBankSettings() as BankSettingsResponse;
      if (data.configured) {
        setBankSettings({
          admin_full_name: data.admin_full_name || '',
          iban: data.iban || '',
          bank_name: data.bank_name || '',
          swift_code: data.swift_code || '',
          additional_info: data.additional_info || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch bank settings:', error);
    }
  };

  const handleBankSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await ApiService.updateAdminBankSettings(bankSettings);
      setSuccess('Bank account details updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update bank settings');
    } finally {
      setLoading(false);
    }
  };

  // Get user initials
  const getInitials = () => {
    const firstName = profileData.first_name || user?.first_name || '';
    const lastName = profileData.last_name || user?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A';
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedProfile = await ApiService.updateProfileWithAvatar(
        {
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          company: profileData.company,
          bio: profileData.bio,
        },
        photoFile || undefined
      );

      setSuccess('Profile updated successfully!');
      if (updatedProfile.avatar) {
        setProfilePhoto(updatedProfile.avatar);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await ApiService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    try {
      setLoading(true);
      await ApiService.deleteAdminAccount();
      alert('Account deletion initiated. You will be logged out.');
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      setError('Failed to delete account. Please contact support.');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-1">Manage your admin account and system preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <span className="text-sm text-green-800">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Billing Overview - Admin Only */}
      {billingSettings && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Revenue This Month</p>
                <p className="text-3xl font-bold">{formatCurrency(billingSettings.total_revenue_this_month)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Pending Payments</p>
                <p className="text-3xl font-bold">{billingSettings.pending_payments}</p>
              </div>
              <CreditCard className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">System Status</p>
                <p className="text-lg font-bold">
                  {billingSettings.stripe_account_connected ? 'Connected' : 'Setup Required'}
                </p>
              </div>
              <Shield className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-purple-600" />
              Profile Photo
            </h2>
            
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center border-4 border-purple-100">
                    <span className="text-4xl font-bold text-white">{getInitials()}</span>
                  </div>
                )}
                
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-sm text-gray-600 text-center mb-4">
                Click to upload a new photo
              </p>
              
              <p className="text-xs text-gray-500 text-center">
                JPG, PNG or GIF (max. 5MB)
              </p>

              {/* Admin Badge */}
              <div className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                <span className="text-white text-sm font-semibold">Admin Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Profile Information
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(profileData.bio || '').length}/500 characters
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-purple-600" />
          Change Password
        </h2>

        <form onSubmit={handlePasswordChange} className="max-w-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${passwordData.new_password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[A-Z]/.test(passwordData.new_password) && /[a-z]/.test(passwordData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  Upper & lowercase letters
                </li>
                <li className="flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${/[0-9]/.test(passwordData.new_password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  At least one number
                </li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bank Account Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
          Bank Account Details
        </h2>
        
        <p className="text-gray-600 mb-6">
          Enter your bank account details for clients to make direct bank transfers
        </p>

        <form onSubmit={handleBankSettingsUpdate} className="space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Full Name *
            </label>
            <input
              type="text"
              value={bankSettings.admin_full_name}
              onChange={(e) => setBankSettings({...bankSettings, admin_full_name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Enter your full name as it appears on bank account"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IBAN *
            </label>
            <input
              type="text"
              value={bankSettings.iban}
              onChange={(e) => setBankSettings({...bankSettings, iban: e.target.value.toUpperCase()})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
              placeholder="AL35 2021 1109 0000 0001 2345 6789"
              maxLength={34}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: AL followed by 28 digits (34 characters total)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name (Optional)
            </label>
            <input
              type="text"
              value={bankSettings.bank_name}
              onChange={(e) => setBankSettings({...bankSettings, bank_name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g., Raiffeisen Bank Albania"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SWIFT/BIC Code (Optional)
            </label>
            <input
              type="text"
              value={bankSettings.swift_code}
              onChange={(e) => setBankSettings({...bankSettings, swift_code: e.target.value.toUpperCase()})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-mono"
              placeholder="e.g., UNCRALTX"
              maxLength={11}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Payment Instructions (Optional)
            </label>
            <textarea
              value={bankSettings.additional_info}
              onChange={(e) => setBankSettings({...bankSettings, additional_info: e.target.value})}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Any additional instructions for clients making transfers..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(bankSettings.additional_info || '').length}/500 characters
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Bank Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-purple-600" />
          Notification Preferences
        </h2>

        <div className="space-y-4 max-w-2xl">
          {[
            { key: 'email_invoices', label: 'Invoice Payments', description: 'Get notified when clients pay invoices' },
            { key: 'email_new_clients', label: 'New Client Signups', description: 'Get notified when new clients register' },
            { key: 'email_system_alerts', label: 'System Alerts', description: 'Important system notifications and errors' },
            { key: 'weekly_reports', label: 'Weekly Reports', description: 'Automated weekly performance reports' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-red-700 mb-6">
              These actions are irreversible. Please proceed with extreme caution.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Admin Account</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently delete your admin account and all associated data
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>

              {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <div className="flex items-start mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Delete Admin Account</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          This action cannot be undone. All data will be permanently deleted.
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type "DELETE MY ACCOUNT" to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="DELETE MY ACCOUNT"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeleteConfirmation('');
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete Forever
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;