'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { newsletterApi } from '@/lib/api';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    
    try {
      const response = await newsletterApi.subscribe({ 
        email,
        preferences: ['books', 'offers', 'news'] 
      });
      
      toast.success(response.message || 'Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubscribing(false);
    }
  };

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press & Media', href: '/press' },
      { name: 'Corporate Sales', href: '/corporate' },
      { name: 'Investor Relations', href: '/investors' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Track Order', href: '/track-order' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
    ],
    policies: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Refund Policy', href: '/refund' },
      { name: 'Shipping Policy', href: '/shipping' },
    ],
    categories: [
      { name: 'Fiction', href: '/categories/fiction' },
      { name: 'Non-Fiction', href: '/categories/non-fiction' },
      { name: 'Academic', href: '/categories/academic' },
      { name: 'Children\'s Books', href: '/categories/childrens' },
      { name: 'Regional Books', href: '/categories/regional' },
    ],
  };

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders above ₹499',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure transactions',
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Options',
      description: 'Card, UPI, Wallet & more',
    },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border mobile-optimized">
      {/* Features section - Compact design */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto compact-container compact-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 compact-gap">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center compact-gap">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 text-primary rounded-md p-1.5">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="compact-text font-semibold text-foreground truncate">
                      {feature.title}
                    </h3>
                    <p className="text-[10px] compact-text text-muted-foreground line-clamp-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main footer content - Compact design */}
      <div className="max-w-7xl mx-auto compact-container compact-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 compact-gap">
          {/* Brand section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center compact-gap mb-3">
              <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                <span className="compact-text font-bold">BB</span>
              </div>
              <div>
                <h2 className="compact-heading text-primary">BookBharat</h2>
                <p className="compact-text text-muted-foreground">Your Knowledge Partner</p>
              </div>
            </Link>
            <p className="compact-text text-muted-foreground mb-3 max-w-md leading-relaxed">
              BookBharat is India's leading online bookstore offering millions of books across all genres. 
              Discover your next favorite read with us.
            </p>
            
            {/* Contact info - Compact */}
            <div className="ultra-compact mb-3">
              <div className="flex items-center compact-gap compact-text">
                <Phone className="h-3 w-3 text-primary flex-shrink-0" />
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center compact-gap compact-text">
                <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                <span>support@bookbharat.com</span>
              </div>
              <div className="flex items-center compact-gap compact-text">
                <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Social links - Compact */}
            <div className="flex items-center compact-gap">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors p-1 touch-target">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors p-1 touch-target">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors p-1 touch-target">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors p-1 touch-target">
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Footer links - Compact design */}
          <div>
            <h3 className="compact-heading text-foreground mb-2">Company</h3>
            <ul className="ultra-compact">
              {footerLinks.company.slice(0, 4).map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="compact-text text-muted-foreground hover:text-primary transition-colors py-0.5 touch-target block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="compact-heading text-foreground mb-2">Support</h3>
            <ul className="ultra-compact">
              {footerLinks.support.slice(0, 4).map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="compact-text text-muted-foreground hover:text-primary transition-colors py-0.5 touch-target block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="compact-heading text-foreground mb-2">Categories</h3>
            <ul className="ultra-compact">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="compact-text text-muted-foreground hover:text-primary transition-colors py-0.5 touch-target block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter signup - Compact design */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between compact-gap">
            <div className="mb-2 sm:mb-0">
              <h3 className="compact-heading text-foreground mb-1">Stay Updated</h3>
              <p className="compact-text text-muted-foreground">
                Subscribe for the latest books and exclusive offers.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubscribe} className="flex w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isSubscribing}
                className="flex-1 sm:w-48 lg:w-56 px-2.5 py-1.5 compact-text border border-border rounded-l-md bg-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed touch-target"
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="bg-primary text-primary-foreground px-2.5 sm:px-3 py-1.5 compact-text rounded-r-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px] sm:min-w-[80px] touch-target"
              >
                {isSubscribing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar - Compact design */}
      <div className="bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto compact-container py-2.5 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between compact-text text-muted-foreground compact-gap">
            <p>© 2024 BookBharat. All rights reserved.</p>
            <div className="flex items-center compact-gap">
              <Link href="/privacy" className="hover:text-primary transition-colors py-0.5 touch-target">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors py-0.5 touch-target">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors py-0.5 touch-target">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}