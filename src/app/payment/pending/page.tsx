'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { paymentApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart';

// Disable static generation for this page as it requires query parameters
export const dynamic = 'force-dynamic';

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [isPolling, setIsPolling] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only access useCartStore on the client
  const clearCart = mounted ? useCartStore.getState().clearCart : () => {};

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const statusParam = searchParams.get('status');

    if (orderId) {
      setOrderNumber(orderId);
    }

    if (statusParam) {
      setStatus(statusParam);
    }

    // Start polling for payment confirmation if status is processing
    if (statusParam === 'processing' && orderId) {
      setIsPolling(true);

      const pollPaymentStatus = async () => {
        try {
          const response = await paymentApi.getPaymentStatus(orderId);

          if (response.success && response.payment_status === 'paid') {
            // Payment confirmed by webhook, clear cart and redirect to success
            clearCart();
            router.push(`/payment/success?order_id=${orderId}`);
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      };

      // Poll every 2 seconds for up to 30 seconds
      const pollInterval = setInterval(pollPaymentStatus, 2000);
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        setIsPolling(false);
      }, 30000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [searchParams, router, clearCart]);

  const isProcessing = status === 'processing';

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="mb-6">
              {isProcessing ? (
                <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
              ) : (
                <Clock className="w-20 h-20 mx-auto text-yellow-500" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {isProcessing ? 'Payment Successful!' : 'Payment Pending'}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {isProcessing
                ? 'Your payment was successful! We are processing your order...'
                : "Your payment is being processed. We'll notify you once it's confirmed."}
            </p>
            {isPolling && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming your order...</span>
              </div>
            )}
            {orderNumber && (
              <p className="text-sm text-muted-foreground mb-8">
                Order Number: <span className="font-semibold">{orderNumber}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href={orderNumber ? `/orders/${orderNumber}` : '/orders'}>
                  View Order Details
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}