import { Metadata } from 'next';

// Fetch category data for metadata
async function fetchCategoryForMeta(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    const response = await fetch(`${apiUrl}/categories/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      throw new Error('Category not found');
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching category for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const category = await fetchCategoryForMeta(params.id);
  
  if (!category) {
    return {
      title: 'Category Not Found | BookBharat',
      description: 'The requested category could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v2.bookbharat.com';
  const categoryUrl = `${baseUrl}/categories/${category.slug || category.id}`;
  const categoryImage = category.image_url || `${baseUrl}/book-placeholder.svg`;

  const title = `${category.name} Books | BookBharat`;
  const description = category.description || 
    `Browse ${category.name} books at BookBharat. Discover a wide collection of books in ${category.name} category. Best prices, fast delivery across India.`;

  return {
    title,
    description: description.substring(0, 160),
    keywords: [category.name, 'books', category.name + ' books', 'online bookstore', 'bookbharat'].join(', '),
    
    openGraph: {
      title: category.name,
      description,
      url: categoryUrl,
      siteName: 'BookBharat',
      images: [
        {
          url: categoryImage,
          width: 800,
          height: 600,
          alt: category.name,
        }
      ],
      type: 'website',
      locale: 'en_IN',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description,
      images: [categoryImage],
      creator: '@bookbharat',
    },

    alternates: {
      canonical: categoryUrl,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}




