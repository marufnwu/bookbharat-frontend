'use client';

import { useState, useEffect } from 'react';

// Client-side only check
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogPost, BlogCategory } from '@/types/blog';
import { blogApi } from '@/services/blog';
import { formatDate } from '@/lib/utils';
import SEOHead from '@/components/seo/SEOHead';

export default function CategoryPage() {
  const isClient = useIsClient();
  const params = useParams();
  const router = useRouter();
  const [sortBy, setSortBy] = useState('published_at');
  const [currentPage, setCurrentPage] = useState(1);

  // Don't render anything on server-side to prevent QueryClient errors
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['category-posts', params.slug, sortBy, currentPage],
    queryFn: () => blogApi.getCategoryPosts(params.slug as string, {
      sort: sortBy,
      page: currentPage,
      per_page: 12
    }),
    keepPreviousData: true
  });

  const { data: category } = useQuery({
    queryKey: ['category', params.slug],
    queryFn: async () => {
      const categories = await blogApi.getCategories();
      return categories.data.find((cat: BlogCategory) => cat.slug === params.slug);
    }
  });

  const { data: relatedCategories } = useQuery({
    queryKey: ['related-categories', params.slug],
    queryFn: async () => {
      const allCategories = await blogApi.getCategories();
      const current = allCategories.data.find((cat: BlogCategory) => cat.slug === params.slug);
      if (current?.children && current.children.length > 0) {
        return current.children;
      }
      // If no children, show other categories at the same level
      return allCategories.data
        .filter((cat: BlogCategory) => cat.parent_id === current?.parent_id && cat.id !== current?.id)
        .slice(0, 5);
    }
  });

  if (isLoading && !posts) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-1/3 mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${category.name} - BookBharat Blog`}
        description={category.description || `Explore all posts in ${category.name} category`}
        keywords={`${category.name}, books, blog posts, articles`}
        type="website"
        url={`/blog/category/${category.slug}`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-4 mb-4">
                {category.color && (
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon && (
                      <span className="text-white text-xl">{category.icon}</span>
                    )}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {category.name}
                  </h1>
                  <p className="text-gray-600 mt-2">{category.formatted_posts_count}</p>
                </div>
              </div>

              {category.description && (
                <p className="text-lg text-gray-700 max-w-3xl">
                  {category.description}
                </p>
              )}

              {/* Breadcrumb for sub-categories */}
              {category.parent_id && (
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                  <Link href="/blog" className="hover:text-gray-900">Blog</Link>
                  <ChevronRight className="h-4 w-4" />
                  <Link href={`/blog/category/${category.parent?.slug}`} className="hover:text-gray-900">
                    {category.parent?.name}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  <span>{category.name}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sub-categories or Related Categories */}
        {relatedCategories && relatedCategories.length > 0 && (
          <section className="bg-white border-b">
            <div className="container mx-auto px-4 py-8">
              <h2 className="text-lg font-semibold mb-4">
                {category.children && category.children.length > 0 ? 'Sub-categories' : 'Related Categories'}
              </h2>
              <div className="flex flex-wrap gap-3">
                {relatedCategories.map((cat: BlogCategory) => (
                  <Link key={cat.id} href={`/blog/category/${cat.slug}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-gray-100 cursor-pointer px-3 py-1"
                    >
                      {cat.name} ({cat.posts_count})
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Sort Bar */}
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-600">
                Showing {posts?.data?.length || 0} of {posts?.meta?.total || 0} posts
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published_at">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Posts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-5">
                      <Skeleton className="h-4 w-1/3 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts?.data?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No posts found in this category.</p>
                <Link href="/blog">
                  <Button>Browse All Posts</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts?.data?.map((post: BlogPost) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                        <div className="relative h-48 overflow-hidden">
                          {post.featured_image ? (
                            <Image
                              src={post.featured_image}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <span className="text-gray-500 text-6xl font-bold opacity-30">
                                {post.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.published_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.reading_time}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{post.author}</span>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {posts?.links && posts.links.length > 3 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex gap-2">
                      {posts.links.map((link: any, index: number) => (
                        <Button
                          key={index}
                          variant={link.active ? 'default' : 'outline'}
                          disabled={!link.url}
                          onClick={() => {
                            if (link.url) {
                              const page = new URL(link.url).searchParams.get('page');
                              setCurrentPage(page ? parseInt(page) : 1);
                            }
                          }}
                          className={`${link.active ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}