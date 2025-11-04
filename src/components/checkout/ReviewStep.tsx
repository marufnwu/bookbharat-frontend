'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  Package,
  Clock
} from 'lucide-react';
import { OrderSummaryCard } from '@/components/cart/OrderSummaryCard';
import { GatewayIcon } from '@/components/payment/GatewayIcon';
import { TaxBreakdown } from './TaxBreakdown';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  email: string;
}

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
}

interface ReviewStepProps {
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  cartItems: any[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  onPlaceOrder: () => void;
  onEditStep: (step: number) => void;
  isLoading?: boolean;
  estimatedDelivery?: string;
  taxCalculation?: any;
  isCalculatingTax?: boolean;
  taxError?: string | null;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  shippingAddress,
  billingAddress,
  paymentMethod,
  cartItems,
  subtotal,
  shippingCost,
  taxAmount,
  discountAmount,
  totalAmount,
  onPlaceOrder,
  onEditStep,
  isLoading = false,
  estimatedDelivery = '2-4 business days',
  taxCalculation,
  isCalculatingTax = false,
  taxError = null
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotalCharges = (): number => {
    if (!paymentMethod.charges) return 0;

    if (paymentMethod.charges.type === 'percentage') {
      return Math.round((subtotal * paymentMethod.charges.value) / 100);
    } else {
      return paymentMethod.charges.value;
    }
  };

  const finalTotal = totalAmount + calculateTotalCharges();

  const handlePlaceOrder = () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setError(null);
    onPlaceOrder();
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderSummaryCard
            cartItems={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            totalAmount={totalAmount}
            showCheckoutButton={false}
          />

          {/* Tax Breakdown */}
          <div className="mt-6">
            <TaxBreakdown
              taxCalculation={taxCalculation}
              isLoading={isCalculatingTax}
              error={taxError}
              showDetails={false}
            />
          </div>

          {/* Payment Method Charges */}
          {calculateTotalCharges() > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Payment Method Charges
                </span>
                <span className="text-sm font-medium">
                  +₹{calculateTotalCharges().toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Final Total */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-xl font-bold text-primary">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(1)}
            >
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="font-medium">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {shippingAddress.phone}
              </div>
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {shippingAddress.email}
              </div>
              <div>
                {shippingAddress.address_line_1}
              </div>
              <div>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
              </div>
              <div>
                {shippingAddress.country}
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center text-sm text-muted-foreground">
              <Truck className="w-4 h-4 mr-2" />
              Estimated delivery: {estimatedDelivery}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      {!billingAddress || (billingAddress.first_name === shippingAddress.firstName &&
        billingAddress.last_name === shippingAddress.lastName) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Billing Address
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStep(1)}
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Same as shipping address
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Billing Address
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStep(1)}
              >
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">
                {billingAddress?.firstName} {billingAddress?.lastName}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {billingAddress?.phone}
                </div>
                <div>
                  {billingAddress?.address_line_1}
                </div>
                <div>
                  {billingAddress?.city}, {billingAddress?.state} {billingAddress?.postal_code}
                </div>
                <div>
                  {billingAddress?.country}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Method
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep(2)}
            >
              Change
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <GatewayIcon gateway={paymentMethod.icon} className="w-8 h-8" />
            <div className="flex-1">
              <div className="font-medium">{paymentMethod.name}</div>
              <div className="text-sm text-muted-foreground">{paymentMethod.description}</div>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {paymentMethod.processing_time}
                </div>
                {paymentMethod.secure && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>By placing this order, you agree to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The terms and conditions of sale</li>
                <li>Our return and refund policy</li>
                <li>Privacy policy and data handling</li>
                <li>Payment terms and conditions</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I have read and agree to the terms and conditions
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => onEditStep(2)}
          disabled={isLoading}
        >
          Back to Payment
        </Button>
        <Button
          onClick={handlePlaceOrder}
          disabled={!agreedToTerms || isLoading}
          className="min-w-[140px]"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Placing Order...
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Your order is protected:</strong> We use industry-standard encryption to keep your information secure and never share your data with third parties.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ReviewStep;