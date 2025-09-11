'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useHydratedAuth } from '@/stores/auth';
import { Loader2 } from 'lucide-react';

interface AuthStateHandlerProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthStateHandler({
  children,
  requireAuth = false,
  requireGuest = false,
  redirectTo = '/auth/login',
  fallback
}: AuthStateHandlerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useHydratedAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname);
        router.push(`${redirectTo}?redirect=${returnUrl}`);
      } else if (requireGuest && isAuthenticated) {
        // Redirect authenticated users away from guest-only pages
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requireGuest, router, pathname, redirectTo]);

  // Show loading state while checking auth
  if (isLoading) {
    return fallback || <AuthLoadingState />;
  }

  // Show nothing if auth requirements aren't met
  if ((requireAuth && !isAuthenticated) || (requireGuest && isAuthenticated)) {
    return fallback || <AuthLoadingState />;
  }

  return <>{children}</>;
}

export function AuthLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Auth-aware component wrapper
interface AuthAwareProps {
  children: ReactNode;
  authenticatedContent?: ReactNode;
  guestContent?: ReactNode;
}

export function AuthAware({
  children,
  authenticatedContent,
  guestContent
}: AuthAwareProps) {
  const { isAuthenticated, isLoading } = useHydratedAuth();

  if (isLoading) {
    return <>{children}</>;
  }

  if (isAuthenticated && authenticatedContent) {
    return <>{authenticatedContent}</>;
  }

  if (!isAuthenticated && guestContent) {
    return <>{guestContent}</>;
  }

  return <>{children}</>;
}

// Protected route wrapper
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  return (
    <AuthStateHandler
      requireAuth
      redirectTo={redirectTo}
      fallback={fallback}
    >
      {children}
    </AuthStateHandler>
  );
}

// Guest route wrapper (for login, register pages)
interface GuestRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function GuestRoute({
  children,
  fallback
}: GuestRouteProps) {
  return (
    <AuthStateHandler
      requireGuest
      redirectTo="/"
      fallback={fallback}
    >
      {children}
    </AuthStateHandler>
  );
}

// Auth context provider for conditional rendering
interface AuthConditionalProps {
  children: ReactNode;
  showWhen?: 'authenticated' | 'guest' | 'always';
  fallback?: ReactNode;
}

export function AuthConditional({
  children,
  showWhen = 'always',
  fallback = null
}: AuthConditionalProps) {
  const { isAuthenticated, isLoading } = useHydratedAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (showWhen === 'authenticated' && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (showWhen === 'guest' && isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for auth-based redirects
export function useAuthRedirect(
  requireAuth = false,
  requireGuest = false,
  redirectTo = '/'
) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useHydratedAuth();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/auth/login?redirect=${returnUrl}`);
      } else if (requireGuest && isAuthenticated) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requireGuest, router, pathname, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Mobile auth prompt component
interface MobileAuthPromptProps {
  title?: string;
  message?: string;
  onLogin?: () => void;
  onRegister?: () => void;
}

export function MobileAuthPrompt({
  title = 'Sign in to continue',
  message = 'Please sign in to access this feature',
  onLogin,
  onRegister
}: MobileAuthPromptProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${returnUrl}`);
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/register?redirect=${returnUrl}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleLogin}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={handleRegister}
          className="flex-1 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}