import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './client';
import styles from './App.module.css'; // Import CSS Modules
import { ToastProvider } from './contexts/ToastContext';
import ThemeProvider from './styles/ThemeProvider.jsx';
import './styles/global.css';
import { SocketProvider } from './contexts/SocketContext';
import Navigation from './components/Navigation';

// Pages
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import JoinPage from './pages/JoinPage/JoinPage';
import SignupPage from './pages/SignupPage/SignupPage';
import VerifyEmailPromptPage from './pages/VerifyEmailPromptPage/VerifyEmailPromptPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import TaskerOnboardingPage from './pages/OnboardingPages/TaskerOnboardingPage';
import ProviderOnboardingPage from './pages/OnboardingPages/ProviderOnboardingPage';
import GigCreateOptionsPage from './pages/GigCreateOptionsPage/GigCreateOptionsPage';
import GigsPage from './pages/GigsPage/GigsPage';
import GigCreatePage from './pages/GigCreatePage/GigCreatePage';
import GigDetailPage from './pages/GigDetailPage/GigDetailPage';
import MatchedGigsPage from './pages/MatchedGigsPage/MatchedGigsPage';
import TaskerProfilePage from './pages/TaskerProfilePage/TaskerProfilePage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import ChatPage from './pages/ChatPage/ChatPage';
import SocialFeedLayoutPage from './pages/SocialFeedLayoutPage/SocialFeedLayoutPage';
import PostCreatePage from './pages/PostCreatePage/PostCreatePage';
import StripeReturnPage from './pages/StripeReturnPage/StripeReturnPage';
import StripeRefreshPage from './pages/StripeRefreshPage/StripeRefreshPage';
import TermsOfUsePage from './pages/Legalpages/TermsOfUsePage';
import PrivacyPolicyPage from './pages/Legalpages/PrivacyPolicyPage';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import GigHelperPage from './pages/GigHelperPage/GigHelperPage';
import GigsAppliedPage from './pages/GigsAppliedPage/GigsAppliedPage';
import PostedGigsPage from './pages/PostedGigsPage/PostedGigsPage';
import ChoosePage from './pages/ChoosePage/ChoosePage';

// Shared
import Header from './components/Shared/Header';
import ContractsPage from './pages/ContractsPage/ContractsPage';

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
  const fullWidthPaths = ['/onboarding/tasker', '/onboarding/provider'];

  const showHeader =
    authToken &&
    !noHeaderPaths.some(path => location.pathname.startsWith(path));

  // Remove top padding for /gigs
  const isGigsPage = gigsPagePaths.some(path =>
    location.pathname.startsWith(path)
  );

  // Check if current path needs full width (no container constraints)
  const isFullWidthPage = fullWidthPaths.some(path =>
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

  // For full-width pages (onboarding), don't apply container constraints
  if (isFullWidthPage) {
    return (
      <>
        {showHeader && <Header />}
        {children}
      </>
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
            <Route
              path="/verify-email"
              element={<VerifyEmailPromptPage />}
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <TaskerProfilePage />
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
