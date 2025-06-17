// src/components/SocialPage/PostCard.js
import React from 'react';
import { format, isToday } from 'date-fns';
import styles from './PostCard.module.css'; // Assuming postCard styles are here

// Re-defining Icon component (ensure it's imported or defined somewhere accessible)
const Icon = ({ src, alt, className = "", width = 16, height = 16, onClick }) => (
  <img
    src={src} alt={alt} className={`${className} ${onClick ? styles.clickableIcon : ""}`} width={width} height={height}
    onClick={onClick}
    onError={(e) => { e.currentTarget.style.display = 'none'; }}
  />
);

// Helper function to format timestamp (retained from previous updates)
const formatPostTimestamp = (dateString) => {
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

    return (
        <div className={styles.postCard}>
            <div className={styles.postHeader}>
                <img
                    src={profileImageSrc}
                    alt={post.author?.fullName || 'User Profile'}
                    width={48}
                    height={48}
                    className={styles.postProfileImg} // This CSS class makes it circular
                    onError={(e) => { e.currentTarget.src = '/default.jpg'; }} // Fallback on error
                />
                <div className={styles.postAuthorInfo}>
                    <p className={styles.postAuthorName}>{post.author?.fullName || 'Unknown User'}</p>
                    <span className={styles.postDate}>{formatPostTimestamp(post.createdAt)}</span>
                </div>
            </div>
            <p className={styles.postContent}>{post.content}</p>
            {post.image && (
                <img src={post.image} alt="Post content" className={styles.postImage} onError={(e) => { e.currentTarget.style.display='none'; }} />
            )}
            <div className={styles.postActions}>
                {/* Updated Like action item */}
                <span className={styles.actionItem}>
                    <Icon src="/assets/heart.svg" alt="Likes" width={18} height={18} /> {/* Using heart icon */}
                    <span className={styles.actionCount}>{post.likeCount}</span>
                </span>
                {/* Updated Comment action item */}
                <span className={styles.actionItem}>
                    <Icon src="/assets/comment.svg" alt="Comments" width={18} height={18} /> {/* Using comment icon */}
                    <span className={styles.actionCount}>{post.commentCount}</span>
                </span>
                {post.location?.address && (
                    <span className={styles.actionItem}>📍 {post.location.address}</span>
                )}
            </div>
            {/* TODO: Add Like/Unlike/Comment buttons/forms if this is meant to be interactive */}
        </div>
    );
}

export default PostCard;