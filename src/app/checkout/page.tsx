'use client';

// TODO: Replace console.log statements with logger from '@/lib/logger' for production
// Currently 34 console.log statements used for debugging

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfig } from '@/contexts/ConfigContext';
import { useCartStore } from '@/stores/cart';
import { useHydratedAuth } from '@/stores/auth';
import { cartApi, orderApi, shippingApi, addressApi, paymentApi } from '@/lib/api';
import { toast } from 'sonner';
import { Cart, Order, Address } from '@/types';
import AddressManager from '@/components/AddressManager';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrderSummaryCard } from '@/components/cart/OrderSummaryCard';
import { GatewayIcon } from '@/components/payment/GatewayIcon';
import { logger } from '@/lib/logger';
import {
  BookOpen,
  CreditCard,
  MapPin,
  Truck,
  Shield,
  CheckCircle,
  Circle,
  Lock,
  Loader2,
  ShoppingBag,
  Check,
  User,
  Phone,
  Mail,
  Home,
  Package,
  Clock,
  AlertCircle,
  Star,
  Gift,
  Percent,
  X,
  ChevronRight,
  ChevronLeft,
  MapPinned,
  Timer,
  DollarSign,
  Info,
  Sparkles,
  Asterisk
} from 'lucide-react';


// Flexible shipping schema - email required for all users (for order confirmation)
const shippingSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  pincode: z.string().optional(),
  area: z.string().optional(),
  houseNo: z.string().optional(),
  landmark: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

// Strict validation for guest checkout
const guestShippingSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsapp: z.string().optional(),
  pincode: z.string().length(6, 'Pincode must be exactly 6 digits'),
  area: z.string().min(2, 'Village/City/Area is required'),
  houseNo: z.string().optional(),
  landmark: z.string().optional(),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  address: z.string().min(5, 'Complete address is required'),
  city: z.string().min(2, 'City is required'),
});

const billingSchema = z.object({
  billing_firstName: z.string().min(2, 'First name must be at least 2 characters'),
  billing_lastName: z.string().min(1, 'Last name is required'),
  billing_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  billing_pincode: z.string().length(6, 'Pincode must be exactly 6 digits'),
  billing_area: z.string().min(2, 'Village/City/Area is required'),
  billing_houseNo: z.string().optional(),
  billing_landmark: z.string().optional(),
  billing_district: z.string().min(2, 'District is required'),
  billing_state: z.string().min(2, 'State is required'),
  billing_address: z.string().min(5, 'Complete address is required'),
  billing_city: z.string().min(2, 'City is required'),
});

const paymentSchema = z.object({
  paymentMethod: z.string().optional(), // Made optional - will validate conditionally based on payment type
  notes: z.string().optional(),
});

