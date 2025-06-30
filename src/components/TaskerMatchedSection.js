import { MapPin } from 'lucide-react';
import { Badge } from '../components/Badge';
import PropTypes from 'prop-types';
import styles from './TaskerMatchedSection.module.css';

export function ServiceProviderListing({ gigHelpers }) {
  return (
    <div className={styles.container}>
      <div className={styles.spaceY4}>
        {gigHelpers.length > 0 ? (
          gigHelpers.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))
        ) : (
          <p className={styles.noTaskerFound}>No Tasker Found.</p>
        )}
      </div>
    </div>
  );
}

ServiceProviderListing.propTypes = {
  gigHelpers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export function ProviderCard({ provider }) {
  return (
    <div className={styles.providerCard}>
      <div className={styles.cardContent}>
        <div className={styles.imageContainer}>
          <img
            src={provider.image || '/placeholder.svg'}
            alt={provider.name}
            className={styles.image}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>{provider.name}</h2>
              <p className={styles.rate}>{provider.rate}</p>
              {provider.location && (
                <div className={styles.locationContainer}>
                  <MapPin className={styles.locationIcon} />
                  <span>{provider.location}</span>
                </div>
              )}
            </div>
          </div>

          <p className={styles.description}>{provider.description}</p>

          <div className={styles.servicesContainer}>
            {provider.services.map(service => (
              <Badge
                key={service}
                variant="outline"
                className={styles.serviceBadge}
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ProviderCard.propTypes = {
  provider: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    name: PropTypes.string,
    rate: PropTypes.string,
    location: PropTypes.string,
    description: PropTypes.string,
    services: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};
