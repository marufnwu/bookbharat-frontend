'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';

interface FormValidationSummaryProps {
  errors: FieldErrors<any>;
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Set<string>;
  showProgress?: boolean;
}

export function FormValidationSummary({
  errors,
  isValid,
  isDirty,
  touchedFields,
  showProgress = true
}: FormValidationSummaryProps) {
  const errorCount = Object.keys(errors).length;
  const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
  const completedFields = requiredFields.filter(field => touchedFields.has(field) && !errors[field]).length;
  const progressPercentage = (completedFields / requiredFields.length) * 100;

  const getValidationStatus = () => {
    if (!isDirty) return { type: 'info', message: 'Please fill in your shipping information', icon: Info };
    if (errorCount > 0) return { type: 'error', message: `${errorCount} error${errorCount > 1 ? 's' : ''} need to be corrected`, icon: AlertCircle };
    return { type: 'success', message: 'All information looks good!', icon: CheckCircle2 };
  };

  const status = getValidationStatus();

  if (!showProgress && isDirty && errorCount === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Form is complete and ready to submit
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Form Completion</span>
            <span className="text-sm text-muted-foreground">
              {completedFields}/{requiredFields.length} fields
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: progressPercentage === 100 ? '#22c55e' : '#3b82f6'
              }}
            />
          </div>
        </div>
      )}

      {(isDirty || errorCount > 0) && (
        <Alert className={`${
          status.type === 'error' ? 'border-red-200 bg-red-50' :
          status.type === 'success' ? 'border-green-200 bg-green-50' :
          'border-blue-200 bg-blue-50'
        }`}>
          <status.icon className={`h-4 w-4 ${
            status.type === 'error' ? 'text-red-600' :
            status.type === 'success' ? 'text-green-600' :
            'text-blue-600'
          }`} />
          <AlertDescription className={`${
            status.type === 'error' ? 'text-red-700' :
            status.type === 'success' ? 'text-green-700' :
            'text-blue-700'
          }`}>
            {status.message}
          </AlertDescription>
        </Alert>
      )}

      {errorCount > 0 && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Required fields with errors:</p>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-red-600">
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {error?.message as string}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}