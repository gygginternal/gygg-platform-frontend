import React from 'react';
import styles from './ProviderProfileInfo.module.css';
import { MapPin } from 'lucide-react';

function ProviderProfileInfo({ userToDisplay }) {
  if (!userToDisplay) return null;
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileImageWrapper}>
        {userToDisplay.profileImage ? (
          <img
            src={userToDisplay.profileImage}
            alt="avatar"
            className={styles.profileImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder} />
        )}
      </div>
      <div className={styles.profileInfoContent}>
        <div className={styles.profileName}>
          {userToDisplay.firstName} {userToDisplay.lastName}
        </div>
        {userToDisplay.location && (
          <div className={styles.profileLocation}>
            <MapPin size={18} className={styles.locationIcon} />
            <span>{userToDisplay.location}</span>
          </div>
        )}
        {userToDisplay.bio && (
          <div className={styles.profileBio}>{userToDisplay.bio}</div>
        )}
      </div>
    </div>
  );
}

export default ProviderProfileInfo;
