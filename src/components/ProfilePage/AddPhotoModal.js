// src/components/ProfilePage/AddPhotoModal.js
import React, { useState, useEffect } from "react"; // Added useEffect
import styles from "./AddPhotoModal.module.css";
import apiClient from "../../api/axiosConfig"; // Adjust path
import logger from "../../utils/logger"; // Adjust path
import { useAuth } from "../../context/AuthContext"; // To get userId if needed by backend

function AddPhotoModal({ onClose, onAddSuccess }) { // Renamed onAdd to onAddSuccess
  const { user } = useAuth(); // Get user if backend needs userId for non /me/album routes
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setError('');
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
             setError("File is too large (Max 10MB).");
             setSelectedFile(null); setPreviewUrl(null);
             return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
             setError("Invalid file type. Please select an image (JPEG, PNG, WEBP, GIF).");
             setSelectedFile(null); setPreviewUrl(null);
             return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    } else {
        setSelectedFile(null);
        setPreviewUrl(null);
    }
  };

  useEffect(() => {
      // Cleanup blob URL when component unmounts or previewUrl changes
      return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleSubmit = async () => {
    if (!selectedFile || !caption.trim()) {
        setError("Please select a file and enter a caption.");
        return;
    }
    setLoading(true); setError('');

    const formData = new FormData();
    formData.append('albumImage', selectedFile); // 'albumImage' must match backend Multer field name
    formData.append('caption', caption.trim());
    // If your backend endpoint is not /users/me/album, you might need to send userId:
    // if (user?._id) formData.append('userId', user._id);


    try {
         logger.info("Uploading album photo with caption:", caption);
         // Use the endpoint for adding a photo to the logged-in user's album
         const response = await apiClient.post('/users/me/album', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
         });

         logger.debug("Photo uploaded successfully, backend response:", response.data);
         // response.data.data.photo should be the newly created photo object from the backend
         // including its database _id and the permanent S3/Cloudinary URL
         if (onAddSuccess) {
             onAddSuccess(response.data.data.photo);
         }
         onClose(); // Close modal on success
    } catch(err) {
         logger.error("Error uploading photo:", err.response?.data || err.message);
         setError(err.response?.data?.message || "Failed to upload photo. Please try again.");
    } finally {
         setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Add Photo to Album</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close add photo modal">✖</button>
        </div>
        <div className={styles.modalBody}>
          <p>Showcase your work by adding a gig-related photo.</p>
          {error && <p className="error-message">{error}</p>}
          <div className={styles.uploadBox}>
            <input type="file" id="photoUpload" accept="image/jpeg, image/png, image/webp, image/gif" onChange={handleFileChange} style={{ display: 'none' }} />
            <label htmlFor="photoUpload" className={styles.uploadLabel}>
              {previewUrl && <img src={previewUrl} alt="Preview" className={styles.previewImage} />}
              {!previewUrl && (selectedFile ? selectedFile.name : "Click or Drag to Upload")}
            </label>
            <p className={styles.fileLimitText}>Max 10 MB (JPG, PNG, WEBP, GIF)</p>
          </div>
          <input
            type="text"
            maxLength={50}
            placeholder="Photo Caption (required)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={styles.inputField}
          />
          <p className={styles.captionLimitText}>50 characters max</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose} disabled={loading}>Cancel</button>
          <button className={styles.saveButton} onClick={handleSubmit} disabled={!selectedFile || !caption.trim() || loading}>
            {loading ? 'Uploading...' : 'Add Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default AddPhotoModal;