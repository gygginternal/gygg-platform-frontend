// src/components/GigsPage/TaskCard.js
import React, { useState } from "react";
import styles from "./TaskCard.module.css"; // Your CSS module
import { Link, useNavigate } from "react-router-dom";

// Simple Icon component for reusability
const Icon = ({ src, alt, className = "", width = 16, height = 16 }) => (
  <img
    src={src} // Assumes src is like "/assets/location.svg" (pointing to public folder)
    alt={alt}
    className={className}
    width={width}
    height={height}
    onError={(e) => {
      // Fallback if icon is missing - hide or show text
      e.currentTarget.style.display = 'none';
      // Or: e.currentTarget.outerHTML = `<span>${alt || ''}</span>`;
    }}
  />
);

function TaskCard({ gig }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Defensive checks for essential data
  if (!gig || !gig._id) {
    return (
      <article className={styles.taskCard} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Gig data is unavailable.</p>
      </article>
    );
  }

  // --- Data Mapping with Fallbacks ---
  const postedBy = gig.postedBy || {}; // Ensure postedBy object exists
  const profileImage = (postedBy.profileImage && postedBy.profileImage !== 'default.jpg')
    ? postedBy.profileImage // Assuming this is a full URL from S3/Cloudinary
    : "/assets/default-profile.png"; // Generic fallback in public/assets/
  const author = postedBy.fullName || `${postedBy.firstName || 'Unknown'} ${postedBy.lastName || 'User'}`.trim();
  const title = gig.title || "Untitled Gig";

  let rate = "Rate N/A";
  if (gig.ratePerHour && gig.ratePerHour > 0) {
    rate = `$${parseFloat(gig.ratePerHour).toFixed(2)}/hr`;
  } else if (gig.cost && gig.cost > 0) {
    rate = `$${parseFloat(gig.cost).toFixed(2)} (fixed)`;
  }

  const location = gig.location?.city || gig.location?.address || (gig.isRemote ? "Remote" : "Location not specified");
  const postedTime = gig.createdAt
    ? `Posted ${new Date(gig.createdAt).toLocaleDateString()}` // Simple date
    : "Posted recently";

  // --- Event Handlers ---
  const handleImageError = (e) => { e.currentTarget.src = "/assets/default-profile.png"; };

  const handleViewAndApply = (e) => {
    e.stopPropagation(); // Prevent card click if button inside modal is clicked
    navigate(`/gigs/${gig._id}`); // Navigate to full detail page
    setIsModalOpen(false); // Close modal
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = (e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }; // Close on overlay click
  const closeWithButton = (e) => { e.stopPropagation(); setIsModalOpen(false); };

  return (
    <>
      {/* Task Card - Click to open modal */}
      <article
        className={styles.taskCard}
        onClick={openModal}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && openModal()} // Accessibility
        role="button"
        tabIndex={0}
        aria-label={`View details for gig: ${title}`}
      >
        <img
          src={profileImage}
          alt={`${author}'s profile`}
          className={styles.taskImage}
          // width={155} // Let CSS handle fixed dimensions if needed
          // height={182}
          onError={handleImageError}
          loading="lazy"
        />
        <div className={styles.taskContent}>
          <p className={styles.taskAuthor}>{author}</p>
          {/* Title is a link to the full detail page, also stops modal propagation */}
          <Link
            to={`/gigs/${gig._id}`}
            className={styles.taskTitle}
            onClick={(e) => e.stopPropagation()} // Don't open modal if title link clicked
          >
            {title}
          </Link>
          <p className={styles.taskRate}>{rate}</p>
          <div className={styles.taskDetails}>
            <div className={styles.taskLocation}>
              <Icon src="/assets/location.svg" className={styles.locationIcon} alt="Location icon" />
              <span>{location}</span>
            </div>
            <span className={styles.taskTime}>{postedTime}</span>
          </div>
        </div>
      </article>

      {/* Modal (Popup) for Quick View */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby={`modal-title-${gig._id}`}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} role="document">
            <div className={styles.modalHeader}>
              <h2 id={`modal-title-${gig._id}`}>Gig Details</h2>
              <button className={styles.closeButton} onClick={closeWithButton} aria-label="Close gig details modal">
                <Icon src="/assets/close.svg" alt="Close" className={styles.closeIcon} width={18} height={18} />
              </button>
            </div>

            <div className={styles.mainContent}>
              <h3 className={styles.modalGigTitle}>{title}</h3>
              <div className={styles.profileTopRow}>
                <div className={styles.profileLeft}>
                  <span className={styles.taskAuthor}>{author}</span>
                  <Link to={`/users/${gig.postedBy._id}`} className={styles.viewProfile} onClick={(e) => e.stopPropagation()}>View Profile</Link>
                </div>
                <span className={styles.taskTime}>{postedTime}</span>
              </div>
              <p className={styles.description}>{gig.description || "No detailed description provided."}</p>
              <div className={styles.taskRow}>
                <div className={styles.taskLocation}>
                  <Icon src="/assets/location.svg" className={styles.locationIcon} alt="Location icon" />
                  <span>{location}</span>
                </div>
                <p className={styles.taskTime}>Pay <span className={styles.taskRate}>{rate}</span></p>
                {gig.duration && <span className={styles.taskTime}>Est. <span className={styles.taskRate}>{gig.duration}hr</span></span>}
              </div>
              <div className={styles.line}></div>
              <button className={styles.applyButton} onClick={handleViewAndApply}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskCard;