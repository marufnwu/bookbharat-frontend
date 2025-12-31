import { cookies } from 'next/headers';
import { User } from '@/types';

export async function getServerAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // We must use fetch directly because axios interceptors don't work here easily
    // and we want avoid global state pollution on server
    const response = await fetch(`${apiUrl}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Ensure we don't cache auth requests
      cache: 'no-store'
    });

    if (!response.ok) {
        return null; // Token likely expired or invalid
    }

    const data = await response.json();
    return data.data || data; // Handle wrapper
  } catch (error) {
    console.error('Error fetching server auth user:', error);
    return null;
  }
}
