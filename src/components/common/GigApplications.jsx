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

function TaskerCard({ tasker, onAccept, onReject, onClick, onViewProfile, onMessage }) {
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

  // Get compatibility color based on score
  const getCompatibilityColor = score => {
    if (score >= 80) return '#22c55e'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const compatibilityScore = tasker.compatibilityScore || 0;
  const matchingHobbies = tasker.matchingHobbies || [];

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
        {/* Profile Image */}
        <div className={styles.offerCardImageContainer}>
          <img
            src={tasker.image || '/placeholder.svg'}
            alt={`${tasker.name || 'Tasker'}'s profile`}
            className={styles.offerCardImage}
          />
          {/* Compatibility Badge */}
          {compatibilityScore > 0 && (
            <div
              className={styles.compatibilityBadge}
              style={{
                backgroundColor: getCompatibilityColor(compatibilityScore),
              }}
            >
              {compatibilityScore}% Match
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={styles.offerCardDetails}>
          {/* Header with name and rate */}
          <div className={styles.offerCardHeader}>
            <h2 className={styles.offerCardTitle}>
              {tasker.name || 'Unknown Tasker'}
            </h2>
            <p className={styles.offerCardRate}>
              {tasker.ratePerHour
                ? `$${tasker.ratePerHour}/hr`
                : 'No ratings yet'}
            </p>
          </div>

          {/* Meta information */}
          <div className={styles.offerCardMeta}>
            {tasker.location &&
              tasker.location.trim().split(',').filter(Boolean).length > 0 && (
                <div className={styles.location}>
                  <MapPin className={styles.locationIcon} />
                  <span>{tasker.location}</span>
                </div>
              )}
          </div>

          {/* Description */}
          {tasker.description && (
            <p className={styles.offerCardDescription}>{tasker.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.offerCardActions}>
          <button
            className={styles.viewProfileButton}
            onClick={e => {
              e.stopPropagation();
              if (onViewProfile && tasker._id) {
                onViewProfile(tasker._id);
              } else if (onViewProfile && tasker.user?._id) {
                onViewProfile(tasker.user._id);
              }
            }}
          >
            View Profile
          </button>
          <button
            className={styles.messageButton}
            onClick={e => {
              e.stopPropagation();
              if (onMessage && tasker._id) {
                onMessage(tasker._id);
              } else if (onMessage && tasker.user?._id) {
                onMessage(tasker.user._id);
              }
            }}
          >
            Message
          </button>
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
  onViewProfile: PropTypes.func,
  onMessage: PropTypes.func,
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
        <div className={styles.modalHeader}>
          <h2 id="modal-title">Tasker Details</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                onClose();
              }
            }}
          >
            ✖
          </button>
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
                <Badge key={service} variant="service">
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
                  onClick={() => {
                    // Validate that tasker.id exists and is not empty
                    const taskId = tasker._id || tasker.id;
                    if (!taskId || taskId.trim() === '') {
                      console.error('Invalid tasker ID:', taskId);
                      return;
                    }
                    onAccept(taskId);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Accepting...' : 'Accept Tasker'}
                </button>
                <button
                  className={`${styles.rejectButton} ${styles.button}`}
                  onClick={() => {
                    // Validate that tasker.id exists and is not empty
                    const taskId = tasker._id || tasker.id;
                    if (!taskId || taskId.trim() === '') {
                      console.error('Invalid tasker ID:', taskId);
                      return;
                    }
                    onReject(taskId);
                  }}
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

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

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
      // Validate applicationId before making the request
      if (!applicationId || applicationId.toString().trim() === '') {
        throw new Error('Invalid application ID provided');
      }
      
      const response = await apiClient.patch(
        `/applications/${applicationId.toString()}/accept`
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
      // Validate applicationId before making the request
      if (!applicationId || applicationId.toString().trim() === '') {
        throw new Error('Invalid application ID provided');
      }
      
      await apiClient.patch(`/applications/${applicationId.toString()}/reject`);
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
    // Map the API response to expected modal properties
    const user = tasker.user || tasker; // Use user object if populated, otherwise use tasker directly
    const taskerDetails = {
      ...tasker,
      name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Tasker',
      image: user.profileImage || user.avatar || user.image || '/placeholder.svg',
      location: user.address 
        ? `${user.address.city || ''}${user.address.state ? `, ${user.address.state}` : ''}`.trim() 
        : 'Location not specified',
      description: user.bio || 'No description provided',
      rating: user.rating || 0,
      ratingCount: user.ratingCount || 0,
      skills: user.skills || [],
      hobbies: user.hobbies || [],
      id: tasker._id || tasker.id,
      _id: tasker._id || tasker.id
    };
    
    setSelectedTasker(taskerDetails);
    setShowModal(true);
  };

  const handleAccept = applicationId => {
    // Validate applicationId before proceeding
    if (!applicationId || applicationId.toString().trim() === '') {
      showToast('Invalid application ID. Please try again.', 'error');
      console.error('handleAccept called with invalid applicationId:', applicationId);
      return;
    }
    acceptMutation.mutate(applicationId.toString());
  };

  const handleReject = applicationId => {
    // Validate applicationId before proceeding
    if (!applicationId || applicationId.toString().trim() === '') {
      showToast('Invalid application ID. Please try again.', 'error');
      console.error('handleReject called with invalid applicationId:', applicationId);
      return;
    }
    rejectMutation.mutate(applicationId.toString());
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
        applications.map(app => {
          // Map the API response to expected TaskerCard properties
          const user = app.user || app; // Use user object if populated, otherwise use app directly
          const taskerData = {
            ...app,
            name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Tasker',
            image: user.profileImage || user.avatar || user.image || '/placeholder.svg',
            location: user.address 
              ? `${user.address.city || ''}${user.address.state ? `, ${user.address.state}` : ''}`.trim() 
              : 'Location not specified',
            description: user.bio || 'No description provided',
            rating: user.rating || 0,
            ratingCount: user.ratingCount || 0,
            skills: user.skills || [],
            hobbies: user.hobbies || [],
            id: app._id || app.id,
            _id: app._id || app.id
          };
          
          return (
            <TaskerCard
              key={app._id || app.id}
              tasker={taskerData}
              onClick={() => handleTaskerClick(taskerData)}
              onViewProfile={handleViewProfile}
              onMessage={handleMessage}
            />
          );
        })
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
