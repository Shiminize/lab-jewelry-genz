/**
 * Memory-optimized scroll hook
 * Fixes memory leaks in navigation scroll handling
 */

import { useEffect, useCallback, useRef } from 'react';
import { MemoryGuard } from '../security/sanitization';

interface ScrollState {
  scrollY: number;
  scrollDirection: 'up' | 'down' | null;
  isScrolled: boolean;
}

interface UseScrollOptimizedOptions {
  threshold?: number;
  throttleMs?: number;
  onScrollUp?: () => void;
  onScrollDown?: () => void;
  onScrollThreshold?: (crossed: boolean) => void;
}

/**
 * Optimized scroll hook with proper cleanup and throttling
 * Prevents memory leaks common in navigation scroll handlers
 */
export function useScrollOptimized(options: UseScrollOptimizedOptions = {}) {
  const {
    threshold = 20,
    throttleMs = 16, // ~60fps
    onScrollUp,
    onScrollDown,
    onScrollThreshold
  } = options;

  const scrollStateRef = useRef<ScrollState>({
    scrollY: 0,
    scrollDirection: null,
    isScrolled: false
  });

  const rafIdRef = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  // Throttled scroll handler with memory optimization
  const handleScroll = useCallback(() => {
    const now = Date.now();
    
    // Throttle scroll events
    if (now - lastScrollTime.current < throttleMs) {
      return;
    }
    
    lastScrollTime.current = now;

    // Cancel any pending animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const previousScrollY = scrollStateRef.current.scrollY;
      const scrollDelta = currentScrollY - previousScrollY;

      // Determine scroll direction
      let direction: 'up' | 'down' | null = null;
      if (Math.abs(scrollDelta) > 5) {
        direction = scrollDelta > 0 ? 'down' : 'up';
      }

      // Check threshold crossing
      const wasScrolled = scrollStateRef.current.isScrolled;
      const isScrolled = currentScrollY > threshold;

      // Update state
      scrollStateRef.current = {
        scrollY: currentScrollY,
        scrollDirection: direction,
        isScrolled
      };

      // Call callbacks
      if (direction === 'up' && onScrollUp) {
        onScrollUp();
      } else if (direction === 'down' && onScrollDown) {
        onScrollDown();
      }

      if (wasScrolled !== isScrolled && onScrollThreshold) {
        onScrollThreshold(isScrolled);
      }
    });
  }, [threshold, throttleMs, onScrollUp, onScrollDown, onScrollThreshold]);

  useEffect(() => {
    // Add passive listener for better performance
    const options: AddEventListenerOptions = {
      passive: true,
      capture: false
    };

    window.addEventListener('scroll', handleScroll, options);

    // Register cleanup with MemoryGuard
    const cleanup = () => {
      window.removeEventListener('scroll', handleScroll, options);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    MemoryGuard.addCleanup(cleanup);

    // Initial state
    scrollStateRef.current.scrollY = window.scrollY;
    scrollStateRef.current.isScrolled = window.scrollY > threshold;

    return () => {
      cleanup();
      MemoryGuard.removeCleanup(cleanup);
    };
  }, [handleScroll, threshold]);

  // Return current state
  return {
    scrollY: scrollStateRef.current.scrollY,
    scrollDirection: scrollStateRef.current.scrollDirection,
    isScrolled: scrollStateRef.current.isScrolled
  };
}

/**
 * Debounced callback hook with proper cleanup
 * Prevents memory leaks from debounced functions
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    MemoryGuard.addCleanup(cleanup);

    return () => {
      cleanup();
      MemoryGuard.removeCleanup(cleanup);
    };
  }, []);

  return debouncedCallback;
}

/**
 * Event listener hook with automatic cleanup
 * Ensures all event listeners are properly removed
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Document | Element = window,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    const eventListener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);
    
    element.addEventListener(eventName, eventListener, options);

    const cleanup = () => {
      element.removeEventListener(eventName, eventListener, options);
    };

    MemoryGuard.addCleanup(cleanup);

    return () => {
      cleanup();
      MemoryGuard.removeCleanup(cleanup);
    };
  }, [eventName, element, options]);
}