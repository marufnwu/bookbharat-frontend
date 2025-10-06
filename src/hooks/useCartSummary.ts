import { useMemo } from 'react';
import { Cart } from '@/types';

export function useCartSummary(cart: Cart | null, currencySymbol: string) {
  return useMemo(() => {
    if (!cart) {
      return {
        subtotal: 0,
        couponDiscount: 0,
        couponCode: null,
        couponFreeShipping: false,
        bundleDiscount: 0,
        bundleDetails: null,
        totalDiscount: 0,
        discountMessage: null,
        discountedSubtotal: 0,
        tax: 0,
        total: 0,
        currencySymbol,
      };
    }

    const summary = (cart as any)?.summary || {};

    const subtotal = summary.subtotal || cart.subtotal || 0;
    const couponDiscount = summary.coupon_discount || 0;
    const bundleDiscount = summary.bundle_discount || 0;
    const totalDiscount = summary.total_discount || Math.max(couponDiscount, bundleDiscount);
    const discountedSubtotal = summary.discounted_subtotal || Math.max(0, subtotal - totalDiscount);
    const shippingCost = summary.shipping_cost || 0;

    // Unified charge system - charges array with total
    const charges = summary.charges || [];
    const totalCharges = summary.total_charges || 0;

    // FIXED: Tax varies by state (CGST+SGST for intra-state, IGST for inter-state)
    // Never use fallback hardcoded rate - always use server-calculated tax
    const tax = summary.tax_amount || 0;
    const taxesBreakdown = summary.taxes_breakdown || [];
    const total = summary.total || (discountedSubtotal + tax + shippingCost + totalCharges);

    return {
      subtotal,
      couponDiscount,
      couponCode: summary.coupon_code || null,
      couponFreeShipping: summary.coupon_free_shipping || false,
      bundleDiscount,
      bundleDetails: summary.bundle_details || null,
      totalDiscount,
      discountMessage: summary.discount_message || null,
      discountedSubtotal,
      shippingCost,
      shippingDetails: summary.shipping_details || null,
      charges,
      totalCharges,
      paymentMethod: summary.payment_method || null,
      tax,
      taxesBreakdown,
      total,
      currencySymbol,
      requiresPincode: summary.requires_pincode || false,
      itemCount: summary.total_items || cart.items?.length || 0,
    };
  }, [cart, currencySymbol]);
}