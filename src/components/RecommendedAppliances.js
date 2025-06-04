import React from "react";
import cn from "classnames"; // For conditional classnames
import { Link } from "react-router-dom"; // Use react-router Link
import styles from "./ProfileSidebar.module.css"; // Your CSS module
import { useQuery } from "@tanstack/react-query"; // Import react-query
import apiClient from "../api/axiosConfig"; // Adjust path for API client
import logger from "../utils/logger"; // Optional logger

const RecommendedAppliances = () => {
  // Fetch recommended appliances using react-query
  const {
    data: recommendedAppliances,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recommendedAppliances"],
    queryFn: async () => {
      const response = await apiClient.get("/applications/top-match");
      console.log({ response });

      return response.data.data; // Assuming the API returns applications in this structure
    },
    onError: (err) => {
      logger.error("Error fetching recommended appliances:", err);
    },
  });

  // Format appliance description
  const formatApplianceDescription = (appliance) => {
    return appliance.description;
  };

  return (
    <section className={cn(styles.appliancesSection, "mt-5")}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img
            src="/assets/profile-2user.svg"
            alt="Lamp"
            width={20}
            height={20}
          />{" "}
          {/* Icon path */}
        </div>
        <h4 className={styles.sectionTitleUnderlined}>
          {recommendedAppliances?.length || "0"} people applied to your gig
        </h4>
      </div>
      <div className={styles.appliancesList}>
        {isLoading ? (
          <p>Loading recommended applications...</p>
        ) : isError ? (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            {error?.message || "Failed to load recommended appliances."}
          </p>
        ) : recommendedAppliances?.length > 0 ? (
          recommendedAppliances.map((appliance) => (
            <div key={appliance.id} className={styles.applianceItem}>
              <div>
                <p className={styles.applianceDescription}>
                  {formatApplianceDescription(appliance)}
                </p>
                <Link
                  to={`/gigs/${appliance.gigId}`}
                  className={styles.viewApplianceLink}
                >
                  View application
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            No recommended applications found right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default RecommendedAppliances;
