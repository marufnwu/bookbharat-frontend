import { headers } from 'next/headers';
import HomeClient from './HomeClientDynamic';

// Simple fallback component for when API is not available
function SimpleHome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">BookBharat</h1>
          <p className="text-lg text-muted-foreground mb-8">Your premier destination for books</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Featured Books</h3>
              <p className="text-muted-foreground">Discover our handpicked collection</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Categories</h3>
              <p className="text-muted-foreground">Browse by genre and topic</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">New Arrivals</h3>
              <p className="text-muted-foreground">Latest additions to our catalog</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side data fetching
async function getHeroConfig() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/hero/active`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : null;
    }
  } catch (error) {
    console.error('Failed to fetch hero config:', error);
    // Return null instead of throwing to prevent 500 errors
  }
  return null;
}

async function getCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (res.ok) {
      const data = await res.json();
      const categories = data.success ? data.data : [];
      // Increased limit from 6 to show more categories
      return categories.slice(0, 12);
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Return empty array instead of throwing to prevent 500 errors
  }
  return [];
}

async function getFeaturedProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/products/featured`, {
      next: { revalidate: 7200 } // Cache for 2 hours
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data.slice(0, 8) : [];
    }
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    // Return empty array instead of throwing to prevent 500 errors
  }
  return [];
}

async function getCategoriesWithProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/products/by-categories?limit=6&products_per_category=20`, {
      next: { revalidate: 7200 } // Cache for 2 hours
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
  } catch (error) {
    console.error('Failed to fetch categories with products:', error);
    // Return empty array instead of throwing to prevent 500 errors
  }
  return [];
}

async function getHomepageSections() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/homepage-layout/sections`, {
      next: { revalidate: 7200 } // Cache for 2 hours
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.data : [];
    }
  } catch (error) {
    console.error('Failed to fetch homepage sections:', error);
    // Return empty array instead of throwing to prevent 500 errors
  }
  return [];
}

// Server Component (default)
export default async function Home() {
  try {
    // Fetch all data in parallel on the server
    const [heroConfig, categories, featuredBooks, homepageSections, categoriesWithProducts] = await Promise.all([
      getHeroConfig(),
      getCategories(),
      getFeaturedProducts(),
      getHomepageSections(),
      getCategoriesWithProducts(),
    ]);

    // Check if we have any data - if not, use fallback
    const hasData = heroConfig || (categories && categories.length > 0) ||
                   (featuredBooks && featuredBooks.length > 0) ||
                   (homepageSections && homepageSections.length > 0);

    if (!hasData) {
      return SimpleHome();
    }

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
        categoriesWithProducts={categoriesWithProducts}
        isMobile={isMobile}
      />
    );
  } catch (error) {
    console.error('Error loading homepage data:', error);
    // Fallback to simple home if there's any error
    return SimpleHome();
  }
}

// Enable ISR with revalidation
export const revalidate = 3600; // Revalidate every hour
