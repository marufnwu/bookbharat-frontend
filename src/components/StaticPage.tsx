'use client';

import { useEffect, useState } from 'react';
import { staticPagesApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface StaticPageData {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

interface StaticPageProps {
  slug: string;
}

export function StaticPage({ slug }: StaticPageProps) {
  const [pageData, setPageData] = useState<StaticPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await staticPagesApi.getPage(slug);
        
        if (response.success) {
          setPageData(response.data);
          
          // Update document meta tags
          if (typeof document !== 'undefined') {
            document.title = response.data.meta_title || response.data.title;
            
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute('content', response.data.meta_description);
            }
          }
        } else {
          setError('Page not found');
        }
      } catch (error) {
        console.error('Failed to load page:', error);
        setError('Failed to load page content');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading page...</span>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'The requested page could not be found.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">{pageData.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date(pageData.updated_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div 
          className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
    </div>
  );
}

// Basic sanitizer to remove script tags and inline event handlers
function sanitizeHtml(html: string) {
  if (!html) return '';
  try {
    // Remove script/style tags and their content
    html = html.replace(/<\/(script|style)>/gi, '</>');
    html = html.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/(script|style)>/gi, '');
    // Strip on* event handlers
    html = html.replace(/ on\w+\s*=\s*"[^"]*"/gi, '');
    html = html.replace(/ on\w+\s*=\s*'[^']*'/gi, '');
    html = html.replace(/ on\w+\s*=\s*[^\s>]+/gi, '');
    // Disallow javascript: URLs
    html = html.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"');
    html = html.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'");
    return html;
  } catch {
    return '';
  }
}
