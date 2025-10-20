'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth';
import { useAnalytics } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2,
  Github,
  Facebook,
  Twitter,
  Chrome
} from 'lucide-react';

interface SocialLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  mode?: 'login' | 'register';
  className?: string;
}

export function SocialLogin({ 
  onSuccess, 
  onError, 
  mode = 'login',
  className = '' 
}: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { login, register, isAuthenticated } = useAuthStore();
  const analytics = useAnalytics();

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider);
    
    try {
      // Track social login attempt
      analytics.track('social_login_attempted', {
        provider,
        mode,
      });

      // Simulate social login (in real implementation, this would redirect to OAuth)
      const response = await fetch(`/api/auth/social/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode })
      });

      if (!response.ok) {
        throw new Error(`Failed to authenticate with ${provider}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Store auth token
        localStorage.setItem('auth_token', data.token);
        
        // Update auth store
        if (mode === 'login') {
          await login(data.user.email, '');
        } else {
          await register(data.user.email, '', data.user.name);
        }

        // Track successful login
        analytics.track('social_login_success', {
          provider,
          mode,
          user_id: data.user.id,
        });

        toast.success(`Successfully ${mode === 'login' ? 'logged in' : 'registered'} with ${provider}`);
        onSuccess?.();
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error: any) {
      console.error(`Social login error (${provider}):`, error);
      
      // Track failed login
      analytics.track('social_login_failed', {
        provider,
        mode,
        error: error.message,
      });

      toast.error(`Failed to ${mode === 'login' ? 'login' : 'register'} with ${provider}`);
      onError?.(error.message);
    } finally {
      setIsLoading(null);
    }
  };

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'bg-gray-800 hover:bg-gray-900',
      textColor: 'text-white'
    }
  ];

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {mode === 'login' ? 'Sign in with' : 'Sign up with'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {socialProviders.map((provider) => {
          const Icon = provider.icon;
          const isProviderLoading = isLoading === provider.id;
          
          return (
            <Button
              key={provider.id}
              variant="outline"
              onClick={() => handleSocialLogin(provider.id)}
              disabled={isLoading !== null}
              className={`${provider.color} ${provider.textColor} border-0 hover:opacity-90 transition-all duration-200`}
            >
              {isProviderLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="ml-2 text-sm font-medium">
                {provider.name}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="relative">
        <Separator className="my-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
      </div>
    </div>
  );
}

// Enhanced login form with social options
export function EnhancedLoginForm({ 
  onSuccess, 
  onError,
  className = '' 
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const analytics = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      
      analytics.track('email_login_success', {
        user_email: email,
      });
      
      toast.success('Successfully logged in!');
      onSuccess?.();
    } catch (error: any) {
      analytics.track('email_login_failed', {
        user_email: email,
        error: error.message,
      });
      
      toast.error(error.message || 'Login failed');
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <SocialLogin 
          mode="login"
          onSuccess={onSuccess}
          onError={onError}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <a href="/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </a>
        </div>
      </div>
    </Card>
  );
}

// Enhanced registration form with social options
export function EnhancedRegisterForm({ 
  onSuccess, 
  onError,
  className = '' 
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const analytics = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      
      analytics.track('email_register_success', {
        user_email: email,
        user_name: name,
      });
      
      toast.success('Account created successfully!');
      onSuccess?.();
    } catch (error: any) {
      analytics.track('email_register_failed', {
        user_email: email,
        user_name: name,
        error: error.message,
      });
      
      toast.error(error.message || 'Registration failed');
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-muted-foreground mt-2">
            Sign up to get started with BookBharat
          </p>
        </div>

        <SocialLogin 
          mode="register"
          onSuccess={onSuccess}
          onError={onError}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </Card>
  );
}
