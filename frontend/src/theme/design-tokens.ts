/**
 * RealVerse Design System
 * FC Real Bengaluru Brand Identity + Space/Universe Theme
 * 
 * Based on: https://www.behance.net/gallery/208845045/FC-REAL-BENGALURU-Brand-Identity
 */

export const colors = {
  // FC Real Bengaluru Brand Colors
  brand: {
    primaryBlue: '#043DD0',
    accentOrange: '#FFA900',
    secondaryGreen: '#2A996B',
    charcoal: '#1F1F1F',
    neutralGrey: '#A5A5A5',
    white: '#FFFFFF',
  },

  // Semantic Color System
  primary: {
    main: '#043DD0',
    light: '#2D5FE8',
    dark: '#032FA0',
    soft: 'rgba(4, 61, 208, 0.1)',
    outline: 'rgba(4, 61, 208, 0.2)',
  },

  accent: {
    main: '#FFA900',
    light: '#FFC233',
    dark: '#CC8700',
    soft: 'rgba(255, 169, 0, 0.1)',
    outline: 'rgba(255, 169, 0, 0.2)',
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

  // Space Theme Backgrounds - RealVerse Specification
  space: {
    deep: '#050B20', // Deep navy
    dark: '#0A1633', // Indigo
    medium: '#101C3A', // Dark indigo
    // Unified cosmic gradient for page backgrounds
    nebula: 'linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)',
    starfield: 'radial-gradient(circle at 20% 50%, rgba(255, 169, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(4, 61, 208, 0.08) 0%, transparent 50%)',
  },

  // Surface System - RealVerse Dark Glass Surfaces (NO WHITE)
  surface: {
    // Page background - never use white
    bg: '#050B20',
    // Section surface - semi-transparent dark blue glass
    section: 'rgba(18, 32, 64, 0.85)',
    // Card surface - slightly lighter than section
    card: '#141F3A',
    // Elevated card - for hover states
    elevated: '#172446',
    // Soft surface - for subtle backgrounds
    soft: 'rgba(15, 23, 42, 0.6)',
    // Dark surfaces
    dark: '#1F1F1F',
    darkElevated: '#2A2A2A',
  },

  // Text Colors - RealVerse Specification
  text: {
    primary: '#FFFFFF', // Page titles
    secondary: '#CDE7FF', // Section titles
    muted: '#9FB4D1', // Body text
    disabled: 'rgba(255, 255, 255, 0.45)', // Meta / muted
    inverted: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onAccent: '#1F1F1F',
    // Accent text colors
    accent: '#FFA900', // Orange accent
    success: '#2A996B', // Green
    warning: '#FFA900', // Orange
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
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    heading: "'Space Grotesk', 'Inter', sans-serif",
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

  // Type Scale
  display: {
    fontSize: '3.75rem',    // 60px
    fontWeight: 700,
    lineHeight: 1.2,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  h1: {
    fontSize: '2.25rem',    // 36px
    fontWeight: 700,
    lineHeight: 1.2,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  h2: {
    fontSize: '1.875rem',   // 30px
    fontWeight: 700,
    lineHeight: 1.3,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  h3: {
    fontSize: '1.5rem',     // 24px
    fontWeight: 600,
    lineHeight: 1.4,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  h4: {
    fontSize: '1.25rem',    // 20px
    fontWeight: 600,
    lineHeight: 1.4,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  h5: {
    fontSize: '1.125rem',   // 18px
    fontWeight: 600,
    lineHeight: 1.5,
    fontFamily: "'Space Grotesk', sans-serif",
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
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px
};

export const borderRadius = {
  none: '0',
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '1.25rem', // 20px - for section surfaces
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Space-themed glassmorphism
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  glassDark: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  
  // Floating effect
  floating: '0 20px 40px -12px rgba(4, 61, 208, 0.15), 0 0 0 1px rgba(4, 61, 208, 0.05)',
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

