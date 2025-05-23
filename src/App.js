import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import SignupPage from './pages/SignupPage';
// import VerifyEmailPromptPage from './pages/VerifyEmailPromptPage';
// import EmailVerifiedPage from './pages/EmailVerifiedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import ResetPasswordPage from './pages/ResetPasswordPage'; // Add when ready

import TaskerOnboardingPage from './pages/TaskerOnboardingPage';
import ProviderOnboardingPage from './pages/ProviderOnboardingPage';
import GigCreateOptionsPage from './pages/GigCreateOptionsPage';

import GigsPage from './pages/GigsPage';
import GigCreatePage from './pages/GigCreatePage';
import GigDetailPage from './pages/GigDetailPage';

// import FindTaskersPage from './pages/FindTaskersPage';
import MatchedGigsPage from './pages/MatchedGigsPage';
// import MatchedTaskersPage from './pages/MatchedTaskersPage';

import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import SocialFeedLayoutPage from './pages/SocialFeedLayoutPage';
import PostCreatePage from './pages/PostCreatePage';

import StripeReturnPage from './pages/StripeReturnPage';
import StripeRefreshPage from './pages/StripeRefreshPage';

// Shared
import Header from './components/Header';

// -------------------- ProtectedRoute HOC --------------------
function ProtectedRoute({ children }) {
  const { authToken, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Authenticating User...
      </div>
    );
  }
  return authToken ? children : <Navigate to="/login" replace />;
}

// -------------------- AppLayout --------------------
function AppLayout({ children }) {
  const { authToken, isLoading } = useAuth();
  const location = useLocation();

  const noHeaderPaths = [
    '/onboarding/tasker',
    '/onboarding/provider'
  ];

  const showHeader = authToken && !noHeaderPaths.some(path => location.pathname.startsWith(path));

  const mainStyle = {
    paddingTop: showHeader ? '84px' : '0'
  };

  if (isLoading && !authToken) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading Application...
      </div>
    );
  }

  return (
    <>
      {showHeader && <Header />}
      {showHeader && <hr style={{ border: 0, borderTop: '1px solid #ccc', margin: 0 }} />}
      <main className="container" style={mainStyle}>
        {children}
      </main>
    </>
  );
}

// -------------------- Auth-Aware Catch-All Redirect --------------------
function AuthAwareRedirect() {
  const { authToken } = useAuth();
  return <Navigate to={authToken ? "/feed" : "/"} replace />;
}

// -------------------- Main App Component --------------------
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* <Route path="/verify-email-prompt" element={<VerifyEmailPromptPage />} />
            <Route path="/verify-email" element={<EmailVerifiedPage />} /> */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><SocialFeedLayoutPage /></ProtectedRoute>} />
            <Route path="/posts/create" element={<ProtectedRoute><PostCreatePage /></ProtectedRoute>} />

            <Route path="/gigs" element={<ProtectedRoute><GigsPage /></ProtectedRoute>} />
            <Route path="/gigs/create" element={<ProtectedRoute><GigCreatePage /></ProtectedRoute>} />
            <Route path="/gigs/:gigId" element={<ProtectedRoute><GigDetailPage /></ProtectedRoute>} />
            <Route path="/gigs/matched" element={<ProtectedRoute><MatchedGigsPage /></ProtectedRoute>} />

            {/* <Route path="/find-taskers" element={<ProtectedRoute><FindTaskersPage /></ProtectedRoute>} />
            <Route path="/taskers/matched" element={<ProtectedRoute><MatchedTaskersPage /></ProtectedRoute>} /> */}

            <Route path="/onboarding/tasker" element={<ProtectedRoute><TaskerOnboardingPage /></ProtectedRoute>} />
            <Route path="/onboarding/provider" element={<ProtectedRoute><ProviderOnboardingPage /></ProtectedRoute>} />
            <Route path="/gigs/create/options" element={<ProtectedRoute><GigCreateOptionsPage /></ProtectedRoute>} />

            <Route path="/stripe-onboarding/return" element={<ProtectedRoute><StripeReturnPage /></ProtectedRoute>} />
            <Route path="/stripe-onboarding/refresh" element={<ProtectedRoute><StripeRefreshPage /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<AuthAwareRedirect />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
