import React from 'react';
import { LazyImage } from './index';
import './LazyGigCard.css';
import { decodeHTMLEntities } from '../../utils/htmlEntityDecoder';

const LazyGigCard = ({
  gig,
  onClick,
  className = '',
  showPlaceholder = true,
  ...props
}) => {
  const handleCardClick = () => {
    onClick?.(gig);
  };

  const placeholderImage = (
    <div className="gig-card-placeholder">
      <div className="placeholder-icon">🏠</div>
      <div className="placeholder-text">Loading image...</div>
    </div>
  );

  return (
    <div
      className={`lazy-gig-card ${className}`}
      onClick={handleCardClick}
      {...props}
    >
      <div className="gig-card-image-container">
        <LazyImage
          src={gig.imageUrl || gig.image}
          alt={decodeHTMLEntities(gig.title) || 'Gig image'}
          placeholder={showPlaceholder ? placeholderImage : null}
          className="gig-card-image"
          threshold={0.1}
          rootMargin="100px"
          fadeInDuration={400}
          onLoad={() => {
            console.debug('Gig image loaded:', decodeHTMLEntities(gig.title));
          }}
          onError={() => {
            console.debug(
              'Gig image failed to load:',
              decodeHTMLEntities(gig.title)
            );
          }}
        />

        {/* Overlay content */}
        <div className="gig-card-overlay">
          <div className="gig-card-content">
            <h3 className="gig-card-title">{decodeHTMLEntities(gig.title)}</h3>
            <p className="gig-card-description">
              {decodeHTMLEntities(gig.description)?.substring(0, 100)}
              {decodeHTMLEntities(gig.description)?.length > 100 ? '...' : ''}
            </p>
            <div className="gig-card-meta">
              <span className="gig-card-price">
                ${gig.price || gig.cost || 'N/A'}
              </span>
              <span className="gig-card-location">
                {decodeHTMLEntities(gig.location) || 'Remote'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="gig-card-footer">
        <div className="gig-card-tags">
          {gig.tags?.slice(0, 3).map((tag, index) => (
            <span key={index} className="gig-card-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="gig-card-actions">
          <button
            className="gig-card-action-btn"
            onClick={e => {
              e.stopPropagation();
              // Handle action
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default LazyGigCard;
