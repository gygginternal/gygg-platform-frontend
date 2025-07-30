import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import Badge from './Badge';
import { StatusBadge } from './StatusBadge'; // Assuming you have a StatusBadge component
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
// import { Button } from "../components/ui/button"; // Removed
import styles from './GigApplications.module.css'; // Import CSS module
import PropTypes from 'prop-types';

function TaskerCard({ tasker, onAccept, onReject, onClick }) {
  if (!tasker) {
    return (
      <div className={styles.offerCard}>
        <div className={styles.offerCardContent}>
          <div className={styles.offerCardImageContainer}>
            <img
              src="/placeholder.svg"
              alt="Tasker profile"
              className={styles.offerCardImage}
            />
          </div>
          <div className={styles.offerCardDetails}>
            <div className={styles.offerCardHeader}>
              <div>
                <h2 className={styles.offerCardTitle}>Tasker not available</h2>
                <p className={styles.offerCardRate}>N/A</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleKeyDown = e => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={styles.offerCard}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.offerCardContent}>
        <div className={styles.offerCardImageContainer}>
          <img
            src={tasker.image || '/placeholder.svg'}
            alt={`${tasker.name || 'Tasker'}'s profile`}
            className={styles.offerCardImage}
          />
        </div>
        <div className={styles.offerCardDetails}>
          <div className={styles.offerCardHeader}>
            <div>
              <StatusBadge
                className={styles.statusBadgeMargin}
                status={
                  tasker.status === 'accepted'
                    ? 'Accepted'
                    : tasker.status === 'rejected'
                      ? 'Rejected'
                      : tasker.status === 'pending'
                        ? 'Pending'
                        : 'Active'
                }
              />
              <h2 className={styles.offerCardTitle}>
                {tasker.name || 'Unknown Tasker'}
              </h2>
              <p className={styles.offerCardRate}>{tasker.rate || 'N/A'}</p>
              {tasker.location &&
                tasker.location.trim().split(',').filter(Boolean).length >
                  0 && (
                  <div className={styles.location}>
                    <MapPin className={styles.locationIcon} />
                    <span>{tasker.location}</span>
                  </div>
                )}
            </div>
          </div>
          <div className={styles.providerServicesGap}>
            {(tasker.services || []).map(service => (
              <Badge key={service} variant="outline" className={styles.badge}>
                {service}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

TaskerCard.propTypes = {
  tasker: PropTypes.object.isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onClick: PropTypes.func,
};

function TaskerModal({
  tasker,
  isOpen,
  onClose,
  onAccept,
  onReject,
  isLoading,
}) {
  if (!isOpen || !tasker) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} tabIndex={-1}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
        >
          &times;
        </button>

        <div className={styles.modalHeader}>
          <h2 id="modal-title">Tasker Details</h2>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalTaskerInfo}>
            <img
              src={tasker.image || '/placeholder.svg'}
              alt={`${tasker.name || 'Tasker'}'s profile`}
              className={styles.modalTaskerImage}
            />
            <div className={styles.modalTaskerDetails}>
              <h3>{tasker.name || 'Unknown Tasker'}</h3>
              <p className={styles.modalTaskerLocation}>
                {tasker.location || 'Location not specified'}
              </p>
              <p className={styles.modalTaskerDescription}>
                {tasker.description || 'No description provided'}
              </p>
            </div>
          </div>

          <div className={styles.modalServices}>
            <h4>Skills & Services:</h4>
            <div className={styles.modalServicesList}>
              {(tasker.services || []).map(service => (
                <Badge key={service} variant="outline" className={styles.badge}>
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <div className={styles.modalActions}>
            {tasker.status === 'accepted' ? (
              <>
                <div className={styles.statusMessage}>
                  <p>✅ This tasker has been accepted</p>
                  <p>Contract has been created and work can begin.</p>
                </div>
                <button
                  className={`${styles.acceptButton} ${styles.button}`}
                  onClick={onClose}
                >
                  Close
                </button>
              </>
            ) : tasker.status === 'rejected' ? (
              <>
                <div className={styles.statusMessage}>
                  <p>❌ This tasker has been rejected</p>
                </div>
                <button
                  className={`${styles.acceptButton} ${styles.button}`}
                  onClick={onClose}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  className={`${styles.acceptButton} ${styles.button}`}
                  onClick={() => onAccept(tasker.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Accepting...' : 'Accept Tasker'}
                </button>
                <button
                  className={`${styles.rejectButton} ${styles.button}`}
                  onClick={() => onReject(tasker.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Rejecting...' : 'Reject Tasker'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

TaskerModal.propTypes = {
  tasker: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export const GigApplications = ({ gigId, onOffer, onReject }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [applications, setApplications] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTasker, setSelectedTasker] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch applications with pagination
  useQuery({
    queryKey: ['gigApplications', gigId, currentPage],
    queryFn: async () => {
      const response = await apiClient.get(
        `/gigs/${gigId}/applications?page=${currentPage}`
      );
      const { data } = response;
      if (data && data.data && data.data.applications) {
        setApplications(prev => [...prev, ...data.data.applications]);
        setHasMore(currentPage < (data.totalPages || 1));
      }
      return response.data;
    },
    enabled: !!gigId && hasMore,
  });

  // Mutation for accepting a tasker
  const acceptMutation = useMutation({
    mutationFn: async applicationId => {
      const response = await apiClient.patch(
        `/applications/${applicationId}/accept`
      );
      return response.data;
    },
    onSuccess: data => {
      // Refresh applications list
      queryClient.invalidateQueries(['gigApplications', gigId]);
      setShowModal(false);
      setSelectedTasker(null);
      showToast('Tasker accepted successfully!', 'success');

      // Navigate to contract if created
      const contractId = data?.data?.contract?._id;
      if (contractId) {
        navigate(`/contracts/${contractId}`);
      } else {
        navigate('/contracts');
      }
    },
    onError: error => {
      console.error('Failed to accept tasker:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to accept tasker. Please try again.';
      showToast(errorMessage, 'error');

      // Refresh applications list even on error to get current status
      queryClient.invalidateQueries(['gigApplications', gigId]);
      setShowModal(false);
      setSelectedTasker(null);
    },
  });

  // Mutation for rejecting a tasker
  const rejectMutation = useMutation({
    mutationFn: async applicationId => {
      await apiClient.patch(`/applications/${applicationId}/reject`);
    },
    onSuccess: () => {
      // Refresh applications list
      queryClient.invalidateQueries(['gigApplications', gigId]);
      setShowModal(false);
      setSelectedTasker(null);
      showToast('Tasker rejected successfully!', 'success');
    },
    onError: error => {
      console.error('Failed to reject tasker:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to reject tasker. Please try again.';
      showToast(errorMessage, 'error');

      // Refresh applications list even on error to get current status
      queryClient.invalidateQueries(['gigApplications', gigId]);
      setShowModal(false);
      setSelectedTasker(null);
    },
  });

  const handleTaskerClick = tasker => {
    setSelectedTasker(tasker);
    setShowModal(true);
  };

  const handleAccept = applicationId => {
    acceptMutation.mutate(applicationId);
  };

  const handleReject = applicationId => {
    rejectMutation.mutate(applicationId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTasker(null);
  };

  const isLoading = acceptMutation.isLoading || rejectMutation.isLoading;

  return (
    <div className={styles.applicationsList}>
      {applications.length === 0 ? (
        <div className={styles.noApplications}>No applications found.</div>
      ) : (
        applications.map(app => (
          <TaskerCard
            key={app.id}
            tasker={app}
            onClick={() => handleTaskerClick(app)}
          />
        ))
      )}

      <TaskerModal
        tasker={selectedTasker}
        isOpen={showModal}
        onClose={handleCloseModal}
        onAccept={handleAccept}
        onReject={handleReject}
        isLoading={isLoading}
      />
    </div>
  );
};

GigApplications.propTypes = {
  gigId: PropTypes.string.isRequired,
  onOffer: PropTypes.func,
  onReject: PropTypes.func,
};
