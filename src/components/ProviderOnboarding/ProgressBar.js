import PropTypes from 'prop-types';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.progressText}>
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  currentStep: PropTypes.number,
  totalSteps: PropTypes.number,
};

export default ProgressBar;
