import React from 'react';
// import { Link } from 'react-router-dom'; // Optional

function PostCard({ post }) {
    if (!post) return null;
    return (
        <div className="card"> {/* Use card class */}
            <div className="flex-container" style={{ marginBottom: '10px' }}>
                <img src={post.author?.profileImage || '/default.jpg'} alt={post.author?.fullName} className="avatar-small" />
                <strong>{post.author?.fullName || 'Unknown User'}</strong>
                <span className="text-muted margin-left-auto">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <p>{post.content}</p>
            {/* TODO: Display media */}
            <div style={{ marginTop: '15px' }} className="text-muted">
                <span style={{ marginRight: '20px' }}>👍 {post.likeCount} Likes</span>
                <span>💬 {post.commentCount} Comments</span>
                 {post.location?.address && <span style={{ marginLeft: '20px' }}>📍 {post.location.address}</span>}
            </div>
             {/* TODO: Add Like/Unlike/Comment buttons/forms */}
        </div>
    );
}
export default PostCard;