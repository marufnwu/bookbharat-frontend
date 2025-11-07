# Dynamic Site Configuration Integration

This document explains the comprehensive dynamic site configuration system that integrates with the BookBharat backend API.

## Overview

The dynamic configuration system allows the frontend to fetch and use site-wide configurations from the backend, enabling centralized management of:

- Site settings and metadata
- Theme configuration (colors, fonts, layout)
- Feature flags and functionality toggles
- Payment and shipping configurations
- Navigation menus
- Homepage layout and content
- Hero banners and promotional content

## Architecture

### Core Components

1. **SiteConfigService** (`src/lib/site-config.ts`)
   - Singleton service for fetching and caching configurations
   - Provides TypeScript interfaces for all configuration types
   - Handles API communication with fallback to defaults

2. **Server Config Utilities** (`src/lib/server-config.ts`)
   - Server-side utilities for Next.js SSR/SSG
   - Configuration validation and transformation
   - Caching strategies for better performance

3. **React Context Provider** (`src/contexts/SiteConfigContext.tsx`)
   - Global state management for configuration data
   - Feature flag utilities
   - Specialized hooks for different configuration aspects

4. **React Hooks** (`src/hooks/useSiteConfig.ts`)
   - Alternative to context for component-level configuration access
   - Memoized selectors for performance

## Available Configuration APIs

### 1. Site Configuration (`/api/v1/config/site`)

```typescript
interface SiteConfig {
  site: {
    name: string;
    description: string;
    logo: string;
    email: string;
    phone: string;
    // ... more site info
  };
  theme: SiteTheme;
  features: SiteFeatures;
  payment: SitePayment;
  shipping: SiteShipping;
  social: SiteSocial;
  seo: SiteSEO;
}
```

**Usage Example:**
```typescript
import { useSiteConfig } from '@/contexts/SiteConfigContext';

function MyComponent() {
  const { siteConfig, isFeatureEnabled } = useSiteConfig();

  return (
    <div>
      <h1>{siteConfig?.site.name}</h1>
      {isFeatureEnabled('wishlist_enabled') && (
        <WishlistButton />
      )}
    </div>
  );
}
```

### 2. Homepage Configuration (`/api/v1/config/homepage`)

```typescript
interface HomepageConfig {
  hero_sections: HeroSection[];
  featured_sections: FeaturedSection[];
  promotional_banners: PromotionalBanner[];
  testimonials: Testimonial[];
  newsletter: NewsletterConfig;
}
```

**Usage Example:**
```typescript
import { useHomepageLayout } from '@/contexts/SiteConfigContext';

function HomePage() {
  const { homepage } = useHomepageLayout();

  return (
    <div>
      {homepage?.heroSections.map(hero => (
        <HeroSection key={hero.id} {...hero} />
      ))}
    </div>
  );
}
```

### 3. Navigation Configuration (`/api/v1/config/navigation`)

```typescript
interface NavigationConfig {
  header: {
    primary: NavigationItem[];
    secondary: NavigationItem[];
    mobile: NavigationItem[];
  };
  footer: {
    primary: NavigationItem[];
    secondary: NavigationItem[];
    legal: NavigationItem[];
    social: NavigationItem[];
  };
}
```

**Usage Example:**
```typescript
import { useNavigationMenus } from '@/contexts/SiteConfigContext';

function Header() {
  const navigation = useNavigationMenus();

  return (
    <nav>
      {navigation?.header.primary.map(item => (
        <Link key={item.id} href={item.url}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

### 4. Hero Configuration (`/api/v1/hero/active`)

Dynamic hero content with:
- Customizable title, subtitle, and description
- Background images and videos
- Call-to-action buttons
- Trust badges
- Countdown timers

## Integration Patterns

### 1. Server-Side Rendering (Recommended)

For optimal performance and SEO, fetch configurations server-side:

```typescript
// app/layout.tsx
import { getServerSideAllConfigs } from '@/lib/server-config';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';

export default async function RootLayout({ children }) {
  const configs = await getServerSideAllConfigs();

  return (
    <SiteConfigProvider initialConfig={configs}>
      {children}
    </SiteConfigProvider>
  );
}
```

### 2. Client-Side Fetching

For components that need real-time configuration updates:

```typescript
import { useSiteConfig } from '@/hooks/useSiteConfig';

function DynamicComponent() {
  const { siteConfig, loading, error, refetch } = useSiteConfig();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ComponentUsingConfig config={siteConfig} />;
}
```

### 3. Feature Flag Usage

```typescript
import { useFeatureFlags } from '@/contexts/SiteConfigContext';

function ProductCard({ product }) {
  const { wishlist, reviews } = useFeatureFlags();

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}</p>

      {wishlist && (
        <button onClick={() => addToWishlist(product)}>
          Add to Wishlist
        </button>
      )}

      {reviews && (
        <Link href={`/products/${product.id}/reviews`}>
          View Reviews
        </Link>
      )}
    </div>
  );
}
```

## Theme Integration

### Dynamic CSS Variables

The theme configuration automatically generates CSS variables:

```typescript
import { useThemeConfig } from '@/contexts/SiteConfigContext';

