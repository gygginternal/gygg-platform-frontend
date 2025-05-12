import React, { useState, useEffect } from "react";
import styles from "./TaskList.module.css"; // Your CSS module
import TaskCard from "./TaskCard"; // Use the adapted TaskCard
import apiClient from "../api/axiosConfig"; // Adjust path
import logger from "../utils/logger"; // Optional logger

export const TaskList = () => { // Changed back to named export if page expects it
  const [gigs, setGigs] = useState([]); // State for fetched gigs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Add state for pagination later if needed
  // const [currentPage, setCurrentPage] = useState(1);
  // const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      setError('');
      try {
        logger.info("Fetching all open gigs...");
        // Fetch only 'open' gigs for this list? Or add filtering later?
        const response = await apiClient.get('/gigs', { params: { status: 'open', limit: 20 } }); // Fetch open gigs, limit results
        setGigs(response.data.data.gigs || []);
        logger.debug("Fetched gigs:", response.data.data.gigs);
      } catch (err) {
        logger.error("Error fetching gigs:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Could not load available gigs.");
        setGigs([]); // Clear gigs on error
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []); // Fetch on component mount

  // Render logic
  if (loading) {
    return <section className={styles.taskList}><p>Loading available gigs...</p></section>;
  }

  if (error) {
    return <section className={styles.taskList}><p className="error-message">Error: {error}</p></section>;
  }

  return (
    <section className={styles.taskList}>
      {gigs.length > 0 ? (
        gigs.map((gig) => (
          // Pass the entire gig object fetched from the API to TaskCard
          <TaskCard key={gig._id} gig={gig} />
        ))
      ) : (
        <p>No open gigs available right now. Check back later!</p>
      )}
      {/* Add Load More button here if implementing pagination */}
    </section>
  );
};

// If page.js imports { TaskList }, keep named export:
// export default TaskList; // Use this if imported as default