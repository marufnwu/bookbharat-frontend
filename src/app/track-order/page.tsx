import { Metadata } from 'next';
import { TrackOrderClient } from '@/components/orders/TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Order | BookBharat',
  description: 'Track your order status and delivery information',
};

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <TrackOrderClient />
    </div>
  );
}