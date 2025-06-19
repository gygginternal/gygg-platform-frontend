import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiClient from '../api/axiosConfig';
import ReviewItem from './ReviewItem';
function ReviewList({ taskerId, gigId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!taskerId && !gigId) return;
      setLoading(true);
      setError('');
      const params = {};
      if (taskerId) params.taskerId = taskerId;
      if (gigId) params.gigId = gigId; // Assuming backend supports this filter
      try {
        const response = await apiClient.get('/reviews', { params });
        setReviews(response.data.data.reviews);
      } catch (err) {
        setError('Could not load reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [taskerId, gigId]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div style={{ marginTop: '25px' }}>
      <h4>Reviews</h4>
      {reviews.length > 0 ? (
        reviews.map(review => <ReviewItem key={review._id} review={review} />)
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}
ReviewList.propTypes = {
  taskerId: PropTypes.string,
  gigId: PropTypes.string,
};
export default ReviewList;
