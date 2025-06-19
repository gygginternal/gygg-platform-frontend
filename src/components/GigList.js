import React from 'react';
import { Link } from 'react-router-dom';

function GigList({ gigs, loading, error, title = 'Available Gigs' }) {
  if (loading) return <p>Loading gigs...</p>;
  if (error)
    return <p className="error-message">Error loading gigs: {error}</p>;
  if (!gigs || gigs.length === 0) return <p>No gigs found.</p>;

  return (
    <div>
      <h3>{title}</h3>
      <ul style={{ padding: 0 }}>
        {gigs.map(gig => (
          <li key={gig.id || gig._id} className="list-item-card">
            <h4>
              <Link to={`/gigs/${gig.id || gig._id}`}>{gig.title}</Link>
            </h4>
            <p>
              Category: {gig.category}{' '}
              {gig.subcategory ? `(${gig.subcategory})` : ''}
            </p>
            <p>Cost: ${gig.cost}</p>
            <p>
              Status:{' '}
              <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                {gig.status}
              </span>
            </p>
            <p>Posted by: {gig.postedBy?.fullName || 'N/A'}</p>
            {gig.assignedTo && (
              <p>Tasker: {gig.assignedTo?.fullName || 'N/A'}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default GigList;
