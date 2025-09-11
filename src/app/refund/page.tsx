import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Refund Policy | BookBharat',
  description: 'Our refund and return policy details.',
};

export default function RefundPage() {
  return <StaticPage slug="refund" />;
}