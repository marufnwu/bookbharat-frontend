'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    if (orderId) {
      setOrderNumber(orderId);
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="py-12">
            <div className="mb-6">
              <Clock className="w-20 h-20 mx-auto text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Pending</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your payment is being processed. We'll notify you once it's confirmed.
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