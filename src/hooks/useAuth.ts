"use client";

import { useAuthStore } from "@/stores/auth";

/**
 * Authentication hook for components that need user authentication state
 * Provides access to current user, authentication status, and auth actions
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    refreshToken,
    clearAuth,
    fetchUser,
  } = useAuthStore();

  return {
    // Current user state
    user,
    token,
    isAuthenticated,
    isLoading,

    // Authentication actions
    login,
    logout,
    register,
    updateUser,

    // Token management
    refreshToken,
    clearAuth,

    // User data management
    fetchUser,

    // Computed properties
    isGuest: !user || !isAuthenticated,
    userName: user?.name || user?.first_name || 'Guest',
    userAvatar: user?.avatar || user?.profile_image,
    userEmail: user?.email,
    userId: user?.id,
  };
}

export default useAuth;