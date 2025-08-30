// src/components/Settings/PersonalInfoForm.js
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './PersonalInfoForm.module.css';
import FormInput from './FormInput';
import CountrySelect from './CountrySelect';
import CountryCodeSelect from './CountryCodeSelect';
import AddressInput from './AddressInput';
import logger from '../../utils/logger';
import { StripeEmbeddedOnboarding } from '../StripeEmbeddedOnboarding';
import PropTypes from 'prop-types';

function PersonalInfoForm() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState('');
  const [_success, setSuccess] = useState('');

  // Initialize activeTab from URL, default to 'personal'
  const initialActiveTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  // Sync activeTab state with URL query parameter
  useEffect(() => {
    // Only update URL if the tab in state is different from URL, to avoid loops
    if (activeTab !== searchParams.get('tab')) {
      setSearchParams({ tab: activeTab }, { replace: true }); // Use replace to avoid history spam
    }
  }, [activeTab, setSearchParams, searchParams]);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '', // Email for display
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setPasswordError] = useState('');
  const [success, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      logger.debug('PersonalInfoForm: Populating with user data:', user);
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || '',
      });
      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [user]);

  const handleTabClick = tabName => {
    setActiveTab(tabName);
    // Clear messages when switching tabs
    setError('');
    setSuccess('');
  };

  const handlePersonalInfoChange = e => {
    /* ... same ... */
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };
  const handlePasswordChange = e => {
    /* ... same ... */
    const { name, value } = e.target;
    setPasswordInfo(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');
    setPasswordSuccess('');

    if (activeTab !== 'personal') {
      logger.warn(
        'Save Changes clicked when Personal tab not active. No API call made.'
      );
      return;
    }

    setLoading(true);
    let profileUpdated = false;
    let passwordAttempted = false;
    let passwordUpdated = false;
    let encounteredError = false;

    // --- Prepare payload for ONLY fields that are meant to be updated in this form ---
    // Do not send email as it's read-only
    const addressPayload = {
      street: personalInfo.address.trim(),
      city: personalInfo.city.trim(),
      state: personalInfo.state.trim(),
      postalCode: personalInfo.postalCode.trim(),
      country: personalInfo.country.trim(),
    };
    // Only include address if at least one field is filled
    const hasAddressData = Object.values(addressPayload).some(val => val);

    const personalPayload = {
      firstName: personalInfo.firstName.trim(),
      lastName: personalInfo.lastName.trim(),
      // Optional: include other updatable fields from your User model like phoneNo, bio if form has them
      // hobbies: personalInfo.hobbies.split(',').map(h => h.trim()).filter(h => h),
      // skills: personalInfo.skills.split(',').map(s => s.trim()).filter(s => s),
    };
    if (hasAddressData) {
      personalPayload.address = addressPayload;
    }

    // Only send updateMe if there's something to update in personalPayload
    if (
      Object.keys(personalPayload).some(
        key =>
          personalPayload[key] !== (user[key] || '') ||
          (key === 'address' &&
            JSON.stringify(personalPayload.address) !==
              JSON.stringify(user.address || {}))
      )
    ) {
      try {
        logger.info('Updating personal info...', personalPayload);
        await apiClient.patch('/users/updateMe', personalPayload);
        setSuccess('Personal information saved.');
        profileUpdated = true;
        if (updateUser) updateUser();
      } catch (err) {
        logger.error('Error updating personal info:', err);
        setError(
          err.response?.data?.message || 'Failed to save personal info.'
        );
        encounteredError = true;
      }
    } else {
      logger.info('No changes detected in personal information to save.');
      // Optionally set a message like "No changes to save in personal info."
    }

    if (passwordInfo.newPassword.trim()) {
      passwordAttempted = true;
      if (!passwordInfo.currentPassword) {
        /* ... setPasswordError ... */ encounteredError = true;
      } else if (passwordInfo.newPassword.length < 8) {
        /* ... setPasswordError ... */ encounteredError = true;
      } else if (passwordInfo.newPassword !== passwordInfo.confirmNewPassword) {
        /* ... setPasswordError ... */ encounteredError = true;
      } else {
        try {
          /* ... apiClient.patch('/users/updateMyPassword', ...) ... */
          const passwordPayload = {
            /* ... */
          };
          await apiClient.patch('/users/updateMyPassword', passwordPayload);
          setPasswordSuccess('Password updated!');
          setPasswordInfo({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          });
          passwordUpdated = true;
        } catch (err) {
          /* ... setPasswordError ... */ encounteredError = true;
        }
      }
    } else if (
      passwordInfo.currentPassword ||
      passwordInfo.confirmNewPassword
    ) {
      passwordAttempted = true;
      setPasswordError(
        'Please enter and confirm the new password if you wish to change it.'
      );
      encounteredError = true;
    }

    if (!encounteredError && (profileUpdated || passwordUpdated)) {
      setSuccess('All changes saved successfully!');
    } else if (profileUpdated && !encounteredError && !passwordAttempted) {
      // If only profile was updated and no password attempt was made
      setSuccess('Personal information saved successfully!');
    }
    // Error messages are displayed where they occur

    setLoading(false);
  };

  // renderStripeSection should be defined or imported if used
  const renderStripeSection = () => {
    // Conditionally render StripeEmbeddedOnboarding only if user is a tasker or provider
    if (user?.role?.includes('tasker') || user?.role?.includes('provider')) {
      return <StripeEmbeddedOnboarding />;
    }
    return <p>Payment information is only applicable for Taskers and Providers.</p>; // Or null
  };

  return (
    <div className={`${styles.container} card`}>
      <div style={{ padding: '10px', backgroundColor: '#e0e0e0', margin: '10px 0', borderRadius: '4px' }}>
        <p>Debug: Active Tab = {activeTab}</p>
        <p>Debug: User Roles = {user?.role?.join(', ') || 'No roles'}</p>
        <p>Debug: Can see Withdraw tab = {user?.role?.includes('tasker') ? 'Yes' : 'No'}</p>
        <p>Debug: Can see Payment tab = {user?.role?.includes('provider') ? 'Yes' : 'No'}</p>
      </div>
      
      <div className={styles.tabs}>
        <div
          className={
            activeTab === 'personal' ? styles.activeTab : styles.inactiveTab
          }
          onClick={() => handleTabClick('personal')} // Use handler to clear messages
          role="tab"
          tabIndex={0}
          aria-selected={activeTab === 'personal'}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTabClick('personal');
            }
          }}
        >
          {' '}
          Personal Information{' '}
        </div>
        {/* Conditionally render Withdraw tab only for taskers */}
        {user?.role?.includes('tasker') && (
          <div
            className={
              activeTab === 'withdraw' ? styles.activeTab : styles.inactiveTab
            }
            onClick={() => handleTabClick('withdraw')} // Use handler
            role="tab"
            tabIndex={0}
            aria-selected={activeTab === 'withdraw'}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick('withdraw');
              }
            }}
          >
            {' '}
            Withdraw Information{' '}
          </div>
        )}
        {/* Conditionally render Payment tab only for providers */}
        {user?.role?.includes('provider') && (
          <div
            className={
              activeTab === 'payment' ? styles.activeTab : styles.inactiveTab
            }
            onClick={() => handleTabClick('payment')}
            role="tab"
            tabIndex={0}
            aria-selected={activeTab === 'payment'}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick('payment');
              }
            }}
          >
            {' '}
            Payment Information{' '}
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {activeTab === 'personal' ? (
          <div className={styles.tabContent}>
            {/* <h2>Personal Information</h2>
                        {error && <p className="error-message">{error}</p>
                        {success && <p className="success-message">{success}</p>
                        <h4 className={styles.subheading}>Basic Info</h4> */}
            <div className={styles.inputGroup}>
              <label htmlFor="p-email">Email Address</label>
              <input
                id="p-email"
                name="email"
                value={personalInfo.email}
                readOnly
                disabled
                title="Email cannot be changed here"
              />
            </div>

            <h4 className={styles.subheading}>Change Password (Optional)</h4>
            {error && <p className={styles['error-message']}>{error}</p>}
            {success && <p className={styles['success-message']}>{success}</p>}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwordInfo.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Required to change"
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordInfo.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>
            <div
              className={`${styles.inputGroup} ${styles.confirmPasswordGroup}`}
            >
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                name="confirmNewPassword"
                value={passwordInfo.confirmNewPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <h4 className={styles.subheading}>Address</h4>
            <div className={styles.inputGroup}>
              <label htmlFor="p-address">Street Address</label>
              <input
                id="p-address"
                name="address"
                value={personalInfo.address}
                onChange={handlePersonalInfoChange}
              />
            </div>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="p-city">City</label>
                <input
                  id="p-city"
                  name="city"
                  value={personalInfo.city}
                  onChange={handlePersonalInfoChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="p-state">State/Province</label>
                <input
                  id="p-state"
                  name="state"
                  value={personalInfo.state}
                  onChange={handlePersonalInfoChange}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="p-postalCode">Postal Code</label>
                <input
                  id="p-postalCode"
                  name="postalCode"
                  value={personalInfo.postalCode}
                  onChange={handlePersonalInfoChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="p-country">Country</label>
                <input
                  id="p-country"
                  name="country"
                  value={personalInfo.country}
                  onChange={handlePersonalInfoChange}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 'auto',
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Personal Info'}
              </button>
            </div>
          </div>
        ) : activeTab === 'withdraw' && user?.role?.includes('tasker') ? (
          <div className={styles.tabContent}>
            {/* <h2>Withdraw Information</h2> */}
            <div className={styles.stripeSection}>
              <h4 className={styles.subheading}>
                Payout Method (Stripe Connect)
              </h4>
              {renderStripeSection()} {/* StripeOnboarding logic is here */}
            </div>
          </div>
        ) : activeTab === 'payment' && user?.role?.includes('provider') ? (
          <div className={styles.tabContent}>
            <h4 className={styles.subheading}>
              Payment Method (Stripe Connect)
            </h4>
            <StripeEmbeddedOnboarding />
          </div>
        ) : null}
      </form>
    </div>
  );
}

PersonalInfoForm.propTypes = {
  // No props to add PropTypes for, but ensure accessibility and remove unused imports if any.
};

export default PersonalInfoForm;
