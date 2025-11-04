// Google Merchant Center Product Feed
// For Google Shopping and Facebook Product Catalog

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://v2.bookbharat.com';

    // Fetch active products from API
    const response = await fetch(`${apiUrl}/products?per_page=1000&status=active&in_stock=1`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    const products = data.data?.data || [];

    // Generate Google Merchant Feed (RSS 2.0 format with Google namespace)
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>BookBharat Products</title>
    <link>${baseUrl}</link>
    <description>BookBharat - India's Premier Online Bookstore Product Feed</description>
    ${products.map((product: any) => {
      const productUrl = `${baseUrl}/products/${product.slug || product.id}`;
      const imageUrl = product.images?.[0]?.image_url || '';
      const brand = product.publisher || product.brand || product.author || 'BookBharat';
      const condition = 'new';
      const availability = product.in_stock ? 'in_stock' : 'out_of_stock';
      
      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml((product.short_description || product.description || '').substring(0, 5000))}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      ${product.images?.slice(0, 10).map((img: any, idx: number) => 
        idx > 0 && img.image_url ? `<g:additional_image_link>${img.image_url}</g:additional_image_link>` : ''
      ).join('\n      ')}
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${product.price.toFixed(2)} INR</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:gtin>${product.isbn || product.sku || ''}</g:gtin>
      <g:mpn>${product.sku}</g:mpn>
      <g:item_group_id>${product.category_id || ''}</g:item_group_id>
      <g:product_type>${escapeXml(product.category?.name || 'Books')}</g:product_type>
      <g:google_product_category>Media > Books</g:google_product_category>
      ${product.isbn ? `<g:identifier_exists>yes</g:identifier_exists>` : `<g:identifier_exists>no</g:identifier_exists>`}
      ${product.rating ? `<g:customer_reviews><g:rating>${product.rating}</g:rating><g:count>${product.total_reviews || 0}</g:count></g:customer_reviews>` : ''}
    </item>`;
    }).join('')}
  </channel>
</rss>`;

    return new Response(feed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating product feed:', error);
    return new Response('Error generating product feed', { status: 500 });
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









