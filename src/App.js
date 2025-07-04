import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styles from './App.module.css'; // Import CSS Modules
import { ToastProvider } from './context/ToastContext';
import ThemeProvider from './styles/ThemeProvider';
import './styles/global.css';
import AppRoutes from './routes';
import { SocketProvider } from './contexts/SocketContext';
import Navigation from './components/Navigation';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPromptPage from './pages/VerifyEmailPromptPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import TaskerOnboardingPage from './pages/TaskerOnboardingPage';
import ProviderOnboardingPage from './pages/ProviderOnboardingPage';
import GigCreateOptionsPage from './pages/GigCreateOptionsPage';
import GigsPage from './pages/GigsPage';
import GigCreatePage from './pages/GigCreatePage';
import GigDetailPage from './pages/GigDetailPage';
import MatchedGigsPage from './pages/MatchedGigsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import SocialFeedLayoutPage from './pages/SocialFeedLayoutPage';
import PostCreatePage from './pages/PostCreatePage';
import StripeReturnPage from './pages/StripeReturnPage';
import StripeRefreshPage from './pages/StripeRefreshPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import UserProfilePage from './pages/UserProfilePage';
import GigHelperPage from './pages/GigHelperPage';
import GigsAppliedPage from './pages/GigsAppliedPage';
import PostedGigsPage from './pages/PostedGigsPage';
import ChoosePage from './pages/ChoosePage';

// Shared
import Header from './components/Shared/Header';
import { queryClient } from './client';
import ContractsPage from './pages/ContractsPage';

// -------------------- ProtectedRoute HOC --------------------
function ProtectedRoute({ children }) {
  const { authToken, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className={styles.authenticatingUser}>Authenticating User...</div>
    );
  }
  return authToken ? children : <Navigate to="/login" replace />;
}

// -------------------- AppLayout --------------------
function AppLayout({ children }) {
  const { authToken, isLoading } = useAuth();
  const location = useLocation();

  const noHeaderPaths = ['/onboarding/tasker', '/onboarding/provider'];
  const gigsPagePaths = ['/gigs'];

  const showHeader =
    authToken &&
    !noHeaderPaths.some(path => location.pathname.startsWith(path));

  // Remove top padding for /gigs
  const isGigsPage = gigsPagePaths.some(path =>
    location.pathname.startsWith(path)
  );

  const mainStyle = {
    paddingTop: showHeader ? '84px' : '0',
  };

  if (isLoading && !authToken) {
    return (
      <div className={styles.loadingApplication}>Loading Application...</div>
    );
  }

  return (
    <>
      {showHeader && <Header />}
      <main
        className={`${styles.container} ${showHeader && !isGigsPage ? styles.containerWithHeaderPadding : ''}`}
      >
        {children}
      </main>
    </>
  );
}

// -------------------- Auth-Aware Catch-All Redirect --------------------
function AuthAwareRedirect() {
  const { authToken } = useAuth();
  return <Navigate to={authToken ? '/feed' : '/'} replace />;
}

function AppWithNavigation() {
  const location = useLocation();
  const hideNavPaths = ['/onboarding/tasker', '/onboarding/provider'];
  const showNavigation = !hideNavPaths.some(path =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {showNavigation && <Navigation />}
      <QueryClientProvider client={queryClient}>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/verify-email-prompt"
              element={<VerifyEmailPromptPage />}
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:userId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <SocialFeedLayoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/create"
              element={
                <ProtectedRoute>
                  <PostCreatePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/gigs"
              element={
                <ProtectedRoute>
                  <GigsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs/create"
              element={
                <ProtectedRoute>
                  <GigCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs/:gigId"
              element={
                <ProtectedRoute>
                  <GigDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs/matched"
              element={
                <ProtectedRoute>
                  <MatchedGigsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <ContractsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/onboarding/tasker"
              element={
                <ProtectedRoute>
                  <TaskerOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/provider"
              element={
                <ProtectedRoute>
                  <ProviderOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs/create/options"
              element={
                <ProtectedRoute>
                  <GigCreateOptionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/stripe-onboarding/return"
              element={
                <ProtectedRoute>
                  <StripeReturnPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stripe-onboarding/refresh"
              element={
                <ProtectedRoute>
                  <StripeRefreshPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-profile/:userId"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gig-helper"
              element={
                <ProtectedRoute>
                  <GigHelperPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs-applied"
              element={
                <ProtectedRoute>
                  <GigsAppliedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posted-gigs"
              element={
                <ProtectedRoute>
                  <PostedGigsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/choose" element={<ChoosePage />} />
            {/* Catch-all */}
            <Route path="*" element={<AuthAwareRedirect />} />
          </Routes>
        </AppLayout>
      </QueryClientProvider>
    </>
  );
}

const App = () => (
  <Router>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <AppWithNavigation />
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);

export default App;
