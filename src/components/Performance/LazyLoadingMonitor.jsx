import { useEffect, useRef } from 'react';

/**
 * Performance monitoring component for lazy loading
 * Tracks metrics like load times, cache hits, and user interactions
 */
const LazyLoadingMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const metricsRef = useRef({
    routeLoadTimes: new Map(),
    componentLoadTimes: new Map(),
    imageLoadTimes: new Map(),
    cacheHits: 0,
    cacheMisses: 0,
    totalLazyLoads: 0,
    failedLoads: 0
  });

  useEffect(() => {
    if (!enabled) return;

    // Monitor route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const trackRouteChange = (url) => {
      const startTime = performance.now();
      const routeKey = url.split('?')[0]; // Remove query params
      
      // Track when route loading completes
      const observer = new MutationObserver(() => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        metricsRef.current.routeLoadTimes.set(routeKey, {
          loadTime,
          timestamp: Date.now()
        });
        
        console.debug(`Route ${routeKey} loaded in ${loadTime.toFixed(2)}ms`);
        observer.disconnect();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Cleanup observer after 10 seconds
      setTimeout(() => observer.disconnect(), 10000);
    };

    history.pushState = function(...args) {
      trackRouteChange(args[2] || window.location.pathname);
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      trackRouteChange(args[2] || window.location.pathname);
      return originalReplaceState.apply(this, args);
    };

    // Monitor lazy image loading
    const imageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll?.('img') || [];
            
            images.forEach((img) => {
              if (img.classList.contains('lazy-image')) {
                const startTime = performance.now();
                
                const onLoad = () => {
                  const loadTime = performance.now() - startTime;
                  metricsRef.current.imageLoadTimes.set(img.src, loadTime);
                  metricsRef.current.totalLazyLoads++;
                  console.debug(`Lazy image loaded in ${loadTime.toFixed(2)}ms:`, img.src);
                };

                const onError = () => {
                  metricsRef.current.failedLoads++;
                  console.debug('Lazy image failed to load:', img.src);
                };

                img.addEventListener('load', onLoad, { once: true });
                img.addEventListener('error', onError, { once: true });
              }
            });
          }
        });
      });
    });

    imageObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Monitor intersection observer usage
    const originalIntersectionObserver = window.IntersectionObserver;
    let observerCount = 0;

    window.IntersectionObserver = function(...args) {
      observerCount++;
      console.debug(`IntersectionObserver created. Total active: ${observerCount}`);
      
      const observer = new originalIntersectionObserver(...args);
      const originalDisconnect = observer.disconnect;
      
      observer.disconnect = function() {
        observerCount--;
        console.debug(`IntersectionObserver disconnected. Total active: ${observerCount}`);
        return originalDisconnect.call(this);
      };
      
      return observer;
    };

    // Performance reporting
    const reportMetrics = () => {
      const metrics = metricsRef.current;
      
      console.group('🚀 Lazy Loading Performance Report');
      
      // Route performance
      if (metrics.routeLoadTimes.size > 0) {
        console.group('📍 Route Load Times');
        const routeTimes = Array.from(metrics.routeLoadTimes.entries());
        const avgRouteTime = routeTimes.reduce((sum, [, data]) => sum + data.loadTime, 0) / routeTimes.length;
        
        console.log(`Average route load time: ${avgRouteTime.toFixed(2)}ms`);
        routeTimes.forEach(([route, data]) => {
          console.log(`${route}: ${data.loadTime.toFixed(2)}ms`);
        });
        console.groupEnd();
      }
      
      // Image performance
      if (metrics.imageLoadTimes.size > 0) {
        console.group('🖼️ Image Load Performance');
        const imageTimes = Array.from(metrics.imageLoadTimes.values());
        const avgImageTime = imageTimes.reduce((sum, time) => sum + time, 0) / imageTimes.length;
        
        console.log(`Total lazy images loaded: ${metrics.totalLazyLoads}`);
        console.log(`Failed image loads: ${metrics.failedLoads}`);
        console.log(`Average image load time: ${avgImageTime.toFixed(2)}ms`);
        console.log(`Success rate: ${((metrics.totalLazyLoads / (metrics.totalLazyLoads + metrics.failedLoads)) * 100).toFixed(1)}%`);
        console.groupEnd();
      }
      
      // Observer usage
      console.log(`Active IntersectionObservers: ${observerCount}`);
      
      console.groupEnd();
    };

    // Report metrics every 30 seconds in development
    const reportInterval = setInterval(reportMetrics, 30000);

    // Report on page unload
    const handleUnload = () => {
      reportMetrics();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      // Restore original functions
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.IntersectionObserver = originalIntersectionObserver;
      
      // Cleanup
      imageObserver.disconnect();
      clearInterval(reportInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [enabled]);

  // Expose metrics for debugging
  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      window.__LAZY_LOADING_METRICS__ = metricsRef.current;
    }
  }, [enabled]);

  return null; // This component doesn't render anything
};

export default LazyLoadingMonitor;