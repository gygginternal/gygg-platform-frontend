import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StripeEmbeddedOnboarding } from '../StripeEmbeddedOnboarding';
import * as apiClient from '../../api/axiosConfig';

// Mock the apiClient
jest.mock('../../api/axiosConfig');

// Mock Stripe
const mockInitEmbeddedCheckout = jest.fn();
const mockStripe = {
  initEmbeddedCheckout: mockInitEmbeddedCheckout
};

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue(mockStripe)
}));

// Mock environment variables
process.env.VITE_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

describe('StripeEmbeddedOnboarding Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    // Mock API call to return a promise that resolves after a delay
    apiClient.default.get.mockImplementation((url) => {
      if (url.includes('account-status')) {
        return new Promise(resolve => {
          setTimeout(() => resolve({ data: {} }), 100);
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(<StripeEmbeddedOnboarding />);
    
    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error state when account status fetch fails', async () => {
    apiClient.default.get.mockRejectedValue(new Error('Failed to fetch'));
    
    render(<StripeEmbeddedOnboarding />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch account status')).toBeInTheDocument();
    });
    
    // Should show retry button
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should show success state when onboarding is complete', async () => {
    // Mock API calls
    apiClient.default.get.mockImplementation((url) => {
      if (url.includes('account-status')) {
        return Promise.resolve({
          data: {
            detailsSubmitted: true,
            chargesEnabled: true,
            payoutsEnabled: true
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(<StripeEmbeddedOnboarding />);
    
    await waitFor(() => {
      expect(screen.getByText('Account Connected & Active')).toBeInTheDocument();
    });
    
    // Should show status details
    expect(screen.getByText('Payouts Enabled:')).toBeInTheDocument();
    expect(screen.getByText('Charges Enabled:')).toBeInTheDocument();
    expect(screen.getByText('Details Submitted:')).toBeInTheDocument();
    
    // Should show refresh button
    expect(screen.getByText('Refresh Status')).toBeInTheDocument();
  });

  it('should show onboarding initiation when onboarding is needed', async () => {
    // Mock API calls
    apiClient.default.get.mockImplementation((url) => {
      if (url.includes('account-status')) {
        return Promise.resolve({
          data: {
            detailsSubmitted: false,
            chargesEnabled: false,
            payoutsEnabled: false
          }
        });
      }
      if (url.includes('onboarding-requirements')) {
        return Promise.resolve({
          data: {
            data: {
              requirements: {
                currentlyDue: ['business_profile.url'],
                eventuallyDue: [],
                disabledReason: null
              }
            }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // Mock POST calls
    apiClient.default.post.mockResolvedValue({
      data: {
        clientSecret: 'test_client_secret_123'
      }
    });
    
    render(<StripeEmbeddedOnboarding />);
    
    await waitFor(() => {
      expect(screen.getByText('Complete Your Stripe Setup')).toBeInTheDocument();
    });
    
    // Should show current status
    expect(screen.getByText('Payouts Enabled:')).toBeInTheDocument();
    expect(screen.getByText('Charges Enabled:')).toBeInTheDocument();
    expect(screen.getByText('Details Submitted:')).toBeInTheDocument();
    
    // Should show start onboarding button
    expect(screen.getByText('Start Onboarding')).toBeInTheDocument();
  });

  it('should initiate onboarding when button is clicked', async () => {
    // Mock API calls
    apiClient.default.get.mockImplementation((url) => {
      if (url.includes('account-status')) {
        return Promise.resolve({
          data: {
            detailsSubmitted: false,
            chargesEnabled: false,
            payoutsEnabled: false
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // Mock POST calls
    apiClient.default.post.mockResolvedValue({
      data: {
        clientSecret: 'test_client_secret_123'
      }
    });
    
    // Mock Stripe initEmbeddedCheckout
    mockInitEmbeddedCheckout.mockResolvedValue({
      mount: jest.fn()
    });
    
    render(<StripeEmbeddedOnboarding />);
    
    await waitFor(() => {
      expect(screen.getByText('Start Onboarding')).toBeInTheDocument();
    });
    
    // Click the onboarding button
    const onboardingButton = screen.getByText('Start Onboarding');
    fireEvent.click(onboardingButton);
    
    // Should call the API to create connected account and initiate session
    await waitFor(() => {
      expect(apiClient.default.post).toHaveBeenCalledWith('/payments/create-connected-account');
      expect(apiClient.default.post).toHaveBeenCalledWith('/payments/initiate-account-session');
    });
  });

  it('should handle onboarding completion', async () => {
    // Mock API calls
    apiClient.default.get.mockImplementation((url) => {
      if (url.includes('account-status')) {
        // Initially return incomplete, then complete
        if (apiClient.default.get.mock.calls.filter(call => call[0].includes('account-status')).length > 1) {
          return Promise.resolve({
            data: {
              detailsSubmitted: true,
              chargesEnabled: true,
              payoutsEnabled: true
            }
          });
        }
        return Promise.resolve({
          data: {
            detailsSubmitted: false,
            chargesEnabled: false,
            payoutsEnabled: false
          }
        });
      }
      if (url.includes('onboarding-status')) {
        return Promise.resolve({
          data: {
            data: {
              onboardingComplete: true
            }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // Mock POST calls
    apiClient.default.post.mockResolvedValue({
      data: {
        clientSecret: 'test_client_secret_123'
      }
    });
    
    // Mock Stripe initEmbeddedCheckout with onComplete callback
    mockInitEmbeddedCheckout.mockResolvedValue({
      mount: jest.fn()
    });
    
    render(<StripeEmbeddedOnboarding />);
    
    await waitFor(() => {
      expect(screen.getByText('Start Onboarding')).toBeInTheDocument();
    });
    
    // Click the onboarding button
    const onboardingButton = screen.getByText('Start Onboarding');
    fireEvent.click(onboardingButton);
    
    // After onboarding completion, should show success state
    await waitFor(() => {
      expect(screen.getByText('Account Connected & Active')).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});