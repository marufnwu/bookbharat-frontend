'use client';

import { useState, useRef } from 'react';
import { useSwipeGesture, useLongPress } from '@/hooks/useMobileGestures';
import { Button } from '@/components/ui/button';
import { Trash2, Heart, Share2, MoreVertical } from 'lucide-react';

interface MobileGestureCardProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onWishlist?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  className?: string;
}

export function MobileGestureCard({ 
  children, 
  onDelete, 
  onWishlist, 
  onShare, 
  onMore,
  className = '' 
}: MobileGestureCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const swipeGesture = useSwipeGesture({
    onSwipeLeft: () => {
      if (onDelete) {
        setSwipeOffset(-100);
        setTimeout(() => {
          onDelete();
          setSwipeOffset(0);
        }, 200);
      }
    },
    onSwipeRight: () => {
      setSwipeOffset(0);
      setShowActions(false);
    },
    threshold: 50
  });

  const longPressGesture = useLongPress({
    onLongPress: () => {
      setShowActions(true);
      setSwipeOffset(-60);
    },
    delay: 500
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeGesture.handleTouchStart(e.nativeEvent);
    longPressGesture.handlers.onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    swipeGesture.handleTouchMove(e.nativeEvent);
    
    // Handle swipe offset for visual feedback
    if (cardRef.current) {
      const touch = e.touches[0];
      const rect = cardRef.current.getBoundingClientRect();
      const deltaX = touch.clientX - rect.left - rect.width / 2;
      
      if (Math.abs(deltaX) > 20) {
        const offset = Math.max(-100, Math.min(0, deltaX * 0.5));
        setSwipeOffset(offset);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    swipeGesture.handleTouchEnd();
    longPressGesture.handlers.onTouchEnd(e);
    
    // Reset offset if not enough swipe
    if (Math.abs(swipeOffset) < 50) {
      setSwipeOffset(0);
      setShowActions(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons */}
      <div 
        className={`absolute right-0 top-0 h-full flex items-center gap-2 pr-4 transition-transform duration-200 ${
          showActions ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transform: `translateX(${Math.abs(swipeOffset)}px)` }}
      >
        {onWishlist && (
          <Button
            size="sm"
            variant="outline"
            onClick={onWishlist}
            className="bg-white shadow-md"
          >
            <Heart className="h-4 w-4" />
          </Button>
        )}
        {onShare && (
          <Button
            size="sm"
            variant="outline"
            onClick={onShare}
            className="bg-white shadow-md"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
        {onMore && (
          <Button
            size="sm"
            variant="outline"
            onClick={onMore}
            className="bg-white shadow-md"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="shadow-md"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main card content */}
      <div
        ref={cardRef}
        className={`transition-transform duration-200 ${className}`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Swipe indicator */}
      {Math.abs(swipeOffset) > 20 && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
          {swipeOffset < -50 ? '← Swipe to delete' : '→ Swipe for actions'}
        </div>
      )}
    </div>
  );
}

// Swipe to delete hook specifically for cart items
export function useSwipeToDelete(onDelete: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    deleteGesture: {
      onSwipeLeft: handleDelete,
      threshold: 100
    }
  };
}

// Mobile-friendly quantity controls
export function MobileQuantityControls({ 
  quantity, 
  onIncrease, 
  onDecrease, 
  disabled = false 
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}) {
  const longPressIncrease = useLongPress({
    onLongPress: () => {
      if (!disabled) {
        const interval = setInterval(() => {
          onIncrease();
        }, 100);
        
        const stopInterval = () => {
          clearInterval(interval);
          document.removeEventListener('touchend', stopInterval);
          document.removeEventListener('touchcancel', stopInterval);
        };
        
        document.addEventListener('touchend', stopInterval);
        document.addEventListener('touchcancel', stopInterval);
      }
    },
    delay: 300
  });

  const longPressDecrease = useLongPress({
    onLongPress: () => {
      if (!disabled && quantity > 1) {
        const interval = setInterval(() => {
          onDecrease();
        }, 100);
        
        const stopInterval = () => {
          clearInterval(interval);
          document.removeEventListener('touchend', stopInterval);
          document.removeEventListener('touchcancel', stopInterval);
        };
        
        document.addEventListener('touchend', stopInterval);
        document.addEventListener('touchcancel', stopInterval);
      }
    },
    delay: 300
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        {...longPressDecrease.handlers}
        className="h-8 w-8 p-0 touch-manipulation"
      >
        -
      </Button>
      <span className="min-w-[2rem] text-center font-medium">{quantity}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={onIncrease}
        disabled={disabled}
        {...longPressIncrease.handlers}
        className="h-8 w-8 p-0 touch-manipulation"
      >
        +
      </Button>
    </div>
  );
}
