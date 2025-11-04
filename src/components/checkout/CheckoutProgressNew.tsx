'use client';

import React from 'react';
import { Check, Truck, CreditCard, MapPin } from 'lucide-react';

interface CheckoutStep {
  id: number;
  name: string;
  hash: string;
  icon: React.ReactNode;
  completed: boolean;
  current: boolean;
  skip?: boolean;
}

interface CheckoutProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function CheckoutProgress({ currentStep, onStepClick }: CheckoutProgressProps) {
  const steps = [
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
                    if (isClickable && onStepClick) {
                      onStepClick(step.id);
                    }
                  }}
                  disabled={!isClickable}
                  className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105 shadow-lg'
                      : isCompleted
                      ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                      : 'bg-muted text-muted-foreground'
                  } ${isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed'}`}
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
              </div>
              {index < steps.length - 1 && (
                <div className="relative">
                  <div
                    className={`w-16 lg:w-20 h-0.5 transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}