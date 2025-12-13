/**
 * useHomepageAnimation Hook
 * Centralized hook for accessing all homepage animation variants and utilities
 */

import { Variants } from "framer-motion";
import {
  pageVariants,
  sectionVariants,
  sectionVariantsLight,
  infinitySectionVariants,
  headingVariants,
  subheadingVariants,
  headingWordVariants,
  cardVariants,
  listItemVariants,
  listItemVariantsLight,
  statVariants,
  imageVariants,
  imageFloatVariants,
  imageRevealVariants,
  infinityAssetVariants,
  bridgeVariants,
  heroVariants,
  heroContentVariants,
  primaryButtonHover,
  primaryButtonTap,
  secondaryButtonHover,
  secondaryButtonTap,
  buttonVariants,
  cardHover,
  cardHoverLight,
  imageHover,
  softHoverScale,
  staggerContainer,
  staggerContainerSlow,
  linkVariants,
  viewportOnce,
  viewportOnceTight,
  getStaggerDelay,
  getCustomIndex,
  getMotionSafeVariants,
  prefersReducedMotion,
} from "../lib/animations/homepageAnimations";

export interface HomepageAnimationHook {
  // Variants
  pageVariants: Variants;
  sectionVariants: Variants;
  sectionVariantsLight: Variants;
  infinitySectionVariants: Variants;
  headingVariants: Variants;
  subheadingVariants: Variants;
  headingWordVariants: Variants;
  cardVariants: Variants;
  listItemVariants: Variants;
  listItemVariantsLight: Variants;
  statVariants: Variants;
  imageVariants: Variants;
  imageFloatVariants: Variants;
  imageRevealVariants: Variants;
  infinityAssetVariants: Variants;
  bridgeVariants: Variants;
  heroVariants: Variants;
  heroContentVariants: Variants;
  buttonVariants: Variants;
  linkVariants: Variants;
  staggerContainer: Variants;
  staggerContainerSlow: Variants;
  
  // Hover effects
  cardHover: typeof cardHover;
  cardHoverLight: typeof cardHoverLight;
  imageHover: typeof imageHover;
  softHoverScale: typeof softHoverScale;
  
  // Button interactions
  primaryButtonHover: typeof primaryButtonHover;
  primaryButtonTap: typeof primaryButtonTap;
  secondaryButtonHover: typeof secondaryButtonHover;
  secondaryButtonTap: typeof secondaryButtonTap;
  
  // Viewport configs
  viewportOnce: typeof viewportOnce;
  viewportOnceTight: typeof viewportOnceTight;
  
  // Utilities
  getStaggerDelay: (index: number, baseDelay?: number) => number;
  getCustomIndex: (index: number) => number;
  getMotionSafeVariants: (variants: Variants) => Variants;
  prefersReducedMotion: () => boolean;
  
  // Helper function for staggered cards
  getStaggeredCard: (index: number) => {
    custom: number;
    variants: Variants;
  };
  
  // Helper function for staggered list items
  getStaggeredListItem: (index: number) => {
    custom: number;
    variants: Variants;
  };
}

/**
 * Hook to access all homepage animation variants and utilities
 * 
 * @example
 * ```tsx
 * const {
 *   sectionVariants,
 *   headingVariants,
 *   cardVariants,
 *   getStaggeredCard,
 *   viewportOnce,
 * } = useHomepageAnimation();
 * 
 * return (
 *   <motion.section
 *     variants={sectionVariants}
 *     initial="offscreen"
 *     whileInView="onscreen"
 *     viewport={viewportOnce}
 *   >
 *     <motion.h2 variants={headingVariants}>Title</motion.h2>
 *     {items.map((item, idx) => (
 *       <motion.div
 *         key={item.id}
 *         {...getStaggeredCard(idx)}
 *       >
 *         {item.content}
 *       </motion.div>
 *     ))}
 *   </motion.section>
 * );
 * ```
 */
export function useHomepageAnimation(): HomepageAnimationHook {
  return {
    // Variants
    pageVariants,
    sectionVariants,
    sectionVariantsLight,
    infinitySectionVariants,
    headingVariants,
    subheadingVariants,
    headingWordVariants,
    cardVariants,
    listItemVariants,
    listItemVariantsLight,
    statVariants,
    imageVariants,
    imageFloatVariants,
    imageRevealVariants,
    infinityAssetVariants,
    bridgeVariants,
    heroVariants,
    heroContentVariants,
    buttonVariants,
    linkVariants,
    staggerContainer,
    staggerContainerSlow,
    
    // Hover effects
    cardHover,
    cardHoverLight,
    imageHover,
    softHoverScale,
    
    // Button interactions
    primaryButtonHover,
    primaryButtonTap,
    secondaryButtonHover,
    secondaryButtonTap,
    
    // Viewport configs
    viewportOnce,
    viewportOnceTight,
    
    // Utilities
    getStaggerDelay,
    getCustomIndex,
    getMotionSafeVariants,
    prefersReducedMotion,
    
    // Helper for staggered cards
    getStaggeredCard: (index: number) => ({
      custom: index,
      variants: cardVariants,
    }),
    
    // Helper for staggered list items
    getStaggeredListItem: (index: number) => ({
      custom: index,
      variants: listItemVariants,
    }),
  };
}


