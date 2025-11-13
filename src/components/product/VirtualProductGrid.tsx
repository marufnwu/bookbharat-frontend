'use client';

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import { ProductCard } from '@/components/ui/product-card';
import { Product } from '@/types';
import { Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualProductGridProps {
  products: Product[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  next?: string | null;
  className?: string;
  columns?: { xs: number; sm: number; md: number; lg: number; xl: number };
  gap?: number;
  cardVariant?: 'default' | 'compact' | 'large' | 'minimal';
  onProductClick?: (product: Product) => void;
}

// Grid item component
const GridItem = React.memo(({
  columnIndex,
  rowIndex,
  style,
  data
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    columns: number;
    cardVariant: string;
    onProductClick?: (product: Product) => void;
  };
}) => {
  const { products, columns, cardVariant, onProductClick } = data;
  const productIndex = rowIndex * columns + columnIndex;
  const product = products[productIndex];

  if (!product) {
    return (
      <div
        style={style}
        className="flex items-center justify-center p-4"
      >
        <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        padding: '4px', // Gap between cards
      }}
      className="flex items-center justify-center"
      onClick={() => onProductClick?.(product)}
    >
      <ProductCard
        product={product}
        variant={cardVariant as any}
        className="w-full h-full"
        showQuickView={false}
        showCategory={true}
        showAuthor={true}
        showRating={true}
        showDiscount={true}
        showWishlist={true}
        showAddToCart={true}
        showBuyNow={false}
      />
    </div>
  );
});

GridItem.displayName = 'GridItem';

export const VirtualProductGrid = React.memo(function VirtualProductGrid({
  products,
  hasMore,
  isLoading,
  loadMore,
  next,
  className,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 16,
  cardVariant = 'default',
  onProductClick,
}: VirtualProductGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentColumns, setCurrentColumns] = useState(columns.xs);

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      setContainerWidth(width);

      if (width >= 1280) setCurrentColumns(columns.xl);
      else if (width >= 1024) setCurrentColumns(columns.lg);
      else if (width >= 768) setCurrentColumns(columns.md);
      else if (width >= 640) setCurrentColumns(columns.sm);
      else setCurrentColumns(columns.xs);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);

  // Calculate grid dimensions
  const { rowCount, columnCount } = useMemo(() => {
    const cols = currentColumns;
    const rows = Math.ceil(products.length / cols);
    return { rowCount: rows, columnCount: cols };
  }, [products.length, currentColumns]);

  // Item data for grid items
  const itemData = useMemo(() => ({
    products,
    columns: currentColumns,
    cardVariant,
    onProductClick,
  }), [products, currentColumns, cardVariant, onProductClick]);

  // Infinite loader configuration
  const isItemLoaded = useCallback((index: number) => {
    return !!products[index];
  }, [products]);

  const loadMoreItems = useCallback((startIndex: number, stopIndex: number) => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  // Calculate item size
  const getItemSize = useCallback(() => {
    const cardHeight = cardVariant === 'compact' ? 280 :
                     cardVariant === 'large' ? 480 :
                     cardVariant === 'minimal' ? 220 : 380;

    const totalGap = gap * 2; // Top and bottom padding
    return cardHeight + totalGap;
  }, [cardVariant, gap]);

  if (!products.length && !isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16", className)}>
        <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  if (!products.length && isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-16", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("w-full h-full min-h-[600px]", className)}>
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? products.length + 1 : products.length}
            loadMoreItems={loadMoreItems}
            threshold={8}
          >
            {({ onItemsRendered, ref }) => (
              <Grid
                ref={ref}
                width={width}
                height={height}
                columnCount={currentColumns}
                rowCount={rowCount}
                columnWidth={Math.floor((width - gap * (currentColumns + 1)) / currentColumns)}
                rowHeight={getItemSize()}
                itemData={itemData}
                onItemsRendered={onItemsRendered}
                className="scrollbar-hide"
                overscanCount={4}
                useIsScrolling
              >
                {GridItem}
              </Grid>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>

      {/* Loading indicator at bottom */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
});

VirtualProductGrid.displayName = 'VirtualProductGrid';