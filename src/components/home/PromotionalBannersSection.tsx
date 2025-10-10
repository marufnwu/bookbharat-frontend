'use client';

import { useEffect, useState } from 'react';
import {
  Truck,
  Shield,
  Headphones,
  Package,
  Award,
  Clock,
  LucideIcon,
} from 'lucide-react';
import { promotionalBannersApi } from '@/lib/api';

interface PromotionalBanner {
  id: number;
  title: string;
  description?: string;
  icon: string;
  icon_color: string;
  background_color?: string;
  link_url?: string;
  link_text?: string;
  is_active: boolean;
  order: number;
}

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  shield: Shield,
  headphones: Headphones,
  package: Package,
  award: Award,
  clock: Clock,
};

export function PromotionalBannersSection() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await promotionalBannersApi.getActivePromotionalBanners();
        if (response.success && response.data) {
          setBanners(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch promotional banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null; // Don't render anything if no banners
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => {
            const IconComponent = iconMap[banner.icon] || Package;
            const content = (
              <div
                className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{
                  backgroundColor: banner.background_color || 'white',
                }}
              >
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: `${banner.icon_color}15`,
                    color: banner.icon_color,
                  }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {banner.description}
                    </p>
                  )}
                  {banner.link_text && (
                    <span className="text-xs font-medium mt-2 inline-block" style={{ color: banner.icon_color }}>
                      {banner.link_text} →
                    </span>
                  )}
                </div>
              </div>
            );

            if (banner.link_url) {
              return (
                <a
                  key={banner.id}
                  href={banner.link_url}
                  className="block focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ '--tw-ring-color': banner.icon_color } as React.CSSProperties}
                >
                  {content}
                </a>
              );
            }

            return <div key={banner.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}

