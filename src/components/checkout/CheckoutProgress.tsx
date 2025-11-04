'use client';

import React from 'react';
import { Check, Truck, CreditCard, MapPin } from 'lucide-react';

interface CheckoutStep {
  id: number;
  name: string;
  hash: string;
  icon: any;
  completed: boolean;
  current: boolean;
  skip?: boolean;
}

interface CheckoutProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

function CheckoutProgress({ currentStep, onStepClick }: CheckoutProgressProps) {
  const steps: Omit<CheckoutStep, 'current' | 'completed'>[] = [
    {
      id: 1,
      name: 'Shipping',
      hash: '#shipping',
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 2,
      name: 'Payment',
      hash: '#payment',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      id: 3,
      name: 'Review',
      hash: '#review',
      icon: <MapPin className="w-4 h-4" />
    }
  ];

  const isStepClickable = (stepId: number): boolean => {
    return stepId <= currentStep;
  };

  return (
    <div className="mb-6 lg:mb-8">
      {/* Mobile Progress - Compact & Touch-Friendly */}
      <div className="lg:hidden">
        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isClickable = isStepClickable(step.id);
              const isCurrent = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => {
                        if (isClickable && onStepClick && !step.skip) {
                          onStepClick(step.id);
                        }
                      }}
                      disabled={!isClickable || step.skip}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 scale-110'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted-foreground/30 text-muted-foreground'
                      } ${isClickable && !step.skip ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed'}`}
                      aria-label={`${step.name} step ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.icon
                      )}
                    </button>
                    <span className={`mt-1 text-xs font-medium text-center max-w-[60px] ${
                      isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex items-center px-1">
                      <div
                        className={`w-8 h-0.5 transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Progress Bar */}
          <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tablet Progress - Medium */}
      <div className="hidden md:block lg:hidden">
        <div className="flex items-center justify-center space-x-6 md:space-x-8">
          {steps.map((step, index) => {
            const isClickable = isStepClickable(step.id);
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (isClickable && onStepClick && !step.skip) {
                        onStepClick(step.id);
                      }
                    }}
                    disabled={!isClickable || step.skip}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-3 ring-primary/20 scale-105'
                        : isCompleted
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-muted text-muted-foreground'
                    } ${isClickable && !step.skip ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed'}`}
                    aria-label={`${step.name} step ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5">{step.icon}</div>
                    )}
                  </button>
                  <span className={`mt-2 text-sm font-medium ${
                    isCurrent ? 'text-foreground' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Desktop Progress - Full */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-center space-x-4 md:space-x-8">
          {steps.map((step, index) => {
            const isClickable = isStepClickable(step.id);
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center group">
                  <button
                    onClick={() => {
                      if (isClickable && onStepClick && !step.skip) {
                        onStepClick(step.id);
                      }
                    }}
                    disabled={!isClickable || step.skip}
                    className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105 shadow-lg'
                        : isCompleted
                        ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                        : 'bg-muted text-muted-foreground'
                    } ${isClickable && !step.skip ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed'}`}
                    aria-label={`${step.name} step ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 lg:w-6 lg:h-6" />
                    ) : (
                      <div className="w-5 h-5 lg:w-6 lg:h-6">{step.icon}</div>
                    )}
                  </button>
                  <span className={`mt-3 text-sm lg:text-base font-medium transition-colors ${
                    isCurrent ? 'text-foreground font-bold' : isCompleted ? 'text-green-600' : 'text-muted-foreground group-hover:text-foreground'
                  }`}>
                    {step.name}
                  </span>
                  {/* Desktop tooltip */}
                  {isClickable && !step.skip && (
                    <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground bg-background border rounded px-2 py-1 shadow-md pointer-events-none">
                      Click to {isCompleted ? 'review' : 'edit'}
                    </div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="relative">
                    <div
                      className={`w-16 lg:w-20 h-0.5 transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                    {isCompleted && (
                      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CheckoutProgress;