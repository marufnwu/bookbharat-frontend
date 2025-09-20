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

  // Check if src is valid
  const isValidSrc = props.src && props.src !== '';

  // Check if src is an external URL (for unoptimized loading)
  // For now, treat localhost:8000 storage URLs as external to avoid Next.js optimization issues
  const isExternalUrl = typeof props.src === 'string' &&
    (props.src.startsWith('http://') || props.src.startsWith('https://')) &&
    (props.src.includes('localhost:8000/storage') ||
     (!props.src.includes('localhost') && !props.src.includes('127.0.0.1')));

  // Intersection Observer for lazy loading on mobile
  useEffect(() => {
    if (eager || priority || !isValidSrc) return;

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
  }, [eager, priority, props.src, isValidSrc]);

  const defaultFallback = (
    <div className={cn(
      "flex items-center justify-center bg-gray-100 rounded mobile-optimized",
      className
    )}>
      <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
    </div>
  );

  // If src is invalid or there's an error, show fallback
  if (!isValidSrc || hasError) {
    return fallback || defaultFallback;
  }

  // For external URLs or when using fill prop, render directly without wrapper
  if (shouldLoad && (isExternalUrl || props.fill)) {
    if (isExternalUrl) {
      // Use regular img tag for external URLs
      const { fill, sizes, quality, placeholder, blurDataURL, ...imgProps } = props;

      const imgStyle = fill ? {
        position: 'absolute' as const,
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: 'cover' as const,
        ...props.style
      } : props.style;

      return (
        <img
          {...imgProps}
          alt={alt}
          className={cn(
            "transition-opacity duration-300 mobile-optimized",
            className
          )}
          style={imgStyle}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          loading={priority ? "eager" : "lazy"}
        />
      );
    } else {
      // Use Next.js Image for local non-storage URLs with fill prop
      return (
        <Image
          {...props}
          alt={alt}
          className={cn(
            "transition-opacity duration-300 mobile-optimized",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          quality={75}
        />
      );
    }
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

      {shouldLoad && !isExternalUrl && !props.fill ? (
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
          quality={75}
          sizes={priority ? "100vw" : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
        />
      ) : null}

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