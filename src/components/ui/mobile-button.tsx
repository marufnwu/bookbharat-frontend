'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon-xs' | 'icon-sm' | 'icon-md';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'sm',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
      link: 'text-primary underline-offset-4 hover:underline'
    };

    const sizes = {
      // Text buttons - mobile optimized
      xs: 'h-7 px-2 text-xs rounded-md font-medium', // 28px height
      sm: 'h-8 px-3 text-xs rounded-md font-medium', // 32px height  
      md: 'h-9 px-4 text-sm rounded-lg font-medium', // 36px height
      lg: 'h-10 px-5 text-sm rounded-lg font-semibold', // 40px height
      
      // Icon only buttons - mobile optimized
      'icon-xs': 'h-7 w-7 rounded-md', // 28px
      'icon-sm': 'h-8 w-8 rounded-md', // 32px
      'icon-md': 'h-9 w-9 rounded-lg', // 36px
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.97]',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton';

// Button Group for mobile
interface MobileButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
}

export function MobileButtonGroup({ 
  children, 
  className,
  direction = 'horizontal',
  fullWidth = false
}: MobileButtonGroupProps) {
  return (
    <div className={cn(
      'flex',
      direction === 'horizontal' ? 'flex-row gap-2' : 'flex-col gap-2',
      fullWidth && 'w-full',
      className
    )}>
      {children}
    </div>
  );
}

// Floating Action Button for mobile
interface MobileFABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  mini?: boolean;
  extended?: boolean;
  label?: string;
  icon: React.ReactNode;
}

export function MobileFAB({ 
  position = 'bottom-right',
  mini = false,
  extended = false,
  label,
  icon,
  className,
  ...props
}: MobileFABProps) {
  const positions = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2'
  };

  return (
    <button
      className={cn(
        'fixed z-30',
        positions[position],
        'bg-primary text-primary-foreground shadow-lg',
        'hover:shadow-xl active:scale-95',
        'transition-all duration-200',
        'flex items-center justify-center gap-2',
        mini ? 'h-10 w-10 rounded-full' : 'h-14 w-14 rounded-2xl',
        extended && 'px-4 w-auto',
        className
      )}
      {...props}
    >
      {icon}
      {extended && label && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </button>
  );
}

// Icon Button for mobile
interface MobileIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon: React.ReactNode;
  label?: string;
}

export function MobileIconButton({
  size = 'sm',
  variant = 'ghost',
  icon,
  label,
  className,
  ...props
}: MobileIconButtonProps) {
  const sizes = {
    xs: 'h-7 w-7', // 28px
    sm: 'h-8 w-8', // 32px
    md: 'h-9 w-9', // 36px
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-95',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        variant === 'outline' && 'border border-input bg-background hover:bg-accent',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        sizes[size],
        className
      )}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );
}