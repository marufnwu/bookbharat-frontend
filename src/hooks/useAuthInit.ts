'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function useAuthInit() {
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    // Hydrate auth state from localStorage on client side
    if (typeof window !== 'undefined') {
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