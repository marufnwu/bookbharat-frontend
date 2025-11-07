import { Product } from '@/types';

export function generateBookSchema(product: Product, baseUrl: string = 'https://v2.bookbharat.com') {
  const productUrl = `${baseUrl}/products/${product.slug || product.id}`;
  const imageUrl = product.images?.[0]?.image_url || `${baseUrl}/book-placeholder.svg`;

  // Clean and prepare data
  const cleanDescription = (product.description || product.short_description || '').substring(0, 5000);
  const bookFormat = product.format || 'Paperback';
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': productUrl,
    'url': productUrl,
    'name': product.name,
    'description': cleanDescription,
    'image': Array.isArray(product.images) 
      ? product.images.map(img => img.image_url).filter(Boolean)
      : [imageUrl],
    'sku': product.sku,
  };

  // Add ISBN (critical for Google Books)
  if (product.isbn) {
    schema.isbn = product.isbn;
  }

  // Add Book Format
  if (product.format) {
    const formatMap: Record<string, string> = {
      'Hardcover': 'https://schema.org/Hardcover',
      'Paperback': 'https://schema.org/Paperback',
      'Ebook': 'https://schema.org/EBook',
      'Audiobook': 'https://schema.org/AudiobookFormat'
    };
    schema.bookFormat = formatMap[product.format] || 'https://schema.org/Paperback';
  }

  // Add number of pages
  if (product.pages) {
    schema.numberOfPages = product.pages;
  }

  // Add language
  if (product.language) {
    schema.inLanguage = product.language;
  }

  // Add Author
  if (product.author) {
    schema.author = {
      '@type': 'Person',
      'name': product.author
    };
  } else if (product.brand) {
    // Fallback to brand as author
    schema.author = {
      '@type': 'Person',
      'name': product.brand
    };
  }

  // Add Publisher
  if (product.publisher) {
    schema.publisher = {
      '@type': 'Organization',
      'name': product.publisher
    };
  }

  // Add Publication Date
  if (product.publication_date) {
    schema.datePublished = product.publication_date;
  }

  // Add Offers (Price Information)
  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0));

  schema.offers = {
    '@type': 'Offer',
    'url': productUrl,
    'priceCurrency': 'INR',
    'price': price.toFixed(2),
    'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    'availability': product.in_stock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    'itemCondition': 'https://schema.org/NewCondition',
    'seller': {
      '@type': 'Organization',
      'name': 'BookBharat',
      'url': baseUrl
    }
  };

  // Add compare price if available
  if (product.compare_price && product.compare_price > price) {
    schema.offers.priceSpecification = {
      '@type': 'PriceSpecification',
      'price': price.toFixed(2),
      'priceCurrency': 'INR',
      'valueAddedTaxIncluded': true
    };
  }

  // Add Aggregate Rating
  if (product.rating && product.total_reviews) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': product.rating.toFixed(1),
      'reviewCount': product.total_reviews,
      'bestRating': 5,
      'worstRating': 1
    };
  }

  // Add Individual Reviews
  if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
    schema.review = product.reviews.slice(0, 10).map(review => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': review.user?.name || 'Anonymous'
      },
      'datePublished': review.created_at,
      'reviewBody': review.comment || review.review,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': 5,
        'worstRating': 1
      }
    }));
  }

  return schema;
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url?: string }>, baseUrl: string = 'https://v2.bookbharat.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url && index < items.length - 1 ? `${baseUrl}${item.url}` : undefined
    }))
  };
}


