/**
 * Authentication Service - Handles all auth-related API interactions
 * Compliant with CLAUDE_RULES: Isolated API logic from UI components
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'creator' | 'admin';
  profile?: {
    phone?: string;
    dateOfBirth?: string;
    preferences: {
      newsletter: boolean;
      notifications: boolean;
      currency: string;
      language: string;
    };
  };
  addresses?: Array<{
    id: string;
    type: 'shipping' | 'billing';
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  creatorProfile?: {
    status: 'pending' | 'approved' | 'suspended';
    commissionRate: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalCommissions: number;
    referralCode: string;
  };
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

export interface LoginParams {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface UpdateProfileParams {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences?: {
    newsletter?: boolean;
    notifications?: boolean;
    currency?: string;
    language?: string;
  };
}

export interface AddressParams {
  type: 'shipping' | 'billing';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

/**
 * Register a new user account
 * @param params - Registration parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<AuthResponse>
 */
export async function registerUser(
  params: RegisterParams,
  signal?: AbortSignal
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Registration failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Registration failed');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during registration');
  }
}

/**
 * Login user
 * @param params - Login parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<AuthResponse>
 */
export async function loginUser(
  params: LoginParams,
  signal?: AbortSignal
): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(errorData.error?.message || 'Login failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Login failed');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during login');
  }
}

/**
 * Logout current user
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<void>
 */
export async function logoutUser(signal?: AbortSignal): Promise<void> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      // Don't throw on logout failure, just log warning
      console.warn('Logout request failed:', response.status, response.statusText);
    }

    const data = await response.json().catch(() => ({}));

    if (!data.success && data.error) {
      console.warn('Logout error:', data.error.message);
    }
  } catch (error) {
    // Don't throw on logout failure, just log warning
    console.warn('Error during logout:', error);
  }
}

/**
 * Get current user session
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User | null>
 */
export async function getCurrentSession(signal?: AbortSignal): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error(`Session check failed: ${response.status}`);
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      if (data.error?.code === 'UNAUTHENTICATED') {
        return null;
      }
      throw new Error(data.error?.message || 'Session check failed');
    }

    return data.data?.user || null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.warn('Error checking session:', error);
    return null;
  }
}

/**
 * Update user profile
 * @param params - Profile update parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function updateUserProfile(
  params: UpdateProfileParams,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Profile update failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Profile update failed');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while updating profile');
  }
}

/**
 * Add user address
 * @param params - Address parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function addUserAddress(
  params: AddressParams,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to add address');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to add address');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while adding address');
  }
}

/**
 * Update user address
 * @param addressId - Address ID to update
 * @param params - Updated address parameters
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function updateUserAddress(
  addressId: string,
  params: Partial<AddressParams>,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to update address');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to update address');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while updating address');
  }
}

/**
 * Delete user address
 * @param addressId - Address ID to delete
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<User>
 */
export async function deleteUserAddress(
  addressId: string,
  signal?: AbortSignal
): Promise<User> {
  try {
    const response = await fetch(`/api/user/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to delete address');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to delete address');
    }

    return data.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while deleting address');
  }
}

/**
 * Request password reset
 * @param email - User email
 * @param signal - AbortSignal for request cancellation
 * @returns Promise<void>
 */
export async function requestPasswordReset(
  email: string,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Password reset request failed');
    }

    const data = await response.json();

    // Validate CLAUDE_RULES response envelope
    if (!data.success) {
      throw new Error(data.error?.message || 'Password reset request failed');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during password reset request');
  }
}