// src/pages/ProfilePage.js
import React from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '../context/AuthContext';

// Import components
import ProfileInfo from '../components/ProfilePage/ProfileInfo'; // Adjust path if it moved
import AboutSection from '../components/ProfilePage/AboutSection';
import PostsSection from '../components/ProfilePage/PostsSection';
import AlbumSection from '../components/ProfilePage/AlbumSection';
import ReviewsSection from '../components/ProfilePage/ReviewsSection';

function ProfilePage() {
    const { user: loggedInUser, isLoading, refreshUser } = useAuth();

    if (isLoading) {
        return <div className={styles.pageStateContainer}><p>Loading Profile...</p></div>;
    }

    if (!loggedInUser) {
        return <div className={styles.pageStateContainer}><p>Please log in to view your profile.</p></div>;
    }

    const isTaskerProfile = loggedInUser.role?.includes("tasker");

    return (
         <div className={styles.content}>
            <ProfileInfo
                userToDisplay={loggedInUser}
                isOwnProfile={true}
                onProfileUpdate={refreshUser} // <<< PASS refreshUser directly
            />
            <AboutSection
                userToDisplay={loggedInUser}
                isOwnProfile={true}
                onBioUpdate={refreshUser}     // <<< PASS refreshUser directly
            />

            <PostsSection userIdToView={loggedInUser._id} isOwnProfile={true} />
            <AlbumSection
                userIdToView={loggedInUser._id}
                isOwnProfile={true}
                onUpdate={refreshUser}        // <<< PASS refreshUser directly
            />
            {isTaskerProfile && <ReviewsSection userIdToView={loggedInUser._id} isOwnProfile={true} />}
        </div>
    );
}

export default ProfilePage;