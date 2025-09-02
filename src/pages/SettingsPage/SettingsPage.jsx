// src/pages/SettingsPage/SettingsPage.jsx
import React, { useState } from 'react';
import styles from './SettingsPage.module.css';
import PersonalInfoForm from '../../components/Shared/PersonalInfoForm';
import { StripeConnectOnboarding } from '../../components/StripeConnectOnboarding';
import tabsStyles from './SettingsTabs.module.css';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.settingsContainer}>
      <div className={tabsStyles.tabsContainer}>
        <div className={tabsStyles.tabs}>
          <button
            className={`${tabsStyles.tab} ${activeTab === 'profile' ? tabsStyles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Personal Information
          </button>
          <button
            className={`${tabsStyles.tab} ${activeTab === 'payment' ? tabsStyles.activeTab : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            Payment Information
          </button>
        </div>
        
        <div className={tabsStyles.tabContent}>
          {activeTab === 'profile' && (
            <div className={tabsStyles.tabPanel}>
              <PersonalInfoForm />
            </div>
          )}
          
          {activeTab === 'payment' && (
            <div className={tabsStyles.tabPanel}>
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