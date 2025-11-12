'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/ui/product-card';
import LazyProductCard from '@/components/ui/lazy-product-card';
import { useConfig } from '@/contexts/ConfigContext';
import { productApi, categoryApi, cartApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { getProductCardProps, getProductGridClasses } from '@/lib/product-card-config';
import { 
  BookOpen, 
  Star, 
  Filter, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart
} from 'lucide-react';

interface ProductFilters {
  category: string;
  priceMin: string;
  priceMax: string;
  rating: string;
  inStock: boolean;
  onSale: boolean;
  search: string;
  sortBy: string;
}

export default function ProductsPage() {
  const { siteConfig } = useConfig();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'popularity'
  });

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-created_at', label: 'Newest First' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  const priceRanges = [
    { min: '', max: '', label: 'All Prices' },
    { min: '0', max: '250', label: 'Under ₹250' },
    { min: '250', max: '500', label: '₹250 - ₹500' },
    { min: '500', max: '1000', label: '₹500 - ₹1000' },
    { min: '1000', max: '', label: 'Above ₹1000' },
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoriesResponse = await categoryApi.getCategories();
        console.log('DEBUG: Categories API response:', {
          success: categoriesResponse.success,
          totalCategories: categoriesResponse.data?.length || 0,
          allCategories: categoriesResponse.data
        });

        if (categoriesResponse.success) {
          // Filter out categories with 0 products and sort by product count
          const categoriesWithProducts = categoriesResponse.data
            .filter((category: Category) => category.products_count > 0)
            .sort((a: Category, b: Category) => b.products_count - a.products_count);

          console.log('DEBUG: Categories with products:', {
            count: categoriesWithProducts.length,
            categories: categoriesWithProducts.map(c => ({ name: c.name, count: c.products_count }))
          });

          setCategories(categoriesWithProducts);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadInitialData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [filters, currentPage]); // Removed categories.length dependency to prevent race condition

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        per_page: 250, // Load more products to see full category distribution
      };

      if (filters.search) params.search = filters.search;
      // Only apply category filter if category exists and categories have been loaded
      if (filters.category && categories.length > 0) params.category_id = filters.category;
      if (filters.priceMin) params.price_min = filters.priceMin;
      if (filters.priceMax) params.price_max = filters.priceMax;
      if (filters.inStock) params.in_stock = true;
      if (filters.sortBy) params.sort = filters.sortBy;

      const response = await productApi.getProducts(params);

      if (response.success) {
        // Handle different possible API response structures
        const productsData = response.data?.data || response.data || [];
        console.log('DEBUG: Products loaded:', {
          productsCount: productsData.length,
          responseStructure: !!response.data?.data ? 'data.data' : 'data',
          params: params
        });

        // Log category distribution for debugging
        const categoryCount = {};
        productsData.forEach(product => {
          const catName = product.category?.name || 'Unknown';
          categoryCount[catName] = (categoryCount[catName] || 0) + 1;
        });
        console.log('DEBUG: Category distribution:', categoryCount);

        setProducts(Array.isArray(productsData) ? productsData : []);

        // Handle pagination meta data
        const meta = response.meta || response.data?.meta || response.data;
        if (meta) {
          setTotalProducts(meta.total || response.data?.total || productsData.length || 0);
          setTotalPages(meta.last_page || 1);
        }
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    updateURL(updatedFilters);
  };

  const updateURL = (filters: ProductFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters: ProductFilters = {
      category: '',
      priceMin: '',
      priceMax: '',
      rating: '',
      inStock: false,
      onSale: false,
      search: '',
      sortBy: 'popularity'
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    updateURL(clearedFilters);
  };

  const addToCart = async (productId: number) => {
    try {
      setAddingToCart(productId);
      const response = await cartApi.addToCart(productId, 1);
      
      if (response.success) {
        // Show success message (you could use a toast library)
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error message
    } finally {
      setAddingToCart(null);
    }
  };


  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse compact-spacing">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 compact-gap">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="compact-spacing">
                <div className="bg-gray-200 rounded aspect-[3/4]"></div>
                <div className="compact-spacing">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="compact-text text-muted-foreground compact-margin overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link href="/" className="hover:text-primary touch-target">Home</Link>
        <span className="mx-1 sm:mx-2">/</span>
        <span className="text-foreground">Products</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between compact-padding gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="compact-title text-foreground mb-1">All Books</h1>
          <p className="compact-text text-muted-foreground hidden sm:block">Discover your next great read from our vast collection</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0 flex-shrink-0">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </div>

  
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price Range
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={`${filters.priceMin}-${filters.priceMax}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-');
                    handleFilterChange({ priceMin: min, priceMax: max });
                  }}
                >
                  {priceRanges.map((range, index) => (
                    <option key={index} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Availability
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border focus:ring-2 focus:ring-ring" 
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border focus:ring-2 focus:ring-ring"
                      checked={filters.onSale}
                      onChange={(e) => handleFilterChange({ onSale: e.target.checked })}
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                </div>
              </div>

              <Button className="w-full" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Available Categories Summary - Only show if categories exist */}
          {!loading && categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Available Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!filters.category ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange({ category: '' })}
                >
                  All ({totalProducts})
                </Button>
                {categories.slice(0, 8).map((category) => (
                  <Button
                    key={category.id}
                    variant={filters.category === category.id.toString() ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange({ category: category.id.toString() })}
                    className="text-xs"
                  >
                    {category.name} ({category.products_count || 0})
                  </Button>
                ))}
                {categories.length > 8 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{categories.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Sort and Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              ) : (
                `Showing ${products.length} of ${totalProducts} results`
              )}
            </p>
            <select
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="bg-gray-200 rounded aspect-[3/4]"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <div className="space-y-2 mb-4">
                <p className="text-muted-foreground">
                  {filters.search && `No products match your search "${filters.search}"`}
                  {filters.category && !filters.search && `No products found in "${categories.find(c => c.id.toString() === filters.category)?.name || 'selected category'}"`}
                  {!filters.search && !filters.category && "No products available with current filters"}
                </p>
                {(filters.priceMin || filters.priceMax || filters.inStock) && (
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your price range or availability filters
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button onClick={clearFilters}>Clear All Filters</Button>
                {filters.category && (
                  <Button variant="outline" onClick={() => handleFilterChange({ category: '' })}>
                    Clear Category
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? getProductGridClasses('productListing') : 'space-y-4'}>
              {products.map((product, index) => (
                <LazyProductCard
                  key={product.id}
                  product={product}
                  {...getProductCardProps(viewMode === 'grid' ? 'productListGrid' : 'productListList', isMobile)}
                  className={viewMode === 'list' ? 'flex' : ''}
                  // Progressive loading threshold - first few products load immediately
                  threshold={index < 4 ? 0 : 0.1}
                  rootMargin={index < 4 ? '0px' : '100px'}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-12">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'primary' : 'outline'}
                    size="sm"
                    className="w-10"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}