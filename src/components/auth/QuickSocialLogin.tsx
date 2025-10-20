'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import { useAnalytics } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';
import { 
  Chrome,
  Facebook,
  Twitter,
  Github,
  Loader2,
  User,
  Mail,
  Lock
} from 'lucide-react';

interface QuickSocialLoginProps {
  onSuccess?: () => void;
  className?: string;
}

export function QuickSocialLogin({ onSuccess, className = '' }: QuickSocialLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated } = useAuthStore();
  const analytics = useAnalytics();

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider);
    
    try {
      analytics.track('quick_social_login', {
        provider,
        context: 'cart_page'
      });

      // Simulate social login
      const response = await fetch(`/api/auth/social/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: 'login' })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        
        toast.success(`Logged in with ${provider}`);
        onSuccess?.();
      } else {
        throw new Error('Social login failed');
      }
    } catch (error) {
      toast.error(`Failed to login with ${provider}`);
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('email');

    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(null);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  const socialProviders = [
    { id: 'google', name: 'Google', icon: Chrome, color: 'bg-red-500 hover:bg-red-600' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
    { id: 'github', name: 'GitHub', icon: Github, color: 'bg-gray-800 hover:bg-gray-900' }
  ];

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Quick Login</h3>
          <p className="text-sm text-muted-foreground">
            Sign in to save your cart and get personalized recommendations
          </p>
        </div>

        {!showLoginForm ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {socialProviders.map((provider) => {
                const Icon = provider.icon;
                return (
                  <Button
                    key={provider.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialLogin(provider.id)}
                    disabled={isLoading !== null}
                    className={`${provider.color} text-white border-0 hover:opacity-90`}
                  >
                    {isLoading === provider.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="ml-2 text-xs">{provider.name}</span>
                  </Button>
                );
              })}
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoginForm(true)}
                className="text-primary hover:text-primary/80"
              >
                Or sign in with email
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={isLoading === 'email'}
                className="flex-1"
              >
                {isLoading === 'email' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowLoginForm(false)}
              >
                Back
              </Button>
            </div>
          </form>
        )}

        <div className="text-center text-xs text-muted-foreground">
          <span>Don't have an account? </span>
          <a href="/register" className="text-primary hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </Card>
  );
}
