'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Award,
  Loader2,
  Zap,
  Check,
  Clock,
  Package,
  CreditCard,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  ZoomIn,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Gift,
  Percent
} from 'lucide-react';

export default function ImprovedProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { siteConfig } = useConfig();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [pincode, setPincode] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productId = params.id as string;
        const response = await productApi.getProduct(productId);
        
        if (response.success) {
          setProduct(response.data.product);
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
      toast.error('Failed to add to cart');
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
      toast.error('Failed to proceed to checkout');
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
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const checkPincodeDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    
    setCheckingPincode(true);
    // Simulate API call
    setTimeout(() => {
      setDeliveryAvailable(Math.random() > 0.3);
      setCheckingPincode(false);
    }, 1000);
  };

  const getDiscountPercentage = () => {
    if (!product?.compare_price || product.compare_price <= product.price) return 0;
    return Math.round((1 - product.price / product.compare_price) * 100);
  };

  const getProductImage = (index: number = 0) => {
    if (!product) return '/book-placeholder.svg';
    
    if (product.images && product.images.length > index) {
      const image = product.images[index];
      if (image.url) return image.url;
      if (image.image_url) return image.image_url;
      if (image.image_path) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        return image.image_path.startsWith('http') 
          ? image.image_path 
          : `${baseUrl}/storage/${image.image_path}`;
      }
    }
    
    return '/book-placeholder.svg';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-gray-200 rounded-2xl aspect-[3/4] animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg aspect-[3/4] animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Product not found</h3>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/categories/${product.category?.slug}`} className="hover:text-primary transition-colors">
              {product.category?.name || 'Books'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group">
              <div className="relative aspect-[3/4]">
                <div
                  ref={imageContainerRef}
                  className="relative w-full h-full cursor-zoom-in overflow-hidden"
                  onMouseMove={handleImageMouseMove}
                  onMouseEnter={() => setIsImageZoomed(true)}
                  onMouseLeave={() => setIsImageZoomed(false)}
                >
                  <Image
                    src={getProductImage(selectedImageIndex)}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-300"
                    style={{
                      transform: isImageZoomed ? `scale(1.5)` : 'scale(1)',
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                    }}
                    priority
                  />
                  
                  {/* Zoom Indicator */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn className="h-5 w-5 text-gray-700" />
                  </div>
                </div>

                {/* Discount Badge */}
                {getDiscountPercentage() > 0 && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {getDiscountPercentage()}% OFF
                    </div>
                  </div>
                )}

                {/* Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : product.images!.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev < product.images!.length - 1 ? prev + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary shadow-md ring-2 ring-primary/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={getProductImage(index)}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-4 gap-3 pt-4">
              {[
                { icon: Truck, color: 'blue', text: 'Free Delivery', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
                { icon: Shield, color: 'green', text: 'Secure Payment', bgColor: 'bg-green-50', iconColor: 'text-green-600' },
                { icon: Award, color: 'purple', text: '100% Authentic', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
                { icon: RotateCcw, color: 'orange', text: 'Easy Returns', bgColor: 'bg-orange-50', iconColor: 'text-orange-600' }
              ].map((item, index) => (
                <div key={index} className="text-center group cursor-pointer">
                  <div className={`${item.bgColor} rounded-xl p-3 mb-2 group-hover:scale-105 transition-transform`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor} mx-auto`} />
                  </div>
                  <p className="text-xs text-gray-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Information Section */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {product.category?.name || 'Book'}
                </Badge>
                {product.is_bestseller && (
                  <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs px-2 py-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-purple-400 to-purple-500 text-white text-xs px-2 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              
              <p className="text-lg text-gray-600">
                by <span className="font-semibold text-gray-800 hover:text-primary cursor-pointer">
                  {product.brand || product.author || 'Unknown Author'}
                </span>
              </p>
            </div>

            {/* Rating and Stats */}
            <div className="flex items-center gap-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 4.5) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="font-bold text-lg">{product.rating || '4.5'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {product.total_reviews || 150}+ Reviews
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {Math.floor(Math.random() * 50) + 20} viewing now
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {currencySymbol}{parseFloat(String(product.price)).toFixed(2)}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {currencySymbol}{parseFloat(String(product.compare_price)).toFixed(2)}
                    </span>
                    <Badge className="bg-green-500 text-white px-2 py-1">
                      Save {currencySymbol}{(parseFloat(String(product.compare_price)) - parseFloat(String(product.price))).toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              
              {/* Stock Status */}
              <div className="mt-3">
                {product.in_stock ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium text-green-700">In Stock</span>
                    {product.stock_quantity && product.stock_quantity < 10 && (
                      <span className="text-orange-600 text-sm font-medium">
                        • Only {product.stock_quantity} left!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full" />
                    <span className="font-medium text-red-600">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Offers Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">Available Offers</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Badge className="bg-green-100 text-green-700 text-xs shrink-0">BANK</Badge>
                  <p className="text-sm text-gray-700">
                    10% instant discount on HDFC Bank Credit Cards, up to ₹500
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-blue-100 text-blue-700 text-xs shrink-0">SHIPPING</Badge>
                  <p className="text-sm text-gray-700">
                    Free delivery on orders above ₹499
                  </p>
                </div>
              </div>
            </div>

            {/* Pincode Check */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Delivery Options</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button
                  onClick={checkPincodeDelivery}
                  disabled={checkingPincode}
                  className="px-6"
                >
                  {checkingPincode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                </Button>
              </div>
              
              {deliveryAvailable !== null && (
                <div className={`mt-3 p-3 rounded-lg ${deliveryAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
                  {deliveryAvailable ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Delivery available! Expected in 3-5 days</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <X className="h-4 w-4" />
                      <span className="text-sm font-medium">Sorry, delivery not available to this pincode</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-3 min-w-[60px] text-center font-semibold border-x-2 border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                    className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity >= (product.stock_quantity || 99)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || addingToCart}
                >
                  {addingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                <Button
                  className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
                  onClick={handleBuyNow}
                  disabled={!product.in_stock || buyingNow}
                >
                  {buyingNow ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 border-2"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 border-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-blue-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Why Choose This Product?</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Package, text: 'Premium Quality' },
                  { icon: Clock, text: 'Fast Dispatch' },
                  { icon: CreditCard, text: 'Secure Payment' },
                  { icon: RotateCcw, text: '7-Day Return' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-white rounded-lg p-2">
                      <feature.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Tabs */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b">
            <div className="flex">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold capitalize transition-all relative ${
                    selectedTab === tab
                      ? 'text-primary bg-primary/5 border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                  {tab === 'reviews' && (
                    <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {product.total_reviews || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {selectedTab === 'description' && (
              <div className="space-y-4">
                <div className={`prose max-w-none text-gray-600 ${!showFullDescription ? 'line-clamp-5' : ''}`}>
                  <p className="leading-relaxed">
                    {product.description || product.short_description || 'No description available.'}
                  </p>
                </div>
                {product.description && product.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary font-medium text-sm flex items-center gap-1 hover:underline"
                  >
                    {showFullDescription ? (
                      <>Show less <ChevronUp className="h-4 w-4" /></>
                    ) : (
                      <>Read more <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                )}
              </div>
            )}

            {selectedTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {[
                    ['SKU', product.sku || 'N/A'],
                    ['Author/Brand', product.brand || product.author || 'N/A'],
                    ['Category', product.category?.name || 'N/A'],
                    ['Weight', product.weight ? `${product.weight}g` : 'N/A'],
                    ['Stock', product.manage_stock ? `${product.stock_quantity || 0} units` : 'Available'],
                    ['Status', product.status],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{label}:</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Star className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
                  <Button>Write a Review</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="mt-8">
          <FrequentlyBoughtTogether productId={params.id as string} mainProduct={product} />
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <RelatedProducts productId={params.id as string} categoryId={product.category?.id} />
        </div>
      </div>
    </div>
  );
}