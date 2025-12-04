import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';
import { useGlobalErrors } from '../../contexts/ErrorContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0 // Track consecutive errors to prevent loops
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);

    // Add error to global context
    if (this.props.logToGlobalContext) {
      const { addError, ERROR_TYPES } = this.props;
      if (addError) {
        addError(
          { message: error.message || 'An unexpected error occurred', stack: error.stack },
          ERROR_TYPES.CLIENT_ERROR,
          { componentStack: errorInfo.componentStack, source: 'error-boundary' }
        );
      }
    }

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Prevent infinite error loops by limiting retries
      if (this.state.errorCount > 3) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-red-800 mb-2">Critical Error</h1>
              <p className="text-red-600 mb-6">
                The application has encountered a critical error that prevents normal operation.
              </p>
              <div className="space-x-4">
                <button
                  onClick={this.handleRefresh}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        );
      }

      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We're sorry, but an unexpected error occurred.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mt-4 p-4 bg-gray-100 rounded-md">
                  <summary className="font-medium cursor-pointer">Error Details</summary>
                  <div className="mt-2 text-sm text-gray-700">
                    <div className="font-semibold">Message:</div>
                    <div className="mb-2">{this.state.error.toString()}</div>
                    <div className="font-semibold">Stack:</div>
                    <pre className="mt-1 text-xs bg-gray-800 text-green-400 p-2 rounded overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={this.handleRefresh}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  logToGlobalContext: PropTypes.bool,
  addError: PropTypes.func,
  ERROR_TYPES: PropTypes.object
};

// Wrapper component that connects to error context
export const ErrorBoundaryWithProvider = ({ children }) => {
  const { addError, ERROR_TYPES } = useGlobalErrors();

  return (
    <ErrorBoundary
      logToGlobalContext={true}
      addError={addError}
      ERROR_TYPES={ERROR_TYPES}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;