// client/src/pages/CartPage.tsx - Shopping cart for service packages
import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Shield } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { packages } from '../data/pricing';

interface CartItem {
  id: string;
  serviceId: string;
  name: string;
  quantity: number;
  price: number;
  platform: string;
  features: string[];
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  const updateCart = (newItems: CartItem[]) => {
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    updateCart(updatedItems);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Here you would integrate with your payment processor
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to checkout or payment page
      window.location.href = '/auth?redirect=/checkout';
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (packageItem: typeof packages[0]) => {
    const newItem: CartItem = {
      id: `${packageItem.id}-${Date.now()}`,
      serviceId: packageItem.serviceId,
      name: `${packageItem.name} - ${packageItem.quantity.toLocaleString()}`,
      quantity: 1,
      price: packageItem.price,
      platform: packageItem.serviceId.split('-')[0], // Extract platform from serviceId
      features: packageItem.features
    };

    const existingItem = cartItems.find(item => item.serviceId === packageItem.serviceId);
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      updateCart([...cartItems, newItem]);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-xl text-gray-600 mb-8">
            Browse our services and add some packages to get started!
          </p>
          
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-3">{pkg.quantity.toLocaleString()} followers</p>
                  <p className="text-2xl font-bold text-purple-600 mb-4">${pkg.price}</p>
                  <Button 
                    onClick={() => addToCart(pkg)}
                    className="w-full"
                  >
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={() => window.location.href = '/pricing'} size="lg">
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {item.platform.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item.platform} Growth Package</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.features.slice(0, 2).map((feature, idx) => (
                        <span key={idx} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">${item.price} each</p>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-$0.00</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">✅ What's Included:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Real, active followers</li>
                  <li>• 30-day money-back guarantee</li>
                  <li>• 24/7 customer support</li>
                  <li>• Gradual, safe delivery</li>
                  <li>• Account security protection</li>
                </ul>
              </div>
            </Card>

            {/* Promo Code */}
            <Card className="mt-4">
              <h3 className="font-medium text-gray-900 mb-4">Promo Code</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                New customers get 20% off their first order!
              </p>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-6 text-center">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="font-medium">Secure</div>
                  <div className="text-gray-500">SSL Encrypted</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="font-medium">Fast</div>
                  <div className="text-gray-500">Quick Delivery</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">✅</div>
                  <div className="font-medium">Guaranteed</div>
                  <div className="text-gray-500">100% Safe</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;