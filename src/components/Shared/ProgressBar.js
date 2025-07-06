// src/components/Shared/ProgressBar.js
import PropTypes from 'prop-types';
import styles from './ProgressBar.module.css'; // Create this CSS module

function ProgressBar({ current, total, color = '#00AABA' }) {
  const progressPercentage = (current / total) * 100;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBarBackground}>
        <div
          className={styles.progressBarForeground}
          style={{ width: `${progressPercentage}%`, backgroundColor: color }}
          aria-valuenow={current}
          aria-valuemin="0"
          aria-valuemax={total}
          role="progressbar"
        >
          <span
            className={styles.progressStepLabel}
          >{`Step ${current} of ${total}`}</span>
        </div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  color: PropTypes.string,
};

export default ProgressBar;
