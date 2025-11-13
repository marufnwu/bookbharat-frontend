'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VirtualProductGrid } from '@/components/product/VirtualProductGrid';
import { AdvancedProductFilters, DEFAULT_FILTERS, type FilterState } from '@/components/product/AdvancedProductFilters';
import { ProductCard } from '@/components/ui/product-card';
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
  ArrowLeft
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

export default function SearchPage() {
  const { siteConfig } = useConfig();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Performance hooks
  const transformProducts = useProductDataTransform();
  const debounceFilter = useDebounceFilter(300);

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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state with URL sync
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialFilters: FilterState = { ...DEFAULT_FILTERS };

    // Initialize from URL params
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const publisher = searchParams.get('publisher');
    const language = searchParams.get('language');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const freeShipping = searchParams.get('freeShipping');
    const inStock = searchParams.get('inStock');

    if (query) {
      initialFilters.search = query;
      setSearchQuery(query);
    }
    if (category) {
      initialFilters.categories = [category];
    }
    if (author) initialFilters.author = author;
    if (publisher) initialFilters.publisher = publisher;
    if (language) initialFilters.language = language;
    if (minPrice) initialFilters.priceRange[0] = parseInt(minPrice);
    if (maxPrice) initialFilters.priceRange[1] = parseInt(maxPrice);
    if (rating) initialFilters.minRating = parseFloat(rating);
    if (freeShipping) initialFilters.freeShipping = true;
    if (inStock) initialFilters.inStock = true;

    // Set search relevance as default sort for search
    initialFilters.sortBy = 'relevance';

    return initialFilters;
  });

  // Build query parameters from filters
  const buildQueryParams = useCallback((currentFilters: FilterState) => {
    const params: any = {
      limit: '20'
    };

    if (currentFilters.search) params.q = currentFilters.search;
    if (currentFilters.categories.length > 0) {
      params.category_id = currentFilters.categories.join(',');
    }
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

    // Handle search-specific sorting
    if (currentFilters.sortBy !== 'relevance') {
      params.sort = currentFilters.sortBy === 'popularity' ? '-popularity' :
                currentFilters.sortBy === 'discount' ? '-discount' :
                currentFilters.sortBy;
    }

    params.order = currentFilters.sortOrder;

    return params;
  }, []);

  // Load products with infinite scroll
  const loadProducts = useCallback(async (isLoadMore = false) => {
    try {
      if (!searchQuery.trim()) {
        setProducts([]);
        setStats(null);
        setLoading(false);
        return;
      }

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const queryParams = buildQueryParams(filters);
      const url = next ? `/search?${next.split('?')[1]}` : `/search?${queryParams}`;

      const response = await productApi.searchProducts(searchQuery, queryParams);
      const transformedProducts = transformProducts(response);

      if (isLoadMore) {
        setProducts(prev => [...prev, ...transformedProducts]);
      } else {
        setProducts(transformedProducts);
      }

      setHasMore(response.data?.next_page_url !== null);
      setNext(response.data?.next_page_url);

      // Update stats
      if (response.data?.meta && !isLoadMore) {
        setStats({
          totalProducts: response.data.meta.total || 0,
          avgPrice: 0, // Would come from API
          topCategories: [],
          priceRange: { min: 0, max: 5000 },
          inStockCount: 0,
          freeShippingCount: 0
        });
      }

    } catch (err) {
      console.error('Failed to load search results:', err);
      setError('Failed to load search results. Please try again.');
      setProducts([]);
      setStats(null);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, filters, next, buildQueryParams, transformProducts]);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, search: query }));
    setNext(null);

    // Update URL
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [router]);

  // Filter change handler with debouncing
  const handleFiltersChange = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters, search: searchQuery };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (updatedFilters.categories.length > 0) params.set('category', updatedFilters.categories[0]);
    if (updatedFilters.author) params.set('author', updatedFilters.author);
    if (updatedFilters.publisher) params.set('publisher', updatedFilters.publisher);
    if (updatedFilters.language) params.set('language', updatedFilters.language);
    if (updatedFilters.priceRange[0] > 0) params.set('minPrice', updatedFilters.priceRange[0].toString());
    if (updatedFilters.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) params.set('maxPrice', updatedFilters.priceRange[1].toString());
    if (updatedFilters.minRating > 0) params.set('rating', updatedFilters.minRating.toString());
    if (updatedFilters.freeShipping) params.set('freeShipping', '1');
    if (updatedFilters.inStock) params.set('inStock', '1');

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });

    // Reset pagination and reload
    setNext(null);
    debounceFilter(() => {
      loadProducts(false);
    });
  }, [filters, searchQuery, router, loadProducts, debounceFilter]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    const resetFilters = { ...DEFAULT_FILTERS, search: searchQuery, sortBy: 'relevance' };
    setFilters(resetFilters);
    setNext(null);

    const params = searchQuery ? `?q=${searchQuery}` : '';
    router.replace(`/search${params}`, { scroll: false });
    loadProducts(false);
  }, [searchQuery, loadProducts, router]);

  // Load more products for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadProducts(true);
    }
  }, [hasMore, loadingMore, loadProducts]);

  // Initial data load
  useEffect(() => {
    if (searchQuery) {
      loadProducts(false);
    }
    loadCategories();
  }, [searchQuery]); // Only reload when search query changes

  // Memoized values
  const currencySymbol = siteConfig?.currency?.currency_symbol || '₹';

  const filterOptions = useMemo(() => ({
    categories: categories.map(cat => ({
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
  }), [categories, stats]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Search Results</h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for books, authors, categories..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-12"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {searchQuery && (
              <p className="text-gray-600">
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </span>
                ) : (
                  <>
                    {stats?.totalProducts.toLocaleString() || products.length} results for "{searchQuery}"
                    {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
                  </>
                )}
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
                  <p className="text-lg font-medium">Searching...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                  <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Search failed</h2>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={() => loadProducts(false)}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : !searchQuery ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Search className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a search term</h3>
                <p className="text-gray-500">Search for books, authors, or categories to get started</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSearch('')}>
                    Clear Search
                  </Button>
                  <Button variant="outline" onClick={handleResetFilters}>
                    Clear Filters
                  </Button>
                </div>
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
                    showCategory={true}
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
                        'Load More Results'
                      )}
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