'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Search Page - Redirects to Unified Product Catalog
 * 
 * This page now redirects to /products with search parameters where users can:
 * - Search products directly on the page
 * - Apply filters while searching
 * - Browse search results with full catalog capabilities
 */
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('q') || searchParams.get('query');
    
    if (query) {
      // Redirect to unified products page with search parameter
      router.replace(`/products?search=${encodeURIComponent(query)}`);
    } else {
      // No search query, just go to products page
      router.replace('/products');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium">Redirecting to Product Catalog...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Search and filter products in one place
        </p>
      </div>
    </div>
  );
}
