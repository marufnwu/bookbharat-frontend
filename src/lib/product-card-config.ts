/**
 * Product Card Configuration
 * Single source of truth for ProductCard display across the application
 */

export interface ProductCardConfig {
  variant: 'default' | 'compact' | 'large' | 'minimal';
  showCategory: boolean;
  showAuthor: boolean;
  showRating: boolean;
  showDiscount: boolean;
  showWishlist: boolean;
  showQuickView: boolean;
  showAddToCart: boolean;
  showBuyNow: boolean;
}

/**
 * Standard product card configurations for different contexts
 */
export const PRODUCT_CARD_CONFIGS = {
  /**
   * Homepage Featured Products - Optimized for mobile and desktop
   */
  homepageFeatured: (isMobile: boolean): ProductCardConfig => ({
    variant: isMobile ? 'minimal' : 'compact',
    showCategory: false,
    showAuthor: !isMobile,
    showRating: !isMobile,
    showDiscount: true,
    showWishlist: !isMobile,
    showQuickView: false,
    showAddToCart: true,
    showBuyNow: true,
  }),

  /**
   * Category Product Sections - Consistent across all categories
   */
  categorySection: (isMobile: boolean): ProductCardConfig => ({
    variant: isMobile ? 'minimal' : 'compact',
    showCategory: false,
    showAuthor: !isMobile,
    showRating: !isMobile,
    showDiscount: true,
    showWishlist: !isMobile,
    showQuickView: false,
    showAddToCart: true,
    showBuyNow: true,
  }),

  /**
   * Product Listing Page - Grid View
   */
  productListGrid: (isMobile: boolean): ProductCardConfig => ({
    variant: 'default',
    showCategory: true,
    showAuthor: true,
    showRating: true,
    showDiscount: true,
    showWishlist: true,
    showQuickView: !isMobile,
    showAddToCart: true,
    showBuyNow: !isMobile,
  }),

  /**
   * Product Listing Page - List View
   */
  productListList: (): ProductCardConfig => ({
    variant: 'compact',
    showCategory: true,
    showAuthor: true,
    showRating: true,
    showDiscount: true,
    showWishlist: true,
    showQuickView: false,
    showAddToCart: true,
    showBuyNow: true,
  }),

  /**
   * Search Results - Grid View
   */
  searchGrid: (isMobile: boolean): ProductCardConfig => ({
    variant: 'default',
    showCategory: true,
    showAuthor: true,
    showRating: true,
    showDiscount: true,
    showWishlist: true,
    showQuickView: !isMobile,
    showAddToCart: true,
    showBuyNow: !isMobile,
  }),

  /**
   * Search Results - List View
   */
  searchList: (): ProductCardConfig => ({
    variant: 'compact',
    showCategory: true,
    showAuthor: true,
    showRating: true,
    showDiscount: true,
    showWishlist: true,
    showQuickView: false,
    showAddToCart: true,
    showBuyNow: true,
  }),

  /**
   * Related Products Section
   */
  relatedProducts: (isMobile: boolean): ProductCardConfig => ({
    variant: 'compact',
    showCategory: false,
    showAuthor: !isMobile,
    showRating: !isMobile,
    showDiscount: true,
    showWishlist: !isMobile,
    showQuickView: false,
    showAddToCart: true,
    showBuyNow: false,
  }),

  /**
   * Wishlist Page
   */
  wishlist: (): ProductCardConfig => ({
    variant: 'default',
    showCategory: true,
    showAuthor: true,
    showRating: true,
    showDiscount: true,
    showWishlist: true,
    showQuickView: false,
    showAddToCart: true,
    showBuyNow: true,
  }),
} as const;

/**
 * Grid configurations for consistent layouts
 */
export const PRODUCT_GRID_CONFIGS = {
  /**
   * Homepage Featured - 2 cols mobile, 6 cols desktop
   */
  homepageFeatured: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4',

  /**
   * Category Sections - 2 cols mobile, 5 cols desktop
   */
  categorySection: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4',

  /**
   * Product Listing - 2 cols mobile, 4 cols desktop
   */
  productListing: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6',

  /**
   * Search Results - 2 cols mobile, 4 cols desktop
   */
  searchResults: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6',

  /**
   * Related Products - 2 cols mobile, 5 cols desktop
   */
  relatedProducts: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4',

  /**
   * Wishlist - 2 cols mobile, 4 cols desktop
   */
  wishlist: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6',
} as const;

/**
 * Helper function to get product card props
 */
export const getProductCardProps = (
  context: keyof typeof PRODUCT_CARD_CONFIGS,
  isMobile: boolean = false
): ProductCardConfig => {
  const config = PRODUCT_CARD_CONFIGS[context];

  // Handle configs that take isMobile parameter
  if (typeof config === 'function') {
    return config(isMobile);
  }

  return config;
};

/**
 * Helper function to get grid classes
 */
export const getProductGridClasses = (
  context: keyof typeof PRODUCT_GRID_CONFIGS
): string => {
  return PRODUCT_GRID_CONFIGS[context];
};
