'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth';

import { User } from '@/types';

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function useAuthInit(initialUser?: User | null) {
  const { setUser, setToken, setHasHydrated } = useAuthStore();
  const initialized = useRef(false);

  // Initialize with server data if available
  if (!initialized.current && initialUser !== undefined) {
    if (initialUser) {
      // Get token from cookie to ensure consistency
      // This handles cases where localStorage might be empty but cookie exists
      const token = typeof document !== 'undefined' 
        ? document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
        : null;

      setUser(initialUser);
      
      if (token) {
        setToken(token);
        // Ensure localStorage is synced for API client
        if (typeof window !== 'undefined') {
             localStorage.setItem('auth_token', token);
             localStorage.setItem('user', JSON.stringify(initialUser));
        }
      }
      
      useAuthStore.setState({ isAuthenticated: true, hasHydrated: true });
    } else {
      // Explicit null means guest
      useAuthStore.setState({ user: null, isAuthenticated: false, hasHydrated: true });
    }
    initialized.current = true;
  }

  useEffect(() => {
    // Hydrate auth state from localStorage on client side
    // Hydrate auth state from localStorage on client side
    // Only run if NOT initialized from server
    if (typeof window !== 'undefined' && !initialized.current) {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setToken(token);
          setUser(user);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
    }
  }, [setUser, setToken]);
}