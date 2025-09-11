'use client';

import { useAuthInit } from '@/hooks/useAuthInit';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useAuthInit();
  
  return <>{children}</>;
}