import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for lazy loading data with intersection observer
 * @param {Function} fetchFunction - Function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} - State and methods for lazy data loading
 */
const useLazyData = (fetchFunction, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    triggerOnce = true,
    enabled = true,
    dependencies = [],
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const currentRetryCount = useRef(0);

  // Fetch data function with retry logic
  const fetchData = useCallback(async () => {
    if (!enabled || (triggerOnce && hasTriggered)) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      setHasTriggered(true);
      currentRetryCount.current = 0;
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);

      // Retry logic
      if (currentRetryCount.current < retryCount) {
        currentRetryCount.current += 1;
        retryTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, retryDelay * currentRetryCount.current);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, enabled, triggerOnce, hasTriggered, onSuccess, onError, retryCount, retryDelay]);

  // Set up intersection observer
  useEffect(() => {
    const currentElement = elementRef.current;
    
    if (!currentElement || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          if (triggerOnce) {
            observerRef.current?.unobserve(currentElement);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(currentElement);

    return () => {
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  // Trigger data fetch when in view
  useEffect(() => {
    if (isInView && enabled) {
      fetchData();
    }
  }, [isInView, enabled, fetchData, ...dependencies]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Manual retry function
  const retry = useCallback(() => {
    currentRetryCount.current = 0;
    setError(null);
    fetchData();
  }, [fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setHasTriggered(false);
    currentRetryCount.current = 0;
    setError(null);
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isInView,
    elementRef,
    retry,
    refresh,
    hasTriggered
  };
};

export default useLazyData;