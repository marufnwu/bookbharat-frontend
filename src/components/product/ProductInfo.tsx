'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useConfig } from '@/contexts/ConfigContext';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { Product } from '@/types';
import { seededRandom } from '@/lib/seeded-random';
import { toast } from 'sonner';
import {
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Loader2,
  MapPin,
  X,
  Award,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';

interface ProductInfoProps {
  product: Product;
  className?: string;
}

export function ProductInfo({ product, className = '' }: ProductInfoProps) {
  const { siteConfig } = useConfig();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';
  const isWishlisted = isInWishlist(product.id);

  const getDiscountPercentage = () => {
    if (!product.compare_price || product.compare_price <= product.price) return 0;
    return Math.round((1 - product.price / product.compare_price) * 100);
  };

  // Free shipping helper functions
  const hasProductFreeShipping = () => {
    return product.free_shipping_enabled && product.free_shipping_type !== 'none';
  };

  const getFreeShippingDescription = () => {
    if (!product.free_shipping_enabled) return '';

    switch (product.free_shipping_type) {
      case 'all_zones':
        return 'Free shipping to all zones (A-E)';
      case 'specific_zones':
        const zones = product.free_shipping_zones || [];
        const zoneList = Array.isArray(zones) ? zones : (typeof zones === 'string' ? JSON.parse(zones || '[]') : []);
        return `Free shipping to zones: ${zoneList.length > 0 ? zoneList.join(', ') : 'All selected zones'}`;
      default:
        return 'Free shipping available';
    }
  };

  const getFreeShippingProgress = () => {
    const freeShippingThreshold = siteConfig?.payment?.free_shipping_threshold || 0;
    const currentTotal = product.price * quantity;
    return Math.min((currentTotal / freeShippingThreshold) * 100, 100);
  };

  const getFreeShippingMessage = () => {
    const freeShippingThreshold = siteConfig?.payment?.free_shipping_threshold || 0;
    const currentTotal = product.price * quantity;
    const remaining = Math.max(freeShippingThreshold - currentTotal, 0);

    if (remaining <= 0) {
      return '🎉 You\'ve unlocked free shipping!';
    } else {
      return `Add ${currencySymbol}${remaining.toFixed(2)} more to get free delivery`;
    }
  };

  const getFeaturesList = () => {
    const features = [];

    // Dynamic free shipping feature
    if (hasProductFreeShipping()) {
      features.push({
        icon: Truck,
        text: 'Product Free Shipping',
        desc: getFreeShippingDescription(),
        highlight: true
      });
    } else if (siteConfig?.payment?.free_shipping_enabled !== false && (siteConfig?.payment?.free_shipping_threshold || 0) > 0) {
      features.push({
        icon: Truck,
        text: 'Free Delivery',
        desc: `On orders above ${currencySymbol}${siteConfig?.payment?.free_shipping_threshold}`,
        highlight: false
      });
    }

    // Other features
    features.push(
      {
        icon: Shield,
        text: 'Secure Payment',
        desc: '100% safe transactions',
        highlight: false
      },
      {
        icon: RotateCcw,
        text: 'Easy Returns',
        desc: '30-day return policy',
        highlight: false
      },
      {
        icon: Award,
        text: '100% Authentic',
        desc: 'Genuine products only',
        highlight: false
      }
    );

    return features;
  };

  const handleAddToCart = async () => {
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
    try {
      setBuyingNow(true);
      await addToCart(product, quantity);
      window.location.href = '/checkout';
    } catch (error) {
      toast.error('Failed to proceed to checkout');
    } finally {
      setBuyingNow(false);
    }
  };

  const handleWishlistToggle = async () => {
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
          title: product.name,
          text: `Check out: ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const checkPincodeDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setCheckingPincode(true);
    // Simulate API call
    setTimeout(() => {
      setDeliveryAvailable(seededRandom() > 0.3);
      setCheckingPincode(false);
    }, 1000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title and Badges */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {product.category?.name && (
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bestseller
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs">
              <Award className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">
          {product.name}
        </h1>

        <p className="text-base text-muted-foreground">
          by <span className="font-medium text-foreground hover:underline cursor-pointer">
            {product.brand || product.author || 'Unknown Author'}
          </span>
        </p>
      </div>

      {/* Enhanced Rating Section */}
      <Card className="border-0 bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating || 4.5)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="font-semibold ml-1">{product.rating || '4.5'}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                ({product.total_reviews || 0} reviews)
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4 mr-1" />
              Write Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Price Section */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl font-bold text-foreground">
            {currencySymbol}{parseFloat(String(product.price)).toFixed(2)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {currencySymbol}{parseFloat(String(product.compare_price)).toFixed(2)}
              </span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                Save {currencySymbol}{(parseFloat(String(product.compare_price)) - parseFloat(String(product.price))).toFixed(2)}
              </Badge>
            </>
          )}
        </div>

        {getDiscountPercentage() > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            {getDiscountPercentage()}% OFF
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Inclusive of all taxes</span>
        </div>
      </div>

      {/* Stock Status with Enhanced UI */}
      <Card className={`border-0 ${product.in_stock ? 'bg-green-50' : 'bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.in_stock ? (
                <>
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-green-800">In Stock</div>
                    {product.stock_quantity && product.stock_quantity < 10 && (
                      <div className="text-sm text-green-600">
                        Only {product.stock_quantity} left
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-red-800">Out of Stock</div>
                    <div className="text-sm text-red-600">
                      Notify me when available
                    </div>
                  </div>
                </>
              )}
            </div>
            {product.estimated_delivery && (
              <div className="text-right">
                <div className="text-sm font-medium">Est. Delivery</div>
                <div className="text-sm text-muted-foreground">
                  {product.estimated_delivery}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Shipping Information */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Product-level Free Shipping Indicator */}
          {hasProductFreeShipping() && siteConfig?.payment?.free_shipping_enabled !== false && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-green-800">Free Shipping Available!</div>
                  <div className="text-sm text-green-600">
                    {getFreeShippingDescription()}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  Free
                </Badge>
              </div>
            </div>
          )}

          {/* Order-level Free Shipping Progress - Only if enabled */}
          {!hasProductFreeShipping() && siteConfig?.payment?.free_shipping_enabled !== false && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <Truck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-800">Free Shipping Progress</div>
                  <div className="text-sm text-blue-600">
                    Add more items to get free delivery
                  </div>
                </div>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getFreeShippingProgress()}%` }}
                />
              </div>
              <div className="text-xs text-blue-600">
                {getFreeShippingMessage()}
              </div>
            </div>
          )}

          {/* Pincode Delivery Check */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Check Delivery</div>
                <div className="text-sm text-muted-foreground">Enter your pincode</div>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={checkPincodeDelivery}
                disabled={checkingPincode || pincode.length !== 6}
                size="default"
              >
                {checkingPincode ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
              </Button>
            </div>

            {deliveryAvailable !== null && (
              <div className={`p-3 rounded-lg text-sm ${deliveryAvailable
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                <div className="flex items-center gap-2">
                  {deliveryAvailable ? (
                    <>
                      <Check className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Delivery Available</div>
                        <div className="text-xs">Expected delivery in 3-5 business days</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Delivery Not Available</div>
                        <div className="text-xs">This pincode is not serviceable</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Quantity:</span>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-6 py-3 min-w-[60px] text-center font-semibold border-x">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
              className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={quantity >= (product.stock_quantity || 99)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              className="h-12"
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
              size="lg"
              variant="default"
              className="h-12 bg-orange-500 hover:bg-orange-600"
              onClick={handleBuyNow}
              disabled={!product.in_stock || buyingNow}
            >
              {buyingNow ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Buy Now'
              )}
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-10"
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              {isWishlisted ? 'Saved' : 'Save'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-10"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Features Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        {getFeaturesList().map((feature, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${feature.highlight ? 'bg-green-100' : 'bg-primary/10'
              }`}>
              <feature.icon className={`h-4 w-4 ${feature.highlight ? 'text-green-600' : 'text-primary'
                }`} />
            </div>
            <div className="min-w-0">
              <div className={`font-medium text-sm ${feature.highlight ? 'text-green-700' : ''
                }`}>{feature.text}</div>
              <div className="text-xs text-muted-foreground">{feature.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Trust Indicators */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>10K+ Happy Customers</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="h-4 w-4" />
          <span>Quality Assured</span>
        </div>
      </div>
    </div>
  );
}


