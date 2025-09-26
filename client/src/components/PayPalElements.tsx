// client/src/components/PayPalElements.tsx - FIXED to require actual payment
import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Lock, AlertCircle, Loader2, Shield, FileText } from 'lucide-react';

interface PayPalElementsProps {
  orderData?: {
    order_id: string;
    approval_url: string;
    amount: number;
    description?: string;
  };
  subscriptionData?: {
    subscription_id: string;
    approval_url: string;
    amount: number;
    plan_name: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
  description: string;
  isSubscription?: boolean;
  planName?: string;
  isSetup?: boolean;
  invoiceNumber?: string;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export const PayPalElements: React.FC<PayPalElementsProps> = ({
  orderData,
  subscriptionData,
  onSuccess,
  onError,
  amount,
  description,
  isSubscription = false,
  planName,
  isSetup = false,
  invoiceNumber
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);

  useEffect(() => {
    // Load PayPal SDK
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD&intent=${isSubscription ? 'subscription' : 'capture'}&vault=${isSubscription ? 'true' : 'false'}`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
    };
    script.onerror = () => {
      setError('Failed to load PayPal SDK');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isSubscription]);

  useEffect(() => {
    if (paypalLoaded && paypalRef.current && !buttonsRendered.current && (orderData || subscriptionData)) {
      renderPayPalButtons();
    }
  }, [paypalLoaded, orderData, subscriptionData]);

  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalRef.current || buttonsRendered.current) return;

    buttonsRendered.current = true;

    if (isSubscription && subscriptionData) {
      // FIXED: Proper subscription flow that requires actual payment
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'subscribe',
          height: 45
        },
        
        // CRITICAL: This creates the subscription but doesn't activate it
        createSubscription: () => {
          // Return the subscription ID that was created on the server
          return subscriptionData.subscription_id;
        },
        
        // CRITICAL: This is called ONLY after user approves/pays on PayPal
        onApprove: async (data: any) => {
          setProcessing(true);
          setError(null);
          
          console.log('PayPal onApprove called with:', data);
          
          try {
            // IMPORTANT: This endpoint will verify the payment was actually made
            const response = await fetch('/api/billing/approve-subscription/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({
                subscription_id: data.subscriptionID
              })
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
              console.log('Subscription payment verified and activated:', responseData);
              onSuccess();
            } else {
              throw new Error(responseData.error || 'Subscription activation failed');
            }
          } catch (err) {
            console.error('Subscription activation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Subscription activation failed';
            setError(errorMessage);
            onError(errorMessage);
          } finally {
            setProcessing(false);
          }
        },
        
        onError: (err: any) => {
          console.error('PayPal subscription error:', err);
          const errorMessage = 'Subscription payment failed. Please try again.';
          setError(errorMessage);
          onError(errorMessage);
          setProcessing(false);
        },
        
        onCancel: () => {
          console.log('PayPal subscription cancelled by user');
          setError('Payment was cancelled. You can try again anytime.');
          setProcessing(false);
        }
      }).render(paypalRef.current);

    } else if (orderData) {
      // One-time payment flow (for invoices)
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
          height: 45
        },
        createOrder: () => {
          return orderData.order_id;
        },
        onApprove: async (data: any) => {
          setProcessing(true);
          setError(null);
          
          try {
            // Capture the payment
            const response = await fetch('/api/billing/capture-payment/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${localStorage.getItem('auth_token')}`
              },
              body: JSON.stringify({
                order_id: data.orderID
              })
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
              console.log('Payment captured:', responseData);
              onSuccess();
            } else {
              throw new Error(responseData.error || 'Payment capture failed');
            }
          } catch (err) {
            console.error('Payment capture error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Payment capture failed';
            setError(errorMessage);
            onError(errorMessage);
          } finally {
            setProcessing(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal payment error:', err);
          const errorMessage = 'Payment failed. Please try again.';
          setError(errorMessage);
          onError(errorMessage);
          setProcessing(false);
        },
        onCancel: () => {
          setError('Payment was cancelled');
          setProcessing(false);
        }
      }).render(paypalRef.current);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getHeaderContent = () => {
    if (isSetup) {
      return {
        title: 'PayPal Payment',
        subtitle: 'PayPal does not support saving payment methods',
        amount: null
      };
    } else if (invoiceNumber) {
      return {
        title: `Pay Invoice ${invoiceNumber}`,
        subtitle: 'Complete payment for your invoice',
        amount: formatCurrency(amount)
      };
    } else if (isSubscription) {
      return {
        title: `Subscribe to ${planName}`,
        subtitle: 'Complete payment to activate your subscription',
        amount: formatCurrency(amount)
      };
    } else {
      return {
        title: 'Complete Payment',
        subtitle: description,
        amount: formatCurrency(amount)
      };
    }
  };

  const headerContent = getHeaderContent();

  if (isSetup) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Shield className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">
              PayPal Payment
            </h3>
            <p className="text-center text-blue-100">
              PayPal processes payments securely without storing payment methods
            </p>
          </div>
          <div className="p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                PayPal does not support saving payment methods. Each payment is processed individually for security.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payments</p>
                    <p>All payments are processed securely through PayPal's encrypted systems.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              {invoiceNumber ? (
                <FileText className="w-8 h-8" />
              ) : (
                <CreditCard className="w-8 h-8" />
              )}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">
            {headerContent.title}
          </h3>
          <p className="text-center text-blue-100 mb-2">
            {headerContent.subtitle}
          </p>
          {headerContent.amount && (
            <div className="text-center">
              <span className="text-3xl font-bold">{headerContent.amount}</span>
              {isSubscription && <span className="text-blue-100 ml-2">/month</span>}
            </div>
          )}
        </div>

        {/* Payment Form */}
        <div className="p-6">
          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* PayPal Button Container */}
          <div className="mb-6">
            {!paypalLoaded ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading PayPal...</span>
              </div>
            ) : !orderData && !subscriptionData ? (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Preparing payment...</p>
                </div>
              </div>
            ) : (
              <div>
                <div ref={paypalRef} className="min-h-[60px]"></div>
                {processing && (
                  <div className="text-center mt-4">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-gray-600">
                        {isSubscription ? 'Processing subscription payment...' : 'Processing payment...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-6">
            <Lock className="w-5 h-5 text-gray-500" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Secure Payment</p>
              <p>
                {isSubscription 
                  ? 'Complete your subscription payment securely through PayPal'
                  : 'Powered by PayPal\'s secure payment system'
                }
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          {!isSetup && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{description}</span>
                <span className="font-semibold">{formatCurrency(amount)}</span>
              </div>
              {isSubscription && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Billing cycle</span>
                    <span className="text-gray-500">Monthly</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Due today</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  </div>
                </>
              )}
              {invoiceNumber && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Invoice</span>
                  <span className="text-gray-500">#{invoiceNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Subscription Terms */}
          {isSubscription && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800 space-y-1">
                <p className="font-medium">Important Subscription Terms:</p>
                <p>• You must complete payment through PayPal to activate your subscription</p>
                <p>• Your subscription will renew automatically each month via PayPal</p>
                <p>• You can cancel anytime from your PayPal account or billing settings</p>
                <p>• 30-day money-back guarantee</p>
                <p>• No setup fees or hidden charges</p>
              </div>
            </div>
          )}

          {/* Development Info */}
          {import.meta.env.MODE === 'development' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Development Mode</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>Using PayPal Sandbox environment</p>
                <p>No real money will be charged</p>
                <p>Use PayPal sandbox test accounts for testing</p>
                <p>Payment verification is still enforced</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};