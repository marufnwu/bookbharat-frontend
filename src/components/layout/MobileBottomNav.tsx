'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import {
  Home,
  ShoppingCart,
  Heart,
  User,
  Package,
  ShoppingBag,
  Menu
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  active?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const cart = useCartStore((state) => state.cart);
  const wishlist = useWishlistStore((state) => state.wishlist);

  const cartCount = (cart?.items ?? []).reduce((total, item) => total + (item.quantity || 0), 0);
  const wishlistCount = wishlist?.length ?? 0;

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/'
    },
    {
      href: '/categories',
      label: 'Categories',
      icon: ShoppingBag,
      active: pathname === '/categories' || pathname.startsWith('/categories/')
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : undefined,
      active: pathname === '/cart'
    },
    {
      href: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : undefined,
      active: pathname === '/wishlist'
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
      active: pathname === '/profile' || pathname.startsWith('/profile/')
    }
  ];

  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'mobile-nav-item flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-all duration-200 relative',
                isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge
                    className={cn(
                      'mobile-nav-badge absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-medium bg-primary text-white border-0',
                      item.badge > 0 && 'animate-pulse'
                    )}
                    variant="destructive"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Safe area padding for iOS devices */}
      <div
        className="h-0 bg-gradient-to-t from-transparent to-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      />
    </nav>
  );
}