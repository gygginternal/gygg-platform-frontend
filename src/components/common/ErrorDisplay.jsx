import React from 'react';
import { AlertTriangle, X, WifiOff, ServerOff, AlertCircle } from 'lucide-react';
import { useGlobalErrors } from '../../contexts/ErrorContext';
import PropTypes from 'prop-types';

const ErrorDisplay = ({ variant = 'inline', error, onDismiss }) => {
  const { removeError, ERROR_TYPES } = useGlobalErrors();

  if (!error) return null;

  const getErrorIcon = (type) => {
    switch (type) {
      case ERROR_TYPES.NETWORK_ERROR:
        return <WifiOff size={16} />;
      case ERROR_TYPES.SERVER_ERROR:
        return <ServerOff size={16} />;
      case ERROR_TYPES.UNAUTHORIZED_ERROR:
        return <AlertCircle size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  const getErrorColor = (type) => {
    switch (type) {
      case ERROR_TYPES.NETWORK_ERROR:
      case ERROR_TYPES.SERVER_ERROR:
        return 'bg-red-100 border-red-300 text-red-700';
      case ERROR_TYPES.UNAUTHORIZED_ERROR:
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      default:
        return 'bg-red-100 border-red-300 text-red-700';
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(error.id);
    } else {
      removeError(error.id);
    }
  };

  const containerClasses = {
    inline: 'p-4 rounded-md border',
    toast: 'fixed top-4 right-4 p-4 rounded-md border shadow-lg z-50 max-w-md',
    modal: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
  };

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full border border-red-300">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-700 mb-4">{error.message}</p>
              <button
                onClick={handleDismiss}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerClasses[variant]} ${getErrorColor(error.type)}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon(error.type)}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{error.message}</p>
          {error.metadata?.debugInfo && (
            <p className="mt-1 text-xs opacity-75">{error.metadata.debugInfo}</p>
          )}
        </div>
        <button
          type="button"
          className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          onClick={handleDismiss}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  variant: PropTypes.oneOf(['inline', 'toast', 'modal']),
  error: PropTypes.object,
  onDismiss: PropTypes.func
};

const ErrorList = ({ variant = 'inline' }) => {
  const { errors, removeError } = useGlobalErrors();

  if (errors.length === 0) return null;

  return (
    <div className="space-y-2">
      {errors.map((error) => (
        <ErrorDisplay
          key={error.id}
          error={error}
          variant={variant}
          onDismiss={removeError}
        />
      ))}
    </div>
  );
};

ErrorList.propTypes = {
  variant: PropTypes.oneOf(['inline', 'toast', 'modal'])
};

const GlobalErrorDisplay = () => {
  const { errors } = useGlobalErrors();

  // Show toast-style notifications for new errors
  if (errors.length > 0) {
    return (
      <div className="fixed top-4 right-4 space-y-2 z-[100]">
        {errors.slice(0, 3).map((error) => (
          <ErrorDisplay
            key={error.id}
            error={error}
            variant="toast"
            onDismiss={(id) => {
              // Auto-remove after showing for a while
              setTimeout(() => {
                // In a real app, you'd probably have a separate remove mechanism
              }, 5000);
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

export { ErrorDisplay, ErrorList, GlobalErrorDisplay };
export default ErrorDisplay;