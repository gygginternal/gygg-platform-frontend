// src/components/ProfilePage/PostsSection.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axiosConfig';
import styles from './PostsSection.module.css';
import PostCard from './PostCard';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import logger from '../../utils/logger';

function PostsSection({ userIdToView, isOwnProfile }) {
  // Accept isOwnProfile
  const { user: loggedInUser } = useAuth(); // loggedInUser can be different from userToDisplay (userIdToView)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // If userIdToView is not passed, assume we want posts of loggedInUser (for PostsSection on own dashboard)
  const targetUserIdForPosts = userIdToView || loggedInUser?._id;

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!targetUserIdForPosts) {
        logger.info('PostsSection: No targetUserId, cannot fetch posts.');
        setLoading(false);
        setPosts([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        logger.info(
          `PostsSection: Fetching posts for authorId: ${targetUserIdForPosts}`
        );
        const response = await apiClient.get(
          `/posts/user/${targetUserIdForPosts}`,
          {
            params: { limit: 5, sort: 'recents' },
          }
        );
        setPosts(response.data.data.posts || []);
      } catch (err) {
        logger.error('PostsSection: Error fetching posts:', err);
        setError('Could not load posts.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPosts();
  }, [targetUserIdForPosts]);

  const seeAllLink = `/feed`; // Could be /users/${targetUserIdForPosts}/posts

  const renderContent = () => {
    if (loading) return <p>Loading posts...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;
    if (posts.length === 0) {
      return (
        <div className={styles.noPostsMessage}>
          <p>
            {isOwnProfile
              ? "You haven't made any posts yet."
              : "This user hasn't made any posts yet."}
          </p>
          {/* Only show create post link if it's own profile */}
          {isOwnProfile && (
            <Link to="/feed" className={styles.createPostButton}>
              Create Your First Post
            </Link>
          )}
        </div>
      );
    }
    return posts.map(post => (
      <PostCard
        key={post._id}
        post={post} /* Pass onPostUpdate if PostCard needs it */
      />
    ));
  };

  return (
    <section className={styles.postsCard}>
      <div className={styles.postsHeader}>
        <h2>Recent Posts</h2>
      </div>
      <div className={styles.postsGrid}>{renderContent()}</div>
    </section>
  );
}

PostsSection.propTypes = {
  userIdToView: PropTypes.string,
  isOwnProfile: PropTypes.bool.isRequired,
};

export default PostsSection;
