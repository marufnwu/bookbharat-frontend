import { CartRecovery } from '@/components/cart/CartRecovery';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart Recovery | BookBharat Admin',
  description: 'Manage and recover abandoned shopping carts',
};

export default function CartRecoveryPage() {
  return (
    <div className="container mx-auto p-6">
      <CartRecovery />
    </div>
  );
}