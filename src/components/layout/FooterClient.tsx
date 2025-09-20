'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  ChevronRight,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { newsletterApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SiteInfo {
  name?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
}

interface SocialLinks {
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
}

interface FooterClientProps {
  footerMenu: FooterSection[];
  siteInfo: SiteInfo;
  social: SocialLinks;
  shipping?: any;
  payment?: {
    free_shipping_threshold?: number;
  };
}

export function FooterClient({
  footerMenu = [],
  siteInfo = {},
  social = {},
  payment = {}
}: FooterClientProps) {
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

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: `Above ₹${payment.free_shipping_threshold || 499}`,
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

  const socialIcons: { [key: string]: any } = {
    facebook_url: Facebook,
    twitter_url: Twitter,
    instagram_url: Instagram,
    youtube_url: Youtube,
    linkedin_url: Linkedin,
  };

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

      {/* Main footer content */}
      <div className="py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company info and newsletter */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                <h2 className="text-lg md:text-2xl font-bold text-foreground">
                  {siteInfo.name || 'BookBharat'}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {siteInfo.description || 'Your Knowledge Partner for Life. Discover millions of books across all genres.'}
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-sm md:text-base">Subscribe to our Newsletter</h3>
                <form onSubmit={handleNewsletterSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isSubscribing}
                    className="flex-1 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Button
                    type="submit"
                    disabled={isSubscribing}
                    className="px-4 py-2"
                  >
                    {isSubscribing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </form>
              </div>

              {/* Contact info */}
              <div className="space-y-2 text-sm text-muted-foreground">
                {siteInfo.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${siteInfo.contact_email}`} className="hover:text-primary">
                      {siteInfo.contact_email}
                    </a>
                  </div>
                )}
                {siteInfo.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${siteInfo.contact_phone}`} className="hover:text-primary">
                      {siteInfo.contact_phone}
                    </a>
                  </div>
                )}
                {siteInfo.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>
                      {siteInfo.address.line1 && `${siteInfo.address.line1}, `}
                      {siteInfo.address.line2 && `${siteInfo.address.line2}, `}
                      {siteInfo.address.city}, {siteInfo.address.state} {siteInfo.address.pincode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic footer links from backend */}
            {footerMenu.map((section, index) => (
              <div key={index}>
                {/* Mobile accordion style */}
                <button
                  className="flex items-center justify-between w-full md:hidden mb-2"
                  onClick={() => toggleSection(section.title)}
                >
                  <h3 className="font-semibold text-sm">{section.title}</h3>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    expandedSections.includes(section.title) ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Desktop always visible */}
                <h3 className="hidden md:block font-semibold mb-4 text-sm md:text-base">
                  {section.title}
                </h3>

                <ul className={`space-y-2 text-sm ${
                  expandedSections.includes(section.title) || 'hidden md:block'
                }`}>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.url}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* If no footer menu from backend, show fallback */}
            {footerMenu.length === 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-4 text-sm md:text-base">Quick Links</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                    <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                    <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4 text-sm md:text-base">Categories</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/categories/fiction" className="text-muted-foreground hover:text-primary">Fiction</Link></li>
                    <li><Link href="/categories/non-fiction" className="text-muted-foreground hover:text-primary">Non-Fiction</Link></li>
                    <li><Link href="/categories/academic" className="text-muted-foreground hover:text-primary">Academic</Link></li>
                    <li><Link href="/categories/childrens" className="text-muted-foreground hover:text-primary">Children's Books</Link></li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">
                  © 2024 {siteInfo.name || 'BookBharat'}. All rights reserved.
                </p>
              </div>

              {/* Social links from backend */}
              <div className="flex items-center gap-4">
                {Object.entries(social).map(([key, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[key];
                  if (!Icon) return null;

                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>

              {/* Payment methods */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">We Accept:</span>
                <div className="flex items-center gap-2">
                  <div className="bg-muted rounded px-2 py-1 text-xs">UPI</div>
                  <div className="bg-muted rounded px-2 py-1 text-xs">Cards</div>
                  <div className="bg-muted rounded px-2 py-1 text-xs">NetBanking</div>
                  <div className="bg-muted rounded px-2 py-1 text-xs">COD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}