// src/components/Onboarding/NavigationButtons.js
import React from 'react';
import styles from './NavigationButtons.module.css'; // Create this
import { ArrowLeft } from 'lucide-react'; // Assuming lucide-react is installed

function NavigationButtons({
    onBack,
    onNext,
    backLabel = "Back",
    nextLabel = "Next",
    isFirstStep = false,
    isLastStep = false,
    canGoNext = true, // To disable Next button based on validation
}) {
  return (
    <div className={styles.navigationContainer}>
      {!isFirstStep ? (
        <button type="button" onClick={onBack} className={`${styles.navButton} ${styles.backButton}`}>
          <ArrowLeft size={20} style={{ marginRight: '5px' }} />
          {backLabel}
        </button>
      ) : (
        <div style={{minWidth: '100px'}}></div> /* Placeholder for alignment */
      )}

      <button type="button" onClick={onNext} className={`${styles.navButton} ${styles.nextButton}`} disabled={!canGoNext}>
        {isLastStep ? 'Finish Setup' : nextLabel} {!isLastStep && <span style={{marginLeft: '5px'}}> &rarr;</span>}
      </button>
    </div>
  );
}
export default NavigationButtons;