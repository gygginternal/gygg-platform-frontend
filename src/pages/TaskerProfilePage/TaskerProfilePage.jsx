// src/pages/TaskerProfilePage/TaskerProfilePage.js
import React from 'react';
import styles from './TaskerProfilePage.module.css';
import { useAuth } from '../../contexts/AuthContext';

// Import components
import ProfileInfo from '../../components/features/ProfilePage/ProfileInfo'; // Adjust path if it moved
import AboutSection from '../../components/features/ProfilePage/AboutSection';
import PostsSection from '../../components/features/ProfilePage/PostsSection';
import AlbumSection from '../../components/features/ProfilePage/AlbumSection';
import ReviewsSection from '../../components/features/ProfilePage/ReviewsSection';
import ProviderProfilePage from '../ProviderProfilePage/ProviderProfilePage';

function TaskerProfilePage() {
  const { user: loggedInUser, isLoading, refreshUser } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.pageStateContainer}>
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className={styles.pageStateContainer}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  if (loggedInUser.role?.includes('provider')) {
    return <ProviderProfilePage providerId={loggedInUser._id} />;
  }

  const isTaskerProfile = loggedInUser.role?.includes('tasker');

  return (
    <div className={styles.content}>
      <ProfileInfo
        userToDisplay={loggedInUser}
        isOwnProfile
        onProfileUpdate={refreshUser} // <<< PASS refreshUser directly
      />
      <AboutSection
        userToDisplay={loggedInUser}
        isOwnProfile
        onBioUpdate={refreshUser} // <<< PASS refreshUser directly
      />

      <PostsSection userIdToView={loggedInUser._id} isOwnProfile />
      <AlbumSection
        userIdToView={loggedInUser._id}
        isOwnProfile
        onUpdate={refreshUser} // <<< PASS refreshUser directly
      />
      {isTaskerProfile && (
        <ReviewsSection userIdToView={loggedInUser._id} isOwnProfile />
      )}
    </div>
  );
}

export default TaskerProfilePage;
