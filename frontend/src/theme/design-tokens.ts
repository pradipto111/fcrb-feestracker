/**
 * RealVerse Design System
 * FC Real Bengaluru Brand Identity - Football-First, Community-Oriented
 * 
 * Philosophy: Modern, emotional, football-first club identity
 * Warm, community-oriented, human, energetic - NOT tech-startup/AI-tool aesthetic
 * 
 * Based on: https://www.behance.net/gallery/208845045/FC-REAL-BENGALURU-Brand-Identity
 * Inspired by: Premier League, LaLiga, MLS, Nike/Adidas layouts, community football NGOs
 */

export const colors = {
  // FC Real Bengaluru Brand Colors - Football-First Palette
  brand: {
    primaryBlue: '#0A3D91', // Royal blue - primary club color
    accentGold: '#F5B300', // FC Real Bengaluru gold - secondary club color
    secondaryGreen: '#2A996B',
    offWhite: '#F5F5F5', // Off-white for backgrounds
    deepNavy: '#020C1B', // Deep navy for dark sections
    softGrey: '#1C2430', // Soft grey for subtle elements
    white: '#FFFFFF',
  },

  // Semantic Color System - Football Club Identity
  primary: {
    main: '#0A3D91', // Royal blue
    light: '#1E5BB8',
    dark: '#072A6B',
    soft: 'rgba(10, 61, 145, 0.1)',
    outline: 'rgba(10, 61, 145, 0.2)',
  },

  accent: {
    main: '#F5B300', // FC Real Bengaluru gold
    light: '#FFC233',
    dark: '#CC9500',
    soft: 'rgba(245, 179, 0, 0.1)',
    outline: 'rgba(245, 179, 0, 0.2)',
  },

  success: {
    main: '#2A996B',
    light: '#4DB88A',
    dark: '#1F6F4F',
    soft: 'rgba(42, 153, 107, 0.1)',
  },

  warning: {
    main: '#FFA900',
    light: '#FFC233',
    dark: '#CC8700',
    soft: 'rgba(255, 169, 0, 0.1)',
  },

  danger: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    soft: 'rgba(239, 68, 68, 0.1)',
  },

  info: {
    main: '#043DD0',
    light: '#2D5FE8',
    dark: '#032FA0',
    soft: 'rgba(4, 61, 208, 0.1)',
  },

  // Football Club Backgrounds - Subtle, Warm, Community-Focused
  club: {
    deep: '#020C1B', // Deep navy
    dark: '#0A1633', // Dark blue
    medium: '#1C2430', // Soft grey
    // Subtle gradient for page backgrounds (no neon, no hyper-futuristic)
    background: 'linear-gradient(135deg, #020C1B 0%, #0A1633 30%, #1C2430 60%, #020C1B 100%)',
    // Subtle overlay for texture (stadium light grain, turf pattern)
    overlay: 'radial-gradient(circle at 20% 50%, rgba(245, 179, 0, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(10, 61, 145, 0.06) 0%, transparent 50%)',
  },

  // Surface System - Football Broadcast Style (Clean, Bold, Readable)
  surface: {
    // Page background - deep navy
    bg: '#020C1B',
    // Section surface - semi-transparent with subtle texture
    section: 'rgba(28, 36, 48, 0.85)',
    // Card surface - clean, readable
    card: '#1C2430',
    // Elevated card - for hover states (sports-broadcast style)
    elevated: '#243040',
    // Soft surface - for subtle backgrounds
    soft: 'rgba(28, 36, 48, 0.6)',
    // Light surface - for contrast
    light: '#F5F5F5',
    // Dark surfaces
    dark: '#0A1633',
    darkElevated: '#1C2430',
  },

  // Text Colors - Football Club Readability (Bold, Clear, Human)
  text: {
    primary: '#FFFFFF', // Page titles - bold, expressive
    secondary: '#E8E8E8', // Section titles - warm, readable
    muted: '#B0B0B0', // Body text - clear, not too light
    disabled: 'rgba(255, 255, 255, 0.5)', // Meta / muted
    inverted: '#020C1B', // For light backgrounds
    onPrimary: '#FFFFFF',
    onAccent: '#020C1B', // Dark text on gold
    // Accent text colors - football club palette
    accent: '#F5B300', // Gold accent
    success: '#2A996B', // Green
    warning: '#F5B300', // Gold
    danger: '#EF4444', // Red
  },

  // Border Colors
  border: {
    light: '#E5E5E5',
    medium: '#A5A5A5',
    dark: '#4A4A4A',
  },
};

