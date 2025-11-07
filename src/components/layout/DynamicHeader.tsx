'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useNavigationMenus, useSiteInfo, useFeatureFlags } from '@/contexts/SiteConfigContext';
import { Menu, X, Search, ShoppingCart, User, Heart } from 'lucide-react';

export function DynamicHeader() {
  const navigation = useNavigationMenus();
  const siteInfo = useSiteInfo();
  const features = useFeatureFlags();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!navigation || !siteInfo) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded" />
            <div className="animate-pulse bg-gray-200 h-8 w-64 rounded" />
          </div>
        </div>
      </header>
    );
  }

  const renderNavigationItems = (items: any[]) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <div key={item.id} className="relative group">
            <button className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center">
              {item.label}
              <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                {renderNavigationItems(item.children)}
              </div>
            </div>
          </div>
        );
      }

      return (
        <Link
          key={item.id}
          href={item.url}
          className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
          target={item.target}
        >
          {item.label}
        </Link>
      );
    });
  };

  return (
    <>
      <header className={`bg-white transition-all duration-200 ${scrolled ? 'shadow-lg border-b' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar */}
          {navigation.header.secondary.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {navigation.header.secondary.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="hover:text-gray-900"
                      target={item.target}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  {siteInfo.phone && (
                    <a href={`tel:${siteInfo.phone}`} className="text-gray-600 hover:text-gray-900">
                      {siteInfo.phone}
                    </a>
                  )}
                  {siteInfo.email && (
                    <a href={`mailto:${siteInfo.email}`} className="text-gray-600 hover:text-gray-900">
                      {siteInfo.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main header */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                {siteInfo.logo ? (
                  <img
                    src={siteInfo.logo}
                    alt={siteInfo.name}
                    className="h-8 w-auto"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-900">{siteInfo.name}</span>
                )}
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8">
              {renderNavigationItems(navigation.header.primary)}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </button>

              {features.wishlist && (
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <Heart className="h-5 w-5" />
                </button>
              )}

              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {/* Add cart count badge here */}
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900">
                <User className="h-5 w-5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {renderNavigationItems(navigation.header.mobile.length > 0 ? navigation.header.mobile : navigation.header.primary)}
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}