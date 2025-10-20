'use client';

import { useEffect, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

export function useSwipeGesture(options: SwipeGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefault = true
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (preventDefault) e.preventDefault();
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (preventDefault) e.preventDefault();
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (absDeltaX > threshold) {
        if (deltaX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    } else {
      // Vertical swipe
      if (absDeltaY > threshold) {
        if (deltaY > 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return {
    touchStart,
    touchEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const { onRefresh, threshold = 80, resistance = 0.5 } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    const resistanceDistance = distance * resistance;
    
    setPullDistance(resistanceDistance);
    
    if (distance > threshold) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
  };

  useEffect(() => {
    const element = document.body;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing]);

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    progress: Math.min(pullDistance / threshold, 1)
  };
}

interface LongPressOptions {
  onLongPress: () => void;
  delay?: number;
}

export function useLongPress(options: LongPressOptions) {
  const { onLongPress, delay = 500 } = options;
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsLongPressing(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      setIsLongPressing(false);
    }, delay);
  };

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLongPressing(false);
  };

  return {
    isLongPressing,
    handlers: {
      onTouchStart: start,
      onTouchEnd: stop,
      onTouchCancel: stop,
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop
    }
  };
}

// Mobile gesture utilities
export const mobileGestures = {
  // Swipe to delete gesture
  swipeToDelete: (onDelete: () => void) => ({
    onSwipeLeft: onDelete,
    threshold: 100
  }),

  // Swipe to navigate
  swipeToNavigate: (onNext: () => void, onPrev: () => void) => ({
    onSwipeLeft: onNext,
    onSwipeRight: onPrev,
    threshold: 80
  }),

  // Pull to refresh
  pullToRefresh: (onRefresh: () => Promise<void>) => ({
    onRefresh,
    threshold: 80,
    resistance: 0.5
  }),

  // Long press for context menu
  longPressMenu: (onShowMenu: () => void) => ({
    onLongPress: onShowMenu,
    delay: 500
  })
};
