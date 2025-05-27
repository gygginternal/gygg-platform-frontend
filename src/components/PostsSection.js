// src/components/ProfilePage/PostsSection.js
import React, { useState, useEffect } from "react";
import styles from "./PostsSection.module.css";    // Ensure this CSS Module exists
import PostCard from "../components/PostCard";    // Import your PostCard component (adjust path if needed)
import apiClient from "../api/axiosConfig";      // Adjust path as needed
import { useAuth } from "../context/AuthContext";  // Adjust path as needed
import { Link } from 'react-router-dom';         // For "See all" and "Create Post" links
import logger from "../utils/logger";          // Optional: Adjust path as needed

function PostsSection({ userIdToView }) { // Accepts userId of the profile being viewed
    const { user: loggedInUser } = useAuth(); // Get the currently logged-in user
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true); // Start in loading state
    const [error, setError] = useState('');

    // Determine whose posts to fetch. If userIdToView is provided, fetch for that user.
    // Otherwise, (e.g., if on own dashboard and prop not passed), fetch for loggedInUser.
    const targetUserId = userIdToView || loggedInUser?._id;

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!targetUserId) {
                logger.info("PostsSection: No targetUserId available to fetch posts.");
                setLoading(false); // Stop loading if no target user ID
                setPosts([]);      // Ensure posts are cleared
                return;
            }

            setLoading(true);
            setError('');
            try {
                logger.info(`PostsSection: Fetching posts for authorId: ${targetUserId}`);
                // API call to the general posts feed, filtered by authorId
                const response = await apiClient.get(`/posts`, {
                    params: {
                        authorId: targetUserId,
                        limit: 5,         // Display a limited number of recent posts on the profile
                        sort: 'recents'   // Get the newest posts first
                    }
                });

                setPosts(response.data.data.posts || []);
                logger.debug("PostsSection: Fetched user posts:", response.data.data.posts);

            } catch (err) {
                logger.error("PostsSection: Error fetching user posts:", err.response?.data || err.message, { targetUserId });
                setError("Could not load recent posts for this user.");
                setPosts([]); // Clear posts on error
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
        // Dependency array: re-fetch if the targetUserId changes
        // (e.g., if this component is reused and a different user's profile is loaded)
    }, [targetUserId]);

    // Determine if the profile being viewed is the logged-in user's own profile
    const isOwnProfile = loggedInUser?._id === targetUserId;

    // "See all" link can point to a dedicated page for this user's posts or their section in the main feed
    // For now, linking to the main feed for simplicity
    const seeAllLink = `/feed`; // Or more advanced: `/users/${targetUserId}/posts`

    // Render logic
    const renderContent = () => {
        if (loading) {
            return <p>Loading posts...</p>;
        }
        if (error) {
            return <p className="error-message">{error}</p>; // Assuming global .error-message style
        }
        if (posts.length === 0) {
            return (
                <div style={{textAlign: 'center', padding: '20px 0'}}>
                    <p>{isOwnProfile ? "You haven't made any posts yet." : "This user hasn't made any posts yet."}</p>
                    {isOwnProfile && (
                        <Link to="/posts/create" className={styles.createPostButton}> {/* Style this button */}
                            Create Your First Post
                        </Link>
                    )}
                </div>
            );
        }
        return posts.map(post => (
            // Ensure PostCard component expects a 'post' object prop
            <PostCard key={post._id} post={post} />
        ));
    };

    return (
        <section className={`${styles.postsCard} card`}> {/* Use a general 'card' style if available */}
            <div className={styles.postsHeader}>
                <h2>Recent Posts</h2>
                {posts.length > 0 && ( // Only show "See all" if there are posts to see
                     <Link to={seeAllLink} className={styles.seeAllButton}> {/* Style this button/link */}
                        See all
                     </Link>
                )}
            </div>
            <div className={styles.postsGrid}> {/* Ensure this class has layout styles (e.g., flex column, grid) */}
                 {renderContent()}
            </div>
        </section>
    );
}

export default PostsSection;