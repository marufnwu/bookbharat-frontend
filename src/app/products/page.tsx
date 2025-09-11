'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/contexts/ConfigContext';
import { productApi, categoryApi, cartApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { 
  BookOpen, 
  Star, 
  Filter, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart
} from 'lucide-react';

interface ProductFilters {
  category: string;
  priceMin: string;
  priceMax: string;
  rating: string;
  inStock: boolean;
  onSale: boolean;
  search: string;
  sortBy: string;
}

export default function ProductsPage() {
  const { siteConfig } = useConfig();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    rating: searchParams.get('rating') || '',
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'popularity'
  });

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-created_at', label: 'Newest First' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  const priceRanges = [
    { min: '', max: '', label: 'All Prices' },
    { min: '0', max: '250', label: 'Under ₹250' },
    { min: '250', max: '500', label: '₹250 - ₹500' },
    { min: '500', max: '1000', label: '₹500 - ₹1000' },
    { min: '1000', max: '', label: 'Above ₹1000' },
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoriesResponse = await categoryApi.getCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [filters, currentPage]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        per_page: 12,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category_id = filters.category;
      if (filters.priceMin) params.price_min = filters.priceMin;
      if (filters.priceMax) params.price_max = filters.priceMax;
      if (filters.inStock) params.in_stock = true;
      if (filters.sortBy) params.sort = filters.sortBy;

      const response = await productApi.getProducts(params);
      
      if (response.success) {
        // Handle different possible API response structures
        const productsData = response.data?.data || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        // Handle pagination meta data
        const meta = response.meta || response.data?.meta;
        if (meta) {
          setTotalProducts(meta.total || 0);
          setTotalPages(meta.last_page || 1);
        }
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    updateURL(updatedFilters);
  };

  const updateURL = (filters: ProductFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        params.set(key, value.toString());
      }
    });

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters: ProductFilters = {
      category: '',
      priceMin: '',
      priceMax: '',
      rating: '',
      inStock: false,
      onSale: false,
      search: '',
      sortBy: 'popularity'
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    updateURL(clearedFilters);
  };

  const addToCart = async (productId: number) => {
    try {
      setAddingToCart(productId);
      const response = await cartApi.addToCart(productId, 1);
      
      if (response.success) {
        // Show success message (you could use a toast library)
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error message
    } finally {
      setAddingToCart(null);
    }
  };

  const ProductCard = ({ product, isListView = false }: { product: Product, isListView?: boolean }) => (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${isListView ? 'flex-row' : ''}`}>
      <CardContent className={`p-4 ${isListView ? 'flex items-center space-x-4 w-full' : ''}`}>
        <div className={`${isListView ? 'flex-shrink-0 w-24 h-32' : 'aspect-[3/4]'} bg-gray-100 rounded-lg mb-4 relative overflow-hidden`}>
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {product.is_featured && (
            <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
          
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
        
        <div className={`space-y-2 ${isListView ? 'flex-1' : ''}`}>
          <p className="text-sm text-primary font-medium">{product.category?.name || 'Book'}</p>
          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">by {product.brand || 'Unknown Author'}</p>
          
          {isListView && product.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{product.short_description}</p>
          )}
          
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(4.5)</span>
          </div>
          
          <div className={`${isListView ? 'flex items-center justify-between' : 'space-y-2'}`}>
            <div className="space-x-2">
              <span className="text-lg font-bold text-foreground">
                {siteConfig?.payment?.currency_symbol || '₹'}{product.price}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {siteConfig?.payment?.currency_symbol || '₹'}{product.compare_price}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((1 - product.price / product.compare_price) * 100)}% off
                  </Badge>
                </>
              )}
            </div>
            
            <div className={`${isListView ? 'flex items-center space-x-2' : 'flex flex-col space-y-2'}`}>
              {product.in_stock ? (
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => addToCart(product.id)}
                  disabled={addingToCart === product.id}
                >
                  {addingToCart === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled className="w-full">
                  Out of Stock
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="bg-gray-200 rounded aspect-[3/4]"></div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span>Products</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">All Books</h1>
          <p className="text-muted-foreground">Discover your next great read from our vast collection</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* View Mode Toggle */}
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

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="md:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price Range
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={`${filters.priceMin}-${filters.priceMax}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-');
                    handleFilterChange({ priceMin: min, priceMax: max });
                  }}
                >
                  {priceRanges.map((range, index) => (
                    <option key={index} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Availability
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border focus:ring-2 focus:ring-ring" 
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                    />
                    <span className="text-sm">In Stock Only</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border focus:ring-2 focus:ring-ring"
                      checked={filters.onSale}
                      onChange={(e) => handleFilterChange({ onSale: e.target.checked })}
                    />
                    <span className="text-sm">On Sale</span>
                  </label>
                </div>
              </div>

              <Button className="w-full" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              ) : (
                `Showing ${products.length} of ${totalProducts} results`
              )}
            </p>
            <select
              className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="bg-gray-200 rounded aspect-[3/4]"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isListView={viewMode === 'list'} />
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
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'primary' : 'outline'}
                    size="sm"
                    className="w-10"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}