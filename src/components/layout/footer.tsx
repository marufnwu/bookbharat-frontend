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
  Loader2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { newsletterApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Track Order', href: '/track-order' },
      { name: 'Returns', href: '/returns' },
    ],
    policies: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Refund Policy', href: '/refund' },
      { name: 'Shipping Policy', href: '/shipping' },
    ],
    categories: [
      { name: 'Fiction', href: '/categories/fiction' },
      { name: 'Non-Fiction', href: '/categories/non-fiction' },
      { name: 'Academic', href: '/categories/academic' },
      { name: 'Children\'s Books', href: '/categories/childrens' },
    ],
  };

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Above ₹499',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30 days',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: '100% safe',
    },
    {
      icon: CreditCard,
      title: 'Payment',
      description: 'All modes',
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      {/* Features section - Mobile optimized */}
      <div className="bg-muted/30 py-4 md:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2 md:gap-3">
                  <div className="flex-shrink-0">
                    <div className="bg-primary/10 text-primary rounded-lg p-2 md:p-2.5">
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm font-semibold text-foreground truncate">
                      {feature.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Newsletter section - Mobile optimized */}
      <div className="bg-primary/5 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
                Stay Updated
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Get the latest books and exclusive offers
              </p>
            </div>
            <form onSubmit={handleNewsletterSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                disabled={isSubscribing}
                className="flex-1 md:w-64 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <Button 
                type="submit"
                disabled={isSubscribing}
                size="default"
                className="min-w-[80px]"
              >
                {isSubscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Accordion style */}
          <div className="md:hidden space-y-4">
            {/* Brand section - Always visible on mobile */}
            <div className="pb-4 border-b border-border">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground rounded-lg p-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary">BookBharat</h2>
                  <p className="text-xs text-muted-foreground">Your Knowledge Partner</p>
                </div>
              </Link>
              
              <div className="space-y-2 mb-4">
                <a href="tel:+911234567890" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+91 12345 67890</span>
                </a>
                <a href="mailto:support@bookbharat.com" className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>support@bookbharat.com</span>
                </a>
              </div>

              <div className="flex gap-3">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Collapsible sections for mobile */}
            {Object.entries(footerLinks).map(([key, links]) => (
              <div key={key} className="border-b border-border pb-2">
                <button
                  onClick={() => toggleSection(key)}
                  className="flex items-center justify-between w-full py-2 text-left"
                >
                  <h3 className="text-sm font-semibold capitalize">
                    {key === 'company' ? 'Company' : 
                     key === 'support' ? 'Support' : 
                     key === 'policies' ? 'Policies' : 'Categories'}
                  </h3>
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${
                      expandedSections.includes(key) ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedSections.includes(key) && (
                  <ul className="py-2 space-y-2">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href} 
                          className="text-sm text-muted-foreground hover:text-primary block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground rounded-lg p-2">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">BookBharat</h2>
                  <p className="text-sm text-muted-foreground">Your Knowledge Partner</p>
                </div>
              </Link>
              
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                India's leading online bookstore offering millions of books across all genres.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+91 12345 67890</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>support@bookbharat.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Mumbai, Maharashtra</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Links sections */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Categories</h3>
              <ul className="space-y-2">
                {footerLinks.categories.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-muted/30 border-t border-border py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs md:text-sm text-muted-foreground">
            <p>© 2024 BookBharat. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}