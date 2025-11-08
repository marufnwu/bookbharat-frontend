'use client';

import React from 'react';
import { Star, Quote, Verified } from 'lucide-react';
import { useHomepageLayout } from '@/contexts/SiteConfigContext';
import { Testimonial } from '@/lib/site-config';

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showRating?: boolean;
  autoRotate?: boolean;
  className?: string;
}

export function TestimonialsSection({
  title = "What Our Customers Say",
  subtitle = "Join thousands of satisfied book lovers",
  limit = 6,
  showRating = true,
  autoRotate = true,
  className = ""
}: TestimonialsSectionProps) {
  const { testimonials } = useHomepageLayout();

  const [activeIndex, setActiveIndex] = React.useState(0);

  // Filter active and featured testimonials, then apply limit
  const displayedTestimonials = React.useMemo(() => {
    return testimonials
      ?.filter(testimonial => testimonial.active && testimonial.featured)
      .slice(0, limit) || [];
  }, [testimonials, limit]);

  // Auto-rotate functionality
  React.useEffect(() => {
    if (!autoRotate || displayedTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayedTestimonials.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [autoRotate, displayedTestimonials.length]);

  if (!displayedTestimonials || displayedTestimonials.length === 0) {
    return null; // Don't render anything if no testimonials
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section className={`py-16 md:py-20 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        {displayedTestimonials.length > 1 ? (
          // Grid layout for multiple testimonials
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 ${
                  index === activeIndex ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {testimonial.customer_image ? (
                      <img
                        src={testimonial.customer_image}
                        alt={testimonial.customer_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-semibold text-lg">
                          {testimonial.customer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.customer_name}
                      </h4>
                      {testimonial.verified_purchase && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Verified className="h-3 w-3" />
                          <span>Verified Purchase</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Quote className="h-5 w-5 text-gray-300 flex-shrink-0" />
                </div>

                {/* Rating */}
                {showRating && (
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                )}

                {/* Testimonial Content */}
                <blockquote className="text-gray-700 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Date */}
                <div className="text-sm text-gray-500">
                  {formatDate(testimonial.date)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Featured single testimonial layout
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                {displayedTestimonials[0].customer_image ? (
                  <img
                    src={displayedTestimonials[0].customer_image}
                    alt={displayedTestimonials[0].customer_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 font-semibold text-2xl">
                      {displayedTestimonials[0].customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {displayedTestimonials[0].customer_name}
                  </h4>
                  {displayedTestimonials[0].verified_purchase && (
                    <div className="flex items-center justify-center md:justify-start gap-1 text-green-600 mb-2">
                      <Verified className="h-4 w-4" />
                      <span>Verified Purchase</span>
                    </div>
                  )}
                  {showRating && (
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      {renderStars(displayedTestimonials[0].rating)}
                    </div>
                  )}
                </div>
              </div>

              <blockquote className="text-xl md:text-2xl text-gray-800 mb-6 leading-relaxed text-center italic">
                "{displayedTestimonials[0].content}"
              </blockquote>

              <div className="text-center text-gray-500">
                {formatDate(displayedTestimonials[0].date)}
              </div>
            </div>
          </div>
        )}

        {/* Carousel Indicators for multiple testimonials */}
        {displayedTestimonials.length > 1 && autoRotate && (
          <div className="flex justify-center mt-8 gap-2">
            {displayedTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}