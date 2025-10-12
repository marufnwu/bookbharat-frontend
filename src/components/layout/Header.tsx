'use client';
import { MobileHeader } from './MobileHeader';

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
  Phone,
  Mail,
  Trash2,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';

export function Header() {
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
  const cartStore = useCartStore();
  const { getTotalItems, getCart, cart, removeItem, getSubtotal } = cartStore;

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
    console.log('📱 Header mounted');
  }, []);

  // Re-render when cart changes - improved reactivity
  useEffect(() => {
    console.log('📱 Header cart effect triggered - cart:', cart ? 'exists' : 'null');
    if (cart) {
      console.log('📱 Header cart items count:', cart.items?.length, 'total_items:', cart.total_items);
    }
  }, [cart]);

  // Create a stable reference for total items count
  const totalItems = getTotalItems();
  
  useEffect(() => {
    console.log('📱 Header totalItems changed:', totalItems);
  }, [totalItems]);

  // Search functionality
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearchLoading(true);
        try {
          const response = await productApi.getProductSuggestions(searchQuery);
          if (response.success) {
            setSearchSuggestions(response.data.slice(0, 5)); // Limit to 5 suggestions
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

    const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle clicks outside search to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
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

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Books', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'New Arrivals', href: '/products?filter=new' },
    { name: 'Best Sellers', href: '/products?filter=bestseller' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

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
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>support@bookbharat.com</span>
              </div>
            </div>
            <div>
              <span>Free shipping on orders above ₹499!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto compact-container">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="bg-primary text-primary-foreground rounded-lg p-1 sm:p-1.5">
                <span className="text-base sm:text-lg font-bold">BB</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="compact-title text-primary">BookBharat</h1>
                <p className="compact-text text-muted-foreground">Your Knowledge Partner</p>
              </div>
            </Link>
          </div>

          {/* Enhanced Search bar */}
          <div className="flex-1 max-w-2xl mx-1.5 sm:mx-3 md:mx-6" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                className="block w-full pl-7 sm:pl-8 pr-8 sm:pr-10 py-1.5 sm:py-2 compact-text border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                autoComplete="off"
              />
              {isSearchLoading && (
                <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary"></div>
                </div>
              )}

              {/* Search Suggestions - Ultra Mobile Optimized */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-xl z-50 max-h-48 sm:max-h-64 overflow-y-auto mobile-optimized">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-left hover:bg-muted active:bg-muted/80 transition-colors border-b border-border last:border-b-0 flex items-start gap-1.5 sm:gap-2 min-h-[40px] sm:min-h-[44px]"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {suggestion.type === 'product' ? (
                          <BookOpen className="h-3 w-3 text-primary" />
                        ) : suggestion.type === 'category' ? (
                          <TrendingUp className="h-3 w-3 text-accent" />
                        ) : (
                          <Search className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate leading-tight">
                          {suggestion.title || suggestion.name}
                        </p>
                        {(suggestion.author || suggestion.category) && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-tight">
                            {suggestion.author ? `by ${suggestion.author}` : `in ${suggestion.category}`}
                          </p>
                        )}
                      </div>
                      {suggestion.price && (
                        <div className="text-xs font-semibold text-primary flex-shrink-0 mt-0.5">
                          ₹{suggestion.price}
                        </div>
                      )}
                    </button>
                  ))}
                  <div className="px-2 py-1 sm:px-3 sm:py-1.5 text-center border-t border-border bg-muted/30">
                    <button
                      type="button"
                      className="text-[10px] sm:text-xs text-primary hover:underline font-medium py-1 px-2 rounded-md hover:bg-primary/10 transition-colors"
                      onClick={() => handleSearch(searchQuery)}
                    >
                      View all results
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center compact-gap">
            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="touch-target p-1.5 sm:p-2" asChild>
              <Link href="/wishlist">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* Cart */}
            <div className="relative group">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative touch-target p-1.5 sm:p-2">
                  <ShoppingCart className="h-4 w-4" />
                  {mounted && totalItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center min-w-0">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </Link>
              
              {/* Cart Dropdown - Mobile responsive */}
              <div className="absolute right-0 mt-1 w-64 sm:w-72 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-w-[calc(100vw-1rem)] sm:max-w-none">
                <div className="compact-padding">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="compact-heading">Shopping Cart</h3>
                    <Link href="/cart" className="text-primary hover:underline compact-text">
                      View All
                    </Link>
                  </div>
                  
                  {cart && cart.items && cart.items.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-border last:border-b-0">
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden relative">
                            {item.product?.images?.[0]?.url ? (
                              <img
                                src={item.product.images[0].image_url || images[0].url}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.product?.price || item.price}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              ₹{((item.product?.price || item.price) * item.quantity).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                removeItem(item.id);
                              }}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {cart.items.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          +{cart.items.length - 3} more items
                        </p>
                      )}
                      
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold">Subtotal:</span>
                          <span className="font-semibold">₹{getSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="space-y-2">
                          <Link href="/cart" className="block">
                            <Button variant="outline" className="w-full" size="sm">
                              View Cart
                            </Button>
                          </Link>
                          <Link href="/checkout" className="block">
                            <Button className="w-full" size="sm">
                              Checkout
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-4">Your cart is empty</p>
                      <Link href="/products">
                        <Button size="sm">Continue Shopping</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="touch-target">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline text-sm">{user?.name}</span>
                </Button>
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link href="/profile" className="block px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-muted touch-target">
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-muted touch-target">
                      Orders
                    </Link>
                    <Link href="/addresses" className="block px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-muted touch-target">
                      Addresses
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-muted touch-target"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="outline" size="sm" className="touch-target text-xs sm:text-sm px-2 sm:px-3" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button size="sm" className="touch-target text-xs sm:text-sm px-2 sm:px-3" asChild>
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden touch-target ml-1"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation - More compact on tablet */}
        <nav className="hidden md:flex items-center justify-center space-x-4 lg:space-x-8 py-3 lg:py-4 border-t border-border">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm lg:text-base text-foreground hover:text-primary transition-colors duration-200 font-medium px-2 py-1 hover:bg-muted/50 rounded-md"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile menu - Improved touch targets */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="py-3 space-y-1 px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-foreground hover:bg-muted rounded-lg touch-target font-medium text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}