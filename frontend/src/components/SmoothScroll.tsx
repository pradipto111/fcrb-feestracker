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
    const isTouchOrTablet = window.matchMedia("(max-width: 1024px)").matches || "ontouchstart" in window;
    const isRealverseRoute = window.location.pathname.startsWith("/realverse");

    // Keep native scrolling for role dashboards and touch/tablet.
    // This removes wheel interception overhead and nested-scroll conflicts.
    if (prefersReducedMotion || isTouchOrTablet || isRealverseRoute) {
      delete (window as any).lenis;
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false, // Disable on touch devices for better performance
      touchMultiplier: 1.5,
      infinite: false,
      ...options,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
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

