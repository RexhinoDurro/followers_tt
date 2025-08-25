// pages/auth/AuthForm.tsx - Authentication Form
// pages/auth/AuthForm.tsx - Fixed version with working authentication
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/ui';

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggle, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    role: 'client' as 'admin' | 'client'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      if (!isLogin && !formData.name) {
        setError('Name is required for registration');
        setLoading(false);
        return;
      }

      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isLogin) {
        // For demo purposes, accept any email/password combination
        // In a real app, you'd validate against your backend
        console.log('Login attempt:', { email: formData.email, password: formData.password });
        
        // Store user data in localStorage for demo (in real app, use proper auth context)
        const userData = {
          email: formData.email,
          role: formData.email.includes('admin') ? 'admin' : 'client',
          name: formData.email.split('@')[0],
          company: 'Demo Company'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Call success callback to redirect to dashboard
        onSuccess();
        
      } else {
        // Registration
        console.log('Registration attempt:', formData);
        
        // Store user data
        const userData = {
          email: formData.email,
          role: formData.role,
          name: formData.name,
          company: formData.company || 'No Company'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Call success callback to redirect to dashboard
        onSuccess();
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your SocialBoost Pro dashboard' : 'Join SocialBoost Pro today'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Demo credentials info */}
        {isLogin && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
            <p className="font-semibold">Demo Mode:</p>
            <p>Use any email/password to login</p>
            <p>Use email with "admin" for admin access</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter your full name"
              />
              
              <Input
                label="Company Name (Optional)"
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Your company name"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'client' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="Enter your email"
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Additional demo info */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>This is a demo application</p>
          <p>No real authentication required</p>
        </div>
      </div>
    </div>
  );
};