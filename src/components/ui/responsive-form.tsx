'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';
import { ReactNode } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useState } from 'react';

interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ResponsiveForm({ children, className, onSubmit }: ResponsiveFormProps) {
  return (
    <form 
      onSubmit={onSubmit}
      className={cn('space-y-4 sm:space-y-5', className)}
    >
      {children}
    </form>
  );
}

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return (
    <div className={cn('space-y-1.5 sm:space-y-2', className)}>
      {children}
    </div>
  );
}

interface FormLabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, htmlFor, required, className }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn(
        'block text-sm font-medium text-foreground',
        className
      )}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
}

interface ResponsiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const ResponsiveInput = React.forwardRef<HTMLInputElement, ResponsiveInputProps>(
  ({ className, error, helperText, leftIcon, rightIcon, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            ref={ref}
            className={cn(
              'w-full px-3 py-2.5 sm:py-2',
              'text-sm sm:text-base',
              'border border-input rounded-lg',
              'bg-background',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
              'min-h-touch',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className={cn(
            'mt-1.5 text-xs sm:text-sm',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';

interface ResponsiveTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

export const ResponsiveTextarea = React.forwardRef<HTMLTextAreaElement, ResponsiveTextareaProps>(
  ({ className, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5',
            'text-sm sm:text-base',
            'border border-input rounded-lg',
            'bg-background',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            'min-h-[100px] sm:min-h-[120px]',
            'resize-y',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          {...props}
        />
        
        {(error || helperText) && (
          <div className={cn(
            'mt-1.5 text-xs sm:text-sm',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

ResponsiveTextarea.displayName = 'ResponsiveTextarea';

interface ResponsiveSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const ResponsiveSelect = React.forwardRef<HTMLSelectElement, ResponsiveSelectProps>(
  ({ className, error, helperText, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2.5 sm:py-2',
            'text-sm sm:text-base',
            'border border-input rounded-lg',
            'bg-background',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            'min-h-touch',
            'appearance-none',
            'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2712%27%20height%3D%2712%27%20fill%3D%27none%27%20stroke%3D%27%23666%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27m3%204.5%203%203%203-3%27%2F%3E%3C%2Fsvg%3E")] bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {(error || helperText) && (
          <div className={cn(
            'mt-1.5 text-xs sm:text-sm',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

ResponsiveSelect.displayName = 'ResponsiveSelect';

interface ResponsiveCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export function ResponsiveCheckbox({ label, error, className, ...props }: ResponsiveCheckboxProps) {
  return (
    <div>
      <label className={cn(
        'flex items-start space-x-2.5 cursor-pointer',
        className
      )}>
        <input
          type="checkbox"
          className={cn(
            'mt-0.5 h-4 w-4 sm:h-5 sm:w-5',
            'text-primary',
            'border-input rounded',
            'focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            error && 'border-destructive'
          )}
          {...props}
        />
        <span className="text-sm sm:text-base text-foreground select-none">
          {label}
        </span>
      </label>
      
      {error && (
        <div className="mt-1.5 text-xs sm:text-sm text-destructive ml-6 sm:ml-7">
          {error}
        </div>
      )}
    </div>
  );
}

interface ResponsiveRadioGroupProps {
  name: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export function ResponsiveRadioGroup({ 
  name, 
  options, 
  value, 
  onChange, 
  error, 
  className 
}: ResponsiveRadioGroupProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-start space-x-2.5 cursor-pointer p-3 border border-input rounded-lg hover:bg-muted/50 transition-colors"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'mt-0.5 h-4 w-4 sm:h-5 sm:w-5',
              'text-primary',
              'border-input',
              'focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'transition-all duration-200',
              error && 'border-destructive'
            )}
          />
          <div className="flex-1">
            <div className="text-sm sm:text-base font-medium text-foreground">
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {option.description}
              </div>
            )}
          </div>
        </label>
      ))}
      
      {error && (
        <div className="text-xs sm:text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

interface FormActionsProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function FormActions({ children, className, align = 'right' }: FormActionsProps) {
  const alignments = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      'flex flex-col sm:flex-row gap-3 pt-2',
      alignments[align],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  type = 'button',
  onClick,
  disabled,
  className
}: ResponsiveButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border-2 border-input bg-background hover:bg-muted',
    ghost: 'hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm sm:text-base min-h-touch',
    lg: 'px-6 py-3 text-base sm:text-lg min-h-[48px] sm:min-h-[52px]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center',
        'font-medium rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}