// src/pages/ProfilePage.js
import React from "react";
import styles from "./ProfilePage.module.css"; // Create this CSS Module
// Import adapted profile components
import ProfileInfo from "../components/ProfileInfo"; // Assuming ProfileInfo covers top section
import AboutSection from "../components/AboutSection";
import PostsSection from "../components/PostsSection";
import AlbumSection from "../components/AlbumSection";
import ReviewsSection from "../components/ReviewsSection";
import { useAuth } from "../context/AuthContext"; // To check user role
import { StripeOnboarding } from "../components/StripeOnboarding";

function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Loading Profile...</p>
      </div>
    );
  }
  if (!user) {
    // Should be caught by ProtectedRoute, but good fallback
    return (
      <div className={styles.container}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  // Determine if the profile being viewed belongs to a tasker
  const isTaskerProfile = user.role?.includes("tasker");

  return (
    // Main container likely handled by App.js layout (padding-top, padding-left)
    // This div is for the content area of the profile page itself
    <div className={styles.content}>
      {/* Profile Info card at the top */}
      <ProfileInfo />

      <StripeOnboarding />

      {/* About Me section */}
      <AboutSection />

      {/* Posts Section */}
      <PostsSection />

      {/* Album Section */}
      <AlbumSection />

      {/* Reviews Section - Only show if the profile is for a Tasker */}
      {isTaskerProfile && <ReviewsSection />}
    </div>
  );
}

export default ProfilePage;
