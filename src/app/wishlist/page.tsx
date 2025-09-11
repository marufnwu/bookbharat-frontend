'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Heart,
  Star,
  ShoppingCart,
  X,
  Share2,
  Filter,
  Loader2
} from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlist';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useCartStore } from '@/stores/cart';
import { OptimizedImage } from '@/components/ui/optimized-image';

export default function WishlistPage() {
  const { 
    wishlistItems, 
    isLoading, 
    getWishlist, 
    removeFromWishlist, 
    moveToCart,
    getTotalItems 
  } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  const handleRemoveFromWishlist = (itemId: number) => {
    removeFromWishlist(itemId);
  };

  const handleMoveToCart = async (item: any) => {
    try {
      await addToCart(item.product, 1);
      await removeFromWishlist(item.id);
    } catch (error) {
      console.error('Failed to move to cart:', error);
    }
  };

  const handleMoveAllToCart = async () => {
    const inStockItems = wishlistItems.filter(item => item.product.stock_quantity > 0);
    for (const item of inStockItems) {
      try {
        await addToCart(item.product, 1);
        await removeFromWishlist(item.id);
      } catch (error) {
        console.error('Failed to move item to cart:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">
            Save items you love to your wishlist and never lose track of them.
          </p>
          <Button asChild>
            <Link href="/products">
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span>Wishlist</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-muted-foreground">{getTotalItems()} items saved</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Wishlist
          </Button>
          <Button onClick={handleMoveAllToCart} disabled={!wishlistItems.some(item => item.product.stock_quantity > 0)} className="min-w-[140px]">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add All to Cart
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          All Items
        </Button>
        <Button variant="ghost" size="sm">
          In Stock ({wishlistItems.filter(item => item.product.stock_quantity > 0).length})
        </Button>
        <Button variant="ghost" size="sm">
          On Sale ({wishlistItems.filter(item => item.product.sale_price && item.product.sale_price < item.product.price).length})
        </Button>
      </div>

      {/* Wishlist Items */}
      <div className="space-y-4">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product.image_url ? (
                      <OptimizedImage
                        src={item.product.image_url}
                        alt={item.product.name}
                        width={96}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {item.product.category?.name || 'Uncategorized'}
                      </Badge>
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {item.product.short_description}
                      </p>
                      
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(item.product.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">({item.product.reviews_count || 0})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-foreground">₹{item.product.sale_price || item.product.price}</span>
                        {item.product.sale_price && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">₹{item.product.price}</span>
                            <Badge variant="secondary" size="sm">
                              {Math.round((1 - item.product.sale_price / item.product.price) * 100)}% off
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        {item.product.stock_quantity > 0 ? (
                          <div className="flex items-center space-x-2 text-green-600 text-sm">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span>In Stock ({item.product.stock_quantity})</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-red-600 text-sm">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            <span>Out of Stock</span>
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="text-muted-foreground hover:text-destructive self-end"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-4">
                    {item.product.stock_quantity > 0 ? (
                      <Button onClick={() => handleMoveToCart(item)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Move to Cart
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Out of Stock
                      </Button>
                    )}
                    
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="text-center mt-12">
        <h3 className="text-lg font-semibold mb-4">Looking for more books?</h3>
        <Button variant="outline" asChild>
          <Link href="/products">
            Continue Shopping
          </Link>
        </Button>
      </div>

      {/* Recently Viewed */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-foreground mb-6">You might also like</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 4, title: "Sapiens", author: "Yuval Noah Harari", price: 499, originalPrice: 799 },
            { id: 5, title: "The Silent Patient", author: "Alex Michaelides", price: 379, originalPrice: 550 },
            { id: 6, title: "Where the Crawdads Sing", author: "Delia Owens", price: 425, originalPrice: 650 },
            { id: 7, title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", price: 359, originalPrice: 499 }
          ].map((book) => (
            <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <Link href={`/products/${book.id}`}>
                    <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground">by {book.author}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-x-2">
                      <span className="font-bold text-foreground">₹{book.price}</span>
                      <span className="text-sm text-muted-foreground line-through">₹{book.originalPrice}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}