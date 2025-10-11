import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './MatchedGigCard.module.css';

function MatchedGigCard({ gig }) {
  if (!gig) return null;
  const provider = gig.providerInfo;
  return (
    <li className="list-item-card">
      {' '}
      {/* Add class */}
      <h4>
        <Link to={`/gigs/${gig._id}`}>{gig.title}</Link>
      </h4>
      <p>Category: {gig.category}</p>
      <p>
        {gig.isHourly 
          ? `Rate: $${gig.ratePerHour || 0}/hr${gig.estimatedHours ? ` (Est. ${gig.estimatedHours}h)` : ''}`
          : `Cost: $${gig.cost || 0}`
        }
      </p>
      <p>Status: {gig.status}</p>
      {provider && (
        <div className={styles.providerInfo}>
          <div className="flex-container">
            {' '}
            {/* Use flexbox */}
            <img
              src={provider.profileImage || '/default.jpg'}
              alt={`${provider.fullName}'s profile`}
              className="avatar-small"
            />
            <div>
              <strong>Provider:</strong> {provider.fullName} (
              {provider.rating?.toFixed(1)}⭐) <br />
              <small className="text-muted">
                Pref: &quot;{provider.peoplePreference || 'N/A'}&quot; |
                Hobbies: {provider.hobbies?.join(', ') || 'N/A'}
              </small>
            </div>
          </div>
        </div>
      )}
      <small className="text-muted">
        (Match Score: {gig.matchScore?.toFixed(2)})
      </small>
    </li>
  );
}

MatchedGigCard.propTypes = {
  gig: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    category: PropTypes.string,
    cost: PropTypes.number,
    status: PropTypes.string,
    matchScore: PropTypes.number,
    providerInfo: PropTypes.shape({
      profileImage: PropTypes.string,
      fullName: PropTypes.string,
      rating: PropTypes.number,
      peoplePreference: PropTypes.string,
      hobbies: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
};

export default MatchedGigCard;
