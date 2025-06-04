// src/components/ProfilePage/ReviewsSection.js
import React, { useState, useEffect } from "react";
import styles from "./ReviewsSection.module.css"; // Create CSS Module
import ReviewCard from "./ReviewCard";
import apiClient from "../../api/axiosConfig"; // Adjust path
import { useAuth } from "../../context/AuthContext"; // Adjust path
import logger from "../../utils/logger";

function ReviewsSection() {
    const { user } = useAuth(); // Get current user to fetch reviews ABOUT them
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
             if (!user?._id) return; // Need user ID to fetch reviews about them
             setLoading(true); setError('');
             try {
                 logger.info(`Fetching reviews for taskerId: ${user._id}`);
                 // Use the endpoint to get reviews where the current user is the reviewee (tasker)
                 const response = await apiClient.get(`/reviews?taskerId=${user._id}`);
                 setReviews(response.data.data.reviews || []);
                 logger.debug("Fetched reviews:", response.data.data.reviews);
             } catch (err) {
                 logger.error("Error fetching reviews:", err);
                 setError("Could not load reviews.");
             } finally {
                 setLoading(false);
             }
        };
        // Fetch only if the user is a tasker, as providers don't receive reviews in this model
        if (user?.role?.includes('tasker')) {
             fetchReviews();
        } else {
            setLoading(false); // Not applicable for provider, stop loading
        }
    }, [user]); // Refetch if user changes

     // Don't render section if user is not a tasker
     if (!user?.role?.includes('tasker')) {
         return null;
     }

    return (
        <section className={`${styles.reviewsCard} card`}> {/* Add card class */}
            <div className={styles.reviewsHeader}>
                <h2>Reviews About You</h2>
                {/* Optional: Link to see all reviews page? */}
            </div>

             {loading && <p>Loading reviews...</p>}
             {error && <p className="error-message">{error}</p>}

             {/* Scrollable container for ReviewCards */}
             <div className={styles.reviewsGrid}>
                 {!loading && !error && reviews.length === 0 && <p>No reviews received yet.</p>}
                 {!loading && !error && reviews.length > 0 && reviews.map((review) => (
                     <ReviewCard key={review._id} review={review} /> // Pass review object
                 ))}
            </div>
        </section>
    );
}

export default ReviewsSection;