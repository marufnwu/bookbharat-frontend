'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfig } from '@/contexts/ConfigContext';
import { productApi, categoryApi, newsletterApi } from '@/lib/api';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart';
import { Product, Category } from '@/types';
import CategoryProductSection from '@/components/CategoryProductSection';
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
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [featuredBooksLoading, setFeaturedBooksLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribingNewsletter, setIsSubscribingNewsletter] = useState(false);

  // Load essential content first (hero, categories)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load only categories first for faster initial render
        const categoriesResponse = await categoryApi.getCategories();

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.slice(0, 6)); // Show more categories since we're not loading all products
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

  const addToCart = async (productId: number) => {
    try {
      setAddingToCart(productId);
      // Find the product to pass to the store
      const product = featuredBooks.find(p => p.id === productId);
      if (product) {
        await addToCartStore(product, 1);
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error message
    } finally {
      setAddingToCart(null);
    }
  };

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  {heroData.title.split(' ').map((word, index) => (
                    <span key={index}>
                      {index === 1 ? (
                        <span className="text-primary">{word}</span>
                      ) : (
                        word
                      )}
                      {index < heroData.title.split(' ').length - 1 ? ' ' : ''}
                      {index === 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  {heroData.subtitle}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">
                    {homepageConfig?.hero_section?.cta_primary?.text || 'Explore Books'} 
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/categories">
                    {homepageConfig?.hero_section?.cta_secondary?.text || 'Browse Categories'}
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                {(heroData.stats || []).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-2">
                <div className="grid grid-cols-2 gap-4">
                  {featuredBooks.slice(0, 4).map((book, index) => (
                    <div key={book.id} className={`${index % 2 === 0 ? 'mt-4' : '-mt-4'}`}>
                      <div className="bg-gray-200 rounded-lg aspect-[3/4] flex items-center justify-center overflow-hidden">
                        {book.images && book.images.length > 0 ? (
                          <Image
                            src={book.images[0].url}
                            alt={book.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <BookOpen className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                New Arrivals
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                      {book.images && book.images.length > 0 ? (
                        <Image
                          src={book.images[0].url}
                          alt={book.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-primary font-medium">{book.category?.name || 'Book'}</p>
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        <Link href={`/products/${book.slug || book.id}`}>
                          {book.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">by {book.brand || 'Unknown Author'}</p>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">(4.5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-x-2">
                          <span className="text-lg font-bold text-foreground">
                            {siteConfig?.payment?.currency_symbol || '₹'}{book.price}
                          </span>
                          {book.compare_price && book.compare_price > book.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {siteConfig?.payment?.currency_symbol || '₹'}{book.compare_price}
                            </span>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(book.id)}
                          disabled={addingToCart === book.id}
                        >
                          {addingToCart === book.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
              <p className="text-muted-foreground mt-2">Find books in your favorite genres</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const IconComponent = getCategoryIcon(index);
                return (
                  <Link key={category.id} href={`/categories/${category.slug || category.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <CardContent className="p-6 text-center">
                        <div className={`inline-flex rounded-full p-4 ${getCategoryColor(index)} mb-4`}>
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                        <p className="text-muted-foreground text-sm">
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