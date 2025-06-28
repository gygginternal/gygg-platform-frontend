// frontend/src/components/GigsPage/TaskList.js
import { useState, useEffect, useCallback } from 'react';
import styles from './TaskList.module.css';
import TaskCard from './TaskCard';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { CATEGORY_ENUM } from '../../constants/categories';
import PropTypes from 'prop-types';

export const TaskList = ({
  initialSearchTerm = '',
  category = 'All',
  location = '',
  priceRange = 'Any',
  onGigClick,
}) => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(initialSearchTerm);

  // Convert price range to min/max values
  const getPriceRangeParams = range => {
    switch (range) {
      case 'Under $20':
        return { maxPrice: 20 };
      case '$20 - $50':
        return { minPrice: 20, maxPrice: 50 };
      case '$50 - $100':
        return { minPrice: 50, maxPrice: 100 };
      case '$100+':
        return { minPrice: 100 };
      default:
        return {};
    }
  };

  const fetchGigs = useCallback(
    async (pageToFetch, termToSearch) => {
      const isFirstLoadForTerm = pageToFetch === 1;
      if (isFirstLoadForTerm) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError('');

      const params = {
        status: 'open',
        limit: 10,
        page: pageToFetch,
      };

      // Add search term if provided
      if (termToSearch && termToSearch.trim() !== '') {
        params.search = termToSearch.trim();
      }

      // Add category if not "All"
      if (category && category !== 'All') {
        params.category = category;
      }

      // Add location if provided
      if (location && location.trim() !== '') {
        params.location = location.trim();
      }

      // Add price range parameters
      const priceParams = getPriceRangeParams(priceRange);
      Object.assign(params, priceParams);

      try {
        logger.info(`TaskList: Fetching gigs with params:`, params);
        const response = await apiClient.get('/gigs', { params });
        const newGigs = response.data.data.gigs || [];
        const backendCurrentPage = response.data.page || 1;

        logger.debug('TaskList: Fetched gigs data:', {
          newGigs,
          backendCurrentPage,
          totalGigs: response.data.total,
        });

        setGigs(prevGigs =>
          isFirstLoadForTerm ? newGigs : [...prevGigs, ...newGigs]
        );
        setCurrentPage(backendCurrentPage);
        setHasMore(backendCurrentPage < response.data.totalPages || false);
      } catch (err) {
        logger.error(
          'Error fetching gigs in TaskList:',
          err.response?.data || err.message
        );
        setError(
          err.response?.data?.message ||
            'Could not load available gigs. Please try again later.'
        );
        if (isFirstLoadForTerm) setGigs([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [category, location, priceRange]
  );

  // Reset and fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    setGigs([]);
    fetchGigs(1, currentSearchTerm);
  }, [category, location, priceRange, fetchGigs, currentSearchTerm]);

  // Update search term
  useEffect(() => {
    setCurrentSearchTerm(initialSearchTerm);
    setCurrentPage(1);
    setGigs([]);
    fetchGigs(1, initialSearchTerm);
  }, [initialSearchTerm, fetchGigs]);

  // Validate category (but allow 'All')
  useEffect(() => {
    if (category && category !== 'All' && !CATEGORY_ENUM.includes(category)) {
      logger.warn(`Invalid category provided: ${category}`);
      setError('Invalid category selected. Please try again.');
    } else {
      setError('');
    }
  }, [category]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchGigs(currentPage + 1, currentSearchTerm);
    }
  };

  const getFilterDescription = () => {
    const filters = [];
    if (currentSearchTerm) filters.push(`matching "${currentSearchTerm}"`);
    if (category !== 'All') filters.push(`in category "${category}"`);
    if (location) filters.push(`near "${location}"`);
    if (priceRange !== 'Any')
      filters.push(`within price range "${priceRange}"`);
    return filters.join(' ');
  };

  const handleTaskClick = gig => {
    if (onGigClick && gig) {
      onGigClick(gig);
    }
  };

  if (loading && currentPage === 1 && gigs.length === 0) {
    return (
      <section className={styles.taskList}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading available gigs...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.taskList}>
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => fetchGigs(1, currentSearchTerm)}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.taskList}>
      {gigs.length > 0 ? (
        <>
          {gigs.map(gig => (
            <div
              key={gig._id}
              role="button"
              tabIndex={0}
              onClick={() => handleTaskClick(gig)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleTaskClick(gig);
              }}
              className={styles.taskItem}
              aria-label={`View details for ${gig.title}`}
            >
              <TaskCard gig={gig} />
            </div>
          ))}
          {isLoadingMore && (
            <div className={styles.loadingMore}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading more gigs...</p>
            </div>
          )}
          {hasMore && !isLoadingMore && (
            <button onClick={handleLoadMore} className={styles.loadMoreButton}>
              Load More Gigs
            </button>
          )}
          {!hasMore && gigs.length > 0 && (
            <p className={styles.endOfResults}>
              You&apos;ve reached the end of the results.
            </p>
          )}
        </>
      ) : (
        !loading && (
          <div className={styles.noResults}>
            <p>
              No open gigs found {getFilterDescription()}. Try adjusting your
              filters or check back later!
            </p>
          </div>
        )
      )}
    </section>
  );
};

TaskList.propTypes = {
  initialSearchTerm: PropTypes.string,
  category: PropTypes.string,
  location: PropTypes.string,
  priceRange: PropTypes.string,
  onGigClick: PropTypes.func,
};
