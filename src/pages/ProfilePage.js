// src/pages/ProfilePage.js
import React from 'react';
import styles from './ProfilePage.module.css'; // Ensure this CSS Module exists and is styled
import { useAuth } from '../context/AuthContext'; // To get logged-in user and role

// Import adapted profile components (adjust paths as needed)
import ProfileInfo from '../components/ProfileInfo'; // Covers top section, name, location, skills, hobbies
import AboutSection from '../components/AboutSection';
import PostsSection from '../components/PostsSection';
import AlbumSection from '../components/AlbumSection';
import ReviewsSection from '../components/ReviewsSection'; // Assuming this shows reviews *about* the user

function ProfilePage() {
    const { user: loggedInUser, isLoading } = useAuth();

    if (isLoading) {
        return (
            // Use a more descriptive loading state or a spinner component
            <div className={styles.pageStateContainer}> {/* General container for loading/error */}
                <p>Loading Profile...</p>
            </div>
        );
    }

    if (!loggedInUser) {
        // This case should ideally be handled by ProtectedRoute redirecting to /login
        // but it's a good fallback.
        return (
            <div className={styles.pageStateContainer}>
                <p>Please log in to view your profile.</p>
                {/* Optionally add a <Link to="/login">Login</Link> here */}
            </div>
        );
    }

    // Determine if the profile being viewed belongs to a tasker
    const isTaskerProfile = loggedInUser.role?.includes("tasker");

    return (
        // This main div is for the content area of the profile page itself.
        // The overall page layout (Header, main content padding) is handled by App.js/AppLayout.
        <div className={styles.content}>
            {/* Profile Info card at the top - Pass user data for display and editing */}
            {/* ProfileInfo usually fetches its own user data or uses context if it's always loggedInUser */}
            <ProfileInfo /> {/* If ProfileInfo uses useAuth() internally, no need to pass user */}

            {/* About Me section - Fetches/updates bio for loggedInUser */}
            <AboutSection /> {/* If AboutSection uses useAuth() internally */}

            {/* Posts Section - Shows posts by the loggedInUser */}
            {/* Pass loggedInUser._id to specify whose posts to load */}
            <PostsSection userIdToView={loggedInUser._id} />

            {/* Album Section - Shows album of the loggedInUser */}
            <AlbumSection userIdToView={loggedInUser._id} />

            {/* Reviews Section - Only show if the profile is for a Tasker, showing reviews ABOUT them */}
            {isTaskerProfile && <ReviewsSection userIdToView={loggedInUser._id} />}
            {/* If it was to show reviews GIVEN BY this user, it would be:
                <ReviewsSection providerIdToView={loggedInUser._id} />
             But typically profile pages show reviews received. */}

        </div>
    );
}

export default ProfilePage;