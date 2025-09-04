/**
 * useUserSession Hook - Manages user authentication and session state
 * Compliant with CLAUDE_RULES: Isolated business logic from UI components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentSession,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  requestPasswordReset,
  type User,
  type LoginParams,
  type RegisterParams,
  type UpdateProfileParams,
  type AddressParams
} from '@/services/authService';

interface UseUserSessionOptions {
  autoFetch?: boolean;
  redirectTo?: string;
  redirectOnLogin?: string;
  redirectOnLogout?: string;
  syncInterval?: number; // in milliseconds
}

interface UseUserSessionReturn {
  // User state
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth actions
  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // Profile actions
  updateProfile: (params: UpdateProfileParams) => Promise<void>;
  addAddress: (params: AddressParams) => Promise<void>;
  updateAddress: (addressId: string, params: Partial<AddressParams>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Loading states
  loginLoading: boolean;
  registerLoading: boolean;
  profileLoading: boolean;

  // Error handling
  clearError: () => void;

  // User role checks
  isCustomer: boolean;
  isCreator: boolean;
  isAdmin: boolean;
}

const DEFAULT_OPTIONS: UseUserSessionOptions = {
  autoFetch: true,
  syncInterval: 60000, // 1 minute
};

/**
 * Custom hook for user session management
 * Handles authentication, profile management, and session synchronization
 */
export function useUserSession(options: UseUserSessionOptions = {}): UseUserSessionReturn {
  const {
    autoFetch = DEFAULT_OPTIONS.autoFetch,
    redirectTo,
    redirectOnLogin,
    redirectOnLogout,
    syncInterval = DEFAULT_OPTIONS.syncInterval,
  } = { ...DEFAULT_OPTIONS, ...options };

  const router = useRouter();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  /**
   * Fetch current user session
   */
  const handleRefreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const currentUser = await getCurrentSession(abortControllerRef.current.signal);
      setUser(currentUser);

      // Handle redirect logic after initial load
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        
        if (redirectTo && !currentUser) {
          router.push(redirectTo);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, ignore
        }
        setError(err.message);
      } else {
        setError('Failed to fetch user session');
      }
    } finally {
      setLoading(false);
    }
  }, [router, redirectTo]);

  /**
   * Login user
   */
  const handleLogin = useCallback(async (params: LoginParams) => {
    try {
      setLoginLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const authResponse = await loginUser(params, abortControllerRef.current.signal);
      setUser(authResponse.user);

      // Handle redirect after successful login
      if (redirectOnLogin) {
        router.push(redirectOnLogin);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoginLoading(false);
    }
  }, [router, redirectOnLogin]);

  /**
   * Register new user
   */
  const handleRegister = useCallback(async (params: RegisterParams) => {
    try {
      setRegisterLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const authResponse = await registerUser(params, abortControllerRef.current.signal);
      setUser(authResponse.user);

      // Handle redirect after successful registration
      if (redirectOnLogin) {
        router.push(redirectOnLogin);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setRegisterLoading(false);
    }
  }, [router, redirectOnLogin]);

  /**
   * Logout user
   */
  const handleLogout = useCallback(async () => {
    try {
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      await logoutUser(abortControllerRef.current.signal);
      setUser(null);

      // Handle redirect after logout
      if (redirectOnLogout) {
        router.push(redirectOnLogout);
      }
    } catch (err) {
      // Don't set error for logout failures, just log
      console.warn('Logout error:', err);
    }
  }, [router, redirectOnLogout]);

  /**
   * Update user profile
   */
  const handleUpdateProfile = useCallback(async (params: UpdateProfileParams) => {
    try {
      setProfileLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedUser = await updateUserProfile(params, abortControllerRef.current.signal);
      setUser(updatedUser);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  /**
   * Add user address
   */
  const handleAddAddress = useCallback(async (params: AddressParams) => {
    try {
      setProfileLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedUser = await addUserAddress(params, abortControllerRef.current.signal);
      setUser(updatedUser);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to add address');
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  /**
   * Update user address
   */
  const handleUpdateAddress = useCallback(async (addressId: string, params: Partial<AddressParams>) => {
    try {
      setProfileLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedUser = await updateUserAddress(addressId, params, abortControllerRef.current.signal);
      setUser(updatedUser);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to update address');
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  /**
   * Delete user address
   */
  const handleDeleteAddress = useCallback(async (addressId: string) => {
    try {
      setProfileLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const updatedUser = await deleteUserAddress(addressId, abortControllerRef.current.signal);
      setUser(updatedUser);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to delete address');
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  /**
   * Request password reset
   */
  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      await requestPasswordReset(email, abortControllerRef.current.signal);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to request password reset');
      }
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch session on mount
  useEffect(() => {
    if (autoFetch) {
      handleRefreshSession();
    }
  }, [autoFetch, handleRefreshSession]);

  // Set up sync interval
  useEffect(() => {
    if (syncInterval && syncInterval > 0 && user) {
      syncIntervalRef.current = setInterval(() => {
        handleRefreshSession();
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncInterval, user, handleRefreshSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Computed values
  const isAuthenticated = user !== null;
  const isLoading = loading;
  const isCustomer = user?.role === 'customer';
  const isCreator = user?.role === 'creator';
  const isAdmin = user?.role === 'admin';

  return {
    // User state
    user,
    loading,
    error,
    isAuthenticated,
    isLoading,

    // Auth actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshSession: handleRefreshSession,

    // Profile actions
    updateProfile: handleUpdateProfile,
    addAddress: handleAddAddress,
    updateAddress: handleUpdateAddress,
    deleteAddress: handleDeleteAddress,
    resetPassword: handleResetPassword,

    // Loading states
    loginLoading,
    registerLoading,
    profileLoading,

    // Error handling
    clearError,

    // User role checks
    isCustomer,
    isCreator,
    isAdmin,
  };
}