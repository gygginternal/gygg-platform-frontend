import React, { useEffect, useState } from 'react';
import styles from './ProviderProfilePage.module.css';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/axiosConfig';
import ProviderProfileInfo from '../../components/features/ProviderProfilePage/ProviderProfileInfo';
import RecentHires from '../../components/features/ProviderProfilePage/RecentHires';
import PostedGigs from '../../components/features/ProviderProfilePage/PostedGigs';
import RecentProviderPostSection from '../../components/features/ProviderProfilePage/RecentProviderPostSection';
import { useParams } from 'react-router-dom';

function ProviderProfilePage({ providerId: propProviderId }) {
  const { providerId: urlProviderId } = useParams();
  const { user: loggedInUser } = useAuth();
  const providerId = propProviderId || urlProviderId || loggedInUser?._id;
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProvider = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint;
      if (providerId === loggedInUser?._id) {
        endpoint = '/users/me';
      } else {
        endpoint = `/users/public/${providerId}`;
      }
      const res = await apiClient.get(endpoint);
      setProvider(res.data.data.user);
    } catch (err) {
      setError('Could not load provider profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvider();
  }, [providerId, loggedInUser]);

  if (loading) {
    return <div className={styles.pageStateContainer}>Loading profile...</div>;
  }
  if (error || !provider) {
    return (
      <div className={styles.pageStateContainer}>
        {error || 'Profile not found.'}
      </div>
    );
  }

  const isOwnProfile = provider._id === loggedInUser?._id;

  return (
    <div className={styles.providerContent}>
      <ProviderProfileInfo
        userToDisplay={provider}
        isOwnProfile={isOwnProfile}
        onProfileUpdate={fetchProvider}
      />
      <RecentHires providerId={provider._id} isOwnProfile={isOwnProfile} />
      <PostedGigs providerId={provider._id} isOwnProfile={isOwnProfile} />
      <RecentProviderPostSection
        providerId={provider._id}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}

export default ProviderProfilePage;
