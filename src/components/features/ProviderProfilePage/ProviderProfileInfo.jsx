import React, { useState, useEffect, useRef } from 'react';
import styles from './ProviderProfileInfo.module.css';
import { MapPin } from 'lucide-react';
import apiClient from '@api/axiosConfig';
import { useToast } from '@contexts/ToastContext';
import logger from '@utils/logger';

// Helper function to decode HTML entities
const decodeHTMLEntities = text => {
  if (typeof text !== 'string' || !text) return '';
  try {
    const element = document.createElement('div');
    element.innerHTML = text;
    return element.textContent || element.innerText || '';
  } catch (e) {
    logger.error('Error decoding HTML entities:', e);
    return text;
  }
};

function ProviderProfileInfo({ userToDisplay, isOwnProfile, onProfileUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const { showToast } = useToast();

  // Populate form state with user data when the userToDisplay prop changes
  useEffect(() => {
    if (userToDisplay) {
      setEditedFirstName(userToDisplay.firstName || '');
      setEditedLastName(userToDisplay.lastName || '');
      setEditedBio(decodeHTMLEntities(userToDisplay.bio) || '');
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
    setProfileImagePreview(
      userToDisplay.profileImage && userToDisplay.profileImage !== 'default.jpg'
        ? userToDisplay.profileImage
        : null
    );
    setProfileImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal();

  // Handler for new profile image selection
  const handleProfileImageFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Profile image must be less than 5MB.', { type: 'error' });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showToast('Invalid file type. Please select JPG, PNG, or WEBP.', {
          type: 'error',
        });
        return;
      }
      setProfileImageFile(file);
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Cleanup blob URL when component unmounts
  useEffect(() => {
    const currentPreview = profileImagePreview;
    return () => {
      if (currentPreview && currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [profileImagePreview]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!userToDisplay) return;
    setSaveLoading(true);

    const payload = new FormData();

    // Append standard text fields
    payload.append('firstName', editedFirstName.trim());
    payload.append('lastName', editedLastName.trim());
    payload.append('bio', editedBio.trim());

    // Append profile image file IF a new one was selected
    if (profileImageFile) {
      payload.append('profileImage', profileImageFile, profileImageFile.name);
    }

    try {
      await apiClient.patch('/users/updateMe', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Profile updated successfully!', { type: 'success' });
      setProfileImageFile(null);
      closeModal();
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      logger.error('Error saving profile:', err.response?.data || err.message);
      showToast(
        `Error saving profile: ${err.response?.data?.message || 'Please try again.'}`,
        { type: 'error' }
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDisplayImageError = e => {
    e.currentTarget.src = '/default.jpg';
  };

  if (!userToDisplay) return null;

  const displayName =
    `${userToDisplay.firstName || ''} ${userToDisplay.lastName || ''}`.trim();
  const displayLocation =
    userToDisplay.address &&
    Object.values(userToDisplay.address).some(val => val)
      ? `${userToDisplay.address.city || ''}${userToDisplay.address.city && userToDisplay.address.state ? ', ' : ''}${userToDisplay.address.state || ''}${userToDisplay.address.country ? ` (${userToDisplay.address.country})` : ''}`.trim()
      : 'Location not set';

  return (
    <div className={styles.profileCard}>
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

      <div className={styles.profileImageWrapper}>
        {userToDisplay.profileImage ? (
          <img
            src={userToDisplay.profileImage}
            alt="avatar"
            className={styles.profileImage}
            onError={handleDisplayImageError}
          />
        ) : (
          <div className={styles.avatarPlaceholder} />
        )}
      </div>

      <div className={styles.profileInfoContent}>
        <div className={styles.profileName}>{displayName}</div>

        {displayLocation && displayLocation !== 'Location not set' && (
          <div className={styles.profileLocation}>
            <MapPin size={18} className={styles.locationIcon} />
            <span>{displayLocation}</span>
          </div>
        )}

        {userToDisplay.bio && (
          <div className={styles.profileBio}>
            {decodeHTMLEntities(userToDisplay.bio)}
          </div>
        )}
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
                <div className={styles.imageButtonsContainer}>
                  <button
                    onClick={triggerFileInput}
                    className={styles.chooseImageButton}
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

              {/* Name Fields */}
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

              {/* Bio Field */}
              <div className={styles.formGroup}>
                <label htmlFor="bio" className={styles.rowLabel}>
                  Bio:
                </label>
                <textarea
                  id="bio"
                  className={styles.textArea}
                  value={editedBio}
                  onChange={e => setEditedBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  disabled={saveLoading}
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
    </div>
  );
}

export default ProviderProfileInfo;
