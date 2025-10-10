import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  Award,
  Target,
  Heart,
  Shield,
  Truck,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about BookBharat - Your trusted knowledge partner since 2014',
};

async function getAboutContent() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuration/content-page/about`, {
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
    console.error('Error fetching about content:', error);
  }
  return null;
}

export default async function AboutPage() {
  const contentData = await getAboutContent();

  // Use API content if available, otherwise fallback to defaults
  const content = contentData?.content || {};

  const stats = content.stats || [
    { label: 'Books Available', value: '500K+', icon: 'BookOpen' },
    { label: 'Happy Customers', value: '100K+', icon: 'Users' },
    { label: 'Years of Trust', value: '10+', icon: 'Award' },
    { label: 'Countries Served', value: '25+', icon: 'Globe' },
  ];

  const values = content.values || [
    {
      icon: 'Heart',
      title: 'Customer First',
      description: 'Every decision we make is centered around providing the best experience for our customers.'
    },
    {
      icon: 'Shield',
      title: 'Quality Assurance',
      description: 'We ensure all books are authentic and in perfect condition before delivery.'
    },
    {
      icon: 'Truck',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to get your books to you as soon as possible.'
    },
    {
      icon: 'Star',
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service and customer experience.'
    }
  ];

  const team = content.team || [
    {
      name: 'Rajesh Sharma',
      role: 'Founder & CEO',
      description: 'Passionate about books and technology with 15+ years in e-commerce.',
    },
    {
      name: 'Priya Patel',
      role: 'Head of Operations',
      description: 'Expert in logistics and supply chain management with a love for literature.',
    },
    {
      name: 'Amit Kumar',
      role: 'Technology Lead',
      description: 'Full-stack engineer dedicated to building exceptional user experiences.',
    },
    {
      name: 'Sneha Gupta',
      role: 'Customer Experience',
      description: 'Ensures every customer interaction is positive and memorable.',
    }
  ];

  const milestones = content.milestones || [
    {
      year: '2014',
      title: 'Founded BookBharat',
      description: 'Started as a small online bookstore with 1,000 titles'
    },
    {
      year: '2016',
      title: 'Expanded Catalog',
      description: 'Reached 50,000+ books across multiple categories'
    },
    {
      year: '2018',
      title: 'Pan-India Delivery',
      description: 'Extended delivery network to cover all major cities'
    },
    {
      year: '2020',
      title: '100K Customers',
      description: 'Celebrated serving 100,000+ happy customers'
    },
    {
      year: '2022',
      title: 'International Shipping',
      description: 'Started delivering books to 25+ countries worldwide'
    },
    {
      year: '2024',
      title: '500K+ Books',
      description: 'Now offering over 500,000 titles in multiple languages'
    }
  ];

  const recognition = content.recognition || [
    { award: 'Best E-commerce Platform 2023', organization: 'Digital India Awards' },
    { award: 'Customer Choice Award 2022', organization: 'E-commerce Excellence' },
    { award: 'Innovation in Delivery 2021', organization: 'Logistics India' },
  ];

  // Map icon names to components
  const iconMap: Record<string, any> = {
    BookOpen, Users, Award, Target, Heart, Shield, Truck, Globe, Star
  };

  // Dynamic content from API or defaults
  const heroTitle = content.heroTitle || "Your Knowledge Partner Since 2014";
  const heroSubtitle = content.heroSubtitle || "BookBharat is India's leading online bookstore, connecting millions of readers with their next great read. We believe in the power of books to transform lives and build communities.";
  const mission = content.mission || "To make quality books accessible to everyone, everywhere. We strive to be the bridge between knowledge seekers and the vast world of literature, ensuring that great books reach every corner of India and beyond.";
  const vision = content.vision || "To create a world where every person has access to the knowledge and stories that can enrich their lives. We envision BookBharat as the most trusted and beloved bookstore, fostering a culture of reading and learning.";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span>About Us</span>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          {heroTitle.split('Knowledge').reduce((acc: (JSX.Element | string)[], part, idx) => {
            if (idx === 0) return [part];
            return acc.concat(<span key={`k${idx}`} className="text-primary">Knowledge</span>, part);
          }, [])}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {heroSubtitle}
        </p>
        <Button size="lg" asChild>
          <Link href="/products">
            Explore Our Collection
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map((stat: any, index: number) => {
          const Icon = iconMap[stat.icon] || BookOpen;
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-8">
                <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mission & Vision */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Target className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {mission}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-8">
            <div className="flex items-center mb-4">
              <Star className="h-6 w-6 text-accent mr-2" />
              <h2 className="text-2xl font-bold">Our Vision</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {vision}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These principles guide everything we do and shape our relationship with customers, partners, and the community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value: any, index: number) => {
            const Icon = iconMap[value.icon] || Heart;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From a small startup to India's leading online bookstore, here's how we've grown over the years.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border"></div>
          <div className="space-y-12">
            {milestones.map((milestone: any, index: number) => (
              <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{milestone.year}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The passionate people behind BookBharat who work tirelessly to bring you the best book-buying experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member: any, index: number) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary text-sm mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recognition Section */}
      <div className="mb-16 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Recognition & Awards</h2>
          <p className="text-muted-foreground">
            We're proud to be recognized by industry leaders and customers alike.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recognition.map((item: any, index: number) => (
            <div key={index} className="text-center">
              <Award className="h-12 w-12 text-accent mx-auto mb-3" />
              <h4 className="font-semibold text-foreground mb-1">{item.award}</h4>
              <p className="text-sm text-muted-foreground">{item.organization}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-primary text-primary-foreground rounded-2xl p-12">
        <h2 className="text-3xl font-bold mb-4">Join Our Reading Community</h2>
        <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
          Discover your next favorite book and connect with millions of readers who trust BookBharat
          for your literary journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/products">
              Start Shopping
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/contact">
              Get in Touch
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
