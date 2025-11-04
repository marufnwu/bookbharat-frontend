'use client';

import React from 'react';
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Shield, Package, CreditCard, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  message?: string;
  progress?: number;
  type?: 'shipping' | 'payment' | 'review' | 'general';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

interface StepLoadingProps {
  currentStep: number;
  totalSteps: number;
  currentStepName: string;
  isLoading: boolean;
  message?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  showIcon = true
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {showIcon && (
        <Loader2 className={cn(sizeClasses[size], 'animate-spin')} />
      )}
    </div>
  );
}

export function LoadingState({
  isLoading = false,
  isSuccess = false,
  isError = false,
  message,
  progress,
  type = 'general',
  size = 'md',
  showIcon = true
}: LoadingStateProps) {
  const getIcon = () => {
    if (!showIcon) return null;

    if (isSuccess) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (isError) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin text-primary" />;

    // Default icons based on type
    switch (type) {
      case 'shipping': return <Package className="w-5 h-5 text-blue-600" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'review': return <MapPin className="w-5 h-5 text-orange-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    if (isSuccess) return 'border-green-200 bg-green-50 text-green-800';
    if (isError) return 'border-red-200 bg-red-50 text-red-800';
    if (isLoading) return 'border-blue-200 bg-blue-50 text-blue-800';
    return 'border-gray-200 bg-gray-50 text-gray-800';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'p-3 text-sm';
      case 'md': return 'p-4 text-sm';
      case 'lg': return 'p-6 text-base';
      default: return 'p-4 text-sm';
    }
  };

  return (
    <div className={cn(
      'border rounded-lg flex items-center space-x-3 transition-all duration-300',
      getStatusColor(),
      getSizeClasses()
    )}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        {message && (
          <p className="font-medium truncate">{message}</p>
        )}
        {isLoading && progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
}

export function StepLoadingIndicator({
  currentStep,
  totalSteps,
  currentStepName,
  isLoading,
  message
}: StepLoadingProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-muted-foreground">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-foreground font-medium">{currentStepName}</span>
        </div>
        {isLoading && <LoadingSpinner size="sm" />}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progressPercentage)}% Complete</span>
          <span>Step {currentStep} of {totalSteps}</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  backdrop?: boolean;
  blur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  backdrop = true,
  blur = true
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        backdrop && "bg-black/20",
        blur && "backdrop-blur-sm"
      )}
    >
      <div className="bg-background/95 backdrop-blur-md border rounded-lg p-6 shadow-xl max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <p className="font-medium">{message}</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function Skeleton({ className, lines = 3, height = 'h-4' }: SkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-muted rounded animate-pulse',
            height
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            width: i === lines - 1 ? '75%' : '100%'
          }}
        />
      ))}
    </div>
  );
}

interface FormLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function FormLoading({ isLoading, children, loadingText = 'Processing...', className }: FormLoadingProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="md" />
            <p className="text-sm font-medium">{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
}

export function ButtonLoading({
  isLoading,
  children,
  loadingText = 'Loading...',
  disabled,
  className
}: ButtonLoadingProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      <span className={isLoading ? 'opacity-70' : ''}>
        {isLoading ? loadingText : children}
      </span>
    </button>
  );
}

// Specialized loading components for checkout steps
export function AddressLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton lines={1} height="h-3 w-24" />
        <Skeleton lines={2} height="h-10" />
      </div>
      <div className="space-y-2">
        <Skeleton lines={1} height="h-3 w-32" />
        <Skeleton lines={3} height="h-10" />
      </div>
    </div>
  );
}

export function PaymentLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <Skeleton lines={1} height="h-4 w-32" />
              <Skeleton lines={1} height="h-3 w-48" />
              <Skeleton lines={1} height="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderSummaryLoading() {
  return (
    <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6">
      <div className="space-y-4">
        <Skeleton lines={1} height="h-5 w-24" />
        <div className="space-y-2">
          <Skeleton lines={1} height="h-4" />
          <Skeleton lines={1} height="h-4" />
          <Skeleton lines={1} height="h-4" />
        </div>
        <div className="border-t pt-4">
          <Skeleton lines={1} height="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export default {
  LoadingSpinner,
  LoadingState,
  StepLoadingIndicator,
  LoadingOverlay,
  Skeleton,
  FormLoading,
  ButtonLoading,
  AddressLoading,
  PaymentLoading,
  OrderSummaryLoading
};