// src/components/GigsPage/TaskCard.js
import React, { useState } from "react";
import styles from "./TaskCard.module.css"; // Your CSS module
import { Link, useNavigate } from "react-router-dom"; // Use React Router Link & Navigate

// Placeholder Icon component
const Icon = ({ src, alt, className, width = 16, height = 16 }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    width={width}
    height={height}
    onError={(e) => (e.target.style.display = "none")}
  />
);

function TaskCard({ gig }) {
  // Accept a single 'gig' object prop from the backend
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!gig || !gig.postedBy) {
    // Optional: Render a placeholder or null if gig data is incomplete
    return (
      <article className={styles.taskCard}>
        <p>Loading gig data...</p>
      </article>
    );
  }

  // --- Data Mapping ---
  const image = gig.postedBy.profileImage || "/assets/default.png"; // Use postedBy image or fallback
  const author =
    gig.postedBy.fullName ||
    `${gig.postedBy.firstName} ${gig.postedBy.lastName}`;
  const title = gig.title;
  const rate = gig.ratePerHour
    ? `$${gig.ratePerHour}/hr`
    : gig.cost
    ? `$${gig.cost} (fixed)`
    : "N/A"; // Determine rate display
  const location =
    gig.location?.city ||
    gig.location?.address ||
    (gig.isRemote ? "Remote" : "Location N/A");
  const postedTime = gig.createdAt
    ? `Posted ${new Date(gig.createdAt).toLocaleDateString()}`
    : "Recently"; // Format date

  const handleImageError = (e) => {
    e.target.src = "/assets/default.png";
  }; // Fallback image

  const handleApplyClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking button
    // Navigate to the Gig Detail page to handle application/acceptance
    console.log(`Navigating to apply for Gig ID: ${gig._id}`);
    navigate(`/gigs/${gig._id}`);
    // Or directly call the acceptGig API endpoint if appropriate here? Usually better on detail page.
    // alert(`Apply action for "${title}" (ID: ${gig._id}) - Implement navigation or API call`);
    setIsModalOpen(false); // Close modal if open
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = (e) => {
    // Prevent modal closing if click is inside modal content (optional)
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };
  const closeWithButton = (e) => {
    e.stopPropagation(); // Prevent card click trigger
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Task Card */}
      <article
        className={styles.taskCard}
        onClick={openModal}
        role="button"
        tabIndex={0}
      >
        <img
          src={image}
          alt={`${author}'s profile`}
          className={styles.taskImage}
          width={155}
          height={182}
          onError={handleImageError}
        />
        <div className={styles.taskContent}>
          <p className={styles.taskAuthor}>{author}</p>
          {/* Link title to detail page */}
          <Link
            to={`/gigs/${gig._id}`}
            className={styles.taskTitle}
            onClick={(e) => e.stopPropagation()}
          >
            {title}
          </Link>
          <p className={styles.taskRate}>{rate}</p>
          <div className={styles.taskDetails}>
            <div className={styles.taskLocation}>
              <Icon
                src="/assets/location.svg"
                className={styles.locationIcon}
                alt="Location"
              />
              <span>{location}</span>
            </div>
            {/* Consider using a time-ago library for postedTime */}
            <span className={styles.taskTime}>{postedTime}</span>
          </div>
        </div>
      </article>

      {/* Modal (Popup) */}
      {isModalOpen && (
        // Use onClick on overlay for closing when clicking outside modal content
        <div className={styles.modalOverlay} onClick={closeModal}>
          {/* Prevent closing when clicking inside the modal itself */}
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Gig Details</h2>
              <button
                className={styles.closeButton}
                onClick={closeWithButton}
                aria-label="Close modal"
              >
                <Icon
                  src="/assets/close.svg"
                  alt="Close"
                  className={styles.closeIcon}
                  width={18}
                  height={18}
                />
              </button>
            </div>

            <div className={styles.mainContent}>
              {/* Use actual gig title */}
              <h3 className={styles.modalGigTitle}>{title}</h3>

              {/* Profile info */}
              <div className={styles.profileTopRow}>
                <div className={styles.profileLeft}>
                  <span className={styles.taskAuthor}>{author}</span>
                  {/* Link to provider's profile page if you have one */}
                  {/* <Link to={`/users/${gig.postedBy._id}`} className={styles.viewProfile}>View Profile</Link> */}
                </div>
                <span className={styles.taskTime}>{postedTime}</span>
              </div>

              {/* Use actual gig description */}
              <p className={styles.description}>
                {gig.description || "No description provided."}
              </p>

              {/* Details row */}
              <div className={styles.taskRow}>
                <div className={styles.taskLocation}>
                  <Icon
                    src="/assets/location.svg"
                    className={styles.locationIcon}
                    alt="Location"
                  />
                  <span>{location}</span>
                </div>
                <p className={styles.taskTime}>
                  Pay <span className={styles.taskRate}>{rate}</span>
                </p>
                {/* Add duration if available */}
                {gig.duration && (
                  <span className={styles.taskTime}>
                    Est.{" "}
                    <span className={styles.taskRate}>{gig.duration}hr</span>
                  </span>
                )}
              </div>

              <div className={styles.line}></div>

              {/* Apply Button - Navigates to detail page */}
              <button className={styles.applyButton} onClick={handleApplyClick}>
                View & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskCard;
