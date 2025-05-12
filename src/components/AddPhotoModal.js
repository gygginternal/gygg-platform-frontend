import React, { useState } from "react";
import styles from "./AddPhotoModal.module.css"; // Create CSS module

function AddPhotoModal({ onClose, onAdd }) {
  const [selectedFile, setSelectedFile] = useState(null); // Store the File object
  const [previewUrl, setPreviewUrl] = useState(null); // For image preview
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleFileChange = (event) => {
    setError(''); // Clear error
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // Example: 10MB limit
             setError("File is too large (Max 10MB).");
             return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file)); // Create temporary preview URL
    } else {
        setSelectedFile(null);
        setPreviewUrl(null);
    }
  };

  // Cleanup preview URL when component unmounts or file changes
  React.useEffect(() => {
      return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleSubmit = async () => {
    if (!selectedFile || !caption.trim()) {
        setError("Please select a file and enter a caption.");
        return;
    }
    setLoading(true); setError('');

    // --- !!! This is where the actual upload logic would go !!! ---
    try {
         console.log("Simulating upload for:", selectedFile.name, "with caption:", caption);
         // 1. Create FormData
         // const formData = new FormData();
         // formData.append('image', selectedFile); // 'image' should match backend field name
         // formData.append('caption', caption.trim());
         // formData.append('userId', userId); // Include user ID if needed

         // 2. Make API call using apiClient
         // const response = await apiClient.post('/users/me/album', formData, {
         //      headers: { 'Content-Type': 'multipart/form-data' }
         // });

         // 3. Assuming success for now, call onAdd with TEMPORARY preview URL
         // In reality, use the URL returned from the backend upload (response.data.data.newPhotoUrl)
         onAdd({ image: previewUrl, caption: caption.trim() }); // Pass preview URL temporarily
         onClose(); // Close modal on success

    } catch(err) {
         console.error("Error uploading photo:", err.response?.data || err.message);
         setError(err.response?.data?.message || "Failed to upload photo.");
    } finally {
         setLoading(false);
    }
    // --- !!! End of Upload Logic Placeholder !!! ---
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Add Photo to Album</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close add photo modal">✖</button>
        </div>
        <div className={styles.modalBody}>
          <p>Showcase your skills or past work.</p>
          {error && <p className="error-message">{error}</p>}
          <div className={styles.uploadBox}>
            <input type="file" id="photoUpload" accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
            <label htmlFor="photoUpload" className={styles.uploadLabel}>
              {previewUrl && <img src={previewUrl} alt="Preview" className={styles.previewImage} />}
              {!previewUrl && (selectedFile ? selectedFile.name : "Click or Drag to Upload")}
            </label>
            <p className={styles.fileLimitText}>Max 10 MB (JPG, PNG, WEBP)</p>
          </div>
          <input
            type="text"
            maxLength={50} // Increased caption limit
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
