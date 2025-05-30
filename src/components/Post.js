// src/components/SocialPage/Post.js
import React, { useState, useEffect } from 'react';
import styles from './Post.module.css';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig';
import logger from '../utils/logger';

const Icon = ({ src, alt, className = "", width = 16, height = 16, onClick }) => (
  <img
    src={src} alt={alt} className={className} width={width} height={height}
    onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}
    onError={(e) => { e.currentTarget.style.display = 'none'; }}
  />
);

function Post({ post, onPostUpdate }) {
  const { user: loggedInUser } = useAuth();

  // Initialize state even if post prop is initially null/undefined
  const [currentLikeCount, setCurrentLikeCount] = useState(post?.likeCount || 0); 
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(                
    () => post?.likes && loggedInUser ? post.likes.includes(loggedInUser._id) : false // Use functional update for initial state if complex
  ); 
  const [comments, setComments] = useState(post?.comments || []);
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0);
  const [newCommentText, setNewCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [interactionError, setInteractionError] = useState('');


  // Effect to update local state when the 'post' prop changes
   useEffect(() => {
    if (post) {
      setCurrentLikeCount(post.likeCount || 0);
      setCommentCount(post.commentCount || 0);
      setComments(post.comments || []);
      // Recalculate isLikedByCurrentUser based on the potentially updated post.likes array
      setIsLikedByCurrentUser(post.likes && loggedInUser ? post.likes.includes(loggedInUser._id) : false);
    } else {
          // Reset state if post becomes null (e.g., parent clears it)
          setCurrentLikeCount(0);
          setCommentCount(0);
          setComments([]);
          setIsLikedByCurrentUser(false);
      }
  }, [post, loggedInUser])

  // --- Early return if essential data is missing AFTER hooks are called ---
  if (!post || !post.author || !post._id) {
    logger.warn("Post component: Invalid or missing post data prop:", post);
    return <article className={styles.postCard}><p>Post data unavailable...</p></article>;
  }

  const { author, content, image, _id: postId, createdAt } = post;
  const isSimple = !image;

  const handleImageError = (e) => { e.currentTarget.src = '/default.jpg'; };

 const handleLikeToggle = async () => {
    if (!loggedInUser || isLiking) { // Prevent action if not logged in or already liking
        logger.debug("Like toggle blocked: No user or isLiking is true");
        return;
    }
    setIsLiking(true);
    setInteractionError('');

    const endpoint = isLikedByCurrentUser
      ? `/posts/${postId}/unlike`
      : `/posts/${postId}/like`;

    try {
      logger.info(`Attempting to ${isLikedByCurrentUser ? 'unlike' : 'like'} post: ${postId} by user: ${loggedInUser._id}`);
      const response = await apiClient.patch(endpoint); // Send PATCH request

      logger.debug(`Like/Unlike response for post ${postId}:`, response.data);

      // Backend should return the new likeCount and the updated likes array
      if (response.data.status === 'success' && response.data.data) {
        const newLikeCount = response.data.data.likeCount;
        const newLikesArray = response.data.data.likes || // Backend should send this
                              (isLikedByCurrentUser
                                ? (post.likes || []).filter(id => id !== loggedInUser._id)
                                : [...(post.likes || []), loggedInUser._id]);


        setCurrentLikeCount(newLikeCount);
        setIsLikedByCurrentUser(!isLikedByCurrentUser); // Toggle the liked state

        // Notify parent component (Feed) about the update so it can refresh its state
        if (onPostUpdate) {
          onPostUpdate({
            ...post, // Spread existing post data
            likeCount: newLikeCount,
            likes: newLikesArray // Send the updated likes array
          });
        }
      } else {
          throw new Error(response.data.message || "Failed to update like status from server.");
      }
    } catch (err) {
      logger.error("Error toggling like:", err.response?.data || err.message, { postId });
      setInteractionError(err.response?.data?.message || "Could not update like status. Please try again.");
      // Optional: Revert UI optimistic update if API call fails, though not done here for simplicity
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !loggedInUser || isCommenting) return;
    setIsCommenting(true); setInteractionError('');
    try {
      const response = await apiClient.post(`/posts/${postId}/comments`, { text: newCommentText.trim() });
      const updatedPostData = response.data.data.post;
      // Update local state directly from the response
      setComments(updatedPostData.comments || []);
      setCommentCount(updatedPostData.commentCount || 0);
      setNewCommentText(''); setShowCommentInput(false);
      if (onPostUpdate) onPostUpdate(updatedPostData);
    } catch (err) { setInteractionError(err.response?.data?.message || "Could not add comment."); }
    finally { setIsCommenting(false); }
  };

  const handleMoreClick = () => { console.log("More options clicked for post:", postId); };


  // --- Return JSX ---
  return (
    <article className={`${styles.postCard} ${isSimple ? styles.simplePostCard : styles.postCardWithImage}`}>
      <div className={styles.postHeader}>
        <div className={styles.userInfo}>
          <img
            src={author.profileImage || '/default.jpg'}
            alt={author.fullName || author.firstName || 'User profile'}
            className={styles.profileImage}
            onError={handleImageError}
          />
          <div>
            <h3 className={styles.username}>{author.fullName || `${author.firstName} ${author.lastName}`}</h3>
            <p className={styles.userHandle}>
              @{author.firstName?.toLowerCase() || 'user'}{author._id?.slice(-4)}
              <span className={styles.postTimestamp}> · {new Date(createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
        <button className={styles.moreIcon} onClick={handleMoreClick} aria-label="More options">
          <Icon src="/assets/more.svg" alt="more" />
        </button>
      </div>

      <p className={styles.postContent}>{content}</p>

      {!isSimple && image && (
        <img src={image} alt="Post content" className={styles.postImage} onError={handleImageError} loading="lazy"/>
      )}

      {interactionError && <p className="error-message" style={{fontSize: '0.8em', margin:'8px 0'}}>{interactionError}</p>}

      <div className={styles.postActions}>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${isLikedByCurrentUser ? styles.liked : ''}`}
            onClick={handleLikeToggle}
            disabled={isLiking || !loggedInUser}
            aria-pressed={isLikedByCurrentUser}
          >
            <Icon src={isLikedByCurrentUser ? "/assets/heart-filled.svg" : "/assets/heart.svg"} alt="like" />
            <span className={styles.actionCount}>{currentLikeCount}</span>
          </button>
          <button className={styles.actionButton} onClick={() => setShowCommentInput(!showCommentInput)} disabled={!loggedInUser}>
            <Icon src="/assets/comment.svg" alt="comment" />
            <span className={styles.actionCount}>{commentCount}</span>
          </button>
        </div>
        <button className={styles.bookmarkIcon} onClick={() => console.log("Bookmark clicked for:", postId)} disabled={!loggedInUser}>
          <Icon src="/assets/bookmark.svg" alt="bookmark" />
        </button>
      </div>

      {showCommentInput && loggedInUser && (
        <form onSubmit={handleCommentSubmit} className={styles.commentInputSection}>
          <img
            src={loggedInUser.profileImage || '/default.jpg'}
            alt="Your profile"
            className={styles.commentProfileImage}
            onError={handleImageError}
          />
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write a comment..."
            className={styles.commentInput}
            disabled={isCommenting}
          />
          <button type="submit" className={styles.commentSubmitButton} disabled={isCommenting || !newCommentText.trim()}>
            {isCommenting ? '...' : 'Post'}
          </button>
        </form>
      )}

      {comments && comments.length > 0 && (
        <div className={styles.commentsPreview}>
          {comments.slice(0, 2).map(comment => (
            <div key={comment._id || comment.tempId} className={styles.commentItem}> {/* Use _id or tempId if adding optimistically */}
              <img
                src={comment.author?.profileImage || '/default.jpg'}
                alt={comment.author?.firstName}
                className={styles.commentAuthorImage}
              />
              <div>
                <strong>{comment.author?.firstName || 'User'}</strong>: <p style={{display: 'inline'}}>{comment.text}</p>
              </div>
            </div>
          ))}
          {comments.length > 2 && (
            <button onClick={() => console.log("View all comments for:", postId)} className={styles.viewAllComments}>
              View all {commentCount} comments
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default Post;