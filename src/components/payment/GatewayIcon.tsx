'use client';

import React from 'react';
import { 
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  CircleDollarSign,
  Shield,
  Building2
} from 'lucide-react';

export interface GatewayIconProps {
  gateway: string;
  className?: string;
  size?: number;
}

/**
 * Gateway Icon Component
 * Displays appropriate icon/logo for payment gateways
 */
export function GatewayIcon({ gateway, className = '', size = 24 }: GatewayIconProps) {
  const iconClass = className || 'text-gray-700';
  
  // Normalize gateway name
  const normalizedGateway = gateway.toLowerCase().trim();
  
  // Map gateways to their icons/logos
  const getGatewayIcon = () => {
    switch (normalizedGateway) {
      case 'razorpay':
        return (
          <div className={`flex items-center ${iconClass}`}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#3395FF"/>
              <path d="M7 8L12 13L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 14L12 19L17 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      
      case 'payu':
        return (
          <div className={`flex items-center ${iconClass}`}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#18A05C"/>
              <path d="M8 8H12C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16H8V8Z" fill="white"/>
              <path d="M8 12H16" stroke="#18A05C" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        );
      
      case 'phonepe':
        return (
          <div className={`flex items-center ${iconClass}`}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#5F259F"/>
              <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
        );
      
      case 'cashfree':
        return (
          <div className={`flex items-center ${iconClass}`}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#00C1A5"/>
              <path d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="14" r="2" fill="white"/>
            </svg>
          </div>
        );
      
      case 'cod':
      case 'cash on delivery':
        return <Banknote className={iconClass} size={size} />;
      
      case 'upi':
        return <Smartphone className={iconClass} size={size} />;
      
      case 'net banking':
      case 'netbanking':
        return <Building2 className={iconClass} size={size} />;
      
      case 'credit card':
      case 'debit card':
      case 'card':
        return <CreditCard className={iconClass} size={size} />;
      
      case 'wallet':
      case 'e-wallet':
        return <Wallet className={iconClass} size={size} />;
      
      default:
        return <CircleDollarSign className={iconClass} size={size} />;
    }
  };
  
  return getGatewayIcon();
}

/**
 * Get gateway display name
 */
export function getGatewayDisplayName(gateway: string): string {
  const normalizedGateway = gateway.toLowerCase().trim();
  
  const displayNames: Record<string, string> = {
    'razorpay': 'Razorpay',
    'payu': 'PayU',
    'phonepe': 'PhonePe',
    'cashfree': 'Cashfree',
    'cod': 'Cash on Delivery',
    'upi': 'UPI',
    'netbanking': 'Net Banking',
    'card': 'Card Payment',
    'wallet': 'E-Wallet'
  };
  
  return displayNames[normalizedGateway] || gateway;
}

/**
 * Get gateway brand color
 */
export function getGatewayColor(gateway: string): string {
  const normalizedGateway = gateway.toLowerCase().trim();
  
  const colors: Record<string, string> = {
    'razorpay': '#3395FF',
    'payu': '#18A05C',
    'phonepe': '#5F259F',
    'cashfree': '#00C1A5',
    'cod': '#059669',
    'upi': '#3B82F6',
    'netbanking': '#6366F1',
    'card': '#8B5CF6',
    'wallet': '#EC4899'
  };
  
  return colors[normalizedGateway] || '#6B7280';
}


