import React from 'react';
import { LazySection } from '../LazyLoading';
import BillingTable from './BillingTable';
import LoadingSpinner from '../Suspense/LoadingSpinner';

const LazyBillingTable = ({ transactions, loading, ...props }) => {
  const placeholder = (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ 
        background: '#f5f5f5', 
        borderRadius: '8px', 
        padding: '3rem',
        margin: '1rem 0'
      }}>
        <div style={{ 
          width: '100%', 
          height: '200px', 
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px'
        }} />
        <p style={{ marginTop: '1rem', color: '#666' }}>
          Loading billing data...
        </p>
      </div>
    </div>
  );

  const loadingComponent = (
    <LoadingSpinner 
      size="medium" 
      text="Loading transactions..." 
    />
  );

  return (
    <LazySection
      placeholder={placeholder}
      loadingComponent={loadingComponent}
      threshold={0.2}
      rootMargin="50px"
      className="lazy-billing-table"
      onIntersect={() => {
        console.debug('Billing table coming into view');
      }}
      onLoad={() => {
        console.debug('Billing table loaded');
      }}
    >
      <BillingTable 
        transactions={transactions} 
        loading={loading} 
        {...props} 
      />
    </LazySection>
  );
};

export default LazyBillingTable;