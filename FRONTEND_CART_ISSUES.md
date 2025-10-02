# Frontend Cart & Checkout Issues

## Analysis Date: 2025-10-01

---

## 🚨 Critical Issues Found

### 1. **Cart Page: No Shipping Calculation**
**File:** `src/app/cart/page.tsx`

**Issues:**
- ❌ Line 339 & 367: Hardcoded `shippingCost: 0`
- ❌ No pincode input field
- ❌ No delivery pincode collection
- ❌ Shows "Free shipping" but doesn't use backend logic
- ❌ Not calling `/cart/calculate-shipping` API

**Current Code:**
```tsx
shippingCost: 0, // Free shipping shown in cart
```

**Problem:**
Cart always shows ₹0 shipping regardless of actual shipping cost based on zone.

---

### 2. **Checkout Page: Sends shipping_cost to Backend** ⚠️
**File:** `src/app/checkout/page.tsx`

**Issues:**
- ❌ Line 1072: Sends `shipping_cost: calculatedShippingCost` to backend
- ❌ Backend NOW REJECTS this parameter (security fix)
- ❌ Checkout will FAIL because backend validates without shipping_cost
- ❌ Uses old `/shipping/calculate-cart-shipping` endpoint

**Current Code (Line 1060-1077):**
```tsx
const orderData = await orderApi.createOrder({
  shipping_address_id: selectedShippingAddress?.id,
  billing_address_id: selectedBillingAddress?.id,
  // ... guest address handling ...
  payment_method: data.paymentMethod,
  subtotal: subtotal,
  shipping_cost: calculatedShippingCost,  // ❌ Backend rejects this now!
  tax_amount: tax,
  total_amount: total,
  notes: data.notes || '',
  coupon_code: activeCouponCode,
  coupon_discount: couponDiscount
});
```

---

### 3. **useCartSummary Hook: Ignores Shipping**
**File:** `src/hooks/useCartSummary.ts`

**Issues:**
- ❌ Doesn't include shipping_cost in calculation
- ❌ Line 31: `total = discountedSubtotal + tax` (missing shipping)
- ❌ Doesn't read `shipping_cost` from cart.summary

**Current Code:**
```tsx
const tax = summary.tax_amount || Math.round(discountedSubtotal * 0.18);
const total = summary.total || (discountedSubtotal + tax);  // ❌ No shipping!
```

---

### 4. **Wrong Shipping API Endpoint**
**File:** `src/app/checkout/page.tsx` Line 664

**Current:**
```tsx
const response = await shippingApi.calculateCartShipping({
  pickup_pincode: '110001',
  delivery_pincode: pincode,
  items: cart.items.map(/* ... */),
  order_value: cart.summary?.discounted_subtotal || 0
});
```

**Problem:**
- Uses `/shipping/calculate-cart-shipping` (wrong endpoint)
- Should use `/cart/calculate-shipping` (new endpoint we created)
- Returns different response structure

---

### 5. **No Pincode Input in Cart**
**File:** `src/app/cart/page.tsx`

**Missing:**
- No input field for delivery pincode
- No "Enter pincode to calculate shipping" prompt
- No way to calculate shipping before checkout

---

### 6. **Cart Store: Doesn't Support Pincode**
**File:** `src/stores/cart.ts`

**Issues:**
- `getCart()` doesn't accept or send `delivery_pincode` parameter
- Cart API called without pincode: `GET /cart`
- Should call: `GET /cart?delivery_pincode=411001`

---

## 📊 Current vs Required Behavior

### Cart Page

**Current:**
```
Subtotal: ₹399
Discount: -₹50
Tax: ₹62.82
Shipping: ₹0 (hardcoded)
Total: ₹411.82
```

**Required:**
```
Subtotal: ₹399
Discount: -₹50
Tax: ₹62.82

[Enter Pincode] [___] [Calculate]

Shipping: Calculating...
OR
Shipping: ₹50 (Zone B - Same State)
Free shipping at ₹699

Total: ₹461.82
```

---

### Checkout Page

**Current Submission:**
```javascript
{
  shipping_address_id: 1,
  payment_method: "cod",
  shipping_cost: 50  // ❌ Sent but REJECTED by backend
}
```

