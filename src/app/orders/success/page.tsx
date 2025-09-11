'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart';
import { orderApi } from '@/lib/api';
import { Order } from '@/types';
import { 
  CheckCircle,
  ArrowRight,
  Download,
  Truck,
  MessageSquare,
  Home,
  Loader2,
  AlertCircle
} from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pass the order ID or order number as-is (can be string or number)
        const response = await orderApi.getOrder(orderId);
        
        if (response.success && response.data) {
          setOrder(response.data);
          // Clear cart after successful order display
          clearCart();
        } else {
          setError(response.message || 'Failed to load order details');
        }
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        // Handle specific error cases
        if (err.response?.status === 403) {
          setError('You do not have permission to view this order.');
        } else if (err.response?.status === 404) {
          setError('Order not found. Please check your order confirmation email.');
        } else {
          setError('Failed to load order details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Order</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'We couldn\'t find the order details. Please check your order confirmation email.'}
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/orders">View All Orders</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate estimated delivery (3-5 business days from order date)
  const orderDate = new Date(order.created_at || Date.now());
  const estimatedDeliveryStart = new Date(orderDate);
  const estimatedDeliveryEnd = new Date(orderDate);
  estimatedDeliveryStart.setDate(estimatedDeliveryStart.getDate() + 3);
  estimatedDeliveryEnd.setDate(estimatedDeliveryEnd.getDate() + 5);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const estimatedDelivery = `${formatDate(estimatedDeliveryStart)} - ${formatDate(estimatedDeliveryEnd)}`;

  const handleDownloadReceipt = async () => {
    if (!order) return;
    
    try {
      const response = await orderApi.downloadReceipt(order.id);
      if (response.success) {
        if (response.download_url) {
          // If there's a download URL, open it
          window.open(response.download_url, '_blank');
        } else {
          // Show message if feature is not implemented yet
          alert(response.message || 'Receipt download feature is coming soon!');
        }
      } else {
        alert(response.message || 'Failed to download receipt');
      }
    } catch (err: any) {
      console.error('Failed to download receipt:', err);
      if (err.response?.status === 403) {
        alert('You do not have permission to download this receipt.');
      } else if (err.response?.status === 404) {
        alert('Receipt not found.');
      } else {
        alert('Failed to download receipt. Please try again.');
      }
    }
  };

  const handleTrackOrder = () => {
    router.push(`/orders/${order.order_number || order.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-foreground mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>

          {/* Order Details */}
          <div className="bg-muted/30 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="font-bold text-primary">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="font-bold text-foreground">₹{order.total_amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                <p className="font-bold text-foreground">{estimatedDelivery}</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="text-left mb-8">
            <h3 className="text-lg font-semibold mb-4 text-center">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email confirmation at {order.customer_email} shortly
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">We'll prepare your books for shipping within 1-2 business days</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Shipping & Tracking</p>
                  <p className="text-sm text-muted-foreground">You'll get tracking details once your order ships</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleTrackOrder}>
              View Order Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button variant="outline" size="lg" onClick={handleDownloadReceipt}>
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/products">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full" onClick={handleTrackOrder}>
              <Truck className="h-4 w-4 mr-2" />
              Track Order
            </Button>
            
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/contact">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>

          {/* Support Message */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Need help? Our customer support team is available 24/7 to assist you.{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
            </p>
          </div>

          {/* Promotional Banner */}
          <div className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              🎉 Thank you for being a valued customer!
            </p>
            <p className="text-xs text-muted-foreground">
              Follow us on social media for book recommendations and exclusive deals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}