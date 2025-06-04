import React from "react";
import { Link } from "react-router-dom"; // Use react-router Link
import styles from "./ProfileSidebar.module.css"; // Your CSS module
import styles2 from "./AwaitedPostedGigs.module.css"; // Your CSS module
import { useQuery } from "@tanstack/react-query"; // Import react-query
import apiClient from "../api/axiosConfig"; // Adjust path for API client
import logger from "../utils/logger"; // Optional logger
import cn from "classnames"; // For conditional classnames

const AwaitedPostedGigs = () => {
  // Fetch awaited posted gigs using react-query
  const {
    data: awaitedGigs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["awaitedPostedGigs"],
    queryFn: async () => {
      const response = await apiClient.get("/gigs/awaiting-posted-gig");
      return response.data.data.gigs; // Assuming the API returns gigs in this structure
    },
    onError: (err) => {
      logger.error("Error fetching awaited posted gigs:", err);
    },
  });
  console.log({ awaitedGigs });

  return (
    <section className={cn(styles.awaitedSection, styles2.container)}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img src="/assets/lamp-on.svg" alt="Lamp" width={20} height={20} />{" "}
          {/* Icon path */}
        </div>
        <h4 className={styles.sectionTitleUnderlined}>Awaited Posted Gigs</h4>
      </div>
      <div className={styles.awaitedList}>
        {isLoading ? (
          <p>Loading awaited posted gigs...</p>
        ) : isError ? (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            {error?.message || "Failed to load awaited posted gigs."}
          </p>
        ) : awaitedGigs?.length > 0 ? (
          awaitedGigs.map((gig) => (
            <div key={gig.id} className={styles.awaitedItem}>
              <div>
                <Link
                  to={`/gigs/${gig._id}`}
                  className={cn(styles.viewGigLink, "!underline")}
                >
                  <p className={styles.awaitedDescription}>{gig.title}</p>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            No awaited posted gigs found right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default AwaitedPostedGigs;
