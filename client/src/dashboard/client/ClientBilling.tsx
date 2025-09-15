// client/src/dashboard/client/ClientBilling.tsx - Enhanced with proper plan management
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, FileText, Download, Calendar,
  CheckCircle, AlertCircle, Clock, TrendingUp,
  Shield, Receipt, 
  Award, Settings, Plus,
  Star, ArrowUpDown} from 'lucide-react';
import { SubscriptionPayment } from '../../components/SubscriptionPayment';
import { Card, Button, Modal, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

// Available plans matching InstagramGrowth.tsx
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

interface CreatePaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
}

const ClientBilling: React.FC = () => {
  const { } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showSubscriptionPayment, setShowSubscriptionPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof AVAILABLE_PLANS[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment' | 'subscription'>('overview');
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [billingStats, setBillingStats] = useState<BillingStats>({
    totalSpent: 0,
    currentBalance: 0,
    nextPayment: 0,
    nextPaymentDate: new Date().toISOString(),
  });
  const [changingPlan, setChangingPlan] = useState(false);
  const [cancellingPlan, setCancellingPlan] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
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
        setShowPlanSelection(true);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: typeof AVAILABLE_PLANS[0]) => {
    if (currentSubscription) {
      // This is a plan change
      handleChangePlan(plan);
    } else {
      // This is a new subscription
      setSelectedPlan(plan);
      setShowSubscriptionPayment(true);
      setShowPlanSelection(false);
    }
  };

  const handleChangePlan = async (newPlan: typeof AVAILABLE_PLANS[0]) => {
    if (!currentSubscription) return;

    try {
      setChangingPlan(true);
      
      const response = await ApiService.changeSubscriptionPlan({
        plan_id: newPlan.id
      });

      const typedResponse = response as { message?: string; proration_amount?: number };

      if (typedResponse.message) {
        alert(`✅ ${typedResponse.message}\nProration amount: $${typedResponse.proration_amount}`);
        await fetchBillingData(); // Refresh data
        setShowPlanSelection(false);
      }
    } catch (error) {
      console.error('Failed to change plan:', error);
      alert('Failed to change plan. Please try again.');
    } finally {
      setChangingPlan(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowSubscriptionPayment(false);
    setSelectedPlan(null);
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    try {
      const response = await ApiService.createPaymentIntent({
        amount: invoice.amount,
        description: `Payment for invoice ${invoice.invoice_number}`,
        invoice_id: invoice.id
      }) as CreatePaymentIntentResponse;
      
      alert('Payment feature coming soon!');
      console.log('Payment intent created:', response);
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleCancelSubscription = async (cancelImmediately: boolean = false) => {
    if (!currentSubscription?.subscriptionId) return;

    try {
      setCancellingPlan(true);
      
      const response = await ApiService.cancelSubscription({
        cancel_immediately: cancelImmediately
      });
      
      const typedResponse = response as { message?: string };
      if (typedResponse.message) {
        alert(`✅ ${typedResponse.message}`);
        await fetchBillingData();
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancellingPlan(false);
    }
  };

  const handleUpgradePlan = () => {
    setShowPlanSelection(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPlanComparisonInfo = (planId: string) => {
    if (!currentSubscription) return null;
    
    const currentPlan = AVAILABLE_PLANS.find(p => p.id === currentSubscription.planId);
    const targetPlan = AVAILABLE_PLANS.find(p => p.id === planId);
    
    if (!currentPlan || !targetPlan) return null;
    
    const isUpgrade = targetPlan.price > currentPlan.price;
    const priceDiff = Math.abs(targetPlan.price - currentPlan.price);
    
    return {
      isUpgrade,
      isCurrent: planId === currentSubscription.planId,
      priceDiff,
      actionText: isUpgrade ? 'Upgrade' : 'Downgrade'
    };
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
          <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and payment methods</p>
        </div>
        {currentSubscription && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(true)}>
              Cancel Plan
            </Button>
            <Button onClick={handleUpgradePlan}>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Change Plan
            </Button>
          </div>
        )}
      </div>

      {/* No Subscription State */}
      {!currentSubscription && (
        <Card className="text-center p-8">
          <div className="mb-6">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Growth Plan</h2>
            <p className="text-gray-600">Select a plan to start growing your Instagram presence</p>
          </div>
          <Button onClick={() => setShowPlanSelection(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Select Plan
          </Button>
        </Card>
      )}

      {/* Billing Overview Cards */}
      {currentSubscription && (
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
      )}

      {/* Tab Navigation */}
      {currentSubscription && (
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
            {/* Overview Tab */}
            {activeTab === 'overview' && currentSubscription && (
              <div className="space-y-6">
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
                        <Button variant="outline" className="flex-1" onClick={handleUpgradePlan}>
                          Change Plan
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(true)}>
                          Cancel Subscription
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
              </div>
            )}

            {/* Invoices Tab */}
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
                              {invoice.status === 'pending' && (
                                <Button size="sm" onClick={() => handlePayInvoice(invoice)}>
                                  Pay Now
                                </Button>
                              )}
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

            {/* Subscription Tab */}
            {activeTab === 'subscription' && currentSubscription && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSubscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {AVAILABLE_PLANS.map((plan) => {
                    const comparisonInfo = getPlanComparisonInfo(plan.id);
                    
                    return (
                      <Card 
                        key={plan.id}
                        className={`border-2 ${
                          comparisonInfo?.isCurrent 
                            ? 'border-purple-500 bg-purple-50' 
                            : plan.popular 
                              ? 'border-purple-300 hover:border-purple-400' 
                              : 'border hover:border-gray-300'
                        } transition-colors`}
                      >
                        <div className="text-center">
                          {plan.popular && !comparisonInfo?.isCurrent && (
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                              <Star className="w-6 h-6 text-purple-600" />
                            </div>
                          )}
                          
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                          <p className="text-gray-600 mb-4">
                            {plan.id === 'starter' ? 'Perfect for beginners' :
                             plan.id === 'pro' ? 'Perfect for growing businesses' :
                             'Perfect for established brands'}
                          </p>
                          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(plan.price)}</p>
                          <p className="text-gray-600 mb-4">per month</p>
                          
                          {comparisonInfo?.isCurrent ? (
                            <Badge variant="primary">Current Plan</Badge>
                          ) : (
                            <Button 
                              className="w-full" 
                              onClick={() => handleSelectPlan(plan)}
                              disabled={changingPlan}
                              variant={comparisonInfo?.isUpgrade ? 'primary' : 'outline'}
                            >
                              {changingPlan ? 'Changing...' : comparisonInfo?.actionText || 'Select'}
                              {comparisonInfo && (
                                <span className="ml-2">
                                  ({comparisonInfo.isUpgrade ? '+' : '-'}${comparisonInfo.priceDiff})
                                </span>
                              )}
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Selection Modal */}
      <Modal
        isOpen={showPlanSelection}
        onClose={() => setShowPlanSelection(false)}
        title={currentSubscription ? "Change Your Plan" : "Choose Your Plan"}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_PLANS.map((plan) => {
            const comparisonInfo = getPlanComparisonInfo(plan.id);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg ${
                  plan.popular && !comparisonInfo?.isCurrent ? 'ring-2 ring-purple-500 transform scale-105' : ''
                } transition-all duration-300 hover:shadow-xl cursor-pointer`}
                onClick={() => !comparisonInfo?.isCurrent && handleSelectPlan(plan)}
              >
                {plan.popular && !comparisonInfo?.isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                {comparisonInfo?.isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{formatCurrency(plan.price)}</div>
                    <div className="text-gray-600 mb-4">per month</div>
                    
                    {comparisonInfo && !comparisonInfo.isCurrent && (
                      <div className="text-sm font-medium mb-4">
                        <span className={`${comparisonInfo.isUpgrade ? 'text-blue-600' : 'text-green-600'}`}>
                          {comparisonInfo.actionText} ({comparisonInfo.isUpgrade ? '+' : '-'}${comparisonInfo.priceDiff})
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {comparisonInfo?.isCurrent && (
                    <div className="text-center text-green-600 font-medium">
                      ✓ Your Current Plan
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-600">
              You're about to cancel your {currentSubscription?.plan} subscription.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">What happens when you cancel:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• You'll keep access until your next billing date</li>
              <li>• No more charges after the current period</li>
              <li>• You can reactivate anytime</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="danger" 
              onClick={() => handleCancelSubscription(false)}
              disabled={cancellingPlan}
              className="w-full"
            >
              {cancellingPlan ? 'Cancelling...' : 'Cancel at Period End'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleCancelSubscription(true)}
              disabled={cancellingPlan}
              className="w-full"
            >
              {cancellingPlan ? 'Cancelling...' : 'Cancel Immediately'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowCancelModal(false)}
              className="w-full"
            >
              Keep Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Subscription Payment Component */}
      {showSubscriptionPayment && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <SubscriptionPayment
              plan={selectedPlan}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBilling;