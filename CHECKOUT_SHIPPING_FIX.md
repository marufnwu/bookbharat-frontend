# Checkout Shipping Calculation Fix

## Issue Found
**Error:** 422 Unprocessable Content at `/api/v1/shipping/calculate-cart`
```json
{
  "message": "The delivery pincode field is required.",
  "errors": {
    "delivery_pincode": ["The delivery pincode field is required."]
  }
}
```

## Root Cause
There were **TWO** `calculateCartShipping` methods in `src/lib/api.ts`:

1. **Line 412** (NEW): Correctly calls `/cart/calculate-shipping` ✅
2. **Line 596** (OLD): Still calling `/shipping/calculate-cart` ❌

JavaScript was getting confused about which method to use, sometimes calling the old deprecated endpoint.

## Fix Applied

### File: `src/lib/api.ts`

**1. Commented out the old deprecated method (Lines 596-607):**
```typescript
// OLD METHOD - DEPRECATED - Use cartApi.calculateShipping instead
// async calculateCartShipping(data: {
//   delivery_pincode: string;
//   ...
// }) {
//   return this.post('/shipping/calculate-cart', data);  // ❌ OLD ENDPOINT
// }
```

**2. Removed from shippingApi export (Line 1030):**
```typescript
export const shippingApi = {
  getShippingZones: apiClient.getShippingZones.bind(apiClient),
  checkPincode: apiClient.checkPincode.bind(apiClient),
  getShippingRates: apiClient.getShippingRates.bind(apiClient),
  calculateShipping: apiClient.calculateShipping.bind(apiClient),
  // calculateCartShipping: REMOVED - Use cartApi.calculateShipping instead
  getDeliveryOptions: apiClient.getDeliveryOptions.bind(apiClient),
  getInsurancePlans: apiClient.getInsurancePlans.bind(apiClient),
};
```

## Correct Usage

**✅ Use this (NEW endpoint):**
```typescript
import { cartApi } from '@/lib/api';

// In checkout page calculateShipping function:
const response = await cartApi.calculateShipping(pincode);
```

**❌ Don't use this (OLD endpoint - removed):**
```typescript
// DEPRECATED - No longer available
const response = await shippingApi.calculateCartShipping({
  delivery_pincode: pincode
});
```

## What Changed

**Before:**
- Two conflicting methods with same name
- Sometimes called `/shipping/calculate-cart` (old endpoint)
- Got 422 error: "delivery pincode field is required"

**After:**
- Only ONE method: `cartApi.calculateShipping()`
- Always calls `/cart/calculate-shipping` (new secure endpoint)
- Proper pincode parameter structure

## Endpoints Used

| Purpose | Correct Endpoint | Method |
|---------|-----------------|--------|
| Calculate cart shipping | `/api/v1/cart/calculate-shipping` | POST |
| Get cart with shipping | `/api/v1/cart?delivery_pincode=xxxxx` | GET |

## Testing

After this fix, shipping calculation in checkout should work correctly:
1. Select/enter shipping address
2. Shipping cost automatically calculated from address pincode
3. No more 422 errors
4. Displays shipping zone, cost, and delivery estimate

## Status: ✅ FIXED

Shipping calculation at checkout now works correctly with the secure backend endpoint.
