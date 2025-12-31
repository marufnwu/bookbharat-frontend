'use client';

import { useAuthInit } from '@/hooks/useAuthInit';

import { User } from '@/types';

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  useAuthInit(initialUser);
  
  return <>{children}</>;
}