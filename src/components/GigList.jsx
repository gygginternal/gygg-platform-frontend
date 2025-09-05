import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './GigList.module.css';

function GigList({ gigs, loading, error, title = 'Available Gigs' }) {
  if (loading) return <p>Loading gigs...</p>;
  if (error)
    return <p className={styles.errorMessage}>Error loading gigs: {error}</p>;
  if (!gigs || gigs.length === 0) return <p>No gigs found.</p>;

  return (
    <div>
      <h3>{title}</h3>
      <ul style={{ padding: 0 }}>
        {gigs.map(gig => (
          <li key={gig.id || gig._id} className={styles.listItemCard}>
            <h4>
              <Link to={`/gigs/${gig.id || gig._id}`}>{gig.title}</Link>
            </h4>
            <p>
              Category: {gig.category}{' '}
              {gig.subcategory ? `(${gig.subcategory})` : ''}
            </p>
            <p>
              {gig.isHourly 
                ? `Rate: $${gig.ratePerHour || 0}/hr${gig.estimatedHours ? ` (Est. ${gig.estimatedHours}h)` : ''}`
                : `Cost: $${gig.cost || 0}`
              }
            </p>
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

GigList.propTypes = {
  gigs: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.string,
  title: PropTypes.string,
};

export default GigList;
