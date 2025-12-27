'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  BookOpen,
  Home,
  Grid3x3,
  Package,
  Info,
  Phone,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useHydratedAuth();
  const { getTotalItems } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = getTotalItems();

  // Auto-focus search when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Search suggestions
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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setShowSuggestions(false);
      setIsSearchOpen(false);
      setSearchQuery('');
      // Redirect to unified products page with search parameter
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Books', href: '/products', icon: BookOpen },
    { name: 'Categories', href: '/categories', icon: Grid3x3 },
    { name: 'New Arrivals', href: '/products?filter=new', icon: Package },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  return (
    <>
      {/* Main Mobile Header - Clean and Minimal */}
      <header className="lg:hidden bg-background border-b border-border sticky top-0 z-50">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Logo & Menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-9 w-9"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <Link href="/" className="flex items-center">
                <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                  <span className="text-sm font-bold">BB</span>
                </div>
              </Link>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="h-9 w-9"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9"
              >
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9 relative"
              >
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {isMounted && totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>
              </Button>

              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9"
                >
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9"
                >
                  <Link href="/auth/login">
                    <LogIn className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Slide-out Menu */}
        <div className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className={cn(
            "fixed left-0 top-0 h-full w-72 bg-background shadow-xl transition-transform duration-300",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            {/* Menu Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              {isAuthenticated && user && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="p-4">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">My Orders</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full" variant="default">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Search Overlay */}
      <div className={cn(
        "lg:hidden fixed inset-0 bg-background z-50 transition-transform duration-300",
        isSearchOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="p-4">
          {/* Search Header */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for books, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {isSearchLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Search Suggestions - Enhanced with Images */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="space-y-2">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full p-2.5 text-left bg-muted rounded-lg hover:bg-muted/80 active:bg-muted/70 transition-colors group"
                  onClick={() => {
                    // All suggestions from API are products, navigate to product details
                    if (suggestion.slug || suggestion.id) {
                      router.push(`/products/${suggestion.slug || suggestion.id}`);
                    } else {
                      handleSearch(suggestion.title || suggestion.name);
                    }
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Product Image */}
                    {suggestion.image_url ? (
                      <div className="flex-shrink-0 w-14 h-14 rounded overflow-hidden bg-gray-100">
                        <img
                          src={suggestion.image_url}
                          alt={suggestion.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-14 h-14 rounded bg-gray-100 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {suggestion.title || suggestion.name}
                      </p>
                      {suggestion.author && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          by {suggestion.author}
                        </p>
                      )}
                      {suggestion.publisher && (
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {suggestion.publisher}
                        </p>
                      )}
                    </div>

                    {/* Price & Discount */}
                    {suggestion.price && (
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-semibold text-primary">
                          ₹{suggestion.price}
                        </div>
                        {suggestion.discount_percentage > 0 && (
                          <div className="text-[10px] text-green-600 font-medium mt-0.5">
                            {suggestion.discount_percentage}% OFF
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Links */}
          {!searchQuery && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/products?filter=new"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 bg-muted rounded-lg text-center text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  New Arrivals
                </Link>
                <Link
                  href="/products?filter=bestseller"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 bg-muted rounded-lg text-center text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Best Sellers
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 bg-muted rounded-lg text-center text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Categories
                </Link>
                <Link
                  href="/products?filter=featured"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 bg-muted rounded-lg text-center text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Featured
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}