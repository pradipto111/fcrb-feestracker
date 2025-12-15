/**
 * SmoothScroll Component
 * Provides smooth, inertial scrolling using Lenis
 * Respects prefers-reduced-motion
 */

import { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
  };
}

// Context to expose Lenis instance
const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

export function SmoothScroll({ children, options }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false, // Disable on touch devices for better performance
      touchMultiplier: 2,
      infinite: false,
      ...options,
    });

    lenisRef.current = lenis;
    
    // Expose Lenis on window for easy access (optional, for compatibility)
    (window as any).lenis = lenis;

    // Helper to check if element is scrollable
    const isElementScrollable = (element: HTMLElement): boolean => {
      const style = window.getComputedStyle(element);
      const overflowY = style.overflowY || style.overflow;
      const overflowX = style.overflowX || style.overflow;
      return (
        (overflowY === 'auto' || overflowY === 'scroll' || 
         overflowX === 'auto' || overflowX === 'scroll') &&
        (element.scrollHeight > element.clientHeight || 
         element.scrollWidth > element.clientWidth)
      );
    };

    // Find the closest scrollable parent
    const findScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
      let current = element;
      while (current && current !== document.body) {
        if (isElementScrollable(current)) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    // Handle wheel events to allow nested scrolling
    // Improved logic to prevent conflicts
    let isScrollingNested = false;
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let isScrollbarInteraction = false;
    let scrollbarInteractionTimeout: ReturnType<typeof setTimeout> | null = null;

    // Detect native scrollbar interactions (mousedown on scrollbar area)
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      // Check if click is on or near scrollbar (right edge of viewport)
      const viewportWidth = window.innerWidth;
      const clickX = e.clientX;
      const scrollbarWidth = 17; // Typical scrollbar width
      const threshold = 30; // Extra threshold for easier detection
      
      // If click is near right edge, likely scrollbar interaction
      if (clickX > viewportWidth - scrollbarWidth - threshold) {
        isScrollbarInteraction = true;
        lenis.stop();
        
        // Clear any existing timeout
        if (scrollbarInteractionTimeout) {
          clearTimeout(scrollbarInteractionTimeout);
        }
      }
    };

    const handleMouseUp = () => {
      if (isScrollbarInteraction) {
        // Restart Lenis after scrollbar interaction ends
        scrollbarInteractionTimeout = setTimeout(() => {
          isScrollbarInteraction = false;
          lenis.start();
        }, 100);
      }
    };

    // Listen for mouse events to detect scrollbar interactions
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });

    const handleWheel = (e: WheelEvent) => {
      // Don't handle wheel events if scrollbar is being used
      if (isScrollbarInteraction) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!target) return;

      const scrollableParent = findScrollableParent(target);
      
      if (scrollableParent && scrollableParent !== document.documentElement && scrollableParent !== document.body) {
        // Check scroll boundaries with a threshold
        const threshold = 5;
        const canScrollUp = scrollableParent.scrollTop > threshold;
        const canScrollDown = 
          scrollableParent.scrollTop < scrollableParent.scrollHeight - scrollableParent.clientHeight - threshold;
        const canScrollLeft = scrollableParent.scrollLeft > threshold;
        const canScrollRight = 
          scrollableParent.scrollLeft < scrollableParent.scrollWidth - scrollableParent.clientWidth - threshold;

        // If we can scroll in the wheel direction within nested element
        if (
          (e.deltaY < 0 && canScrollUp) ||
          (e.deltaY > 0 && canScrollDown) ||
          (e.deltaX < 0 && canScrollLeft) ||
          (e.deltaX > 0 && canScrollRight)
        ) {
          // Clear any pending timeout
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }

          // Mark that we're scrolling nested content
          if (!isScrollingNested) {
            isScrollingNested = true;
            lenis.stop();
          }
          
          // Stop propagation to prevent Lenis from handling this
          e.stopPropagation();
          
          // Restart Lenis after scrolling stops
          scrollTimeout = setTimeout(() => {
            isScrollingNested = false;
            lenis.start();
          }, 150);
          
          return;
        }
      }

      // If we reach here, we're scrolling the main page
      // Clear nested scroll state if it was active
      if (isScrollingNested) {
        isScrollingNested = false;
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        lenis.start();
      }
    };

    // Intercept wheel events before Lenis processes them (capture phase)
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    // Animation frame loop
    function raf(time: number) {
      // Skip Lenis update if scrollbar is being interacted with
      if (!isScrollbarInteraction && !lenis.isStopped) {
        lenis.raf(time);
      }
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      document.removeEventListener('wheel', handleWheel, { capture: true } as any);
      document.removeEventListener('mousedown', handleMouseDown, { passive: true } as any);
      document.removeEventListener('mouseup', handleMouseUp, { passive: true } as any);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
      if (scrollbarInteractionTimeout) {
        clearTimeout(scrollbarInteractionTimeout);
        scrollbarInteractionTimeout = null;
      }
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).lenis;
    };
  }, [options]);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}

