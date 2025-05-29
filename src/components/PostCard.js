import React from 'react';
// import { Link } from 'react-router-dom'; // Optional

function PostCard({ post }) {
    if (!post) return null;
    return (
        <div className="postCard">
            <div className="postHeader">
                <img
                    src={post.author?.profileImage || '/default.jpg'}
                    alt={post.author?.fullName}
                    width={48}
                    height={48}
                    className="postProfileImg"
                />
                <div className="postAuthorInfo">
                    <p className="postAuthorName">{post.author?.fullName || 'Unknown User'}</p>
                    <span className="postDate">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
            </div>
            <p className="postContent">{post.content}</p>
            {/* TODO: Display media */}
            <div className="postActions">
                <span className="actionItem">👍 {post.likeCount} Likes</span>
                <span className="actionItem">💬 {post.commentCount} Comments</span>
                {post.location?.address && (
                    <span className="actionItem">📍 {post.location.address}</span>
                )}
            </div>
            {/* TODO: Add Like/Unlike/Comment buttons/forms */}
        </div>
    );
}

export default PostCard;
