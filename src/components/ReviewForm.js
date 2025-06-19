// frontend/src/components/ReviewForm.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../api/axiosConfig'; // Assuming you use axios for API calls
import styles from './ReviewForm.module.css';

// Simple reusable Star Rating Component
const StarRatingInput = ({ rating, setRating, disabled = false }) => {
  // Keyboard handler for accessibility
  const handleKeyDown = (star, e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      setRating(star);
    }
  };
  return (
    <div
      className={styles.starRatingContainer}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`${styles.star} ${star <= rating ? styles.starSelected : styles.starUnselected}`}
          onClick={() => !disabled && setRating(star)}
          onKeyDown={e => handleKeyDown(star, e)}
          role="radio"
          aria-checked={star === rating}
          tabIndex={disabled ? -1 : 0}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};
StarRatingInput.propTypes = {
  rating: PropTypes.number.isRequired,
  setRating: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

function ReviewForm({ contractId, onSubmitSuccess }) {
  const [rating, setRating] = useState(0); // Initialize rating to 0
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async e => {
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
        comment: comment.trim(), // Send trimmed comment
      };
      const response = await apiClient.post('/reviews', payload); // POST to the reviews endpoint

      setSuccessMessage('Review submitted successfully!');

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.data.review); // Pass the new review back to parent
      }
      // Don't clear form immediately, parent component might hide it based on success/state change
      // setRating(0);
      // setComment('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit review. Perhaps it was already reviewed?'
      );
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
      {error && <p className={styles.errorMessage}>{error}</p>}{' '}
      {/* Use className for styling */}
      <div className={styles.formGroup}>
        <label className={styles.label} id={`star-label-${contractId}`}>
          Rating:*
        </label>
        <StarRatingInput
          rating={rating}
          setRating={setRating}
          disabled={loading}
          aria-labelledby={`star-label-${contractId}`}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor={`comment-${contractId}`} className={styles.label}>
          Comment (Optional):
        </label>
        <textarea
          id={`comment-${contractId}`}
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows="4"
          className={styles.textArea}
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

ReviewForm.propTypes = {
  contractId: PropTypes.string.isRequired,
  onSubmitSuccess: PropTypes.func,
};

export default ReviewForm;
