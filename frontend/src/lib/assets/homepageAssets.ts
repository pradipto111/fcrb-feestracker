/**
 * FC Real Bengaluru Homepage Asset Mapping
 * Official assets extracted from the deployed homepage (realbengaluru.com)
 * 
 * All image URLs are from: https://realbengaluru.com/wp-content/uploads/
 * These are the ONLY approved assets for the homepage.
 */

const BASE_URL = 'https://realbengaluru.com/wp-content/uploads';

export const homepageAssets = {
  // ============================================
  // PRELOADER & LOGO
  // ============================================
  preloader: {
    gif: `${BASE_URL}/2025/05/gif-small.gif`,
  },
  
  logo: {
    main: `${BASE_URL}/2024/12/web-logo-header.png`,
    cropped: `${BASE_URL}/2024/12/cropped-web-logo-header.png`,
    white: `${BASE_URL}/2025/01/FCRB_White-300x300.png`,
    withStroke: `${BASE_URL}/2025/01/logo-with-stroke.png`,
    favicon32: `${BASE_URL}/2024/12/cropped-web-logo-header-32x32.png`,
    favicon192: `${BASE_URL}/2024/12/cropped-web-logo-header-192x192.png`,
    favicon180: `${BASE_URL}/2024/12/cropped-web-logo-header-180x180.png`,
  },

  // ============================================
  // HERO & BACKGROUND IMAGES
  // ============================================
  hero: {
    // Main hero background - large stadium/field image
    background: `${BASE_URL}/2025/01/DSC1122-scaled.jpg`,
    // Alternative sizes for responsive loading
    background1024: `${BASE_URL}/2025/01/DSC1122-1024x683.jpg`,
    background768: `${BASE_URL}/2025/01/DSC1122-768x512.jpg`,
    background300: `${BASE_URL}/2025/01/DSC1122-300x200.jpg`,
    // Hero player image
    player: `${BASE_URL}/2025/01/hero-player-639x1024.png`,
    // CTA image
    cta: `${BASE_URL}/2025/01/image-cta-home-1.png`,
  },

  // ============================================
  // TEAM & MATCH IMAGES
  // ============================================
  teams: {
    // Team logos and match visuals
    logoStroke: `${BASE_URL}/2025/01/logo-with-stroke.png`,
    goalFootball: `${BASE_URL}/2025/04/goal-football.png`,
    // Match/team images
    team1: `${BASE_URL}/2025/06/134451085_701318057196919_7024450198469247756_n-modified-1024x1024.png`,
    team2: `${BASE_URL}/2025/06/f89a1bed-111f-46c3-9e22-1bbd577f5526-modified.png`,
    team3: `${BASE_URL}/2025/06/images-modified.png`,
  },

  // ============================================
  // GALLERY IMAGES
  // ============================================
  gallery: {
    image1: `${BASE_URL}/2025/01/DSC0335-scaled.jpg`,
    image1_1024: `${BASE_URL}/2025/01/DSC0335-1024x683.jpg`,
    image1_768: `${BASE_URL}/2025/01/DSC0335-768x512.jpg`,
    image1_300: `${BASE_URL}/2025/01/DSC0335-300x200.jpg`,
    
    image2: `${BASE_URL}/2025/01/DSC1940-scaled.jpg`,
    image2_1024: `${BASE_URL}/2025/01/DSC1940-1024x683.jpg`,
    image2_768: `${BASE_URL}/2025/01/DSC1940-768x512.jpg`,
    image2_300: `${BASE_URL}/2025/01/DSC1940-300x200.jpg`,
    
    image3: `${BASE_URL}/2025/01/IMG_1050-scaled.jpg`,
    image3_1024: `${BASE_URL}/2025/01/IMG_1050-1024x683.jpg`,
    image3_768: `${BASE_URL}/2025/01/IMG_1050-768x512.jpg`,
    image3_300: `${BASE_URL}/2025/01/IMG_1050-300x200.jpg`,
    
    image4: `${BASE_URL}/2025/01/DSC7335-scaled.jpg`,
    image4_1024: `${BASE_URL}/2025/01/DSC7335-1024x683.jpg`,
    image4_768: `${BASE_URL}/2025/01/DSC7335-768x512.jpg`,
    image4_300: `${BASE_URL}/2025/01/DSC7335-300x200.jpg`,
  },

  // ============================================
  // NEWS & MEDIA IMAGES
  // ============================================
  news: {
    news1: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-819x1024.jpeg`,
    news1_768: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-768x960.jpeg`,
    news1_300: `${BASE_URL}/2025/05/495993104_1357243792057336_7422809795959759040_n-240x300.jpeg`,
    
    news2: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-1024x1024.jpeg`,
    news2_768: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-768x768.jpeg`,
    news2_300: `${BASE_URL}/2025/05/498942606_1194760911954028_2856734907423638901_n-300x300.jpeg`,
    
    news3: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-819x1024.jpeg`,
    news3_768: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-768x960.jpeg`,
    news3_300: `${BASE_URL}/2025/05/491897327_1305704707195476_6469687977959708881_n-240x300.jpeg`,
  },

  // ============================================
  // TROPHY & ACHIEVEMENT IMAGES
  // ============================================
  trophies: {
    trophy1: `${BASE_URL}/2024/12/Trophies.H03.2k.png`,
    trophy2: `${BASE_URL}/2024/12/Awards-Trophy.H09.2k.png`,
    trophy3: `${BASE_URL}/2024/12/Trophy-Cup.I01.2k.png`,
    trophy4: `${BASE_URL}/2024/12/Trophy.H03.2k.png`,
  },

  // ============================================
  // SPONSOR LOGOS
  // ============================================
  sponsors: {
    sponsor1: `${BASE_URL}/2025/05/SIX5SIX-removebg-preview-e1746254706179.png`,
    sponsor2: `${BASE_URL}/2025/05/IMG_2544-removebg-preview-removebg-preview-300x134.png`,
    sponsor3: `${BASE_URL}/2025/05/Tribe-Logo_Black-removebg-preview.png`,
    sponsor4: `${BASE_URL}/2025/05/DOC-20231031-WA0015-removebg-preview.png`,
    sponsor5: `${BASE_URL}/2025/05/WhatsApp-Image-2025-05-03-at-14.29.31_0966a5f8.png`,
    sponsor6: `${BASE_URL}/2025/05/lg.png`,
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




