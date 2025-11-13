'use client';
import { MobileHeader } from './MobileHeader';

import { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHydratedAuth } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { useConfig } from '@/contexts/ConfigContext';
import { productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  Phone,
  Mail,
  Trash2,
  BookOpen,
  TrendingUp,
  Clock,
  ChevronDown
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationItem[];
}

interface SiteConfig {
  site: {
    name: string;
    contact_email: string;
    contact_phone: string;
  };
  payment: {
    free_shipping_threshold: number;
  };
}

function HeaderDynamicComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useHydratedAuth();
  const cart = useCartStore((state) => state.cart);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const cartItems = cart?.items ?? [];
  const totalItems = getTotalItems ? getTotalItems() : cart?.total_items ?? 0;
  const cartSubtotal = getSubtotal ? getSubtotal() : cart?.subtotal ?? 0;

  // Use ConfigContext instead of fetching separately
  const { siteConfig, navigationConfig, loading: configLoading } = useConfig();

  // Format navigation from ConfigContext
  const navigation = navigationConfig?.header_menu?.map((item: any) => ({
    name: item.label,
    href: item.url,
    children: item.children?.map((child: any) => ({
      name: child.label,
      href: child.url
    })) || []
  })) || [
    { name: 'Home', href: '/' },
    { name: 'Books', href: '/products' },
    { name: 'Categories', href: '/categories', children: [] },
    { name: 'New Arrivals', href: '/products?filter=new' },
    { name: 'Best Sellers', href: '/products?filter=bestseller' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-render when cart changes
  useEffect(() => {
    if (cart) {
      // Force re-render when cart updates
    }
  }, [cart]);

  // Fetch search suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearchLoading(true);
        try {
          const response = await productApi.searchProducts(searchQuery, {
            limit: 5,
            fields: 'id,title,slug,price,image_url,author',
          });

          if (response.products && response.products.length > 0) {
            setSearchSuggestions(response.products);
            setShowSuggestions(true);
          } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsSearchLoading(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === "product") {
      router.push(`/products/${suggestion.slug || suggestion.id}`);
    } else {
      handleSearch(suggestion.title || suggestion.name);
    }
    setShowSuggestions(false);
    setSearchQuery("");
  };

  // Show mobile header for small screens
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Return mobile header for mobile devices
  if (isMobile && mounted) {
    return <MobileHeader />;
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top bar - Hidden on mobile for compact design */}
      <div className="bg-primary text-primary-foreground hidden lg:block">
        <div className="max-w-7xl mx-auto compact-container">
          <div className="flex items-center justify-between h-6 text-xs">
            <div className="flex items-center compact-gap">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{siteConfig?.site.contact_phone || '+91 12345 67890'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{siteConfig?.site.contact_email || 'support@bookbharat.com'}</span>
              </div>
            </div>
            <div>
              <span>
                Free shipping on orders above ₹{siteConfig?.payment.free_shipping_threshold || 0}!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto compact-container">
        <div className="flex items-center justify-between h-12">
          {/* Logo - Now clickable */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">{siteConfig?.site.name || 'BookBharat'}</span>
          </Link>

          {/* Search bar - Wider and centered */}
          <div className="flex-1 max-w-2xl mx-8 hidden lg:block" ref={searchContainerRef}>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for books, authors, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-1.5 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={() => handleSearch()}
              />

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div>
                        <p className="text-sm font-medium">{suggestion.title}</p>
                        {suggestion.author && (
                          <p className="text-xs text-gray-500">by {suggestion.author}</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold">₹{suggestion.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center compact-gap">
            <Link href="/wishlist" className="p-1.5 hover:bg-gray-100 rounded">
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart with count */}
            <Link href="/cart" className="p-1.5 hover:bg-gray-100 rounded relative">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            {mounted && isAuthenticated && user ? (
              <div className="relative group">
                <button className="p-1.5 hover:bg-gray-100 rounded flex items-center space-x-1">
                  <User className="h-5 w-5" />
                  <span className="text-sm hidden lg:inline">{user.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    My Orders
                  </Link>
                  <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    Wishlist
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="p-1.5 hover:bg-gray-100 rounded flex items-center space-x-1">
                <User className="h-5 w-5" />
                <span className="text-sm hidden lg:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation menu - Hidden on mobile */}
      <nav className="bg-gray-50 border-t hidden lg:block">
        <div className="max-w-7xl mx-auto compact-container">
          <div className="flex items-center justify-center space-x-6 h-9">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center gap-1"
                >
                  {item.name}
                  {item.children && item.children.length > 0 && (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Link>

                {/* Dropdown for children */}
                {item.children && item.children.length > 0 && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

// Export memoized version to prevent unnecessary re-renders
export const HeaderDynamic = memo(HeaderDynamicComponent);