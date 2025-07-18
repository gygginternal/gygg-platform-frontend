import React, { useState, useRef, useEffect } from 'react';
import './LazyImage.css';

const LazyImage = ({
  src,
  alt,
  placeholder = null,
  blurDataURL = null,
  className = '',
  style = {},
  onLoad = () => {},
  onError = () => {},
  threshold = 0.1,
  rootMargin = '50px',
  fadeInDuration = 300,
  showPlaceholder = true,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const currentImg = imgRef.current;
    
    if (!currentImg || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.unobserve(currentImg);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(currentImg);

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg);
      }
    };
  }, [threshold, rootMargin]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError(e);
  };

  const imageClasses = [
    'lazy-image',
    className,
    isLoaded ? 'lazy-image-loaded' : '',
    hasError ? 'lazy-image-error' : ''
  ].filter(Boolean).join(' ');

  const imageStyle = {
    ...style,
    '--fade-duration': `${fadeInDuration}ms`
  };

  return (
    <div 
      ref={imgRef}
      className="lazy-image-container"
      style={imageStyle}
    >
      {/* Placeholder */}
      {showPlaceholder && !isLoaded && !hasError && (
        <div className="lazy-image-placeholder">
          {placeholder || (
            <div className="lazy-image-skeleton">
              <div className="skeleton-shimmer"></div>
            </div>
          )}
        </div>
      )}

      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && !hasError && (
        <img
          src={blurDataURL}
          alt=""
          className="lazy-image-blur"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="lazy-image-error-state">
          <div className="error-icon">📷</div>
          <p className="error-text">Failed to load image</p>
        </div>
      )}
    </div>
  );
};

export default LazyImage;