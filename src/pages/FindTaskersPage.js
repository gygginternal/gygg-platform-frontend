import { useState, useEffect } from "react";
import apiClient from "../api/axiosConfig"; // Adjust path
import { ServiceProviderListing } from "../components/TaskerMatchedSection";
import { TaskerMatchedSidebar } from "../components/TaskerMatchedSidebar";
import styles from "./MatchedTaskersPage.module.css";

export const FindTaskersPage = () => {
  const [gigHelpers, setGigHelpers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchGigHelpers = async (page = 1) => {
    const isFirstPage = page === 1;
    if (isFirstPage) {
      setGigHelpers([]);
      setHasMore(true); // Reset pagination state
    }
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get(
        `/taskers/matched?page=${page}&limit=10`
      );
      const newHelpers = response.data;
      setGigHelpers((prev) =>
        isFirstPage ? newHelpers : [...prev, ...newHelpers]
      );
      setHasMore(newHelpers.length === 10); // Assume more results if the limit is reached
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching gig helpers:", err);
      setError(err.response?.data?.message || "Failed to load gig helpers.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigHelpers(1); // Fetch the first page on mount
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchGigHelpers(currentPage + 1);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebarArea}>
          <TaskerMatchedSidebar />
        </aside>
        <main className={styles.mainFeedArea}>
          <h2>Find Matching Taskers</h2>
          <p>
            Showing taskers based on similarities in your profile's hobbies and
            people preferences.
          </p>
          <button
            onClick={() => fetchGigHelpers(1)}
            disabled={loading}
            style={{ marginBottom: "20px" }}
          >
            Refresh Matches
          </button>

          {error && <p className="error-message">{error}</p>}
          <ServiceProviderListing gigHelpers={gigHelpers} />
          {loading && <p>Loading...</p>}
          {hasMore && !loading && (
            <button onClick={loadMore} style={{ marginTop: "10px" }}>
              Load More Taskers
            </button>
          )}
          {!hasMore && gigHelpers.length > 0 && (
            <p
              style={{ textAlign: "center", marginTop: "20px", color: "#888" }}
            >
              End of results.
            </p>
          )}
        </main>
      </div>
    </div>
  );
};
