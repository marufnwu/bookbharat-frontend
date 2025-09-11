'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/contexts/ConfigContext';
import { userApi, orderApi } from '@/lib/api';
import { User as UserType, Order } from '@/types';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  ShoppingBag,
  Clock,
  Settings,
  CreditCard,
  Bell,
  Shield,
  Edit2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import AddressManager from '@/components/AddressManager';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0
  });
  const [error, setError] = useState<string | null>(null);
  const { siteConfig } = useConfig();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '9876543210', // Mock data
    },
  });

  // Mock user data
  const userData = {
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+91 9876543210',
    joinDate: '2023-03-15',
    totalOrders: 24,
    totalSpent: 12450,
    wishlistCount: 8,
    addresses: [
      {
        id: 1,
        type: 'Home',
        address: '123, ABC Society, XYZ Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true
      },
      {
        id: 2,
        type: 'Office',
        address: '456, Business Park, Corporate Road',
        city: 'Mumbai',
        state: 'Maharashtra', 
        pincode: '400070',
        isDefault: false
      }
    ],
    recentOrders: [
      {
        id: 'ORD-2024-001',
        date: '2024-01-15',
        status: 'delivered',
        total: 1247,
        items: 3
      },
      {
        id: 'ORD-2024-002',
        date: '2024-01-10',
        status: 'shipped',
        total: 899,
        items: 2
      },
      {
        id: 'ORD-2024-003',
        date: '2024-01-08',
        status: 'processing',
        total: 567,
        items: 1
      }
    ]
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'default';
      case 'processing': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span>My Account</span>
      </nav>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
                <Badge variant="outline" className="mt-2">
                  Member since {new Date(userData.joinDate).getFullYear()}
                </Badge>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{userData.totalOrders}</div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <CreditCard className="h-8 w-8 text-success mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">₹{userData.totalSpent.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{userData.wishlistCount}</div>
                    <p className="text-sm text-muted-foreground">Wishlist Items</p>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                          reset();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                    >
                      {isEditing ? (
                        <X className="h-4 w-4 mr-2" />
                      ) : (
                        <Edit2 className="h-4 w-4 mr-2" />
                      )}
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <Input
                        {...register('name')}
                        label="Full Name"
                        error={errors.name?.message}
                        required
                      />
                      <Input
                        {...register('email')}
                        label="Email Address"
                        type="email"
                        error={errors.email?.message}
                        required
                      />
                      <Input
                        {...register('phone')}
                        label="Phone Number"
                        error={errors.phone?.message}
                        required
                      />
                      <div className="flex space-x-3">
                        <Button type="submit" loading={isLoading}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span>{userData.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{userData.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{userData.phone}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/orders">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()} • {order.items} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.total}</p>
                          <Badge variant={getStatusColor(order.status) as any} size="sm">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.recentOrders.map((order) => (
                    <div key={order.id} className="border border-border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{order.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(order.status) as any}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{order.items} items</p>
                        <div className="flex items-center space-x-3">
                          <p className="font-medium">₹{order.total}</p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'addresses' && (
            <AddressManager title="Saved Addresses" showTitle={false} />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Order updates', description: 'Get notified about order status changes' },
                    { label: 'New arrivals', description: 'Receive notifications about new books' },
                    { label: 'Price drops', description: 'Get alerts when wishlist items go on sale' },
                    { label: 'Marketing emails', description: 'Receive promotional offers and deals' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={index < 2}
                        className="rounded border-border focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Download My Data
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
            </div>
          </div>
        </div>
      );
    </ProtectedRoute>
  );
}
