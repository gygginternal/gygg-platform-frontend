import React from "react";
import styles from "./AlbumCard.module.css"; // Create CSS module

function AlbumCard({ image, caption }) {
  const handleImageError = (e) => { e.target.src = '/image-placeholder.png'; }; // Add fallback image
  return (
    <figure className={styles.albumItem}>
      {/* Use standard img */}
      <img src={image || '/image-placeholder.png'} alt={caption || 'Album image'} className={styles.albumImage} onError={handleImageError} loading="lazy"/>
      <figcaption className={styles.albumCaption}>{caption || 'No caption'}</figcaption>
    </figure>
  );
}
export default AlbumCard;