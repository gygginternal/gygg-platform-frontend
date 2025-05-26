// src/components/ProfilePage/PostsSection.js
import React, { useState, useEffect } from "react";
import styles from "./PostsSection.module.css"; // Your CSS Module
import PostCard from "./PostCard"; // Import adapted PostCard
import apiClient from "../api/axiosConfig"; // Adjust path as needed
import { useAuth } from "../context/AuthContext"; // Adjust path as needed
import { Link } from 'react-router-dom';
import logger from "../utils/logger"; // Optional, adjust path as needed

function PostsSection({ userIdToView }) { // Accept userIdToView as a prop
    const { user: loggedInUser } = useAuth(); // Logged-in user for context, if needed
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true); // Start loading true
    const [error, setError] = useState('');

    // Determine whose posts to fetch: the logged-in user or another user (if userIdToView is provided)
    const targetUserId = userIdToView || loggedInUser?._id;

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!targetUserId) {
                logger.info("PostsSection: No targetUserId available to fetch posts.");
                setLoading(false); // Stop loading if no ID
                // setPosts([]); // Ensure posts are cleared if targetUserId becomes null
                return;
            }

            setLoading(true);
            setError('');
            try {
                logger.info(`PostsSection: Fetching posts for authorId: ${targetUserId}`);
                // Fetch posts authored by the targetUserId, limit to a few recent ones for a profile section
                const response = await apiClient.get(`/posts`, {
                    params: {
                        authorId: targetUserId,
                        limit: 5, // Show, for example, the 5 most recent posts
                        sort: 'recents' // Sort by recent postS
                    }
                });

                setPosts(response.data.data.posts || []);
                logger.debug("PostsSection: Fetched user posts:", response.data.data.posts);

            } catch (err) {
                logger.error("PostsSection: Error fetching user posts:", err.response?.data || err.message);
                setError("Could not load recent posts for this user.");
                setPosts([]); // Clear posts on error
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
        // Refetch if the targetUserId changes (e.g., navigating between different user profiles)
    }, [targetUserId]);

    // Determine the "See all" link destination
    // If viewing own profile, link to main feed filtered by self.
    // If viewing another's profile, could link to a dedicated page for that user's posts.
    // For simplicity, always link to the main feed for now.
    const seeAllLink = `/feed`; // Or `/users/${targetUserId}/posts` if you build that page

    // Render logic
    const renderContent = () => {
        if (loading) {
            return <p>Loading posts...</p>;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (posts.length === 0) {
            // Check if the profile being viewed is the logged-in user's profile
            const isOwnProfile = loggedInUser?._id === targetUserId;
            return (
                <div style={{textAlign: 'center', padding: '20px 0'}}>
                    <p>{isOwnProfile ? "You haven't made any posts yet." : "This user hasn't made any posts yet."}</p>
                    {isOwnProfile && (
                        <Link to="/posts/create" className={styles.createPostButton}>
                            Create Your First Post
                        </Link>
                    )}
                </div>
            );
        }
        return posts.map(post => (
            // Assuming PostCard expects a 'post' object prop
            <PostCard key={post._id} post={post} />
        ));
    };


    return (
        <section className={`${styles.postsCard} card`}> {/* Use card class for consistency */}
            <div className={styles.postsHeader}>
                <h2>Recent Posts</h2>
                {/* Link to the main feed or a dedicated user posts page */}
                {posts.length > 0 && ( // Only show "See all" if there are posts
                     <Link to={seeAllLink} className={styles.seeAllButton}>
                        See all
                     </Link>
                )}
            </div>
            <div className={styles.postsGrid}>
                 {renderContent()}
            </div>
        </section>
    );
}

export default PostsSection;