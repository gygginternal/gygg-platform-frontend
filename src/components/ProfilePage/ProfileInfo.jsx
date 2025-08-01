// frontend/src/components/ProfilePage/ProfileInfo.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './ProfileInfo.module.css'; // Ensure this CSS Module exists and is styled correctly
import apiClient from '../../api/axiosConfig'; // Adjust path if necessary
import logger from '../../utils/logger'; // Optional: Adjust path if necessary
import { useToast } from '../../contexts/ToastContext';
import PropTypes from 'prop-types';
import { AutoComplete } from '../Shared/AutoComplete';
import { HOBBIES_OPTIONS, SKILL_OPTIONS } from '../../utils/constants';

// Helper function to decode HTML entities (if bio or other text fields might have them from backend)
const decodeHTMLEntities = text => {
  if (typeof text !== 'string' || !text) return '';
  try {
    const element = document.createElement('div');
    element.innerHTML = text; // Browser decodes entities when setting innerHTML
    return element.textContent || element.innerText || '';
  } catch (e) {
    // This might happen in non-browser environments (e.g., SSR pre-render without DOM)
    // For client-side React, document.createElement should always be available.
    logger.error('Error decoding HTML entities:', e);
    return text; // Fallback to original text
  }
};

// This component is designed to be used on the logged-in user's own profile/dashboard page.
// If you want to display *another* user's profile, you'd create a separate component
// or modify this one to accept a `userIdToView` prop and fetch that user's data.
function ProfileInfo({ userToDisplay, isOwnProfile, onProfileUpdate, showMessageButton, onMessageClick }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for editable fields within the modal
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedHobbies, setEditedHobbies] = useState('');
  const [editedSkills, setEditedSkills] = useState('');
  const [editedAddress, setEditedAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const { showToast } = useToast();

  // Populate form state with user data when the userToDisplay prop changes
  useEffect(() => {
    if (userToDisplay) {
      logger.debug(
        'ProfileInfo: Populating edit form with user data:',
        userToDisplay
      );
      setEditedFirstName(userToDisplay.firstName || '');
      setEditedLastName(userToDisplay.lastName || '');
      setEditedBio(decodeHTMLEntities(userToDisplay.bio) || '');
      setEditedHobbies(
        Array.isArray(userToDisplay.hobbies)
          ? userToDisplay.hobbies.join(', ')
          : ''
      );
      setEditedSkills(
        Array.isArray(userToDisplay.skills)
          ? userToDisplay.skills.join(', ')
          : ''
      );
      setEditedAddress(
        userToDisplay.address
          ? { ...userToDisplay.address }
          : { street: '', city: '', state: '', postalCode: '', country: '' }
      );
      setProfileImagePreview(
        userToDisplay.profileImage &&
          userToDisplay.profileImage !== 'default.jpg'
          ? userToDisplay.profileImage
          : null
      );
      setProfileImageFile(null);
    }
  }, [userToDisplay]);

  const openModal = () => {
    if (!isOwnProfile || !userToDisplay) return;
    setEditedFirstName(userToDisplay.firstName || '');
    setEditedLastName(userToDisplay.lastName || '');
    setEditedBio(decodeHTMLEntities(userToDisplay.bio) || '');
    setEditedHobbies(userToDisplay.hobbies?.join(', ') || '');
    setEditedSkills(userToDisplay.skills?.join(', ') || '');
    setEditedAddress(
      userToDisplay.address
        ? { ...userToDisplay.address }
        : { street: '', city: '', state: '', postalCode: '', country: '' }
    );
    setProfileImagePreview(
      userToDisplay.profileImage && userToDisplay.profileImage !== 'default.jpg'
        ? userToDisplay.profileImage
        : null
    );
    setProfileImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal(); // Could also reset edited fields to `user` data

  // Handler for new profile image selection
  const handleProfileImageFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit example
        setError('Profile image must be less than 5MB.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Please select JPG, PNG, or WEBP.');
        return;
      }
      setProfileImageFile(file); // Store the File object
      // Create a temporary URL for client-side preview
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview); // Revoke previous blob URL
      }
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Cleanup blob URL when component unmounts or if the preview URL (that is a blob) changes
  useEffect(() => {
    const currentPreview = profileImagePreview; // Capture value for cleanup
    return () => {
      if (currentPreview && currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
        logger.debug(
          'Revoked blob URL for profile image preview:',
          currentPreview
        );
      }
    };
  }, [profileImagePreview]);

  const triggerFileInput = () => {
    fileInputRef.current?.click(); // Programmatically click the hidden file input
  };

  const handleSave = async () => {
    if (!userToDisplay) return; // Should be caught by UI, but good check
    setSaveLoading(true);

    const payload = new FormData(); // Use FormData because we might send a file

    // Append standard text fields
    payload.append('firstName', editedFirstName.trim());
    payload.append('lastName', editedLastName.trim());

    // Convert comma-separated strings for hobbies/skills back to arrays for backend
    (Array.isArray(editedHobbies)
      ? editedHobbies
      : editedHobbies
          .split(',')
          .map(h => h.trim())
          .filter(h => h)
    ).forEach(hobby => payload.append('hobbies[]', hobby));
    (Array.isArray(editedSkills)
      ? editedSkills
      : editedSkills
          .split(',')
          .map(s => s.trim())
          .filter(s => s)
    ).forEach(skill => payload.append('skills[]', skill));

    // Append profile image file IF a new one was selected by the user
    if (profileImageFile) {
      payload.append('profileImage', profileImageFile, profileImageFile.name);
    }
    // Note: The backend `updateMe` controller needs `uploadS3.single('profileImage')` middleware.

    logger.debug(
      'Saving profile updates with FormData:',
      Object.fromEntries(payload.entries())
    ); // For debugging FormData

    try {
      await apiClient.patch('/users/updateMe', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Axios sets this for FormData, but explicit is fine
      });
      logger.info(
        'ProfileInfo saved successfully for user:',
        userToDisplay._id
      );
      showToast('Profile updated successfully!', { type: 'success' });
      setProfileImageFile(null); // Clear the selected file state after successful upload
      closeModal();
      if (onProfileUpdate) onProfileUpdate(); // Refresh user data in AuthContext
    } catch (err) {
      logger.error(
        'Error saving ProfileInfo:',
        err.response?.data || err.message,
        { userId: userToDisplay._id }
      );
      showToast(
        `Error saving profile: ${err.response?.data?.message || 'Please try again.'}`,
        { type: 'error' }
      );
      // Keep modal open for user to see error and retry if desired
    } finally {
      setSaveLoading(false);
    }
  };

  // Fallback for profile images in the main display area
  const handleDisplayImageError = e => {
    e.currentTarget.src = '/default.jpg';
  };

  // If user data is not yet available from context (e.g., initial load)
  if (!userToDisplay) {
    return (
      <section className={styles.profileCard}>
        <p>Loading profile information...</p>
      </section>
    );
  }

  // Prepare values for display (using decoded bio)
  const displayName =
    userToDisplay.fullName ||
    `${userToDisplay.firstName || ''} ${userToDisplay.lastName || ''}`.trim();
  const _displayBioInAboutSection = userToDisplay.bio
    ? decodeHTMLEntities(userToDisplay.bio)
    : 'No bio provided yet.';
  const displayHobbiesString =
    Array.isArray(userToDisplay.hobbies) && userToDisplay.hobbies.length > 0
      ? userToDisplay.hobbies.join(', ')
      : 'No hobbies listed yet.';
  const displaySkillsArray = Array.isArray(userToDisplay.skills)
    ? userToDisplay.skills
    : [];

  // Enhanced location extraction similar to TaskerListSafe
  let displayLocation = 'Location not set';
  

  
  if (userToDisplay.address && Object.values(userToDisplay.address).some(val => val)) {
    const parts = [];
    if (userToDisplay.address.city) parts.push(userToDisplay.address.city);
    if (userToDisplay.address.state) parts.push(userToDisplay.address.state);
    if (userToDisplay.address.country) parts.push(userToDisplay.address.country);
    
    if (parts.length > 0) {
      displayLocation = parts.join(', ');
    }
  } else if (userToDisplay.location) {
    // Fallback to location field if address is not available
    displayLocation = typeof userToDisplay.location === 'string' 
      ? userToDisplay.location 
      : userToDisplay.location.city || userToDisplay.location.state || 'Location not set';
  } else if (userToDisplay.city || userToDisplay.state) {
    // Fallback to direct city/state fields
    const parts = [];
    if (userToDisplay.city) parts.push(userToDisplay.city);
    if (userToDisplay.state) parts.push(userToDisplay.state);
    displayLocation = parts.join(', ');
  }

  return (
    <section className={styles.profileCard}>
      <div className={styles.profileHeader}>
        {isOwnProfile && (
          <button
            onClick={openModal}
            className={styles.editButton}
            aria-label="Edit Profile Information"
          >
            <img
              src="/assets/edit.svg"
              alt="Edit"
              className={styles.editIcon}
              onError={handleDisplayImageError}
            />
          </button>
        )}
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileImageContainer}>
          <img
            src={
              userToDisplay.profileImage &&
              userToDisplay.profileImage !== 'default.jpg'
                ? userToDisplay.profileImage
                : '/default.jpg'
            }
            alt={`${displayName}'s profile`}
            className={styles.profileImage}
            onError={handleDisplayImageError}
          />
        </div>

        <div className={styles.profileDetails}>
          <h1 className={styles.profileName}>{displayName}</h1>
          <p className={styles.profileServices}>
            <strong>Hobbies:</strong> {displayHobbiesString}
          </p>
          {displayLocation && displayLocation !== 'Location not set' && (
            <div className={styles.profileLocation}>
              <img
                src="/assets/location.svg"
                alt="Location"
                className={styles.locationIcon}
              />
              <span>{displayLocation}</span>
            </div>
          )}
          {showMessageButton && (
            <button
              onClick={onMessageClick}
              className={styles.messageButton}
              aria-label={`Send message to ${displayName}`}
            >
              Message Tasker
            </button>
          )}
        </div>

        <div className={styles.skillsContainer}>
          <h2 className={styles.skillsTitle}>Skills</h2>
          <div className={styles.skillsList}>
            {displaySkillsArray.length > 0 ? (
              displaySkillsArray.map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ))
            ) : (
              <p className={styles.noSkills}>Add your skills to get noticed!</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Profile Information</h3>
              <button
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Close edit modal"
              >
                ✖
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Profile Image Upload Section */}
              <label htmlFor="profileImage" className={styles.rowLabel}>
                Profile Picture:
              </label>
              <div className={styles.imageUploadContainerModal}>
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile Preview"
                    className={styles.profileImagePreview}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    No Image Selected
                  </div>
                )}
                <input
                  type="file"
                  id="profileImage"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleProfileImageFileChange}
                  accept="image/jpeg,image/png,image/webp"
                />
                <div
                  style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}
                >
                  <button
                    onClick={triggerFileInput}
                    className={styles.chooseImageButton}
                    style={{ backgroundColor: '#2c3a40', color: '#fff' }}
                    disabled={saveLoading}
                  >
                    Choose Image
                  </button>
                  {profileImagePreview && (
                    <button
                      onClick={() => {
                        setProfileImagePreview(null);
                        setProfileImageFile(null);
                      }}
                      className={styles.removeImageButton}
                      disabled={saveLoading}
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Fields */}
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.rowLabel}>
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={styles.textInput}
                  value={editedFirstName}
                  onChange={e => setEditedFirstName(e.target.value)}
                  placeholder="First Name"
                  disabled={saveLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.rowLabel}>
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={styles.textInput}
                  value={editedLastName}
                  onChange={e => setEditedLastName(e.target.value)}
                  placeholder="Last Name"
                  disabled={saveLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <AutoComplete
                  label="Hobbies:"
                  options={HOBBIES_OPTIONS}
                  values={
                    Array.isArray(editedHobbies)
                      ? editedHobbies
                      : editedHobbies
                          .split(',')
                          .map(h => h.trim())
                          .filter(Boolean)
                  }
                  onChange={newHobbies => setEditedHobbies(newHobbies)}
                  placeholder="Add hobbies..."
                />
              </div>

              <div className={styles.formGroup}>
                <AutoComplete
                  label="Skills:"
                  options={SKILL_OPTIONS}
                  values={
                    Array.isArray(editedSkills)
                      ? editedSkills
                      : editedSkills
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean)
                  }
                  onChange={newSkills => setEditedSkills(newSkills)}
                  placeholder="Add skills..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={saveLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={styles.saveButton}
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

ProfileInfo.propTypes = {
  userToDisplay: PropTypes.object,
  isOwnProfile: PropTypes.bool,
  onProfileUpdate: PropTypes.func,
  showMessageButton: PropTypes.bool,
  onMessageClick: PropTypes.func,
};

export default ProfileInfo;
