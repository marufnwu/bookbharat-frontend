'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border bg-background text-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-accent text-accent-foreground',
};

const badgeSizes = {
  default: 'px-2.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
  size?: keyof typeof badgeSizes;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(({
  className,
  variant = 'default',
  size = 'default',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge };