'use client';

import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useConfig } from '@/contexts/ConfigContext';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Truck,
  Package,
  Clock
} from 'lucide-react';

interface StockIndicatorProps {
  product: Product;
  className?: string;
  showEstimatedDelivery?: boolean;
}

export function StockIndicator({
  product,
  className = '',
  showEstimatedDelivery = true
}: StockIndicatorProps) {
  const { siteConfig } = useConfig();
  const freeShippingEnabled = siteConfig?.payment?.free_shipping_enabled !== false;
  const freeShippingThreshold = siteConfig?.payment?.free_shipping_threshold || 0;

  const isLowStock = product.manage_stock &&
    product.stock_quantity <= product.min_stock_level &&
    product.stock_quantity > 0;

  const getStockStatus = () => {
    if (!product.in_stock) {
      return {
        status: 'out-of-stock',
        label: 'Out of Stock',
        color: 'destructive',
        icon: XCircle,
        message: 'This product is currently out of stock',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }

    if (isLowStock) {
      return {
        status: 'low-stock',
        label: `Only ${product.stock_quantity} left!`,
        color: 'secondary',
        icon: AlertTriangle,
        message: 'Hurry, stock is running low!',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200'
      };
    }

    return {
      status: 'in-stock',
      label: 'In Stock',
      color: 'default',
      icon: CheckCircle,
      message: 'Available for immediate shipping',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    };
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  const getEstimatedDelivery = () => {
    if (!product.in_stock) {
      return null;
    }

    if (product.is_digital) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>Instant download after purchase</span>
        </div>
      );
    }

    // Estimate delivery based on stock level and location
    let deliveryMessage = 'Usually ships within 2-3 business days';

    if (isLowStock) {
      deliveryMessage = 'Order now to secure your copy';
    } else if (product.is_featured) {
      deliveryMessage = 'Express shipping available';
    }

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Truck className="h-4 w-4" />
        <span>{deliveryMessage}</span>
      </div>
    );
  };

  const getStockLevelIndicator = () => {
    if (!product.manage_stock || product.stock_quantity <= 0) {
      return null;
    }

    const stockPercentage = product.min_stock_level > 0
      ? Math.min(100, (product.stock_quantity / product.min_stock_level) * 100)
      : 100;

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Stock Level</span>
          <span>{product.stock_quantity} units</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${stockStatus.status === 'low-stock'
                ? 'bg-orange-400'
                : stockStatus.status === 'in-stock'
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }`}
            style={{ width: `${Math.max(5, stockPercentage)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Stock Status Badge */}
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
        <StatusIcon className={`h-5 w-5 ${stockStatus.textColor}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${stockStatus.bgColor} ${stockStatus.textColor} ${stockStatus.borderColor}`}
            >
              {stockStatus.label}
            </Badge>
            {product.manage_stock && (
              <span className="text-xs text-muted-foreground">
                (SKU: {product.sku})
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {stockStatus.message}
          </p>
        </div>
      </div>

      {/* Stock Level Indicator */}
      {getStockLevelIndicator()}

      {/* Estimated Delivery */}
      {showEstimatedDelivery && (
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {getEstimatedDelivery()}
          </span>
        </div>
      )}

      {/* Additional Shipping Info */}
      {product.in_stock && !product.is_digital && (
        <div className="space-y-1 text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
          {freeShippingEnabled && freeShippingThreshold > 0 && (
            <div className="flex items-center gap-2">
              <Truck className="h-3 w-3" />
              <span>Free shipping on orders above ₹{freeShippingThreshold}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Package className="h-3 w-3" />
            <span>Secure packaging guaranteed</span>
          </div>
        </div>
      )}

      {/* Out of Stock Notification */}
      {!product.in_stock && (
        <div className="space-y-2 text-xs">
          <p className="text-muted-foreground">
            Notify me when this product is available:
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
              Notify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}