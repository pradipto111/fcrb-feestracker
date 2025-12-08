/**
 * RealVerse Motion Utilities
 * Framer Motion variants and CSS animation utilities
 */

import { Variants } from 'framer-motion';

// Page container variants (Framer Motion)
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    filter: 'blur(6px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.36,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 1.02,
    filter: 'blur(6px)',
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Card variants with stagger support
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.28,
      ease: [0.25, 0.1, 0.25, 1]
    }
  })
};

// Button hover/tap motion
export const primaryButtonWhileHover = {
  scale: 1.02,
  boxShadow: "0 0 18px rgba(0, 230, 255, 0.4)"
};

export const primaryButtonWhileTap = {
  scale: 0.96
};

export const secondaryButtonWhileHover = {
  scale: 1.01,
  boxShadow: "0 0 12px rgba(0, 230, 255, 0.2)"
};

export const secondaryButtonWhileTap = {
  scale: 0.98
};

// Logo loader variants
export const loaderVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

// Page container variants (for CSS classes)
export const pageMotionClasses = {
  enter: 'rv-page-enter',
  exit: 'rv-page-exit',
};

// Card animation delays for staggered effects
export const cardStaggerDelays = {
  0: 0,
  1: 0.05,
  2: 0.1,
  3: 0.15,
  4: 0.2,
  5: 0.25,
};

// Button motion classes
export const buttonMotionClasses = {
  primary: 'rv-btn-primary',
  secondary: 'rv-btn-secondary',
  utility: 'rv-btn-utility',
  danger: 'rv-btn-danger',
};

// Skeleton loader class
export const skeletonClass = 'rv-skeleton';

// Star particle class
export const starClass = 'rv-star';

// Logo loader classes
export const logoLoaderClasses = {
  container: 'rv-logo-loader',
  orbit: 'rv-logo-loader__orbit',
  glow: 'rv-logo-loader__glow',
};

/**
 * Get animation delay for staggered card animations
 */
export const getCardDelay = (index: number): number => {
  return Math.min(index * 0.05, 0.3);
};

/**
 * Generate random delay for star particles
 */
export const getStarDelay = (): number => {
  return Math.random() * 6;
};

/**
 * Generate random position for star particles
 */
export const getStarPosition = () => {
  return {
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${getStarDelay()}s`,
  };
};

