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
import { useConfig } from '@/contexts/ConfigContext';
import {
  BookOpen,
  Loader2,
  ShoppingCart,
  Zap,
  Shield,
  Truck,
  RotateCcw,
  TrendingUp
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { siteConfig } = useConfig();
  const freeShippingEnabled = siteConfig?.payment?.free_shipping_enabled !== false;
  const freeShippingThreshold = (siteConfig?.payment?.free_shipping_threshold || 0) > 0;

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Enhanced Hero Section with Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ProductBreadcrumb product={product} />
        </div>
      </div>

      {/* Main Product Content with Enhanced Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Desktop: 2-Column Layout | Mobile: Single Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Column - Image Gallery */}
          <div className="space-y-6">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl overflow-hidden bg-white shadow border border-gray-200">
                <ProductImageGallery
                  images={product.images || []}
                  productName={product.name}
                />
              </div>
            </div>            
          </div>

          {/* Right Column - Product Information */}
          <div className="space-y-8">
            {/* Product Info with Enhanced Card Design */}
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
              <ProductInfoCompact product={product} />
            </div>


            {/* Trust Indicators */}
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Why Buy From BookBharat?
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Fast Delivery</div>
                    <div className="text-sm text-gray-600">2-3 business days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Authentic Books</div>
                    <div className="text-sm text-gray-600">100% genuine</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Easy Returns</div>
                    <div className="text-sm text-gray-600">7-day policy</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Best Prices</div>
                    <div className="text-sm text-gray-600">Value for money</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section with Enhanced Tabs */}
        <div className="mt-12">
          <ProductDetailsTabs product={product} />
        </div>

        {/* Cross-sell Section */}
        <div className="mt-12 space-y-8">
          {/* Frequently Bought Together */}
          {product.in_stock && (
            <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Frequently Bought Together</h2>
                <p className="text-sm text-gray-600 mt-1">Complete your collection with these popular items</p>
              </div>
              <div className="p-6">
                <FrequentlyBoughtTogether
                  productId={params.id as string}
                  mainProduct={product}
                />
              </div>
            </div>
          )}

          {/* Related Products */}
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">You May Also Like</h2>
              <p className="text-sm text-gray-600 mt-1">Discover similar books and authors</p>
            </div>
            <div className="p-6">
              <RelatedProducts
                productId={params.id as string}
                categoryId={product.category?.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Action Bar with Bounce Animation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-gray-50/95 backdrop-blur-sm border-t-2 border-gray-200 shadow-md z-[60]">
        <div className="flex gap-3 w-full p-4">
          <button
            className="flex-1 px-4 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl font-bold hover:from-primary/95 hover:to-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={!product.in_stock}
            onClick={() => {
              const event = new CustomEvent('addToCart', { detail: { product, quantity: 1 } });
              window.dispatchEvent(event);
            }}
          >
            <span className="tracking-wide">{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
          <button
            className="flex-1 px-4 py-4 bg-gradient-to-r from-orange-500 via-orange-500 to-red-500 text-white rounded-2xl font-bold hover:from-orange-600 hover:via-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            disabled={!product.in_stock}
            onClick={() => {
              const event = new CustomEvent('buyNow', { detail: { product, quantity: 1 } });
              window.dispatchEvent(event);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="tracking-wide drop-shadow-sm">Buy Now</span>
          </button>
        </div>
        {/* Trust Indicators Mini Bar */}
        <div className="flex justify-center gap-4 pb-2 px-4">
          {freeShippingEnabled && freeShippingThreshold && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Truck className="h-3 w-3" />
              <span>Free Delivery</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Shield className="h-3 w-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <RotateCcw className="h-3 w-3" />
            <span>Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
