'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductImageGallery } from '@/components/product/ProductImageGallery';
import { ProductInfoCompact } from '@/components/product/ProductInfoCompact';
import { ProductDetailsTabs } from '@/components/product/ProductDetailsTabs';
import { ProductBreadcrumb } from '@/components/ui/ProductBreadcrumb';
import FrequentlyBoughtTogether from '@/components/product/FrequentlyBoughtTogether';
import RelatedProducts from '@/components/product/RelatedProducts';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import { BookOpen, Loader2 } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productId = params.id as string;
        const response = await productApi.getProduct(productId);

        if (response.success) {
          setProduct(response.data.product);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  // Loading State - Compact
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Skeleton - Compact */}
        <div className="border-b bg-muted/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Content Skeleton - Compact */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Image Gallery Skeleton */}
            <div className="space-y-3">
              <div className="bg-gray-200 rounded-lg aspect-square animate-pulse" />
              <div className="grid grid-cols-5 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-md aspect-square animate-pulse" />
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-6 md:h-7 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-28 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-40 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State - Compact
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb - Compact */}
      <div className="border-b bg-muted/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <ProductBreadcrumb product={product} />
        </div>
      </div>

      {/* Main Product Content - Compact & Mobile-Friendly */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Left: Image Gallery - Sticky on desktop */}
          <div className="md:sticky md:top-4 md:self-start">
            <ProductImageGallery
              images={product.images || []}
              productName={product.name}
            />
          </div>

          {/* Right: Product Information */}
          <div className="space-y-4 md:space-y-6">
            <ProductInfoCompact product={product} />
          </div>
        </div>

        {/* Product Details Tabs - Compact spacing */}
        <div className="mt-8 md:mt-12">
          <ProductDetailsTabs product={product} />
        </div>

        {/* Frequently Bought Together - Compact spacing */}
        {product.in_stock && (
          <div className="mt-8 md:mt-12">
            <FrequentlyBoughtTogether
              productId={params.id as string}
              mainProduct={product}
            />
          </div>
        )}

        {/* Related Products - Compact spacing */}
        <div className="mt-8 md:mt-12">
          <RelatedProducts
            productId={params.id as string}
            categoryId={product.category?.id}
          />
        </div>
      </div>

      {/* Mobile Action Bar - Fixed at bottom on mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-3 z-40 shadow-lg">
        <div className="flex gap-2">
          <button
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!product.in_stock}
            onClick={() => {
              const event = new CustomEvent('addToCart', { detail: { product, quantity: 1 } });
              window.dispatchEvent(event);
            }}
          >
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button
            className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!product.in_stock}
            onClick={() => {
              const event = new CustomEvent('buyNow', { detail: { product, quantity: 1 } });
              window.dispatchEvent(event);
            }}
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Add bottom padding on mobile for fixed action bar */}
      <div className="md:hidden h-16" />
    </div>
  );
}
