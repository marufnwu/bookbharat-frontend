import { Metadata } from 'next';
import { Product } from '@/types';

export function generateProductMetadata(product: Product, baseUrl: string = 'https://v2.bookbharat.com'): Metadata {
  const productUrl = `${baseUrl}/products/${product.slug || product.id}`;
  const imageUrl = product.images?.[0]?.image_url || `${baseUrl}/book-placeholder.svg`;
  
  // Generate title with author/publisher
  const authorPart = product.author || product.brand || '';
  const title = authorPart 
    ? `${product.name} by ${authorPart} | BookBharat`
    : `${product.name} | BookBharat`;

  // Generate rich description
  const description = product.short_description || product.description || 
    `Buy ${product.name}${authorPart ? ` by ${authorPart}` : ''} online at BookBharat. ` +
    `Price: ₹${product.price}. ${product.in_stock ? 'In Stock' : 'Out of Stock'}. ` +
    `Free shipping on orders above ₹499. Fast delivery across India.`;

  // Generate keywords
  const keywords = [
    product.name,
    authorPart,
    product.publisher || '',
    product.category?.name || '',
    product.isbn || '',
    'books',
    'buy books online',
    'online bookstore india',
    'bookbharat'
  ].filter(Boolean);

  return {
    title,
    description: description.substring(0, 160), // Meta description should be max 160 chars
    keywords: keywords.join(', '),
    
    authors: authorPart ? [{ name: authorPart }] : undefined,
    
    openGraph: {
      title: product.name,
      description: description.substring(0, 200),
      url: productUrl,
      siteName: 'BookBharat',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        }
      ],
      type: 'website',
      locale: 'en_IN',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: description.substring(0, 200),
      images: [imageUrl],
      creator: '@bookbharat',
    },

    alternates: {
      canonical: productUrl,
    },

    other: {
      // Product-specific meta tags
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'INR',
      'product:availability': product.in_stock ? 'instock' : 'outofstock',
      'product:condition': 'new',
      ...(product.isbn && { 'books:isbn': product.isbn }),
      ...(authorPart && { 'books:author': authorPart }),
      ...(product.rating && { 'books:rating:value': product.rating.toString() }),
      ...(product.total_reviews && { 'books:rating:count': product.total_reviews.toString() }),
    },
  };
}









