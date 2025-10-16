import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = mockLocalStorage;

// Mock the apiClient
vi.mock('../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the logger
vi.mock('../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthContext', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.clear();
  });

  it('should provide initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.authToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const mockUser = { id: '123', email: 'test@example.com', role: ['tasker'] };

    act(() => {
      result.current.login('token123', mockUser);
    });

    expect(result.current.authToken).toBe('token123');
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('authToken')).toBe('token123');
  });

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // First login
    const mockUser = { id: '123', email: 'test@example.com', role: ['tasker'] };
    act(() => {
      result.current.login('token123', mockUser);
    });

    expect(result.current.authToken).toBe('token123');
    expect(result.current.user).toEqual(mockUser);

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.authToken).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('should set session role for single-role user on login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const singleRoleUser = {
      id: '123',
      email: 'test@example.com',
      role: ['tasker'],
    };

    act(() => {
      result.current.login('token123', singleRoleUser);
    });

    expect(result.current.sessionRole).toBe('tasker');
    expect(localStorage.getItem('sessionRole')).toBe('tasker');
  });

  it('should not set session role for multi-role user on login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const multiRoleUser = {
      id: '123',
      email: 'test@example.com',
      role: ['tasker', 'provider'],
    };

    act(() => {
      result.current.login('token123', multiRoleUser);
    });

    expect(result.current.sessionRole).toBeNull();
  });

  it('should allow manual session role selection', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.selectSessionRole('provider');
    });

    expect(result.current.sessionRole).toBe('provider');
    expect(localStorage.getItem('sessionRole')).toBe('provider');
  });

  it('should clear session role', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Set a session role first
    act(() => {
      result.current.selectSessionRole('provider');
    });

    expect(result.current.sessionRole).toBe('provider');

    // Then clear it
    act(() => {
      result.current.clearSessionRole();
    });

    expect(result.current.sessionRole).toBeNull();
    expect(localStorage.getItem('sessionRole')).toBeNull();
  });
});
