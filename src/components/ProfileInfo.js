// src/components/SocialPage/ProfileInfo.js
import React, { useState, useEffect } from "react";
import styles from "./ProfileInfo.module.css"; // Create this CSS module
import { useAuth } from "../context/AuthContext"; // Adjust path
import apiClient from "../api/axiosConfig"; // Adjust path
import logger from "../utils/logger"; // Optional, adjust path

function ProfileInfo() {
  const { user, refreshUser } = useAuth(); // Get user and refresh function
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local state for editable fields, initialized from user context
  const [editedName, setEditedName] = useState(""); // Will split into first/last for API
  const [editedServices, setEditedServices] = useState(""); // This might map to 'skills' or 'bio'
  const [editedLocation, setEditedLocation] = useState(""); // This might map to address fields
  const [editedGigsOrSkills, setEditedGigsOrSkills] = useState(""); // Renamed, likely maps to 'hobbies' or a new 'skills' field

  // Populate edit form state when modal opens or user data loads
  useEffect(() => {
    if (user) {
        setEditedName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
        setEditedServices(user.bio || "Household Services, Personal Assistance"); // Example: Use bio or placeholder
        setEditedLocation(user.address?.city || user.address?.country || "Location not set"); // Example: Use city/country
        // Assuming 'hobbies' is used for the "Gigs/Skills" tags for now
        setEditedGigsOrSkills(user.hobbies?.join(', ') || "Dog Walking, Gardening"); // Example
    }
  }, [user]); // Re-populate if user context changes

  const openModal = () => {
    if (!user) return; // Don't open if user isn't loaded
    // Reset form fields to current user data when opening
    setEditedName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    setEditedServices(user.bio || ''); // Use actual bio
    setEditedLocation(
        `${user.address?.city || ''}${user.address?.city && user.address?.state ? ', ' : ''}${user.address?.state || ''}${user.address?.country ? ' (' + user.address.country + ')' : ''}`.trim() || ''
    ); // Construct location string
    setEditedGigsOrSkills(user.hobbies?.join(', ') || ''); // Use actual hobbies
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal();

  const handleSave = async () => {
    if (!user) return;

    // --- Prepare Payload for API ---
    // Split name back into first/last (basic split, might need improvement)
    const nameParts = editedName.trim().split(' ');
    const firstName = nameParts[0] || user.firstName; // Keep original if split fails
    const lastName = nameParts.slice(1).join(' ') || user.lastName;

    // Prepare address object (needs more robust parsing if only one field)
    // Simple example assuming editedLocation is just city for now
    const addressPayload = {
        ...user.address, // Keep existing address fields
        city: editedLocation.trim() // Update city (improve this based on input needs)
    };

    const payload = {
        firstName,
        lastName,
        bio: editedServices.trim(), // Assuming 'Services' maps to 'Bio'
        hobbies: editedGigsOrSkills.split(',').map(h => h.trim()).filter(h => h), // Assuming 'Gigs' maps to 'Hobbies'
        address: addressPayload
        // Add other fields if the modal collects them
    };

    logger.debug("Saving profile updates:", payload);

    try {
        await apiClient.patch('/users/updateMe', payload); // Call backend update endpoint
        logger.info("ProfileInfo saved successfully for user:", user._id);
        alert("Profile updated successfully!");
        closeModal();
        if(refreshUser) refreshUser(); // Refresh context to show updated data
    } catch (err) {
        logger.error("Error saving ProfileInfo:", err.response?.data || err.message, {userId: user._id});
        alert(`Error saving profile: ${err.response?.data?.message || 'Please try again.'}`);
        // Keep modal open on error?
    }
  };

  // Image error handler
  const handleImageError = (e) => { e.target.src = '/default.jpg'; };

  if (!user) {
    return <section className={styles.profileCard}><p>Loading profile...</p></section>;
  }

  // Determine displayed values from user context
  const displayName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
  const displayServices = user.bio || "No bio provided."; // Use bio field
  const displayLocation = `${user.address?.city || ''}${user.address?.city && user.address?.state ? ', ' : ''}${user.address?.state || ''}${user.address?.country ? ' (' + user.address.country + ')' : ''}`.trim() || "Location not set";
  const displaySkills = user.hobbies || []; // Use hobbies field


  return (
    <section className={styles.profileCard}>
      <div className={styles.profileHeader}>
        {/* Edit button to open modal */}
        <button onClick={openModal} className={styles.editButton} aria-label="Edit Profile Info">
            <img src="/assets/edit.svg" alt="Edit" className={styles.editIcon} />
        </button>
      </div>
      <div className={styles.profileContent}>
        <div className={styles.profileImageContainer}>
          <img // Standard img tag
            src={user.profileImage || '/default.jpg'} // Use user data or fallback
            alt="Profile"
            className={styles.profileImage}
            onError={handleImageError}
          />
          {/* TODO: Add profile picture upload functionality */}
        </div>

        <div className={styles.profileDetails}>
          <h1 className={styles.profileName}>{displayName}</h1>
           {/* Consider if 'services' should be separate field or part of bio */}
          <p className={styles.profileServices}>{displayServices}</p>
          {displayLocation && (
            <div className={styles.profileLocation}>
              <img src="/assets/location.svg" alt="Location" className={styles.locationIcon} /> {/* Ensure icon in public */}
              <span>{displayLocation}</span>
            </div>
          )}
        </div>

        <div className={styles.skillsContainer}>
          <h2 className={styles.skillsTitle}>Skills / Offered Gigs</h2> {/* Clarified title */}
          <div className={styles.skillsList}>
            {displaySkills.length > 0 ? (
                displaySkills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                        {skill}
                    </span>
                ))
            ) : (
                 <p className={styles.noSkills}>Add skills/hobbies to your profile!</p>
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
              {/* Use InputField or standard inputs */}
              <label>Name:</label>
              <input type="text" className={styles.inputField} value={editedName} onChange={(e) => setEditedName(e.target.value)} />

              <label>Bio / Services Description:</label>
              <textarea className={styles.textArea} value={editedServices} onChange={(e) => setEditedServices(e.target.value)} rows="4"/>

              <label>Location (e.g., City, State (Country)):</label>
              <input type="text" className={styles.inputField} value={editedLocation} onChange={(e) => setEditedLocation(e.target.value)} />

              <label>Skills / Hobbies (comma-separated):</label>
              <textarea className={styles.textArea} value={editedGigsOrSkills} onChange={(e) => setEditedGigsOrSkills(e.target.value)} rows="3"/>

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