'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdvancedProductFilters, DEFAULT_FILTERS, type FilterState } from '@/components/product/AdvancedProductFilters';
import { ProductCard } from '@/components/ui/product-card';
import { MobileProductCard } from '@/components/ui/mobile-product-card';
import { useConfig } from '@/contexts/ConfigContext';
import { productApi, categoryApi } from '@/lib/api';
import { Product, Category } from '@/types';
import {
  BookOpen,
  Grid3X3,
  List,
  Search,
  Loader2,
  SlidersHorizontal,
  X,
  TrendingUp,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load heavy components
const ProductImageGallery = dynamic(() => import('@/components/product/ProductImageGallery'), {
  loading: () => <div className="aspect-[4/5] bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
});

interface ProductStats {
  totalProducts: number;
  avgPrice: number;
  topCategories: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
  inStockCount: number;
  freeShippingCount: number;
}

// Performance optimization hooks
const useProductDataTransform = () => {
  const cacheRef = useRef(new Map());

  return useCallback((responseData: any) => {
    // Handle different API response structures
    let productsArray = [];

    if (responseData?.data?.data) {
      // Response has nested data.data structure
      productsArray = responseData.data.data;
    } else if (Array.isArray(responseData?.data)) {
      // Response has direct data array
      productsArray = responseData.data;
    } else if (Array.isArray(responseData)) {
      // Response is directly an array
      productsArray = responseData;
    } else if (responseData?.products?.data) {
      // Response has products.data structure
      productsArray = responseData.products.data;
    } else if (Array.isArray(responseData?.products)) {
      // Response has products array
      productsArray = responseData.products;
    } else {
      // No valid data found
      console.warn('Unexpected API response structure:', responseData);
      return [];
    }

    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      return [];
    }

    const cacheKey = JSON.stringify({
      total: productsArray.length,
      firstId: productsArray[0]?.id,
      lastId: productsArray[productsArray.length - 1]?.id
    });

    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    const transformed = productsArray.map((item: any) => ({
      ...item,
      images: item.images?.map((img: any) => ({
        ...img,
        url: img.image_url || img.url || img.image_path
      })) || []
    }));

    cacheRef.current.set(cacheKey, transformed);
    return transformed;
  }, []);
};

const useDebounceFilter = (delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((fn: Function) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fn();
    }, delay);
  }, []);
};

const useImageOptimization = () => {
  const cacheRef = useRef(new Map());

  return useCallback((imageUrl: string, width: number = 300, quality: number = 75) => {
    if (!imageUrl) return '';

    const cacheKey = `${imageUrl}-${width}-${quality}`;
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    let optimizedUrl = imageUrl;

    // Add CDN parameters for optimization
    if (imageUrl.includes('localhost:8000/storage')) {
      optimizedUrl += `?w=${width}&q=${quality}&f=webp`;
    }

    cacheRef.current.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }, []);
};

