// src/components/Shared/PersonalInfoForm.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './PersonalInfoForm.module.css';
import logger from '../../utils/logger';
import PropTypes from 'prop-types';

function PersonalInfoForm({ fullWidth = false }) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handlePersonalInfoChange = e => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = e => {
    const { name, value } = e.target;
    setPasswordInfo(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setLoading(true);
    let profileUpdated = false;
    let passwordAttempted = false;
    let passwordUpdated = false;
    let encounteredError = false;

    // Prepare payload for personal information update
    const addressPayload = {
      street: personalInfo.address.trim(),
      city: personalInfo.city.trim(),
      state: personalInfo.state.trim(),
      postalCode: personalInfo.postalCode.trim(),
      country: personalInfo.country.trim(),
    };

    const hasAddressData = Object.values(addressPayload).some(val => val);

    const personalPayload = {
      firstName: personalInfo.firstName.trim(),
      lastName: personalInfo.lastName.trim(),
    };

    if (hasAddressData) {
      personalPayload.address = addressPayload;
    }

    // Update personal information if there are changes
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
    }

    // Handle password update if provided
    if (passwordInfo.newPassword.trim()) {
      passwordAttempted = true;
      if (!passwordInfo.currentPassword) {
        setError('Current password is required to change password.');
        encounteredError = true;
      } else if (passwordInfo.newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        encounteredError = true;
      } else if (passwordInfo.newPassword !== passwordInfo.confirmNewPassword) {
        setError('New passwords do not match.');
        encounteredError = true;
      } else {
        try {
          const passwordPayload = {
            passwordCurrent: passwordInfo.currentPassword,
            password: passwordInfo.newPassword,
            passwordConfirm: passwordInfo.confirmNewPassword,
          };
          await apiClient.patch('/users/updateMyPassword', passwordPayload);
          setSuccess('Password updated successfully!');
          setPasswordInfo({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          });
          passwordUpdated = true;
        } catch (err) {
          logger.error('Error updating password:', err);
          setError(err.response?.data?.message || 'Failed to update password.');
          encounteredError = true;
        }
      }
    } else if (
      passwordInfo.currentPassword ||
      passwordInfo.confirmNewPassword
    ) {
      passwordAttempted = true;
      setError(
        'Please enter and confirm the new password if you wish to change it.'
      );
      encounteredError = true;
    }

    if (!encounteredError && (profileUpdated || passwordUpdated)) {
      setSuccess('All changes saved successfully!');
    } else if (profileUpdated && !encounteredError && !passwordAttempted) {
      setSuccess('Personal information saved successfully!');
    }

    setLoading(false);
  };

  return (
    <div
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} card`}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.tabContent}>
          <div className={styles.inputGroup}>
            <label htmlFor="p-firstName">First Name</label>
            <input
              id="p-firstName"
              name="firstName"
              value={personalInfo.firstName}
              onChange={handlePersonalInfoChange}
              placeholder="Enter your first name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="p-lastName">Last Name</label>
            <input
              id="p-lastName"
              name="lastName"
              value={personalInfo.lastName}
              onChange={handlePersonalInfoChange}
              placeholder="Enter your last name"
            />
          </div>

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

          {!user?.role?.includes('tasker') && (
            <>
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
            </>
          )}

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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

PersonalInfoForm.propTypes = {
  fullWidth: PropTypes.bool,
};

export default PersonalInfoForm;
