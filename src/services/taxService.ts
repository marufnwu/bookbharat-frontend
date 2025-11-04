/**
 * Tax Calculation Service
 * Handles tax calculations for Indian GST system
 */

export interface TaxItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  tax_category?: 'essential' | 'standard' | 'reduced' | 'premium' | 'luxury';
  hsn_code?: string;
}

export interface TaxCalculationRequest {
  items: TaxItem[];
  shipping_cost?: number;
  state: string;
  is_inter_state?: boolean;
  pincode?: string;
}

export interface TaxBreakdown {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
  rate: number;
  category: string;
  hsn_code?: string;
}

export interface TaxCalculationResponse {
  success: boolean;
  data?: {
    tax_calculation: {
      cart: {
        subtotal: number;
        tax: number;
        total: number;
      };
      shipping: {
        cost: number;
        tax: number;
        total: number;
      };
      taxes: {
        cgst: number;
        sgst: number;
        igst: number;
        total: number;
      };
      totals: {
        subtotal: number;
        total_tax: number;
        grand_total: number;
      };
      breakdown: Record<string, number>;
      is_inter_state: boolean;
      state: string;
      items: (TaxBreakdown & { item_id?: number; item_name?: string })[];
    };
    summary: {
      subtotal: number;
      shipping_cost: number;
      tax_amount: number;
      grand_total: number;
      tax_breakdown: Record<string, number>;
      effective_tax_rate: number;
      tax_components: {
        cgst: number;
        sgst: number;
        igst: number;
      };
    };
    state: string;
    is_inter_state: boolean;
    currency: string;
    calculated_at: string;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

export interface StateTaxRatesResponse {
  success: boolean;
  data?: {
    state: string;
    rates: {
      gst_rates: Record<string, number>;
      state_specific: Record<string, number>;
      shipping_gst: number;
    };
    currency: string;
  };
  message?: string;
}

export interface HSNBreakdownRequest {
  hsn_code: string;
  price: number;
  quantity: number;
  state: string;
}

export interface HSNBreakdownResponse {
  success: boolean;
  data?: {
    hsn_code: string;
    category: string;
    tax_breakdown: TaxBreakdown;
    currency: string;
  };
  message?: string;
}

export interface TaxInvoiceRequest {
  order_id: number;
  state: string;
}

export interface TaxInvoiceResponse {
  success: boolean;
  data?: {
    tax_invoice: {
      order_id?: number;
      order_number?: string;
      customer_details?: Record<string, any>;
      billing_address?: Record<string, any>;
      shipping_address?: Record<string, any>;
      state: string;
      date: string;
      place_of_supply: string;
      reverse_charge: boolean;
      items: Array<{
        product_name: string;
        hsn_code?: string;
        quantity: number;
        unit_price: number;
        total_value: number;
        tax_rate: number;
        cgst_amount: number;
        sgst_amount: number;
        total_tax: number;
        total_amount: number;
      }>;
      shipping?: {
        cost: number;
        tax_rate: number;
        tax_amount: number;
        total: number;
      };
      summary: {
        total_before_tax: number;
        total_tax: number;
        total_after_tax: number;
      };
    };
    order_id: number;
    order_number: string;
    currency: string;
  };
  message?: string;
}

class TaxService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  /**
   * Calculate tax for cart items
   */
  async calculateCartTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tax/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to calculate tax');
      }

