import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import apiClient from '../../api/axiosConfig';
import styles from './GigsAppliedPage.module.css';
import ProfileSidebar from '../../components/common/ProfileSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter } from 'lucide-react';
import { CATEGORY_ENUM } from '../../constants/categories';
import AppliedGigCard from '../../components/features/GigsAppliedPage/AppliedGigCard';
import GigDetailsModal from '../../components/common/GigDetailsModal';

export const GigsAppliedContext = createContext();
export function useGigsApplied() {
  return useContext(GigsAppliedContext);
}

const GigsAppliedPage = () => {
  const { user, sessionRole } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGig, setSelectedGig] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceRange, setPriceRange] = useState('Any');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs for tracking rate limiting and retry logic
  const rateLimitRetryTimeout = useRef(null);
  const gigDetailRetryTimeout = useRef(null);

  // Cleanup function for timeouts
  useEffect(() => {
    return () => {
      // Clear any pending retry timeouts when component unmounts
      if (rateLimitRetryTimeout.current) {
        clearTimeout(rateLimitRetryTimeout.current);
      }
      if (gigDetailRetryTimeout.current) {
        clearTimeout(gigDetailRetryTimeout.current);
      }
    };
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriceRange('Any');
  };

  const fetchApplications = async (pageToFetch = 1) => {
    // Don't fetch if already rate limited (except for manual retries)
    if (isRateLimited && pageToFetch !== -1) return;

    const isFirstPage = pageToFetch === 1;
    if (isFirstPage) {
      setLoading(true);
    } else if (pageToFetch !== -1) {
      setIsLoadingMore(true);
    }
    setError('');

    // Only reset rate limit flag if this is not the automatic retry
    if (pageToFetch !== -1) {
      setIsRateLimited(false);
    }

    try {
      const params = {
        page: pageToFetch === -1 ? 1 : pageToFetch, // Use page 1 if it's a retry
        limit: 10, // Load 10 applications per page
      };

      // Add filters to the request
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter.toLowerCase();
      }

      const res = await apiClient.get('/applications/my-gigs', { params });
      const newApplications = res.data.data?.applications || [];

      // Update pagination info with defensive programming
      const pagination = res.data.data?.pagination || {};
      const totalPages = pagination.totalPages || 1;
      const currentPage = pagination.currentPage || 1;
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
      setHasMore(currentPage < totalPages);

      // Update applications list
      if (isFirstPage || pageToFetch === -1) {
        setApplications(newApplications);
      } else {
        setApplications(prev => [...prev, ...newApplications]);
      }
    } catch (err) {
      // Handle rate limiting errors specifically with retry mechanism
      if (err.response?.status === 429) {
        // Check for Retry-After header
        const retryAfter = err.response.headers['retry-after'];
        const retryAfterSeconds = parseInt(retryAfter, 10) || 30; // Default to 30 seconds if not specified

        setError(`Too many requests. Please try again in ${retryAfterSeconds} seconds.`);
        setIsRateLimited(true);

        // Clear any existing timeout
        if (rateLimitRetryTimeout.current) {
          clearTimeout(rateLimitRetryTimeout.current);
        }

        // Set up retry after the specified time
        rateLimitRetryTimeout.current = setTimeout(() => {
          setIsRateLimited(false);
          fetchApplications(-1); // Use -1 to signal it's a retry, allowing the call to go through
        }, retryAfterSeconds * 1000);
      } else {
        setError('Failed to load applied gigs.');
      }
      if (isFirstPage || pageToFetch === -1) setApplications([]);
    } finally {
      if (pageToFetch !== -1) {
        setLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    // Use a timeout to delay the initial fetch to avoid race conditions with other page loads
    const timer = setTimeout(() => {
      handleInitialLoad();
    }, 500); // Increased delay to 500ms to better avoid race conditions

    return () => clearTimeout(timer);
  }, [user, sessionRole, statusFilter, categoryFilter, priceRange, searchTerm, isRateLimited]);

  const handleCardClick = async app => {
    // Don't fetch if rate limited
    if (isRateLimited) {
      setError('Too many requests. Please wait before trying again.');
      return;
    }

    try {
      // Use the gig ID from the application's gig field
      const res = await apiClient.get(`/gigs/${app.gig._id}`);
      setSelectedGig(res.data.data.gig);
      setSelectedApplicationId(app._id); // Use the application ID
      setModalOpen(true);
    } catch (err) {
      // Handle rate limiting errors specifically with retry mechanism
      if (err.response?.status === 429) {
        // Check for Retry-After header
        const retryAfter = err.response.headers['retry-after'];
        const retryAfterSeconds = parseInt(retryAfter, 10) || 30; // Default to 30 seconds if not specified

        setError(`Too many requests. Please try again in ${retryAfterSeconds} seconds.`);
        setIsRateLimited(true);

        // Clear any existing timeout for gig detail retries
        if (gigDetailRetryTimeout.current) {
          clearTimeout(gigDetailRetryTimeout.current);
        }

        // Set up retry after the specified time
        gigDetailRetryTimeout.current = setTimeout(() => {
          setIsRateLimited(false);
          handleCardClick(app); // Retry the same action
        }, retryAfterSeconds * 1000);
      } else {
        setError('Failed to load gig details.');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedGig(null);
  };

  const handleApplicationUpdate = () => {
    // Refresh the applications list
    if (user && sessionRole === 'tasker') {
      setCurrentPage(1);
      setApplications([]);
      fetchApplications(1);
    }
  };

  const handleRetry = () => {
    // Clear any pending timeouts
    if (rateLimitRetryTimeout.current) {
      clearTimeout(rateLimitRetryTimeout.current);
    }

    setError('');
    setIsRateLimited(false);
    if (user && sessionRole === 'tasker') {
      setCurrentPage(1);
      setApplications([]);
      fetchApplications(1);
    }
  };

  // Function specifically for handling initial load retry after delay
  const handleInitialLoad = async () => {
    if (user && sessionRole === 'tasker' && !isRateLimited) {
      setCurrentPage(1);
      setApplications([]);
      await fetchApplications(1);
    }
  };

  if (user && sessionRole !== 'tasker') {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainFeedArea}>
            <div className={styles.container}>
              <h2>Gigs Applied</h2>
              <p>This page is only available for taskers.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Using applications that are already filtered by the backend
  const filteredApplications = applications;
  const statusCounts = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <GigsAppliedContext.Provider value={{}}>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <aside className={styles.sidebarArea}>
            <ProfileSidebar />
          </aside>
          <main className={styles.mainFeedArea}>
            <div className={styles.header}>
              <h1 className={styles.title}>Gigs Applied</h1>
              <p className={styles.subtitle}>
                Track and manage your gig applications
              </p>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{statusCounts.total}</div>
                <div className={styles.statLabel}>Total</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{statusCounts.pending}</div>
                <div className={styles.statLabel}>Pending</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{statusCounts.rejected}</div>
                <div className={styles.statLabel}>Rejected</div>
              </div>
            </div>

            <div className={styles.searchAndFilters}>
              <div className={styles.searchBar}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <button
                  className={styles.filterButton}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className={styles.filterIcon} />
                  Filters
                </button>
              </div>
              {showFilters && (
                <div className={styles.filtersPanel}>
                  <div className={styles.filterSection}>
                    <h3>Categories</h3>
                    <div className={styles.categoryList}>
                      {['All', ...CATEGORY_ENUM].map(category => (
                        <button
                          key={category}
                          className={`${styles.categoryButton} ${
                            categoryFilter === category ? styles.selected : ''
                          }`}
                          onClick={() => setCategoryFilter(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.filterSection}>
                    <h3>Price Range</h3>
                    <div className={styles.priceRangeList}>
                      {[
                        'Any',
                        'Under $20',
                        '$20 - $50',
                        '$50 - $100',
                        '$100+',
                      ].map(range => (
                        <button
                          key={range}
                          className={`${styles.priceRangeButton} ${
                            priceRange === range ? styles.selected : ''
                          }`}
                          onClick={() => setPriceRange(range)}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.filterSection}>
                    <h3>Status</h3>
                    <div className={styles.priceRangeList}>
                      {['All', 'Pending', 'Rejected'].map(opt => (
                        <button
                          key={opt}
                          className={`${styles.priceRangeButton} ${
                            statusFilter === opt ? styles.selected : ''
                          }`}
                          onClick={() => setStatusFilter(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    className={styles.clearFiltersButton}
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            <div className={styles.applicationsList}>
              {loading && applications.length === 0 ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Loading your applied gigs...</p>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <p className={styles.error}>{error}</p>
                  <button className={styles.retryButton} onClick={handleRetry}>
                    Retry Now
                  </button>
                </div>
              ) : applications.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>No Applications Found</h3>
                  <p>
                    You haven't applied to any gigs matching your current
                    filters.
                  </p>
                </div>
              ) : (
                applications.map(app => (
                  <AppliedGigCard
                    key={app._id}
                    gig={{
                      ...app.gig,
                      status: app.status, // Include application status
                      applicationId: app._id, // Pass the application ID
                      createdAt: app.gig.createdAt || app.createdAt, // Use gig's createdAt if available, otherwise application's
                    }}
                    onClick={() => handleCardClick(app)}
                  />
                ))
              )}

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className={styles.loadingMore}>
                  <div className={styles.loadingSpinnerSmall}></div>
                  <p>Loading more applications...</p>
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !isLoadingMore && (
                <button
                  onClick={() => fetchApplications(currentPage + 1)}
                  className={styles.loadMoreButton}
                >
                  Load More Applications
                </button>
              )}

              {!hasMore && applications.length > 0 && (
                <p className={styles.endOfResults}>
                  You've reached the end of the results.
                </p>
              )}
            </div>
          </main>
        </div>
        <GigDetailsModal
          gig={selectedGig}
          open={modalOpen}
          onClose={handleModalClose}
          onApply={handleApplicationUpdate}
          showRetract
          applicationId={selectedApplicationId}
        />
      </div>
    </GigsAppliedContext.Provider>
  );
};

export default GigsAppliedPage;
