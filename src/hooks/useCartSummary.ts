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

    // New charge system - backward compatible
    const charges = summary.charges || [];
    const totalCharges = summary.total_charges || 0;

    // Legacy charge fields for backward compatibility
    const codCharge = summary.cod_charge || 0;
    const additionalCharges = summary.additional_charges || 0;

    const tax = summary.tax_amount || Math.round(discountedSubtotal * 0.18);
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
      codCharge,
      codChargeLabel: summary.cod_charge_label || 'COD Charges',
      additionalCharges,
      additionalChargesLabel: summary.additional_charges_label || 'Handling Fee',
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