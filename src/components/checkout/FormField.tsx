'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, Path, PathValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormFieldProps<T extends Record<string, any>> {
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  errors: FieldErrors<T>;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  showValidationIcon?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  autoComplete?: string;
  className?: string;
  hint?: string;
}

export function FormField<T extends Record<string, any>>({
  label,
  type = 'text',
  placeholder,
  register,
  name,
  errors,
  required = false,
  disabled = false,
  maxLength,
  showValidationIcon = true,
  value,
  onChange,
  autoComplete,
  className = '',
  hint
}: FormFieldProps<T>) {
  const error = errors[name];
  const isValid = value && !error && showValidationIcon;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative group">
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name, {
            onChange: (e) => {
              if (onChange) {
                onChange(e.target.value);
              }
            }
          })}
          disabled={disabled}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={`pr-10 transition-all duration-200 text-base sm:text-sm ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
              : isValid
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20 bg-green-50/30'
                : 'focus:border-primary/50 focus:ring-primary/20'
          } ${disabled ? 'bg-muted cursor-not-allowed' : ''}`}
          value={value}
        />

        {/* Validation Icons - Mobile Optimized */}
        {showValidationIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error && (
              <AlertCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-red-500 animate-pulse" aria-hidden="true" />
            )}
            {isValid && (
              <CheckCircle2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-green-500" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Character Count for maxLength */}
        {maxLength && value && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <span className={`text-xs ${
              value.length >= maxLength * 0.9
                ? 'text-orange-500 font-medium'
                : 'text-muted-foreground'
            }`}>
              {value.length}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Error Message - Enhanced Mobile */}
      {error && (
        <div className="text-sm text-red-600 font-medium flex items-start gap-2 p-2 bg-red-50/50 rounded border border-red-200" role="alert">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
          <span className="flex-1">{error.message as string}</span>
        </div>
      )}

      {/* Hint Text */}
      {hint && !error && (
        <div className="text-xs text-muted-foreground flex items-start gap-1 p-2 bg-muted/30 rounded">
          <span>💡</span>
          <span>{hint}</span>
        </div>
      )}

      {/* Mobile-specific helper */}
      {type === 'tel' && !error && (
        <p className="text-xs text-muted-foreground md:hidden">
          Enter 10-digit mobile number without country code
        </p>
      )}
    </div>
  );
}