// src/components/ProfilePage/AlbumSection.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../api/axiosConfig';
import styles from './AlbumSection.module.css';
import AlbumCard from './AlbumCard';
import AddPhotoModal from './AddPhotoModal';
import logger from '../../utils/logger';
import PropTypes from 'prop-types';

function AlbumSection({ userIdToView, isOwnProfile, onUpdate }) {
  const [albumData, setAlbumData] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading true
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 3;
  const { showToast } = useToast();

  // Memoize fetchAlbum with useCallback
  const fetchAlbum = useCallback(async () => {
    if (!userIdToView) {
      logger.info('AlbumSection: No userIdToView, cannot fetch album.');
      setLoading(false);
      setAlbumData([]);
      // setError("Cannot load album: User not specified."); // Optional user-facing error
      return;
    }
    setLoading(true);
    setError('');
    try {
      logger.info(`AlbumSection: Fetching album for user: ${userIdToView}`);
      const response = await apiClient.get(`/users/${userIdToView}/album`);
      setAlbumData(response.data.data.album || []);
      logger.debug(
        'AlbumSection: Fetched album data:',
        response.data.data.album
      );
    } catch (err) {
      logger.error(
        'AlbumSection: Error fetching album:',
        err.response?.data || err.message,
        { userIdToView }
      );
      setError('Could not load album photos.');
      setAlbumData([]);
    } finally {
      setLoading(false);
    }
  }, [userIdToView]); // Dependency for useCallback

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]); // useEffect now depends on the memoized fetchAlbum

  // ... (rest of handlers: handleDotClick, handleAddClick, handlePhotoAddSuccess, handleDeletePhoto, handleIconError) ...
  // Ensure these handlers correctly use isOwnProfile where needed.

  // Sort albumData by most recent first (descending by uploadedAt)
  const sortedAlbumData = [...albumData].sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
  const totalPages = Math.ceil(sortedAlbumData.length / itemsPerPage);
  const handleDotClick = index => setCurrentPage(index);
  const handleAddClick = () => {
    if (isOwnProfile) setShowModal(true);
  };

  const handlePhotoAdded = _newPhotoFromBackend => {
    logger.info('AlbumSection: Photo added successfully, refetching album.');
    fetchAlbum();
    setShowModal(false);
    if (onUpdate) onUpdate();
  };

  const handleDeletePhoto = async photoIdToDelete => {
    if (!isOwnProfile || !photoIdToDelete) return;
    try {
      logger.info(`AlbumSection: Deleting photo ${photoIdToDelete}`);
      await apiClient.delete(`/users/me/album/${photoIdToDelete}`);
      showToast('Photo deleted successfully.', { type: 'success' });
      fetchAlbum();
      if (onUpdate) onUpdate();
    } catch (err) {
      logger.error('AlbumSection: Error deleting photo:', err);
      showToast(err.response?.data?.message || 'Failed to delete photo.', {
        type: 'error',
      });
    }
  };
  const handleIconError = e => {
    e.target.style.display = 'none';
  };
  const currentAlbumPageItems = sortedAlbumData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Render logic
  if (loading) {
    // Show loading indicator if loading is true
    return (
      <section className={styles.albumCard}>
        <div className={styles.albumHeader}>
          <h2>Album</h2>
        </div>
        <p>Loading album...</p>
      </section>
    );
  }

  return (
    <section className={styles.albumCard}>
      <div className={styles.albumHeader}>
        <h2>Album</h2>
        {isOwnProfile && albumData.length > 0 && (
          <button
            className={styles.addButton}
            onClick={handleAddClick}
            aria-label="Add photo to album"
          >
            <img
              src="/assets/add-circle.svg"
              alt="Add"
              className={styles.addIcon}
              onError={handleIconError}
            />
          </button>
        )}
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {!error && // Only show content or "no photos" if no error
        (albumData.length > 0 ? (
          <>
            <div className={styles.albumGrid}>
              {currentAlbumPageItems.map(albumItem => (
                <AlbumCard
                  key={albumItem._id}
                  image={albumItem.url}
                  caption={albumItem.caption}
                  photoId={albumItem._id}
                  onDelete={isOwnProfile ? handleDeletePhoto : undefined}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.paginationDots}>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    aria-label={`Go to album page ${index + 1}`}
                    className={styles.dotButton}
                    onClick={() => handleDotClick(index)}
                  >
                    <span
                      className={
                        index === currentPage ? styles.activeDot : styles.dot
                      }
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.noAlbums}>
            <p>
              {isOwnProfile
                ? 'Showcase your work by adding photos!'
                : "This user hasn't added any photos yet."}
            </p>
            {isOwnProfile && (
              <button className={styles.addTaskButton} onClick={handleAddClick}>
                Add Your First Photo
              </button>
            )}
          </div>
        ))}

      {isOwnProfile && showModal && (
        <AddPhotoModal
          onClose={() => setShowModal(false)}
          onAddSuccess={handlePhotoAdded}
        />
      )}
    </section>
  );
}

AlbumSection.propTypes = {
  userIdToView: PropTypes.string.isRequired,
  isOwnProfile: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func,
};

export default AlbumSection;