      return data;
    } catch (error) {
      console.error('Tax calculation error:', error);
      throw error;
    }
  }

  /**
   * Get tax rates by state
   */
  async getStateTaxRates(state: string): Promise<StateTaxRatesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tax/rates/${encodeURIComponent(state)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get tax rates');
      }

      return data;
    } catch (error) {
      console.error('Get tax rates error:', error);
      throw error;
    }
  }

  /**
   * Get tax breakdown for HSN code
   */
  async getHSNTaxBreakdown(request: HSNBreakdownRequest): Promise<HSNBreakdownResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tax/hsn-breakdown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get HSN breakdown');
      }

      return data;
    } catch (error) {
      console.error('HSN breakdown error:', error);
      throw error;
    }
  }

  /**
   * Generate tax invoice for order (requires authentication)
   */
  async generateTaxInvoice(request: TaxInvoiceRequest, token?: string): Promise<TaxInvoiceResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/tax/invoice`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate tax invoice');
      }

      return data;
    } catch (error) {
      console.error('Tax invoice generation error:', error);
      throw error;
    }
  }

  /**
   * Format tax amount for display
   */
  formatTaxAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format tax rate for display
   */
  formatTaxRate(rate: number): string {
    return `${rate.toFixed(2)}%`;
  }

  /**
   * Get tax category display name
   */
  getTaxCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      essential: 'Essential Items (0% GST)',
      standard: 'Standard Rate (5% GST)',
      reduced: 'Reduced Rate (12% GST)',
      premium: 'Premium Rate (18% GST)',
      luxury: 'Luxury Items (28% GST)',
    };

    return categoryNames[category] || 'Standard Rate (5% GST)';
  }

  /**
   * Determine if shipping is taxable based on state
   */
  isShippingTaxable(state: string): boolean {
    // Most states tax shipping, but some may have exceptions
    const nonTaxableStates = ['']; // Add states where shipping is not taxable
    return !nonTaxableStates.includes(state);
  }

  /**
   * Validate tax calculation request
   */
  validateTaxRequest(request: TaxCalculationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.items || request.items.length === 0) {
      errors.push('At least one item is required');
    }

    if (!request.state || request.state.trim().length === 0) {
      errors.push('State is required');
    }

    if (request.items) {
      request.items.forEach((item, index) => {
        if (!item.name || item.name.trim().length === 0) {
          errors.push(`Item ${index + 1}: Name is required`);
        }
        if (!item.price || item.price < 0) {
          errors.push(`Item ${index + 1}: Valid price is required`);
        }
        if (!item.quantity || item.quantity < 1) {
          errors.push(`Item ${index + 1}: Valid quantity is required`);
        }
      });
    }

    if (request.shipping_cost !== undefined && request.shipping_cost < 0) {
      errors.push('Shipping cost cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate tax locally (fallback when API is unavailable)
   */
  calculateTaxLocally(request: TaxCalculationRequest): TaxCalculationResponse {
    const gstRates = {
      essential: 0,
      standard: 0.05,
      reduced: 0.12,
      premium: 0.18,
      luxury: 0.28,
    };

    let totalSubtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalTax = 0;

    const items = request.items.map(item => {
      const category = item.tax_category || 'standard';
      const gstRate = gstRates[category] || gstRates.standard;

      const itemTotal = item.price * item.quantity;
      const cgstAmount = request.is_inter_state ? 0 : itemTotal * (gstRate / 2);
      const sgstAmount = request.is_inter_state ? 0 : itemTotal * (gstRate / 2);
      const igstAmount = request.is_inter_state ? itemTotal * gstRate : 0;
      const itemTax = itemTotal * gstRate;

      totalSubtotal += itemTotal;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalIGST += igstAmount;
      totalTax += itemTax;

      return {
        subtotal: itemTotal,
        cgst: cgstAmount,
        sgst: sgstAmount,
        igst: igstAmount,
        total_tax: itemTax,
        rate: gstRate * 100,
        category,
        hsn_code: item.hsn_code,
        item_id: item.id,
        item_name: item.name,
      };
    });

    // Calculate shipping tax
    const shippingCost = request.shipping_cost || 0;
    const shippingGST = this.isShippingTaxable(request.state) ? shippingCost * 0.05 : 0;

    if (request.is_inter_state) {
      totalIGST += shippingGST;
    } else {
      totalCGST += shippingGST / 2;
      totalSGST += shippingGST / 2;
    }

    totalTax += shippingGST;

    const grandTotal = totalSubtotal + shippingCost + totalTax;

    return {
      success: true,
      data: {
        tax_calculation: {
          cart: {
            subtotal: totalSubtotal,
            tax: totalTax - shippingGST,
            total: totalSubtotal + (totalTax - shippingGST),
          },
          shipping: {
            cost: shippingCost,
            tax: shippingGST,
            total: shippingCost + shippingGST,
          },
          taxes: {
            cgst: totalCGST,
            sgst: totalSGST,
            igst: totalIGST,
            total: totalTax,
          },
          totals: {
            subtotal: totalSubtotal + shippingCost,
            total_tax: totalTax,
            grand_total: grandTotal,
          },
          breakdown: {
            CGST: totalCGST,
            SGST: totalSGST,
            IGST: totalIGST,
            'Cart Tax': totalTax - shippingGST,
            'Shipping Tax': shippingGST,
            'Total Tax': totalTax,
          },
          is_inter_state: request.is_inter_state || false,
          state: request.state,
          items,
        },
        summary: {
          subtotal: totalSubtotal + shippingCost,
          shipping_cost: shippingCost,
          tax_amount: totalTax,
          grand_total: grandTotal,
          tax_breakdown: {
            CGST: totalCGST,
            SGST: totalSGST,
            IGST: totalIGST,
            'Total Tax': totalTax,
          },
          effective_tax_rate: grandTotal > 0 ? (totalTax / (totalSubtotal + shippingCost)) * 100 : 0,
          tax_components: {
            cgst: totalCGST,
            sgst: totalSGST,
            igst: totalIGST,
          },
        },
        state: request.state,
        is_inter_state: request.is_inter_state || false,
        currency: 'INR',
        calculated_at: new Date().toISOString(),
      },
    };
  }
}

export const taxService = new TaxService();
export default taxService;