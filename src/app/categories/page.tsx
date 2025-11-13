'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Categories Page - Redirects to Unified Product Catalog
 * 
 * This page now redirects to /products where users can:
 * - View all products
 * - Filter by categories using quick filter chips
 * - Use advanced category filters in the sidebar
 * - Search and browse the entire catalog in one place
 */
export default function CategoriesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified products page
    // Users can access category filters there
    router.replace('/products');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium">Redirecting to Product Catalog...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Browse all products and filter by categories
        </p>
      </div>
    </div>
  );
}