const checkoutSchema = shippingSchema.merge(billingSchema.partial()).merge(paymentSchema);

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Map hash to step numbers
  const getStepFromHash = (hash: string): number => {
    switch (hash) {
      case '#shipping':
      case '#step1':
        return 1;
      case '#billing':
      case '#step2':
        return 2;
      case '#payment':
      case '#review':
      case '#step3':
        return 3;
      default:
        return 1;
    }
  };

  // Map step to hash
  const getHashFromStep = (step: number): string => {
    switch (step) {
      case 1:
        return '#shipping';
      case 2:
        return '#billing';
      case 3:
        return '#payment';
      default:
        return '#shipping';
    }
  };

  // Initialize step from URL hash
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '#shipping';
      return getStepFromHash(hash);
    }
    return 1;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeInfo, setPincodeInfo] = useState<any>(null);
  // Load persisted state from localStorage
  const getPersistedState = () => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('checkoutState');
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (e) {
          logger.error('Failed to parse saved state:', e);
        }
      }
    }
    return {};
  };

  const persistedState = getPersistedState();

  const [shippingCost, setShippingCost] = useState(persistedState.shippingCost || 0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(persistedState.sameAsBilling ?? true);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>(persistedState.estimatedDelivery || '?');
  const [codAvailable, setCodAvailable] = useState(persistedState.codAvailable ?? false);
  const [showCouponField, setShowCouponField] = useState(false);
  const [couponCode, setCouponCode] = useState(persistedState.couponCode || '?');
  const [applyCouponLoading, setApplyCouponLoading] = useState(false);
  const { siteConfig } = useConfig();
  const { cart, getCart, applyCoupon, removeCoupon, setPaymentMethod, selectedPaymentMethod: storePaymentMethod, setDeliveryPincode, isLoading: cartLoading } = useCartStore();
  const { user, isAuthenticated } = useHydratedAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(persistedState.selectedAddressId || null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(persistedState.selectedBillingAddressId || null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<Address | null>(persistedState.selectedShippingAddress || null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<Address | null>(persistedState.selectedBillingAddress || null);
  // FIXED: Proper TypeScript types for payment data
  interface PaymentMethod {
    payment_method: string;
    display_name: string;
    description: string;
    priority: number;
    advance_payment?: {
      required: boolean;
      percentage: number;
    } | null;
  }

  interface CODConfig {
    enabled: boolean;
    display_name: string;
    description: string;
    advance_payment?: {
      required: boolean;
      type: 'fixed' | 'percentage';
      value: number;
      percentage?: number;  // Add percentage field for advance payment
      description?: string;
    } | null;
    service_charges?: {
      enabled: boolean;
      type: string;
      value: number;
      description?: string;
    } | null;
  }

  interface PaymentFlowSettings {
    type: 'two_tier' | 'single_list' | 'cod_first';
    default_payment_type: 'online' | 'cod' | 'none';
  }

  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  // Restore payment type from localStorage if available
  const [paymentType, setPaymentType] = useState<'online' | 'cod' | null>(persistedState.paymentType || null);
  const [codConfig, setCodConfig] = useState<CODConfig | null>(null);
  const [codChargeAmount, setCodChargeAmount] = useState<number>(0); // Track COD charge for display
  const [paymentFlowSettings, setPaymentFlowSettings] = useState<PaymentFlowSettings>({ type: 'two_tier', default_payment_type: 'none' });
  const [isProcessingPaymentTypeChange, setIsProcessingPaymentTypeChange] = useState(false);
  const lastPaymentMethodRef = useRef<string | null>(null); // Track last payment method to prevent infinite loop

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
    setValue,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: (() => {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('checkoutFormData');
        if (savedData) {
          try {
            return JSON.parse(savedData);
          } catch (e) {
            logger.error('Failed to parse saved form data:', e);
          }
        }
      }
      return {};
    })(),
  });

  // Watch form values for real-time validation
  const formValues = watch();

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Debounce to avoid too frequent saves
      const timeoutId = setTimeout(() => {
        localStorage.setItem('checkoutFormData', JSON.stringify(formValues));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formValues]);

  // Save checkout state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        shippingCost,
        sameAsBilling,
        estimatedDelivery,
        codAvailable,
        couponCode,
        selectedAddressId,
        selectedBillingAddressId,
        selectedShippingAddress,
        selectedBillingAddress,
        paymentType,
        // Don't persist the processing flag - it's only for runtime state management
      };
      localStorage.setItem('checkoutState', JSON.stringify(stateToSave));
    }
  }, [
    shippingCost,
    sameAsBilling,
    estimatedDelivery,
    codAvailable,
    couponCode,
    selectedAddressId,
    selectedBillingAddressId,
    selectedShippingAddress,
    selectedBillingAddress,
    paymentType,
  ]);

  // Real-time validation functions
  const isStep1Valid = () => {
    if (isAuthenticated) {
      // For authenticated users, check if address is selected and email is provided
      // Email is required for order confirmation even if user signed up with phone
      const hasEmail = formValues.email?.includes('@');
      return selectedShippingAddress !== null && hasEmail;
    }

    // For guest users, check form fields
    const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'pincode', 'area', 'address', 'city', 'district', 'state'];
    const isValid = requiredFields.every(field => {
      const value = formValues[field];
      return value && String(value).trim() !== '';
    }) &&
      formValues.email?.includes('@') &&
      String(formValues.phone || '?').length >= 10 &&
      String(formValues.pincode || '?').length === 6 &&
      !pincodeError;

    return isValid;
  };

  const isStep2Valid = () => {
    if (sameAsBilling) return true;

    if (isAuthenticated) {
      // For authenticated users, check if billing address is selected
      return selectedBillingAddress !== null;
    }

    // For guest users, check form fields
    const requiredFields = ['billing_firstName', 'billing_lastName', 'billing_phone', 'billing_pincode', 'billing_area', 'billing_address', 'billing_city', 'billing_district', 'billing_state'];
    return requiredFields.every(field => {
      const value = formValues[field];
      return value && value.trim() !== '';
    }) &&
      formValues.billing_phone?.length >= 10 &&
      formValues.billing_pincode?.length === 6;
  };

  const isStep3Valid = () => {
    // First check if payment type is selected
    if (!paymentType) return false;

    // If online payment, check if gateway is selected
    if (paymentType === 'online') {
      const paymentMethod = selectedPaymentMethod;
      const isValid = !!paymentMethod && paymentMethod.trim() !== '';
      return isValid;
    }

    // If COD with advance, check if gateway is selected
    if (paymentType === 'cod' && codConfig?.advance_payment?.required) {
      const paymentMethod = selectedPaymentMethod;
      const isValid = !!paymentMethod && paymentMethod.trim() !== '';
      return isValid;
    }

    // If COD without advance, no gateway selection needed
    if (paymentType === 'cod') {
      return true;
    }

    return false;
  };

  // Get current step validity
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: return isStep1Valid();
      case 2: return isStep2Valid();
      case 3: return isStep3Valid();
      default: return false;
    }
  };

  useEffect(() => {
    loadCart();
    if (isAuthenticated) {
      loadAddresses();
      // Set user email for authenticated users if they have one
      if (user?.email && user.email.includes('@')) {
        setValue('email', user.email);
      }
    }
    // Payment methods will be loaded when user reaches payment step (via currentStep effect)
    // Removing initial load to prevent redundant calls
  }, [isAuthenticated, user]);

  // Refresh payment methods when navigating to payment step
  // This ensures we get the latest payment options from admin settings
  useEffect(() => {
    if (currentStep === 3 && !isProcessingPaymentTypeChange) { // Payment step
      const orderTotal = cart?.summary?.total || 0;
      loadPaymentMethods(orderTotal);
      // Note: COD charge is automatically set by useEffect that watches cart.summary and codConfig
    }
  }, [currentStep]); // Only depend on currentStep to avoid redundant calls when total changes

  // Listen for hash changes and update step
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#shipping';
      const newStep = getStepFromHash(hash);
      setCurrentStep(newStep);
    };

    // Handle initial hash on mount
    const initialHash = window.location.hash || '#shipping';
    const initialStep = getStepFromHash(initialHash);
    if (initialStep !== currentStep) {
      setCurrentStep(initialStep);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []); // Remove currentStep dependency to avoid stale closures

  // Update URL hash when step changes programmatically (not from hash change)
  const updateUrlHash = (step: number) => {
    const newHash = getHashFromStep(step);
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  };

  // Clear form data from localStorage when checkout is completed
  useEffect(() => {
    return () => {
      // Cleanup function - only clear if we're leaving checkout
      if (typeof window !== 'undefined' && window.location.pathname !== '/checkout') {
        localStorage.removeItem('checkoutFormData');
        localStorage.removeItem('checkoutState');
      }
    };
  }, []);

  // Track COD charge from cart summary OR codConfig when available
  useEffect(() => {
    logger.log('COD charge effect - codConfig:', codConfig?.service_charges, 'cart charges:', cart?.summary?.charges);

    // First priority: get COD charge from cart if present
    const codChargeFromCart = cart?.summary?.charges?.find((c: any) => c.code === 'cod_service_charge')?.amount;
    if (codChargeFromCart && codChargeFromCart > 0) {
      logger.log('Setting COD charge from cart:', codChargeFromCart);
      setCodChargeAmount(codChargeFromCart);
      return;
    }

    // Second priority: calculate from codConfig.service_charges
    if (codConfig?.service_charges?.enabled && codConfig.service_charges.value > 0) {
      if (codConfig.service_charges.type === 'percentage') {
        // For percentage, use the base total (cart total without any COD charge)
        const baseTotal = cart?.summary?.total || 0;
        const calculatedCharge = (baseTotal * codConfig.service_charges.value) / 100;
        logger.log('Setting COD charge from config (percentage):', calculatedCharge);
        setCodChargeAmount(calculatedCharge);
      } else {
        // Fixed charge
        logger.log('Setting COD charge from config (fixed):', codConfig.service_charges.value);
        setCodChargeAmount(codConfig.service_charges.value);
      }
    }
  }, [cart?.summary, codConfig]);

  // Update cart when payment type changes - CLEAN & SIMPLE
  useEffect(() => {
    if (!paymentType) return;

    const actualPaymentMethod = paymentType === 'cod'
      ? 'cod'
      : (availablePaymentMethods[0]?.payment_method || null);

    // Skip if same as last update - prevents infinite loop
    if (lastPaymentMethodRef.current === actualPaymentMethod) {
      return;
    }

    const updateCart = async () => {
      try {
        await setPaymentMethod(actualPaymentMethod);
        lastPaymentMethodRef.current = actualPaymentMethod; // Track update
        logger.log('✅ Cart updated with payment method:', actualPaymentMethod);
      } catch (error) {
        logger.error('❌ Failed to update payment method:', error);
      }
    };

    // Debounce to prevent rapid API calls
    const timer = setTimeout(updateCart, 300);
    return () => clearTimeout(timer);
  }, [paymentType, availablePaymentMethods]); // Removed setPaymentMethod to prevent infinite loop


  // Ref to track ongoing pincode validation requests to prevent duplicates
  const pincodeValidationRef = useRef(false);
  // Ref to track ongoing shipping calculation requests to prevent duplicates
  const shippingCalculationRef = useRef(false);

  // Watch pincode field and trigger validation when it changes
  useEffect(() => {
    const pincode = formValues.pincode;

    const timeoutId = setTimeout(() => {
      if (pincode && pincode.length === 6 && !pincodeValidationRef.current) {
        // Set the ref to prevent multiple simultaneous requests
        pincodeValidationRef.current = true;
        validatePincode(pincode).finally(() => {
          // Reset the ref after validation completes
          pincodeValidationRef.current = false;
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formValues.pincode]);

  const loadCart = async () => {
    try {
      setLoading(true);

      // CRITICAL: If no payment type persisted (fresh visit), clear payment method from cart store
      // This prevents COD charges from showing before user selects payment type
      if (!persistedState.paymentType) {
        // Clear payment method from cart store to fetch cart without any payment-specific charges
        useCartStore.getState().setPaymentMethod(null);
      }

      await getCart();

      const currentCart = useCartStore.getState().cart;

      if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
        router.push('/cart');
        return;
      }

      setLoading(false);

    } catch (err) {
      logger.error('Failed to load cart:', err);
      setError('Failed to load cart. Please try again.');
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      // Get only shipping addresses for the shipping address selector
      const response = await addressApi.getAddresses('shipping');
      if (response?.status === 'success' || response?.data) {
        const shippingAddresses = response.data || [];
        setAddresses(shippingAddresses);

        // First, try to restore previously selected address from localStorage
        const persistedAddressId = persistedState.selectedAddressId;
        const persistedAddress = persistedAddressId
          ? shippingAddresses.find((addr: Address) => addr.id === persistedAddressId)
          : null;

        if (persistedAddress) {
          // Restore the previously selected address
          setSelectedAddressId(persistedAddress.id);
          setSelectedShippingAddress(persistedAddress);
          populateFormFromAddress(persistedAddress);

          // Calculate shipping for restored address
          if (persistedAddress.postal_code && persistedAddress.postal_code.length === 6) {
            // Set delivery pincode to trigger shipping calculation later
            setDeliveryPincode(persistedAddress.postal_code);
          }
        } else {
          // Otherwise, use default shipping address
          const defaultShipping = shippingAddresses.find(
            (addr: Address) => addr.is_default
          );
          if (defaultShipping) {
            setSelectedAddressId(defaultShipping.id);
            setSelectedShippingAddress(defaultShipping);
            populateFormFromAddress(defaultShipping);

            // Calculate shipping for default address
            if (defaultShipping.postal_code && defaultShipping.postal_code.length === 6) {
              // Set delivery pincode to trigger shipping calculation later
              setDeliveryPincode(defaultShipping.postal_code);
            }
          }
        }

        // Load billing addresses separately if needed
        const billingResponse = await addressApi.getAddresses('billing');
        if (billingResponse?.status === 'success' || billingResponse?.data) {
          const billingAddresses = billingResponse.data || [];

          // First, try to restore previously selected billing address from localStorage
          const persistedBillingAddressId = persistedState.selectedBillingAddressId;
          const persistedBillingAddress = persistedBillingAddressId
            ? billingAddresses.find((addr: Address) => addr.id === persistedBillingAddressId)
            : null;

          if (persistedBillingAddress) {
            // Restore the previously selected billing address
            setSelectedBillingAddressId(persistedBillingAddress.id);
            setSelectedBillingAddress(persistedBillingAddress);
          } else {
            // Otherwise, use default billing address
            const defaultBilling = billingAddresses.find(
              (addr: Address) => addr.is_default
            );
            if (defaultBilling) {
              setSelectedBillingAddressId(defaultBilling.id);
              setSelectedBillingAddress(defaultBilling);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load addresses:', error);
    }
  };

  /**
   * Load available payment methods from backend
   *
   * SINGLE SOURCE OF TRUTH - HIERARCHICAL SYSTEM:
   * Backend checks TWO conditions for each payment method:
   * 1. PaymentSetting.is_active (Gateway Master Switch) - Must be ON
   * 2. PaymentConfiguration.is_enabled (Method Switch) - Must be ON
   *
   * Only methods where BOTH are true will be returned by the API.
   * This is enforced in backend PaymentConfiguration::getEnabledMethods()
   */
  const loadPaymentMethods = async (orderAmount?: number) => {
    try {
      const response = await paymentApi.getPaymentMethods(orderAmount, 'INR');

      // Handle unified gateway response
      const gateways = response?.gateways || [];

      if (response?.success && gateways.length > 0) {
        // Store payment flow settings from backend with validation
        if (response.payment_flow) {
          // FIXED: Validate payment flow type, default to 'two_tier' if invalid
          const validTypes = ['two_tier', 'single_list', 'cod_first'];
          const flowType = validTypes.includes(response.payment_flow.type)
            ? response.payment_flow.type
            : 'two_tier';

          setPaymentFlowSettings({
            ...response.payment_flow,
            type: flowType
          });

          // Handle default payment type from admin settings
          // ONLY if there's no persisted payment type (fresh visit, not user selection)
          // AND we're not in the middle of a payment type change
          const hasPersistedPaymentType = persistedState.paymentType !== undefined && persistedState.paymentType !== null;
          const defaultPaymentType = (response as any).payment_flow?.default_payment_type;
          if (!hasPersistedPaymentType && !paymentType && !isProcessingPaymentTypeChange) {
            if (defaultPaymentType && defaultPaymentType !== 'none') {
              // Admin has set a default (online or cod) - apply it
              setPaymentType(defaultPaymentType as 'online' | 'cod');
            }
            // If 'none', leave paymentType as null (user must choose)
          }
        }

        // Separate COD from online payment methods
        const codGateway = gateways.find((g: any) => g.gateway && g.gateway.includes('cod'));
        const onlineGateways = gateways.filter((g: any) => !g.gateway || !g.gateway.includes('cod'));

        // Transform online gateways only
        const methods = onlineGateways.map((gateway: any) => ({
          payment_method: gateway.gateway,
          display_name: gateway.display_name || gateway.name,
          description: gateway.description || '?',
          priority: gateway.priority || 0
        }));
        setAvailablePaymentMethods(methods);

        // Store COD configuration separately
        // Check both: COD gateway exists AND admin has enabled COD visibility
        const isCodEnabled = response.payment_flow?.cod_enabled !== false; // Default to true if not specified

        if (codGateway && codGateway.is_active !== false && isCodEnabled) {
          const config = {
            enabled: true,
            display_name: codGateway.display_name || 'Cash on Delivery',
            description: codGateway.description || 'Pay when your order arrives',
            advance_payment: codGateway.advance_payment || null,
            service_charges: codGateway.service_charges || null
          };
          logger.log('COD config loaded:', config);
          setCodConfig(config);
          setCodAvailable(true);
        } else {
          setCodConfig(null);
          setCodAvailable(false);
        }
      }
    } catch (error) {
      logger.error('Failed to load payment methods:', error);
      // Set default methods if API fails
      setAvailablePaymentMethods([
        {
          payment_method: 'razorpay',
          display_name: 'Online Payment (Cards/UPI/NetBanking)',
          description: 'Pay securely using cards, UPI, or net banking',
          priority: 10
        }
      ]);
      setCodConfig({
        enabled: true,
        display_name: 'Cash on Delivery',
        description: 'Pay when your order arrives',
        advance_payment: null,
        service_charges: null
      });
      setCodAvailable(true);
    }
  };



  const handleShippingAddressSelect = (address: Address) => {
    setSelectedShippingAddress(address);
    setSelectedAddressId(address.id);
    populateFormFromAddress(address); // This already calls setDeliveryPincode

    // populateFormFromAddress already handles shipping calculation via setDeliveryPincode
    // No need to call calculateShipping again - prevents duplicate cart API calls
  };

  const handleBillingAddressSelect = (address: Address) => {
    setSelectedBillingAddress(address);
    setSelectedBillingAddressId(address.id);
  };

  const populateFormFromAddress = (address: Address) => {

    setValue('firstName', address.first_name);
    setValue('lastName', address.last_name || '?');
    setValue('phone', address.phone || '?');
    setValue('pincode', address.postal_code);
    setValue('area', address.city);
    setValue('city', address.city);
    setValue('houseNo', address.address_line_1);
    setValue('landmark', address.address_line_2 || '?');

    // If there's a district field in address, use it, otherwise use city
    const district = (address as any).district || address.city;
    setValue('district', district);
    setValue('state', address.state);

    // REMOVED: 'address' field - causes conflict with houseNo
    // We use houseNo as the primary field for address_line_1

    // Don't calculate shipping here - it's already set via setDeliveryPincode
    // This prevents redundant cart API calls
    if (address.postal_code) {
      setDeliveryPincode(address.postal_code);
    }
  };

  const handleAddressSelect = async (addressId: number) => {
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setSelectedAddressId(addressId);
      setSelectedShippingAddress(selectedAddress);
      populateFormFromAddress(selectedAddress); // This already calls setDeliveryPincode
      setShowNewAddressForm(false);

      // populateFormFromAddress already handles shipping calculation via setDeliveryPincode
      // No need to call calculateShipping again - prevents duplicate cart API calls
    }
  };

  const handleCreateAddress = async (addressData: CheckoutForm) => {
    try {
      const response = await addressApi.createAddress({
        type: 'shipping',
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        address_line_1: addressData.houseNo || addressData.address,
        address_line_2: addressData.landmark || '?',
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.pincode,
        country: 'IN',
        phone: addressData.phone,
        is_default: addresses.length === 0
      });

      if (response?.status === 'success' || response?.data) {
        await loadAddresses();
        setShowNewAddressForm(false);
        if (response.data?.id) {
          setSelectedAddressId(response.data.id);
        }
      }
    } catch (error) {
      logger.error('Failed to create address:', error);
      throw error;
    }
  };

  const handleUpdateAddress = async (addressId: number, addressData: CheckoutForm) => {
    try {
      const response = await addressApi.updateAddress(addressId, {
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        address_line_1: addressData.houseNo || addressData.address,
        address_line_2: addressData.landmark || '?',
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.pincode,
        phone: addressData.phone,
      });

      if (response?.status === 'success' || response?.data) {
        await loadAddresses();
      }
    } catch (error) {
      logger.error('Failed to update address:', error);
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    try {
      const response = await addressApi.deleteAddress(addressId);

      if (response?.status === 'success' || response?.message) {
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
        }

        await loadAddresses();

        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        if (updatedAddresses.length > 0 && !selectedAddressId) {
          handleAddressSelect(updatedAddresses[0].id);
        }
      }
    } catch (error) {
      logger.error('Failed to delete address:', error);
    }
  };

  const validatePincode = async (pincode: string) => {
    if (pincode.length !== 6) return;

    setCalculatingShipping(true);
    setPincodeError(null);
    setPincodeInfo(null);

    try {
      const response = await shippingApi.checkPincode(pincode);

      if (response.success) {
        setValue('state', response.zone_info?.state || '?');
        setValue('district', response.zone_info?.city || '?');

        setPincodeInfo(response.zone_info);
        setEstimatedDelivery(response.estimated_delivery || '3-5 business days');
        setCodAvailable(response.cod_available || false);

        await calculateShipping(pincode);
      } else {
        setPincodeError('Sorry, we do not deliver to this pincode. Please try a different pincode.');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unable to validate pincode. Please try again.';
      setPincodeError(errorMessage);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const calculateShipping = async (pincode: string) => {
    if (!cart || !pincode || pincode.length !== 6) return;
    // Prevent multiple simultaneous requests
    if (shippingCalculationRef.current) {
      return;
    }

    try {
      shippingCalculationRef.current = true;
      setCalculatingShipping(true);
      // Use new cart/calculate-shipping endpoint
      const response = await cartApi.calculateShipping(pincode);

      if (response.success && response.summary) {
        const summary = response.summary;
        setShippingCost(summary.shipping_cost || 0);

        if (summary.shipping_details) {
          setEstimatedDelivery(summary.shipping_details.delivery_estimate || '3-5 business days');
          setCodAvailable(true);
        }

        // IMPORTANT: Set delivery pincode - store will handle cart refresh
        // setDeliveryPincode already triggers cart update in the store
        setDeliveryPincode(pincode);
        // REMOVED: Redundant getCart call - setDeliveryPincode doesn't auto-refresh
        // We only refresh after explicit user actions (address selection)
        await getCart(pincode);
      } else {
        logger.error('Shipping calculation failed:', response);
        toast.error('Failed to calculate shipping. Using default rates.');
      }
    } catch (error: any) {
      logger.error('Failed to calculate shipping:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to calculate shipping';
      toast.error(errorMessage);
      // Set default shipping cost on error
      setShippingCost(50);
    } finally {
      setCalculatingShipping(false);
      shippingCalculationRef.current = false;
    }
  };

  const handleApplyCoupon = async (code?: string) => {
    const codeToApply = code || couponCode;
    if (!codeToApply.trim()) return;

    try {
      setApplyCouponLoading(true);
      await applyCoupon(codeToApply);
      setShowCouponField(false);
      setCouponCode('');
    } catch (error) {
      logger.error('Failed to apply coupon:', error);
    } finally {
      setApplyCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch (error) {
      logger.error('Failed to remove coupon:', error);
    }
  };

  const validateStep1 = async () => {
    if (isAuthenticated) {
      // For authenticated users, check address selection, email, and pincode serviceability
      if (!selectedShippingAddress) {
        setError('Please select a delivery address');
        return false;
      }

      const formData = getValues();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        setError('Please enter a valid email address for order confirmation');
        return false;
      }

      // FIXED: Block checkout if selected address has unserviceable pincode
      if (pincodeError) {
        setError('The selected address has an unserviceable pincode. Please choose a different address or update the pincode.');
        return false;
      }

      setError(null);
      return true;
    }

    // For guest users, validate all form fields
    const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'pincode', 'area', 'address', 'city', 'district', 'state'];
    const formData = getValues();
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return false;
    }

    if (formData.pincode.length !== 6) {
      setError('Pincode must be exactly 6 digits');
      return false;
    }

    if (pincodeError) {
      setError('Please enter a valid serviceable pincode');
      return false;
    }

    setError(null);

    // Only call calculateShipping if it's valid and not already calculating
    if (formData.pincode && formData.pincode.length === 6 && !calculatingShipping) {
      await calculateShipping(formData.pincode);
    }

    return true;
  };

  const validateStep2 = () => {
    if (sameAsBilling) return true;

    if (isAuthenticated) {
      // For authenticated users, just check billing address selection
      if (!selectedBillingAddress) {
        setError('Please select a billing address');
        return false;
      }

      setError(null);
      return true;
    }

    // For guest users, validate all billing form fields
    const requiredFields = ['billing_firstName', 'billing_lastName', 'billing_phone', 'billing_pincode', 'billing_area', 'billing_address', 'billing_city', 'billing_district', 'billing_state'];
    const formData = getValues();
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

    if (missingFields.length > 0) {
      setError(`Please fill in all required billing fields: ${missingFields.map(f => f.replace('billing_', '')).join(', ')}`);
      return false;
    }

    setError(null);
    return true;
  };

  const validateStep3 = () => {
    const formData = getValues();
    if (!formData.paymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    setError(null);
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && sameAsBilling) {
      window.location.hash = '#payment';
    } else if (currentStep < 3) {
      const nextHash = getHashFromStep(currentStep + 1);
      window.location.hash = nextHash;
    }
  };

  const prevStep = () => {
    if (currentStep === 3 && sameAsBilling) {
      window.location.hash = '#shipping';
    } else if (currentStep > 1) {
      const prevHash = getHashFromStep(currentStep - 1);
      window.location.hash = prevHash;
    }
  };

  const handleContinueToNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = false;
    }

    if (isValid) {
      nextStep();
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked && currentStep === 2) {
      window.location.hash = '#payment';
    }
  };

  const steps = [
    { id: 1, name: 'Shipping Details', icon: MapPin, completed: currentStep > 1, hash: '#shipping' },
    { id: 2, name: 'Billing Address', icon: Home, completed: currentStep > 2, skip: sameAsBilling, hash: '#billing' },
    { id: 3, name: 'Payment & Review', icon: CreditCard, completed: false, hash: '#payment' },
  ];

  const currencySymbol = siteConfig?.payment?.currency_symbol || '₹';

  const subtotal = cart?.summary?.subtotal || cart?.subtotal || 0;
  const couponDiscount = cart?.summary?.coupon_discount || 0;
  const activeCouponCode = cart?.summary?.coupon_code || null;
  const discountedSubtotal = cart?.summary?.discounted_subtotal || (subtotal - couponDiscount);
  const hasValidShippingAddress = isAuthenticated ?
    selectedShippingAddress?.postal_code && selectedShippingAddress?.state && selectedShippingAddress?.city :
    getValues('pincode') && getValues('state') && getValues('city');
  const calculatedShippingCost = hasValidShippingAddress ? (shippingCost || 0) : 0;
  // FIXED: Use server-calculated tax only (varies by state - CGST+SGST vs IGST)
  // Never fallback to hardcoded rate - if tax_amount missing, it's 0
  const tax = cart?.summary?.tax_amount || 0;
  const totalCharges = cart?.summary?.total_charges || 0;

  // CRITICAL: Robust total calculation handling COD toggle
  // 1. Identify if cart has COD charge baked in
  const codInCart = cart?.summary?.charges?.find((c: any) => c.code === 'cod_service_charge')?.amount || 0;

  // 2. Get base total (stripped of COD charge)
  const cartCurrentTotal = cart?.summary?.total || (discountedSubtotal + calculatedShippingCost + tax + totalCharges);
  const baseTotal = cartCurrentTotal - codInCart;

  // 3. Determine applicable COD charge for current selection
  let applicableCodCharge = 0;
  if (paymentType === 'cod') {
    // Use state if available (primary source from useEffect)
    if (codChargeAmount > 0) {
      applicableCodCharge = codChargeAmount;
    } else if (codConfig?.service_charges?.enabled && codConfig.service_charges.value > 0) {
      // Fallback calculation directly from config if state not ready
      if (codConfig.service_charges.type === 'percentage') {
        applicableCodCharge = (baseTotal * codConfig.service_charges.value) / 100;
      } else {
        applicableCodCharge = codConfig.service_charges.value;
      }
    }
  }

  // 4. Final total for display
  const total = baseTotal + applicableCodCharge;

  // 5. Final charges list for display
  let finalChargesList = cart?.summary?.charges || [];
  if (paymentType === 'cod' && codInCart === 0 && applicableCodCharge > 0) {
    // Add COD charge if missing from cart but applicable
    finalChargesList = [...finalChargesList, {
      code: 'cod_service_charge',
      name: 'Cash on Delivery Charge',
      display_label: codConfig?.service_charges?.description || 'COD Service Charge',
      amount: applicableCodCharge,
      is_taxable: false,
      type: 'fixed'
    }];
  } else if (paymentType !== 'cod' && codInCart > 0) {
    // If we switched away from COD but cart still has it (stale), remove it from display list
    finalChargesList = finalChargesList.filter((c: any) => c.code !== 'cod_service_charge');
  }
  const finalTotalCharges = finalChargesList.reduce((acc: number, c: any) => acc + (parseFloat(c.amount) || 0), 0);

  // Load payment methods when total changes (but not during payment type changes)
  // DISABLED: This was causing redundant calls. Payment methods are loaded:
  // 1. When user reaches payment step (currentStep === 3)
  // 2. When payment type changes (via payment type effect)
  // Total changes should NOT reload payment methods
  /*
  useEffect(() => {
    if (total > 0 && !isProcessingPaymentTypeChange) {
      logger.log('💰 Loading payment methods for total:', total);
      loadPaymentMethods(total);
    }
  }, [total, isProcessingPaymentTypeChange]);
  */

  const paymentMethods = availablePaymentMethods.map((method) => {
    return {
      id: method.payment_method,
      name: method.display_name,
      description: method.description,
      gateway: method.payment_method, // Pass gateway name for GatewayIcon
      icon: () => <GatewayIcon gateway={method.payment_method} className="text-current" size={20} />,
      advance_payment: method.advance_payment || null
    };
  });

  const selectedPaymentMethod = watch('paymentMethod');


  // Handle payment type change - recalculate cart with COD charges
  useEffect(() => {
    if (!paymentType) return; // Exit early if no payment type selected

    const handlePaymentTypeChange = async () => {
      if (isProcessingPaymentTypeChange) {
        logger.log('⚠️ Payment type change already in progress, skipping');
        return;
      }

      setIsProcessingPaymentTypeChange(true);
      logger.log('🔄 Payment type changed to:', paymentType);

      try {
        if (paymentType === 'cod') {
          logger.log('💳 COD selected, recalculating with COD charges');
          // Clear payment method selection first to prevent conflicts
          setValue('paymentMethod', '');
          // setPaymentMethod already calls getCart() internally, no need to call again
          await setPaymentMethod('cod');
        } else if (paymentType === 'online') {
          logger.log('💳 Online payment selected, removing COD charges');
          // Clear payment method selection first to prevent conflicts
          setValue('paymentMethod', '');
          // setPaymentMethod already calls getCart() internally, no need to call again
          await setPaymentMethod('online');
        }
      } catch (error) {
        logger.error('Failed to update cart with payment type change:', error);
      } finally {
        setIsProcessingPaymentTypeChange(false);
      }
    };

    handlePaymentTypeChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType]); // CRITICAL: Only depend on paymentType - NOT isProcessingPaymentTypeChange to avoid loop!

  // Auto-select first available gateway when online payment is selected OR COD with advance payment
  useEffect(() => {
    const shouldAutoSelect =
      (paymentType === 'online') ||
      (paymentType === 'cod' && codConfig?.advance_payment?.required);

    if (shouldAutoSelect && availablePaymentMethods.length > 0) {
      // Automatically select the first available gateway
      const firstGateway = availablePaymentMethods[0].payment_method;
      // Only set if not already set to avoid loops or overriding user selection (though UI is hidden now)
      if (getValues('paymentMethod') !== firstGateway) {
        setValue('paymentMethod', firstGateway);
        logger.log('🤖 Auto-selected payment gateway:', firstGateway);
      }
    }
  }, [paymentType, availablePaymentMethods, setValue, codConfig]);

  // Handle payment gateway redirection
  const handlePaymentRedirect = (paymentDetails: any, gateway: string) => {
    logger.log('🔄 handlePaymentRedirect called with:', { paymentDetails, gateway });

    // Extract payment data and URL from the response structure
    // Backend returns: payment_details.payment_data (contains all gateway fields)
    // Backend also returns: payment_details.payment_url (extracted for convenience)
    const paymentData = paymentDetails.payment_data || paymentDetails;
    const paymentUrl = paymentDetails.payment_url || paymentData.payment_url;

    logger.log('💳 Extracted payment data:', { paymentData, paymentUrl });
    logger.log('💳 PaymentData keys:', Object.keys(paymentData));

    // Create a form dynamically and submit it for gateways that require POST
    if (gateway === 'payu') {
      // PayU requires form POST submission with specific fields
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl || 'https://test.payu.in/_payment';
      form.style.display = 'none';

      // Add all PayU required fields as hidden inputs
      // Skip meta fields that are not part of PayU's expected parameters
      const skipFields = ['payment_url', 'payment_id', 'method', 'success', 'message', 'data', 'gateway', 'timestamp'];
      const submittedFields: any = {};

      Object.entries(paymentData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && !skipFields.includes(key)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
          submittedFields[key] = String(value);
        }
      });

      // Add form to body and submit
      document.body.appendChild(form);
      logger.log('✅ Submitting PayU form with action:', form.action);
      logger.log('📋 PayU form fields count:', form.querySelectorAll('input').length);
      logger.log('📋 PayU submitted fields:', submittedFields);
      logger.log('🔑 PayU hash being submitted:', submittedFields.hash);
      form.submit();
    } else if (gateway === 'razorpay' && (paymentData.key && paymentData.razorpay_order_id)) {
      // Handle Razorpay checkout with JavaScript SDK
      logger.log('💳 Initializing Razorpay with:', paymentData);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: paymentData.key,
          amount: paymentData.amount,
          currency: paymentData.currency || 'INR',
          order_id: paymentData.razorpay_order_id,
          name: paymentData.name || 'BookBharat',
          description: paymentData.description || 'Order Payment',
          handler: function (response: any) {
            logger.log('✅ Razorpay payment successful:', response);
            // Payment successful, redirect to callback URL with payment details
            const callbackUrl = `${paymentData.callback_url}?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}`;
            window.location.href = callbackUrl;
          },
          prefill: paymentData.prefill || {},
          theme: paymentData.theme || {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: function () {
              logger.log('⚠️ Razorpay payment cancelled by user');
              setIsProcessing(false);
            }
          }
        };
        logger.log('🚀 Opening Razorpay checkout with options:', options);
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        logger.error('❌ Failed to load Razorpay script');
        setError('Failed to load payment gateway. Please try again.');
        setIsProcessing(false);
      };
      document.body.appendChild(script);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    logger.log('🚀 Form submitted successfully!');
    logger.log('Form data:', data);
    logger.log('Payment method selected:', data.paymentMethod);
    logger.log('Cart:', cart);
    logger.log('Is Authenticated:', isAuthenticated);
    logger.log('Selected Shipping Address:', selectedShippingAddress);
    logger.log('Selected Billing Address:', selectedBillingAddress);

    if (!cart) {
      logger.error('❌ No cart found');
      setError('No cart found');
      return;
    }

    // For authenticated users with selected address, validate differently
    if (isAuthenticated && !selectedShippingAddress) {
      logger.error('❌ No shipping address selected');
      setError('Please select a shipping address');
      return;
    }

    // Validate payment method is selected (except for pure COD without advance)
    const isPureCOD = paymentType === 'cod' && (!codConfig?.advance_payment?.required);
    const isCODWithAdvance = paymentType === 'cod' && codConfig?.advance_payment?.required;

    if (!isPureCOD && !data.paymentMethod && !selectedPaymentMethod) {
      logger.error('❌ No payment method selected');
      setError('Please select a payment method');
      return;
    }

    // CRITICAL: For COD with advance payment, ensure a gateway is selected
    if (isCODWithAdvance && !data.paymentMethod && !selectedPaymentMethod) {
      logger.error('❌ COD with advance payment requires gateway selection');
      setError('Please select a payment gateway for advance payment');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // For authenticated users, use address IDs; for guests, use address objects
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        customer: {
          email: data.email,
          first_name: isAuthenticated && selectedShippingAddress ? selectedShippingAddress.first_name : data.firstName,
          last_name: isAuthenticated && selectedShippingAddress ? selectedShippingAddress.last_name : data.lastName,
          phone: isAuthenticated && selectedShippingAddress ? selectedShippingAddress.phone : data.phone
        },
        // Send address IDs for authenticated users, address objects for guests
        ...(isAuthenticated && selectedShippingAddress ? {
          shipping_address_id: selectedShippingAddress.id,
          billing_address_id: sameAsBilling ? selectedShippingAddress.id : selectedBillingAddress?.id
        } : {
          shipping_address: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            address_line_1: data.houseNo || '?',
            address_line_2: data.landmark || '?',
            city: data.city,
            state: data.state,
            postal_code: data.pincode,
            country: 'IN'
          },
          billing_address: sameAsBilling ? {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            address_line_1: data.houseNo || '?',
            address_line_2: data.landmark || '?',
            city: data.city,
            state: data.state,
            postal_code: data.pincode,
            country: 'IN'
          } : {
            first_name: data.billing_firstName,
            last_name: data.billing_lastName,
            phone: data.billing_phone,
            address_line_1: data.billing_houseNo || '?',
            address_line_2: data.billing_landmark || '?',
            city: data.billing_city,
            state: data.billing_state,
            postal_code: data.billing_pincode,
            country: 'IN'
          }
        }),
        // FIXED: Single source of truth for payment method
        // If pure COD (no advance), send 'cod'
        // If COD with advance OR online, send the selected gateway from form
        payment_method: (paymentType === 'cod' && !codConfig?.advance_payment?.required) ? 'cod' : (selectedPaymentMethod || data.paymentMethod),
        // REMOVED: shipping_cost - backend calculates from delivery address (security)
        notes: data.notes || '?',
        coupon_code: activeCouponCode,
        coupon_discount: couponDiscount
      };

      logger.log('📦 Order Data being sent:', orderData);

      const response = await orderApi.createOrder(orderData);
      logger.log('✅ Order API Response:', response);

      if (response?.success) {
        // Don't clear cart immediately - wait for payment confirmation
        // Clear localStorage on successful order creation
        if (typeof window !== 'undefined') {
          localStorage.removeItem('checkoutFormData');
          localStorage.removeItem('checkoutState');
        }

        const order = response.order;
        const paymentDetails = response.payment_details;
        const requiresRedirect = response.requires_redirect;
        if (requiresRedirect && paymentDetails) {
          logger.log('💳 Payment redirect required:', { paymentDetails, method: data.paymentMethod });

          // For PayU and similar gateways that need form POST submission
          if (data.paymentMethod === 'payu' && paymentDetails.payment_data) {
            handlePaymentRedirect(paymentDetails, data.paymentMethod);
          }
          // FIXED: Explicit PhonePe handler with comprehensive URL extraction and validation
          else if (data.paymentMethod === 'phonepe') {
            // Try multiple possible locations for PhonePe payment URL
            const phonepeUrl = response.redirect_url ||
              paymentDetails.payment_url ||
              paymentDetails.payment_data?.payment_url ||
              paymentDetails.payment_data?.url;

            if (phonepeUrl) {
              logger.log('📱 PhonePe redirect to:', phonepeUrl);
              logger.log('📱 Full PhonePe payment details:', paymentDetails);
              window.location.href = phonepeUrl;
            } else {
              // Log full response for debugging
              logger.error('❌ PhonePe payment URL not found in response');
              logger.error('Response structure:', JSON.stringify(response, null, 2));
              logger.error('Payment details:', JSON.stringify(paymentDetails, null, 2));
              setError('PhonePe payment URL not available. Please try again or use a different payment method.');
              setIsProcessing(false);
            }
          }
          // For Cashfree and other redirect-based gateways
          else if (data.paymentMethod === 'cashfree') {
            const cashfreeUrl = response.redirect_url ||
              paymentDetails.payment_url ||
              paymentDetails.payment_data?.payment_url;

            if (cashfreeUrl) {
              logger.log('💰 Cashfree redirect to:', cashfreeUrl);
              window.location.href = cashfreeUrl;
            } else {
              logger.error('❌ Cashfree payment URL not found');
              setError('Cashfree payment URL not available. Please try again.');
              setIsProcessing(false);
            }
          }
          // Generic redirect handler for other gateways (fallback)
          else if (response.redirect_url || paymentDetails.payment_url) {
            const redirectUrl = response.redirect_url || paymentDetails.payment_url;
            logger.log('🔗 Generic redirect to:', redirectUrl);
            window.location.href = redirectUrl;
          }
          // Fallback to handlePaymentRedirect for other gateways
          else if (paymentDetails.payment_data) {
            handlePaymentRedirect(paymentDetails, data.paymentMethod);
          }
          // No valid redirect found
          else {
            logger.error('❌ No valid payment redirect found');
            logger.error('Payment method:', data.paymentMethod);
            logger.error('Response:', JSON.stringify(response, null, 2));
            setError(`Unable to process ${data.paymentMethod} payment. Please try again or contact support.`);
            setIsProcessing(false);
          }
        } else if (data.paymentMethod === 'cod') {
          // COD order - clear cart and go to success page
          await cartApi.clearCart();
          router.push(`/orders/success?order_id=${order.order_number}`);
        } else {
          // Unknown payment flow - go to order details
          router.push(`/orders/${order.order_number}`);
        }
      } else {
        setError(response?.message || response?.error || 'Failed to create order. Please try again.');
      }
    } catch (err: any) {
      logger.error('Checkout failed:', err);
      setError(err?.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="animate-pulse space-y-6">
          {/* Progress indicator skeleton */}


          {/* Main content skeleton */}
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>

              {/* Form skeleton */}
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      <div className="h-10 bg-muted rounded"></div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Navigation skeleton */}
              <div className="hidden lg:flex flex-col sm:flex-row gap-3 lg:gap-4 sm:justify-between sm:items-center">
                <div className="h-10 bg-muted rounded w-32"></div>
                <div className="h-10 bg-muted rounded w-40"></div>
              </div>
            </div>

            {/* Order summary skeleton */}
            <div className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile navigation skeleton */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
            <div className="container mx-auto px-4 py-3">
              <div className="flex gap-2">
                <div className="h-12 bg-muted rounded flex-1"></div>
                <div className="h-12 bg-muted rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && (!cart || !cart.items.length)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Checkout Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/cart">Return to Cart</Link>
          </Button>
        </div>
      </div>
    );
  }

  logger.log('Current step in render:', currentStep, 'Hash:', window.location.hash);

  if (!cart || !cart.items.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen pb-40 lg:pb-0">
        <div className="container mx-auto px-4 py-4 lg:py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-4 lg:mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/cart" className="hover:text-primary">Cart</Link>
            <span className="mx-2">/</span>
            <span>Checkout</span>
          </nav>



          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">


              <form id="checkout-form" key={currentStep} onSubmit={(e) => {
                e.preventDefault();

                // For authenticated users with selected address, skip validation
                if (isAuthenticated && selectedShippingAddress) {
                  // Manually call onSubmit with current form values
                  const formData = getValues();
                  formData.paymentMethod = selectedPaymentMethod || '?';

                  // Ensure email is set
                  if (!formData.email) {
                    setError('Please provide an email address for order confirmation');
                    return;
                  }

                  // Ensure payment method is selected
                  if (!formData.paymentMethod) {
                    setError('Please select a payment method');
                    return;
                  }

                  onSubmit(formData);
                } else {
                  // For guest checkout, use normal validation
                  handleSubmit(onSubmit, (errors) => {
                    logger.error('Form validation errors:', errors);
                    setError('Please fix the form errors before submitting');
                  })(e);
                }
              }}>

                {/* STEP 1: SHIPPING DETAILS */}
                {currentStep === 1 && (
                  <div className="space-y-4 lg:space-y-6">

                    {/* Guest Login Prompt */}
                    {!isAuthenticated && (
                      <Card className="border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3 lg:pb-4">
                          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            <div className="flex items-center">
                              <User className="h-4 w-4 lg:h-5 lg:w-5 text-primary mr-2" />
                              <CardTitle className="text-primary text-sm lg:text-base">Sign In for Faster Checkout</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/auth/login">Sign In</Link>
                              </Button>
                              <Button size="sm" asChild>
                                <Link href="/auth/register">Create Account</Link>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Check className="h-3 w-3 lg:h-4 lg:w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Save your addresses</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Check className="h-3 w-3 lg:h-4 lg:w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Track your orders</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Check className="h-3 w-3 lg:h-4 lg:w-4 text-primary mr-2 flex-shrink-0" />
                              <span>Faster future checkouts</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Contact Information - Only for guest users */}
                    {!isAuthenticated && (
                      <Card>
                        <CardHeader className="pb-3 lg:pb-4">
                          <CardTitle className="flex items-center text-sm lg:text-base">
                            <Mail className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 lg:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            <Input
                              {...register('email')}
                              type="email"
                              label="Email Address"
                              placeholder="your.email@example.com"
                              error={errors.email?.message}
                              required
                            />
                            <Input
                              {...register('firstName')}
                              label="Full Name"
                              placeholder="Enter your full name"
                              error={errors.firstName?.message}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            <Input
                              {...register('phone')}
                              type="tel"
                              label="Phone Number"
                              placeholder="Enter 10-digit mobile number"
                              error={errors.phone?.message}
                              required
                            />
                            <Input
                              {...register('whatsapp')}
                              type="tel"
                              label="WhatsApp Number (Optional)"
                              placeholder="If different from phone"
                              error={errors.whatsapp?.message}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Shipping Address */}
                    {isAuthenticated ? (
                      <AddressManager
                        selectedAddress={selectedShippingAddress}
                        onAddressSelect={handleShippingAddressSelect}
                      />
                    ) : (
                      <Card>
                        <CardHeader className="pb-3 lg:pb-4">
                          <CardTitle className="flex items-center text-sm lg:text-base">
                            <MapPin className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            Delivery Address
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 lg:space-y-4">

                          {/* Pincode Field */}
                          <div className="space-y-2">
                            <div className="relative">
                              <Input
                                {...register('pincode')}
                                label="Pincode"
                                placeholder="Enter 6-digit pincode"
                                error={errors.pincode?.message}
                                required
                                maxLength={6}
                                pattern="[0-9]{6}"
                              />

                              {/* Pincode validation indicator */}
                              <div className="absolute right-3 top-8 flex items-center">
                                {formValues.pincode && formValues.pincode.length === 6 && calculatingShipping && (
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                )}
                                {formValues.pincode && formValues.pincode.length === 6 && !calculatingShipping && !pincodeError && pincodeInfo && (
                                  <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  </div>
                                )}
                                {formValues.pincode && formValues.pincode.length === 6 && !calculatingShipping && pincodeError && (
                                  <div className="h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
                                    <X className="h-3 w-3 text-destructive-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Pincode Error */}
                            {pincodeError && (
                              <div className="text-sm text-destructive">{pincodeError}</div>
                            )}

                            {/* Pincode Info Display */}
                            {calculatingShipping ? (
                              <div className="bg-muted/50 p-3 rounded-lg border">
                                <div className="flex items-center">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                  <span className="text-sm text-muted-foreground">Calculating shipping...</span>
                                </div>
                              </div>
                            ) : pincodeInfo && !pincodeError && (
                              <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                                <div className="flex items-start space-x-2">
                                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                  <div className="space-y-1 text-sm">
                                    <p className="font-medium text-primary">
                                      ✅ We deliver to {pincodeInfo.city}, {pincodeInfo.state}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs text-muted-foreground">
                                      <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {estimatedDelivery}
                                      </div>
                                      {hasValidShippingAddress && calculatedShippingCost === 0 && (
                                        <div className="flex items-center">
                                          <Truck className="h-3 w-3 mr-1" />
                                          FREE Delivery
                                        </div>
                                      )}
                                      {!hasValidShippingAddress && cart?.summary?.requires_pincode && (
                                        <div className="flex items-center text-orange-600">
                                          <Truck className="h-3 w-3 mr-1" />
                                          {cart.summary.pincode_message || 'Enter pincode to calculate shipping'}
                                        </div>
                                      )}
                                      {codAvailable && (
                                        <div className="flex items-center">
                                          <DollarSign className="h-3 w-3 mr-1" />
                                          COD Available
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Address Fields */}
                          {calculatingShipping ? (
                            <div className="space-y-3">
                              {[...Array(5)].map((_, idx) => (
                                <div key={idx} className="animate-pulse">
                                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                                  <div className="h-10 bg-muted rounded"></div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                <Input
                                  {...register('area')}
                                  label="Village/City/Area"
                                  placeholder="Enter your area"
                                  error={errors.area?.message}
                                  required
                                />
                                <Input
                                  {...register('city')}
                                  label="City"
                                  placeholder="Enter city name"
                                  error={errors.city?.message}
                                  required
                                />
                              </div>

                              <Input
                                {...register('address')}
                                label="Complete Address"
                                placeholder="House no., Street, Locality"
                                error={errors.address?.message}
                                required
                              />

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                <Input
                                  {...register('houseNo')}
                                  label="House/Flat No. (Optional)"
                                  placeholder="Building, House no."
                                  error={errors.houseNo?.message}
                                />
                                <Input
                                  {...register('landmark')}
                                  label="Landmark (Optional)"
                                  placeholder="Near famous place"
                                  error={errors.landmark?.message}
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                                <Input
                                  {...register('district')}
                                  label="District"
                                  placeholder="Auto-filled from pincode"
                                  error={errors.district?.message}
                                  required
                                  readOnly
                                  className="bg-muted"
                                />
                                <Input
                                  {...register('state')}
                                  label="State"
                                  placeholder="Auto-filled from pincode"
                                  error={errors.state?.message}
                                  required
                                  readOnly
                                  className="bg-muted"
                                />
                              </div>
                            </>
                          )}

                          {/* Shipping Cost Display */}
                          {calculatingShipping ? (
                            <div className="bg-muted/50 p-3 lg:p-4 rounded-lg animate-pulse">
                              <div className="h-4 bg-muted rounded w-full mb-2"></div>
                              <div className="h-6 bg-muted rounded w-1/3"></div>
                            </div>
                          ) : (
                            <>
                              {calculatedShippingCost > 0 && (
                                <div className="bg-accent p-3 lg:p-4 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Truck className="h-4 w-4 text-accent-foreground mr-2" />
                                      <div>
                                        <p className="font-medium text-sm lg:text-base">Delivery Charges</p>
                                        <p className="text-xs lg:text-sm text-muted-foreground">Based on your location</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg lg:text-xl font-bold">
                                        {currencySymbol}{calculatedShippingCost}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Shipping Calculation Pending */}
                              {!hasValidShippingAddress && cart?.summary?.requires_pincode && (
                                <div className="bg-orange-50 border border-orange-200 p-3 lg:p-4 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Truck className="h-4 w-4 text-orange-600 mr-2" />
                                      <div>
                                        <p className="font-medium text-sm lg:text-base text-orange-800">Shipping Calculation Pending</p>
                                        <p className="text-xs lg:text-sm text-orange-600">
                                          {cart.summary.pincode_message || 'Enter delivery pincode to calculate shipping charges'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm lg:text-base font-medium text-orange-800">TBD</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Free Shipping Display */}
                              {hasValidShippingAddress && calculatedShippingCost === 0 && (
                                <div className="bg-green-50 border border-green-200 p-3 lg:p-4 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Truck className="h-4 w-4 text-green-600 mr-2" />
                                      <div>
                                        <p className="font-medium text-sm lg:text-base text-green-800">FREE Delivery</p>
                                        <p className="text-xs lg:text-sm text-green-600">No delivery charges for this order</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg lg:text-xl font-bold text-green-800">
                                        {currencySymbol}0
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Billing Address Option */}
                    <Card>
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="sameAsBilling"
                            checked={sameAsBilling}
                            onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                          />
                          <label htmlFor="sameAsBilling" className="text-sm font-medium cursor-pointer flex items-center">
                            <CheckCircle className="h-4 w-4 text-primary mr-2" />
                            Use the same address for billing
                          </label>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-destructive mr-3 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Navigation - Desktop Only */}
                    <div className="hidden lg:flex flex-col sm:flex-row gap-3 lg:gap-4 sm:justify-between sm:items-center">
                      <Button type="button" variant="outline" asChild className="order-2 sm:order-1">
                        <Link href="/cart">
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Back to Cart
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        onClick={handleContinueToNext}
                        disabled={!isCurrentStepValid() || calculatingShipping}
                        className="order-1 sm:order-2"
                      >
                        {calculatingShipping ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            Continue to {sameAsBilling ? 'Payment' : 'Billing Address'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 2: BILLING ADDRESS */}
                {currentStep === 2 && (
                  <div className="space-y-4 lg:space-y-6">
                    {sameAsBilling ? (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <p className="text-lg font-medium">Billing address is same as shipping address</p>
                          <p className="text-muted-foreground mt-2">Click continue to proceed to payment</p>
                          <div className="flex gap-3 justify-center mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={prevStep}
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Back
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setSameAsBilling(false)}
                            >
                              Use Different Billing Address
                            </Button>
                            <Button
                              type="button"
                              onClick={nextStep}
                            >
                              Continue to Payment
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : isAuthenticated ? (
                      <AddressManager
                        selectedAddress={selectedBillingAddress}
                        onAddressSelect={handleBillingAddressSelect}
                      />
                    ) : (
                      <Card>
                        <CardHeader className="pb-3 lg:pb-4">
                          <CardTitle className="flex items-center text-sm lg:text-base">
                            <Home className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            Billing Address
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 lg:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            <Input
                              {...register('billing_firstName')}
                              label="First Name"
                              placeholder="Enter first name"
                              error={errors.billing_firstName?.message}
                              required
                            />
                            <Input
                              {...register('billing_lastName')}
                              label="Last Name"
                              placeholder="Enter last name"
                              error={errors.billing_lastName?.message}
                              required
                            />
                          </div>

                          <Input
                            {...register('billing_phone')}
                            type="tel"
                            label="Phone Number"
                            placeholder="Enter phone number"
                            error={errors.billing_phone?.message}
                            required
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            <Input
                              {...register('billing_pincode')}
                              label="Pincode"
                              placeholder="Enter pincode"
                              error={errors.billing_pincode?.message}
                              required
                            />
                            <Input
                              {...register('billing_area')}
                              label="Village/City/Area"
                              placeholder="Enter area"
                              error={errors.billing_area?.message}
                              required
                            />
                          </div>

                          <Input
                            {...register('billing_address')}
                            label="Complete Address"
                            placeholder="House No, Street, Area"
                            error={errors.billing_address?.message}
                            required
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            <Input
                              {...register('billing_city')}
                              label="City"
                              placeholder="Enter city"
                              error={errors.billing_city?.message}
                              required
                            />
                            <Input
                              {...register('billing_state')}
                              label="State"
                              placeholder="Enter state"
                              error={errors.billing_state?.message}
                              required
                            />
                          </div>

                          <Input
                            {...register('billing_district')}
                            label="District"
                            placeholder="Enter district"
                            error={errors.billing_district?.message}
                            required
                          />
                        </CardContent>
                      </Card>
                    )}


                  </div>
                )}



                {/* STEP 3: PAYMENT & REVIEW */}
                {currentStep === 3 && (
                  <div className="space-y-4 lg:space-y-6">
                    {/* Payment Type Selection Card */}
                    <Card>
                      <CardHeader className="pb-3 lg:pb-4">
                        <CardTitle className="flex items-center text-base lg:text-lg">
                          <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                          Select Payment Method
                        </CardTitle>
                        <p className="text-xs lg:text-sm text-muted-foreground mt-1">
                          Choose how you'd like to pay for your order
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 lg:space-y-4">

                        {/* Online Payment Option */}
                        {availablePaymentMethods.length > 0 && (
                          <div
                            onClick={() => setPaymentType('online')}
                            className={`cursor-pointer border-2 rounded-lg p-3 lg:p-4 transition-all ${paymentType === 'online'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1">
                                <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${paymentType === 'online' ? 'border-primary' : 'border-gray-300'
                                  }`}>
                                  {paymentType === 'online' && (
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-primary"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm lg:text-base">💳 Online Payment</p>
                                    <p className="font-bold text-sm lg:text-base text-primary ml-2">
                                      {currencySymbol}{(subtotal + calculatedShippingCost + tax).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 ml-2 flex-shrink-0" />
                            </div>
                          </div>
                        )}

                        {/* COD Option (if available) */}
                        {codConfig?.enabled && (
                          <div
                            onClick={() => setPaymentType('cod')}
                            className={`cursor-pointer border-2 rounded-lg p-3 lg:p-4 transition-all ${paymentType === 'cod'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1">
                                <div className={`w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${paymentType === 'cod' ? 'border-primary' : 'border-gray-300'
                                  }`}>
                                  {paymentType === 'cod' && (
                                    <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-primary"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm lg:text-base">{codConfig.display_name || '💵 Cash on Delivery'}</p>
                                    <p className="font-bold text-sm lg:text-base text-primary ml-2">
                                      {currencySymbol}{(subtotal + calculatedShippingCost + tax + codChargeAmount).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* No Payment Methods Available */}
                        {!codConfig?.enabled && availablePaymentMethods.length === 0 && (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-800 font-medium">
                              No payment methods available
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Please contact support to complete your order
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>


                    {/* Gateway Selection removed - automatically uses first gateway */}

                    {/* Why COD Price is Higher - Educational Section */}
                    {codChargeAmount > 0 && paymentType === 'cod' && (
                      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                        <CardHeader className="pb-3 lg:pb-4">
                          <CardTitle className="text-sm lg:text-base flex items-center text-orange-800">
                            <Info className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            Why COD price is higher?
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-xs lg:text-sm text-orange-700">
                            Cash on Delivery orders have additional service charges to cover logistics and handling costs. Watch this short video to understand why:
                          </p>

                          {/* YouTube Video Embed */}
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                              title="Why COD price is higher"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>

                          <div className="flex items-start space-x-2 text-xs lg:text-sm text-orange-700 bg-white/50 p-2 lg:p-3 rounded-lg">
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-orange-600" />
                            <p>
                              <span className="font-medium">Tip:</span> Save {currencySymbol}{codChargeAmount.toFixed(2)} by choosing online payment instead!
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}


                    {/* Place Order Button - Desktop Only */}
                    <div className="hidden lg:block">
                      <Button
                        type="submit"
                        disabled={isProcessing || !isStep3Valid()}
                        className="w-full py-5 lg:py-6 text-base lg:text-lg font-bold bg-blue-600 hover:bg-blue-700"
                        form="checkout-form"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 mr-2 animate-spin" />
                            Processing Order...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            🔐 Place Order - {currencySymbol}{total.toFixed(2)}
                          </>
                        )}
                      </Button>
                      {!isStep3Valid() && (
                        <p className="text-xs lg:text-sm text-center text-muted-foreground mt-2">
                          {!paymentType
                            ? 'Please select a payment method to continue'
                            : 'Ready to place order'}
                        </p>
                      )}
                    </div>

                    {/* Security Badge */}
                    <div className="hidden lg:flex items-center justify-center text-xs text-muted-foreground gap-2 p-3 bg-muted/50 rounded-lg">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Your payment information is secure and encrypted</span>
                    </div>
                  </div>
                )}


              </form>
            </div>

            {/* Order Summary - Desktop and Mobile */}
            <div className="space-y-4 lg:space-y-6">
              {/* Mobile Full Summary - Always Visible */}
              <div className="lg:hidden">
                <OrderSummaryCard
                  summary={{
                    ...cart.summary,
                    subtotal: subtotal,
                    couponDiscount: couponDiscount,
                    discountedSubtotal: discountedSubtotal,
                    shippingCost: calculatedShippingCost,
                    tax: tax,
                    total: total,
                    charges: finalChargesList,
                    totalCharges: finalTotalCharges,
                    bundleDiscount: cart.summary?.bundle_discount || 0,
                    currencySymbol: currencySymbol,
                    itemCount: cart?.total_items || 0
                  }}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  applyCouponLoading={applyCouponLoading}
                  variant="checkout"
                  hasValidShippingAddress={!!hasValidShippingAddress}
                  calculatingShipping={calculatingShipping}
                />
              </div>

              {/* Desktop Summary */}
              <div className="hidden lg:block">
                <OrderSummaryCard
                  summary={{
                    ...cart.summary,
                    subtotal: subtotal,
                    couponDiscount: couponDiscount,
                    discountedSubtotal: discountedSubtotal,
                    shippingCost: calculatedShippingCost,
                    tax: tax,
                    total: total,
                    charges: finalChargesList,
                    totalCharges: finalTotalCharges,
                    bundleDiscount: cart.summary?.bundle_discount || 0,
                    currencySymbol: currencySymbol,
                    itemCount: cart?.total_items || 0
                  }}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  applyCouponLoading={applyCouponLoading}
                  variant="checkout"
                  hasValidShippingAddress={!!hasValidShippingAddress}
                  calculatingShipping={calculatingShipping}
                />
              </div>

              {/* Delivery & Security Info */}
              <div className="space-y-4">

                {/* Delivery Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">Delivery Information</p>
                          <p className="text-sm text-muted-foreground">
                            {estimatedDelivery || 'Enter pincode for estimate'}
                          </p>
                        </div>
                      </div>

                      {codAvailable && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>Cash on Delivery available</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">100% Secure Checkout</p>
                        <p className="text-sm text-muted-foreground">
                          SSL encrypted payment. Your data is safe with us.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Navigation - Buttons Only - Positioned above nav */}
        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  size="default"
                  className="flex-1 font-bold"
                >
                  <Link href="/cart">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Cart
                  </Link>
                </Button>
              )}

              {currentStep === 3 ? (
                <Button
                  type="submit"
                  disabled={isProcessing || !isCurrentStepValid()}
                  size="default"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  form="checkout-form"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      🔐 Place Order
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleContinueToNext}
                  disabled={!isCurrentStepValid() || calculatingShipping}
                  size="default"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {calculatingShipping ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

      </div >
    </ProtectedRoute >
  );
}

