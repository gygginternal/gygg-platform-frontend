// src/components/SocialPage/Post.js
import React from 'react';
import styles from './Post.module.css'; // Use the CSS module provided
// Removed Image import from 'next/image'

// Define structure (can use PropTypes in JS)
// interface PostProps { post: YourPostType; onLike?: (id) => void; ... }

function Post({
  post, // Pass the whole post object from backend/state
  onLike = (id) => console.log("Like clicked:", id), // Default handlers
  onComment = (id) => console.log("Comment clicked:", id),
  onBookmark = (id) => console.log("Bookmark clicked:", id),
  onMore = (id) => console.log("More clicked:", id)
}) {
  // Check if essential post or author data is missing
  if (!post || !post.author || !post._id) {
      console.warn("Post component received invalid post data:", post);
      return <div className={styles.postCard}>Loading post data or post is invalid...</div>;
  }

  // Destructure needed data AFTER checking post and author exist
  const { author, content, image, likes, likeCount, comments, commentCount, createdAt, _id } = post;

  // Determine view based on image presence or prop if passed explicitly
  const isSimple = !image; // Assuming 'image' field contains URL if not simple

  const handleLikeClick = () => onLike(_id);
  const handleCommentClick = () => onComment(_id);
  const handleBookmarkClick = () => onBookmark(_id);
  const handleMoreClick = () => onMore(_id);

  // Image error handler
  const handleImageError = (e) => {
     e.target.style.display = 'none'; // Hide broken image element
     // Or set a fallback src: e.target.src = '/path/to/fallback.png';
  };

  return (
    // Use article tag semantically
    <article className={`${styles.postCard} ${isSimple ? '' : styles.postCardWithImage}`}>
      <div className={styles.postHeader}>
        <div className={styles.userInfo}>
          <img // Use standard img
            src={author.profileImage || '/default.jpg'} // Add fallback default image in /public
            alt={author.fullName || author.firstName || 'User profile'}
            width={48}
            height={48}
            className={styles.profileImage}
            onError={handleImageError}
          />
          <div>
            <h3 className={styles.username}>{author.fullName || `${author.firstName} ${author.lastName}`}</h3>
            {/* Generate handle more robustly */}
            <p className={styles.userHandle}>@{author.firstName?.toLowerCase() || 'user'}{author._id.slice(-4)}</p>
          </div>
        </div>
        <button className={styles.moreIcon} onClick={handleMoreClick} aria-label="More options">
          <img src="/assets/more.svg" alt="more" width={16} height={16} /> {/* Ensure icon in /public */}
        </button>
      </div>

      {/* Content */}
      <p className={styles.postContent}>{content}</p>

      {/* Image Section (if not simple) */}
      {!isSimple && image && (
        <img
            src={image}
            alt="Post content"
            // Remove fixed width/height, let CSS control
            className={styles.postImage}
            onError={handleImageError}
            loading="lazy" // Add lazy loading
        />
      )}

      {/* Actions Section */}
      <div className={styles.postActions}>
        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={handleLikeClick}>
            <img src="/assets/heart.svg" alt="like" width={16} height={16} />
            {/* Use likeCount if available (updated by hook), fallback to likes */}
            <span className={styles.actionCount}>{likeCount ?? likes ?? 0}</span>
          </button>
          <button className={styles.actionButton} onClick={handleCommentClick}>
            <img src="/assets/comment.svg" alt="comment" width={16} height={16} />
            <span className={styles.actionCount}>{commentCount ?? comments ?? 0}</span>
          </button>
        </div>
        <button className={styles.bookmarkIcon} onClick={handleBookmarkClick}>
          <img src="/assets/bookmark.svg" alt="bookmark" width={16} height={16} />
        </button>
      </div>

        {/* Optional: Comment preview or input for non-simple posts */}
        {/* {!isSimple && (
            <div className={styles.commentSection}>
                <div className={styles.writeComment} onClick={handleCommentClick}>Write a comment...</div>
            </div>
        )} */}
    </article>
  );
};

export default Post;