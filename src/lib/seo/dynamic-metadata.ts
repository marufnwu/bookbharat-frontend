import type { Metadata } from 'next';
import { marketingConfigService, type SEOConfig } from '../marketing-config';

interface ProductMetadataOptions {
  product: {
    id: string;
    name: string;
    description?: string | null;
    short_description?: string | null;
    price: number | string;
    compare_price?: number | string | null;
    sku?: string | null;
    isbn?: string | null;
    author?: string | null;
    publisher?: string | null;
    publication_year?: number | string | null;
    pages?: number | null;
    format?: string | null;
    language?: string | null;
    category?: string | null;
    images?: Array<{
      url?: string;
      image_path?: string;
      image_url?: string;
    }>;
    primary_image?: {
      url?: string;
      image_path?: string;
      image_url?: string;
    };
    rating?: number | null;
    total_reviews?: number | null;
    in_stock?: boolean;
    brand?: string | null;
  };
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string;
}

interface CategoryMetadataOptions {
  category: {
    name: string;
    description?: string | null;
    slug: string;
    image?: string | null;
  };
}

interface BlogPostMetadataOptions {
  post: {
    title: string;
    excerpt?: string | null;
    content?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    author?: string | null;
    tags?: string[];
    categories?: string[];
  };
}

/**
 * Dynamic Metadata Generator using Marketing Configuration
 *
 * This service generates metadata using the backend marketing configuration
 * instead of hardcoded values, enabling centralized SEO management.
 */
export class DynamicMetadataGenerator {
  private seoConfig: SEOConfig | null = null;

  /**
   * Get SEO configuration, cached for performance
   */
  private async getSEOConfig(): Promise<SEOConfig> {
    if (!this.seoConfig) {
      this.seoConfig = await marketingConfigService.getSEOConfig();
    }
    return this.seoConfig;
  }

  /**
   * Reset cached SEO configuration (useful for testing or config updates)
   */
  resetCache(): void {
    this.seoConfig = null;
    marketingConfigService.clearCache();
  }

