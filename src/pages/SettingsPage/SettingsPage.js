// src/pages/SettingsPage/SettingsPage.js
// import React from 'react';
import styles from './SettingsPage.module.css'; // Create this CSS Module
import PersonalInfoForm from '../../components/SettingsPage/PersonalInfoForm'; // Adjust path
// Import other settings components like NotificationSettings, SecuritySettings later

function SettingsPage() {
  return (
    <div className={styles.settingsContainer}>
      <PersonalInfoForm />
      {/* <NotificationSettings /> */}
      {/* <SecuritySettings /> */}
    </div>
  );
}

export default SettingsPage;
