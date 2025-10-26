# SEO Testing & Validation Guide

## Pre-Deployment Testing (Local)

### Test 1: Product Metadata Generation

**Run development server:**
```bash
npm run dev
```

**Test URL:** http://localhost:3000/products/1

**View Page Source (Ctrl+U)** and verify:

```html
<!-- Should see product-specific title -->
<title>Product Name by Author Name | BookBharat</title>

<!-- Should see product description -->
<meta name="description" content="Buy Product Name by Author...">

<!-- Should see Open Graph tags -->
<meta property="og:title" content="Product Name">
<meta property="og:image" content="https://...">
<meta property="og:type" content="website">

<!-- Should see Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
```

### Test 2: Book Structured Data

**In page source, look for:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "Product Name",
  "isbn": "978-...",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher Name"
  },
  "offers": {
    "@type": "Offer",
    "price": "299.00",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": 125
  }
}
</script>
```

### Test 3: Breadcrumb Schema

**Look for breadcrumb JSON-LD:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://v2.bookbharat.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category Name",
      "item": "https://v2.bookbharat.com/categories/..."
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Product Name"
    }
  ]
}
</script>
```

### Test 4: Organization & WebSite Schema

**On any page, check for:**
```html
<script id="organization-schema" type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "BookBharat",
  "url": "https://v2.bookbharat.com"
}
</script>

<script id="website-schema" type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://v2.bookbharat.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://v2.bookbharat.com/search?q={search_term_string}"
  }
}
</script>
```

### Test 5: Sitemaps

**Test locally:**
```bash
# Main sitemap
curl http://localhost:3000/sitemap.xml

# Product sitemap
curl http://localhost:3000/product-sitemap.xml

# Category sitemap
curl http://localhost:3000/category-sitemap.xml
```

**Expected:** Valid XML with URLs listed

### Test 6: robots.txt

```bash
curl http://localhost:3000/robots.txt
```

**Expected:**
```
User-agent: *
Allow: /
Disallow: /cart
...
Sitemap: https://v2.bookbharat.com/sitemap.xml
```

---

## Post-Deployment Testing (Production)

### Test 1: Google Rich Results Test

**URL:** https://search.google.com/test/rich-results

**Steps:**
1. Enter: `https://v2.bookbharat.com/products/1`
2. Click "Test URL"
3. Wait for results

**Expected Results:**
```
✅ Book - Valid
✅ Offer - Valid
✅ AggregateRating - Valid
✅ BreadcrumbList - Valid
✅ No errors
```

**Warnings OK:**
- Missing optional fields (fine)
- Image size recommendations (optional)

**Errors to Fix:**
- Missing required fields
- Invalid schema syntax
- Incorrect data types

### Test 2: Schema.org Validator

**URL:** https://validator.schema.org/

**Steps:**
1. Go to product page: https://v2.bookbharat.com/products/1
2. Copy entire page HTML (Ctrl+U, Ctrl+A, Ctrl+C)
3. Paste into validator
4. Click "Validate"

**Expected:**
```
✅ All schemas valid
✅ No errors
✅ Proper nesting
```

### Test 3: Google Search Console

**URL:** https://search.google.com/search-console

#### A. Submit Sitemaps

**Steps:**
1. Go to Sitemaps section
2. Add new sitemap:
   - `sitemap.xml`
   - `product-sitemap.xml`
   - `category-sitemap.xml`
3. Click "Submit"
4. Wait for processing (few hours to few days)

**Expected Status:**
```
✅ Success
Discovered URLs: XXX
```

#### B. Check Coverage

**Steps:**
1. Go to Coverage/Pages section
2. Check indexed pages
3. Monitor for errors

**Expected:**
- Most product pages indexed
- Few errors or warnings
- Increasing coverage over time

#### C. Check Products Enhancement

**Steps:**
1. Go to Enhancements > Products
2. Wait 3-7 days after deployment
3. Check valid/invalid items

**Expected:**
```
Valid items: XXX products
Invalid items: 0 (or minimal)
```

### Test 4: URL Inspection Tool

**Steps:**
1. In Search Console, use URL Inspection
2. Enter: `https://v2.bookbharat.com/products/1`
3. Check "Live Test"

**Expected:**
```
✅ Page is indexable
✅ Page has valid structured data
✅ No errors
```

**Then:**
- Click "Request Indexing"
- Repeat for 5-10 important products

### Test 5: Lighthouse SEO Audit

**Run Lighthouse:**
```bash
npx lighthouse https://v2.bookbharat.com/products/1 --only-categories=seo --output html --output-path=./seo-report.html
```

**Expected Score:** 95-100

**Check for:**
- ✅ Document has a meta description
- ✅ Document has a title element
- ✅ Links are crawlable
- ✅ Page has successful HTTP status code
- ✅ robots.txt is valid
- ✅ Image elements have alt attributes
- ✅ Document has a valid hreflang
- ✅ Page has valid structured data

### Test 6: Social Media Sharing

