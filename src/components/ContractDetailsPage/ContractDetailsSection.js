// import React from 'react';
import PropTypes from 'prop-types';
import styles from './ContractDetailsSection.module.css';
import ContractHeader from './ContractHeader';
import ContractDetails from './ContractDetails';
import ContractParties from './ContractParties';
import ContractPayment from './ContractPayment';
import ContractTimeline from './ContractTimeline';

const ContractDetailsSection = ({
  gig,
  contract,
  loading = false,
  error = null,
  onAcceptSuccess,
  children,
}) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading contract details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>No gig data available</div>
      </div>
    );
  }

  // Default contract data if not provided
  const contractData = contract || {
    status: 'pending',
    provider: { name: 'Provider Name', avatar: '/default.jpg' },
    tasker: { name: 'Tasker Name', avatar: '/default.jpg' },
    timeline: [
      { label: 'Start Date', value: 'TBD' },
      { label: 'End Date', value: 'TBD' },
      { label: 'Duration', value: 'TBD' },
    ],
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Contract Header */}
        <ContractHeader
          title={gig.title || 'Contract Details'}
          status={contractData.status || 'pending'}
        />

        {/* Contract Parties */}
        <ContractParties
          provider={contractData.provider}
          tasker={contractData.tasker}
        />

        {/* Gig Details */}
        <ContractDetails gig={gig} />

        {/* Contract Timeline */}
        <ContractTimeline timeline={contractData.timeline} />

        {/* Contract Payment Section */}
        {contractData._id && (
          <ContractPayment
            contractId={contractData._id}
            isProvider
            onPaymentReleased={onAcceptSuccess}
          />
        )}

        {/* Custom children content (like GigDetail component) */}
        {children}
      </div>
    </div>
  );
};

ContractDetailsSection.propTypes = {
  gig: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    budget: PropTypes.number,
    timeline: PropTypes.string,
    location: PropTypes.string,
    category: PropTypes.string,
  }),
  contract: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
    provider: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
    tasker: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
    timeline: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onAcceptSuccess: PropTypes.func,
  children: PropTypes.node,
};

export default ContractDetailsSection;
