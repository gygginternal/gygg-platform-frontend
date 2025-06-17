// src/components/Shared/ProgressHeader.js
import React from 'react';
import { ArrowLeft } from 'lucide-react'; // Keep if lucide-react is installed
import styles from './ProgressHeader.module.css'; // Create this CSS module

// No TS interface in JS version
function ProgressHeader({
    step, // Current step
    totalSteps = 5, // Default total steps
    onNavigate, // Function: (direction: 'back' | 'next') => void
    canGoNext = true, // Prop to enable/disable next button
    canGoBack = true  // Prop to enable/disable back button
}) {
    const progressPercentage = (step / totalSteps) * 100;

    return (
        <div className={styles.container}> {/* Assuming .container is the outermost div in your CSS */}
            <div className={styles.header}> {/* Assuming .header is next level */}
                <div className={styles.logo}>
                    {/* Use standard img tag for logo, ensure /gygg-logo.svg is in public folder */}
                    <img src="/assets/gygg-logo.svg" alt="Gygg Logo" width={100} height={60} /> {/* Adjust size as needed */}
                </div>

                <div className={styles.content}>
                    <div className={styles.headerContent}>
                        <span className={styles.title}>Profile Setup</span> {/* Changed from "set up" */}
                        <span className={styles.progress}>{step}/{totalSteps}</span>
                    </div>

                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progressPercentage}%` }}></div>
                    </div>

                    <div className={styles.navigation}>
                        {step > 1 && canGoBack ? ( // Show back button only if not on first step
                            <button className={styles.backButton} onClick={() => onNavigate('back')}>
                                <ArrowLeft size={20} className={styles.backIcon} /> {/* Adjusted icon size */}
                                Back
                            </button>
                        ) : (
                            <div className={styles.backButtonPlaceholder}></div> /* Placeholder for spacing if back button hidden */
                        )}

                        {step < totalSteps ? (
                            <button className={styles.nextButton} onClick={() => onNavigate('next')} disabled={!canGoNext}>
                                Next
                            </button>
                        ) : ( // On the last step
                            <button className={styles.nextButton} onClick={() => onNavigate('next')} disabled={!canGoNext}>
                                Finish Setup
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProgressHeader;