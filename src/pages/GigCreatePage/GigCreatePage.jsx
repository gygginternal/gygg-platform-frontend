// src/pages/GigCreatePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GigCreatePage.module.css'; // CSS for the page layout
// Header and main navigation Sidebar are assumed to be part of App.js global layout
// import Header from '../../components/Shared/Header';
import ProfileSidebar from '../../components/common/ProfileSidebar'; // The static info sidebar
import GigCreationForm from '../../components/features/GigCreate/GigCreationForm'; // The new modern multi-step form component

function GigCreatePage() {
  const navigate = useNavigate();

  const handleGigSuccessfullyPosted = newlyCreatedGig => {
    // This callback is passed to GigCreationForm
    // It will be called after the gig is successfully created by GigCreationForm
    navigate('/posted-gigs'); // Redirect to posted gigs page
  };

  return (
    // Structured to match PostedGigsPage layout
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.sidebarArea}>
          <ProfileSidebar />
        </div>
        <div className={styles.mainFeedArea}>
          {/* Main Content Area for Gig Creation Form */}
          <div className={styles.formArea}>
            <GigCreationForm onGigCreated={handleGigSuccessfullyPosted} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GigCreatePage;
