/**
 * FC Real Bengaluru Homepage Asset Mapping
 * Comprehensive asset catalog extracted from the deployed homepage (realbengaluru.com)
 * 
 * SOURCE: "Untitled document.txt" - Old deployed homepage HTML
 * All image URLs are from: https://realbengaluru.com/wp-content/uploads/
 * 
 * These are the ONLY approved visual assets for the new homepage.
 */

const BASE_URL = 'https://realbengaluru.com/wp-content/uploads';

export const homepageAssets = {
  // ============================================
  // PRELOADER & LOADING
  // ============================================
  preloader: {
    gif: `${BASE_URL}/2025/05/gif-small.gif`, // Main preloader animation from old homepage
  },

  // ============================================
  // LOGO & BRANDING
  // ============================================
  logo: {
    main: `${BASE_URL}/2024/12/web-logo-header.png`, // Main header logo
    cropped: `${BASE_URL}/2024/12/cropped-web-logo-header.png`, // Cropped logo variant
    white: `${BASE_URL}/2025/01/FCRB_White-300x300.png`, // White logo variant (used in hero)
    withStroke: `${BASE_URL}/2025/01/logo-with-stroke.png`, // Logo with stroke (used in match cards)
    favicon32: `${BASE_URL}/2024/12/cropped-web-logo-header-32x32.png`,
    favicon192: `${BASE_URL}/2024/12/cropped-web-logo-header-192x192.png`,
    favicon180: `${BASE_URL}/2024/12/cropped-web-logo-header-180x180.png`,
  },

  // ============================================
  // HERO SECTION
  // ============================================
  hero: {
    // Main hero background - large stadium/field image (from old homepage "About the club" section)
    background: `${BASE_URL}/2025/01/DSC1122-scaled.jpg`,
    background2048: `${BASE_URL}/2025/01/DSC1122-2048x1365.jpg`,
    background1536: `${BASE_URL}/2025/01/DSC1122-1536x1024.jpg`,
    background1024: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
    background768: `${BASE_URL}/2025/01/DSC1122-768x512.jpg`,
    background300: `${BASE_URL}/2025/01/DSC1122-300x200.jpg`,
    
    // Hero player cutout (from old homepage "Join Our Team" section)
    player: `${BASE_URL}/2025/01/hero-player-639x1024.png`,
    player768: `${BASE_URL}/2025/01/hero-player-768x1230.png`,
    player300: `${BASE_URL}/2025/01/hero-player-187x300.png`,
    
    // CTA banner image (from old homepage newsletter section)
    cta: `${BASE_URL}/2025/01/image-cta-home-1.png`,
    cta768: `${BASE_URL}/2025/01/image-cta-home-1-768x582.png`,
    cta300: `${BASE_URL}/2025/01/image-cta-home-1-300x227.png`,
  },

  // ============================================
  // MATCH CENTRE & RECENT MATCHES
  // ============================================
  matchCentre: {
    // Last match background (reuse hero background or use gallery image)
    lastMatchBackground: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
    
    // Recent match thumbnails (from old homepage "our recent Match" section)
    recentMatch1: {
      logo: `${BASE_URL}/2025/01/logo-with-stroke.png`, // FCRB logo
      opponent: `${BASE_URL}/2025/06/134451085_701318057196919_7024450198469247756_n-modified-1024x1024.png`, // Opponent team logo
      opponent768: `${BASE_URL}/2025/06/134451085_701318057196919_7024450198469247756_n-modified-768x768.png`,
      opponent300: `${BASE_URL}/2025/06/134451085_701318057196919_7024450198469247756_n-modified-300x300.png`,
    },
    recentMatch2: {
      logo: `${BASE_URL}/2025/01/logo-with-stroke.png`,
      opponent: `${BASE_URL}/2025/06/f89a1bed-111f-46c3-9e22-1bbd577f5526-modified.png`, // Opponent team logo
      opponent150: `${BASE_URL}/2025/06/f89a1bed-111f-46c3-9e22-1bbd577f5526-modified-150x150.png`,
    },
    recentMatch3: {
      logo: `${BASE_URL}/2025/01/logo-with-stroke.png`,
      opponent: `${BASE_URL}/2025/06/images-modified.png`, // Opponent team logo
      opponent150: `${BASE_URL}/2025/06/images-modified-150x150.png`,
    },
    
    // Goal football icon (used in match cards)
    goalFootball: `${BASE_URL}/2025/04/goal-football.png`,
    goalFootball300: `${BASE_URL}/2025/04/goal-football-300x300.png`,
    goalFootball150: `${BASE_URL}/2025/04/goal-football-150x150.png`,
  },

  // ============================================
  // TEAMS OVERVIEW
  // ============================================
  teams: {
    // Men's team - use gallery action shots or match images
    mens: {
      primary: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`, // Stadium/team action
      thumbnail: `${BASE_URL}/2025/01/DSC1122-768x512.jpg`,
    },
    
    // Women's team - use match images
    womens: {
      primary: `${BASE_URL}/2025/06/images-modified.png`, // Women's team match image
      thumbnail: `${BASE_URL}/2025/06/images-modified-150x150.png`,
    },
    
    // Youth teams - use match images
    youth: {
      primary: `${BASE_URL}/2025/06/134451085_701318057196919_7024450198469247756_n-modified-1024x1024.png`,
      thumbnail: `${BASE_URL}/2025/06/134451085_701318057196919_7024450198469247756_n-modified-300x300.png`,
    },
    
    // Team logos
    logoStroke: `${BASE_URL}/2025/01/logo-with-stroke.png`,
  },

  // ============================================
  // GALLERY - PRIMARY GRID
  // ============================================
  gallery: {
    // Primary gallery grid (from old homepage "Our Gallery" section)
    primaryGrid: [
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
      {
        full: `${BASE_URL}/2025/01/DSC1122-scaled.jpg`, // Reuse hero background
        large: `${BASE_URL}/2025/01/DSC1122-2048x1365.jpg`,
        medium: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
        small: `${BASE_URL}/2025/01/DSC1122-768x512.jpg`,
        thumbnail: `${BASE_URL}/2025/01/DSC1122-300x200.jpg`,
      },
    ],
  },

  // ============================================
  // NEWS & MEDIA
  // ============================================
  news: {
    // News article thumbnails (from old homepage "key news at a glance" section)
    news1: {
      full: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-819x1024.jpeg`,
      large: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n.jpeg`, // 1080w
      medium: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-768x960.jpeg`,
      thumbnail: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-240x300.jpeg`,
    },
    news2: {
      full: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-1024x1024.jpeg`,
      large: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n.jpeg`, // 1440w
      medium: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-768x768.jpeg`,
      thumbnail: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-300x300.jpeg`,
    },
    news3: {
      full: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-819x1024.jpeg`,
      large: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n.jpeg`, // 1080w
      medium: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-768x960.jpeg`,
      thumbnail: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-240x300.jpeg`,
    },
  },

  // ============================================
  // ACADEMY & TRAINING
  // ============================================
  academy: {
    // Training shots (use gallery images that show training/coaching)
    trainingShot: `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`, // Action/training image
    huddleImage: `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`, // Team huddle/group image
    coachingImage: `${BASE_URL}/2025/01/IMG_1050-1024x683.jpg`, // Coaching/tactics image
  },

  // ============================================
  // BACKGROUND STRIPS & TEXTURES
  // ============================================
  stripSections: {
    // Mid-page blurred strip (reuse hero background with different overlay)
    midPageBlurStrip: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
    
    // Footer strip (can reuse gallery image)
    footerStrip: `${BASE_URL}/2025/01/DSC7335-1024x683.jpg`,
  },

  // ============================================
  // TROPHIES & ACHIEVEMENTS
  // ============================================
  trophies: {
    trophy1: `${BASE_URL}/2024/12/Trophies.H03.2k.png`,
    trophy1_768: `${BASE_URL}/2024/12/Trophies.H03.2k-768x768.png`,
    trophy1_300: `${BASE_URL}/2024/12/Trophies.H03.2k-300x300.png`,
    
    trophy2: `${BASE_URL}/2024/12/Awards-Trophy.H09.2k.png`,
    trophy2_768: `${BASE_URL}/2024/12/Awards-Trophy.H09.2k-768x768.png`,
    trophy2_300: `${BASE_URL}/2024/12/Awards-Trophy.H09.2k-300x300.png`,
    
    trophy3: `${BASE_URL}/2024/12/Trophy-Cup.I01.2k.png`,
    trophy3_768: `${BASE_URL}/2024/12/Trophy-Cup.I01.2k-768x768.png`,
    trophy3_300: `${BASE_URL}/2024/12/Trophy-Cup.I01.2k-300x300.png`,
    
    trophy4: `${BASE_URL}/2024/12/Trophy.H03.2k.png`,
    trophy4_768: `${BASE_URL}/2024/12/Trophy.H03.2k-768x768.png`,
    trophy4_300: `${BASE_URL}/2024/12/Trophy.H03.2k-300x300.png`,
  },

  // ============================================
  // SPONSORS & PARTNERS
  // ============================================
  sponsors: {
    sponsor1: `${BASE_URL}/2025/05/SIX5SIX-removebg-preview-e1746254706179.png`,
    sponsor2: `${BASE_URL}/2025/05/IMG_2544-removebg-preview-removebg-preview-300x134.png`,
    sponsor2_full: `${BASE_URL}/2025/05/IMG_2544-removebg-preview-removebg-preview.png`, // 746w
    sponsor3: `${BASE_URL}/2025/05/Tribe-Logo_Black-removebg-preview.png`,
    sponsor3_300: `${BASE_URL}/2025/05/Tribe-Logo_Black-removebg-preview-300x129.png`,
    sponsor4: `${BASE_URL}/2025/05/DOC-20231031-WA0015-removebg-preview.png`,
    sponsor4_300: `${BASE_URL}/2025/05/DOC-20231031-WA0015-removebg-preview-300x110.png`,
    sponsor5: `${BASE_URL}/2025/05/WhatsApp-Image-2025-05-03-at-14.29.31_0966a5f8.png`,
    sponsor5_300: `${BASE_URL}/2025/05/WhatsApp-Image-2025-05-03-at-14.29.31_0966a5f8-300x154.png`,
    sponsor6: `${BASE_URL}/2025/05/lg.png`,
  },

  // ============================================
  // VIDEO ASSETS
  // ============================================
  video: {
    // Background video from old homepage (YouTube embed)
    heroVideo: 'https://www.youtube.com/watch?v=_iplvxf8JCo',
    heroVideoEmbed: 'https://www.youtube.com/embed/_iplvxf8JCo?autoplay=1&mute=1&loop=1&playlist=_iplvxf8JCo',
  },
} as const;

/**
 * Get responsive image srcset for a given image path
 */
export const getResponsiveImageSrcset = (basePath: string, sizes: { width: number; height?: number }[]) => {
  return sizes.map(size => {
    const url = size.height 
      ? `${basePath}-${size.width}x${size.height}.jpg`
      : `${basePath}-${size.width}w.jpg`;
    return `${url} ${size.width}w`;
  }).join(', ');
};

/**
 * Get the best image size for a given container width
 */
export const getBestImageSize = (containerWidth: number, availableSizes: number[]) => {
  return availableSizes.find(size => size >= containerWidth) || availableSizes[availableSizes.length - 1];
};

/**
 * Get gallery image by index with responsive sizes
 */
export const getGalleryImage = (index: number, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'full' = 'medium') => {
  const gallery = homepageAssets.gallery.primaryGrid;
  if (index >= 0 && index < gallery.length) {
    return gallery[index][size];
  }
  return gallery[0][size]; // Fallback to first image
};

/**
 * Get news image by index with responsive sizes
 */
export const getNewsImage = (index: number, size: 'thumbnail' | 'medium' | 'large' | 'full' = 'medium') => {
  const newsItems = [homepageAssets.news.news1, homepageAssets.news.news2, homepageAssets.news.news3];
  if (index >= 0 && index < newsItems.length) {
    return newsItems[index][size];
  }
  return newsItems[0][size]; // Fallback to first news image
};




