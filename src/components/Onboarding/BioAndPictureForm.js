// src/components/Onboarding/BioAndPictureForm.js
// import React from 'react';
import { useState, useRef, useEffect } from 'react';
import styles from './BioAndPictureForm.module.css'; // Create this
import PropTypes from 'prop-types';
import FormInput from './FormInput';
// import { FaUpload } from 'react-icons/fa'; // If using react-icons

function BioAndPictureForm({
  bio,
  onBioChange,
  profileImageFile,
  onProfileImageChange,
  currentImageUrl,
}) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profileImageFile) {
      const objectUrl = URL.createObjectURL(profileImageFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // Cleanup
    } else if (currentImageUrl && currentImageUrl !== 'default.jpg') {
      setPreview(currentImageUrl); // Show existing S3 URL
    } else {
      setPreview(null);
    }
  }, [profileImageFile, currentImageUrl]);

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        /* Error handling for size */ return;
      }
      onProfileImageChange(file); // Pass File object to parent
    }
  };

  const handleUploadAreaClick = () => fileInputRef.current?.click();
  const handleDragOver = e => e.preventDefault();
  const handleDrop = e => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onProfileImageChange(file);
  };

  return (
    <div className={styles.bioPicContainer}>
      <FormInput
        label="Tell us about your company or yourself as a service seeker (This will be your main bio)."
        name="bio" // Make sure name matches parent state key
        type="textarea"
        value={bio}
        onChange={onBioChange} // Expects (name, value)
        rows={6}
        placeholder="e.g., We are a small startup looking for talented freelancers..."
      />
      <div className={styles.imageSection}>
        <div
          className={styles.imagePreview}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile preview"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.placeholder}>No image</div>
          )}
        </div>
        <div
          className={styles.imageUpload}
          onClick={handleUploadAreaClick}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleUploadAreaClick();
            }
          }}
        >
          {/* <FaUpload className={styles.uploadIcon} /> */}{' '}
          <span className={styles.uploadEmoji}>⬆️</span>
          <p className={styles.uploadText}>Upload Profile Picture</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className={styles.fileInput}
          />
        </div>
      </div>
    </div>
  );
}

BioAndPictureForm.propTypes = {
  bio: PropTypes.string.isRequired,
  onBioChange: PropTypes.func.isRequired,
  profileImageFile: PropTypes.instanceOf(File),
  onProfileImageChange: PropTypes.func.isRequired,
  currentImageUrl: PropTypes.string,
};

export default BioAndPictureForm;
