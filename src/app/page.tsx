import { headers } from 'next/headers';
import HomeClient from './HomeClientDynamic';

// Server-side data fetching
async function getHeroConfig() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuration/hero-config`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
  } catch (error) {
    console.error('Failed to fetch hero config:', error);
  }
  return null;
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data.slice(0, 6) : [];
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
  return [];
}

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/featured`, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data.slice(0, 8) : [];
    }
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
  }
  return [];
}

async function getHomepageSections() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/homepage-layout/sections`, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
  } catch (error) {
    console.error('Failed to fetch homepage sections:', error);
  }
  return [];
}

// Server Component (default)
export default async function Home() {
  // Fetch all data in parallel on the server
  const [heroConfig, categories, featuredBooks, homepageSections] = await Promise.all([
    getHeroConfig(),
    getCategories(),
    getFeaturedProducts(),
    getHomepageSections(),
  ]);

  // Detect mobile from headers (optional, can also be done client-side)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /mobile/i.test(userAgent);

  return (
    <HomeClient
      heroConfig={heroConfig}
      categories={categories}
      featuredBooks={featuredBooks}
      homepageSections={homepageSections}
      isMobile={isMobile}
    />
  );
}

// Enable ISR with revalidation
export const revalidate = 1800; // Revalidate every 30 minutes
