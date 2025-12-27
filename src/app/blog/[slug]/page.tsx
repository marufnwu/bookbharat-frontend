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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Heart,
  Share2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
  ThumbsUp,
  Reply
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { blogApi } from '@/services/blog';
import { formatDate } from '@/lib/utils';
import SEOHead from '@/components/seo/SEOHead';
import SocialShare from '@/components/Social/SocialShare';

export default function BlogPostPage() {
  const isClient = useIsClient();
  const params = useParams();
  const router = useRouter();

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
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [comment, setComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', params.slug],
    queryFn: () => blogApi.getPost(params.slug as string)
  });

  const likePostMutation = useMutation({
    mutationFn: () => blogApi.likePost(params.slug as string),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-post', params.slug]);
      toast({
        title: "Post liked!",
        description: "You've liked this post successfully."
      });
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: number) => blogApi.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-post', params.slug]);
      toast({
        title: "Comment liked!",
        description: "You've liked this comment successfully."
      });
    }
  });

  const submitCommentMutation = useMutation({
    mutationFn: (data: any) => blogApi.addComment(params.slug as string, data),
    onSuccess: () => {
      setComment('');
      setGuestName('');
      setGuestEmail('');
      queryClient.invalidateQueries(['blog-post', params.slug]);
      toast({
        title: "Comment submitted!",
        description: "Your comment has been submitted for approval."
      });
    }
  });

  const submitReplyMutation = useMutation({
    mutationFn: (data: any) => blogApi.addComment(params.slug as string, data),
    onSuccess: () => {
      setReplyContent('');
      setReplyingTo(null);
      queryClient.invalidateQueries(['blog-post', params.slug]);
      toast({
        title: "Reply submitted!",
        description: "Your reply has been submitted for approval."
      });
    }
  });

  const handleLikePost = () => {
    likePostMutation.mutate();
  };

  const handleLikeComment = (commentId: number) => {
    likeCommentMutation.mutate(commentId);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const data: any = { content: comment };
    if (user) {
      // Authenticated user - no need for name/email
    } else {
      // Guest user - require name and email
      if (!guestName.trim() || !guestEmail.trim()) {
        toast({
          title: "Missing information",
          description: "Please provide your name and email to comment.",
          variant: "destructive"
        });
        return;
      }
      data.name = guestName;
      data.email = guestEmail;
    }

    submitCommentMutation.mutate(data);
  };

  const handleReplySubmit = (e: React.FormEvent, parentCommentId: number) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const data: any = {
      content: replyContent,
      parent_id: parentCommentId
    };

    submitReplyMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
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
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        keywords={post.meta_keywords}
        type="article"
        url={`/blog/${post.slug}`}
        image={post.featured_image}
        author={post.author}
        publishedTime={post.published_at}
      />

      <article className="min-h-screen bg-gray-50">
        {/* Hero Image */}
        {post.featured_image && (
          <div className="relative h-96 w-full">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {/* Header */}
        <header className={`${post.featured_image ? '-mt-24' : 'pt-12'} relative z-10`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Link href="/blog">
                    <Button variant="ghost" size="sm" className="mb-2">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Blog
                    </Button>
                  </Link>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author_avatar} />
                      <AvatarFallback>{post.author?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{post.author}</p>
                      {post.author_email && (
                        <p className="text-xs text-gray-500">{post.author_email}</p>
                      )}
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.reading_time}</span>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag: string) => (
                      <Link key={tag} href={`/blog/tag/${tag}`}>
                        <Badge variant="secondary" className="hover:bg-gray-200 cursor-pointer">
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Categories:</span>
                    {post.categories.map((category: any) => (
                      <Link key={category.id} href={`/blog/category/${category.slug}`}>
                        <Badge variant="outline" className="hover:bg-gray-100 cursor-pointer">
                          {category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Share and Like */}
                    <div className="mt-8 pt-6 border-t flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={handleLikePost}
                          disabled={likePostMutation.isLoading}
                          className="flex items-center gap-2"
                        >
                          <Heart className={`h-4 w-4 ${likePostMutation.isLoading ? 'animate-pulse' : ''}`} />
                          Like ({post.likes})
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments.length} Comments
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{post.views} Views</span>
                        </div>
                      </div>

                      <SocialShare
                        url={typeof window !== 'undefined' ? window.location.href : ''}
                        title={post.title}
                        description={post.excerpt}
                      />
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-bold mb-6">Comments ({post.comments.length})</h2>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                      <div className="mb-4">
                        <Textarea
                          placeholder="Share your thoughts..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      {!user && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Input
                            type="text"
                            placeholder="Your Name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            required
                          />
                          <Input
                            type="email"
                            placeholder="Your Email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submitCommentMutation.isLoading || !comment.trim() || (!user && (!guestName.trim() || !guestEmail.trim()))}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {submitCommentMutation.isLoading ? 'Submitting...' : 'Post Comment'}
                      </Button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                      {post.comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      ) : (
                        post.comments.map((comment: any) => (
                          <div key={comment.id} className="border-b pb-6 last:border-b-0">
                            <div className="flex gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={comment.avatar} />
                                <AvatarFallback>{comment.author?.charAt(0)?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">{comment.author}</h4>
                                    <p className="text-xs text-gray-500">{comment.time_ago}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLikeComment(comment.id)}
                                    disabled={likeCommentMutation.isLoading}
                                    className="flex items-center gap-1"
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    {comment.likes}
                                  </Button>
                                </div>

                                <div
                                  className="text-gray-700 mb-3"
                                  dangerouslySetInnerHTML={{ __html: comment.content }}
                                />

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Reply className="h-4 w-4" />
                                  Reply
                                </Button>

                                {/* Reply Form */}
                                {replyingTo === comment.id && (
                                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-4">
                                    <Textarea
                                      placeholder="Write a reply..."
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      className="min-h-[80px] mb-2"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        type="submit"
                                        size="sm"
                                        disabled={submitReplyMutation.isLoading || !replyContent.trim()}
                                      >
                                        {submitReplyMutation.isLoading ? 'Posting...' : 'Post Reply'}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyContent('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </form>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-4 ml-8 space-y-4">
                                    {comment.replies.map((reply: any) => (
                                      <div key={reply.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={reply.avatar} />
                                          <AvatarFallback>{reply.author?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-1">
                                            <div>
                                              <h5 className="font-medium text-sm">{reply.author}</h5>
                                              <p className="text-xs text-gray-500">{reply.time_ago}</p>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleLikeComment(reply.id)}
                                              disabled={likeCommentMutation.isLoading}
                                              className="flex items-center gap-1 text-xs"
                                            >
                                              <ThumbsUp className="h-3 w-3" />
                                              {reply.likes}
                                            </Button>
                                          </div>
                                          <div
                                            className="text-sm text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: reply.content }}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  {post.related_posts && post.related_posts.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="font-bold text-lg mb-4">Related Posts</h3>
                      <div className="space-y-4">
                        {post.related_posts.map((relatedPost: any) => (
                          <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                            <div className="group cursor-pointer">
                              <div className="relative h-24 w-full mb-2 rounded overflow-hidden">
                                {relatedPost.featured_image ? (
                                  <Image
                                    src={relatedPost.featured_image}
                                    alt={relatedPost.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                )}
                              </div>
                              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                {relatedPost.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {relatedPost.reading_time} • {formatDate(relatedPost.published_at)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}