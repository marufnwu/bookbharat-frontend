import type { Metadata } from "next";
import { marketingConfigService, type SEOConfig } from "./marketing-config";

/**
 * Generate dynamic metadata from backend SEO configuration
 */
export async function generateDynamicMetadata(): Promise<Metadata> {
  // More precise build-time detection
  // NEXT_PHASE is only set during actual build time in Next.js 13+
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

  // Check if we're in server-side rendering (not build time)
  const isServerSide = typeof window === 'undefined' && !isBuildTime;

  try {
    // Use the same API URL pattern as the rest of the application
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    // Only attempt dynamic fetch during client-side runtime or development server-side
    // Allow API calls during development SSR and production client-side
    if (!isBuildTime && (!isServerSide || process.env.NODE_ENV === 'development')) {
      const response = await fetch(`${apiUrl}/marketing/config`, {
        cache: 'no-store', // Ensure fresh data
        next: { revalidate: 0 }, // Disable caching
      });

      if (!response.ok) {
        throw new Error('Failed to fetch marketing config');
      }

      const result = await response.json();
      const seoConfig = result.data?.seo || result.seo || result.data?.seo || {};
      const siteConfig = result.data?.site || result.site || {};
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      // Generate metadata object from backend configuration
      const metadata: Metadata = {
        metadataBase: new URL(siteUrl),
        title: {
          template: `%s${seoConfig.meta_tags?.title_separator || ' | '}${seoConfig.meta_tags?.default_title || 'BookBharat - Online Bookstore'}`,
          default: seoConfig.meta_tags?.default_title || 'BookBharat - Online Bookstore',
        },
        description: seoConfig.meta_tags?.default_description || undefined,
        keywords: seoConfig.meta_tags?.default_keywords ? seoConfig.meta_tags.default_keywords.split(',') : undefined,
        authors: seoConfig.meta_tags?.author ? [{ name: seoConfig.meta_tags.author }] : undefined,
        creator: seoConfig.meta_tags?.author,
        publisher: seoConfig.meta_tags?.publisher,
        icons: siteConfig.favicon ? {
          icon: siteConfig.favicon,
          shortcut: siteConfig.favicon,
          apple: siteConfig.favicon,
        } : undefined,
        robots: {
          index: seoConfig.meta_tags?.meta_robots?.includes('index') || true,
          follow: seoConfig.meta_tags?.meta_robots?.includes('follow') || true,
        },
        openGraph: {
          type: seoConfig.open_graph?.type as 'website',
          locale: seoConfig.open_graph?.locale || 'en_IN',
          url: siteUrl,
          title: seoConfig.meta_tags?.default_title || 'BookBharat - Online Bookstore',
          description: seoConfig.meta_tags?.default_description || undefined,
          siteName: seoConfig.open_graph?.site_name || 'BookBharat',
          images: seoConfig.open_graph?.image?.default ? [
            {
              url: seoConfig.open_graph.image.default,
              width: seoConfig.open_graph.image.width,
              height: seoConfig.open_graph.image.height,
              type: seoConfig.open_graph.image.type,
            },
          ] : [],
        },
        twitter: {
          card: seoConfig.twitter?.card as 'summary_large_image',
          title: seoConfig.meta_tags?.default_title || 'BookBharat - Online Bookstore',
          description: seoConfig.meta_tags?.default_description || undefined,
          creator: seoConfig.twitter?.creator || undefined,
          images: seoConfig.twitter?.image ? [seoConfig.twitter.image] : [],
        },
      };

      return metadata;
    }

    // During build time or server-side generation, use fallback metadata
    if (isBuildTime) {
      return {
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
        title: {
          template: "%s | BookBharat - Your Knowledge Partner",
          default: "BookBharat - Your Knowledge Partner | Online Bookstore India",
        },
        description: "Discover millions of books online at BookBharat. India's leading bookstore with fiction, non-fiction, academic books and more. Fast delivery, secure payment, best prices.",
        keywords: ["books", "online bookstore", "india", "fiction", "non-fiction", "academic books", "bookbharat"],
        authors: [{ name: "BookBharat Team" }],
        creator: "BookBharat",
        publisher: "BookBharat",
        openGraph: {
          type: "website",
          locale: "en_IN",
          url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          title: "BookBharat - Your Knowledge Partner",
          description: "Discover millions of books online at BookBharat. India's leading bookstore.",
          siteName: "BookBharat",
        },
        twitter: {
          card: "summary_large_image",
          title: "BookBharat - Your Knowledge Partner",
          description: "Discover millions of books online at BookBharat. India's leading bookstore.",
          creator: "@bookbharat",
        },
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    // Fallback to hardcoded metadata if backend fails
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    return {
      metadataBase: new URL(siteUrl),
      title: {
        template: "%s | BookBharat - Your Knowledge Partner",
        default: "BookBharat - Your Knowledge Partner | Online Bookstore India",
      },
      description: "Discover millions of books online at BookBharat. India's leading bookstore with fiction, non-fiction, academic books and more. Fast delivery, secure payment, best prices.",
      keywords: ["books", "online bookstore", "india", "fiction", "non-fiction", "academic books", "bookbharat"],
      authors: [{ name: "BookBharat Team" }],
      creator: "BookBharat",
      publisher: "BookBharat",
      openGraph: {
        type: "website",
        locale: "en_IN",
        url: siteUrl,
        title: "BookBharat - Your Knowledge Partner",
        description: "Discover millions of books online at BookBharat. India's leading bookstore.",
        siteName: "BookBharat",
      },
      twitter: {
        card: "summary_large_image",
        title: "BookBharat - Your Knowledge Partner",
        description: "Discover millions of books online at BookBharat. India's leading bookstore.",
        creator: "@bookbharat",
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Failed to generate dynamic metadata, using fallback:', error);

    // Fallback to hardcoded metadata if backend fails
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    return {
      metadataBase: new URL(siteUrl),
      title: {
        template: "%s | BookBharat - Your Knowledge Partner",
        default: "BookBharat - Your Knowledge Partner | Online Bookstore India",
      },
      description: "Discover millions of books online at BookBharat. India's leading bookstore with fiction, non-fiction, academic books and more. Fast delivery, secure payment, best prices.",
      keywords: ["books", "online bookstore", "india", "fiction", "non-fiction", "academic books", "bookbharat"],
      authors: [{ name: "BookBharat Team" }],
      creator: "BookBharat",
      publisher: "BookBharat",
      openGraph: {
        type: "website",
        locale: "en_IN",
        url: siteUrl,
        title: "BookBharat - Your Knowledge Partner",
        description: "Discover millions of books online at BookBharat. India's leading bookstore.",
        siteName: "BookBharat",
      },
      twitter: {
        card: "summary_large_image",
        title: "BookBharat - Your Knowledge Partner",
        description: "Discover millions of books online at BookBharat. India's leading bookstore.",
        creator: "@bookbharat",
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

/**
 * Generate page-specific metadata with fallback to defaults
 */
export async function generatePageMetadata(pageData: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}): Promise<Metadata> {
  const baseMetadata = await generateDynamicMetadata();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Merge base metadata with page-specific overrides
  return {
    ...baseMetadata,
    title: pageData.title ? {
      template: baseMetadata.title && typeof baseMetadata.title === 'object' ? baseMetadata.title.template : `%s | BookBharat`,
      default: pageData.title,
    } : baseMetadata.title,
    description: pageData.description || baseMetadata.description,
    keywords: pageData.keywords || baseMetadata.keywords,
    openGraph: {
      ...baseMetadata.openGraph,
      title: pageData.title || baseMetadata.openGraph?.title,
      description: pageData.description || baseMetadata.openGraph?.description,
      url: pageData.url || baseMetadata.openGraph?.url,
      images: pageData.image ? [
        {
          url: pageData.image,
          width: 1200,
          height: 630,
          type: "image/jpeg",
        },
      ] : baseMetadata.openGraph?.images,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: pageData.title || baseMetadata.twitter?.title,
      description: pageData.description || baseMetadata.twitter?.description,
      images: pageData.image ? [pageData.image] : baseMetadata.twitter?.images,
    },
    alternates: {
      canonical: pageData.url,
    },
  };
}