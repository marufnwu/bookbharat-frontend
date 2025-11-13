'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { paymentApi, orderApi } from '@/lib/api';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-toastify';

interface PaymentStatusCheckerProps {
  orderId: number;
  paymentId?: string;
  onStatusChange?: (status: string, order?: any) => void;
  autoRefresh?: boolean;
  maxRetries?: number;
}

export function PaymentStatusChecker({
  orderId,
  paymentId,
  onStatusChange,
  autoRefresh = true,
  maxRetries = 10
}: PaymentStatusCheckerProps) {
  const [status, setStatus] = useState<string>('checking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [isRetrying, setIsRetrying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const router = useRouter();

  const checkPaymentStatus = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      setLastChecked(new Date());

      if (isRetry) {
        setIsRetrying(true);
      }

      const response = await paymentApi.getPaymentStatus(orderId);

      if (response.success) {
        const paymentStatus = response.data.status || response.data.payment_status;
        const previousStatus = status;

        setStatus(paymentStatus);
        setVerificationAttempts(prev => prev + 1);

        // Log status change for debugging
        if (previousStatus !== paymentStatus) {
          toast.info(`Payment status updated: ${paymentStatus}`);
        }

        // Fetch order details if payment is successful
        if (['success', 'completed', 'paid'].includes(paymentStatus)) {
          try {
            const orderResponse = await orderApi.getOrder(orderId);
            if (orderResponse.success) {
              setOrderDetails(orderResponse.data);

              // Store successful order in localStorage for recovery
              if (typeof window !== 'undefined') {
                localStorage.setItem(`payment_success_${orderId}`, JSON.stringify({
                  orderId,
                  status: paymentStatus,
                  timestamp: new Date().toISOString(),
                  orderData: orderResponse.data
                }));
              }
            }
          } catch (orderError) {
            console.error('Failed to fetch order details:', orderError);
          }
        }

        // Clear any existing timeout status if we get a valid response
        if (paymentStatus !== 'timeout') {
          setError(null);
        }

        onStatusChange?.(paymentStatus, response.data);

        // Stop auto-refresh for final states
        if (['success', 'completed', 'paid', 'failed', 'cancelled', 'expired'].includes(paymentStatus)) {
          setLoading(false);
          setIsRetrying(false);
          return true; // Payment resolved
        }

        // Only increment retry count if this isn't the first check
        if (verificationAttempts > 0) {
          setRetryCount(prev => prev + 1);
        }
      } else {
        const errorMessage = response.message || 'Failed to check payment status';
        setError(errorMessage);

        // Don't set status to error immediately, allow retries
        if (retryCount >= maxRetries - 1) {
          setStatus('error');
        }
      }
    } catch (err: any) {
      console.error('Payment status check error:', err);

      // Handle different error types
      let errorMessage = 'Failed to check payment status';

      if (err.response?.status === 404) {
        errorMessage = 'Order not found. Please check your order number.';
        setStatus('not_found');
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please try again.';
        setStatus('auth_error');
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED') {
        errorMessage = 'Network error. Please check your connection.';
      }

      setError(errorMessage);

      // Only set error status after multiple failed attempts
      if (retryCount >= Math.floor(maxRetries / 2)) {
        setStatus('error');
      }

      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }

    return false; // Payment not resolved
  }, [orderId, onStatusChange, status, verificationAttempts, retryCount, maxRetries]);

  // Manual retry function
  const handleManualRetry = useCallback(async () => {
    setRetryCount(0);
    setVerificationAttempts(0);
    setStatus('checking');
    setError(null);
    await checkPaymentStatus(true);
  }, [checkPaymentStatus]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(async () => {
      if (retryCount >= maxRetries) {
        setStatus('timeout');
        setError('Payment verification timed out. Please check your order status.');
        return;
      }
      
      if (!['success', 'completed', 'failed', 'cancelled', 'expired', 'timeout'].includes(status)) {
        await checkPaymentStatus();
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, checkPaymentStatus, retryCount, maxRetries, status]);

  // Initial status check
  useEffect(() => {
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'expired':
      case 'timeout':
        return <AlertTriangle className="h-12 w-12 text-orange-500" />;
      case 'pending':
      case 'processing':
      case 'checking':
      default:
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Payment Cancelled';
      case 'expired':
        return 'Payment Expired';
      case 'timeout':
        return 'Verification Timeout';
      case 'pending':
        return 'Payment Pending';
      case 'processing':
        return 'Processing Payment';
      case 'checking':
      default:
        return 'Checking Payment Status...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'Your payment has been processed successfully. Your order is confirmed!';
      case 'failed':
        return 'Your payment could not be processed. Please try again or contact support.';
      case 'cancelled':
        return 'The payment was cancelled. You can try again or choose a different payment method.';
      case 'expired':
        return 'The payment session has expired. Please initiate a new payment.';
      case 'timeout':
        return 'We\'re still verifying your payment. You can check your order status or contact support.';
      case 'pending':
        return 'Your payment is being processed. Please wait...';
      case 'processing':
        return 'We\'re processing your payment. This may take a few moments.';
      case 'checking':
      default:
        return 'Please wait while we verify your payment status...';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetryCheck = () => {
    setRetryCount(0);
    setError(null);
    checkPaymentStatus();
  };

  const handleViewOrder = () => {
    if (orderDetails) {
      router.push(`/orders/${orderDetails.order_number || orderDetails.id}`);
    } else {
      router.push('/orders');
    }
  };

  const handleRetryPayment = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Title */}
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {getStatusTitle()}
          </h1>

          {/* Status Message */}
          <p className="text-muted-foreground mb-6">
            {error || getStatusMessage()}
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="font-bold text-primary">{orderDetails.order_number}</p>
              <p className="text-sm text-muted-foreground mt-2 mb-1">Amount</p>
              <p className="font-bold text-foreground">₹{orderDetails.total_amount}</p>
            </div>
          )}

          {/* Timer */}
          {status === 'checking' || status === 'pending' || status === 'processing' ? (
            <div className="flex items-center justify-center text-sm text-muted-foreground mb-6">
              <Clock className="h-4 w-4 mr-2" />
              <span>Elapsed: {formatTime(timeElapsed)}</span>
              {retryCount > 0 && (
                <span className="ml-2">• Attempt {retryCount + 1}/{maxRetries}</span>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' || status === 'completed' ? (
              <Button onClick={handleViewOrder} className="w-full">
                View Order Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : status === 'failed' || status === 'cancelled' || status === 'expired' ? (
              <Button onClick={handleRetryPayment} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Try Payment Again
              </Button>
            ) : status === 'timeout' ? (
              <>
                <Button onClick={handleRetryCheck} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Status Again
                </Button>
                <Button onClick={handleViewOrder} className="w-full">
                  View My Orders
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : null}

            {/* Manual refresh for pending states */}
            {(status === 'checking' || status === 'pending' || status === 'processing') && (
              <Button onClick={handleRetryCheck} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            )}
          </div>

          {/* Support Link */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Having issues? {' '}
              <button 
                onClick={() => router.push('/contact')}
                className="text-primary hover:underline"
              >
                Contact Support
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}