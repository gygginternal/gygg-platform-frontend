import PropTypes from 'prop-types';
import styles from './NavigationButtons.module.css';

const NavigationButtons = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled = false,
}) => {
  const hasBack = currentStep > 1;
  const containerClass = hasBack
    ? `${styles.navigationContainer} ${styles.bothButtons}`
    : `${styles.navigationContainer} ${styles.nextOnly}`;
  return (
    <div className={containerClass}>
      {hasBack && (
        <button className={styles.backButton} onClick={onBack}>
          Back
        </button>
      )}
      <button
        className={`${styles.nextButton} ${isNextDisabled ? styles.disabled : ''}`}
        onClick={onNext}
        disabled={isNextDisabled}
      >
        {currentStep === totalSteps ? 'Submit' : 'Next'}
      </button>
    </div>
  );
};

NavigationButtons.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
  onNext: PropTypes.func,
  onBack: PropTypes.func,
  isNextDisabled: PropTypes.bool,
};

export default NavigationButtons;
