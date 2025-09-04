import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '../Suspense/LoadingSpinner';
import './LazySection.css';

const LazySection = ({
  children,
  placeholder = null,
  loadingComponent = null,
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true,
  className = '',
  style = {},
  onIntersect = () => {},
  onLoad = () => {},
  delay = 0,
  ...props
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRef = useRef(null);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const currentSection = sectionRef.current;

    if (!currentSection || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect(entry);

          if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
              setIsInView(true);
            }, delay);
          } else {
            setIsInView(true);
          }

          if (triggerOnce) {
            observerRef.current?.unobserve(currentSection);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(currentSection);

    return () => {
      if (observerRef.current && currentSection) {
        observerRef.current.unobserve(currentSection);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce, onIntersect, delay]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      // Simulate loading time for demonstration
      const loadTimeout = setTimeout(() => {
        setIsLoaded(true);
        onLoad();
      }, 100);

      return () => clearTimeout(loadTimeout);
    }
  }, [isInView, isLoaded, onLoad]);

  const sectionClasses = [
    'lazy-section',
    className,
    isInView ? 'lazy-section-in-view' : '',
    isLoaded ? 'lazy-section-loaded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const defaultPlaceholder = (
    <div className="lazy-section-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-line"></div>
        <div className="placeholder-line short"></div>
        <div className="placeholder-line"></div>
      </div>
    </div>
  );

  const defaultLoading = (
    <LoadingSpinner size="small" text="Loading section..." />
  );

  return (
    <div ref={sectionRef} className={sectionClasses} style={style} {...props}>
      {!isInView && (placeholder || defaultPlaceholder)}

      {isInView && !isLoaded && (loadingComponent || defaultLoading)}

      {isInView && isLoaded && (
        <div className="lazy-section-content">{children}</div>
      )}
    </div>
  );
};

export default LazySection;
