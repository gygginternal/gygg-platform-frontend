import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import GigList from './pages/GigList';
import GigDetails from './pages/GigDetails';
import CreateGig from './pages/CreateGig';
import Applications from './pages/Applications';
import NotFound from './pages/NotFound';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotificationsPage from './pages/NotificationsPage';
import MyContractsPage from './pages/MyContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';
import InvoicePage from './pages/InvoicePage';
import ChatPage from './pages/ChatPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/gigs"
          element={
            <PrivateRoute>
              <GigList />
            </PrivateRoute>
          }
        />
        <Route
          path="/gigs/:id"
          element={
            <PrivateRoute>
              <GigDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-gig"
          element={
            <PrivateRoute>
              <CreateGig />
            </PrivateRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <PrivateRoute>
              <Applications />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/contracts"
          element={
            <PrivateRoute>
              <MyContractsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <PrivateRoute>
              <ContractDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoice/:paymentId"
          element={
            <PrivateRoute>
              <InvoicePage />
            </PrivateRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
