import React, { useState, useEffect, useRef } from 'react';
import styles from './GigDetailsModal.module.css';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';

const timeAgo = date => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `Posted ${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `Posted ${Math.floor(diff / 3600)} hours ago`;
  return `Posted ${Math.floor(diff / 86400)} days ago`;
};

const ProviderGigDetailsModal = ({ gig, open, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Focus the modal for accessibility
      if (modalRef.current) modalRef.current.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Trap focus inside modal
  useEffect(() => {
    if (!open) return;
    const handleTab = e => {
      if (!modalRef.current) return;
      const focusableEls = Array.from(
        modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      const [firstEl] = focusableEls;
      const lastEl = focusableEls[focusableEls.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open, onClose]);

  if (!open || !gig) return null;

  const {
    _id,
    title,
    description,
    location,
    cost,
    ratePerHour,
    duration,
    createdAt,
    provider,
    postedBy,
    applicationCount = 0,
  } = gig;

  const user = provider || postedBy || {};
  const name =
    user.name ||
    user.fullName ||
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : 'Anonymous');
  const profileImage =
    user.profileImage && user.profileImage !== 'default.jpg'
      ? user.profileImage
      : '/default-profile.png';

  let pay = '';
  if (
    typeof cost === 'number' &&
    !isNaN(cost) &&
    (typeof ratePerHour !== 'number' || isNaN(ratePerHour)) &&
    (typeof duration !== 'number' || isNaN(duration))
  ) {
    pay = `$${cost}`;
  } else if (
    typeof ratePerHour === 'number' &&
    !isNaN(ratePerHour) &&
    typeof duration === 'number' &&
    !isNaN(duration)
  ) {
    pay = `$${ratePerHour}/hr`;
  } else {
    pay = '—';
  }

  const hours =
    typeof duration === 'number' && !isNaN(duration)
      ? `${duration} hours`
      : null;

  const formatLocation = () => {
    // Use gig's location if available, otherwise fall back to provider's address
    const gigLocation = gig.location;
    
    if (gigLocation && (gigLocation.city || gigLocation.state)) {
      const parts = [];
      if (gigLocation.city) parts.push(gigLocation.city);
      if (gigLocation.state) parts.push(gigLocation.state);
      return parts.join(', ');
    }
    
    // Fallback to provider's address if gig location is not available
    const providerAddress = user.address;
    if (providerAddress && (providerAddress.city || providerAddress.state)) {
      const parts = [];
      if (providerAddress.city) parts.push(providerAddress.city);
      if (providerAddress.state) parts.push(providerAddress.state);
      return parts.join(', ');
    }
    
    return 'Location not specified';
  };

  const handleViewApplications = () => {
    // Navigate to posted gigs page with a view parameter to show applications
    navigate(`/posted-gigs?gigId=${_id}&view=applications`);
    onClose();
  };

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 9999, display: open ? 'flex' : 'none' }}
    >
      <div className={styles.modalContent} ref={modalRef} tabIndex={-1}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Gig Details</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✖
          </button>
        </div>
        <div className={styles.modalSubHeader}>
          <span className={styles.modalGigTitle}>{title}</span>
        </div>
        <div className={styles.modalProviderRow}>
          <img
            src={profileImage}
            alt={name}
            className={styles.modalProfileImage}
          />
          <span className={styles.modalProviderName}>{name}</span>
          {user._id && (
            <a
              href={`/userprofile/${user._id}`}
              className={styles.modalViewProfileBlack}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Profile
            </a>
          )}
          <span className={styles.modalPostedTime}>{timeAgo(createdAt)}</span>
        </div>
        <div className={styles.modalDescription}>{description}</div>
        <div className={styles.modalDetailsRow}>
          <span className={styles.modalLocation}>
            <span className={styles.icon}>📍</span>
            {formatLocation()}
          </span>
          <span className={styles.modalPay}>
            Pay <span className={styles.modalPayValue}>{pay}</span>
          </span>
          {hours && (
            <span className={styles.modalHours}>
              Need for <span className={styles.modalHoursValue}>{hours}</span>
            </span>
          )}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalCloseButton} onClick={onClose}>
            Close
          </button>
          <button
            className={styles.modalApplyButton}
            onClick={handleViewApplications}
          >
            View Applications ({applicationCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderGigDetailsModal;
