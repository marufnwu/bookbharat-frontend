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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Loading...</span>
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

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`bg-${index === 0 ? 'primary' : index === 1 ? 'success' : 'accent'}/10 text-${index === 0 ? 'primary' : index === 1 ? 'success' : 'accent'} rounded-full p-3`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Books</h2>
              <p className="text-muted-foreground mt-2">Discover our handpicked selection of must-read books</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products?featured=true">
                View All <ChevronRight className="ml-2 h-4 w-4" />
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
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {featuredBooks.map((book) => (
                <ProductCard 
                  key={book.id}
                  product={book}
                  variant="compact"
                  showCategory={true}
                  showAuthor={true}
                  showRating={true}
                  showDiscount={true}
                  showWishlist={true}
                  showAddToCart={true}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Browse by Category</h2>
              <p className="text-muted-foreground mt-2">Find books in your favorite genres</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => {
                const IconComponent = getCategoryIcon(index);
                return (
                  <Link key={category.id} href={`/categories/${category.slug || category.id}`}>
                    <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-1 h-full">
                      <CardContent className="p-4 text-center h-full flex flex-col justify-between">
                        <div>
                          <div className={`inline-flex rounded-full p-3 ${getCategoryColor(index)} mb-3`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{category.name}</h3>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {category.products_count || 0} books
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
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

      {/* Newsletter Section */}
      {homepageConfig?.newsletter?.enabled && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {homepageConfig.newsletter.title}
            </h2>
            <p className="text-muted-foreground mb-8">
              {homepageConfig.newsletter.subtitle}
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={homepageConfig.newsletter.placeholder}
                disabled={isSubscribingNewsletter}
                className="flex-1 px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button type="submit" disabled={isSubscribingNewsletter} className="flex items-center justify-center min-w-[120px]">
                {isSubscribingNewsletter ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  homepageConfig.newsletter.button_text
                )}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              {homepageConfig.newsletter.privacy_text}
            </p>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Reading?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join millions of readers who trust {siteConfig?.site.name || 'BookBharat'} for their reading needs. 
            Discover your next favorite book today!
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/products">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}