'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import {
  BookOpen,
  Settings,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface ProductDetailsTabsProps {
  product: Product;
  className?: string;
}

export function ProductDetailsTabs({ product, className = '' }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('description');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    specifications: false,
    reviews: false,
  });

  const tabs = [
    { id: 'description', label: 'Description', icon: BookOpen },
    { id: 'specifications', label: 'Specifications', icon: Settings },
    { id: 'reviews', label: 'Reviews', icon: Star, count: product.total_reviews || 0 },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderDescriptionTab = () => (
    <div className="space-y-4">
      <div className="prose max-w-none">
        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {product.description || product.short_description || 'No description available for this product.'}
        </div>
      </div>

      {/* Additional Product Information */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-3">Key Highlights</h4>
          <ul className="space-y-2">
            {product.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags/Keywords */}
      {product.tags && product.tags.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-muted/80 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSpecificationsTab = () => {
    const specs = [
      ['SKU', product.sku || 'N/A'],
      ['Author/Brand', product.brand || product.author || 'N/A'],
      ['Category', product.category?.name || 'N/A'],
      ['ISBN', product.isbn || 'N/A'],
      ['Language', product.language || 'English'],
      ['Pages', product.pages ? `${product.pages} pages` : 'N/A'],
      ['Publisher', product.publisher || 'N/A'],
      ['Publication Year', product.publication_year || 'N/A'],
      ['Weight', product.weight ? `${product.weight}g` : 'N/A'],
      ['Dimensions', product.dimensions || 'N/A'],
      ['Stock', product.manage_stock ? `${product.stock_quantity || 0} units` : 'Available'],
      ['Manage Stock', product.manage_stock ? 'Yes' : 'No'],
      ['Backorders Allowed', product.backorders_allowed ? 'Yes' : 'No'],
    ];

    return (
      <div className="space-y-3">
        {specs.map(([label, value]) => (
          <div key={label} className="flex justify-between py-3 border-b last:border-0 hover:bg-muted/30 px-3 -mx-3 rounded transition-colors">
            <span className="text-muted-foreground font-medium">{label}</span>
            <span className="font-medium text-right">{value}</span>
          </div>
        ))}

        {/* Additional Information */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">Additional Information</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• This product is sold by {product.brand || product.author || 'the seller'}.</p>
            <p>• All books are checked for quality before shipping.</p>
            <p>• Digital products may have different return policies.</p>
            <p>• Contact customer support for any specific requirements.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewsTab = () => {
    const reviews = product.reviews || [];
    const averageRating = product.rating || 4.5;
    const totalReviews = product.total_reviews || 0;

    if (reviews.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-6">Be the first to review this product</p>
          <Button>Write a Review</Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <div className="text-4xl font-bold text-foreground mb-2">
              {averageRating}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {totalReviews} reviews
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${Math.random() * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {Math.floor(Math.random() * 50)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            <Button variant="outline">Write a Review</Button>
          </div>

          {reviews.slice(0, 5).map((review, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {review.customer_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{review.customer_name || 'Anonymous'}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < (review.rating || 5)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {review.comment || review.review_text || 'Great product!'}
                  </div>
                  {review.helpful_count && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{review.helpful_count} people found this helpful</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {reviews.length > 5 && (
            <div className="text-center pt-4">
              <Button variant="outline">
                View All {totalReviews} Reviews
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <Card>
        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <CardContent className="p-0">
          <div className="p-6">
            {activeTab === 'description' && renderDescriptionTab()}
            {activeTab === 'specifications' && renderSpecificationsTab()}
            {activeTab === 'reviews' && renderReviewsTab()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


