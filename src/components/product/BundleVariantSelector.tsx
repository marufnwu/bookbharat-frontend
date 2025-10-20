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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      {/* Mobile-First Header */}
      <div className="mb-3 sm:mb-4 md:mb-5">
        <div className="flex items-center gap-2 mb-1 sm:mb-2">
          <div className="p-1 bg-primary/10 rounded-md">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Bundle Options</h3>
        </div>
        <div className="flex items-center gap-1 ml-6 sm:ml-7">
          <span className="w-1 h-1 bg-green-500 rounded-full"></span>
          <span className="text-xs text-gray-600">Save more when you buy more!</span>
        </div>
      </div>

      {/* Mobile-First Options */}
      <div className="space-y-3">
        {/* Single Item Option - Mobile Optimized */}
        <button
          onClick={() => handleSelect(null)}
          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
            selectedId === null
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          } sm:p-4 sm:rounded-xl md:p-5`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedId === null
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                } sm:w-5 sm:h-5`}
              >
                {selectedId === null && <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-gray-900 sm:text-base">Single Item</div>
                <div className="text-xs text-gray-500 sm:text-sm">Buy 1 item</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">
                {formatCurrency(productPrice)}
              </div>
              <div className="text-[10px] text-gray-500 sm:text-xs">Regular price</div>
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
            <div key={variant.id} className={`relative ${isBestValue ? 'pt-2 sm:pt-3' : ''}`}>
              {/* Mobile-First Best Value Badge */}
              {isBestValue && (
                <div className="absolute top-0 right-2 z-10 sm:right-3">
                  <span className="inline-flex items-center bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm sm:text-[10px] sm:px-2 sm:py-1 md:text-xs md:px-3">
                    ⭐ BEST
                  </span>
                </div>
              )}
              
              <button
                onClick={() => handleSelect(variant)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedId === variant.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : isBestValue 
                      ? 'border-green-200 bg-green-50/30'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                } ${isBestValue ? 'mt-2 sm:mt-3' : ''} sm:p-4 sm:rounded-xl md:p-5`}
              >

              {/* Mobile-First Layout */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedId === variant.id
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    } sm:w-5 sm:h-5`}
                  >
                    {selectedId === variant.id && <Check className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-gray-900 break-words sm:text-base">{variant.name}</div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      Buy {safeQuantity} items
                    </div>
                    
                    {/* Mobile-First Pricing Badge */}
                    <div className="mt-1">
                      {variant.pricing_type === 'percentage_discount' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-green-700 bg-green-50 px-1 py-0.5 rounded sm:text-[10px] sm:px-1.5 md:text-xs md:px-2">
                          <Tag className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">{variant.discount_percentage}% OFF</span>
                        </span>
                      )}
                      {variant.pricing_type === 'fixed_price' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-blue-700 bg-blue-50 px-1 py-0.5 rounded sm:text-[10px] sm:px-1.5 md:text-xs md:px-2">
                          <Tag className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">Special Price</span>
                        </span>
                      )}
                      {variant.pricing_type === 'fixed_discount' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-purple-700 bg-purple-50 px-1 py-0.5 rounded sm:text-[10px] sm:px-1.5 md:text-xs md:px-2">
                          <Tag className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">Save {formatCurrency(variant.fixed_discount || 0)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile-First Price Display */}
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">
                    {formatCurrency(bundlePrice)}
                  </div>
                  {savings > 0 && (
                    <>
                      <div className="text-[9px] text-gray-500 line-through sm:text-[10px] md:text-xs">
                        {formatCurrency(originalPrice)}
                      </div>
                      <div className="inline-flex items-center gap-0.5 text-[8px] font-bold text-white bg-green-600 px-1 py-0.5 rounded mt-0.5 sm:text-[9px] sm:px-1.5 md:text-[10px] md:px-2">
                        💰 {formatCurrency(savings)}
                      </div>
                    </>
                  )}
                  
                  {/* Per Item Price - Mobile Optimized */}
                  <div className="text-[8px] text-gray-600 mt-0.5 sm:text-[9px] md:text-[10px]">
                    {formatCurrency(bundlePrice / safeQuantity)}/item
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              {variant.stock_management_type === 'separate_stock' && variant.stock_quantity !== undefined && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] md:text-xs">
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
            </div>
          );
        })}
      </div>

      {/* Mobile-First Help Text */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg sm:mt-4 sm:p-4 md:mt-5 md:p-5 md:rounded-xl">
        <div className="flex items-start gap-2 sm:gap-3">
          <span className="text-lg sm:text-xl md:text-2xl">💡</span>
          <div className="flex-1">
            <p className="text-xs text-blue-900 leading-relaxed sm:text-sm md:text-base">
              <span className="font-bold">Tip:</span> Buy more and save! 
              {activeVariants.length === 1 && ` Get ${activeVariants[0].name.toLowerCase()}`}
              {activeVariants.length === 2 && ` Choose ${activeVariants[0].quantity}-pack or ${activeVariants[1].quantity}-pack`}
              {activeVariants.length > 2 && ` ${activeVariants.length} bundle sizes available`}
              {bestValueVariant && (bestValueVariant.savings_percentage || 0) > 0 && (
                <span className="text-green-700 font-medium"> - save up to {Math.round(bestValueVariant.savings_percentage || 0)}%!</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleVariantSelector;

