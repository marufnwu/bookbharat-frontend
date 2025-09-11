'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useHydratedAuth } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import { productApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X,
  Heart,
  Bell,
  ArrowLeft,
  LogIn,
  LogOut,
  Package,
  Settings,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileOptimizedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useHydratedAuth();
  const { getTotalItems, cart } = useCartStore();

  const totalItems = getTotalItems();

  // Hide header on certain pages
  const hiddenPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const shouldHideHeader = hiddenPaths.some(path => pathname.startsWith(path));

  // Search functionality with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearchLoading(true);
        try {
          const response = await productApi.getProductSuggestions(searchQuery);
          if (response.success) {
            setSearchSuggestions(response.data.slice(0, 5));
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        } finally {
          setIsSearchLoading(false);
        }
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        // Close search if it's expanded and user clicks outside
        if (isSearchExpanded && searchQuery === '') {
          setIsSearchExpanded(false);
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchExpanded, searchQuery]);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsSearchExpanded(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  if (shouldHideHeader) {
    return null;
  }

  return (
    <>
      {/* Mobile Header - Compact Design */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-3 py-2 safe-top">
          {/* Main Header Row */}
          <div className="flex items-center gap-2">
            {/* Logo - Hidden when search is expanded */}
            {!isSearchExpanded && (
              <Link href="/" className="flex items-center flex-shrink-0">
                <div className="bg-primary text-primary-foreground rounded-md p-1.5">
                  <span className="text-xs font-bold">BB</span>
                </div>
              </Link>
            )}

            {/* Expandable Search Bar */}
            <div className={cn(
              "transition-all duration-300 ease-in-out",
              isSearchExpanded ? "flex-1" : "flex-none"
            )} ref={searchContainerRef}>
              {!isSearchExpanded ? (
                /* Search Icon Button */
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsSearchExpanded(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              ) : (
                /* Expanded Search Form */
                <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                  {/* Back button to close search */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search books, authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-border rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    
                    {isSearchLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Clear button */}
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </form>
              )}

              {/* Search Suggestions - Mobile Optimized */}
              {isSearchExpanded && showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
                      onClick={() => {
                        router.push(`/products/${suggestion.slug || suggestion.id}`);
                        setShowSuggestions(false);
                        setSearchQuery('');
                        setIsSearchExpanded(false);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {suggestion.title || suggestion.name}
                        </p>
                        {suggestion.author && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            by {suggestion.author}
                          </p>
                        )}
                      </div>
                      {suggestion.price && (
                        <span className="text-xs font-semibold text-primary flex-shrink-0">
                          ₹{suggestion.price}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spacer to maintain layout when search is not expanded */}
            {!isSearchExpanded && <div className="flex-1" />}

            {/* Right Actions - Hidden when search is expanded */}
            {!isSearchExpanded && (
              <div className="flex items-center gap-1">
                {/* Wishlist */}
                <Link href="/wishlist">
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Cart */}
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <ShoppingCart className="h-4 w-4" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Notifications - Only for authenticated users */}
                {isAuthenticated && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-destructive rounded-full" />
                  </Button>
                )}

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => isAuthenticated ? setShowUserMenu(!showUserMenu) : router.push('/auth/login')}
                  >
                    {isAuthenticated ? (
                      <div className="relative">
                        <User className="h-4 w-4" />
                        {user?.name && (
                          <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-green-500 rounded-full border border-background" />
                        )}
                      </div>
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                  </Button>

                  {/* User Dropdown Menu */}
                  {isAuthenticated && showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-3.5 w-3.5" />
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="h-3.5 w-3.5" />
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart className="h-3.5 w-3.5" />
                        Wishlist
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Settings
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors w-full text-left text-destructive"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 bg-background border-b border-border">
        {/* Full desktop header implementation here - keeping existing desktop design */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop header content */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <span className="text-lg font-bold">BB</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">BookBharat</h1>
                <p className="text-xs text-muted-foreground">Your Knowledge Partner</p>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  placeholder="Search for books, authors..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </form>
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/wishlist" className="hover:text-primary transition-colors">
                <Heart className="h-5 w-5" />
              </Link>
              <Link href="/cart" className="relative hover:text-primary transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header on mobile */}
      <div className="md:hidden h-12 safe-top" />
    </>
  );
}