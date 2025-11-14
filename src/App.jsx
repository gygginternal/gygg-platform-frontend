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
import Navigation from './components/common/Navigation';
import { createLazyRoute } from './components/common/Suspense/LazyComponentLoader';
import { RoutePreloader } from './components/common/RoutePreloader';
import { LazyLoadingMonitor } from './components/common/Performance';

// Critical pages - loaded immediately (above the fold)
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import JoinPage from './pages/JoinPage/JoinPage';
import TestStripeComponent from './pages/TestStripeComponent';

// Shared components - loaded immediately
import Header from './components/common/Header';

// Lazy-loaded pages - loaded on demand
const StripePaymentPage = createLazyRoute(
  () => import('./pages/ContractPayment/StripePaymentPage'),
  {
    loadingText: 'Loading Stripe payment...',
  }
);


const SignupPage = createLazyRoute(
  () => import('./pages/SignupPage/SignupPage'),
  {
    loadingText: 'Loading signup page...',
  }
);

const VerifyEmailPromptPage = createLazyRoute(
  () => import('./pages/VerifyEmailPromptPage/VerifyEmailPromptPage'),
  {
    loadingText: 'Loading verification page...',
  }
);

const ForgotPasswordPage = createLazyRoute(
  () => import('./pages/ForgotPasswordPage/ForgotPasswordPage'),
  {
    loadingText: 'Loading password reset...',
  }
);

const ResetPasswordPage = createLazyRoute(
  () => import('./pages/ResetPasswordPage/ResetPasswordPage'),
  {
    loadingText: 'Loading password reset...',
  }
);

// Onboarding pages - high priority for authenticated users
const TaskerOnboardingPage = createLazyRoute(
  () => import('./pages/OnboardingPages/TaskerOnboardingPage'),
  {
    loadingText: 'Loading onboarding...',
    preload: true, // Preload for authenticated users
  }
);

const ProviderOnboardingPage = createLazyRoute(
  () => import('./pages/OnboardingPages/ProviderOnboardingPage'),
  {
    loadingText: 'Loading onboarding...',
    preload: true, // Preload for authenticated users
  }
);

// Core app pages - medium priority
const GigsPage = createLazyRoute(() => import('./pages/GigsPage/GigsPage'), {
  loadingText: 'Loading gigs...',
  preload: true,
});

const GigCreatePage = createLazyRoute(
  () => import('./pages/GigCreatePage/GigCreatePage'),
  {
    loadingText: 'Loading gig creator...',
  }
);

const GigDetailPage = createLazyRoute(
  () => import('./pages/GigDetailPage/GigDetailPage'),
  {
    loadingText: 'Loading gig details...',
  }
);

const MatchedGigsPage = createLazyRoute(
  () => import('./pages/MatchedGigsPage/MatchedGigsPage'),
  {
    loadingText: 'Loading matched gigs...',
  }
);

const TaskerProfilePage = createLazyRoute(
  () => import('./pages/TaskerProfilePage/TaskerProfilePage'),
  {
    loadingText: 'Loading profile...',
  }
);

const SettingsPage = createLazyRoute(
  () => import('./pages/SettingsPage/SettingsPage'),
  {
    loadingText: 'Loading settings...',
  }
);

const ChatPage = createLazyRoute(() => import('./pages/ChatPage/ChatPage'), {
  loadingText: 'Loading messages...',
});

const SocialFeedLayoutPage = createLazyRoute(
  () => import('./pages/SocialFeedLayoutPage/SocialFeedLayoutPage'),
  {
    loadingText: 'Loading feed...',
    preload: true, // High priority for main feed
  }
);

const PostCreatePage = createLazyRoute(
  () => import('./pages/PostCreatePage/PostCreatePage'),
  {
    loadingText: 'Loading post creator...',
  }
);

const ContractsPage = createLazyRoute(
  () => import('./pages/ContractsPage/ContractsPage'),
  {
    loadingText: 'Loading contracts...',
  }
);

const RateTaskerPage = createLazyRoute(
  () => import('./pages/RateTaskerPage/RateTaskerPage'),
  {
    loadingText: 'Loading rating page...',
  }
);

// Secondary pages - lower priority
const GigCreateOptionsPage = createLazyRoute(
  () => import('./pages/GigCreateOptionsPage/GigCreateOptionsPage'),
  {
    loadingText: 'Loading options...',
  }
);

const UserProfilePage = createLazyRoute(
  () => import('./pages/UserProfilePage/UserProfilePage'),
  {
    loadingText: 'Loading user profile...',
  }
);

const GigHelperPage = createLazyRoute(
  () => import('./pages/GigHelperPage/GigHelperPage'),
  {
    loadingText: 'Loading gig helper...',
  }
);

const GigsAppliedPage = createLazyRoute(
  () => import('./pages/GigsAppliedPage/GigsAppliedPage'),
  {
    loadingText: 'Loading applied gigs...',
  }
);

const PostedGigsPage = createLazyRoute(
  () => import('./pages/PostedGigsPage/PostedGigsPage'),
  {
    loadingText: 'Loading posted gigs...',
  }
);

const ChoosePage = createLazyRoute(
  () => import('./pages/ChoosePage/ChoosePage'),
  {
    loadingText: 'Loading options...',
  }
);

// Stripe pages - loaded on demand
const StripeReturnPage = createLazyRoute(
  () => import('./pages/StripeReturnPage/StripeReturnPage'),
  {
    loadingText: 'Processing payment...',
  }
);

const StripeRefreshPage = createLazyRoute(
  () => import('./pages/StripeRefreshPage/StripeRefreshPage'),
  {
    loadingText: 'Refreshing payment...',
  }
);

// Legal pages - lowest priority
const TermsOfUsePage = createLazyRoute(
  () => import('./pages/LegalPages/TermsOfUsePage'),
  {
    loadingText: 'Loading terms...',
  }
);

const PrivacyPolicyPage = createLazyRoute(
  () => import('./pages/LegalPages/PrivacyPolicyPage'),
  {
    loadingText: 'Loading privacy policy...',
  }
);

// Billing page - medium priority for authenticated users
const BillingAndPaymentPage = createLazyRoute(
  () => import('./pages/BillingAndPayment/BillingAndPayment'),
  {
    loadingText: 'Loading billing...',
  }
);

// Contract payment page - medium priority for authenticated users
const ContractPaymentPage = createLazyRoute(
  () => import('./pages/ContractPayment/ContractPaymentPage'),
  {
    loadingText: 'Loading payment page...',
  }
);

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

  const noHeaderPaths = ['/onboarding/tasker', '/onboarding/provider', '/contracts/*/pay-with-stripe'];
  const gigsPagePaths = ['/gigs'];
  const fullWidthPaths = ['/onboarding/tasker', '/onboarding/provider'];

  const showHeader =
    authToken &&
    !noHeaderPaths.some(path => location.pathname.startsWith(path)) &&
    !location.pathname.includes('/pay-with-stripe');

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
      <RoutePreloader />
      <LazyLoadingMonitor />
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
            <Route path="/verify-email" element={<VerifyEmailPromptPage />} />
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
              path="/test-stripe"
              element={
                <ProtectedRoute>
                  <TestStripeComponent />
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
              path="/contracts/:contractId/rate-tasker"
              element={
                <ProtectedRoute>
                  <RateTaskerPage />
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
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <BillingAndPaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <ContractPaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/:contractId/pay-with-stripe"
              element={
                <ProtectedRoute>
                  <StripePaymentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/contracts/:contractId/pay-with-stripe"
              element={
                <ProtectedRoute>
                  <StripePaymentPage />
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
