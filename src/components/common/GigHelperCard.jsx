import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import styles from './GigHelperCard.module.css';

const GigHelperCard = ({
  userId,
  profileImage = '/default.jpg',
  name = '',
  rate = '',
  location = '',
  bio = '',
}) => {
  const navigate = useNavigate();
  const handleMessage = () => {
    navigate(`/messages/${userId}`);
  };
  return (
    <div className={styles.card}>
      <div className={styles.profileSection}>
        <img src={profileImage} alt={name} className={styles.profileImage} />
        <div className={styles.profileInfo}>
          <div className={styles.headerRow}>
            <span className={styles.name}>{name}</span>
            <div className={styles.profileActions}>
              <Link
                to={`/user-profile/${userId}`}
                className={styles.viewProfileLink}
              >
                View Profile
              </Link>
              <button className={styles.messageButton} onClick={handleMessage}>
                Message
              </button>
            </div>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.rate}>{rate}</span>
            <span className={styles.location}>
              <MapPin size={16} /> {location}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.bio}>{bio}</div>
    </div>
  );
};

GigHelperCard.propTypes = {
  userId: PropTypes.string,
  profileImage: PropTypes.string,
  name: PropTypes.string,
  rate: PropTypes.string,
  location: PropTypes.string,
  bio: PropTypes.string,
};

export default GigHelperCard;
