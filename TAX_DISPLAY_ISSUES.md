# Tax Display Issues Found

**Date**: 2025-10-26  
**Issue**: Hardcoded "Tax (GST 18%)" labels in frontend

---

## Issues Found

### 1. OrderSummaryCard.tsx (Line 514)
**Issue**: Hardcoded "Tax (GST 18%)" label  
**Fix**: Use `taxesBreakdown` from API when available

### 2. MobileSummary.tsx (Line 190)
**Issue**: Hardcoded "GST (18%)" label  
**Fix**: Use dynamic tax label

### 3. cart/mobile-page.tsx (Line 128, 350)
**Issue**: Hardcoded `tax = subtotal * 0.18` calculation  
**Fix**: Use tax_amount from cart summary

### 4. cart/page-mobile-redesign.tsx (Line 217)
**Issue**: Hardcoded "Tax (18%)" label  
**Fix**: Use dynamic tax label

### 5. cart/page.tsx (Line 659)
**Issue**: Hardcoded "Tax (GST 18%)" label  
**Fix**: Use dynamic tax label

---

## Impact

**User sees incorrect tax labels** even though backend is calculating dynamic taxes correctly.

---

## Fix Strategy

1. Check if `taxesBreakdown` exists in cart summary
2. If yes, display individual taxes from breakdown
3. If no, display generic "Tax" label without hardcoded rate
4. Remove all hardcoded tax calculations

