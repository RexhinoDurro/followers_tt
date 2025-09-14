// Fixed client/src/components/SubscriptionPayment.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import ApiService from '../services/ApiService'; // Import ApiService

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  stripePrice: string;
}

interface SubscriptionPaymentProps {
  plan: Plan;
  onCancel: () => void;
}

export const SubscriptionPayment: React.FC<SubscriptionPaymentProps> = ({
  plan,
  onCancel
}) => {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Only initialize Stripe when we're on the payment step
    if (step === 'payment' && window.Stripe) {
      // Initialize Stripe if not already done
      let currentStripe = stripe;
      if (!currentStripe) {
        currentStripe = window.Stripe(
          import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        );
        setStripe(currentStripe);
      }

      // Create Elements instance
      const elementsInstance = currentStripe.elements();
      setElements(elementsInstance);

      // Create and mount card element
      const cardElement = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });

      // Make sure the element exists before mounting
      const mountElement = document.getElementById('subscription-card-element');
      if (mountElement) {
        cardElement.mount('#subscription-card-element');
        setCard(cardElement);

        cardElement.on('change', (event: any) => {
          setError(event.error ? event.error.message : null);
          
          // Track if the card element is complete
          if (event.complete) {
            console.log('Card element is complete');
          }
        });
      }

      // Cleanup function
      return () => {
        cardElement.unmount();
      };
    }
  }, [step, stripe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleContinueToPayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      console.log('Creating subscription for plan:', plan);
      
      // FIXED: Use ApiService instead of direct fetch
      const data = await ApiService.createSubscription({
        price_id: plan.stripePrice,
        plan_name: plan.name
      }) as { client_secret: string };

      console.log('Subscription created:', data);
      
      if (!data.client_secret) {
        throw new Error('No client secret received from server');
      }

      // Initialize Stripe if not already done
      if (!stripe && window.Stripe) {
        const stripeInstance = window.Stripe(
          import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        );
        setStripe(stripeInstance);
      }

      setClientSecret(data.client_secret);
      setTimeout(() => setStep('payment'), 100); // Small delay to ensure stripe is ready
      
    } catch (err) {
      console.error('Subscription creation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
      alert(errorMessage); // Show error to user
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !card || !clientSecret) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // First create a payment method
      const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
          name: 'Customer', // You can get this from user context
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Then confirm the payment with the payment method
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setError(error.message);
        window.location.href = '/order-confirmation?status=failed';
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!');
        setStep('success');
        // Redirect to order confirmation page after 2 seconds
        setTimeout(() => {
          window.location.href = '/order-confirmation?status=succeeded';
        }, 2000);
      } else {
        setError('Payment was not completed successfully');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your {plan.name} subscription is now active.</p>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-800 font-medium">{formatCurrency(plan.price)}/month</p>
          <p className="text-green-600">You'll be redirected shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center text-white hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl font-bold">Subscribe to {plan.name}</h1>
          <div></div>
        </div>
      </div>

      <div className="p-6">
        {step === 'details' && (
          <div className="space-y-6">
            {/* Plan Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name} Plan</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">What's included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end">
              <button
                onClick={handleContinueToPayment}
                disabled={processing}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                  processing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {processing ? 'Setting up...' : 'Continue to Payment'}
              </button>
            </div>

            {/* Show error if subscription creation fails */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            {/* Payment Form */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h3>
              
              <form onSubmit={handleSubmitPayment}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information
                  </label>
                  <div 
                    id="subscription-card-element" 
                    className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500"
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-700">
                    <Lock className="w-4 h-4 mr-2" />
                    <span>Your payment is secured by 256-bit SSL encryption</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{plan.name} Plan</span>
                    <span className="font-semibold">{formatCurrency(plan.price)}/month</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Cancel anytime • No setup fees
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!stripe || processing}
                    className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                      processing || !stripe
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {processing ? 'Processing...' : `Pay ${formatCurrency(plan.price)}`}
                  </button>
                </div>
              </form>
            </div>

            {/* Test Card Info */}
            {import.meta.env.MODE === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Test Card:</strong> 4242 4242 4242 4242<br />
                  <strong>Expiry:</strong> Any future date<br />
                  <strong>CVC:</strong> Any 3 digits
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};