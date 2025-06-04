import React from "react";
import { Link } from "react-router-dom"; // Use react-router Link
import styles from "./ProfileSidebar.module.css"; // Your CSS module
import { useQuery } from "@tanstack/react-query"; // Import react-query
import apiClient from "../api/axiosConfig"; // Adjust path for API client
import logger from "../utils/logger"; // Optional logger

const RecommendedGigs = () => {
  // Fetch recommended gigs using react-query
  const {
    data: recommendedGigs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recommendedGigs"],
    queryFn: async () => {
      const response = await apiClient.get("/gigs/top-match");
      console.log({ response });

      return response.data; // Assuming the API returns gigs in this structure
    },
    onError: (err) => {
      logger.error("Error fetching recommended gigs:", err);
    },
  });

  // Format gig description
  const formatGigDescription = (gig) => {
    const posterName = [gig.poster?.firstName, gig.poster?.lastName]
      .filter(Boolean)
      .join(" ");
    const location =
      gig.poster?.address?.city || gig.poster?.address?.state || "";
    return `${posterName}${
      location ? ` from ${location}` : ""
    } needs help with "${gig.title}"`;
  };

  return (
    <section className={styles.peopleSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img
            src="/assets/profile-2user.svg"
            alt="Profile"
            width={20}
            height={20}
          />
        </div>
        <h4 className={styles.sectionTitleUnderlined}>
          Open Gigs You Might Like
        </h4>
      </div>
      <div className={styles.peopleList}>
        {isLoading ? (
          <p>Loading recommended gigs...</p>
        ) : isError ? (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            {error?.message || "Failed to load recommended gigs."}
          </p>
        ) : recommendedGigs?.length > 0 ? (
          recommendedGigs.map((gig) => (
            <div key={gig.id} className={styles.personItem}>
              <div>
                <p className={styles.personDescription}>
                  {formatGigDescription(gig)}
                </p>
                <Link to={`/gigs/${gig._id}`} className={styles.viewGigLink}>
                  View gig detail
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            No recommended gigs found right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default RecommendedGigs;
