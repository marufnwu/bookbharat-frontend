'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { MobileProductCard, MobileProductCardSkeleton } from '@/components/ui/mobile-product-card';
import { Button } from '@/components/ui/button';
import { 
  Grid3X3, 
  List, 
  Filter, 
  ChevronDown,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { MobileFilterDrawer, MobileSortDrawer } from '@/components/ui/mobile-filter-drawer';

interface MobileProductGridProps {
  products: Product[];
  loading?: boolean;
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (sort: string) => void;
  onFilterChange?: (filters: any) => void;
  filters?: any;
  sortOptions?: Array<{ value: string; label: string }>;
  filterGroups?: any[];
  showViewToggle?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  infiniteScroll?: boolean;
  className?: string;
}

export function MobileProductGrid({
  products,
  loading = false,
  totalProducts,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSortChange,
  onFilterChange,
  filters = {},
  sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'bestseller', label: 'Best Sellers' }
  ],
  filterGroups = [],
  showViewToggle = true,
  showFilters = true,
  showSort = true,
  infiniteScroll = false,
  className
}: MobileProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('relevance');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState(products);

  useEffect(() => {
    setDisplayedProducts(products);
  }, [products]);

  // Infinite scroll handler
  useEffect(() => {
    if (!infiniteScroll) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 100
      ) {
        if (!isLoadingMore && currentPage < totalPages) {
          loadMoreProducts();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [infiniteScroll, isLoadingMore, currentPage, totalPages]);

  const loadMoreProducts = async () => {
    if (isLoadingMore || !onPageChange) return;
    
    setIsLoadingMore(true);
    try {
      await onPageChange(currentPage + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSortSelect = (value: string) => {
    setSelectedSort(value);
    onSortChange?.(value);
  };

  const handleFilterApply = (newFilters: any) => {
    onFilterChange?.(newFilters);
  };

  const activeFilterCount = Object.keys(filters).reduce((count, key) => {
    const value = filters[key];
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  const gridColumns = viewMode === 'grid' 
    ? 'grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4'
    : 'flex flex-col gap-2 sm:gap-3';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Mobile Toolbar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border -mx-3 sm:-mx-4 px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Results Count */}
          <div className="text-xs sm:text-sm text-muted-foreground">
            {totalProducts ? (
              <span>{totalProducts} products</span>
            ) : (
              <span>{products.length} products</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {showViewToggle && (
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewMode === 'grid' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground'
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewMode === 'list' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground'
                  )}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {showSort && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSortOpen(true)}
                className="h-8 px-2 text-xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                Sort
              </Button>
            )}

            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(true)}
                className="h-8 px-2 text-xs relative"
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Pills */}
        {activeFilterCount > 0 && (
          <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide pb-1">
            {Object.entries(filters).map(([key, value]) => {
              if (Array.isArray(value)) {
                return value.map((v) => (
                  <button
                    key={`${key}-${v}`}
                    onClick={() => {
                      const newFilters = { ...filters };
                      newFilters[key] = value.filter((item: any) => item !== v);
                      if (newFilters[key].length === 0) {
                        delete newFilters[key];
                      }
                      onFilterChange?.(newFilters);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] whitespace-nowrap"
                  >
                    {v}
                    <span className="ml-0.5">×</span>
                  </button>
                ));
              }
              return value ? (
                <button
                  key={key}
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key];
                    onFilterChange?.(newFilters);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-[10px] whitespace-nowrap"
                >
                  {value}
                  <span className="ml-0.5">×</span>
                </button>
              ) : null;
            })}
            <button
              onClick={() => onFilterChange?.({})}
              className="px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Product Grid/List */}
      {loading && products.length === 0 ? (
        <div className={gridColumns}>
          {[...Array(6)].map((_, i) => (
            <MobileProductCardSkeleton key={i} variant={viewMode} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Try adjusting your filters or search criteria to find what you're looking for
          </p>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilterChange?.({})}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={gridColumns}>
            {displayedProducts.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                variant={viewMode}
              />
            ))}
          </div>

          {/* Load More / Pagination */}
          {!infiniteScroll && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange?.(page)}
                      className="h-9 w-9 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2">...</span>
                    <Button
                      variant={totalPages === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange?.(totalPages)}
                      className="h-9 w-9 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9"
              >
                Next
              </Button>
            </div>
          )}

          {infiniteScroll && isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading more products...</span>
            </div>
          )}
        </>
      )}

      {/* Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filterGroups}
        selectedFilters={filters}
        onApplyFilters={handleFilterApply}
        onClearFilters={() => onFilterChange?.({})}
        totalResults={totalProducts}
      />

      {/* Sort Drawer */}
      <MobileSortDrawer
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        options={sortOptions}
        selectedValue={selectedSort}
        onSelect={handleSortSelect}
      />
    </div>
  );
}

// Horizontal scrollable product row
export function MobileProductRow({
  title,
  products,
  loading = false,
  viewAllHref,
  className
}: {
  title: string;
  products: Product[];
  loading?: boolean;
  viewAllHref?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between px-3 sm:px-4">
        <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-xs sm:text-sm text-primary hover:underline flex items-center"
          >
            View All
            <ChevronDown className="h-3 w-3 ml-0.5 -rotate-90" />
          </a>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 sm:gap-3 px-3 sm:px-4 pb-2">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="w-32 xs:w-36 sm:w-40 flex-shrink-0">
                <MobileProductCardSkeleton variant="minimal" />
              </div>
            ))
          ) : (
            products.map((product) => (
              <div key={product.id} className="w-32 xs:w-36 sm:w-40 flex-shrink-0 snap-start">
                <MobileProductCard product={product} variant="minimal" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}