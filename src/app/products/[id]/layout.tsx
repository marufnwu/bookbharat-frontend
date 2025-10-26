import { Metadata } from 'next';
import { generateProductMetadata } from '@/lib/seo/product-metadata';

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await fetchProductForMeta(params.id);
  
  if (!product) {
    return {
      title: 'Product Not Found | BookBharat',
      description: 'The requested product could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v2.bookbharat.com';
  return generateProductMetadata(product, baseUrl);
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}




