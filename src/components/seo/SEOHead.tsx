"use client";

import Head from "next/head";
import { useMemo } from "react";
import { siteConfigService, type SEOConfig } from "@/lib/site-config";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: string;
  tags?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

/**
 * SEOHead component for managing page-specific SEO meta tags
 * Integrates with backend SEO configuration and provides structured data support
 */
export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  siteName,
  locale = "en_IN",
  author,
  publishedAt,
  updatedAt,
  category,
  tags,
  noIndex = false,
  canonicalUrl,
  structuredData,
}: SEOHeadProps) {
  // Get site configuration for SEO defaults
  const siteConfig = useMemo(() => {
    return siteConfigService.getSiteConfigDefaults();
  }, []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const currentPageUrl = canonicalUrl || url || siteUrl;

  // Generate structured data for articles/blog posts
  const generateStructuredData = useMemo(() => {
    if (!structuredData && type === 'article') {
      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "image": image ? [image] : undefined,
        "datePublished": publishedAt,
        "dateModified": updatedAt || publishedAt,
        "author": author ? {
          "@type": "Person",
          "name": author
        } : undefined,
        "publisher": {
          "@type": "Organization",
          "name": siteName || siteConfig.site.name,
          "logo": {
            "@type": "ImageObject",
            "url": siteConfig.site.logo
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": currentPageUrl
        },
        "keywords": tags ? tags.join(", ") : keywords?.join(", "),
        "articleSection": category,
      };
    }
    return structuredData;
  }, [structuredData, type, title, description, image, publishedAt, updatedAt, author, siteName, siteConfig.site.name, siteConfig.site.logo, currentPageUrl, tags, keywords, category]);

  const pageTitle = title ? `${title} ${siteConfig.meta_tags?.title_separator || '|'} ${siteConfig.meta_tags?.default_title || siteConfig.site.name}` : siteConfig.meta_tags?.default_title || siteConfig.site.name;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description || siteConfig.seo?.meta_description || siteConfig.site.description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {author && <meta name="author" content={author} />}

      {/* Robots Meta */}
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentPageUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || siteConfig.meta_tags?.default_title || siteConfig.site.name} />
      <meta property="og:description" content={description || siteConfig.seo?.meta_description || siteConfig.site.description} />
      <meta property="og:url" content={currentPageUrl} />
      <meta property="og:site_name" content={siteName || siteConfig.meta_tags?.default_title || siteConfig.site.name} />
      <meta property="og:locale" content={locale} />

      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content="image/jpeg" />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteConfig.meta_tags?.default_title || siteConfig.site.name} />
      <meta name="twitter:description" content={description || siteConfig.seo?.meta_description || siteConfig.site.description} />
      <meta name="twitter:site" content={siteConfig.twitter?.creator || "@bookbharat"} />
      {author && <meta name="twitter:creator" content={author} />}
      {image && <meta name="twitter:image" content={image} />}

      {/* Article Specific Meta */}
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
      {author && <meta property="article:author" content={author} />}
      {category && <meta property="article:section" content={category} />}
      {tags && tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content={siteConfig.theme?.primary_color || "#000000"} />
      <meta name="msapplication-TileColor" content={siteConfig.theme?.primary_color || "#000000"} />

      {/* Structured Data */}
      {generateStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData),
          }}
        />
      )}
    </Head>
  );
}

export default SEOHead;