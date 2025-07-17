import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock the contexts to avoid provider errors in tests
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    authToken: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('./contexts/SocketContext', () => ({
  SocketProvider: ({ children }) => children,
  useSocket: () => ({
    socket: null,
    isConnected: false,
  }),
}));

vi.mock('./contexts/ToastContext', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock react-router-dom to replace BrowserRouter with MemoryRouter in tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => children, // Remove BrowserRouter wrapper
  };
});

test('renders app without crashing', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // Just test that the app renders without crashing
  expect(document.body).toBeInTheDocument();
});
