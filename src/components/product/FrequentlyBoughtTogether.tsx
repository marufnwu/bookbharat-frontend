'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { productApi, cartApi } from '@/lib/api';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number | string;
  compare_price?: number | string;
  images?: Array<{ 
    image_path?: string;
    url?: string;
    image_url?: string;
  }>;
  image_url?: string;
  primary_image?: {
    image_path?: string;
    url?: string;
  };
}

interface BundleData {
  bundle_price: number;
  total_price: number;
  total_original_price: number;
  savings: number;
  discount_percentage: number;
  discount_amount?: number;
  product_count: number;
  discount_rule?: {
    name: string;
    description: string;
    type: 'percentage' | 'fixed';
  };
}

interface FrequentlyBoughtTogetherProps {
  productId: string;
  mainProduct: Product;
}

export default function FrequentlyBoughtTogether({ productId, mainProduct }: FrequentlyBoughtTogetherProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [bundleData, setBundleData] = useState<BundleData | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  // Helper function to get the product image URL
  const getProductImage = (product: Product): string => {
    // Try different possible image sources
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.url) return firstImage.url;
      if (firstImage.image_url) return firstImage.image_url;
      if (firstImage.image_path) {
        // If it's a relative path, prepend the API URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        return firstImage.image_path.startsWith('http') 
          ? firstImage.image_path 
          : `${baseUrl}/storage/${firstImage.image_path}`;
      }
    }
    if (product.image_url) return product.image_url;
    if (product.primary_image) {
      if (product.primary_image.url) return product.primary_image.url;
      if (product.primary_image.image_path) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
        return product.primary_image.image_path.startsWith('http')
          ? product.primary_image.image_path
          : `${baseUrl}/storage/${product.primary_image.image_path}`;
      }
    }
    return '/book-placeholder.svg';
  };

  useEffect(() => {
    fetchFrequentlyBoughtTogether();
  }, [productId]);

  const fetchFrequentlyBoughtTogether = async () => {
    try {
      const response = await productApi.getFrequentlyBoughtTogether(productId);
      if (response.success) {
        setProducts(response.data.products || []);
        setBundleData(response.data.bundle_data);
        // Select all products by default
        const productIds = response.data.products?.map((p: Product) => p.id) || [];
        setSelectedProducts(new Set(productIds));
      }
    } catch (error) {
      console.error('Error fetching frequently bought together:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const calculateBundlePrice = () => {
    // If we have bundle data from backend and all products are selected, use it
    if (bundleData && selectedProducts.size === products.length) {
      return {
        total: bundleData.total_price,
        bundlePrice: bundleData.bundle_price,
        savings: bundleData.savings,
        discountPercentage: bundleData.discount_percentage,
        discountRule: bundleData.discount_rule
      };
    }
    
    // Otherwise calculate based on selected products
    let total = parseFloat(String(mainProduct.price));
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    
    selectedProductsList.forEach(product => {
      total += parseFloat(String(product.price));
    });

    // Use backend discount percentage if available, otherwise use frontend defaults
    const productCount = selectedProductsList.length + 1; // +1 for main product
    let discountPercentage = 0;
    
    if (bundleData && bundleData.discount_percentage) {
      // Scale discount based on selected vs total products
      const selectionRatio = (selectedProductsList.length + 1) / (products.length + 1);
      discountPercentage = bundleData.discount_percentage * selectionRatio;
    } else {
      // Fallback to static discounts
      if (productCount === 2) discountPercentage = 5;
      else if (productCount === 3) discountPercentage = 10;
      else if (productCount >= 4) discountPercentage = 15;
    }

    const bundlePrice = total * (1 - discountPercentage / 100);
    const savings = total - bundlePrice;

    return {
      total,
      bundlePrice: Math.round(bundlePrice * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      discountPercentage: Math.round(discountPercentage * 100) / 100,
      discountRule: bundleData?.discount_rule
    };
  };

  const handleAddBundleToCart = async () => {
    try {
      // Get selected product IDs
      const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
      const selectedProductIds = selectedProductsList.map(p => parseInt(p.id));

      // Call backend addBundle endpoint with bundle discount
      const response = await cartApi.addBundle({
        main_product_id: parseInt(mainProduct.id),
        product_ids: selectedProductIds,
        bundle_discount_rule_id: bundleData?.discount_rule ? undefined : undefined // Optional: Can add if tracking rule ID
      });

      if (response.success) {
        // Refresh cart store
        const { refreshCart } = useCartStore.getState();
        await refreshCart();

        toast.success(`Bundle added to cart! Saved ₹${response.bundle_data?.savings?.toFixed(2) || bundle.savings.toFixed(2)}`);
      } else {
        toast.error(response.message || 'Failed to add bundle to cart');
      }
    } catch (error: any) {
      console.error('Error adding bundle to cart:', error);
      toast.error(error?.response?.data?.message || 'Failed to add bundle to cart');
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  const bundle = calculateBundlePrice();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 my-8">
      <h2 className="text-xl font-semibold mb-6">Frequently Bought Together</h2>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {/* Main Product */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border bg-gray-50">
                <Image
                  src={getProductImage(mainProduct)}
                  alt={mainProduct.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/book-placeholder.svg';
                  }}
                />
                <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              </div>
              <p className="text-xs mt-2 text-center max-w-[96px] md:max-w-[128px] truncate">
                {mainProduct.name}
              </p>
            </div>

            {/* Plus Sign */}
            {products.length > 0 && (
              <Plus className="text-gray-400 flex-shrink-0" size={20} />
            )}

            {/* Additional Products */}
            {products.map((product, index) => (
              <div key={product.id} className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <div 
                    className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border cursor-pointer bg-gray-50 hover:border-primary transition-colors"
                    onClick={() => toggleProductSelection(product.id)}
                  >
                    <Image
                      src={getProductImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.png';
                      }}
                    />
                    {selectedProducts.has(product.id) && (
                      <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-2 text-center max-w-[96px] md:max-w-[128px] truncate">
                    {product.name}
                  </p>
                </div>
                {index < products.length - 1 && (
                  <Plus className="text-gray-400 flex-shrink-0" size={20} />
                )}
              </div>
            ))}
          </div>

          {/* Product Selection List */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">{mainProduct.name}</span>
              <span className="text-gray-600">₹{parseFloat(String(mainProduct.price)).toFixed(2)}</span>
            </div>
            
            {products.map(product => (
              <div key={product.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleProductSelection(product.id)}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className={selectedProducts.has(product.id) ? 'font-medium' : 'text-gray-600'}>
                  {product.name}
                </span>
                <span className="text-gray-600">₹{parseFloat(String(product.price)).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="lg:w-80 bg-gray-50 rounded-lg p-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Price:</span>
              <span className="line-through text-gray-500">₹{bundle.total.toFixed(2)}</span>
            </div>
            {bundle.discountPercentage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bundle Discount ({bundle.discountPercentage}%):</span>
                <span className="text-green-600">-₹{bundle.savings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Bundle Price:</span>
              <span className="text-primary">₹{bundle.bundlePrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleAddBundleToCart}
            disabled={selectedProducts.size === 0}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add Bundle to Cart
          </button>

          {bundle.savings > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-green-600 text-center">
                Save ₹{bundle.savings.toFixed(2)} with this bundle!
              </p>
              {bundle.discountRule && (
                <p className="text-xs text-gray-600 text-center">
                  {bundle.discountRule.description || `${bundle.discountRule.name} applied`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}