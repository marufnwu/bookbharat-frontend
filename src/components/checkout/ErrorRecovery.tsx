'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  CreditCard,
  Package,
  Shield
} from 'lucide-react';

export interface ErrorRecoveryActions {
  onRetry?: () => void;
  onBack?: () => void;
  onContactSupport?: () => void;
  onChangePaymentMethod?: () => void;
  onChangeAddress?: () => void;
  onSaveCart?: () => void;
}

export interface ErrorRecoveryProps {
  error: string | null;
  errorType?: 'payment' | 'shipping' | 'inventory' | 'network' | 'validation' | 'general';
  actions: ErrorRecoveryActions;
  isLoading?: boolean;
  orderData?: any;
}

const errorConfig = {
  payment: {
    title: 'Payment Issue',
    description: 'There was a problem processing your payment',
    icon: CreditCard,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  shipping: {
    title: 'Shipping Issue',
    description: 'Problem with shipping address or delivery',
    icon: Package,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  inventory: {
    title: 'Stock Issue',
    description: 'Some items are no longer available',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  network: {
    title: 'Connection Issue',
    description: 'Network problem occurred',
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  validation: {
    title: 'Validation Error',
    description: 'Please check your information',
    icon: AlertTriangle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  general: {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred',
    icon: AlertTriangle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

export function ErrorRecovery({
  error,
  errorType = 'general',
  actions,
  isLoading = false,
  orderData
}: ErrorRecoveryProps) {
  if (!error) return null;

  const config = errorConfig[errorType];
  const Icon = config.icon;

  const getSpecificErrorHelp = () => {
    switch (errorType) {
      case 'payment':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Your payment information is secure</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Possible solutions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Try a different payment method</li>
                <li>Check your card details and billing address</li>
                <li>Ensure sufficient funds are available</li>
                <li>Try again in a few moments</li>
              </ul>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>Some items in your cart may have:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Gone out of stock</li>
                <li>Limited quantity available</li>
                <li>Price changes</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Recommendation:</strong> Save your cart and continue shopping later
              </p>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>Network connectivity issues detected:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Wait a moment and try again</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>We apologize for the inconvenience. Our team has been notified.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span>{config.title}</span>
          <Badge variant="outline" className="ml-2">
            {errorType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        <Alert className={`${config.bgColor} ${config.borderColor} border`}>
          <AlertTriangle className={`h-4 w-4 ${config.color}`} />
          <AlertDescription className={config.color}>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>

        {/* Specific Help */}
        {getSpecificErrorHelp()}

        {/* Recovery Actions */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">What would you like to do?</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.onRetry && (
              <Button
                onClick={actions.onRetry}
                disabled={isLoading}
                variant="default"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Retrying...' : 'Try Again'}</span>
              </Button>
            )}

            {actions.onChangePaymentMethod && errorType === 'payment' && (
              <Button
                onClick={actions.onChangePaymentMethod}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Change Payment</span>
              </Button>
            )}

            {actions.onChangeAddress && errorType === 'shipping' && (
              <Button
                onClick={actions.onChangeAddress}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>Change Address</span>
              </Button>
            )}

            {actions.onBack && (
              <Button
                onClick={actions.onBack}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Go Back</span>
              </Button>
            )}

            {actions.onSaveCart && (
              <Button
                onClick={actions.onSaveCart}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Save Cart</span>
              </Button>
            )}
          </div>
        </div>

        {/* Support Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3">Still need help?</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>
                Call: <strong>1800-XXX-XXXX</strong>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>
                Email: <strong>support@bookbharat.com</strong>
              </span>
            </div>
          </div>

          {actions.onContactSupport && (
            <Button
              onClick={actions.onContactSupport}
              variant="ghost"
              size="sm"
              className="mt-3"
            >
              Contact Support Team
            </Button>
          )}
        </div>

        {/* Order Information (if available) */}
        {orderData && orderData.order_number && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Order Reference:</strong> #{orderData.order_number}</p>
              <p className="mt-1">
                If you were charged but the order failed, please contact support with this reference number.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}