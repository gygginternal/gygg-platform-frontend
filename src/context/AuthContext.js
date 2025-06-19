import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import apiClient from '../api/axiosConfig'; // Adjust path if needed
import logger from '../utils/logger'; // Adjust path if needed, and ensure logger is imported

const AuthContext = createContext(undefined); // Initialize with undefined for stricter type checking with useAuth

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start true to fetch user on initial load

  const logout = useCallback(() => {
    logger.info('AuthContext: Logging out...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setAuthToken(null);
    setUser(null);
    // Optional: Invalidate backend session if needed
    // apiClient.get('/users/logout').catch(err => logger.error("Backend logout error:", err));
  }, []); // logout has no dependencies, so it's stable

  const fetchUser = useCallback(async () => {
    let currentToken = null;
    if (typeof window !== 'undefined') {
      currentToken = localStorage.getItem('authToken');
    }

    if (
      currentToken &&
      currentToken !== 'null' &&
      currentToken !== 'undefined'
    ) {
      logger.debug('AuthContext: Token found, attempting to fetch user...');
      try {
        // apiClient includes token via interceptor
        const response = await apiClient.get('/users/me');
        console.log({ response });

        if (response.data?.data?.user) {
          setUser(response.data.data.user);
          setAuthToken(currentToken); // Ensure token state is also up-to-date
          logger.debug(
            'AuthContext: User fetched successfully:',
            response.data.data.user?._id
          );
          return response.data.data.user; // Return the fetched user data
        } else {
          logger.warn(
            'AuthContext: Fetched user data missing in response from /users/me.'
          );
          logout(); // Call stable logout
        }
      } catch (error) {
        logger.error(
          'AuthContext: Failed to fetch user with stored token:',
          error.response?.data || error.message
        );
        // The axios interceptor might already handle global 401 by redirecting to login.
        // If not, or if you want specific context handling:
        if (error.response?.status === 401) {
          logout(); // Call stable logout
        }
        // For other errors, user remains null, token might still be considered invalid by this point
      }
    } else {
      logger.debug('AuthContext: No valid token found in local storage.');
      // Ensure state is cleared if no token
      setAuthToken(null);
      setUser(null);
    }
    return null; // Return null if no token or fetch failed
  }, [logout]); // <<< ADD logout as a dependency

  useEffect(() => {
    logger.debug('AuthContext: Initializing, attempting to fetch user...');
    setIsLoading(true);
    fetchUser().finally(() => {
      setIsLoading(false);
      logger.debug('AuthContext: Initial user fetch complete.');
    });
  }, [fetchUser]); // Run on mount and if fetchUser identity changes (it shouldn't often due to useCallback)

  const login = (token, userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    setAuthToken(token);
    setUser(userData);
    logger.info('AuthContext: User logged in:', userData?._id);
  };

  const refreshUser = useCallback(async () => {
    logger.debug('AuthContext: Refreshing user data...');
    setIsLoading(true); // Show loading during refresh
    const refreshedUserData = await fetchUser();
    setIsLoading(false);
    logger.debug('AuthContext: User data refresh complete.');
    return refreshedUserData;
  }, [fetchUser]);

  // Provide logger if other parts of the app might need it through context (optional)
  const contextValue = {
    authToken,
    user,
    login,
    logout,
    isLoading,
    refreshUser /*, logger */,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Show children only after initial loading attempt, or always show with internal loading states */}
      {children}
      {/* Or, to prevent rendering children at all until auth is checked: */}
      {/* {isLoading ? <div style={{ padding: '3rem', textAlign: 'center', fontSize: '1.2em' }}>Loading Application...</div> : children} */}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. Make sure your component tree is wrapped.'
    );
  }
  return context;
};
