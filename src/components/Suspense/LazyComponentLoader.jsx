import React, { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

// Higher-order component for lazy loading with enhanced loading states
const withLazyLoading = (importFunc, options = {}) => {
  const {
    loadingComponent: CustomLoading,
    errorComponent: CustomError,
    loadingText = 'Loading component...',
    spinnerSize = 'medium',
    spinnerColor = 'primary',
    retryable = true,
    preload = false,
  } = options;

  const LazyComponent = lazy(importFunc);

  // Preload the component if requested
  if (preload && typeof window !== 'undefined') {
    importFunc();
  }

  const WrappedComponent = props => {
    const fallback = CustomLoading || (
      <LoadingSpinner
        size={spinnerSize}
        color={spinnerColor}
        text={loadingText}
      />
    );

    return (
      <ErrorBoundary fallback={CustomError} retryable={retryable}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Add preload method to component
  WrappedComponent.preload = importFunc;

  return WrappedComponent;
};

// Utility for creating lazy routes
const createLazyRoute = (importFunc, options = {}) => {
  return withLazyLoading(importFunc, {
    loadingText: 'Loading page...',
    spinnerSize: 'large',
    fullScreen: true,
    ...options,
  });
};

// Utility for creating lazy modals
const createLazyModal = (importFunc, options = {}) => {
  return withLazyLoading(importFunc, {
    loadingText: 'Loading modal...',
    spinnerSize: 'medium',
    ...options,
  });
};

// Utility for creating lazy widgets/components
const createLazyWidget = (importFunc, options = {}) => {
  return withLazyLoading(importFunc, {
    loadingText: 'Loading widget...',
    spinnerSize: 'small',
    ...options,
  });
};

// Progressive loading component for multiple lazy components
const ProgressiveLoader = ({
  components,
  onProgress,
  loadingText = 'Loading components...',
}) => {
  const [loadedCount, setLoadedCount] = React.useState(0);
  const [errors, setErrors] = React.useState([]);

  React.useEffect(() => {
    const loadComponents = async () => {
      for (let i = 0; i < components.length; i++) {
        try {
          await components[i].preload();
          setLoadedCount(i + 1);
          onProgress?.(i + 1, components.length);
        } catch (error) {
          setErrors(prev => [...prev, { index: i, error }]);
        }
      }
    };

    loadComponents();
  }, [components, onProgress]);

  const progress = (loadedCount / components.length) * 100;

  return (
    <div className="progressive-loader">
      <LoadingSpinner text={loadingText} />
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-text">
        {loadedCount} of {components.length} components loaded
      </p>
      {errors.length > 0 && (
        <div className="progress-errors">
          <p>Some components failed to load:</p>
          <ul>
            {errors.map(({ index, error }) => (
              <li key={index}>
                Component {index + 1}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export {
  withLazyLoading,
  createLazyRoute,
  createLazyModal,
  createLazyWidget,
  ProgressiveLoader,
};
