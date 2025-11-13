'use client';

import { useState } from 'react';
import { MobileProductGrid, MobileProductRow } from '@/components/products/MobileProductGrid';
import { MobilePageWrapper } from '@/components/layout/MobilePageWrapper';
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';

// Example usage of mobile product components
export default function MobileProductsExample() {
  const [products] = useState([
    {
      id: 1,
      name: 'The Great Gatsby - Classic Edition with Annotations',
      slug: 'great-gatsby-classic',
      price: 299,
      compare_price: 499,
      brand: 'F. Scott Fitzgerald',
      category: { id: 1, name: 'Fiction', slug: 'fiction' },
      images: [{ url: '/api/placeholder/300/400' }],
      in_stock: true,
      is_featured: true,
      description: 'A classic American novel set in the Jazz Age'
    },
    // Add more sample products as needed
  ]);

  const filterGroups = [
    {
      id: 'category',
      label: 'Category',
      type: 'checkbox' as const,
      options: [
        { value: 'fiction', label: 'Fiction', count: 234 },
        { value: 'non-fiction', label: 'Non-Fiction', count: 156 },
        { value: 'academic', label: 'Academic', count: 89 },
        { value: 'children', label: 'Children', count: 45 }
      ]
    },
    {
      id: 'price',
      label: 'Price Range',
      type: 'range' as const,
      min: 0,
      max: 5000
    },
    {
      id: 'rating',
      label: 'Customer Rating',
      type: 'checkbox' as const,
      options: [
        { value: '4', label: '4★ & above', count: 456 },
        { value: '3', label: '3★ & above', count: 789 },
        { value: '2', label: '2★ & above', count: 923 }
      ]
    },
    {
      id: 'availability',
      label: 'Availability',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'All Products' },
        { value: 'in-stock', label: 'In Stock Only' },
        { value: 'pre-order', label: 'Pre-order' }
      ]
    },
    {
      id: 'format',
      label: 'Format',
      type: 'checkbox' as const,
      options: [
        { value: 'paperback', label: 'Paperback', count: 567 },
        { value: 'hardcover', label: 'Hardcover', count: 234 },
        { value: 'ebook', label: 'E-book', count: 189 },
        { value: 'audiobook', label: 'Audiobook', count: 78 }
      ]
    },
    {
      id: 'language',
      label: 'Language',
      type: 'checkbox' as const,
      options: [
        { value: 'english', label: 'English', count: 890 },
        { value: 'hindi', label: 'Hindi', count: 456 },
        { value: 'tamil', label: 'Tamil', count: 234 },
        { value: 'bengali', label: 'Bengali', count: 123 }
      ]
    }
  ];

  return (
    <MobilePageWrapper
      title="Books"
      showBackButton={true}
      backHref="/"
    >
      <ResponsiveContainer padding="compact">
        {/* Featured Products Row */}
        <MobileProductRow
          title="Featured Books"
          products={products}
          viewAllHref="/products?featured=true"
          className="mb-6"
        />

        {/* New Arrivals Row */}
        <MobileProductRow
          title="New Arrivals"
          products={products}
          viewAllHref="/products?sort=newest"
          className="mb-6"
        />

        {/* Main Product Grid */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">All Books</h2>
          <MobileProductGrid
            products={products}
            loading={false}
            totalProducts={1234}
            currentPage={1}
            totalPages={62}
            onPageChange={() => undefined}
            onSortChange={() => undefined}
            onFilterChange={() => undefined}
            filters={{}}
            filterGroups={filterGroups}
            showViewToggle={true}
            showFilters={true}
            showSort={true}
            infiniteScroll={false}
          />
        </div>
      </ResponsiveContainer>
    </MobilePageWrapper>
  );
}

// Mobile Product Detail Page Example
export function MobileProductDetailExample() {
  const product = {
    id: 1,
    name: 'The Great Gatsby',
    price: 299,
    compare_price: 499,
    brand: 'F. Scott Fitzgerald',
    category: { id: 1, name: 'Fiction', slug: 'fiction' },
    images: [
      { url: '/api/placeholder/400/600' },
      { url: '/api/placeholder/400/600' },
      { url: '/api/placeholder/400/600' }
    ],
    in_stock: true,
    is_featured: true,
    description: `
      The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. 
      Set in the Jazz Age on Long Island, near New York City, the novel depicts 
      first-person narrator Nick Carraway's interactions with mysterious millionaire 
      Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.
    `,
    specifications: {
      'ISBN': '978-0-7432-7356-5',
      'Publisher': 'Scribner',
      'Publication Date': 'April 10, 1925',
      'Pages': '180',
      'Language': 'English',
      'Dimensions': '5.5 x 0.5 x 8.5 inches',
      'Weight': '7.2 ounces'
    }
  };

  return (
    <MobilePageWrapper
      showBackButton={true}
      backHref="/products"
      noPadding={true}
    >
      {/* Image Gallery - Swipeable on mobile */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <div className="flex">
            {product.images.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 snap-center">
                <div className="aspect-[3/4] bg-muted relative">
                  <img 
                    src={image.url} 
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Image indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {product.images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full bg-white/60 ${
                index === 0 ? 'w-4 bg-white' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 space-y-4">
        {/* Title and Brand */}
        <div>
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">by {product.brand}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">4.5 (234 reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">₹{product.price}</span>
          {product.compare_price && (
            <>
              <span className="text-base text-muted-foreground line-through">
                ₹{product.compare_price}
              </span>
              <span className="text-sm text-green-600 font-medium">
                Save {Math.round((1 - product.price / product.compare_price) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Quick Actions - Sticky on mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border -mx-4 px-4 py-3 flex gap-2">
          <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium">
            Add to Cart
          </button>
          <button className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg font-medium">
            Buy Now
          </button>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Specifications */}
        <div>
          <h3 className="font-semibold mb-3">Product Details</h3>
          <div className="space-y-2">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Products */}
        <MobileProductRow
          title="Similar Books"
          products={[product, product, product]}
          viewAllHref="/products?category=fiction"
        />
      </div>
    </MobilePageWrapper>
  );
}