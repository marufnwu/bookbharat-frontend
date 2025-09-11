'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height
}: SkeletonProps) {
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'rounded-lg'
  };

  return (
    <div
      className={cn(
        'bg-muted',
        animations[animation],
        variants[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  );
}

interface ProductSkeletonProps {
  variant?: 'default' | 'compact' | 'minimal';
}

export function ProductSkeleton({ variant = 'default' }: ProductSkeletonProps) {
  const sizes = {
    default: {
      image: 'h-48 sm:h-56',
      title: 'h-4 w-3/4',
      subtitle: 'h-3 w-1/2',
      price: 'h-5 w-1/3'
    },
    compact: {
      image: 'h-32 sm:h-40',
      title: 'h-3 w-3/4',
      subtitle: 'h-2.5 w-1/2',
      price: 'h-4 w-1/3'
    },
    minimal: {
      image: 'h-24 sm:h-32',
      title: 'h-2.5 w-3/4',
      subtitle: 'h-2 w-1/2',
      price: 'h-3 w-1/3'
    }
  };

  const size = sizes[variant];

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <Skeleton className={size.image} />
      <div className="p-3 sm:p-4 space-y-2">
        <Skeleton className={size.title} />
        <Skeleton className={size.subtitle} />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className={size.price} />
          <Skeleton className="h-7 w-20" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 flex flex-col items-center space-y-2">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-2 w-16" />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-full max-w-md mx-4" />
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton variant="rectangular" width={60} height={60} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-3 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-end space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 p-3 border-b border-border">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 p-3 border-b border-border">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-3" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 sm:p-6 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen">
      <HeaderSkeleton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} variant="compact" />
          ))}
        </div>
      </div>
    </div>
  );
}