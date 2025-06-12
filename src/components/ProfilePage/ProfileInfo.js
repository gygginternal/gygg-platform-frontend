// frontend/src/components/ProfilePage/ProfileInfo.js
import React, { useState, useEffect, useRef } from "react";
import styles from "./ProfileInfo.module.css"; // Ensure this CSS Module exists and is styled correctly
import { useAuth } from "../../context/AuthContext"; // Adjust path if necessary
import apiClient from "../../api/axiosConfig";   // Adjust path if necessary
import logger from "../../utils/logger";       // Optional: Adjust path if necessary

// Helper function to decode HTML entities (if bio or other text fields might have them from backend)
const decodeHTMLEntities = (text) => {
    if (typeof text !== 'string' || !text) return "";
    try {
        const element = document.createElement('div');
        element.innerHTML = text; // Browser decodes entities when setting innerHTML
        return element.textContent || element.innerText || "";
    } catch (e) {
        // This might happen in non-browser environments (e.g., SSR pre-render without DOM)
        // For client-side React, document.createElement should always be available.
        logger.error("Error decoding HTML entities:", e);
        return text; // Fallback to original text
    }
};

// This component is designed to be used on the logged-in user's own profile/dashboard page.
// If you want to display *another* user's profile, you'd create a separate component
// or modify this one to accept a `userIdToView` prop and fetch that user's data.
function ProfileInfo() {
  const { user, refreshUser } = useAuth(); // Get current logged-in user and refresh function
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for editable fields within the modal
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editedHobbies, setEditedHobbies] = useState(""); // Comma-separated string for textarea input
  const [editedSkills, setEditedSkills] = useState("");   // Comma-separated string for textarea input
  const [editedAddress, setEditedAddress] = useState({
    street: '', city: '', state: '', postalCode: '', country: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null); // Stores the selected File object
  const [profileImagePreview, setProfileImagePreview] = useState(null); // URL for image preview
  const fileInputRef = useRef(null); // Ref to programmatically click the hidden file input

  const [saveLoading, setSaveLoading] = useState(false); // Loading state for the save button

  // Populate form state with user data when the user object from context changes or on initial load
  useEffect(() => {
    if (user) {
        logger.debug("ProfileInfo: Populating edit form with user data:", user);
        setEditedFirstName(user.firstName || '');
        setEditedLastName(user.lastName || '');
        setEditedBio(decodeHTMLEntities(user.bio) || ''); // Decode for editing plain text
        setEditedHobbies(Array.isArray(user.hobbies) ? user.hobbies.join(', ') : '');
        setEditedSkills(Array.isArray(user.skills) ? user.skills.join(', ') : '');
        setEditedAddress(user.address ? { ...user.address } : { street: '', city: '', state: '', postalCode: '', country: '' });

        // Set initial preview to current profile image if it exists and isn't the default
        setProfileImagePreview(user.profileImage && user.profileImage !== 'default.jpg' ? user.profileImage : null);
        setProfileImageFile(null); // Always reset the File object itself
    }
  }, [user]); // Re-populate if the main `user` object from context changes

  const openModal = () => {
    if (!user) return; // Should not happen if component is rendered for logged-in user
    // Ensure form fields are current with user data from context when opening modal
    setEditedFirstName(user.firstName || '');
    setEditedLastName(user.lastName || '');
    setEditedBio(decodeHTMLEntities(user.bio) || '');
    setEditedHobbies(user.hobbies?.join(', ') || '');
    setEditedSkills(user.skills?.join(', ') || '');
    setEditedAddress(user.address ? { ...user.address } : { street: '', city: '', state: '', postalCode: '', country: '' });
    setProfileImagePreview(user.profileImage && user.profileImage !== 'default.jpg' ? user.profileImage : null);
    setProfileImageFile(null); // Clear any previously selected file that wasn't submitted
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal(); // Could also reset edited fields to `user` data

  // Handler for new profile image selection
  const handleProfileImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit example
            alert("Profile image must be less than 5MB.");
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert("Invalid file type. Please select JPG, PNG, or WEBP.");
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
      let currentPreview = profileImagePreview; // Capture value for cleanup
      return () => {
          if (currentPreview && currentPreview.startsWith('blob:')) {
              URL.revokeObjectURL(currentPreview);
              logger.debug("Revoked blob URL for profile image preview:", currentPreview);
          }
      };
  }, [profileImagePreview]);

  const triggerFileInput = () => {
      fileInputRef.current?.click(); // Programmatically click the hidden file input
  };

  const handleSave = async () => {
    if (!user) return; // Should be caught by UI, but good check
    setSaveLoading(true);

    const payload = new FormData(); // Use FormData because we might send a file

    // Append standard text fields
    payload.append('firstName', editedFirstName.trim());
    payload.append('lastName', editedLastName.trim());
    payload.append('bio', editedBio.trim()); // Send plain text, backend should escape/sanitize

    // Convert comma-separated strings for hobbies/skills back to arrays for backend
    editedHobbies.split(',').map(h => h.trim()).filter(h => h).forEach(hobby => payload.append('hobbies[]', hobby));
    editedSkills.split(',').map(s => s.trim()).filter(s => s).forEach(skill => payload.append('skills[]', skill));

    // Address: Backend expects an object. If sending via FormData, stringify it or send individual fields.
    // Let's assume backend's updateMe controller handles `address[street]`, `address[city]` etc.
    // OR it handles a JSON string for 'address'. For simplicity with FormData and files:
    const addressObject = {
        street: editedAddress.street.trim(),
        city: editedAddress.city.trim(),
        state: editedAddress.state.trim(),
        postalCode: editedAddress.postalCode.trim(),
        country: editedAddress.country.trim(),
    };
    // Only append address if at least one field is filled to avoid sending empty object
    if (Object.values(addressObject).some(val => val)) {
         payload.append('address', JSON.stringify(addressObject)); // Send as JSON string
    }

    // Append profile image file IF a new one was selected by the user
    if (profileImageFile) {
        payload.append('profileImage', profileImageFile, profileImageFile.name);
    }
    // Note: The backend `updateMe` controller needs `uploadS3.single('profileImage')` middleware.

    logger.debug("Saving profile updates with FormData:", Object.fromEntries(payload.entries())); // For debugging FormData

    try {
        await apiClient.patch('/users/updateMe', payload, {
            headers: { 'Content-Type': 'multipart/form-data' } // Axios sets this for FormData, but explicit is fine
        });
        logger.info("ProfileInfo saved successfully for user:", user._id);
        alert("Profile updated successfully!");
        setProfileImageFile(null); // Clear the selected file state after successful upload
        closeModal();
        if (refreshUser) refreshUser(); // Refresh user data in AuthContext
    } catch (err) {
        logger.error("Error saving ProfileInfo:", err.response?.data || err.message, { userId: user._id });
        alert(`Error saving profile: ${err.response?.data?.message || 'Please try again.'}`);
        // Keep modal open for user to see error and retry if desired
    } finally {
        setSaveLoading(false);
    }
  };

  // Fallback for profile images in the main display area
  const handleDisplayImageError = (e) => { e.currentTarget.src = '/default.jpg'; };

  // If user data is not yet available from context (e.g., initial load)
  if (!user) {
    return (
        <section className={`${styles.profileCard} card`}>
            <p>Loading profile information...</p>
        </section>
    );
  }

  // Prepare values for display (using decoded bio)
  const displayName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const displayBioInAboutSection = user.bio ? decodeHTMLEntities(user.bio) : "No bio provided yet.";
  const displayHobbiesString = Array.isArray(user.hobbies) && user.hobbies.length > 0
    ? user.hobbies.join(', ')
    : "No hobbies listed yet.";
  const displaySkillsArray = Array.isArray(user.skills) ? user.skills : [];

  const displayLocation = user.address && Object.values(user.address).some(val => val)
        ? `${user.address.city || ''}${user.address.city && user.address.state ? ', ' : ''}${user.address.state || ''}${user.address.country ? ` (${user.address.country})` : ''}`.trim()
        : "Location not set";

  return (
    <section className={`${styles.profileCard} card`}>
      <div className={styles.profileHeader}>
        <button onClick={openModal} className={styles.editButton} aria-label="Edit Profile Information">
            <img src="/assets/edit.svg" alt="Edit" className={styles.editIcon} onError={handleDisplayImageError} />
        </button>
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileImageContainer}>
          <img
            src={user.profileImage && user.profileImage !== 'default.jpg' ? user.profileImage : '/default.jpg'}
            alt={`${displayName}'s profile`}
            className={styles.profileImage}
            onError={handleDisplayImageError}
          />
        </div>

        <div className={styles.profileDetails}>
          <h1 className={styles.profileName}>{displayName}</h1>
          <p className={styles.profileServices}><strong>Hobbies:</strong> {displayHobbiesString}</p>
          {displayLocation && displayLocation !== "Location not set" && (
            <div className={styles.profileLocation}>
              <img src="/assets/location.svg" alt="Location" className={styles.locationIcon} />
              <span>{displayLocation}</span>
            </div>
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
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Profile Information</h3>
              <button className={styles.closeButton} onClick={closeModal} aria-label="Close edit modal">✖</button>
            </div>
            <div className={styles.modalBody}>
              {/* Profile Image Upload Section */}
              <label className={styles.rowLabel}>Profile Picture:</label>
              <div className={styles.imageUploadContainerModal}>
                <div
                    className={styles.imagePreviewModal}
                    onClick={triggerFileInput}
                    role="button" tabIndex={0}
                    onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && triggerFileInput()}
                    aria-label="Profile image preview and uploader"
                >
                    {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile preview" className={styles.previewImageModal} />
                    ) : (
                        <span className={styles.uploadPlaceholderModal}>Click or Drag to Upload</span>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfileImageFileChange}
                    accept="image/jpeg, image/png, image/webp"
                    style={{ display: 'none' }}
                    id="profileImageUploadModal"
                />
                <button type="button" onClick={triggerFileInput} className={styles.uploadButtonModal}>
                    {profileImageFile ? 'Change Image' : (profileImagePreview ? 'Change Image' : 'Upload Image')}
                </button>
                {profileImageFile && <p className={styles.fileNameModal}>Selected: {profileImageFile.name}</p>}
              </div>

              {/* Text Fields */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-firstName">First Name:</label>
                  <input id="edit-firstName" type="text" className={styles.inputField} value={editedFirstName} onChange={(e) => setEditedFirstName(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="edit-lastName">Last Name:</label>
                  <input id="edit-lastName" type="text" className={styles.inputField} value={editedLastName} onChange={(e) => setEditedLastName(e.target.value)} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-modal-bio">Bio / Services Description:</label>
                <textarea id="edit-modal-bio" className={styles.textArea} value={editedBio} onChange={(e) => setEditedBio(e.target.value)} rows="4" placeholder="Tell us about yourself, your services, or what you're looking for..." maxLength={750} />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-hobbies">Hobbies (comma-separated):</label>
                <textarea id="edit-hobbies" className={styles.textArea} value={editedHobbies} onChange={(e) => setEditedHobbies(e.target.value)} rows="3" placeholder="e.g., Reading, Hiking, Coding"/>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-skills">Skills (comma-separated):</label>
                <textarea id="edit-skills" className={styles.textArea} value={editedSkills} onChange={(e) => setEditedSkills(e.target.value)} rows="3" placeholder="e.g., Web Design, Tutoring, Event Planning"/>
              </div>

              <label className={styles.rowLabel}>Address:</label>
              <div className={styles.formGroup}><label htmlFor="edit-street">Street:</label><input id="edit-street" placeholder="Street" className={styles.inputField} value={editedAddress.street} onChange={(e) => setEditedAddress(prev => ({...prev, street: e.target.value}))} /></div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label htmlFor="edit-city">City:</label><input id="edit-city" placeholder="City" className={styles.inputField} value={editedAddress.city} onChange={(e) => setEditedAddress(prev => ({...prev, city: e.target.value}))} /></div>
                <div className={styles.formGroup}><label htmlFor="edit-state">State/Province:</label><input id="edit-state" placeholder="State/Province" className={styles.inputField} value={editedAddress.state} onChange={(e) => setEditedAddress(prev => ({...prev, state: e.target.value}))} /></div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label htmlFor="edit-postalCode">Postal Code:</label><input id="edit-postalCode" placeholder="Postal Code" className={styles.inputField} value={editedAddress.postalCode} onChange={(e) => setEditedAddress(prev => ({...prev, postalCode: e.target.value}))} /></div>
                <div className={styles.formGroup}><label htmlFor="edit-country">Country:</label><input id="edit-country" placeholder="Country" className={styles.inputField} value={editedAddress.country} onChange={(e) => setEditedAddress(prev => ({...prev, country: e.target.value}))} /></div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={handleCancel} disabled={saveLoading}>Cancel</button>
                <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saveLoading}>
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfileInfo;