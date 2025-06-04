// src/components/SocialPage/ProfileInfo.js
import React, { useState, useEffect, useRef } from "react";
import styles from "./ProfileInfo.module.css";
import { useAuth } from "../../context/AuthContext"; // Adjust path as needed
import apiClient from "../../api/axiosConfig"; // Adjust path as needed
import logger from "../../utils/logger"; // Optional, adjust path as needed

// Helper function to decode HTML entities (if bio or other text fields might have them)
const decodeHTMLEntities = (text) => { /* ... same as before ... */
    if (typeof text !== 'string' || !text) return "";
    try {
        const element = document.createElement('div');
        element.innerHTML = text;
        return element.textContent || element.innerText || "";
    } catch (e) {
        logger.error("Error decoding HTML entities:", e);
        return text;
    }
};

function ProfileInfo() {
  const { user, refreshUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local state for editable fields
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedBio, setEditedBio] = useState(""); // For main bio/services description
  const [editedHobbies, setEditedHobbies] = useState(""); // Comma-separated string for input
  const [editedSkills, setEditedSkills] = useState("");   // Comma-separated string for input
  const [editedAddress, setEditedAddress] = useState({ street: '', city: '', state: '', postalCode: '', country: '' });
    const [profileImageFile, setProfileImageFile] = useState(null); // To store the File object
  const [profileImagePreview, setProfileImagePreview] = useState(null); // For image preview in modal
  const fileInputRef = useRef(null); // To trigger file input click
  // --- End new state ---
  const [saveLoading, setSaveLoading] = useState(false); // Loading state for save button


  // Populate edit form state when modal opens or user data loads
  useEffect(() => {
    if (user) {
        setEditedFirstName(user.firstName || '');
        setEditedLastName(user.lastName || '');
        setEditedBio(decodeHTMLEntities(user.bio) || '');
        setEditedHobbies(user.hobbies?.join(', ') || '');
        setEditedSkills(user.skills?.join(', ') || '');
        setEditedAddress(user.address ? { ...user.address } : { street: '', city: '', state: '', postalCode: '', country: '' });
        setProfileImagePreview(user.profileImage && user.profileImage !== 'default.jpg' ? user.profileImage : null); // Show current image URL
        setProfileImageFile(null); // Reset file input on user change or modal open
    }
  }, [user]);  // Re-populate if user context changes

   const openModal = () => {
    if (!user) return;
    // Reset form fields to current user data when opening
    setEditedFirstName(user.firstName || '');
    setEditedLastName(user.lastName || '');
    setEditedBio(decodeHTMLEntities(user.bio) || '');
    setEditedHobbies(user.hobbies?.join(', ') || '');
    setEditedSkills(user.skills?.join(', ') || '');
    setEditedAddress(user.address ? { ...user.address } : { street: '', city: '', state: '', postalCode: '', country: '' });
    setProfileImagePreview(user.profileImage && user.profileImage !== 'default.jpg' ? user.profileImage : null); // Reset preview to current
    setProfileImageFile(null); // Clear any previously selected file
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal();

   // --- Profile Image Handlers ---
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
        setProfileImagePreview(URL.createObjectURL(file)); // Show local preview
    }
  };

  // Cleanup blob URL when component unmounts or preview changes
  useEffect(() => {
      return () => {
          if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(profileImagePreview);
          }
      };
  }, [profileImagePreview]);

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!user) return;
    setSaveLoading(true); // Set loading for save button

    // --- Use FormData for multipart request if image is present ---
    const payload = new FormData();

    payload.append('firstName', editedFirstName.trim());
    payload.append('lastName', editedLastName.trim());
    payload.append('bio', editedBio.trim());
    // Send hobbies and skills as arrays (backend should handle if they are arrays or strings)
    editedHobbies.split(',').map(h => h.trim()).filter(h => h).forEach(hobby => payload.append('hobbies[]', hobby));
    editedSkills.split(',').map(s => s.trim()).filter(s => s).forEach(skill => payload.append('skills[]', skill));

    // Address - send as a JSON string if backend expects it with FormData, or individual fields
    const addressObject = {
        street: editedAddress.street.trim(),
        city: editedAddress.city.trim(),
        state: editedAddress.state.trim(),
        postalCode: editedAddress.postalCode.trim(),
        country: editedAddress.country.trim(),
    };
    if (Object.values(addressObject).some(val => val)) { // Only append if address has data
         // If backend `updateMe` expects address fields flat (e.g. address.street):
         // Object.keys(addressObject).forEach(key => {
         //    if (addressObject[key]) formData.append(`address[${key}]`, addressObject[key]);
         // });
         // If backend `updateMe` expects 'address' as a JSON string with FormData:
         payload.append('address', JSON.stringify(addressObject));
    }


    // Append profile image file IF a new one was selected
    if (profileImageFile) {
        payload.append('profileImage', profileImageFile, profileImageFile.name);
    }
    // If user wants to REMOVE profile image (set to default), backend needs to handle this.
    // E.g., send a flag: payload.append('removeProfileImage', 'true');
    // Or if profileImagePreview is null AND user.profileImage wasn't default, means remove.

    logger.debug("Saving profile updates (FormData):", Object.fromEntries(payload.entries()));

    try {
        // Send as multipart/form-data
        await apiClient.patch('/users/updateMe', payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        logger.info("ProfileInfo saved successfully for user:", user._id);
        alert("Profile updated successfully!");
        setProfileImageFile(null); // Clear selected file after successful upload
        closeModal();
        if(refreshUser) refreshUser(); // Refresh context to show updated data, including new image URL
    } catch (err) {
        logger.error("Error saving ProfileInfo:", err.response?.data || err.message, {userId: user._id});
        alert(`Error saving profile: ${err.response?.data?.message || 'Please try again.'}`);
    } finally {
        setSaveLoading(false);
    }
  };

  const handleDisplayImageError = (e) => { e.target.src = '/default.jpg'; }; // For the main display

  if (!user) {
    return <section className={styles.profileCard}><p>Loading profile...</p></section>;
  }

  // Determine displayed values from user context
  const displayName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
  const displayHobbiesString = user.hobbies?.join(', ') || "No hobbies listed.";
  const displaySkillsArray = user.skills || []; // For the skills tags section
  const displayLocation =
    Object.values(user.address || {}).some(val => val) // Check if any address field has value
        ? `${user.address.city || ''}${user.address.city && user.address.state ? ', ' : ''}${user.address.state || ''}${user.address.country ? ` (${user.address.country})` : ''}`.trim()
        : "Location not set";


  return (
    <section className={`${styles.profileCard} card`}>
      <div className={styles.profileHeader}>
        <button onClick={openModal} className={styles.editButton} aria-label="Edit Profile Info">
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
        
        {/* ... profileDetails and skillsContainer JSX ... */}
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
                displaySkillsArray.map((skill, index) => <span key={index} className={styles.skillTag}>{skill}</span>)
            ) : ( <p className={styles.noSkills}>Add your skills!</p> )}
          </div>
        </div>

      </div>

       {/* Edit Modal */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Profile Info</h3>
              <button className={styles.closeButton} onClick={closeModal} aria-label="Close edit modal">✖</button>
            </div>
            <div className={styles.modalBody}>
              {/* --- Profile Image Upload in Modal --- */}
              <label className={styles.rowLabel}>Profile Picture:</label>
              <div className={styles.imageUploadContainerModal}>
                <div className={styles.imagePreviewModal} onClick={triggerFileInput} role="button" tabIndex={0} onKeyPress={e => e.key === 'Enter' && triggerFileInput()}>
                    {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile preview" className={styles.previewImageModal} />
                    ) : (
                        <span className={styles.uploadPlaceholderModal}>Click to select image</span>
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
                    {profileImagePreview ? 'Change Image' : 'Upload Image'}
                </button>
                 {profileImageFile && <p className={styles.fileNameModal}>Selected: {profileImageFile.name}</p>}
              </div>
              {/* --- End Profile Image Upload --- */}

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
                <textarea id="edit-modal-bio" className={styles.textArea} value={editedBio} onChange={(e) => setEditedBio(e.target.value)} rows="4" placeholder="Tell us about yourself..." />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-hobbies">Hobbies (comma-separated):</label>
                <textarea id="edit-hobbies" className={styles.textArea} value={editedHobbies} onChange={(e) => setEditedHobbies(e.target.value)} rows="3" placeholder="e.g., Reading, Hiking"/>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-skills">Skills (comma-separated):</label>
                <textarea id="edit-skills" className={styles.textArea} value={editedSkills} onChange={(e) => setEditedSkills(e.target.value)} rows="3" placeholder="e.g., Web Design, Tutoring"/>
              </div>

              <label className={styles.rowLabel}>Address:</label>
              <div className={styles.formGroup}><input placeholder="Street" className={styles.inputField} value={editedAddress.street} onChange={(e) => setEditedAddress(prev => ({...prev, street: e.target.value}))} /></div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><input placeholder="City" className={styles.inputField} value={editedAddress.city} onChange={(e) => setEditedAddress(prev => ({...prev, city: e.target.value}))} /></div>
                <div className={styles.formGroup}><input placeholder="State/Province" className={styles.inputField} value={editedAddress.state} onChange={(e) => setEditedAddress(prev => ({...prev, state: e.target.value}))} /></div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><input placeholder="Postal Code" className={styles.inputField} value={editedAddress.postalCode} onChange={(e) => setEditedAddress(prev => ({...prev, postalCode: e.target.value}))} /></div>
                <div className={styles.formGroup}><input placeholder="Country" className={styles.inputField} value={editedAddress.country} onChange={(e) => setEditedAddress(prev => ({...prev, country: e.target.value}))} /></div>
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
