'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

interface ProductImage {
  id?: number;
  image_url?: string;
  url?: string;
  image_path?: string;
  alt?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export function ProductImageGallery({ images, productName, className = '' }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });

  const getImageUrl = useCallback((image: ProductImage, index: number = 0) => {
    if (!image) return '/book-placeholder.svg';

    // Priority order: url > image_url > construct from image_path
    if (image.url) return image.url;
    if (image.image_url) return image.image_url;
    
    // Fallback: construct URL from image_path (should rarely be needed)
    if (image.image_path) {
      // If image_path is already a full URL, return it
      if (image.image_path.startsWith('http')) {
        return image.image_path;
      }
      
      // Otherwise, construct the URL (fallback for legacy data)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      return `${baseUrl}/storage/${image.image_path}`;
    }

    return '/book-placeholder.svg';
  }, []);

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const openLightbox = useCallback(() => {
    setShowLightbox(true);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  }, []);

  const closeLightbox = useCallback(() => {
    setShowLightbox(false);
    setLightboxZoom(1);
    setLightboxPan({ x: 0, y: 0 });
  }, []);

  const handleLightboxZoom = useCallback((delta: number) => {
    setLightboxZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  const handleLightboxWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    handleLightboxZoom(e.deltaY > 0 ? -0.1 : 0.1);
  }, [handleLightboxZoom]);

  if (!images || images.length === 0) {
    return (
      <div className={`relative bg-white rounded-lg border overflow-hidden aspect-square ${className}`}>
        <Image
          src="/book-placeholder.svg"
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-6 sm:p-8"
          priority
        />
      </div>
    );
  }

  return (
    <div className={`space-y-2 sm:space-y-4 ${className}`}>
      {/* Mobile-First Main Image */}
      <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden aspect-square group">
        <div
          className="relative w-full h-full cursor-zoom-in"
          onClick={openLightbox}
        >
          <Image
            src={getImageUrl(images[selectedIndex], selectedIndex)}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 sm:p-6 md:p-8 transition-transform group-hover:scale-105"
            priority
          />

          {/* Zoom Icon Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-6 w-6 text-gray-700" />
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 touch-target shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 touch-target shadow-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile-First Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {images.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-gray-400'
              }`}
            >
              <Image
                src={getImageUrl(images[index], index)}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                sizes="(max-width: 768px) 20vw, (max-width: 1024px) 10vw, 8vw"
                className="object-contain p-0.5 sm:p-1"
              />
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile-First Image Counter */}
      {images.length > 1 && (
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          {selectedIndex + 1} of {images.length}
        </div>
      )}

      {/* Enhanced Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            onClick={closeLightbox}
          >
            <X className="h-8 w-8" />
          </button>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLightboxZoom(-0.2);
              }}
              className="bg-white/10 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLightboxZoom(0.2);
              }}
              className="bg-white/10 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <span className="bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm">
              {Math.round(lightboxZoom * 100)}%
            </span>
          </div>

          {/* Main Image Container */}
          <div
            className="relative max-w-5xl w-full h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleLightboxWheel}
          >
            <div
              className="relative max-w-full max-h-full overflow-hidden cursor-move"
              style={{
                transform: `scale(${lightboxZoom}) translate(${lightboxPan.x}px, ${lightboxPan.y}px)`,
              }}
            >
              <Image
                src={getImageUrl(images[selectedIndex], selectedIndex)}
                alt={`${productName} - Full Size`}
                width={800}
                height={800}
                className="object-contain max-w-full max-h-[80vh]"
                priority
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white rounded-full p-3 hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <div className="flex gap-2">
                  {images.slice(0, 7).map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIndex(index);
                      }}
                      className={`w-12 h-12 rounded overflow-hidden border-2 ${
                        selectedIndex === index
                          ? 'border-white'
                          : 'border-transparent hover:border-white/50'
                      }`}
                    >
                      <Image
                        src={getImageUrl(images[index], index)}
                        alt={`Thumbnail ${index + 1}`}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


