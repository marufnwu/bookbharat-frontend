'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { BookDetails } from '@/components/product/BookDetails';
import { ProductReviews } from '@/components/product/ProductReviews';
import { seededRandom, seededRandomInt } from '@/lib/seeded-random';
import {
  BookOpen,
  Settings,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Hash,
  Globe,
  FileText,
  Building,
  Calendar,
  User,
  Folder,
  Package,
  Square,
  Tag,
  Package2,
  Clock,
  Shield,
  Check
} from 'lucide-react';

interface ProductDetailsTabsProps {
  product: Product;
  className?: string;
}

export function ProductDetailsTabs({ product, className = '' }: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('description');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    details: false,
    specifications: false,
    reviews: false,
  });

  const tabs = [
    { id: 'description', label: 'Description', icon: BookOpen },
    { id: 'details', label: 'Book Details', icon: Info },
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
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Product Description */}
      <div className="bg-gray-50/30 rounded-xl p-4 sm:p-6 border border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          About This Book
        </h3>
        <div className="prose prose-sm max-w-none md:prose-base lg:prose-lg">
          <div
            className="text-sm sm:text-base text-gray-700 leading-relaxed product-description"
            dangerouslySetInnerHTML={{
              __html: product.description || product.short_description || 'No description available for this product.'
            }}
          />
        </div>
      </div>

      {/* Enhanced Key Highlights */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Key Highlights
          </h4>
          <ul className="grid sm:grid-cols-2 gap-2 sm:gap-3">
            {product.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enhanced Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="hidden bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-purple-100 ">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            Browse Tags
          </h4>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 border border-purple-200 text-purple-700 rounded-full text-sm sm:text-base font-medium hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
    const mainSpecs = [
      ['ISBN', product.isbn || 'N/A', Hash],
      ['Language', product.language || 'English', Globe],
      ['Pages', product.pages ? `${product.pages} pages` : 'N/A', FileText],
      ['Format', product.format || 'Paperback', BookOpen],
      ['Publisher', product.publisher || 'N/A', Building],
      ['Publication Year', product.publication_year || 'N/A', Calendar],
    ];

    const additionalSpecs = [
      ['Author/Brand', product.brand || product.author || 'N/A', User],
      ['Category', product.category?.name || 'N/A', Folder],
      ['Weight', product.weight ? `${product.weight}g` : 'N/A', Package],
      ['Dimensions', product.dimensions || 'N/A', Square],
      ['SKU', product.sku || 'N/A', Tag],
    ];

    const inventorySpecs = [
      ['Stock Status', product.manage_stock ? `${product.stock_quantity || 0} units` : 'Available', Package2],
      ['Stock Management', product.manage_stock ? 'Yes' : 'No', Settings],
      ['Backorders', product.backorders_allowed ? 'Allowed' : 'Not Allowed', Clock],
    ];

    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Main Specifications */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 sm:p-6 border border-gray-200">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Info className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            Book Specifications
          </h4>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {mainSpecs.map(([label, value, Icon]) => (
              <div key={label} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900 mt-0.5">{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Specifications */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-amber-200">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            Additional Details
          </h4>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {additionalSpecs.map(([label, value, Icon]) => (
              <div key={label} className="bg-white/80 rounded-lg p-3 sm:p-4 border border-amber-200/50 hover:border-amber-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">{label}</div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900 mt-0.5">{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            Inventory & Policies
          </h4>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {inventorySpecs.map(([label, value, Icon]) => (
              <div key={label} className="bg-white/80 rounded-lg p-3 sm:p-4 border border-green-200/50 hover:border-green-300 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm text-gray-600 font-medium uppercase tracking-wide">{label}</div>
                    <div className="text-sm sm:text-base font-semibold text-gray-900 mt-0.5">{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Important Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-100">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm sm:text-base text-gray-700">
                <span className="font-semibold">Quality Assured:</span> All books are checked for quality before shipping
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-100">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm sm:text-base text-gray-700">
                <span className="font-semibold">Authentic Products:</span> Sold by {product.brand || product.author || 'verified sellers'}
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-100">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm sm:text-base text-gray-700">
                <span className="font-semibold">Return Policy:</span> Different return policies may apply to digital products
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-blue-100">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm sm:text-base text-gray-700">
                <span className="font-semibold">Customer Support:</span> Contact us for any specific requirements
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsTab = () => {
    return <BookDetails product={product} />;
  };

  const renderReviewsTab = () => {
    return <ProductReviews product={product} />;
  };

  // Old renderReviewsTab function - replaced by ProductReviews component
  const renderReviewsTabOld = () => {
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
                    style={{ width: `${seededRandom() * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">
                  {seededRandomInt(0, 50)}
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
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        {/* Enhanced Tab Navigation with Modern Design */}
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className="flex overflow-x-auto px-2 sm:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-200 border-b-3 relative ${
                    isActive
                      ? 'text-primary border-primary bg-white shadow-sm rounded-t-lg mx-1'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50 border-transparent rounded-lg mx-1 hover:border-gray-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.charAt(0)}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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

        {/* Enhanced Tab Content with Better Spacing */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'description' && renderDescriptionTab()}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'specifications' && renderSpecificationsTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
        </div>
      </div>
    </div>
  );
}


