import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import Badge from '../Shared/Badge';
import StatusBadge from '../ContractsPage/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
// import { Button } from "../components/ui/button"; // Removed
import styles from './GigApplications.module.css'; // Import CSS module
import PropTypes from 'prop-types';

function OfferCard({ offer, onDelete, onAccept, onDecline, isProvider }) {
  const provider = offer.provider || {}; // Assuming offer has a provider object

  return (
    <div className={styles.offerCard}>
      <div className={styles.offerCardContent}>
        <div className={styles.offerCardImageContainer}>
          <img
            src={offer.image || '/placeholder.svg'}
            alt={`${offer.name}'s profile`}
            className={styles.offerCardImage}
          />
        </div>
        <div className={styles.offerCardDetails}>
          <div className={styles.offerCardHeader}>
            <div>
              <h2 className={styles.offerCardTitle}>{offer.name}</h2>
              <p className={styles.offerCardRate}>{offer.rate}</p>
              {provider.location &&
                provider.location.trim().split(',').filter(Boolean).length >
                  0 && (
                  <div className={styles.location}>
                    <MapPin className={styles.locationIcon} />
                    <span>{provider.location}</span>
                  </div>
                )}
            </div>
          </div>
          <div className={styles.buttonGroup}>
            {isProvider ? (
              <button
                className={`${styles.deleteOfferButton} ${styles.button}`}
                onClick={() => onDelete(offer._id)}
              >
                Delete Offer
              </button>
            ) : (
              <>
                <button
                  className={`${styles.acceptButton} ${styles.button}`}
                  onClick={() => onAccept(offer._id)}
                >
                  Accept Offer
                </button>
                <button
                  className={`${styles.declineButton} ${styles.button}`}
                  onClick={() => onDecline(offer._id)}
                >
                  Decline Offer
                </button>
              </>
            )}
          </div>

          <p className={styles.offerCardDescription}>{offer.description}</p>

          <div className={styles.skillsContainer}>
            {provider.skills.map(service => (
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

OfferCard.propTypes = {
  offer: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onAccept: PropTypes.func,
  onDecline: PropTypes.func,
  isProvider: PropTypes.bool,
};

function ProviderCard({ provider, onOffer, onReject }) {
  return (
    <div className={styles.offerCard}>
      <div className={styles.offerCardContent}>
        <div className={styles.offerCardImageContainer}>
          <img
            src={provider.image || '/placeholder.svg'}
            alt={`${provider.name}'s profile`}
            className={styles.offerCardImage}
          />
        </div>
        <div className={styles.offerCardDetails}>
          <div className={styles.offerCardHeader}>
            <div>
              <StatusBadge
                className={styles.statusBadgeMargin}
                status={provider.status === 'rejected' ? 'Rejected' : 'Active'}
              />
              <h2 className={styles.offerCardTitle}>{provider.name}</h2>
              <p className={styles.offerCardRate}>{provider.rate}</p>
              {provider.location &&
                provider.location.trim().split(',').filter(Boolean).length >
                  0 && (
                  <div className={styles.location}>
                    <MapPin className={styles.locationIcon} />
                    <span>{provider.location}</span>
                  </div>
                )}
            </div>
          </div>
          <div className={styles.providerServicesGap}>
            {provider.services.map(service => (
              <Badge key={service} variant="outline" className={styles.badge}>
                {service}
              </Badge>
            ))}
          </div>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.sendOfferButton} ${styles.button}`}
              onClick={() => onOffer(provider.id)}
            >
              Send Offer
            </button>
            <button
              className={`${styles.rejectApplicationButton} ${styles.button}`}
              onClick={() => onReject(provider.id)}
            >
              Decline application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProviderCard.propTypes = {
  provider: PropTypes.object.isRequired,
  onOffer: PropTypes.func,
  onReject: PropTypes.func,
};

export const GigApplications = () => {
  const { gigId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [applications, setApplications] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { isLoading, isError } = useQuery({
    queryKey: ['gigApplications', gigId, currentPage],
    queryFn: async () => {
      const response = await apiClient.get(
        `/gigs/${gigId}/applications?page=${currentPage}`
      );
      const { data } = response;
      if (data && data.data && data.data.applications) {
        setApplications(prev => [...prev, ...data.data.applications]);
        setHasMore(currentPage < data.totalPages);
      }
      return response.data;
    },
    enabled: !!gigId && hasMore,
  });

  const offerMutation = useMutation({
    mutationFn: async applicationId => {
      await apiClient.post(`/applications/${applicationId}/offer`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gigApplications', gigId]);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async applicationId => {
      await apiClient.patch(`/applications/${applicationId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gigApplications', gigId]);
    },
  });

  const { data: offerData, isLoading: isOfferLoading } = useQuery({
    queryKey: ['gigOffer', gigId],
    queryFn: async () => {
      const response = await apiClient.get(`/gigs/${gigId}/offer`);
      return response.data.data.offer;
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async offerId => {
      await apiClient.delete(`/offers/${offerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gigOffers', gigId]);
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async offerId => {
      await apiClient.patch(`/offers/${offerId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gigOffers', gigId]);
    },
  });

  const declineOfferMutation = useMutation({
    mutationFn: async offerId => {
      await apiClient.patch(`/offers/${offerId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gigOffers', gigId]);
    },
  });

  const handleDeleteOffer = async offerId => {
    await deleteOfferMutation.mutateAsync(offerId);
  };

  const handleAcceptOffer = async offerId => {
    await acceptOfferMutation.mutateAsync(offerId);
  };

  const handleDeclineOffer = async offerId => {
    await declineOfferMutation.mutateAsync(offerId);
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleOffer = async applicationId => {
    await offerMutation.mutateAsync(applicationId);
  };

  const handleReject = async applicationId => {
    await rejectMutation.mutateAsync(applicationId);
  };

  if (isLoading || isOfferLoading) {
    return <p>Loading applications...</p>;
  }

  if (isError) {
    return <p>Error loading applications or offers.</p>;
  }

  const isProviderUser = user?.role === 'provider';

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Applications & Offers</h1>
      {isProviderUser && offerData && (
        <div className={styles.section}>
          <h2 className={styles.subheading}>Your Offer</h2>
          <OfferCard
            offer={offerData}
            onDelete={handleDeleteOffer}
            onAccept={handleAcceptOffer}
            onDecline={handleDeclineOffer}
            isProvider
          />
        </div>
      )}
      <div className={styles.section}>
        <h2 className={styles.subheading}>
          {isProviderUser ? 'Received Applications' : 'Your Offers'}
        </h2>
        {applications.length > 0 ? (
          <div className={styles.cardList}>
            {applications.map(application => (
              <ProviderCard
                key={application._id}
                provider={application.applicant}
                onOffer={handleOffer}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <p className={styles.noApplicationsMessage}>No applications yet.</p>
        )}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={styles.loadMoreButton}
          >
            {isLoading ? 'Loading more...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
};

GigApplications.propTypes = {
  onOffer: PropTypes.func,
  onReject: PropTypes.func,
};
