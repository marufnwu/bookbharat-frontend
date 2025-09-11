'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoryApi } from '@/lib/api';
import { Category } from '@/types';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { getCategoryIcon, getCategoryColor, getCategoryGradient } from '@/lib/category-utils';
import { 
  Search,
  Grid3x3,
  List,
  SortAsc,
  Loader2,
  BookOpen,
  Users,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'books'>('name');

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

  const filteredCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return (b.products_count || 0) - (a.products_count || 0);
    });

  const featuredCategories = filteredCategories.filter(cat => cat.is_featured);
  const regularCategories = filteredCategories.filter(cat => !cat.is_featured);
  const totalBooks = categories.reduce((sum, cat) => sum + (cat.products_count || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-24">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Failed to load categories</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="default">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.5))] pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center space-x-2 mb-6">
              <Grid3x3 className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Explore Categories
              </h1>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover books across all genres and subjects. From fiction to academic texts, 
              find exactly what you're looking for in our vast collection.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-xl shadow-lg border-0 bg-background"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur px-4 py-2 rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">{totalBooks.toLocaleString()} Books</span>
              </div>
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur px-4 py-2 rounded-full">
                <Grid3x3 className="h-4 w-4 text-primary" />
                <span className="font-medium">{categories.length} Categories</span>
              </div>
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur px-4 py-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">{featuredCategories.length} Featured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
            >
              <SortAsc className="h-4 w-4 mr-2" />
              Name
            </Button>
            <Button
              variant={sortBy === 'books' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('books')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Books
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Search Results ({filteredCategories.length})
              </h2>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredCategories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    icon={getCategoryIcon(category.name)}
                    colorClass={getCategoryColor(index)}
                    variant="compact"
                    showDescription={false}
                    showProductCount={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    icon={getCategoryIcon(category.name)}
                    colorClass={getCategoryColor(index)}
                    variant="featured"
                    showDescription={true}
                    showProductCount={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Featured Categories */}
        {!searchQuery && featuredCategories.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  Featured Categories
                </h2>
                <p className="text-muted-foreground mt-2">Most popular categories with the largest collections</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  icon={getCategoryIcon(category.name)}
                  colorClass={getCategoryColor(index)}
                  variant="featured"
                  showDescription={true}
                  showProductCount={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Categories */}
        {!searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">All Categories</h2>
                <p className="text-muted-foreground mt-2">Browse our complete collection by category</p>
              </div>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {regularCategories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    icon={getCategoryIcon(category.name)}
                    colorClass={getCategoryColor(index + featuredCategories.length)}
                    variant="compact"
                    showDescription={false}
                    showProductCount={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {regularCategories.map((category, index) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    icon={getCategoryIcon(category.name)}
                    colorClass={getCategoryColor(index + featuredCategories.length)}
                    variant="featured"
                    showDescription={true}
                    showProductCount={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-24">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search terms</p>
            <Button onClick={() => setSearchQuery('')} variant="default">
              Clear Search
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-12">
          <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" />
          <div className="relative text-center max-w-2xl mx-auto">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h3>
            <p className="text-muted-foreground mb-8">
              Use our advanced search or contact our book experts to help you find the perfect book for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button variant="default" size="lg" className="group">
                  <Search className="h-5 w-5 mr-2" />
                  Advanced Search
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button variant="outline" size="lg" className="group">
                  <Users className="h-5 w-5 mr-2" />
                  Ask Our Experts
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}