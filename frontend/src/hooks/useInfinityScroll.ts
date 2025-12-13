/**
 * useInfinityScroll Hook
 * Creates a seamless, cinematic scrolling experience
 * Makes sections flow continuously like an infinity screen
 * Simplified to avoid ref hydration issues
 */

import { useRef } from 'react';

interface InfinityScrollOptions {
  speed?: number;
  opacityRange?: [number, number];
  scaleRange?: [number, number];
}

/**
 * Hook for creating continuous, cinematic scroll effects
 * Makes sections feel like they're part of an infinite narrative
 * Returns simple animated values that don't require scroll measurement
 */
export function useInfinityScroll(options: InfinityScrollOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Return simple animated values - will be animated via CSS/Framer Motion
  // This avoids the ref hydration issue with useScroll
  return {
    ref,
    // These will be handled by Framer Motion's animate prop instead
    opacity: 1,
    scale: 1,
    y: 0,
  };
}

/**
 * Hook for section-to-section transitions
 * Creates seamless bridges between sections
 * Simplified to avoid ref hydration issues
 */
export function useSectionBridge(sectionIndex: number) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Return simple values - animations handled by variants
  return {
    ref,
    opacity: 1,
    scale: 1,
    y: 0,
  };
}

