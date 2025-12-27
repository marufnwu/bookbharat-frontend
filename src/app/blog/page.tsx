'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

// Client-side only check
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return isClient
}
import Image from 'next/image';
import { Search, Calendar, Clock, User, ChevronRight, Tag, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogPost, BlogCategory } from '@/types/blog';
import { blogApi } from '@/services/blog';
import { formatDate } from '@/lib/utils';
import SEOHead from '@/components/seo/SEOHead';

export default function BlogPage() {
  const isClient = useIsClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['blog-posts', searchQuery, selectedCategory, sortBy, currentPage],
    queryFn: () => blogApi.getPosts({
      page: currentPage,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      sort: sortBy,
      per_page: 12
    }),
    keepPreviousData: true
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: blogApi.getCategories
  });

  const { data: featuredPosts } = useQuery({
    queryKey: ['blog-featured-posts'],
    queryFn: () => blogApi.getFeaturedPosts(3)
  });

  const { data: popularPosts } = useQuery({
    queryKey: ['blog-popular-posts'],
    queryFn: () => blogApi.getPopularPosts(5)
  });

  const { data: tags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => blogApi.getTags(15)
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <>
      <SEOHead
        title="BookBharat Blog - Book Reviews, Reading Tips & Literary News"
        description="Discover amazing book reviews, reading tips, author interviews, and the latest news from the literary world. Join our community of book lovers at BookBharat."
        keywords="book reviews, reading tips, author interviews, literary news, books, blog"
        type="website"
        url="/blog"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to BookBharat Blog
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Discover book reviews, reading tips, author interviews, and the latest literary news
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search articles, topics, or authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 text-lg text-gray-900 bg-white rounded-full shadow-lg focus:ring-4 focus:ring-white/20"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 rounded-full px-6"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filters Bar */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Filters:</span>
                </div>

                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.data.map((category: BlogCategory) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40">
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

              {/* Featured Posts */}
              {featuredPosts && featuredPosts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="bg-yellow-400 w-1 h-8 mr-3"></span>
                    Featured Articles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredPosts.map((post: BlogPost) => (
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
                              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                                <span className="text-white text-6xl font-bold opacity-20">
                                  {post.title.charAt(0)}
                                </span>
                              </div>
                            )}
                            <Badge className="absolute top-3 left-3 bg-yellow-400 text-black">
                              Featured
                            </Badge>
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
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {post.excerpt}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Grid */}
              {postsLoading ? (
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
              ) : postsError ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Failed to load posts. Please try again later.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.data.map((post: BlogPost) => (
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
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2 flex-wrap">
                                {post.tags?.slice(0, 2).map((tag: string) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {posts.links && posts.links.length > 3 && (
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
              <div className="space-y-8">
                {/* Popular Posts */}
                {popularPosts && popularPosts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                      <span className="bg-red-500 w-1 h-6 mr-2"></span>
                      Popular Posts
                    </h3>
                    <div className="space-y-4">
                      {popularPosts.map((post: BlogPost, index: number) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                          <div className="flex gap-3 group cursor-pointer">
                            <span className="text-2xl font-bold text-gray-300">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {post.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {post.views} views
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {categories && categories.data.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                      <span className="bg-green-500 w-1 h-6 mr-2"></span>
                      Categories
                    </h3>
                    <div className="space-y-2">
                      {categories.data.map((category: BlogCategory) => (
                        <Link
                          key={category.id}
                          href={`/blog/category/${category.slug}`}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm">{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.posts_count}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                {tags && tags.data.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-purple-500" />
                      Popular Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.data.map((tag: any) => (
                        <Link
                          key={tag.name}
                          href={`/blog/tag/${tag.name}`}
                        >
                          <Badge variant="outline" className="hover:bg-purple-100 hover:text-purple-700 transition-colors cursor-pointer">
                            #{tag.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}