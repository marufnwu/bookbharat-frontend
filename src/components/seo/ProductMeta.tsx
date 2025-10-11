'use client';

import Head from 'next/head';
import { Product } from '@/types';

interface ProductMetaProps {
  product: Product;
}

export function ProductMeta({ product }: ProductMetaProps) {
  const siteName = 'BookBharat';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bookbharat.com';

  const productUrl = `${baseUrl}/products/${product.id}`;
  const productImage = product.images?.[0]?.url ||
                      product.images?.[0]?.image_url ||
                      `${baseUrl}/book-placeholder.svg`;

  const title = `${product.name} by ${product.brand || product.author || 'Unknown'} | ${siteName}`;
  const description = product.description ||
                     product.short_description ||
                     `Buy ${product.name} online at ${siteName}. Best prices, fast delivery, and quality assurance.`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: description,
    image: productImage,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || product.author || 'Unknown',
    },
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      condition: 'https://schema.org/NewCondition',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.total_reviews || 0,
    } : undefined,
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${product.name}, ${product.category?.name}, books, online bookstore, ${product.brand || product.author}`} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={productImage} />
      <meta property="og:url" content={productUrl} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={productImage} />

      {/* Product-specific Meta Tags */}
      <meta property="product:price:amount" content={product.price.toString()} />
      <meta property="product:price:currency" content="INR" />
      <meta property="product:availability" content={product.in_stock ? 'instock' : 'outofstock'} />
      <meta property="product:condition" content="new" />

      {/* Canonical URL */}
      <link rel="canonical" href={productUrl} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  );
}