**Facebook Debugger:**
```
URL: https://developers.facebook.com/tools/debug/
Test: https://v2.bookbharat.com/products/1
```

**Expected:**
- Product image shows
- Title and description correct
- No errors or warnings

**Twitter Card Validator:**
```
URL: https://cards-dev.twitter.com/validator
Test: https://v2.bookbharat.com/products/1
```

**Expected:**
- Card preview shows correctly
- Image, title, description present

---

## Manual Testing Checklist

### Product Pages

**Test Multiple Products:**
- [ ] Product 1: `/products/1`
- [ ] Product 2: `/products/2`
- [ ] Product 3: `/products/3`
- [ ] Product with slug: `/products/product-slug`

**For Each Product, Verify:**
- [ ] Unique title in browser tab
- [ ] Unique meta description in source
- [ ] Book schema present
- [ ] Breadcrumb schema present
- [ ] Product image URL correct
- [ ] Rating/reviews if applicable
- [ ] ISBN if available
- [ ] Author/publisher if available

### Category Pages

**Test Categories:**
- [ ] Category 1: `/categories/1`
- [ ] Category 2: `/categories/2`

**Verify:**
- [ ] Unique title for each category
- [ ] Category-specific description
- [ ] Proper Open Graph tags
- [ ] Canonical URL correct

### Sitemaps

- [ ] `/sitemap.xml` - Returns valid XML
- [ ] `/product-sitemap.xml` - Lists products
- [ ] `/category-sitemap.xml` - Lists categories
- [ ] All sitemaps have proper lastmod dates
- [ ] Image URLs included in product sitemap

### Static Files

- [ ] `/robots.txt` - Accessible and correct
- [ ] Sitemap references in robots.txt
- [ ] Proper allow/disallow rules

---

## Automated Testing Script

Create `test-seo.js`:

```javascript
const urls = [
  'https://v2.bookbharat.com/products/1',
  'https://v2.bookbharat.com/products/2',
  'https://v2.bookbharat.com/categories/1',
  'https://v2.bookbharat.com/sitemap.xml',
  'https://v2.bookbharat.com/robots.txt',
];

async function testSEO(url) {
  console.log(`\nTesting: ${url}`);
  
  const response = await fetch(url);
  const html = await response.text();
  
  // Check for metadata
  const hasTitle = html.includes('<title>');
  const hasDescription = html.includes('meta name="description"');
  const hasOG = html.includes('og:title');
  const hasSchema = html.includes('application/ld+json');
  
  console.log(`  Title: ${hasTitle ? '✅' : '❌'}`);
  console.log(`  Description: ${hasDescription ? '✅' : '❌'}`);
  console.log(`  Open Graph: ${hasOG ? '✅' : '❌'}`);
  console.log(`  Structured Data: ${hasSchema ? '✅' : '❌'}`);
  
  // Extract title
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  if (titleMatch) {
    console.log(`  Title: "${titleMatch[1]}"`);
  }
}

Promise.all(urls.map(testSEO))
  .then(() => console.log('\n✅ All tests complete'))
  .catch(err => console.error('❌ Error:', err));
```

**Run:**
```bash
node test-seo.js
```

---

## Monitoring After Deployment

### Week 1: Initial Verification

**Daily Checks:**
1. Google Search Console - Check for crawl errors
2. Rich Results Test - Validate random products
3. Sitemap status - Ensure processing

**Actions:**
- Fix any validation errors immediately
- Request indexing for key pages
- Monitor server logs for sitemap requests

### Week 2-4: Performance Monitoring

**Weekly Checks:**
1. Search Console > Performance
   - Impressions trend
   - Click trend
   - Average CTR
   - Average position

2. Search Console > Enhancements > Products
   - Valid items count
   - Invalid items (fix these)
   - Warnings (review and fix)

3. Coverage Report
   - Total indexed pages
   - Pages with errors
   - Excluded pages

**Actions:**
- Optimize pages with warnings
- Fix any structured data errors
- Monitor indexing progress

### Month 2-3: Results Analysis

**Monthly Review:**
1. Organic traffic comparison (vs previous month)
2. Top performing products in search
3. Keywords driving traffic
4. CTR improvements
5. Rich snippet appearance rate

**Expected Improvements:**
- 50-100% increase in impressions
- 30-50% increase in clicks
- CTR improvement from 1-2% to 3-5%
- 70-80% products showing rich snippets

---

## Troubleshooting Common Issues

### Issue: Metadata Not Showing in Google

**Diagnosis:**
```bash
# Check if metadata is in HTML
curl https://v2.bookbharat.com/products/1 | grep "<title>"
```

**If missing:**
1. Check server logs for errors
2. Ensure build completed successfully
3. Clear Next.js cache and rebuild
4. Verify API endpoints accessible from server

**If present but Google not showing:**
1. Wait 1-2 weeks for recrawl
2. Request indexing via Search Console
3. Check robots.txt not blocking
4. Verify no noindex meta tag

