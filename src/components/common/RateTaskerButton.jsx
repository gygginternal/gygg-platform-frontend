import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './RateTaskerButton.module.css';
import ReviewForm from './ReviewForm';

const RateTaskerButton = ({ contractId, onRatingSubmitted }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const handleRatingSuccess = () => {
    setShowReviewForm(false);
    if (onRatingSubmitted) onRatingSubmitted();
  };

  return (
    <div className={styles.rateTaskerContainer}>
      {!showReviewForm ? (
        <button
          className={styles.rateTaskerButton}
          onClick={() => setShowReviewForm(true)}
        >
          Rate Tasker
        </button>
      ) : (
        <div className={styles.reviewFormContainer}>
          <ReviewForm
            contractId={contractId}
            review={existingReview}
            onSuccess={handleRatingSuccess}
          />
          <button
            className={styles.cancelButton}
            onClick={() => setShowReviewForm(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

RateTaskerButton.propTypes = {
  contractId: PropTypes.string.isRequired,
  onRatingSubmitted: PropTypes.func,
};

export default RateTaskerButton;