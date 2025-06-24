// src/components/ProfilePage/AlbumCard.js
import styles from './AlbumCard.module.css';
import PropTypes from 'prop-types';

function AlbumCard({ image, caption, photoId, onDelete }) {
  // Added photoId and onDelete
  const handleImageError = e => {
    e.target.src = '/image-placeholder.png';
  }; // Fallback

  return (
    <figure className={styles.albumItem}>
      <div className="image-container">
        <img
          src={image || '/image-placeholder.png'}
          alt={caption || 'Album'}
          className="album-image"
          onError={handleImageError}
          loading="lazy"
        />
        <div className={styles.albumFooterOverlay}>
          <div className={styles.albumFooterPill}>
            <figcaption className={styles.albumCaption}>
              {caption || 'No caption'}
            </figcaption>
            {onDelete && (
              <button
                className={styles.deleteButton}
                onClick={() => onDelete(photoId)}
                title="Delete photo"
                aria-label="Delete photo"
                type="button"
              >
                <img
                  src="/assets/trash.svg"
                  alt="Delete"
                  style={{ width: 22, height: 22 }}
                />
              </button>
            )}
          </div>
        </div>
      </div>
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
