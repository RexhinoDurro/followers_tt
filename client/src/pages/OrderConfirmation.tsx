import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const OrderConfirmation: React.FC = () => {
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get('status');

  useEffect(() => {
    // Check payment status from URL parameters
    if (paymentStatus === 'succeeded') {
      setStatus('success');
    } else if (paymentStatus === 'failed') {
      setStatus('error');
    }
  }, [paymentStatus]);

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for your subscription. Your account has been successfully activated.
            </p>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-8">
              We were unable to process your payment. Please try again or contact support.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate('/dashboard#billing')}>
                Try Again
              </Button>
              <Button onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </div>
          </>
        );

      default:
        return (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Processing payment...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-20">
      <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default OrderConfirmation;

