// src/pages/GigCreatePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GigCreatePage.module.css'; // CSS for the page layout
import gigCreateFormStyles from '../../components/GigCreate/GigCreateForm.module.css';
// Header and main navigation Sidebar are assumed to be part of App.js global layout
// import Header from '../../components/Shared/Header';
import ProfileSidebar from '../../components/Shared/ProfileSidebar'; // The static info sidebar
import GigCreateForm from '../../components/GigCreate/GigCreateForm'; // The new multi-step form component

function GigCreatePage() {
  const navigate = useNavigate();

  const handleGigSuccessfullyPosted = newlyCreatedGig => {
    // This callback is passed to GigCreateForm
    // It will be called after the gig is successfully created by GigCreateForm
    navigate('/posted-gigs'); // Redirect to posted gigs page
  };

  return (
    // The outermost container for this page's specific layout
    // Assuming App.js provides top padding for the global Header
    <div className={styles.pageLayout}>
      {/* Left Sidebar (Static Profile Info or other context) */}
      <div className={styles.sidebarArea}>
        <ProfileSidebar /> {/* Or any other relevant sidebar */}
      </div>

      {/* Main Content Area for Gig Creation Form */}
      <div className={styles.formArea}>
        <div className={gigCreateFormStyles.gigCreateFormContainer}>
          <GigCreateForm onGigCreated={handleGigSuccessfullyPosted} />
        </div>
      </div>
    </div>
  );
}

export default GigCreatePage;
