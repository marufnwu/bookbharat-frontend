'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  CreditCard,
  Globe,
  Mail,
  Truck,
  Shield,
  Database,
  Users,
  Palette,
  Bell,
  Key,
  Server,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Types for settings
interface GeneralSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  admin_email: string;
  contact_email: string;
  phone: string;
  address: string;
  timezone: string;
  currency: string;
  language: string;
}

interface PaymentGateway {
  id: number;
  keyword: string;
  name: string;
  description: string;
  is_active: boolean;
  is_production: boolean;
  supported_currencies: string[];
  configuration: Record<string, any>;
  priority: number;
}

interface SettingsData {
  general: GeneralSettings;
  payment_gateways: PaymentGateway[];
  stats: {
    active_gateways: number;
    production_gateways: number;
    total_gateways: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // Fetch general settings
      const generalResponse = await fetch('/api/admin/settings/general', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // Fetch payment settings
      const paymentResponse = await fetch('/api/admin/settings/payment', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const generalResult = generalResponse.ok ? await generalResponse.json() : { success: false };
      const paymentResult = paymentResponse.ok ? await paymentResponse.json() : { success: false };

      if (generalResult.success && paymentResult.success) {
        setSettings({
          general: generalResult.settings.general || {
            site_name: 'BookBharat',
            site_description: 'Your favorite online bookstore',
            site_url: 'https://bookbharat.com',
            admin_email: 'admin@bookbharat.com',
            contact_email: 'contact@bookbharat.com',
            phone: '+91 12345 67890',
            address: 'Mumbai, India',
            timezone: 'Asia/Kolkata',
            currency: 'INR',
            language: 'en'
          },
          payment_gateways: paymentResult.data?.payment_settings || [],
          stats: paymentResult.data?.stats || {
            active_gateways: 0,
            production_gateways: 0,
            total_gateways: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGeneralSettings = async (updatedSettings: Partial<GeneralSettings>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/general', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ settings: updatedSettings }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Success",
            description: "Settings updated successfully",
          });
          fetchSettings(); // Refresh settings
        }
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePaymentGateway = async (gateway: PaymentGateway) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/payment-settings/${gateway.id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
          });
          fetchSettings(); // Refresh settings
        }
      } else {
        throw new Error('Failed to toggle gateway');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle payment gateway",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSecretVisibility = (gatewayId: number) => {
    setShowSecrets(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const maskSecret = (secret: string, show: boolean) => {
    if (show || !secret) return secret;
    return '*'.repeat(Math.min(secret.length, 20));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Failed to Load Settings</h1>
          <p className="text-muted-foreground mb-4">There was an error loading the settings.</p>
          <Button onClick={fetchSettings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure your site settings and preferences</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Gateways</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.stats.active_gateways}</div>
            <p className="text-xs text-muted-foreground">Active gateways</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Mode</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{settings.stats.production_gateways}</div>
            <p className="text-xs text-muted-foreground">Live gateways</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currency</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.general.currency}</div>
            <p className="text-xs text-muted-foreground">Base currency</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="mail" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure basic site information and preferences
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={settings.general.site_name}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, site_name: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="site_description">Site Description</Label>
                    <Input
                      id="site_description"
                      value={settings.general.site_description}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, site_description: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="site_url">Site URL</Label>
                    <Input
                      id="site_url"
                      value={settings.general.site_url}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, site_url: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_email">Admin Email</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={settings.general.admin_email}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, admin_email: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.general.phone}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, phone: e.target.value }
                      } : null)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.general.contact_email}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, contact_email: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={settings.general.address}
                      onChange={(e) => setSettings(prev => prev ? {
                        ...prev,
                        general: { ...prev.general, address: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.general.timezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.general.currency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.general.language}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex justify-end">
                <Button
                  onClick={() => updateGeneralSettings(settings.general)}
                  disabled={saving}
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateways
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage payment gateways and their configurations
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {settings.payment_gateways.map((gateway) => (
                  <div key={gateway.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">{gateway.name}</h3>
                          <p className="text-sm text-muted-foreground">{gateway.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={gateway.is_active ? "default" : "secondary"}>
                          {gateway.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={gateway.is_production ? "destructive" : "outline"}>
                          {gateway.is_production ? "Production" : "Test"}
                        </Badge>
                        <Switch
                          checked={gateway.is_active}
                          onCheckedChange={() => togglePaymentGateway(gateway)}
                          disabled={saving}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Priority:</span>
                        <span className="ml-2 font-mono">{gateway.priority}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Currencies:</span>
                        <span className="ml-2">{gateway.supported_currencies.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="ml-2">
                          {gateway.is_active ? (
                            <CheckCircle className="h-4 w-4 inline text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 inline text-orange-600" />
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Configuration Display (Read-only for now) */}
                    {gateway.configuration && Object.keys(gateway.configuration).length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <Key className="h-4 w-4" />
                          <span className="font-medium">Configuration</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(gateway.id)}
                          >
                            {showSecrets[gateway.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {Object.entries(gateway.configuration).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-mono text-xs">
                                {typeof value === 'string' && (key.includes('key') || key.includes('secret') || key.includes('salt'))
                                  ? maskSecret(value, showSecrets[gateway.id] || false)
                                  : String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Link href="/admin/payments">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Payment Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs for other settings */}
        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Email configuration settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Shipping configuration settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced system settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}