'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart';
import { Product } from '@/types';
import { useConfig } from '@/contexts/ConfigContext';
import { 
  BookOpen, 
  Star, 
  Heart,
  Share2,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Award,
  Loader2
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const { siteConfig } = useConfig();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Load product data from API
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productId = params.id as string;
        const response = await productApi.getProduct(productId);
        
        if (response.success) {
          setProduct(response.data.product);
          setRelatedProducts(response.data.related_products || []);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= (product.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-200 rounded-lg aspect-[3/4]"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{error || 'Product not found'}</h3>
          <p className="text-muted-foreground mb-4">The product you're looking for might have been removed or doesn't exist.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-primary">Products</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <Link href={`/categories/${product.category?.slug || product.category?.id}`} className="hover:text-primary">
          {product.category?.name || 'Books'}
        </Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <span>{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg aspect-[3/4] flex items-center justify-center relative overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <BookOpen className="h-24 w-24 text-gray-400" />
            )}
            {product.is_new && (
              <Badge className="absolute top-4 left-4 bg-success text-success-foreground">
                New
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-2">{product.category?.name || 'Book'}</Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground">by {product.brand || 'Unknown Author'}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="font-medium">{product.rating || 'N/A'}</span>
            </div>
            <span className="text-muted-foreground">(reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-foreground">{currencySymbol}{product.price}</span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-xl text-muted-foreground line-through">{currencySymbol}{product.compare_price}</span>
                <Badge variant="secondary">
                  {Math.round((1 - product.price / product.compare_price) * 100)}% off
                </Badge>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {product.in_stock ? (
              <div className="flex items-center space-x-2 text-success">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>In Stock {product.stock_quantity ? `(${product.stock_quantity} available)` : ''}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full"></div>
                <span>Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= (product.stock_quantity || 0)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.in_stock || addingToCart}
              className="flex-1"
            >
              {addingToCart ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button variant="outline" size="lg" className="flex-1">
              Buy Now
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={isWishlisted ? 'text-red-500 border-red-500' : ''}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Free delivery on orders above ₹499</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Authentic books</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">SKU:</span>
                <span>{product.sku || 'N/A'}</span>
                <span className="text-muted-foreground">Brand:</span>
                <span>{product.brand || 'N/A'}</span>
                <span className="text-muted-foreground">Weight:</span>
                <span>{product.weight ? `${product.weight}g` : 'N/A'}</span>
                <span className="text-muted-foreground">Stock:</span>
                <span>{product.manage_stock ? `${product.stock_quantity || 0} units` : 'Not tracked'}</span>
                <span className="text-muted-foreground">Status:</span>
                <span>{product.status}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-16">
        <div className="border-b border-border">
          <div className="flex space-x-8">
            {['description', 'specifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                  selectedTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {selectedTab === 'description' && (
            <div className="space-y-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || product.short_description || 'No description available.'}
                </p>
              </div>
            </div>
          )}

          {selectedTab === 'specifications' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <div className="space-y-3">
                  {[
                    ['SKU', product.sku],
                    ['Brand', product.brand],
                    ['Weight', product.weight ? `${product.weight}g` : null],
                    ['Stock', product.manage_stock ? `${product.stock_quantity || 0} units` : 'Not tracked'],
                    ['Status', product.status],
                    ['Category', product.category?.name]
                  ].filter(([_, value]) => value).map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-8">Related Products</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <Image
                        src={relatedProduct.images[0].url}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    )}
                    
                    {/* Out of Stock Overlay */}
                    {!relatedProduct.in_stock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <Badge variant="secondary" className="text-xs font-medium">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Link href={`/products/${relatedProduct.slug || relatedProduct.id}`}>
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">by {relatedProduct.brand || 'Unknown Author'}</p>
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(relatedProduct.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({relatedProduct.rating || 'N/A'})</span>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex items-center space-x-1">
                      {relatedProduct.in_stock ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">In Stock</span>
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
                        <span className="text-lg font-bold text-foreground">{currencySymbol}{relatedProduct.price}</span>
                        {relatedProduct.compare_price && relatedProduct.compare_price > relatedProduct.price && (
                          <span className="text-sm text-muted-foreground line-through">{currencySymbol}{relatedProduct.compare_price}</span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => addToCart(relatedProduct, 1)}
                        disabled={!relatedProduct.in_stock}
                        variant={!relatedProduct.in_stock ? "secondary" : "default"}
                      >
                        {!relatedProduct.in_stock ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}