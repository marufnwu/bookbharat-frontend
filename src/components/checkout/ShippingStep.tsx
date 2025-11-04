'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AddressManager from '@/components/AddressManager';
import { FormField } from './FormField';
import { FormValidationSummary } from './FormValidationSummary';

// Enhanced shipping form schema with better validation
const shippingSchema = z.object({
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address (e.g., user@example.com)')
    .refine(email => !email.includes('+'), 'Email addresses with + signs are not supported'),
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9')
    .refine(phone => !/^(\d)\1{9}$/.test(phone), 'Phone number cannot be all same digits'),
  address_line_1: z.string()
    .min(1, 'Address is required')
    .min(10, 'Please enter a complete address (at least 10 characters)')
    .max(200, 'Address must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s,''-\/]+$/, 'Address contains invalid characters'),
  city: z.string()
    .min(1, 'City is required')
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City name can only contain letters and spaces'),
  state: z.string()
    .min(1, 'State is required')
    .min(2, 'State name must be at least 2 characters')
    .max(50, 'State name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'State name can only contain letters and spaces'),
  postal_code: z.string()
    .min(1, 'PIN code is required')
    .length(6, 'PIN code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'PIN code can only contain digits')
    .refine(pincode => !/^(\d)\1{5}$/.test(pincode), 'Please enter a valid PIN code'),
  country: z.string()
    .min(1, 'Country is required')
    .min(2, 'Country name must be at least 2 characters')
    .max(50, 'Country name must be less than 50 characters'),
});

const billingSchema = z.object({
  billing_firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  billing_lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  billing_phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
    .refine(phone => !/^(\d)\1{9}$/.test(phone), 'Phone number cannot be all same digits'),
  billing_address_line_1: z.string()
    .min(1, 'Address is required')
    .min(10, 'Please enter a complete address (at least 10 characters)')
    .max(200, 'Address must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s,''-\/]+$/, 'Address contains invalid characters'),
  billing_city: z.string()
    .min(1, 'City is required')
    .min(2, 'City name must be at least 2 characters')
    .max(50, 'City name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'City name can only contain letters and spaces'),
  billing_state: z.string()
    .min(1, 'State is required')
    .min(2, 'State name must be at least 2 characters')
    .max(50, 'State name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'State name can only contain letters and spaces'),
  billing_postal_code: z.string()
    .min(1, 'PIN code is required')
    .length(6, 'PIN code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'PIN code can only contain digits')
    .refine(pincode => !/^(\d)\1{5}$/.test(pincode), 'Please enter a valid PIN code'),
  billing_country: z.string()
    .min(1, 'Country is required')
    .min(2, 'Country name must be at least 2 characters')
    .max(50, 'Country name must be less than 50 characters'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;
type BillingFormData = z.infer<typeof billingSchema>;

interface ShippingStepProps {
  onSubmit: (data: ShippingFormData & { sameAsBilling: boolean; billingAddress?: BillingFormData }) => void;
  initialData?: Partial<ShippingFormData>;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  savedAddresses?: any[];
}

const ShippingStep: React.FC<ShippingStepProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
  isAuthenticated = false,
  savedAddresses = []
}) => {
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
    setValue,
    trigger,
    clearErrors
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Auto-trigger validation on blur
  const handleFieldBlur = async (fieldName: keyof ShippingFormData) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    await trigger(fieldName);
  };

  // Clear errors when user starts typing
  const handleFieldChange = (fieldName: keyof ShippingFormData) => {
    if (errors[fieldName]) {
      clearErrors(fieldName);
    }
  };

  const {
    register: registerBilling,
    formState: { errors: billingErrors },
    setValue: setBillingValue,
    trigger: triggerBilling
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    mode: 'onChange'
  });

  const handleAddressSelect = (address: any) => {
    setSelectedAddressId(address.id);
    setUseNewAddress(false);

    // Populate form with selected address
    setValue('firstName', address.first_name || '');
    setValue('lastName', address.last_name || '');
    setValue('phone', address.phone || '');
    setValue('address_line_1', address.address_line_1 || '');
    setValue('city', address.city || '');
    setValue('state', address.state || '');
    setValue('postal_code', address.postal_code || '');
    setValue('country', address.country || 'India');
    setValue('email', address.email || '');
  };

  const handleFormSubmit = (data: ShippingFormData) => {
    let billingAddress: BillingFormData | undefined;

    if (!sameAsBilling) {
      billingAddress = {
        billing_firstName: watch('firstName'),
        billing_lastName: watch('lastName'),
        billing_phone: watch('phone'),
        billing_address_line_1: watch('address_line_1'),
        billing_city: watch('city'),
        billing_state: watch('state'),
        billing_postal_code: watch('postal_code'),
        billing_country: watch('country'),
      };
    }

    onSubmit({
      ...data,
      sameAsBilling,
      billingAddress
    });
  };

  return (
    <div className="space-y-6">
      {/* Form Validation Summary */}
      {(useNewAddress || !isAuthenticated) && (
        <Card>
          <CardContent className="pt-6">
            <FormValidationSummary
              errors={errors}
              isValid={isValid}
              isDirty={Object.keys(dirtyFields).length > 0}
              touchedFields={touchedFields}
            />
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            register={register}
            name="email"
            errors={errors}
            required
            value={watchedValues.email}
            onChange={() => handleFieldChange('email')}
            autoComplete="email"
            hint="We'll send order confirmation and tracking updates here"
          />
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated && savedAddresses.length > 0 && !useNewAddress && (
            <div>
              <Label>Saved Addresses</Label>
              <div className="mt-2 space-y-2">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="font-medium">{address.first_name} {address.last_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {address.address_line_1}, {address.city}, {address.state} {address.postal_code}
                    </div>
                    <div className="text-sm text-muted-foreground">{address.phone}</div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUseNewAddress(true)}
                className="mt-2"
              >
                Use New Address
              </Button>
            </div>
          )}

          {(useNewAddress || !isAuthenticated) && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  placeholder="John"
                  register={register}
                  name="firstName"
                  errors={errors}
                  required
                  value={watchedValues.firstName}
                  onChange={() => handleFieldChange('firstName')}
                  autoComplete="given-name"
                />
                <FormField
                  label="Last Name"
                  placeholder="Doe"
                  register={register}
                  name="lastName"
                  errors={errors}
                  required
                  value={watchedValues.lastName}
                  onChange={() => handleFieldChange('lastName')}
                  autoComplete="family-name"
                />
              </div>

              <FormField
                label="Phone Number"
                type="tel"
                placeholder="9876543210"
                register={register}
                name="phone"
                errors={errors}
                required
                maxLength={10}
                value={watchedValues.phone}
                onChange={() => handleFieldChange('phone')}
                autoComplete="tel"
                hint="For delivery updates and order confirmation"
              />

              <FormField
                label="Address Line 1"
                placeholder="123 Main Street, Apartment 4B"
                register={register}
                name="address_line_1"
                errors={errors}
                required
                value={watchedValues.address_line_1}
                onChange={() => handleFieldChange('address_line_1')}
                autoComplete="street-address"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="City"
                  placeholder="Mumbai"
                  register={register}
                  name="city"
                  errors={errors}
                  required
                  value={watchedValues.city}
                  onChange={() => handleFieldChange('city')}
                  autoComplete="address-level2"
                />
                <FormField
                  label="State"
                  placeholder="Maharashtra"
                  register={register}
                  name="state"
                  errors={errors}
                  required
                  value={watchedValues.state}
                  onChange={() => handleFieldChange('state')}
                  autoComplete="address-level1"
                />
                <FormField
                  label="PIN Code"
                  type="text"
                  placeholder="400001"
                  register={register}
                  name="postal_code"
                  errors={errors}
                  required
                  maxLength={6}
                  value={watchedValues.postal_code}
                  onChange={() => handleFieldChange('postal_code')}
                  autoComplete="postal-code"
                />
              </div>

              <FormField
                label="Country"
                placeholder="India"
                register={register}
                name="country"
                errors={errors}
                required
                value={watchedValues.country}
                onChange={() => handleFieldChange('country')}
                autoComplete="country-name"
              />

              {isAuthenticated && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUseNewAddress(false)}
                >
                  Use Saved Address
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="sameAsBilling"
              checked={sameAsBilling}
              onCheckedChange={(checked) => setSameAsBilling(checked as boolean)}
            />
            <Label htmlFor="sameAsBilling" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Same as shipping address
            </Label>
          </div>

          {!sameAsBilling && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Billing address information will be copied from shipping address. You can modify it if needed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {Object.keys(errors).length > 0 && (
            <span>Please correct {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} to continue</span>
          )}
          {Object.keys(errors).length === 0 && isValid && (
            <span>All information is correct ✓</span>
          )}
        </div>

        <Button
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isLoading || !isValid}
          className="min-w-[140px]"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              Continue to Payment
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Need help?</strong> All information is encrypted and secure.
          You can save this address for future orders if you're logged in.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ShippingStep;