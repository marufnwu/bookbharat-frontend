'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: React.ReactNode;
  className?: string;
  priority?: boolean;
  eager?: boolean; // For critical images that should load immediately
}

export function OptimizedImage({ 
  fallback,
  className,
  alt,
  priority = false,
  eager = false,
  ...props 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(eager || priority);

  // Intersection Observer for lazy loading on mobile
  useEffect(() => {
    if (eager || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        // Load images when they're 100px from viewport on mobile, 200px on desktop
        rootMargin: window.innerWidth < 768 ? '100px' : '200px',
        threshold: 0.01
      }
    );

    const element = document.querySelector(`[data-image-id="${props.src}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [eager, priority, props.src]);

  const defaultFallback = (
    <div className={cn(
      "flex items-center justify-center bg-gray-100 rounded mobile-optimized",
      className
    )}>
      <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
    </div>
  );

  if (hasError) {
    return fallback || defaultFallback;
  }

  return (
    <div 
      className={cn("relative", className)} 
      data-image-id={props.src}
    >
      {isLoading && shouldLoad && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gray-100 rounded animate-pulse mobile-optimized",
          className
        )}>
          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
        </div>
      )}
      
      {shouldLoad && (
        <Image
          {...props}
          alt={alt}
          className={cn(
            "transition-opacity duration-300 mobile-optimized",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          quality={75} // Reduce quality for mobile devices
          sizes={priority ? "100vw" : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
        />
      )}
      
      {!shouldLoad && (
        <div className={cn(
          "flex items-center justify-center bg-gray-50 rounded",
          className
        )}>
          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}
    </div>
  );
}