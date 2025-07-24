// src/pages/UserProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './UserProfilePage.module.css';
import { useAuth } from '../../contexts/AuthContext';

import ProfileInfo from '../../components/ProfilePage/ProfileInfo';
import AboutSection from '../../components/ProfilePage/AboutSection';
import PostsSection from '../../components/ProfilePage/PostsSection';
import AlbumSection from '../../components/ProfilePage/AlbumSection';
import ReviewsSection from '../../components/ProfilePage/ReviewsSection';

import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';

function UserProfilePage() {
  const { userId: viewedUserIdFromParams } = useParams();
  const { user: loggedInUser, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Always use the userId from the URL for public profiles. Only fall back to loggedInUser for /profile route.
  const targetUserId =
    viewedUserIdFromParams !== undefined
      ? viewedUserIdFromParams
      : loggedInUser?._id;
  // isOwnProfile will be determined *after* profileUser is fetched

  const fetchUserProfileData = useCallback(async () => {
    if (!targetUserId) {
      logger.warn('UserProfilePage: No targetUserId to fetch profile.');
      if (!authIsLoading) {
        setPageError(
          'User not specified or not logged in to view own profile.'
        );
      }
      setPageLoading(false);
      setProfileUser(null);
      return;
    }
    setPageLoading(true);
    setPageError('');
    try {
      logger.info(
        `UserProfilePage: Fetching profile for user ID: ${targetUserId}`
      );
      const response = await apiClient.get(`/users/public/${targetUserId}`);
      setProfileUser(response.data.data.user);
    } catch (err) {
      logger.error(
        'UserProfilePage: Error fetching user profile:',
        err.response?.data || err.message
      );
      if (err.response?.status === 404) setPageError('User profile not found.');
      else setPageError('Could not load user profile.');
      setProfileUser(null);
    } finally {
      setPageLoading(false);
    }
  }, [targetUserId, authIsLoading]);

  useEffect(() => {
    if (!authIsLoading) {
      fetchUserProfileData();
    }
  }, [fetchUserProfileData, authIsLoading]);

  if (authIsLoading || pageLoading) {
    return (
      <div className={styles.pageStateContainer}>
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className={styles.pageStateContainer}>
        <p className={styles.errorMessage}>{pageError}</p>
      </div>
    );
  }

  if (!profileUser) {
    // This will be true if targetUserId was initially null/undefined OR fetch failed and setProfileUser(null)
    return (
      <div className={styles.pageStateContainer}>
        <p>User profile data is unavailable.</p>
      </div>
    );
  }

  // --- Declare isOwnProfile HERE, after profileUser is fetched ---
  const isOwnProfile = loggedInUser?._id === profileUser._id;
  // --- End of isOwnProfile declaration ---

  const isTaskerProfile = profileUser.role?.includes('tasker');

  return (
    <div className={styles.profilePageContainer}>
      <div className={styles.content}>
        <ProfileInfo
          userToDisplay={profileUser}
          isOwnProfile={isOwnProfile}
          onProfileUpdate={fetchUserProfileData}
          showMessageButton={!isOwnProfile && loggedInUser}
          onMessageClick={() => {
            navigate(`/messages/${profileUser._id}`);
          }}
        />
        <AboutSection
          userToDisplay={profileUser}
          isOwnProfile={isOwnProfile}
          onBioUpdate={fetchUserProfileData}
        />

        <PostsSection
          userIdToView={profileUser._id}
          isOwnProfile={isOwnProfile}
        />
        <AlbumSection
          userIdToView={profileUser._id}
          isOwnProfile={isOwnProfile}
          onUpdate={fetchUserProfileData}
        />
        {isTaskerProfile && (
          <ReviewsSection
            userIdToView={profileUser._id}
            isOwnProfile={isOwnProfile}
          />
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
