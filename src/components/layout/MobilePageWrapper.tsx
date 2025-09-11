'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface MobilePageWrapperProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
  stickyHeader?: boolean;
}

export function MobilePageWrapper({
  children,
  title,
  showBackButton = true,
  backHref,
  className,
  headerClassName,
  contentClassName,
  fullHeight = true,
  noPadding = false,
  stickyHeader = true
}: MobilePageWrapperProps) {
  const pathname = usePathname();
  const defaultBackHref = backHref || '/';

  return (
    <div className={cn(
      'flex flex-col bg-background',
      fullHeight && 'min-h-screen',
      className
    )}>
      {/* Mobile Header */}
      {(showBackButton || title) && (
        <header className={cn(
          'bg-background border-b border-border',
          stickyHeader && 'sticky top-0 z-40',
          headerClassName
        )}>
          <div className="flex items-center justify-between px-4 py-3 safe-top">
            {showBackButton && (
              <Link 
                href={defaultBackHref}
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors -ml-1 p-1"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2 text-sm font-medium md:inline hidden">Back</span>
              </Link>
            )}
            
            {title && (
              <h1 className={cn(
                'text-base sm:text-lg font-semibold text-foreground',
                !showBackButton && 'ml-4'
              )}>
                {title}
              </h1>
            )}

            {/* Optional right slot for actions */}
            <div className="w-8" /> {/* Spacer for centering title */}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        'flex-1',
        !noPadding && 'px-3 sm:px-4 lg:px-6 py-4 sm:py-6',
        contentClassName
      )}>
        {children}
      </main>
    </div>
  );
}

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  action?: ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  background?: 'default' | 'muted' | 'card';
  noPadding?: boolean;
}

export function PageSection({
  children,
  className,
  title,
  titleClassName,
  action,
  spacing = 'md',
  background = 'default',
  noPadding = false
}: PageSectionProps) {
  const spacings = {
    sm: 'py-3 sm:py-4',
    md: 'py-4 sm:py-6',
    lg: 'py-6 sm:py-8'
  };

  const backgrounds = {
    default: '',
    muted: 'bg-muted/30',
    card: 'bg-card'
  };

  return (
    <section className={cn(
      !noPadding && spacings[spacing],
      backgrounds[background],
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {title && (
            <h2 className={cn(
              'text-lg sm:text-xl font-semibold text-foreground',
              titleClassName
            )}>
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  interactive?: boolean;
}

export function MobileCard({
  children,
  className,
  padding = 'md',
  onClick,
  interactive = false
}: MobileCardProps) {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5 sm:p-6'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card rounded-lg border border-border',
        paddings[padding],
        interactive && 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface MobileListItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  leftIcon?: ReactNode;
  rightContent?: ReactNode;
  interactive?: boolean;
  noBorder?: boolean;
}

export function MobileListItem({
  children,
  className,
  onClick,
  leftIcon,
  rightContent,
  interactive = true,
  noBorder = false
}: MobileListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center py-3 px-4',
        !noBorder && 'border-b border-border last:border-b-0',
        interactive && 'cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors',
        className
      )}
    >
      {leftIcon && (
        <div className="mr-3 flex-shrink-0">
          {leftIcon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {children}
      </div>
      
      {rightContent && (
        <div className="ml-3 flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}

interface FloatingActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function FloatingActionButton({
  children,
  onClick,
  className,
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const positions = {
    'bottom-right': 'bottom-20 right-4 sm:bottom-6 sm:right-6',
    'bottom-left': 'bottom-20 left-4 sm:bottom-6 sm:left-6',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2 sm:bottom-6'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-30',
        'bg-primary text-primary-foreground',
        'rounded-full shadow-lg',
        'p-4',
        'hover:shadow-xl hover:scale-110',
        'active:scale-95',
        'transition-all duration-200',
        positions[position],
        className
      )}
    >
      {children}
    </button>
  );
}

interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    badge?: string | number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({
  tabs,
  activeTab,
  onTabChange,
  className
}: MobileTabsProps) {
  return (
    <div className={cn(
      'flex overflow-x-auto scrollbar-hide border-b border-border',
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center space-x-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative',
            activeTab === tab.id
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge && (
            <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}