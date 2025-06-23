import PropTypes from 'prop-types';
import styles from './NavigationButtons.module.css';

const NavigationButtons = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled = false,
}) => {
  return (
    <div className={styles.navigationContainer}>
      {currentStep > 1 && (
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
