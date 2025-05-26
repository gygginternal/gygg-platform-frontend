// src/components/SocialPage/ProfileInfo.js
import React, { useState, useEffect } from "react";
import styles from "./ProfileInfo.module.css";
import { useAuth } from "../context/AuthContext"; // Adjust path as needed
import apiClient from "../api/axiosConfig"; // Adjust path as needed
import logger from "../utils/logger"; // Optional, adjust path as needed

// Helper function to decode HTML entities (if bio or other text fields might have them)
const decodeHTMLEntities = (text) => {
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


  // Populate edit form state when modal opens or user data loads
  useEffect(() => {
    if (user) {
        setEditedFirstName(user.firstName || '');
        setEditedLastName(user.lastName || '');
        setEditedBio(decodeHTMLEntities(user.bio) || ''); // Decode for editing
        setEditedHobbies(user.hobbies?.join(', ') || '');
        setEditedSkills(user.skills?.join(', ') || ''); // Assuming 'skills' is an array on user model
        setEditedAddress({
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            postalCode: user.address?.postalCode || '',
            country: user.address?.country || '',
        });
    }
  }, [user]); // Re-populate if user context changes

  const openModal = () => {
    if (!user) return;
    // Ensure form fields are up-to-date with current user data when opening
    setEditedFirstName(user.firstName || '');
    setEditedLastName(user.lastName || '');
    setEditedBio(decodeHTMLEntities(user.bio) || '');
    setEditedHobbies(user.hobbies?.join(', ') || '');
    setEditedSkills(user.skills?.join(', ') || '');
    setEditedAddress(user.address ? { ...user.address } : { street: '', city: '', state: '', postalCode: '', country: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal();

  const handleSave = async () => {
    if (!user) return;

    const payload = {
        firstName: editedFirstName.trim(),
        lastName: editedLastName.trim(),
        bio: editedBio.trim(), // Send plain text, backend escapes
        hobbies: editedHobbies.split(',').map(h => h.trim()).filter(h => h),
        skills: editedSkills.split(',').map(s => s.trim()).filter(s => s), // Process skills
        address: {
            street: editedAddress.street.trim(),
            city: editedAddress.city.trim(),
            state: editedAddress.state.trim(),
            postalCode: editedAddress.postalCode.trim(),
            country: editedAddress.country.trim(),
        }
    };
    // Remove empty address object if all fields are empty
    if (Object.values(payload.address).every(val => !val)) {
        delete payload.address;
    }


    logger.debug("Saving profile updates:", payload);

    try {
        await apiClient.patch('/users/updateMe', payload);
        logger.info("ProfileInfo saved successfully for user:", user._id);
        alert("Profile updated successfully!");
        closeModal();
        if(refreshUser) refreshUser();
    } catch (err) {
        logger.error("Error saving ProfileInfo:", err.response?.data || err.message, {userId: user._id});
        alert(`Error saving profile: ${err.response?.data?.message || 'Please try again.'}`);
    }
  };

  const handleImageError = (e) => { e.target.src = '/default.jpg'; };

  if (!user) {
    return <section className={styles.profileCard}><p>Loading profile...</p></section>;
  }

  // Determine displayed values from user context
  const displayName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
  const displayBio = user.bio ? decodeHTMLEntities(user.bio) : "No bio provided yet."; // For the "About Me" section
  const displayHobbiesString = user.hobbies?.join(', ') || "No hobbies listed yet."; // For the profile details section
  const displaySkillsArray = user.skills || []; // For the skills tags section
  const displayLocation =
    Object.values(user.address || {}).some(val => val) // Check if any address field has value
        ? `${user.address.city || ''}${user.address.city && user.address.state ? ', ' : ''}${user.address.state || ''}${user.address.country ? ` (${user.address.country})` : ''}`.trim()
        : "Location not set";


  return (
    <section className={`${styles.profileCard} card`}> {/* Main card for profile info */}
      <div className={styles.profileHeader}>
        <button onClick={openModal} className={styles.editButton} aria-label="Edit Profile Info">
            <img src="/assets/edit.svg" alt="Edit" className={styles.editIcon} onError={handleImageError} />
        </button>
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileImageContainer}>
          <img
            src={user.profileImage || '/default.jpg'}
            alt={`${displayName}'s profile`}
            className={styles.profileImage}
            onError={handleImageError}
          />
          {/* TODO: Add profile picture upload functionality in the modal */}
        </div>

        <div className={styles.profileDetails}>
          <h1 className={styles.profileName}>{displayName}</h1>
          {/* Display Hobbies as comma-separated string here */}
          <p className={styles.profileServices}>{displayHobbiesString}</p>
          {displayLocation && displayLocation !== "Location not set" && ( // Only show if location actually has data
            <div className={styles.profileLocation}>
              <img src="/assets/location.svg" alt="Location" className={styles.locationIcon} />
              <span>{displayLocation}</span>
            </div>
          )}
        </div>

        {/* This section is for SKILLS, displayed as tags */}
        <div className={styles.skillsContainer}>
          <h2 className={styles.skillsTitle}>Skills</h2> {/* Changed title */}
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Edit Profile Info</h3>
              <button className={styles.closeButton} onClick={closeModal} aria-label="Close edit modal">✖</button>
            </div>
            <div className={styles.modalBody}>

              {/* --- First Name and Last Name in one row --- */}
              <div className={styles.formRow}> {/* New wrapper div for the row */}
                <div className={styles.formGroup}> {/* Wrapper for label + input */}
                  <label htmlFor="edit-firstName">First Name:</label>
                  <input id="edit-firstName" type="text" className={styles.inputField} value={editedFirstName} onChange={(e) => setEditedFirstName(e.target.value)} />
                </div>
                <div className={styles.formGroup}> {/* Wrapper for label + input */}
                  <label htmlFor="edit-lastName">Last Name:</label>
                  <input id="edit-lastName" type="text" className={styles.inputField} value={editedLastName} onChange={(e) => setEditedLastName(e.target.value)} />
                </div>
              </div>
              {/* --- End First Name and Last Name row --- */}


              {/* Bio / Services Description (optional if edited in AboutSection) */}
              {/*
              <div className={styles.formGroup}>
                <label htmlFor="edit-bio">Main Bio / Services Description:</label>
                <textarea id="edit-bio" className={styles.textArea} value={editedBio} onChange={(e) => setEditedBio(e.target.value)} rows="4"/>
              </div>
              */}

              <div className={styles.formGroup}>
                <label htmlFor="edit-hobbies">Hobbies (comma-separated):</label>
                <textarea id="edit-hobbies" className={styles.textArea} value={editedHobbies} onChange={(e) => setEditedHobbies(e.target.value)} rows="3" placeholder="e.g., Reading, Hiking, Coding"/>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-skills">Skills (comma-separated):</label>
                <textarea id="edit-skills" className={styles.textArea} value={editedSkills} onChange={(e) => setEditedSkills(e.target.value)} rows="3" placeholder="e.g., Web Design, Dog Grooming, Event Planning"/>
              </div>

              {/* --- Location fields in one row --- */}
              <label className={styles.rowLabel}>Location:</label> {/* Label for the whole row */}
              <div className={styles.formRow}> {/* New wrapper div for the row */}
                <div className={styles.formGroup}>
                  {/* <label htmlFor="edit-city">City:</label> -- Optional individual labels */}
                  <input id="edit-city" type="text" placeholder="City" className={styles.inputField} value={editedAddress.city} onChange={(e) => setEditedAddress(prev => ({...prev, city: e.target.value}))} />
                </div>
                <div className={styles.formGroup}>
                  {/* <label htmlFor="edit-state">State/Province:</label> */}
                  <input id="edit-state" type="text" placeholder="State/Province" className={styles.inputField} value={editedAddress.state} onChange={(e) => setEditedAddress(prev => ({...prev, state: e.target.value}))} />
                </div>
                <div className={styles.formGroup}>
                  {/* <label htmlFor="edit-country">Country:</label> */}
                  <input id="edit-country" type="text" placeholder="Country" className={styles.inputField} value={editedAddress.country} onChange={(e) => setEditedAddress(prev => ({...prev, country: e.target.value}))} />
                </div>
              </div>
              {/* You might want to add Street and Postal Code as separate rows or individual fields */}
              <div className={styles.formRow} style={{marginTop: '10px'}}>
                  <div className={styles.formGroup}>
                      <label htmlFor="edit-street">Street Address:</label>
                      <input id="edit-street" type="text" className={styles.inputField} value={editedAddress.street} onChange={(e) => setEditedAddress(prev => ({...prev, street: e.target.value}))} />
                  </div>
                   <div className={styles.formGroup}>
                       <label htmlFor="edit-postalCode">Postal Code:</label>
                       <input id="edit-postalCode" type="text" className={styles.inputField} value={editedAddress.postalCode} onChange={(e) => setEditedAddress(prev => ({...prev, postalCode: e.target.value}))} />
                   </div>
              </div>
              {/* --- End Location fields row --- */}


              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                <button className={styles.saveButton} onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfileInfo;