import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | BookBharat',
  description: 'Learn about our privacy policy and data protection practices.',
};

// Disable static generation for this page as it fetches dynamic content
export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return <StaticPage slug="privacy" />;
}