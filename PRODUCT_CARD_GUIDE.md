# Product Card Display - Single Source of Truth

This guide explains the consistent ProductCard display pattern used across the BookBharat frontend application.

## Overview

All product cards across the application use a centralized configuration system to ensure visual consistency and maintainability. This eliminates prop duplication and ensures a uniform user experience.

## Configuration File

**Location**: `src/lib/product-card-config.ts`

This file contains:
- `PRODUCT_CARD_CONFIGS`: Predefined configurations for different contexts
- `PRODUCT_GRID_CONFIGS`: Consistent grid layouts
- Helper functions to get the appropriate configuration

## Usage

### 1. Import the Helpers

```typescript
import { getProductCardProps, getProductGridClasses } from '@/lib/product-card-config';
```

### 2. Add Mobile Detection (if needed)

```typescript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

### 3. Use in JSX

#### Grid Layout:
```tsx
<div className={getProductGridClasses('homepageFeatured')}>
  {products.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      {...getProductCardProps('homepageFeatured', isMobile)}
    />
  ))}
</div>
```

#### With View Mode Toggle:
```tsx
<div className={viewMode === 'grid' ? getProductGridClasses('searchResults') : 'space-y-4'}>
  {products.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
      {...getProductCardProps(viewMode === 'grid' ? 'searchGrid' : 'searchList', isMobile)}
      className={viewMode === 'list' ? 'flex' : ''}
    />
  ))}
</div>
```

## Available Configurations

### Product Card Configs

| Context | Usage | Mobile Optimized |
|---------|-------|------------------|
| `homepageFeatured` | Homepage featured products section | ✅ Yes |
| `categorySection` | Category product sections | ✅ Yes |
| `productListGrid` | Products page - grid view | ✅ Yes |
| `productListList` | Products page - list view | ❌ No |
| `searchGrid` | Search results - grid view | ✅ Yes |
| `searchList` | Search results - list view | ❌ No |
| `relatedProducts` | Related products section | ✅ Yes |
| `wishlist` | Wishlist page | ❌ No |

### Grid Configs

| Context | Columns (Mobile → Desktop) |
|---------|----------------------------|
| `homepageFeatured` | 2 → 3 → 4 → 6 |
| `categorySection` | 2 → 3 → 4 → 5 |
| `productListing` | 2 → 3 → 4 |
| `searchResults` | 2 → 3 → 4 |
| `relatedProducts` | 2 → 3 → 4 → 5 |
| `wishlist` | 2 → 3 → 4 |

## Configuration Details

### Homepage Featured
- **Variant**: Minimal on mobile, Compact on desktop
- **Shows**: Discount, Add to Cart, Buy Now
- **Hides on mobile**: Author, Rating, Wishlist
- **Grid**: 2 cols mobile → 6 cols desktop

### Category Sections
- **Variant**: Minimal on mobile, Compact on desktop
- **Shows**: Discount, Add to Cart, Buy Now
- **Hides on mobile**: Author, Rating, Wishlist
- **Hides always**: Category (shown in section header)
- **Grid**: 2 cols mobile → 5 cols desktop

### Product Listing - Grid
- **Variant**: Default
- **Shows**: Everything (Category, Author, Rating, Discount, Wishlist, Add to Cart)
- **Hides on mobile**: Quick View, Buy Now
- **Grid**: 2 cols mobile → 4 cols desktop

### Product Listing - List
- **Variant**: Compact
- **Shows**: Everything
- **Layout**: Vertical stack with spacing

### Search Results - Grid
- Same as Product Listing Grid

### Search Results - List
- Same as Product Listing List

### Related Products
- **Variant**: Compact
- **Shows**: Discount, Add to Cart
- **Hides on mobile**: Author, Rating, Wishlist
- **Hides always**: Category, Quick View, Buy Now
- **Grid**: 2 cols mobile → 5 cols desktop

## Benefits

✅ **Consistency**: Same props across all pages
✅ **Maintainability**: Change once, update everywhere
✅ **Mobile Optimization**: Built-in responsive behavior
✅ **Type Safety**: TypeScript configs prevent errors
✅ **Less Code**: No prop duplication
✅ **Easy Updates**: Add new contexts in one place

## Example Migration

### Before (❌ Inconsistent):
```tsx
<ProductCard
  key={book.id}
  product={book}
  variant={isMobile ? "minimal" : "compact"}
  showCategory={false}
  showAuthor={!isMobile}
  showRating={!isMobile}
  showDiscount={true}
  showWishlist={!isMobile}
  showAddToCart={true}
  showBuyNow={true}
/>
```

### After (✅ Consistent):
```tsx
<ProductCard
  key={book.id}
  product={book}
  {...getProductCardProps('homepageFeatured', isMobile)}
/>
```

## Adding New Contexts

To add a new product card context:

1. Open `src/lib/product-card-config.ts`
2. Add to `PRODUCT_CARD_CONFIGS`:
```typescript
newContext: (isMobile: boolean): ProductCardConfig => ({
  variant: 'default',
  showCategory: true,
  showAuthor: true,
  showRating: true,
  showDiscount: true,
  showWishlist: !isMobile,
  showQuickView: false,
  showAddToCart: true,
  showBuyNow: !isMobile,
}),
```
3. Add to `PRODUCT_GRID_CONFIGS` if needed:
```typescript
newContext: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3',
```
4. Use in your component:
```typescript
{...getProductCardProps('newContext', isMobile)}
```

## Files Updated

The following files now use the centralized configuration:

- ✅ `src/app/page.tsx` - Homepage featured products
- ✅ `src/components/CategoryProductSection.tsx` - Category sections
- ✅ `src/app/products/page.tsx` - Products listing page
- ✅ `src/app/search/page.tsx` - Search results page

## Notes

- Mobile breakpoint is `768px` (md in Tailwind)
- Configs that take `isMobile` parameter can have different behavior for mobile
- Grid configs use Tailwind responsive classes
- All configurations are type-safe with TypeScript
