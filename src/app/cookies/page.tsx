import { Metadata } from 'next';
import { StaticPage } from '@/components/StaticPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | BookBharat',
  description: 'Information about cookies and how we use them.',
};

export default function CookiePage() {
  return <StaticPage slug="cookies" />;
}