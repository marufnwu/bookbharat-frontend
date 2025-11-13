'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VirtualProductGrid } from '@/components/product/VirtualProductGrid';
import { AdvancedProductFilters, DEFAULT_FILTERS, type FilterState } from '@/components/product/AdvancedProductFilters';
import { ProductCard } from '@/components/ui/product-card';
import { CategorySchema } from '@/components/seo/CategorySchema';
import { useConfig } from '@/contexts/ConfigContext';
import { categoryApi, productApi } from '@/lib/api';
import { Category, Product } from '@/types';
import {
  BookOpen,
  Grid3X3,
  List,
  Loader2,
  SlidersHorizontal,
  X,
  ChevronRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductStats {
  totalProducts: number;
  avgPrice: number;
  topCategories: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
  inStockCount: number;
  freeShippingCount: number;
}

// Performance optimization hooks (reusing from unified products page)
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

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const { siteConfig } = useConfig();

  // Performance hooks
  const transformProducts = useProductDataTransform();
  const debounceFilter = useDebounceFilter(300);

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [next, setNext] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state with URL sync
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialFilters: FilterState = { ...DEFAULT_FILTERS };

    // Initialize with current category
    initialFilters.categories = [categoryId];

    // Initialize from URL params
    const author = new URLSearchParams(window.location.search).get('author');
    const publisher = new URLSearchParams(window.location.search).get('publisher');
    const language = new URLSearchParams(window.location.search).get('language');
    const minPrice = new URLSearchParams(window.location.search).get('minPrice');
    const maxPrice = new URLSearchParams(window.location.search).get('maxPrice');
    const rating = new URLSearchParams(window.location.search).get('rating');
    const freeShipping = new URLSearchParams(window.location.search).get('freeShipping');
    const inStock = new URLSearchParams(window.location.search).get('inStock');

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
    const params: any = {
      category_id: currentFilters.categories.join(','),
      limit: '20'
    };

    if (currentFilters.author) params.author = currentFilters.author;
    if (currentFilters.publisher) params.publisher = currentFilters.publisher;
    if (currentFilters.language) params.language = currentFilters.language;
    if (currentFilters.tags.length > 0) {
      params.tags = currentFilters.tags.join(',');
    }
    if (currentFilters.priceRange[0] > 0) {
      params.price_min = currentFilters.priceRange[0].toString();
    }
    if (currentFilters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) {
      params.price_max = currentFilters.priceRange[1].toString();
    }
    if (currentFilters.minRating > 0) {
      params.rating = currentFilters.minRating.toString();
    }
    if (currentFilters.freeShipping) params.free_shipping = '1';
    if (currentFilters.inStock) params.in_stock = '1';

    // Handle category-specific sorting
    if (currentFilters.sortBy === 'popularity') params.sort = '-popularity';
    else if (currentFilters.sortBy === 'discount') params.sort = '-discount';
    else if (currentFilters.sortBy !== 'created_at') params.sort = currentFilters.sortBy;

    params.order = currentFilters.sortOrder;

    return params;
  }, []);

  // Load category data
  const loadCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoryApi.getCategory(categoryId);

      if (response.success) {
        setCategory(response.data);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Failed to load category:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

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
      const url = next ? `/products?${next.split('?')[1]}` : `/products?${queryParams}`;

      const response = await productApi.getProducts(url);
      const transformedProducts = transformProducts(response);

      if (isLoadMore) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
      }

      setHasMore(response.data?.next_page_url !== null);
      setNext(response.data?.next_page_url);

      // Update stats
      if (response.data?.stats && !isLoadMore) {
        setStats({
          totalProducts: response.data.meta?.total || products.length,
          avgPrice: 0, // Would come from API
          topCategories: [],
          priceRange: { min: 0, max: 5000 },
          inStockCount: 0,
          freeShippingCount: 0
        });
      }

    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
      setProducts([]);
      setStats(null);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [categoryId, filters, next, buildQueryParams, transformProducts]);

  // Load all categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getCategories();
      setAllCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Filter change handler with debouncing
  const handleFiltersChange = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    // Ensure the current category is always selected
    updatedFilters.categories = [categoryId];
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    params.set('category', categoryId);
    if (updatedFilters.author) params.set('author', updatedFilters.author);
    if (updatedFilters.publisher) params.set('publisher', updatedFilters.publisher);
    if (updatedFilters.language) params.set('language', updatedFilters.language);
    if (updatedFilters.priceRange[0] > 0) params.set('minPrice', updatedFilters.priceRange[0].toString());
    if (updatedFilters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) params.set('maxPrice', updatedFilters.priceRange[1].toString());
    if (updatedFilters.minRating > 0) params.set('rating', updatedFilters.minRating.toString());
    if (updatedFilters.freeShipping) params.set('freeShipping', '1');
    if (updatedFilters.inStock) params.set('inStock', '1');

    const newUrl = `/categories/${categoryId}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });

    // Reset pagination and reload
    setNext(null);
    debounceFilter(() => {
      loadProducts(false);
    });
  }, [filters, categoryId, router, loadProducts, debounceFilter]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    const resetFilters = { ...DEFAULT_FILTERS, categories: [categoryId] };
    setFilters(resetFilters);
    setNext(null);
    router.replace(`/categories/${categoryId}`, { scroll: false });
    loadProducts(false);
  }, [categoryId, loadProducts, router]);

  // Load more products for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadProducts(true);
    }
  }, [hasMore, loadingMore, loadProducts]);

  // Initial data load
  useEffect(() => {
    loadCategoryData();
    loadCategories();
  }, [categoryId]);

  useEffect(() => {
    if (category) {
      loadProducts(false);
    }
  }, [category, filters.sortBy, filters.sortOrder]);

  // Memoized values
  const currencySymbol = siteConfig?.currency?.currency_symbol || '₹';

  const filterOptions = useMemo(() => ({
    categories: allCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      product_count: cat.product_count || 0
    })),
    authors: [], // Would come from API
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
  }), [allCategories, stats]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.author) count++;
    if (filters.publisher) count++;
    if (filters.language) count++;
    if (filters.tags.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) count++;
    if (filters.minRating > 0) count++;
    if (filters.inStock || filters.freeShipping) count++;
    return count;
  }, [filters]);

  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Loading category...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <span className="text-lg">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <Link href="/categories" className="hover:text-primary">Categories</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <span>{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-6 mb-4">
          {(category.image_url || category.image) && (
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
              <Image
                src={category.image_url || category.image || ''}
                alt={category.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{category.name}</h1>
            <p className="text-muted-foreground mb-2">{category.description}</p>
            <p className="text-sm text-muted-foreground">{category.products_count} books available</p>
          </div>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Browse by Topic
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Link key={child.id} href={`/categories/${child.slug}`}>
                  <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {child.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600">
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading products...
                </span>
              ) : (
                <>
                  {stats?.totalProducts?.toLocaleString() || products.length} products
                  {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
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
      </div>

      <div className="flex gap-6">
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
            {loading && products.length === 0 ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">Loading products...</p>
                </div>
              </div>
            ) : !loading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">This category doesn't have any products yet.</p>
                <Button variant="outline" onClick={handleResetFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <VirtualProductGrid
                products={products}
                hasMore={hasMore}
                isLoading={loadingMore}
                loadMore={handleLoadMore}
                next={next}
                className="min-h-[600px]"
                cardVariant="default"
              />
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="large"
                    className="w-full"
                    showCategory={false} // Already showing category at top
                    showAuthor={true}
                    showRating={true}
                    showDiscount={true}
                    showWishlist={true}
                    showQuickView={true}
                    showAddToCart={true}
                    showBuyNow={false}
                  />
                ))}

                {hasMore && (
                  <div className="flex justify-center py-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                    >
                      {loadingMore ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        'Load More Products'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SEO: Category ItemList Structured Data */}
      {category && products.length > 0 && (
        <CategorySchema
          category={category}
          products={products}
          totalProducts={stats?.totalProducts || products.length}
        />
      )}
    </div>
  );
}