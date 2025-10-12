# Hero Section Compact Design Guide

## Design Principles for All 9 Variants

### General Rules
1. **Vertical Padding**: `py-4 sm:py-6 md:py-8` (max 32px mobile, 48px desktop)
2. **Container**: `max-w-7xl mx-auto px-4 sm:px-6`
3. **Typography Sizes**:
   - H1: `text-2xl sm:text-3xl md:text-4xl` (max)
   - H2: `text-xl sm:text-2xl md:text-3xl`
   - Body: `text-sm md:text-base`
   - Small: `text-xs`
4. **Spacing**: `space-y-3 md:space-y-4` (max)
5. **Grid Gaps**: `gap-4 md:gap-6` (max)
6. **Buttons**: Standard size, `px-5 py-2 text-sm`
7. **No Full-Screen Heights**: Use `min-h-[50vh] md:min-h-[60vh]` max

### Variant-Specific Compact Patterns

#### 1. **minimal-product**
```tsx
- Grid: md:grid-cols-5 (3 cols content, 2 cols image)
- Padding: py-4 sm:py-6 md:py-8
- Background: Clean white with subtle gradient
- Image: aspect-square in gray-50 container
- Badges: Simple checkmark list
```

#### 2. **lifestyle-storytelling**  
```tsx
- Height: min-h-[50vh] md:min-h-[60vh]
- Padding: py-8 md:py-12
- Grid: md:grid-cols-2 with compact spacing
- Remove excessive particles (keep 15 max)
- Title: text-3xl md:text-4xl (not 7xl)
- Button: Standard size, not oversized
```

#### 3. **interactive-promotional**
```tsx
- Height: min-h-[50vh] md:min-h-[60vh]  
- Padding: py-8 md:py-12
- Reduce particles from 100 to 30
- Grid: grid-cols-2 md:grid-cols-4 for products
- Title: text-3xl md:text-5xl (not 9xl)
- Campaign badge: Compact, no bounce animation
```

#### 4. **category-grid**
```tsx
- Padding: py-8 md:py-12
- Grid: grid-cols-2 sm:grid-cols-3 md:grid-cols-4
- Card spacing: gap-4
- Category cards: Compact with small images
- Title: text-2xl md:text-3xl
```

#### 5. **seasonal-campaign**
```tsx
- Height: min-h-[50vh] md:min-h-[60vh]
- Padding: py-8 md:py-12  
- Reduce particles from 50 to 20
- Countdown: Compact boxes, smaller text
- Remove decorative emojis
- Title: text-3xl md:text-5xl
```

#### 6. **product-highlight**
```tsx
- Grid: md:grid-cols-2 equal split
- Padding: py-8 md:py-12
- Product image: aspect-square, compact
- Features: 3-4 max, compact cards
- Title: text-2xl md:text-4xl
```

#### 7. **video-hero**
```tsx
- Height: min-h-[50vh] md:min-h-[60vh]
- Padding: py-8 md:py-12
- Remove cinematic overlays
- Simple centered content
- Title: text-3xl md:text-5xl
```

#### 8. **interactive-tryOn**
```tsx
- Grid: md:grid-cols-2
- Padding: py-8 md:py-12
- Demo area: Compact, aspect-video
- Features: 2x2 grid, small cards
```

#### 9. **editorial-magazine**
```tsx
- Grid: Classic 2-column layout
- Padding: py-8 md:py-12
- Magazine header: Compact, border-bottom
- Article cards: Standard size
- Sidebar: Compact, sticky
```

### Mobile-First Checklist
- [ ] Max height 60vh on desktop
- [ ] Max padding py-8 on desktop
- [ ] Max title size 4xl on desktop  
- [ ] Standard button sizes
- [ ] Compact grid gaps (max gap-6)
- [ ] Remove excessive animations
- [ ] Reduce particle counts
- [ ] No full-screen layouts
- [ ] Clean backgrounds (no heavy blurs)
- [ ] Readable text sizes (min 14px)

### Performance Optimizations
1. Reduce particle counts by 70%
2. Remove unnecessary blur effects
3. Simplify gradient overlays
4. Use standard box-shadows
5. Minimize animation complexity
6. Lazy load non-critical elements
7. Use CSS transforms over margins
8. Optimize image sizes

## Implementation Priority
1. ✅ Minimal Product (DONE)
2. Lifestyle Storytelling (IN PROGRESS)
3. Interactive Promotional
4. Product Highlight  
5. Category Grid
6. Seasonal Campaign
7. Video Hero
8. Interactive TryOn
9. Editorial Magazine

