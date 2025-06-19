import React from 'react';
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

export default NavigationButtons;
