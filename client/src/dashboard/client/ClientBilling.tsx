// client/src/dashboard/client/ClientBilling.tsx - Updated for proper plan selection flow
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, FileText, Download, Calendar,
  CheckCircle, AlertCircle, Clock, TrendingUp, Receipt, 
  Award, Settings, Plus, Star, ArrowLeft,
  Loader2, Eye, AlertTriangle, 
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { PayPalElements } from '../../components/PayPalElements';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

// Type definitions for API responses
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
  status: 'active' | 'cancelled' | 'past_due' | 'none';
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

interface SubscriptionResponse {
  subscription_id: string;
  approval_url: string;
  status: string;
  plan_name: string;
  amount: number;
}

interface PaymentOrderResponse {
  order_id: string;
  approval_url: string;
  amount: number;
  invoice_number?: string;
  description?: string;
}

interface CancelResponse {
  message: string;
  cancelled_immediately: boolean;
}

type BillingStep = 'overview' | 'plan-selection' | 'plan-details' | 'payment' | 'success';

const ClientBilling: React.FC = () => {
  useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<BillingStep>('overview');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paypalOrderData, setPaypalOrderData] = useState<PaymentOrderResponse | null>(null);
  const [paypalSubscriptionData, setPaypalSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats>({
    totalSpent: 0,
    currentBalance: 0,
    nextPayment: 0,
    nextPaymentDate: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'subscription'>('overview');
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showInvoicePaymentModal, setShowInvoicePaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching billing data...');
      
      const [invoicesData, subscriptionData, plansData] = await Promise.all([
        ApiService.getInvoices() as Promise<Invoice[]>,
        ApiService.getCurrentSubscription() as Promise<CurrentSubscription | null>,
        ApiService.getAvailablePlans() as Promise<PlansResponse>,
      ]);

      console.log('API responses:', { invoicesData, subscriptionData, plansData });

      const invoicesArray = Array.isArray(invoicesData) ? invoicesData : [];
      setInvoices(invoicesArray);
      setCurrentSubscription(subscriptionData);
      
      const plansArray = plansData?.plans || [];
      console.log('Plans array:', plansArray);
      setAvailablePlans(plansArray);
      
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

      // Show plan selection if no subscription or subscription status is 'none'
      if (!subscriptionData || subscriptionData.status === 'none' || subscriptionData.plan === 'none') {
        console.log('No active subscription found, showing plan selection');
        setCurrentStep('plan-selection');
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError('Failed to load billing data. Please try again.');
      
      // Set empty arrays to prevent map errors
      setAvailablePlans([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentStep('plan-details');
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessingSubscription(true);
      setError(null);
      
      const response = await ApiService.cancelSubscription({
        reason: cancelReason
      }) as CancelResponse;
      
      setShowCancelModal(false);
      await fetchBillingData();
      
      alert(response.message);
      
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.response?.data?.error || err.message || 'Failed to cancel subscription');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    try {
      setSelectedInvoice(invoice);
      setProcessingSubscription(true);
      setError(null);
      
      const response = await ApiService.payInvoice(invoice.id) as PaymentOrderResponse;
      setPaypalOrderData(response);
      setShowInvoicePaymentModal(true);
      
    } catch (err: any) {
      console.error('Failed to create invoice payment:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create payment');
    } finally {
      setProcessingSubscription(false);
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

      if (!data.approval_url) {
        throw new Error('No approval URL received from PayPal');
      }

      setPaypalSubscriptionData(data);
      setCurrentStep('payment');
      
    } catch (err: any) {
      console.error('Subscription creation failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create subscription');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handleUpgradePlan = async (newPlan: Plan) => {
    try {
      setProcessingSubscription(true);
      setError(null);
      
      // For plan changes, we'll cancel current subscription and create new one
      // In a real implementation, you might want to handle this differently
      
      setSelectedPlan(newPlan);
      setCurrentStep('plan-details');
      setShowUpgradeModal(false);
      
    } catch (err: any) {
      console.error('Failed to upgrade plan:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upgrade plan');
    } finally {
      setProcessingSubscription(false);
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    setShowInvoicePaymentModal(false);
    setTimeout(() => {
      fetchBillingData();
      setCurrentStep('overview');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    setShowInvoicePaymentModal(false);
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg"
            >
              {processingSubscription ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Setting up...
                </div>
              ) : (
                'Continue to PayPal'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    if (!selectedPlan || !paypalSubscriptionData) return null;

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

        <PayPalElements
          subscriptionData={paypalSubscriptionData}
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
          <p className="text-gray-600 mt-1">Manage your subscription and payments via PayPal</p>
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

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="border-b">
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: CreditCard },
                  { id: 'invoices', label: 'Invoices', icon: FileText },
                  { id: 'subscription', label: 'Subscription', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
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
                                    Pay with PayPal
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

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">PayPal Subscription</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Your subscription is managed through PayPal</p>
                      <p>• Payments are processed automatically each month</p>
                      <p>• You can also manage your subscription directly in your PayPal account</p>
                      <p>• To change plans, cancel your current subscription and select a new one</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setShowUpgradeModal(true)}>
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
            <p className="text-gray-600">Select a plan to start growing your Instagram presence with PayPal payments</p>
          </div>
          <Button onClick={() => setCurrentStep('plan-selection')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Select Plan
          </Button>
        </Card>
      )}

      {/* Modals */}
      
      {/* Upgrade/Change Plan Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Change Your Plan"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Select a new plan to upgrade or downgrade your subscription. Your billing will be adjusted accordingly.
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  currentSubscription?.plan === plan.name 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => currentSubscription?.plan !== plan.name && handleUpgradePlan(plan)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-gray-600">{formatCurrency(plan.price)}/month</p>
                  </div>
                  {currentSubscription?.plan === plan.name && (
                    <Badge variant="primary">Current Plan</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {plan.features.slice(0, 2).join(', ')}
                    {plan.features.length > 2 && ` and ${plan.features.length - 2} more features`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      
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

      {/* Invoice Payment Modal */}
      <Modal
        isOpen={showInvoicePaymentModal}
        onClose={() => setShowInvoicePaymentModal(false)}
        title={`Pay Invoice ${selectedInvoice?.invoice_number}`}
        size="md"
      >
        {paypalOrderData && selectedInvoice && (
          <PayPalElements
            orderData={paypalOrderData}
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