import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v2.bookbharat.com';

    // Fetch products from API
    const response = await fetch(`${apiUrl}/products?per_page=1000&status=active`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    const products = data.data?.data || [];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products.map((product: any) => {
      const productUrl = `${baseUrl}/products/${product.slug || product.id}`;
      const imageUrl = product.images?.[0]?.image_url || '';
      const lastMod = product.updated_at || product.created_at;

      return `  <url>
    <loc>${escapeXml(productUrl)}</loc>
    <lastmod>${new Date(lastMod).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageUrl ? `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>` : ''}
  </url>`;
    }).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating product sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}










