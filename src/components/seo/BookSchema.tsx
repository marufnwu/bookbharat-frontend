'use client';

import { Product } from '@/types';
import { generateBookSchema, generateBreadcrumbSchema } from '@/lib/seo/book-schema';

interface BookSchemaProps {
  product: Product;
  baseUrl?: string;
}

export function BookSchema({ product, baseUrl = 'https://v2.bookbharat.com' }: BookSchemaProps) {
  const bookSchema = generateBookSchema(product, baseUrl);

  // Generate breadcrumb
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    ...(product.category ? [{ name: product.category.name, url: `/categories/${product.category.slug || product.category.id}` }] : []),
    { name: product.name }
  ];
  
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}











