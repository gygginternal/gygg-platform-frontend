/**
 * Lazy Loading Configuration
 * Centralized configuration for all lazy loading behavior
 */

// Default intersection observer options
export const DEFAULT_OBSERVER_OPTIONS = {
  threshold: 0.1,
  rootMargin: '50px'
};

// Route-specific lazy loading configurations
export const ROUTE_CONFIGS = {
  // Critical routes - preload immediately
  critical: [
    '/feed',
    '/gigs'
  ],
  
  // High priority routes - preload after initial load
  highPriority: [
    '/messages',
    '/profile',
    '/contracts',
    '/billing'
  ],
  
  // Medium priority routes - preload on hover/focus
  mediumPriority: [
    '/settings',
    '/gigs/create',
    '/posts/create'
  ],
  
  // Low priority routes - load on demand only
  lowPriority: [
    '/terms',
    '/privacy',
    '/gig-helper'
  ]
};

// Component-specific lazy loading settings
export const COMPONENT_CONFIGS = {
  images: {
    threshold: 0.1,
    rootMargin: '100px',
    fadeInDuration: 300,
    retryCount: 3,
    retryDelay: 1000
  },
  
  sections: {
    threshold: 0.2,
    rootMargin: '50px',
    triggerOnce: true,
    delay: 0
  },
  
  tables: {
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
    delay: 100
  },
  
  modals: {
    preload: false,
    retryCount: 2,
    retryDelay: 500
  },
  
  widgets: {
    threshold: 0.3,
    rootMargin: '25px',
    triggerOnce: true
  }
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  routeLoadTime: 2000, // 2 seconds
  imageLoadTime: 3000, // 3 seconds
  componentLoadTime: 1000, // 1 second
  maxRetries: 3,
  cacheExpiry: 300000 // 5 minutes
};

// Feature flags for lazy loading
export const FEATURE_FLAGS = {
  enableRoutePreloading: true,
  enableImageLazyLoading: true,
  enableComponentLazyLoading: true,
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
  enableHoverPreloading: true,
  enableIntersectionObserver: typeof window !== 'undefined' && 'IntersectionObserver' in window
};

// Browser-specific optimizations
export const BROWSER_OPTIMIZATIONS = {
  // Reduce animations on low-end devices
  respectsReducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  // Adjust thresholds based on connection speed
  connectionAware: typeof navigator !== 'undefined' && 'connection' in navigator,
  
  // Enable/disable features based on device capabilities
  deviceMemory: typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? navigator.deviceMemory : 4
};

// Dynamic configuration based on device capabilities
export const getDynamicConfig = () => {
  const config = { ...DEFAULT_OBSERVER_OPTIONS };
  
  // Adjust for slow connections
  if (BROWSER_OPTIMIZATIONS.connectionAware) {
    const connection = navigator.connection;
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      config.rootMargin = '200px'; // Load earlier on slow connections
      config.threshold = 0.05; // Lower threshold
    } else if (connection.effectiveType === '4g') {
      config.rootMargin = '25px'; // Load later on fast connections
      config.threshold = 0.2; // Higher threshold
    }
  }
  
  // Adjust for low memory devices
  if (BROWSER_OPTIMIZATIONS.deviceMemory < 2) {
    config.rootMargin = '300px'; // Load much earlier
    config.threshold = 0.05;
  }
  
  // Respect reduced motion preferences
  if (BROWSER_OPTIMIZATIONS.respectsReducedMotion) {
    COMPONENT_CONFIGS.images.fadeInDuration = 0;
  }
  
  return config;
};

// Utility functions
export const shouldPreloadRoute = (route) => {
  return ROUTE_CONFIGS.critical.includes(route) || 
         ROUTE_CONFIGS.highPriority.includes(route);
};

export const getRoutePreloadPriority = (route) => {
  if (ROUTE_CONFIGS.critical.includes(route)) return 'critical';
  if (ROUTE_CONFIGS.highPriority.includes(route)) return 'high';
  if (ROUTE_CONFIGS.mediumPriority.includes(route)) return 'medium';
  return 'low';
};

export const isLazyLoadingEnabled = (feature) => {
  return FEATURE_FLAGS[feature] !== false;
};