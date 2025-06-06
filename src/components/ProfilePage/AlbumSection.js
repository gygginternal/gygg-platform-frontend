// src/components/ProfilePage/AlbumSection.js
import React, { useState, useEffect } from "react";
import styles from "./AlbumSection.module.css";
import AlbumCard from "./AlbumCard";
import AddPhotoModal from "./AddPhotoModal";
import apiClient from "../../api/axiosConfig"; // Adjust path
import logger from "../../utils/logger"; // Adjust path
import { useAuth } from "../../context/AuthContext"; // To get the logged-in user

// Prop to allow viewing another user's album (e.g., on a public profile page)
function AlbumSection({ userIdToView }) {
  const { user: loggedInUser } = useAuth();
  const [albumData, setAlbumData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 3; // Or make this dynamic based on screen size

  // Determine whose album to fetch
  const targetUserId = userIdToView || loggedInUser?._id;
  const isOwnProfile = loggedInUser?._id === targetUserId;

  // Fetch album data
  const fetchAlbum = async () => {
       if (!targetUserId) {
           logger.info("AlbumSection: No targetUserId, cannot fetch album.");
           setLoading(false); // Stop loading if no ID
           setAlbumData([]);   // Clear album data
           return;
       }
       setLoading(true); setError('');
       try {
            logger.info(`AlbumSection: Fetching album for user: ${targetUserId}`);
            // Determine endpoint based on whether it's own profile or another's
            const endpoint = isOwnProfile ? '/users/me/album' : `/users/${targetUserId}/album`;
            const response = await apiClient.get(endpoint);
            setAlbumData(response.data.data.album || []);
            logger.debug("AlbumSection: Fetched album data:", response.data.data.album);
       } catch (err) {
            logger.error("AlbumSection: Error fetching album:", err.response?.data || err.message);
            setError("Could not load album photos.");
            setAlbumData([]);
       } finally {
            setLoading(false);
       }
  };

  useEffect(() => {
      fetchAlbum();
  }, [targetUserId]); // Refetch if targetUserId changes


  const totalPages = Math.ceil(albumData.length / itemsPerPage);
  const handleDotClick = (index) => setCurrentPage(index);
  const handleAddClick = () => setShowModal(true);

  const handlePhotoAddSuccess = (newPhotoFromBackend) => {
    // newPhotoFromBackend is the object returned by the backend after successful upload
    // It should contain _id, url, caption, key, etc.
    logger.info("AlbumSection: Photo added successfully, updating local state:", newPhotoFromBackend);
    // Option 1: Add to local state (faster UI update)
    setAlbumData((prevData) => [...prevData, newPhotoFromBackend]);
    // Option 2: Refetch the whole album (more robust if there are other changes)
    // fetchAlbum();
    setShowModal(false);
  };

  // Handler for deleting a photo
  const handleDeletePhoto = async (photoIdToDelete) => {
      if (!isOwnProfile || !photoIdToDelete) return; // Only own photos can be deleted
      if (!window.confirm("Are you sure you want to delete this photo?")) return;

      try {
          logger.info(`AlbumSection: Deleting photo ${photoIdToDelete}`);
          await apiClient.delete(`/users/me/album/${photoIdToDelete}`);
          // Remove from local state or refetch
          setAlbumData(prev => prev.filter(photo => photo._id !== photoIdToDelete));
          alert("Photo deleted successfully.");
      } catch (err) {
          logger.error("AlbumSection: Error deleting photo:", err.response?.data || err.message);
          alert(err.response?.data?.message || "Failed to delete photo.");
      }
  };

  // Image error handler for add icon
  const handleIconError = (e) => { e.target.style.display = 'none'; };

  // Pass handleDelete to AlbumCard if you add delete button there
  const currentAlbumPageItems = albumData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <section className={`${styles.albumCard} card`}>
      <div className={styles.albumHeader}>
        <h2>Album</h2>
        {/* Show Add Photo Button only if viewing own profile */}
        {isOwnProfile && albumData.length > 0 && (
            <button className={styles.addButton} onClick={handleAddClick} aria-label="Add photo to album">
               <img src="/assets/add-circle.svg" alt="Add" className={styles.addIcon} onError={handleIconError}/>
            </button>
        )}
      </div>

       {loading && <p>Loading album...</p>}
       {error && <p className="error-message">{error}</p>}

       {!loading && !error && (
           albumData.length > 0 ? (
               <>
                   <div className={styles.albumGrid}>
                       {currentAlbumPageItems.map((albumItem) => (
                           <AlbumCard
                                key={albumItem._id} // Use database ID as key
                                image={albumItem.url} // Use URL from backend
                                caption={albumItem.caption}
                                photoId={albumItem._id} // Pass ID for potential actions
                                onDelete={isOwnProfile ? handleDeletePhoto : undefined} // Pass delete handler if own profile
                           />
                       ))}
                   </div>

                   {totalPages > 1 && (
                       <div className={styles.paginationDots}>
                           {Array.from({ length: totalPages }).map((_, index) => (
                               <button
                                   key={index}
                                   aria-label={`Go to album page ${index + 1}`}
                                   className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""}`}
                                   onClick={() => handleDotClick(index)}
                               />
                           ))}
                       </div>
                   )}
               </>
           ) : (
               <div className={styles.noAlbums}>
                   <p>{isOwnProfile ? "Showcase your work by adding photos!" : "This user hasn't added any photos yet."}</p>
                   {isOwnProfile && (
                       <button className={styles.addTaskButton} onClick={handleAddClick}>
                           Add Your First Photo
                       </button>
                   )}
               </div>
           )
       )}

      {showModal && <AddPhotoModal onClose={() => setShowModal(false)} onAddSuccess={handlePhotoAddSuccess} />}
    </section>
  );
}
export default AlbumSection;