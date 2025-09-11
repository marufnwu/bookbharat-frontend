'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/contexts/ConfigContext';
import { 
  Settings, 
  Palette, 
  Users, 
  Package, 
  ShoppingCart,
  BarChart3,
  FileText,
  Image,
  Monitor,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { siteConfig, loading, error } = useConfig();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Configuration</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const adminModules = [
    {
      title: 'Site Configuration',
      description: 'Manage site settings, contact info, and features',
      icon: Settings,
      href: '/admin/content',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Theme Customizer',
      description: 'Customize colors, fonts, and appearance',
      icon: Palette,
      href: '/admin/theme',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Product Management',
      description: 'Add, edit, and manage your products',
      icon: Package,
      href: '/admin/products',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Order Management',
      description: 'View and process customer orders',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'User Management',
      description: 'Manage customers and user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      title: 'Analytics',
      description: 'View sales reports and analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Content Pages',
      description: 'Edit About, Privacy, Terms pages',
      icon: FileText,
      href: '/admin/pages',
      color: 'text-slate-600',
      bgColor: 'bg-slate-100'
    },
    {
      title: 'Media Library',
      description: 'Upload and manage media files',
      icon: Image,
      href: '/admin/media',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Welcome to {siteConfig?.site.name || 'BookBharat'} Admin Panel
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Theme Status</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Custom</div>
            <p className="text-xs text-muted-foreground">
              Dynamic theming enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">Active</div>
            <p className="text-xs text-muted-foreground">
              API integration working
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, index) => {
          const IconComponent = module.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link href={module.href}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Open {module.title}
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* Configuration Preview */}
      {siteConfig && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <strong className="text-foreground">Site Name:</strong>
                <p className="text-muted-foreground">{siteConfig.site.name}</p>
              </div>
              <div>
                <strong className="text-foreground">Contact Email:</strong>
                <p className="text-muted-foreground">{siteConfig.site.contact_email}</p>
              </div>
              <div>
                <strong className="text-foreground">Primary Color:</strong>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: siteConfig.theme.primary_color }}
                  />
                  <span className="text-muted-foreground">{siteConfig.theme.primary_color}</span>
                </div>
              </div>
              <div>
                <strong className="text-foreground">Currency:</strong>
                <p className="text-muted-foreground">{siteConfig.payment.currency_symbol} {siteConfig.payment.currency}</p>
              </div>
              <div>
                <strong className="text-foreground">Free Shipping:</strong>
                <p className="text-muted-foreground">Above {siteConfig.payment.currency_symbol}{siteConfig.payment.free_shipping_threshold}</p>
              </div>
              <div>
                <strong className="text-foreground">Features Enabled:</strong>
                <p className="text-muted-foreground">
                  {Object.values(siteConfig.features).filter(Boolean).length} of {Object.keys(siteConfig.features).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}