// src/pages/SettingsPage/SettingsPage.jsx
import React, { useState } from 'react';
import styles from './SettingsPage.module.css';
import PersonalInfoForm from '../../components/Shared/PersonalInfoForm';
import { StripeConnectOnboarding } from '../../components/StripeConnectOnboarding';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Personal Information
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'payment' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            Payment Information
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'profile' && (
            <div className={styles.noBox}>
              <PersonalInfoForm />
            </div>
          )}

          {activeTab === 'payment' && (
            <div className={styles.tabPanel}>
              <h2>Payment Information</h2>
              <p>Manage your payment methods and Stripe account settings.</p>
              <StripeConnectOnboarding />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
