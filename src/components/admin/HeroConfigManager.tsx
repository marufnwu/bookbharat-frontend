'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Eye, Edit, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface HeroConfig {
  id: number;
  variant: string;
  title: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
  } | null;
  secondaryCta: {
    text: string;
    href: string;
  } | null;
  discountBadge: {
    text: string;
    color: string;
  } | null;
  trustBadges: string[] | null;
  backgroundImage: string | null;
  testimonials: any[] | null;
  campaignData: any | null;
  categories: any[] | null;
  features: any[] | null;
  stats: any[] | null;
  featuredProducts: any[] | null;
  videoUrl: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HeroConfigManager() {
  const [configs, setConfigs] = useState<HeroConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);

      // Get auth token from localStorage
      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Please login as admin first');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/hero-config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setConfigs(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load hero configurations:', error);
      toast.error(error.response?.data?.message || 'Failed to load hero configurations');
    } finally {
      setLoading(false);
    }
  };

  const setActiveVariant = async (variant: string) => {
    try {
      setActionLoading(variant);

      // Get auth token from localStorage
      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Please login as admin first');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/admin/hero-config/set-active`,
        { variant },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Active hero variant updated successfully');
        loadConfigs();
      }
    } catch (error: any) {
      console.error('Failed to set active variant:', error);
      toast.error(error.response?.data?.message || 'Failed to set active variant');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteConfig = async (variant: string) => {
    if (!confirm(`Are you sure you want to delete the "${variant}" configuration?`)) {
      return;
    }

    try {
      setActionLoading(variant);

      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Please login as admin first');
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/admin/hero-config/${variant}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Hero configuration deleted successfully');
        loadConfigs();
      }
    } catch (error: any) {
      console.error('Failed to delete configuration:', error);
      toast.error(error.response?.data?.message || 'Failed to delete configuration');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Hero Configuration</h1>
        <p className="text-xl text-muted-foreground">
          Manage homepage hero sections and variants
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{configs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {configs.find(c => c.is_active)?.variant || 'None'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={loadConfigs}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Hero Configurations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map((config) => (
          <Card key={config.id} className={`relative ${config.is_active ? 'border-green-500 border-2' : ''}`}>
            {config.is_active && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{config.variant}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {config.title}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview Info */}
              <div className="space-y-2 text-sm">
                {config.subtitle && (
                  <p className="text-muted-foreground line-clamp-2">{config.subtitle}</p>
                )}

                {config.backgroundImage && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />
                    <span>Has background image</span>
                  </div>
                )}

                {config.primaryCta && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {config.primaryCta.text}
                    </Badge>
                  </div>
                )}

                {config.features && config.features.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {config.features.length} features
                  </div>
                )}

                {config.stats && config.stats.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {config.stats.length} stats
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {!config.is_active && (
                  <Button
                    onClick={() => setActiveVariant(config.variant)}
                    disabled={actionLoading === config.variant}
                    size="sm"
                    className="flex-1"
                  >
                    {actionLoading === config.variant ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Set Active'
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => deleteConfig(config.variant)}
                  disabled={config.is_active || actionLoading === config.variant}
                  variant="destructive"
                  size="sm"
                  title={config.is_active ? 'Cannot delete active configuration' : 'Delete configuration'}
                >
                  {actionLoading === config.variant ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No hero configurations found</p>
          <Button onClick={loadConfigs} variant="outline" className="mt-4">
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}
