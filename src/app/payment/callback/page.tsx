'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Disable static generation for this page as it requires query parameters
export const dynamic = 'force-dynamic';

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle callback from payment gateway
    const handleCallback = async () => {
      try {
        // Get all query parameters
        const params = Object.fromEntries(searchParams.entries());
        logger.log('Payment callback params:', params);

        // Check for success indicators from different gateways
        const isSuccess =
          params.status === 'success' ||
          params.code === 'PAYMENT_SUCCESS' ||
          params.razorpay_payment_id;

        if (isSuccess) {
          setStatus('success');
          toast.success('Payment completed successfully!');

          // Redirect to order success page
          setTimeout(() => {
            const orderId = params.order_id || params.udf1 || params.transactionId;
            if (orderId) {
              router.push(`/orders/success?order_id=${orderId}`);
            } else {
              router.push('/orders');
            }
          }, 2000);
        } else {
          setStatus('failed');
          toast.error('Payment failed or cancelled');

          // Redirect to checkout
          setTimeout(() => {
            router.push('/checkout');
          }, 3000);
        }
      } catch (err) {
        console.error('Payment callback error:', err);
        setStatus('failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'processing' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Processing Payment
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Payment Successful
              </>
            )}
            {status === 'failed' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Payment Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'processing' && (
            <p className="text-muted-foreground">
              Verifying your payment...
            </p>
          )}
          {status === 'success' && (
            <p className="text-muted-foreground">
              Redirecting to order confirmation...
            </p>
          )}
          {status === 'failed' && (
            <p className="text-muted-foreground">
              Redirecting back to checkout...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}