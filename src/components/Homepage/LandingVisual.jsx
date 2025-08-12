// src/components/LandingVisual.js
import React, { useState } from 'react';
import visualStyles from './LandingVisual.module.css';

const LandingVisual = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={visualStyles.visual}>
      <div className={visualStyles.border} />
      <h2 className={visualStyles.text}>
        Tasks with <span className={visualStyles.highlight}>Meaning,</span>{' '}
        Connections that <span className={visualStyles.highlight}>Last</span>
      </h2>
      <div className={visualStyles.imageWrapper}>
        {!imageError ? (
          <img
            src="/assets/people.png"
            alt="People collaborating in a puzzle-like arrangement"
            className={visualStyles.image}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              opacity: imageLoaded ? 1 : 0.7,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        ) : (
          <div className={visualStyles.imagePlaceholder}>
            <span>🧩</span>
            <p>Community Connection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingVisual;
