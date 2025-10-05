import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Refund Policy | BookBharat',
  description: 'Our refund and return policy details.',
};

// Disable static generation for this page as it fetches dynamic content
export const dynamic = 'force-dynamic';

export default function RefundPage() {
  return <StaticPage slug="refund" />;
}