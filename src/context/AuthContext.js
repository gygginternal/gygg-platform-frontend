import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
         const currentToken = localStorage.getItem('authToken');
         if (currentToken && currentToken !== 'null' && currentToken !== 'undefined') {
             console.log("AuthContext: Token found, fetch user...");
             try {
                 const response = await apiClient.get('/users/me');
                 setUser(response.data.data.user);
                 setAuthToken(currentToken);
                 console.log("AuthContext: User fetched:", response.data.data.user?._id);
                 return response.data.data.user;
             } catch (error) { console.error("AuthContext: Failed fetch user:", error.response?.data || error.message); if (error.response?.status === 401) { logout(); } }
         } else { console.log("AuthContext: No valid token found."); setAuthToken(null); setUser(null); }
         return null;
    }, []); // Removed logout dependency

     const logout = useCallback(() => {
        console.log("AuthContext: Logging out...");
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        setIsLoading(true); fetchUser().finally(() => setIsLoading(false));
    }, [fetchUser]);

    const login = (token, userData) => {
        localStorage.setItem('authToken', token); setAuthToken(token); setUser(userData); console.log("AuthContext: User logged in:", userData?._id);
    };

    const refreshUser = useCallback(async () => {
         console.log("AuthContext: Refreshing user data..."); setIsLoading(true); const refreshedUser = await fetchUser(); setIsLoading(false); return refreshedUser;
    }, [fetchUser]);

    return ( <AuthContext.Provider value={{ authToken, user, login, logout, isLoading, refreshUser }}> {!isLoading ? children : <div style={{ padding: '3rem', textAlign: 'center', fontSize: '1.2em' }}>Loading Application...</div>} </AuthContext.Provider> );
};

export const useAuth = () => useContext(AuthContext);