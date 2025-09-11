'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'wide' | 'narrow' | 'full';
  padding?: 'default' | 'compact' | 'none';
  as?: 'div' | 'section' | 'article' | 'main';
}

export function ResponsiveContainer({
  children,
  className,
  variant = 'default',
  padding = 'default',
  as: Component = 'div'
}: ResponsiveContainerProps) {
  const variants = {
    default: 'max-w-7xl mx-auto',
    wide: 'max-w-screen-2xl mx-auto',
    narrow: 'max-w-4xl mx-auto',
    full: 'w-full'
  };

  const paddings = {
    default: 'px-4 sm:px-6 lg:px-8',
    compact: 'px-3 sm:px-4 lg:px-6',
    none: ''
  };

  return (
    <Component 
      className={cn(
        variants[variant],
        paddings[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2 | 3 | 4;
    tablet?: 2 | 3 | 4 | 5 | 6;
    desktop?: 3 | 4 | 5 | 6 | 7 | 8;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const colClasses = {
    mobile: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4'
    },
    tablet: {
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-3',
      4: 'sm:grid-cols-4',
      5: 'sm:grid-cols-5',
      6: 'sm:grid-cols-6'
    },
    desktop: {
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6',
      7: 'lg:grid-cols-7',
      8: 'lg:grid-cols-8'
    }
  };

  const gapSizes = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
    xl: 'gap-6 sm:gap-8 lg:gap-10'
  };

  return (
    <div 
      className={cn(
        'grid',
        colClasses.mobile[cols.mobile || 1],
        cols.tablet && colClasses.tablet[cols.tablet],
        cols.desktop && colClasses.desktop[cols.desktop],
        gapSizes[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  background?: 'default' | 'muted' | 'primary' | 'accent' | 'none';
  id?: string;
}

export function ResponsiveSection({
  children,
  className,
  spacing = 'md',
  background = 'none',
  id
}: ResponsiveSectionProps) {
  const spacings = {
    none: '',
    sm: 'py-6 sm:py-8 lg:py-10',
    md: 'py-8 sm:py-12 lg:py-16',
    lg: 'py-12 sm:py-16 lg:py-20',
    xl: 'py-16 sm:py-20 lg:py-24'
  };

  const backgrounds = {
    none: '',
    default: 'bg-background',
    muted: 'bg-muted/30',
    primary: 'bg-primary/5',
    accent: 'bg-accent/5'
  };

  return (
    <section 
      id={id}
      className={cn(
        spacings[spacing],
        backgrounds[background],
        className
      )}
    >
      {children}
    </section>
  );
}

interface MobileOnlyProps {
  children: ReactNode;
  className?: string;
}

export function MobileOnly({ children, className }: MobileOnlyProps) {
  return (
    <div className={cn('block md:hidden', className)}>
      {children}
    </div>
  );
}

interface DesktopOnlyProps {
  children: ReactNode;
  className?: string;
}

export function DesktopOnly({ children, className }: DesktopOnlyProps) {
  return (
    <div className={cn('hidden md:block', className)}>
      {children}
    </div>
  );
}

interface TabletUpProps {
  children: ReactNode;
  className?: string;
}

export function TabletUp({ children, className }: TabletUpProps) {
  return (
    <div className={cn('hidden sm:block', className)}>
      {children}
    </div>
  );
}