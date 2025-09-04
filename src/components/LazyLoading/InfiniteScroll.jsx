import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from '../Suspense/LoadingSpinner';
import './InfiniteScroll.css';

const InfiniteScroll = ({
  children,
  hasMore = true,
  loadMore,
  loader = null,
  endMessage = null,
  threshold = 0.8,
  reverse = false,
  className = '',
  style = {},
  onScroll = () => {},
  refreshFunction = null,
  pullDownToRefresh = false,
  pullDownToRefreshThreshold = 100,
  releaseToRefreshThreshold = 150,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(
    e => {
      onScroll(e);

      if (loadingRef.current || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = e.target;

      let shouldLoadMore = false;

      if (reverse) {
        // For reverse infinite scroll (chat-like)
        shouldLoadMore =
          scrollTop <= (scrollHeight - clientHeight) * (1 - threshold);
      } else {
        // Normal infinite scroll
        shouldLoadMore = scrollTop >= scrollHeight * threshold - clientHeight;
      }

      if (shouldLoadMore) {
        loadingRef.current = true;
        setIsLoading(true);

        Promise.resolve(loadMore()).finally(() => {
          setIsLoading(false);
          loadingRef.current = false;
        });
      }
    },
    [hasMore, loadMore, threshold, reverse, onScroll]
  );

  // Pull to refresh handlers
  const handleTouchStart = useCallback(
    e => {
      if (!pullDownToRefresh || !refreshFunction) return;
      setStartY(e.touches[0].clientY);
    },
    [pullDownToRefresh, refreshFunction]
  );

  const handleTouchMove = useCallback(
    e => {
      if (!pullDownToRefresh || !refreshFunction || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      const { scrollTop } = containerRef.current;

      if (scrollTop === 0 && diff > 0) {
        e.preventDefault();
        setPullDistance(Math.min(diff, releaseToRefreshThreshold));
      }
    },
    [
      pullDownToRefresh,
      refreshFunction,
      isRefreshing,
      startY,
      releaseToRefreshThreshold,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    if (!pullDownToRefresh || !refreshFunction || isRefreshing) return;

    if (pullDistance >= pullDownToRefreshThreshold) {
      setIsRefreshing(true);
      Promise.resolve(refreshFunction()).finally(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
  }, [
    pullDownToRefresh,
    refreshFunction,
    isRefreshing,
    pullDistance,
    pullDownToRefreshThreshold,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    if (pullDownToRefresh) {
      container.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      container.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (pullDownToRefresh) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [
    handleScroll,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    pullDownToRefresh,
  ]);

  const containerClasses = [
    'infinite-scroll',
    className,
    reverse ? 'infinite-scroll-reverse' : '',
    isRefreshing ? 'infinite-scroll-refreshing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const defaultLoader = (
    <div className="infinite-scroll-loader">
      <LoadingSpinner size="small" text="Loading more..." />
    </div>
  );

  const defaultEndMessage = (
    <div className="infinite-scroll-end">
      <p>No more items to load</p>
    </div>
  );

  const pullToRefreshIndicator = (
    <div
      className="pull-to-refresh-indicator"
      style={{
        transform: `translateY(${pullDistance}px)`,
        opacity: pullDistance / pullDownToRefreshThreshold,
      }}
    >
      <div
        className={`refresh-icon ${pullDistance >= pullDownToRefreshThreshold ? 'ready' : ''}`}
      >
        {isRefreshing ? '⟳' : '↓'}
      </div>
      <span className="refresh-text">
        {isRefreshing
          ? 'Refreshing...'
          : pullDistance >= pullDownToRefreshThreshold
            ? 'Release to refresh'
            : 'Pull to refresh'}
      </span>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={{
        ...style,
        transform: pullDownToRefresh
          ? `translateY(${Math.min(pullDistance, releaseToRefreshThreshold)}px)`
          : undefined,
      }}
      {...props}
    >
      {pullDownToRefresh && pullToRefreshIndicator}

      {reverse && isLoading && (loader || defaultLoader)}

      <div className="infinite-scroll-content">{children}</div>

      {!reverse && isLoading && (loader || defaultLoader)}

      {!hasMore && !isLoading && (endMessage || defaultEndMessage)}
    </div>
  );
};

export default InfiniteScroll;
