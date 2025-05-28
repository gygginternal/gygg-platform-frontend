// frontend/src/components/GigsPage/TaskList.js
import React, { useState, useEffect, useCallback } from "react";
import styles from "./TaskList.module.css"; // Your CSS Module
import TaskCard from "./TaskCard";
import apiClient from "../api/axiosConfig"; // Adjust path as needed
import logger from "../utils/logger";     // Optional, adjust path as needed

export const TaskList = ({ initialSearchTerm = "" }) => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true); // For initial load / new search
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // To manage total pages from backend
  const [hasMore, setHasMore] = useState(false); // Derived from currentPage < totalPages
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For "Load More" button
  const [currentSearchTerm, setCurrentSearchTerm] = useState(initialSearchTerm);

  // Update internal search term and reset page when initialSearchTerm prop changes
  useEffect(() => {
    logger.debug(`TaskList: initialSearchTerm prop updated to: "${initialSearchTerm}"`);
    setCurrentSearchTerm(initialSearchTerm);
    setCurrentPage(1); // Reset to page 1 for a new search
    setGigs([]);       // Clear previous results for a new search
    // `hasMore` will be updated by fetchGigs
  }, [initialSearchTerm]);


  // useCallback for fetchGigs to stabilize its identity if passed to other effects/components
  const fetchGigs = useCallback(async (pageToFetch, termToSearch) => {
    const isFirstLoadForTerm = pageToFetch === 1;
    if (isFirstLoadForTerm) {
      setLoading(true); // Show main loading for new search or first page
    } else {
      setIsLoadingMore(true); // Show specific "loading more" indicator
    }
    setError('');

    const params = {
      status: 'open', // Default to fetching open gigs
      limit: 10,      // Number of gigs per page
      page: pageToFetch,
    };
    if (termToSearch && termToSearch.trim() !== '') {
      params.search = termToSearch.trim();
    }

    try {
      logger.info(`TaskList: Fetching gigs. Page: ${pageToFetch}, Search: "${termToSearch || 'None'}"`);
      const response = await apiClient.get('/gigs', { params });
      const newGigs = response.data.data.gigs || [];
      const backendTotalPages = response.data.totalPages || 1;
      const backendCurrentPage = response.data.page || 1; // Use page from backend response

      logger.debug("TaskList: Fetched gigs data:", { newGigs, backendTotalPages, backendCurrentPage });

      setGigs(prevGigs => isFirstLoadForTerm ? newGigs : [...prevGigs, ...newGigs]);
      setTotalPages(backendTotalPages);
      setCurrentPage(backendCurrentPage); // Sync current page with backend response
      setHasMore(backendCurrentPage < backendTotalPages);

    } catch (err) {
      logger.error("Error fetching gigs in TaskList:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Could not load available gigs.");
      if (isFirstLoadForTerm) setGigs([]); // Clear on error for new search
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []); // No dependencies, relies on closure values updated by other effects

  // Effect to trigger fetch when currentSearchTerm changes (for a new search)
  // or when initialSearchTerm (via currentSearchTerm) sets up the first load.
  useEffect(() => {
    // Fetch page 1 whenever currentSearchTerm is initialized or changes
    if (currentSearchTerm !== undefined) { // Ensure it's been set (even to empty string)
        logger.debug(`TaskList: Search term changed to "${currentSearchTerm}", fetching page 1.`);
        fetchGigs(1, currentSearchTerm);
    }
  }, [currentSearchTerm, fetchGigs]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchGigs(currentPage + 1, currentSearchTerm, true); // append = true is handled by isFirstLoadForTerm
    }
  };

  // --- Render Logic ---
  if (loading && currentPage === 1 && gigs.length === 0) { // Initial loading state for a new search/first load
    return <section className={styles.taskList}><p>Loading available gigs...</p></section>;
  }
  if (error) {
    return <section className={styles.taskList}><p className="error-message">Error: {error}</p></section>;
  }

  return (
    <section className={styles.taskList}>
      {gigs.length > 0 ? (
        gigs.map((gig) => <TaskCard key={gig._id} gig={gig} />)
      ) : (
        // Show different message if loading vs. no results after loading
        !loading && <p>No open gigs found {currentSearchTerm ? `matching "${currentSearchTerm}"` : "at this time"}. Check back later!</p>
      )}

      {isLoadingMore && <p style={{textAlign: 'center', padding: '15px', color: '#555'}}>Loading more gigs...</p>}

      {hasMore && !isLoadingMore && gigs.length > 0 && (
          <button onClick={handleLoadMore} className={styles.loadMoreButton} style={{width: '100%', marginTop: '20px', padding: '12px'}}>
              Load More Gigs
          </button>
      )}
      {!hasMore && gigs.length > 0 && !isLoadingMore && (
           <p style={{textAlign: 'center', color: '#777', marginTop: '20px'}}>You've reached the end of the results.</p>
      )}
    </section>
  );
};