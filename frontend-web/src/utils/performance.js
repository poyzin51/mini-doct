/**
 * Performance optimization utilities
 */

/**
 * Lazy load component with loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Loading fallback component
 * @returns {React.Component} Lazy loaded component
 */
export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = React.lazy(importFunc);
  
  return (props) => (
    <React.Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

/**
 * Memoize expensive calculations
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Function to generate cache key
 * @returns {Function} Memoized function
 */
export const memoize = (fn, keyFn = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = keyFn(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

/**
 * Batch multiple API calls
 * @param {Array} apiCalls - Array of API call functions
 * @param {number} batchSize - Number of calls to batch together
 * @returns {Promise} Promise that resolves when all calls complete
 */
export const batchApiCalls = async (apiCalls, batchSize = 5) => {
  const results = [];
  
  for (let i = 0; i < apiCalls.length; i += batchSize) {
    const batch = apiCalls.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(call => call()));
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScroller {
  constructor(containerHeight, itemHeight, buffer = 5) {
    this.containerHeight = containerHeight;
    this.itemHeight = itemHeight;
    this.buffer = buffer;
  }
  
  getVisibleRange(scrollTop, totalItems) {
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + this.buffer * 2);
    
    return { startIndex, endIndex, visibleCount };
  }
  
  getItemStyle(index) {
    return {
      position: 'absolute',
      top: index * this.itemHeight,
      height: this.itemHeight,
      width: '100%',
    };
  }
  
  getContainerStyle(totalItems) {
    return {
      height: totalItems * this.itemHeight,
      position: 'relative',
    };
  }
}

/**
 * Image lazy loading utility
 * @param {string} src - Image source
 * @param {Object} options - Intersection observer options
 * @returns {Object} Image loading state and ref
 */
export const useImageLazyLoad = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef();
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  React.useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, src]);
  
  return { isLoaded, isInView, imgRef };
};

/**
 * Preload critical resources
 * @param {Array} resources - Array of resource URLs
 */
export const preloadResources = (resources) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.url;
    link.as = resource.type || 'fetch';
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
};

/**
 * Service Worker registration for caching
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

/**
 * Performance monitoring
 */
export const performanceMonitor = {
  mark: (name) => {
    if (performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name, startMark, endMark) => {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration}ms`);
    }
  },
  
  logPageLoad: () => {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      console.log('Page Load Performance:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart,
      });
    });
  },
};