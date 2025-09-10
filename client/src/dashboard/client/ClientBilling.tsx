// client/src/dashboard/client/ClientBilling.tsx
import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, FileText, Download, Calendar,
  CheckCircle, XCircle, AlertCircle, Clock, TrendingUp,
  Shield, Info, ChevronRight, Receipt, History,
  Zap, Award, Settings, Plus,
  Users
} from 'lucide-react';
import { Card, Button, Modal, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';
import { useAuth } from '../../context/AuthContext';

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
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  isDefault: boolean;
  expiryDate?: string;
}

interface Subscription {
  plan: string;
  price: number;
  billing_cycle: 'monthly' | 'annually';
  next_billing_date: string;
  features: string[];
  status: 'active' | 'cancelled' | 'past_due';
}

interface BillingStats {
  totalSpent: number;
  currentBalance: number;
  nextPayment: number;
  nextPaymentDate: string;
  savings: number;
}

const ClientBilling: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment' | 'subscription'>('overview');

  // Mock subscription data
  const [subscription] = useState<Subscription>({
    plan: 'Growth Plan',
    price: 2500,
    billing_cycle: 'monthly',
    next_billing_date: '2024-04-15',
    features: [
      'Up to 5 social media accounts',
      'Advanced analytics & reporting',
      'Content calendar & scheduling',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom branded reports'
    ],
    status: 'active'
  });

  // Mock payment methods
  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true, expiryDate: '12/25' },
    { id: '2', type: 'bank', last4: '6789', isDefault: false }
  ]);

  const [billingStats, setBillingStats] = useState<BillingStats>({
    totalSpent: 0,
    currentBalance: 0,
    nextPayment: subscription.price,
    nextPaymentDate: subscription.next_billing_date,
    savings: 0
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getInvoices();
      const invoicesArray = Array.isArray(data) ? data : [];
      setInvoices(invoicesArray);
      
      // Calculate billing stats
      const totalSpent = invoicesArray
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      const currentBalance = invoicesArray
        .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.amount, 0);
      
      // Calculate savings (mock - assuming 20% discount for annual billing)
      const monthlyTotal = subscription.price * 12;
      const annualPrice = monthlyTotal * 0.8;
      const savings = subscription.billing_cycle === 'annually' ? monthlyTotal - annualPrice : 0;
      
      setBillingStats({
        totalSpent,
        currentBalance,
        nextPayment: subscription.price,
        nextPaymentDate: subscription.next_billing_date,
        savings
      });
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;
    
    try {
      await ApiService.markInvoicePaid(selectedInvoice.id);
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      await fetchBillingData();
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Failed to process payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Downloading invoice #${invoice.invoice_number}...`);
  };

  const handleUpgradePlan = () => {
    alert('Redirecting to plan selection...');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
        <Button onClick={handleUpgradePlan}>
          <Zap className="w-4 h-4 mr-2" />
          Upgrade Plan
        </Button>
      </div>

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
              <p className="text-2xl font-bold">{subscription.plan}</p>
              <p className="text-sm text-blue-100 mt-1">{formatCurrency(subscription.price)}/month</p>
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
              <p className="text-yellow-100">Current Balance</p>
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Subscription */}
                <Card title="Current Subscription">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{subscription.plan}</h3>
                        <p className="text-gray-600">Billed {subscription.billing_cycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(subscription.price)}</p>
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
                        {new Date(subscription.next_billing_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        Change Plan
                      </Button>
                      <Button variant="outline" className="flex-1">
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

              {/* Billing Tips */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-start">
                  <Info className="w-6 h-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Save on Your Subscription</h3>
                    <p className="text-gray-700 mb-3">
                      Switch to annual billing and save 20% on your subscription - that's {formatCurrency(subscription.price * 12 * 0.2)} per year!
                    </p>
                    <Button size="sm" variant="primary">
                      Switch to Annual
                    </Button>
                  </div>
                </div>
              </Card>
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
                            <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(invoice)}>
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

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <Button onClick={() => setShowAddPaymentMethod(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {method.type === 'card' ? (
                          <CreditCard className="w-8 h-8 text-gray-600 mr-4" />
                        ) : (
                          <DollarSign className="w-8 h-8 text-gray-600 mr-4" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {method.type === 'card' ? `${method.brand} •••• ${method.last4}` : `Bank Account •••• ${method.last4}`}
                          </p>
                          {method.expiryDate && (
                            <p className="text-sm text-gray-600">Expires {method.expiryDate}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {method.isDefault && (
                          <Badge variant="primary">Default</Badge>
                        )}
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-blue-900 font-medium">Your payment information is secure</p>
                    <p className="text-sm text-blue-700 mt-1">
                      We use industry-standard encryption to protect your payment details. Your information is never shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Plan */}
                <Card className="border-2 border-purple-500">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Plan</h3>
                    <p className="text-gray-600 mb-4">Perfect for growing businesses</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(2500)}</p>
                    <p className="text-gray-600 mb-4">per month</p>
                    <Badge variant="primary">Current Plan</Badge>
                  </div>
                </Card>

                {/* Upgrade Option */}
                <Card className="border hover:border-purple-300 transition-colors">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
                    <p className="text-gray-600 mb-4">For established brands</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(5000)}</p>
                    <p className="text-gray-600 mb-4">per month</p>
                    <Button className="w-full">Upgrade</Button>
                  </div>
                </Card>

                {/* Downgrade Option */}
                <Card className="border hover:border-gray-300 transition-colors">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
                    <p className="text-gray-600 mb-4">For small businesses</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(1500)}</p>
                    <p className="text-gray-600 mb-4">per month</p>
                    <Button variant="outline" className="w-full">Downgrade</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Process Payment"
        size="md"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium">#{selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-xl">{formatCurrency(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">{new Date(selectedInvoice.due_date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.type === 'card' 
                      ? `${method.brand} •••• ${method.last4}` 
                      : `Bank Account •••• ${method.last4}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessPayment}>
                Pay {formatCurrency(selectedInvoice.amount)}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientBilling;