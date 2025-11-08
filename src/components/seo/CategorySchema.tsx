'use client';

import { Category, Product } from '@/types';
import { generateCategoryItemListSchema, generateCollectionPageSchema } from '@/lib/seo/category-schema';

interface CategorySchemaProps {
  category: Category;
  products: Product[];
  totalProducts?: number;
  baseUrl?: string;
}

export function CategorySchema({ 
  category, 
  products, 
  totalProducts,
  baseUrl = 'https://v2.bookbharat.com' 
}: CategorySchemaProps) {
  const categoryUrl = `${baseUrl}/categories/${category.slug || category.id}`;
  
  const itemListSchema = generateCategoryItemListSchema(
    category.name,
    categoryUrl,
    products,
    baseUrl
  );

  const collectionSchema = generateCollectionPageSchema(
    category.name,
    categoryUrl,
    totalProducts || products.length,
    baseUrl
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}











