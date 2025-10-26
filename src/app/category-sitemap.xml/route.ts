import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v2.bookbharat.com';

    // Fetch categories from API
    const response = await fetch(`${apiUrl}/categories`, {
      next: { revalidate: 86400 }, // Revalidate daily
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    const categories = data.data || [];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map((category: any) => {
  const categoryUrl = `${baseUrl}/categories/${category.slug || category.id}`;
  const lastMod = category.updated_at || category.created_at;

  return `  <url>
    <loc>${escapeXml(categoryUrl)}</loc>
    <lastmod>${lastMod ? new Date(lastMod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error generating category sitemap:', error);
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




