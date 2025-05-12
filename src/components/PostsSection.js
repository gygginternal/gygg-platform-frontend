// src/components/ProfilePage/PostsSection.js
import React, { useState, useEffect } from "react";
import styles from "./PostsSection.module.css"; // Create CSS Module
import PostCard from "./PostCard"; // Import adapted PostCard from SocialPage (reuse)
import apiClient from "../api/axiosConfig"; // Adjust path
import { useAuth } from "../context/AuthContext"; // Adjust path
import { Link } from 'react-router-dom'; // Use React Router Link
import logger from "../utils/logger";

function PostsSection() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!user?._id) return; // Need user ID to fetch their posts
            setLoading(true); setError('');
            try {
                // TODO: Backend needs endpoint like /posts?authorId=... or /users/:id/posts
                logger.info(`Fetching posts for author: ${user._id}`);
                // const response = await apiClient.get(`/posts?authorId=${user._id}&limit=2&sort=-createdAt`);
                // setPosts(response.data.data.posts || []);
                 logger.warn("User posts fetching not implemented - using static data");
                 setPosts([ // Static example data
                     { _id: 'post1', author: user, createdAt: new Date().toISOString(), content: "My first post on my profile!", likeCount: 10, commentCount: 2 },
                     { _id: 'post2', author: user, createdAt: new Date(Date.now() - 86400000).toISOString(), content: "Thinking about my next gig.", likeCount: 5, commentCount: 0 },
                 ]);

            } catch (err) {
                 logger.error("Error fetching user posts:", err);
                 setError("Could not load recent posts.");
            } finally {
                 setLoading(false);
            }
        };
        fetchUserPosts();
    }, [user]); // Refetch if user changes

    return (
        <section className={`${styles.postsCard} card`}> {/* Add card class */}
            <div className={styles.postsHeader}>
                <h2>Recent Posts</h2>
                 {/* Link to the main feed or a dedicated user posts page */}
                <Link to="/feed" className={styles.seeAllButton}>See all</Link>
            </div>
             {loading && <p>Loading posts...</p>}
             {error && <p className="error-message">{error}</p>}
            <div className={styles.postsGrid}>
                 {!loading && !error && posts.length === 0 && <p>No posts yet.</p>}
                 {!loading && !error && posts.length > 0 && posts.map(post => (
                     // Use the PostCard from SocialPage, passing the full post object
                     <PostCard key={post._id} post={post} />
                 ))}
            </div>
        </section>
    );
}

export default PostsSection;