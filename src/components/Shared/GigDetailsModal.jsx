import React, { useState, useEffect, useRef } from 'react';
import styles from './GigDetailsModal.module.css';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
// Removed useContracts import to avoid circular dependency

const timeAgo = date => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `Posted ${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `Posted ${Math.floor(diff / 3600)} hours ago`;
  return `Posted ${Math.floor(diff / 86400)} days ago`;
};

const GigDetailsModal = ({
  gig,
  open,
  onClose,
  onApply,
  showRetract,
  applicationId,
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();
  // Removed useContracts to avoid circular dependency - addContract functionality can be added later if needed
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
    pay = `$${cost} (fixed)`;
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

  const formatLocation = loc => {
    if (!loc) return 'Location not specified';
    if (typeof loc === 'string') return loc;
    const parts = [];
    if (loc.city) parts.push(loc.city);
    if (loc.state) parts.push(loc.state);
    if (loc.country) parts.push(loc.country);
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const handleApply = async () => {
    setLoading(true);
    setFeedback('');
    try {
      // Adjust endpoint as needed for your backend
      const res = await apiClient.post(`/gigs/${_id}/applications`);
      setFeedback('Application submitted!');
      // If backend returns contract, we could add it to contracts context later
      // if (res.data?.data?.contract && addContract) {
      //   addContract(res.data.data.contract);
      // }
      if (onApply) onApply();
      setTimeout(() => {
        navigate('/contracts');
      }, 1000);
    } catch (err) {
      setFeedback(
        err.response?.data?.message || 'Failed to apply for this gig.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetract = async () => {
    setLoading(true);
    setFeedback('');
    try {
      await apiClient.patch(`/applications/${applicationId}/cancel`);
      setFeedback('Application retracted.');
      if (onApply) onApply();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setFeedback(
        err.response?.data?.message || 'Failed to retract application.'
      );
    } finally {
      setLoading(false);
    }
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
          <h2 className={styles.modalTitle}>Gig Detail</h2>
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
            <Link
              to={`/user-profile/${user._id}`}
              className={styles.modalViewProfileBlack}
              onClick={e => {
                e.stopPropagation();
              }}
            >
              View Profile
            </Link>
          )}
          <span className={styles.modalPostedTime}>{timeAgo(createdAt)}</span>
        </div>
        <div className={styles.modalDescription}>{description}</div>
        <div className={styles.modalDetailsRow}>
          <span className={styles.modalLocation}>
            <span className={styles.icon}>📍</span>
            {formatLocation(location)}
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
        {feedback && <div className={styles.modalFeedback}>{feedback}</div>}
        <div className={styles.modalActions}>
          {showRetract ? (
            <button
              className={styles.modalApplyButton}
              onClick={handleRetract}
              disabled={loading}
            >
              {loading ? 'Retracting...' : 'Retract'}
            </button>
          ) : (
            <button
              className={styles.modalApplyButton}
              onClick={handleApply}
              disabled={loading}
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetailsModal;
