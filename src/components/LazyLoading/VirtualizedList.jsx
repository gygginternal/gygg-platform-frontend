import React, { useState, useEffect, useRef, useMemo } from 'react';
import './VirtualizedList.css';

const VirtualizedList = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = '',
  onScroll = () => {},
  loadMore = null,
  hasNextPage = false,
  isLoading = false,
  threshold = 0.8,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (items[i]) {
        result.push({
          index: i,
          item: items[i],
          top: i * itemHeight,
        });
      }
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  const handleScroll = e => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    onScroll(e);

    // Check if we need to load more items
    if (loadMore && hasNextPage && !isLoading) {
      const scrollPercentage = newScrollTop / (totalHeight - containerHeight);
      if (scrollPercentage >= threshold) {
        loadMore();
      }
    }

    // Clear scrolling state after scroll ends
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const containerClasses = [
    'virtualized-list',
    className,
    isScrolling ? 'virtualized-list-scrolling' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div className="virtualized-list-inner" style={{ height: totalHeight }}>
        {visibleItems.map(({ index, item, top }) => (
          <div
            key={index}
            className="virtualized-list-item"
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div
            className="virtualized-list-loading"
            style={{
              position: 'absolute',
              top: totalHeight,
              left: 0,
              right: 0,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="loading-spinner-small">
              <div className="spinner-ring"></div>
            </div>
            <span className="loading-text">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedList;
