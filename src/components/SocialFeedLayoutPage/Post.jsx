// src/components/SocialPage/Post.js
import PropTypes from 'prop-types';
import styles from './Post.module.css';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import React, { useState, useEffect, useRef } from 'react';
import ConfirmModal from '../Shared/ConfirmModal';

const Icon = ({
  src,
  alt,
  className = '',
  width = 16,
  height = 16,
  onClick,
}) => {
  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.iconButton} ${className}`.trim()}
        onClick={onClick}
        tabIndex={0}
        aria-label={alt}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
          }
        }}
      >
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </button>
    );
  }
  return (
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
};

function formatCommentTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minutesStr} ${ampm}`;
  } else {
    return date.toLocaleDateString();
  }
}

function Post({ post, onPostUpdate }) {
  const { user: loggedInUser } = useAuth();

  // Initialize state even if post prop is initially null/undefined
  const [currentLikeCount, setCurrentLikeCount] = useState(
    post?.likeCount || 0
  );

  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(
    () =>
      post?.likes && loggedInUser
        ? post.likes.includes(loggedInUser._id)
        : false // Use functional update for initial state if complex
  );
  const [comments, setComments] = useState(post?.comments || []);
  const [commentCount, setCommentCount] = useState(post?.commentCount || 0);
  const [newCommentText, setNewCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [interactionError, setInteractionError] = useState('');
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);
  const postMenuRef = useRef(null);

  // Effect to update local state when the 'post' prop changes
  useEffect(() => {
    if (post) {
      setCurrentLikeCount(post.likeCount || 0);
      setCommentCount(post.commentCount || 0);
      setComments(post.comments || []);
      setIsLikedByCurrentUser(
        post.likes && loggedInUser
          ? post.likes.includes(loggedInUser._id)
          : false
      );
      setShowAllComments(false);
    } else {
      setCurrentLikeCount(0);
      setCommentCount(0);
      setComments([]);
      setIsLikedByCurrentUser(false);
    }
  }, [post, loggedInUser]);

  // Reset visible comments when post or comments change
  useEffect(() => {
    setVisibleCommentsCount(3);
  }, [post, comments]);

  // Close post menu on click outside
  useEffect(() => {
    if (!showPostMenu) return;
    function handleClickOutside(event) {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target)) {
        setShowPostMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPostMenu]);

  // --- Early return if essential data is missing AFTER hooks are called ---
  if (!post || !post.author || !post._id) {
    logger.warn('Post component: Invalid or missing post data prop:', post);
    return (
      <article className={styles.postCard}>
        <p>Post data unavailable...</p>
      </article>
    );
  }

  const { author, content, media, _id: postId, createdAt } = post;

  const handleImageError = e => {
    e.currentTarget.src = '/default.jpg';
  };

  const handleLikeToggle = async () => {
    if (!loggedInUser || isLiking) {
      logger.debug('Like toggle blocked: No user or isLiking is true');
      return;
    }
    setIsLiking(true);
    setInteractionError('');

    const endpoint = isLikedByCurrentUser
      ? `/posts/${postId}/unlike`
      : `/posts/${postId}/like`;

    try {
      const response = await apiClient.patch(endpoint);

      if (response.data.status === 'success' && response.data.data) {
        const newLikeCount = response.data.data.post.likeCount || 0;
        const newLikesArray =
          response.data.data.likes ||
          (isLikedByCurrentUser
            ? (post.likes || []).filter(id => id !== loggedInUser._id)
            : [...(post.likes || []), loggedInUser._id]);

        setCurrentLikeCount(newLikeCount);
        setIsLikedByCurrentUser(!isLikedByCurrentUser);

        if (onPostUpdate) {
          onPostUpdate({
            ...post,
            likeCount: newLikeCount,
            likes: newLikesArray,
          });
        }
      } else {
        throw new Error(
          response.data.message || 'Failed to update like status from server.'
        );
      }
    } catch (err) {
      logger.error('Error toggling like:', err.response?.data || err.message, {
        postId,
      });
      setInteractionError(
        err.response?.data?.message ||
          'Could not update like status. Please try again.'
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newCommentText.trim() || !loggedInUser || isCommenting) return;
    setIsCommenting(true);
    setInteractionError('');
    try {
      const response = await apiClient.post(`/posts/${postId}/comments`, {
        text: newCommentText.trim(),
      });
      const updatedPostData = response.data.data.post;
      setComments(updatedPostData.comments || []);
      setCommentCount(updatedPostData.commentCount || 0);
      setNewCommentText('');
      setShowComments(false);
      setShowAllComments(true);
      if (onPostUpdate) onPostUpdate(updatedPostData);
    } catch (err) {
      setInteractionError(
        err.response?.data?.message || 'Could not add comment.'
      );
    } finally {
      setIsCommenting(false);
    }
  };

  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const handleDeleteComment = async commentIdToDelete => {
    if (!loggedInUser) return;
    setCommentToDelete(commentIdToDelete);
    setShowDeleteCommentModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    setInteractionError('');

    try {
      await apiClient.delete(`/posts/${postId}/comments/${commentIdToDelete}`);
      const updatedComments = comments.filter(
        comment => comment._id !== commentIdToDelete
      );
      setComments(updatedComments);
      setCommentCount(updatedComments.length);

      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          comments: updatedComments,
          commentCount: updatedComments.length,
        });
      }
      logger.info(`Comment ${commentIdToDelete} deleted from post ${postId}`);
    } catch (err) {
      setInteractionError(
        err.response?.data?.message || 'Could not delete comment.'
      );
      logger.error(
        'Error deleting comment:',
        err.response?.data || err.message
      );
    }
  };

  const handleMoreClick = () => {
    // Remove all console.log statements
  };

  // Handler to show more comments
  const handleSeeMoreComments = () => {
    setVisibleCommentsCount(prev => prev + 10);
  };

  // Handler to show less comments (back to 3)
  const handleSeeLessComments = () => {
    setVisibleCommentsCount(3);
  };

  // Handler for toggling post menu
  const handlePostMenuToggle = () => setShowPostMenu(prev => !prev);
  const handleClosePostMenu = () => setShowPostMenu(false);

  // Handler for toggling comment menu
  const handleCommentMenuToggle = commentId => {
    setOpenCommentMenuId(prev => (prev === commentId ? null : commentId));
  };
  const handleCloseCommentMenu = () => setOpenCommentMenuId(null);

  const [showDeletePostModal, setShowDeletePostModal] = useState(false);

  // Handler for deleting a post
  const handleDeletePost = async () => {
    setShowDeletePostModal(true);
  };

  const confirmDeletePost = async () => {
    setInteractionError('');
    try {
      await apiClient.delete(`/posts/${postId}`);
      if (onPostUpdate) {
        onPostUpdate({ ...post, deleted: true });
      }
    } catch (err) {
      setInteractionError(
        err.response?.data?.message || 'Could not delete post.'
      );
    }
    setShowPostMenu(false);
  };

  // --- Return JSX ---
  return (
    <article className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={styles.userInfo}>
          <img
            src={author.profileImage || '/default.jpg'}
            alt={author.fullName || author.firstName || 'User profile'}
            className={styles.profileImage}
            onError={handleImageError}
          />
          <div>
            <h3 className={styles.username}>
              {author.fullName || `${author.firstName} ${author.lastName}`}
            </h3>
            <p className={styles.userHandle}>
              @{author.firstName?.toLowerCase() || 'user'}
              {author._id?.slice(-4)}
              <span className={styles.postTimestamp}>
                {' '}
                · {new Date(createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
        <div style={{ position: 'relative' }} ref={postMenuRef}>
          <button
            className={styles.moreIcon}
            onClick={handlePostMenuToggle}
            aria-label="More options"
            type="button"
          >
            <Icon src="/assets/more.svg" alt="more" />
          </button>
          {showPostMenu &&
            (loggedInUser?._id === author._id ||
              loggedInUser?.role.includes('admin')) && (
              <div
                className={styles.menuDropdown}
                onMouseLeave={handleClosePostMenu}
              >
                <button className={styles.menuItem} onClick={handleDeletePost}>
                  Delete Post
                </button>
              </div>
            )}
        </div>
      </div>

      <p className={styles.postContent}>{content}</p>

      {media && media.length > 0 && (
        <div className={styles.mediaContainer}>
          {media.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Media ${index + 1}`}
              className={styles.postMedia}
              onError={handleImageError}
              loading="lazy"
              style={{ borderRadius: 16 }}
            />
          ))}
        </div>
      )}

      {interactionError && (
        <p
          className={styles['error-message']}
          style={{ fontSize: '0.8em', margin: '8px 0' }}
        >
          {interactionError}
        </p>
      )}

      <div className={styles.postActions}>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${
              isLikedByCurrentUser ? styles.liked : ''
            }`}
            onClick={handleLikeToggle}
            disabled={isLiking || !loggedInUser}
            aria-pressed={isLikedByCurrentUser}
          >
            <Icon
              src={
                isLikedByCurrentUser
                  ? '/assets/heart-filled.svg'
                  : '/assets/heart.svg'
              }
              alt="like"
            />
            <span className={styles.actionCount}>{currentLikeCount}</span>
          </button>
          <button
            className={styles.actionButton}
            onClick={() => setShowComments(prev => !prev)}
            disabled={!loggedInUser}
            aria-pressed={showComments}
            aria-label={showComments ? 'Hide comments' : 'Show comments'}
          >
            <Icon src="/assets/comment.svg" alt="comment" />
            <span className={styles.actionCount}>{commentCount}</span>
          </button>
        </div>
        {/* <button
          className={styles.bookmarkIcon}
          onClick={() => {}}
          disabled={!loggedInUser}
        >
          <Icon src="/assets/bookmark.svg" alt="bookmark" />
        </button> */}
      </div>

      {/* Toggleable comment section */}
      {showComments && loggedInUser && (
        <>
          <form
            onSubmit={handleCommentSubmit}
            className={styles.commentInputSection}
          >
            <img
              src={loggedInUser.profileImage || '/default.jpg'}
              alt="Your profile"
              className={styles.commentProfileImage}
              onError={handleImageError}
            />
            <input
              type="text"
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              placeholder="Write a comment..."
              className={styles.commentInput}
              disabled={isCommenting}
            />
            <button
              type="submit"
              className={styles.commentSubmitButton}
              disabled={isCommenting || !newCommentText.trim()}
            >
              {isCommenting ? '...' : 'Post'}
            </button>
          </form>

          {comments && comments.length > 0 && (
            <div className={styles.commentsSection}>
              {comments.slice(-visibleCommentsCount).map(comment => (
                <div
                  key={comment._id || comment.tempId}
                  className={styles.commentItem}
                >
                  <img
                    src={comment.author?.profileImage || '/default.jpg'}
                    alt={comment.author?.firstName}
                    className={styles.commentAuthorImage}
                    onError={handleImageError}
                  />
                  <div className={styles.commentContentWrapper}>
                    <div className={styles.commentHeaderRow}>
                      <strong>{comment.author?.firstName || 'User'}</strong>
                      <span className={styles.commentTimestamp}>
                        ·{' '}
                        {comment.createdAt
                          ? formatCommentTime(comment.createdAt)
                          : ''}
                      </span>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                    {(loggedInUser?._id === comment.author?._id ||
                      loggedInUser?.role.includes('admin')) && (
                      <button
                        className={styles.commentMoreIcon}
                        onClick={() => handleCommentMenuToggle(comment._id)}
                        aria-label="More options"
                        type="button"
                      >
                        <Icon src="/assets/more.svg" alt="more" />
                        {openCommentMenuId === comment._id && (
                          <div
                            className={styles.menuDropdown}
                            onMouseLeave={handleCloseCommentMenu}
                          >
                            <button
                              className={styles.menuItem}
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              Delete Comment
                            </button>
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {/* Show "See more comments" button when there are more comments to show */}
              {visibleCommentsCount < comments.length && (
                <button
                  onClick={handleSeeMoreComments}
                  className={styles.viewAllComments}
                >
                  See more comments
                </button>
              )}
              
              {/* Show "See less comments" button when showing more than 3 comments */}
              {visibleCommentsCount > 3 && comments.length > 3 && (
                <button
                  onClick={handleSeeLessComments}
                  className={styles.viewAllComments}
                >
                  See less comments
                </button>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string,
    author: PropTypes.shape({
      _id: PropTypes.string,
      profileImage: PropTypes.string,
      fullName: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    content: PropTypes.string,
    media: PropTypes.array,
    createdAt: PropTypes.string,
    likeCount: PropTypes.number,
    commentCount: PropTypes.number,
    likes: PropTypes.array,
    comments: PropTypes.array,
  }),
  onPostUpdate: PropTypes.func,
};

export default Post;
