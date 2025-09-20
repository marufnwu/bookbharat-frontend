import { FooterClient } from './FooterClient';
import { configApi } from '@/lib/api';

// Server Component - Fetches data at request time
async function getFooterData() {
  try {
    // Fetch navigation config for footer menu
    const navigationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/config/navigation`,
      {
        cache: 'no-store', // For ISR, use: cache: 'force-cache', next: { revalidate: 3600 }
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    // Fetch site config for contact info and social links
    const siteConfigResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/config/site`,
      {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!navigationResponse.ok || !siteConfigResponse.ok) {
      throw new Error('Failed to fetch footer data');
    }

    const navigation = await navigationResponse.json();
    const siteConfig = await siteConfigResponse.json();

    return {
      footerMenu: navigation.data?.footer_menu || [],
      headerMenu: navigation.data?.header_menu || [],
      siteInfo: siteConfig.data?.site || {},
      social: siteConfig.data?.social || {},
      shipping: siteConfig.data?.shipping || {},
      payment: siteConfig.data?.payment || {}
    };
  } catch (error) {
    console.error('Error fetching footer data:', error);
    // Return default data on error
    return {
      footerMenu: [],
      headerMenu: [],
      siteInfo: {
        name: 'BookBharat',
        contact_email: 'support@bookbharat.com',
        contact_phone: '+91 9876543210',
        address: {
          line1: 'BookBharat HQ',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        }
      },
      social: {},
      shipping: {},
      payment: {
        free_shipping_threshold: 499
      }
    };
  }
}

export default async function FooterServer() {
  const footerData = await getFooterData();

  return <FooterClient {...footerData} />;
}