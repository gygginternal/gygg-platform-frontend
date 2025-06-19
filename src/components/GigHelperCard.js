import React from 'react';
import styles from './GigHelperCard.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

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
            <Link
              to={`/user-profile/${userId}`}
              className={styles.viewProfileLink}
            >
              View Profile
            </Link>
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
      <div className={styles.actions}>
        <button className={styles.secondaryButton} onClick={handleMessage}>
          Message
        </button>
      </div>
    </div>
  );
};

export default GigHelperCard;
