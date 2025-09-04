// src/pages/EmbeddedOnboardingTest.jsx
import React from 'react';
import { StripeConnectOnboarding } from '../components/StripeConnectOnboarding';

export function EmbeddedOnboardingTest() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Embedded Onboarding Test</h1>
      <p>This page tests the new Stripe embedded onboarding implementation.</p>
      <StripeConnectOnboarding />
    </div>
  );
}
