'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { categoryApi } from '@/lib/api';
import { Category } from '@/types';
import { 
  BookOpen, 
  GraduationCap,
  Heart,
  Baby,
  Briefcase,
  Globe,
  Music,
  Palette,
  Search,
  TrendingUp,
  Users,
  Zap,
  Brain,
  History,
  FlaskConical,
  Loader2
} from 'lucide-react';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoryApi.getCategories();
        
        if (response.success) {
          setCategories(response.data);
        } else {
          setError('Failed to load categories');
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Helper function to get icon for category
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fiction')) return BookOpen;
    if (name.includes('business') || name.includes('finance')) return Briefcase;
    if (name.includes('academic') || name.includes('education')) return GraduationCap;
    if (name.includes('children') || name.includes('kids')) return Baby;
    if (name.includes('health') || name.includes('wellness')) return Heart;
    if (name.includes('travel') || name.includes('culture')) return Globe;
    if (name.includes('music')) return Music;
    if (name.includes('art') || name.includes('craft')) return Palette;
    if (name.includes('psychology') || name.includes('mind')) return Brain;
    if (name.includes('history')) return History;
    if (name.includes('science') || name.includes('technology')) return FlaskConical;
    if (name.includes('religion') || name.includes('spiritual')) return Users;
    if (name.includes('self-help') || name.includes('personal')) return Zap;
    return BookOpen; // default
  };

  // Helper function to get color for category
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600',
      'bg-amber-100 text-amber-600',
      'bg-cyan-100 text-cyan-600',
      'bg-emerald-100 text-emerald-600',
      'bg-rose-100 text-rose-600',
      'bg-violet-100 text-violet-600',
      'bg-teal-100 text-teal-600',
      'bg-red-100 text-red-600',
      'bg-orange-100 text-orange-600'
    ];
    return colors[index % colors.length];
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredCategories = categories.filter(cat => cat.is_featured);
  const otherCategories = categories.filter(cat => !cat.is_featured);

  const totalBooks = categories.reduce((sum, cat) => sum + (cat.products_count || 0), 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="bg-gray-200 rounded-lg h-48"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Failed to load categories</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Explore Categories</h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Discover books across all genres and subjects. From fiction to academic texts, 
          find exactly what you're looking for in our vast collection.
        </p>
        
        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>{totalBooks > 0 ? totalBooks.toLocaleString() : 'Many'} books available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>{categories.length} categories</span>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Search Results ({filteredCategories.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => {
              const Icon = getCategoryIcon(category.name);
              const color = getCategoryColor(index);
              return (
                <Link key={category.id} href={`/categories/${category.slug || category.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex rounded-full p-4 ${color} mb-4`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {category.description || 'Explore books in this category'}
                      </p>
                      <Badge variant="outline">
                        {(category.products_count || 0).toLocaleString()} books
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!searchQuery && (
        <>
          {/* Featured Categories */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Featured Categories</h2>
                <p className="text-muted-foreground mt-2">Most popular categories with the largest collections</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCategories.map((category, index) => {
                const Icon = getCategoryIcon(category.name);
                const color = getCategoryColor(index);
                return (
                  <Link key={category.id} href={`/categories/${category.slug || category.id}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-8">
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 rounded-xl p-3 ${color}`}>
                            <Icon className="h-8 w-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {category.description || 'Explore books in this popular category'}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-sm">
                                {(category.products_count || 0).toLocaleString()} books
                              </Badge>
                              <Badge className="bg-primary/10 text-primary">Popular</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* All Categories */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">All Categories</h2>
                <p className="text-muted-foreground mt-2">Browse our complete collection by category</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {otherCategories.map((category, index) => {
                const Icon = getCategoryIcon(category.name);
                const color = getCategoryColor(index + featuredCategories.length);
                return (
                  <Link key={category.id} href={`/categories/${category.slug || category.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <CardContent className="p-6 text-center">
                        <div className={`inline-flex rounded-full p-4 ${color} mb-4`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {category.description || 'Discover books in this category'}
                        </p>
                        <Badge variant="outline">
                          {(category.products_count || 0).toLocaleString()} books
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Can't find what you're looking for?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Use our advanced search or contact our book experts to help you find the perfect book for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Search className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Advanced Search</p>
                      <p className="text-sm text-muted-foreground">Search with filters</p>
                    </div>
                  </div>
                </Card>
              </Link>
              
              <Link href="/contact">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Ask Our Experts</p>
                      <p className="text-sm text-muted-foreground">Get personalized help</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}