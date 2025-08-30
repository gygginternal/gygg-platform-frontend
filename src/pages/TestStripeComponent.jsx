// TestStripeComponent.jsx
import React from 'react';
import { StripeEmbeddedOnboarding } from '../components/StripeEmbeddedOnboarding';

function TestStripeComponent() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Stripe Component Test</h1>
      <p>This page tests the StripeEmbeddedOnboarding component in isolation.</p>
      <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
        <h2>Stripe Embedded Onboarding</h2>
        <StripeEmbeddedOnboarding />
      </div>
    </div>
  );
}

export default TestStripeComponent;