export default function ProductsPage() {
  const { siteConfig } = useConfig();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Performance hooks
  const transformProducts = useProductDataTransform();
  const debounceFilter = useDebounceFilter(300);
  const optimizeImage = useImageOptimization();

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [next, setNext] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track viewport for responsive adjustments
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 640);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter state with URL sync
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialFilters: FilterState = { ...DEFAULT_FILTERS };

    // Initialize from URL params
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const author = searchParams.get('author');
    const publisher = searchParams.get('publisher');
    const language = searchParams.get('language');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const freeShipping = searchParams.get('freeShipping');
    const inStock = searchParams.get('inStock');

    if (category) {
      initialFilters.categories = [category];
    }
    if (search) initialFilters.search = search;
    if (author) initialFilters.author = author;
    if (publisher) initialFilters.publisher = publisher;
    if (language) initialFilters.language = language;
    if (minPrice) initialFilters.priceRange[0] = parseInt(minPrice);
    if (maxPrice) initialFilters.priceRange[1] = parseInt(maxPrice);
    if (rating) initialFilters.minRating = parseFloat(rating);
    if (freeShipping) initialFilters.freeShipping = true;
    if (inStock) initialFilters.inStock = true;

    return initialFilters;
  });

  // Build query parameters from filters
  const buildQueryParams = useCallback((currentFilters: FilterState) => {
    const params: Record<string, any> = {
      per_page: 20
    };

    if (currentFilters.search) params.search = currentFilters.search;

    if (currentFilters.categories.length > 0) {
      params.category_id = currentFilters.categories[0];
    }

    if (currentFilters.author) params.author = currentFilters.author;
    if (currentFilters.publisher) params.publisher = currentFilters.publisher;
    if (currentFilters.language) params.language = currentFilters.language;

    if (currentFilters.priceRange[0] > 0) {
      params.min_price = currentFilters.priceRange[0];
    }
    if (currentFilters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) {
      params.max_price = currentFilters.priceRange[1];
    }

    const sortBy = currentFilters.sortBy || 'created_at';
    const sortOrder = currentFilters.sortOrder || 'desc';

    if (sortBy === 'price') {
      params.sort_by = sortOrder === 'asc' ? 'price_low_to_high' : 'price_high_to_low';
      params.sort_order = sortOrder;
    } else if (sortBy === 'discount') {
      params.sort_by = 'discount_percentage';
      params.sort_order = sortOrder;
    } else {
      params.sort_by = sortBy;
      params.sort_order = sortOrder;
    }

    return params;
  }, []);

  const applyClientFilters = useCallback((items: Product[], currentFilters: FilterState) => {
    return items.filter((product) => {
      if (currentFilters.categories.length > 0) {
        const categoryIds = currentFilters.categories.map(String);
        if (!categoryIds.includes(String(product.category_id))) {
          return false;
        }
      }

      if (currentFilters.author) {
        if (!product.author || !product.author.toLowerCase().includes(currentFilters.author.toLowerCase())) {
          return false;
        }
      }

      if (currentFilters.publisher) {
        if (!product.publisher || !product.publisher.toLowerCase().includes(currentFilters.publisher.toLowerCase())) {
          return false;
        }
      }

      if (currentFilters.language) {
        if (!product.language || product.language.toLowerCase() !== currentFilters.language.toLowerCase()) {
          return false;
        }
      }

      if (currentFilters.priceRange[0] > 0 && product.price < currentFilters.priceRange[0]) {
        return false;
      }

      if (currentFilters.priceRange[1] < DEFAULT_FILTERS.priceRange[1] && product.price > currentFilters.priceRange[1]) {
        return false;
      }

      if (currentFilters.minRating > 0) {
        const ratingValue = product.rating || product.average_rating;
        if (!ratingValue || ratingValue < currentFilters.minRating) {
          return false;
        }
      }

      if (currentFilters.inStock) {
        const inStock = product.in_stock ?? product.stock_quantity > 0;
        if (!inStock) {
          return false;
        }
      }

      if (currentFilters.freeShipping) {
        const hasFreeShipping = Boolean(
          product.free_shipping_enabled ||
          product.metadata?.free_shipping ||
          product.attributes?.free_shipping
        );
        if (!hasFreeShipping) {
          return false;
        }
      }

      return true;
    });
  }, []);

  // Load products with infinite scroll
  const loadProducts = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const queryParams = buildQueryParams(filters);

      if (isLoadMore && next) {
        try {
          const nextUrl = new URL(next);
          const nextPage = nextUrl.searchParams.get('page');
          if (nextPage) {
            queryParams.page = nextPage;
          }
        } catch (error) {
          console.warn('Failed to parse next page URL:', error);
        }
      }

      const response = await productApi.getProducts(queryParams);
      const transformedProducts = transformProducts(response.data);

      const filteredProducts = applyClientFilters(transformedProducts, filters);

      if (isLoadMore) {
        setProducts(prev => [...prev, ...filteredProducts]);
      } else {
        setProducts(filteredProducts);
      }

      setHasMore(response.data.next_page_url !== null);
      setNext(response.data.next_page_url);

      // Update stats
      if (response.data.stats && !isLoadMore) {
        setStats(response.data.stats);
      }

    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, next, buildQueryParams, transformProducts, applyClientFilters]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Filter change handler with debouncing
  const handleFiltersChange = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL params for browser history
    const urlParams = new URLSearchParams();
    if (updatedFilters.search) urlParams.set('search', updatedFilters.search);
    if (updatedFilters.categories.length > 0) urlParams.set('category', updatedFilters.categories[0]);
    if (updatedFilters.author) urlParams.set('author', updatedFilters.author);
    if (updatedFilters.publisher) urlParams.set('publisher', updatedFilters.publisher);
    if (updatedFilters.language) urlParams.set('language', updatedFilters.language);
    if (updatedFilters.priceRange[0] > 0) urlParams.set('minPrice', updatedFilters.priceRange[0].toString());
    if (updatedFilters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) urlParams.set('maxPrice', updatedFilters.priceRange[1].toString());
    if (updatedFilters.minRating > 0) urlParams.set('rating', updatedFilters.minRating.toString());
    if (updatedFilters.freeShipping) urlParams.set('freeShipping', '1');
    if (updatedFilters.inStock) urlParams.set('inStock', '1');

    const newUrl = urlParams.toString() ? `/products?${urlParams.toString()}` : '/products';
    router.replace(newUrl, { scroll: false });

    // Reset pagination and reload
    setNext(null);
    debounceFilter(() => {
      loadProducts(false);
    });
  }, [filters, router, loadProducts, debounceFilter]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setNext(null);
    router.replace('/products', { scroll: false });
    loadProducts(false);
  }, [loadProducts, router]);

  // Load more products for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadProducts(true);
    }
  }, [hasMore, loadingMore, loadProducts]);

  // Initial data load
  useEffect(() => {
    loadProducts(false);
    loadCategories();
  }, []); // Only run once on mount

  // Memoized values
  const currencySymbol = siteConfig?.currency?.currency_symbol || '₹';

  const filterOptions = useMemo(() => ({
    categories: categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      product_count: cat.product_count || 0
    })),
    authors: stats?.topAuthors?.map(author => ({
      name: author.name,
      product_count: author.count
    })) || [],
    publishers: [], // Would come from API
    languages: [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'bn', name: 'Bengali' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
      { code: 'mr', name: 'Marathi' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'pa', name: 'Punjabi' }
    ],
    tags: [], // Would come from API
    maxPrice: stats?.priceRange?.max || 5000
  }), [categories, stats]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.author) count++;
    if (filters.publisher) count++;
    if (filters.language) count++;
    if (filters.tags.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) count++;
    if (filters.minRating > 0) count++;
    if (filters.inStock || filters.freeShipping) count++;
    return count;
  }, [filters]);

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => loadProducts(false)}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Catalog</h1>
              {stats && (
                <p className="text-gray-600 mt-1">
                  {stats.totalProducts.toLocaleString()} products found
                  {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <div className="hidden sm:flex items-center bg-gray-50 rounded-lg border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Integrated Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by name, author, category..."
              value={filters.search}
              onChange={(e) => {
                const newSearch = e.target.value;
                handleFiltersChange({ search: newSearch });
              }}
              className={cn(
                'pl-10 pr-10 rounded-xl bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40',
                isMobile ? 'py-3 text-sm' : 'py-6 text-base'
              )}
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFiltersChange({ search: '' })}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Category Quick Filters */}
          {categories.length > 0 && (
            <div className={cn(
              'flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide',
              isMobile ? '-mx-4 px-4' : ''
            )}>
              <Button
                variant={filters.categories.length === 0 ? 'default' : 'outline'}
                size={isMobile ? 'sm' : 'default'}
                onClick={() => handleFiltersChange({ categories: [] })}
                className={cn(
                  'whitespace-nowrap transition-all',
                  isMobile ? 'px-3 py-2 text-xs h-auto rounded-full' : ''
                )}
              >
                All Products
              </Button>
              {categories.slice(0, 10).map((category) => (
                <Button
                  key={category.id}
                  variant={filters.categories.includes(category.id.toString()) ? 'default' : 'outline'}
                  size={isMobile ? 'sm' : 'default'}
                  onClick={() => {
                    const isSelected = filters.categories.includes(category.id.toString());
                    const newCategories = isSelected
                      ? filters.categories.filter(c => c !== category.id.toString())
                      : [category.id.toString()];
                    handleFiltersChange({ categories: newCategories });
                  }}
                  className={cn(
                    'whitespace-nowrap transition-all',
                    isMobile ? 'px-3 py-2 text-xs h-auto rounded-full' : ''
                  )}
                >
                  {category.name}
                  {category.product_count && (
                    <Badge variant="secondary" className={cn(
                      'ml-2 h-5 px-1.5 text-xs',
                      isMobile ? 'hidden' : ''
                    )}>
                      {category.product_count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className={cn(
            'mt-6 grid gap-4',
            isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
          )}>
            <div className="bg-blue-50 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className={cn('font-semibold text-blue-600', isMobile ? 'text-base' : 'text-lg')}>
                {stats.totalProducts.toLocaleString()}
              </div>
              <div className="text-[11px] sm:text-xs text-blue-800">Total Products</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className={cn('font-semibold text-green-600', isMobile ? 'text-base' : 'text-lg')}>
                {stats.inStockCount.toLocaleString()}
              </div>
              <div className="text-[11px] sm:text-xs text-green-800">In Stock</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className={cn('font-semibold text-purple-600', isMobile ? 'text-base' : 'text-lg')}>
                {stats.freeShippingCount.toLocaleString()}
              </div>
              <div className="text-[11px] sm:text-xs text-purple-800">Free Shipping</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className={cn('font-semibold text-orange-600', isMobile ? 'text-base' : 'text-lg')}>
                {currencySymbol}{Math.round(stats.avgPrice)}
              </div>
              <div className="text-[11px] sm:text-xs text-orange-800">Avg Price</div>
            </div>
            {!isMobile && (
              <>
                <div className="bg-red-50 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                  <div className="text-lg font-semibold text-red-600">
                    {currencySymbol}{stats.priceRange.min}
                  </div>
                  <div className="text-xs text-red-800">Min Price</div>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                  <div className="text-lg font-semibold text-indigo-600">
                    {currencySymbol}{stats.priceRange.max}
                  </div>
                  <div className="text-xs text-indigo-800">Max Price</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <AdvancedProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            {...filterOptions}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="fixed inset-y-0 left-0 w-full sm:max-w-xs bg-white shadow-xl">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                  <AdvancedProductFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                    {...filterOptions}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className={cn(
            "min-h-[600px]",
            viewMode === 'grid' ? "" : "space-y-4"
          )}>
            {products.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="min-h-[600px]">
                <div
                  className={cn(
                    'grid gap-4 md:gap-6',
                    isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  )}
                >
                  {products.map((product) =>
                    isMobile ? (
                      <MobileProductCard
                        key={product.id}
                        product={product}
                        variant="grid"
                        className="h-full"
                      />
                    ) : (
                      <ProductCard
                        key={product.id}
                        product={product}
                        variant="default"
                        showCategory={true}
                        showAuthor={true}
                        showRating={true}
                        showDiscount={true}
                        showWishlist={true}
                        showQuickView={true}
                        showAddToCart={true}
                        showBuyNow={false}
                      />
                    )
                  )}
                </div>
                {hasMore && (
                  <div className="flex justify-center py-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className={cn(isMobile ? 'w-full h-12 text-base' : 'px-6')}
                    >
                      {loadingMore ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-2" />
                      )}
                      Load More Products
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) =>
                  isMobile ? (
                    <MobileProductCard
                      key={product.id}
                      product={product}
                      variant="list"
                      className="w-full"
                    />
                  ) : (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="large"
                      className="w-full"
                      showCategory={true}
                      showAuthor={true}
                      showRating={true}
                      showDiscount={true}
                      showWishlist={true}
                      showQuickView={true}
                      showAddToCart={true}
                      showBuyNow={false}
                    />
                  )
                )}

                {hasMore && (
                  <div className="flex justify-center py-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className={cn(isMobile ? 'w-full h-12 text-base' : 'px-6')}
                    >
                      {loadingMore ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-2" />
                      )}
                      Load More Products
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}