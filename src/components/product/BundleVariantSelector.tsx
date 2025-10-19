'use client';

import React, { useState, useEffect } from 'react';
import { ProductBundleVariant } from '@/types';
import { Check, Package, Tag } from 'lucide-react';

interface BundleVariantSelectorProps {
  productId: number;
  productName: string;
  productPrice: number;
  bundleVariants: ProductBundleVariant[];
  onVariantSelect: (variant: ProductBundleVariant | null) => void;
  selectedVariantId?: number | null;
}

const BundleVariantSelector: React.FC<BundleVariantSelectorProps> = ({
  productId,
  productName,
  productPrice,
  bundleVariants,
  onVariantSelect,
  selectedVariantId,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Update local state when prop changes
  useEffect(() => {
    setSelectedId(selectedVariantId || null);
  }, [selectedVariantId]);

  // Filter only active variants and ensure data is valid
  const activeVariants = bundleVariants.filter(v => {
    if (!v || !v.is_active) return false;
    // Ensure required fields exist
    if (!v.id || !v.name || !v.quantity) return false;
    return true;
  });

  // If no active variants, don't show the selector
  if (activeVariants.length === 0) {
    return null;
  }

  // Debug log to see what data we're getting
  console.log('BundleVariantSelector - Active Variants:', activeVariants);

  // Find the best value (highest savings percentage)
  const bestValueVariant = activeVariants.reduce((best, current) => {
    const currentSavings = current.savings_percentage || 0;
    const bestSavings = best?.savings_percentage || 0;
    return currentSavings > bestSavings ? current : best;
  }, activeVariants[0]);

  const handleSelect = (variant: ProductBundleVariant | null) => {
    const newId = variant?.id || null;
    setSelectedId(newId);
    onVariantSelect(variant);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '₹0.00';
    }
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) {
      return '₹0.00';
    }
    return `₹${numAmount.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Bundle Options</h3>
        </div>
        <span className="text-xs sm:text-sm text-gray-500">(Save more when you buy more!)</span>
      </div>

      <div className="space-y-3">
        {/* Single Item Option */}
        <button
          onClick={() => handleSelect(null)}
          className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
            selectedId === null
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedId === null
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}
              >
                {selectedId === null && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base text-gray-900">Single Item</div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">Buy 1 item</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {formatCurrency(productPrice)}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">Regular price</div>
            </div>
          </div>
        </button>

        {/* Bundle Variant Options */}
        {activeVariants.map((variant) => {
          // Safely parse all numeric values
          const safeProductPrice = parseFloat(String(productPrice || 0));
          const safeQuantity = parseInt(String(variant.quantity || 1));
          const safeCalculatedPrice = parseFloat(String(variant.calculated_price || 0));
          
          const originalPrice = safeProductPrice * safeQuantity;
          const bundlePrice = safeCalculatedPrice || originalPrice;
          const savings = Math.max(0, originalPrice - bundlePrice);
          const savingsPercent = parseFloat(String(variant.savings_percentage || 0));
          const isBestValue = variant.id === bestValueVariant?.id && savingsPercent > 0;

          console.log('Rendering variant:', variant.name, {
            originalPrice,
            bundlePrice,
            savings,
            savingsPercent,
            variant
          });

          return (
            <button
              key={variant.id}
              onClick={() => handleSelect(variant)}
              className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all relative ${
                selectedId === variant.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Best Value Badge */}
              {isBestValue && (
                <div className="absolute -top-2 right-2 sm:right-4">
                  <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                    BEST VALUE
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center mt-0.5 sm:mt-1 flex-shrink-0 ${
                      selectedId === variant.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedId === variant.id && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm sm:text-base text-gray-900">{variant.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                      Buy {safeQuantity} items
                    </div>
                    
                    {/* Pricing Type Badge */}
                    <div className="mt-1.5 sm:mt-2">
                      {variant.pricing_type === 'percentage_discount' && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-green-700 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {variant.discount_percentage}% OFF
                        </span>
                      )}
                      {variant.pricing_type === 'fixed_price' && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Special Price
                        </span>
                      )}
                      {variant.pricing_type === 'fixed_discount' && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Save {formatCurrency(variant.fixed_discount || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      {formatCurrency(bundlePrice)}
                    </div>
                    {savings > 0 && (
                      <>
                        <div className="text-xs sm:text-sm text-gray-500 line-through">
                          {formatCurrency(originalPrice)}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-green-600 mt-0.5 sm:mt-1">
                          Save {formatCurrency(savings)}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Per Item Price */}
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                    {formatCurrency(bundlePrice / safeQuantity)} per item
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              {variant.stock_management_type === 'separate_stock' && variant.stock_quantity !== undefined && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-medium ${
                      variant.stock_quantity > 5 ? 'text-green-600' : 
                      variant.stock_quantity > 0 ? 'text-orange-600' : 
                      'text-red-600'
                    }`}>
                      {variant.stock_quantity > 0 
                        ? `${variant.stock_quantity} bundles` 
                        : 'Out of stock'}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary/Help Text */}
      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> Buy more and save! 
          {activeVariants.length === 1 && ` Get ${activeVariants[0].name.toLowerCase()}`}
          {activeVariants.length === 2 && ` Choose ${activeVariants[0].quantity}-pack or ${activeVariants[1].quantity}-pack`}
          {activeVariants.length > 2 && ` ${activeVariants.length} bundle sizes available`}
          {bestValueVariant && (bestValueVariant.savings_percentage || 0) > 0 && ` - save up to ${Math.round(bestValueVariant.savings_percentage || 0)}%`}!
        </p>
      </div>
    </div>
  );
};

export default BundleVariantSelector;

