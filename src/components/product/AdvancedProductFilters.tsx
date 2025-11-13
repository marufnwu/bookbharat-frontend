'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Star,
  Truck,
  BookOpen,
  Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterState {
  search: string;
  categories: string[];
  author: string;
  publisher: string;
  language: string;
  tags: string[];
  priceRange: [number, number];
  inStock: boolean;
  freeShipping: boolean;
  minRating: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdvancedProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  categories?: Array<{ id: string | number; name: string; product_count?: number }>;
  authors?: Array<{ name: string; product_count?: number }>;
  publishers?: Array<{ name: string; product_count?: number }>;
  languages?: Array<{ code: string; name: string }>;
  tags?: Array<{ name: string; product_count?: number }>;
  maxPrice?: number;
  className?: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  categories: [],
  author: '',
  publisher: '',
  language: '',
  tags: [],
  priceRange: [0, 5000],
  inStock: false,
  freeShipping: false,
  minRating: 0,
  sortBy: 'created_at',
  sortOrder: 'desc'
};

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Latest' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'discount', label: 'Discount' }
];

export const AdvancedProductFilters = React.memo(function AdvancedProductFilters({
  filters,
  onFiltersChange,
  onReset,
  categories = [],
  authors = [],
  publishers = [],
  languages = [],
  tags = [],
  maxPrice = 5000,
  className
}: AdvancedProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['search', 'categories']));
  const [searchTerms, setSearchTerms] = useState({ author: '', publisher: '', tag: '' });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  // Auto-expand sections when filters are applied
  useEffect(() => {
    const activeSections = new Set<string>();

    if (filters.search) activeSections.add('search');
    if (filters.categories.length > 0) activeSections.add('categories');
    if (filters.author) activeSections.add('author');
    if (filters.publisher) activeSections.add('publisher');
    if (filters.language) activeSections.add('language');
    if (filters.tags.length > 0) activeSections.add('tags');
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) activeSections.add('price');
    if (filters.minRating > 0) activeSections.add('rating');
    if (filters.inStock || filters.freeShipping) activeSections.add('availability');

    setExpandedSections(prev => new Set([...prev, ...activeSections]));
  }, [filters, maxPrice]);

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);

    onFiltersChange({ categories: newCategories });
  }, [filters.categories, onFiltersChange]);

  const handleTagChange = useCallback((tagName: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tagName]
      : filters.tags.filter(tag => tag !== tagName);

    onFiltersChange({ tags: newTags });
  }, [filters.tags, onFiltersChange]);

  const filteredAuthors = useMemo(() => {
    if (!searchTerms.author) return authors.slice(0, 10);
    return authors
      .filter(author => author.name.toLowerCase().includes(searchTerms.author.toLowerCase()))
      .slice(0, 10);
  }, [authors, searchTerms.author]);

  const filteredPublishers = useMemo(() => {
    if (!searchTerms.publisher) return publishers.slice(0, 10);
    return publishers
      .filter(publisher => publisher.name.toLowerCase().includes(searchTerms.publisher.toLowerCase()))
      .slice(0, 10);
  }, [publishers, searchTerms.publisher]);

  const filteredTags = useMemo(() => {
    if (!searchTerms.tag) return tags.slice(0, 15);
    return tags
      .filter(tag => tag.name.toLowerCase().includes(searchTerms.tag.toLowerCase()))
      .slice(0, 15);
  }, [tags, searchTerms.tag]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.author) count++;
    if (filters.publisher) count++;
    if (filters.language) count++;
    if (filters.tags.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.minRating > 0) count++;
    if (filters.inStock || filters.freeShipping) count++;
    return count;
  }, [filters, maxPrice]);

  const FilterSection = useCallback(({
    id,
    title,
    icon: Icon,
    badge,
    children
  }: {
    id: string;
    title: string;
    icon: React.ElementType;
    badge?: string | number;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleSection(id)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{title}</span>
                {badge && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    );
  }, [expandedSections, toggleSection]);

  return (
    <Card className={cn("sticky top-4 h-fit", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <FilterSection id="search" title="Search" icon={Search}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </FilterSection>

        <Separator />

        {/* Categories */}
        <FilterSection
          id="categories"
          title="Categories"
          icon={BookOpen}
          badge={categories.length}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(String(category.id))}
                  onCheckedChange={(checked) => handleCategoryChange(String(category.id), !!checked)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {category.name}
                </Label>
                {category.product_count && (
                  <Badge variant="outline" className="text-xs">
                    {category.product_count}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </FilterSection>

        <Separator />

        {/* Author */}
        <FilterSection id="author" title="Author" icon={BookOpen}>
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Search author..."
                value={searchTerms.author}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, author: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredAuthors.map((author) => (
                <div key={author.name} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={author.name}
                    id={`author-${author.name}`}
                    checked={filters.author === author.name}
                    onCheckedChange={() => onFiltersChange({ author: author.name })}
                  />
                  <Label
                    htmlFor={`author-${author.name}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {author.name}
                  </Label>
                  {author.product_count && (
                    <Badge variant="outline" className="text-xs">
                      {author.product_count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FilterSection>

        <Separator />

        {/* Publisher */}
        <FilterSection id="publisher" title="Publisher" icon={BookOpen}>
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Search publisher..."
                value={searchTerms.publisher}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, publisher: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredPublishers.map((publisher) => (
                <div key={publisher.name} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={publisher.name}
                    id={`publisher-${publisher.name}`}
                    checked={filters.publisher === publisher.name}
                    onCheckedChange={() => onFiltersChange({ publisher: publisher.name })}
                  />
                  <Label
                    htmlFor={`publisher-${publisher.name}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {publisher.name}
                  </Label>
                  {publisher.product_count && (
                    <Badge variant="outline" className="text-xs">
                      {publisher.product_count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FilterSection>

        <Separator />

        {/* Language */}
        <FilterSection id="language" title="Language" icon={Languages}>
          <RadioGroup
            value={filters.language}
            onValueChange={(value) => onFiltersChange({ language: value })}
          >
            <div className="space-y-2">
              {languages.map((language) => (
                <div key={language.code} className="flex items-center space-x-2">
                  <RadioGroupItem value={language.code} id={`lang-${language.code}`} />
                  <Label
                    htmlFor={`lang-${language.code}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {language.name}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </FilterSection>

        <Separator />

        {/* Price Range */}
        <FilterSection id="price" title="Price Range" icon={BookOpen}>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>₹{filters.priceRange[0]}</span>
              <span>₹{filters.priceRange[1]}</span>
            </div>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => onFiltersChange({ priceRange: value as [number, number] })}
              max={maxPrice}
              step={50}
              className="w-full"
            />
          </div>
        </FilterSection>

        <Separator />

        {/* Rating */}
        <FilterSection id="rating" title="Minimum Rating" icon={Star}>
          <RadioGroup
            value={filters.minRating.toString()}
            onValueChange={(value) => onFiltersChange({ minRating: parseInt(value) })}
          >
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label
                    htmlFor={`rating-${rating}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-1"
                  >
                    {rating === 0 ? 'All Ratings' : (
                      <>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < Math.floor(rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        {rating === 4.5 ? '4.5 & up' : `${rating} & up`}
                      </>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </FilterSection>

        <Separator />

        {/* Availability */}
        <FilterSection id="availability" title="Availability" icon={Truck}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) => onFiltersChange({ inStock: !!checked })}
              />
              <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                In Stock Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free-shipping"
                checked={filters.freeShipping}
                onCheckedChange={(checked) => onFiltersChange({ freeShipping: !!checked })}
              />
              <Label htmlFor="free-shipping" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                <Truck className="h-3 w-3" />
                Free Shipping
              </Label>
            </div>
          </div>
        </FilterSection>

        {/* Tags */}
        {tags.length > 0 && (
          <>
            <Separator />
            <FilterSection id="tags" title="Tags" icon={BookOpen} badge={tags.length}>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Search tags..."
                    value={searchTerms.tag}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, tag: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredTags.map((tag) => (
                    <div key={tag.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.name}`}
                        checked={filters.tags.includes(tag.name)}
                        onCheckedChange={(checked) => handleTagChange(tag.name, !!checked)}
                      />
                      <Label
                        htmlFor={`tag-${tag.name}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {tag.name}
                      </Label>
                      {tag.product_count && (
                        <Badge variant="outline" className="text-xs">
                          {tag.product_count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FilterSection>
          </>
        )}

        <Separator />

        {/* Sort */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sort By
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
              className="col-span-1 text-sm border rounded p-2"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFiltersChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="col-span-1 text-sm border rounded p-2"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AdvancedProductFilters.displayName = 'AdvancedProductFilters';

export { DEFAULT_FILTERS };