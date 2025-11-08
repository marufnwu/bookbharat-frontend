import { Metadata } from 'next';
import { dynamicMetadataGenerator } from '@/lib/seo/dynamic-metadata';
import { generateBookSchema, generateBreadcrumbSchema } from '@/lib/seo/book-schema';
import Script from 'next/script';

// Fetch product data for metadata
async function fetchProductForMeta(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const baseUrl = apiUrl.replace('/api/v1', '');

    const response = await fetch(`${apiUrl}/products/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Product not found');
    }

    const data = await response.json();
    return data.success ? data.data.product : null;
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductForMeta(id);

  if (!product) {
    return {
      title: 'Product Not Found | BookBharat',
      description: 'The requested product could not be found.',
    };
  }

  // Use dynamic metadata generator with backend SEO configuration
  return await dynamicMetadataGenerator.generateProductMetadata({
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      price: product.price,
      compare_price: product.compare_price,
      sku: product.sku,
      isbn: product.isbn,
      author: product.author,
      publisher: product.publisher,
      publication_year: product.publication_year,
      pages: product.pages,
      format: product.format,
      language: product.language,
      category: product.category?.name,
      images: product.images,
      primary_image: product.primary_image,
      rating: product.rating,
      total_reviews: product.total_reviews,
      in_stock: product.in_stock,
      brand: product.brand,
    }
  });
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductForMeta(id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v2.bookbharat.com';

  // Generate structured data if product exists
  let bookSchema = null;
  let breadcrumbSchema = null;

  if (product) {
    bookSchema = generateBookSchema(product, baseUrl);

    // Generate breadcrumb schema
    const breadcrumbItems = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' }
    ];

    // Add category if available
    if (product.category) {
      breadcrumbItems.push({
        name: product.category.name,
        url: `/categories/${product.category.id}`
      });
    }

    breadcrumbItems.push({ name: product.name });
    breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, baseUrl);
  }

  return (
    <>
      {/* Book Schema for SEO */}
      {bookSchema && (
        <Script
          id="book-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(bookSchema)}
        </Script>
      )}

      {/* Breadcrumb Schema for SEO */}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(breadcrumbSchema)}
        </Script>
      )}

      {children}
    </>
  );
}











