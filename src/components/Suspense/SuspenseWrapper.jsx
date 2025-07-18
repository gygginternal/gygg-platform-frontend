import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

const SuspenseWrapper = ({ 
  children, 
  fallback = null,
  loadingText = 'Loading...',
  spinnerSize = 'medium',
  spinnerColor = 'primary',
  fullScreen = false,
  withErrorBoundary = true 
}) => {
  const defaultFallback = (
    <LoadingSpinner 
      size={spinnerSize}
      color={spinnerColor}
      text={loadingText}
      fullScreen={fullScreen}
    />
  );

  const suspenseContent = (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );

  if (withErrorBoundary) {
    return (
      <ErrorBoundary>
        {suspenseContent}
      </ErrorBoundary>
    );
  }

  return suspenseContent;
};

export default SuspenseWrapper;