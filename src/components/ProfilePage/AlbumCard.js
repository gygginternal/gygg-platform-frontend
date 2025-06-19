// src/components/ProfilePage/AlbumCard.js
import React from 'react';
import styles from './AlbumCard.module.css';
import PropTypes from 'prop-types';

function AlbumCard({ image, caption, photoId, onDelete }) {
  // Added photoId and onDelete
  const handleImageError = e => {
    e.target.src = '/image-placeholder.png';
  }; // Fallback

  return (
    <figure className={styles.albumItem}>
      {/* Delete button - shown only if onDelete function is provided */}
      {onDelete && (
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(photoId)}
          title="Delete photo"
          aria-label="Delete photo"
        >
          × {/* Simple 'x' icon */}
        </button>
      )}
      <div className="image-container">
        <img
          src={image || '/image-placeholder.png'}
          alt={caption || 'Album image'}
          className="album-image"
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <figcaption className={styles.albumCaption}>
        {caption || 'No caption'}
      </figcaption>
    </figure>
  );
}

AlbumCard.propTypes = {
  image: PropTypes.string,
  caption: PropTypes.string,
  photoId: PropTypes.string,
  onDelete: PropTypes.func,
};

export default AlbumCard;
