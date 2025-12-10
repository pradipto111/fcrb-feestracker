// RealVerse Design System - FC Real Bengaluru Brand Identity
// Based on: https://www.behance.net/gallery/208845045/FC-REAL-BENGALURU-Brand-Identity

export const colors = {
  // Primary Brand Colors
  primary: {
    main: "#10B981", // Emerald Green - FC Real Bengaluru primary
    dark: "#059669",
    light: "#34D399",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    gradientLight: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
  },
  // Secondary Colors
  secondary: {
    main: "#1E40AF", // Royal Blue
    dark: "#1E3A8A",
    light: "#3B82F6",
  },
  // Accent Colors
  accent: {
    gold: "#F59E0B",
    orange: "#F97316",
    red: "#EF4444",
  },
  // Neutral Colors
  neutral: {
    black: "#0F172A",
    dark: "#1E293B",
    gray: "#64748B",
    light: "#F1F5F9",
    white: "#FFFFFF",
  },
  // Status Colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

export const typography = {
  // Font Families - Modern, Bold Sans-serif matching brand
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
    heading: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
  // Font Sizes
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
  },
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem",   // 64px
};

export const borderRadius = {
  sm: "0.375rem",  // 6px
  md: "0.5rem",    // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
};

export const transitions = {
  fast: "150ms ease-in-out",
  normal: "300ms ease-in-out",
  slow: "500ms ease-in-out",
};

// Gamification Elements
export const gamification = {
  badge: {
    gold: {
      background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      text: colors.neutral.white,
    },
    silver: {
      background: "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
      text: colors.neutral.white,
    },
    bronze: {
      background: "linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)",
      text: colors.neutral.white,
    },
  },
  card: {
    hover: {
      transform: "translateY(-4px)",
      shadow: shadows.xl,
    },
  },
};







