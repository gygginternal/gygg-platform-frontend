// import cn from "classnames"; // Removed
import { Link } from 'react-router-dom';
import styles from './RecommendedAppliances.module.css';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axiosConfig';
import logger from '../utils/logger';

const RecommendedAppliances = () => {
  const {
    data: recommendedAppliances,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['recommendedAppliances'],
    queryFn: async () => {
      const response = await apiClient.get('/applications/top-match');
      return response.data;
    },
    onError: err => {
      logger.error('Error fetching recommended appliances:', err);
    },
  });

  const formatApplianceDescription = appliance => {
    const posterName = [appliance.poster?.firstName, appliance.poster?.lastName]
      .filter(Boolean)
      .join(' ');
    const location =
      appliance.poster?.address?.city || appliance.poster?.address?.state || '';
    return `${posterName}${
      location ? ` from ${location}` : ''
    } needs help with "${appliance.title}"`;
  };

  return (
    <section className={styles.appliancesSection}>
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitleUnderlined}>
          Top matched people applied to your gig
        </h4>
      </div>
      <div className={styles.appliancesList}>
        {isLoading ? (
          <p>Loading recommended applications...</p>
        ) : isError ? (
          <p className={styles.errorMessage}>
            {error?.message || 'Failed to load recommended appliances.'}
          </p>
        ) : recommendedAppliances?.length > 0 ? (
          recommendedAppliances.map(appliance => (
            <div key={appliance.id} className={styles.applianceItem}>
              <div>
                <p className={styles.applianceDescription}>
                  {formatApplianceDescription(appliance)}
                </p>
                <Link
                  to={`/appliances/${appliance._id}`}
                  className={styles.viewApplianceLink}
                >
                  View appliance detail
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.errorMessage}>
            No recommended appliances found right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default RecommendedAppliances;
