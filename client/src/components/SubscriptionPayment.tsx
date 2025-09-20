// client/src/components/SubscriptionPayment.tsx - Enhanced with PayPal integration
import React, { useState } from 'react';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, CreditCard, Shield } from 'lucide-react';
import { PayPalElements } from './PayPalElements';
import ApiService from '../services/ApiService';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  stripePrice: string; // Keep for backward compatibility, but won't be used
}

interface SubscriptionPaymentProps {
  plan: Plan;
  onCancel: () => void;
}

interface SubscriptionResponse {
  subscription_id: string;
  approval_url: string;
  status: string;
  plan_name: string;
  amount: number;
}

export const SubscriptionPayment: React.FC<SubscriptionPaymentProps> = ({
  plan,
  onCancel
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinueToPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Creating PayPal subscription for plan:', plan);
      
      const data = await ApiService.createSubscription({
        price_id: `price_${plan.id}_monthly`, // Keep format for backend compatibility
        plan_name: plan.name
      }) as SubscriptionResponse;

      console.log('PayPal subscription created:', data);
      
      if (!data.approval_url) {
        throw new Error('No approval URL received from PayPal');
      }

      setSubscriptionData(data);
      setStep('payment');
    } catch (err) {
      console.error('Subscription creation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
    setTimeout(() => {
      window.location.href = '/order-confirmation?status=succeeded';
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
    window.location.href = '/order-confirmation?status=failed';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-green-100">Your {plan.name} subscription is now active.</p>
        </div>
        <div className="p-6 text-center">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 font-medium text-xl">{formatCurrency(plan.price)}/month</p>
            <p className="text-green-600 mt-2">You'll be redirected shortly...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Subscribe to {plan.name}</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side - Plan Details */}
        <div className="p-8 bg-gray-50 border-r border-gray-200">
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name} Plan</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-center mb-4">What's included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Secure & Protected
              </h4>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>PayPal secure payment processing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>256-bit SSL encryption</span>
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
            </div>

            {/* Billing Information */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Billing Information</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing cycle:</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment method:</span>
                  <span className="font-medium">PayPal</span>
                </div>
                <div className="flex justify-between">
                  <span>First payment:</span>
                  <span className="font-medium">{formatCurrency(plan.price)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Due today:</span>
                    <span>{formatCurrency(plan.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="p-8">
          {step === 'details' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Subscription</h3>
                <p className="text-gray-600">Start your {plan.name} plan today and grow your social media presence</p>
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

              {/* PayPal Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">PayPal Payment</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>✓ Secure payment processing through PayPal</p>
                  <p>✓ Pay with your PayPal account or credit/debit card</p>
                  <p>✓ No payment information stored on our servers</p>
                  <p>✓ Automatic monthly billing through PayPal</p>
                </div>
              </div>

              {/* Terms and Agreement */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Terms & Agreement</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Your subscription will renew automatically each month</p>
                  <p>✓ You can cancel or change your plan anytime</p>
                  <p>✓ All payments are secure and encrypted</p>
                  <p>✓ 30-day money-back guarantee</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleContinueToPayment}
                  disabled={loading}
                  className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </div>
                  ) : (
                    'Continue to PayPal'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && subscriptionData && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Payment with PayPal</h3>
                <p className="text-gray-600">Secure payment powered by PayPal</p>
              </div>

              <PayPalElements
                subscriptionData={subscriptionData}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                amount={plan.price}
                description={`${plan.name} Plan Subscription`}
                isSubscription={true}
                planName={plan.name}
              />

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-8 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span>PayPal Protected</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Money-back Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};