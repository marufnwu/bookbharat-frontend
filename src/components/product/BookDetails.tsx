'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types';
import {
  BookOpen,
  Calendar,
  Globe,
  Weight,
  Package,
  Hash,
  Building,
  FileText,
  Badge
} from 'lucide-react';

interface BookDetailsProps {
  product: Product;
  className?: string;
}

export function BookDetails({ product, className = '' }: BookDetailsProps) {
  const formatPublicationDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatWeight = (weight?: number) => {
    if (!weight) return null;
    if (weight < 1000) return `${weight}g`;
    return `${(weight / 1000).toFixed(1)}kg`;
  };

  const formatDimensions = (dimensions?: { length?: number; width?: number; height?: number }) => {
    if (!dimensions?.length && !dimensions?.width && !dimensions?.height) return null;
    const parts = [];
    if (dimensions?.length) parts.push(`${dimensions.length}cm`);
    if (dimensions?.width) parts.push(`${dimensions.width}cm`);
    if (dimensions?.height) parts.push(`${dimensions.height}cm`);
    return parts.join(' × ');
  };

  const details = [
    {
      icon: Building,
      label: 'Publisher',
      value: product.publisher,
      condition: !!product.publisher
    },
    {
      icon: BookOpen,
      label: 'Author',
      value: product.author || product.brand,
      condition: !!(product.author || product.brand)
    },
    {
      icon: Hash,
      label: 'ISBN',
      value: product.isbn,
      condition: !!product.isbn
    },
    {
      icon: FileText,
      label: 'Pages',
      value: product.pages ? `${product.pages} pages` : undefined,
      condition: !!product.pages
    },
    {
      icon: Badge,
      label: 'Format',
      value: product.format,
      condition: !!product.format
    },
    {
      icon: Globe,
      label: 'Language',
      value: product.language,
      condition: !!product.language
    },
    {
      icon: Calendar,
      label: 'Published',
      value: formatPublicationDate(product.publication_date),
      condition: !!product.publication_date
    },
    {
      icon: Weight,
      label: 'Weight',
      value: formatWeight(product.weight),
      condition: !!product.weight
    },
    {
      icon: Package,
      label: 'Dimensions',
      value: formatDimensions(product.dimensions),
      condition: !!product.dimensions?.length || !!product.dimensions?.width || !!product.dimensions?.height
    }
  ];

  const availableDetails = details.filter(detail => detail.condition);

  if (availableDetails.length === 0) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Book Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableDetails.map((detail, index) => {
            const IconComponent = detail.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 text-muted-foreground flex items-center justify-center mt-0.5">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {detail.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detail.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Digital Badge */}
        {product.is_digital && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                Digital Product
              </Badge>
              <span className="text-sm text-muted-foreground">
                Instant download available
              </span>
            </div>
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <div className="mt-3">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              ⭐ Featured Product
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}