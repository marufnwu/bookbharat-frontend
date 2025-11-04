'use client';

import React from 'react';
import { Info, Calculator, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { taxService, TaxCalculationResponse } from '@/services/taxService';

interface TaxBreakdownProps {
  taxCalculation?: TaxCalculationResponse;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

interface TaxItemProps {
  label: string;
  amount: number;
  rate?: number;
  description?: string;
  isBold?: boolean;
  color?: string;
}

const TaxItem: React.FC<TaxItemProps> = ({
  label,
  amount,
  rate,
  description,
  isBold = false,
  color = 'text-gray-700'
}) => {
  return (
    <div className="flex justify-between items-start py-2">
      <div className="flex-1">
        <div className={cn('font-medium', isBold && 'text-lg', color)}>
          {label}
        </div>
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
        {rate !== undefined && rate > 0 && (
          <div className="text-xs text-gray-400">
            {taxService.formatTaxRate(rate)}
          </div>
        )}
      </div>
      <div className={cn('text-right', isBold && 'text-lg font-semibold', color)}>
        {taxService.formatTaxAmount(amount)}
      </div>
    </div>
  );
};

export function TaxBreakdown({
  taxCalculation,
  isLoading = false,
  error = null,
  className,
  showDetails = false,
  onToggleDetails
}: TaxBreakdownProps) {
  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border p-6', className)}>
        <div className="flex items-center space-x-3 mb-4">
          <Calculator className="w-5 h-5 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-semibold">Calculating Taxes</h3>
        </div>
        <Progress value={75} className="h-2 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={cn('mb-4', className)}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Unable to calculate taxes: {error}. Tax calculations will be finalized at checkout.
        </AlertDescription>
      </Alert>
    );
  }

  if (!taxCalculation?.data) {
    return (
      <div className={cn('bg-gray-50 rounded-lg border p-6 text-center', className)}>
        <Calculator className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Tax information will be available after address selection</p>
      </div>
    );
  }

  const { tax_calculation, summary } = taxCalculation.data;

  return (
    <div className={cn('bg-white rounded-lg border', className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Tax Summary</h3>
              <p className="text-sm text-gray-500">
                {tax_calculation.is_inter_state ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'} • {tax_calculation.state}
              </p>
            </div>
          </div>
          {onToggleDetails && (
            <button
              onClick={onToggleDetails}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>
      </div>

      {/* Main Summary */}
      <div className="p-6 space-y-1">
        <TaxItem
          label="Subtotal"
          amount={summary.subtotal - summary.shipping_cost}
          description="Total price of items in cart"
        />

        {summary.shipping_cost > 0 && (
          <TaxItem
            label="Shipping"
            amount={summary.shipping_cost}
            description="Delivery charges"
          />
        )}

        {showDetails && (
          <>
            {/* Tax Components */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Tax Breakdown</h4>

              {summary.tax_components.cgst > 0 && (
                <TaxItem
                  label="CGST (Central GST)"
                  amount={summary.tax_components.cgst}
                  description="Central Goods and Services Tax"
                  color="text-blue-600"
                />
              )}

              {summary.tax_components.sgst > 0 && (
                <TaxItem
                  label="SGST (State GST)"
                  amount={summary.tax_components.sgst}
                  description="State Goods and Services Tax"
                  color="text-green-600"
                />
              )}

              {summary.tax_components.igst > 0 && (
                <TaxItem
                  label="IGST (Integrated GST)"
                  amount={summary.tax_components.igst}
                  description="Integrated Goods and Services Tax (Inter-state)"
                  color="text-purple-600"
                />
              )}

              {summary.shipping_cost > 0 && tax_calculation.shipping?.tax > 0 && (
                <TaxItem
                  label="Shipping Tax"
                  amount={tax_calculation.shipping.tax}
                  rate={5}
                  description="GST on shipping charges"
                  color="text-orange-600"
                />
              )}
            </div>

            {/* Item-wise Tax Details */}
            {tax_calculation.items.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Item-wise Tax Details</h4>
                <div className="space-y-3">
                  {tax_calculation.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {item.item_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {taxService.getTaxCategoryDisplayName(item.category)}
                          </div>
                          {item.hsn_code && (
                            <div className="text-xs text-gray-400">
                              HSN: {item.hsn_code}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {taxService.formatTaxAmount(item.subtotal)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.quantity} × {taxService.formatTaxAmount(item.price)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div className="text-gray-600">
                          Tax ({taxService.formatTaxRate(item.rate)})
                        </div>
                        <div className="font-medium text-blue-600">
                          {taxService.formatTaxAmount(item.total_tax)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Total Tax */}
        <div className="border-t pt-4 mt-4">
          <TaxItem
            label="Total Tax"
            amount={summary.tax_amount}
            description={`Effective tax rate: ${summary.effective_tax_rate.toFixed(2)}%`}
            isBold
            color="text-blue-600"
          />
        </div>

        {/* Grand Total */}
        <div className="border-t pt-4 mt-4">
          <TaxItem
            label="Grand Total"
            amount={summary.grand_total}
            isBold
            color="text-gray-900"
          />
        </div>
      </div>

      {/* Footer Information */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Important:</strong> Taxes are calculated based on GST regulations for India.
          </p>
          <p>
            Final tax amount may vary based on shipping address and applicable tax laws.
          </p>
          {tax_calculation.is_inter_state ? (
            <p>
              IGST applies for inter-state transactions (goods shipped to different state).
            </p>
          ) : (
            <p>
              CGST + SGST applies for intra-state transactions (goods shipped within {tax_calculation.state}).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaxBreakdown;