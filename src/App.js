import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import styles from './App.module.css'; // Import CSS Modules
import { ToastProvider } from './contexts/ToastContext';
import ThemeProvider from './styles/ThemeProvider';
import './styles/global.css';
import { SocketProvider } from './contexts/SocketContext';
import Navigation from './components/Shared/Navigation';
import { queryClient } from './client';
import PropTypes from 'prop-types';

// Pages
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import JoinPage from './pages/JoinPage/JoinPage';
import SignupPage from './pages/SignupPage/SignupPage';
import VerifyEmailPromptPage from './pages/VerifyEmailPromptPage/VerifyEmailPromptPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import TaskerOnboardingPage from './pages/TaskerOnboardingPage/TaskerOnboardingPage';
import ProviderOnboardingPage from './pages/ProviderOnboardingPage/ProviderOnboardingPage';
import GigCreateOptionsPage from './pages/GigCreateOptionsPage/GigCreateOptionsPage';
import GigsPage from './pages/GigsPage/GigsPage';
import GigCreatePage from './pages/GigCreatePage/GigCreatePage';
import GigDetailPage from './pages/GigDetailPage/GigDetailPage';
import MatchedGigsPage from './pages/MatchedGigsPage/MatchedGigsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import ChatPage from './pages/ChatPage/ChatPage';
import SocialFeedLayoutPage from './pages/SocialFeedLayoutPage/SocialFeedLayoutPage';
import PostCreatePage from './pages/PostCreatePage/PostCreatePage';
import StripeReturnPage from './pages/StripeReturnPage/StripeReturnPage';
import StripeRefreshPage from './pages/StripeRefreshPage/StripeRefreshPage';
import TermsOfUsePage from './pages/TermsOfUsePage/TermsOfUsePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage/PrivacyPolicyPage';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';
import GigHelperPage from './pages/GigHelperPage/GigHelperPage';

// Shared
import Header from './components/Shared/Header';
import ContractsPage from './pages/ContractsPage/ContractsPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Applications from './pages/Applications/Applications';
import GigList from './pages/GigList/GigList';
import GigDetails from './pages/GigDetails/GigDetails';
import CreateGig from './pages/CreateGig/CreateGig';
import ContractDetailPage from './pages/ContractDetailPage/ContractDetailPage';
import InvoicePage from './pages/InvoicePage/InvoicePage';

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

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

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

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

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
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs"
              element={
                <ProtectedRoute>
                  <GigList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gigs/:id"
              element={
                <ProtectedRoute>
                  <GigDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-gig"
              element={
                <ProtectedRoute>
                  <CreateGig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/:id"
              element={
                <ProtectedRoute>
                  <ContractDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice/:paymentId"
              element={
                <ProtectedRoute>
                  <InvoicePage />
                </ProtectedRoute>
              }
            />
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

App.propTypes = {
  children: PropTypes.node,
};

export default App;
