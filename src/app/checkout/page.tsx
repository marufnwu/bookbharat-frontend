'use client';

import { useState, useEffect } from 'react';
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
import { useConfig } from '@/contexts/ConfigContext';
import { useCartStore } from '@/stores/cart';
import { useHydratedAuth } from '@/stores/auth';
import { cartApi, orderApi, shippingApi, addressApi, paymentApi } from '@/lib/api';
import { toast } from 'sonner';
import { Cart, Order, Address } from '@/types';
import AddressManager from '@/components/AddressManager';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrderSummaryCard } from '@/components/cart/OrderSummaryCard';
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
  Sparkles
} from 'lucide-react';

// Flexible shipping schema - required for guests, optional for authenticated users
const shippingSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
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
  paymentMethod: z.string().min(1, 'Please select a payment method'),
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
          console.error('Failed to parse saved state:', e);
        }
      }
    }
    return {};
  };

  const persistedState = getPersistedState();

  const [shippingCost, setShippingCost] = useState(persistedState.shippingCost || 0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(persistedState.sameAsBilling ?? true);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>(persistedState.estimatedDelivery || '');
  const [codAvailable, setCodAvailable] = useState(persistedState.codAvailable ?? false);
  const [showCouponField, setShowCouponField] = useState(false);
  const [couponCode, setCouponCode] = useState(persistedState.couponCode || '');
  const [applyCouponLoading, setApplyCouponLoading] = useState(false);
  const { siteConfig } = useConfig();
  const { cart, getCart, applyCoupon, removeCoupon, isLoading: cartLoading } = useCartStore();
  const { user, isAuthenticated } = useHydratedAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(persistedState.selectedAddressId || null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<number | null>(persistedState.selectedBillingAddressId || null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<Address | null>(persistedState.selectedShippingAddress || null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<Address | null>(persistedState.selectedBillingAddress || null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([]);

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
            console.error('Failed to parse saved form data:', e);
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
    String(formValues.phone || '').length >= 10 && 
    String(formValues.pincode || '').length === 6 && 
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
    // Get payment method directly from watch
    const paymentMethod = selectedPaymentMethod;
    const isValid = !!paymentMethod && paymentMethod.trim() !== '';
    console.log('Step 3 Validation:', { paymentMethod, isValid });
    return isValid;
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
    // Load payment methods on initial load
    loadPaymentMethods();
  }, [isAuthenticated, user]);

  // Listen for hash changes and update step
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#shipping';
      const newStep = getStepFromHash(hash);
      console.log('Hash changed to:', hash, 'Setting step to:', newStep);
      setCurrentStep(newStep);
    };

    // Handle initial hash on mount
    const initialHash = window.location.hash || '#shipping';
    const initialStep = getStepFromHash(initialHash);
    console.log('Initial hash:', initialHash, 'Setting initial step to:', initialStep);
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

  // Watch pincode field and trigger validation when it changes
  useEffect(() => {
    const pincode = formValues.pincode;
    
    const timeoutId = setTimeout(() => {
      if (pincode && pincode.length >= 4) {
        if (pincode.length === 6) {
          validatePincode(pincode);
        }
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [formValues.pincode]);

  const loadCart = async () => {
    try {
      setLoading(true);
      await getCart();
      
      const currentCart = useCartStore.getState().cart;
      
      if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
        router.push('/cart');
        return;
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Failed to load cart:', err);
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

        const defaultShipping = shippingAddresses.find(
          (addr: Address) => addr.is_default
        );
        if (defaultShipping) {
          setSelectedAddressId(defaultShipping.id);
          setSelectedShippingAddress(defaultShipping);
          populateFormFromAddress(defaultShipping);

          // Calculate shipping for default address
          if (defaultShipping.postal_code && defaultShipping.postal_code.length === 6) {
            calculateShipping(defaultShipping.postal_code);
          }
        }

        // Load billing addresses separately if needed
        const billingResponse = await addressApi.getAddresses('billing');
        if (billingResponse?.status === 'success' || billingResponse?.data) {
          const billingAddresses = billingResponse.data || [];
          const defaultBilling = billingAddresses.find(
            (addr: Address) => addr.is_default
          );
          if (defaultBilling) {
            setSelectedBillingAddressId(defaultBilling.id);
            setSelectedBillingAddress(defaultBilling);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const loadPaymentMethods = async (orderAmount?: number) => {
    try {
      const response = await paymentApi.getPaymentMethods(orderAmount, 'INR');
      console.log('Payment methods API response:', response);

      // Handle unified gateway response
      const gateways = response?.gateways || [];

      if (response?.success && gateways.length > 0) {
        // Transform gateway format to payment method format
        const methods = gateways.map((gateway: any) => ({
          payment_method: gateway.gateway,
          display_name: gateway.display_name || gateway.name,
          description: gateway.description || '',
          priority: gateway.priority || 0
        }));
        setAvailablePaymentMethods(methods);

        // Update COD availability based on response
        const hasCodMethod = methods.some((method: any) =>
          method.payment_method && method.payment_method.includes('cod')
        );
        setCodAvailable(hasCodMethod);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      // Set default methods if API fails
      setAvailablePaymentMethods([
        {
          payment_method: 'razorpay',
          display_name: 'Online Payment (Cards/UPI/NetBanking)',
          description: 'Pay securely using cards, UPI, or net banking',
          priority: 10
        },
        {
          payment_method: 'cod',
          display_name: 'Cash on Delivery',
          description: 'Pay when your order arrives',
          priority: 5
        }
      ]);
    }
  };

  const handleShippingAddressSelect = (address: Address) => {
    setSelectedShippingAddress(address);
    setSelectedAddressId(address.id);
    populateFormFromAddress(address);
    
    // Trigger shipping calculation when address is selected
    if (address.postal_code && address.postal_code.length === 6) {
      calculateShipping(address.postal_code);
    }
  };

  const handleBillingAddressSelect = (address: Address) => {
    setSelectedBillingAddress(address);
    setSelectedBillingAddressId(address.id);
  };

  const populateFormFromAddress = (address: Address) => {
    console.log('🏠 Populating form from address:', address);
    
    setValue('firstName', address.first_name);
    setValue('lastName', address.last_name || '');
    setValue('phone', address.phone || '');
    setValue('pincode', address.postal_code);
    setValue('area', address.city);
    setValue('city', address.city);
    setValue('houseNo', address.address_line_1);
    setValue('landmark', address.address_line_2 || '');
    
    // If there's a district field in address, use it, otherwise use city
    const district = (address as any).district || address.city;
    setValue('district', district);
    setValue('state', address.state);
    
    console.log('🏠 Setting form values:', {
      district,
      state: address.state,
      city: address.city,
      postalCode: address.postal_code
    });
    
    const fullAddress = [address.address_line_1, address.address_line_2, address.city, address.state, address.postal_code]
      .filter(Boolean).join(', ');
    setValue('address', fullAddress);
    
    if (address.postal_code) {
      calculateShipping(address.postal_code);
    }
  };

  const handleAddressSelect = async (addressId: number) => {
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setSelectedAddressId(addressId);
      setSelectedShippingAddress(selectedAddress);
      populateFormFromAddress(selectedAddress);
      setShowNewAddressForm(false);
      
      // Trigger shipping calculation when address is selected
      if (selectedAddress.postal_code && selectedAddress.postal_code.length === 6) {
        calculateShipping(selectedAddress.postal_code);
      }
    }
  };

  const handleCreateAddress = async (addressData: CheckoutForm) => {
    try {
      const response = await addressApi.createAddress({
        type: 'shipping',
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        address_line_1: addressData.houseNo || addressData.address,
        address_line_2: addressData.landmark || '',
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
      console.error('Failed to create address:', error);
      throw error;
    }
  };

  const handleUpdateAddress = async (addressId: number, addressData: CheckoutForm) => {
    try {
      const response = await addressApi.updateAddress(addressId, {
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        address_line_1: addressData.houseNo || addressData.address,
        address_line_2: addressData.landmark || '',
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.pincode,
        phone: addressData.phone,
      });
      
      if (response?.status === 'success' || response?.data) {
        await loadAddresses();
      }
    } catch (error) {
      console.error('Failed to update address:', error);
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
      console.error('Failed to delete address:', error);
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
        setValue('state', response.zone_info?.state || '');
        setValue('district', response.zone_info?.city || '');
        
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

    try {
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
      } else {
        console.error('Shipping calculation failed:', response);
        toast.error('Failed to calculate shipping. Using default rates.');
      }
    } catch (error: any) {
      console.error('Failed to calculate shipping:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to calculate shipping';
      toast.error(errorMessage);
      // Set default shipping cost on error
      setShippingCost(50);
    } finally {
      setCalculatingShipping(false);
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
      console.error('Failed to apply coupon:', error);
    } finally {
      setApplyCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  const validateStep1 = () => {
    if (isAuthenticated) {
      // For authenticated users, just check address selection and email
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
    
    if (formData.pincode && formData.pincode.length === 6) {
      calculateShipping(formData.pincode);
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

  const handleContinueToNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
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
  const tax = cart?.summary?.tax_amount || Math.round(discountedSubtotal * 0.18);
  const total = discountedSubtotal + calculatedShippingCost + tax;

  // Load payment methods when total changes
  useEffect(() => {
    if (total > 0) {
      loadPaymentMethods(total);
    }
  }, [total]);

  const paymentMethods = availablePaymentMethods.map((method) => {
    const iconMap: { [key: string]: any } = {
      'razorpay': CreditCard,
      'cashfree': CreditCard,
      'payu': CreditCard,
      'phonepe': CreditCard,
      'cod': Circle,
      'cod_with_advance': Circle,
      'cod_percentage_advance': Circle,
      'bank_transfer': Circle,
    };

    return {
      id: method.payment_method,
      name: method.display_name,
      description: method.description,
      icon: iconMap[method.payment_method] || Circle,
      advance_payment: method.advance_payment || null
    };
  });

  const selectedPaymentMethod = watch('paymentMethod');

  // Debug payment methods
  useEffect(() => {
    console.log('Available payment methods:', paymentMethods);
    console.log('Selected payment method:', selectedPaymentMethod);
  }, [paymentMethods.length, selectedPaymentMethod]);

  // Handle payment gateway redirection
  const handlePaymentRedirect = (paymentDetails: any, gateway: string) => {
    console.log('🔄 handlePaymentRedirect called with:', { paymentDetails, gateway });

    // Extract payment data and URL from the response structure
    const paymentData = paymentDetails.payment_data || paymentDetails;
    const paymentUrl = paymentDetails.payment_url || paymentData.payment_url;

    console.log('💳 Extracted payment data:', { paymentData, paymentUrl });

    // Create a form dynamically and submit it for gateways that require POST
    if (gateway === 'payu') {
      // PayU requires form POST submission with specific fields
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl || 'https://test.payu.in/_payment';
      form.style.display = 'none';

      // Add all PayU required fields as hidden inputs
      // Skip meta fields
      const skipFields = ['payment_url', 'payment_id', 'method', 'success', 'message', 'data'];
      Object.entries(paymentData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && !skipFields.includes(key)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      // Add form to body and submit
      document.body.appendChild(form);
      console.log('✅ Submitting PayU form with action:', form.action);
      console.log('📋 PayU form fields count:', form.querySelectorAll('input').length);
      form.submit();
    } else if (gateway === 'razorpay' && (paymentData.key && paymentData.razorpay_order_id)) {
      // Handle Razorpay checkout with JavaScript SDK
      console.log('💳 Initializing Razorpay with:', paymentData);

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
          handler: function(response: any) {
            console.log('✅ Razorpay payment successful:', response);
            // Payment successful, redirect to callback URL with payment details
            const callbackUrl = `${paymentData.callback_url}?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}`;
            window.location.href = callbackUrl;
          },
          prefill: paymentData.prefill || {},
          theme: paymentData.theme || {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: function() {
              console.log('⚠️ Razorpay payment cancelled by user');
              setIsProcessing(false);
            }
          }
        };
        console.log('🚀 Opening Razorpay checkout with options:', options);
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        setError('Failed to load payment gateway. Please try again.');
        setIsProcessing(false);
      };
      document.body.appendChild(script);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    console.log('🚀 Form submitted successfully!');
    console.log('Form data:', data);
    console.log('Payment method selected:', data.paymentMethod);
    console.log('Cart:', cart);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Selected Shipping Address:', selectedShippingAddress);
    console.log('Selected Billing Address:', selectedBillingAddress);

    if (!cart) {
      console.error('❌ No cart found');
      setError('No cart found');
      return;
    }

    // For authenticated users with selected address, validate differently
    if (isAuthenticated && !selectedShippingAddress) {
      console.error('❌ No shipping address selected');
      setError('Please select a shipping address');
      return;
    }

    // Validate payment method is selected
    if (!data.paymentMethod) {
      console.error('❌ No payment method selected');
      setError('Please select a payment method');
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
            address_line_1: data.houseNo || data.address,
            address_line_2: data.landmark || '',
            city: data.city,
            state: data.state,
            postal_code: data.pincode,
            country: 'IN'
          },
          billing_address: sameAsBilling ? {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            address_line_1: data.houseNo || data.address,
            address_line_2: data.landmark || '',
            city: data.city,
            state: data.state,
            postal_code: data.pincode,
            country: 'IN'
          } : {
            first_name: data.billing_firstName,
            last_name: data.billing_lastName,
            phone: data.billing_phone,
            address_line_1: data.billing_houseNo || data.billing_address,
            address_line_2: data.billing_landmark || '',
            city: data.billing_city,
            state: data.billing_state,
            postal_code: data.billing_pincode,
            country: 'IN'
          }
        }),
        payment_method: data.paymentMethod,
        // REMOVED: shipping_cost - backend calculates from delivery address (security)
        notes: data.notes || '',
        coupon_code: activeCouponCode,
        coupon_discount: couponDiscount
      };
      
      console.log('📦 Order Data being sent:', orderData);
      
      const response = await orderApi.createOrder(orderData);
      console.log('✅ Order API Response:', response);

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
          console.log('💳 Payment redirect required:', { paymentDetails, method: data.paymentMethod });

          // For PayU and similar gateways that need form POST submission
          if (data.paymentMethod === 'payu' && paymentDetails.payment_data) {
            handlePaymentRedirect(paymentDetails, data.paymentMethod);
          }
          // For redirect-based gateways (like Cashfree)
          else if (response.redirect_url || paymentDetails.payment_url) {
            const redirectUrl = response.redirect_url || paymentDetails.payment_url;
            console.log('🔗 Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
          }
          // Fallback to handlePaymentRedirect for other gateways
          else if (paymentDetails.payment_data) {
            handlePaymentRedirect(paymentDetails, data.paymentMethod);
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
      console.error('Checkout failed:', err);
      setError(err?.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
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

  console.log('Current step in render:', currentStep, 'Hash:', window.location.hash);

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
    <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen">
      <div className="container mx-auto px-4 py-4 lg:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4 lg:mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/cart" className="hover:text-primary">Cart</Link>
          <span className="mx-2">/</span>
          <span>Checkout</span>
        </nav>

        {/* Progress Indicator */}
        <Card className="mb-6 lg:mb-10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base lg:text-lg">
              <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Checkout Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-10">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>
            
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isClickable = step.completed || step.id === currentStep || (step.skip && step.id === 2);
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (isClickable && !step.skip) {
                          window.location.hash = step.hash;
                        }
                      }}
                      disabled={!isClickable || step.skip}
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step.completed
                          ? 'bg-primary text-primary-foreground'
                          : step.id === currentStep
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                          : step.skip
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isClickable && !step.skip ? 'cursor-pointer hover:ring-2 hover:ring-primary/30' : 'cursor-default'}`}
                    >
                      {step.completed ? (
                        <Check className="h-4 w-4 lg:h-5 lg:w-5" />
                      ) : step.skip ? (
                        <span className="text-xs">Skip</span>
                      ) : (
                        <Icon className="h-3 w-3 lg:h-4 lg:w-4" />
                      )}
                    </button>
                    <div className="mt-2 lg:mt-3 text-center min-w-[80px] lg:min-w-[100px]">
                      <div className={`text-xs lg:text-sm font-medium transition-colors duration-300 ${
                        step.id === currentStep 
                          ? 'text-primary' 
                          : step.completed 
                          ? 'text-primary' 
                          : step.skip
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {step.name}
                      </div>
                      {step.skip && (
                        <Badge variant="secondary" className="text-xs mt-1">Skipped</Badge>
                      )}
                      {step.completed && (
                        <Badge variant="secondary" className="text-xs mt-1 bg-primary/10 text-primary">Completed</Badge>
                      )}
                      {step.id === currentStep && (
                        <Badge className="text-xs mt-1">Current</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            

            <form id="checkout-form" key={currentStep} onSubmit={(e) => {
              e.preventDefault();

              // For authenticated users with selected address, skip validation
              if (isAuthenticated && selectedShippingAddress) {
                // Manually call onSubmit with current form values
                const formData = getValues();
                formData.paymentMethod = selectedPaymentMethod || '';

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
                  console.error('Form validation errors:', errors);
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
                        {pincodeInfo && !pincodeError && (
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
                                  {calculatedShippingCost === 0 && (
                                    <div className="flex items-center">
                                      <Truck className="h-3 w-3 mr-1" />
                                      FREE Delivery
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

                      {/* Shipping Cost Display */}
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
                      disabled={!isCurrentStepValid()}
                      className="order-1 sm:order-2"
                    >
                      Continue to {sameAsBilling ? 'Payment' : 'Billing Address'}
                      <ChevronRight className="w-4 h-4 ml-2" />
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

                  {/* Navigation - Desktop Only */}
                  <div className="hidden lg:flex flex-col sm:flex-row gap-3 lg:gap-4 sm:justify-between sm:items-center">
                    <Button type="button" variant="outline" onClick={prevStep} className="order-2 sm:order-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Shipping
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleContinueToNext}
                      disabled={!isCurrentStepValid()}
                      className="order-1 sm:order-2"
                    >
                      Continue to Payment
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & REVIEW */}
              {currentStep === 3 && (
                <div className="space-y-4 lg:space-y-6">
                  
                  {/* Payment Method */}
                  <Card>
                    <CardHeader className="pb-3 lg:pb-4">
                      <CardTitle className="flex items-center text-sm lg:text-base">
                        <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 lg:space-y-4">
                      <div className="space-y-2 lg:space-y-3">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          return (
                            <label
                              key={method.id}
                              className={`flex items-center p-3 lg:p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedPaymentMethod === method.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <input
                                {...register('paymentMethod', {
                                  onChange: (e) => {
                                    console.log('Payment method selected:', e.target.value);
                                  }
                                })}
                                type="radio"
                                value={method.id}
                                className="sr-only"
                                checked={selectedPaymentMethod === method.id}
                              />
                              <Icon className="h-4 w-4 lg:h-5 lg:w-5 mr-3 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="font-medium text-sm lg:text-base">{method.name}</div>
                                <div className="text-xs lg:text-sm text-muted-foreground">{method.description}</div>
                                {method.advance_payment && method.advance_payment.required && (
                                  <div className="text-xs mt-1 text-orange-600">
                                    Advance: {currencySymbol}{method.advance_payment.amount.toFixed(2)} 
                                    | COD: {currencySymbol}{method.advance_payment.cod_amount.toFixed(2)}
                                  </div>
                                )}
                              </div>
                              <div className={`w-4 h-4 border-2 rounded-full ${
                                selectedPaymentMethod === method.id
                                  ? 'border-primary bg-primary'
                                  : 'border-border'
                              }`}>
                                {selectedPaymentMethod === method.id && (
                                  <div className="w-2 h-2 bg-primary-foreground rounded-full m-0.5" />
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      
                      {errors.paymentMethod && (
                        <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
                      )}

                      <Textarea
                        {...register('notes')}
                        label="Order Notes (Optional)"
                        placeholder="Any special instructions for delivery..."
                        rows={3}
                      />
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
                    <Button type="button" variant="outline" onClick={prevStep} className="order-2 sm:order-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to {sameAsBilling ? 'Shipping' : 'Billing Address'}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || !isCurrentStepValid()}
                      className="order-1 sm:order-2 w-full sm:w-auto"
                      form="checkout-form"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Place Order • {currencySymbol}{total.toFixed(2)}
                        </>
                      )}
                    </Button>
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
                  bundleDiscount: cart.summary?.bundleDiscount || 0,
                  currencySymbol: currencySymbol,
                  itemCount: cart?.total_items || 0
                }}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                applyCouponLoading={applyCouponLoading}
                variant="checkout"
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
                  bundleDiscount: cart.summary?.bundleDiscount || 0,
                  currencySymbol: currencySymbol,
                  itemCount: cart?.total_items || 0
                }}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                applyCouponLoading={applyCouponLoading}
                variant="checkout"
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

      {/* Mobile Sticky Bottom Navigation - Buttons Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3">
            {currentStep > 1 ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                size="default"
                className="flex-1"
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
                className="flex-1"
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
                className="flex-1"
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
                    Place Order
                  </>
                )}
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleContinueToNext}
                disabled={!isCurrentStepValid()}
                size="default"
                className="flex-1"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
    </ProtectedRoute>
  );
}