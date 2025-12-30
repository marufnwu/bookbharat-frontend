'use client';

import React from 'react';
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
import { useNavigationMenus, useSiteInfo, useSocialLinks, useHomepageLayout } from '@/contexts/SiteConfigContext';
import { useConfig } from '@/contexts/ConfigContext';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Get dynamic configuration
  const navigation = useNavigationMenus();
  const siteInfo = useSiteInfo();
  const socialLinks = useSocialLinks();
  const homepageLayout = useHomepageLayout();
  const newsletter = homepageLayout?.newsletter;
  const { siteConfig } = useConfig();

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

  // Use dynamic footer sections from navigation config
  const footerSections = navigation?.footer?.sections || [];

  // Create footer links object for backward compatibility with mobile accordion
  const footerLinks = React.useMemo(() => {
    const links: Record<string, any[]> = {
      primary: [],
      secondary: [],
      legal: []
    };

    footerSections.forEach(section => {
      // Map section titles to link categories
      if (section.title.toLowerCase().includes('quick') || section.title.toLowerCase().includes('about')) {
        links.primary.push(...section.links);
      } else if (section.title.toLowerCase().includes('service') || section.title.toLowerCase().includes('support')) {
        links.secondary.push(...section.links);
      } else if (section.title.toLowerCase().includes('policy') || section.title.toLowerCase().includes('legal')) {
        links.legal.push(...section.links);
      } else {
        // Default to primary if category doesn't match
        links.primary.push(...section.links);
      }
    });

    return links;
  }, [footerSections]);

  const features = [
    ...(siteConfig?.payment?.free_shipping_enabled !== false ? [{
      icon: Truck,
      title: 'Free Shipping',
      description: siteConfig?.payment?.free_shipping_threshold && siteConfig.payment.free_shipping_threshold > 0
        ? `Above ${siteConfig.payment.currency_symbol || '₹'}${siteConfig.payment.free_shipping_threshold}`
        : 'On all orders',
    }] : []),
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
      {/* Main footer content */}
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Accordion style */}
          <div className="md:hidden space-y-4">
            {/* Brand section - Always visible on mobile */}
            <div className="pb-4 border-b border-border">
              <Link href="/" className="flex items-center gap-2 mb-4">
                {siteInfo?.logo ? (
                  <img
                    src={siteInfo.logo}
                    alt={siteInfo.name || 'BookBharat'}
                    className="h-10 w-auto"
                  />
                ) : (
                  <div className="bg-primary text-primary-foreground rounded-lg p-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-primary">{siteInfo?.name || 'BookBharat'}</h2>
                  <p className="text-xs text-muted-foreground">{siteInfo?.description || 'Your Knowledge Partner'}</p>
                </div>
              </Link>

              <div className="space-y-2 mb-4">
                {siteInfo?.phone && (
                  <a href={`tel:${siteInfo.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{siteInfo.phone}</span>
                  </a>
                )}
                {siteInfo?.email && (
                  <a href={`mailto:${siteInfo.email}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{siteInfo.email}</span>
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                {socialLinks?.facebook_url && (
                  <Link href={socialLinks.facebook_url} className="text-muted-foreground hover:text-primary" target="_blank">
                    <Facebook className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks?.twitter_url && (
                  <Link href={socialLinks.twitter_url} className="text-muted-foreground hover:text-primary" target="_blank">
                    <Twitter className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks?.instagram_url && (
                  <Link href={socialLinks.instagram_url} className="text-muted-foreground hover:text-primary" target="_blank">
                    <Instagram className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks?.youtube_url && (
                  <Link href={socialLinks.youtube_url} className="text-muted-foreground hover:text-primary" target="_blank">
                    <Youtube className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Collapsible sections for mobile */}
            {Object.entries(footerLinks).map(([key, links]) => (
              links.length > 0 && (
                <div key={key} className="border-b border-border pb-2">
                  <button
                    onClick={() => toggleSection(key)}
                    className="flex items-center justify-between w-full py-2 text-left"
                  >
                    <h3 className="text-sm font-semibold capitalize">
                      {key === 'primary' ? 'Company' :
                        key === 'secondary' ? 'Support' :
                          key === 'legal' ? 'Policies' : key}
                    </h3>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${expandedSections.includes(key) ? 'rotate-90' : ''
                        }`}
                    />
                  </button>
                  {expandedSections.includes(key) && (
                    <ul className="py-2 space-y-2">
                      {links.map((link) => (
                        <li key={link.id || link.name}>
                          <Link
                            href={link.url || link.href}
                            className="text-sm text-muted-foreground hover:text-primary block py-1"
                            target={link.target || '_self'}
                          >
                            {link.label || link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            ))}
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                {siteInfo?.logo ? (
                  <img
                    src={siteInfo.logo}
                    alt={siteInfo.name || 'BookBharat'}
                    className="h-12 w-auto"
                  />
                ) : (
                  <div className="bg-primary text-primary-foreground rounded-lg p-2">
                    <BookOpen className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-primary">{siteInfo?.name || 'BookBharat'}</h2>
                  <p className="text-sm text-muted-foreground">{siteInfo?.description || 'Your Knowledge Partner'}</p>
                </div>
              </Link>

              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {siteInfo?.description || "India's leading online bookstore offering millions of books across all genres."}
              </p>

              <div className="space-y-2 mb-4">
                {siteInfo?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{siteInfo.phone}</span>
                  </div>
                )}
                {siteInfo?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{siteInfo.email}</span>
                  </div>
                )}
                {siteInfo?.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      {(() => {
                        if (typeof siteInfo.address === 'string') {
                          return siteInfo.address;
                        } else {
                          const address = siteInfo.address;
                          const parts = [
                            address.line1,
                            address.line2,
                            address.city,
                            address.state,
                            address.pincode,
                            address.country
                          ].filter(Boolean);
                          return parts.join(', ');
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {socialLinks?.facebook_url && (
                  <Link href={socialLinks.facebook_url} className="text-muted-foreground hover:text-primary transition-colors" target="_blank">
                    <Facebook className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks?.twitter_url && (
                  <Link href={socialLinks.twitter_url} className="text-muted-foreground hover:text-primary transition-colors" target="_blank">
                    <Twitter className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks?.instagram_url && (
                  <Link href={socialLinks.instagram_url} className="text-muted-foreground hover:text-primary transition-colors" target="_blank">
                    <Instagram className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks?.youtube_url && (
                  <Link href={socialLinks.youtube_url} className="text-muted-foreground hover:text-primary transition-colors" target="_blank">
                    <Youtube className="h-5 w-5" />
                  </Link>
                )}
                {socialLinks?.linkedin_url && (
                  <Link href={socialLinks.linkedin_url} className="text-muted-foreground hover:text-primary transition-colors" target="_blank">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Dynamic links sections */}
            {footerSections.map((section, index) => (
              <div key={`${section.title}-${index}`}>
                <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.id || link.name}>
                      <Link
                        href={link.url || link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        target={link.target || '_self'}
                      >
                        {link.label || link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-muted/30 border-t border-border py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs md:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {siteInfo?.name || 'BookBharat'}. All rights reserved.</p>
            {footerLinks.legal.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.id || link.name}
                    href={link.url || link.href}
                    className="hover:text-primary transition-colors"
                    target={link.target || '_self'}
                  >
                    {link.label || link.name}
                  </Link>
                ))}
                <Link href="/cookies" className="hover:text-primary transition-colors">
                  Cookies
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}