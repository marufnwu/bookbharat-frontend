import { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  HeadphonesIcon,
  HelpCircle,
  Users,
  BookOpen
} from 'lucide-react';

// CRITICAL: Force dynamic rendering to prevent build timeout
// Backend API is not accessible during Docker build isolation
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with BookBharat. We\'re here to help!',
};

async function getContactInfo() {
  try {
    // Fetch site configuration for contact details
    const configResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuration/site-config`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
      },
    });

    if (configResponse.ok) {
      const configData = await configResponse.json();
      return configData.data;
    }
  } catch (error) {
    console.error('Error fetching contact info:', error);
  }

  // Return default values if API fails
  return {
    contact: {
      phone: '+91 12345 67890',
      email: 'support@bookbharat.com',
      address: {
        line1: 'Level 5, Tower A',
        line2: 'Business Park, Andheri East',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400069',
        country: 'India'
      }
    },
    support_hours: {
      weekdays: '9:00 AM - 8:00 PM',
      saturday: '9:00 AM - 6:00 PM',
      sunday: 'Closed'
    }
  };
}

async function getContactPageContent() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuration/content-page/contact`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
  } catch (error) {
    console.error('Error fetching contact page content:', error);
  }
  return null;
}

export default async function ContactPage() {
  const [siteConfig, pageContent] = await Promise.all([
    getContactInfo(),
    getContactPageContent()
  ]);

  const content = pageContent?.content || {};
  const contact = siteConfig?.contact || {};
  const supportHours = siteConfig?.support_hours || {};

  // Use content from API if available
  const pageTitle = content.title || 'We\'d Love to Hear From You';
  const pageSubtitle = content.subtitle || 'Have a question, feedback, or need assistance? We\'re here to help! Reach out to us using any of the methods below.';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {pageSubtitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>

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
                  <p className="text-sm text-muted-foreground">{contact.phone || '+91 12345 67890'}</p>
                  <p className="text-xs text-muted-foreground">Mon-Sat: {supportHours.weekdays || '9:00 AM - 8:00 PM'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">{contact.email || 'support@bookbharat.com'}</p>
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
                  {contact.address?.line1 || 'Level 5, Tower A'}<br />
                  {contact.address?.line2 || 'Business Park, Andheri East'}<br />
                  {contact.address?.city || 'Mumbai'}, {contact.address?.state || 'Maharashtra'} {contact.address?.pincode || '400069'}<br />
                  {contact.address?.country || 'India'}
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
                  <span className="font-medium">{supportHours.weekdays || '9:00 AM - 8:00 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">{supportHours.saturday || '9:00 AM - 6:00 PM'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-muted-foreground">{supportHours.sunday || 'Closed'}</span>
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
      </div>

      {/* Additional Info */}
      <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
        {content.features?.map((feature: any, index: number) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {feature.icon === 'users' ? <Users className="h-6 w-6 text-primary" /> :
                  feature.icon === 'book' ? <BookOpen className="h-6 w-6 text-primary" /> :
                    <HeadphonesIcon className="h-6 w-6 text-primary" />}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        )) || (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Customer First</h3>
                  <p className="text-sm text-muted-foreground">Your satisfaction is our top priority</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Quick Response</h3>
                  <p className="text-sm text-muted-foreground">We respond within 24 hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeadphonesIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Expert Support</h3>
                  <p className="text-sm text-muted-foreground">Knowledgeable team ready to help</p>
                </CardContent>
              </Card>
            </>
          )}
      </div>
    </div>
  );
}