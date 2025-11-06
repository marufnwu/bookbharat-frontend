import { axiosInstance } from './api';
import { BlogPost, BlogCategory, BlogComment, BlogTag, BlogStats, BlogSearchParams, BlogResponse } from '@/types/blog';

class BlogService {
  private baseURL = '/api/v1/blog';

  async getPosts(params: BlogSearchParams = {}): Promise<BlogResponse> {
    const response = await axiosInstance.get(`${this.baseURL}/posts`, { params });
    return response.data.data;
  }

  async getPost(slug: string): Promise<BlogPost> {
    const response = await axiosInstance.get(`${this.baseURL}/post/${slug}`);
    return response.data.data;
  }

  async getFeaturedPosts(limit: number = 5): Promise<BlogPost[]> {
    const response = await axiosInstance.get(`${this.baseURL}/featured`, {
      params: { limit }
    });
    return response.data.data;
  }

  async getPopularPosts(limit: number = 10): Promise<BlogPost[]> {
    const response = await axiosInstance.get(`${this.baseURL}/popular`, {
      params: { limit }
    });
    return response.data.data;
  }

  async getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
    const response = await axiosInstance.get(`${this.baseURL}/recent`, {
      params: { limit }
    });
    return response.data.data;
  }

  async getCategories(): Promise<{ data: BlogCategory[] }> {
    const response = await axiosInstance.get(`${this.baseURL}/categories`);
    return response.data;
  }

  async getCategoryPosts(slug: string, params: BlogSearchParams = {}): Promise<BlogResponse> {
    const response = await axiosInstance.get(`${this.baseURL}/category/${slug}/posts`, { params });
    return response.data.data;
  }

  async getTags(limit: number = 20): Promise<{ data: BlogTag[] }> {
    const response = await axiosInstance.get(`${this.baseURL}/tags`, {
      params: { limit }
    });
    return response.data;
  }

  async getTagPosts(tag: string, params: BlogSearchParams = {}): Promise<BlogResponse> {
    const response = await axiosInstance.get(`${this.baseURL}/tag/${tag}/posts`, { params });
    return response.data.data;
  }

  async searchPosts(query: string, params: BlogSearchParams = {}): Promise<any> {
    const response = await axiosInstance.get(`${this.baseURL}/search`, {
      params: { q: query, ...params }
    });
    return response.data;
  }

  async getStats(): Promise<{ data: BlogStats }> {
    const response = await axiosInstance.get(`${this.baseURL}/stats`);
    return response.data;
  }

  async likePost(slug: string): Promise<void> {
    await axiosInstance.post(`${this.baseURL}/post/${slug}/like`);
  }

  async addComment(slug: string, data: {
    content: string;
    parent_id?: number;
    name?: string;
    email?: string;
    website?: string;
  }): Promise<any> {
    const response = await axiosInstance.post(`${this.baseURL}/post/${slug}/comment`, data);
    return response.data;
  }

  async likeComment(commentId: number): Promise<void> {
    await axiosInstance.post(`${this.baseURL}/comment/${commentId}/like`);
  }
}

export const blogApi = new BlogService();