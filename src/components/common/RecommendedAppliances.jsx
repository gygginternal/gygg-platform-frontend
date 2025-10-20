// import cn from "classnames"; // Removed
import { Link } from 'react-router-dom';
import styles from './RecommendedAppliances.module.css';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/axiosConfig';
import logger from '../../utils/logger';

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
      console.log('Recommended appliances response:', response.data);
      return response.data.data.applications;
    },
    onError: err => {
      logger.error('Error fetching recommended appliances:', err);
      console.error('Error fetching recommended appliances:', err);
    },
  });

  return (
    <section className={styles.appliancesSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <img
            src="/assets/profile-2user.svg"
            alt="Profile"
            width={20}
            height={20}
          />
        </div>
        <h4 className={styles.sectionTitle}>
          Top matches among applicants to your gig
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
              <img
                src={appliance.image || '/default.jpg'}
                alt={appliance.name}
                className={styles.applianceAvatar}
                width={64}
                height={64}
              />
              <div className={styles.applianceContent}>
                <div className={styles.applianceDescription}>
                  <strong>{appliance.name}</strong> applied to your gig &quot;
                  {appliance.gigTitle}&quot;
                </div>
                <Link
                  to={`/applications/${appliance.id}`}
                  className={styles.viewApplianceLink}
                >
                  <u>View application detail</u>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.errorMessage}>
            No recommended applicants found right now.
          </p>
        )}
      </div>
    </section>
  );
};

export default RecommendedAppliances;
