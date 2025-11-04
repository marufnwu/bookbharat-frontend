'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Truck, Clock, Loader2, CreditCard, Smartphone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GatewayIcon } from '@/components/payment/GatewayIcon';
import { useCartStore } from '@/stores/cart';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'online' | 'cod';
  description?: string;
  icon?: string;
  charges?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  processing_time?: string;
  secure?: boolean;
}

interface PaymentStepProps {
  onPaymentSelect: (paymentMethod: PaymentMethod) => void;
  selectedPaymentMethod?: string;
  isLoading?: boolean;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  onPaymentSelect,
  selectedPaymentMethod,
  isLoading = false,
  subtotal,
  shippingCost,
  totalAmount
}) => {
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cartItems } = useCartStore();

  // Mock payment methods - in real app, this would come from API
  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cod',
      description: 'Pay when you receive your order',
      icon: 'cod',
      charges: {
        type: 'fixed',
        value: 0
      },
      processing_time: '2-4 business days',
      secure: false
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      type: 'online',
      description: 'Pay instantly using PhonePe UPI',
      icon: 'phonepe',
      charges: {
        type: 'fixed',
        value: 0
      },
      processing_time: 'Instant',
      secure: true
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      type: 'online',
      description: 'Pay using Credit Card, Debit Card, UPI, Wallets',
      icon: 'razorpay',
      charges: {
        type: 'fixed',
        value: 0
      },
      processing_time: 'Instant',
      secure: true
    },
    {
      id: 'payu',
      name: 'PayU',
      type: 'online',
      description: 'Pay using Credit Card, Debit Card, Net Banking',
      icon: 'payu',
      charges: {
        type: 'fixed',
        value: 0
      },
      processing_time: 'Instant',
      secure: true
    }
  ];

  useEffect(() => {
    // Simulate loading payment methods
    const loadPaymentMethods = async () => {
      setLoadingMethods(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Filter payment methods based on cart total and items
        const filteredMethods = mockPaymentMethods.filter(method => {
          // For demo purposes, show all methods
          return true;
        });

        setAvailablePaymentMethods(filteredMethods);
      } catch (err) {
        setError('Failed to load payment methods');
        console.error('Payment methods loading error:', err);
      } finally {
        setLoadingMethods(false);
      }
    };

    loadPaymentMethods();
  }, [subtotal, cartItems]);

  const calculatePaymentCharges = (method: PaymentMethod): number => {
    if (!method.charges) return 0;

    if (method.charges.type === 'percentage') {
      return Math.round((subtotal * method.charges.value) / 100);
    } else {
      return method.charges.value;
    }
  };

  const getTotalWithCharges = (method: PaymentMethod): number => {
    const charges = calculatePaymentCharges(method);
    return totalAmount + charges;
  };

  if (loadingMethods) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading payment methods...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Payment Methods */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {availablePaymentMethods.map((method) => {
              const charges = calculatePaymentCharges(method);
              const totalWithCharges = getTotalWithCharges(method);
              const isSelected = selectedPaymentMethod === method.id;

              return (
                <div
                  key={method.id}
                  className={`relative border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                      : 'border-border hover:bg-muted/50 hover:border-primary/50 active:scale-[0.98]'
                  }`}
                  onClick={() => onPaymentSelect(method)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPaymentSelect(method);
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select ${method.name} payment method`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="mt-1 flex-shrink-0">
                        <GatewayIcon gateway={method.icon} className="w-8 h-8 sm:w-8 sm:h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                          <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{method.name}</h3>
                          {method.secure && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Secure
                            </Badge>
                          )}
                          {method.type === 'cod' && (
                            <Badge variant="secondary" className="text-xs">
                              <Truck className="w-3 h-3 mr-1" />
                              COD
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                          {method.description}
                        </p>
                        <div className="flex items-center space-x-3 sm:space-x-4 mt-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {method.processing_time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {charges > 0 && (
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          +₹{charges.toLocaleString('en-IN')} charges
                        </div>
                      )}
                      <div className="font-medium text-foreground text-sm sm:text-base">
                        Total: ₹{totalWithCharges.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center animate-scale-in">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedPaymentMethod && (
            <div className="mt-4 p-3 sm:p-4 bg-muted/30 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Selected Payment Method</p>
                  <p className="font-medium text-sm sm:text-base truncate">
                    {availablePaymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-base sm:text-lg text-primary">
                    ₹{getTotalWithCharges(availablePaymentMethods.find(m => m.id === selectedPaymentMethod)!).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Security Notice */}
      <Alert className="border-green-200 bg-green-50/50">
        <Shield className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>100% Secure Payment:</strong> Your payment information is encrypted and secure. We never store your card details.
        </AlertDescription>
      </Alert>

      {/* Action Buttons - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <Button
          variant="outline"
          disabled={isLoading}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2 sm:hidden" />
          Back to Shipping
        </Button>
        <Button
          disabled={!selectedPaymentMethod || isLoading}
          className="w-full sm:w-auto min-w-[120px] order-1 sm:order-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Continue to Review
              <ArrowRight className="w-4 h-4 ml-2 hidden sm:inline" />
            </>
          )}
        </Button>
      </div>

      {/* Mobile Trust Indicators */}
      <div className="lg:hidden grid grid-cols-3 gap-4 text-center py-4 border-t">
        <div className="space-y-1">
          <Shield className="w-6 h-6 mx-auto text-green-600" />
          <p className="text-xs text-muted-foreground">Secure</p>
        </div>
        <div className="space-y-1">
          <Truck className="w-6 h-6 mx-auto text-blue-600" />
          <p className="text-xs text-muted-foreground">Fast</p>
        </div>
        <div className="space-y-1">
          <CreditCard className="w-6 h-6 mx-auto text-purple-600" />
          <p className="text-xs text-muted-foreground">Easy</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;