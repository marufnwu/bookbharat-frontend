'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product, Review } from '@/types';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface ProductReviewsProps {
  product: Product;
  className?: string;
  showAllInitially?: boolean;
}

export function ProductReviews({
  product,
  className = '',
  showAllInitially = false
}: ProductReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(showAllInitially);
  const [loadingMore, setLoadingMore] = useState(false);

  const reviews = product.reviews || [];
  const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const loadMoreReviews = async () => {
    setLoadingMore(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowAllReviews(true);
    setLoadingMore(false);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to review this product!
            </p>
            <Button variant="outline">
              Write a Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Customer Reviews
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(product.rating || 0))}
                <span className="font-medium">{product.rating?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-muted-foreground">
                ({product.total_reviews || reviews.length} reviews)
              </span>
            </div>
          </div>

          {reviews.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="flex items-center gap-2"
            >
              {showAllReviews ? (
                <>
                  Show Less
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show All ({reviews.length})
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {displayReviews.map((review) => (
            <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {review.user?.name || 'Anonymous Customer'}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {renderStars(review.rating)}
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                </div>

                {review.helpful_count !== undefined && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpful_count}</span>
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="ml-13">
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}
                <p className="text-gray-700 leading-relaxed">
                  {review.comment || review.review}
                </p>

                {/* Verified Purchase Badge */}
                {review.verified_purchase && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      Verified Purchase
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {reviews.length > 3 && !showAllReviews && (
          <div className="mt-6 text-center">
            <Button
              onClick={loadMoreReviews}
              disabled={loadingMore}
              className="min-w-32"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More Reviews ({reviews.length - 3} remaining)
                </>
              )}
            </Button>
          </div>
        )}

        {/* Write Review Button */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found this review helpful?
            </p>
            <Button variant="outline" size="sm">
              Write a Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}