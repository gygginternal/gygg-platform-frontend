// frontend/src/components/GigsPage/TaskList.js
import React, { useState, useEffect, useCallback } from "react";
import styles from "./TaskList.module.css";
import TaskCard from "./TaskCard";
import apiClient from "../api/axiosConfig";
import logger from "../utils/logger";

export const TaskList = ({ initialSearchTerm = "" }) => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    logger.debug(`TaskList: initialSearchTerm prop updated to: "${initialSearchTerm}"`);
    setCurrentSearchTerm(initialSearchTerm);
    setCurrentPage(1);
    setGigs([]);
  }, [initialSearchTerm]);

  const fetchGigs = useCallback(async (pageToFetch, termToSearch) => {
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
    if (termToSearch && termToSearch.trim() !== '') {
      params.search = termToSearch.trim();
    }

    try {
      logger.info(`TaskList: Fetching gigs. Page: ${pageToFetch}, Search: "${termToSearch || 'None'}"`);
      const response = await apiClient.get('/gigs', { params });
      const newGigs = response.data.data.gigs || [];
      const backendTotalPages = response.data.totalPages || 1;
      const backendCurrentPage = response.data.page || 1;

      logger.debug("TaskList: Fetched gigs data:", { newGigs, backendTotalPages, backendCurrentPage });

      setGigs(prevGigs => isFirstLoadForTerm ? newGigs : [...prevGigs, ...newGigs]);
      setTotalPages(backendTotalPages);
      setCurrentPage(backendCurrentPage);
      setHasMore(backendCurrentPage < backendTotalPages);
    } catch (err) {
      logger.error("Error fetching gigs in TaskList:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Could not load available gigs.");
      if (isFirstLoadForTerm) setGigs([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (currentSearchTerm !== undefined) {
      logger.debug(`TaskList: Search term changed to "${currentSearchTerm}", fetching page 1.`);
      fetchGigs(1, currentSearchTerm);
    }
  }, [currentSearchTerm, fetchGigs]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchGigs(currentPage + 1, currentSearchTerm);
    }
  };

  if (loading && currentPage === 1 && gigs.length === 0) {
    return <section className={styles.taskList}><p>Loading available gigs...</p></section>;
  }

  if (error) {
    return <section className={styles.taskList}><p className={styles.errorMessage}>Error: {error}</p></section>;
  }

  return (
    <section className={styles.taskList}>
      {gigs.length > 0 ? (
        gigs.map((gig) => <TaskCard key={gig._id} gig={gig} />)
      ) : (
        !loading && <p>No open gigs found {currentSearchTerm ? `matching "${currentSearchTerm}"` : "at this time"}. Check back later!</p>
      )}

      {isLoadingMore && <p className={styles.loadingMore}>Loading more gigs...</p>}

      {hasMore && !isLoadingMore && gigs.length > 0 && (
        <button onClick={handleLoadMore} className={styles.loadMoreButton}>
          Load More Gigs
        </button>
      )}

      {!hasMore && gigs.length > 0 && !isLoadingMore && (
        <p className={styles.endOfResults}>You've reached the end of the results.</p>
      )}
    </section>
  );
};
