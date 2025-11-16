// src/components/SocialPage/PostCard.js
import { format, isToday } from 'date-fns';
import { MapPin } from 'lucide-react';
import styles from './PostCard.module.css'; // Assuming postCard styles are here
import PropTypes from 'prop-types';

// Re-defining Icon component (ensure it's imported or defined somewhere accessible)
const Icon = ({ src, alt, className = '', width = 16, height = 16 }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    width={width}
    height={height}
    onError={e => {
      e.currentTarget.style.display = 'none';
    }}
  />
);

Icon.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

// Helper function to format timestamp (retained from previous updates)
const formatPostTimestamp = dateString => {
  const date = new Date(dateString);
  if (isToday(date)) {
    return format(date, 'h:mm a'); // e.g., "3:45 PM"
  } else {
    return format(date, 'MMM d, yyyy'); // e.g., "Jan 15, 2023"
  }
};

function PostCard({ post }) {
  if (!post) return null;

  const profileImageSrc = post.author?.profileImage || '/default.jpg';

  // Define the handlePostClick function
  const handlePostClick = _postData => {
    // TODO: Implement post click handler
    // You can navigate to post detail page or open modal here
  };

  return (
    <div
      className={styles.postCard}
      aria-label={`View post by ${post.author?.fullName || 'Unknown User'}`}
    >
      <div className={styles.postHeader}>
        <img
          src={profileImageSrc}
          alt={post.author?.fullName || 'User Profile'}
          className={styles.postProfileImg}
          onError={e => {
            e.currentTarget.src = '/default.jpg';
          }}
        />
        <div className={styles.postAuthorInfo}>
          <span className={styles.postAuthorName}>
            {post.author?.fullName || 'Unknown User'}
          </span>
          <span className={styles.postDate}>
            {formatPostTimestamp(post.createdAt)}
          </span>
        </div>
      </div>
      <p className={styles.postContent}>{post.content}</p>
      {post.image && (
        <div className="image-container">
          <img
            src={post.image}
            alt="Post content"
            className="post-image"
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className={styles.postActions}>
        {/* Updated Like action item */}
        <span className={styles.actionItem}>
          <Icon src="/assets/heart.svg" alt="Likes" width={18} height={18} />{' '}
          {/* Using heart icon */}
          <span className={styles.actionCount}>{post.likeCount}</span>
        </span>
        {/* Updated Comment action item */}
        <span className={styles.actionItem}>
          <Icon
            src="/assets/comment.svg"
            alt="Comments"
            width={18}
            height={18}
          />{' '}
          {/* Using comment icon */}
          <span className={styles.actionCount}>{post.commentCount}</span>
        </span>
        {post.location?.address && (
          <span className={styles.actionItem}>
            <MapPin size={14} className={styles.locationIcon} />
            {post.location.address}
          </span>
        )}
      </div>
      {/* TODO: Add Like/Unlike/Comment buttons/forms if this is meant to be interactive */}
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    author: PropTypes.shape({
      profileImage: PropTypes.string,
      fullName: PropTypes.string,
    }),
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    content: PropTypes.string,
    image: PropTypes.string,
    likeCount: PropTypes.number,
    commentCount: PropTypes.number,
    location: PropTypes.shape({
      address: PropTypes.string,
    }),
  }),
};

export default PostCard;
