# Frontend Image Loading Fix for Production

## Issue Found

**Problem:** Product detail page images getting 400 Bad Request error in production, but homepage images work fine.

**Root Cause:** Next.js Image Optimizer was blocking images from `v2s.bookbharat.com` because the domain wasn't in the `remotePatterns` configuration.

## Files Fixed

### 1. ✅ `next.config.ts`

**Added production backend domain:**

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    // Production Backend - ADDED
    {
      protocol: 'https',
      hostname: 'v2s.bookbharat.com',
      pathname: '/**',
    },
    // ... other domains ...
  ],
},
```

### 2. ✅ `src/components/product/ProductImageGallery.tsx`

**Improved image URL handling with better comments:**

```typescript
const getImageUrl = useCallback((image: ProductImage, index: number = 0) => {
  if (!image) return '/book-placeholder.svg';

  // Priority order: url > image_url > construct from image_path
  if (image.url) return image.url;
  if (image.image_url) return image.image_url;  // ✅ Backend provides full URL
  
  // Fallback: construct URL from image_path (should rarely be needed)
  if (image.image_path) {
    if (image.image_path.startsWith('http')) {
      return image.image_path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${image.image_path}`;
  }

  return '/book-placeholder.svg';
}, []);
```

## Why Homepage Works But Product Detail Didn't

### Homepage Product Cards
- Uses **first image only** (`product.images[0].image_url`)
- Simpler rendering
- Might use placeholder or smaller images

### Product Detail Page
- Uses **ProductImageGallery** component
- Loads **ALL product images** for gallery
- Uses **Next.js Image component** with optimizer
- **Requires domain in `remotePatterns`** ⚠️

## Deployment Instructions

### For Production Frontend (v2.bookbharat.com)

**1. Update Environment Variables (if needed):**

Create or update `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://v2s.bookbharat.com/api/v1
```

**2. Rebuild the Frontend:**

```bash
cd /path/to/bookbharat-frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# The build will use the updated next.config.ts
```

**3. Deploy Updated Files:**

Upload to production:
- `next.config.ts` ✅ (has v2s.bookbharat.com in remotePatterns)
- `src/components/product/ProductImageGallery.tsx` ✅ (improved logic)
- Build output (`.next/` or `build/` folder)

**4. Restart/Redeploy:**

```bash
# If using PM2
pm2 restart frontend

# If using Docker
docker-compose restart frontend

# If using systemd
sudo systemctl restart bookbharat-frontend

# If on Vercel/similar
# Push to git, auto-deploy will trigger
```

## Verification

### Test 1: Check Next.js Image Domains

In browser console on `https://v2.bookbharat.com`:
```javascript
// Check if images load correctly
const testImageUrl = 'https://v2s.bookbharat.com/storage/products/test.png';
console.log('Testing image URL:', testImageUrl);

// Next.js Image Optimizer URL
const optimizerUrl = `/_next/image?url=${encodeURIComponent(testImageUrl)}&w=1920&q=75`;
console.log('Optimizer URL:', optimizerUrl);

fetch(optimizerUrl)
  .then(r => {
    console.log('✓ Status:', r.status);
    if (r.status === 200) {
      console.log('✓ Image loads successfully!');
    } else if (r.status === 400) {
      console.log('✗ 400 Error - Domain not in remotePatterns or image not found');
    }
  });
```

### Test 2: Check Product Detail Page

1. Go to: `https://v2.bookbharat.com/products/1`
2. Open browser DevTools (Network tab)
3. Filter by "Img"
4. Should see images loading from:
   - `/_next/image?url=https%3A%2F%2Fv2s.bookbharat.com%2Fstorage%2F...`
5. All should show `200 OK` status

### Test 3: Console Errors

Open browser console on product page:
```javascript
// Should not see errors like:
// ✗ 400 (Bad Request)
// ✗ Failed to load resource
// ✗ CORS policy error

// Should see:
// ✓ All images loaded
```

## Configuration Reference

### Next.js Image Domains (Production)

```typescript
remotePatterns: [
  // ✅ Production Backend (for product images)
  {
    protocol: 'https',
    hostname: 'v2s.bookbharat.com',
    pathname: '/**',
  },
  // ✅ External Image Services
  {
    protocol: 'https',
    hostname: 'picsum.photos',
    pathname: '/**',
  },
]
```

### API Response Format

Backend returns images with `image_url` already populated:

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Product Name",
      "images": [
        {
          "id": 1,
          "image_path": "products/image.png",
          "image_url": "https://v2s.bookbharat.com/storage/products/image.png",
          "alt_text": "Product image",
          "is_primary": true
        }
      ]
    }
  }
}
```

### Frontend Usage

```typescript
// ✅ ProductImageGallery automatically uses image_url
<ProductImageGallery 
  images={product.images} 
  productName={product.name} 
/>

// ✅ Product Card automatically uses image_url
<Image src={product.images[0].image_url} alt={product.name} />
```

## Common Errors & Solutions

### Error: "400 Bad Request" on `/_next/image?url=...`

**Cause:** Domain not in Next.js `remotePatterns`

**Solution:** Add domain to `next.config.ts` and rebuild

### Error: "Invalid src prop"

**Cause:** Image URL is malformed or undefined

**Solution:** Check backend API response includes `image_url` field

### Error: "CORS policy" on image requests

**Cause:** Backend not sending CORS headers for static files

**Solution:** 
- ✅ Backend `.htaccess` configured (already done)
- ✅ Backend CORS middleware updated (already done)

## Expected Results After Fix

### Before Fix
```
❌ https://v2.bookbharat.com/_next/image?url=...
    Status: 400 (Bad Request)
    Error: Invalid image domain
```

### After Fix
```
✅ https://v2.bookbharat.com/_next/image?url=https%3A%2F%2Fv2s.bookbharat.com%2Fstorage%2Fproducts%2Fimage.png&w=1920&q=75
    Status: 200 OK
    Image displays correctly
```

## Summary

✅ **next.config.ts** - Added `v2s.bookbharat.com` to remotePatterns  
✅ **ProductImageGallery** - Improved URL handling logic  
✅ **Backend** - Image URLs generate correctly  
✅ **CORS** - Headers configured for all requests

**Next Step:** Rebuild and redeploy frontend with updated configuration! 🚀

