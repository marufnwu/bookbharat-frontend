'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { ProductCard } from '@/components/ui/product-card';
import FrequentlyBoughtTogether from '@/components/product/FrequentlyBoughtTogether';
import RelatedProducts from '@/components/product/RelatedProducts';
import { productApi } from '@/lib/api';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { Product } from '@/types';
import { useConfig } from '@/contexts/ConfigContext';
import { toast } from 'sonner';
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
  Loader2,
  ArrowLeft,
  Zap,
  Info
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { siteConfig } = useConfig();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      setBuyingNow(true);
      await addToCart(product, quantity);
      router.push('/checkout');
    } catch (error) {
      console.error('Failed to buy now:', error);
      toast.error('Failed to proceed to checkout. Please try again.');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out this book: ${product?.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= (product.stock_quantity || 99)) {
      setQuantity(newQuantity);
    }
  };

  const getDiscountPercentage = () => {
    if (!product?.compare_price || product.compare_price <= product.price) return 0;
    return Math.round((1 - product.price / product.compare_price) * 100);
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
    <div className="mobile-optimized">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">Product Details</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleWishlistToggle}
                className="p-2"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="p-2"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Desktop Breadcrumb */}
        {!isMobile && (
          <nav className="text-sm text-muted-foreground mb-6 px-4 sm:px-6 lg:px-8 pt-8">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="inline h-4 w-4 mx-2" />
            <Link href="/products" className="hover:text-primary">Products</Link>
            <ChevronRight className="inline h-4 w-4 mx-2" />
            <Link href={`/categories/${product.category?.slug || product.category?.id}`} className="hover:text-primary">
              {product.category?.name || 'Books'}
            </Link>
            <ChevronRight className="inline h-4 w-4 mx-2" />
            <span className="truncate">{product.name}</span>
          </nav>
        )}

        {/* Mobile-Optimized Product Layout */}
        <div className={`${isMobile ? 'pb-24' : 'pb-8'}`}>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 px-3 sm:px-4 lg:px-8">
            {/* Product Images - Enhanced */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 rounded-xl lg:rounded-2xl aspect-[3/4] flex items-center justify-center relative overflow-hidden group">
                {product.images && product.images.length > 0 ? (
                  <OptimizedImage
                    src={product.images[selectedImageIndex]?.url || product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={true}
                  />
                ) : (
                  <BookOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400" />
                )}
                
                {/* Badges */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2">
                  {product.is_new && (
                    <Badge className="bg-success text-success-foreground text-xs">
                      New
                    </Badge>
                  )}
                  {product.is_featured && (
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      Featured
                    </Badge>
                  )}
                  {getDiscountPercentage() > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      -{getDiscountPercentage()}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Image Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 bg-gray-50 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <OptimizedImage
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Mobile Optimized */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <Badge variant="outline" className="mb-2 text-xs">{product.category?.name || 'Book'}</Badge>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">{product.name}</h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">by {product.brand || 'Unknown Author'}</p>
              </div>

              {/* Rating - Compact on mobile */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base font-medium">{product.rating || '4.5'}</span>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">(150+ reviews)</span>
              </div>

              {/* Price - Mobile optimized */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2 sm:space-x-4">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">{currencySymbol}{product.price}</span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">{currencySymbol}{product.compare_price}</span>
                  )}
                </div>
                {getDiscountPercentage() > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {getDiscountPercentage()}% off
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      You save {currencySymbol}{(product.compare_price || 0) - product.price}
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {product.in_stock ? (
                  <div className="flex items-center space-x-2 text-success">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm">{isMobile ? 'In Stock' : `In Stock ${product.stock_quantity ? `(${product.stock_quantity} available)` : ''}`}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-destructive">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span className="text-sm">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Desktop Quantity and Actions */}
              {!isMobile && (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= (product.stock_quantity || 99)}
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleAddToCart}
                      disabled={!product.in_stock || addingToCart}
                      className="flex-1"
                    >
                      {addingToCart ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                      )}
                      <span className="hidden min-[360px]:inline">{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                      <span className="min-[360px]:hidden">{addingToCart ? '...' : 'Cart'}</span>
                    </Button>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={handleBuyNow}
                      disabled={!product.in_stock || buyingNow}
                    >
                      {buyingNow ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-1.5" />
                      )}
                      <span className="hidden min-[360px]:inline">{buyingNow ? 'Processing...' : 'Buy Now'}</span>
                      <span className="min-[360px]:hidden">{buyingNow ? '...' : 'Buy'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWishlistToggle}
                      className={`${isWishlisted ? 'text-red-500 border-red-500 bg-red-50' : ''}`}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}

              {/* Features */}
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span>Free delivery on orders above ₹499</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span>30-day return policy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span>100% secure payment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span>Authentic books guaranteed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Quick Info */}
              {isMobile && (
                <Card>
                  <CardContent className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span>{product.sku || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author:</span>
                      <span>{product.brand || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{product.category?.name || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

      {/* Frequently Bought Together Section */}
      <div className="px-3 sm:px-4 lg:px-8">
        <FrequentlyBoughtTogether productId={params.id as string} mainProduct={product} />
      </div>

      {/* Tabs Section */}
      <div className="mb-16 px-3 sm:px-4 lg:px-8">
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

      {/* Related Products Section using the new component */}
      <div className="px-3 sm:px-4 lg:px-8">
        <RelatedProducts productId={params.id as string} categoryId={product.category?.id} />
      </div>

      {/* Old Related Products - Remove this section as it's replaced by the new component */}
      {false && relatedProducts.length > 0 && (
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

        {/* Mobile Optimized Related Products */}
        {relatedProducts.length > 0 && (
          <div className="px-3 sm:px-4 lg:px-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.slice(0, isMobile ? 4 : 5).map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  variant={isMobile ? "minimal" : "compact"}
                  showCategory={false}
                  showAuthor={!isMobile}
                  showRating={!isMobile}
                  showWishlist={!isMobile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Sticky Bottom Bar - Fully Responsive */}
        <div className="block md:hidden">
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border mobile-bottom-bar">
            <div className="container max-w-md mx-auto px-3 py-3">
              {/* Price Display Row */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/30">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground">{currencySymbol}{product.price}</span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">{currencySymbol}{product.compare_price}</span>
                  )}
                </div>
                {getDiscountPercentage() > 0 && (
                  <Badge variant="destructive" className="text-xs font-medium">
                    Save {getDiscountPercentage()}%
                  </Badge>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2">
                {/* Compact Quantity Selector */}
                <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-10 w-9 p-0 hover:bg-muted/50 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center h-10 px-3 text-sm font-semibold min-w-[2.5rem] bg-muted/30 border-x border-border">
                    {quantity}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock_quantity || 99)}
                    className="h-10 w-9 p-0 hover:bg-muted/50 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || addingToCart}
                  size="xs"
                  className="flex-1 text-xs font-medium shadow-sm"
                  variant="outline"
                >
                  {addingToCart ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 hidden min-[400px]:inline">Adding...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="ml-2 hidden min-[400px]:inline">Add to Cart</span>
                      <span className="ml-2 min-[400px]:hidden">Cart</span>
                    </div>
                  )}
                </Button>

                {/* Buy Now Button */}
                <Button
                  onClick={handleBuyNow}
                  disabled={!product.in_stock || buyingNow}
                  size="xs"
                  className="flex-1 text-xs font-medium bg-primary hover:bg-primary/90 shadow-sm"
                >
                  {buyingNow ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 hidden min-[400px]:inline">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Zap className="h-4 w-4" />
                      <span className="ml-2 hidden min-[400px]:inline">Buy Now</span>
                      <span className="ml-2 min-[400px]:hidden">Buy</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}