/**
 * FC Real Bengaluru Animation System
 * Premium motion language inspired by Clifford Glass Studio
 * Centralized Framer Motion variants for consistent animations across the entire ecosystem
 */

import { Variants } from 'framer-motion';

// Premium easing curves - confident, calm, no bounce
const easeStandard = [0.4, 0, 0.2, 1] as const; // Material Design standard
const easeInOut = [0.25, 0.1, 0.25, 1] as const; // Smooth in-out
const easeOut = [0.25, 0.46, 0.45, 0.94] as const; // Gentle deceleration
const easeIn = [0.4, 0, 1, 1] as const; // Subtle acceleration
const easePremium = [0.22, 1, 0.36, 1] as const; // Premium feel - no overshoot

// ============================================
// PAGE-LEVEL VARIANTS (Route Transitions)
// ============================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easePremium,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: easePremium,
    },
  },
};

// ============================================
// SECTION VARIANTS (Scroll-triggered fade/slide)
// ============================================

export const sectionVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 40,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easePremium,
    },
  },
};

// Infinity screen variant - seamless, continuous transitions
export const infinitySectionVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 60,
    scale: 0.98,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      ease: easePremium,
    },
  },
};

// Lighter variant for internal/dashboard pages
export const sectionVariantsLight: Variants = {
  offscreen: {
    opacity: 0,
    y: 20,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easePremium,
    },
  },
};

// ============================================
// HEADING VARIANTS (Large typography with gentle rise)
// ============================================

export const headingVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 30,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easePremium,
    },
  },
};

export const subheadingVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 20,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easePremium,
      delay: 0.1,
    },
  },
};

// Word-by-word stagger for large headlines
export const headingWordVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 20,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easePremium,
    },
  },
};

// ============================================
// CARD VARIANTS (Staggered slide-in with hover lift)
// ============================================

export const cardVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  onscreen: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: easePremium,
    },
  }),
};

// Card hover effects - subtle lift and glow
export const cardHover = {
  scale: 1.03,
  y: -6,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  transition: {
    duration: 0.3,
    ease: easePremium,
  },
};

// Lighter hover for internal pages
export const cardHoverLight = {
  scale: 1.01,
  y: -2,
  transition: {
    duration: 0.2,
    ease: easePremium,
  },
};

// ============================================
// LIST ITEM VARIANTS (for fixtures, news, etc.)
// ============================================

export const listItemVariants: Variants = {
  offscreen: {
    opacity: 0,
    x: -30,
  },
  onscreen: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: easePremium,
    },
  }),
};

// Lighter variant for internal pages
export const listItemVariantsLight: Variants = {
  offscreen: {
    opacity: 0,
    x: -15,
  },
  onscreen: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.3,
      ease: easePremium,
    },
  }),
};

// ============================================
// STAT / COUNTER VARIANTS
// ============================================

export const statVariants: Variants = {
  offscreen: {
    opacity: 0,
    scale: 0.9,
  },
  onscreen: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.4,
      ease: easeOut,
    },
  }),
};

// ============================================
// IMAGE VARIANTS (Fade + upward motion, hover zoom)
// ============================================

export const imageVariants: Variants = {
  offscreen: {
    opacity: 0,
    scale: 1.08,
    y: 20,
  },
  onscreen: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easePremium,
    },
  },
};

// Subtle parallax/float effect for hero images
export const imageFloatVariants: Variants = {
  offscreen: {
    opacity: 0,
    scale: 1.12,
    y: 30,
  },
  onscreen: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easePremium,
    },
  },
};

// Image hover - subtle zoom
export const imageHover = {
  scale: 1.05,
  transition: {
    duration: 0.4,
    ease: easePremium,
  },
};

// Masked reveal variant (clip-path or overlay)
export const imageRevealVariants: Variants = {
  offscreen: {
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)',
  },
  onscreen: {
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: {
      duration: 0.8,
      ease: easePremium,
    },
  },
};

// ============================================
// HERO VARIANTS
// ============================================

export const heroVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const heroContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
    },
  },
};

// ============================================
// BUTTON VARIANTS (Fade/slide in, subtle hover)
// ============================================

export const primaryButtonHover = {
  scale: 1.02,
  y: -2,
  boxShadow: '0 0 20px rgba(0, 230, 255, 0.45)',
  transition: {
    duration: 0.25,
    ease: easePremium,
  },
};

export const primaryButtonTap = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: easePremium,
  },
};

export const secondaryButtonHover = {
  scale: 1.01,
  y: -1,
  boxShadow: '0 0 15px rgba(0, 230, 255, 0.3)',
  transition: {
    duration: 0.25,
    ease: easePremium,
  },
};

export const secondaryButtonTap = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: easePremium,
  },
};

// Button fade-in variants
export const buttonVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 10,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easePremium,
      delay: 0.2,
    },
  },
};

// ============================================
// STAGGER CONTAINER VARIANTS
// ============================================

export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Slower stagger for gallery/project grids
export const staggerContainerSlow: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.15,
    },
  },
};

// ============================================
// VIEWPORT CONFIGURATION
// ============================================

export const viewportOnce = {
  once: true,
  amount: 0.3,
  margin: '-100px',
} as const;

export const viewportOnceTight = {
  once: true,
  amount: 0.2,
  margin: '-50px',
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get delay for staggered animations
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0.06): number => {
  return index * baseDelay;
};

/**
 * Get custom prop for variants that accept index
 */
export const getCustomIndex = (index: number) => index;

// ============================================
// LINK VARIANTS (Underline/fill animation on hover)
// ============================================

export const linkVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 5,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easePremium,
    },
  },
};

// Underline hover animation helper
export const underlineHover = {
  '&::after': {
    scaleX: 1,
  },
};

// ============================================
// SOFT HOVER SCALE (Subtle zoom for cards/images)
// ============================================

export const softHoverScale = {
  scale: 1.02,
  transition: {
    duration: 0.3,
    ease: easePremium,
  },
};

// ============================================
// REDUCED MOTION SUPPORT
// ============================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get motion-safe variants (respects reduced motion)
 */
export const getMotionSafeVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return minimal motion variants
    return {
      offscreen: { opacity: 0 },
      onscreen: {
        opacity: 1,
        transition: { duration: 0.2 },
      },
    };
  }
  return variants;
};

// ============================================
// INFINITY SCREEN - CONTINUOUS FLOW VARIANTS
// ============================================

// Continuous fade for assets as they scroll
export const infinityAssetVariants: Variants = {
  offscreen: {
    opacity: 0,
    scale: 1.1,
    y: 30,
  },
  onscreen: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: easePremium,
    },
  },
};

// Bridge element between sections
export const bridgeVariants: Variants = {
  offscreen: {
    opacity: 0,
    scale: 0.95,
  },
  onscreen: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: easePremium,
    },
  },
};