  /**
   * Generate product metadata using backend SEO configuration
   */
  async generateProductMetadata(options: ProductMetadataOptions): Promise<Metadata> {
    const { product, customTitle, customDescription, customKeywords } = options;
    const seo = await this.getSEOConfig();

    // Generate title using backend configuration
    const title = customTitle || this.generateProductTitle(product, seo);

    // Generate description using backend configuration
    const description = customDescription || this.generateProductDescription(product, seo);

    // Generate keywords
    const keywords = customKeywords || this.generateProductKeywords(product, seo);

    // Get product image
    const image = this.getProductImage(product);

    // Generate structured data
    const structuredData = this.generateProductStructuredData(product, seo);

    return {
      title,
      description,
      keywords,
      authors: product.author ? [{ name: product.author }] : [{ name: seo.meta_tags.author }],
      creator: seo.meta_tags.author,
      publisher: seo.meta_tags.publisher,
      robots: {
        index: seo.meta_tags.meta_robots.includes('index'),
        follow: seo.meta_tags.meta_robots.includes('follow'),
      },
      openGraph: {
        type: 'website',
        title,
        description,
        siteName: seo.open_graph.site_name,
        locale: seo.open_graph.locale,
        url: `/products/${product.id}`,
        images: image ? [
          {
            url: image,
            width: seo.open_graph.image.width,
            height: seo.open_graph.image.height,
            alt: product.name,
            type: seo.open_graph.image.type,
          }
        ] : undefined,
      },
      twitter: {
        card: seo.twitter.card as 'summary_large_image' | 'summary',
        title,
        description,
        site: seo.twitter.site || undefined,
        creator: seo.twitter.creator || product.author || undefined,
        images: image ? [image] : undefined,
      },
      alternates: {
        canonical: `/products/${product.id}`,
      },
      other: {
        'product:brand': product.brand || product.author || '',
        'product:availability': product.in_stock ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        'product:price:amount': typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2),
        'product:price:currency': 'INR',
        'product:retailer_item_id': product.sku || product.id,
        'product:item_group_id': product.isbn || '',
        'fb:app_id': '', // Could be added to backend config
      },
      ...structuredData,
    };
  }

  /**
   * Generate category metadata
   */
  async generateCategoryMetadata(options: CategoryMetadataOptions): Promise<Metadata> {
    const { category } = options;
    const seo = await this.getSEOConfig();

    const title = `${category.name}${seo.meta_tags.title_separator}${seo.meta_tags.default_title}`;
    const description = category.description || `Browse ${category.name} books at BookBharat. Find the best collection of ${category.name} books at great prices.`;

    return {
      title,
      description,
      openGraph: {
        type: 'website',
        title,
        description,
        siteName: seo.open_graph.site_name,
        locale: seo.open_graph.locale,
        url: `/category/${category.slug}`,
        images: category.image ? [
          {
            url: category.image,
            width: seo.open_graph.image.width,
            height: seo.open_graph.image.height,
            alt: category.name,
          }
        ] : undefined,
      },
      twitter: {
        card: seo.twitter.card as 'summary_large_image' | 'summary',
        title,
        description,
        site: seo.twitter.site || undefined,
      },
      alternates: {
        canonical: `/category/${category.slug}`,
      },
    };
  }

  /**
   * Generate blog post metadata
   */
  async generateBlogPostMetadata(options: BlogPostMetadataOptions): Promise<Metadata> {
    const { post } = options;
    const seo = await this.getSEOConfig();

    const title = `${post.title}${seo.meta_tags.title_separator}${seo.meta_tags.default_title}`;
    const description = post.excerpt || this.truncateText(post.content || '', 160);

    return {
      title,
      description,
      authors: post.author ? [{ name: post.author }] : [{ name: seo.meta_tags.author }],
      publishedTime: post.published_at,
      openGraph: {
        type: 'article',
        title,
        description,
        siteName: seo.open_graph.site_name,
        locale: seo.open_graph.locale,
        url: `/blog/post/${post.title.toLowerCase().replace(/\s+/g, '-')}`,
        images: post.featured_image ? [
          {
            url: post.featured_image,
            width: seo.open_graph.image.width,
            height: seo.open_graph.image.height,
            alt: post.title,
          }
        ] : undefined,
      },
      twitter: {
        card: seo.twitter.card as 'summary_large_image' | 'summary',
        title,
        description,
        site: seo.twitter.site || undefined,
        creator: post.author || seo.twitter.creator || undefined,
      },
      alternates: {
        canonical: `/blog/post/${post.title.toLowerCase().replace(/\s+/g, '-')}`,
      },
    };
  }

  /**
   * Generate homepage metadata
   */
  async generateHomepageMetadata(): Promise<Metadata> {
    const seo = await this.getSEOConfig();

    return {
      title: seo.meta_tags.default_title,
      description: seo.meta_tags.default_description || 'BookBharat - Your Knowledge Partner | Online Bookstore India',
      keywords: seo.meta_tags.default_keywords || 'books, online bookstore, india, fiction, non-fiction, academic books, bookbharat',
      authors: [{ name: seo.meta_tags.author }],
      creator: seo.meta_tags.publisher,
      publisher: seo.meta_tags.publisher,
      openGraph: {
        type: 'website',
        title: seo.meta_tags.default_title,
        description: seo.meta_tags.default_description || 'BookBharat - Your Knowledge Partner | Online Bookstore India',
        siteName: seo.open_graph.site_name,
        locale: seo.open_graph.locale,
        url: '/',
        images: seo.open_graph.image.default ? [
          {
            url: seo.open_graph.image.default,
            width: seo.open_graph.image.width,
            height: seo.open_graph.image.height,
            alt: seo.open_graph.site_name,
          }
        ] : undefined,
      },
      twitter: {
        card: seo.twitter.card as 'summary_large_image' | 'summary',
        title: seo.meta_tags.default_title,
        description: seo.meta_tags.default_description || 'BookBharat - Your Knowledge Partner | Online Bookstore India',
        site: seo.twitter.site || undefined,
        creator: seo.twitter.creator || undefined,
      },
      alternates: {
        canonical: '/',
      },
    };
  }

  /**
   * Generate product title using backend configuration
   */
  private generateProductTitle(product: ProductMetadataOptions['product'], seo: SEOConfig): string {
    const baseTitle = `${product.name}${seo.meta_tags.title_separator}${seo.meta_tags.default_title}`;

    // Add author if available
    if (product.author) {
      return `${product.name} by ${product.author}${seo.meta_tags.title_separator}${seo.meta_tags.default_title}`;
    }

    // Add price for better CTR
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    if (price && price > 0) {
      return `${product.name} - ₹${price.toFixed(2)}${seo.meta_tags.title_separator}${seo.meta_tags.default_title}`;
    }

    return baseTitle;
  }

  /**
   * Generate product description using backend configuration
   */
  private generateProductDescription(product: ProductMetadataOptions['product'], seo: SEOConfig): string {
    // Use product description if available
    if (product.description) {
      return this.truncateText(this.stripHtml(product.description), 160);
    }

    if (product.short_description) {
      return this.truncateText(product.short_description, 160);
    }

    // Generate dynamic description
    let description = `Buy ${product.name}`;

    if (product.author) {
      description += ` by ${product.author}`;
    }

    if (product.publisher) {
      description += ` published by ${product.publisher}`;
    }

    if (product.format) {
      description += ` (${product.format})`;
    }

    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    if (price && price > 0) {
      description += ` for just ₹${price.toFixed(2)}`;
    }

    description += ` at BookBharat. ${product.in_stock ? 'In stock' : 'Pre-order now'}.`;

    return this.truncateText(description, 160);
  }

  /**
   * Generate product keywords using backend configuration
   */
  private generateProductKeywords(product: ProductMetadataOptions['product'], seo: SEOConfig): string {
    const keywords = new Set<string>();

    // Add book title parts
    if (product.name) {
      product.name.split(' ').forEach(word => {
        if (word.length > 2) keywords.add(word.toLowerCase());
      });
    }

    // Add author name
    if (product.author) {
      keywords.add(product.author.toLowerCase());
      keywords.add(`${product.author.toLowerCase()} books`);
    }

    // Add publisher
    if (product.publisher) {
      keywords.add(product.publisher.toLowerCase());
    }

    // Add category
    if (product.category) {
      keywords.add(product.category.toLowerCase());
      keywords.add(`${product.category.toLowerCase()} books`);
    }

    // Add format-specific keywords
    if (product.format) {
      keywords.add(product.format.toLowerCase());
      keywords.add(`${product.format.toLowerCase()} books`);
    }

    // Add ISBN if available
    if (product.isbn) {
      keywords.add(`ISBN ${product.isbn}`);
    }

    // Add default keywords from backend
    if (seo.meta_tags.default_keywords) {
      seo.meta_tags.default_keywords.split(',').forEach(keyword => {
        keywords.add(keyword.trim().toLowerCase());
      });
    }

    // Add general book-related keywords
    ['books', 'online bookstore', 'buy books online', 'bookbharat', 'india'].forEach(keyword => {
      keywords.add(keyword);
    });

    return Array.from(keywords).join(', ');
  }

  /**
   * Get primary product image URL
   */
  private getProductImage(product: ProductMetadataOptions['product']): string | null {
    // Try primary image first
    if (product.primary_image) {
      if (product.primary_image.url) return product.primary_image.url;
      if (product.primary_image.image_url) return product.primary_image.image_url;
      if (product.primary_image.image_path) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        return product.primary_image.image_path.startsWith('http')
          ? product.primary_image.image_path
          : `${baseUrl}/storage/${product.primary_image.image_path}`;
      }
    }

    // Try images array
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.url) return firstImage.url;
      if (firstImage.image_url) return firstImage.image_url;
      if (firstImage.image_path) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        return firstImage.image_path.startsWith('http')
          ? firstImage.image_path
          : `${baseUrl}/storage/${firstImage.image_path}`;
      }
    }

    return null;
  }

  /**
   * Generate product structured data using backend configuration
   */
  private generateProductStructuredData(product: ProductMetadataOptions['product'], seo: SEOConfig) {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const image = this.getProductImage(product);

    const productData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: image ? [image] : undefined,
      description: product.description || product.short_description || '',
      sku: product.sku || product.id,
      mpn: product.isbn || '',
      brand: {
        '@type': 'Brand',
        name: product.brand || product.author || 'BookBharat',
      },
      offers: {
        '@type': 'Offer',
        url: `/products/${product.id}`,
        priceCurrency: 'INR',
        price: price.toFixed(2),
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        availability: product.in_stock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'BookBharat',
        },
      },
      additionalProperty: [
        ...(product.author ? [{
          '@type': 'PropertyValue',
          name: 'Author',
          value: product.author,
        }] : []),
        ...(product.publisher ? [{
          '@type': 'PropertyValue',
          name: 'Publisher',
          value: product.publisher,
        }] : []),
        ...(product.isbn ? [{
          '@type': 'PropertyValue',
          name: 'ISBN',
          value: product.isbn,
        }] : []),
        ...(product.format ? [{
          '@type': 'PropertyValue',
          name: 'Format',
          value: product.format,
        }] : []),
        ...(product.pages ? [{
          '@type': 'PropertyValue',
          name: 'Pages',
          value: product.pages.toString(),
        }] : []),
        ...(product.language ? [{
          '@type': 'PropertyValue',
          name: 'Language',
          value: product.language,
        }] : []),
      ],
      ...(product.rating && product.total_reviews ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.total_reviews,
          bestRating: '5',
          worstRating: '1',
        },
      } : {}),
    };

    return {
      other: {
        'application/ld+json': JSON.stringify(productData),
      },
    };
  }

  /**
   * Utility: Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Utility: Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3).trim() + '...';
  }
}

// Export singleton instance
export const dynamicMetadataGenerator = new DynamicMetadataGenerator();