// src/components/Onboarding/GigPostReview.js
import PropTypes from 'prop-types';
import styles from './GigPostReview.module.css';

function GigPostReview({ gigData, onEditStep }) {
  // Format location display
  const getLocationDisplay = () => {
    if (gigData.isRemote) {
      return 'Remote (can be done from anywhere)';
    }
    
    const city = gigData.gigCity?.trim();
    const state = gigData.gigState?.trim();
    
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }
    
    return 'Location not specified';
  };

  return (
    <div className={styles.reviewSection}>
      <h3 className={styles.reviewSubTitle}>Review Your Gig Details</h3>
      <div className={styles.reviewItem}>
        <span>
          <strong>Gig Title:</strong> {gigData.gigTitle || 'N/A'}
        </span>
        <button onClick={() => onEditStep(1)} className={styles.editStepButton}>
          Edit
        </button>
      </div>
      <div className={styles.reviewItem}>
        <span>
          <strong>Timeline:</strong> {gigData.gigTimeline || 'N/A'}
        </span>
        <button onClick={() => onEditStep(1)} className={styles.editStepButton}>
          Edit
        </button>
      </div>
      <div className={styles.reviewItem}>
        <span>
          <strong>Category:</strong> {gigData.gigCategory || 'N/A'}
        </span>
        <button onClick={() => onEditStep(1)} className={styles.editStepButton}>
          Edit
        </button>
      </div>
      <div className={styles.reviewItem}>
        <span>
          <strong>Description:</strong>{' '}
          <p className={styles.reviewDescription}>
            {gigData.gigDescription || 'N/A'}
          </p>
        </span>
        <button onClick={() => onEditStep(2)} className={styles.editStepButton}>
          Edit
        </button>
      </div>
      <div className={styles.reviewItem}>
        <span>
          <strong>Payment Structure:</strong> {gigData.gigPaymentType || 'N/A'}
        </span>
        <button onClick={() => onEditStep(2)} className={styles.editStepButton}>
          Edit
        </button>
      </div>
      <div className={styles.reviewItem}>
        <span>
          <strong>Budget:</strong>
          {gigData.gigPaymentType === 'fixed' && ` ${gigData.gigCost || '0'}`}
          {gigData.gigPaymentType === 'hourly' &&
            ` ${gigData.gigRatePerHour || '0'} /hr`}
        </span>
        <button onClick={() => onEditStep(2)} className={styles.editStepButton}>
          Edit
        </button>
      </div>
      <div className={styles.reviewItem}>
        <span>
          <strong>Location:</strong> {getLocationDisplay()}
        </span>
        <button onClick={() => onEditStep(2)} className={styles.editStepButton}>
          Edit
        </button>
      </div>
      {/* Add display for other gig fields if collected (skills required etc.) */}
    </div>
  );
}
export default GigPostReview;

GigPostReview.propTypes = {
  gigData: PropTypes.object.isRequired,
  onEditStep: PropTypes.func.isRequired,
};
