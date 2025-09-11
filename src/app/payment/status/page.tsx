'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentStatusChecker } from '@/components/PaymentStatusChecker';
import { Loader2 } from 'lucide-react';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Request</h1>
          <p className="text-muted-foreground">
            Order ID is required to check payment status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PaymentStatusChecker
      orderId={parseInt(orderId)}
      paymentId={paymentId || undefined}
      onStatusChange={(status, data) => {
        console.log('Payment status changed:', status, data);
      }}
      autoRefresh={true}
      maxRetries={20} // Check for up to 1 minute
    />
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}