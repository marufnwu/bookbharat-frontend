import { FooterClient } from './FooterClient';

// Server Component - Fetches data at request time
async function getFooterData() {
  try {
    // Fetch navigation config for footer menu
    const navigationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/configuration/navigation-config`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    // Fetch site config for contact info and social links
    const siteConfigResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/configuration/site-config`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
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

    // Extract footer configuration
    const footerConfig = navigation.data?.footer || {};
    const siteInfo = siteConfig.data || {};

    return {
      footerMenu: footerConfig.menu || [
        {
          title: 'Shop',
          links: [
            { label: 'All Books', href: '/products' },
            { label: 'New Arrivals', href: '/products?sort=newest' },
            { label: 'Bestsellers', href: '/products?sort=bestselling' },
            { label: 'Categories', href: '/categories' },
          ]
        },
        {
          title: 'Customer Service',
          links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'Track Order', href: '/orders' },
            { label: 'Returns & Refunds', href: '/returns' },
            { label: 'Shipping Info', href: '/shipping' },
          ]
        },
        {
          title: 'About',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press', href: '/press' },
            { label: 'Blog', href: '/blog' },
          ]
        },
        {
          title: 'Legal',
          links: [
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Cookie Policy', href: '/cookies' },
            { label: 'Sitemap', href: '/sitemap' },
          ]
        }
      ],
      siteInfo: {
        name: siteInfo.site_name || 'BookBharat',
        tagline: siteInfo.tagline || 'Your Knowledge Partner',
        description: siteInfo.description || 'India\'s leading online bookstore with over 500,000 titles. Fast delivery, secure payment, and best prices guaranteed.',
        phone: siteInfo.contact?.phone || '+91 12345 67890',
        email: siteInfo.contact?.email || 'support@bookbharat.com',
        address: siteInfo.contact?.address || {
          line1: 'Level 5, Tower A',
          line2: 'Business Park, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          country: 'India'
        }
      },
      social: siteInfo.social || {
        facebook: 'https://facebook.com/bookbharat',
        twitter: 'https://twitter.com/bookbharat',
        instagram: 'https://instagram.com/bookbharat',
        linkedin: 'https://linkedin.com/company/bookbharat',
        youtube: 'https://youtube.com/bookbharat'
      },
      shipping: siteInfo.shipping || {
        freeShippingThreshold: 500,
        estimatedDays: '3-5 business days'
      },
      payment: siteInfo.payment || {
        acceptedMethods: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery']
      }
    };
  } catch (error) {
    console.error('Error fetching footer data:', error);
    // Return default data on error
    return {
      footerMenu: [
        {
          title: 'Shop',
          links: [
            { label: 'All Books', href: '/products' },
            { label: 'New Arrivals', href: '/products?sort=newest' },
            { label: 'Bestsellers', href: '/products?sort=bestselling' },
            { label: 'Categories', href: '/categories' },
          ]
        },
        {
          title: 'Customer Service',
          links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'Track Order', href: '/orders' },
            { label: 'Returns & Refunds', href: '/returns' },
            { label: 'Shipping Info', href: '/shipping' },
          ]
        },
        {
          title: 'About',
          links: [
            { label: 'About Us', href: '/about' },
            { label: 'Careers', href: '/careers' },
            { label: 'Press', href: '/press' },
            { label: 'Blog', href: '/blog' },
          ]
        },
        {
          title: 'Legal',
          links: [
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Cookie Policy', href: '/cookies' },
            { label: 'Sitemap', href: '/sitemap' },
          ]
        }
      ],
      siteInfo: {
        name: 'BookBharat',
        tagline: 'Your Knowledge Partner',
        description: 'India\'s leading online bookstore with over 500,000 titles. Fast delivery, secure payment, and best prices guaranteed.',
        phone: '+91 12345 67890',
        email: 'support@bookbharat.com',
        address: {
          line1: 'Level 5, Tower A',
          line2: 'Business Park, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          country: 'India'
        }
      },
      social: {
        facebook: 'https://facebook.com/bookbharat',
        twitter: 'https://twitter.com/bookbharat',
        instagram: 'https://instagram.com/bookbharat',
        linkedin: 'https://linkedin.com/company/bookbharat',
        youtube: 'https://youtube.com/bookbharat'
      },
      shipping: {
        freeShippingThreshold: 500,
        estimatedDays: '3-5 business days'
      },
      payment: {
        acceptedMethods: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery']
      }
    };
  }
}

export default async function FooterServer() {
  const footerData = await getFooterData();

  // Pass fetched data to client component
  return <FooterClient {...footerData} />;
}