import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Shipping Policy | BookBharat',
  description: 'Information about shipping and delivery.',
};

// Disable static generation for this page as it fetches dynamic content
export const dynamic = 'force-dynamic';

export default function ShippingPage() {
  return <StaticPage slug="shipping" />;
}