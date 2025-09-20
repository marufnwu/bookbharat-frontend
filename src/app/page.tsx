'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfig } from '@/contexts/ConfigContext';
import { productApi, categoryApi, newsletterApi, heroApi } from '@/lib/api';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart';
import { Product, Category } from '@/types';
import CategoryProductSection from '@/components/CategoryProductSection';
import HeroSection from '@/components/hero/HeroSection';
import ProductCard from '@/components/ui/product-card';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { 
  BookOpen, 
  TrendingUp, 
  Star, 
  Users,
  Award,
  Truck,
  Shield,
  RotateCcw,
  ArrowRight,
  Quote,
  ChevronRight,
  User,
  Loader2,
  ShoppingCart,
  Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { siteConfig, homepageConfig, loading: configLoading } = useConfig();
  const { addToCart: addToCartStore } = useCartStore();
  const [featuredBooks, setFeaturedBooks] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredBooksLoading, setFeaturedBooksLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribingNewsletter, setIsSubscribingNewsletter] = useState(false);
  const [heroConfig, setHeroConfig] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load essential content first (hero, categories)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load hero config and categories in parallel
        const [heroResponse, categoriesResponse] = await Promise.all([
          heroApi.getActiveHeroConfig(),
          categoryApi.getCategories()
        ]);

        if (heroResponse.success) {
          setHeroConfig(heroResponse.data);
        }

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load featured books separately when component mounts
  useEffect(() => {
    const loadFeaturedBooks = async () => {
      try {
        setFeaturedBooksLoading(true);
        const featuredResponse = await productApi.getFeaturedProducts();

        if (featuredResponse.success) {
          setFeaturedBooks(featuredResponse.data.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load featured books:', err);
      } finally {
        setFeaturedBooksLoading(false);
      }
    };

    // Delay loading featured books slightly to prioritize above-the-fold content
    const timer = setTimeout(loadFeaturedBooks, 500);
    return () => clearTimeout(timer);
  }, []);


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

  if (configLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-base md:text-lg text-center">Loading your bookstore...</span>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const heroData = homepageConfig?.hero_section || {
    title: siteConfig?.site.name || 'BookBharat',
    subtitle: siteConfig?.site.description || 'Your Knowledge Partner for Life',
    stats: [
      { label: 'Books', value: '500K+' },
      { label: 'Customers', value: '100K+' },
      { label: 'Rating', value: '4.8★' }
    ]
  };

  const features = homepageConfig?.promotional_banners?.filter(banner => banner.enabled) || [
    {
      title: 'Free Shipping',
      description: `On orders above ${siteConfig?.payment?.currency_symbol || '₹'}${siteConfig?.payment?.free_shipping_threshold || 499}`,
      icon: 'truck'
    },
    {
      title: 'Easy Returns',
      description: '30-day return policy',
      icon: 'refresh'
    },
    {
      title: 'Secure Payment',
      description: '100% secure transactions',
      icon: 'shield'
    }
  ];

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'truck': return Truck;
      case 'refresh': return RotateCcw;
      case 'shield': return Shield;
      default: return Star;
    }
  };

  const getCategoryIcon = (index: number) => {
    const icons = [BookOpen, TrendingUp, Award, Star];
    return icons[index % icons.length];
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600", 
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600"
    ];
    return colors[index % colors.length];
  };

  // Default hero config fallback
  const defaultHeroConfig = {
    variant: 'classic' as const,
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection 
        config={{
          ...defaultHeroConfig,
          ...heroConfig,
          featuredProducts: featuredBooks
        }} 
      />

      {/* Compact Features Section - Mobile Optimized */}
      <section className="py-6 md:py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <div key={index} className="flex items-center space-x-3 p-3 md:p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-colors duration-200">
                  <div className="bg-primary/10 text-primary rounded-full p-2 md:p-3 flex-shrink-0">
                    <IconComponent className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm md:text-base truncate">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile-Optimized Featured Books Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-start justify-between mb-6 md:mb-12">
            <div className="flex-1">
              <h2 className="text-xl md:text-3xl font-bold text-foreground">Featured Books</h2>
              {!isMobile && (
                <p className="text-muted-foreground mt-2">Discover our handpicked selection of must-read books</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="ml-4 flex-shrink-0" asChild>
              <Link href="/products?featured=true">
                {isMobile ? 'View All' : 'View All'} <ChevronRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </Button>
          </div>

          {featuredBooksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading featured books...</span>
              </div>
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {featuredBooks.slice(0, isMobile ? 6 : 8).map((book) => (
                <ProductCard 
                  key={book.id}
                  product={book}
                  variant={isMobile ? "minimal" : "compact"}
                  showCategory={false}
                  showAuthor={!isMobile}
                  showRating={!isMobile}
                  showDiscount={true}
                  showWishlist={!isMobile}
                  showAddToCart={true}
                  showBuyNow={true}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Categories Section - Improved Design */}
      {categories.length > 0 && (
        <CategoriesSection categories={categories} className="bg-muted/20" />
      )}


      {/* Category Product Sections - Now with proper lazy loading */}
      {categories.length > 0 && homepageConfig?.featured_sections?.find(
        section => section.id === 'category_products' && section.enabled
      ) && (() => {
        const config = homepageConfig.featured_sections.find(
          section => section.id === 'category_products'
        )?.settings;
        
        // Use categories from initial load, each will lazy load its products
        return categories.map((category, index) => (
          <CategoryProductSection
            key={category.id}
            category={{ ...category, products: [] }} // Empty products array to force lazy loading
            productsPerCategory={config?.products_per_category || 4}
            showSeeAll={config?.show_see_all_button !== false}
            showRating={config?.show_product_rating !== false}
            showDiscount={config?.show_product_discount !== false}
            lazyLoad={true} // Enable lazy loading for all category sections
          />
        ));
      })()}

      {/* Compact Newsletter Section - Mobile Optimized */}
      {homepageConfig?.newsletter?.enabled && (
        <section className="py-8 md:py-16 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
              {homepageConfig.newsletter.title}
            </h2>
            {!isMobile && (
              <p className="text-muted-foreground mb-6 md:mb-8">
                {homepageConfig.newsletter.subtitle}
              </p>
            )}
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={homepageConfig.newsletter.placeholder}
                disabled={isSubscribingNewsletter}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button 
                type="submit" 
                disabled={isSubscribingNewsletter} 
                className="flex items-center justify-center min-w-[100px] md:min-w-[120px] py-2 md:py-3"
                size={isMobile ? "sm" : "default"}
              >
                {isSubscribingNewsletter ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  homepageConfig.newsletter.button_text
                )}
              </Button>
            </form>
            {!isMobile && (
              <p className="text-sm text-muted-foreground mt-4">
                {homepageConfig.newsletter.privacy_text}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Compact CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Start Reading?</h2>
          {!isMobile && (
            <p className="text-primary-foreground/80 mb-6 md:mb-8 max-w-2xl mx-auto">
              Join millions of readers who trust {siteConfig?.site.name || 'BookBharat'} for their reading needs. 
              Discover your next favorite book today!
            </p>
          )}
          <Button 
            variant="secondary" 
            size={isMobile ? "default" : "lg"} 
            className="min-w-[140px]"
            asChild
          >
            <Link href="/products">
              Shop Now <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}