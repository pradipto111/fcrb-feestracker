/**
 * FC Real Bengaluru - Centralized Asset Registry
 * All image and video assets from the official website
 */

const BASE_URL = 'https://realbengaluru.com/wp-content/uploads';

// ============================================
// CLUB ASSETS
// ============================================
export const clubAssets = {
  logo: {
    main: `${BASE_URL}/2024/12/web-logo-header.png`,
    cropped: `${BASE_URL}/2024/12/cropped-web-logo-header.png`,
    white: `${BASE_URL}/2025/01/FCRB_White-300x300.png`,
    withStroke: `${BASE_URL}/2025/01/logo-with-stroke.png`,
    crestCropped: `${BASE_URL}/2024/12/cropped-web-logo-header.png`,
    favicon32: `${BASE_URL}/2024/12/cropped-web-logo-header-32x32.png`,
    favicon192: `${BASE_URL}/2024/12/cropped-web-logo-header-192x192.png`,
    favicon180: `${BASE_URL}/2024/12/cropped-web-logo-header-180x180.png`,
  },
  teamCelebration: `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
  teamHuddle: `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
};

// ============================================
// HERO ASSETS
// ============================================
export const heroAssets = {
  // Main team background - large stadium/field image
  teamBackground: `${BASE_URL}/2025/01/DSC1122-scaled.jpg`,
  teamBackground2048: `${BASE_URL}/2025/01/DSC1122-2048x1365.jpg`,
  teamBackground1536: `${BASE_URL}/2025/01/DSC1122-1536x1024.jpg`,
  teamBackground1024: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
  teamBackground768: `${BASE_URL}/2025/01/DSC1122-768x512.jpg`,
  teamBackground300: `${BASE_URL}/2025/01/DSC1122-300x200.jpg`,
  
  // Player cutout - isolated player image
  playerCutout: `${BASE_URL}/2025/01/hero-player-639x1024.png`,
  playerCutout768: `${BASE_URL}/2025/01/hero-player-768x1230.png`,
  playerCutout300: `${BASE_URL}/2025/01/hero-player-187x300.png`,
  
  // Overlay gradients (CSS-based, defined here for reference)
  overlayGradient: 'linear-gradient(135deg, rgba(5, 11, 32, 0.85) 0%, rgba(5, 11, 32, 0.4) 50%, rgba(5, 11, 32, 0.85) 100%)',
  overlayGradientLeft: 'linear-gradient(to right, rgba(5, 11, 32, 0.9) 0%, rgba(5, 11, 32, 0.5) 60%, transparent 100%)',
  overlayGradientRight: 'linear-gradient(to left, rgba(5, 11, 32, 0.9) 0%, rgba(5, 11, 32, 0.5) 60%, transparent 100%)',
  overlayGradientBottom: 'linear-gradient(to top, rgba(5, 11, 32, 0.9) 0%, rgba(5, 11, 32, 0.3) 50%, transparent 100%)',
  
  // Background video (YouTube embed from old homepage)
  backgroundVideo: 'https://www.youtube.com/watch?v=_iplvxf8JCo',
  backgroundVideoEmbed: 'https://www.youtube.com/embed/_iplvxf8JCo?autoplay=1&mute=1&loop=1&playlist=_iplvxf8JCo&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&fs=0&cc_load_policy=0&start=0',
  
  // CTA banner image
  cta: `${BASE_URL}/2025/01/image-cta-home-1.png`,
  cta768: `${BASE_URL}/2025/01/image-cta-home-1-768x582.png`,
  cta300: `${BASE_URL}/2025/01/image-cta-home-1-300x227.png`,
};

// ============================================
// MATCH ASSETS
// ============================================
export const matchAssets = {
  // Last match strip background
  lastMatchStripBg: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
  
  // Recent match thumbnails
  recentMatchThumbs: [
    {
      fcrbLogo: `${BASE_URL}/2025/01/logo-with-stroke.png`,
      opponent: `${BASE_URL}/2025/06/134451085_701318057196919_7024450198469247756_n-modified-1024x1024.png`,
    },
    {
      fcrbLogo: `${BASE_URL}/2025/01/logo-with-stroke.png`,
      opponent: `${BASE_URL}/2025/06/f89a1bed-111f-46c3-9e22-1bbd577f5526-modified.png`,
    },
    {
      fcrbLogo: `${BASE_URL}/2025/01/logo-with-stroke.png`,
      opponent: `${BASE_URL}/2025/06/images-modified.png`,
    },
  ],
  
  goalFootball: `${BASE_URL}/2025/04/goal-football.png`,
};

