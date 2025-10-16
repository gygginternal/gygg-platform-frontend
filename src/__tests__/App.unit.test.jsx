import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Create a test query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock the AuthContext to provide authentication state
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '123', email: 'test@example.com', role: ['tasker'] },
      authToken: 'token123',
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

// Mock the ToastContext
vi.mock('../../contexts/ToastContext', async () => {
  const actual = await vi.importActual('../../contexts/ToastContext');
  return {
    ...actual,
    useToast: () => ({
      showToast: vi.fn(),
    }),
  };
});

// Mock the SocketContext
vi.mock('../../contexts/SocketContext', async () => {
  const actual = await vi.importActual('../../contexts/SocketContext');
  return {
    ...actual,
    useSocket: () => ({
      socket: null,
      connected: false,
    }),
  };
});

// Mock react-router-dom to avoid nested router issues
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/test' }),
  };
});

// Mock the components that are used in App
vi.mock('../../components/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>,
}));

vi.mock('../../components/Shared/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

// Import the App component after mocks
import App from '../App';

describe('App Component', () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />, { wrapper });

    // Check if the router wrapper is present
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });
});
