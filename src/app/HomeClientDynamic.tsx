'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/contexts/ConfigContext';
import { newsletterApi } from '@/lib/api';
import { toast } from 'sonner';
import { Product, Category } from '@/types';
import HeroSection from '@/components/hero/HeroSection';
import ProductCard from '@/components/ui/product-card';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { PromotionalBannersSection } from '@/components/home/PromotionalBannersSection';
import { getProductCardProps, getProductGridClasses } from '@/lib/product-card-config';
import {
  ArrowRight,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

// Lazy load below-the-fold components
const CategoryProductSection = dynamic(
  () => import('@/components/CategoryProductSection'),
  {
    loading: () => (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
);

interface HomepageSection {
  id: number;
  section_id: string;
  section_type: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  settings?: any;
}

interface HomeClientProps {
  heroConfig: any;
  categories: Category[];
  featuredBooks: Product[];
  homepageSections: HomepageSection[];
  isMobile?: boolean;
}

export default function HomeClient({
  heroConfig,
  categories,
  featuredBooks,
  homepageSections = [],
  isMobile = false
}: HomeClientProps) {
  const { siteConfig, homepageConfig } = useConfig();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribingNewsletter, setIsSubscribingNewsletter] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribingNewsletter(true);

    try {
      const response = await newsletterApi.subscribe({
        email: newsletterEmail,
        preferences: ['books', 'offers', 'news']
      });

      toast.success(response.message || 'Successfully subscribed to newsletter!');
      setNewsletterEmail('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubscribingNewsletter(false);
    }
  };

  // Default hero config fallback
  const defaultHeroConfig = {
    variant: 'minimal-product' as const,
    title: siteConfig?.site.name || 'BookBharat',
    subtitle: siteConfig?.site.description || 'Your Knowledge Partner for Life',
    primaryCta: {
      text: 'Explore Books',
      href: '/products'
    },
    secondaryCta: {
      text: 'Browse Categories',
      href: '/categories'
    },
    stats: [
      { label: 'Books', value: '500K+', icon: 'book' },
      { label: 'Happy Readers', value: '100K+', icon: 'users' },
      { label: 'Rating', value: '4.8★', icon: 'star' }
    ],
    featuredProducts: featuredBooks
  };

  // Map section types to their render functions
  const renderSection = (section: HomepageSection) => {
    const key = `section-${section.section_id}-${section.id}`;

    switch (section.section_type) {
      case 'hero':
        return (
          <HeroSection
            key={key}
            config={{
              ...defaultHeroConfig,
              ...heroConfig,
              featuredProducts: featuredBooks
            }}
          />
        );

      case 'promotional-banners':
        return <PromotionalBannersSection key={key} />;

      case 'featured-products':
      case 'featured-books':
        return (
          <section key={key} className="py-6 sm:py-8 md:py-16">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-12 gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground truncate">
                    {section.title || 'Featured Books'}
                  </h2>
                  {!isMobile && section.subtitle && (
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 md:mt-2">
                      {section.subtitle}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="ml-2 sm:ml-4 flex-shrink-0 min-h-[36px] sm:min-h-[40px] px-2.5 sm:px-4 touch-target"
                  asChild
                >
                  <Link href="/products?featured=true" className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm">View All</span>
                    <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </Link>
                </Button>
              </div>

              {featuredBooks.length > 0 && (
                <div className={getProductGridClasses('homepageFeatured')}>
                  {featuredBooks.slice(0, isMobile ? 6 : 8).map((book) => (
                    <ProductCard
                      key={book.id}
                      product={book}
                      {...getProductCardProps('homepageFeatured', isMobile)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'categories':
        if (categories.length === 0) return null;
        return (
          <CategoriesSection
            key={key}
            categories={categories}
            className="bg-muted/20"
          />
        );

      case 'category-products':
        if (categories.length === 0) return null;
        const config = section.settings;
        return (
          <div key={key}>
            {categories.map((category) => (
              <CategoryProductSection
                key={category.id}
                category={{ ...category, products: [] }}
                productsPerCategory={config?.products_per_category || 4}
                showSeeAll={config?.show_see_all_button !== false}
                showRating={config?.show_product_rating !== false}
                showDiscount={config?.show_product_discount !== false}
                lazyLoad={true}
              />
            ))}
          </div>
        );

      case 'newsletter':
        return (
          <section key={key} className="py-6 sm:py-8 md:py-16 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 px-2">
                {section.title || 'Subscribe to Our Newsletter'}
              </h2>
              {!isMobile && section.subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 md:mb-8">
                  {section.subtitle}
                </p>
              )}
              <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSubscribingNewsletter}
                  className="flex-1 px-3 sm:px-3.5 md:px-4 py-2.5 sm:py-2.5 md:py-3 text-sm sm:text-sm md:text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-target"
                />
                <Button
                  type="submit"
                  disabled={isSubscribingNewsletter}
                  className="flex items-center justify-center min-w-[100px] sm:min-w-[110px] md:min-w-[120px] min-h-[44px] px-4 sm:px-5 md:px-6 touch-target"
                  size={isMobile ? "default" : "default"}
                >
                  {isSubscribingNewsletter ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-sm sm:text-base">Subscribe</span>
                  )}
                </Button>
              </form>
            </div>
          </section>
        );

      case 'cta-banner':
      case 'cta':
        return (
          <section key={key} className="py-8 sm:py-10 md:py-16 bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">
                {section.title || 'Ready to Start Reading?'}
              </h2>
              {!isMobile && section.subtitle && (
                <p className="text-sm sm:text-base text-primary-foreground/80 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto px-4">
                  {section.subtitle}
                </p>
              )}
              <Button
                variant="secondary"
                size={isMobile ? "default" : "lg"}
                className="min-w-[140px] sm:min-w-[160px] min-h-[44px] sm:min-h-[48px] px-6 sm:px-8 touch-target"
                asChild
              >
                <Link href="/products" className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">Shop Now</span>
                  <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Sort sections by order and filter enabled ones
  const enabledSections = homepageSections
    .filter(section => section.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen">
      {enabledSections.length > 0 ? (
        // Render sections dynamically based on database order
        enabledSections.map(section => renderSection(section))
      ) : (
        // Fallback to default layout if no sections configured
        <>
          <HeroSection
            config={{
              ...defaultHeroConfig,
              ...heroConfig,
              featuredProducts: featuredBooks
            }}
          />
          <PromotionalBannersSection />
          {/* ... other default sections ... */}
        </>
      )}
    </div>
  );
}

