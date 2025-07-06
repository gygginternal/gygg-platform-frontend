// src/components/ProfilePage/AboutSection.js
import { useState, useEffect } from 'react';
import styles from './AboutSection.module.css';
import { useAuth } from '../../contexts/AuthContext'; // For loggedInUser details if needed for save
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';
import { useToast } from '../../contexts/ToastContext';
import PropTypes from 'prop-types';

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

function AboutSection({ userToDisplay, isOwnProfile, onUpdate }) {
  // Accept props
  const { user: _loggedInUser } = useAuth(); // Still need for auth check on save
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const showToast = useToast();

  // Initialize displayBio and editedBio when userToDisplay changes
  const displayBio = userToDisplay?.bio
    ? decodeHTMLEntities(userToDisplay.bio)
    : '';

  useEffect(() => {
    if (isOwnProfile && userToDisplay) {
      // Only set for editing own profile
      setEditedBio(displayBio);
    }
  }, [userToDisplay, isOwnProfile, displayBio]); // Add displayBio to reset if it changes externally

  const openModal = () => {
    if (!isOwnProfile || !userToDisplay) return; // Can only edit own profile
    setEditedBio(displayBio); // Ensure modal has current decoded bio for editing
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal();

  const handleSave = async () => {
    if (!isOwnProfile || !userToDisplay) return; // Should not be callable if not own profile
    setSaveLoading(true);
    const trimmedBio = editedBio.trim();

    try {
      logger.debug(
        `AboutSection: Saving bio update for user ${userToDisplay?._id}:`,
        { bio: trimmedBio }
      );
      await apiClient.patch('/users/updateMe', { bio: trimmedBio });
      logger.info(`Bio updated successfully for user: ${userToDisplay?._id}`);
      showToast('Bio updated!', { type: 'success' });
      closeModal();
      if (onUpdate) onUpdate();
    } catch (err) {
      logger.error('Error saving bio:', err.response?.data || err.message, {
        userId: userToDisplay?._id,
      });
      showToast(
        `Error saving bio: ${err.response?.data?.message || 'Please try again.'}`,
        { type: 'error' }
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleImageError = e => {
    e.target.style.display = 'none';
  };

  if (!userToDisplay) {
    return (
      <section className={styles.aboutCard}>
        <p>Loading about information...</p>
      </section>
    );
  }

  return (
    <section className={styles.aboutCard}>
      <div className={styles.aboutHeader}>
        <h2>About {isOwnProfile ? 'Me' : userToDisplay.firstName || 'User'}</h2>
        {/* Show Edit button only if it's the user's own profile */}
        {isOwnProfile && (
          <button
            onClick={openModal}
            className={styles.editButton}
            aria-label="Edit Bio"
          >
            <img
              src="/assets/edit.svg"
              alt="Edit"
              className={styles.editIcon}
              onError={handleImageError}
            />
          </button>
        )}
      </div>

      <div className={styles.aboutContent}>
        {displayBio ? (
          <p className={styles.bioContent}>{displayBio}</p>
        ) : (
          <div className={styles.noBio}>
            <p>
              {isOwnProfile
                ? 'Share a bit about yourself...'
                : "This user hasn't added a bio yet."}
            </p>
            {isOwnProfile && (
              <button className={styles.addButton} onClick={openModal}>
                Add Bio
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal for Editing/Adding Bio - Render only if isOwnProfile and modal is open */}
      {isOwnProfile && isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{displayBio ? 'Edit Bio' : 'Add Bio'}</h3>
              <button
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Close edit bio modal"
              >
                ✖
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalPrompt}>
                Use this space to tell everyone a bit about yourself.
              </p>
              <label htmlFor="bio-textarea" className={styles.srOnly}>
                Bio content
              </label>
              <textarea
                id="bio-textArea"
                className={styles.textArea}
                value={editedBio}
                onChange={e => setEditedBio(e.target.value)}
                rows={8}
                placeholder="Tell everyone a bit about yourself..."
                maxLength={750}
                disabled={saveLoading}
              />
              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={saveLoading}
                >
                  Cancel
                </button>
                <button
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Saving...' : 'Save Bio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

AboutSection.propTypes = {
  userToDisplay: PropTypes.object,
  isOwnProfile: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func,
};

export default AboutSection;
