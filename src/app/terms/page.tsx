import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Terms of Service | BookBharat',
  description: 'Terms and conditions for using BookBharat services.',
};

export default function TermsPage() {
  return <StaticPage slug="terms" />;
}