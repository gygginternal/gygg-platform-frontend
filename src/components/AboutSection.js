// src/components/ProfilePage/AboutSection.js
import React, { useState, useEffect } from "react";
import styles from "./AboutSection.module.css"; // Create this CSS module
import { useAuth } from "../context/AuthContext"; // Adjust path
import apiClient from "../api/axiosConfig"; // Adjust path
import logger from "../utils/logger"; // Adjust path

function AboutSection() {
  const { user, refreshUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Use bio from context directly for display
  const bio = user?.bio || '';
  // Local state only for the editing modal
  const [editedBio, setEditedBio] = useState('');

  const openModal = () => {
    setEditedBio(bio); // Initialize modal textarea with current bio
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const handleCancel = () => closeModal();

  const handleSave = async () => {
     if (!user) return;
     const trimmedBio = editedBio.trim();
     // Optional: Check if bio actually changed
     // if (trimmedBio === bio) { closeModal(); return; }

     try {
         logger.debug("Saving bio update:", { bio: trimmedBio });
         await apiClient.patch('/users/updateMe', { bio: trimmedBio }); // Send only the bio field
         logger.info("Bio updated successfully for user:", user._id);
         alert("Bio updated!");
         closeModal();
         if (refreshUser) refreshUser(); // Refresh context
     } catch (err) {
         logger.error("Error saving bio:", err.response?.data || err.message, { userId: user._id });
         alert(`Error saving bio: ${err.response?.data?.message || 'Please try again.'}`);
         // Keep modal open on error?
     }
  };

   // Image error handler
   const handleImageError = (e) => { e.target.style.display = 'none'; };

  return (
    <section className={`${styles.aboutCard} card`}> {/* Add card class */}
      <div className={styles.aboutHeader}>
        <h2>About Me</h2>
         {/* Allow opening modal even if bio is empty to add one */}
         <button onClick={openModal} className={styles.editButton} aria-label="Edit Bio">
             <img src="/assets/edit.svg" alt="Edit" className={styles.editIcon} onError={handleImageError} />
         </button>
      </div>

      <div className={styles.aboutContent}>
        {bio ? (
          // Use white-space pre-wrap to respect newlines from textarea
          <p style={{ whiteSpace: 'pre-wrap' }}>{bio}</p>
        ) : (
          <div className={styles.noBio}>
            <p>Add an introduction about yourself to increase your chances of getting hired.</p>
            <button className={styles.addButton} onClick={openModal}>
              Add Bio
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{bio ? 'Edit Bio' : 'Add Bio'}</h3>
              <button className={styles.closeButton} onClick={closeModal} aria-label="Close edit bio modal">✖</button>
            </div>
             <div className={styles.modalBody}>
                 <p className={styles.modalPrompt}>
                     Use this space to show skills and experience.
                 </p>
                 <textarea
                    className={styles.textArea}
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={8} // Give more space for bio
                    placeholder="Tell everyone a bit about yourself and the services you offer..."
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