### Issue: Structured Data Not Detected

**Diagnosis:**
1. View page source
2. Search for `application/ld+json`
3. Copy JSON content
4. Validate at https://jsonlint.com/

**Common Errors:**
- Invalid JSON syntax (trailing commas)
- Missing required fields
- Incorrect data types (string vs number)
- Invalid schema URLs

**Fix:**
1. Run Rich Results Test
2. Note specific errors
3. Fix in schema generation code
4. Redeploy and test again

### Issue: Sitemap Not Loading

**Test:**
```bash
curl https://v2.bookbharat.com/product-sitemap.xml
```

**If 404:**
1. Check route file exists: `src/app/product-sitemap.xml/route.ts`
2. Rebuild application
3. Check server logs

**If 500 error:**
1. Check API is accessible from server
2. Verify API returns valid data
3. Check server logs for error details
4. Test API endpoint directly

### Issue: Products Not in Google Search

**Timeline:**
- Week 1: Google discovers via sitemap
- Week 2: Starts crawling
- Week 3-4: Pages indexed
- Month 2-3: Rich snippets appear

**If still not showing after 4 weeks:**
1. Check Search Console coverage
2. Verify pages are indexable
3. Check for manual actions
4. Ensure no duplicate content issues
5. Verify robots.txt not blocking

---

## Google Tools Checklist

### Google Search Console

**Setup:**
- [ ] Property verified
- [ ] All sitemaps submitted
- [ ] Key pages indexed via URL Inspection
- [ ] No critical errors

**Monitor:**
- [ ] Coverage report (weekly)
- [ ] Performance metrics (weekly)
- [ ] Products enhancement (weekly)
- [ ] Mobile usability (monthly)

### Google Rich Results Test

**Test URLs:**
- [ ] https://v2.bookbharat.com/products/1
- [ ] https://v2.bookbharat.com/products/2
- [ ] https://v2.bookbharat.com/categories/1

**Expected:** All valid, no errors

### Google Analytics (Optional)

**Track:**
- Organic traffic trend
- Landing pages performance
- User behavior on product pages
- Conversion rates from organic

---

## Success Criteria

### Week 1 ✅
- [ ] All sitemaps submitted
- [ ] No errors in Rich Results Test
- [ ] Metadata visible in page source
- [ ] Structured data valid

### Week 2-4 ✅
- [ ] Products appearing in Search Console
- [ ] Coverage increasing
- [ ] Some rich snippets appearing
- [ ] No major validation errors

### Month 2-3 ✅
- [ ] 50%+ increase in organic traffic
- [ ] 70%+ products with rich snippets
- [ ] Improved average position
- [ ] Higher CTR (3-5%)
- [ ] More product page visits

---

## Testing Tools Reference

### 1. Google Rich Results Test
```
https://search.google.com/test/rich-results
```
Use for: Validating structured data

### 2. Schema.org Validator
```
https://validator.schema.org/
```
Use for: Comprehensive schema validation

### 3. Google Search Console
```
https://search.google.com/search-console
```
Use for: Monitoring indexing and performance

### 4. Lighthouse
```bash
npx lighthouse [URL] --only-categories=seo
```
Use for: SEO audit score

### 5. Facebook Debugger
```
https://developers.facebook.com/tools/debug/
```
Use for: Open Graph validation

### 6. Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```
Use for: Twitter card validation

### 7. JSON-LD Validator
```
https://jsonlint.com/
```
Use for: JSON syntax validation

---

## Quick Test Commands

### Test All Sitemaps
```bash
curl https://v2.bookbharat.com/sitemap.xml
curl https://v2.bookbharat.com/product-sitemap.xml
curl https://v2.bookbharat.com/category-sitemap.xml
curl https://v2.bookbharat.com/product-feed.xml
```

### Test robots.txt
```bash
curl https://v2.bookbharat.com/robots.txt
```

### Extract Structured Data
```bash
# Get all JSON-LD from a page
curl https://v2.bookbharat.com/products/1 | grep -A 50 "application/ld+json"
```

### Test Metadata
```bash
# Get title
curl -s https://v2.bookbharat.com/products/1 | grep -o "<title>.*</title>"

# Get meta description
curl -s https://v2.bookbharat.com/products/1 | grep "meta name=\"description\""
```

---

## Documentation

All SEO implementation details in:
- `SEO_GAPS_ANALYSIS.md` - What was missing
- `SEO_IMPLEMENTATION_PLAN.md` - How to implement
- `SEO_IMPLEMENTATION_COMPLETE.md` - What was done
- `SEO_DEPLOYMENT_CHECKLIST.md` - Deploy steps
- `SEO_TESTING_GUIDE.md` - This file

---

## Support

If you encounter issues:
1. Check server/application logs
2. Test with validation tools
3. Review Google Search Console errors
4. Verify all files deployed correctly
5. Ensure API endpoints working

**All SEO features are now implemented and ready for testing!** 🎯




