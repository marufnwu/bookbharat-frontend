'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface BundleDiscountProps {
  bundleDiscount: number;
  bundleDetails: {
    original_price: number;
    bundle_price: number;
    savings: number;
    discount_percentage: number;
    product_count: number;
    discount_rule?: {
      name: string;
      description: string;
      type: 'percentage' | 'fixed';
    };
  } | null;
  discountMessage?: string;
  currencySymbol: string;
  variant?: 'desktop' | 'mobile';
}

export function BundleDiscountDisplay({ 
  bundleDiscount, 
  bundleDetails, 
  discountMessage, 
  currencySymbol,
  variant = 'desktop'
}: BundleDiscountProps) {
  if (bundleDiscount <= 0) return null;

  if (variant === 'mobile') {
    return (
      <div className="bg-blue-50 p-2 rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs font-medium text-blue-800">Bundle Discount</p>
            {bundleDetails && (
              <p className="text-[10px] text-blue-600">
                {bundleDetails.discount_percentage}% off {bundleDetails.product_count} items
              </p>
            )}
          </div>
        </div>
        <p className="text-sm font-bold text-blue-800">
          -{currencySymbol}{bundleDiscount.toFixed(2)}
        </p>
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-semibold text-blue-800">Bundle Discount Applied</span>
              {bundleDetails?.discount_rule && (
                <Badge variant="secondary" className="ml-2 bg-blue-200 text-blue-800">
                  {bundleDetails.discount_rule.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-800 font-semibold">
              -{currencySymbol}{bundleDiscount.toFixed(2)}
            </p>
            {bundleDetails && (
              <p className="text-xs text-blue-600">
                {bundleDetails.discount_percentage}% off {bundleDetails.product_count} items
              </p>
            )}
          </div>
        </div>
        {discountMessage && (
          <p className="text-sm text-blue-700 mt-2 font-medium">
            {discountMessage}
          </p>
        )}
        {bundleDetails?.discount_rule?.description && (
          <p className="text-xs text-blue-600 mt-1">
            {bundleDetails.discount_rule.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}