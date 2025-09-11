'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
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
  Trash2
} from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
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

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Books', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'New Arrivals', href: '/products?filter=new' },
    { name: 'Best Sellers', href: '/products?filter=bestseller' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@bookbharat.com</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span>Free shipping on orders above ₹499!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground rounded-lg p-2">
                <span className="text-xl font-bold">BB</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary">BookBharat</h1>
                <p className="text-sm text-muted-foreground">Your Knowledge Partner</p>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search for books, authors, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* Cart */}
            <div className="relative group">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {mounted && totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </Link>
              
              {/* Cart Dropdown */}
              <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Shopping Cart</h3>
                    <Link href="/cart" className="text-primary hover:underline text-sm">
                      View All
                    </Link>
                  </div>
                  
                  {cart && cart.items && cart.items.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 py-2 border-b border-border last:border-b-0">
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {item.product?.name?.charAt(0) || 'P'}
                            </span>
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
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted">
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-muted">
                      Orders
                    </Link>
                    <Link href="/addresses" className="block px-4 py-2 text-sm hover:bg-muted">
                      Addresses
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center justify-center space-x-8 py-4 border-t border-border">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-foreground hover:bg-muted rounded-lg"
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