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
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ChevronRight, ArrowLeft, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogPost } from '@/types/blog';
import { blogApi } from '@/services/blog';
import { formatDate } from '@/lib/utils';
import SEOHead from '@/components/seo/SEOHead';

export default function TagPage() {
  const isClient = useIsClient();
  const params = useParams();
  const [sortBy, setSortBy] = useState('published_at');
  const [currentPage, setCurrentPage] = useState(1);
  const tagName = decodeURIComponent(params.tag as string);

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
    queryKey: ['tag-posts', params.tag, sortBy, currentPage],
    queryFn: () => blogApi.getTagPosts(params.tag as string, {
      sort: sortBy,
      page: currentPage,
      per_page: 12
    }),
    keepPreviousData: true
  });

  const { data: popularTags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => blogApi.getTags(20)
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

  return (
    <>
      <SEOHead
        title={`#${tagName} - BookBharat Blog`}
        description={`Explore all posts tagged with ${tagName} on BookBharat blog`}
        keywords={`${tagName}, blog posts, articles, books`}
        type="website"
        url={`/blog/tag/${params.tag}`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-3 mb-4">
                <TagIcon className="h-10 w-10" />
                <h1 className="text-3xl md:text-4xl font-bold">
                  #{tagName}
                </h1>
              </div>

              <p className="text-lg opacity-90">
                Discover {posts?.meta?.total || 0} posts tagged with <strong>#{tagName}</strong>
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Sort Bar */}
                <div className="flex justify-between items-center mb-8">
                  <p className="text-gray-600">
                    Showing {posts?.data?.length || 0} of {posts?.meta?.total || 0} posts
                  </p>
                  <Select value={sortBy} onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}>
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
                ) : posts?.data?.length === 0 ? (
                  <div className="text-center py-12">
                    <TagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600 mb-6">
                      There are no posts tagged with "#{tagName}" yet.
                    </p>
                    <Link href="/blog">
                      <Button>Browse All Posts</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <TagIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags?.data.map((tag: any) => (
                      <Link
                        key={tag.name}
                        href={`/blog/tag/${tag.name}`}
                      >
                        <Badge
                          variant={tag.name === tagName ? "default" : "outline"}
                          className={`${tag.name === tagName ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-100 hover:text-purple-700'} transition-colors cursor-pointer`}
                        >
                          #{tag.name} ({tag.count})
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Related Content */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-bold text-lg mb-4">Browse Topics</h3>
                  <div className="space-y-2">
                    <Link href="/blog">
                      <Button variant="ghost" className="w-full justify-start">
                        All Posts
                      </Button>
                    </Link>
                    <Link href="/blog/categories">
                      <Button variant="ghost" className="w-full justify-start">
                        Categories
                      </Button>
                    </Link>
                    <Link href="/blog/tags">
                      <Button variant="ghost" className="w-full justify-start">
                        All Tags
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}