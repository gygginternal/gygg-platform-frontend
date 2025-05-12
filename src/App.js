// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import GigsPage from './pages/GigsPage';
import GigDetailPage from './pages/GigDetailPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import StripeReturnPage from './pages/StripeReturnPage';
import StripeRefreshPage from './pages/StripeRefreshPage';
import FindTaskersPage from './pages/FindTaskersPage';
import MatchedGigsPage from './pages/MatchedGigsPage';
import ProfilePage from './pages/ProfilePage';
import PostFeedPage from './pages/PostFeedPage';
import GigCreatePage from './pages/GigCreatePage';
import PostCreatePage from './pages/PostCreatePage'; // ✅ Add this import
import Header from './components/Header'; // Import Header
import SocialFeedLayoutPage from './pages/SocialFeedLayoutPage'; 

// Simple Protected Route component
function ProtectedRoute({ children }) {
    const { authToken, isLoading } = useAuth();
    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading User Session...</div>;
    }
    return authToken ? children : <Navigate to="/login" replace />;
}

// Navigation Component
function Nav() {
    const { user, logout, isLoading } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav>
            <Link to="/">Home</Link>
            {isLoading ? (
                <span>Loading...</span>
            ) : user ? (
                <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/gigs">All Gigs</Link>
                    <Link to="/feed">Feed</Link>
                    {user.role?.includes('provider') && <Link to="/find-taskers">Find Taskers</Link>}
                    {user.role?.includes('tasker') && <Link to="/gigs/matched">Matched Gigs</Link>}
                    {user.role?.includes('provider') && <Link to="/gigs/create">Post Gig</Link>}
                    <Link to="/posts/create">Create Post</Link> {/* ✅ Add this link for logged-in users */}
                    <span style={{ marginLeft: 'auto' }}>Hi, {user.firstName}!</span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/join">Sign Up</Link>
                </>
            )}
        </nav>
    );
}

// Main App Component
function App() {
    return (
        <AuthProvider>
            <Router>
                {/* <Nav /> */}
                <Header />
                <hr style={{ border: 0, borderTop: '1px solid #ccc' }} />
                <main className="container">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/join" element={<JoinPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/dashboard" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/gigs" element={<ProtectedRoute><GigsPage /></ProtectedRoute>} />
                        <Route path="/gigs/create" element={<ProtectedRoute><GigCreatePage /></ProtectedRoute>} />
                        <Route path="/gigs/:gigId" element={<ProtectedRoute><GigDetailPage /></ProtectedRoute>} />
                        <Route path="/feed" element={ <ProtectedRoute><SocialFeedLayoutPage /></ProtectedRoute>} />
                        <Route path="/posts/create" element={<ProtectedRoute><PostCreatePage /></ProtectedRoute>} /> {/* ✅ Add this route */}
                        <Route path="/find-taskers" element={<ProtectedRoute><FindTaskersPage /></ProtectedRoute>} />
                        <Route path="/gigs/matched" element={<ProtectedRoute><MatchedGigsPage /></ProtectedRoute>} />
                        <Route path="/stripe-onboarding/return" element={<ProtectedRoute><StripeReturnPage /></ProtectedRoute>} />
                        <Route path="/stripe-onboarding/refresh" element={<ProtectedRoute><StripeRefreshPage /></ProtectedRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </Router>
        </AuthProvider>
    );
}

export default App;