function ThemeProvider({ children }) {
  const theme = useThemeConfig();

  useEffect(() => {
    if (theme?.cssVariables) {
      const root = document.documentElement;
      Object.entries(theme.cssVariables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }, [theme]);

  return <>{children}</>;
}
```

### Tailwind CSS Integration

Extend your `tailwind.config.js` to use dynamic theme colors:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
    },
  },
};
```

## Caching Strategy

### Client-Side Caching

- **Duration**: 5 minutes for all configurations
- **Invalidation**: Manual via `siteConfigService.clearCache()`
- **Storage**: In-memory with time-based expiration

### Server-Side Caching

- **Next.js Cache**: `next: { revalidate: 300 }` for API requests
- **Static Generation**: Server-side utilities enable SSG
- **CDN Integration**: Configurations can be cached at CDN level

## Error Handling

### Graceful Degradation

All configuration hooks and components provide fallback values:

```typescript
// Components automatically show loading states and fallbacks
<DynamicHeader /> // Shows skeleton while loading
<DynamicHero />   // Falls back to default hero content
```

### Development vs Production

- **Development**: Detailed error logging and stack traces
- **Production**: User-friendly error messages with monitoring

## Performance Optimization

### 1. Server-Side Fetching

- Fetch configurations at layout level for SSR
- Reduces client-side API calls
- Better SEO and initial page load

### 2. Selective Re-rendering

- Use memoized hooks for specific configuration parts
- Context-based state management prevents unnecessary re-renders

### 3. Lazy Loading

- Large configurations (like homepage sections) can be loaded on-demand
- Progressive enhancement for better perceived performance

## Testing

### Mock Configuration

```typescript
// __tests__/mocks/site-config.ts
export const mockSiteConfig: SiteConfig = {
  site: {
    name: 'Test Bookstore',
    // ... other config
  },
  // ... rest of config
};
```

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';

test('renders dynamic header with config', () => {
  const config = { siteConfig: mockSiteConfig };

  render(
    <SiteConfigProvider initialConfig={config}>
      <DynamicHeader />
    </SiteConfigProvider>
  );

  expect(screen.getByText('Test Bookstore')).toBeInTheDocument();
});
```

## Migration Guide

### From Hardcoded Values

1. **Identify hardcoded values** in components
2. **Create configuration interfaces** for related settings
3. **Update backend API** to provide these configurations
4. **Replace hardcoded values** with configuration hooks
5. **Add fallbacks** for backward compatibility

### Example Migration

**Before:**
```typescript
function Header() {
  return (
    <header>
      <img src="/images/logo.png" alt="BookBharat" />
      <nav>
        <Link href="/books">Books</Link>
        <Link href="/categories">Categories</Link>
      </nav>
    </header>
  );
}
```

**After:**
```typescript
function Header() {
  const siteInfo = useSiteInfo();
  const navigation = useNavigationMenus();

  return (
    <DynamicHeader>
      {siteInfo?.logo && (
        <img src={siteInfo.logo} alt={siteInfo.name} />
      )}
      {navigation?.header.primary.map(item => (
        <Link key={item.id} href={item.url}>
          {item.label}
        </Link>
      ))}
    </DynamicHeader>
  );
}
```

## Best Practices

### 1. Configuration Structure

- Keep configurations flat when possible
- Use consistent naming conventions
- Provide meaningful default values
- Validate configurations on both client and server

### 2. Performance

- Use server-side fetching for critical configurations
- Implement selective re-rendering
- Cache frequently accessed configurations
- Load heavy configurations lazily

### 3. Developer Experience

- Provide TypeScript interfaces for all configurations
- Include comprehensive error messages
- Document configuration schema
- Create debugging utilities

### 4. Maintenance

- Regularly review configuration usage
- Clean up unused configuration keys
- Monitor configuration API performance
- Implement configuration versioning

## Troubleshooting

### Common Issues

1. **Configuration Not Loading**
   - Check API endpoints are accessible
   - Verify network connectivity
   - Check error logs in browser console

2. **Theme Not Applying**
   - Ensure CSS variables are set
   - Check Tailwind configuration
   - Verify CSS specificity

3. **Feature Flags Not Working**
   - Confirm configuration is loaded
   - Check feature flag names
   - Verify cache invalidation

### Debug Mode

Enable debug mode for detailed configuration logging:

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  siteConfigService.setDebugMode(true);
}
```

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live configuration changes
2. **A/B Testing**: Configuration-based A/B testing framework
3. **Multi-tenant**: Support for different configurations per tenant
4. **Configuration Builder**: UI for managing configurations
5. **Analytics**: Track configuration changes and their impact