'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { faqApi } from '@/lib/api';
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Truck,
  CreditCard,
  User,
  RotateCcw,
  Settings,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  helpful_count: number;
  not_helpful_count: number;
}

interface FaqCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load categories and initial FAQs
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, faqsResponse] = await Promise.all([
          faqApi.getFaqCategories(),
          faqApi.getFaqs()
        ]);

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        }

        if (faqsResponse.success) {
          setFaqs(faqsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load FAQ data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Search FAQs
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      // Reset to show all FAQs if search is cleared
      const response = await faqApi.getFaqs({ category: selectedCategory });
      if (response.success) {
        setFaqs(response.data);
      }
      return;
    }

    try {
      setSearchLoading(true);
      const response = await faqApi.searchFaqs(query);
      
      if (response.success) {
        setFaqs(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter by category
  const handleCategoryFilter = async (categoryId: string) => {
    try {
      setLoading(true);
      setSelectedCategory(categoryId);
      setSearchQuery(''); // Clear search when filtering by category
      
      const response = await faqApi.getFaqs({ 
        category: categoryId || undefined 
      });
      
      if (response.success) {
        setFaqs(response.data);
      }
    } catch (error) {
      console.error('Failed to filter FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle FAQ expansion
  const toggleFaq = (faqId: number) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      'truck': Truck,
      'credit-card': CreditCard,
      'book-open': BookOpen,
      'user': User,
      'rotate-ccw': RotateCcw,
      'settings': Settings
    };
    return icons[iconName] || HelpCircle;
  };

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Help & Support
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers to frequently asked questions or get in touch with our support team
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="pl-10 pr-4 py-3 text-center"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                className="justify-start h-auto p-4 text-left"
                onClick={() => handleCategoryFilter('')}
              >
                <HelpCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium">All Questions</div>
                  <div className="text-sm opacity-80">View all FAQs</div>
                </div>
              </Button>
              
              {categories.map((category) => {
                const Icon = getIconComponent(category.icon);
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    className="justify-start h-auto p-4 text-left"
                    onClick={() => handleCategoryFilter(category.id)}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm opacity-80">{category.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              {faqs.length === 0 
                ? `No results found for "${searchQuery}"`
                : `Found ${faqs.length} result${faqs.length === 1 ? '' : 's'} for "${searchQuery}"`
              }
            </p>
          </div>
        )}

        {/* FAQs List */}
        <div className="space-y-4 mb-12">
          {faqs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search terms or browse by category"
                    : "No FAQs are available for the selected category"
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      handleCategoryFilter('');
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            faqs.map((faq) => (
              <Card key={faq.id} className="transition-shadow hover:shadow-md">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-left">{faq.question}</span>
                    <div className="flex items-center space-x-2">
                      {selectedCategory === '' && (
                        <Badge variant="secondary" className="text-xs">
                          {categories.find(c => c.id === faq.category)?.name || faq.category}
                        </Badge>
                      )}
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                {expandedFaq === faq.id && (
                  <CardContent className="pt-0">
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <div dangerouslySetInnerHTML={{ 
                        __html: faq.answer.replace(/\n/g, '<br>') 
                      }} />
                    </div>
                    
                    {/* Helpful feedback */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Was this helpful?</span>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {faq.helpful_count}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {faq.not_helpful_count}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Contact Support Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Still need help?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <Link href="/contact">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Form
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <a href="tel:+911234567890">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </a>
              </Button>
              
              <Button variant="outline" asChild>
                <a href="mailto:support@bookbharat.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </a>
              </Button>
            </div>

            <div className="mt-6 text-sm text-muted-foreground">
              <p>Support hours: Monday - Friday, 9 AM - 6 PM IST</p>
              <p>Average response time: Less than 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}