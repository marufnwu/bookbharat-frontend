'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useHydratedAuth } from '@/stores/auth';
import { Loader2 } from 'lucide-react';
import { configApi } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  allowGuest?: boolean; // Allow guest access for specific routes
}

export function ProtectedRoute({
  children,
  fallback,
  allowGuest = false
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useHydratedAuth();
  const [guestCheckoutEnabled, setGuestCheckoutEnabled] = useState<boolean | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Check if this is checkout page
  const isCheckoutPage = pathname === '/checkout' || pathname.startsWith('/checkout/');

  useEffect(() => {
    const checkGuestCheckout = async () => {
      try {
        const response = await configApi.getConfig();
        if (response?.success && response?.data?.guest_checkout_enabled) {
          setGuestCheckoutEnabled(true);
        } else {
          setGuestCheckoutEnabled(false);
        }
      } catch (error) {
        console.error('Failed to check guest checkout config:', error);
        setGuestCheckoutEnabled(false);
      } finally {
        setLoadingConfig(false);
      }
    };

    // Only check config if we might need guest access
    if (!isAuthenticated && (allowGuest || isCheckoutPage)) {
      checkGuestCheckout();
    } else {
      setLoadingConfig(false);
    }
  }, [isAuthenticated, allowGuest, isCheckoutPage]);

  useEffect(() => {
    // Only redirect after hydration and config loading are complete
    if (hasHydrated && !loadingConfig && !isAuthenticated) {
      // Allow access if guest checkout is enabled and this is checkout page
      if (isCheckoutPage && guestCheckoutEnabled) {
        return; // Don't redirect, allow guest access
      }

      // Allow access if explicitly allowed for this route
      if (allowGuest) {
        return; // Don't redirect, allow guest access
      }

      // Store current path for redirect after login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${returnUrl}`);
    }
  }, [hasHydrated, isAuthenticated, pathname, router, loadingConfig, guestCheckoutEnabled, allowGuest, isCheckoutPage]);

  // Show loading while checking auth and config
  if (!hasHydrated || loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user should have access (authenticated or allowed guest access)
  const hasAccess = isAuthenticated ||
    (isCheckoutPage && guestCheckoutEnabled) ||
    (allowGuest && guestCheckoutEnabled);

  // Show fallback or loading if no access
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}