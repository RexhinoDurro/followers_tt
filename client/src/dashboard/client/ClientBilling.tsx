// client/src/dashboard/client/ClientBilling.tsx - Fixed TypeScript errors
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, FileText, Download, Calendar,
  CheckCircle, AlertCircle, Clock, TrendingUp, Shield, Receipt, 
  Award, Settings, Plus, Star, ArrowUpDown, ArrowLeft,
  Loader2, Eye, Trash2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { StripeElements } from '../../components/StripeElements';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

// Type definitions for API responses
interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isCurrent?: boolean;
}

interface PlansResponse {
  plans: Plan[];
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  paid_at?: string;
  description?: string;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  expiryDate: string;
  isDefault: boolean;
  created: number;
}

interface PaymentMethodsResponse {
  payment_methods: PaymentMethod[];
}

interface CurrentSubscription {
  plan: string;
  planId: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  next_billing_date: string;
  features: string[];
  status: 'active' | 'cancelled' | 'past_due';
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

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

interface SubscriptionResponse {
  client_secret: string;
  subscription_id: string;
  status: string;
  plan_name: string;
  amount: number;
  customer_id: string;
}

interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  invoice_number?: string;
  description?: string;
}

interface SetupIntentResponse {
  client_secret: string;
  setup_intent_id: string;
}

interface PlanChangeResponse {
  message: string;
  new_plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
  proration_amount: number;
  next_billing_date: string;
}

interface CancelResponse {
  message: string;
  cancelled_immediately: boolean;
  period_end?: string;
  access_until?: string;
}

interface ReactivateResponse {
  message: string;
  next_billing_date: string;
}

type BillingStep = 'overview' | 'plan-selection' | 'plan-details' | 'payment' | 'success';

