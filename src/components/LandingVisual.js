// src/components/LandingVisual.js
import React from 'react';
import visualStyles from './LandingVisual.module.css';

const LandingVisual = () => {
  return (
    <div className={visualStyles.visual}>
      <div className={visualStyles.border} />
      <h2 className={visualStyles.text}>
        Tasks with <span className={visualStyles.highlight}>Meaning,</span> Connections that{" "}
        <span className={visualStyles.highlight}>Last</span>
      </h2>
      <div className={visualStyles.imageWrapper}>
        <img src="/assets/people.png" alt="People collaborating" className={visualStyles.image} />
      </div>
    </div>
  );
};

export default LandingVisual;
