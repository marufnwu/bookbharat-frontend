'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Settings,
  Eye,
  EyeOff,
  Edit,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Banknote,
  Smartphone,
  Building,
  Globe,
  Shield,
  Key,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Types for payment settings
interface PaymentSetting {
  id: number;
  keyword: string;
  name: string;
  description: string;
  is_active: boolean;
  is_production: boolean;
  supported_currencies: string[];
  configuration: Record<string, any>;
  webhook_config: Record<string, any>;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface PaymentConfiguration {
  id: number;
  payment_method: string;
  display_name: string;
  description: string;
  is_enabled: boolean;
  priority: number;
  configuration: Record<string, any>;
  restrictions: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface PaymentData {
  payment_settings: PaymentSetting[];
  payment_methods: PaymentConfiguration[];
  stats: {
    active_gateways: number;
    enabled_methods: number;
    production_gateways: number;
  };
}

const PaymentIcon = ({ gateway }: { gateway: string }) => {
  switch (gateway.toLowerCase()) {
    case 'razorpay':
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    case 'payu':
      return <Banknote className="h-5 w-5 text-green-600" />;
    case 'cashfree':
      return <Smartphone className="h-5 w-5 text-purple-600" />;
    case 'phonepe':
      return <Smartphone className="h-5 w-5 text-violet-600" />;
    case 'cod':
      return <Building className="h-5 w-5 text-orange-600" />;
    case 'stripe':
      return <Globe className="h-5 w-5 text-indigo-600" />;
    default:
      return <CreditCard className="h-5 w-5 text-gray-600" />;
  }
};

export default function PaymentSettingsPage() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentSetting | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Fetch payment settings
  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/payment', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPaymentData(result.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load payment settings",
          });
        }
      } else {
        throw new Error('Failed to fetch payment settings');
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleGateway = async (gateway: PaymentSetting) => {
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
          fetchPaymentSettings(); // Refresh data
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

  const updateGateway = async (gateway: PaymentSetting, updates: Partial<PaymentSetting>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/payment-settings/${gateway.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Success",
            description: "Gateway settings updated successfully",
          });
          fetchPaymentSettings(); // Refresh data
          setEditingGateway(null);
        }
      } else {
        throw new Error('Failed to update gateway');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update gateway settings",
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
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Failed to Load Payment Settings</h1>
          <p className="text-muted-foreground mb-4">There was an error loading the payment configuration.</p>
          <Button onClick={fetchPaymentSettings}>Try Again</Button>
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
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">Manage payment gateways and configurations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Gateways</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paymentData.stats.active_gateways}</div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Mode</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{paymentData.stats.production_gateways}</div>
            <p className="text-xs text-muted-foreground">Live gateways</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{paymentData.stats.enabled_methods}</div>
            <p className="text-xs text-muted-foreground">Available to customers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gateways" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        {/* Payment Gateways Tab */}
        <TabsContent value="gateways">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Gateways Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage API keys, settings, and availability for payment gateways
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Currencies</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentData.payment_settings.map((gateway) => (
                    <TableRow key={gateway.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <PaymentIcon gateway={gateway.keyword} />
                          <div>
                            <div className="font-medium">{gateway.name}</div>
                            <div className="text-sm text-muted-foreground">{gateway.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={gateway.is_active}
                            onCheckedChange={() => toggleGateway(gateway)}
                            disabled={saving}
                          />
                          <Badge variant={gateway.is_active ? "default" : "secondary"}>
                            {gateway.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={gateway.is_production ? "destructive" : "outline"}>
                          {gateway.is_production ? "Production" : "Test"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{gateway.priority}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {gateway.supported_currencies.map((currency) => (
                            <Badge key={currency} variant="outline" className="text-xs">
                              {currency}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingGateway(gateway)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Configure
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <PaymentIcon gateway={gateway.keyword} />
                                Configure {gateway.name}
                              </DialogTitle>
                              <DialogDescription>
                                Update API credentials and gateway settings
                              </DialogDescription>
                            </DialogHeader>
                            {editingGateway && (
                              <GatewayConfigForm
                                gateway={editingGateway}
                                onSave={(updates) => updateGateway(editingGateway, updates)}
                                onCancel={() => setEditingGateway(null)}
                                showSecrets={showSecrets[editingGateway.id] || false}
                                onToggleSecrets={() => toggleSecretVisibility(editingGateway.id)}
                                saving={saving}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payment Methods Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure order-specific payment method rules and restrictions
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Min Amount</TableHead>
                    <TableHead>Max Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentData.payment_methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{method.display_name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={method.is_enabled ? "default" : "secondary"}>
                          {method.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{method.priority}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          ₹{method.restrictions?.min_order_amount || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {method.restrictions?.max_order_amount ? `₹${method.restrictions.max_order_amount}` : 'No limit'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Gateway Configuration Form Component
interface GatewayConfigFormProps {
  gateway: PaymentSetting;
  onSave: (updates: Partial<PaymentSetting>) => void;
  onCancel: () => void;
  showSecrets: boolean;
  onToggleSecrets: () => void;
  saving: boolean;
}

function GatewayConfigForm({ gateway, onSave, onCancel, showSecrets, onToggleSecrets, saving }: GatewayConfigFormProps) {
  const [formData, setFormData] = useState({
    name: gateway.name,
    description: gateway.description,
    is_active: gateway.is_active,
    is_production: gateway.is_production,
    priority: gateway.priority,
    configuration: { ...gateway.configuration },
  });

  const handleSave = () => {
    onSave(formData);
  };

  const updateConfig = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: value
      }
    }));
  };

  const renderConfigFields = () => {
    switch (gateway.keyword) {
      case 'razorpay':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="razorpay_key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="razorpay_key"
                  type={showSecrets ? "text" : "password"}
                  value={formData.configuration.key || ''}
                  onChange={(e) => updateConfig('key', e.target.value)}
                  placeholder="rzp_test_xxxxx"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSecrets}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="razorpay_secret">API Secret</Label>
              <Input
                id="razorpay_secret"
                type={showSecrets ? "text" : "password"}
                value={formData.configuration.secret || ''}
                onChange={(e) => updateConfig('secret', e.target.value)}
                placeholder="Enter Razorpay secret key"
              />
            </div>
            <div>
              <Label htmlFor="razorpay_webhook">Webhook Secret (Optional)</Label>
              <Input
                id="razorpay_webhook"
                type={showSecrets ? "text" : "password"}
                value={formData.configuration.webhook_secret || ''}
                onChange={(e) => updateConfig('webhook_secret', e.target.value)}
                placeholder="Enter webhook secret"
              />
            </div>
          </div>
        );

      case 'payu':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="payu_key">Merchant Key</Label>
              <Input
                id="payu_key"
                type={showSecrets ? "text" : "password"}
                value={formData.configuration.merchant_key || ''}
                onChange={(e) => updateConfig('merchant_key', e.target.value)}
                placeholder="Enter PayU merchant key"
              />
            </div>
            <div>
              <Label htmlFor="payu_salt">Merchant Salt</Label>
              <Input
                id="payu_salt"
                type={showSecrets ? "text" : "password"}
                value={formData.configuration.salt || ''}
                onChange={(e) => updateConfig('salt', e.target.value)}
                placeholder="Enter PayU salt"
              />
            </div>
          </div>
        );

      case 'cashfree':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cashfree_id">Client ID</Label>
              <Input
                id="cashfree_id"
                type={showSecrets ? "text" : "password"}
                value={formData.configuration.app_id || ''}
                onChange={(e) => updateConfig('app_id', e.target.value)}
                placeholder="Enter Cashfree client ID"
              />
            </div>
            <div>
              <Label htmlFor="cashfree_secret">Secret Key</Label>
              <Input
                id="cashfree_secret"
                type={showSecrets ? "text" : "password"}
                value={formData.configuration.secret_key || ''}
                onChange={(e) => updateConfig('secret_key', e.target.value)}
                placeholder="Enter Cashfree secret key"
              />
            </div>
          </div>
        );

      case 'cod':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cod_charge">Service Charge (₹)</Label>
              <Input
                id="cod_charge"
                type="number"
                value={formData.configuration.service_charge || 0}
                onChange={(e) => updateConfig('service_charge', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="cod_min">Minimum Order Amount (₹)</Label>
              <Input
                id="cod_min"
                type="number"
                value={formData.configuration.min_order_amount || 0}
                onChange={(e) => updateConfig('min_order_amount', parseInt(e.target.value) || 0)}
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="cod_max">Maximum Order Amount (₹)</Label>
              <Input
                id="cod_max"
                type="number"
                value={formData.configuration.max_order_amount || 0}
                onChange={(e) => updateConfig('max_order_amount', parseInt(e.target.value) || 0)}
                placeholder="50000"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            No specific configuration available for this gateway.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gateway_name">Gateway Name</Label>
          <Input
            id="gateway_name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="gateway_desc">Description</Label>
        <Input
          id="gateway_desc"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_production"
            checked={formData.is_production}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_production: checked }))}
          />
          <Label htmlFor="is_production">Production Mode</Label>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-4 w-4" />
          <h4 className="font-medium">API Configuration</h4>
        </div>
        {renderConfigFields()}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
}