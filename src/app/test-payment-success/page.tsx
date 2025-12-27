'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function TestPaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('order');
  const paymentId = searchParams.get('payment');

  useEffect(() => {
    // In a real implementation, this would verify the payment on the backend
    console.log('Test payment success:', { orderNumber, paymentId });
  }, [orderNumber, paymentId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              Test Payment Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                This is a test payment page for development purposes.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Order Number:</strong> {orderNumber || 'N/A'}</p>
                <p><strong>Payment ID:</strong> {paymentId || 'N/A'}</p>
              </div>
              <p className="text-sm text-amber-600 mt-4">
                Note: This is a test transaction. No actual payment was processed.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => router.push(`/orders/${orderNumber}`)}
                disabled={!orderNumber}
              >
                View Order Details
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}