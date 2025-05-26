// src/components/ProfilePage/AboutSection.js
import React, { useState, useEffect } from "react";
import styles from "./AboutSection.module.css"; // Ensure this CSS Module exists
import { useAuth } from "../context/AuthContext"; // Adjust path as needed
import apiClient from "../api/axiosConfig"; // Adjust path as needed
import logger from "../utils/logger"; // Adjust path as needed

// --- Helper function to decode HTML entities ---
const decodeHTMLEntities = (text) => {
    if (typeof text !== 'string' || !text) return ""; // Return empty string if not string or empty
    try {
        const element = document.createElement('div');
        element.innerHTML = text;
        return element.textContent || element.innerText || "";
    } catch (e) {
        // In case of weird errors with document.createElement (e.g., server-side rendering context without DOM)
        logger.error("Error decoding HTML entities:", e);
        return text; // Fallback to original text
    }
};
// --- End Helper function ---

function AboutSection() {
  const { user, refreshUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local state only for the editing modal
  // Initialize editedBio from the *decoded* user bio when the modal opens
  const [editedBio, setEditedBio] = useState('');

  // Decode the bio from the user object for display
  const displayBio = user?.bio ? decodeHTMLEntities(user.bio) : '';

  const openModal = () => {
    // When opening the modal, set the textarea value to the *decoded* bio
    // so the user edits the plain text version.
    setEditedBio(displayBio); // Use the already decoded bio for editing
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal();

  const handleSave = async () => {
     if (!user) return;

     // The trimmedBio from the textarea is plain text.
     // The backend's express-validator .escape() will handle encoding it before saving.
     const trimmedBio = editedBio.trim();

     // Optional: Check if bio actually changed from the *original decoded* bio
     // if (trimmedBio === displayBio) {
     //     closeModal();
     //     return;
     // }

     try {
         logger.debug("Saving bio update:", { bio: trimmedBio });
         // Send the plain text bio. Backend will escape it.
         await apiClient.patch('/users/updateMe', { bio: trimmedBio });
         logger.info("Bio updated successfully for user:", user._id);
         alert("Bio updated!");
         closeModal();
         if (refreshUser) refreshUser(); // Refresh context, which will fetch the newly escaped bio
     } catch (err) {
         logger.error("Error saving bio:", err.response?.data || err.message, { userId: user._id });
         alert(`Error saving bio: ${err.response?.data?.message || 'Please try again.'}`);
         // Keep modal open on error?
     }
  };

   // Image error handler for the edit icon
   const handleImageError = (e) => {
        // You could hide it, or replace with a text "Edit"
        e.target.style.display = 'none';
        // Or, if you have a parent button:
        // const parentButton = e.target.parentElement;
        // if (parentButton) parentButton.textContent = "Edit";
   };

  return (
    <section className={`${styles.aboutCard} card`}> {/* Using card class for consistency */}
      <div className={styles.aboutHeader}>
        <h2>About Me</h2>
         <button onClick={openModal} className={styles.editButton} aria-label="Edit Bio">
             <img src="/assets/edit.svg" alt="Edit" className={styles.editIcon} onError={handleImageError} /> {/* Ensure icon in public */}
         </button>
      </div>

      <div className={styles.aboutContent}>
        {displayBio ? ( // Check the decoded bio for truthiness
          // Render the decoded bio. React will handle safety.
          <p style={{ whiteSpace: 'pre-wrap' }}>{displayBio}</p>
        ) : (
          <div className={styles.noBio}>
            <p>Share a bit about yourself and your services to attract clients or taskers!</p>
            <button className={styles.addButton} onClick={openModal}>
              Add Bio
            </button>
          </div>
        )}
      </div>

      {/* Modal for Editing/Adding Bio */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{displayBio ? 'Edit Bio' : 'Add Bio'}</h3>
              <button className={styles.closeButton} onClick={closeModal} aria-label="Close edit bio modal">✖</button>
            </div>
             <div className={styles.modalBody}>
                 <p className={styles.modalPrompt}>
                     Use this space to showcase your skills, experience, and what you offer.
                 </p>
                 <textarea
                    className={styles.textArea} // Ensure this class is styled
                    value={editedBio} // Textarea shows decoded (plain) text for editing
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={8}
                    placeholder="Tell everyone a bit about yourself and the services you offer..."
                    maxLength={750} // Match backend schema
                 />
                 <div className={styles.modalActions}>
                     <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                     <button className={styles.saveButton} onClick={handleSave}>Save</button>
                 </div>
             </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AboutSection;