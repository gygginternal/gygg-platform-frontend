import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import JoinPage from "./pages/JoinPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TaskerOnboardingPage from "./pages/TaskerOnboardingPage";
import ProviderOnboardingPage from "./pages/ProviderOnboardingPage";
import GigCreateOptionsPage from "./pages/GigCreateOptionsPage";
import GigsPage from "./pages/GigsPage";
import GigCreatePage from "./pages/GigCreatePage";
import GigDetailPage from "./pages/GigDetailPage";
import MatchedGigsPage from "./pages/MatchedGigsPage";
import { ContractDetailsPage } from "./pages/ContractDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ChatPage from "./pages/ChatPage";
import SocialFeedLayoutPage from "./pages/SocialFeedLayoutPage";
import PostCreatePage from "./pages/PostCreatePage";
import StripeReturnPage from "./pages/StripeReturnPage";
import StripeRefreshPage from "./pages/StripeRefreshPage";

// Shared
import Header from "./components/Shared/Header";
import { queryClient } from "./client";
import ContractsPage from "./pages/ContractsPage";

// -------------------- ProtectedRoute HOC --------------------
function ProtectedRoute({ children }) {
  const { authToken, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
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

  const noHeaderPaths = ["/onboarding/tasker", "/onboarding/provider"];

  const showHeader =
    authToken &&
    !noHeaderPaths.some((path) => location.pathname.startsWith(path));

  const mainStyle = {
    paddingTop: showHeader ? "84px" : "0",
  };

  if (isLoading && !authToken) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading Application...
      </div>
    );
  }

  return (
    <>
      {showHeader && <Header />}
      {showHeader && (
        <hr style={{ border: 0, borderTop: "1px solid #ccc", margin: 0 }} />
      )}
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/join" element={<JoinPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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

              {/* Catch-all */}
              <Route path="*" element={<AuthAwareRedirect />} />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
