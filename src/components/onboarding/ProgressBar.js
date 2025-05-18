// src/components/Onboarding/ProgressBar.js
import React from 'react';
import styles from './ProgressBar.module.css'; // Create this CSS module

function ProgressBar({ current, total, label = "Profile Setup Progress" }) {
  const progressPercentage = (current / total) * 100;

  return (
    <div className={styles.progressContainer}>
      {label && <span className={styles.progressLabel}>{label} ({current}/{total})</span>}
      <div className={styles.progressBarBackground}>
        <div
          className={styles.progressBarForeground}
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={current}
          aria-valuemin="0"
          aria-valuemax={total}
          role="progressbar"
        />
      </div>
    </div>
  );
}
export default ProgressBar;