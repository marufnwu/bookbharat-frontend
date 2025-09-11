'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HeadphonesIcon,
  Users,
  BookOpen,
  HelpCircle,
  Send
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const categories = [
    { value: 'order', label: 'Order Support' },
    { value: 'shipping', label: 'Shipping & Delivery' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'technical', label: 'Technical Issues' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
  ];

  const onSubmit = async (data: ContactForm) => {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Contact form submitted:', data);
      reset();
      // Show success message
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions or need help? We're here to assist you. Get in touch with our team.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HeadphonesIcon className="h-5 w-5 mr-2" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Customer Support</p>
                  <p className="text-sm text-muted-foreground">+91 12345 67890</p>
                  <p className="text-xs text-muted-foreground">Mon-Sat: 9:00 AM - 8:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@bookbharat.com</p>
                  <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available on website</p>
                  <p className="text-xs text-muted-foreground">Mon-Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Office Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Our Office
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">BookBharat Headquarters</p>
                <p className="text-sm text-muted-foreground">
                  Level 5, Tower A<br />
                  Business Park, Andheri East<br />
                  Mumbai, Maharashtra 400069<br />
                  India
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Link */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Need quick answers?</p>
                  <p className="text-sm text-muted-foreground">Check our FAQ section</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    {...register('name')}
                    label="Your Name"
                    placeholder="Enter your full name"
                    error={errors.name?.message}
                    required
                  />
                  <Input
                    {...register('email')}
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    error={errors.email?.message}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    {...register('subject')}
                    label="Subject"
                    placeholder="Brief description of your inquiry"
                    error={errors.subject?.message}
                    required
                  />
                  <Select
                    {...register('category')}
                    label="Category"
                    options={categories}
                    error={errors.category?.message}
                    required
                  />
                </div>

                <Textarea
                  {...register('message')}
                  label="Message"
                  placeholder="Please provide details about your inquiry..."
                  rows={6}
                  error={errors.message?.message}
                  required
                />

                <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Support Categories */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-6">Common Support Categories</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  icon: BookOpen,
                  title: 'Order Support',
                  description: 'Help with placing orders, order status, and modifications'
                },
                {
                  icon: MapPin,
                  title: 'Shipping & Delivery',
                  description: 'Questions about delivery times, shipping costs, and tracking'
                },
                {
                  icon: Users,
                  title: 'Returns & Refunds',
                  description: 'Information about our return policy and refund process'
                },
                {
                  icon: HelpCircle,
                  title: 'Technical Issues',
                  description: 'Website problems, account issues, and technical support'
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Support */}
      <div className="mt-16 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-4">Need Immediate Help?</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          For urgent matters or immediate assistance, you can also reach us through these channels:
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call Now: +91 12345 67890
          </Button>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Start Live Chat
          </Button>
        </div>
      </div>
    </div>
  );
}