'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentApi, orderApi } from '@/lib/api';
import {
  Loader2,
  CheckCircle,
  XCircle,
  CreditCard,
  ShieldCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentProcessPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [order, setOrder] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const gateway = searchParams.get('gateway') || 'razorpay';

  useEffect(() => {
    if (orderId) {
      loadOrderAndInitiatePayment();
    } else {
      setError('No order ID provided');
    }
  }, [orderId]);

  const loadOrderAndInitiatePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');

      // Get order details
      const orderResponse = await orderApi.getOrder(parseInt(orderId!));
      if (!orderResponse.success) {
        throw new Error('Failed to load order details');
      }
      setOrder(orderResponse.data);

      // Initiate payment
      const paymentResponse = await paymentApi.initiatePayment({
        order_id: parseInt(orderId!),
        gateway: gateway,
        return_url: `${window.location.origin}/payment/callback`,
        cancel_url: `${window.location.origin}/payment/cancelled`
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to initiate payment');
      }

      setPaymentData(paymentResponse.data);

      // Handle different gateway types
      if (gateway === 'razorpay') {
        await handleRazorpayPayment(paymentResponse.data);
      } else if (gateway === 'payu') {
        handlePayUPayment(paymentResponse.data);
      } else if (gateway === 'phonepe') {
        handlePhonePePayment(paymentResponse.data);
      } else if (gateway === 'cod') {
        // COD doesn't need payment processing
        handleCODOrder();
      }

    } catch (err: any) {
      console.error('Payment initiation failed:', err);
      setError(err.message || 'Failed to initiate payment');
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async (data: any) => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => processRazorpayPayment(data);
      document.body.appendChild(script);
    } else {
      processRazorpayPayment(data);
    }
  };

  const processRazorpayPayment = (data: any) => {
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: data.name,
      description: data.description,
      order_id: data.razorpay_order_id,
      prefill: data.prefill,
      theme: {
        color: '#3B82F6'
      },
      handler: async (response: any) => {
        try {
          // Send payment details to backend for verification
          const verifyResponse = await paymentApi.razorpayCallback({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verifyResponse.success) {
            setPaymentStatus('success');
            toast.success('Payment successful!');
            setTimeout(() => {
              router.push(`/orders/success?order_id=${orderId}`);
            }, 2000);
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (err: any) {
          console.error('Payment verification failed:', err);
          setPaymentStatus('failed');
          setError('Payment verification failed. Please contact support.');
        }
        setIsProcessing(false);
      },
      modal: {
        ondismiss: () => {
          setPaymentStatus('failed');
          setError('Payment cancelled by user');
          setIsProcessing(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePayUPayment = (data: any) => {
    // Create form and submit to PayU
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = data.payment_url;

    Object.keys(data.payment_data).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data.payment_data[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handlePhonePePayment = (data: any) => {
    // Redirect to PhonePe payment URL
    window.location.href = data.payment_url;
  };

  const handleCODOrder = () => {
    setPaymentStatus('success');
    toast.success('Order placed successfully!');
    setTimeout(() => {
      router.push(`/orders/success?order_id=${orderId}`);
    }, 2000);
  };

  const retryPayment = () => {
    setError(null);
    setPaymentStatus('pending');
    loadOrderAndInitiatePayment();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            {paymentStatus === 'pending' && (
              <>
                <Clock className="h-5 w-5 text-yellow-500" />
                Preparing Payment
              </>
            )}
            {paymentStatus === 'processing' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Processing Payment
              </>
            )}
            {paymentStatus === 'success' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Payment Successful
              </>
            )}
            {paymentStatus === 'failed' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Payment Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Details */}
          {order && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-medium">#{order.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">₹{order.total_amount || order.payable_amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{gateway}</span>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {paymentStatus === 'pending' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Initializing payment gateway...
              </p>
            </div>
          )}

          {paymentStatus === 'processing' && !error && (
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">
                Please complete the payment in the popup window
              </p>
              <p className="text-xs text-muted-foreground">
                Do not close this window or refresh the page
              </p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-green-600">
                Your payment has been processed successfully!
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to order confirmation...
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && error && (
            <div className="space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/checkout')}
                  className="flex-1"
                >
                  Back to Checkout
                </Button>
                <Button
                  onClick={retryPayment}
                  className="flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Retry Payment
                </Button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && !error && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}