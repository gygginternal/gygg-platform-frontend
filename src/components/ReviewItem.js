import React from 'react';
const DisplayRating = ({ rating }) => { /* ... Star display logic ... */
     return ( <span style={{ color: 'gold', fontSize: '16px' }}> {'★'.repeat(Math.floor(rating))}{'☆'.repeat(Math.max(0, 5 - Math.floor(rating)))} ({rating?.toFixed(1)}) </span> );
};

function ReviewItem({ review }) {
    if (!review) return null;
    const reviewer = review.reviewer;
    return (
        <div style={{ borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '15px' }}>
            <div className="flex-container" style={{ marginBottom: '5px' }}>
                <img src={reviewer?.profileImage || '/default.jpg'} alt={reviewer?.fullName} className="avatar-small" />
                <strong>{reviewer?.fullName || 'Anonymous'}</strong>
                 <span className="margin-left-auto"><DisplayRating rating={review.rating} /></span>
            </div>
            <p style={{ margin: '5px 0 10px 0' }}>{review.comment || <i>No comment left.</i>}</p>
            <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
        </div>
    );
}
export default ReviewItem;