// client/src/dashboard/client/ClientBilling.tsx - Updated with Bank Transfer
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, Calendar,
  CheckCircle, AlertCircle, Clock, TrendingUp,
  Award, Plus, Star, ArrowLeft,
  Loader2, AlertTriangle, Building, User as UserIcon
} from 'lucide-react';
import { Card, Button, Modal } from '../../components/ui';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

// Type definitions
interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isCurrent?: boolean;
  recommended?: boolean;
}

interface PlansResponse {
  plans: Plan[];
}

interface CurrentSubscription {
  plan: string;
  planId: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  next_billing_date: string;
  features: string[];
  status: 'active' | 'cancelled' | 'past_due' | 'none' | 'pending';
  subscriptionId?: string;
  can_cancel: boolean;
  cancel_at_period_end?: boolean;
}

interface BillingStats {
  totalSpent: number;
  currentBalance: number;
  nextPayment: number;
  nextPaymentDate: string;
}

interface BankSettings {
  admin_full_name: string;
  iban: string;
  bank_name: string;
  swift_code: string;
  additional_info: string;
  configured: boolean;
}

type BillingStep = 'overview' | 'plan-selection' | 'plan-details' | 'bank-transfer' | 'verification-pending' | 'success';

const ClientBilling: React.FC = () => {
  useAuth();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<BillingStep>('overview');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats>({
    totalSpent: 0,
    currentBalance: 0,
    nextPayment: 0,
    nextPaymentDate: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Bank transfer states
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);
  const [clientFullName, setClientFullName] = useState('');
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [_showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching billing data...');
      
      const [subscriptionData, plansData, bankSettingsData] = await Promise.all([
        ApiService.getCurrentSubscription() as Promise<CurrentSubscription | null>,
        ApiService.getAvailablePlans() as Promise<PlansResponse>,
        ApiService.getAdminBankSettings() as Promise<BankSettings>,
      ]);

      console.log('API responses:', { subscriptionData, plansData, bankSettingsData });

      setCurrentSubscription(subscriptionData);
      setBankSettings(bankSettingsData);
      
      const plansArray = plansData?.plans || [];
      console.log('Plans array:', plansArray);
      setAvailablePlans(plansArray);
      
      // Calculate billing stats from subscription
      setBillingStats({
        totalSpent: 0, // Can be populated from subscription data if available
        currentBalance: 0,
        nextPayment: subscriptionData?.price || 0,
        nextPaymentDate: subscriptionData?.next_billing_date || new Date().toISOString(),
      });

      // Check verification status
      if (subscriptionData?.status === 'pending') {
        setCurrentStep('verification-pending');
      } else if (!subscriptionData || subscriptionData.status === 'none' || subscriptionData.plan === 'none') {
        console.log('No active subscription found, showing plan selection');
        setCurrentStep('plan-selection');
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError('Failed to load billing data. Please try again.');
      
      // Set empty arrays to prevent map errors
      setAvailablePlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentStep('plan-details');
  };

  const handleContinueToBankTransfer = () => {
    if (!selectedPlan) return;
    setCurrentStep('bank-transfer');
  };

  const handleSubmitVerification = async () => {
    if (!selectedPlan || !clientFullName.trim()) {
      setError('Please enter your full name for verification');
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);

      const response = await ApiService.submitPaymentVerification({
        plan: selectedPlan.id,
        amount: selectedPlan.price,
        client_full_name: clientFullName.trim()
      });

      console.log('Verification submitted:', response);

      setCurrentStep('verification-pending');
      
      // Refresh billing data
      await fetchBillingData();
      
    } catch (err: any) {
      console.error('Failed to submit verification:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit verification');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessingPayment(true);
      setError(null);
      
      await ApiService.cancelSubscription({
        reason: cancelReason
      });
      
      setShowCancelModal(false);
      await fetchBillingData();
      
      alert('Subscription cancelled successfully');
      
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.response?.data?.error || err.message || 'Failed to cancel subscription');
    } finally {
      setProcessingPayment(false);
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

  // Render different steps
  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (currentStep) {
      case 'plan-selection':
        return renderPlanSelection();
      case 'plan-details':
        return renderPlanDetails();
      case 'bank-transfer':
        return renderBankTransfer();
      case 'verification-pending':
        return renderVerificationPending();
      case 'success':
        return renderSuccessStep();
      case 'overview':
      default:
        return renderOverview();
    }
  };

  const renderPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Growth Plan</h2>
        <p className="text-gray-600">Select a plan to start growing your Instagram presence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.isArray(availablePlans) && availablePlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
              plan.recommended ? 'ring-2 ring-blue-500 transform scale-105' : 'hover:shadow-xl'
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            <Card>
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(plan.price)}</div>
                  <div className="text-gray-600 mb-4">per month</div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.recommended ? 'primary' : 'outline'}
                >
                  Select {plan.name}
                </Button>
              </div>
            </Card>
          </div>
        ))}
        
        {(!availablePlans || availablePlans.length === 0) && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-600">No plans available at the moment. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlanDetails = () => {
    if (!selectedPlan) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentStep('plan-selection')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Plans
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPlan.name} Plan</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(selectedPlan.price)}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-center mb-4">What's included:</h4>
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Payment Method</h3>
              <p className="text-gray-600">Select how you'd like to pay</p>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* PayPal - Disabled */}
            <div className="relative">
              <Button
                disabled
                className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-4 px-6 rounded-lg"
              >
                <div className="flex flex-col items-center">
                  <span className="font-semibold mb-1">Continue with PayPal</span>
                  <span className="text-xs">PayPal is not available at the moment</span>
                </div>
              </Button>
            </div>

            {/* Bank Transfer - Available */}
            <Button
              onClick={handleContinueToBankTransfer}
              disabled={processingPayment || !bankSettings?.configured}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg"
            >
              {processingPayment ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Building className="w-5 h-5 mr-2" />
                  Pay via Bank Transfer
                </div>
              )}
            </Button>

            {!bankSettings?.configured && (
              <p className="text-sm text-amber-600 text-center">
                Bank transfer details are being configured. Please check back later.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBankTransfer = () => {
    if (!selectedPlan || !bankSettings) return null;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentStep('plan-details')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <Card>
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Transfer Payment</h2>
              <p className="text-gray-600">Transfer {formatCurrency(selectedPlan.price)} to the following account</p>
            </div>

            {/* Bank Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-600" />
                Bank Account Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-gray-700 font-medium">Account Holder:</span>
                  <span className="text-gray-900 font-semibold">{bankSettings.admin_full_name}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-gray-700 font-medium">IBAN:</span>
                  <span className="text-gray-900 font-mono font-semibold">{bankSettings.iban}</span>
                </div>
                
                {bankSettings.bank_name && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700 font-medium">Bank Name:</span>
                    <span className="text-gray-900 font-semibold">{bankSettings.bank_name}</span>
                  </div>
                )}
                
                {bankSettings.swift_code && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700 font-medium">SWIFT/BIC:</span>
                    <span className="text-gray-900 font-mono font-semibold">{bankSettings.swift_code}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">Amount:</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(selectedPlan.price)}</span>
                </div>
              </div>

              {bankSettings.additional_info && (
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Additional Instructions:</strong><br />
                    {bankSettings.additional_info}
                  </p>
                </div>
              )}
            </div>

            {/* Verification Section */}
            <div className="bg-amber-50 rounded-lg p-6 mb-6 border border-amber-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-amber-600" />
                Payment Verification
              </h3>
              
              <p className="text-sm text-gray-700 mb-4">
                After making the bank transfer, please enter your full name exactly as it appears on your bank account for verification purposes.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name (as on bank account) *
                </label>
                <input
                  type="text"
                  value={clientFullName}
                  onChange={(e) => setClientFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used to verify your payment
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmitVerification}
              disabled={processingPayment || !clientFullName.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg"
            >
              {processingPayment ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                'Submit for Verification'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your subscription will be activated once the admin verifies your payment
            </p>
          </div>
        </Card>
      </div>
    );
  };

  const renderVerificationPending = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Pending</h2>
          
          <p className="text-gray-600 mb-6">
            Your payment verification has been submitted and is currently being reviewed by our team.
          </p>

          <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Our admin team will verify your bank transfer</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Once verified, your subscription will be activated automatically</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>You'll receive a confirmation and can start using your plan</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Verification typically takes 1-2 business days. You'll be notified once your subscription is active.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => fetchBillingData()}
            className="w-full"
          >
            Refresh Status
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-md mx-auto text-center">
      <Card>
        <div className="p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">Your subscription has been activated successfully.</p>
        </div>
      </Card>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and payments</p>
        </div>
        {currentSubscription && currentSubscription.status !== 'none' ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowUpgradeModal(true)}>
              Change Plan
            </Button>
            {currentSubscription.can_cancel && (
              <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                Cancel Subscription
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={() => setCurrentStep('plan-selection')}>
            <Plus className="w-4 h-4 mr-2" />
            Select Plan
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {currentSubscription && currentSubscription.status !== 'none' ? (
        <>
          {/* Billing Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Spent</p>
                  <p className="text-3xl font-bold">{formatCurrency(billingStats.totalSpent)}</p>
                  <p className="text-sm text-green-100 mt-1">Lifetime</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-200" />
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Current Plan</p>
                  <p className="text-2xl font-bold">{currentSubscription.plan}</p>
                  <p className="text-sm text-blue-100 mt-1">{formatCurrency(currentSubscription.price)}/month</p>
                </div>
                <Award className="w-10 h-10 text-blue-200" />
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Next Payment</p>
                  <p className="text-3xl font-bold">{formatCurrency(billingStats.nextPayment)}</p>
                  <p className="text-sm text-indigo-100 mt-1">Due {new Date(billingStats.nextPaymentDate).toLocaleDateString()}</p>
                </div>
                <Calendar className="w-10 h-10 text-indigo-200" />
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Outstanding</p>
                  <p className="text-3xl font-bold">{formatCurrency(billingStats.currentBalance)}</p>
                  <p className="text-sm text-yellow-100 mt-1">
                    {billingStats.currentBalance > 0 ? 'Payment due' : 'All paid'}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-yellow-200" />
              </div>
            </Card>
          </div>

          {/* Rest of the overview UI remains the same... */}
        </>
      ) : (
        <Card className="text-center p-8">
          <div className="mb-6">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Growth Plan</h2>
            <p className="text-gray-600">Select a plan to start growing your Instagram presence</p>
          </div>
          <Button onClick={() => setCurrentStep('plan-selection')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Select Plan
          </Button>
        </Card>
      )}

      {/* Cancel Modal - same as before */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-red-900 font-medium">Are you sure you want to cancel?</p>
                <p className="text-sm text-red-700 mt-1">
                  You'll lose access to all premium features and your Instagram growth will stop.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancelling (optional):
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Help us improve by telling us why you're cancelling..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCancelSubscription}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Cancel Subscription
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderCurrentStep()}
    </div>
  );
};

export default ClientBilling;