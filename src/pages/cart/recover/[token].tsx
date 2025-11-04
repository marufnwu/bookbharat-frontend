'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  ArrowRight,
  Loader,
  X,
  TrendingDown,
  Package,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ValidationIssue {
  type: string;
  product_id: number;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

interface CartData {
  id: number;
  user_id: number;
  cart_data: CartItem[];
  total_amount: number;
  recovery_probability: number;
  customer_segment: string;
  discount_code?: string;
  discount_percentage?: number;
}

interface ValidationResult {
  is_valid: boolean;
  issues: ValidationIssue[];
  price_changes: Array<{
    product_id: number;
    old_price: number;
    new_price: number;
    difference: number;
  }>;
  updated_cart_data: {
    total_amount: number;
    items: CartItem[];
  };
  notification_message: string;
}

export default function CartRecoveryPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [cart, setCart] = useState<CartData | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showItemAdjustments, setShowItemAdjustments] = useState(false);
  const [itemAdjustments, setItemAdjustments] = useState<Record<number, number>>({});

  useEffect(() => {
    fetchCartData();
  }, [token]);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/cart/recovery/${token}`);

      if (!response.data.success) {
        setError(response.data.message || 'Cart not found or expired');
        return;
      }

      setCart(response.data.data.cart);
      setValidation(response.data.data.validation);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cart. Please try again.');
      console.error('Cart recovery error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!token) return;

    try {
      setRestoring(true);
      const response = await axios.post(`/api/v1/cart/recover`, {
        token,
        remove_invalid: true,
        adjust_quantities: false,
      });

      if (response.data.success) {
        toast.success('Cart restored! Redirecting to checkout...');
        setTimeout(() => {
          router.push('/checkout');
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to restore cart');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error restoring cart');
      console.error('Restore error:', err);
    } finally {
      setRestoring(false);
    }
  };

  const getIssueSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      default:
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  const getIssueSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cart Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No cart data available</p>
      </div>
    );
  }

  const cartItems = validation?.updated_cart_data?.items || cart.cart_data || [];
  const totalPrice = validation?.updated_cart_data?.total_amount || cart.total_amount;
  const priceIncreases = validation?.price_changes?.filter(p => p.difference > 0) || [];
  const priceDecreases = validation?.price_changes?.filter(p => p.difference < 0) || [];
  const criticalIssues = validation?.issues?.filter(i => i.severity === 'critical') || [];
  const warningIssues = validation?.issues?.filter(i => i.severity === 'warning') || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recover Your Cart</h1>
          <p className="text-gray-600">Complete your purchase and enjoy your saved items</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alerts Section */}
            {(criticalIssues.length > 0 || warningIssues.length > 0 || priceIncreases.length > 0) && (
              <div className="space-y-3">
                {/* Critical Issues */}
                {criticalIssues.map((issue, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${getIssueSeverityColor('critical')}`}>
                    <div className="flex items-start gap-3">
                      {getIssueSeverityIcon('critical')}
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900">⚠️ {issue.message}</h3>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Warning Issues */}
                {warningIssues.map((issue, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${getIssueSeverityColor('warning')}`}>
                    <div className="flex items-start gap-3">
                      {getIssueSeverityIcon('warning')}
                      <div className="flex-1">
                        <h3 className="font-semibold text-yellow-900">{issue.message}</h3>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Price Increases */}
                {priceIncreases.map((change, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900">Price Increase</h3>
                        <p className="text-sm text-red-700">₹{change.old_price} → ₹{change.new_price}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Price Decreases (Good news!) */}
                {priceDecreases.map((change, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900">✓ Good News! Price Decreased</h3>
                        <p className="text-sm text-green-700">
                          ₹{Math.abs(change.difference)} savings!
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notification Message */}
            {validation?.notification_message && (
              <div className="p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                <p className="text-blue-900">{validation.notification_message}</p>
              </div>
            )}

            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Your Cart Items ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{item.quantity * item.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                </div>

                {validation?.price_changes && validation.price_changes.length > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Price Changes</span>
                    <span>₹{validation.price_changes.reduce((sum, c) => sum + c.difference, 0)}</span>
                  </div>
                )}
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">₹{totalPrice}</p>
                <p className="text-sm text-gray-600 mt-1">Final Amount</p>
              </div>

              {/* Discount Badge */}
              {cart.discount_code && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-900">
                    🎉 Discount Applied: {cart.discount_percentage}% OFF
                  </p>
                  <p className="text-xs text-green-700 mt-1">Code: {cart.discount_code}</p>
                </div>
              )}

              {/* Recovery Probability */}
              <div className="mb-6 p-3 bg-purple-50 rounded">
                <p className="text-sm text-gray-600">Recovery Success Rate</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(cart.recovery_probability || 50, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{cart.recovery_probability}% likely to convert</p>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleRestore}
                disabled={restoring}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mb-3 flex items-center justify-center gap-2"
              >
                {restoring ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    Restore & Checkout
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <Link
                href="/"
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-600 text-center">
            🔒 Your cart and payment information are secure. This recovery link is valid for 7 days.
          </p>
        </div>
      </div>
    </div>
  );
}

