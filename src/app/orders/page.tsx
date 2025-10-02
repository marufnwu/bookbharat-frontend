'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useConfig } from '@/contexts/ConfigContext';
import { orderApi } from '@/lib/api';
import { Order } from '@/types';
import { 
  BookOpen,
  ShoppingBag,
  Search,
  Filter,
  ChevronRight,
  Download,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { siteConfig } = useConfig();

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        per_page: 10
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await orderApi.getOrders(params);
      
      if (response.success) {
        // Handle different response structures
        let ordersData = [];
        let meta = null;
        
        // Check if orders are in response.orders.data (paginated response)
        if (response.orders?.data) {
          ordersData = response.orders.data;
          meta = response.orders;
        } 
        // Check if orders are in response.data.data (alternative structure)
        else if (response.data?.data) {
          ordersData = response.data.data;
          meta = response.data;
        }
        // Check if orders are directly in response.data
        else if (Array.isArray(response.data)) {
          ordersData = response.data;
          meta = response.meta;
        }
        
        setOrders(ordersData);
        
        // Set pagination info
        if (meta) {
          setTotalPages(meta.last_page || 1);
        }
      } else {
        setError(response.message || 'Failed to load orders');
        setOrders([]); // Ensure orders is empty array on error
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again.');
      setOrders([]); // Ensure orders is empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Dummy orders for fallback (keeping structure similar)
  const fallbackOrders = [
    {
      id: 'ORD-2024-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 1247,
      items: [
        {
          id: 1,
          title: "The Psychology of Money",
          author: "Morgan Housel",
          price: 399,
          quantity: 2
        },
        {
          id: 2,
          title: "Atomic Habits",
          author: "James Clear",
          price: 449,
          quantity: 1
        }
      ],
      shipping: {
        address: "123, ABC Society, XYZ Road, Mumbai - 400001",
        method: "Standard Delivery",
        trackingId: "TRK123456789"
      },
      payment: {
        method: "Credit Card",
        status: "paid"
      }
    },
    {
      id: 'ORD-2024-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 899,
      items: [
        {
          id: 3,
          title: "Sapiens",
          author: "Yuval Noah Harari",
          price: 499,
          quantity: 1
        },
        {
          id: 4,
          title: "The Midnight Library",
          author: "Matt Haig",
          price: 349,
          quantity: 1
        }
      ],
      shipping: {
        address: "456, Business Park, Corporate Road, Mumbai - 400070",
        method: "Express Delivery",
        trackingId: "TRK987654321"
      },
      payment: {
        method: "UPI",
        status: "paid"
      }
    },
    {
      id: 'ORD-2024-003',
      date: '2024-01-08',
      status: 'processing',
      total: 567,
      items: [
        {
          id: 5,
          title: "Think and Grow Rich",
          author: "Napoleon Hill",
          price: 299,
          quantity: 1
        }
      ],
      shipping: {
        address: "123, ABC Society, XYZ Road, Mumbai - 400001",
        method: "Standard Delivery",
        trackingId: null
      },
      payment: {
        method: "Net Banking",
        status: "paid"
      }
    },
    {
      id: 'ORD-2024-004',
      date: '2024-01-05',
      status: 'cancelled',
      total: 759,
      items: [
        {
          id: 6,
          title: "The Silent Patient",
          author: "Alex Michaelides",
          price: 379,
          quantity: 2
        }
      ],
      shipping: {
        address: "123, ABC Society, XYZ Road, Mumbai - 400001",
        method: "Standard Delivery",
        trackingId: null
      },
      payment: {
        method: "Credit Card",
        status: "refunded"
      }
    }
  ];

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'default';
      case 'processing': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'shipped': return Truck;
      case 'processing': return Package;
      case 'cancelled': return XCircle;
      default: return Package;
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await orderApi.cancelOrder(orderId);
      if (response.success) {
        // Reload orders to reflect the change
        loadOrders();
      } else {
        alert(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const response = await orderApi.reorder(orderId);
      if (response.success) {
        alert('Items added to cart successfully!');
      } else {
        alert(response.message || 'Failed to reorder');
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
      alert('Failed to reorder. Please try again.');
    }
  };

  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/profile" className="hover:text-primary">Profile</Link>
        <span className="mx-2">/</span>
        <span>Orders</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">{orders?.length || 0} orders found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders or books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {(!orders || orders.length === 0) && !loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : "You haven't placed any orders yet."}
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders?.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(order.status) as any} className="mb-2">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-lg font-bold">{currencySymbol}{order.total_amount || order.total}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {(order.order_items || order.items || []).map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              width={48}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <BookOpen className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name || item.product_name || item.title || 'Product'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              try {
                                if (item.product?.metadata) {
                                  const meta = typeof item.product.metadata === 'string' 
                                    ? JSON.parse(item.product.metadata) 
                                    : item.product.metadata;
                                  return meta.author ? `by ${meta.author}` : '';
                                }
                                return item.product?.brand || item.author || '';
                              } catch {
                                return item.product?.brand || item.author || '';
                              }
                            })()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{currencySymbol}{item.unit_price || item.price}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Info */}
                  <div className="border-t pt-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Shipping Address</p>
                        <p className="text-muted-foreground">
                          {order.shipping_address ? 
                            `${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}` 
                            : (order.shipping?.address || 'Not provided')}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Payment Method</p>
                        <p className="text-muted-foreground">
                          {order.payment_method || 'N/A'} • {order.payment_status || 'pending'}
                        </p>
                        {order.tracking_number && (
                          <p className="font-medium mt-2">
                            Tracking: {order.tracking_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex space-x-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                      
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                      )}
                      
                      {order.status === 'shipped' && order.shipping.trackingId && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {order.status === 'processing' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelOrder(order.id.toString())}
                        >
                          Cancel Order
                        </Button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReorder(order.id.toString())}
                        >
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
      
      {loading && orders && orders.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}