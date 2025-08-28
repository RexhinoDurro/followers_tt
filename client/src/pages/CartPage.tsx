// pages/CartPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  X, 
  ShoppingBag, 
  ArrowLeft,
  Shield,
  Star,
  Gift,
  CreditCard,
  Lock,
  CheckCircle,
  Tag,
  Truck,
  Clock,
  Award
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  plan: string;
  price: number;
  originalPrice?: number;
  billingCycle: 'monthly' | 'annual';
  quantity: number;
  image: string;
  features: string[];
  discount?: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Instagram Growth Plan',
      platform: 'instagram',
      plan: 'Growth',
      price: 69,
      originalPrice: 89,
      billingCycle: 'monthly',
      quantity: 1,
      image: '📸',
      features: ['1,500-3,000 followers/month', 'Advanced hashtag strategy', 'Priority support'],
      discount: 22
    },
    {
      id: '2',
      name: 'TikTok Viral Growth',
      platform: 'tiktok',
      plan: 'Viral Growth',
      price: 79,
      billingCycle: 'monthly',
      quantity: 1,
      image: '🎵',
      features: ['2,500-5,000 followers/month', 'Trend analysis', 'Video optimization']
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showPromoSuccess, setShowPromoSuccess] = useState(false);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    const validCodes = {
      'SAVE20': 20,
      'WELCOME10': 10,
      'FIRST15': 15,
      'BOOST25': 25
    };

    const discount = validCodes[promoCode.toUpperCase() as keyof typeof validCodes];
    if (discount) {
      setAppliedPromo(promoCode.toUpperCase());
      setPromoDiscount(discount);
      setShowPromoSuccess(true);
      setTimeout(() => setShowPromoSuccess(false), 3000);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoDiscount(0);
    setPromoCode('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const promoAmount = (subtotal * promoDiscount) / 100;
  const tax = (subtotal - promoAmount) * 0.08; // 8% tax
  const total = subtotal - promoAmount + tax;

  const platformColors = {
    instagram: 'from-pink-500 to-purple-500',
    tiktok: 'from-gray-800 to-gray-600',
    youtube: 'from-red-500 to-red-600'
  };

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/pricing"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">Review your selected plans and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-purple-600" />
                  Your Items ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Product Image/Icon */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${platformColors[item.platform]} flex items-center justify-center text-2xl flex-shrink-0`}>
                        {item.image}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize mb-2">
                              {item.plan} Plan • Billed {item.billingCycle}
                            </p>
                            
                            {/* Features */}
                            <div className="mb-3">
                              {item.features.slice(0, 2).map((feature, index) => (
                                <p key={index} className="text-sm text-gray-600 flex items-center mb-1">
                                  <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </p>
                              ))}
                            </div>

                            {/* Discount Badge */}
                            {item.discount && (
                              <div className="flex items-center mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {item.discount}% OFF
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-4"
                            title="Remove item"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 font-medium">Quantity:</span>
                            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-12 text-center font-medium py-1 text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r-lg"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            {item.originalPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                ${(item.originalPrice * item.quantity).toFixed(2)}
                              </p>
                            )}
                            <p className="text-xl font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              per {item.billingCycle.slice(0, -2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Promo Code</span>
                </div>
                
                {!appliedPromo ? (
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={!promoCode.trim()}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
                      >
                        Apply
                      </button>
                    </div>
                    
                    {/* Suggested Codes */}
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Try these codes:</p>
                      <div className="flex flex-wrap gap-2">
                        {['SAVE20', 'WELCOME10', 'FIRST15'].map((code) => (
                          <button
                            key={code}
                            onClick={() => {
                              setPromoCode(code);
                              setTimeout(applyPromoCode, 100);
                            }}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-800 font-medium text-sm">
                        Code "{appliedPromo}" applied ({promoDiscount}% off)
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {showPromoSuccess && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Promo code applied successfully!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                Order Summary
              </h3>

              {/* Summary Items */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo})</span>
                    <span>-${promoAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Billed monthly</p>
                </div>
              </div>

              {/* Security Badges */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                  <div className="flex flex-col items-center">
                    <Shield className="w-4 h-4 text-green-500 mb-1" />
                    <span>Secure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Lock className="w-4 h-4 text-green-500 mb-1" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Award className="w-4 h-4 text-green-500 mb-1" />
                    <span>Protected</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center mb-4 shadow-lg hover:shadow-xl"
              >
                <Lock className="w-5 h-5 mr-2" />
                Secure Checkout
              </Link>

              {/* Guarantees */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Instant activation</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Recommended Add-ons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Recommended
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📺</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">YouTube Growth</p>
                      <p className="text-xs text-gray-500">Complete your social presence</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">$99</p>
                    <button className="text-purple-600 text-xs hover:text-purple-800 transition-colors font-medium">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Your payment information is encrypted and secure</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted by 10,000+</h3>
              <p className="text-gray-600 text-sm">Join thousands of satisfied customers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Get help whenever you need it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty Cart Component
const EmptyCart: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any growth plans yet. Start building your social media presence!
        </p>
        <div className="space-y-3">
          <Link
            to="/pricing"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 block"
          >
            Browse Plans
          </Link>
          <Link
            to="/"
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default CartPage;