**Required Submission:**
```javascript
{
  shipping_address_id: 1,
  payment_method: "cod"
  // ✅ NO shipping_cost - backend calculates from address
}
```

---

## 🔧 Required Fixes

### Fix 1: Update Cart Page
**File:** `src/app/cart/page.tsx`

**Add:**
1. State for delivery pincode
2. Pincode input field
3. "Calculate Shipping" button
4. Call `/cart/calculate-shipping` API
5. Display shipping details (zone, cost, free shipping info)
6. Use `cart.summary.shipping_cost` instead of hardcoded 0

**Changes:**
```tsx
const [deliveryPincode, setDeliveryPincode] = useState('');
const [calculatingShipping, setCalculatingShipping] = useState(false);

const handleCalculateShipping = async () => {
  if (deliveryPincode.length !== 6) {
    toast.error('Please enter a valid 6-digit pincode');
    return;
  }

  try {
    setCalculatingShipping(true);
    await cartStore.calculateShipping(deliveryPincode);
    toast.success('Shipping calculated');
  } catch (error) {
    toast.error('Failed to calculate shipping');
  } finally {
    setCalculatingShipping(false);
  }
};

// In OrderSummaryCard props:
shippingCost: cartSummary.shippingCost || 0,
shippingDetails: cart?.summary?.shipping_details,
requiresPincode: cart?.summary?.requires_pincode
```

---

### Fix 2: Update Cart Store
**File:** `src/stores/cart.ts`

**Add:**
```tsx
interface CartState {
  // ... existing
  deliveryPincode: string | null;
  calculateShipping: (pincode: string) => Promise<void>;
  setDeliveryPincode: (pincode: string) => void;
}

// In store implementation:
deliveryPincode: null,

calculateShipping: async (pincode: string) => {
  try {
    set({ isLoading: true });
    const response = await cartApi.calculateShipping(pincode);

    // Refresh cart with new shipping
    await get().getCart();

    set({ deliveryPincode: pincode, isLoading: false });
  } catch (error) {
    console.error('Failed to calculate shipping:', error);
    set({ isLoading: false });
    throw error;
  }
},

getCart: async () => {
  const pincode = get().deliveryPincode;
  const url = pincode ? `/cart?delivery_pincode=${pincode}` : '/cart';
  const response = await cartApi.getCart(url);  // Pass pincode if available
  // ... rest of logic
}
```

---

### Fix 3: Update API Client
**File:** `src/lib/api.ts`

**Add to cartApi:**
```tsx
export const cartApi = {
  // ... existing methods
  calculateShipping: async (pincode: string, pickupPincode?: string) => {
    return apiClient.post('/cart/calculate-shipping', {
      delivery_pincode: pincode,
      pickup_pincode: pickupPincode
    });
  },
};
```

---

### Fix 4: Fix Checkout Page
**File:** `src/app/checkout/page.tsx`

**Remove shipping_cost from order submission:**
```tsx
// Line 1060-1077 - REMOVE shipping_cost
const orderData = await orderApi.createOrder({
  shipping_address_id: selectedShippingAddress?.id,
  billing_address_id: selectedBillingAddress?.id,
  // ... guest addresses ...
  payment_method: data.paymentMethod,
  // REMOVED: shipping_cost: calculatedShippingCost,  ❌
  notes: data.notes || '',
  // Backend calculates shipping from address automatically ✅
});
```

**Update calculateShipping to use new endpoint:**
```tsx
const calculateShipping = async (pincode: string) => {
  if (!cart || !pincode || pincode.length !== 6) return;

  try {
    setCalculatingShipping(true);

    // Use NEW cart/calculate-shipping endpoint
    const response = await cartApi.calculateShipping(pincode);

    if (response.success && response.summary) {
      const summary = response.summary;
      setShippingCost(summary.shipping_cost || 0);

      if (summary.shipping_details) {
        setEstimatedDelivery(summary.shipping_details.delivery_estimate || '3-5 business days');
        setCodAvailable(true);
      }
    }
  } catch (error: any) {
    console.error('Failed to calculate shipping:', error);
    toast.error('Failed to calculate shipping cost');
  } finally {
    setCalculatingShipping(false);
  }
};
```

---

### Fix 5: Update useCartSummary Hook
**File:** `src/hooks/useCartSummary.ts`

