'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Product } from '@/types';

interface ProductBreadcrumbProps {
  product: Product;
  className?: string;
}

export function ProductBreadcrumb({ product, className = '' }: ProductBreadcrumbProps) {
  const breadcrumbs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Products', href: '/products' },
  ];

  // Add category breadcrumb if available
  if (product.category?.name) {
    breadcrumbs.push({
      label: product.category.name,
      href: `/categories/${product.category.slug}`,
    });
  }

  // Add product name (current page, no link)
  breadcrumbs.push({
    label: product.name,
    href: '#',
  });

  return (
    <nav
      className={`flex items-center gap-1 sm:gap-2 text-muted-foreground overflow-x-auto scrollbar-hide ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;

        return (
          <div key={index} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
            )}

            {isLast ? (
              <span
                className="text-foreground truncate max-w-[200px] sm:max-w-none"
                title={crumb.label}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="flex items-center hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none touch-target"
                title={crumb.label}
              >
                {Icon && <Icon className="h-4 w-4 mr-1 flex-shrink-0" />}
                <span className="truncate">{crumb.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}


