// frontend/src/components/ReviewForm.js

import React, { useState } from 'react';
import apiClient from '../api/axiosConfig'; // Assuming you use axios for API calls
import styles from './ReviewForm.module.css';

// Simple reusable Star Rating Component
const StarRatingInput = ({ rating, setRating, disabled = false }) => {
    return (
        <div className={styles.starRatingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`${styles.star} ${star <= rating ? styles.starSelected : styles.starUnselected}`}
                    onClick={() => !disabled && setRating(star)}
                    onMouseEnter={() => !disabled} // Could add hover effect here
                    onMouseLeave={() => !disabled}
                >
                    ★
                </span>
            ))}
        </div>
    );
};


function ReviewForm({ contractId, onSubmitSuccess }) {
    const [rating, setRating] = useState(0); // Initialize rating to 0
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating (1-5 stars).');
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const payload = {
                contractId, // Backend uses this to find the gig/tasker/provider
                rating,
                comment: comment.trim() // Send trimmed comment
            };
            console.log("Submitting review with payload:", payload);
            const response = await apiClient.post('/reviews', payload); // POST to the reviews endpoint

            console.log("Review submitted successfully:", response.data);
            setSuccessMessage("Review submitted successfully!");

            if (onSubmitSuccess) {
                onSubmitSuccess(response.data.data.review); // Pass the new review back to parent
            }
            // Don't clear form immediately, parent component might hide it based on success/state change
            // setRating(0);
            // setComment('');

        } catch (err) {
            console.error("Error submitting review:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to submit review. Perhaps it was already reviewed?');
        } finally {
            setLoading(false);
        }
    };

    // Prevent form resubmission if successful
    if (successMessage) {
        return <p className={styles.successMessage}>{successMessage}</p>;
    }

    return (
        // Apply card styling or custom styling as needed
        <form onSubmit={handleSubmit} className={styles.reviewFormCard}>
            <h4>Leave a Review for the Tasker</h4>
             {error && <p className={styles.errorMessage}>{error}</p>} {/* Use className for styling */}
            <div className={styles.formGroup}> {/* Add margin */}
                <label className={styles.label}>Rating:*</label>
                <StarRatingInput rating={rating} setRating={setRating} disabled={loading} />
            </div>
            <div className={styles.formGroup}> {/* Add margin */}
                <label htmlFor={`comment-${contractId}`} className={styles.label}>Comment (Optional):</label>
                <textarea
                    id={`comment-${contractId}`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4" // Slightly more rows
                    className={styles.textArea} // Ensure width consistency
                    maxLength="1000"
                    disabled={loading}
                />
            </div>
            <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

export default ReviewForm;