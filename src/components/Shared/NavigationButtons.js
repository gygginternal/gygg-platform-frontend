// src/components/Onboarding/NavigationButtons.js
import PropTypes from 'prop-types';
import styles from './NavigationButtons.module.css'; // Create this
import { ArrowLeft } from 'lucide-react'; // Assuming lucide-react is installed

function NavigationButtons({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Next',
  isFirstStep = false,
  isLastStep = false,
  canGoNext = true, // To disable Next button based on validation
  backArrowColor = undefined, // allow custom color
}) {
  return (
    <div className={styles.navigationContainer}>
      {!isFirstStep ? (
        <button
          type="button"
          onClick={onBack}
          className={`${styles.navButton} ${styles.backButton}`}
        >
          <ArrowLeft
            size={20}
            className={styles.backIcon}
            color={backArrowColor}
          />
          {backLabel}
        </button>
      ) : (
        <div className={styles.backButtonPlaceholder}>
          {/* Placeholder for alignment */}
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className={`${styles.navButton} ${styles.nextButton}`}
        disabled={!canGoNext}
      >
        {isLastStep ? 'Finish Setup' : nextLabel}{' '}
        {isLastStep ? null : <span className={styles.nextIcon}> &rarr;</span>}
      </button>
    </div>
  );
}

NavigationButtons.propTypes = {
  onBack: PropTypes.func,
  onNext: PropTypes.func,
  backLabel: PropTypes.string,
  nextLabel: PropTypes.string,
  isFirstStep: PropTypes.bool,
  isLastStep: PropTypes.bool,
  canGoNext: PropTypes.bool,
  backArrowColor: PropTypes.string,
};

export default NavigationButtons;
