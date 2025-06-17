// src/components/Onboarding/GigPostReview.js
import React from 'react';
import styles from '../Onboarding/GigPostForm.module.css';

function GigPostReview({ gigData, onEditStep }) {
    return (
        <div className={styles.reviewSection}>
            <h3 className={styles.reviewSubTitle}>Review Your Gig Details</h3>
            <div className={styles.reviewItem}>
                <span><strong>Gig Title:</strong> {gigData.gigTitle || 'N/A'}</span>
                <button onClick={() => onEditStep(4)} className={styles.editStepButton}>Edit</button>
            </div>
            <div className={styles.reviewItem}>
                <span><strong>Timeline:</strong> {gigData.gigTimeline || 'N/A'}</span>
                <button onClick={() => onEditStep(4)} className={styles.editStepButton}>Edit</button>
            </div>
            <div className={styles.reviewItem}>
                <span><strong>Category:</strong> {gigData.gigCategory || 'N/A'}</span>
                <button onClick={() => onEditStep(4)} className={styles.editStepButton}>Edit</button>
            </div>
            <div className={styles.reviewItem}>
                <span><strong>Description:</strong> <p className={styles.reviewDescription}>{gigData.gigDescription || 'N/A'}</p></span>
                <button onClick={() => onEditStep(5)} className={styles.editStepButton}>Edit</button>
            </div>
            <div className={styles.reviewItem}>
                <span><strong>Payment Structure:</strong> {gigData.gigPaymentType || 'N/A'}</span>
                <button onClick={() => onEditStep(5)} className={styles.editStepButton}>Edit</button>
            </div>
            <div className={styles.reviewItem}>
                <span><strong>Budget:</strong>
                    {gigData.gigPaymentType === 'fixed' && ` $${gigData.gigCost || '0'}`}
                    {gigData.gigPaymentType === 'hourly' && ` $${gigData.gigRatePerHour || '0'} /hr`}
                </span>
                <button onClick={() => onEditStep(5)} className={styles.editStepButton}>Edit</button>
            </div>
             {/* Add display for other gig fields if collected (location, skills required etc.) */}
        </div>
    );
}
export default GigPostReview;