'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { productApi, categoryApi, cartApi } from '@/lib/api';
import { Product, Category } from '@/types';
import { useConfig } from '@/contexts/ConfigContext';
import { ProductCard } from '@/components/ui/product-card';
import { getProductCardProps, getProductGridClasses } from '@/lib/product-card-config';
import { 
  BookOpen, 
  Star, 
  Search,
  Filter,
  X,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  Loader2,
  ShoppingCart
} from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { siteConfig } = useConfig();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('price_min') || '',
    priceMax: searchParams.get('price_max') || '',
    sortBy: searchParams.get('sort') || 'relevance',
    rating: searchParams.get('rating') || '',
    availability: searchParams.get('availability') || '',
    author: searchParams.get('author') || '',
    language: searchParams.get('language') || '',
    discount: searchParams.get('discount') || ''
  });

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';

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

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery) {
      performSearch();
    } else {
      setSearchResults([]);
      setTotalResults(0);
      setLoading(false);
    }
  }, [searchQuery, filters, currentPage]);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        q: searchQuery,
        page: currentPage,
        per_page: 12,
      };

      if (filters.category) params.category_id = filters.category;
      if (filters.priceMin) params.price_min = filters.priceMin;
      if (filters.priceMax) params.price_max = filters.priceMax;
      if (filters.rating) params.rating = filters.rating;
      if (filters.availability) params.availability = filters.availability;
      if (filters.author) params.author = filters.author;
      if (filters.language) params.language = filters.language;
      if (filters.discount) params.discount = filters.discount;
      if (filters.sortBy && filters.sortBy !== 'relevance') params.sort = filters.sortBy;

      const response = await productApi.searchProducts(searchQuery, params);
      
      if (response.success) {
        setSearchResults(response.data.data || response.data);
        if (response.meta) {
          setTotalResults(response.meta.total);
          setTotalPages(response.meta.last_page);
        } else if (response.data.meta) {
          setTotalResults(response.data.meta.total);
          setTotalPages(response.data.meta.last_page);
        }
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setCurrentPage(1);
    updateURL({ ...filters, q: newQuery });
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    updateURL({ ...updatedFilters, q: searchQuery });
  };

  const updateURL = (params: any) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'relevance') {
        searchParams.set(key, value.toString());
      }
    });

    const newURL = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  };

  const addToCart = async (productId: number) => {
    try {
      setAddingToCart(productId);
      const response = await cartApi.addToCart(productId, 1);
      
      if (response.success) {
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
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
              src={product.images[0].image_url || images[0].url}
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
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({product.rating || 'N/A'})</span>
          </div>
          
          <div className={`${isListView ? 'flex items-center justify-between' : 'space-y-2'}`}>
            <div className="space-x-2">
              <span className="text-lg font-bold text-foreground">
                {currencySymbol}{product.price}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {currencySymbol}{product.compare_price}
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Search Results</h1>
        
        {/* Search Bar */}
        <div className="max-w-2xl mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for books, authors, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-10 pr-12"
            />
            <Button 
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-1 top-1 px-3"
              size="sm"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Results Info and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            {searchQuery && (
              <p className="text-muted-foreground">
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Searching...
                  </span>
                ) : (
                  `Found ${totalResults} results for "${searchQuery}"`
                )}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
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
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange({ priceMin: e.target.value })}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange({ priceMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rating
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange({ rating: e.target.value })}
                >
                  <option value="">Any Rating</option>
                  <option value="4">4★ and above</option>
                  <option value="3">3★ and above</option>
                  <option value="2">2★ and above</option>
                  <option value="1">1★ and above</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Availability
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={filters.availability}
                  onChange={(e) => handleFilterChange({ availability: e.target.value })}
                >
                  <option value="">All Items</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Author
                </label>
                <Input
                  placeholder="Enter author name"
                  value={filters.author}
                  onChange={(e) => handleFilterChange({ author: e.target.value })}
                />
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Language
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={filters.language}
                  onChange={(e) => handleFilterChange({ language: e.target.value })}
                >
                  <option value="">All Languages</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="bengali">Bengali</option>
                  <option value="tamil">Tamil</option>
                  <option value="telugu">Telugu</option>
                  <option value="marathi">Marathi</option>
                  <option value="gujarati">Gujarati</option>
                </select>
              </div>

              {/* Discount Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discount
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={filters.discount}
                  onChange={(e) => handleFilterChange({ discount: e.target.value })}
                >
                  <option value="">Any Discount</option>
                  <option value="10">10% or more</option>
                  <option value="20">20% or more</option>
                  <option value="30">30% or more</option>
                  <option value="50">50% or more</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name: A to Z</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-created_at">Newest First</option>
                </select>
              </div>

              <Button 
                className="w-full" 
                onClick={() => {
                  setFilters({
                    category: '',
                    priceMin: '',
                    priceMax: '',
                    sortBy: 'relevance',
                    rating: '',
                    availability: '',
                    author: '',
                    language: '',
                    discount: ''
                  });
                  updateURL({ q: searchQuery });
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="flex-1">
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
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? 'No results found' : 'Enter a search term'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters'
                  : 'Search for books, authors, or categories to get started'
                }
              </p>
              {searchQuery && (
                <Button onClick={() => handleSearch('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? getProductGridClasses('searchResults') : 'space-y-4'}>
                {searchResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    {...getProductCardProps(viewMode === 'grid' ? 'searchGrid' : 'searchList', isMobile)}
                    className={viewMode === 'list' ? 'flex' : ''}
                  />
                ))}
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}