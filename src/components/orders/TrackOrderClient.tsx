'use client';

import { useState } from 'react';
import { OrderTracking } from '@/components/orders/OrderTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Package, AlertTriangle } from 'lucide-react';

export function TrackOrderClient() {
  const [searchType, setSearchType] = useState<'orderNumber' | 'orderId'>('orderNumber');
  const [searchValue, setSearchValue] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!searchValue.trim()) {
      setError('Please enter an order number or ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (searchType === 'orderNumber') {
        response = await fetch(`/api/v1/tracking/order/${encodeURIComponent(searchValue.trim())}`);
      } else {
        const orderId = parseInt(searchValue.trim());
        if (isNaN(orderId)) {
          throw new Error('Invalid order ID');
        }
        response = await fetch('/api/v1/tracking/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: orderId,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch tracking information');
      }

      const data = await response.json();

      if (data.success) {
        setTrackingData(data.data);
      } else {
        setError(data.message || 'Failed to fetch tracking information');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack();
    }
  };

  const handleNewSearch = () => {
    setTrackingData(null);
    setSearchValue('');
    setError(null);
  };

  return (
    <>
      {!trackingData ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order number or ID to track your package
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Type Selection */}
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="orderNumber"
                    checked={searchType === 'orderNumber'}
                    onChange={(e) => setSearchType(e.target.value as 'orderNumber' | 'orderId')}
                    className="text-primary"
                  />
                  <span>Order Number (e.g., BB-2024-001)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value="orderId"
                    checked={searchType === 'orderId'}
                    onChange={(e) => setSearchType(e.target.value as 'orderNumber' | 'orderId')}
                    className="text-primary"
                  />
                  <span>Order ID (numbers only)</span>
                </label>
              </div>

              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="searchValue">
                  {searchType === 'orderNumber' ? 'Order Number' : 'Order ID'}
                </Label>
                <Input
                  id="searchValue"
                  type="text"
                  placeholder={searchType === 'orderNumber' ? 'Enter order number (e.g., BB-2024-001)' : 'Enter order ID (e.g., 12345)'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg"
                />
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Track Button */}
              <Button
                onClick={handleTrack}
                disabled={loading || !searchValue.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Tracking...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Help Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Where to find your order number?</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email confirmation or order receipt
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Real-time updates</h3>
                <p className="text-sm text-muted-foreground">
                  Get the latest status of your order delivery
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Contact us if you need help with tracking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          {/* Back Button */}
          <Button onClick={handleNewSearch} variant="outline" className="mb-6">
            ← Track Another Order
          </Button>

          {/* Tracking Display */}
          <OrderTracking
            orderId={trackingData.order.id}
            orderNumber={trackingData.order.order_number}
            trackingNumber={trackingData.tracking?.tracking_number}
          />
        </div>
      )}
    </>
  );
}