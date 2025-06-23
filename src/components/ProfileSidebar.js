// import cn from "classnames"; // For conditional classnames
import styles from './ProfileSidebar.module.css'; // Your CSS module
import { Link } from 'react-router-dom'; // Use react-router Link
import { useAuth } from '../context/AuthContext'; // Adjust path
import RecommendedGigs from './RecommendedGigs'; // Import the new component
import RecommendedAppliances from './RecommendedAppliances';
import AwaitedPostedGigs from './AwaitedPostedGigs'; // Import the AwaitedPostedGigs component
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import { useState } from 'react';

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

  // New section for people needing help (Figma-style)
  const peopleNeedHelp = [
    {
      name: 'Ariana. A from Thornhill needs a dog sitter',
      avatar: '/default.jpg',
      detail: 'View task detail',
      link: '#',
    },
    {
      name: 'Lia.T is from Thornhill needs a grocery Shopper',
      avatar: '/default.jpg',
      detail: 'View task detail',
      link: '#',
    },
    {
      name: 'Wilson. H from Richmondhill needs a furniture assembler',
      avatar: '/default.jpg',
      detail: 'View task detail',
      link: '#',
    },
  ];

  const peopleNeedHelpSection = (
    <section className={styles.helpSection}>
      <div className={styles.helpHeader}>
        <span className={styles.helpTitle}>3 People need your help</span>
      </div>
      <ul className={styles.helpList}>
        {peopleNeedHelp.map((person, idx) => (
          <li key={idx} className={styles.helpItem}>
            <img
              src={person.avatar}
              alt={person.name}
              className={styles.helpAvatar}
            />
            <div className={styles.helpInfo}>
              <span className={styles.helpName}>{person.name}</span>
              <a href={person.link} className={styles.helpDetailLink}>
                {person.detail}
              </a>
            </div>
          </li>
        ))}
      </ul>
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
            {peopleNeedHelpSection}
            <RecommendedGigs />
          </>
        )}
      </div>
    </aside>
  );
}

export default ProfileSidebar;
