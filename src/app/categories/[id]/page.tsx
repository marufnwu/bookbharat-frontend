'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { categoryApi, productApi } from '@/lib/api';
import { Category, Product } from '@/types';
import { 
  BookOpen, 
  Star, 
  Filter,
  Grid3X3, 
  List,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest First' },
  ];

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  useEffect(() => {
    if (category) {
      loadProducts();
    }
  }, [category, sortBy, currentPage]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryApi.getCategory(categoryId);
      
      if (response.success) {
        setCategory(response.data);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Failed to load category:', err);
      setError('Failed to load category');
    }
  };

  const loadProducts = async () => {
    try {
      const params: any = {
        category_id: category?.id,
        page: currentPage,
        per_page: 12,
      };

      if (sortBy === 'price-low') params.sort = 'price';
      else if (sortBy === 'price-high') params.sort = '-price';
      else if (sortBy === 'rating') params.sort = '-rating';
      else if (sortBy === 'newest') params.sort = '-created_at';

      const response = await productApi.getProducts(params);
      
      if (response.success) {
        const productsData = response.data?.data || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        const meta = response.meta || response.data?.meta;
        if (meta) {
          setTotalPages(meta.last_page || 1);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Loading category...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <span className="text-lg">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <Link href="/categories" className="hover:text-primary">Categories</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <span>{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
        <p className="text-muted-foreground mb-4">{category.description}</p>
        <p className="text-sm text-muted-foreground">{category.products_count} books available</p>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Browse by Topic</h3>
          <div className="flex flex-wrap gap-3">
            {category.children.map((child) => (
              <Link key={child.id} href={`/categories/${child.slug}`}>
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {child.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading products...</span>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">This category doesn't have any products yet.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
          : 'space-y-4'
        }>
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={200}
                      height={267}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  )}
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-primary font-medium">{category.name}</p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">by {product.brand || 'Unknown Author'}</p>
                  
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({product.reviews_count || 0})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-x-2">
                      <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.compare_price}</span>
                      )}
                    </div>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-12">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}