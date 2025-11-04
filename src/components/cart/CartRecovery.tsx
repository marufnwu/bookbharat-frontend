'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShoppingCart,
  Clock,
  Mail,
  MessageCircle,
  Bell,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { cartApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AbandonedCart {
  id: number;
  total_amount: number;
  total_items: number;
  abandoned_at: string;
  recovery_probability: number;
  customer_segment: string;
  recovery_link: string;
  recovery_link_expires_at: string;
  items: Array<{
    product_id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    total: number;
    category: string;
  }>;
}

interface RecoveryStats {
  total_carts: number;
  abandoned_carts: number;
  recovered_carts: number;
  abandonment_rate: number;
  recovery_rate: number;
  revenue_potential: number;
}

export function CartRecovery() {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<RecoveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAbandonedCarts();
    loadStats();
  }, []);

  const loadAbandonedCarts = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getAbandonedCarts();

      if (response.success) {
        setAbandonedCarts(response.data.abandoned_carts);
      } else {
        setError(response.message || 'Failed to load abandoned carts');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await cartApi.getRecoveryStats();

      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const triggerRecovery = async (cartId: number, method: 'email' | 'sms' | 'push') => {
    try {
      setActionLoading(cartId);

      const response = await cartApi.triggerRecovery({
        cart_id: cartId,
        method: method
      });

      if (response.success) {
        toast.success(`Recovery ${method} sent successfully!`);

        // Reload the data
        await loadAbandonedCarts();
        await loadStats();
      } else {
        toast.error(response.message || `Failed to send recovery ${method}`);
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to send recovery ${method}`);
    } finally {
      setActionLoading(null);
    }
  };

  const recoverCart = async (recoveryLink: string) => {
    window.location.href = recoveryLink;
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

  const getRecoveryProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-yellow-500';
    if (probability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return 'bg-purple-500';
      case 'high_value': return 'bg-blue-500';
      case 'repeat': return 'bg-green-500';
      case 'new': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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
        <span className="ml-2">Loading cart recovery data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cart Recovery</h1>
          <p className="text-muted-foreground">
            Manage and recover abandoned shopping carts
          </p>
        </div>
        <Button onClick={() => loadAbandonedCarts()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Carts</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_carts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active carts in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abandoned Carts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.abandoned_carts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.abandonment_rate}% abandonment rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovered Carts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recovered_carts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recovery_rate}% recovery rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.revenue_potential)}</div>
              <p className="text-xs text-muted-foreground">
                Potential revenue to recover
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abandoned Carts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Abandoned Carts ({abandonedCarts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {abandonedCarts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No Abandoned Carts</h3>
              <p className="text-muted-foreground">
                Great! All carts are currently active or have been recovered.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {abandonedCarts.map((cart) => (
                <div key={cart.id} className="border rounded-lg p-4 space-y-4">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">Cart #{cart.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cart.total_items} items • {formatCurrency(cart.total_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Recovery Probability */}
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <Badge
                          variant="secondary"
                          className={`${getRecoveryProbabilityColor(cart.recovery_probability)} text-white`}
                        >
                          {cart.recovery_probability}% chance
                        </Badge>
                      </div>

                      {/* Customer Segment */}
                      <Badge
                        variant="outline"
                        className={`${getSegmentColor(cart.customer_segment)} text-white border-0`}
                      >
                        {cart.customer_segment}
                      </Badge>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Items in Cart:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cart.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <span className="flex-1 truncate">{item.product_name}</span>
                          <span className="text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recovery Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Abandoned {formatDate(cart.abandoned_at)}
                      {cart.recovery_link_expires_at && (
                        <span className="block">
                          Recovery link expires {formatDate(cart.recovery_link_expires_at)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Manual Recovery */}
                      <Button
                        size="sm"
                        onClick={() => recoverCart(cart.recovery_link)}
                        disabled={!cart.recovery_link}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Recover Cart
                      </Button>

                      {/* Send Recovery Email */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerRecovery(cart.id, 'email')}
                        disabled={actionLoading === cart.id}
                      >
                        {actionLoading === cart.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Send Recovery SMS */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerRecovery(cart.id, 'sms')}
                        disabled={actionLoading === cart.id}
                      >
                        {actionLoading === cart.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <MessageCircle className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Send Push Notification */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerRecovery(cart.id, 'push')}
                        disabled={actionLoading === cart.id}
                      >
                        {actionLoading === cart.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}