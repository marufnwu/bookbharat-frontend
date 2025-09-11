'use client';

import { forwardRef, cloneElement } from 'react';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/types';
import { Loader2 } from 'lucide-react';

const buttonVariantsConfig = {
  primary: 
    'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
  secondary: 
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
  outline: 
    'border border-border bg-background hover:bg-muted focus:ring-ring',
  ghost: 
    'hover:bg-muted focus:ring-ring',
  destructive: 
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
};

const buttonSizes = {
  xs: 'h-6 px-2 text-xs',
  sm: 'h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm',
  md: 'h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm',
  lg: 'h-9 sm:h-12 px-4 sm:px-6 text-sm sm:text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  asChild = false,
  ...props
}, ref) => {
  const buttonClasses = cn(
    'inline-flex items-center justify-center rounded-md sm:rounded-lg font-medium',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'active:scale-95',
    buttonVariantsConfig[variant],
    buttonSizes[size],
    loading && 'pointer-events-none',
    className
  );

  if (asChild && children) {
    // When asChild is true, clone the child element and apply button classes
    const child = children as React.ReactElement;
    return cloneElement(child, {
      className: cn(buttonClasses, child.props?.className),
      ref,
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

// Export buttonVariants as a function for compatibility with ShadCN components
const buttonVariants = (props: { variant?: keyof typeof buttonVariantsConfig } = {}) => {
  return buttonVariantsConfig[props.variant || 'primary'];
};

export { Button, buttonVariants };