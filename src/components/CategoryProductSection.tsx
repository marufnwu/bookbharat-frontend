'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart';
import { Category, Product } from '@/types';
import { useConfig } from '@/contexts/ConfigContext';
import { 
  BookOpen, 
  Star, 
  ShoppingCart, 
  ChevronRight, 
  Loader2,
  ArrowRight 
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface CategoryProductSectionProps {
  category: Category;
  productsPerCategory: number;
  showSeeAll: boolean;
  showRating: boolean;
  showDiscount: boolean;
  lazyLoad: boolean;
}

export default function CategoryProductSection({
  category,
  productsPerCategory,
  showSeeAll,
  showRating,
  showDiscount,
  lazyLoad
}: CategoryProductSectionProps) {
  const [products, setProducts] = useState<Product[]>(category.products || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { siteConfig } = useConfig();
  const { addToCart: addToCartStore } = useCartStore();
  
  // Intersection Observer for lazy loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    skip: !lazyLoad || products.length > 0
  });

  useEffect(() => {
    if (lazyLoad && inView && products.length === 0) {
      loadCategoryProducts();
    }
  }, [inView, lazyLoad]);

  useEffect(() => {
    if (!lazyLoad && products.length === 0) {
      loadCategoryProducts();
    }
  }, []);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productApi.getProductsByCategory(category.id, {
        per_page: productsPerCategory,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (response.success) {
        setProducts(response.data.products.data || []);
      } else {
        setError('Failed to load products');
      }
    } catch (err: any) {
      console.error('Failed to load category products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);
      await addToCartStore(product, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';

  if (lazyLoad && !inView) {
    return <div ref={ref} className="h-96" />; // Placeholder for lazy loading
  }

  if (loading) {
    return (
      <section ref={ref} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Loading {category.name} products...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section ref={ref} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadCategoryProducts}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{category.name}</h2>
            {category.description && (
              <p className="text-muted-foreground mt-2">{category.description}</p>
            )}
          </div>
          {showSeeAll && (
            <Button variant="outline" asChild>
              <Link href={`/categories/${category.slug || category.id}`}>
                View All <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {showDiscount && product.compare_price && product.compare_price > product.price && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="text-xs">
                        {Math.round((1 - product.price / product.compare_price) * 100)}% OFF
                      </Badge>
                    </div>
                  )}
                  
                  {/* Out of Stock Overlay */}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <Badge variant="secondary" className="text-xs font-medium">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-primary font-medium">{product.category?.name || category.name}</p>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/products/${product.slug || product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">by {product.brand || 'Unknown Author'}</p>
                  
                  {/* Rating */}
                  {showRating && (
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">(4.5)</span>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center space-x-1">
                    {product.in_stock ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 font-medium">
                          {product.manage_stock && product.stock_quantity ? 
                            `${product.stock_quantity} in stock` : 
                            'In Stock'
                          }
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-x-2">
                      <span className="text-lg font-bold text-foreground">
                        {currencySymbol}{product.price}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {currencySymbol}{product.compare_price}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => addToCart(product)}
                      disabled={addingToCart === product.id || !product.in_stock}
                      variant={!product.in_stock ? "secondary" : "default"}
                    >
                      {addingToCart === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : !product.in_stock ? (
                        "Out of Stock"
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

        {/* View All Button for mobile */}
        {showSeeAll && (
          <div className="text-center mt-8 md:hidden">
            <Button asChild>
              <Link href={`/categories/${category.slug || category.id}`}>
                View All {category.name} Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}