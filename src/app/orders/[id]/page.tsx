'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { orderApi } from '@/lib/api';
import { Order, OrderItem } from '@/types';
import { 
  BookOpen,
  ChevronRight,
  Download,
  Truck,
  Package,
  CheckCircle,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  AlertCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass the order ID or order number as-is (can be string or number)
      const response = await orderApi.getOrder(orderId);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Failed to load order details');
      }
    } catch (err: any) {
      console.error('Failed to fetch order:', err);
      // Handle specific error cases
      if (err.response?.status === 403) {
        setError('You do not have permission to view this order.');
      } else if (err.response?.status === 404) {
        setError('Order not found. Please check the order ID and try again.');
      } else {
        setError('Failed to load order details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancellingOrder(true);
      const response = await orderApi.cancelOrder(order.id);
      
      if (response.success) {
        alert('Order cancelled successfully');
        fetchOrderDetails(); // Refresh order details
      } else {
        alert(response.message || 'Failed to cancel order');
      }
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        alert('You do not have permission to cancel this order.');
      } else if (err.response?.status === 404) {
        alert('Order not found.');
      } else if (err.response?.status === 400) {
        alert(err.response?.data?.message || 'Order cannot be cancelled at this stage.');
      } else {
        alert('Failed to cancel order. Please try again.');
      }
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    try {
      const response = await orderApi.downloadInvoice(order.id);
      if (response.success) {
        if (response.download_url) {
          // If there's a download URL, open it
          window.open(response.download_url, '_blank');
        } else {
          // Show message if feature is not implemented yet
          alert(response.message || 'Invoice download feature is coming soon!');
        }
      } else {
        alert(response.message || 'Failed to download invoice');
      }
    } catch (err: any) {
      console.error('Failed to download invoice:', err);
      if (err.response?.status === 403) {
        alert('You do not have permission to download this invoice.');
      } else if (err.response?.status === 404) {
        alert('Invoice not found.');
      } else {
        alert('Failed to download invoice. Please try again.');
      }
    }
  };

  const handleReorderItems = () => {
    if (!order) return;
    // In a real app, this would add all items back to cart
    router.push('/cart');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': 
      case 'dispatched': return 'default';
      case 'processing': 
      case 'confirmed': return 'warning';
      case 'cancelled': 
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped':
      case 'dispatched': return <Truck className="h-4 w-4" />;
      case 'processing':
      case 'confirmed': return <Package className="h-4 w-4" />;
      case 'cancelled':
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || 'We couldn\'t find this order. Please check the order ID and try again.'}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/orders">View All Orders</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Build timeline from order status history or use current status
  const timeline = order.status_history || [
    {
      status: order.status,
      created_at: order.created_at,
      notes: `Order ${order.status}`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <Link href="/orders" className="hover:text-primary">Orders</Link>
        <ChevronRight className="inline h-4 w-4 mx-2" />
        <span>{order.order_number}</span>
      </nav>

      {/* Order Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground">
            Order {order.order_number} • Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
          {(order.status === 'shipped' || order.status === 'dispatched') && order.tracking_number && (
            <Button variant="outline">
              <Truck className="h-4 w-4 mr-2" />
              Track Package
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Status
                </CardTitle>
                <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index === 0 ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="w-2 h-2 bg-current rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered ({(order.order_items || order.items)?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(order.order_items || order.items || []).map((item: any) => (
                  <div key={item.id} className="flex space-x-4 pb-4 border-b border-border last:border-b-0">
                    <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.product?.image_url ? (
                        <Image 
                          src={item.product.image_url} 
                          alt={item.product.title}
                          width={64}
                          height={80}
                          className="object-cover rounded"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {item.product?.name || item.product_name || 'Product'}
                      </h4>
                      {(() => {
                        try {
                          if (item.product?.metadata) {
                            const meta = typeof item.product.metadata === 'string' 
                              ? JSON.parse(item.product.metadata) 
                              : item.product.metadata;
                            if (meta.author) {
                              return <p className="text-sm text-muted-foreground">by {meta.author}</p>;
                            }
                          }
                          return null;
                        } catch {
                          return null;
                        }
                      })()}
                      {(() => {
                        try {
                          if (item.product?.metadata) {
                            const meta = typeof item.product.metadata === 'string' 
                              ? JSON.parse(item.product.metadata) 
                              : item.product.metadata;
                            if (meta.isbn) {
                              return <p className="text-xs text-muted-foreground">ISBN: {meta.isbn}</p>;
                            }
                          }
                          return item.product?.isbn ? (
                            <p className="text-xs text-muted-foreground">ISBN: {item.product.isbn}</p>
                          ) : null;
                        } catch {
                          return null;
                        }
                      })()}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm">Quantity: {item.quantity}</p>
                        <p className="font-medium">₹{item.total_price || item.total || (item.unit_price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {order.shipping_address?.first_name && order.shipping_address?.last_name
                        ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
                        : order.shipping_address?.name || order.customer_name}
                    </p>
                    <p>{order.shipping_address?.address_line_1}</p>
                    {order.shipping_address?.address_line_2 && (
                      <p>{order.shipping_address.address_line_2}</p>
                    )}
                    <p>
                      {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code || order.shipping_address?.pincode}
                    </p>
                    <p>{order.shipping_address?.phone || order.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Shipping Method</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shipping_method || 'Standard Delivery'}</p>
                    {order.shipping_carrier && (
                      <p>Carrier: {order.shipping_carrier}</p>
                    )}
                    {order.tracking_number && (
                      <p>Tracking: {order.tracking_number}</p>
                    )}
                    {order.estimated_delivery && (
                      <p>Estimated Delivery: {formatDate(order.estimated_delivery)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{order.subtotal || order.total_amount}</span>
              </div>
              {order.shipping_amount !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{order.shipping_amount === 0 ? 'FREE' : `₹${order.shipping_amount}`}</span>
                </div>
              )}
              {order.tax_amount !== undefined && (
                <div className="flex justify-between text-sm">
                  <span>Tax (GST)</span>
                  <span>₹{order.tax_amount}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>{order.payment_method || 'Online Payment'}</span>
                </div>
                {order.payment_id && (
                  <div className="flex justify-between">
                    <span>Transaction ID</span>
                    <span className="font-mono text-xs">{order.payment_id}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <Badge 
                    variant={order.payment_status === 'paid' ? 'success' : 'warning'} 
                    size="sm"
                  >
                    {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1) || 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer_phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {(order.status === 'pending' || order.status === 'processing' || order.status === 'confirmed') && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder}
                >
                  {cancellingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </Button>
              )}
              
              {order.status === 'delivered' && (
                <Button variant="outline" className="w-full">
                  Return Items
                </Button>
              )}
              
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" onClick={handleReorderItems}>
                Reorder Items
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}