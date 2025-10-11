// src/pages/HomePage.js
import React from 'react';
import { Link, Navigate } from 'react-router-dom'; // Use react-router-dom Link
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

// Import styles
import styles from './HomePage.module.css';
import LandingVisual from '../../components/features/HomePage/LandingVisual';
import LandingActions from '../../components/features/HomePage/LandingActions';

// Main HomePage component
function HomePage() {
  const { authToken, isLoading } = useAuth();

  // If still loading auth state, show loading indicator
  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  // If NOT loading and user IS authenticated, redirect to feed
  if (authToken) {
    return <Navigate to="/feed" replace />; // Use Navigate for redirection
  }

  // If user is not logged in, show the landing page view
  return (
    <div className={styles.pageContainer}>
      <LandingVisual />
      <LandingActions />
    </div>
  );
}

export default HomePage;
