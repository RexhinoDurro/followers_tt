// client/src/pages/auth/AuthForm.tsx - Updated with Email Verification
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/ApiService';

interface AuthFormProps {
  isLogin: boolean;
  onToggle: () => void;
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggle, onSuccess }) => {
  const { login, loading: authLoading, error: authError } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    verificationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend button
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.password) {
      setFormError('Email and password are required');
      return;
    }

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        onSuccess();
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email) {
      setFormError('Name and email are required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setCurrentStep(2);
  };

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.password) {
      setFormError('Password is required');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    // Send verification code
    setLoading(true);
    try {
      await ApiService.sendVerificationCode({
        email: formData.email,
        name: formData.name,
        purpose: 'registration'
      });
      
      setCurrentStep(3);
      setFormError('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      setFormError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.verifyAndRegister({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'client',
        company: formData.company || undefined,
        verification_code: formData.verificationCode
      });

      if (response.token) {
        onSuccess();
      }
    } catch (err: any) {
      setFormError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setFormError('');
    
    try {
      await ApiService.resendVerificationCode({
        email: formData.email,
        name: formData.name,
        purpose: 'registration'
      });
      
      setResendCooldown(60); // 60 second cooldown
      setFormError('');
      
      // Show success message briefly
      setFormError('Code resent successfully!');
      setTimeout(() => {
        setFormError('');
      }, 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = formError || authError;

  // Login Form (unchanged)
  if (isLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm text-red-700">{displayError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email or username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={authLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-purple-600 hover:text-purple-700">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onToggle}
                className="text-sm text-gray-600 hover:text-purple-600"
                disabled={authLoading}
              >
                Don't have an account? <span className="font-semibold">Create one</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup Step 1: Basic Info
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600">Step 1 of 3</span>
                <span className="text-sm text-gray-500">Basic Info</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all" style={{ width: '33.33%' }}></div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Let's start with your basic information</p>
            </div>

            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm text-red-700">{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSignupStep1} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onToggle}
                className="text-sm text-gray-600 hover:text-purple-600"
              >
                Already have an account? <span className="font-semibold">Sign in</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup Step 2: Password
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600">Step 2 of 3</span>
                <span className="text-sm text-gray-500">Create Password</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all" style={{ width: '66.66%' }}></div>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Your Account</h1>
              <p className="text-gray-600">Create a strong password for your account</p>
            </div>

            {displayError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm text-red-700">{displayError}</span>
              </div>
            )}

            <form onSubmit={handleSignupStep2} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={formData.password.length >= 8 ? 'text-gray-700' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-gray-700' : 'text-gray-500'}>
                      Upper & lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={/[0-9]/.test(formData.password) ? 'text-gray-700' : 'text-gray-500'}>
                      At least one number
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
                  disabled={loading}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending Code...' : 'Continue'}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Signup Step 3: Email Verification
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-600">Step 3 of 3</span>
              <span className="text-sm text-gray-500">Verify Email</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600">
              We sent a 6-digit code to <br />
              <span className="font-semibold text-gray-900">{formData.email}</span>
            </p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-red-700">{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSignupStep3} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={formData.verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, verificationCode: value });
                }}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-semibold"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Enter the 6-digit code from your email
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
                disabled={loading}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading || formData.verificationCode.length !== 6}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || loading}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : "Didn't receive the code? Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};