import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Shipping Policy | BookBharat',
  description: 'Information about shipping and delivery.',
};

export default function ShippingPage() {
  return <StaticPage slug="shipping" />;
}