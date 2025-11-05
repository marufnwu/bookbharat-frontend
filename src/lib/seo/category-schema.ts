import { Product } from '@/types';

export function generateCategoryItemListSchema(
  categoryName: string,
  categoryUrl: string,
  products: Product[],
  baseUrl: string = 'https://v2.bookbharat.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `${categoryName} Books`,
    'url': categoryUrl,
    'numberOfItems': products.length,
    'itemListElement': products.slice(0, 20).map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Book',
        '@id': `${baseUrl}/products/${product.slug || product.id}`,
        'url': `${baseUrl}/products/${product.slug || product.id}`,
        'name': product.name,
        'image': product.images?.[0]?.image_url || '',
        'author': product.author ? {
          '@type': 'Person',
          'name': product.author
        } : undefined,
        'offers': {
          '@type': 'Offer',
          'price': product.price.toFixed(2),
          'priceCurrency': 'INR',
          'availability': product.in_stock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock'
        }
      }
    }))
  };
}

export function generateCollectionPageSchema(
  collectionName: string,
  collectionUrl: string,
  totalItems: number,
  baseUrl: string = 'https://v2.bookbharat.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': collectionName,
    'url': collectionUrl,
    'description': `Browse ${collectionName} at BookBharat`,
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': totalItems
    }
  };
}










