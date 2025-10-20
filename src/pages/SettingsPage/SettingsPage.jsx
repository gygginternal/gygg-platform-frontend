// src/pages/SettingsPage/SettingsPage.jsx
import React, { useState } from 'react';
import styles from './SettingsPage.module.css';
import PersonalInfoForm from '../../components/common/PersonalInfoForm';
import { StripeConnectOnboarding } from '../../components/common/StripeConnectOnboarding';
import { NuveiOnboarding } from '../../components/common/NuveiOnboarding';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

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
                <p>Manage your payment methods and account settings.</p>
                
                {/* Stripe Payment Method */}
                <div className={styles.paymentMethodSection}>
                  <h3>Credit/Debit Cards (Global)</h3>
                  <p>Process payments from customers worldwide</p>
                  <StripeConnectOnboarding />
                </div>
                
                {/* Nuvei Payment Method */}
                <div className={styles.paymentMethodSection}>
                  <h3>Bank Transfers (Canada)</h3>
                  <p>Direct CAD transfers via InstaDebit</p>
                  <NuveiOnboarding />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
