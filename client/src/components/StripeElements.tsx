// client/src/components/StripeElements.tsx - Enhanced Professional Version
import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface StripeElementsProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
  description: string;
  isSubscription?: boolean;
  planName?: string;
}

export const StripeElements: React.FC<StripeElementsProps> = ({
  clientSecret,
  onSuccess,
  onError,
  amount,
  description,
  isSubscription = false,
  planName
}) => {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>('');

  useEffect(() => {
    if (window.Stripe) {
      const stripeInstance = window.Stripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      );
      setStripe(stripeInstance);

      const elementsInstance = stripeInstance.elements({
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
          rules: {
            '.Input': {
              padding: '12px',
              border: '1px solid #d1d5db',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
            '.Input:focus': {
              border: '1px solid #7c3aed',
              boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
              outline: 'none',
            },
            '.Label': {
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px',
            }
          }
        }
      });
      setElements(elementsInstance);

      const cardElement = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
            '::placeholder': {
              color: '#9ca3af',
            },
            iconColor: '#6b7280',
          },
          invalid: {
            color: '#dc2626',
            iconColor: '#dc2626',
          },
        },
        hidePostalCode: false,
      });

      cardElement.mount('#card-element');
      setCard(cardElement);

      cardElement.on('change', (event: any) => {
        setError(event.error ? event.error.message : null);
        setCardComplete(event.complete);
        setCardBrand(event.brand || '');
      });
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !card) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    if (!cardComplete) {
      setError('Please complete your card information.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: 'Customer Name',
          },
        }
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setError(error.message);
        onError(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent);
        onSuccess();
      } else {
        console.log('Payment status:', paymentIntent?.status);
        setError('Payment was not completed successfully');
        onError('Payment was not completed successfully');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCardBrandIcon = () => {
    switch (cardBrand) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-center mb-2">
            {isSubscription ? `Subscribe to ${planName}` : 'Complete Payment'}
          </h3>
          <div className="text-center">
            <span className="text-3xl font-bold">{formatCurrency(amount)}</span>
            {isSubscription && <span className="text-purple-100 ml-2">/month</span>}
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Card Information
              </label>
              <div className="relative">
                <div 
                  id="card-element" 
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    error 
                      ? 'border-red-300 bg-red-50' 
                      : cardComplete 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 focus-within:border-purple-500'
                  }`}
                />
                {cardComplete && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                )}
                {cardBrand && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg">
                    {getCardBrandIcon()}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Security Notice */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Lock className="w-5 h-5 text-gray-500" />
              <div className="text-sm text-gray-600">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>

            {/* Payment Summary */}
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
            </div>

            <button
              type="submit"
              disabled={!stripe || processing || !cardComplete}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                processing || !cardComplete
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98]'
              } focus:ring-4 focus:ring-purple-200 shadow-lg`}
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                `Pay ${formatCurrency(amount)}`
              )}
            </button>
          </form>

          {/* Test Card Info for Development */}
          {import.meta.env.MODE === 'development' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Test Card Numbers</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Success:</strong> 4242 4242 4242 4242</p>
                <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
                <p><strong>Expiry:</strong> Any future date</p>
                <p><strong>CVC:</strong> Any 3 digits</p>
                <p><strong>ZIP:</strong> Any valid ZIP code</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};