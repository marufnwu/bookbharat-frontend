'use client';

import { useState, useEffect } from 'react';
import { useHeroContent, useSiteInfo } from '@/contexts/SiteConfigContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Shield, Truck, Star } from 'lucide-react';

export function DynamicHero() {
  const heroConfig = useHeroContent();
  const siteInfo = useSiteInfo();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback hero content
  const fallbackHero = {
    title: 'Welcome to BookBharat',
    subtitle: 'Your Knowledge Partner for Life',
    description: 'Discover millions of books from thousands of authors. Fast delivery, secure payment, and best prices guaranteed.',
    image: '/images/default-hero.jpg',
    button_text: 'Shop Now',
    button_url: '/products',
    secondary_button_text: 'View Categories',
    secondary_button_url: '/categories',
    background_color: '#f8fafc',
    trust_badges: {
      enabled: true,
      badges: [
        { icon: 'truck', text: 'Fast Delivery' },
        { icon: 'shield', text: 'Secure Payment' },
        { icon: 'star', text: 'Best Prices' },
      ],
    },
    countdown_timer: null,
  };

  const hero = heroConfig || fallbackHero;

  if (!mounted) {
    return (
      <div className="relative h-96 bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="animate-pulse">
            <div className="h-12 bg-white bg-opacity-20 rounded w-64 mb-4" />
            <div className="h-6 bg-white bg-opacity-20 rounded w-96 mb-6" />
            <div className="h-10 bg-white bg-opacity-20 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  const renderTrustBadge = (badge: { icon: string; text: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
      truck: <Truck className="h-5 w-5" />,
      shield: <Shield className="h-5 w-5" />,
      star: <Star className="h-5 w-5" />,
      clock: <Clock className="h-5 w-5" />,
    };

    return (
      <div key={badge.text} className="flex items-center space-x-2 text-sm">
        <span className="text-blue-200">{iconMap[badge.icon]}</span>
        <span className="text-white">{badge.text}</span>
      </div>
    );
  };

  const renderCountdownTimer = () => {
    if (!hero.countdown_timer || !hero.countdown_timer.enabled) return null;

    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      if (!hero.countdown_timer?.enabled || !hero.countdown_timer?.end_time) return;

      const calculateTimeLeft = () => {
        const difference = new Date(hero.countdown_timer!.end_time).getTime() - new Date().getTime();

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }, [hero.countdown_timer]);

    const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;

    if (totalSeconds <= 0) return null;

    return (
      <div className="mb-6">
        <p className="text-sm text-blue-100 mb-2">{hero.countdown_timer.text}</p>
        <div className="flex items-center space-x-4">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="text-center">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-2xl font-bold text-white">{String(value).padStart(2, '0')}</div>
              </div>
              <div className="text-xs text-blue-100 mt-1 capitalize">{unit}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: hero.background_color || '#f8fafc' }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90" />

      {/* Background image */}
      {hero.image && (
        <img
          src={hero.image}
          alt={hero.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Video background */}
      {hero.video_url && (
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={hero.video_url} type="video/mp4" />
          </video>
        </div>
      )}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              {hero.title}
            </h1>

            <p className="text-xl lg:text-2xl mb-6 text-blue-100">
              {hero.subtitle}
            </p>

            <p className="text-lg mb-8 text-blue-100 leading-relaxed">
              {hero.description}
            </p>

            {/* Countdown Timer */}
            {renderCountdownTimer()}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-lg"
                onClick={() => window.location.href = hero.button_url}
              >
                {hero.button_text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {hero.secondary_button_text && (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg"
                  onClick={() => window.location.href = hero.secondary_button_url!}
                >
                  {hero.secondary_button_text}
                </Button>
              )}
            </div>

            {/* Trust Badges */}
            {hero.trust_badges?.enabled && hero.trust_badges.badges.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hero.trust_badges.badges.map((badge) => renderTrustBadge(badge))}
              </div>
            )}
          </div>

          {/* Spacer for mobile */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white fill-current"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
        >
          <path d="M0,64 L1440,64 L1440,32 C1200,64 960,48 720,32 C480,16 240,0 0,32 Z" />
        </svg>
      </div>
    </div>
  );
}