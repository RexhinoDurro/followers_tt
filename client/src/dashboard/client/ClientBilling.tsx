// client/src/dashboard/client/ClientBilling.tsx - Enhanced with integrated subscription flow
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, FileText, Download, Calendar,
  CheckCircle, AlertCircle, Clock, TrendingUp, Shield, Receipt, 
  Award, Settings, Plus, Star, ArrowUpDown, ArrowLeft,
  Loader2, Eye
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { StripeElements } from '../../components/StripeElements';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

// Available plans matching the backend
const AVAILABLE_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 100,
    originalPrice: 150,
    features: [
      '12 posts per month',
      '12 interactive stories',
      'Hashtag research',
      'Monthly reports',
      'Ideal for small businesses',
    ],
    stripePrice: 'price_starter_monthly'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 250,
    originalPrice: 350,
    features: [
      '20 posts + reels',
      'Monthly promotional areas',
      'Boost strategies',
      'Bio optimization',
      'Report + recommendations',
      'Story engagement boost',
      'Aggressive boosting',
    ],
    popular: true,
    stripePrice: 'price_pro_monthly'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 400,
    originalPrice: 600,
    features: [
      'Instagram + Facebook + TikTok',
      '30 posts (design, reels, carousel)',
      'Advertising on a budget',
      'Influencer outreach assistance',
      'Full and professional management',
    ],
    stripePrice: 'price_premium_monthly'
  }
];

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

interface CurrentSubscription {
  plan: string;
  planId: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  next_billing_date: string;
  features: string[];
  status: 'active' | 'cancelled' | 'past_due';
  subscriptionId?: string;
}

interface BillingStats {
  totalSpent: number;
  currentBalance: number;
  nextPayment: number;
  nextPaymentDate: string;
}


type BillingStep = 'overview' | 'plan-selection' | 'plan-details' | 'payment' | 'success';

const ClientBilling: React.FC = () => {
  const { } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<BillingStep>('overview');
  const [selectedPlan, setSelectedPlan] = useState<typeof AVAILABLE_PLANS[0] | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [billingStats, setBillingStats] = useState<BillingStats>({
    totalSpent: 0,
    currentBalance: 0,
    nextPayment: 0,
    nextPaymentDate: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment' | 'subscription'>('overview');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [invoicesData, subscriptionData] = await Promise.all([
        ApiService.getInvoices(),
        ApiService.getCurrentSubscription(),
      ]);

      const invoicesArray = Array.isArray(invoicesData) ? invoicesData : [];
      setInvoices(invoicesArray);
      
      setCurrentSubscription(subscriptionData as CurrentSubscription | null);
      
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
        nextPayment: (subscriptionData as CurrentSubscription)?.price || 0,
        nextPaymentDate: (subscriptionData as CurrentSubscription)?.next_billing_date || new Date().toISOString(),
      });

      // Show plan selection if no subscription
      if (!subscriptionData) {
        setCurrentStep('plan-selection');
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError('Failed to load billing data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: typeof AVAILABLE_PLANS[0]) => {
    setSelectedPlan(plan);
    setCurrentStep('plan-details');
  };

  const handleContinueToPayment = async () => {
    if (!selectedPlan) return;
    
    try {
      setProcessingSubscription(true);
      setError(null);
      
      console.log('🔄 Creating subscription for plan:', selectedPlan);
      
      const data = await ApiService.createSubscription({
        price_id: selectedPlan.stripePrice,
        plan_name: selectedPlan.name
      }) as { client_secret: string; subscription_id: string };

      console.log('✅ Subscription created:', data);
      
      if (!data.client_secret) {
        throw new Error('No client secret received from server');
      }

      setClientSecret(data.client_secret);
      setCurrentStep('payment');
      
    } catch (err: any) {
      console.error('❌ Subscription creation failed:', err);
      
      let errorMessage = 'Failed to create subscription. Please try again.';
      
      // Handle different types of errors
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid subscription request. Please check your plan selection.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to create subscriptions.';
      }
      
      setError(errorMessage);
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    setTimeout(() => {
      fetchBillingData(); // Refresh data
      setCurrentStep('overview');
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setCurrentStep('plan-details'); // Go back to plan details
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
        {AVAILABLE_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
              plan.popular ? 'ring-2 ring-purple-500 transform scale-105' : 'hover:shadow-xl'
            }`}
            onClick={() => handleSelectPlan(plan)}
            tabIndex={0}
            role="button"
            onKeyPress={e => {
              if (e.key === 'Enter' || e.key === ' ') handleSelectPlan(plan);
            }}
          >
            <Card>
              {plan.popular && (
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
                  variant={plan.popular ? 'primary' : 'outline'}
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
          {/* Plan Summary */}
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

            {/* Security Features */}
            <Card>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Secure & Protected
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>PCI DSS compliant</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </Card>

            {/* Billing Information */}
            <Card className="bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Billing Information</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing cycle:</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span>First payment:</span>
                  <span className="font-medium">{formatCurrency(selectedPlan.price)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Due today:</span>
                    <span>{formatCurrency(selectedPlan.price)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Subscription Setup */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Subscription</h3>
              <p className="text-gray-600">Start your {selectedPlan.name} plan today and grow your social media presence</p>
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

            {/* Terms and Agreement */}
            <Card className="bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Terms & Agreement</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Your subscription will renew automatically each month</p>
                <p>✓ You can cancel or change your plan anytime</p>
                <p>✓ All payments are secure and encrypted</p>
                <p>✓ 30-day money-back guarantee</p>
              </div>
            </Card>

            <Button
              onClick={handleContinueToPayment}
              disabled={processingSubscription}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Enter Payment Details</h3>
          <p className="text-gray-600">Secure payment powered by Stripe</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your {selectedPlan?.name} subscription is now active.</p>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 font-medium text-xl">{selectedPlan && formatCurrency(selectedPlan.price)}/month</p>
            <p className="text-green-600 mt-2">Redirecting to your dashboard...</p>
          </div>
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
            <Button variant="outline" onClick={() => setCurrentStep('plan-selection')}>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Change Plan
            </Button>
          </div>
        ) : (
          <Button onClick={() => setCurrentStep('plan-selection')}>
            <Plus className="w-4 h-4 mr-2" />
            Select Plan
          </Button>
        )}
      </div>

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

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="border-b">
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: CreditCard },
                  { id: 'invoices', label: 'Invoices', icon: FileText },
                  { id: 'payment', label: 'Payment Methods', icon: Shield },
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
                          {new Date(currentSubscription.next_billing_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setCurrentStep('plan-selection')}>
                          Change Plan
                        </Button>
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

                  <div className="text-center">
                    <Button onClick={() => setCurrentStep('plan-selection')} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Change Plan
                    </Button>
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
    </div>
  );

  return (
    <div className="space-y-6">
      {renderCurrentStep()}
    </div>
  );
};

export default ClientBilling;