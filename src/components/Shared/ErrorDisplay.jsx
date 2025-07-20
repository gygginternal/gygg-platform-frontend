import React from 'react';
import PropTypes from 'prop-types';
import styles from './ErrorDisplay.module.css';

/**
 * Standardized Error Display Component
 * Provides consistent error messaging across the application
 */
const ErrorDisplay = ({ 
  errors, 
  variant = 'default', 
  className = '',
  onDismiss,
  showIcon = true 
}) => {
  // Handle both string and array of errors
  const errorList = Array.isArray(errors) 
    ? errors.filter(Boolean) 
    : errors ? [errors] : [];

  if (errorList.length === 0) return null;

  const getVariantClass = () => {
    switch (variant) {
      case 'inline': return styles.inline;
      case 'banner': return styles.banner;
      case 'card': return styles.card;
      case 'field': return styles.field;
      default: return styles.default;
    }
  };

  return (
    <div className={`${styles.errorContainer} ${getVariantClass()} ${className}`.trim()}>
      {showIcon && (
        <div className={styles.iconContainer}>
          <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className={styles.content}>
        {errorList.length === 1 ? (
          <p className={styles.errorMessage}>{errorList[0]}</p>
        ) : (
          <div className={styles.errorList}>
            {errorList.map((error, index) => (
              <p key={index} className={styles.errorMessage}>
                {error}
              </p>
            ))}
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          <svg className={styles.dismissIcon} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

ErrorDisplay.propTypes = {
  errors: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  variant: PropTypes.oneOf(['default', 'inline', 'banner', 'card', 'field']),
  className: PropTypes.string,
  onDismiss: PropTypes.func,
  showIcon: PropTypes.bool
};

export default ErrorDisplay;