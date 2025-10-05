import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Terms of Service | BookBharat',
  description: 'Terms and conditions for using BookBharat services.',
};

// Disable static generation for this page as it fetches dynamic content
export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return <StaticPage slug="terms" />;
}