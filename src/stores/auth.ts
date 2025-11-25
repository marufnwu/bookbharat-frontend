'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setHasHydrated: (state: boolean) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
  handleUnauthorized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await authApi.login({ email, password });
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API client
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          const response = await authApi.register(data);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API client
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Clear state immediately
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        // Clear all auth-related storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth-store');
          sessionStorage.clear();
        }

        // Call logout API (non-blocking)
        try {
          authApi.logout().catch(() => {
            // Ignore errors on logout API call
          });
        } catch (error) {
          // Ignore errors
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true });
          const response = await authApi.updateProfile(data);
          const updatedUser = response.data;
          
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        // Store token in localStorage for API client
        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('auth_token', token);
        }
      },
      setHasHydrated: (state) => set({ hasHydrated: state }),
      
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth-store');
        }
      },

      // Verify auth token with backend
      checkAuth: async () => {
        const state = get();
        
        // Only check if we think we're authenticated
        if (state.isAuthenticated && state.token) {
          try {
            // Make a request to verify the token is still valid
            const response = await authApi.getProfile();
            
            // If successful, update user data
            if (response.success && response.data) {
              set({ user: response.data });
            }
          } catch (error: any) {
            // If we get a 401 or any auth error, clear auth state
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              get().clearAuth();
            }
          }
        }
      },

      // Handle 401 responses from API
      handleUnauthorized: () => {
        const state = get();
        if (state.isAuthenticated) {
          // Clear auth state immediately
          get().clearAuth();
          
          // Optionally show a notification
          if (typeof window !== 'undefined') {
            // You could trigger a toast notification here
          }
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.error('An error occurred during hydration', error);
            // Clear invalid state
            if (state) {
              state.clearAuth();
            }
          } else if (state) {
            // Validate stored auth state
            if (typeof window !== 'undefined') {
              const storedToken = localStorage.getItem('auth_token');
              
              // If we have a token in state but not in localStorage, or they don't match
              if (state.token && (!storedToken || storedToken !== state.token)) {
                state.clearAuth();
              }
              // If we're authenticated but have no token
              else if (state.isAuthenticated && !state.token) {
                state.clearAuth();
              }
            }
            
            state.setHasHydrated(true);
            
            // Check auth validity with backend after hydration
            if (state.isAuthenticated && state.token) {
              state.checkAuth();
            }
          }
        };
      },
    }
  )
);

// Hook to ensure hydration is complete before using auth state
export const useHydratedAuth = () => {
  const state = useAuthStore();
  // Always return all methods from the actual store
  return state.hasHydrated 
    ? state 
    : { 
        ...state, 
        isAuthenticated: false, 
        user: null,
        // Include all methods even when not hydrated
        checkAuth: state.checkAuth,
        handleUnauthorized: state.handleUnauthorized
      };
};

// Export a singleton instance for use in non-React contexts (like axios interceptors)
export const authStore = useAuthStore.getState();
