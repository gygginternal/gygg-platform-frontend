import React from 'react';
// import cn from "classnames"; // For conditional classnames
import styles from './ProfileSidebar.module.css'; // Your CSS module
import { Link } from 'react-router-dom'; // Use react-router Link
import { useAuth } from '../context/AuthContext'; // Adjust path
import RecommendedGigs from './RecommendedGigs'; // Import the new component
import RecommendedAppliances from './RecommendedAppliances';
import AwaitedPostedGigs from './AwaitedPostedGigs'; // Import the AwaitedPostedGigs component
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import PropTypes from 'prop-types';

function ProfileSidebar() {
  const { user } = useAuth(); // Get logged-in user data

  // User's skills/gigs they offer - should come from user profile
  const userSkills = user?.skills || ['Pet Sitting', 'Gardening']; // Example fallback

  // Fetch top 3 matching gigs for taskers
  const { data: topMatchedGigs, isLoading: isLoadingTopGigs } = useQuery({
    queryKey: ['topMatchedGigs'],
    queryFn: async () => {
      const response = await apiClient.get('/gigs/top-match');
      return response.data.data;
    },
    enabled: user?.role?.includes('tasker'), // Only fetch if user is a tasker
  });

  if (!user) {
    return (
      <aside className={styles.profileSidebar}>
        <p>Loading profile...</p>
      </aside>
    );
  }

  const iCanHelp = (
    <section className={styles.gigsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img src="/assets/lamp-on.svg" alt="Lamp" width={20} height={20} />
        </div>
        <h4 className={styles.sectionTitle}>Gigs I can help you with</h4>
      </div>
      <div className={styles.gigTags}>
        {userSkills.length > 0 ? (
          userSkills.map((gig, index) => (
            <span key={index} className={styles.skillTag}>
              {gig}
            </span>
          ))
        ) : (
          <p className={styles.addSkillsMessage}>Add skills in your profile!</p>
        )}
      </div>
    </section>
  );

  // New section for top 3 matching gigs for taskers
  const topMatchingGigs = (
    <section className={styles.gigsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img src="/assets/star.svg" alt="Star" width={20} height={20} />
        </div>
        <h4 className={styles.sectionTitle}>Top Matching Gigs</h4>
      </div>
      {isLoadingTopGigs ? (
        <p>Loading top matching gigs...</p>
      ) : topMatchedGigs && topMatchedGigs.length > 0 ? (
        <ul className={styles.gigList}>
          {topMatchedGigs.map(gig => (
            <li key={gig._id} className={styles.gigItem}>
              <Link to={`/gigs/${gig._id}`} className={styles.gigLink}>
                {gig.title}
              </Link>
              <p>Category: {gig.category}</p>
              <p>Cost: ${gig.cost}</p>
              <p>Match Score: {gig.matchScore?.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No matching gigs found.</p>
      )}
    </section>
  );

  return (
    <aside className={styles.profileSidebar}>
      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <img
            src={user.profileImage || '/default.jpg'}
            alt="Profile"
            width={64}
            height={64}
            className={styles.profileImage}
          />
          <div>
            <h3 className={styles.profileName}>
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </h3>
            <Link to="/profile" className={styles.viewProfileLink}>
              View Profile
            </Link>
          </div>
        </div>

        {/* Render Recommended Gigs Section if user is a provider */}
        {user.role?.includes('provider') && (
          <>
            <AwaitedPostedGigs />
            <RecommendedAppliances />
          </>
        )}

        {/* Render Recommended Gigs Section if user is a tasker */}
        {user.role?.includes('tasker') && (
          <>
            {iCanHelp}
            <RecommendedGigs />
          </>
        )}
      </div>
    </aside>
  );
}

ProfileSidebar.propTypes = {
  // No props to add PropTypes for, but ensure accessibility and remove unused imports if any.
};

export default ProfileSidebar;
