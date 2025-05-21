import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Assuming useAuth is exported

// Import Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import JoinPage from "./pages/JoinPage";
import SignupPage from "./pages/SignupPage";
import TaskerOnboardingPage from "./pages/TaskerOnboardingPage";
import ProviderOnboardingPage from "./pages/ProviderOnboardingPage";
import GigCreateOptionsPage from "./pages/GigCreateOptionsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import GigsPage from "./pages/GigsPage";
import GigDetailPage from "./pages/GigDetailPage";
import StripeReturnPage from "./pages/StripeReturnPage";
import StripeRefreshPage from "./pages/StripeRefreshPage";
import FindTaskersPage from "./pages/FindTaskersPage";
import MatchedGigsPage from "./pages/MatchedGigsPage";
import ProfilePage from "./pages/ProfilePage"; // This is your new "Dashboard"
import GigCreatePage from "./pages/GigCreatePage";
import PostCreatePage from "./pages/PostCreatePage";
import SocialFeedLayoutPage from "./pages/SocialFeedLayoutPage"; // Use this for the feed
import ChatPage from "./pages/ChatPage";

// Import Shared Components
import Header from "./components/Header"; // Assuming Header is in components/Shared/
import { MatchedTaskersPage } from "./pages/MatchedTaskersPage";

// Simple Protected Route component
function ProtectedRoute({ children }) {
  const { authToken, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading User Session...
      </div>
    );
  }
  return authToken ? children : <Navigate to="/login" replace />;
}

// --- New Component to Conditionally Render Header & Adjust Main Content Padding ---
function AppLayout() {
  const { authToken, isLoading } = useAuth();

  // Determine padding based on auth state and sidebar visibility (from Header's state)
  // This is a simplified example. For a dynamic sidebar, Header would need to lift its state up
  // or use a separate context for sidebar state.
  // For now, let's assume a fixed sidebar width if logged in.
  const mainStyle = {
    paddingTop: authToken ? "84px" : "0", // Only add top padding if header is visible
    // paddingLeft: authToken ? '80px' : '0', // Add left padding if sidebar is visible and fixed
    // This depends on your Sidebar's behavior (always visible vs. toggle)
    // If your Header component *always* shows the toggleable Sidebar when logged in,
    // then you'd add paddingLeft: authToken ? (isSidebarOpen ? '270px' : '80px') : '0',
    // which requires 'isSidebarOpen' state to be managed globally or lifted up.
    // For simplicity here, we'll assume paddingLeft is handled by the page layouts themselves if needed.
  };

  if (isLoading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Loading Application...
      </div>
    ); // Or a splash screen
  }

  return (
    <>
      {authToken && <Header />} {/* Render Header only if authenticated */}
      {/* The hr might not be needed if Header is not always present */}
      {authToken && (
        <hr style={{ border: 0, borderTop: "1px solid #ccc", margin: 0 }} />
      )}
      <main className="container" style={mainStyle}>
        {" "}
        {/* Apply dynamic styles */}
        <Routes>
          {/* Public Routes (HomePage will handle redirect if logged in) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* Protected Routes */}
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
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />{" "}
          {/* Dashboard is now ProfilePage */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />{" "}
          {/* Chat/Messages page */}
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
            path="/feed"
            element={
              <ProtectedRoute>
                <SocialFeedLayoutPage />
              </ProtectedRoute>
            }
          />{" "}
          {/* Main feed */}
          <Route
            path="/posts/create"
            element={
              <ProtectedRoute>
                <PostCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-taskers"
            element={
              <ProtectedRoute>
                <FindTaskersPage />
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
            path="/taskers/matched"
            element={
              <ProtectedRoute>
                <MatchedTaskersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                {
                  /* <SettingsPage /> */ console.log(
                    "Settings route needs page"
                  )
                }
              </ProtectedRoute>
            }
          />{" "}
          {/* Add SettingsPage if created */}
          {/* Stripe Redirect Handlers */}
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
          {/* Catch all for any other paths */}
          <Route
            path="*"
            element={<Navigate to={authToken ? "/feed" : "/"} replace />}
          />{" "}
          {/* Redirect to feed if logged in, else home */}
        </Routes>
      </main>
    </>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout /> {/* Use the AppLayout component */}
      </Router>
    </AuthProvider>
  );
}

export default App;
