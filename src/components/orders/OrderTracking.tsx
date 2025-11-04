'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Calendar,
  User
} from 'lucide-react';
import { orderApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface TrackingInfo {
  order: {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: string;
    items: Array<{
      product_name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
  };
  tracking: {
    tracking_number: string;
    status: string;
    carrier: string;
    current_location: string;
    estimated_delivery: string;
    description: string;
    history: Array<{
      status: string;
      description: string;
      location: string;
      created_at: string;
    }>;
    timeline: Array<{
      step: string;
      label: string;
      completed: boolean;
      current: boolean;
      date: string;
      description: string;
      location: string;
    }>;
  };
  shipping: {
    address: any;
    method: string;
    cost: number;
  };
  customer_support: {
    phone: string;
    email: string;
    working_hours: string;
  };
}

interface OrderTrackingProps {
  orderId?: number;
  orderNumber?: string;
  trackingNumber?: string;
}

export function OrderTracking({ orderId, orderNumber, trackingNumber }: OrderTrackingProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId || orderNumber) {
      trackOrder();
    }
  }, [orderId, orderNumber, trackingNumber]);

  const trackOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (orderNumber) {
        response = await fetch(`/api/v1/tracking/order/${orderNumber}`);
      } else if (orderId) {
        response = await orderApi.getOrderTracking(orderId);
      } else {
        throw new Error('Order ID or Order Number is required');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch tracking information');
      }

      const data = await response.json();

      if (data.success) {
        setTrackingInfo(data.data);
      } else {
        setError(data.message || 'Failed to fetch tracking information');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'shipped':
      case 'in_transit':
        return <Package className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500 text-white';
      case 'out_for_delivery':
        return 'bg-orange-500 text-white';
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-500 text-white';
      case 'cancelled':
      case 'returned':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tracking information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={trackOrder} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Alert>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No Tracking Information</h3>
        <p className="text-muted-foreground">
          Unable to fetch tracking information for this order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Tracking</h1>
          <p className="text-muted-foreground">
            Order #{trackingInfo.order.order_number}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(trackingInfo.tracking.status)}>
            {getStatusIcon(trackingInfo.tracking.status)}
            <span className="ml-1">{trackingInfo.tracking.status.replace('_', ' ').toUpperCase()}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tracking Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getStatusIcon(trackingInfo.tracking.status)}
                <span className="ml-2">Current Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{trackingInfo.tracking.description}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {trackingInfo.tracking.current_location}
                  </div>
                </div>

                {trackingInfo.tracking.estimated_delivery && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Estimated Delivery: {formatDate(trackingInfo.tracking.estimated_delivery)}</span>
                  </div>
                )}

                {trackingInfo.tracking.tracking_number && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">Tracking Number:</span>
                      <span className="ml-2 font-mono">{trackingInfo.tracking.tracking_number}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Track with Carrier
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingInfo.tracking.timeline.map((step, index) => (
                  <div key={step.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? step.current
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {index < trackingInfo.tracking.timeline.length - 1 && (
                        <div className={`w-0.5 h-16 mx-auto mt-2 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.label}</h4>
                        {step.date && (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(step.date)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      {step.location && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {step.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trackingInfo.order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(trackingInfo.order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Delivery Address</h4>
                  <div className="text-sm text-muted-foreground mt-1">
                    <div>{trackingInfo.shipping.address?.name}</div>
                    <div>{trackingInfo.shipping.address?.address_line_1}</div>
                    {trackingInfo.shipping.address?.address_line_2 && (
                      <div>{trackingInfo.shipping.address.address_line_2}</div>
                    )}
                    <div>
                      {trackingInfo.shipping.address?.city}, {trackingInfo.shipping.address?.state} {trackingInfo.shipping.address?.postal_code}
                    </div>
                    <div>{trackingInfo.shipping.address?.country}</div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Shipping Method</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {trackingInfo.shipping.method} - {formatCurrency(trackingInfo.shipping.cost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Support */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{trackingInfo.customer_support.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{trackingInfo.customer_support.email}</span>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm">Working Hours</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {trackingInfo.customer_support.working_hours}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={trackOrder} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
                <Button variant="outline" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  View Order Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}