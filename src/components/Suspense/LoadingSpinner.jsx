import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = 'Loading...',
  showText = true,
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    accent: 'spinner-accent'
  };

  const spinnerClass = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`;
  const containerClass = `spinner-container ${fullScreen ? 'spinner-fullscreen' : ''}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {showText && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;