# FC Real Bengaluru Motion System Guide

## Overview

This document describes the premium motion system inspired by [Clifford Glass Studio](https://www.cliffordglassstudio.co.uk), applied consistently across the entire FC Real Bengaluru ecosystem.

## Core Principles

- **Confident, Calm, Premium**: No bounce, overshoot, or cartoonish easing
- **Subtle & Refined**: Parallax is minimal (few pixels), animations are smooth
- **Performance-First**: GPU-friendly transforms (translate/opacity/scale)
- **Accessible**: Respects `prefers-reduced-motion`

## Animation System Architecture

### 1. Core Animation Variants (`src/lib/animations/homepageAnimations.ts`)

#### Page Transitions
- `pageVariants`: Smooth fade/slide between routes
- Used in `PageTransition` component wrapper

#### Section Animations
- `sectionVariants`: Scroll-triggered fade/slide for public pages
- `sectionVariantsLight`: Lighter version for internal/dashboard pages

#### Typography
- `headingVariants`: Large typography with gentle rise
- `subheadingVariants`: Secondary text with slight delay
- `headingWordVariants`: Word-by-word stagger for headlines

#### Cards & Lists
- `cardVariants`: Staggered slide-in with hover lift
- `listItemVariants`: Horizontal slide-in for lists
- `listItemVariantsLight`: Lighter version for dashboards

#### Images
- `imageVariants`: Fade + upward motion on enter
- `imageFloatVariants`: Parallax-ready hero images
- `imageRevealVariants`: Masked reveal effect
- `imageHover`: Subtle zoom on hover

#### Buttons & Links
- `buttonVariants`: Fade/slide in for CTAs
- `linkVariants`: Underline animation support
- `primaryButtonHover/Tap`: Button interactions
- `secondaryButtonHover/Tap`: Secondary button interactions

#### Hover Effects
- `cardHover`: Lift + glow for cards
- `cardHoverLight`: Subtle lift for internal pages
- `softHoverScale`: Gentle zoom
- `imageHover`: Image zoom

### 2. Parallax Hook (`src/hooks/useParallaxMotion.ts`)

```tsx
import { useParallaxMotion, useHeroParallax } from '../hooks/useParallaxMotion';

// For general parallax
const { ref, y, opacity, scale } = useParallaxMotion({ speed: 0.2 });

// For hero backgrounds
const heroParallax = useHeroParallax({ speed: 0.15 });
```

### 3. Animation Hook (`src/hooks/useHomepageAnimation.ts`)

Centralized access to all variants:

```tsx
import { useHomepageAnimation } from '../hooks/useHomepageAnimation';

const {
  sectionVariants,
  headingVariants,
  cardVariants,
  getStaggeredCard,
  cardHover,
  viewportOnce,
} = useHomepageAnimation();
```

### 4. Smooth Scroll (`src/components/SmoothScroll.tsx`)

Wraps the app for inertial scrolling using Lenis. Automatically respects `prefers-reduced-motion`.

### 5. Page Transitions (`src/components/PageTransition.tsx`)

Wraps routes for smooth fade/slide transitions between pages.

## Usage Patterns

### Public Pages (Home, Shop, Brochure, etc.)

```tsx
import { useHomepageAnimation } from '../hooks/useHomepageAnimation';
import { useParallaxMotion } from '../hooks/useParallaxMotion';

const {
  sectionVariants,
  headingVariants,
  cardVariants,
  getStaggeredCard,
  cardHover,
  imageHover,
  viewportOnce,
} = useHomepageAnimation();

// Hero section with parallax
const heroParallax = useParallaxMotion({ speed: 0.15 });

return (
  <motion.section
    ref={heroParallax.ref}
    variants={sectionVariants}
    initial="offscreen"
    whileInView="onscreen"
    viewport={viewportOnce}
  >
    <motion.h1 variants={headingVariants}>Title</motion.h1>
    
    {/* Cards with stagger */}
    {items.map((item, idx) => (
      <motion.div
        key={item.id}
        {...getStaggeredCard(idx)}
        whileHover={cardHover}
      >
        <motion.img
          src={item.image}
          whileHover={imageHover}
        />
      </motion.div>
    ))}
  </motion.section>
);
```

### Internal/RealVerse Pages (Dashboards, Admin)

Use lighter variants:

```tsx
const {
  sectionVariantsLight,
  listItemVariantsLight,
  cardHoverLight,
  viewportOnce,
} = useHomepageAnimation();

return (
  <motion.section
    variants={sectionVariantsLight}
    initial="offscreen"
    whileInView="onscreen"
    viewport={viewportOnce}
  >
    {items.map((item, idx) => (
      <motion.div
        key={item.id}
        variants={listItemVariantsLight}
        custom={idx}
        whileHover={cardHoverLight}
      >
        {item.content}
      </motion.div>
    ))}
  </motion.section>
);
```

## Applied Pages

### ✅ Completed
- **LandingPage**: Full motion system with parallax hero, staggered sections
- **ShopPage**: Enhanced product grid with hover effects
- **App.tsx**: Smooth scroll and page transitions integrated

### 📋 To Apply (Follow Same Pattern)
- **BrochurePage**: Apply sectionVariants, headingVariants, cardVariants
- **RealVerse Dashboards**: Apply sectionVariantsLight, listItemVariantsLight
- **Admin Pages**: Apply toned-down motion
- **Other Public Pages**: Follow LandingPage pattern

## Performance Considerations

1. **GPU-Friendly**: Only animate `transform`, `opacity`, `scale`
2. **Limited Parallax**: Use only on hero/feature images, not globally
3. **Viewport Once**: Use `viewportOnce` to prevent re-animations
4. **Reduced Motion**: System automatically respects user preferences

## Accessibility

- All animations respect `prefers-reduced-motion`
- Keyboard navigation maintained
- Screen reader compatible
- No motion lock on mobile

## Easing Curves

- `easePremium`: [0.22, 1, 0.36, 1] - No overshoot, premium feel
- `easeStandard`: [0.4, 0, 0.2, 1] - Material Design standard
- `easeInOut`: [0.25, 0.1, 0.25, 1] - Smooth transitions

## Next Steps

1. Apply motion to remaining public pages (Brochure, etc.)
2. Apply toned-down motion to RealVerse dashboards
3. Test on mobile devices
4. Performance audit with Lighthouse
5. Gather user feedback on motion feel

---

**Note**: The motion system is designed to feel premium and confident, matching the FC Real Bengaluru brand identity while maintaining excellent performance and accessibility.