export const typography = {
  fontFamily: {
    // Sports-focused typography - bold, expressive, human
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    // Headlines - semi-condensed, bold, expressive (like Nike, Adidas, MLS)
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", // Will use bold weights for sports feel
    // Alternative: Consider adding 'Rubik' or 'Barlow Semi Condensed' for more sports feel
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Type Scale - Sports Typography (Bold, Expressive, Human)
  display: {
    fontSize: '3.75rem',    // 60px
    fontWeight: 800, // Extra bold for sports impact
    lineHeight: 1.1, // Tighter for impact
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '-0.02em', // Slightly condensed
  },

  h1: {
    fontSize: '2.5rem',    // 40px - larger for impact
    fontWeight: 800, // Extra bold
    lineHeight: 1.15,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '-0.01em',
  },

  h2: {
    fontSize: '2rem',   // 32px
    fontWeight: 700, // Bold
    lineHeight: 1.2,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '-0.01em',
  },

  h3: {
    fontSize: '1.5rem',     // 24px
    fontWeight: 700, // Bold
    lineHeight: 1.25,
    fontFamily: "'Inter', sans-serif",
  },

  h4: {
    fontSize: '1.25rem',    // 20px
    fontWeight: 700, // Bold
    lineHeight: 1.3,
    fontFamily: "'Inter', sans-serif",
  },

  h5: {
    fontSize: '1.125rem',   // 18px
    fontWeight: 600, // Semi-bold
    lineHeight: 1.4,
    fontFamily: "'Inter', sans-serif",
  },

  body: {
    fontSize: '1rem',       // 16px
    fontWeight: 400,
    lineHeight: 1.5,
    fontFamily: "'Inter', sans-serif",
  },

  caption: {
    fontSize: '0.875rem',   // 14px
    fontWeight: 400,
    lineHeight: 1.5,
    fontFamily: "'Inter', sans-serif",
  },

  overline: {
    fontSize: '0.75rem',    // 12px
    fontWeight: 600,
    lineHeight: 1.5,
    fontFamily: "'Inter', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};

export const spacing = {
  // Football Club Spacing System - Exact Scale: 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64
  // Hard rule: 24px minimum text distance from borders (readable text zones)
  // Hard rule: 32px minimum padding inside all container cards
  // Hard rule: 48-64px vertical spacing between major sections
  '4': '0.25rem',   // 4px
  '6': '0.375rem',  // 6px
  '8': '0.5rem',    // 8px
  '12': '0.75rem',  // 12px
  '16': '1rem',     // 16px
  '20': '1.25rem',  // 20px
  '24': '1.5rem',   // 24px - MINIMUM text distance from borders
  '32': '2rem',     // 32px - MINIMUM card padding
  '40': '2.5rem',   // 40px
  '48': '3rem',     // 48px - MINIMUM section spacing
  '64': '4rem',     // 64px - Preferred section spacing
  
  // Legacy aliases for backward compatibility
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
  
  // Card-specific spacing
  cardPadding: '2rem', // 32px - enforced minimum
  textZone: '1.5rem', // 24px - minimum text distance from borders
  sectionGap: '4rem', // 64px - preferred between sections
};

export const borderRadius = {
  // Football Club Card Style - Rounded corners 12-16px
  none: '0',
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px - Standard card corners
  xl: '1rem',      // 16px - Preferred card corners
  '2xl': '1.5rem', // 24px - Large cards
  '3xl': '1.25rem', // 20px - Section surfaces
  full: '9999px', // Pills/badges
  // Football-specific
  card: '1rem', // 16px - standard card radius
  button: '0.5rem', // 8px - button radius (sports badge feel)
};

export const shadows = {
  // Football Broadcast Style Shadows - Soft, Sports-Broadcast Feel
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.1)',
  xl: '0 12px 24px -6px rgba(0, 0, 0, 0.25), 0 6px 12px -3px rgba(0, 0, 0, 0.15)',
  '2xl': '0 16px 32px -8px rgba(0, 0, 0, 0.3)',
  
  // Card shadows - sports broadcast style
  card: '0 8px 24px -4px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  cardHover: '0 12px 32px -6px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  
  // Button shadows - minimal glow, sports badge feel
  button: '0 4px 12px -2px rgba(0, 0, 0, 0.2)',
  buttonHover: '0 6px 16px -3px rgba(0, 0, 0, 0.3)',
  
  // NO neon glows - replaced with subtle, warm shadows
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Space theme utilities
export const spaceTheme = {
  // Orbit/Path styles for separators
  orbitSeparator: {
    height: '1px',
    background: `linear-gradient(90deg, transparent 0%, ${colors.border.medium} 50%, transparent 100%)`,
    position: 'relative' as const,
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: colors.accent.main,
      boxShadow: `0 0 8px ${colors.accent.main}`,
    },
  },

  // Constellation-style dashed lines
  constellationLine: {
    border: `1px dashed ${colors.border.medium}`,
    borderStyle: 'dashed',
    opacity: 0.3,
  },

  // Planet/node representation
  planetNode: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: `radial-gradient(circle at 30% 30%, ${colors.accent.light}, ${colors.accent.main})`,
    boxShadow: `0 0 12px ${colors.accent.main}, inset -2px -2px 4px rgba(0,0,0,0.2)`,
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

