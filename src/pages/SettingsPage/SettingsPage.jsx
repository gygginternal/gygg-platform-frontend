// src/pages/SettingsPage/SettingsPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import the AuthContext
import styles from './SettingsPage.module.css';
import PersonalInfoForm from '../../components/common/PersonalInfoForm';
import { StripeConnectOnboarding } from '../../components/common/StripeConnectOnboarding';

function SettingsPage() {
  const { sessionRole } = useAuth(); // Get the user's session role
  const [activeTab, setActiveTab] = useState('profile');

  // Payment tab should only be shown for taskers, not providers
  const showPaymentTab = sessionRole === 'tasker';

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.content}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Personal Information
            </button>
            {showPaymentTab && (
              <button
                className={`${styles.tab} ${activeTab === 'payment' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                Payment Information
              </button>
            )}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'profile' && (
              <div className={styles.noBox}>
                <PersonalInfoForm />
              </div>
            )}

            {activeTab === 'payment' && showPaymentTab && (
              <div className={styles.tabPanel}>
                <StripeConnectOnboarding />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
