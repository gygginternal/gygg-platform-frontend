
import React, { useState, useEffect } from "react";
import styles from "./AlbumSection.module.css"; // Create CSS module
import AlbumCard from "./AlbumCard";
import AddPhotoModal from "./AddPhotoModal";
import apiClient from "../api/axiosConfig"; // Adjust path
import logger from "../utils/logger"; // Adjust path
import { useAuth } from "../context/AuthContext";

function AlbumSection() {
  const { user } = useAuth();
  // TODO: Replace initialAlbumData with fetched data
  const [albumData, setAlbumData] = useState([]); // Start empty
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 3; // Items per "page" in the carousel view

  // Fetch album data
  useEffect(() => {
      const fetchAlbum = async () => {
           if (!user?._id) return; // Don't fetch if no user
           setLoading(true); setError('');
           try {
                // TODO: Adjust endpoint - get album for specific user (maybe /users/:userId/album or /users/me/album)
                // const response = await apiClient.get(`/users/me/album`);
                // setAlbumData(response.data.data.album || []);
                logger.warn("Album fetching not implemented - using static data");
                setAlbumData([ // Replace with fetched data
                    { _id: '1', image: "/assets/image-587.png", caption: "Daily stroll 🐾" },
                    { _id: '2', image: "/assets/image-588.png", caption: "POV" },
                    { _id: '3', image: "/assets/image-589.png", caption: "Oddly satisfying 🥕🥕🥕" },
                    { _id: '4', image: "/assets/image-590.png", caption: "Took only about 6 hours.." },
                ]);
           } catch (err) {
                logger.error("Error fetching album:", err);
                setError("Could not load album photos.");
           } finally {
                setLoading(false);
           }
      };
      fetchAlbum();
  }, [user]); // Refetch if user changes

  const totalPages = Math.ceil(albumData.length / itemsPerPage);

  const handleDotClick = (index) => setCurrentPage(index);
  const handleAddClick = () => setShowModal(true);
  const handleAddPhoto = (newPhoto) => {
    // This currently adds the temporary preview URL.
    // Ideally, the backend upload returns the final URL and data,
    // and we refetch the album or add the confirmed data here.
    logger.info("Adding photo (preview):", newPhoto);
    setAlbumData((prevData) => [...prevData, { _id: Date.now().toString(), ...newPhoto }]); // Add temporary ID
    setShowModal(false);
  };

  // Image error handler
  const handleImageError = (e) => { e.target.style.display = 'none'; };

  return (
    <section className={`${styles.albumCard} card`}> {/* Add card class */}
      <div className={styles.albumHeader}>
        <h2>Album</h2>
        {/* Add Photo Button */}
        <button className={styles.addButton} onClick={handleAddClick} aria-label="Add photo to album">
           <img src="/add-circle.svg" alt="Add" className={styles.addIcon} onError={handleImageError}/> {/* Ensure icon in public */}
        </button>
      </div>

       {loading && <p>Loading album...</p>}
       {error && <p className="error-message">{error}</p>}

       {!loading && !error && (
           albumData.length > 0 ? (
               <>
                   <div className={styles.albumGrid}>
                       {albumData
                           .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                           .map((album) => (
                               <AlbumCard key={album._id} image={album.image} caption={album.caption} />
                           ))}
                   </div>

                   {totalPages > 1 && (
                       <div className={styles.paginationDots}>
                           {Array.from({ length: totalPages }).map((_, index) => (
                               <button // Use buttons for accessibility
                                   key={index}
                                   aria-label={`Go to page ${index + 1}`}
                                   className={`${styles.dot} ${index === currentPage ? styles.activeDot : ""}`}
                                   onClick={() => handleDotClick(index)}
                               />
                           ))}
                       </div>
                   )}
               </>
           ) : (
               <div className={styles.noAlbums}>
                   <p>Showcase your work by adding photos to your album.</p>
                   <button className={styles.addTaskButton} onClick={handleAddClick}>
                       Add Photo
                   </button>
               </div>
           )
       )}

      {/* Render Modal conditionally */}
      {showModal && <AddPhotoModal onClose={() => setShowModal(false)} onAdd={handleAddPhoto} />}
    </section>
  );
}
export default AlbumSection;