**Add shipping to calculation:**
```tsx
const summary = (cart as any)?.summary || {};

const subtotal = summary.subtotal || cart.subtotal || 0;
const couponDiscount = summary.coupon_discount || 0;
const bundleDiscount = summary.bundle_discount || 0;
const totalDiscount = summary.total_discount || Math.max(couponDiscount, bundleDiscount);
const discountedSubtotal = summary.discounted_subtotal || Math.max(0, subtotal - totalDiscount);
const shippingCost = summary.shipping_cost || 0;  // ✅ Add shipping
const tax = summary.tax_amount || Math.round(discountedSubtotal * 0.18);
const total = summary.total || (discountedSubtotal + tax + shippingCost);  // ✅ Include shipping

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
  shippingCost,  // ✅ Add to return
  shippingDetails: summary.shipping_details || null,  // ✅ Add details
  tax,
  total,
  currencySymbol,
  requiresPincode: summary.requires_pincode || false,  // ✅ Add flag
};
```

---

## 🎨 UI Components Needed

### 1. Pincode Input Component (Cart Page)
```tsx
{cartSummary.requiresPincode && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm text-blue-900 mb-2">
      Enter delivery pincode to calculate shipping
    </p>
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter 6-digit pincode"
        maxLength={6}
        value={deliveryPincode}
        onChange={(e) => setDeliveryPincode(e.target.value)}
        className="flex-1"
      />
      <Button
        onClick={handleCalculateShipping}
        disabled={calculatingShipping || deliveryPincode.length !== 6}
      >
        {calculatingShipping ? <Loader2 className="animate-spin" /> : 'Calculate'}
      </Button>
    </div>
  </div>
)}
```

### 2. Shipping Details Display
```tsx
{cartSummary.shippingDetails && (
  <div className="border-t pt-2 space-y-1 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Zone:</span>
      <span>{cartSummary.shippingDetails.zone_name}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Shipping:</span>
      <span>{cartSummary.currencySymbol}{cartSummary.shippingCost}</span>
    </div>
    {cartSummary.shippingDetails.free_shipping_enabled && (
      <div className="text-xs text-green-600">
        Free shipping at {cartSummary.currencySymbol}{cartSummary.shippingDetails.free_shipping_threshold}
      </div>
    )}
  </div>
)}
```

---

## 🧪 Testing Checklist

- [ ] Cart shows "Enter pincode" prompt initially
- [ ] Pincode input accepts 6 digits only
- [ ] Calculate button calls `/cart/calculate-shipping` API
- [ ] Cart displays zone-based shipping cost
- [ ] Free shipping info shown when enabled
- [ ] Checkout doesn't send `shipping_cost` parameter
- [ ] Checkout succeeds with valid address
- [ ] Backend calculates shipping from address
- [ ] Order total matches cart total
- [ ] Zone A/B/C/D calculation working

---

## 📦 Files to Modify

1. ✅ `src/app/cart/page.tsx` - Add pincode input, calculate shipping
2. ✅ `src/stores/cart.ts` - Add calculateShipping action
3. ✅ `src/hooks/useCartSummary.ts` - Include shipping in total
4. ✅ `src/lib/api.ts` - Add calculateShipping to cartApi
5. ✅ `src/app/checkout/page.tsx` - Remove shipping_cost from order, fix endpoint
6. ❓ `src/components/cart/OrderSummaryCard.tsx` - May need shipping details display

---

## 🔒 Security Notes

**CRITICAL:**
- Frontend MUST NOT send `shipping_cost` to `/orders` endpoint
- Backend ALWAYS calculates shipping from delivery address
- Users CANNOT manipulate shipping cost anymore
- Shipping cost is server-side calculated, client-side displayed

---

## 📝 Summary

**Issues Found:** 6 critical issues
**Files Affected:** 5 files
**Breaking Change:** Checkout will FAIL until `shipping_cost` parameter removed
**Priority:** URGENT - checkout is currently broken!

**Next Steps:**
1. Fix checkout page (remove shipping_cost) - URGENT
2. Update cart store (add calculateShipping)
3. Add pincode input to cart page
4. Update useCartSummary hook
5. Update API client
6. Test end-to-end flow