const ClientBilling: React.FC = () => {
  const { } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<BillingStep>('overview');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats>({
    totalSpent: 0,
    currentBalance: 0,
    nextPayment: 0,
    nextPaymentDate: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment-methods' | 'subscription'>('overview');
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showInvoicePaymentModal, setShowInvoicePaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelImmediately, setCancelImmediately] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [invoicesData, subscriptionData, plansData, paymentMethodsData] = await Promise.all([
        ApiService.getInvoices() as Promise<Invoice[]>,
        ApiService.getCurrentSubscription() as Promise<CurrentSubscription | null>,
        ApiService.getAvailablePlans() as Promise<PlansResponse>,
        ApiService.getPaymentMethods() as Promise<PaymentMethodsResponse>,
      ]);

      const invoicesArray = Array.isArray(invoicesData) ? invoicesData : [];
      setInvoices(invoicesArray);
      setCurrentSubscription(subscriptionData);
      setAvailablePlans(plansData?.plans || []);
      setPaymentMethods(paymentMethodsData?.payment_methods || []);
      
      // Calculate billing stats
      const totalSpent = invoicesArray
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      const currentBalance = invoicesArray
        .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      setBillingStats({
        totalSpent,
        currentBalance,
        nextPayment: subscriptionData?.price || 0,
        nextPaymentDate: subscriptionData?.next_billing_date || new Date().toISOString(),
      });

      // Show plan selection if no subscription
      if (!subscriptionData && availablePlans.length > 0) {
        setCurrentStep('plan-selection');
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError('Failed to load billing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentStep('plan-details');
  };

  const handleChangePlan = async (newPlan: Plan) => {
    try {
      setProcessingSubscription(true);
      setError(null);
      
      await ApiService.changeSubscriptionPlan({
        plan_id: newPlan.id
      }) as PlanChangeResponse;
      
      setShowChangePlanModal(false);
      await fetchBillingData();
      
      // Show success message
      alert(`Successfully changed to ${newPlan.name} plan!`);
      
    } catch (err) {
      console.error('Failed to change plan:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to change plan');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessingSubscription(true);
      setError(null);
      
      const response = await ApiService.cancelSubscription({
        cancel_immediately: cancelImmediately,
        reason: cancelReason
      }) as CancelResponse;
      
      setShowCancelModal(false);
      await fetchBillingData();
      
      alert(response.message);
      
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to cancel subscription');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setProcessingSubscription(true);
      setError(null);
      
      const response = await ApiService.reactivateSubscription() as ReactivateResponse;
      await fetchBillingData();
      
      alert(response.message);
      
    } catch (err) {
      console.error('Failed to reactivate subscription:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to reactivate subscription');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    try {
      setSelectedInvoice(invoice);
      setProcessingSubscription(true);
      setError(null);
      
      const response = await ApiService.payInvoice(invoice.id) as PaymentIntentResponse;
      setClientSecret(response.client_secret);
      setShowInvoicePaymentModal(true);
      
    } catch (err) {
      console.error('Failed to create invoice payment:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to create payment');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setProcessingSubscription(true);
      setError(null);
      
      const response = await ApiService.createSetupIntent() as SetupIntentResponse;
      setClientSecret(response.client_secret);
      setShowAddPaymentModal(true);
      
    } catch (err) {
      console.error('Failed to create setup intent:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to setup payment method');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await ApiService.setDefaultPaymentMethod(paymentMethodId);
      await fetchBillingData();
      alert('Default payment method updated');
    } catch (err) {
      console.error('Failed to set default payment method:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to update default payment method');
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    try {
      await ApiService.deletePaymentMethod(paymentMethodId);
      await fetchBillingData();
      alert('Payment method removed');
    } catch (err) {
      console.error('Failed to delete payment method:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to remove payment method');
    }
  };

  const handleContinueToPayment = async () => {
    if (!selectedPlan) return;
    
    try {
      setProcessingSubscription(true);
      setError(null);
      
      const data = await ApiService.createSubscription({
        price_id: `price_${selectedPlan.id}_monthly`,
        plan_name: selectedPlan.name
      }) as SubscriptionResponse;

      if (!data.client_secret) {
        throw new Error('No client secret received from server');
      }

      setClientSecret(data.client_secret);
      setCurrentStep('payment');
      
    } catch (err) {
      console.error('Subscription creation failed:', err);
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || apiError.message || 'Failed to create subscription');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    setShowInvoicePaymentModal(false);
    setShowAddPaymentModal(false);
    setTimeout(() => {
      fetchBillingData();
      setCurrentStep('overview');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setShowInvoicePaymentModal(false);
    setShowAddPaymentModal(false);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    switch (currentStep) {
      case 'plan-selection':
        return renderPlanSelection();
      case 'plan-details':
        return renderPlanDetails();
      case 'payment':
        return renderPaymentStep();
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
        {availablePlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
              plan.name === 'Pro' ? 'ring-2 ring-purple-500 transform scale-105' : 'hover:shadow-xl'
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            <Card>
              {plan.name === 'Pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
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
                  variant={plan.name === 'Pro' ? 'primary' : 'outline'}
                >
                  Select {plan.name}
                </Button>
              </div>
            </Card>
          </div>
        ))}
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
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Plans
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <CreditCard className="w-8 h-8 text-purple-600" />
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Subscription</h3>
              <p className="text-gray-600">Start your {selectedPlan.name} plan today</p>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Payment Setup Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleContinueToPayment}
              disabled={processingSubscription}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg"
            >
              {processingSubscription ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Setting up...
                </div>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    if (!selectedPlan || !clientSecret) return null;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setCurrentStep('plan-details')}
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <StripeElements
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          amount={selectedPlan.price}
          description={`${selectedPlan.name} Plan Subscription`}
          isSubscription={true}
          planName={selectedPlan.name}
        />
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="max-w-md mx-auto text-center">
      <Card>
        <div className="p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p className="text-gray-600 mb-6">Operation completed successfully.</p>
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
          <p className="text-gray-600 mt-1">Manage your subscription and payment methods</p>
        </div>
        {currentSubscription ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowChangePlanModal(true)}>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Change Plan
            </Button>
            {currentSubscription.can_cancel && (
              <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                Cancel Subscription
              </Button>
            )}
            {currentSubscription.cancel_at_period_end && (
              <Button onClick={handleReactivateSubscription} disabled={processingSubscription}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reactivate
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

      {currentSubscription ? (
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
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Next Payment</p>
                  <p className="text-3xl font-bold">{formatCurrency(billingStats.nextPayment)}</p>
                  <p className="text-sm text-purple-100 mt-1">Due {new Date(billingStats.nextPaymentDate).toLocaleDateString()}</p>
                </div>
                <Calendar className="w-10 h-10 text-purple-200" />
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

          {/* Subscription status alert */}
          {currentSubscription.cancel_at_period_end && (
            <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">Subscription Cancelling</p>
                <p className="text-sm text-orange-700 mt-1">
                  Your subscription will end on {new Date(currentSubscription.next_billing_date).toLocaleDateString()}.
                  You can reactivate it anytime before then.
                </p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="border-b">
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: CreditCard },
                  { id: 'invoices', label: 'Invoices', icon: FileText },
                  { id: 'payment-methods', label: 'Payment Methods', icon: Shield },
                  { id: 'subscription', label: 'Subscription', icon: Settings }
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
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Subscription */}
                  <Card title="Current Subscription">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{currentSubscription.plan}</h3>
                          <p className="text-gray-600">Billed {currentSubscription.billing_cycle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentSubscription.price)}</p>
                          <p className="text-sm text-gray-600">per month</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-900">Subscription Active</span>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Next billing date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Transactions */}
                  <Card title="Recent Transactions">
                    <div className="space-y-3">
                      {invoices.slice(0, 5).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            {invoice.status === 'paid' ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            ) : invoice.status === 'pending' ? (
                              <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">Invoice #{invoice.invoice_number}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(invoice.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                            <Badge variant={
                              invoice.status === 'paid' ? 'success' :
                              invoice.status === 'pending' ? 'warning' : 'danger'
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {invoices.length === 0 && (
                        <div className="text-center py-6">
                          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No transactions yet</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-3 font-medium text-gray-900">Invoice</th>
                          <th className="text-left pb-3 font-medium text-gray-900">Date</th>
                          <th className="text-left pb-3 font-medium text-gray-900">Amount</th>
                          <th className="text-left pb-3 font-medium text-gray-900">Status</th>
                          <th className="text-left pb-3 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="py-4">
                              <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                              <p className="text-sm text-gray-600">{invoice.description || 'Monthly subscription'}</p>
                            </td>
                            <td className="py-4 text-gray-700">
                              {new Date(invoice.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <p className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                            </td>
                            <td className="py-4">
                              <Badge variant={
                                invoice.status === 'paid' ? 'success' :
                                invoice.status === 'pending' ? 'warning' : 'danger'
                              }>
                                {invoice.status}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                {invoice.status !== 'paid' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handlePayInvoice(invoice)}
                                    disabled={processingSubscription}
                                  >
                                    Pay Now
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {invoices.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No invoices yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'payment-methods' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h3>
                    <Button onClick={handleAddPaymentMethod} disabled={processingSubscription}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <Card key={method.id} className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                              <CreditCard className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 capitalize">
                                {method.brand} •••• {method.last4}
                              </p>
                              <p className="text-sm text-gray-600">Expires {method.expiryDate}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {method.isDefault && (
                              <Badge variant="primary">Default</Badge>
                            )}
                            {!method.isDefault && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              >
                                Set Default
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {paymentMethods.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No payment methods saved</p>
                      <Button onClick={handleAddPaymentMethod} disabled={processingSubscription}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Payment Method
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <Card title="Plan Features">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSubscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="flex gap-4">
                    <Button onClick={() => setShowChangePlanModal(true)}>
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Change Plan
                    </Button>
                    {currentSubscription.can_cancel && (
                      <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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

      {/* Modals */}
      
      {/* Cancel Subscription Modal */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Help us improve by telling us why you're cancelling..."
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="cancelImmediately"
              checked={cancelImmediately}
              onChange={(e) => setCancelImmediately(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="cancelImmediately" className="text-sm text-gray-700">
              Cancel immediately (otherwise, access continues until next billing date)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCancelSubscription}
              disabled={processingSubscription}
            >
              {processingSubscription ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Cancel Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Plan Modal */}
      <Modal
        isOpen={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        title="Change Subscription Plan"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Choose a new plan. You'll be charged or credited the prorated difference immediately.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  plan.isCurrent 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => plan.isCurrent ? null : handleChangePlan(plan)}
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(plan.price)}</p>
                  <p className="text-sm text-gray-600">per month</p>
                  
                  {plan.isCurrent && (
                    <Badge variant="primary">Current Plan</Badge>
                  )}
                  
                  {!plan.isCurrent && (
                    <Button 
                      className="mt-3 w-full" 
                      size="sm"
                      disabled={processingSubscription}
                    >
                      {processingSubscription ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        `Switch to ${plan.name}`
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        title="Add Payment Method"
        size="md"
      >
        {clientSecret && (
          <StripeElements
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            amount={0}
            description="Add Payment Method"
            isSetup={true}
          />
        )}
      </Modal>

      {/* Invoice Payment Modal */}
      <Modal
        isOpen={showInvoicePaymentModal}
        onClose={() => setShowInvoicePaymentModal(false)}
        title={`Pay Invoice ${selectedInvoice?.invoice_number}`}
        size="md"
      >
        {clientSecret && selectedInvoice && (
          <StripeElements
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            amount={selectedInvoice.amount}
            description={selectedInvoice.description || `Invoice ${selectedInvoice.invoice_number}`}
            invoiceNumber={selectedInvoice.invoice_number}
          />
        )}
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