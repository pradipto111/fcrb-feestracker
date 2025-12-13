/**
 * useParallaxMotion Hook
 * Provides subtle parallax effects for hero images and large visuals
 * Inspired by premium motion design - keeps parallax subtle (few pixels)
 */

import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef, RefObject } from 'react';
import React from 'react';

interface ParallaxOptions {
  speed?: number; // Parallax speed multiplier (0.1 - 0.5 recommended)
  offset?: [number, number]; // Start and end scroll positions (0-1)
}

interface ParallaxResult {
  ref: React.RefObject<HTMLDivElement>;
  y: MotionValue<number>;
  opacity?: MotionValue<number>;
  scale?: MotionValue<number>;
}

/**
 * Hook for subtle parallax motion on scroll
 * 
 * @param options - Parallax configuration
 * @returns Motion values for y transform, opacity, and scale
 * 
 * @example
 * ```tsx
 * const { y, opacity } = useParallaxMotion({ speed: 0.3 });
 * 
 * return (
 *   <motion.div
 *     ref={ref}
 *     style={{ y, opacity }}
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function useParallaxMotion(
  options: ParallaxOptions = {}
): ParallaxResult {
  const { speed = 0.2, offset = [0, 1] } = options;
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${offset[0]}`, `end ${offset[1]}`],
  });

  // Subtle vertical movement (few pixels)
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 50]);
  
  // Optional: Fade in/out based on scroll
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.3, 1, 1, 0.3]
  );
  
  // Optional: Subtle scale effect
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1 + speed * 0.1]
  );

  return {
    ref: ref as RefObject<HTMLDivElement>,
    y,
    opacity,
    scale,
  };
}

/**
 * Hook for hero background parallax (more pronounced)
 */
export function useHeroParallax(options: ParallaxOptions = {}) {
  const { speed = 0.15 } = options;
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
    layoutEffect: false, // Use layoutEffect: false to avoid positioning warnings
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.7]);

  return {
    ref,
    y,
    opacity,
  };
}

