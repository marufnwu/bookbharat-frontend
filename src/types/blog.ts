export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author: string;
  author_email?: string;
  author_avatar?: string;
  reading_time: string;
  views: number;
  likes: number;
  shares: number;
  published_at: string;
  formatted_date?: string;
  tags?: string[];
  categories?: BlogCategory[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  url: string;
  comments: BlogComment[];
  related_posts?: BlogPost[];
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  image?: string;
  posts_count: number;
  formatted_posts_count?: string;
  url: string;
  children?: BlogCategory[];
}

export interface BlogComment {
  id: number;
  content: string;
  author: string;
  email?: string;
  avatar?: string;
  website?: string;
  likes: number;
  created_at: string;
  time_ago?: string;
  status: string;
  replies?: BlogComment[];
  parent_id?: number;
}

export interface BlogTag {
  name: string;
  count: number;
  url: string;
}

export interface BlogStats {
  total_posts: number;
  total_categories: number;
  total_comments: number;
  total_views: number;
  total_likes: number;
  recent_posts_count: number;
  popular_categories: BlogCategory[];
  popular_tags: string[];
}

export interface BlogSearchParams {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  author?: string;
  tag?: string;
  sort?: 'published_at' | 'popular' | 'views' | 'likes';
  order?: 'asc' | 'desc';
}

export interface BlogResponse {
  data: BlogPost[];
  links: any[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}