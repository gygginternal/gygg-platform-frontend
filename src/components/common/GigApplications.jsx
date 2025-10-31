import React, { useState } from 'react';
import { MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import GigHelperCard from './GigHelperCard';
import styles from './GigApplications.module.css';
import PropTypes from 'prop-types';

function TaskerModal({
  tasker,
  isOpen,
  onClose,
  onAccept,
  onReject,
  isLoading,
}) {
  if (!isOpen || !tasker) return null;

  // Extract user data properly
  const user = tasker.user || tasker;
  const taskerDetails = {
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

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Tasker Information</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                onClose();
              }
            }}
            aria-label="Close tasker modal"
          >
            ✖
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.modalRow}>
            <b className={styles.modalLabel}>Name:</b>
            <span className={styles.modalValue}>{taskerDetails.name}</span>
          </div>
          <div className={styles.modalRow}>
            <b className={styles.modalLabel}>Location:</b>
            <span className={styles.modalValue}>{taskerDetails.location}</span>
          </div>
          <div className={styles.modalRow}>
            <b className={styles.modalLabel}>Rating:</b>
            <span className={styles.modalValue}>{taskerDetails.rating ? `${taskerDetails.rating.toFixed(1)} (${taskerDetails.ratingCount || 0} reviews)` : 'No rating'}</span>
          </div>
          <div className={styles.modalRow}>
            <b className={styles.modalLabel}>Description:</b>
            <span className={styles.modalValue}>{taskerDetails.description}</span>
          </div>
          {taskerDetails.skills && taskerDetails.skills.length > 0 && (
            <div className={styles.modalRow}>
              <b className={styles.modalLabel}>Skills:</b>
              <div className={styles.skillsContainer}>
                {taskerDetails.skills.map((skill, index) => (
                  <span key={index} className={styles.skillTag}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {taskerDetails.hobbies && taskerDetails.hobbies.length > 0 && (
            <div className={styles.modalRow}>
              <b className={styles.modalLabel}>Interests:</b>
              <div className={styles.skillsContainer}>
                {taskerDetails.hobbies.map((hobby, index) => (
                  <span key={index} className={styles.skillTag}>{hobby}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.modalActions}>
          {tasker.status === 'accepted' ? (
            <>
              <div className={styles.statusMessage}>
                <p>✅ This tasker has been accepted</p>
                <p>Contract has been created and work can begin.</p>
              </div>
              <button
                className={styles.primaryBtn}
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
                className={styles.primaryBtn}
                onClick={onClose}
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.primaryBtn}
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
                className={styles.secondaryBtn}
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
    <>
      {applications.length === 0 ? (
        <div className={styles.noApplications}>
          <h3>No applications yet</h3>
          <p>Applications for your gigs will appear here when taskers apply.</p>
        </div>
      ) : (
        applications.map(app => {
          // Map the API response to expected GigHelperCard properties
          const user = app.user || app; // Use user object if populated, otherwise use app directly
          const helperData = {
            userId: user._id || user.id || app._id || app.id,
            profileImage: user.profileImage || user.avatar || user.image || '/placeholder.svg',
            name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Tasker',
            rate: user.rating ? `★ ${user.rating.toFixed(1)} (${user.ratingCount || 0})` : 'No rating',
            location: user.address 
              ? `${user.address.city || ''}${user.address.state ? `, ${user.address.state}` : ''}`.trim() 
              : 'Location not specified',
            bio: user.bio || 'No description provided',
          };
          
          return (
            <div 
              key={app._id || app.id}
              onClick={() => handleTaskerClick(app)}
              style={{ cursor: 'pointer' }}
            >
              <GigHelperCard
                userId={helperData.userId}
                profileImage={helperData.profileImage}
                name={helperData.name}
                rate={helperData.rate}
                location={helperData.location}
                bio={helperData.bio}
              />
            </div>
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
    </>
  );
};

GigApplications.propTypes = {
  gigId: PropTypes.string.isRequired,
  onOffer: PropTypes.func,
  onReject: PropTypes.func,
};