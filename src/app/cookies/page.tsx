import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | BookBharat',
  description: 'Information about cookies and how we use them.',
};

// Disable static generation for this page as it fetches dynamic content
export const dynamic = 'force-dynamic';

export default function CookiePage() {
  return <StaticPage slug="cookies" />;
}