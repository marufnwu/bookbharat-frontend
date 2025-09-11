'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  Check, 
  MapPin, 
  CreditCard, 
  Package, 
  Shield,
  Truck,
  Clock,
  Edit,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CheckoutStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  active: boolean;
}

interface MobileCheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function MobileCheckoutStepper({
  steps,
  currentStep,
  onStepClick
}: MobileCheckoutStepperProps) {
  return (
    <div className="bg-background border-b border-border sticky top-0 z-30">
      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStep].label}
            </span>
          </div>
          <div className="text-sm text-primary font-medium">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between max-w-3xl mx-auto px-4 py-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isClickable = index <= currentStep && onStepClick;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center space-x-2',
                    isClickable && 'cursor-pointer hover:opacity-80'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    !isCompleted && !isActive && 'bg-muted text-muted-foreground'
                  )}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={cn(
                    'text-sm font-medium hidden sm:block',
                    isActive && 'text-primary',
                    !isActive && 'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-3">
                    <div className={cn(
                      'h-0.5 transition-colors',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface MobileAddressCardProps {
  address: {
    id: string;
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  };
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export function MobileAddressCard({
  address,
  selected,
  onSelect,
  onEdit,
  showActions = true
}: MobileAddressCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'border rounded-lg p-4 transition-all cursor-pointer',
        selected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-sm">{address.name}</h4>
            {address.isDefault && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Default
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {address.line1}
            {address.line2 && `, ${address.line2}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p className="text-xs text-muted-foreground">
            Phone: {address.phone}
          </p>
        </div>
        
        {showActions && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
          >
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {selected && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center text-xs text-primary">
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Delivering to this address
          </div>
        </div>
      )}
    </div>
  );
}

interface MobilePaymentMethodProps {
  method: {
    id: string;
    type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
    label: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    saved?: boolean;
    last4?: string;
  };
  selected?: boolean;
  onSelect?: () => void;
}

export function MobilePaymentMethod({
  method,
  selected,
  onSelect
}: MobilePaymentMethodProps) {
  const Icon = method.icon || CreditCard;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full border rounded-lg p-4 transition-all text-left',
        selected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          'p-2 rounded-lg',
          selected ? 'bg-primary/10' : 'bg-muted'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-sm">{method.label}</h4>
            {method.saved && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Saved
              </Badge>
            )}
          </div>
          {method.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {method.description}
            </p>
          )}
          {method.last4 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              **** **** **** {method.last4}
            </p>
          )}
        </div>
        
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
          selected 
            ? 'border-primary bg-primary' 
            : 'border-muted-foreground'
        )}>
          {selected && (
            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
          )}
        </div>
      </div>
    </button>
  );
}

interface MobileOrderSummaryProps {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function MobileOrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  collapsed = false,
  onToggle
}: MobileOrderSummaryProps) {
  return (
    <div className="bg-card rounded-lg border border-border">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            Order Summary ({items.length} items)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm">₹{total}</span>
          <ChevronRight className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            !collapsed && 'rotate-90'
          )} />
        </div>
      </button>

      {!collapsed && (
        <div className="border-t border-border">
          {/* Items */}
          <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                {item.image && (
                  <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  ₹{item.quantity * item.price}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{tax}</span>
            </div>
            {discount && discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MobileDeliveryOptionProps {
  option: {
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  selected?: boolean;
  onSelect?: () => void;
}

export function MobileDeliveryOption({
  option,
  selected,
  onSelect
}: MobileDeliveryOptionProps) {
  const Icon = option.icon || Truck;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full border rounded-lg p-4 transition-all text-left',
        selected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          'p-2 rounded-lg mt-0.5',
          selected ? 'bg-primary/10' : 'bg-muted'
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{option.name}</h4>
            <span className="font-semibold text-sm">
              {option.price === 0 ? 'Free' : `₹${option.price}`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {option.description}
          </p>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {option.estimatedDays}
          </div>
        </div>
      </div>
    </button>
  );
}