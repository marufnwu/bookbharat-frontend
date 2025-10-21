'use client';

import React, { useState, useEffect } from 'react';
import { ProductBundleVariant } from '@/types';
import { Check, Package, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    setSelectedId(selectedVariantId || null);
  }, [selectedVariantId]);

  const activeVariants = bundleVariants.filter(v => {
    if (!v || !v.is_active) return false;
    if (!v.id || !v.name || !v.quantity) return false;
    return true;
  });

  if (activeVariants.length === 0) {
    return null;
  }

  const bestValueVariant = activeVariants.reduce((best, current) => {
    const currentSavings = current.savings_percentage || 0;
    const bestSavings = best?.savings_percentage || 0;
    return currentSavings > bestSavings ? current : best;
  }, activeVariants[0]);

  const handleSelect = (variant: ProductBundleVariant | null) => {
    setSelectedId(variant?.id || null);
    onVariantSelect(variant);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₹0.00';
    const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (isNaN(numAmount)) return '₹0.00';
    return `₹${numAmount.toFixed(2)}`;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 mb-6 sm:p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 sm:text-lg">Choose Quantity</h3>
          <p className="text-xs text-gray-600">Save more when you buy more!</p>
        </div>
      </div>

      {/* Options Grid - Mobile Friendly */}
      <div className="space-y-2.5">
        {/* Single Item Card */}
        <div
          onClick={() => handleSelect(null)}
          className={`
            relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer
            ${selectedId === null 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `}
        >
          <div className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Title Section */}
              <div className="flex items-center gap-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${selectedId === null ? 'border-primary bg-primary' : 'border-gray-300'}
                `}>
                  {selectedId === null && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900 sm:text-base">Single Item</div>
                  <div className="text-xs text-gray-500">1 copy</div>
                </div>
              </div>
              
              {/* Right: Price */}
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {formatCurrency(productPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Variant Cards */}
        {activeVariants.map((variant) => {
          const safeProductPrice = parseFloat(String(productPrice || 0));
          const safeQuantity = parseInt(String(variant.quantity || 1));
          const safeCalculatedPrice = parseFloat(String(variant.calculated_price || 0));
          
          const originalPrice = safeProductPrice * safeQuantity;
          const bundlePrice = safeCalculatedPrice || originalPrice;
          const savings = Math.max(0, originalPrice - bundlePrice);
          const savingsPercent = parseFloat(String(variant.savings_percentage || 0));
          const isBestValue = variant.id === bestValueVariant?.id && savingsPercent > 0;

          return (
            <div
              key={variant.id}
              onClick={() => handleSelect(variant)}
              className={`
                relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer
                ${selectedId === variant.id 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : isBestValue
                    ? 'border-green-400 bg-green-50 hover:border-green-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Best Value Ribbon */}
              {isBestValue && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-green-600 to-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1 sm:text-xs sm:px-4">
                    <Sparkles className="h-3 w-3" />
                    BEST VALUE
                  </div>
                </div>
              )}

              <div className="p-3.5 sm:p-4">
                {/* Top Section: Title & Radio */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                    ${selectedId === variant.id ? 'border-primary bg-primary' : 'border-gray-300'}
                  `}>
                    {selectedId === variant.id && <Check className="h-3 w-3 text-white" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-base text-gray-900 sm:text-lg">
                      {variant.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 sm:text-sm">
                      Buy {safeQuantity} items together
                    </div>
                  </div>
                </div>

                {/* Middle Section: Pricing */}
                <div className="bg-white/50 rounded-lg p-2.5 mb-2 sm:p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Bundle Price */}
                    <div>
                      <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        {formatCurrency(bundlePrice)}
                      </div>
                      {savings > 0 && (
                        <div className="text-xs text-gray-500 line-through mt-0.5 sm:text-sm">
                          Was {formatCurrency(originalPrice)}
                        </div>
                      )}
                    </div>

                    {/* Savings Badge */}
                    {savings > 0 && (
                      <div className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap sm:text-sm sm:px-4">
                        Save {formatCurrency(savings)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Per Item Price */}
                <div className="flex items-center justify-between text-xs text-gray-600 sm:text-sm">
                  <span>Price per item:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(bundlePrice / safeQuantity)}
                  </span>
                </div>

                {/* Stock Info */}
                {variant.stock_management_type === 'separate_stock' && variant.stock_quantity !== undefined && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-semibold ${
                        variant.stock_quantity > 5 ? 'text-green-600' : 
                        variant.stock_quantity > 0 ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>
                        {variant.stock_quantity > 0 
                          ? `${variant.stock_quantity} bundles available` 
                          : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      {bestValueVariant && (bestValueVariant.savings_percentage || 0) > 0 && (
        <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 sm:p-3.5">
          <p className="text-xs text-amber-900 text-center font-medium sm:text-sm">
            🎉 Save up to <span className="font-bold text-orange-600">{Math.round(bestValueVariant.savings_percentage || 0)}%</span> with {bestValueVariant.name}!
          </p>
        </div>
      )}
    </div>
  );
};

export default BundleVariantSelector;
