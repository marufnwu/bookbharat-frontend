'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

// Disable static generation for this page as it requires query parameters
export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Only access useCartStore on the client
  const clearCart = mounted ? useCartStore.getState().clearCart : () => {};

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const orderId = searchParams.get('order_id');
    if (orderId) {
      setOrderNumber(orderId);
      // Clear cart on successful payment
      try {
        clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  }, [searchParams, clearCart, mounted]);

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
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Thank you for your order. Your payment has been processed successfully.
            </p>
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

export default function PaymentSuccessPage() {
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
      <PaymentSuccessContent />
    </Suspense>
  );
}