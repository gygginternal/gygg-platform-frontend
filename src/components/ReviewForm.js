// frontend/src/components/ReviewForm.js

import { useState } from 'react';
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

function ReviewForm({ contractId, review, onSuccess }) {
  const [rating, setRating] = useState(review ? review.rating : 5);
  const [comment, setComment] = useState(review ? review.comment : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (review) {
        await apiClient.patch(`/reviews/${review._id}`, { rating, comment });
      } else {
        await apiClient.post('/reviews', {
          contract: contractId,
          rating,
          comment,
        });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit review. Perhaps it was already reviewed?'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!review) return;
    setLoading(true);
    try {
      await apiClient.delete(`/reviews/${review._id}`);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Handle error silently or log it
    }
    setLoading(false);
  };

  return (
    // Apply card styling or custom styling as needed
    <form onSubmit={handleSubmit} className={styles.reviewFormCard}>
      <h4>Leave a Review for the Tasker</h4>
      {error && <p className={styles.errorMessage}>{error}</p>}{' '}
      {/* Use className for styling */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor={`rating-${contractId}`}>
          Rating:*
        </label>
        <select
          id={`rating-${contractId}`}
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          disabled={loading}
          className={styles.select}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
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
        {loading ? 'Submitting...' : review ? 'Update' : 'Submit'} Review
      </button>
      {review && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className={styles.deleteButton}
        >
          Delete
        </button>
      )}
    </form>
  );
}

ReviewForm.propTypes = {
  contractId: PropTypes.string.isRequired,
  review: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default ReviewForm;