// ============================================
// GALLERY ASSETS
// ============================================
export const galleryAssets = {
  actionShots: [
    {
      full: `${BASE_URL}/2025/01/DSC0335-scaled.jpg`,
      large: `${BASE_URL}/2025/01/DSC0335-2048x1365.jpg`,
      medium: `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
      small: `${BASE_URL}/2025/01/DSC0335-768x512.jpg`,
      thumbnail: `${BASE_URL}/2025/01/DSC0335-300x200.jpg`,
    },
    {
      full: `${BASE_URL}/2025/01/DSC1940-scaled.jpg`,
      large: `${BASE_URL}/2025/01/DSC1940-2048x1365.jpg`,
      medium: `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
      small: `${BASE_URL}/2025/01/DSC1940-768x512.jpg`,
      thumbnail: `${BASE_URL}/2025/01/DSC1940-300x200.jpg`,
    },
    {
      full: `${BASE_URL}/2025/01/IMG_1050-scaled.jpg`,
      large: `${BASE_URL}/2025/01/IMG_1050-2048x1365.jpg`,
      medium: `${BASE_URL}/2025/01/IMG_1050-1024x683.jpg`,
      small: `${BASE_URL}/2025/01/IMG_1050-768x512.jpg`,
      thumbnail: `${BASE_URL}/2025/01/IMG_1050-300x200.jpg`,
    },
    {
      full: `${BASE_URL}/2025/01/DSC7335-scaled.jpg`,
      large: `${BASE_URL}/2025/01/DSC7335-2048x1365.jpg`,
      medium: `${BASE_URL}/2025/01/DSC7335-1024x683.jpg`,
      small: `${BASE_URL}/2025/01/DSC7335-768x512.jpg`,
      thumbnail: `${BASE_URL}/2025/01/DSC7335-300x200.jpg`,
    },
  ],
  trainingShots: [
    `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
    `${BASE_URL}/2025/01/IMG_1050-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC7335-1024x683.jpg`,
  ],
  matchDay: [
    `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
  ],
};

// ============================================
// ACADEMY ASSETS
// ============================================
export const academyAssets = {
  trainingShot: `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
  coachTalk: `${BASE_URL}/2025/01/IMG_1050-1024x683.jpg`,
  drillsWideShot: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
  kidsTraining: `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
  realverseDashboard: `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
  realverseLogin: `${BASE_URL}/2025/01/DSC7335-1024x683.jpg`,
  pathwayGraphic: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
  // Training shots array (for program cards)
  trainingShots: [
    `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
    `${BASE_URL}/2025/01/IMG_1050-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC7335-1024x683.jpg`,
  ],
};

// ============================================
// BROCHURE ASSETS
// ============================================
export const brochureAssets = {
  collage: [
    `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
    `${BASE_URL}/2025/01/IMG_1050-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC7335-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
  ],
};

// ============================================
// SHOP ASSETS
// ============================================
export const shopAssets = {
  jerseys: [
    `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
  ],
  trainingTees: [
    `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
  ],
  miscMerch: [
    `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
  ],
};

// ============================================
// NEWS ASSETS
// ============================================
export const newsAssets = {
  news1: {
    full: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-819x1024.jpeg`,
    large: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n.jpeg`,
    medium: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-768x960.jpeg`,
    thumbnail: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-240x300.jpeg`,
  },
  news2: {
    full: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-1024x1024.jpeg`,
    large: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n.jpeg`,
    medium: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-768x768.jpeg`,
    thumbnail: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-300x300.jpeg`,
  },
  news3: {
    full: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-819x1024.jpeg`,
    large: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n.jpeg`,
    medium: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-768x960.jpeg`,
    thumbnail: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-240x300.jpeg`,
  },
};

// ============================================
// TROPHY ASSETS
// ============================================
export const trophyAssets = {
  trophy1: `${BASE_URL}/2024/12/Trophies.H03.2k.png`,
  trophy2: `${BASE_URL}/2024/12/Awards-Trophy.H09.2k.png`,
  trophy3: `${BASE_URL}/2024/12/Trophy-Cup.I01.2k.png`,
  trophy4: `${BASE_URL}/2024/12/Trophy.H03.2k.png`,
};

// ============================================
// REALVERSE ASSETS
// ============================================
export const realverseAssets = {
  dashboards: [
    `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
    `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
  ],
};

// ============================================
// CENTRES ASSETS
// ============================================
export const centresAssets = {
  genericPitchBg: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
};

// ============================================
// ADMIN ASSETS
// ============================================
export const adminAssets = {
  dashboardBanner: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
  statsBackground: `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
  chartsBackground: `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
};

// ============================================
// MISC ASSETS
// ============================================
export const miscAssets = {
  preloaderGif: `${BASE_URL}/2025/05/gif-small.gif`,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Get gallery image by index with responsive sizes
 */
export const getGalleryImage = (index: number, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'full' = 'medium') => {
  const gallery = galleryAssets.actionShots;
  if (index >= 0 && index < gallery.length) {
    return gallery[index][size];
  }
  return gallery[0][size]; // Fallback to first image
};

/**
 * Get news image by index with responsive sizes
 */
export const getNewsImage = (index: number, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'medium') => {
  const newsItems = [newsAssets.news1, newsAssets.news2, newsAssets.news3];
  if (index >= 0 && index < newsItems.length) {
    return newsItems[index][size];
  }
  return newsItems[0][size]; // Fallback to first news image
};

