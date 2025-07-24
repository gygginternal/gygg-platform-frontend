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
  const { user: loggedInUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0); // For pagination
  const POSTS_PER_PAGE = 2;

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
            params: { limit: 10, sort: 'recents' },
          }
        );
        setPosts(response.data.data.posts || []);
        setPage(0);
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

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    page * POSTS_PER_PAGE,
    (page + 1) * POSTS_PER_PAGE
  );

  // This helper function now only renders the list of posts
  const renderPosts = () => {
    return paginatedPosts.map(post => <PostCard key={post._id} post={post} />);
  };

  return (
    <section className={styles.postsCard}>
      <div className={styles.postsHeader}>
        <h2>Recent Posts</h2>
      </div>

      {/* --- MODIFIED SECTION START --- */}
      <div className={styles.postsContent}>
        {loading ? (
          <div className={styles.centeredMessage}>
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>
            <p>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={`${styles.centeredMessage} ${styles.noPostsMessage}`}>
            <p>
              {isOwnProfile
                ? "You haven't made any posts yet."
                : "This user hasn't made any posts yet."}
            </p>
            {isOwnProfile && (
              <Link to="/feed" className={styles.createPostButton}>
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.postsGrid}>{renderPosts()}</div>
        )}
      </div>
      {/* --- MODIFIED SECTION END --- */}

      {posts.length > 0 && totalPages > 1 && (
        <div className={styles.paginationDots}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.dotButton}
              onClick={() => setPage(idx)}
              style={{
                cursor: 'pointer',
                margin: '0 4px',
                background: 'none',
                border: 'none',
                padding: 0,
              }}
            >
              <span className={idx === page ? styles.activeDot : styles.dot} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

PostsSection.propTypes = {
  userIdToView: PropTypes.string,
  isOwnProfile: PropTypes.bool.isRequired,
};

export default PostsSection;